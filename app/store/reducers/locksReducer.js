import { UPDATE_LOCK, CLEAR_LOCKS, SET_THRESHOLD, SET_RSSI_FILTER, GET_MAX_SERIAL_NUM_REQUEST, GET_MAX_SERIAL_NUM_SUCCESS, GET_MAX_SERIAL_NUM_FAILED } from '../actions/types';
import { OaksBleLockLibrary, PersistencePlugin, RNBlePlugin } from '../../../BleLibrary/lib';
import API from '../../../services/API';

const libraryObj = new OaksBleLockLibrary(API.getDeviceToken, new RNBlePlugin(), new PersistencePlugin());
libraryObj.timezoneString = 'Pacific Time (US & Canada)';
const defaultState = {
  touchedLocks: [],
  settingLocks: [],
  nonSettingLocks: [],
  codes: {}, //TODO
  libraryObj,
  // checkEnabled: false,
  // rssiThreshold: -100,
  // maxSerialNumber: null,
  error: null,
};

export default (state = defaultState, action) => {
  const { type, payload, error } = action;
  let { touchedLocks, settingLocks, nonSettingLocks, libraryObj } = state;
  switch (type) {
    case UPDATE_LOCK: {
      const { lockMac, touch, settingMode, battery, rssi } = payload.lock;
      if (touch === false) {
        touchedLocks = touchedLocks.filter(lock => lock.lockMac !== lockMac);
        settingLocks = settingLocks.filter(lock => lock.lockMac !== lockMac);
        nonSettingLocks = nonSettingLocks.filter(lock => lock.lockMac !== lockMac);
        return { ...state, touchedLocks, settingLocks, nonSettingLocks };
      }
      const index = touchedLocks.findIndex(lock => lock.lockMac === lockMac);
      if (index !== -1) {
        Object.assign(touchedLocks[index], { touch, settingMode, battery, rssi });
        settingLocks = touchedLocks.filter(lock => lock.settingMode === true);
        nonSettingLocks = touchedLocks.filter(lock => lock.settingMode === false);
        return { ...state, touchedLocks, settingLocks, nonSettingLocks };
      }
      const lockObject = libraryObj.createDevice(payload.lock);
      lockObject.refreshToken();
      touchedLocks.push(lockObject);
      settingLocks = touchedLocks.filter(lock => lock.settingMode === true);
      nonSettingLocks = touchedLocks.filter(lock => lock.settingMode === false);
      return { ...state, touchedLocks, settingLocks, nonSettingLocks };
    }

    case CLEAR_LOCKS:
      return { ...state, touchedLocks: [], settingLocks: [], nonSettingLocks: [] };

    case SET_THRESHOLD:
      const { rssiThreshold } = payload;
      return { ...state, rssiThreshold: rssiThreshold };

    case SET_RSSI_FILTER:
      return { ...state, checkEnabled: !state.checkEnabled };
    case GET_MAX_SERIAL_NUM_REQUEST:
      return { ...state, ...payload };
    case GET_MAX_SERIAL_NUM_SUCCESS:
      const { maxSerialNumber } = payload;
      return { ...state, maxSerialNumber };
    default:
      return state;
  }
};
