import React, { PureComponent } from 'react';
import { ActivityIndicator, Alert, Button, Image, Modal, ScrollView, Text, View } from 'react-native';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Icon } from 'react-native-elements';

import styles from './styles';
import * as types from '../../store/actions/types';
// import Toast from "react-native-simple-toast";
import Camera from '../../components/Camera';
import {
  scanBroadcast,
  verifyBroadcastInfoSuccess,
  registerLockToDMSSuccess,
  initializeLockSuccess,
  testRTCSuccess,
  testHallSuccess,
  testDoorSensorSuccess,
  testAutoLockSuccess,
  testOfflineCodeSuccess,
  uploadSerialNo,
  endTest,
} from '../../store/actions/testActions';
import { strings } from '../../utils/i18n';

const Step0 = () => {
  const {
    testBroadcastState,
    broadcastInfo: {
      lockMac,
      modelNum,
      hardwareVer,
      firmwareVer,
      rssi,
      battery,
    },
  } = useSelector(state => state.test);
  return (
    <View>
      <View style={styles.title}>
        <Text style={styles.text}>0. {strings('Test.verifyBroadcast')}</Text>
        {testBroadcastState === types.PENDING && <ActivityIndicator />}
        {testBroadcastState === types.SUCCESS && <Icon name="check" type="entypo" color="green" size={28} />}
        {testBroadcastState === types.FAILED && <Icon name="cross" type="entypo" color="red" size={28} />}
        {testBroadcastState === types.FAILED && <RetryButton no="0" />}
      </View>
      <Text style={styles.text}>
        {strings('Test.mac')}: <Text style={styles.result}>{lockMac}</Text>
      </Text>
      <Text style={styles.text}>
        {strings('Test.model')}: <Text style={styles.result}>{modelNum} </Text>
        {strings('Test.hardwareVer')}: <Text style={styles.result}>{hardwareVer} </Text>
        {strings('Test.firmwareVer')}: <Text style={styles.result}>{firmwareVer}</Text>
      </Text>
      <Text style={styles.text}>
        {strings('Test.rssi')}: <Text style={styles.result}>{rssi}</Text>
      </Text>
      <Text style={styles.text}>
        {strings('Test.battery')}: <Text style={styles.result}>{battery}%</Text>
      </Text>
      {testBroadcastState === types.SUCCESS && <Text style={styles.result}>{strings('Test.pass')}</Text>}
    </View>
  );
};

const Step = ({ state, name, no }) => {
  const { error } = useSelector(state => state.test);
  if (state === types.NOT_STARTED) return null;
  return (
    <View>
      <View style={styles.title}>
        <Text style={styles.text}>{no}. {name}</Text>
        {state === types.PENDING && <ActivityIndicator />}
        {state === types.SUCCESS && <Icon name="check" type="entypo" color="green" size={28} />}
        {state === types.FAILED && <Icon name="cross" type="entypo" color="red" size={28} />}
        {state === types.FAILED && <RetryButton no={no} />}
      </View>
      {state === types.SUCCESS && <Text style={styles.result}>{strings('Test.pass')}</Text>}
      {state === types.FAILED && <Text style={styles.error}>{error.message}</Text>}
      {state === types.FAILED && <RetryInstruction no={no} />}
    </View>
  );
};

const Step7 = ({ state, fobNumber }) => {
  if (state === types.NOT_STARTED) return null;
  return (
    <View>
      <View style={styles.title}>
        <Text style={styles.text}>7. {strings('Test.nfcChip')}</Text>
        {state === types.PENDING && <ActivityIndicator />}
        {state === types.SUCCESS && <Icon name="check" type="entypo" color="green" size={28} />}
        {state === types.FAILED && <Icon name="cross" type="entypo" color="red" size={28} />}
        {state === types.FAILED && <RetryButton no={7} />}
      </View>
      {state === types.SUCCESS && <Text style={styles.result}>{strings('Test.fobNumber')}: {fobNumber}. {strings('Test.pass')}</Text>}
      {state === types.FAILED && <Text style={styles.error}>{strings('Test.fobNumber')}: {fobNumber}. {strings('Test.wrongFobNumber')}</Text>}
    </View>
  );
};

const Step9 = ({ state, code }) => {
  const dispatch = useDispatch();
  if (state === types.NOT_STARTED) return null;
  return (
    <View>
      <View style={styles.title}>
        <Text style={styles.text}>9. {strings('Test.offlineCode')}</Text>
        {state === types.PENDING && <ActivityIndicator />}
        {state === types.SUCCESS && <Icon name="check" type="entypo" color="green" size={28} />}
        {state === types.FAILED && <Icon name="cross" type="entypo" color="red" size={28} />}
        {state === types.FAILED && <RetryButton no="9" />}
      </View>
      {code !== '' && <Text style={styles.result}>{strings('Test.oneTimeCode')}: {code}, {strings('Test.offlineCodeInstruction')}</Text>}
      {code !== '' && state !== types.SUCCESS && (
        <View style={{ alignSelf: 'start'}}>
          <Button
            title={strings('Test.valid')}
            onPress={() => dispatch(testOfflineCodeSuccess())}
          />
        </View>
      )}
    </View>
  );
};

const Step10 = ({ onPressScan }) => {
  const { testOfflineCodeState, uploadSerialNoState, serialNo } = useSelector(state => state.test);
  if (testOfflineCodeState !== types.SUCCESS) return null;
  return (
    <View>
      <View style={styles.title}>
        <Text style={styles.text}>10. {strings('Test.upload')} {strings('Test.serialNo')}</Text>
        <Button title={strings('Test.scan')} onPress={onPressScan} disabled={uploadSerialNoState === types.SUCCESS} />
        {uploadSerialNoState === types.PENDING && <ActivityIndicator />}
        {uploadSerialNoState === types.SUCCESS && <Icon name="check" type="entypo" color="green" size={28} />}
      </View>
      {uploadSerialNoState === types.PENDING && <Text style={styles.result}>{strings('Test.upload')}: {serialNo}...</Text>}
      {uploadSerialNoState === types.SUCCESS && <Text style={styles.result}>{strings('Test.serialNo')}: {serialNo} {strings('Test.uploadSuccess')}</Text>}
    </View>
  );
};

//TODO 测试所有retry
const RetryButton = ({ no }) => {
  const { test: { lockObj }, locks: { touchedLocks } } = useSelector(state => state);
  const dispatch = useDispatch();
  let retry = () => {};
  let disabled = !touchedLocks.find(lock => lock.lockMac === lockObj.lockMac);
  switch (no) {
    case '0':
      retry = () => dispatch(scanBroadcast());
      break;
    case '1':
      retry = () => dispatch(verifyBroadcastInfoSuccess());
      break;
    case '2':
      retry = () => dispatch(registerLockToDMSSuccess());
      break;
    case '3':
      retry = () => dispatch(initializeLockSuccess());
      disabled = false;
      break;
    case '4':
      retry = () => dispatch(testRTCSuccess());
      break;
    case '5':
      retry = () => dispatch(testHallSuccess());
      break;
    case '8':
      //TODO after integrate new command, refactor case 8
      retry = () => dispatch(testDoorSensorSuccess());
      break;
    case '9':
      //TODO implement and test error case of offline code
      retry = () => dispatch(testAutoLockSuccess());
      break;
    default:
      break;
  }
  return (
    <Button title={strings('Test.retry')} onPress={retry} disabled={disabled} />
  );
};

// const ErrorMessage = () => {
//   const { error } = useSelector(state => state.test);
//   return error && (
//       <View>
//         <Text style={styles.error}>{error.message}</Text>
//       </View>
//   );
// };

const RetryInstruction = ({ no }) => {
  const { test: { lockObj, uploadSerialNoState }, locks: { touchedLocks } } = useSelector(state => state);
  const isTouched = touchedLocks.find(lock => lock.lockMac === lockObj.lockMac);
  const touchToRetry = !isTouched && (
    <View style={styles.retryInstruction}>
      <Text style={styles.text}>{strings('Test.touchToRetry')}</Text>
      <Image
        source={require('../../assets/touch.png')}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
  const enableDoorSensor = (
    <View style={styles.retryInstruction}>
      <Text style={styles.text}>Enable the door sensor{'\n'} switch on the back panel</Text>
      <Image
        source={require('../../assets/door-sensor-switch.png')}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
  const map = {
    2: touchToRetry,
    3: enableDoorSensor,
    4: touchToRetry,
    5: enableDoorSensor,
    6: touchToRetry,
    8: touchToRetry,
  };
  // return !isTouched ? (
  //   <View style={styles.retryInstruction}>
  //     <Text style={styles.text}>{strings('Test.touchToRetry')}</Text>
  //     <Image
  //       source={require('../../assets/touch.png')}
  //       style={styles.image}
  //       resizeMode="contain"
  //     />
  //   </View>
  // ) : null;
  return map[no];
};

class TestModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isScanning: false,
      // loading: false,
      // serialNo: '',
    };
  }

  cameraDismiss = async () => {
    this.setState({ isScanning: false });
  };

  barcodeCallBack = async serialNo => {
    this.setState({ isScanning: false });
    this.props.uploadSerialNo(serialNo);
  };

  endTest = async () => {
    //TODO upload lock test record
    if (this.props.testState === types.SUCCESS) return this.props.endTest();
    Alert.alert(
      strings('Test.warning'),
      strings('Test.warningInfo'),
      [
      { text: strings('Test.cancel'), onPress: () => {} },
      { text: strings('Test.backHome'), onPress: this.props.endTest },
    ]);
  };

  //TODO reorder steps
  render() {
    return (
      <Modal visible={this.props.testState !== types.NOT_STARTED}>
        <ScrollView style={styles.container}>
          <View style={styles.back}>
            <Button title={strings('Test.back')} onPress={this.endTest} disabled={!this.props.error} />
          </View>
          <Step0 />
          <Step no="1" state={this.props.registerLockToDMSState} name={strings('Test.registerToDMS')} />
          <Step no="2" state={this.props.initLockState} name={strings('Test.initialization')} />
          <Step no="3" state={this.props.testRTCState} name={strings('Test.RTC')} />
          <Step no="4" state={this.props.testHallState} name={strings('Test.hall')} />
          <Step no="5" state={this.props.testDoorSensorState} name={strings('Test.doorSensor')} />
          <Step no="6" state={this.props.testTouchKeyState} name={strings('Test.touchKey')} />
          <Step7 state={this.props.testNfcChipState} fobNumber={this.props.fobNumber} />
          <Step no="8" state={this.props.testAutoLockState} name={strings('Test.autoLock')} />
          <Step9 state={this.props.testOfflineCodeState} code={this.props.code} />
          <Step10 onPressScan={() => this.setState({ isScanning: true })} />
          {/*  <Text style={styles.text}>6.按键触摸测试</Text>*/}
          {/*  <Text style={styles.result}>按键123456789⛔️0✅️，触摸正常</Text>*/}
          {/*</View>*/}
          {/*<View>*/}
          {/*  <Text style={styles.text}>7.读卡芯片测试</Text>*/}
          {/*  <Text style={styles.result}>卡ID:1234567890，读卡芯片正常</Text>*/}
          {/*</View>*/}
          {/*<View>*/}
          {/*<ErrorMessage />*/}
          {/*<RetryInstruction />*/}
          <View style={{ paddingBottom: 25, flexDirection: 'row', justifyContent: 'center' }}>
            <Button title={strings('Test.done')} style={styles.button} onPress={this.endTest} disabled={this.props.testState !== types.SUCCESS}/>
          </View>
        </ScrollView>
        {this.state.isScanning && <Camera dismiss={this.cameraDismiss} callback={this.barcodeCallBack} />}
      </Modal>
    );
  }
}
const mapStateToProps = state => ({ ...state.test });
const mapDispatchToProps = { uploadSerialNo, endTest };

export default connect(mapStateToProps, mapDispatchToProps)(TestModal);
