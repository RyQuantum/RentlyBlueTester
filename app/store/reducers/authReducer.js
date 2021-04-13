import { LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT_REQUEST, LOGOUT_SUCCESS, LOGOUT_FAILED } from '../actions/types';
import { setAccessToken } from '../../../services/API';

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
  const { type, payload, error } = action;
  switch (type) {
    case 'persist/REHYDRATE':
      return { ...state, ...payload };
    case LOGIN_REQUEST:
      return { ...state, isFetching: true, ...payload };
    case LOGIN_SUCCESS:
      setAccessToken(payload.accessToken);
      return {
        ...state,
        isLoggedIn: true,
        ...payload,
        error: null,
        isFetching: false,
      };
    case LOGIN_FAILED:
      return { ...state, ...defaultState, error };
    case LOGOUT_REQUEST:
      return { ...state, isLoggedIn: false };
    case LOGOUT_SUCCESS:
    case LOGOUT_FAILED:
      setAccessToken('');
      const { username, ...rest } = defaultState;
      return { ...state, ...rest, ...payload };
    default:
      return state;
  }
};
