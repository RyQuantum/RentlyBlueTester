import React, { Component } from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { connect } from 'react-redux';
import Spinner from 'react-native-loading-spinner-overlay';
import { Icon } from 'react-native-elements';

import ListItem, {ListItemSeparator} from '../../../components/ListItem';
import Placeholder from '../../../components/Placeholder';
// import Test1Modal from './Test1Modal';
// import Test2Modal from './Test2Modal';
import TestModal from '../../screens/TestModal';
import { strings, switchLanguage } from '../../utils/i18n';
import { requestLogout } from '../../store/actions/authActions';
import styles from './styles';

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
    const { requestLogout } = this.props;
    Alert.alert(strings('Home.confirmLogout'), '', [
      { text: strings('Home.cancel'), onPress: () => {} },
      { text: strings('Home.ok'), onPress: requestLogout },
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
              name="cog"
              type="material-community"
              size={22}
              color="black"
            />
            <Text style={styles.text}>{`${strings('Home.settings')} `}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.logout}>
          <View style={styles.row}>
            <Text style={styles.text}>{`${strings('Home.logout')} `}</Text>
            <Icon
              name="logout"
              type="material-community"
              size={22}
              color="black"
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
        <TestModal />
        {/*{this.props.isFilterSettingMode || <Test1Modal/>}*/}
        {/*{this.props.isFilterSettingMode && <Test2Modal/>}*/}
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

const mapStateToProps = state => ({ ...state.locks, language: state.auth.language });
const mapDispatchToProps = { requestLogout };

export default connect(mapStateToProps, mapDispatchToProps)(DiscoverLock);
