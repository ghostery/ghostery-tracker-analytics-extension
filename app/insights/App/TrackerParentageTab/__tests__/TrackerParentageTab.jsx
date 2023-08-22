/**
 * @jest-environment jsdom
 */

import React from 'react';
import { shallow } from 'enzyme';
import chrome from 'sinon-chrome';

import TrackerParentageTab from '../TrackerParentageTab';

describe('app/insights/App/TrackerParentageTab/', () => {
  describe('Snapshot tests with react-test-renderer', () => {
    test('TrackerParentageTab component should render', () => {
      global.chrome = chrome;
      const props = {
        trackerParentage: {
          nodes: [{
            endTime: 1588691787735.3042,
            error: null,
            frameId: 0,
            headersTime: 1588691787734.336,
            index: 0,
            initiator: '',
            latency: 158.7421875,
            parentFrameId: -1,
            refererUrl: '',
            requestId: '68',
            size: 1694,
            src: 'https://test.com/',
            startTime: 1588691787576.562,
            trackerId: false,
            trackerName: '',
            type: 'main_frame',
          }],
          links: [{ test: 'testing' }],
        },
        requestsCount: 22,
        isLive: true,
        tooltipRef: null,
        actions: {
          clearTrackerParentage: () => {},
        },
        messageCreators: {
          requestTrackerParentage: () => {},
          sendMetrics: () => {},
        },
      };

      const component = shallow(<TrackerParentageTab {...props} />);
      expect(component).toMatchSnapshot();
    });
  });
});
