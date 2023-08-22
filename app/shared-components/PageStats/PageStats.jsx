import React from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import Nav from 'react-bootstrap/Nav';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { convertBytes, truncateString } from '../../../src/utils/convert';
import './PageStats.scss';

let tooltipRefPointer;
let messageCreatorsPointer;

const dismissTabIconExplainer = () => (
  messageCreatorsPointer.markTabIconExplainerAcknowledged()
);

const dismissTabIconExplainerAndOpenApp = () => {
  dismissTabIconExplainer();
  messageCreatorsPointer.openApp();
};

const handleTrackerParentageIconClick = () => {
  messageCreatorsPointer.openApp(3);
  messageCreatorsPointer.sendMetrics({ type: 'tracker_parentage_visit' });
};

const minimizeButtonWithTooltip = () => (
  <OverlayTrigger
    container={tooltipRefPointer}
    placement="bottom"
    delay={500}
    overlay={(
      <Tooltip className="tooltipLeft">Minimize panel</Tooltip>
    )}
  >
    <img
      src={[chrome.extension.getURL('dist/images/shared/minimize-icon.svg')]}
      className="PageStats__panelButton infoIcon"
      width="14"
      height="14"
      alt="Minimize panel"
      onClick={messageCreatorsPointer.togglePanel}
    />
  </OverlayTrigger>
);

const tabIcon = (explainerActive = false) => (
  <img
    src={[chrome.extension.getURL('dist/images/shared/open-app-icon.svg')]}
    className="PageStats__panelButton infoIcon"
    width="14"
    height="14"
    alt="Open Insights tab"
    onClick={explainerActive
      ? dismissTabIconExplainerAndOpenApp
      : () => messageCreatorsPointer.openApp()}
  />
);

const tabIconWithTooltip = () => (
  <OverlayTrigger
    container={tooltipRefPointer}
    placement="bottom"
    delay={500}
    overlay={(
      <Tooltip className="tooltipLeft">Open Insights tab</Tooltip>
    )}
  >
    {tabIcon()}
  </OverlayTrigger>
);

function tabIconWithExplainer() {
  const descriptionText = 'Click here to view the Timeline and expanded dashboard.';
  const buttonText = 'Got it';

  return (
    <div className="PageStats__tabIconExplainerContainer">
      {tabIcon(true)}
      <div className="PageStats__tabIconExplainer">
        <div className="PageStats__iconAndDescriptionContainer">
          <img
            src={[chrome.extension.getURL('dist/images/shared/open-app-icon.svg')]}
            width="45"
            height="45"
            alt=""
          />
          <div className="description">
            {descriptionText}
          </div>
        </div>
        <div className="PageStats__ctaButton" onClick={dismissTabIconExplainer}>
          <span className="text">{buttonText}</span>
        </div>
      </div>
    </div>
  );
}

const trackerParentageIcon = () => (
  <div className="PageStats__trackerParentageButton" onClick={handleTrackerParentageIconClick}>
    <img
      src={[chrome.extension.getURL('dist/images/shared/tracker-parentage-icon.svg')]}
      width="19"
      height="20"
      alt="View Tracker Parentage"
    />
  </div>
);

const trackerParentageIconWithTooltip = () => (
  <OverlayTrigger
    container={tooltipRefPointer}
    placement="bottom"
    delay={500}
    overlay={(
      <Tooltip className="tooltipLeft">View Tracker Parentage</Tooltip>
    )}
  >
    {trackerParentageIcon()}
  </OverlayTrigger>
);

const PageStats = ({
  parentTabUrl,
  handleClick,
  panel,
  tabIconExplainerAcknowledged,
  trackerCount,
  requestsBySize,
  tooltipRef,
  messageCreators,
}) => {
  // export arguments needed by helper functions to their scope (i.e. file scope)
  // this keeps the helper functions calls clean and litter-free
  tooltipRefPointer = tooltipRef;
  messageCreatorsPointer = messageCreators;

  const numPageRequests = requestsBySize._tracker ? requestsBySize._tracker.count : 0;
  const totalTrackerSize = requestsBySize._tracker ? requestsBySize._tracker.size : 0;
  const convertedTrackerSize = convertBytes(totalTrackerSize);

  const pageStatsContainer = ClassNames('PageStats__container', { panel });
  const pageStats = ClassNames(
    'PageStats',
    'd-flex',
    'align-items-center',
    { panel, 'justify-content-between': panel, 'justify-content-around': !panel },
  );

  return (
    <div className={pageStatsContainer}>
      <div className={pageStats}>
        {parentTabUrl !== '' && (
          <Nav.Link onClick={handleClick}>
            {truncateString(parentTabUrl)}
          </Nav.Link>
        )}
        <div>{`Trackers: ${trackerCount}`}</div>
        <div>{`Tracker Requests: ${numPageRequests}`}</div>
        <div>{`Total Tracker Size: ${convertedTrackerSize}`}</div>
        {panel && (
          <div className="d-flex align-items-center justify-content-between">
            {minimizeButtonWithTooltip()}
            {
              (tabIconExplainerAcknowledged && tabIconWithTooltip())
              || tabIconWithExplainer()
            }
            {trackerParentageIconWithTooltip()}
          </div>
        )}
      </div>
    </div>
  );
};

PageStats.propTypes = {
  parentTabUrl: PropTypes.string,
  handleClick: PropTypes.func,
  panel: PropTypes.bool,
  tabIconExplainerAcknowledged: PropTypes.bool,
  requestsBySize: PropTypes.shape({
    _tracker: PropTypes.shape({
      size: PropTypes.number,
      count: PropTypes.number,
    }),
  }).isRequired,
  trackerCount: PropTypes.number.isRequired,
  tooltipRef: PropTypes.instanceOf(PropTypes.element),
  messageCreators: PropTypes.shape({
    markTabIconExplainerAcknowledged: PropTypes.func.isRequired,
    openApp: PropTypes.func.isRequired,
    sendMetrics: PropTypes.func.isRequired,
    togglePanel: PropTypes.func.isRequired,
  }).isRequired,
};

PageStats.defaultProps = {
  parentTabUrl: '',
  handleClick: null,
  panel: false,
  tabIconExplainerAcknowledged: false,
  tooltipRef: null,
};

export default PageStats;
