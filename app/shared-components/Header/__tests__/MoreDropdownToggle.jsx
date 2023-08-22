import React from 'react';
import { shallow } from 'enzyme';
import chrome from 'sinon-chrome';
import path from 'path';
import fakeProps from 'react-fake-props';

import MoreDropdownToggle from '../MoreDropdownToggle';

jest.mock('../../../../src/classes/Globals', () => ({
  BROWSER_INFO: { displayName: 'Chrome' },
}));

describe('app/shared-components/Header/MoreDropdownToggle', () => {
  describe('Snapshot tests with shallow', () => {
    test('MoreDropdownToggle component should render', () => {
      global.chrome = chrome;
      const componentPath = path.join(__dirname, '../MoreDropdownToggle.jsx');
      const props = fakeProps(componentPath);

      const component = shallow(<MoreDropdownToggle {...props} />);
      expect(component).toMatchSnapshot();
    });
  });

  describe('Functionality testing', () => {
    test('handleClick function is called', () => {
      const componentPath = path.join(__dirname, '../MoreDropdownToggle.jsx');
      const props = fakeProps(componentPath);

      const component = shallow(<MoreDropdownToggle {...props} />);
      const handleClick = jest.fn();
      component.instance().handleClick = handleClick;
      component.instance().forceUpdate();

      component.find('.Header__dropdownToggle').simulate('click', { preventDefault: () => {} });
      expect(handleClick.mock.calls.length).toEqual(1);
    });
  });
});
