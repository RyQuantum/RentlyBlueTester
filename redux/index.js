import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import RNAsyncStorageFlipper from 'rn-async-storage-flipper';
// if (__DEV__) RNAsyncStorageFlipper(AsyncStorage);

import locks from './locks';
import auth from './auth';
import test from './test';
import test1 from './test1';
import test2 from './test2';
import rootSaga from './sagas';
const middlewares = [thunk];
const sagaMiddleware = createSagaMiddleware()
// const middlewares = []
// middlewares.push(sagaMiddleware);

// const middlewares = [];
const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const authPersistConfig = {
  key: 'auth',
  whitelist: ['url', 'username', 'batchNo', 'partnerId'],
  storage: AsyncStorage,
  timeout: null,
};

const lockPersistConfig = {
  key: 'locks',
  whitelist: ['rssiThreshold', 'checkEnabled', 'isDevelopmentMode'],
  storage: AsyncStorage,
  timeout: null,
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, auth),
  locks: persistReducer(lockPersistConfig, locks),
  test,
  test1,
  test2,
});

const store = createStore(
  rootReducer,
  applyMiddleware(...middlewares),
  // composeEnhancer(applyMiddleware(...middlewares)),
);

// sagaMiddleware.run(rootSaga);

export const persistor = persistStore(store);
export default store;
