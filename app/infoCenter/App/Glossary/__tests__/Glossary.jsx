import React from 'react';
import renderer from 'react-test-renderer';
import Glossary from '../Glossary';

describe('app/infoCenter/Glossary', () => {
  describe('Snapshot tests with react-test-renderer', () => {
    test('Glossary component should render', () => {
      function createNodeMock() {
        return {
          addEventListener: () => {},
          scrollTop: 0,
        };
      }
      const options = { createNodeMock };
      const component = renderer.create(<Glossary />, options);

      expect(component).toMatchSnapshot();
    });
  });
});
