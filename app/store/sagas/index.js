import { takeEvery, take } from 'redux-saga/effects';

import * as types from '../actions/types';
import { loginAsync } from './authSaga';

export default function* rootSaga() {
  yield takeEvery(types.LOGIN_REQUEST, loginAsync);
}
