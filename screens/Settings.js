import React, { Component } from 'react';
import {View, Text, StyleSheet, Slider, Button} from 'react-native';
import {connect} from 'react-redux';
import {CheckBox} from 'react-native-elements'
import { BarIndicator } from 'react-native-indicators';
import RadioGroup from 'react-native-radio-button-group';

import { setThreshold, setEnabled, getMaximumSerialNumber, setDevelopmentMode } from '../redux/locks';
import { strings } from '../app/utils/i18n';

class Settings extends Component {
  static navigationOptions ={
    title: strings('Home.settings'),
  };

  constructor(props) {
    super(props);
    this.state = {
      initialRssiThreshold: props.rssiThreshold,
      modelNum: 0,
      partner_options: [
        { id: 10, label: strings('Settings.v3Lock') },
        { id: 11, label: strings('Settings.commonAccess') },
        { id: 12, label: strings('Settings.nbLock') },
      ]
    };
  }

  render() {
    return (
      <View>
        <View style={styles.settingsView}>
          <View style={{ opacity: this.props.checkEnabled ? 1: 0.5 }}>
            <CheckBox
              title="Development Mode"
              checked={this.props.isDevelopmentMode}
              onPress={this.props.setDevelopmentMode}/>
            <CheckBox
              title={strings('Settings.threshold')}
              checked={this.props.checkEnabled}
              onPress={this.props.setEnabled}/>
            <Text style={{marginStart: 20}}>
              {strings('Settings.rssiText')}
            </Text>
          </View>
          {this.props.checkEnabled && (
            <View style={styles.SliderView}>
              <Slider
                step={1}
                width={200}
                minimumValue={-100}
                maximumValue={0}
                value={this.state.initialRssiThreshold}
                onValueChange={this.props.setThreshold}
              />
              <Text>{this.props.rssiThreshold}</Text>
            </View>
          )}
          <View>
            <Text style={styles.largestSn}>
              {strings('Settings.getSn')}
            </Text>
            <RadioGroup
              horizontal
              options={this.state.partner_options}
              activeButtonId={this.state.partnerId}
              onChange={({ id }) => this.setState({ modelNum: id })}
            />
            <View style={styles.getSerialNumberView}>
              <Button
                onPress={() => this.props.getMaximumSerialNumber(this.state.modelNum)}
                disabled={this.state.modelNum === 0}
                title={strings('Settings.getSnButton')}
                style={styles.button}
              />
                {this.props.maxSerialNumber === 'loading' ?
                  <BarIndicator style={{ flex: 0, paddingHorizontal: 7 }} color='grey'/> :
                  <Text style={styles.serialNumber}>{this.props.maxSerialNumber}</Text>}
            </View>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  titleText: {
    marginStart: 20,
    marginTop: 20,
    fontWeight: 'bold',
    fontSize: 20,
  },
  settingsView: {
    margin: 20,
  },
  SliderView: {
    flexDirection: 'row',
    marginTop: 20,
  },
  largestSn: {
    marginVertical: 20,
  },
  getSerialNumberView:{
    flexDirection: 'row',
  },
  serialNumber:{
    marginLeft: 10,
    fontWeight: 'bold',
    fontSize: 20,
    alignSelf: 'center',
  }
});

const mapStateToProps = (state) => state.locks;
const mapDispatchToProps = {
    setThreshold,
    setEnabled,
    setDevelopmentMode,
    getMaximumSerialNumber
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
