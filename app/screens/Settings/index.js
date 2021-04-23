import React, { Component, useState } from 'react';
import { View, Text, Button, ScrollView, ActivityIndicator } from 'react-native';
import { connect } from 'react-redux';
import { ButtonGroup, Icon, Input, ListItem } from 'react-native-elements';
import Slider from '@react-native-community/slider';

// import { setDevelopmentMode } from '../../../redux/locks';
import {
  updateCriteria,
  setIndex,
  getMaximumSerialNoRequest,
  setEnabled,
  setThreshold,
} from '../../store/actions/locksActions';
import { strings } from '../../utils/i18n';
import styles from './styles';

const CriteriaSlider = ({ name, min, max, value: v, unit, callback }) => {
  const [value, setValue] = useState(v);
  return (
    <>
      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <Text>{name}</Text>
        </View>
        <View style={{ flex: 1 }} />
        <View>
          <Text>{value}{unit}</Text>
        </View>
      </View>
      <Slider
        step={1}
        width="100%"
        minimumValue={min}
        maximumValue={max}
        minimumTrackTintColor="lightgrey"
        maximumTrackTintColor="#07f"
        value={value}
        onValueChange={v => setValue(v)}
        onSlidingComplete={v => callback(v)}
      />
    </>
  );
};

const FobNumberInput = ({ callback, value }) => {
  const [fobNumber, setFobNumber] = useState(value);
  const errorMsg = 'The length of fob number is less than 10 digits';
  let errorMessage = (fobNumber && fobNumber.length !== 10) ? errorMsg : '';
  return (
    <Input
      maxLength={10}
      keyboardType="number-pad"
      placeholder="Fob number"
      value={fobNumber}
      leftIcon={{ type: 'font-awesome', name: 'credit-card' }}
      style={styles}
      errorMessage={errorMessage}
      onChangeText={text => {
        setFobNumber(text);
        errorMessage = (text && text.length !== 10) ? errorMsg : '';
        if (errorMessage) return;
        callback(text);
      }}
    />
  );
}

const RssiListItem = ({ callback, value }) => {
  const [rssi, setRssi] = useState(value);
  return (
    <>
      <ListItem.Subtitle style={{ paddingRight: 10 }}>
        <Text>RSSI</Text>
      </ListItem.Subtitle>
      <Slider
        step={1}
        width="80%"
        minimumValue={-100}
        maximumValue={0}
        minimumTrackTintColor="lightgrey"
        maximumTrackTintColor="#07f"
        value={rssi}
        onValueChange={setRssi}
        onSlidingComplete={v => callback(v)}
      />
      <ListItem.Subtitle style={{ paddingLeft: 2 }}>
        <Text>{rssi}</Text>
      </ListItem.Subtitle>
    </>
  );
};

class Settings extends Component {
  static navigationOptions ={
    title: strings('Home.settings'),
  };

  constructor(props) {
    super(props);
    this.state = {
      ...props.criteria,
      // expanded: props.checkEnabled,
      selectedIndex: props.selectedIndex,
    };
  }

  updateCriteria = () => {
    this.props.updateCriteria({ rssi :this.state.rssi, battery :this.state.battery, fobNumber :this.state.fobNumber });
  };

  render() {
    return (
      <ScrollView>
        <View style={styles.settingsView}>
          {/*<View style={{ opacity: this.props.checkEnabled ? 1: 0.5 }}>*/}
          {/*  <CheckBox*/}
          {/*    title="Development Mode"*/}
          {/*    checked={this.props.isDevelopmentMode}*/}
          {/*    // onPress={this.props.setDevelopmentMode}*/}
          {/*  />*/}
          {/*</View>*/}
          <ListItem
            disabledStyle={{ opacity: 0.5 }}
            Component={View}
            pad={20}>
            <ListItem.Content>
              <ListItem.Title>
                <Text>Evaluation Criteria</Text>
              </ListItem.Title>
              <View style={{ height: 10 }}/>
              <CriteriaSlider
                name="RSSI"
                min={-100}
                max={0}
                value={this.state.rssi}
                unit=" dBm"
                callback={rssi =>
                  this.setState({ rssi }, () => this.updateCriteria())
                }
              />
              <CriteriaSlider
                name="Battery"
                min={0}
                max={100}
                value={this.state.battery}
                unit="%"
                callback={battery =>
                  this.setState({ battery }, () => this.updateCriteria())
                }
              />
              <FobNumberInput
                value={this.state.fobNumber}
                callback={fobNumber => {
                  this.setState({ fobNumber }, () => this.updateCriteria());
                }}
              />
            </ListItem.Content>
          </ListItem>
          <Text style={{ padding: 14, color: 'grey' }}>The result beyond criteria is considered a failure</Text>
          <View style={{ height: 20 }}/>
          <ListItem
            containerStyle={{}}
            disabledStyle={{ opacity: 0.5 }}
            Component={View}
            pad={20}>
            <ListItem.Content>
              <ListItem.Title>
                <Text>Maximum Serial Number</Text>
              </ListItem.Title>
              <View style={{ height: 10 }} />
              <ButtonGroup
                onPress={selectedIndex => {
                  this.setState({ selectedIndex }, () => this.props.setIndex(selectedIndex));
                }}
                selectedIndex={this.state.selectedIndex}
                buttons={['V3 Lock', 'Access Panel', '5G Lock']}
              />
              <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingRight: 10 }}>
                <Button title="Get Largest SN" onPress={() => this.props.getMaximumSerialNoRequest('1' + this.props.selectedIndex)} />
                {this.props.maxSerialNumber === -1 ?
                  <ActivityIndicator style={{ paddingHorizontal: 40 }} color='grey'/> :
                  <Text style={styles.serialNumber}>{this.props.maxSerialNumber}</Text>}
              </View>
            </ListItem.Content>
          </ListItem>
          <Text style={{ padding: 14, color: 'grey' }}>Press to get the current largest serial number</Text>
          <View style={{ height: 20 }} />
          <ListItem.Accordion
            content={
              <>
                <Icon name="signal-cellular-alt" size={30} />
                <ListItem.Content>
                  <ListItem.Title>RSSI Threshold</ListItem.Title>
                </ListItem.Content>
              </>
            }
            isExpanded={this.props.checkEnabled}
            icon={{ name: 'checkbox-blank-outline', type: 'material-community' }}
            expandIcon={{ name: 'checkbox-marked-outline', type: 'material-community' }}
            noRotation={true}
            onPress={() => this.props.setEnabled(!this.props.checkEnabled)}
          >
            <ListItem style={{ width: '100%' }}>
              <RssiListItem value={this.props.rssiThreshold} callback={this.props.setThreshold} />
            </ListItem>
          </ListItem.Accordion>
          <Text style={{ padding: 14, color: 'grey' }}>{strings('Settings.rssiText')}</Text>
        </View>
      </ScrollView>
    );
  }
}

const mapStateToProps = state => state.locks;
const mapDispatchToProps = {
  setIndex,
  setThreshold,
  setEnabled,
  // setDevelopmentMode,
  updateCriteria,
  getMaximumSerialNoRequest,
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
