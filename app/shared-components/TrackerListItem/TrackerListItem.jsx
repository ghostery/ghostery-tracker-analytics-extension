import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import TrackerTimelineGraph from '../TrackerTimelineGraph';
import { truncateString } from '../../../src/utils/convert';
import copyText from '../../utils/javascript/copyText';
import './TrackerListItem.scss';

class TrackerListItem extends Component {
  constructor(props) {
    super(props);
    this.state = { hoveredRequest: '' };
  }

  componentDidMount() {
    const { actions, id } = this.props;
    actions.addTrackerListItemRef(id, this.selfRef);
  }

  handleHover(key) {
    this.setState({ hoveredRequest: key });
  }

  copyToClipboard(fullUrl) {
    const { actions, showToasts } = this.props;
    copyText(fullUrl);
    if (showToasts) { actions.openToast({ toastText: 'URL copied!' }, 2500); }
  }

  render() {
    const {
      id,
      name,
      size,
      latency,
      latencyCategory,
      requests,
      showGraph,
      handleExpand,
      expanded,
      firstTracker,
      starred,
      handleStar,
      highlighted,
      onMouseEnter,
      onMouseLeave,
      tooltipRef,
      pageEventLinesHeight,
    } = this.props;
    const { hoveredRequest } = this.state;
    const trackerListItemClasses = ClassNames(
      'TrackerListItem', 'd-flex',
      { expanded, highlighted },
    );
    const trackerListItemInformaton = ClassNames(
      'TrackerListItem__trackerInformation',
      { showGraph },
    );
    const trackerListItemHeader = ClassNames(
      'TrackerListItem__header',
      'd-flex',
      'align-items-center',
      'justify-content-start',
      { showGraph },
    );
    const trackerListItemStar = ClassNames(
      'TrackerListItem__star',
      { small: !showGraph },
    );
    const trackerListItemCircle = ClassNames(
      'TrackerListItem__circle',
      'd-flex',
      'align-items-center',
      'justify-content-center',
      latencyCategory,
      { small: !showGraph },
    );
    const trackerListItemStats = ClassNames(
      'TrackerListItem__stats',
      { small: !showGraph },
    );
    const trackerListItemStatsInfo = ClassNames(
      'TrackerListItem__statsInfo',
      'd-flex',
      'justify-content-start',
      { small: !showGraph },
    );
    const trackerListItemTrackerSize = ClassNames(
      'TrackerListItem__trackerSize',
      { small: !showGraph },
    );
    const trackerListItemRequestList = ClassNames(
      'TrackerListItem__requestList',
      { expanded, small: !showGraph },
    );
    const trackerListItemRequest = ClassNames(
      'TrackerListItem__request',
      'd-flex',
      'align-items-center',
      'justify-content-start',
      { small: !showGraph, empty: requests.length === 0 },
    );
    const tooltipClass = ClassNames(
      'tooltipLeft',
      { tooltip__panelTrackerList: !showGraph },
    );
    const starIconFilePath = starred
      ? 'dist/images/shared/star-filled.svg'
      : 'dist/images/shared/star-empty.svg';

    return (
      <div
        className={trackerListItemClasses}
        onMouseEnter={() => onMouseEnter(id)}
        onMouseLeave={() => onMouseLeave(id)}
        ref={(node) => { this.selfRef = node; }}
      >
        <div className={trackerListItemInformaton}>
          <div className={trackerListItemHeader} onClick={() => handleExpand(id)}>
            <img
              alt="Star Tracker"
              src={[chrome.extension.getURL(starIconFilePath)]}
              className={trackerListItemStar}
              onClick={(e) => {
                e.stopPropagation();
                handleStar(id, name);
              }}
            />
            <div className={trackerListItemCircle}>
              <p className="TrackerListItem__circleText">{requests.length}</p>
            </div>
            <div className={trackerListItemStats}>
              <p className="TrackerListItem__statsHeader">{name}</p>
              <div className={trackerListItemStatsInfo}>
                <p className={trackerListItemTrackerSize}>{`Size: ${size}`}</p>
                <p>{`Latency: ${latency}`}</p>
              </div>
            </div>
          </div>
          <div className={trackerListItemRequestList}>
            {requests.length > 0 ? (
              requests.map((request) => {
                const trackerListRequestName = ClassNames(
                  'TrackerListItem__requestName',
                  'd-flex',
                  'justify-content-start',
                  'align-items-center',
                  { small: !showGraph, hovered: (hoveredRequest === request.requestId) },
                );
                return (
                  <div
                    key={`tracker:${id} requestStart:${request.startTime}`}
                    className={trackerListItemRequest}
                  >
                    <OverlayTrigger
                      placement={showGraph ? 'right' : 'top'}
                      container={tooltipRef}
                      overlay={(
                        <Tooltip className={tooltipClass}>
                          {showGraph ? request.src : 'Click to copy'}
                        </Tooltip>
                      )}
                    >
                      <div
                        className={trackerListRequestName}
                        onMouseEnter={() => this.handleHover(request.requestId)}
                        onMouseLeave={() => this.handleHover('')}
                        onClick={() => this.copyToClipboard(request.src)}
                      >
                        <img
                          src={[chrome.extension.getURL('dist/images/shared/copy-icon.svg')]}
                          width="10"
                          height="13"
                          alt="More info hover: Average data usage by all trackers detected on the current page"
                        />
                        <p>
                          {showGraph
                            ? truncateString(request.src, 32)
                            : truncateString(request.src, 36)}
                        </p>
                      </div>
                    </OverlayTrigger>
                  </div>
                );
              })) : (
                <div className={trackerListItemRequest}>
                  <p>No requests were completed for this tracker</p>
                </div>
            )}
          </div>
        </div>
        {showGraph && (
          <TrackerTimelineGraph
            requests={requests}
            expanded={expanded}
            firstTracker={firstTracker}
            pageEventLinesHeight={pageEventLinesHeight}
            latencyCategory={latencyCategory}
            handleClick={() => handleExpand(id)}
          />
        )}
      </div>
    );
  }
}

TrackerListItem.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  size: PropTypes.string.isRequired,
  latency: PropTypes.string.isRequired,
  latencyCategory: PropTypes.string.isRequired,
  requests: PropTypes.arrayOf(PropTypes.shape({
    src: PropTypes.string.isRequired,
    endTime: PropTypes.number.isRequired,
    startTime: PropTypes.number.isRequired,
  })).isRequired,
  showGraph: PropTypes.bool.isRequired,
  handleExpand: PropTypes.func.isRequired,
  expanded: PropTypes.bool.isRequired,
  firstTracker: PropTypes.bool.isRequired,
  pageEventLinesHeight: PropTypes.number.isRequired,
  starred: PropTypes.bool.isRequired,
  handleStar: PropTypes.func.isRequired,
  highlighted: PropTypes.bool.isRequired,
  onMouseEnter: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func.isRequired,
  showToasts: PropTypes.bool.isRequired,
  actions: PropTypes.shape({
    addTrackerListItemRef: PropTypes.func.isRequired,
    openToast: PropTypes.func.isRequired,
  }).isRequired,
  tooltipRef: PropTypes.instanceOf(PropTypes.element),
};

TrackerListItem.defaultProps = {
  tooltipRef: null,
};

export default TrackerListItem;
