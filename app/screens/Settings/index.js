import React, { Component, useState } from 'react';
import { View, Text, Button, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { ButtonGroup, CheckBox, Icon, Input, ListItem } from 'react-native-elements';
import Slider from '@react-native-community/slider';
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
      <ScrollView>
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
          <ListItem
            containerStyle={{}}
            disabledStyle={{ opacity: 0.5 }}
            onLongPress={() => console.log("onLongPress()")}
            onPress={() => console.log("onPress()")}
            pad={20}>
            <ListItem.Content>
              {/*<ListItem.Title>*/}
              {/*  <Text>Pranshu Chittora</Text>*/}
              {/*</ListItem.Title>*/}
              <ListItem.Subtitle>
                <Text>RSSI</Text>
              </ListItem.Subtitle>
              <Slider
                step={1}
                width="100%"
                minimumValue={-100}
                maximumValue={0}
                value={this.state.initialRssiThreshold}
                onValueChange={()=> {}}
              />
              <ListItem.Subtitle>
                <Text>Battery</Text>
              </ListItem.Subtitle>
              <Slider
                step={1}
                width="100%"
                minimumValue={-100}
                maximumValue={0}
                value={this.state.initialRssiThreshold}
                onValueChange={()=> {}}
              />
              <Input
                placeholder="Fob number"
                leftIcon={{ type: 'font-awesome', name: 'credit-card' }}
                style={styles}
                onChangeText={value => this.setState({ comment: value })}
              />
            </ListItem.Content>
          </ListItem>
          <View style={{ height: 20 }}/>
          <ListItem
            containerStyle={{}}
            disabledStyle={{ opacity: 0.5 }}
            onLongPress={() => console.log("onLongPress()")}
            onPress={() => console.log("onPress()")}
            pad={20}>
            <ListItem.Content>
              <Text style={{ paddingBottom: 5 }}>Please get the current largest serial number</Text>
              <ButtonGroup
                onPress={() => {}}
                selectedIndex={1}
                buttons={['V3 Lock', 'Access Panel', '5G Lock']}
                containerStyle={{}}
              />
              <Button title="Get Largest SN" />
            </ListItem.Content>
          </ListItem>
          <View style={{ height: 20 }} />
          <App />
        </View>
      </ScrollView>
    );
  }
}
function App() {
  const [expanded, setExpanded] = useState(false);
  const list = [
    {
      name: 'Amy Farha',
      avatar_url:
        'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
      subtitle: 'Vice President',
    }
  ];
  return (
    <ListItem.Accordion
      content={
        <>
          <Icon name="place" size={30} />
          <ListItem.Content>
            <ListItem.Title>RSSI filter</ListItem.Title>
          </ListItem.Content>
        </>
      }
      isExpanded={expanded}
      onPress={() => {
        setExpanded(!expanded);
      }}>
      {list.map((l, i) => (
        <ListItem key={i} bottomDivider>
          <ListItem.Subtitle>
            <Text>RSSI</Text>
          </ListItem.Subtitle>
          <Slider
            step={1}
            width="80%"
            minimumValue={-100}
            maximumValue={0}
            value={-50}
            onValueChange={()=> {}}
          />
        </ListItem>
      ))}
    </ListItem.Accordion>
  );
}

const mapStateToProps = (state) => state.locks;
const mapDispatchToProps = {
  setThreshold,
  setEnabled,
  // setDevelopmentMode,
  getMaximumSerialNoRequest,
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
