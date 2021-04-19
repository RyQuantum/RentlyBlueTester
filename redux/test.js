import axios from 'axios';
import { CLEAR_LOCKS } from './locks';
import { strings } from '../app/utils/i18n';
import API from '../app/services/API';

const TEST_PENDING = 'TEST_PENDING';
const TEST_SUCCESS = 'TEST_SUCCESS';
const TEST_FAILED = 'TEST_FAILED';

const LOCK_BLUETOOTH_PENDING = 'LOCK_BLUETOOTH_PENDING';
const LOCK_BLUETOOTH_SUCCESS = 'LOCK_BLUETOOTH_SUCCESS';
const LOCK_BLUETOOTH_FAILED = 'LOCK_BLUETOOTH_FAILED';

const INIT_LOCK_PENDING = 'INIT_LOCK_PENDING';
const INIT_LOCK_SUCCESS = 'INIT_LOCK_SUCCESS';
const INIT_LOCK_FAILED = 'INIT_LOCK_FAILED';

const PASSCODE_SERVER_PENDING = 'PASSCODE_SERVER_PENDING';
const PASSCODE_SERVER_SUCCESS = 'PASSCODE_SERVER_SUCCESS';
const PASSCODE_SERVER_FAILED = 'PASSCODE_SERVER_FAILED';

const LINK_SERIALNO_PENDING = 'LINK_SERIALNO_PENDING';
const LINK_SERIALNO_SUCCESS = 'LINK_SERIALNO_SUCCESS';
const LINK_SERIALNO_FAILURE = 'LINK_SERIALNO_FAILURE';

const UPLOAD_RECORD_REQUEST = 'UPLOAD_RECORD_REQUEST';
const UPLOAD_RECORD_SUCCESS = 'UPLOAD_RECORD_SUCCESS';
const UPLOAD_RECORD_FAILED = 'UPLOAD_RECORD_FAILED';

const COST_TIME_UPDATE = 'COST_TIME_UPDATE';
const END_TEST = 'END_TEST';

export const stateEnum = {
  NOT_STARTED: 0,
  PENDING: 1,
  SUCCESS: 2,
  FAILED: 3,
};

const {
  NOT_STARTED,
  PENDING,
  SUCCESS,
  FAILED,
} = stateEnum;

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const startTest = (lockObj) => {
  return async (dispatch, getState) => {
    try {
      const { test: { ekey, lockBluetoothState }, auth: { partnerId, batchNo, url } } = getState();
      const blePlugin = getState().locks.libraryObj._lockController._blePlugin;
      if (!lockObj) lockObj = getState().test.lockObj;
      if (lockBluetoothState === SUCCESS) {
        dispatch({ type: TEST_PENDING, payload: { lockObj } });
      } else {
        dispatch({ type: TEST_PENDING, payload: { lockObj, RTCCostTime: null } });
      }
      let res;
      if (!ekey) {
        // Add lock to DMS
        try {
          dispatch({ type: INIT_LOCK_PENDING });
          const req1 = blePlugin.connectToDevice(blePlugin.getDeviceId(lockObj.lockMac));
          const req2 = API.addLockToDMS(lockObj.lockMac, lockObj.deviceID);
          res = await Promise.all([req1, req2]);
          if (!res[1].success) throw res;
          res = await lockObj.addAdministrator();
          if (!res.success) throw res;
          res = await API.setDeviceTimezone(lockObj.lockMac, lockObj.deviceAuthToken);
          if (!res.success) throw res;
          dispatch({ type: INIT_LOCK_SUCCESS, payload: { ekey: lockObj.ekey } });
        } catch (error) {
          dispatch({ type: INIT_LOCK_FAILED, error });
          throw error;
        }
      }

      if (lockBluetoothState !== SUCCESS) {
        // Lock BT
        try {
          dispatch({type: LOCK_BLUETOOTH_PENDING});
          const startTime = await lockObj.getLockTime();
          const res = await Promise.all([lockObj.unlock(), delay(1100)]);
          const endTime = await lockObj.getLockTime();
          if(!res[0].success) throw res[0];
          const RTCCostTime = (new Date(endTime.time) - new Date(startTime.time)) / 1000;
          dispatch({ type: COST_TIME_UPDATE, payload: { RTCCostTime } });
          if (RTCCostTime === 0) throw new Error('RTC error');
          dispatch({type: LOCK_BLUETOOTH_SUCCESS});
        } catch (error) {
          dispatch({type: LOCK_BLUETOOTH_FAILED, error});
          throw error;
        }
      }

      // Update Partner ID and retrieve Passcode
      try {
        dispatch({ type: PASSCODE_SERVER_PENDING });
        const env = url.split('.')[1];
        const partnerID = ['rentlyblack', 'rentlyred', 'rentlygreen', 'bluerently'].find(i => i === env) ? partnerId - 1 : partnerId;
        const params = { deviceMac: lockObj.lockMac, batchNum: batchNo, partnerId: partnerID };
        const req1 = API.updateDeviceBySuperAdmin(params);
        const req2 = API.createAutoCode(lockObj.lockMac, lockObj.deviceAuthToken);
        res = await Promise.all([req1, req2]);
        if(!res[0].success) throw res[0];
        if(!res[1].success) throw res[1];
        dispatch({type: PASSCODE_SERVER_SUCCESS, payload: { code: res[1].code.slice(0, 4) + ' ' + res[1].code.slice(4, 8) }});
      } catch (error) {
        dispatch({type: PASSCODE_SERVER_FAILED, error});
        throw error;
      }
      dispatch({type: TEST_SUCCESS});
    } catch (error) {
      dispatch({type: TEST_FAILED, error});
      throw error;
    }
  };
};

export const endTest = (isReset) => {
  return async (dispatch, getState) => {
    const {test: {
      initLockState,
      lockBluetoothState,
      passcodeServerState,
      linkState,
      lockObj: { lockMac },
      serialNo,
      error: {message} = {},
    }} = getState();

    const errorCode = (initLockState !== SUCCESS) ? 1 :
      (lockBluetoothState !== SUCCESS) ? 2 :
      (passcodeServerState !== SUCCESS) ? 3 :
      (linkState !== SUCCESS) ? (isReset ? 4 : 5) : 0;
    const params = { lockMac, serialNo, errorCode };
    if (errorCode !== 0) {
      const errorInfo = ['Success', 'Init failed', 'Unlock failed', 'Update partner ID failed', 'Retrieve passcode failed', 'Link SN failed but reset', 'Link SN failed without reset'];
      params.errorMsg = message || errorInfo[errorCode];
    }
    try {
      // Upload test record
      dispatch({type: UPLOAD_RECORD_REQUEST});
      await API.lockTestRecord(lockMac, params);
      dispatch({type: UPLOAD_RECORD_SUCCESS});
    } catch (error) {
      console.log('error test----',error);
      dispatch({type: UPLOAD_RECORD_FAILED});
    } finally {
      dispatch({ type: CLEAR_LOCKS });
      dispatch({ type: END_TEST });
    }
  };
};

export const linkSerialNo = (SN) => {
  const serialNo = parseInt(SN);
  return async (dispatch, getState) => {
    if (serialNo.toString() !== SN || !(serialNo >= 10000000) || !(serialNo < 12000000)) {
      const error = new Error(strings('LockTest.invalidSN'));
      dispatch({ type: LINK_SERIALNO_FAILURE, error });
      throw error;
    }
    const { auth: { batchNo, localServerIp, isB2b }, test: { lockObj } } = getState();
    try {
      // Link serialNo
      dispatch({ type: LINK_SERIALNO_PENDING });
      const params = { deviceMac: lockObj.lockMac, batchNum: batchNo, serialNo };
      const req1 = API.updateDeviceBySuperAdmin(params);
      const req2 = isB2b ? Promise.resolve({ success: true }) : lockObj.setResetButton(true);
      const res = await Promise.all([req1, req2]);
      if (res[0].success && res[1].success) {
        localServerIp && await axios.post('http://' + localServerIp + ':6000/lock', { serial_number: SN }, { timeout: 1000 });
        dispatch({ type: LINK_SERIALNO_SUCCESS, payload: { serialNo } });
      } else if (!res[0].success) {
        dispatch({ type: LINK_SERIALNO_FAILURE, error: res[0] });
        throw res[0];
      } else {
        dispatch({ type: LINK_SERIALNO_FAILURE, error: res[1] });
        throw res[1];
      }
    } catch (error) {
      if (error.message === 'timeout of 1000ms exceeded') {
        alertIOS(strings('LockTest.localServerFailedMsg'));
      }
      dispatch({ type: LINK_SERIALNO_FAILURE, error });
      throw error;
    }
  }
}

const alertIOS = (...args) => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      alert(...args);
    });
  });
};

const defaultState = {
  ekey: null,
  lockObj: null,
  isVisible: false,
  isTesting: false,
  isResetted: false,
  isLinked:false,
  testState: PENDING,
  initLockState:PENDING,
  lockBluetoothState: NOT_STARTED,
  passcodeServerState: NOT_STARTED,
  linkState:NOT_STARTED,
  resetState:NOT_STARTED,
  isAllDone: false,
  RTCCostTime: null,
  code: '',
  serialNo: '',
};

export default (state = defaultState, action) => {
  const {type, payload, error} = action;
  switch (type) {
    case TEST_PENDING:
      return { ...state, testState: PENDING, isVisible: true, isTesting:true, ...payload };
    case INIT_LOCK_PENDING:
      return {...state, initLockState: PENDING};
    case INIT_LOCK_SUCCESS:
      return {...state, ...payload, initLockState: SUCCESS};
    case INIT_LOCK_FAILED:
      return { ...state, initLockState: FAILED, error };
    case LOCK_BLUETOOTH_PENDING:
      return {...state, lockBluetoothState: PENDING};
    case LOCK_BLUETOOTH_SUCCESS:
      return {...state, lockBluetoothState: SUCCESS};
    case LOCK_BLUETOOTH_FAILED:
      return {...state, lockBluetoothState: FAILED, error};
    case PASSCODE_SERVER_PENDING:
      return {...state, passcodeServerState: PENDING};
    case PASSCODE_SERVER_SUCCESS:
      return {...state, ...payload, passcodeServerState: SUCCESS};
    case PASSCODE_SERVER_FAILED:
      return {...state, passcodeServerState: FAILED, error};
    case TEST_SUCCESS:
      return {...state, testState: SUCCESS, isTesting:false};
    case TEST_FAILED:
      return {...state, testState: FAILED, error};
    case LINK_SERIALNO_PENDING:
    return {...state, linkState: PENDING, isLinked:false, isResetted:false};
    case LINK_SERIALNO_SUCCESS:
      return { ...state, linkState: SUCCESS, isLinked: true, ...payload, isResetted:false };
    case LINK_SERIALNO_FAILURE:
      return {...state, linkState: FAILED, isLinked: false,isResetted:false, error};
    case COST_TIME_UPDATE:
      return { ...state, ...payload };
    case END_TEST:
      return defaultState;
    default:
      return state;
  }
};
