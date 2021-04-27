import React, { PureComponent } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  TouchableOpacity,
  TouchableHighlight,
  Platform,
} from 'react-native';
import { connect } from 'react-redux';
import { Icon } from 'react-native-elements';
import { BarIndicator } from 'react-native-indicators';
import * as RNLocalize from 'react-native-localize';

// import { startTest } from '../redux/test';
import { requestTest } from '../store/actions/testActions';
// import { clearLocks } from '../redux/locks';
import { strings } from '../utils/i18n';
import API from '../services/API';
import { alertIOS, alertIOSwithParams } from '../utils';
// import { startTest1 } from '../redux/test1';
// import { startTest2 } from '../redux/test2';

// export const ListItemSeparator = () => (<View style={styles.separator} />);

class ListItem extends PureComponent {
  state = {
    code: '',
    isCorrectTimeZone: false,
  };

  componentDidMount() {
    this._isMounted = true;
    this._isFirst = true;
    this.setState({
      isCorrectTimeZone: RNLocalize.getTimeZone() == 'America/Los_Angeles',
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  startTest = async () => {

    // fix multi-click;
    if (!this._isFirst) return;
    this._isFirst = false;
    setTimeout(() => this._isFirst = true, 3000);

    if (this.state.isCorrectTimeZone) {
      const { lockObj, requestTest } = this.props;
      try {
        await requestTest(lockObj);
      } catch (error) {
        const errorMessage =
          typeof error === 'object' ? error.message :
          typeof error === 'string' ? error : 'unknown';
        Alert.alert('Error', errorMessage);
      }
    }
    else {
      Alert.alert('Alert!', 'Make sure phone/tablet is set to Los Angeles time zone');
    }
  };

  resetAlert = () => {
    Alert.alert( strings('Home.resetWarning'), `MAC - ${this.props.lockObj.lockMac}`, [
        { text: strings('Home.cancel'), onPress: () => {} },
        { text: strings('Home.reset'), onPress: this.reset },
      ],
    );
  };

  reset = async () => {
    const { lockObj } = this.props;
    try {
      this.props.onChangeLoading(true);
      if (!lockObj.deviceAuthToken) await lockObj.refreshToken();
      await lockObj.setLockTime();
      await lockObj.resetLock();
      this.props.onChangeLoading(false, () => alertIOS(strings('Home.resetSuccess')));
    } catch (error) {
      const errorMessage =
        typeof error === 'object' ? error.message :
          typeof error === 'string' ? error : 'unknown';
      this.props.onChangeLoading(false, () => alertIOSwithParams(strings('Home.resetFailed'), 'Error: ' + errorMessage));
    // } finally {
    //   this.props.clearLocks(lockObj.lockMac);
    }
  };

  startTest1 = async () => {
    const { lockObj, startTest1 } = this.props;
    await startTest1(lockObj);
  };

  startTest2 = async () => {
    const { lockObj, startTest2 } = this.props;
    await startTest2(lockObj);
  };

  getCode = async () => {
    const { lockObj } = this.props;
    try {
      this.setState({ code: 'loading' });
      if (!lockObj.deviceAuthToken) await lockObj.refreshToken();
      const res = await API.createAutoCode(lockObj.lockMac, lockObj.deviceAuthToken);
      this._isMounted && this.setState({ code: res.code });
    } catch (error) {
      Alert.alert('Error', error.message || 'unknown');
    }
  };

  render() {
    const {
      // eKeys,
      lockObj: { lockMac, settingMode, rssi, battery, modelNum, hardwareVer, firmwareVer },
      // codes,
      isFetchingEKey,
      isFetchingCode,
    } = this.props;
    // const { [lockMac]: eKey = {} } = eKeys;
    // const { serialNumber, isSupportIC } = eKey;
    // const { [lockMac]: code  } = codes;

    const disabled = modelNum === 3 && !this.props.isDevelopmentMode && !(this.props.lockObj.frontTested && this.props.lockObj.frontTested);
    const loading = (<ActivityIndicator color="grey" />);

    const info = [
      (<View key={0} style={styles.tableRowHeader}>
        <View style={styles.tableEntry1}>
          <View style={styles.tableEntry2}>
            <Text style={[styles.text, {flex: 3}]}>{strings('Home.modelNum')}</Text>
            <Text style={[styles.text, {flex: 5}]}>{strings('Home.hardwareNum')}</Text>
            <Text style={[styles.text, {flex: 4}]}>{strings('Home.firmwareNum')}</Text>
          </View>
          <Text style={styles.rssiText}>{rssi} RSSI</Text>
        </View>
      </View>),
      (<View key={1} style={styles.tableRow}>
        <View style={styles.tableEntry}>
          {/*{(isFetchingEKey && loading) ||*/}
          <View style={styles.tableEntry3}>
            <View style={{ flex: 1 }}/>
            <Text style={[styles.text, {flex: 6}]}>{modelNum}</Text>
            <Text style={[styles.text, {flex: 8}]}>{hardwareVer}</Text>
            <Text style={[styles.text, {flex: 2}]}>{firmwareVer}</Text>
          </View>
        </View>
        <View style={styles.batteryContainer}>
          <Icon name='battery-50' type='material-community' size={28}/>
          <Text style={styles.battery}>{battery}%</Text>
        </View>
      </View>),
    ];

    const instructions = [
      ...info,
      (<View key={2} style={styles.tableRowHeader}>
        <View style={styles.tableEntry1}>
          <Text style={styles.instructionsText}>{strings('Home.instructions')}</Text>
          {/*<Text style={styles.rssiText}>{rssi} RSSI</Text>*/}
        </View>
      </View>),
      (<View key={3} style={styles.tableRow}>
        <View style={styles.tableEntry}>
          <View style={styles.row}>
            <Text style={styles.text}>{'1.  '}</Text>
            <Text style={styles.flexText}>{strings('Home.setTime')}</Text>
          </View>
        </View>
      </View>),
      (<View key={4} style={styles.tableRow}>
        <View style={styles.tableEntry}>
          <View style={styles.row}>
            <Text style={styles.text}>{'2.  '}</Text>
            <Text style={styles.flexText}>{strings('Home.turnThumbturn')}</Text>
            <Image
              source={require('../assets/unlock.png')}
              style={styles.image}
              resizeMode='contain'/>
          </View>
        </View>
      </View>),
      (<View key={5} style={styles.tableRow}>
        <View style={styles.tableEntry}>
          <View style={styles.row}>
            <Text style={styles.text}>{'3.  '}</Text>
            <TouchableHighlight style={styles.button} onPress={this.props.lockObj.imei ? this.startTest1 : this.startTest}>
              <Text style={styles.buttonText}>
                {strings('Home.startTest')}
              </Text>
            </TouchableHighlight>
          </View>
        </View>
      </View>),
    ];

    const serial = [
      ...info,
      (<View key={2} style={styles.tableRowHeader}>
        <View style={styles.tableEntry}>
          <Text style={styles.text}>{strings('Home.passcode')}</Text>
        </View>
      </View>),
      (<View key={3} style={styles.tableRow}>
        <View style={[styles.tableEntry, { padding: 0 }]}>
          <View style={styles.row}>
            {/*{(isFetchingCode && loading) ||*/}
            <View style={styles.withRefresh}>
              {this.state.code === 'loading' ?
                <BarIndicator style={{ flex: 0, paddingHorizontal: 7 }} color='grey'/> :
                <Text style={styles.text}>{this.state.code}</Text>}
              <TouchableOpacity onPress={this.getCode}>
                <Icon type="evilicons" size={48} name="refresh" color="#757575" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>),
    ];

    if (this.props.lockObj.imei) {
      instructions[4] = (<View key={4} style={styles.tableRow}>
          <View style={styles.tableEntry}>
            <View style={styles.row}>
              <Text style={styles.text}>{'2. '}</Text>
              <Text style={styles.flexText}>{strings('Home.passFrontBackPanel')}</Text>
            </View>
            <View style={[styles.row, { justifyContent: 'space-around' }]}>
              <View style={styles.row}>
                <Text style={styles.text}>{strings('Home.frontPanel')}:</Text>
                {this.props.lockObj.frontTested ?
                  <Icon name="check" type="entypo" color="green" size={28}/> :
                  <Icon name="cross" type="entypo" color="red" size={28}/>}
              </View>
              <View style={styles.row}>
                <Text style={styles.text}>{strings('Home.backPanel')}:</Text>
                {this.props.lockObj.backTested ?
                  <Icon name="check" type="entypo" color="green" size={28}/> :
                  <Icon name="cross" type="entypo" color="red" size={28}/>}
              </View>
            </View>
          </View>
        </View>);

      instructions[5] = (<View key={5} style={styles.tableRow}>
          <View style={styles.tableEntry}>
            <View style={styles.row}>
              <Text style={styles.text}>{'3.  '}</Text>
              <TouchableHighlight style={[styles.button, { width: 250, backgroundColor: disabled ? '#b3b3b3' : '#317ef5' }]} onPress={this.startTest1} disabled={disabled}>
                <Text style={styles.buttonText}>
                  {strings('Home.startTest1')}
                </Text>
              </TouchableHighlight>
            </View>
          </View>
        </View>);

      serial[2] = (<View key={2} style={styles.tableRowHeader}>
          <View style={styles.tableEntry1}>
            <Text style={styles.instructionsText}>{strings('Home.instructions')}</Text>
            {/*<Text style={styles.rssiText}>{rssi} RSSI</Text>*/}
          </View>
        </View>);

      serial[3] = (<View key={3} style={styles.tableRow}>
          <View style={styles.tableEntry}>
            <View style={styles.row}>
              <Text style={styles.text}>{'1.  '}</Text>
              <Text style={styles.flexText}>{strings('Home.turnThumbturn')}</Text>
              <Image
                source={require('../assets/unlock.png')}
                style={styles.image}
                resizeMode='contain'/>
            </View>
          </View>
        </View>);

      serial[4] = (<View key={4} style={styles.tableRow}>
          <View style={styles.tableEntry}>
            <View style={styles.row}>
              <Text style={styles.text}>{'2.  '}</Text>
              <TouchableHighlight style={[styles.button, { width: 250 }]} onPress={this.startTest2}>
                <Text style={styles.buttonText}>
                  {strings('Home.startTest2')}
                </Text>
              </TouchableHighlight>
            </View>
          </View>
        </View>);
    }

    return (
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <View style={styles.tableEntry}>
            <View style={{ flex: 1 }}>
              <View style={[styles.row, { justifyContent: 'space-between' }]}>
                <View style={styles.row}>
                  <Image
                    source={this.props.lockObj.imei ? require('../assets/5G-lock-white.png') : require('../assets/lock-white.png')}
                    style={styles.imageSmall}
                    resizeMode='contain'/>
                  <Text style={styles.tableHeaderText}>{lockMac}</Text>
                </View>
                {settingMode || <TouchableOpacity style={{ backgroundColor: 'red', borderRadius: 5, paddingHorizontal: 5, }} onPress={this.resetAlert}>
                    <Text style={{ fontSize, color: 'white' }}>{strings('Home.reset')}</Text>
                  </TouchableOpacity>}
              </View>
            </View>
          </View>
        </View>
        {settingMode ? instructions : serial}
      </View>
    );
  }
}

const fontSize = 22;
const textColor = '#212121';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10,
  },
  tableHeaderText: {
    fontSize,
    color: 'white',
  },
  text: {
    fontSize,
    color: textColor,
  },
  separator: {
    height: 20,
  },
  row: {
    flexDirection: 'row',
  },
  imageSmall: {
    width: 30,
    height: 30,
  },
  image: {
    width: 80,
    height: 80,
  },
  flexText: {
    flex: 1,
    fontSize,
    color: textColor,
  },
  table: {
    margin: Platform.OS === 'ios' ? 20 : 0,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    backgroundColor: 'white',
  },
  tableRow: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'row',
  },
  tableHeader: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'row',
    backgroundColor: '#212121',
  },
  tableRowHeader: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#BDBDBD',
  },
  tableEntry: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'stretch',
    borderLeftWidth: 1,
    borderTopWidth: 1,
    padding: 5,
  },
  tableEntry1: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderTopWidth: 1,
    padding: 5,
  },
  tableEntry2: {
    flexDirection: 'row',
    width: '75%',
  },
  tableEntry3: {
    flexDirection: 'row',
    width: '85%',
  },
  withRefresh: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  instructionsText: {
    alignContent: 'flex-start',
    fontWeight: 'bold',
    fontSize,
  },
  rssiText: {
    fontWeight: 'bold',
    fontSize,
    paddingLeft: 3,
  },
  battery: {
    fontSize: 20,
    paddingRight: 5,
    fontWeight: 'bold',
  },
  batteryContainer: {
    paddingTop: 5,
    borderTopWidth: 1,
    flexDirection: 'row',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 60,
    backgroundColor: '#317ef5',
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 45,
    color: 'white',
  },
});

const mapStateToProps = state => ({ ...state.locks });
// const mapDispatchToProps = { requestTest, startTest1, startTest2, clearLocks };
const mapDispatchToProps = { requestTest };

export default connect(mapStateToProps, mapDispatchToProps)(ListItem);
