import * as types from './types';

export const foundLock = payload => ({
  type: types.UPDATE_LOCK,
  payload,
});

export const updateLocks = payload => ({
  type: types.UPDATE_LOCKS,
  payload,
});
