import React from 'react';
import { shallow } from 'enzyme';
import chrome from 'sinon-chrome';
import path from 'path';
import fakeProps from 'react-fake-props';

import PageStats from '../PageStats';

describe('app/shared-components/PageStats/', () => {
  describe('Snapshot tests with shallow', () => {
    test('PageStats component should render', () => {
      global.chrome = chrome;
      const componentPath = path.join(__dirname, '../PageStats.jsx');
      const props = fakeProps(componentPath);

      const component = shallow(<PageStats {...props} />);
      expect(component).toMatchSnapshot();
    });
  });
});
