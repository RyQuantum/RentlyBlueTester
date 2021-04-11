import React, { PureComponent } from 'react';
import { Modal, ScrollView, Text, View, StyleSheet, Button, Alert } from 'react-native';
import { connect } from 'react-redux';
import Toast from 'react-native-simple-toast';

import { stateEnum, endTest2, startTest2, linkSerialNo } from '../redux/test2';
import { Indicator, Success, Failed, TouchToRetry, darkText, headerTextSize, lightText, subTextSize } from './Test1Modal';
import { strings } from '../services/i18n';
import ProductScanRNCamera from '../components/ProductScanRNCamera';
const {
  NOT_STARTED,
  PENDING,
  SUCCESS,
  FAILED,
  FAILED2,
} = stateEnum;
const toString = {};
Object.keys(stateEnum).forEach(k => toString[stateEnum[k]] = k);

class Test2Modal extends PureComponent {

  constructor() {
    super();
    this.state = {
      isScanning: false,
      serialNo: '',
    };
  }

  endTest = () => {
    this.setState({ serialNo: '' });
    this.props.endTest2();
  }

  retryTest = async () => {
    try {
      await this.props.startTest2();
    } catch (error) {
      const errorMessage =
        typeof error === 'object' ? error.message :
          typeof error === 'string' ? error : 'unknown';
      Alert.alert('Error', errorMessage);
    }
  }

  scanBarcode = async() => {
    this.setState({ isScanning:true });
  }

  barcodeDismiss = async() => {
    this.setState({ isScanning: false });
  }

  barcodeCallback = async (serialNo) => {
    this.setState({ isScanning: false, serialNo });
    try {
      await this.props.linkSerialNo(serialNo);
    } catch (error) {
      Toast.show(error.message, Toast.SHORT);
    }
  }

  render() {
    const { touchedLocks, lockObj, isVisible, test2State, setTimeState, testRTCState, readICCIDState, uploadServerState, RTCCostTime, iccid, code, uploadSNState } = this.props;
    const isTouched = touchedLocks.findIndex(lock => lock.lockMac === (lockObj && lockObj.lockMac)) !== -1;

    const header = (
      <View style={styles.header}>
        <Button title={strings('LockTest.back')} onPress={this.endTest} disabled={test2State === FAILED ? false : uploadServerState === SUCCESS ? (uploadSNState === PENDING ? true : true) : true}/>
      </View>
    );

    const RetryButton = () => (
      <View style={{ marginBottom: 3 }}>
        <Button
          title={strings('LockTest.retry')}
          onPress={this.retryTest}
          disabled={!isTouched}
        />
      </View>
    );

    const ScanButton = () => (
      <View style={{ marginBottom: 3 }}>
        <Button title={strings('LockTest2.scan')} onPress={this.scanBarcode} disabled={uploadSNState === SUCCESS}/>
      </View>
    );

    return (
      <Modal visible={isVisible} onRequestClose={this.onRequestClose}>
        <View style={styles.container}>
          <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
            {header}
            {setTimeState !== NOT_STARTED && <Step1 state={setTimeState} RetryButton={RetryButton}/>}
            {testRTCState !== NOT_STARTED && <Step2 state={testRTCState} RTCCostTime={RTCCostTime} RetryButton={RetryButton}/>}
            {readICCIDState !== NOT_STARTED && <Step3 state={readICCIDState} iccid={iccid} RetryButton={RetryButton}/>}
            {uploadServerState !== NOT_STARTED && <Step4 state={uploadServerState} code={code} RetryButton={RetryButton}/>}
            {test2State === FAILED && <Failed/>}
            {(test2State === FAILED && !isTouched) && <TouchToRetry/>}
            {(uploadServerState === SUCCESS || uploadServerState === FAILED2) && <Step5 state={uploadSNState} serialNo={this.props.serialNo || this.state.serialNo} ScanButton={ScanButton}/>}
            {test2State === SUCCESS && <Success/>}
            <Button title={strings('LockTest.done')} disabled={uploadSNState !== SUCCESS} onPress={this.endTest}/>
          </ScrollView>
        </View>
        {this.state.isScanning && <ProductScanRNCamera dismiss={this.barcodeDismiss} callback={this.barcodeCallback}/>}
      </Modal>
    );
  }
}

const Step1 = ({ state, RetryButton }) => (
  <View style={styles.column}>
    <Text style={styles.headerText}>{strings('LockTest.step')} 1: {strings('LockTest2.setTime')}</Text>
    <View style={styles.row}>
      <Text style={state === SUCCESS ? styles.subTextLight : styles.subTextDark}>{strings(`LockTest2.${toString[state]}`)}</Text>
      <Indicator state={state}/>
      {state === FAILED && <RetryButton/> }
    </View>
  </View>
);

const Step2 = ({ state, RTCCostTime, RetryButton }) => (
  <View style={styles.column}>
    <Text style={styles.headerText}>{strings('LockTest.step')} 2: {strings('LockTest2.unlock&RTC')}</Text>
    <View style={styles.row}>
      <Text style={state === SUCCESS ? styles.subTextLight : styles.subTextDark}>{strings(`LockTest2.${toString[state]}`)}</Text>
      <Indicator state={state}/>
      {state === FAILED && <RetryButton/>}
    </View>
    {RTCCostTime !== null && <View style={styles.row}>
      <Text style={styles.subTextDark}>{strings('LockTest.RTCCost')}: {RTCCostTime} {strings('LockTest.unit')}</Text>
    </View>}
  </View>
);

const Step3 = ({ state, iccid, RetryButton }) => (
  <View style={styles.column}>
    <Text style={styles.headerText}>{strings('LockTest.step')} 3: {strings('LockTest2.readICCID')}</Text>
    <View style={styles.row}>
      <Text style={state === SUCCESS ? styles.subTextLight : styles.subTextDark}>{strings(`LockTest2.${toString[state]}`)}</Text>
      <Indicator state={state}/>
      {state === FAILED && <RetryButton/>}
    </View>
    {iccid !== null && <View style={styles.row}>
      <Text style={styles.subTextDark}>ICCID: {iccid}</Text>
    </View>}
  </View>
);

const Step4 = ({ state, code, RetryButton }) => (
  <View style={styles.column}>
    <Text style={styles.headerText}>{strings('LockTest.step')} 4: {strings('LockTest2.uploadToServer')}</Text>
    <View style={styles.row}>
      <Text style={state === SUCCESS ? styles.subTextLight : styles.subTextDark}>{strings(`LockTest2.${toString[state]}`)}</Text>
      <Indicator state={state}/>
      {(state === FAILED || state === FAILED2) && <RetryButton/>}
    </View>
    {code !== '' && <View style={styles.row}>
      <Text style={styles.subTextDark}>{strings('LockTest.passcode')}: {code}</Text>
    </View>}
  </View>
);

const Step5 = ({ state, serialNo, ScanButton }) => (
  <View style={styles.column}>
    <Text style={styles.headerText}>{strings('LockTest.step')} 5: {strings('LockTest2.linkSN')}</Text>
    {/*<Text style={styles.headerText}>{strings('LockTest2.linkSN')}</Text>*/}
    <View style={styles.row}>
      {state === NOT_STARTED || <Text style={state === SUCCESS ? styles.subTextLight : styles.subTextDark}>{strings(`LockTest2.${toString[state]}`)}</Text>}
      <Indicator state={state}/>
      <ScanButton/>
    </View>
    {serialNo ? <View style={styles.row}>
      <Text style={styles.subTextDark}>SN: {serialNo}</Text>
    </View> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 18,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerText: {
    fontSize: headerTextSize,
    color: darkText,
    textAlign: 'center',
  },
  subTextLight: {
    fontSize: subTextSize,
    color: lightText,
  },
  subTextDark: {
    fontSize: subTextSize,
    color: darkText,
  },
  annotation: {
    fontSize: 24,
    fontWeight: '500',
  },
  image: {
    width: 50,
    height: 50,
  },
})

const mapStateToProps = (state) => ({ ...state.test2, ...state.locks });
const mapDispatchToProps = { startTest2, endTest2, linkSerialNo };
export default connect(mapStateToProps, mapDispatchToProps)(Test2Modal);
