import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import '../../vendor/bootstrap.scss';

import License from './License';
import licenses from '../../../tools/licenses/licenses.json';

import './styles.scss';

const App = () => {
  const licensesArray = [];
  Object.keys(licenses).forEach((key) => {
    licensesArray.push(licenses[key]);
  });

  const list = licensesArray.map((license, index) => (
    <License
      key={license.name}
      license={license}
      isLastItem={index === licensesArray.length - 1}
    />
  ));

  return (
    <div className="Licenses">
      <div className="Licenses__header d-flex justify-content-between">
        <Navbar.Brand
          className="Licenses__logo"
          href="https://www.ghostery.com/products/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            alt="Insights by Ghostery Icon"
            src="/dist/images/logo-icons/insights-text-white.svg"
            width="93px"
            height="30px"
          />
        </Navbar.Brand>
        <span className="Licenses__title">
          Licenses
        </span>
      </div>
      <div className="Licenses__list">{ list }</div>
      <div className="Licenses__copyright">
        Ghostery© is a Cliqz company. Learn more about Cliqz. ©Cliqz International GmbH, a wholly-owned subsidiary of Cliqz GmbH. All rights reserved.
      </div>
    </div>
  );
};

export default App;
