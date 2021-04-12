import React, { Component } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
// import { NavigationContainer } from '@react-navigation/native';
import { connect } from 'react-redux';

import DiscoverLock from './DiscoverLock';
import { foundLock } from '../redux/locks';

const Tab = createMaterialTopTabNavigator();
const SettingModeScreen = props => <DiscoverLock {...props} isFilterSettingMode={true}/>;
const NonSettingModeScreen = props => <DiscoverLock {...props} isFilterSettingMode={false}/>;

// const Navigator = createMaterialTopTabNavigator({
//     setting: SettingModeScreen,
//     nonSetting: NonSettingModeScreen
//   }, {
//     tabBarPosition: 'top',
//     swipeEnabled: true,
//     animationEnabled: false,
//     lazy: false,
//     backBehavior: 'none',
//     tabBarOptions: {
//       style: {
//         height: 0
//       },
//       indicatorStyle: {
//         height: 0
//       }
//     }
//   }
// );

const Navigator = () => (
  <Tab.Navigator
    backBehavior="none"
    screenOptions={{
      tabBarIndicatorStyle: { height: 0 },
      tabBarStyle: { height: 0 },
    }}>
    <Tab.Screen name="setting" component={SettingModeScreen} />
    <Tab.Screen name="nonSetting" component={NonSettingModeScreen} />
  </Tab.Navigator>
);

class Scanner extends Component {

  static navigationOptions = {
    headerShown: false
  };
  static router = Navigator.router;

  constructor(props) {
    super(props);
    this.state = {
      intervalID: null
    }
  }

  componentDidMount() {
    this.scanForDevices();
  }

  componentWillUnmount() {
    this.stopScanningDevices();
  }

  scanForDevices = () => {
    this.props.libraryObj.on('foundDevice', (device) => {
      this.props.foundLock(device);
    });
    this.props.libraryObj.startScan(5);
    const intervalID = setInterval(() => {
      try {
        this.props.libraryObj.startScan(5);
      } catch (err) {
        alert(err);
      }
    }, 6000);
    this.setState({ intervalID })
  }

  stopScanningDevices = () => {
    try {
      this.props.libraryObj.stopScan();
      this.props.libraryObj.removeListener('foundDevice', this.props.foundLock);
      clearInterval(this.state.intervalID);
    } catch (err) {
      alert(err);
    }
  }

  render() {
    // return <Navigator screenProps={{ navigation: this.props.navigation }}/>
    return <Navigator navigation={this.props.navigation}/>
  }
}

const mapStateToProps = (state) => state.locks;
const mapDispatchToProps = { foundLock };

export default connect(mapStateToProps, mapDispatchToProps)(Scanner);
