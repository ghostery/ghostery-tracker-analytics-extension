import 'jsdom-global/register';
import React from 'react';
import { shallow, mount } from 'enzyme';
import path from 'path';
import fakeProps from 'react-fake-props';

import ThemedTabs from '../ThemedTabs';

describe('app/shared-components/ThemedTabs/', () => {
  describe('Snapshot tests with shallow', () => {
    test('ThemedTabs component should render', () => {
      const componentPath = path.join(__dirname, '../ThemedTabs.jsx');
      const props = fakeProps(componentPath);

      const component = shallow(<ThemedTabs {...props} />);
      expect(component).toMatchSnapshot();
    });
  });

  describe('functionality testing', () => {
    test('tabSelectHandler is called', () => {
      const componentPath = path.join(__dirname, '../ThemedTabs.jsx');
      const props = fakeProps(componentPath);

      const component = shallow(<ThemedTabs {...props} />);
      const instance = component.instance();
      const spy = jest.spyOn(instance, 'tabSelectHandler');
      instance.forceUpdate();

      component.find('ForwardRef.ThemedTabs__tab').simulate('select');
      expect(spy).toHaveBeenCalled();
    });
  });
});
