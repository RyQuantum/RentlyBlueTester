import { Alert } from 'react-native';
import API from '../app/services/API';
import { delay } from './test';
import { strings } from '../app/utils/i18n';

const TEST1_DONE = 'TEST1_DONE';

const TEST1_PENDING = 'TEST1_PENDING';
const TEST1_SUCCESS = 'TEST1_SUCCESS';
const TEST1_FAILED = 'TEST1_FAILED';

const ADD_TO_DMS_PENDING = 'ADD_TO_DMS_PENDING';
const ADD_TO_DMS_SUCCESS = 'ADD_TO_DMS_SUCCESS';
const ADD_TO_DMS_FAILED = 'ADD_TO_DMS_FAILED';

const INIT_5GLOCK_PENDING = 'INIT_5GLOCK_PENDING';
const INIT_5GLOCK_SUCCESS = 'INIT_5GLOCK_SUCCESS';
const INIT_5GLOCK_FAILED = 'INIT_5GLOCK_FAILED';

const UPLOAD_TIMEZONE_PENDING = 'UPLOAD_TIMEZONE_PENDING';
const UPLOAD_TIMEZONE_SUCCESS = 'UPLOAD_TIMEZONE_SUCCESS';
const UPLOAD_TIMEZONE_FAILED = 'UPLOAD_TIMEZONE_FAILED';

const REGISTER_5GLOCK_PENDING = 'REGISTER_5GLOCK_PENDING';
const REGISTER_5GLOCK_SUCCESS = 'REGISTER_5GLOCK_SUCCESS';
const REGISTER_5GLOCK_FAILED = 'REGISTER_5GLOCK_FAILED';

export const stateEnum = {
  NOT_STARTED: 0,
  PENDING: 1,
  SUCCESS: 2,
  FAILED: 3,
  FAILED2: 4,
};

export const startTest1 = (lockObj) => {
  return async (dispatch, getState) => {
    const { addToDMSState, init5GLockState, setTimezoneState, lockRegisterState } = getState().test1;
    if (!lockObj) lockObj = getState().test1.lockObj;
    const blePlugin = getState().locks.libraryObj._lockController._blePlugin;
    dispatch({ type: TEST1_PENDING, payload: { lockObj } });

    try {
      // Add lock to DMS
      if (addToDMSState !== SUCCESS) {
        try {
          dispatch({ type: ADD_TO_DMS_PENDING });
          const req1 = blePlugin.connectToDevice(blePlugin.getDeviceId(lockObj.lockMac));
          const req2 = API.addLockToDMS(lockObj.lockMac, lockObj.deviceID);
          await Promise.all([req1, req2]);
          dispatch({ type: ADD_TO_DMS_SUCCESS });
        } catch (error) {
          dispatch({ type: ADD_TO_DMS_FAILED, error });
          throw error;
        }
      }

      // Init 5G lock
      if (init5GLockState !== SUCCESS) {
        try {
          dispatch({ type: INIT_5GLOCK_PENDING, payload: { startAt: Date.now() } });
          const res = await lockObj.addAdministrator();
          if (!res.success) throw res;
          dispatch({ type: INIT_5GLOCK_SUCCESS, payload: { ekey: lockObj.ekey } });
        } catch (error) {
          dispatch({ type: INIT_5GLOCK_FAILED, error });
          throw error;
        }
      }

      // Set timezone
      if (setTimezoneState !== SUCCESS) {
        try {
          dispatch({ type: UPLOAD_TIMEZONE_PENDING });
          const res = await API.setDeviceTimezone(lockObj.lockMac, lockObj.deviceAuthToken);
          if (!res.success) throw res;
          dispatch({ type: UPLOAD_TIMEZONE_SUCCESS });
        } catch (error) {
          dispatch({ type: UPLOAD_TIMEZONE_FAILED, error });
          throw error;
        }
      }

      if (lockRegisterState !== SUCCESS) {
        try {
          dispatch({ type: REGISTER_5GLOCK_PENDING });
          let t = Date.now();
          while (true) {
            const { deviceDetails } = await API.getLockDetails(lockObj.lockMac, lockObj.deviceAuthToken);
            if (deviceDetails && deviceDetails.simInfo) {
              const { simInfo } = deviceDetails;
              if (simInfo.syncedAt - getState().test1.startAt > 0) {
                simInfo.imei = lockObj.imei;
                simInfo.lockMac = lockObj.lockMac;
                dispatch({ type: REGISTER_5GLOCK_SUCCESS, payload: { simInfo } });
                break;
              }
            }
            if (Date.now() - t > 60 * 1000) break;
            await delay(5000);
          }
          if (getState().test1.lockRegisterState !== SUCCESS) {
            throw new Error(strings('LockTest1.timeout'));
          }
        } catch (error) {
          dispatch({ type: REGISTER_5GLOCK_FAILED, error });
          throw error;
        }
      }

      dispatch({ type: TEST1_SUCCESS });
    } catch (error) {
      dispatch({ type: TEST1_FAILED, error });
      const errorMessage =
        typeof error === 'object' ? error.message :
          typeof error === 'string' ? error : 'unknown';
      Alert.alert('Error', errorMessage);
    }
  };
};

export const endTest1 = () => {
  return async (dispatch, getState) => {
    const {
      addToDMSState,
      init5GLockState,
      setTimezoneState,
      lockRegisterState,
      lockObj: { lockMac },
      error: { message } = {},
    } = getState().test1;
    const errorCode = (addToDMSState !== SUCCESS) ? 1 :
      (init5GLockState !== SUCCESS) ? 2 :
        (setTimezoneState !== SUCCESS) ? 3 :
          (lockRegisterState !== SUCCESS) ? 4 : 0;
    const params = { lockMac, errorCode };
    const errorInfo = ['Test1 Success', 'Add to DMS failed', 'Init 5GLock failed', 'Set timezone failed', '5GLock register failed'];
    params.errorMsg = message || errorInfo[errorCode];
    try {
      await API.lockTestRecord(lockMac, params);
    } catch(error) {
      console.log('error test----', error);
    } finally {
      dispatch({ type: TEST1_DONE });
    }
  };
};

const {
  NOT_STARTED,
  PENDING,
  SUCCESS,
  FAILED,
} = stateEnum;

const defaultState = {
  isVisible: false,
  lockObj: null,
  ekey: null,
  startAt: null,
  simInfo: null,
  test1State: PENDING,
  addToDMSState: NOT_STARTED,
  init5GLockState: NOT_STARTED,
  setTimezoneState: NOT_STARTED,
  lockRegisterState: NOT_STARTED,
};

export default (state = defaultState, action) => {
  const { type, payload, error } = action;
  switch (type) {
    case TEST1_PENDING:
      return { ...state, isVisible: true, test1State: PENDING, ...payload };
    case TEST1_SUCCESS:
      return { ...state, test1State: SUCCESS };
    case TEST1_FAILED:
      return { ...state, test1State: FAILED, error };
    case ADD_TO_DMS_PENDING:
      return { ...state, addToDMSState: PENDING };
    case ADD_TO_DMS_SUCCESS:
      return { ...state, addToDMSState: SUCCESS };
    case ADD_TO_DMS_FAILED:
      return { ...state, addToDMSState: FAILED };
    case INIT_5GLOCK_PENDING:
      return { ...state, init5GLockState: PENDING, ...payload };
    case INIT_5GLOCK_SUCCESS:
      return { ...state, init5GLockState: SUCCESS, ...payload };
    case INIT_5GLOCK_FAILED:
      return { ...state, init5GLockState: FAILED };
    case UPLOAD_TIMEZONE_PENDING:
      return { ...state, setTimezoneState: PENDING };
    case UPLOAD_TIMEZONE_SUCCESS:
      return { ...state, setTimezoneState: SUCCESS };
    case UPLOAD_TIMEZONE_FAILED:
      return { ...state, setTimezoneState: FAILED };
    case REGISTER_5GLOCK_PENDING:
      return { ...state, lockRegisterState: PENDING, ...payload };
    case REGISTER_5GLOCK_SUCCESS:
      return { ...state, lockRegisterState: SUCCESS, ...payload };
    case REGISTER_5GLOCK_FAILED:
      return { ...state, lockRegisterState: FAILED };
    case TEST1_DONE:
      return defaultState;
    default:
      return state;
  }
};
