import * as types from './types';

export const requestLogin = ({ url, ...params }) => ({
  type: types.LOGIN_REQUEST,
  payload: { url, isKeyless: url.includes('keyless'), ...params },
});

export const onLoginSuccess = ({ ...params }) => ({
  type: types.LOGIN_SUCCESS,
  payload: { ...params },
});

export const onLoginFailed = error => ({ type: types.LOGOUT_FAILED, error });
