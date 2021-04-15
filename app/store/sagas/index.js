import { takeEvery, takeLatest } from 'redux-saga/effects';

import * as types from '../actions/types';
import { loginAsync } from './authSaga';
import { initializeLockAsync, verifyBroadcastInfoAsync } from './testSaga';

export default function* rootSaga() {
  yield takeEvery(types.LOGIN_REQUEST, loginAsync);
  yield takeLatest(types.TEST_REQUEST, verifyBroadcastInfoAsync);
  yield takeEvery(types.TEST_BROADCAST_INFO_SUCCESS, initializeLockAsync);
}
