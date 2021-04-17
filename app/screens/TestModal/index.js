import React, { PureComponent } from 'react';
import { ActivityIndicator, Button, Modal, ScrollView, Text, View } from 'react-native';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Icon } from 'react-native-elements';

import styles from './styles';
import * as types from '../../store/actions/types';
// import Toast from "react-native-simple-toast";
import Camera from '../../components/Camera';
import { scanBroadcast, testOfflineCodeSuccess, uploadSerialNo } from '../../store/actions/testActions';
import * as sagas from '../../store/sagas/testSaga';

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
  const dispatch = useDispatch();
  return (
    <View>
      <View style={styles.title}>
        <Text style={styles.text}>1.广播检测</Text>
        {testBroadcastState === types.PENDING && <ActivityIndicator color="white" />}
        {testBroadcastState === types.SUCCESS && <Icon name="check" type="entypo" color="green" size={28} />}
        {testBroadcastState === types.FAILED && <Icon name="cross" type="entypo" color="red" size={28} />}
        {/*//TODO 重试应该重新搜广播*/}
        {testBroadcastState === types.FAILED && (
          <Button title="重试" onPress={() => dispatch(scanBroadcast())} />
        )}
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
        {state === types.PENDING && <ActivityIndicator color="white" />}
        {state === types.SUCCESS && <Icon name="check" type="entypo" color="green" size={28} />}
        {state === types.FAILED && <Icon name="cross" type="entypo" color="red" size={28} />}
        {state === types.FAILED && <Retry no={no} />}
      </View>
      {state === types.SUCCESS && <Text style={styles.result}>{name + '正常'}</Text>}
    </View>
  );
};

const Step8 = () => {
  const { testOfflineCodeState, code } = useSelector(state => state.test);
  const dispatch = useDispatch();
  if (testOfflineCodeState === types.NOT_STARTED) return null;
  return (
    <View>
      <View style={styles.title}>
        <Text style={styles.text}>8.离线密码测试</Text>
        {testOfflineCodeState === types.PENDING && <ActivityIndicator color="white" />}
        {testOfflineCodeState === types.SUCCESS && <Icon name="check" type="entypo" color="green" size={28} />}
        {testOfflineCodeState === types.FAILED && <Icon name="cross" type="entypo" color="red" size={28} />}
        {testOfflineCodeState === types.FAILED && <Retry no='8' />}
      </View>
      {code !== '' && <Text style={styles.result}>离线密码:{code}，请在门锁上输入</Text>}
      {code !== '' && testOfflineCodeState !== types.SUCCESS &&(
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
  const { testAutoLockState, uploadSerialNoState, serialNo } = useSelector(state => state.test);
  if (testAutoLockState !== types.SUCCESS) return null;
  return (
    <View>
      <View style={styles.title}>
        <Text style={styles.text}>10.上传SN号</Text>
        <Button title="扫描" onPress={onPressScan} disabled={uploadSerialNoState === types.SUCCESS} />
        {uploadSerialNoState === types.PENDING && <ActivityIndicator color="white" />}
        {uploadSerialNoState === types.SUCCESS && <Icon name="check" type="entypo" color="green" size={28} />}
      </View>
      {uploadSerialNoState === types.PENDING && <Text style={styles.result}>上传: {serialNo}...</Text>}
      {uploadSerialNoState === types.SUCCESS && <Text style={styles.result}>SN号: {serialNo}上传成功</Text>}
    </View>
  );
};

//TODO 测试所有retry
//TODO 调用async无效
const Retry = ({ no }) => {
  let saga = () => {};
  switch (no) {
    case '2':
      saga = sagas.initializeLockAsync;
      break;
    case '3':
      saga = sagas.testRTCAsync;
      break;
    case '4':
      saga = sagas.testHallAsync;
      break;
    case '5':
      saga = sagas.testDoorSensorAsync;
      break;
    case '8':
      saga = sagas.testOfflineCodeAsync;
      break;
    case '9':
      //TODO integrate new command of auto-lock
      saga = sagas.testAutoLockAsync;
      break;
    default:
      break;
  }
  return <Button title="重试" onPress={saga} />
}

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

  render() {
    return (
      <Modal visible={this.props.testState !== types.NOT_STARTED}>
        <ScrollView style={styles.container}>
          <View>
            <Text style={styles.button}>后退</Text>
          </View>
          <Step1 />
          <Step no="2" state={this.props.initLockState} name="初始化" />
          <Step no="3" state={this.props.testRTCState} name="RTC" />
          <Step no="4" state={this.props.testHallState} name="霍尔" />
          <Step no="5" state={this.props.testDoorSensorState} name="门磁状态" />
          <Step8 />
          <Step no="9" state={this.props.testAutoLockState} name="自动关锁" />
          <Step10 onPressScan={() => this.setState({ isScanning: true })} />
          {/*  <Text style={styles.text}>5.按键触摸测试</Text>*/}
          {/*  <Text style={styles.result}>按键123456789⛔️0✅️，触摸正常</Text>*/}
          {/*</View>*/}
          {/*<View>*/}
          {/*  <Text style={styles.text}>6.读卡芯片测试</Text>*/}
          {/*  <Text style={styles.result}>卡ID:1234567890，读卡芯片正常</Text>*/}
          {/*</View>*/}
          {/*<View>*/}
          {/*  <Text style={styles.text}>7.自动关锁测试</Text>*/}
          {/*  <Text style={styles.result}>自动关锁正常</Text>*/}
          {/*</View>*/}
          {/*<View>*/}
          {/*  <Text style={styles.text}>8.门磁状态检测</Text>*/}
          {/*  <Text style={styles.result}>门磁状态: 开，正常</Text>*/}
          {/*</View>*/}
          <View>
            {this.props.error !== '' && <Text style={styles.error}>{this.props.error.message}</Text>}
          </View>
          <View style={{ paddingBottom: 25 }}>
            <Text style={styles.button}>完成</Text>
          </View>
        </ScrollView>
        {this.state.isScanning && <Camera dismiss={this.cameraDismiss} callback={this.barcodeCallBack} />}
      </Modal>
    );
  }
}
const mapStateToProps = state => ({ ...state.test });
const mapDispatchToProps = { uploadSerialNo, testOfflineCodeSuccess };

export default connect(mapStateToProps, mapDispatchToProps)(TestModal);
