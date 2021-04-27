import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Login from '../screens/Login';
import Instruction from '../screens/Instruction';
import Scanner from './Scanner';
import Settings from '../screens/Settings';

const Stack = createStackNavigator();

class StackNavigator extends Component {
  constructor() {
    super();
    this.state = {
      isFirstLaunch: false,
    };
    // AsyncStorage.removeItem('HAS_LAUNCHED');
  }

  async componentDidMount() {
    const hasLaunched = await AsyncStorage.getItem('HAS_LAUNCHED');
    this.setState({ isFirstLaunch: hasLaunched === null });
  }

  render() {
    const { isFirstLaunch } = this.state;
    const { isLoggedIn } = this.props;

    if (isLoggedIn) {
      return (
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Scanner" component={Scanner} options={{ headerStyle: { height: 0 } }} />
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="Instruction" component={Instruction} options={{ headerStyle: { height: 0 }, headerLeft: ()=> null }} />
          </Stack.Navigator>
        </NavigationContainer>
      );
    }
    return isFirstLaunch ?
      <Instruction onDone={() => this.setState({ isFirstLaunch: false })} /> :
      <Login />;
  }
}

const mapStateToProps = state => state.auth;
export default connect(mapStateToProps)(StackNavigator);
