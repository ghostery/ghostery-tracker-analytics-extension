import 'jsdom-global/register';
import React from 'react';
import { shallow, mount } from 'enzyme';
import chrome from 'sinon-chrome';

import FavoriteTrackersSearch from '../FavoriteTrackersSearch';

describe('app/shared-components/FavoriteTrackersSearch/', () => {
  describe('Snapshot tests with shallow', () => {
    global.chrome = chrome;
    test('FavoriteTrackersSearch component should render', () => {
      const data = {
        messageCreators: {
          searchBugDb: () => {},
          removeStarredTracker: () => {},
          addStarredTracker: () => {},
        },
        showToasts: true,
        actions: {
          openToast: () => {},
        },
        starredTrackerIds: { testing: 'starred' },
        bugDbSearchResults: [{ key: '78783743', trackerName: 'test', trackerId: '22' }],
        panel: true,
      };

      const component = shallow(<FavoriteTrackersSearch {...data} />);
      expect(component).toMatchSnapshot();
    });
  });
  describe('Functionality testing', () => {
    test('handleChange should resolve with the setState', () => {
      const data = {
        messageCreators: {
          searchBugDb: () => {},
          removeStarredTracker: () => {},
          addStarredTracker: () => {},
        },
        showToasts: true,
        actions: {
          openToast: () => {},
        },
        starredTrackerIds: {},
        bugDbSearchResults: [],
        panel: true,
      };

      const component = shallow(<FavoriteTrackersSearch {...data} />);
      component.setState({ focusedResult: '' });

      expect(component.find('.FavoriteTrackersSearch__searchInput').length).toBe(1);
    });

    test('handleRemoveStarred should be called on click', () => {
      const data = {
        messageCreators: {
          searchBugDb: () => {},
          removeStarredTracker: () => {},
          addStarredTracker: () => {},
        },
        showToasts: true,
        actions: {
          openToast: () => {},
        },
        starredTrackerIds: { testing: 'starred' },
        bugDbSearchResults: [{ key: '78783743', trackerName: 'test', trackerId: '22' }],
        panel: true,
      };

      const component = mount(<FavoriteTrackersSearch {...data} />);
      const handleRemoveStarredSpy = jest.spyOn(component.instance(), 'handleRemoveStarred');
      component.instance().forceUpdate();

      component.find('div.FavoriteTrackersSearch__starredTracker img').simulate('click');

      expect(handleRemoveStarredSpy).toHaveBeenCalled();
    });
    test('starOrRemoveTracker should be called on click', () => {
      const data = {
        messageCreators: {
          searchBugDb: () => {},
          removeStarredTracker: () => {},
          addStarredTracker: () => {},
        },
        showToasts: true,
        actions: {
          openToast: () => {},
        },
        starredTrackerIds: { testing: 'starred' },
        bugDbSearchResults: [{ key: '78783743', trackerName: 'test', trackerId: '22' }],
        panel: true,
      };

      const component = mount(<FavoriteTrackersSearch {...data} />);
      const starOrRemoveTrackerSpy = jest.spyOn(component.instance(), 'starOrRemoveTracker');
      component.instance().forceUpdate();

      component.find('div.FavoriteTrackersSearch__searchResult').simulate('click');

      expect(starOrRemoveTrackerSpy).toHaveBeenCalled();
    });
  });
});
