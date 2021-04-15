import React, { PureComponent } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, View } from 'react-native';
import { connect } from 'react-redux';

import styles from './styles';
import * as types from '../../store/actions/types';

const Step1 = ({
  state: { lockMac, modelNum, hardwareVer, firmwareVer, rssi, battery },
}) => (
  <View>
    <Text style={styles.text}>1.广播检测</Text>
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
  </View>
);

const Step2 = ({ state }) => {
  if (state === types.NOT_STARTED) return null;
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.text}>2.初始化</Text>
        {state === types.PENDING && <ActivityIndicator color="white" />}
      </View>
      {state === types.SUCCESS && <Text style={styles.result}>初始化正常</Text>}
    </View>
  );
};

class TestModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // isScanning: false,
      // loading: false,
      // serialNo: '',
    };
  }

  render() {
    return (
      <Modal visible={this.props.testState !== types.NOT_STARTED}>
        <ScrollView style={styles.container}>
          <View>
            <Text style={styles.button}>后退</Text>
          </View>
          <Step1 state={this.props.broadcastInfo} />
          <Step2 state={this.props.initLockState} />
          {/*<View>*/}
          {/*  <Text style={styles.text}>3.RTC测试</Text>*/}
          {/*  <Text style={styles.result}>RTC测试正常</Text>*/}
          {/*</View>*/}
          {/*<View>*/}
          {/*  <Text style={styles.text}>4.霍尔测试</Text>*/}
          {/*  <Text style={styles.result}>关锁正常</Text>*/}
          {/*  <Text style={styles.result}>开锁正常</Text>*/}
          {/*</View>*/}
          {/*<View>*/}
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
          {/*<View>*/}
          {/*  <Text style={styles.text}>9.测试离线密码</Text>*/}
          {/*  <Text style={styles.result}>密码: 12345678</Text>*/}
          {/*</View>*/}
          {/*<View>*/}
          {/*  <Text style={styles.text}>10.上传SN号</Text>*/}
          {/*  <Text style={styles.result}>SN: 10000086</Text>*/}
          {/*</View>*/}
          <View>
            {this.props.error !== '' && <Text style={styles.error}>{this.props.error.message}</Text>}
          </View>
          <View style={{ paddingBottom: 25 }}>
            <Text style={styles.button}>完成</Text>
          </View>
        </ScrollView>
      </Modal>
    );
  }
}
const mapStateToProps = state => ({ ...state.test });
const mapDispatchToProps = {};

export default connect(mapStateToProps)(TestModal);
