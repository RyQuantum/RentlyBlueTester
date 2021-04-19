import axios from 'axios';
import OaksBleLockLibrary from 'blelocklibrary/OaksBleLockLibrary';
// import store from '../../store';

const instance = axios.create({ timeout: 20000 });

export const setBaseURL = env => {
  let protocol = 'https://', env0 = env;
  switch (env.slice(0, 3)) {
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
  // const { auth: { accessToken } } = store.getState();
  const newConfig = {
    ...config,
    headers: {
      ...config.headers,
    },
  };
  console.log(`app:[${newConfig.method}] ${newConfig.baseURL + newConfig.url} params: ${JSON.stringify(newConfig.params)} data: ${JSON.stringify(newConfig.data)}`);
  return newConfig;
});

//TODO responseError

export default instance;
