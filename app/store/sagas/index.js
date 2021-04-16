import { takeEvery, takeLatest } from 'redux-saga/effects';

import * as types from '../actions/types';
import { loginAsync } from './authSaga';
import {
  verifyBroadcastInfoAsync,
  initializeLockAsync,
  testHallAsync,
  testRTCAsync,
  testDoorSensorAsync,
  testOfflineCodeAsync,
} from './testSaga';

export default function* rootSaga() {
  yield takeEvery(types.LOGIN_REQUEST, loginAsync);
  yield takeLatest(types.TEST_REQUEST, verifyBroadcastInfoAsync);
  yield takeEvery(types.TEST_BROADCAST_INFO_SUCCESS, initializeLockAsync);
  yield takeEvery(types.INIT_LOCK_SUCCESS, testRTCAsync);
  yield takeEvery(types.TEST_RTC_SUCCESS, testHallAsync);
  yield takeEvery(types.TEST_HALL_SUCCESS, testDoorSensorAsync);
  yield takeEvery(types.TEST_DOOR_SENSOR_SUCCESS, testOfflineCodeAsync);
}
