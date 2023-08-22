import React from 'react';
import { shallow } from 'enzyme';
import chrome from 'sinon-chrome';
import path from 'path';
import fakeProps from 'react-fake-props';

import configureMockStore from 'redux-mock-store';
import LiveFreezeToggle from '../LiveFreezeToggle';

const mockStore = configureMockStore();

jest.mock('../../../../src/classes/Globals', () => ({
  BROWSER_INFO: { displayName: 'Chrome' },
}));

describe('app/shared-components/LiveFreezeToggle/', () => {
  describe('Snapshot tests with shallow', () => {
    test('LiveFreezeToggle component should render', () => {
      global.chrome = chrome;
      const componentPath = path.join(__dirname, '../LiveFreezeToggle.jsx');
      const props = fakeProps(componentPath);

      const component = shallow(<LiveFreezeToggle {...props} />);
      expect(component).toMatchSnapshot();
    });
  });
});
