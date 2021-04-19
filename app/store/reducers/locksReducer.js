import {
  UPDATE_LOCK,
  CLEAR_LOCKS,
  SET_THRESHOLD,
  SET_RSSI_FILTER,
  GET_MAX_SERIAL_NUM_REQUEST,
  GET_MAX_SERIAL_NUM_SUCCESS,
  GET_MAX_SERIAL_NUM_FAILED,
  UPDATE_LOCKS,
} from '../actions/types';
import { OaksBleLockLibrary, PersistencePlugin, RNBlePlugin } from '../../../BleLibrary/lib';
import API from '../../services/API';

const libraryObj = new OaksBleLockLibrary(API.getDeviceToken, new RNBlePlugin(), new PersistencePlugin());
libraryObj.timezoneString = 'Pacific Time (US & Canada)';
const defaultState = {
  touchedLocks: [],
  settingLocks: [],
  nonSettingLocks: [],
  codes: {}, //TODO
  libraryObj,
  // isDevelopmentMode: false,
  checkEnabled: false,
  rssiThreshold: -100,
  maxSerialNumber: '',
  error: null,
};

export default (state = defaultState, action) => {
  const { type, payload, error } = action;
  switch (type) {
    case UPDATE_LOCK:
      return state;

    case UPDATE_LOCKS:
      return { ...state, ...payload };

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
