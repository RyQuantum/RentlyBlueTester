import { Alert } from 'react-native';
import { select, put, call } from 'redux-saga/effects';

import * as loginActions from '../actions/authAction';
import { setBaseURL } from '../../../services/API/axios';
import { strings } from '../../utils/i18n';
import API from '../../../services/API';

export function* loginAsync(url, ...params) {
  setBaseURL(url);
  // const state = yield select();
  // const bleState = yield state.locks.libraryObj._lockController._blePlugin.manager.state();
  // if (bleState === 'PoweredOff') return Alert.alert(strings('login.turnOnBluetooth'))
  try {
    // yield put(loginActions.requestLogin(url));
    const { assesToken, expireTime } = yield call(API.login, params.username, params.password);
    yield put(loginActions.onLoginSuccess(assesToken, expireTime, ...params));
  } catch (error) {
    yield put(loginActions.onLoginFailed(error));
  }
}
