import React from 'react';
import { shallow } from 'enzyme';
import path from 'path';
import fakeProps from 'react-fake-props';

import ThemedToggle from '../ThemedToggle';

describe('app/shared-components/ThemedToggle/', () => {
  describe('Snapshot test with shallow', () => {
    test('ThemedToggle should render', () => {
      const componentPath = path.join(__dirname, '../ThemedToggle.jsx');
      const props = fakeProps(componentPath);

      const component = shallow(<ThemedToggle {...props} />);
      expect(component).toMatchSnapshot();
    });
  });
});
