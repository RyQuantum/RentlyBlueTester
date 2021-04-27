import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { Image, StyleSheet, Text, View } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import AsyncStorage from '@react-native-async-storage/async-storage';

import styles from './styles';

const slides = [
  {
    key: 'one',
    title: '第一步 - 用户登录',
    text: '1. 正确填写用户信息 \n2. 电脑打开本地服务器，local server显示IP地址\n3. 登录',
    image: require('../../assets/1.png'),
    backgroundColor: '#59b2ab',
  },
  {
    key: 'two',
    title: '第二步 - 设置界面',
    text: '1. 登录成功后点击左上角"设置"，进入设置界面\n2. 根据测试需求设定评价标准\n*3. 当多人同时测试时设定RSSI阈值，防止互相干扰',
    image: require('../../assets/2.png'),
    settingsButton: require('../../assets/settings-button.png'),
    backgroundColor: 'rgb(93, 89, 184)',
  },
  {
    key: 'three',
    title: '第三步 - 准备测试',
    text: '1. 切换到蓝色界面，触摸锁正面、点亮前面板\n2. 保证手机处在洛杉矶时区\n3. 旋转锁至关锁位置\n4. 点击"开始测试"',
    image: require('../../assets/3.png'),
    backgroundColor: '#ffb700',
  },
  {
    key: 'four',
    title: '第四步 - 测试进行',
    text: '1. 共11个测试项目\n2. 请根据提示完成对应操作\n3. 如有错误按照提示尝试修复，无法修复则汇报\n4. 所有都通过点击完成，继续下一把锁',
    image: require('../../assets/4.png'),
    backgroundColor: 'rgb(98, 177, 91)',
  },
];

export default class App extends React.Component {

  _renderItem = ({ item }) => {
    return (
      <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
        <Text style={styles.title}>{item.title}</Text>
        <Image source={item.image} style={styles.image} resizeMode="contain" />
        <Text style={styles.text}>{item.text}</Text>
      </View>
    );
  };

  _renderNextButton = () => {
    return (
      <View style={styles.buttonCircle}>
        <Icon
          name="md-arrow-forward-outline"
          color="rgba(255, 255, 255, .9)"
          size={24}
        />
      </View>
    );
  };

  _renderDoneButton = () => {
    return (
      <View style={styles.buttonCircle}>
        <Icon
          name="md-checkmark"
          color="rgba(255, 255, 255, .9)"
          size={24}
        />
      </View>
    );
  };

  render() {
    return (
      <AppIntroSlider
        data={slides}
        renderItem={this._renderItem}
        renderDoneButton={this._renderDoneButton}
        renderNextButton={this._renderNextButton}
        onDone={() => {
          AsyncStorage.setItem('HAS_LAUNCHED', 'true');
          this.props.onDone ? this.props.onDone() : this.props.navigation.goBack();
        }}
      />
    );
  }
}
