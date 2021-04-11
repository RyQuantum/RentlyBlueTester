import React, {PureComponent} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Button,
  Modal,
  ActivityIndicator,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import Toast from 'react-native-simple-toast';
import {connect} from 'react-redux';
import {Icon} from 'react-native-elements';
import ProductScanRNCamera from '../components/ProductScanRNCamera';
import Spinner from 'react-native-loading-spinner-overlay';
import { strings } from '../services/i18n';

import {
  startTest,
  endTest,
  stateEnum,
  linkSerialNo,
} from '../redux/test';

class TestModal extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      isScanning: false,
      loading: false,
      serialNo: '',
    }
  }

  onRequestClose = () => {
    const {isTesting, isLinked} = this.props;
    if (isTesting) {
      Toast.show(strings('LockTest.testInProgress'), Toast.SHORT);
    } else {
      if(!isLinked) this.interruptTest();
      else this.endTest();
    }
  };

  retryTest = async () => {
    const { startTest, lockObj } = this.props;
    try {
      const newLockObj = this.props.touchedLocks.find(lock => lock.lockMac === lockObj.lockMac);
      await startTest(newLockObj);
    } catch (error) {
      const errorMessage =
        typeof error === 'object' ? error.message :
        typeof error === 'string' ? error : 'unknown';
      Alert.alert('Error', errorMessage);
    }
  };

  interruptTest = async () => {
    if (!this.props.lockObj.ekey) {
      return Alert.alert(strings('LockTest.warning'), strings('LockTest.warningInfo1'), [
        { text: strings('LockTest.cancel'), onPress: () => {} },
        { text: strings('LockTest.backHome'), onPress: async () => await this.endTest(false) },
      ]);
    }
    Alert.alert( strings('LockTest.warning'), strings('LockTest.warningInfo2'), [
      { text: strings('LockTest.cancel'), onPress: () => {} },
      { text: strings('Home.reset'), onPress: this.resetAgain },
    ]);
  };

  resetFailed = async () => Alert.alert(strings('LockTest.resetFailed'), strings('LockTest.resetFailedInfo'), [
    { text: strings('LockTest.cancel'), onPress: () => {} },
    { text: strings('Home.reset'), onPress: this.resetAgain },
    { text: strings('LockTest.backHome'), onPress: async () => await this.endTest(false) },
  ]);


  resetAgain = () => this.setState({ loading: true }, async () => {
    try {
      await this.props.lockObj.setLockTime();
      await this.props.lockObj.resetLock();
    } catch (error) {
      return this.setState({ loading: false }, () => setTimeout(this.resetFailed, 150));
    }
    this.setState({ loading: false }, async () => {
      await this.endTest(true);
      setTimeout(() => Toast.show(strings('LockTest.resetSuccess'), Toast.SHORT), 300);
    });
  });

  endTest = async (isReset) => {
    try {
      const {endTest} = this.props;
      await endTest(isReset);
      this.setState({serialNo:null});
    } catch (error) {
      Toast.show(error.message, Toast.SHORT);
    }
  };

  scanBarcode = async() => {
    this.setState({isScanning:true});
  }

  barcodeDismiss = async() => {
    this.setState({isScanning:false});
  }

  barcodeCallBack = async (serialNo) => {
    this.setState({ isScanning: false, serialNo });
    try {
      await this.props.linkSerialNo(serialNo);
    } catch (error) {
      Toast.show(error.message, Toast.SHORT);
    }
  }

  render() {

    const {
      isVisible,
      isTesting,
      code,
      touchedLocks,
      testState,
      lockObj,
      initLockState,
      lockBluetoothState,
      passcodeServerState,
      linkState,
      isB2b,
      isLinked,
      RTCCostTime,
    } = this.props;

    const {
      NOT_STARTED,
      PENDING,
      SUCCESS,
      FAILED
    } = stateEnum;
    const isTouched = touchedLocks.findIndex(lock => lock.lockMac === (lockObj && lockObj.lockMac)) !== -1;
    const check = <Icon name='check' type='entypo' color='green' size={28}/>;
    const cross = <Icon name='cross' type='entypo' color='red' size={34}/>;
    const activityIndicator = <ActivityIndicator size='large'/>;

    let header;
    ((initLockState === FAILED ||
      lockBluetoothState === FAILED || passcodeServerState === FAILED || !isTesting)  ? header = (
      <View style={styles.header}>
        <Button title={strings('LockTest.back')} onPress={this.interruptTest} disabled={isLinked}/></View>
    ) : null)

    const headerText = (text, disabled) => {
      const style = disabled ? styles.headerTextLight : styles.headerTextDark;
      return (<Text style={style}>{text}</Text>);
    };
    const subText = (text, disabled) => {
      const style = (disabled) ? styles.subTextLight : styles.subTextDark;
      return (<Text style={style}>{text}</Text>);
    };

    const retryDisabled = (initLockState === FAILED ||
      lockBluetoothState === FAILED) && !isTouched;
    const retry = (
      <View style={styles.buttonContainer}>
        <Button
          title={strings('LockTest.retry')}
          onPress={this.retryTest}
          disabled={retryDisabled}
        />
      </View>
    );

    let text = (initLockState === PENDING) ? strings('LockTest.initializing') :
      (initLockState === SUCCESS) ? strings('LockTest.initializeSuccess') :
      strings('LockTest.initializeFailed');
    const initLock = (
      <View style = {styles.column}>
        <Text style = {styles.subTextDark}> {strings('LockTest.step') + '1 :'} </Text>
      <View style={styles.row}>
        {subText(text, initLockState === SUCCESS)}
        {initLockState === PENDING && activityIndicator}
        {initLockState === SUCCESS && check}
        {initLockState === FAILED && cross}
        {initLockState === FAILED && retry}
      </View>
      </View>
    );

    const isTimeout = (RTCCostTime <= 0 || RTCCostTime >= 60);
    text = (lockBluetoothState === PENDING) ? strings('LockTest.unlocking') :
      (RTCCostTime === 0 || lockBluetoothState === SUCCESS) ? strings('LockTest.unlockSuccess') :
      strings('LockTest.unlockFailed');
    const lockBluetooth = initLockState === SUCCESS && (
      <View style = {styles.column}>
        <Text style = {styles.subTextDark}> {strings('LockTest.step') + '2 :'} </Text>
      <View style={styles.row}>
        {subText(text, lockBluetoothState === SUCCESS)}
        {lockBluetoothState === PENDING && activityIndicator}
        {lockBluetoothState === SUCCESS && check}
        {lockBluetoothState === FAILED && (RTCCostTime === 0 ? check : cross)}
        {lockBluetoothState === FAILED && retry}
        </View>
        <View style={styles.row}>
          {RTCCostTime !== null && <Text style={ !isTimeout ? styles.subTextLight : styles.subTextDark }>{strings('LockTest.RTCCost')}: {RTCCostTime} {strings('LockTest.unit')}</Text>}
          {RTCCostTime !== null && (!isTimeout ? check : cross) }
        </View>
      </View>
    );

    text = (passcodeServerState === PENDING) ? strings('LockTest.retrievingPasscode') :
      (passcodeServerState === SUCCESS) ? strings('LockTest.passcodeSuccess') :
      strings('LockTest.passcodeFailed');
    const passcodeServer = lockBluetoothState === SUCCESS && (
      <View style = {styles.column}>
        <Text style = {styles.subTextDark}> {strings('LockTest.step') + '3 :'} </Text>
      <View style={styles.row}>
        {subText(text, passcodeServerState === SUCCESS)}
        {passcodeServerState === PENDING && activityIndicator}
        {passcodeServerState === SUCCESS && check}
        {passcodeServerState === FAILED && cross}
        {passcodeServerState === FAILED && retry}
      </View>
      </View>
    );

    const result = (
      <View style={styles.result}>
        {(testState === SUCCESS && (isTimeout ?
          <Text style={styles.failedText}>{strings('LockTest.testFailed')}</Text> :
          <Text style={styles.successText}>{strings('LockTest.testPassed')}</Text>)) ||
        (testState === FAILED &&
          <Text style={styles.failedText}>{strings('LockTest.testFailed')}</Text>)}
      </View>
    );

    const touchToRetry = retryDisabled && (
      <View style={styles.touchToRetry}>
        <Text style={styles.subTextDark}>{`${strings('LockTest.touchToRetry')} `}</Text>
        <Image
          source={require('../assets/touch.png')}
          style={styles.image}
          resizeMode='contain'
        />
      </View>
    );

    const link = testState === SUCCESS && (
      <View style = {styles.column}>
        <Text style = {styles.subTextDark}> {strings('LockTest.step') + '4 :'}</Text>
      <View style={styles.row}>
        <Button title={strings('LockTest.linkserialNo')} onPress={this.scanBarcode} disabled={isLinked}/>
        {linkState === PENDING && activityIndicator}
        {linkState === SUCCESS && check}
        {linkState === FAILED && cross}
        {/* {linkState === FAILED && retry} */}
      </View>
      </View>
    );

    const tip = linkState === SUCCESS ? (
      <View style = {[styles.column, isB2b && { display: 'none' }]}>
        <Text style={styles.subTextDark}>{strings('LockTest.step') + '5 :'}</Text>
        <View style={{ paddingTop: 10 }}>
          <Text style={styles.headerTextDark}>{strings('LockTest.tip')}</Text>
        </View>
      </View>
    ) : null;

    const done = (<View style={styles.buttonBottom}>
      <Button title={strings('LockTest.done')} onPress={this.endTest} disabled={!isLinked}/></View>);

    const info = testState === SUCCESS && (
      <View>
        <View style={styles.row}>
          <Text style={[styles.headerTextDark, { fontSize: 32, fontWeight: '700' }]}>{`${strings('LockTest.passcode')}: ${code}`}</Text>
        </View>
        <View style={styles.row}>
          {headerText(`${strings('Home.macAddress')}: ${lockObj.lockMac}`, false)}
        </View>
        <View style={styles.row}>
          {headerText(`${strings('Home.rssi')}: ${lockObj.rssi}`, false)}
        </View>
        {this.state.serialNo ? <View style={styles.row}>
          {headerText(`${strings('Home.serialNumber')}: ${this.state.serialNo}`, false)}
        </View> : null}
      </View>
    );

    return (
      <Modal visible={isVisible} onRequestClose={this.onRequestClose}>
        <View style={styles.container}>
          <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
            {header}
            {initLock}
            {lockBluetooth}
            {passcodeServer}
            {result}
            {touchToRetry}
            {info}
            {link}
            {tip}
            {/*{this.props.isB2b || resetLock}*/}
            {done}
          </ScrollView>
        </View>
        {(this.state.isScanning) ?
        <ProductScanRNCamera
        callback = {this.barcodeCallBack}
        dismiss = {this.barcodeDismiss}
        /> : null}
        <Spinner visible={this.state.loading}/>
      </Modal>

    );
  }
}

const headerTextSize = 18;
const subTextSize = 20;
const lightText = '#BDBDBD';
const darkText = '#212121';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 18,
  },
  close: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  column: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  retry: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: 'blue',
  },
  header: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },
  headerTextLight: {
    fontSize: headerTextSize,
    color: lightText,
  },
  headerTextDark: {
    fontSize: headerTextSize,
    color: darkText,
  },
  subTextLight: {
    fontSize: subTextSize,
    color: lightText,
  },
  subTextDark: {
    fontSize: subTextSize,
    color: darkText,
  },
  errorText: {
    fontSize: 26,
    color: 'red',
  },
  result: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  successText: {
    color: 'green',
    fontSize: 38,
    paddingBottom: 20,
  },
  failedText: {
    color: 'red',
    fontSize: 38,
    paddingBottom: 20,
  },
  image: {
    width: 50,
    height: 50,
  },
  buttonContainer: {
    marginBottom: 10,
  },
  touchToRetry: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
});

const mapStateToProps = (state) => ({...state.test, ...state.locks, ...state.auth });
const mapDispatchToProps = { startTest, linkSerialNo, endTest };

export default connect(mapStateToProps, mapDispatchToProps)(TestModal);
