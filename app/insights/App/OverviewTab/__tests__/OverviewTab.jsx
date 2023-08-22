import React from 'react';
import { shallow } from 'enzyme';
import path from 'path';
import fakeProps from 'react-fake-props';

import OverviewTab from '../OverviewTab';

jest.mock('../../../../../src/classes/Globals', () => ({
  BROWSER_INFO: { displayName: 'Chrome' },
}));

describe('app/insights/App/OverviewTab', () => {
  describe('Snapshot tests with react-test-renderer', () => {
    test('OverviewTab component should render', () => {
      const componentPath = path.join(__dirname, '../OverviewTab.jsx');
      const props = fakeProps(componentPath);

      const component = shallow(<OverviewTab {...props} />);
      expect(component).toMatchSnapshot();
    });
  });
});
