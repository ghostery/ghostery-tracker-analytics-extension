import {
  applyMiddleware,
  combineReducers,
  createStore,
} from 'redux';
import thunk from 'redux-thunk';

import PageInfoReducer from './reducers/PageInfoReducer';
import UserInterfaceReducer from './reducers/UserInterfaceReducer';
import SettingsReducer from './reducers/SettingsReducer';

const rootReducer = combineReducers({
  PageInfoReducer,
  UserInterfaceReducer,
  SettingsReducer,
});

export default () => createStore(rootReducer, applyMiddleware(thunk));
