import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
  },
  scrollView: {
    justifyContent: 'center',
  },
  logo: {
    resizeMode: 'contain',
    height: 140,
    width: '60%',
    alignSelf: 'center',
  },
  api: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  envText: {
    fontSize: 16,
    paddingTop: 17,
    paddingLeft: 30,
  },
  languageView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageText: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingBottom: 5,
  },
  radioGroup: {
    top: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: 'red',
  },
  marginLarge: {
    margin: 30,
  },
  button: {
    alignItems: 'center',
  },
  loginbutton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 250,
    height: 60,
    marginTop: 0,
    backgroundColor: '#1166bb',
    borderRadius: 5,
  },
  loginbuttonText: {
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgb(216,216,216)',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  iconContainer: {
    top: 20,
    right: 10,
  },
  icon: {
    backgroundColor: 'transparent',
    borderTopWidth: 10,
    borderTopColor: 'gray',
    borderRightWidth: 10,
    borderRightColor: 'transparent',
    borderLeftWidth: 10,
    borderLeftColor: 'transparent',
  },
});

export default styles;
