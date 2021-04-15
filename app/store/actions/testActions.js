import * as types from './types';

export const requestTest = lockObj => ({
  type: types.TEST_REQUEST,
  payload: { lockObj },
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
