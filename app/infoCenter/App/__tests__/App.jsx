import React from 'react';
import { shallow } from 'enzyme';
import App from '../App';

describe('app/infoCenter/App', () => {
  describe('Snapshot tests with react-test-renderer', () => {
    test('App entry point component should render', () => {
      const component = shallow(<App />);

      expect(component).toMatchSnapshot();
    });
  });
});
