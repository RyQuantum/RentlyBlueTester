/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, { Component } from 'react';
import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Provider } from 'react-redux';
import store from './redux';
import Switch from './screens/Switch';
// import { strings } from './services/i18n';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor } from './redux';

export default class App extends Component {
  onConnectionChange = connectionInfo => {
    const { type } = connectionInfo;
    if (type === 'none') {
      // Alert.alert(strings('login.noNetwork'), strings('login.checkNetwork'));
    }
  };

  UNSAFE_componentWillMount() {
    this.unsubscribe = NetInfo.addEventListener(this.onConnectionChange);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Switch />
        </PersistGate>
      </Provider>
    );
  }
}
