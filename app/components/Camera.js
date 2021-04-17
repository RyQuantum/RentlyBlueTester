import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Text, View } from 'react-native';
import { RNCamera } from 'react-native-camera';

import { strings, switchLanguage } from '../utils/i18n';

class Camera extends Component {
  constructor(props) {
    super(props);
    this.camera = null;
    this.stopPreview = false;
  }

  componentDidMount() {
    switchLanguage(this.props.language, this);
  }

  onBarCodeRead = async scanResult => {
    if (!this.stopPreview) {
      this.stopPreview = true;
      await this.props.callback(scanResult.data);
      this.stopPreview = false;
    }
  };

  async takePicture() {
    if (this.camera) {
      const options = { quality: 0.5, base64: true };
      const data = await this.camera.takePictureAsync(options);
      console.log(data.uri);
    }
  }

  pendingView() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: 'lightgreen',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text>Waiting</Text>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
          captureAudio={false}
          barcodeFinderVisible={true}
          barcodeFinderWidth={280}
          barcodeFinderHeight={220}
          barcodeFinderBorderColor="white"
          barcodeFinderBorderWidth={2}
          defaultTouchToFocus
          flashMode={RNCamera.Constants.FlashMode.auto}
          mirrorImage={false}
          onBarCodeRead={this.onBarCodeRead.bind(this)}
          onFocusChanged={() => {}}
          onZoomChanged={() => {}}
          androidCameraPermissionOptions={{
            title: strings('LockTest.permission'),
            message: strings('LockTest.permissiondesc'),
          }}
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
        />
        <View style={[styles.overlay, styles.topOverlay]}>
          <Text style={styles.scanScreenMessage}>{strings('LockTest.scanInfo')}</Text>
        </View>
        <View style={[styles.overlay, styles.centerOverlay]}>
          <View style={{ width: '60%', height:'40%', borderWidth: 1, borderColor: '#317ef5', }}/>
        </View>
        <View style={[styles.overlay, styles.bottomOverlay]}>
          <Button
            onPress={this.props.dismiss}
            style={styles.enterBarcodeManualButton}
            title={strings('LockTest.close')}
          />
        </View>
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    padding: 16,
    right: 0,
    left: 0,
    alignItems: 'center',
  },
  topOverlay: {
    top: 0,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centerOverlay: {
    height: '80%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomOverlay: {
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enterBarcodeManualButton: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 40,
  },
  scanScreenMessage: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

const mapStateToProps = state => ({ language: state.auth.language });
export default connect(mapStateToProps)(Camera);
