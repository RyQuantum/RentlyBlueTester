import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import Login from './Login';
import Scanner from './Scanner';
import Settings from '../screens/Settings';

const Stack = createStackNavigator();

class Switch extends Component {
  render() {
    const { isLoggedIn } = this.props;
    if (isLoggedIn) {
      return (
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Scanner" component={Scanner} options={{ headerStyle: { height: 0 } }}/>
            <Stack.Screen name="Settings" component={Settings} />
          </Stack.Navigator>
        </NavigationContainer>
      );
    }
    return <Login />;
  }
}

const mapStateToProps = state => state.auth;

export default connect(mapStateToProps)(Switch);
