import * as types from './types';

export const requestTest = lockObj => ({
  type: types.TEST_REQUEST,
  payload: lockObj,
});

export const scanBroadcast = () => ({
  type: types.SCAN_BROADCAST,
});

export const verifyBroadcastInfo = payload => ({
  type: types.TEST_BROADCAST_INFO_PENDING,
  payload,
});

export const verifyBroadcastInfoSuccess = () => ({
  type: types.TEST_BROADCAST_INFO_SUCCESS,
});

export const verifyBroadcastInfoFailed = error => ({
  type: types.TEST_BROADCAST_INFO_FAILED,
  error,
});

export const initializeLock = () => ({
  type: types.INIT_LOCK_PENDING,
});

export const initializeLockSuccess = () => ({
  type: types.INIT_LOCK_SUCCESS,
});

export const initializeLockFailed = error => ({
  type: types.INIT_LOCK_FAILED,
  error,
});

export const testRTC = () => ({
  type: types.TEST_RTC_PENDING,
});

export const testRTCSuccess = () => ({
  type: types.TEST_RTC_SUCCESS,
});

export const testRTCFailed = error => ({
  type: types.TEST_RTC_FAILED,
  error,
});

export const testHall = () => ({
  type: types.TEST_HALL_PENDING,
});

export const testHallSuccess = () => ({
  type: types.TEST_HALL_SUCCESS,
});

export const testHallFailed = error => ({
  type: types.TEST_HALL_FAILED,
  error,
});

export const testDoorSensor = () => ({
  type: types.TEST_DOOR_SENSOR_PENDING,
});

export const testDoorSensorSuccess = () => ({
  type: types.TEST_DOOR_SENSOR_SUCCESS,
});

export const testDoorSensorFailed = error => ({
  type: types.TEST_DOOR_SENSOR_FAILED,
  error,
});

export const testOfflineCode = () => ({
  type: types.TEST_OFFLINE_CODE_PENDING,
});

export const gotOfflineCode = code => ({
  type: types.GOT_OFFLINE_CODE,
  payload: code,
});

export const testOfflineCodeSuccess = () => ({
  type: types.TEST_OFFLINE_CODE_SUCCESS,
});

export const testOfflineCodeFailed = error => ({
  type: types.TEST_OFFLINE_CODE_FAILED,
  error,
});

export const testAutoLock = () => ({
  type: types.TEST_AUTO_LOCK_PENDING,
});

export const testAutoLockSuccess = () => ({
  type: types.TEST_AUTO_LOCK_SUCCESS,
});

export const testAutoLockFailed = error => ({
  type: types.TEST_AUTO_LOCK_FAILED,
  error,
});

export const uploadSerialNo = serialNo => ({
  type: types.UPLOAD_SERIAL_N0_PENDING,
  payload: serialNo,
});

export const uploadSerialNoSuccess = () => ({
  type: types.UPLOAD_SERIAL_N0_SUCCESS,
});

export const uploadSerialNoFailed = error => ({
  type: types.UPLOAD_SERIAL_N0_FAILED,
  error,
});
