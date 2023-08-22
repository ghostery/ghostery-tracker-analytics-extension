import React from 'react';
import { shallow } from 'enzyme';
import path from 'path';
import fakeProps from 'react-fake-props';

import GlobalTrendsSiteTypeGraph from '../GlobalTrendsSiteTypeGraph.jsx';

describe('app/insights/App/GlobalTrendsSiteGraph', () => {
  describe('Testing that functions are being called', () => {
    test('generateGraph should be called before render returns', () => {
      const componentPath = path.join(__dirname, '../GlobalTrendsSiteTypeGraph.jsx');
      const data = fakeProps(componentPath);

      const globalTrendsSiteGraphMock = jest.spyOn(GlobalTrendsSiteTypeGraph.prototype, 'generateGraph').mockImplementation(() => {});
      expect(globalTrendsSiteGraphMock).toHaveBeenCalledTimes(0);

      shallow(<GlobalTrendsSiteTypeGraph {...data} />);

      expect(globalTrendsSiteGraphMock).toHaveBeenCalledTimes(1);
    });
  });
});
