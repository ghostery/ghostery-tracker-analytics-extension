import React from 'react';
import { shallow } from 'enzyme';

import License from '../License';

describe('app/licenses/App/License', () => {
  describe('Snapshot tests with react-test-renderer', () => {
    test('License component should render', () => {
      const data = {
        license: {
          name: 'test',
          repository: 'test-repo',
          licenses: 'test-license',
          publisher: 'test-publisher',
          email: 'test@test.com',
          licenseText: 'test',
          url: 'tst.com',
        },
        isLastItem: false,
      };

      const component = shallow(<License {...data} />);
      expect(component).toMatchSnapshot();
    });
  });
});
