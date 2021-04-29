import React, { Component } from 'react';
import { connect } from 'react-redux';
import { TextField } from 'rn-material-ui-textfield';
import RadioGroup from 'react-native-radio-button-group';
import Spinner from 'react-native-loading-spinner-overlay';
import { Dropdown } from 'react-native-material-dropdown';
import Zeroconf from 'react-native-zeroconf';
import {
  ScrollView,
  View,
  SafeAreaView,
  TouchableHighlight,
  Text,
  PermissionsAndroid,
  Platform,
  Image,
  Alert,
} from 'react-native';

import { strings, switchLanguage } from '../../utils/i18n';
import { MapUrl } from '../../utils/Constants';
import { requestLogin } from '../../store/actions/authActions';
import styles from './styles';

const APIs = [
  { value: 'Production' },
  { value: 'Staging' },
  { value: 'Opensesame' },
  { value: 'Certify'},
  { value: 'Blue' },
  { value: 'Red' },
  { value: 'Black' },
  { value: 'Green' },
  { value: 'Sapphire' },
  { value: 'White' },
  { value: 'QE' },
];
if (__DEV__) {
  APIs.unshift({ value: '192.168.2.8:3000' });
}

const partner_options = [
  { id: 2, label: 'B2B' },
  { id: 3, label: 'B2C' },
];

let radiogroup_options = [
  { id: 0, label: strings('login.english'), value: 'english' },
  { id: 1, label: strings('login.chinese'), value: 'chinese' },
];

class Login extends Component {
  constructor(props) {
    super(props);
    let username = props.username;
    let password = '';
    if (__DEV__) {
      username = 'admin@gmail.com';
      password = 'admin';
    }
    this.state = {
      username,
      password,
      url: props.url,
      batchNo: props.batchNo,
      partnerId: props.partnerId || 2,
      language: props.language,
      partners: [],
      permission: PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      localServerIp: null,
    };
    this.zeroconf = new Zeroconf();
  }

  componentDidMount() {
    this.zeroconf.on('resolved', service => {
      console.log('[Resolve] host:', service.addresses[0]);
      this.setState({
        localServerIp: service.host === 'ryan-MBA.local.' ? service.addresses[0] : this.state.localServerIp
      })
    });
    this.zeroconf.on('error', err => {
      console.log('[Error]:', err);
    });
    this.zeroconf.scan('http', 'tcp', 'local.');
    this.zeroconfEnabled = true;
    this.interval = setInterval(() => {
      this.zeroconfEnabled === true ? this.zeroconf.stop() : this.zeroconf.scan('http', 'tcp', 'local.');
      this.zeroconfEnabled = !this.zeroconfEnabled;
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    this.zeroconf.stop();
    this.zeroconf.removeDeviceListeners();
  }

  isAlphaNumeric(str) {
    var letter = /[a-zA-Z]/;
    var number = /[0-9]/;
    var isvalid = number.test(str) && letter.test(str); //match a letter _and_ a number
    return isvalid;
  }

  login = async () => {
    if (Platform.OS !== 'ios') {
      const hasPermission = await PermissionsAndroid.check(this.state.permission);
      if (!hasPermission) {
        const res = await PermissionsAndroid.request(this.state.permission);
        if (res === 'denied') return;
      }
    }

    const { url, username, password, batchNo, language, partnerId } = this.state;

    const bleState = await this.props.libraryObj._lockController._blePlugin.manager.state();
    if (bleState === 'PoweredOff') return Alert.alert(strings('login.turnOnBluetooth'))
    if (!url) return alert(strings('login.envEmptyMsg'));
    if (
      this.state.batchNo.length === 0 ||
      this.isAlphaNumeric(this.state.batchNo) === false
    )
      return alert(strings('login.batchNoValidationMsg'));
    if (!partner_options.map(p => p.id).includes(this.state.partnerId))
      return alert(strings('login.partnerEmptyMsg'));

    const isB2b = partnerId === partner_options[0].id;
    const localServerIp = this.state.localServerIp;
    if (url === 'app2.keyless.rocks' && this.state.localServerIp === null) {
      return alert(strings('login.nonLocalServerMsg'));
    }

    this.props.requestLogin({ url, username, password, batchNo, language, partnerId, isB2b, localServerIp });
  };

  render() {
    const {username, password, batchNo} = this.state;
    const disabled = !username || !password;
    const { error, isFetching, language } = this.props;
    const version = require('../../../package').dependencies.blelocklibrary.split('#')[1];

    const errorMessage = error &&
      <Text style={styles.error}>
        {(typeof error === 'object' &&
          typeof error.response === 'object' &&
          typeof error.response.status === 'number' &&
          error.response.status.toString().startsWith('4')
        ) ? strings('login.invalidCredentials') : error.message}
      </Text>;

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} />
          <View style={styles.api}>
            <Dropdown
              label={strings('login.environment')}
              value={this.state.url ? MapUrl.find(item => item.url === (this.state.url)).name : this.state.url}
              dropdownMargins={{ min: 8, max: 16 }}
              containerStyle={{ width: "60%" }}
              pickerStyle={{ height: 340 }}
              data={APIs}
              onChangeText={env => {
                let urlsObj = MapUrl.find(item => item.name === env);
                let url = urlsObj.url;
                this.setState({ url });
              }}
            />
            <Text style={styles.envText}>BLE lib: {version}</Text>
          </View>
          <TextField
            label={strings('login.username')}
            value={username}
            onChangeText={this.setUsername}
            autoCorrect={false}
            autoCapitalize='none'
            keyboardType='email-address'
          />
          <TextField
            label={strings('login.password')}
            value={password}
            onChangeText={this.setPassword}
            autoCapilatize='none'
            autoCorrect={false}
            autoFocus={true}
            secureTextEntry
          />
          <TextField
            label= {strings('login.batchNo')}
            value={batchNo}
            onChangeText={this.setBatchNo}
            autoCorrect={false}
            autoCapitalize='none'
          />
          <View style={[styles.languageView, { display: 'none' }]}>
            <Text style={styles.languageText}>
              {strings('login.partner') + ': '}
            </Text>
            <View style={styles.radioGroup}>
              <RadioGroup
                horizontal
                options={partner_options}
                activeButtonId={this.state.partnerId}
                onChange={({ id }) => this.setState({ partnerId: id })}
              />
            </View>
          </View>
          <View style={styles.languageView}>
            <Text style={styles.languageText}>
              {strings('login.language') + ': '}
            </Text>
            <View style={styles.radioGroup}>
              <RadioGroup
                horizontal
                options={radiogroup_options}
                activeButtonId={(language === 'en') ? 0 : 1}
                onChange={(option) => {
                  const {id} = option;
                  (id === 0) ? this.setState({language: 'en'}) : this.setState({language: 'zh'});
                  const langcode = (id === 0) ? 'en' : 'zh';
                  switchLanguage(langcode, this);
                }
                }
              />
            </View>
          </View>
          {errorMessage}
          <View style={styles.marginLarge} />
          <View style={styles.button}>
            <Spinner visible={isFetching}/>
            <TouchableHighlight
              style={styles.loginbutton}
              onPress={this.login}
              disabled={disabled}>
              <Text style={styles.loginbuttonText}>
                {strings('login.login')}
              </Text>
            </TouchableHighlight>
          </View>
        </ScrollView>
        <View style={{ flexDirection: 'row' }}>
          <Text testID="local-server" accessibilityLabel="local-server" style={{ padding: 10 }}>local server: {this.state.localServerIp || 'none'}</Text>
          <Text testID="version" accessibilityLabel="version" style={{ padding: 10 }}>Version: {require('../../../package.json').version}</Text>
        </View>
      </SafeAreaView>
    );
  }

  setUsername = username => this.setState({ username });
  setBatchNo = batchNo => this.setState({ batchNo });
  setPassword = password => this.setState({ password });
}

const mapStateToProps = state => ({ ...state.auth, libraryObj: state.locks.libraryObj });
const mapDispatchToProps = { requestLogin };

export default connect(mapStateToProps, mapDispatchToProps)(Login);
