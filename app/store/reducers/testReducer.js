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
  INIT_LOCK_PENDING,
  INIT_LOCK_SUCCESS,
  INIT_LOCK_FAILED,
} from '../actions/types';

const defaultState = {
  lockObj: null,
  testState: NOT_STARTED,
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
  testTouchButtonState: NOT_STARTED,
  touchButton: Array(10).fill(false),
  testNfcChipState: NOT_STARTED,
  fobNumber: '',
  testAutoLockState: NOT_STARTED,
  testDoorSensorState: NOT_STARTED,
  testOfflineCodeState: NOT_STARTED,
  code: '',
  uploadSerialNoState: NOT_STARTED,
  serialNo: '',
  error: '',
};

export default (state = defaultState, action) => {
  const { type, payload, error } = action;
  switch (type) {
    case TEST_REQUEST:
      return { ...state, testState: PENDING, ...payload };
    // case TEST_SUCCESS:
    //   return { ...state, testState: SUCCESS };
    case TEST_FAILED:
      return { ...state, testState: FAILED, error };
    case TEST_BROADCAST_INFO_PENDING: {
      const { lockMac, modelNum, hardwareVer, firmwareVer, rssi, battery } = payload;
      return { ...state, testBroadcastState: PENDING, broadcastInfo: { lockMac, modelNum, hardwareVer, firmwareVer, rssi, battery } };
    }
    case TEST_BROADCAST_INFO_SUCCESS:
      return { ...state, testBroadcastState: SUCCESS };
    case TEST_BROADCAST_INFO_FAILED:
      return { ...state, testBroadcastState: FAILED, error };
    case INIT_LOCK_PENDING:
      return { ...state, initLockState: PENDING };
    case INIT_LOCK_SUCCESS:
      return { ...state, initLockState: SUCCESS };
    case INIT_LOCK_FAILED:
      return { ...state, initLockState: FAILED, error };
    // case TEST_DONE:
    //   return defaultState;
    default:
      return state;
  }
};
