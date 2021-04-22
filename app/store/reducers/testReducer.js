import {
  NOT_STARTED,
  PENDING,
  SUCCESS,
  FAILED,
  TEST_REQUEST,
  TEST_SUCCESS,
  TEST_FAILED,
  TEST_BROADCAST_INFO_PENDING,
  TEST_BROADCAST_INFO_SUCCESS,
  TEST_BROADCAST_INFO_FAILED,
  ADD_LOCK_TO_DMS_PENDING,
  ADD_LOCK_TO_DMS_SUCCESS,
  ADD_LOCK_TO_DMS_FAILED,
  INIT_LOCK_PENDING,
  INIT_LOCK_SUCCESS,
  INIT_LOCK_FAILED,
  TEST_RTC_PENDING,
  TEST_RTC_SUCCESS,
  TEST_RTC_FAILED,
  TEST_HALL_PENDING,
  TEST_HALL_SUCCESS,
  TEST_HALL_FAILED,
  TEST_DOOR_SENSOR_PENDING,
  TEST_DOOR_SENSOR_SUCCESS,
  TEST_DOOR_SENSOR_FAILED,
  TEST_TOUCH_KEY_PENDING,
  TEST_TOUCH_KEY_SUCCESS,
  TEST_TOUCH_KEY_FAILED,
  TEST_NFC_CHIP_PENDING,
  TEST_NFC_CHIP_SUCCESS,
  TEST_NFC_CHIP_FAILED,
  TEST_AUTO_LOCK_PENDING,
  TEST_AUTO_LOCK_SUCCESS,
  TEST_AUTO_LOCK_FAILED,
  TEST_OFFLINE_CODE_FAILED,
  GOT_OFFLINE_CODE,
  TEST_OFFLINE_CODE_SUCCESS,
  TEST_OFFLINE_CODE_PENDING,
  UPLOAD_SERIAL_N0_PENDING,
  UPLOAD_SERIAL_N0_SUCCESS,
  UPLOAD_SERIAL_N0_FAILED,
  END_TEST,
} from '../actions/types';

const defaultState = {
  lockObj: null,
  testState: NOT_STARTED,
  registerLockToDMSState: NOT_STARTED,
  testBroadcastState: NOT_STARTED,
  broadcastInfo: {
    lockMac: '',
    modelNum: 0,
    hardwareVer: 0,
    firmwareVer: 0,
    rssi: 0,
    battery: 0,
  },
  initLockState: NOT_STARTED,
  testRTCState: NOT_STARTED,
  testHallState: NOT_STARTED,
  testDoorSensorState: NOT_STARTED,
  testTouchKeyState: NOT_STARTED,
  // touchButton: Array(10).fill(false),
  testNfcChipState: NOT_STARTED,
  fobNumber: '',
  testAutoLockState: NOT_STARTED,
  testOfflineCodeState: NOT_STARTED,
  code: '',
  uploadSerialNoState: NOT_STARTED,
  serialNo: '',
  error: null,
};

export default (state = defaultState, action) => {
  const { type, payload, error } = action;
  switch (type) {
    case TEST_REQUEST:
      return { ...state, testState: PENDING, lockObj: payload };
    case TEST_SUCCESS:
      return { ...state, testState: SUCCESS };
    // case TEST_FAILED:
    //   return { ...state, testState: FAILED, error };
    case TEST_BROADCAST_INFO_PENDING:
      return { ...state, testBroadcastState: PENDING, broadcastInfo: payload };
    case TEST_BROADCAST_INFO_SUCCESS:
      return { ...state, testBroadcastState: SUCCESS, error: null };
    case TEST_BROADCAST_INFO_FAILED:
      return { ...state, testBroadcastState: FAILED, error };
    case ADD_LOCK_TO_DMS_PENDING:
      return { ...state, registerLockToDMSState: PENDING };
    case ADD_LOCK_TO_DMS_SUCCESS:
      return { ...state, registerLockToDMSState: SUCCESS, error: null };
    case ADD_LOCK_TO_DMS_FAILED:
      return { ...state, registerLockToDMSState: FAILED, error };
    case INIT_LOCK_PENDING:
      return { ...state, initLockState: PENDING };
    case INIT_LOCK_SUCCESS:
      return { ...state, initLockState: SUCCESS, error: null };
    case INIT_LOCK_FAILED:
      return { ...state, initLockState: FAILED, error };
    case TEST_RTC_PENDING:
      return { ...state, testRTCState: PENDING };
    case TEST_RTC_SUCCESS:
      return { ...state, testRTCState: SUCCESS, error: null };
    case TEST_RTC_FAILED:
      return { ...state, testRTCState: FAILED, error };
    case TEST_HALL_PENDING:
      return { ...state, testHallState: PENDING };
    case TEST_HALL_SUCCESS:
      return { ...state, testHallState: SUCCESS, error: null };
    case TEST_HALL_FAILED:
      return { ...state, testHallState: FAILED, error };
    case TEST_DOOR_SENSOR_PENDING:
      return { ...state, testDoorSensorState: PENDING };
    case TEST_DOOR_SENSOR_SUCCESS:
      return { ...state, testDoorSensorState: SUCCESS, error: null };
    case TEST_DOOR_SENSOR_FAILED:
      return { ...state, testDoorSensorState: FAILED, error };
    case TEST_TOUCH_KEY_PENDING:
      return { ...state, testTouchKeyState: PENDING };
    case TEST_TOUCH_KEY_SUCCESS:
      return { ...state, testTouchKeyState: SUCCESS, error: null };
    case TEST_TOUCH_KEY_FAILED:
      return { ...state, testTouchKeyState: FAILED, error };
    case TEST_NFC_CHIP_PENDING:
      return { ...state, testNfcChipState: PENDING };
    case TEST_NFC_CHIP_SUCCESS:
      return { ...state, testNfcChipState: SUCCESS, fobNumber: payload, error: null };
    case TEST_NFC_CHIP_FAILED:
      return { ...state, testNfcChipState: FAILED, error };
    case TEST_AUTO_LOCK_PENDING:
      return { ...state, testAutoLockState: PENDING };
    case TEST_AUTO_LOCK_SUCCESS:
      return { ...state, testAutoLockState: SUCCESS, error: null };
    case TEST_AUTO_LOCK_FAILED:
      return { ...state, testAutoLockState: FAILED, error };
    case TEST_OFFLINE_CODE_PENDING:
      return { ...state, testOfflineCodeState: PENDING };
    case GOT_OFFLINE_CODE:
      return { ...state, code: payload };
    case TEST_OFFLINE_CODE_SUCCESS:
      return { ...state, testOfflineCodeState: SUCCESS, error: null };
    case TEST_OFFLINE_CODE_FAILED:
      return { ...state, testOfflineCodeState: FAILED, error };
    case UPLOAD_SERIAL_N0_PENDING:
      return { ...state, uploadSerialNoState: PENDING, serialNo: payload, error: null };
    case UPLOAD_SERIAL_N0_SUCCESS:
      return { ...state, uploadSerialNoState: SUCCESS, error: null };
    case UPLOAD_SERIAL_N0_FAILED:
      return { ...state, uploadSerialNoState: FAILED, error };
    // case END_TEST_CONFIRM:
    //   return defaultState;
    // case END_TEST_REQUEST:
    // case END_TEST_CANCEL:
    case END_TEST:
      return defaultState;
    default:
      return state;
  }
};
