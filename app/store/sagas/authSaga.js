import { put, call } from 'redux-saga/effects';

import * as loginActions from '../actions/authAction';
import { setBaseURL } from '../../../services/API/axios';
import API from '../../../services/API';

export function* loginAsync({ payload }) {
  setBaseURL(payload.url);
  try {
    const { accessToken, expireTime } = yield call(
      API.login,
      payload.username,
      payload.password,
    );
    yield put(
      loginActions.onLoginSuccess({ accessToken, expireTime, ...payload }),
    );
  } catch (error) {
    yield put(loginActions.onLoginFailed(error));
  }
}
