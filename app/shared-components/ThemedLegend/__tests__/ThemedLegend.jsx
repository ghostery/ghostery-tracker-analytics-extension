import React from 'react';
import { shallow } from 'enzyme';
import path from 'path';
import fakeProps from 'react-fake-props';

import ThemedLegend from '../ThemedLegend';

describe('app/shared-components/ThemedLegend/', () => {
  describe('Snapshot tests with shallow', () => {
    test('ThemedLegend component should render', () => {
      const componentPath = path.join(__dirname, '../ThemedLegend.jsx');
      const props = fakeProps(componentPath);

      const component = shallow(<ThemedLegend {...props} />);
      expect(component).toMatchSnapshot();
    });
  });
});
