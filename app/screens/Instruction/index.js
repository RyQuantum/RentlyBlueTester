import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { Image, StyleSheet, Text, View } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';

const styles = StyleSheet.create({
  buttonCircle: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, .2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    display: 'flex',
  },
  image:{
    width :'80%',
    height :'80%',
  },
});


const slides = [
  {
    key: 'one',
    title: 'Login screen',
    text: 'Step 1: login',
    image: require('../../assets/1.jpeg'),
    backgroundColor: '#59b2ab',
  },
  {
    key: 'two',
    title: 'Setting screen',
    text: 'Step 2: config the evaluation criteria before testing',
    image: require('../../assets/2.jpeg'),
    backgroundColor: '#febe29',
  },
  {
    key: 'three',
    title: 'Home screen',
    text: 'Step 3: touch the lock to start test',
    image: require('../../assets/3.jpeg'),
    backgroundColor: '#22bcb5',
  }
];

export default class App extends React.Component {
  _renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <Text style={styles.title}>{item.title}</Text>
        <Image source={item.image} style={styles.image} resizeMode="contain" />
        <Text style={styles.text}>{item.text}</Text>
      </View>
    );
  }
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
      />
    );
  }
}
