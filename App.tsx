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
import NetInfo, { NetInfoSubscription } from '@react-native-community/netinfo';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import store from './app/store';
import Navigation from './app/navigation';
import { strings } from './app/utils/i18n';
import { persistor } from './app/store';

export interface Props {}

export default class App extends Component {
  private readonly unsubscribe: NetInfoSubscription;
  constructor(props: Props) {
    super(props);
    this.unsubscribe = NetInfo.addEventListener(connectionInfo => {
      const { type } = connectionInfo;
      if (type === 'none') {
        Alert.alert(strings('login.noNetwork'), strings('login.checkNetwork'));
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Navigation />
        </PersistGate>
      </Provider>
    );
  }
}
