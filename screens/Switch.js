import React, { Component } from 'react';
import { connect } from 'react-redux';
// import { createAppContainer } from 'react-navigation';
// import { createStackNavigator } from 'react-navigation-stack';
import { createStackNavigator } from '@react-navigation/stack';

import Login from './Login';
// import Scanner from './Scanner';
// import Settings from '../screens/Settings';

// const MainNavigator = createStackNavigator({
//   Scanner: Scanner,
//   Settings: Settings,
// }, {
//   initialRouteName: 'Scanner',
// });
// const AppContainer = createAppContainer(MainNavigator);
const Stack = createStackNavigator();

class Switch extends Component {
  render() {
    const { isLoggedIn } = this.props;
    // if (isLoggedIn) {
    //   return <AppContainer/>;
    // } else {

    if (isLoggedIn) {
      return (
        <Stack.Navigator>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Notifications" component={Notifications} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="Settings" component={Settings} />
        </Stack.Navigator>
      );
    }
    return <Login />;
    // }
  }
}

const mapStateToProps = state => state.auth;

export default connect(mapStateToProps)(Switch);
