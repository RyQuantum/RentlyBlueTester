import axios from 'axios';
import OaksBleLockLibrary from 'blelocklibrary/OaksBleLockLibrary'
import store from '../../app/store';
import { login, logout } from '../../redux/auth';

const instance = axios.create({ timeout: 20000 });

export const setBaseURL = env => {
  let protocol = 'https://', env0 = env;
  switch (env.slice(0,3)) {
    case '192':
      protocol = 'http://';
      break;
    case 'key':
      env0 = env.replace(/keyless./, 'api.');
      break;
    case 'app':
      env0 = 'api.welcomeoaks.com';
      break;
  }
  OaksBleLockLibrary.setHostUrl(protocol + env0 + '/oakslock/');
  instance.defaults.baseURL = protocol + env;
};

instance.interceptors.request.use(async (config) => {
  const { auth: { accessToken } } = store.getState();
  const newConfig = {
    ...config,
    headers: {
      ...config.headers,
    }
  };
  console.log(`app:[${newConfig.method}] ${newConfig.baseURL + newConfig.url} params: ${JSON.stringify(newConfig.params)} data: ${JSON.stringify(newConfig.data)}`);
  return newConfig;
});

const responseError = async (error) => {
  const { response: { status } = {}, config = {} } = error;
  const { url, isRetry, isAutoLogin } = config;
  const { dispatch, getState } = store;
  const { auth: { username, password } = {} } = getState();
  const isAuthError = (status === 401);
  const isLogin = url.endsWith('oakslock/token/login');
  const isLogout = url.endsWith('rently/api/logout');
  if (
    isAuthError &&
    !isLogin &&
    !isLogout &&
    username &&
    password &&
    !isRetry
  ) {
    await dispatch(login(username, password));
    return instance({ ...config, isRetry: true })
  } else if (
    isAuthError &&
    isAutoLogin
  ) {
    dispatch(logout());
  }
  return Promise.reject(error);
};

instance.interceptors.response.use(
  (response) => {
    // console.log('response:', response);
    const {data = {}} = response;
    const {success = true, message} = data;
    if (!success) {
      return Promise.reject(new Error(message));
    }
    return response;
  },
  responseError
);

export default instance;
