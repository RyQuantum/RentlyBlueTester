import { Alert, AlertButton, AlertOptions } from 'react-native';
import axios from 'axios';
import { strings } from './i18n';

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const parseTimeStamp = (timestamp: string) => {
  const str = parseInt(timestamp, 16).toString(2).padStart(32, '0');
  const year = 2000 + parseInt(str.slice(0, 6), 2);
  const mon = parseInt(str.slice(6, 10), 2);
  const day = parseInt(str.slice(10, 15), 2);
  const hour = parseInt(str.slice(15, 20), 2);
  const min = parseInt(str.slice(20, 26), 2);
  const sec = parseInt(str.slice(26, 32), 2);

  return new Date(year, mon, day, hour, min, sec);
};

export const postToLocalServer = async (ip: string, serial_number: string) => {
  let success = false;
  const postRequest = async (timeout: number) => {
    await axios.post('http://' + ip + ':6379/lock', { serial_number }, { timeout });
    success = true;
  };
  const promise1 = delay(0).then(async () => await postRequest(11000));
  const promise2 = delay(1000).then(async () => success || await postRequest(10000));
  const promise3 = delay(2000).then(async () => success || await postRequest(9000));
  const promise4 = delay(3000).then(async () => success || await postRequest(8000));
  const promise5 = delay(4000).then(async () => success || await postRequest(7000));
  const timeout = delay(10000).then(() => {throw new Error(strings('Test.uploadLocalServerTimeout'))});
  await Promise.race([promise1, promise2, promise3, promise4, promise5, timeout]);
};

export const Alert_alertIOS = (
  title: string,
  message?: string,
  buttons?: AlertButton[],
  options?: AlertOptions,
) => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      Alert.alert(title, message, buttons, options);
    });
  });
};
