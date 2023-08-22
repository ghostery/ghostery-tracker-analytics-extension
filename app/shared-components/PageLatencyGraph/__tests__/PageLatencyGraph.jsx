import React from 'react';
import { shallow } from 'enzyme';
import path from 'path';
import fakeProps from 'react-fake-props';

import PageLatencyGraph from '../PageLatencyGraph';

describe('app/shared-components/PageLatencyGraph/', () => {
  describe('Functions that generate the graph should be called', () => {
    test('setupGraph function should be called before render returns', () => {
      const componentPath = path.join(__dirname, '../PageLatencyGraph.jsx');
      const props = fakeProps(componentPath);

      const setupGraphMock = jest.spyOn(PageLatencyGraph.prototype, 'setupGraph').mockImplementation(() => {});
      expect(setupGraphMock).toHaveBeenCalledTimes(0);

      shallow(<PageLatencyGraph {...props} />);

      expect(setupGraphMock).toHaveBeenCalledTimes(1);
    });
  });
});
