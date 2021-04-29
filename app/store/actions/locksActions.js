import * as types from './types';

export const foundLock = payload => ({
  type: types.FIND_LOCK,
  payload,
});

export const updateLocks = payload => ({
  type: types.UPDATE_LOCKS,
  payload,
});

export const updateCriteria = payload => ({
  type: types.UPDATE_CRITERIA,
  payload,
});

export const setIndex = payload => ({
  type: types.SET_INDEX,
  payload,
});

export const setEnabled = payload => ({
  type: types.SET_ENABLED,
  payload,
});

export const setThreshold = payload => ({
  type: types.SET_THRESHOLD,
  payload,
});

export const getMaximumSerialNoRequest = payload => ({
  type: types.GET_MAX_SERIAL_NUM_PENDING,
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
