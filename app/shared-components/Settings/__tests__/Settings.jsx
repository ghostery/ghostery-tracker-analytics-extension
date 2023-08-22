import 'jsdom-global/register';
import React from 'react';
import { shallow } from 'enzyme';
import path from 'path';
import fakeProps from 'react-fake-props';
import chrome from 'sinon-chrome';

import Settings from '../Settings';

jest.mock('../../../../src/classes/Globals', () => ({
  BROWSER_INFO: { displayName: 'Chrome' },
}));

describe('app/shared-components/Settings/', () => {
  describe('Snapshot tests with shallow', () => {
    global.chrome = chrome;
    test('Settings component should render', () => {
      const componentPath = path.join(__dirname, '../Settings.jsx');
      const props = fakeProps(componentPath);

      const component = shallow(<Settings {...props} />);
      expect(component).toMatchSnapshot();
    });
  });
});
