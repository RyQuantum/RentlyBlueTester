import React, { PureComponent } from 'react';
import { Modal, ScrollView, Text, View, StyleSheet, ActivityIndicator, Button, Alert, Image } from 'react-native';
import { Icon } from 'react-native-elements';
import { connect } from 'react-redux';

import { stateEnum, startTest1, endTest1 } from '../redux/test1';
import { strings } from "../services/i18n";
const {
  NOT_STARTED,
  PENDING,
  SUCCESS,
  FAILED,
  FAILED2,
} = stateEnum;
const toString = {};
Object.keys(stateEnum).forEach(k => toString[stateEnum[k]] = k);

class Test1Modal extends PureComponent {

  endTest = () => {
    this.props.endTest1();
  }

  retryTest = async () => {
    try {
      await this.props.startTest1();
    } catch (error) {
      const errorMessage =
        typeof error === 'object' ? error.message :
          typeof error === 'string' ? error : 'unknown';
      Alert.alert('Error', errorMessage);
    }
  }

  render() {
    const { isVisible, touchedLocks, lockObj, test1State, addToDMSState, init5GLockState, setTimezoneState, lockRegisterState, simInfo } = this.props;
    const isTouched = touchedLocks.findIndex(lock => lock.lockMac === (lockObj && lockObj.lockMac)) !== -1;

    const header = (
      <View style={styles.header}>
        <Button title={strings('LockTest.back')} onPress={this.endTest} disabled={test1State === FAILED ? false : true}/>
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

    return (
      <Modal visible={isVisible} onRequestClose={this.onRequestClose}>
        <View style={styles.container}>
          <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
            {header}
            {addToDMSState !== NOT_STARTED && <Step no="1" name={strings('LockTest1.addToDMS')} state={addToDMSState} RetryButton={RetryButton}/>}
            {init5GLockState !== NOT_STARTED && <Step no="2" name={strings('LockTest1.init5GLock')} state={init5GLockState} RetryButton={RetryButton}/>}
            {setTimezoneState !== NOT_STARTED && <Step no="3" name={strings('LockTest1.uploadTimezone')} state={setTimezoneState} RetryButton={RetryButton}/>}
            {setTimezoneState === SUCCESS && <Step4 state={lockRegisterState} simInfo={simInfo} RetryButton={RetryButton}/>}
            {test1State === FAILED && <Failed/>}
            {(test1State === FAILED && !isTouched) && <TouchToRetry/>}
            {test1State === SUCCESS && <RegistrationSuccess/>}
            <Button title={strings('LockTest.done')} disabled={test1State !== SUCCESS} onPress={this.endTest}/>
          </ScrollView>
        </View>
      </Modal>
    );
  }
}

const Step = ({ state, no, name, RetryButton }) => {
  return (
    <View>
      <View style={styles.column}>
        <Text style={styles.headerText}>{strings('LockTest.step')} {no}: {name}</Text>
        <View style={styles.row}>
          <Text style={state === SUCCESS ? styles.subTextLight : styles.subTextDark}>{strings(`LockTest2.${toString[state]}`)}</Text>
          <Indicator state={state}/>
          {state === FAILED && <RetryButton/> }
        </View>
      </View>
    </View>
  );
}

const Step4 = ({ state, simInfo, RetryButton }) => (
  <View style={[styles.column, { marginBottom: 0 }]}>
    <Text style={styles.headerText}>{strings('LockTest.step')} 4: {strings('LockTest1.waitForRegister')}</Text>
    <View style={styles.row}>
      <Text style={state === SUCCESS ? styles.subTextLight : styles.subTextDark}>
        {strings(`LockTest2.${toString[state]}`)}
      </Text>
      <Indicator state={state}/>
      {state === FAILED && <RetryButton/>}
    </View>
    {simInfo && Object.keys(simInfo).map((key, i, arr) => {
      if (key === 'syncedAt') return;
      return (<View style={styles.row} key={i}>
        <Text style={styles.subTextDark}>{i === 0 && '{'}{key + ': ' + simInfo[key]}{i === (arr.length - 1) && '}'}</Text>
      </View>)
    })}
  </View>
);

export const Success = () => (
  <View style={styles.result}>
    <Text style={styles.successText}>{strings('LockTest.testPassed')}</Text>
  </View>
);

const RegistrationSuccess = () => (
  <View style={{ marginVertical: 20 }}>
    <Text style={styles.successText}>{strings('LockTest1.RegistrationSuccess')}</Text>
  </View>
)

export const Failed = () => (
  <View style={styles.result}>
    <Text style={styles.failedText}>{strings('LockTest.testFailed')}</Text>
  </View>
);

export const TouchToRetry = () => (
  <View style={styles.touchToRetry}>
    <Text style={styles.subTextDark}>{`${strings('LockTest.touchToRetry')} `}</Text>
    <Image
      source={require('../assets/touch.png')}
      style={styles.image}
      resizeMode='contain'
    />
  </View>
);

export const Indicator = ({ state }) => {
  switch (state) {
    case PENDING:
      return <ActivityIndicator size="large"/>;
    case SUCCESS:
      return <Icon name="check" type="entypo" color="green" size={28}/>;
    case FAILED2:
      return <Icon name="minus" type="entypo" color="red" size={28}/>;
    case FAILED:
      return <Icon name="cross" type="entypo" color="red" size={34}/>;
    case NOT_STARTED:
    default:
      return null;
  }
}

export const headerTextSize = 22;
export const subTextSize = 20;
export const lightText = '#BDBDBD';
export const darkText = '#212121';

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
    marginBottom: 50,
  },
  headerText: {
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
  image: {
    width: 50,
    height: 50,
  },
  result: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  successText: {
    color: 'green',
    fontSize: 38,
  },
  failedText: {
    color: 'red',
    fontSize: 38,
    paddingBottom: 20,
  },
  touchToRetry: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
})

const mapStateToProps = (state) => ({ ...state.test1, ...state.locks });
const mapDispatchToProps = { startTest1, endTest1 };
export default connect(mapStateToProps, mapDispatchToProps)(Test1Modal);
