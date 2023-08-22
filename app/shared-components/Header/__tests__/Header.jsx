import React from 'react';
import { shallow } from 'enzyme';
import chrome from 'sinon-chrome';
import path from 'path';
import fakeProps from 'react-fake-props';

import Header from '../Header';

jest.mock('../../../../src/classes/Globals', () => ({
  BROWSER_INFO: { displayName: 'Chrome' },
}));

describe('app/shared-components/Header/', () => {
  describe('Snapshot tests with shallow', () => {
    test('Header component should render', () => {
      global.chrome = chrome;
      const componentPath = path.join(__dirname, '../Header.jsx');
      const props = fakeProps(componentPath);

      const component = shallow(<Header {...props} />);
      expect(component).toMatchSnapshot();
    });
  });

  describe('Functionality testing', () => {
    test('toggleDropDown should render with setState', () => {
      global.chrome = chrome;
      const componentPath = path.join(__dirname, '../Header.jsx');
      const props = fakeProps(componentPath);

      const component = shallow(<Header {...props} />);
      component.setState({ showDropdown: true });

      expect(component.find('Dropdown').length).toBe(1);
    });
  });
});
