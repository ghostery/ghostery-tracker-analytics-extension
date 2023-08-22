import React from 'react';
import { shallow } from 'enzyme';
import chrome from 'sinon-chrome';
import path from 'path';
import fakeProps from 'react-fake-props';

import StandAloneGraphHeader from '../StandAloneGraphHeader';

jest.mock('../../../../src/classes/Globals', () => ({
  BROWSER_INFO: { displayName: 'Chrome' },
}));

describe('app/shared-components/StandAloneGraphHeader/', () => {
  describe('Snapshot tests with shallow', () => {
    test('StandAloneGraphHeader component should render', () => {
      global.chrome = chrome;
      const componentPath = path.join(__dirname, '../StandAloneGraphHeader.jsx');
      const props = fakeProps(componentPath);

      const component = shallow(<StandAloneGraphHeader {...props} />);
      expect(component).toMatchSnapshot();
    });
  });
});
