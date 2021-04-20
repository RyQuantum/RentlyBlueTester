import { put, select } from 'redux-saga/effects';

import { getMaximumSerialNoFailed, getMaximumSerialNoSuccess, updateLocks } from "../actions/locksActions";
import API from "../../services/API";

export function* updateLockAsync({ payload }) {
  let { locks: { touchedLocks, settingLocks, nonSettingLocks, libraryObj } } = yield select();
  const { lockMac, touch, settingMode, battery, rssi } = payload;
  const index = touchedLocks.findIndex(lock => lock.lockMac === lockMac);
  if (touch === false) {
    touchedLocks = touchedLocks.filter(lock => lock.lockMac !== lockMac);
    settingLocks = settingLocks.filter(lock => lock.lockMac !== lockMac);
    nonSettingLocks = nonSettingLocks.filter(lock => lock.lockMac !== lockMac);
  } else if (index !== -1) {
    Object.assign(touchedLocks[index], { touch, settingMode, battery, rssi });
    settingLocks = touchedLocks.filter(lock => lock.settingMode === true);
    nonSettingLocks = touchedLocks.filter(lock => lock.settingMode === false);
  } else {
    const lockObject = libraryObj.createDevice(payload);
    lockObject.refreshToken();
    touchedLocks.push(lockObject);
    settingLocks = touchedLocks.filter(lock => lock.settingMode === true);
    nonSettingLocks = touchedLocks.filter(lock => lock.settingMode === false);
  }
  return yield put(updateLocks({ touchedLocks, settingLocks, nonSettingLocks }));
}

export function* getMaximumSerialNoAsync({ payload }) {
  try {
    const res = yield API.getMaxV3SerialNo(payload);
    yield put(getMaximumSerialNoSuccess(res.max));
  } catch (error) {
    yield put(getMaximumSerialNoFailed(error));
  }
};
