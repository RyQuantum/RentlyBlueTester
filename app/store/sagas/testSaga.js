import axios from 'axios';
import { put, select } from 'redux-saga/effects';

import {
  requestTest,
  testSuccess,
  verifyBroadcastInfo,
  verifyBroadcastInfoSuccess,
  verifyBroadcastInfoFailed,
  initializeLock,
  initializeLockSuccess,
  initializeLockFailed,
  testRTC,
  testRTCSuccess,
  testRTCFailed,
  testHall,
  testHallSuccess,
  testHallFailed,
  testDoorSensor,
  testDoorSensorSuccess,
  testDoorSensorFailed,
  testTouchKey,
  testTouchKeySuccess,
  testTouchKeyFailed,
  testNfcChip,
  testNfcChipSuccess,
  testNfcChipFailed,
  testAutoLock,
  testAutoLockSuccess,
  testAutoLockFailed,
  testOfflineCode,
  testOfflineCodeFailed,
  gotOfflineCode,
  uploadSerialNoFailed,
  uploadSerialNoSuccess,
  endTest,
  clearTest,
} from '../actions/testActions';
import API from '../../services/API';
import { delay, parseTimeStamp } from '../../utils';
import { strings } from '../../utils/i18n';
import { SUCCESS } from '../actions/types';

//TODO retry
//TODO identify the accurate error of multiple actions

export function* verifyBroadcastInfoAsync({ payload: lockObj }) {
  const { lockMac, modelNum, hardwareVer, firmwareVer, rssi, battery } = lockObj;
  const { locks:{ criteria } } = yield select();
  yield put(verifyBroadcastInfo({ lockMac, modelNum, hardwareVer, firmwareVer, rssi, battery }));

  const errors = [];
  if (criteria.model && modelNum.toString() !== criteria.model) errors.push(strings('Test.InvalidModel'));
  if (criteria.hardwareVer && hardwareVer.toString() !== criteria.hardwareVer) errors.push(strings('Test.InvalidHardwareVer'));
  if (criteria.firmwareVer && firmwareVer.toString() !== criteria.firmwareVer) errors.push(strings('Test.InvalidFirmwareVer'));
  if (rssi >= 0 || rssi < criteria.rssi) errors.push(strings('Test.InvalidRssi'));
  if (battery > 100 || battery < criteria.battery) errors.push(strings('Test.InvalidBattery'));
  if (errors.length === 0) {
    try {
      const res = yield API.addLockToDMS(lockObj.lockMac, lockObj.deviceID);
      if (!res.success) throw new Error('/addLockToDMS API failed: ' + JSON.stringify(res));
      return yield put(verifyBroadcastInfoSuccess());
    } catch (error) {
      return yield put(verifyBroadcastInfoFailed(error));
    }
  }
  yield put(verifyBroadcastInfoFailed(new Error(errors)));
}

export function* scanBroadcastAsync() {
  yield put(verifyBroadcastInfo({}));
  const { test: { lockObj }, locks: { libraryObj } } = yield select();
  let info;
  for(let i = 0; i < 100; i++) {
    try {
      info = yield libraryObj._lockController._blePlugin.getLockBroadcastInfo(lockObj.lockMac);
    } catch (error) {
      yield delay(1000);
    }
    if (info) break;
  }
  Object.assign(lockObj, info);
  yield put(requestTest(lockObj));
}

export function* initializeLockAsync() {
  yield put(initializeLock());
  const { test: { lockObj }, auth: { isB2b } } = yield select();
  try {
    yield lockObj.addAdministrator();
    //TODO test reset button
    if (!isB2b) yield lockObj.setResetButton(true);
    yield put(initializeLockSuccess());
  } catch (error) {
    yield put(initializeLockFailed(error));
  }
}

export function* testRTCAsync() {
  yield put(testRTC());
  const { test: { lockObj } } = yield select();
  try {
    const promise = API.setDeviceTimezone(lockObj.lockMac, lockObj.deviceAuthToken);
    yield lockObj.setLockTime();
    const { timestamp } = yield lockObj.getLockTime();
    yield delay(2000);
    const { timestamp: timestamp2 } = yield lockObj.getLockTime();
    const diff = parseTimeStamp(timestamp2) - parseTimeStamp(timestamp);
    if (diff < 0 || diff > 5000) {
      throw new Error(strings('Test.RTCError') + (diff / 1000) + 's. ' + strings('Test.RTCRange'));
    }
    const res = yield promise;
    if (!res.success) throw new Error('/setDeviceTimezone API failed: ' + JSON.stringify(res));
    yield put(testRTCSuccess());
  } catch (error) {
    yield put(testRTCFailed(error));
  }
}

export function* testHallAsync() {
  yield put(testHall());
  const { test: { lockObj } } = yield select();
  try {
    yield lockObj.unlock();
    yield put(testHallSuccess());
  } catch (error) {
    yield put(testHallFailed(error));
  }
}

export function* testDoorSensorAsync() {
  yield put(testDoorSensor());
  const { test: { lockObj } } = yield select();
  try {
    const { doorSensorEnabled } = yield lockObj.isDoorSensorEnabled();
    if (!doorSensorEnabled) throw new Error(strings('Test.doorSensorDisabled'));
    yield put(testDoorSensorSuccess());
  } catch (error) {
    yield put(testDoorSensorFailed(error));
  }
}

export function* testTouchKeyAsync() {
  yield put(testTouchKey());
  const { test: { lockObj } } = yield select();
  try {
    // const { keys } = yield lockObj.sendFactoryTestingCommand(1);
    // if (!keys.every(key => key === true)) {
    //   const arr = keys.map((key, i) => key || i + 1).filter(key => key !== true);
    //   throw new Error(`[${arr.toString()}] are not been touched`);
    // }
    yield lockObj.getLockTime();
    yield put(testTouchKeySuccess());
  } catch (error) {
    yield put(testTouchKeyFailed(error));
  }
}

export function* testNfcChipAsync() {
  yield put(testNfcChip());
  const { test: { lockObj } } = yield select();
  try {
    // let { fobNumber } = yield lockObj.sendFactoryTestingCommand(2);
    // fobNumber = parseInt(fobNumber, 16).toString().padStart(10, '0');
    // if (!keys.every(key => key === true)) {
    //   const arr = keys.map((key, i) => key || i + 1).filter(key => key !== true);
    //   throw new Error(`[${arr.toString()}] are not been touched`);
    // }
    yield lockObj.getLockTime();
    const fobNumber = '1234567890';
    yield put(testNfcChipSuccess(fobNumber));
  } catch (error) {
    yield put(testNfcChipFailed(error));
  }
}

export function* testAutoLockAsync() {
  yield put(testAutoLock());
  const { test: { lockObj } } = yield select();
  try {
    yield lockObj.setAutoLockTime(1);
    yield put(testAutoLockSuccess());
  } catch (error) {
    yield put(testAutoLockFailed(error));
  }
}

export function* testOfflineCodeAsync() {
  yield put(testOfflineCode());
  let { test: { lockObj: { lockMac, deviceAuthToken } }, auth: { url, partnerId, batchNo } } = yield select();
  try {
    const env = url.split('.')[1];
    partnerId = ['rentlyblack', 'rentlyred', 'rentlygreen', 'bluerently'].find(i => i === env) ? partnerId - 1 : partnerId;
    const params = { deviceMac: lockMac, batchNum: batchNo, partnerId };
    const req1 = API.createAutoCode(lockMac, deviceAuthToken);
    const req2 = API.updateDeviceBySuperAdmin(params);
    const res = yield Promise.all([req1, req2]);
    // if (!res[0].success) throw res[0];
    if (!res[0].success) throw new Error('/createAutoCode API failed: ' + JSON.stringify(res[0]));
    // if (!res[1].success) throw res[1];
    if (!res[1].success) throw new Error('/updateDeviceBySuperAdmin API failed: ' + JSON.stringify(res[1]));
    yield put(gotOfflineCode(res[0].code));
  } catch (error) {
    yield put(testOfflineCodeFailed(error));
  }
}

const postToLocalServer = async (ip, serial_number) => {
  let success = false;
  const postRequest = async timeout => {
    await axios.post('http://' + ip + ':6379/lock', { serial_number }, { timeout });
    success = true;
  }
  const promise1 = delay(0).then(async () => await postRequest(11000));
  const promise2 = delay(1000).then(async () => success || await postRequest(10000));
  const promise3 = delay(2000).then(async () => success || await postRequest(9000));
  const promise4 = delay(3000).then(async () => success || await postRequest(8000));
  const promise5 = delay(4000).then(async () => success || await postRequest(7000));
  const timeout = delay(10000).then(() => {throw new Error(strings('Test.uploadLocalServerTimeout'))});
  await Promise.race([promise1, promise2, promise3, promise4, promise5, timeout]);
}

export function* uploadSerialNoAsync({ payload: serialNoStr }) {
  const { test: { lockObj: { lockMac } }, auth: { batchNo, localServerIp }} = yield select();
  const serialNo = parseInt(serialNoStr);
  try {
    if (serialNo.toString() !== serialNoStr || !(serialNo >= 10000000) || !(serialNo < 12000000)) {
      throw new Error(serialNoStr + ' - ' + strings('Test.invalidSN'));
    }
    const params = { deviceMac: lockMac, batchNum: batchNo, serialNo };
    const res = yield API.updateDeviceBySuperAdmin(params);
    if (!res.success) {
      if (res.errorCode === 1201) throw new Error(serialNoStr + ' - ' + strings('Test.duplicateSN'));
      throw new Error(serialNoStr + ' - ' + '/updateDeviceBySuperAdmin API failed: ' + JSON.stringify(res));
    }
    if (localServerIp) {
      yield postToLocalServer(localServerIp, serialNoStr).catch(error => {
        throw new Error(strings('login.localServerError') + ': ' + error.message);
      });
    }
    yield put(uploadSerialNoSuccess());
    yield put(testSuccess());
  } catch (error) {
    yield put(uploadSerialNoFailed(error));
  }
}
//TODO add all incomplete cases
export function* uploadTestRecordAsync({ payload: isReset }) {
  // yield put(uploadTestRecord());
  const {
    lockObj: { lockMac },
    testBroadcastState,
    // registerLockToDMSState,
    initLockState,
    testRTCState,
    testHallState,
    testDoorSensorState,
    testTouchKeyState,
    testNfcChipState,
    testAutoLockState,
    testOfflineCodeState,
    uploadSerialNoState,
    serialNo,
    error,
  } = yield select(state => state.test);
  // const test = yield select(state => state.test);

  let errorCode = (testBroadcastState !== SUCCESS) ? 1 :
    // (registerLockToDMSState !== SUCCESS) ? 2 :
    (initLockState !== SUCCESS) ? 2 :
      (testRTCState !== SUCCESS) ? 3 :
        (testHallState !== SUCCESS) ? 4 :
          (testDoorSensorState !== SUCCESS) ? 5 :
            (testTouchKeyState !== SUCCESS) ? 6 :
              (testNfcChipState !== SUCCESS) ? 7 :
                (testAutoLockState !== SUCCESS) ? 8 :
                  (testOfflineCodeState !== SUCCESS) ? 9 :
                    (uploadSerialNoState !== SUCCESS) ? 10 : 0;
  errorCode += isReset === false ? 10 : 0;
  const params = { lockMac, serialNo, errorCode };
  if (errorCode !== 0) {
    const errorInfo = [
      'Success',
      'Verify broadcast failed',
      // 'Register to DMS failed',
      'Init failed',
      'Test RTC failed',
      'Test hall failed',
      'Test door sensor failed',
      'Test touch key failed',
      'Test nfc chip failed',
      'Test auto lock failed',
      'Test offline code failed',
      'Upload SN failed but reset',
      'Upload SN failed without reset',
    ];
    params.errorMsg = error?.message || errorInfo[errorCode];
  }
  yield put(clearTest());
  try {
    console.log('upload testing record', lockMac, params);
    yield API.lockTestRecord(lockMac, params);
  } catch (error) {
    console.log('error:', error);
  }
}
