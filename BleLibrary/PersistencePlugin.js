import PersistencePluginInterface from 'blelocklibrary/plugins/PersistencePluginInterface';

export const PersistencePlugin = class PersistencePlugin extends PersistencePluginInterface {

  async readEkey (lockMac) {
  }

  async writeEkey (lockMac, ekey) {
  }

  async deleteEkey (lockMac) {
  }

  async readDeviceToken (lockMac) {
  }

  async writeDeviceToken (lockMac, deviceToken) {
  }

  async deleteDeviceToken (lockMac) {
  }

};

