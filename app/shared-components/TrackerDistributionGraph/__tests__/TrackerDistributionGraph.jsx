import React from 'react';
import { shallow } from 'enzyme';
import path from 'path';
import fakeProps from 'react-fake-props';

import TrackerDistributionGraph from '../TrackerDistributionGraph';

describe('app/shared-components/TrackerDistributionGraph/', () => {
  describe('Snapshot test with shallow', () => {
    test('TrackerDistributionGraph should render', () => {
      const componentPath = path.join(__dirname, '../TrackerDistributionGraph.jsx');
      const props = fakeProps(componentPath);

      const component = shallow(<TrackerDistributionGraph {...props} />);
      expect(component).toMatchSnapshot();
    });
  });

  describe('Functions that generate the graph should be called', () => {
    test('setupGraph function should be called before render returns', () => {
      const componentPath = path.join(__dirname, '../TrackerDistributionGraph.jsx');
      const props = fakeProps(componentPath);

      const setupGraphMock = jest.spyOn(TrackerDistributionGraph.prototype, 'setupGraph').mockImplementation(() => {});
      expect(setupGraphMock).toHaveBeenCalledTimes(0);

      shallow(<TrackerDistributionGraph {...props} />);

      expect(setupGraphMock).toHaveBeenCalledTimes(1);
    });
  });
});
