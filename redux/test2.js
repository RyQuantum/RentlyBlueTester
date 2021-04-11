import API from "../services/API";
import { Alert } from "react-native";
import { strings } from "../services/i18n";

const TEST2_DONE = 'TEST2_DONE';

const TEST2_PENDING = 'TEST2_PENDING';
const TEST2_SUCCESS = 'TEST2_SUCCESS';
const TEST2_FAILED = 'TEST2_FAILED';

const SET_TIME_PENDING = 'SET_TIME_PENDING';
const SET_TIME_SUCCESS = 'SET_TIME_SUCCESS';
const SET_TIME_FAILED = 'SET_TIME_FAILED';

const TEST_RTC_PENDING = 'TEST_RTC_PENDING';
const TEST_RTC_SUCCESS = 'TEST_RTC_SUCCESS';
const TEST_RTC_FAILED = 'TEST_RTC_FAILED';

const READ_ICCID_PENDING = 'READ_ICCID_PENDING';
const READ_ICCID_SUCCESS = 'READ_ICCID_SUCCESS';
const READ_ICCID_FAILED = 'READ_ICCID_FAILED';

const UPLOAD_SERVER_PENDING = 'UPLOAD_SERVER_PENDING';
const UPLOAD_SERVER_SUCCESS = 'UPLOAD_SERVER_SUCCESS';
const UPLOAD_SERVER_FAILED = 'UPLOAD_SERVER_FAILED';
const UPLOAD_SERVER_FAILED2 = 'UPLOAD_SERVER_FAILED2';

const UPLOAD_SN_PENDING = 'UPLOAD_SN_PENDING';
const UPLOAD_SN_SUCCESS = 'UPLOAD_SN_SUCCESS';
const UPLOAD_SN_FAILED = 'UPLOAD_SN_FAILED';

export const stateEnum = {
  NOT_STARTED: 0,
  PENDING: 1,
  SUCCESS: 2,
  FAILED: 3,
  FAILED2: 4,
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const startTest2 = (lockObj) => {
  return async (dispatch, getState) => {
    const { setTimeState, testRTCState, readICCIDState, uploadServerState } = getState().test2;
    if (!lockObj) lockObj = getState().test2.lockObj;
    dispatch({ type: TEST2_PENDING, payload: { lockObj } });

    try {
      // Set lock time
      if (setTimeState !== SUCCESS) {
        try {
          dispatch({ type: SET_TIME_PENDING });
          await lockObj.setLockTime();
          dispatch({ type: SET_TIME_SUCCESS });
        } catch (error) {
          dispatch({ type: SET_TIME_FAILED, error });
          throw error;
        }
      }

      //RTC&Unlock
      if (testRTCState !== SUCCESS) {
        try {
          dispatch({ type: TEST_RTC_PENDING });
          const startTime = await lockObj.getLockTime();
          const res = await Promise.all([lockObj.unlock(), delay(1100)]);
          const endTime = await lockObj.getLockTime();
          const RTCCostTime = (new Date(endTime.time) - new Date(startTime.time)) / 1000;
          if (!res[0].success) throw res[0];
          if (RTCCostTime === 0) throw new Error('RTC error');
          dispatch({ type: TEST_RTC_SUCCESS, payload: { RTCCostTime } });
        } catch (error) {
          dispatch({ type: TEST_RTC_FAILED, error });
          throw error;
        }
      }

      //Read ICCID
      if (readICCIDState !== SUCCESS || uploadServerState !== SUCCESS) {
        try {
          dispatch({ type: READ_ICCID_PENDING });
          const { iccid } = await lockObj.getIccid();
          dispatch({ type: READ_ICCID_SUCCESS, payload: { iccid } });
        } catch (error) {
          dispatch({ type: READ_ICCID_FAILED, error });
          throw error;
        }
      }

      //upload
      if (uploadServerState !== SUCCESS) {
        try {
          dispatch({ type: UPLOAD_SERVER_PENDING });
          const params = { deviceMac: lockObj.lockMac, iccid: getState().test2.iccid };
          const req1 = API.createAutoCode(lockObj.lockMac, lockObj.deviceAuthToken)
          const req2 = API.updateDeviceBySuperAdmin(params).catch(err => err);
          let [{ code }, res] = await Promise.all([req1, req2]);
          if (res instanceof Error) {
            if (res.message === 'Resource not found - Invalid ICCID') {
              res = new Error(strings('LockTest2.invalidSIM'));
              if (getState().locks.isDevelopmentMode) {
                Alert.alert('Error', res.message);
                return dispatch({ type: UPLOAD_SERVER_FAILED2, payload: { code, error: res } });
              }
            }
            throw res;
          }
          dispatch({ type: UPLOAD_SERVER_SUCCESS, payload: { code } });
        } catch (error) {
          dispatch({ type: UPLOAD_SERVER_FAILED, error });
          throw error;
        }
      }
    } catch (error) {
      dispatch({ type: TEST2_FAILED, error });
      const errorMessage =
        typeof error === 'object' ? error.message :
          typeof error === 'string' ? error : 'unknown';
      Alert.alert('Error', errorMessage);
    }
  };
};

export const linkSerialNo = (SN) => {
  const serialNo = parseInt(SN);
  return async (dispatch, getState) => {
    if (serialNo.toString() !== SN || !(serialNo >= 12000000) || !(serialNo < 13000000)) {
      const error = new Error(strings('LockTest.invalidSN'));
      dispatch({ type: UPLOAD_SN_FAILED, error });
      throw error;
    }
    const { auth: { batchNo }, test2: { lockObj } } = getState();
    try {
      dispatch({ type: UPLOAD_SN_PENDING });
      const params = { deviceMac: lockObj.lockMac, batchNum: batchNo, serialNo };
      const res = await API.updateDeviceBySuperAdmin(params);
      if (res.success) {
        dispatch({ type: UPLOAD_SN_SUCCESS, payload: { serialNo } });
        dispatch({ type: TEST2_SUCCESS });
      } else {
        dispatch({ type: UPLOAD_SN_FAILED, error: res });
        throw res;
      }
    } catch (error) {
      dispatch({ type: UPLOAD_SN_FAILED, error });
      throw error;
    }
  }
}

export const endTest2 = () => {
  return async (dispatch, getState) => {
    const {
      setTimeState,
      testRTCState,
      readICCIDState,
      uploadServerState,
      uploadSNState,
      lockObj: { lockMac },
      error: { message } = {},
    } = getState().test2;
    const errorCode = (setTimeState !== SUCCESS) ? 5 :
      (testRTCState !== SUCCESS) ? 6 :
        (readICCIDState !== SUCCESS) ? 7 :
          (uploadServerState !== SUCCESS) ? 8 :
            (uploadSNState !== SUCCESS) ? 9 : 0;
    const params = { lockMac, errorCode };
    const errorInfo = ['Test2 Success', , , , , 'Set time failed', 'Test RTC failed', 'Read ICCID failed', 'Upload ICCID failed', 'Upload SN failed'];
    params.errorMsg = message || errorInfo[errorCode];
    try {
      await API.lockTestRecord(lockMac, params);
    } catch(error) {
      console.log('error test----', error);
    } finally {
      dispatch({ type: TEST2_DONE });
    }
  };
};

const {
  NOT_STARTED,
  PENDING,
  SUCCESS,
  FAILED,
  FAILED2,
} = stateEnum;

const defaultState = {
  lockObj: null,
  isVisible: false,
  test2State: PENDING,
  setTimeState: NOT_STARTED,
  testRTCState: NOT_STARTED,
  RTCCostTime: null,
  readICCIDState: NOT_STARTED,
  iccid: null,
  uploadServerState: NOT_STARTED,
  code: '',
  uploadSNState: NOT_STARTED,
  serialNo: '',
};

export default (state = defaultState, action) => {
  const { type, payload, error } = action;
  switch (type) {
    case TEST2_PENDING:
      return { ...state, isVisible: true, test2State: PENDING, ...payload };
    case TEST2_SUCCESS:
      return { ...state, test2State: SUCCESS };
    case TEST2_FAILED:
      return { ...state, test2State: FAILED, error };
    case SET_TIME_PENDING:
      return { ...state, setTimeState: PENDING };
    case SET_TIME_SUCCESS:
      return { ...state, setTimeState: SUCCESS };
    case SET_TIME_FAILED:
      return { ...state, setTimeState: FAILED };
    case TEST_RTC_PENDING:
      return { ...state, testRTCState: PENDING };
    case TEST_RTC_SUCCESS:
      return { ...state, testRTCState: SUCCESS, ...payload };
    case TEST_RTC_FAILED:
      return { ...state, testRTCState: FAILED };
    case READ_ICCID_PENDING:
      return { ...state, readICCIDState: PENDING };
    case READ_ICCID_SUCCESS:
      return { ...state, readICCIDState: SUCCESS, ...payload };
    case READ_ICCID_FAILED:
      return { ...state, readICCIDState: FAILED };
    case UPLOAD_SERVER_PENDING:
      return { ...state, uploadServerState: PENDING };
    case UPLOAD_SERVER_SUCCESS:
      return { ...state, uploadServerState: SUCCESS, ...payload };
    case UPLOAD_SERVER_FAILED:
      return { ...state, uploadServerState: FAILED, ...payload };
    case UPLOAD_SERVER_FAILED2:
      return { ...state, uploadServerState: FAILED2, ...payload };
    case UPLOAD_SN_PENDING:
      return { ...state, uploadSNState: PENDING };
    case UPLOAD_SN_SUCCESS:
      return { ...state, uploadSNState: SUCCESS, ...payload };
    case UPLOAD_SN_FAILED:
      return { ...state, uploadSNState: FAILED, error };
    case TEST2_DONE:
      return defaultState;
    default:
      return state;
  }
};
