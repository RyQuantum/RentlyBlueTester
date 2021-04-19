import { put, call } from 'redux-saga/effects';

import * as authActions from '../actions/authActions';
import { setBaseURL } from '../../services/API/axios';
import API from '../../services/API';

export function* loginAsync({ payload }) {
  setBaseURL(payload.url);
  try {
    const { accessToken, expireTime } = yield call(
      API.login,
      payload.username,
      payload.password,
    );
    yield put(
      authActions.loginSuccess({ accessToken, expireTime, ...payload }),
    );
  } catch (error) {
    yield put(authActions.loginFailed(error));
  }
}
