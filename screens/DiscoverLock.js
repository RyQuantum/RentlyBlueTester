import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import {connect} from 'react-redux';
import Spinner from 'react-native-loading-spinner-overlay';

import { logout } from '../redux/auth';
import ListItem, {ListItemSeparator} from '../components/ListItem';
import Placeholder from '../components/Placeholder';
import TestModal from './TestModal';
import Test1Modal from './Test1Modal';
import Test2Modal from './Test2Modal';
import {Icon} from 'react-native-elements';
import { strings, switchLanguage } from '../services/i18n';

const textColor = 'black';

class DiscoverLock extends Component {

  static navigationOptions = {
    headerShown: false
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      devices: [],
    };
  }

  componentDidMount() {
    switchLanguage(this.props.language, this);
  }

  keyExtractor = (item) => item.lockMac;

  renderItem = ({ item }) => {
    return <ListItem lockObj={item} onChangeLoading={ (loading, callback) => this.setState({ loading }, callback)}/>;
  };

  logout = () => {
    const {logout} = this.props;
    Alert.alert(strings('Home.confirmLogout'), '', [
      { text: strings('Home.cancel'), onPress: () => {} },
      { text: strings('Home.ok'), onPress: logout },
    ]);
  };

  render() {
    const {
      settingLocks,
      nonSettingLocks,
      isFilterSettingMode,
      checkEnabled,
      rssiThreshold,
    } = this.props;
    let data = isFilterSettingMode ? settingLocks : nonSettingLocks;
    if (checkEnabled) {
      data = data.filter(({ rssi }) => rssi >= rssiThreshold);
    }

    const header = (
        <View style={styles.header}>
          <TouchableOpacity onPress={()=> this.props.navigation.navigate('Settings')}>
            <View style={styles.row}>
              <Icon
                  name='cog'
                  type='material-community'
                  size={22}
                  color={textColor}
              />
              <Text style={styles.text}>{`${strings('Home.settings')} `}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.logout}>
            <View style={styles.row}>
              <Text style={styles.text}>{`${strings('Home.logout')} `}</Text>
              <Icon
                name='logout'
                type='material-community'
                size={22}
                color={textColor}
              />
            </View>
          </TouchableOpacity>
        </View>
    );

    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: isFilterSettingMode ? '#42A5F5' : '#FB8C00' }
        ]}
      >
        {header}
        <View style={styles.margin}/>
        {this.props.isFilterSettingMode || <TestModal/>}
        {this.props.isFilterSettingMode || <Test1Modal/>}
        {this.props.isFilterSettingMode && <Test2Modal/>}
        {data.length === 0 ? <Placeholder isFilterSettingMode={isFilterSettingMode}/> :
          <FlatList
            data={data}
            extraData={this.props}
            ItemSeparatorComponent={ListItemSeparator}
            keyExtractor={this.keyExtractor}
            renderItem={this.renderItem}
          />}
        <Spinner visible={this.state.loading}/>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginStart: 20,
    marginEnd: 20
  },
  text: {
    fontSize: 22,
    color: textColor,
  },
  margin: {
    height: 20,
  }
});

const mapStateToProps = (state) => ({ ...state.locks, language: state.auth.language });
const mapDispatchToProps = { logout };

export default connect(mapStateToProps, mapDispatchToProps)(DiscoverLock);
