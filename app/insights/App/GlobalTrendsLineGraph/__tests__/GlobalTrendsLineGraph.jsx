import React from 'react';
import { shallow } from 'enzyme';
import path from 'path';
import fakeProps from 'react-fake-props';

import GlobalTrendsLineGraph from '../GlobalTrendsLineGraph';

describe('app/insights/App/GlobalTrendsLineGraph', () => {
  describe('Testing that functions are being called', () => {
    test('generateGraph should be called before render returns', () => {
      const componentPath = path.join(__dirname, '../GlobalTrendsLineGraph.jsx');
      const data = fakeProps(componentPath);

      const generateGraphMock = jest.spyOn(GlobalTrendsLineGraph.prototype, 'generateGraph').mockImplementation(() => {});
      expect(generateGraphMock).toHaveBeenCalledTimes(0);

      shallow(<GlobalTrendsLineGraph {...data} />);

      expect(generateGraphMock).toHaveBeenCalledTimes(1);
    });
  });
});
