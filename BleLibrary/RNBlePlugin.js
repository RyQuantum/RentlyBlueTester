import './globals';
import { BleManager, ScanMode } from 'react-native-ble-plx'
import BluetoothPluginInterface from 'blelocklibrary/plugins/BluetoothPluginInterface';
import Encryption from 'blelocklibrary/encryption';
import LockError from 'blelocklibrary/RNDahaoLockError';
import ResponseFactory from 'blelocklibrary/commands/responses/ResponseFactory';
import ResponseBuffer from 'blelocklibrary/commands/responses/ResponseBuffer';
import AddCardResponse from 'blelocklibrary/commands/responses/AddCardResponse';

const AES_KEY_BYTE_COUNT = 16;

// ble devices have MTU of 23 with 3 bytes being taken up by GATT header
// so we can only write 20 bytes at a time
const PACKET_SIZE = 20;

function createErrorWithCode(code) {

    let error = new Error("");
    error.code = code.toString();

    return error;

}

// since this is an interface, you don't need to extend it, but you do need to extend EventEmitter then
class BlePlugin extends BluetoothPluginInterface {

    constructor() {
        super();
        this.manager = new BleManager()
        this.activeDevices = new Map();
        // Initially timeout = false, Once any command timeout then we will set this to true
        this.timeout = false;
        this.deviceIdMapping = new Map();
    }

    /**
     * Write Data to device
     *
     * @param deviceId {string} device id, For iOS it will be UUID, For android it will be MAC ID
     * @param command {string} Command to write.
     */
    getDeviceId(lockMac) {
        return this.deviceIdMapping.get(lockMac);
    }

    /**
     * Sets the AES key that will be used for encrypting and decrypting.
     *
     * @param aesKey {Buffer} hex buffer representation of the AES key
     */
    setAESKey(aesKey) {

        if ((aesKey instanceof Buffer) && (aesKey.length === AES_KEY_BYTE_COUNT)) {
            // clone the buffer
            this._aesKey = Buffer.concat([aesKey]);
        } else {
            console.log("Malformed AES key.");
        }
    }

    /**
     * Sets the service and characteristic UUIDs for the lock.  This should be set before scanning.
     *
     * @param serviceUUID {string} format is 'fee7'
     * @param characteristicUUID {string} format is 'fec6'
     */
    setServiceAndCharacteristicUUIDs(serviceUUID, characteristicUUID) {
        this._lockServiceUUIDs = serviceUUID;
        this._lockCharsUUIDs = characteristicUUID;
    }

    /**
     * Sets the header that will be at the start of a new response from the lock.
     *
     * @param notifyHeader {string} format is "55AA"
     */
    setNotifyHeader(notifyHeader) {
        this._notifyHeader = notifyHeader;
    }

    /**
     * Starts a bluetooth device scan.  The scan should produce single event notifies with no repeats.
     */
    startScan() {
        // When we pass _lockServiceUUIDs while scanning then only rently V3 Locks will be scanned.
        // Clear previously scanned devices.
        this.activeDevices = new Map();
        const subscription = this.manager.onStateChange((state) => {
            if (state === 'PoweredOn') {
                let ScanOptions = { scanMode: ScanMode.LowLatency }
                this.manager.startDeviceScan(
                  [this._lockServiceUUIDs],
                  ScanOptions,
                  (error, device) => {
                      if (error) {
                          log(`Error in startDeviceScan", ${error}`);
                          return;
                      }

                      if (device && device.manufacturerData !== null) {
                          log('device in plugin ===>>>', device)
                          let manufacturerData = parseManufacturerData(new Buffer(device.manufacturerData, 'base64'));
                          let lockMac = manufacturerData.lockMac;
                          let deviceUUID = device.id;
                          let rssi = device.rssi;

                          let bleDevice = {
                              deviceID: device.localName && device.localName.slice(-8).toUpperCase(),
                              lockMac,
                              deviceUUID,
                              rssi,
                              name: device.localName,
                              isCommonArea: manufacturerData.isCommonArea,
                              lockType: 'V3Lock'
                          };

                          // When device already exists in found list and settingMode & touch parameters are not changed then dont emit lock.
                          let activeDevice = this.activeDevices.get(deviceUUID);
                          if (activeDevice && activeDevice.info.settingMode === manufacturerData.settingMode && activeDevice.info.touch === manufacturerData.touch) {

                              return;
                          }

                          // Save mapping between lockmac and deviceUUID
                          this.deviceIdMapping.set(lockMac, deviceUUID);

                          //TODO: need to add some way of pruning this map when devices no longer show up in a scan
                          this.activeDevices.set(deviceUUID, { device, info: { rssi, ...manufacturerData } });


                          // emit an new object with bleDevice and the manufacturerDate combined
                          this.emit('foundDevice', { ...bleDevice, ...manufacturerData });
                      }
                      // }
                  }
                )
                log("startScanning");
                subscription.remove();
            }
        }, true);

    }

    /**
     * Stop the bluetooth device scan.
     */
    stopScan() {
        log("stop scanning");
        this.manager.stopDeviceScan()

        // if you were still waiting to scan, then you were not powered on yet, so set to powered off
    }

    /**
     * Disconnect the device.
     *
     * @param lockMac {string} mac of the lock with format "FB:FB:CD:BF:27:FF"
     */
    disconnectDevice(lockMac) {
        let deviceId = this.getDeviceId(lockMac);
        this.manager.cancelDeviceConnection(deviceId).then(() => {
            log("Successfully Disconnected from device.");
        }).catch((error) => {
            log(`Error while disconnecting from device ${error}`);
        })
    }

    /**
     * Write Data to device
     *
     * @param deviceId {string} device id, For iOS it will be UUID, For android it will be MAC ID
     * @param command {string} Command to write.
     */
    async writeData(deviceId, command) {
        log("In writeToDevice()");

        return await new Promise(async (resolve, reject) => {
            let encryption = new Encryption(this._aesKey);
            let encData = encryption.encrypt(command.buffer);

            // Loop based on PACKET_SIZE sized blocks
            let start = 0;
            let length = encData.length;
            let numOfPackets = Math.ceil(length / PACKET_SIZE);
            log(`Total Number of packet to write: ${numOfPackets}`);

            // Save all write Responses into response buffer.
            let responseBuffer = null;
            let response = null;

            // Monitor Response Charaterstics
            let monitorCharacteristicForDeviceSubscription = this.manager.monitorCharacteristicForDevice(
              deviceId,
              this._lockServiceUUIDs,
              this._lockCharsUUIDs,
              (error, responseCharacteristic) => {
                  try {
                      if (error) {
                          log(`Error in response: ${JSON.stringify(error)}`);
                          // Stop monitoring Characteristics in case of any error
                          monitorCharacteristicForDeviceSubscription.remove();
                          return reject(error);
                      }
                      if (responseCharacteristic === null || responseCharacteristic === undefined) {
                          return reject(error);
                      }
                      log(`Response: ${responseCharacteristic}`);
                      let data = Buffer.from(responseCharacteristic.value, 'base64');
                      log(`Response Buffer: ${JSON.stringify(data)}`);

                      if (responseBuffer == null) {

                          // no response so far so check for the header and the length
                          let header = data.slice(0, 2).toString('hex').toUpperCase();
                          if (header === this._notifyHeader) {
                              let contentLength = data[2];
                              responseBuffer = new ResponseBuffer(contentLength, data.slice(3));
                          } else {
                              return reject(new Error("missing command header"));
                          }

                      } else {
                          responseBuffer.append(data);
                      }

                      if (responseBuffer.isComplete()) {

                          response = ResponseFactory.createResponse(this._aesKey, responseBuffer.buffer);

                          log(`Final response: ${JSON.stringify(response)}`)
                          if (response == null) {
                              return reject(new Error("response buffer is not valid."))
                          }

                          responseBuffer = null;

                          if (response instanceof AddCardResponse) {
                              // add card is the only command that requires a second response
                              // for when the lock gets the card put in front of it after it's in
                              // add card mode

                              //do not disconnect, wait for another notify
                              response = null;
                              log("Waiting for another notify");

                          } else {
                              monitorCharacteristicForDeviceSubscription.remove();
                              if (response._lockStatus === 5) {
                                  // Currently common code is not detecting error code 5 in response.
                                  // This would be temporary solution to detect time difference in plugin.
                                  log(`Time difference detected`);
                                  return reject(createErrorWithCode(LockError.DHBLE_RESULT_TIMEOUT));
                              } else {
                                  log("Resolving the response");
                                  return resolve(response);
                              }
                          }
                      }
                  } catch (e) {
                      return reject(e);
                  }

              },
            )

            for (let i = 0; i < numOfPackets; i++) {
                let buffer = encData.slice(start, start + PACKET_SIZE);
                log(`Writing Packet: ${i + 1}`);
                log(`Write Buffer ${JSON.stringify(buffer)}`);
                await this.manager.writeCharacteristicWithResponseForDevice(
                  deviceId,
                  this._lockServiceUUIDs,
                  this._lockCharsUUIDs,
                  buffer.toString('base64')).then(() => {
                    log(`Writing Packet Successful: ${i + 1}`);
                }).catch((error) => {
                    return reject(new Error(`Error while writing to BLE Device: ${error}`))
                })
                start += 20;
            }
        })
    }

    /**
     * A bluetooth command has timed out (from the libraries perspective).
     *
     * @param lockMac {string} mac of the lock with format "FB:FB:CD:BF:27:FF"
     */
    commandTimeOut(lockMac) {
        this.timeout = true; // Command is timeout, Set timeout to true.
        log("command timed out so disconnecting the device");
        this.alreadyConnectedDevice = undefined;
        let deviceId = this.getDeviceId(lockMac);
        this.manager.cancelDeviceConnection(deviceId).then(() => {
            log("Successfully Disconnected from device.");
        }).catch((error) => {
            log(`Error while disconnecting from device ${error}`);
        })
    }

    /**
     * Get the broadcast info of the lock.
     *
     * @param lockMac {string} mac of the lock with format "FB:FB:CD:BF:27:FF"
     * @returns {Promise<Object>}
     */
    async getLockBroadcastInfo(lockMac) {
        let deviceId = this.getDeviceId(lockMac);
        return this.activeDevices.get(deviceId).info;
    }

    async retryOnce(promise) {
        try {
            return (await promise());
        }
        catch (e) {
            return (await promise());
        }
    }

    /**
     * Connect to device.
     * There could be two posibilities.
     * Posibility 1 - Device is already connected.
     * In some cases device can be connected but devices services will not be available.
     * In that situation we have to connect device again.
     * Posibility 2 - Device is not connected.
     *
     * @param deviceId {string} device id, For iOS it will be UUID, For android it will be MAC ID
     */

    async connectToDevice(deviceId) {

        // Posibility 1 - Device is already connected

        let allConnectedDevices = await this.manager.connectedDevices([this._lockServiceUUIDs]);
        if (allConnectedDevices.length === 0) {
            log(`No previously connected devices`);
        }

        let connectedDevice = await new Promise(async (resolve) => {
            for (let i = 0; i < allConnectedDevices.length; i++) {
                let device = allConnectedDevices[i];
                if (device.id === deviceId) {
                    if (await this.manager.isDeviceConnected(deviceId)) {
                        try {
                            let deviceServices = await device.services();
                            if (deviceServices !== undefined && deviceServices!==null &&  deviceServices.length > 0) {
                                return resolve(device); // Return already connected device who's services are already discovered.
                            }
                        } catch (e) {
                            console.log('device service error  ');

                        }
                    }
                }
            }
            return resolve();
        })

        console.log(`already connected device `, connectedDevice && `{ name: ${connectedDevice.name}, id: ${connectedDevice.id}}`);
        if (connectedDevice) return connectedDevice;

        // Posibility 2 - Device is not connected.

        log(`Connecting to ${deviceId}`);

        try {
            // Connect to device, Retry once if connections fails. Normally connection requests throws GATT error.
            connectedDevice = await this.retryOnce(async () => await this.manager.connectToDevice(deviceId));
            // let connectedDevice = await this.manager.connectToDevice(deviceId);

            log(`Connected device: { name: ${connectedDevice.name}, id: ${connectedDevice.id} }`);

        } catch (error) {
            log(`Error while connecting to BLE Lock: ${JSON.stringify(error)}`)
            throw (createErrorWithCode(LockError.METHOD_ERR_DEVICE_NOT_CONN))
        }

        try {
            // Discover All Services
            await connectedDevice.discoverAllServicesAndCharacteristics();
            log(`Services Discovered...`);

            // Check if server list is empty
            let services = await connectedDevice.services();
            log(`Services list ${services}`);

            if (services === undefined || services === null || services.length === 0) {
                throw (new Error('services list is empty'));
            }

            return connectedDevice;
        } catch (error) {
            log(`Error while discoviring services  ${JSON.stringify(error)}`)
            throw (createErrorWithCode(LockError.DHBLE_RESULT_SERVICE_NOT_FOUND))
        }

    }

    /**
     *
     * Write to the device on the already specified characteristic.  This write is wrapped in a
     * Promise and should only resolve() after the corresponding notify(s) have occurred and are coalesced
     * into a single Buffer object that is run through ResponseFactory to create a Response object.
     *
     * @param lockMac {string} mac of the lock with format "FB:FB:CD:BF:27:FF"
     * @param command {Command} unencrypted buffer of bytes representing a command
     * @returns {Promise<Response>} response from the lock wrapped in a promise
     */

    async writeToDevice(lockMac, command) {
        this.timeout = false; // For every write command operation set timeout to false;
        return this.writeToDeviceWithAttempts(lockMac, command, 2)
    }

    async writeToDeviceWithAttempts(lockMac, command, attempts) {

        return new Promise(async (resolve, reject) => {
            try {
                let deviceId = this.getDeviceId(lockMac);
                await this.connectToDevice(deviceId);
                let writeRespose = await this.writeData(deviceId, command);
                console.log('writeToDevice Success');
                return resolve(writeRespose);
            } catch (e) {
                log(`In 1st catch error, while writing data to lock ${JSON.stringify(e)}`);
                try {
                    if (this.timeout === true) {
                        // If timeout is true then return, Don't write data.
                        return;
                    }

                    // If remanining attempts is 1 then throw error whithout retry.
                    if (attempts === 1 && this.timeout == false) {
                        throw e;
                    }else{
                        let response = await this.writeToDeviceWithAttempts(lockMac, command, --attempts);
                        return resolve(response);
                    }

                } catch (e) {
                    log(`In 2nd catch error, while writing data to lock ${JSON.stringify(e)}`);
                    return reject(e);
                }
            }
        })
    }
}

function parseManufacturerData(data) {

    let dataObj = {};
    if (data) {
        dataObj.modelNum = ((data[2] >> 2) & 0xff);
        dataObj.hardwareVer = (((data[2] & 0x03) << 2) | ((data[3] >> 6) & 0xff));
        dataObj.firmwareVer = (data[3] & 0x3f);
        dataObj.specialValue = (data[4] & 0xff);
        dataObj.recordStatus = (((data[5] & 0xff) >> 3) & 0x01);
        dataObj.lockStatus = (((data[5] & 0xff) >> 2) & 0x01);
        dataObj.settingMode = !! + (((data[5] & 0xff) >> 1) & 0x01);
        dataObj.touch = !! + ((data[5] & 0xff) & 0x01);
        dataObj.battery = data[6];
        dataObj.deviceMac = (data[9] & 0xff);
    }
    if (dataObj.modelNum === 2) {
        dataObj.isCommonArea = false;
    } else if (dataObj.modelNum === 12) {
        dataObj.isCommonArea = true;
    }
    let lockMac = [];
    let lockMacString = data.toString('hex').toUpperCase().slice(-12);
    for (const array = Array.from(lockMacString); array.length; lockMac.push(array.splice(0, 2).join('')));
    dataObj.lockMac = lockMac.join(':');
    if (dataObj.modelNum === 3) {
        dataObj.imei = parseInt('8' + parseInt(3 + dataObj.lockMac.replace(/:/g, '').slice(1), 16));
        dataObj.frontTested = !! + ((data[5] & 0xff) >> 7);
        dataObj.backTested = !! + ((data[5] & 0xff) >> 6);
    }
    return dataObj;

}

function log(message) {
    const LOG_SUFFIX = "RN BT => ";
    console.log(LOG_SUFFIX + message);
}

export const RNBlePlugin = BlePlugin;
