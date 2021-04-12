import { Alert } from 'react-native';
import API, { setAccessToken } from '../services/API';
import { strings } from '../app/utils/i18n';
import { setBaseURL } from '../services/API/axios';

const LOGIN_REQUEST = 'LOGIN_REQUEST';
const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const LOGIN_FAILED = 'LOGIN_FAILED';
const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
const LOGOUT_FAILED = 'LOGOUT_FAILED';

export const login = (url, username, password, batchNo, language, partnerId, isB2b, localServerIp) => {
  setBaseURL(url);
  return async (dispatch, getState) => {
    const res = await getState().locks.libraryObj._lockController._blePlugin.manager.state();
    if (res === 'PoweredOff') return Alert.alert(strings('login.turnOnBluetooth'));
    try {
      dispatch({ type: LOGIN_REQUEST, payload: { url, isKeyless: url.includes('keyless') ? true : false }});
      const { accessToken, expireTime } = await API.login(username, password);
      dispatch({
        type: LOGIN_SUCCESS,
        payload: { accessToken, username, password, batchNo, language, partnerId, isB2b, localServerIp, expireTime }
      });
    } catch (error) {
      dispatch({type: LOGIN_FAILED, error});
    }
  };
};

export const logout = () => {
  return async (dispatch, getState) => {
    try {
      dispatch({type: LOGOUT_REQUEST});
      const {auth: {accessToken}} = getState();
      if (!accessToken) {
        throw new Error(strings('login.accessTokenError'));
      }
      dispatch({ type: LOGOUT_SUCCESS, payload: { isKeyless: false }});
    } catch (error) {
      dispatch({type: LOGOUT_FAILED, error});
    }
  };
};

const defaultState = {
  url: '',
  isKeyless: false,
  username: '',
  password: '',
  language: 'en',
  partnerId: 0,
  isB2b: false,
  batchNo: '',
  isLoggedIn: false,
  accessToken: '',
  expireTime: 0,
  error: null,
  isFetching: false,
  localServerIp: null,
};

export default (state = defaultState, action) => {
  const {type, payload, error} = action;
  switch (type) {
    case 'persist/REHYDRATE':
      return {...state, ...payload};
    case LOGIN_REQUEST:
      return { ...state, isFetching: true, ...payload };
    case LOGIN_SUCCESS:
      setAccessToken(payload.accessToken);
      return {...state, isLoggedIn: true, ...payload, error: null, isFetching: false};
    case LOGIN_FAILED:
      return {...state, ...defaultState, error};
    case LOGOUT_REQUEST:
      return {...state, isLoggedIn: false};
    case LOGOUT_SUCCESS:
    case LOGOUT_FAILED:
      setAccessToken('');
      const {username, ...rest} = defaultState;
      return { ...state, ...rest, ...payload };
    default:
      return state;
  }
};
