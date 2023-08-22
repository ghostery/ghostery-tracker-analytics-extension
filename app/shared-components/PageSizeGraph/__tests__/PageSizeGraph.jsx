import React from 'react';
import { shallow } from 'enzyme';
import path from 'path';
import fakeProps from 'react-fake-props';

import PageSizeGraph from '../PageSizeGraph';

describe('app/shared-components/PageSizeGraph/', () => {
  describe('Snapshot test with shallow', () => {
    test('PageSizeGraph should render', () => {
      const componentPath = path.join(__dirname, '../PageSizeGraph.jsx');
      const props = fakeProps(componentPath);

      const component = shallow(<PageSizeGraph {...props} />);
      expect(component).toMatchSnapshot();
    });
  });

  describe('Functions that generate the graph should be called', () => {
    test('setupGraph function should be called before render returns', () => {
      const componentPath = path.join(__dirname, '../PageSizeGraph.jsx');
      const props = fakeProps(componentPath);

      const setupGraphMock = jest.spyOn(PageSizeGraph.prototype, 'setupGraph').mockImplementation(() => {});
      expect(setupGraphMock).toHaveBeenCalledTimes(0);

      shallow(<PageSizeGraph {...props} />);
      expect(setupGraphMock).toHaveBeenCalledTimes(1);
    });
  });
});
