import * as types from './types';

export const requestLogin = (url, ...params) => ({
  type: types.LOGIN_REQUEST,
  isKeyless: url.includes('keyless') ? true : false,
  url,
  ...params,
});

export const onLoginSuccess = (...params) => ({
  type: types.LOGIN_SUCCESS,
  ...params,
});

export const onLoginFailed = error => ({ type: types.LOGOUT_FAILED, error });
