import { put } from 'redux-saga/effects';
import axios from 'axios';

import { strings } from '../../utils/i18n';
import * as authActions from '../actions/authActions';
import { setBaseURL } from '../../services/API/axios';
import API from '../../services/API';

export function* loginAsync({ payload }) {
  setBaseURL(payload.url);
  try {
    const req1 = API.login(payload.username, payload.password);
    let req2 = { success: true };
    if (payload.localServerIp) {
      req2 = axios.get('http://' + payload.localServerIp + ':6379', { timeout: 3000 })
        .catch(error => {
          throw new Error(strings('login.localServerError') + ': ' + error.message);
        });
    }
    const [{ accessToken, expireTime }] = yield Promise.all([req1, req2]);
    yield put(
      authActions.loginSuccess({ accessToken, expireTime, ...payload }),
    );
  } catch (error) {
    yield put(authActions.loginFailed(error));
  }
}
