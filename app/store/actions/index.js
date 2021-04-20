import * as authActions from './authActions';
import * as locksActions from './locksActions';
import * as testActions from './testActions';

export const ActionCreators = Object.assign(
  {},
  authActions,
  locksActions,
  testActions,
);
