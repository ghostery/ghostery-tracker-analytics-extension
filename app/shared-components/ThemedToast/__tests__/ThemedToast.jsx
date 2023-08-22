import React from 'react';
import { shallow } from 'enzyme';
import chrome from 'sinon-chrome';
import path from 'path';
import fakeProps from 'react-fake-props';

import ThemedToast from '../ThemedToast';

jest.mock('../../../../src/classes/Globals', () => ({
  BROWSER_INFO: { displayName: 'Chrome' },
}));

describe('app/shared-components/ThemedToast/', () => {
  describe('Snapshot test with shallow', () => {
    test('ThemedToast should render', () => {
      global.chrome = chrome;
      const componentPath = path.join(__dirname, '../ThemedToast.jsx');
      const props = fakeProps(componentPath);

      const component = shallow(<ThemedToast {...props} />);
      expect(component).toMatchSnapshot();
    });
  });

  describe('Functionality testing', () => {
    test('onClick should be called', () => {
      global.chrome = chrome;
      const mockCallBack = jest.fn();
      const props = {
        show: true,
        toastText: 'testing',
        initialLoad: true,
        actions: {
          closeToast: mockCallBack,
        },
        altStyling: true,
        errorStyling: true,
        panel: true,
      };

      const component = shallow(<ThemedToast {...props} onClick={mockCallBack} />);

      component.find('img.ThemedToast__closeButton').simulate('click');
      expect(mockCallBack.mock.calls.length).toEqual(1);
    });
  });
});
