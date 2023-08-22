import 'jsdom-global/register';
import React from 'react';
import { shallow } from 'enzyme';
import path from 'path';
import fakeProps from 'react-fake-props';
import chrome from 'sinon-chrome';

import AccountPanel from '../AccountPanel';

jest.mock('../../../../../src/classes/Globals', () => ({
  BROWSER_INFO: { displayName: 'Chrome' },
}));

describe('app/shared-components/Settings/AccountPanel', () => {
  describe('Snapshot tests with shallow', () => {
    test('AccountPanel component should render', () => {
      const componentPath = path.join(__dirname, '../AccountPanel.jsx');
      const props = fakeProps(componentPath);

      const component = shallow(<AccountPanel {...props} />);
      expect(component).toMatchSnapshot();
    });
  });
  describe('Functionality testing', () => {
    global.chrome = chrome;
    test('onClick should be called on AccountPanel__linksInner', () => {
      const componentPath = path.join(__dirname, '../AccountPanel.jsx');
      const props = fakeProps(componentPath);

      const component = shallow(<AccountPanel {...props} />);
      const instance = component.instance();
      const spy = jest.spyOn(instance, 'setNewView');
      instance.forceUpdate();

      component.find('div.AccountPanel__linksInner').first().simulate('click');
      expect(spy).toHaveBeenCalled();
    });

    test('handleLoginAttempt should be called', () => {
      const componentPath = path.join(__dirname, '../AccountPanel.jsx');
      const props = fakeProps(componentPath);

      const component = shallow(<AccountPanel {...props} />);
      const instance = component.instance();
      const spy = jest.spyOn(instance, 'handleLoginAttempt');
      instance.forceUpdate();

      component.find('form.AccountPanel__form').simulate('submit', new Event('click'));
      expect(spy).toHaveBeenCalled();
    });

    test('resetPasswordGenerator should be called', () => {
      const componentPath = path.join(__dirname, '../AccountPanel.jsx');
      const props = fakeProps(componentPath);

      const component = shallow(<AccountPanel {...props} />);
      const instance = component.instance();
      const spy = jest.spyOn(instance, 'resetPasswordGenerator');
      instance.forceUpdate();

      component.find('.AccountPanel__linksInner').at(1).simulate('click');
      expect(spy).toHaveBeenCalled();
    });
  });
});
