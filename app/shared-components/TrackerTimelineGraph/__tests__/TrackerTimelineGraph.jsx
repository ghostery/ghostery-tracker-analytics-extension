import React from 'react';
import { shallow } from 'enzyme';
import path from 'path';
import fakeProps from 'react-fake-props';

import TrackerTimelineGraph from '../TrackerTimelineGraph';

describe('app/shared-components/TrackerTimelineGraph/', () => {
  describe('Functions that generate the graph should be called', () => {
    test('generateGraph function should be called before render returns', () => {
      const componentPath = path.join(__dirname, '../TrackerTimelineGraph.jsx');
      const props = fakeProps(componentPath);

      const generateGraphMock = jest.spyOn(TrackerTimelineGraph.prototype, 'generateGraph').mockImplementation(() => {});
      expect(generateGraphMock).toHaveBeenCalledTimes(0);

      shallow(<TrackerTimelineGraph {...props} />);

      expect(generateGraphMock).toHaveBeenCalledTimes(1);
    });
  });
});
