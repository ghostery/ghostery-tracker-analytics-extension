import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { log } from '../../src/utils/common';

log('In the Options Page');
ReactDOM.render(<App />, document.getElementById('app'));
