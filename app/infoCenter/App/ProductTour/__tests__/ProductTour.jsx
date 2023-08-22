import React from 'react';
import { shallow } from 'enzyme';

import ProductTour from '../ProductTour';

describe('app/infoCenter/ProductTour', () => {
  describe('Snapshot tests with react-test-renderer', () => {
    test('ProductTour component should render', () => {
      const component = shallow(<ProductTour toggleBackgroundCurve={() => {}} />);

      expect(component).toMatchSnapshot();
    });
  });
});
