import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import { log } from '../../src/utils/common';

log('Made it to the licenses center!');

ReactDOM.render(<App />, document.getElementById('app'));
