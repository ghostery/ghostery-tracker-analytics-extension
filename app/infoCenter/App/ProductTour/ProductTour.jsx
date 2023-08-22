import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import Collapse from 'react-bootstrap/Collapse';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import './ProductTour.scss';

class ProductTour extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentView: 0,
      featureDescriptions: [
        { view: 1, title: 'Tracker Request List', text: 'This list displays all trackers and scripts operating on a website. It includes size and latency data, and can be expanded to show request URLs. “Favorite” a tracker to pin it to the top of your list whenever it appears on a page. You can manage favorites in your Settings panel.' },
        { view: 2, title: 'Tracker Timeline', text: 'The Timeline visualizes each tracker’s ping behavior in real-time as a page loads. Hover over data points in an expanded visual to view script size and latency information. From the header, select which page events to show, and toggle between a linear or logarithmic display.' },
        { view: 3, title: 'Tracker Distribution Graph', text: 'The Tracker Distribution Chart displays trackers by size and latency in a scatterplot, making it easy to identify outliers at a glance. Hover over a data point to see details, and click to view corresponding tracker data in the Timeline.' },
        { view: 4, title: 'Page Latency Graph', text: 'The Page Latency graph breaks down the initial load of a web page into categories of processes organized by events, such as the time spent making a request to a server and receiving a response.' },
        { view: 5, title: 'Page Size Graph', text: 'The Page Size panel shows how much of your local memory is being allocated for certain types of data (eg. images, scripts, fonts, etc.). This graph is updated in real time as you interact with any web page.' },
        { view: 6, title: 'Live/Freeze Mode', text: 'In Live mode, data is streaming to the dashboard in real-time. You can set the toggle to Freeze to pause data streaming and capture a snapshot of tracker activity at that point in time. Toggle back to Live to resume.' },
        { view: 7, title: 'Global Trends', text: 'The Global Trends tab lists privacy-related statistics and trends over time for trackers and websites documented in our web-profiling database. Click a tracker to expand it, and hover over the line graphs to view historical stats. You can arrange trackers by favorites, prevalence, or category using the sort options at the top of the list. ' },
      ],
      images: [
        { view: 0, type: 'static', imagePath: '/dist/images/info-center/welcome-to-insights.png' },
        { view: 1, type: 'static', imagePath: '/dist/images/info-center/tracker-request-list.png' },
        {
          view: 2,
          type: 'pulsar',
          imagePath: '/dist/images/info-center/tracker-timeline.png',
          tooltips: [
            'Toggle between linear or logarithmic scaling',
            'Select page events you want displayed on the timelie alongside tracker request pings',
          ],
        },
        {
          view: 3,
          type: 'pulsar',
          imagePath: '/dist/images/info-center/tracker-distribution-graph.png',
          tooltips: [
            'Hover over or click a data point to view size, latency, and timeline information',
          ],
        },
        { view: 4, type: 'static', imagePath: '/dist/images/info-center/page-latency-graph.png' },
        { view: 5, type: 'static', imagePath: '/dist/images/info-center/page-size-graph.png' },
        { view: 6, type: 'static', imagePath: '/dist/images/info-center/live-freeze-mode.png' },
        {
          view: 7,
          type: 'pulsar',
          imagePath: '/dist/images/info-center/global-trends.png',
          tooltips: [
            'Sort the trackers by prevalence, category, or favorites for convenient viewing',
            'Web traffic trends over time are visualized by line graphs — hover to see statistics for a specific date',
            'Expand a tracker to see granular information, such as associated websites and tracking methods used',
          ],
        },
      ],
      addPulsars: false,
    };
  }

  componentDidMount() {
    this.setState({ addPulsars: true });
  }

  switchView = (view) => {
    const { toggleBackgroundCurve } = this.props;
    const { currentView } = this.state;

    if (view === currentView) {
      toggleBackgroundCurve(true, false);
      this.setState({ currentView: 0 });
      return;
    }

    if (currentView === 0) { toggleBackgroundCurve(false, true); }
    this.setState({ currentView: view });
  }

  renderFeatureDescriptions = () => {
    const { featureDescriptions, currentView } = this.state;
    const caretClasses = featureDescriptions.map(feature => (
      ClassNames('ProductTour__caret', { flipped: feature.view === currentView })
    ));

    return featureDescriptions.map(feature => (
      <div className="ProductTour__feature" key={`description-${feature.view}`}>
        <div
          className="ProductTour__featureHeader d-flex align-items-center justify-content-between"
          onClick={() => this.switchView(feature.view)}
        >
          <h2>{feature.title}</h2>
          <img
            className={caretClasses[feature.view - 1]}
            alt={`Expand or Collapse ${feature.title}`}
            src="/dist/images/app/caret-down.svg"
          />
        </div>
        <Collapse in={feature.view === currentView}>
          <div className="ProductTour__featureDescription">
            <div><p>{feature.text}</p></div>
          </div>
        </Collapse>
      </div>
    ));
  }

  renderPulsars = (image) => {
    const digitsToWords = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'];
    const pulsarKeyAndClass = (view, index) => (
      `image${digitsToWords[view]}Pulsar${digitsToWords[index]}`
    );

    return image.tooltips.map((tooltip, i) => (
      <OverlayTrigger
        key={pulsarKeyAndClass(image.view, i)}
        placement="auto"
        overlay={(
          <Tooltip className="ProductTour__tooltipPurpleBorder tooltipLeft">
            {tooltip}
          </Tooltip>
        )}
      >
        <div className={`ProductTour__pulsar ${pulsarKeyAndClass(image.view, i)} d-flex justify-content-center align-items-center`}>
          <div />
        </div>
      </OverlayTrigger>
    ));
  }

  renderImages = () => {
    const { currentView, images, addPulsars } = this.state;
    const imageClasses = images.map(image => (
      ClassNames('ProductTour__imageDisplay', `image-${image.view}`, {
        show: image.view === currentView,
        liveFreezeSize: currentView === 6,
      })
    ));

    return images.map(image => (
      <div
        className={imageClasses[image.view]}
        key={`image-${image.view}`}
      >
        <img
          className="ProductTour__image"
          alt={`Feature ${currentView}`}
          src={image.imagePath}
        />
        <div className="ProductTour__pulsarContainer">
          {addPulsars && image.type === 'pulsar' && this.renderPulsars(image)}
        </div>
      </div>
    ));
  }

  render() {
    const { currentView } = this.state;
    const imageContainerClasses = ClassNames(
      'ProductTour__imageContainer',
      'd-flex',
      'align-items-center',
      'justify-content-center',
      { addMarginTop: currentView !== 0 },
    );

    return (
      <div className="ProductTour">
        <div className="d-flex justify-content-between">
          <div className="ProductTour__featureContainer">
            <h2>Welcome to Ghostery Insights</h2>
            <p>
              Insights offers comprehensive, real-time analysis into tracker activity on a page. Learn about the dashboard and features below.
            </p>
            {this.renderFeatureDescriptions()}
          </div>
          <div className={imageContainerClasses}>
            {this.renderImages()}
          </div>
        </div>
      </div>
    );
  }
}

ProductTour.propTypes = {
  toggleBackgroundCurve: PropTypes.func.isRequired,
};

export default ProductTour;
