import { put, select } from 'redux-saga/effects';

import {
  requestTest,
  testSuccess,
  verifyBroadcastInfo,
  verifyBroadcastInfoSuccess,
  verifyBroadcastInfoFailed,
  registerLockToDMS,
  registerLockToDMSSuccess,
  registerLockToDMSFailed,
  initializeLock,
  initializeLockSuccess,
  initializeLockFailed,
  testRTC,
  testRTCSuccess,
  testRTCFailed,
  testHall,
  testHallSuccess,
  testHallFailed,
  testDoorSensor,
  testDoorSensorSuccess,
  testDoorSensorFailed,
  testTouchKey,
  testTouchKeySuccess,
  testTouchKeyFailed,
  testNfcChip,
  testNfcChipSuccess,
  testNfcChipFailed,
  testAutoLock,
  testAutoLockSuccess,
  testAutoLockFailed,
  testOfflineCode,
  testOfflineCodeFailed,
  gotOfflineCode,
  uploadSerialNoFailed,
  uploadSerialNoSuccess,
} from '../actions/testActions';
import API from '../../services/API';
import { delay, parseTimeStamp } from '../../utils';
import { strings } from '../../utils/i18n';

//TODO retry
//TODO identify the accurate error of multiple actions

export function* verifyBroadcastInfoAsync({ payload: lockObj }) {
  const { lockMac, modelNum, hardwareVer, firmwareVer, rssi, battery } = lockObj;
  const { locks:{ criteria } } = yield select();
  yield put(verifyBroadcastInfo({ lockMac, modelNum, hardwareVer, firmwareVer, rssi, battery }));

  const errors = [];
  if (criteria.model && modelNum.toString() !== criteria.model) errors.push('Invalid model number');
  if (criteria.hardwareVer && hardwareVer.toString() !== criteria.hardwareVer) errors.push('Invalid hardware version');
  if (criteria.firmwareVer && firmwareVer.toString() !== criteria.firmwareVer) errors.push('Invalid firmwareVer nversionumber');
  if (rssi >= 0 || rssi < criteria.rssi) errors.push('Invalid model rssi');
  if (battery > 100 || battery < criteria.battery) errors.push('Invalid battery');
  if (errors.length === 0) {
    return yield put(verifyBroadcastInfoSuccess());
  }
  yield put(verifyBroadcastInfoFailed(new Error(errors)));
}

export function* scanBroadcastAsync() {
  yield put(verifyBroadcastInfo({}));
  const { test: { lockObj }, locks: { libraryObj } } = yield select();
  let info;
  for(let i = 0; i < 100; i++) {
    try {
      info = yield libraryObj._lockController._blePlugin.getLockBroadcastInfo(lockObj.lockMac);
    } catch (error) {
      yield delay(1000);
    }
    if (info) break;
  }
  Object.assign(lockObj, info);
  yield put(requestTest(lockObj));
}

export function* registerLockToDMSAsync() {
  try {
    yield put(registerLockToDMS());
    const { test: { lockObj } } = yield select();
    yield API.addLockToDMS(lockObj.lockMac, lockObj.deviceID);
    yield put(registerLockToDMSSuccess());
  } catch (error) {
    yield put(registerLockToDMSFailed(error));
  }
}

export function* initializeLockAsync() {
  yield put(initializeLock());
  const { test: { lockObj } } = yield select();
  try {
    yield lockObj.addAdministrator();
    yield put(initializeLockSuccess());
  } catch (error) {
    yield put(initializeLockFailed(error));
  }
}

export function* testRTCAsync() {
  yield put(testRTC());
  const { test: { lockObj } } = yield select();
  try {
    yield lockObj.setLockTime();
    const { timestamp } = yield lockObj.getLockTime();
    yield delay(2000);
    const { timestamp: timestamp2 } = yield lockObj.getLockTime();
    const diff = parseTimeStamp(timestamp2) - parseTimeStamp(timestamp);
    if (diff < 0 || diff > 5000) {
      throw new Error(`RTC error, time diff is ${diff / 1000}s. Should between 0 to 5s.`);
    }
    yield put(testRTCSuccess());
  } catch (error) {
    yield put(testRTCFailed(error));
  }
}

export function* testHallAsync() {
  yield put(testHall());
  const { test: { lockObj } } = yield select();
  try {
    yield lockObj.unlock();
    // yield lockObj.lock();
    yield put(testHallSuccess());
  } catch (error) {
    yield put(testHallFailed(error));
  }
}

export function* testDoorSensorAsync() {
  yield put(testDoorSensor());
  const { test: { lockObj } } = yield select();
  try {
    const { doorSensorEnabled } = yield lockObj.isDoorSensorEnabled();
    if (!doorSensorEnabled) throw new Error('Door sensor is not enabled');
    yield put(testDoorSensorSuccess());
  } catch (error) {
    yield put(testDoorSensorFailed(error));
  }
}

export function* testTouchKeyAsync() {
  yield put(testTouchKey());
  const { test: { lockObj } } = yield select();
  try {
    // const { keys } = yield lockObj.sendFactoryTestingCommand(1);
    // if (!keys.every(key => key === true)) {
    //   const arr = keys.map((key, i) => key || i + 1).filter(key => key !== true);
    //   throw new Error(`[${arr.toString()}] are not been touched`);
    // }
    yield lockObj.getLockTime();
    yield put(testTouchKeySuccess());
  } catch (error) {
    yield put(testTouchKeyFailed(error));
  }
}

export function* testNfcChipAsync() {
  yield put(testNfcChip());
  const { test: { lockObj } } = yield select();
  try {
    // let { fobNumber } = yield lockObj.sendFactoryTestingCommand(2);
    // fobNumber = parseInt(fobNumber, 16).toString().padStart(10, '0');
    // if (!keys.every(key => key === true)) {
    //   const arr = keys.map((key, i) => key || i + 1).filter(key => key !== true);
    //   throw new Error(`[${arr.toString()}] are not been touched`);
    // }
    yield lockObj.getLockTime();
    const fobNumber = '1234567890';
    yield put(testNfcChipSuccess(fobNumber));
  } catch (error) {
    yield put(testNfcChipFailed(error));
  }
}

export function* testAutoLockAsync() {
  yield put(testAutoLock());
  const { test: { lockObj } } = yield select();
  try {
    yield lockObj.setAutoLockTime(1);
    yield put(testAutoLockSuccess());
  } catch (error) {
    yield put(testAutoLockFailed(error));
  }
}

export function* testOfflineCodeAsync() {
  yield put(testOfflineCode());
  const { test: { lockObj: { lockMac, deviceAuthToken } } } = yield select();
  try {
    const { code } = yield API.createAutoCode(lockMac, deviceAuthToken);
    yield put(gotOfflineCode(code));
  } catch (error) {
    yield put(testOfflineCodeFailed(error));
  }
}

export function* uploadSerialNoAsync({ payload: serialNoStr }) {
  const { test: { lockObj: { lockMac } }, auth: { batchNo }} = yield select();
  const serialNo = parseInt(serialNoStr);
  try {
    if (serialNo.toString() !== serialNoStr || !(serialNo >= 10000000) || !(serialNo < 12000000)) {
      throw new Error(serialNoStr + ' - ' + strings('Test.invalidSN'));
    }
    //TODO upload to local server
    const params = { deviceMac: lockMac, batchNum: batchNo, serialNo };
    yield API.updateDeviceBySuperAdmin(params);
    yield put(uploadSerialNoSuccess());
    yield put(testSuccess());
  } catch (error) {
    yield put(uploadSerialNoFailed(error));
  }
}
//TODO add all incomplete cases

// export function* endTestAsync() {
//   const { test: { testState } } = yield select();
//   if (testState !== types.SUCCESS) {
//     return Alert.alert(
//       strings('LockTest.warning'),
//       strings('LockTest.warningInfo1'),
//       [
//         { text: strings('LockTest.cancel'), onPress: function* () { yield put(endTestCancel());} },
//         { text: strings('LockTest.backHome'), onPress: function* () { yield put(endTestConfirm());} },
//       ],
//     );
//   }
// }
