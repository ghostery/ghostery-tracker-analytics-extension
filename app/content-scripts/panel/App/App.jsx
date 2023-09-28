import React, { Component } from 'react';
import PropTypes from 'prop-types';
import '../../../vendor/bootstrap.scss';

import Header from '../../../shared-components/Header';
import PageStats from '../../../shared-components/PageStats';
import TrackerList from '../../../shared-components/TrackerList';
import TrackerDistributionGraph from '../../../shared-components/TrackerDistributionGraph';
import PageLatencyGraph from '../../../shared-components/PageLatencyGraph';
import PageSizeGraph from '../../../shared-components/PageSizeGraph';
import ThemedToast from '../../../shared-components/ThemedToast';
import './styles.scss';

import onMessage from '../../../store/messages/messageListeners';


class App extends Component {
  constructor(props) {
    super(props);
    this.panelRef = React.createRef();
  }

  componentDidMount() {
    if (!window.port) { window.port = chrome.runtime.connect({ name: 'window' }); }
    window.port.onMessage.addListener(this.onPanelMessage);
    window.port.postMessage({ type: 'RequestUserInfo' });
    window.port.postMessage({ type: 'RequestSettings' });
    window.port.postMessage({ type: 'RequestTabDetails' });

    const { actions, messageCreators } = this.props;
    actions.updateTooltipRef(this.panelRef.current);
    messageCreators.sendMetrics({ type: 'visit_insightsPanel' });
  }

  onPanelMessage = (message) => {
    if (message.type === 'RemovePanel') {
      window.port.onMessage.removeListener(this.onPanelMessage);
      const panelEl = document.getElementById('ghostery-insights');
      panelEl.style.opacity = 0;
      setTimeout(() => panelEl.parentNode.removeChild(panelEl), 300);
      return;
    }

    onMessage.bind(this)(message);
  }

  handleClick = () => {
    window.port.postMessage({ type: 'OpenApp' });
  }

  render() {
    const { handleClick } = this;
    return (
      <React.Fragment>
        <div className="Panel__container d-flex justify-content-center">
          <div className="Panel__content" ref={this.panelRef}>
            <Header panel>
              <PageStats panel />
            </Header>
            <div className="Panel__graphContainer d-flex justify-content-center align-items-start">
              <TrackerList handleClick={handleClick} />
              <TrackerDistributionGraph
                height={190}
                width={220}
                handleClick={handleClick}
                expanded={false}
                small
              />
              <PageLatencyGraph height={190} width={220} handleClick={handleClick} small />
              <PageSizeGraph height={190} width={220} handleClick={handleClick} small />
            </div>
            <div className="Graph__tooltip absolute" />
            <div className="Graph__tooltipCaret absolute" />
            <ThemedToast panel />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

App.propTypes = {
  actions: PropTypes.shape({
    setInitialTabInfo: PropTypes.func.isRequired,
    updatePageSize: PropTypes.func.isRequired,
    updateTrackerInfo: PropTypes.func.isRequired,
    updateTimingPerformance: PropTypes.func.isRequired,
    updateIsLive: PropTypes.func.isRequired,
    updateTooltipRef: PropTypes.func.isRequired,
  }).isRequired,
  messageCreators: PropTypes.shape({
    sendMetrics: PropTypes.func.isRequired,
  }).isRequired,
};

export default App;
