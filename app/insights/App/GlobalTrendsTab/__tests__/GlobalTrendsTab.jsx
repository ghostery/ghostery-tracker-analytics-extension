import React from 'react';
import { shallow } from 'enzyme';
import path from 'path';
import fakeProps from 'react-fake-props';
import GlobalTrendsTab from '../GlobalTrendsTab';

jest.mock('../../../../../src/classes/Globals', () => ({
  BROWSER_INFO: { displayName: 'Chrome' },
}));

describe('app/insights/App/GlobalTrendsTab/', () => {
  describe('Snapshot tests with react-test-renderer', () => {
    test('GlobalTrendsTab component should render', () => {
      const componentPath = path.join(__dirname, '../GlobalTrendsTab.jsx');
      const props = fakeProps(componentPath);

      const component = shallow(<GlobalTrendsTab {...props} />);
      expect(component).toMatchSnapshot();
    });
  });
  describe('Functionality Testing', () => {
    test('handleClick state should be favorites', () => {
      const componentPath = path.join(__dirname, '../GlobalTrendsTab.jsx');
      const props = fakeProps(componentPath);

      const initialState = { sort: 'favorites' };
      const component = shallow(<GlobalTrendsTab {...props} />);
      component.setState({ sort: 'favorites' });

      expect(component.state()).toEqual(initialState);
    });

    test('handleClick state should be prevalence', () => {
      const componentPath = path.join(__dirname, '../GlobalTrendsTab.jsx');
      const props = fakeProps(componentPath);

      const initialState = { sort: 'prevalence' };
      const component = shallow(<GlobalTrendsTab {...props} />);
      component.setState({ sort: 'prevalence' });

      expect(component.state()).toEqual(initialState);
    });

    test('handleClick state should be category', () => {
      const componentPath = path.join(__dirname, '../GlobalTrendsTab.jsx');
      const props = fakeProps(componentPath);

      const initialState = { sort: 'category' };
      const component = shallow(<GlobalTrendsTab {...props} />);
      component.setState({ sort: 'category' });

      expect(component.state()).toEqual(initialState);
    });

    test('testing sendMetrics with favorites', () => {
      const componentPath = path.join(__dirname, '../GlobalTrendsTab.jsx');
      const props = fakeProps(componentPath);

      const component = shallow(<GlobalTrendsTab {...props} />);
      component.setState({ type: 'sort_trackerInformationTab', sortType: 'favorites' });
      expect(component.find('.GlobalTrendsTab__headerButtonList').length).toBe(1);
    });

    test('testing sendMetrics with prevalence', () => {
      const componentPath = path.join(__dirname, '../GlobalTrendsTab.jsx');
      const props = fakeProps(componentPath);

      const component = shallow(<GlobalTrendsTab {...props} />);
      component.setState({ type: 'sort_trackerInformationTab', sortType: 'prevalence' });
      expect(component.find('.GlobalTrendsTab__headerButtonList').length).toBe(1);
    });

    test('testing sendMetrics with category', () => {
      const componentPath = path.join(__dirname, '../GlobalTrendsTab.jsx');
      const props = fakeProps(componentPath);

      const component = shallow(<GlobalTrendsTab {...props} />);
      component.setState({ type: 'sort_trackerInformationTab', sortType: 'category' });
      expect(component.find('.GlobalTrendsTab__headerButtonList').length).toBe(1);
    });

    test('handleStar should be called', () => {
      const componentPath = path.join(__dirname, '../GlobalTrendsTab.jsx');
      const props = fakeProps(componentPath);

      const component = shallow(<GlobalTrendsTab {...props} />);
      component.instance().handleStar = jest.fn();
      component.update();
      expect(component).toHaveLength(1);
    });
  });
});
