import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'black',
    padding: 10,
  },
  back: {
    alignSelf: 'flex-start',
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    // color: 'white',
    fontSize: 20,
    padding: 3,
  },
  result: {
    color: '#00bb00',
    fontSize: 20,
    padding: 3,
  },
  error: {
    color: '#ff0000',
    fontSize: 20,
    padding: 3,
  },
  button: {
    color: '#0000ff',
    fontSize: 20,
    padding: 3,
  },
  image: {
    width: 100,
    height: 100,
  },
  retryInstruction: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default styles;
