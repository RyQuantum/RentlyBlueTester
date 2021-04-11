import axios from './axios';
import store from '../../redux';

const login = async (username, password) => {
  if (store.getState().auth.isKeyless) {
    const { data: { access_token, expires_in } } = await axios.post(`/api/agents`, {
      username,
      password,
      grant_type: 'password',
      factory: true
    });
    return { accessToken: access_token, expireTime: Date.now() + expires_in * 1000 + 100 };
  }
  const { data: { token: { accessToken, expiresAt } } } = await axios.post('/oakslock/token/login', {
    clientId: username,
    clientSecret: password
  });
  return { accessToken, expireTime: Date.now() + expiresAt * 1000 + 100, };
}

const getDeviceToken = async (mac) => {
  if (store.getState().auth.isKeyless) {
    const { data } = await axios.post(`/api/devices/getDeviceJwtToken`, {
      mac_address: mac
    });
    if (data.success == false) throw new Error(data.message);
    return data;
  }
  const { data } = await axios.get(`/oakslock/token/getDeviceJwtToken`, {
    params: {
      deviceMac: mac,
      role: 'ADMIN',
      validity: 1
    }
  });
  if (data.success == false) throw new Error(data.message);
  return data.token;
}

const addLockToDMS = async (deviceMac, deviceId) => {
  const params = { deviceMac, deviceId };
  let res;
  if (store.getState().auth.isKeyless) {
    res = await axios.post(`/api/devices/addLockToDMS`, params);
  } else {
    res = await axios.post(`/oakslock/device/addLockToDMS`, null, { params });
  }
  if (typeof res.data !== 'object' || res.data == null) throw new Error(res.data);
  return res.data;
}

const setDeviceTimezone = async (deviceMac, deviceToken) => {
  const timezone = store.getState().locks.libraryObj.timezoneString;
  const params = { deviceMac, timezone };
  let res;
  if (store.getState().auth.isKeyless) {
    res = await axios.post(`/api/devices/${deviceMac}/setDeviceTimezone`, params);
  } else {
    res = await axios.post('/oakslock/device/setDeviceTimezone', null, {
      headers: { 'Authorization': `Bearer ${deviceToken}` },
      params
    });
  }
  return res.data;
}

const updateDeviceBySuperAdmin = async (params) => {
  let res;
  if (store.getState().auth.isKeyless) {
    res = await axios.put(`/api/devices/${params.deviceMac}/updateDeviceBySuperAdmin`, params);
  } else {
    res = await axios.put('/oakslock/device/updateDeviceBySuperAdmin', null, { params });
  }
  return res.data;
}

const createAutoCode = async (lockMac, deviceToken) => {
  let res;
  const params = {
    name: 'test',
    createType: 'auto',
    type: 'OneTime',
    startAt: Date.now(),
    lockMac,
  };
  if (store.getState().auth.isKeyless) {
    res = await axios.post(`/api/devices/${lockMac}/createAutoCode`, params);
  } else {
    res = await axios.post('/oakslock/codes', null, {
      headers: { Authorization: `Bearer ${deviceToken}` },
      params
    });
  }
  return res.data;
}

const lockTestRecord = async (lockMac, params) => {
  let res;
  if (store.getState().auth.isKeyless) {
    res = await axios.post(`/api/devices/${lockMac}/lockTestRecord`, params);
  } else {
    res = await axios.post('/oakslock/lockTestRecord', null, { params });
  }
  return res.data;
}

const getMaxV3SerialNo = async (modelNum) => {
  let res;
  if (store.getState().auth.isKeyless) {
    res = await axios.get(`/api/devices/getMaxV3SerialNo`, { params: { modelNum } });
  } else {
    res = await axios.get('/oakslock/device/getMaxV3SerialNo', { params: { modelNum } });
  }
  return res.data;
}

const getLockDetails = async (lockMac, deviceToken) => {
  const url = 'https://' + store.getState().auth.url.replace('keyless', 'api');
  const res = await axios.get(`${url}/oakslock/locks/${lockMac}`, { headers: { Authorization: `Bearer ${deviceToken}` } });
  return res.data;
}

export const setAccessToken = (accessToken) => axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`

export default {
  login,
  getDeviceToken,
  addLockToDMS,
  setDeviceTimezone,
  updateDeviceBySuperAdmin,
  createAutoCode,
  getMaxV3SerialNo,
  lockTestRecord,
  getLockDetails,
};
