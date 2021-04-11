import { put, call, take,fork } from 'redux-saga/effects';
import { takeEvery, takeLatest } from 'redux-saga/effects';

export const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function* incrementAsync() {
  console.log('get!!!');
  // yield call(delay, 1000);
  // yield put({ type: 'INCREMENT' });
}

export default function* rootSaga() {
  console.log(123);
  yield* takeEvery('INCREMENT_ASYNC', incrementAsync);
}
