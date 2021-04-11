import React, { Component } from 'react';
import { connect } from 'react-redux';
// import { createAppContainer } from 'react-navigation';
// import { createStackNavigator } from 'react-navigation-stack';
import { createStackNavigator } from '@react-navigation/stack';

import Login from '../../screens/Login';
import Scanner from '../../screens/Scanner';
import Settings from '../../screens/Settings';

// const MainNavigator = createStackNavigator({
//   Scanner: Scanner,
//   Settings: Settings,
// }, {
//   initialRouteName: 'Scanner',
// });
// const AppContainer = createAppContainer(MainNavigator);
const Stack = createStackNavigator();

class Navigator extends Component {
  render() {
    const { isLoggedIn } = this.props;
    // if (isLoggedIn) {
    //   return <AppContainer/>;
    // } else {

    if (isLoggedIn) {
      return (
        <Stack.Navigator>
          <Stack.Screen name="Scanner" component={Scanner} />
          <Stack.Screen name="Settings" component={Settings} />
        </Stack.Navigator>
      );
    }
    return <Login />;
    // }
  }
}

const mapStateToProps = state => state.auth;

export default connect(mapStateToProps)(Navigator);
