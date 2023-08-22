/*!
 * App Tab UI
 *
 * Insights by Ghostery
 * https://www.ghostery.com/insights/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 * See https://www.ghostery.com/eula for license agreement.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import App from './App';
import createStore from '../store/createStore';
import { log } from '../../src/utils/common';

log('In Ghostery Insights Tab');

const store = createStore();

ReactDOM.render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('app'));
