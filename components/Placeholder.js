import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { strings } from '../services/i18n';

export default class Placeholder extends PureComponent {
  render() {
    const isFilterSettingMode = this.props.isFilterSettingMode;
    const swipeImage = isFilterSettingMode ? require('../assets/swipe-left.png') : require('../assets/swipe-right.png');

    return (
      <View style={styles.container}>
        <View style={[styles.SwipeImgContainer, { alignSelf: isFilterSettingMode ? 'flex-start' : 'flex-end' }]}>
          <Image style={styles.swipeLeft} resizeMode='contain' source={swipeImage}/>
          <Text style={styles.swipeImg}>{isFilterSettingMode ? strings('Home.toScanNonsettingModeLocks') : strings('Home.toScanSettingModeLocks')}</Text>
        </View>
        <View style={styles.keypadContainer}>
          <Image style={styles.image} source={require('../assets/touch.png')} resizeMode='contain'/>
          <Text style={styles.keypadImg}>{strings('Home.touchLock')}</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    backgroundColor: 'transparent',
  },
  SwipeImgContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeLeft: {
    alignSelf: 'flex-start',
    height: '30%',
  },
  keypadContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  image: {
    width: 150,
    height: 150,
  },
  swipeImg: {
    paddingTop: 5,
    fontSize: 16,
    textAlign: 'center'
  },
  keypadImg: {
    paddingTop: 10,
    fontSize: 28,
    color: 'black',
  }
});
