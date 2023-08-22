/**
 * @jest-environment jsdom
 */

import React from 'react';
import { shallow } from 'enzyme';
import chrome from 'sinon-chrome';
import path from 'path';
import fakeProps from 'react-fake-props';
import * as D3 from 'd3';

import TrackerList from '../TrackerList';

jest.mock('d3');
jest.mock('../../../../src/classes/Globals', () => ({
  BROWSER_INFO: { displayName: 'Chrome' },
}));

describe('app/shared-components/TrackerList/', () => {
  global.chrome = chrome;
  describe('Snapshot test with shallow', () => {
    test('TrackerList should render', () => {
      const componentPath = path.join(__dirname, '../TrackerList.jsx');
      const props = fakeProps(componentPath);

      D3.select = jest.fn().mockReturnValueOnce({
        selectAll: jest.fn().mockReturnValueOnce({
          remove: jest.fn()
        }),
      });

      const component = shallow(<TrackerList {...props} />);
      expect(component).toMatchSnapshot();
    });
  });
});
