import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  buttonCircle: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, .2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: 'white',
    paddingVertical: 20,
  },
  text: {
    fontSize: 16,
    color: 'white',
    paddingVertical: 20,
    lineHeight: 24,
  },
  slide: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
  },
  image:{
    width :'70%',
    height :'70%',
  },
});

export default styles;
