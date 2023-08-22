import React from 'react';
import { shallow } from 'enzyme';
import chrome from 'sinon-chrome';
import path from 'path';
import fakeProps from 'react-fake-props';

import TrackerListItem from '../TrackerListItem';

jest.mock('../../../../src/classes/Globals', () => ({
  BROWSER_INFO: { displayName: 'Chrome' },
}));


describe('app/shared-components/TrackerListItem/', () => {
  global.chrome = chrome;
  describe('Snapshot test with shallow', () => {
    test('TrackerListItem should render', () => {
      const componentPath = path.join(__dirname, '../TrackerListItem.jsx');
      const props = fakeProps(componentPath);

      const component = shallow(<TrackerListItem {...props} />);
      expect(component).toMatchSnapshot();
    });
  });

  describe('Functionality testing', () => {
    test('handleHover should resove with the set state', () => {
      const componentPath = path.join(__dirname, '../TrackerListItem.jsx');
      const props = fakeProps(componentPath);

      const component = shallow(<TrackerListItem {...props} />);
      component.setState({ hoveredRequest: 'test' });

      expect(component.find('.TrackerListItem__requestName').length).toBe(1);
    });

    test('copyToClipboard should be called', () => {
      const componentPath = path.join(__dirname, '../TrackerListItem.jsx');
      const props = fakeProps(componentPath);

      const component = shallow(<TrackerListItem {...props} />);
      const instance = component.instance();
      const copyToClipboardMock = jest.spyOn(instance, 'copyToClipboard').mockImplementation(() => {});

      component.find('.TrackerListItem__requestName').simulate('click');
      expect(copyToClipboardMock.mock.calls.length).toBe(1);
    });
  });
});
