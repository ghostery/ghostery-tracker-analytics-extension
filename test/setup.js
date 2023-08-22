/**
 * Setup File for Jest
 *
 * Ghostery Browser Extension
 * http://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

// Set up Enzyme for React Snapshot testing
import Adapter from 'enzyme-adapter-react-16';
import Enzyme from 'enzyme';
import { shallow, configure } from 'enzyme';
Enzyme.configure({ adapter: new Adapter() });

if (typeof window !== 'object') {
  global.window = global;
  global.window.navigator = {};
}
