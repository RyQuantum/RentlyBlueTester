import * as types from './types';

export const foundLock = lock => ({
  type: types.UPDATE_LOCK,
  payload: { lock },
});
