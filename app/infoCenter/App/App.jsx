import React, { Component } from 'react';
import ClassNames from 'classnames';
import Navbar from 'react-bootstrap/Navbar';
import '../../vendor/bootstrap.scss';

import ProductTour from './ProductTour';
import Glossary from './Glossary';
import ThemedTabs from '../../shared-components/ThemedTabs';
import './styles.scss';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showBackgroundCurve: true,
      midProductTour: false,
    };
  }

  toggleBackgroundCurve = (showBackgroundCurve, midProductTour) => {
    if (typeof midProductTour === 'undefined') {
      this.setState({ showBackgroundCurve });
      return;
    }
    this.setState({ showBackgroundCurve, midProductTour });
  }

  tabSelectHandler = (tab) => {
    const { midProductTour } = this.state;
    if (tab === '1' && midProductTour) {
      this.toggleBackgroundCurve(false);
      return;
    }
    this.toggleBackgroundCurve(true);
  }

  render() {
    const { showBackgroundCurve } = this.state;
    const backgroundCurveClasses = ClassNames('InfoCenter__backgroundCurve', {
      show: showBackgroundCurve,
    });

    return (
      <div
        className="InfoCenter__container d-flex justify-content-center"
        ref={(node) => { this.tooltipRef = node; }}
      >
        <img
          src="/dist/images/info-center/background-curve.svg"
          className={backgroundCurveClasses}
          alt="Background"
        />
        <div className="InfoCenter__content d-flex">
          <Navbar.Brand
            className="InfoCenter__logo"
            href="https://www.ghostery.com/products/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              alt="Insights by Ghostery Icon"
              src="/dist/images/logo-icons/insights-white-text-beta.svg"
            />
          </Navbar.Brand>
          <ThemedTabs
            altTabs
            passedSelectHandler={this.tabSelectHandler}
            stickyNavItems
            tabs={[
              {
                title: 'Product Tour',
                view: <ProductTour toggleBackgroundCurve={this.toggleBackgroundCurve} />,
              },
              { title: 'Glossary', view: <Glossary /> },
            ]}
          />
        </div>
      </div>
    );
  }
}

export default App;
