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

const Step1 = () => {
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
        <Text style={styles.text}>1.广播检测</Text>
        {testBroadcastState === types.PENDING && <ActivityIndicator />}
        {testBroadcastState === types.SUCCESS && <Icon name="check" type="entypo" color="green" size={28} />}
        {testBroadcastState === types.FAILED && <Icon name="cross" type="entypo" color="red" size={28} />}
        {testBroadcastState === types.FAILED && <RetryButton no="1" />}
      </View>
      <Text style={styles.text}>
        MAC地址: <Text style={styles.result}>{lockMac}</Text>
      </Text>
      <Text style={styles.text}>
        型号:<Text style={styles.result}>{modelNum}</Text> 硬件版本:
        <Text style={styles.result}>{hardwareVer}</Text> 固件版本:
        <Text style={styles.result}>{firmwareVer}</Text>
      </Text>
      <Text style={styles.text}>
        蓝牙信号强度: <Text style={styles.result}>{rssi}</Text>
      </Text>
      <Text style={styles.text}>
        电量:<Text style={styles.result}>{battery}%</Text>
      </Text>
      {testBroadcastState === types.SUCCESS && <Text style={styles.result}>广播正常</Text>}
    </View>
  );
};

const Step = ({ state, name, no }) => {
  if (state === types.NOT_STARTED) return null;
  return (
    <View>
      <View style={styles.title}>
        <Text style={styles.text}>{no}.{name}测试</Text>
        {state === types.PENDING && <ActivityIndicator />}
        {state === types.SUCCESS && <Icon name="check" type="entypo" color="green" size={28} />}
        {state === types.FAILED && <Icon name="cross" type="entypo" color="red" size={28} />}
        {state === types.FAILED && <RetryButton no={no} />}
      </View>
      {state === types.SUCCESS && <Text style={styles.result}>{name + '正常'}</Text>}
    </View>
  );
};

const Step9 = ({ state, code }) => {
  const dispatch = useDispatch();
  if (state === types.NOT_STARTED) return null;
  return (
    <View>
      <View style={styles.title}>
        <Text style={styles.text}>9.离线密码测试</Text>
        {state === types.PENDING && <ActivityIndicator />}
        {state === types.SUCCESS && <Icon name="check" type="entypo" color="green" size={28} />}
        {state === types.FAILED && <Icon name="cross" type="entypo" color="red" size={28} />}
        {state === types.FAILED && <RetryButton no='8' />}
      </View>
      {code !== '' && <Text style={styles.result}>离线密码:{code}，请在门锁上输入</Text>}
      {code !== '' && state !== types.SUCCESS && (
        <View style={{ alignSelf: 'start'}}>
          <Button
            title="有效"
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
        <Text style={styles.text}>10.上传SN号</Text>
        <Button title="扫描" onPress={onPressScan} disabled={uploadSerialNoState === types.SUCCESS} />
        {uploadSerialNoState === types.PENDING && <ActivityIndicator />}
        {uploadSerialNoState === types.SUCCESS && <Icon name="check" type="entypo" color="green" size={28} />}
      </View>
      {uploadSerialNoState === types.PENDING && <Text style={styles.result}>上传: {serialNo}...</Text>}
      {uploadSerialNoState === types.SUCCESS && <Text style={styles.result}>SN号: {serialNo}上传成功</Text>}
    </View>
  );
};

//TODO 测试所有retry
const RetryButton = ({ no }) => {
  const { test: { lockObj }, locks: { touchedLocks } } = useSelector(state => state);
  const dispatch = useDispatch();
  let retry = () => {};
  switch (no) {
    case '1':
      retry = () => dispatch(scanBroadcast());
      break;
    case '2':
      retry = () => dispatch(verifyBroadcastInfoSuccess());
      break;
    case '3':
      retry = () => dispatch(initializeLockSuccess());
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
    <Button
      title="重试"
      onPress={retry}
      disabled={!touchedLocks.find(lock => lock.lockMac === lockObj.lockMac)}
    />
  );
};

const RetryInstruction = () => {
  const { test: { lockObj, error, uploadSerialNoState }, locks: { touchedLocks } } = useSelector(state => state);
  const isTouched = touchedLocks.find(lock => lock.lockMac === lockObj.lockMac);
  return (error && !isTouched && uploadSerialNoState !== types.FAILED) ? (
    <View style={styles.retryInstruction}>
      <Text style={styles.text}>{strings('LockTest.touchToRetry')}</Text>
      <Image
        source={require('../../../assets/touch.png')}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  ) : null;
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
      strings('LockTest.warning'),
      strings('LockTest.warningInfo1'),
      [
      { text: strings('LockTest.cancel'), onPress: () => {} },
      { text: strings('LockTest.backHome'), onPress: this.props.endTest },
    ]);
  };

//TODO reorder steps
  render() {
    return (
      <Modal visible={this.props.testState !== types.NOT_STARTED}>
        <ScrollView style={styles.container}>
          <View style={styles.back}>
            <Button title="后退" onPress={this.endTest} disabled={!this.props.error} />
          </View>
          <Step1 />
          <Step no="2" state={this.props.initLockState} name="初始化" />
          <Step no="3" state={this.props.testRTCState} name="RTC" />
          <Step no="4" state={this.props.testHallState} name="霍尔" />
          <Step no="5" state={this.props.testDoorSensorState} name="门磁状态" />
          {/*<Step6 />*/}
          {/*<Step7 />*/}
          <Step no="8" state={this.props.testAutoLockState} name="自动关锁" />
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
          <View>
            {this.props.error && <Text style={styles.error}>{this.props.error.message}</Text>}
          </View>
          <RetryInstruction />
          <View style={{ paddingBottom: 25 }}>
            <Button title="完成" style={styles.button} onPress={this.endTest} disabled={this.props.testState !== types.SUCCESS}/>
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
