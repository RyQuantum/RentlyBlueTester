import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginStart: 20,
    marginEnd: 20,
  },
  text: {
    fontSize: 22,
    color: 'black',
  },
  margin: {
    height: 20,
  },
});

export default styles;
