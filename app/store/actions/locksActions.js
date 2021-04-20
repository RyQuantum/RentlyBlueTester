import * as types from './types';

export const foundLock = payload => ({
  type: types.UPDATE_LOCK,
  payload,
});

export const updateLocks = payload => ({
  type: types.UPDATE_LOCKS,
  payload,
});

export const setEnabled = () => ({
  type: types.SET_ENABLED,
});

export const setThreshold = payload => ({
  type: types.SET_THRESHOLD,
  payload,
});

export const getMaximumSerialNoRequest = payload => ({
  type: types.GET_MAX_SERIAL_NUM_REQUEST,
  payload,
});

export const getMaximumSerialNoSuccess = payload => ({
  type: types.GET_MAX_SERIAL_NUM_SUCCESS,
  payload,
});

export const getMaximumSerialNoFailed = error => ({
  type: types.GET_MAX_SERIAL_NUM_FAILED,
  error,
});
