import React, { Component } from 'react';
import { View, Text, Slider, Button } from 'react-native';
import { connect } from 'react-redux';
import { CheckBox } from 'react-native-elements';
import { BarIndicator } from 'react-native-indicators';
import RadioGroup from 'react-native-radio-button-group';

// import { setDevelopmentMode } from '../../../redux/locks';
import { setEnabled, setThreshold, getMaximumSerialNoRequest } from '../../store/actions/locksActions';
import { strings } from '../../utils/i18n';
import styles from './styles';

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
              // onPress={this.props.setDevelopmentMode}
            />
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
                onPress={() => this.props.getMaximumSerialNoRequest(this.state.modelNum)}
                disabled={this.state.modelNum === 0}
                title={strings('Settings.getSnButton')}
                style={styles.button}
              />
              {this.props.maxSerialNumber === -1 ?
                <BarIndicator style={{ flex: 0, paddingHorizontal: 7 }} color='grey'/> :
                <Text style={styles.serialNumber}>{this.props.maxSerialNumber}</Text>}
            </View>
          </View>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => state.locks;
const mapDispatchToProps = {
  setThreshold,
  setEnabled,
  // setDevelopmentMode,
  getMaximumSerialNoRequest,
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
