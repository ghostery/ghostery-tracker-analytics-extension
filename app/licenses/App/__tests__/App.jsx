import React from 'react';
import { shallow } from 'enzyme';
import path from 'path';
import fakeProps from 'react-fake-props';

import App from '../App.jsx';

jest.mock('../../../../tools/licenses/licenses.json', () => ({
  license: {
    name: 'test',
    repository: 'test-repo',
    licenses: 'test-license',
    publisher: 'test-publisher',
    email: 'test@test.com',
    licenseText: 'test',
    url: 'tst.com',
  },
}), { virtual: true });

describe('app/licenses/App', () => {
  describe('Snapshot tests with react-test-renderer', () => {
    test('App entry point component should render', () => {
      const componentPath = path.join(__dirname, '../App.jsx');
      const props = fakeProps(componentPath);

      const component = shallow(<App {...props} />);
      expect(component).toMatchSnapshot();
    });
  });
});
