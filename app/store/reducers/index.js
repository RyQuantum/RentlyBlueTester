import * as authReducer from './authReducer';
import * as locksReducer from './locksReducer';
import * as testReducer from './testReducer';
export default Object.assign(authReducer, locksReducer, testReducer);
