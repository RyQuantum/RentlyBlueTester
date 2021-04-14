import React, { PureComponent } from 'react';
import { Modal, ScrollView, Text, View } from 'react-native';
import { connect } from 'react-redux';

import styles from './styles';

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
      <Modal visable={true}>
        <ScrollView style={styles.container}>
          <View>
            <Text style={styles.button}>后退</Text>
          </View>
          <View>
            <Text style={styles.text}>1.广播检测</Text>
            <Text style={styles.text}>MAC地址: <Text style={styles.result}>FF:EE:DD:CC:BB:AA</Text></Text>
            <Text style={styles.text}>型号:<Text style={styles.result}>2</Text> 硬件版本:<Text style={styles.result}>3</Text> 固件版本:<Text style={styles.result}>6</Text></Text>
            <Text style={styles.text}>蓝牙信号强度: <Text style={styles.result}>-66</Text></Text>
            <Text style={styles.text}>电量:<Text style={styles.result}>100%</Text></Text>
          </View>
          <View>
            <Text style={styles.text}>2.初始化</Text>
            <Text style={styles.result}>初始化正常</Text>
          </View>
          <View>
            <Text style={styles.text}>2.RTC测试</Text>
            <Text style={styles.result}>RTC测试正常</Text>
          </View>
          <View>
            <Text style={styles.text}>3.霍尔测试</Text>
            <Text style={styles.result}>关锁正常</Text>
            <Text style={styles.result}>开锁正常</Text>
          </View>
          <View>
            <Text style={styles.text}>4.按键触摸测试</Text>
            <Text style={styles.result}>按键123456789⛔️0✅️，触摸正常</Text>
          </View>
          <View>
            <Text style={styles.text}>5.读卡芯片测试</Text>
            <Text style={styles.result}>卡ID:1234567890，读卡芯片正常</Text>
          </View>
          <View>
            <Text style={styles.text}>6.自动关锁测试</Text>
            <Text style={styles.result}>自动关锁正常</Text>
          </View>
          <View>
            <Text style={styles.text}>7.门磁状态检测</Text>
            <Text style={styles.result}>门磁状态: 开，正常</Text>
          </View>
          <View>
            <Text style={styles.text}>8.测试离线密码</Text>
            <Text style={styles.result}>密码: 12345678</Text>
          </View>
          <View>
            <Text style={styles.text}>9.上传SN号</Text>
            <Text style={styles.result}>SN: 10000086</Text>
          </View>
          <View style={{ paddingBottom: 25 }}>
            <Text style={styles.button}>完成</Text>
          </View>
        </ScrollView>
      </Modal>
    )
  }
}
const mapStateToProps = state => ({ ...state.locks, ...state.auth });
const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(TestModal);
