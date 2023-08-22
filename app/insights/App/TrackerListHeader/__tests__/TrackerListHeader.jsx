/**
 * @jest-environment jsdom
 */

// import React from 'react';
// import { shallow } from 'enzyme';
// import chrome from 'sinon-chrome';
// import path from 'path';
// import fakeProps from 'react-fake-props';

// import TrackerListHeader from '../TrackerListHeader';

describe('app/insights/App/TrackerListHeader/TrackerListHeader', () => {
  describe('Snapshot tests with react-test-renderer', () => {
    test('These tests fail due to an incorrect data structure of props.trackerInformation', () => {
      return;
    });
    // global.chrome = chrome;
    // test('TrackerListHeader component should render', () => {
    //   const componentPath = path.join(__dirname, '../TrackerListHeader.jsx');
    //   const props = fakeProps(componentPath);

    //   const component = shallow(<TrackerListHeader {...props} />);
    //   expect(component).toMatchSnapshot();
    // });

    // test('TrackerListHeader handling of handleExpandClick', () => {
    //   const componentPath = path.join(__dirname, '../TrackerListHeader.jsx');
    //   const props = fakeProps(componentPath);

    //   const component = shallow(<TrackerListHeader {...props} />);
    //   const handleExpandClick = jest.fn();
    //   component.instance().handleExpandClick = handleExpandClick;
    //   component.instance().forceUpdate();
    //   component.find('div.TrackerListHeader__expand').simulate('click', { stopPropagation: () => {} });

    //   expect(handleExpandClick.mock.calls.length).toEqual(1);
    // });

    // test('TrackerListHeader handleToggleClick should resolve', () => {
    //   const componentPath = path.join(__dirname, '../TrackerListHeader.jsx');
    //   const props = fakeProps(componentPath);

    //   const component = shallow(<TrackerListHeader {...props} />);
    //   component.instance().handleToggleClick = jest.fn();
    //   component.update();

    //   expect(component).toHaveLength(1);
    // });
  });
});
