import React from 'react';
import { shallow } from 'enzyme';
import chrome from 'sinon-chrome';
import * as dependency from '../../../../../src/utils/convert';
import GlobalTrendsListItem from '../GlobalTrendsListItem';

jest.mock('../../../../../src/classes/Globals', () => ({
  BROWSER_INFO: { displayName: 'Chrome' },
}));

describe('app/insights/App/insights/GlobalTrendsListItem', () => {
  describe('Snapshot tests with react-test-renderer', () => {
    const globalTrendsListItem = {
      id: 'testing',
      name: 'name-testing',
      category: 'advertising-testing',
      messageCreators: {
        sendMetrics: () => {},
      },
      handleStar: () => {},
      starred: true,
      listItemWtmData: false,
    };

    test('GlobalTrendsListItem component should render', () => {
      global.chrome = chrome;

      dependency.truncateString = jest.fn();

      const component = shallow(
        <GlobalTrendsListItem
          {...globalTrendsListItem}
        />,
      );
      expect(component).toMatchSnapshot();
    });

    test('GlobalTrendsListItem handleClick should resolve', () => {
      let displayExpandedView;
      const component = shallow(
        <GlobalTrendsListItem
          {...globalTrendsListItem}
        />,
      );
      component.setState({ displayExpandedView: !displayExpandedView });
      expect(component.length).toBe(1);
    });

    test('GlobalTrendsListItem sendMetrics should resolve', () => {
      global.chrome = chrome;
      dependency.truncateString = jest.fn();

      const component = shallow(<GlobalTrendsListItem {...globalTrendsListItem} />);
      component.setState({ type: 'tracker_expand_trackerInformationList' });
      component.find('div.GlobalTrendsListItem__header').simulate('click');
      expect(component.find('div.GlobalTrendsListItem__header').length).toBe(1);
    });
  });
});
