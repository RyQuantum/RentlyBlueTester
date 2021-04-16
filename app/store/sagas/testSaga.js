import { put, select } from 'redux-saga/effects';

import {
  verifyBroadcastInfo,
  verifyBroadcastInfoSuccess,
  verifyBroadcastInfoFailed,
  initializeLock,
  initializeLockSuccess,
  initializeLockFailed,
  testRTC,
  testRTCSuccess,
  testRTCFailed,
  testHall,
  testHallSuccess,
  testHallFailed,
  testDoorSensor,
  testDoorSensorSuccess,
  testDoorSensorFailed,
  testOfflineCodeFailed,
  testOfflineCodeSuccess, testOfflineCode,
} from '../actions/testActions';
import API from '../../../services/API';
import { delay, parseTimeStamp } from '../../utils/others';

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
    yield lockObj.addAdministrator();
    yield put(initializeLockSuccess());
  } catch (error) {
    yield put(initializeLockFailed(error));
  }
}

export function* testRTCAsync() {
  yield put(testRTC());
  const { test: { lockObj } } = yield select();
  try {
    const { timestamp } = yield lockObj.getLockTime();
    yield delay(1500);
    const { timestamp: timestamp2 } = yield lockObj.getLockTime();
    const diff = parseTimeStamp(timestamp2) - parseTimeStamp(timestamp);
    if (diff < 0 || diff > 5000) {
      throw new Error('RTC error');
    }
    yield put(testRTCSuccess());
  } catch (error) {
    yield put(testRTCFailed(error));
  }
}

export function* testHallAsync() {
  yield put(testHall());
  const { test: { lockObj } } = yield select();
  try {
    yield lockObj.unlock();
    yield lockObj.lock();
    yield put(testHallSuccess());
  } catch (error) {
    yield put(testHallFailed(error));
  }
}

export function* testDoorSensorAsync() {
  yield put(testDoorSensor());
  const { test: { lockObj } } = yield select();
  try {
    const { doorSensorEnabled } = yield lockObj.isDoorSensorEnabled();
    if (!doorSensorEnabled) throw new Error('Door sensor is not enabled');
    yield put(testDoorSensorSuccess());
  } catch (error) {
    yield put(testDoorSensorFailed(error));
  }
}

export function* testOfflineCodeAsync() {
  yield put(testOfflineCode());
  const { test: { lockObj: { lockMac, deviceAuthToken } } } = yield select();
  try {
    const { code } = yield API.createAutoCode(lockMac, deviceAuthToken);
    yield put(testOfflineCodeSuccess(code));
  } catch (error) {
    yield put(testOfflineCodeFailed(error));
  }
}
