import { put, select } from 'redux-saga/effects';

import {
  verifyBroadcastInfo,
  verifyBroadcastInfoSuccess,
  verifyBroadcastInfoFailed,
  initializeLock,
  initializeLockSuccess,
  initializeLockFailed,
} from '../actions/testActions';

export function* verifyBroadcastInfoAsync({ payload }) {
  const { lockMac, modelNum, hardwareVer, firmwareVer, rssi, battery } = payload.lockObj;
  yield put(verifyBroadcastInfo({ lockMac, modelNum, hardwareVer, firmwareVer, rssi, battery }));
  if (modelNum === 2 && hardwareVer === 3 && firmwareVer === 5 && rssi < 0 && battery > 0) {
    return yield put(verifyBroadcastInfoSuccess());
  }
  //TODO divide different errors
  yield put(verifyBroadcastInfoFailed(new Error('Broadcast info error')));
}

export function* initializeLockAsync() {
  yield put(initializeLock());
  const { test: { lockObj } } = yield select();
  try {
    const { success, message } = yield lockObj.addAdministrator();
    if (success) {
      yield put(initializeLockSuccess());
    }
  } catch (error) {
    yield put(initializeLockFailed(error));
  }
}
