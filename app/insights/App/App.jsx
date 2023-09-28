import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import '../../vendor/bootstrap.scss';

import Header from '../../shared-components/Header';
import PageStats from '../../shared-components/PageStats';
import ThemedTabs from '../../shared-components/ThemedTabs';
import ThemedToast from '../../shared-components/ThemedToast';
import PageNotScannedOverlay from './PageNotScannedOverlay';
import OverviewTab from './OverviewTab';
import GlobalTrendsTab from './GlobalTrendsTab';
import TrackerParentageTab from './TrackerParentageTab';
import './styles.scss';

import onMessage from '../../store/messages/messageListeners';

class App extends Component {
  constructor(props) {
    super(props);
    window.port = chrome.runtime.connect({ name: 'app' });
    window.port.onMessage.addListener(onMessage.bind(this));
  }

  componentDidMount() {
    window.port.postMessage({ type: 'RequestUserInfo' });
    window.port.postMessage({ type: 'RequestSettings' });
    window.port.postMessage({ type: 'RequestTabDetails' });

    const { actions, messageCreators } = this.props;
    actions.updateTooltipRef(this.tooltipRef);
    messageCreators.sendMetrics({ type: 'visit_insightsTab' });
    if (window.location.hash.length === 0) {
      window.location.hash = 'tab=1&nestedTab=1';
    }
  }

  handleClick = () => {
    window.port.postMessage({ type: 'FocusParentTab' });
  }

  sendTrackerInformationTabMetrics = (activeKey) => {
    const { messageCreators } = this.props;
    if (activeKey === '2') {
      messageCreators.sendMetrics({ type: 'visit_trackerInformationTab' });
    }
  }

  render() {
    const { parentTabUrl } = this.props;

    const containerClassNames = ClassNames(
      'App__container',
      'd-flex',
      'justify-content-center',
    );

    return (
      <React.Fragment>
        <PageNotScannedOverlay />
        <div
          className={containerClassNames}
          ref={(node) => { this.containerRef = node; }}
        >
          <div className="App" ref={(node) => { this.tooltipRef = node; }}>
            <Header />
            <PageStats
              parentTabUrl={parentTabUrl}
              handleClick={this.handleClick}
            />
            <ThemedTabs
              passedSelectHandler={this.sendTrackerInformationTabMetrics}
              mountOnEnter
              tabs={[
                { title: 'Overview', view: <OverviewTab /> },
                { title: 'Global Trends', view: <GlobalTrendsTab /> },
                { title: 'Tracker Parentage', view: <TrackerParentageTab /> },
              ]}
            />
            <ThemedToast />
            <div className="Graph__tooltip" />
            <div className="Graph__tooltipCaret" />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

App.propTypes = {
  parentTabUrl: PropTypes.string.isRequired,
  actions: PropTypes.shape({
    setInitialTabInfo: PropTypes.func.isRequired,
    updatePageSize: PropTypes.func.isRequired,
    updateTrackerInfo: PropTypes.func.isRequired,
    updateTimingPerformance: PropTypes.func.isRequired,
    clearState: PropTypes.func.isRequired,
    updateParentTabUrl: PropTypes.func.isRequired,
    updateIsLive: PropTypes.func.isRequired,
    updateTooltipRef: PropTypes.func.isRequired,
  }).isRequired,
  messageCreators: PropTypes.shape({
    sendMetrics: PropTypes.func.isRequired,
  }).isRequired,
};

export default App;
