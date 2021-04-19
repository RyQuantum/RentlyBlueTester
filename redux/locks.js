import { OaksBleLockLibrary, RNBlePlugin, PersistencePlugin } from '../BleLibrary/lib';
import API from '../app/services/API';

const UPDATE_LOCKS = 'UPDATE_LOCKS';
export const CLEAR_LOCKS = 'CLEAR_LOCKS';

const updateLocks = touchedLocks => ({
  type: UPDATE_LOCKS,
  payload: {
    touchedLocks,
    settingLocks: touchedLocks.filter(({settingMode}) => settingMode),
    nonSettingLocks: touchedLocks.filter(({settingMode}) => !settingMode),
  },
});

export const foundLock = (lock) => {
  return async (dispatch, getState) => {
    const { locks: { touchedLocks, libraryObj } = {} } = getState();
    const { lockMac, touch, settingMode, battery, rssi } = lock;
    const index = touchedLocks.findIndex(lockObject => (lockObject.lockMac === lockMac));

    const isFound = index !== -1;
    if (isFound) {
      const lockObj = touchedLocks[index];
      clearTimeout(lockObj.timeout);

      if (touch) {
        lockObj.timeout = setTimeout(dismiss, 7000, getState, lockMac, dispatch);
          Object.assign(lockObj, { touch, settingMode, battery, rssi });
          // https://stackoverflow.com/questions/38060705/replace-element-at-specific-position-in-an-array-without-mutating-it
          dispatch(updateLocks(Object.assign([], touchedLocks, {[index]: lockObj})));
      } else {
        dispatch(updateLocks([
          ...touchedLocks.slice(0, index),
          ...touchedLocks.slice(index + 1),
        ]));
      }
    } else if (touch) {
      const lockObject = libraryObj.createDevice(lock);
      lockObject.refreshToken();
      lockObject.timeout = setTimeout(dismiss, 7000, getState, lockMac, dispatch);
      dispatch(updateLocks([lockObject, ...touchedLocks]));
    }
  };
};

const dismiss = (getState, lockMac, dispatch) => {
  const touchedLocks = getState().locks.touchedLocks;
  const i = touchedLocks.findIndex(lockObj => (lockObj.lockMac === lockMac));
  if (i !== -1) {
    dispatch(updateLocks([...touchedLocks.slice(0, i), ...touchedLocks.slice(i + 1)]));
  }
};

export const clearLocks = (lockMac) => {
  return (dispatch, getState) => {
    const { locks: { touchedLocks, settingLocks, nonSettingLocks } } = getState();
    const index0 = touchedLocks.findIndex(lockObject => (lockObject.lockMac === lockMac));
    if (index0 !== -1) {
      dispatch(updateLocks([...touchedLocks.slice(0, index0), ...touchedLocks.slice(index0 + 1)]));
    }
    const index1 = settingLocks.findIndex(lockObject => (lockObject.lockMac === lockMac));
    if (index1 !== -1) {
      dispatch(updateLocks([...settingLocks.slice(0, index1), ...settingLocks.slice(index1 + 1)]));
    }
    const index2 = nonSettingLocks.findIndex(lockObject => (lockObject.lockMac === lockMac));
    if (index2 !== -1) {
      dispatch(updateLocks([...nonSettingLocks.slice(0, index2), ...nonSettingLocks.slice(index2 + 1)]));
    }
  }
};

const SET_THRESHOLD = 'SET_THRESHOLD';
export const setThreshold = val => ({
  type: SET_THRESHOLD,
  payload: {
    rssiThreshold: val,
  },
});
const SET_ENABLED = 'SET_ENABLED';
export const setEnabled = () => ({
  type: SET_ENABLED,
});
const SET_DEVELOPMENT_MODE = 'SET_DEVELOPMENT_MODE';
export const setDevelopmentMode = () => ({
  type: SET_DEVELOPMENT_MODE,
});

const GET_MAX_SERIAL_NUM_PENDING = 'GET_MAX_SERIAL_NUM_PENDING';
const GET_MAX_SERIAL_NUM_FAILED = 'GET_MAX_SERIAL_NUM_FAILED';
const GET_MAX_SERIAL_NUM_SUCCESS = 'GET_MAX_SERIAL_NUM_SUCCESS';

export const getMaximumSerialNumber = (modelNum) => {
  return async (dispatch) => {
    try{
      dispatch({ type: GET_MAX_SERIAL_NUM_PENDING, payload: { maxSerialNumber: 'loading' } });
      const res = await API.getMaxV3SerialNo(modelNum);
      dispatch({ type: GET_MAX_SERIAL_NUM_SUCCESS, payload:{ maxSerialNumber: res.max } });
    } catch (error) {
      alert(error);
      console.log('SERIALNO ERROR:', error);
      dispatch({ type: GET_MAX_SERIAL_NUM_FAILED, maxSerialNumber: error.message });
    }
  }
};

export const isSupportIC = true;

const libraryObj = new OaksBleLockLibrary(API.getDeviceToken, new RNBlePlugin(), new PersistencePlugin());
libraryObj.timezoneString = 'Pacific Time (US & Canada)';
const defaultState = {
  touchedLocks: [],
  settingLocks: [],
  nonSettingLocks: [],
  eKeys: {},
  codes: {},
  libraryObj,
  isDevelopmentMode: false,
  checkEnabled: false,
  rssiThreshold: -100,
  maxSerialNumber: null
};

export default (state = defaultState, action) => {
  const { type, payload, error } = action;
  switch(type) {
    case UPDATE_LOCKS:
      return {...state, ...payload};
    case SET_THRESHOLD:
      const{rssiThreshold} = payload;
      return{...state,rssiThreshold:rssiThreshold};
    case GET_MAX_SERIAL_NUM_PENDING:
      return { ...state, ...payload };
    case GET_MAX_SERIAL_NUM_SUCCESS:
      const { maxSerialNumber } = payload;
      return{ ...state, maxSerialNumber };
    case GET_MAX_SERIAL_NUM_PENDING:
      return { ...state, ...payload };
    case SET_ENABLED:
      return{...state,checkEnabled:!state.checkEnabled};
    case SET_DEVELOPMENT_MODE:
      return { ...state, isDevelopmentMode: !state.isDevelopmentMode };
    case CLEAR_LOCKS:
      return { ...state, touchedLocks: [], settingLocks: [], nonSettingLocks: [] };
    default:
      return state;
  }
};
