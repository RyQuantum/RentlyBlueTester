import * as types from './types';

export const requestLogin = ({ url, ...params }) => ({
  type: types.LOGIN_REQUEST,
  payload: { url, isKeyless: url.includes('keyless'), ...params },
});

export const loginSuccess = ({ ...params }) => ({
  type: types.LOGIN_SUCCESS,
  payload: params,
});

export const loginFailed = error => ({
  type: types.LOGIN_FAILED,
  error,
});

export const requestLogout = () => ({
  type: types.LOGOUT_REQUEST,
});
