import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import Nav from 'react-bootstrap/Nav';
import isEmpty from 'lodash.isempty';
import * as D3 from 'd3';
import { convertBytes, convertMilliseconds } from '../../../src/utils/convert';
import { fuzzySearch } from '../../../src/utils/common';

import TrackerListHeader from '../../insights/App/TrackerListHeader';
import TrackerListItem from '../TrackerListItem';
import './TrackerList.scss';

class TrackerList extends Component {
  componentDidUpdate(prevProps) {
    const { trackerInformation, actions } = this.props;

    if (!isEmpty(prevProps.trackerInformation) && isEmpty(trackerInformation)) {
      actions.clearTrackerListItemRef();
    }
  }

  handleExpand = (trackerListItemID) => {
    const { expandedTrackers, messageCreators, showGraph } = this.props;
    const { actions } = this.props;

    if (expandedTrackers.hasOwnProperty(trackerListItemID)) {
      actions.removeExpandedTracker(trackerListItemID);
      actions.updateHighlightedTracker(trackerListItemID);
    } else {
      actions.addExpandedTracker(trackerListItemID);
      actions.updateHighlightedTracker(trackerListItemID);
      messageCreators.sendMetrics({
        type: 'tracker_expand_trackerList',
        insightsView: showGraph ? '1' : '0',
      });
    }
  }

  handleStar = (trackerId, trackerName) => {
    const { starredTrackerIds, messageCreators, showGraph } = this.props;

    if (starredTrackerIds.hasOwnProperty(trackerId)) {
      messageCreators.removeStarredTracker({ trackerId, trackerName, view: showGraph ? '5' : '4' });
    } else {
      messageCreators.addStarredTracker({ trackerId, trackerName, view: showGraph ? '5' : '4' });
    }
  }

  onMouseEnter = (trackerID) => {
    const { actions, highlightedTracker } = this.props;

    if (highlightedTracker !== trackerID) {
      actions.updateHoveredTracker(trackerID);
    }
  }

  onMouseLeave = (trackerID) => {
    const { actions, highlightedTracker } = this.props;

    if (highlightedTracker !== trackerID) {
      actions.updateHoveredTracker('');
    }
  }

  applyCategoryFilters(trackers) {
    const {
      filterOn,
      filters,
    } = this.props;

    if (!filterOn) return trackers;

    const filteredTrackers = {};
    Object.keys(trackers).forEach((trackerID) => {
      if (filters[trackers[trackerID].category]) {
        filteredTrackers[trackerID] = trackers[trackerID];
      }
    });

    return filteredTrackers;
  }

  filterBySearchInput(trackers) {
    const { searchInput } = this.props;

    if (searchInput.length === 0) return trackers;

    return fuzzySearch(searchInput, trackers, ['name']);
  }

  sortTrackerList(trackerInformationArray) {
    const { trackerInformation, starredTrackerIds, sortOrder } = this.props;

    const sortAlphabeticallyUp = (a, b) => (
      trackerInformation[a].name.toLowerCase().localeCompare(
        trackerInformation[b].name.toLowerCase(),
      ));
    const sortAlphabeticallyDown = (a, b) => (
      trackerInformation[b].name.toLowerCase().localeCompare(
        trackerInformation[a].name.toLowerCase(),
      ));
    const sortNumericallyLatencyUp = (a, b) => (
      trackerInformation[a].latency - trackerInformation[b].latency
    );
    const sortNumericallyLatencyDown = (a, b) => (
      trackerInformation[b].latency - trackerInformation[a].latency
    );
    const sortNumericallySizeUp = (a, b) => (
      trackerInformation[a].size - trackerInformation[b].size
    );
    const sortNumericallySizeDown = (a, b) => (
      trackerInformation[b].size - trackerInformation[a].size
    );

    switch (sortOrder) {
      case 'A-Z': return trackerInformationArray.sort(sortAlphabeticallyUp);
      case 'Z-A': return trackerInformationArray.sort(sortAlphabeticallyDown);
      case 'Fastest to Slowest': return trackerInformationArray.sort(sortNumericallyLatencyUp);
      case 'Slowest to Fastest': return trackerInformationArray.sort(sortNumericallyLatencyDown);
      case 'Smallest to Largest': return trackerInformationArray.sort(sortNumericallySizeUp);
      case 'Largest to Smallest': return trackerInformationArray.sort(sortNumericallySizeDown);
      default: return trackerInformationArray.sort(sortAlphabeticallyUp)
        .sort((a, b) => {
          if ((a in starredTrackerIds) === (b in starredTrackerIds)) { return 0; }
          if (a in starredTrackerIds) { return -1; }
          return 1;
        });
    }
  }

  renderNoTrackersString(trackerInformationEmpty) {
    const {
      filterOn,
      searchInput,
      showGraph,
    } = this.props;

    const trackerListEmptyState = ClassNames(
      'TrackerList__emptyState',
      'd-flex',
      'justify-content-center',
      'align-items-center',
      { showGraph },
    );

    let noTrackersString = 'No trackers ';
    if (trackerInformationEmpty) {
      noTrackersString = `${noTrackersString} found`;
    } else {
      const searching = searchInput.length === 0;
      const searchString = searching ? 'search term' : '';
      const bothActive = searching && filterOn ? ' and ' : '';
      const filterString = filterOn ? 'filter set' : '';
      const ending = `${searchString}${bothActive}${filterString}`;
      noTrackersString = `${noTrackersString} match that ${ending}`;
    }

    // Remove the page event lines
    // Simpler than using a store prop to force
    // the TrackerTimelineGraph component to re-render
    const graphPageEvents = D3.select('.TrackerList__pageEventsLines');
    graphPageEvents.selectAll('g').remove();

    return (
      <div className={trackerListEmptyState}>
        <p>{noTrackersString}</p>
      </div>
    );
  }

  renderTrackerListItems(filteredTrackerIDs) {
    const {
      showGraph,
      trackerInformation,
      starredTrackerIds,
      expandedTrackers,
      highlightedTracker,
      hoveredTracker,
      trackerListExpanded,
    } = this.props;

    const trackerListContainer = ClassNames(
      'TrackerList__container',
      { showGraph, trackerListExpanded },
    );

    const TRACKER_LATENCY_THRESHOLD_SLOW = 500;
    const TRACKER_LATENCY_THRESHOLD_MEDIUM = 100;
    const mapColorToLatency = (latency) => {
      if (latency < TRACKER_LATENCY_THRESHOLD_MEDIUM) { return 'green'; }
      if (latency < TRACKER_LATENCY_THRESHOLD_SLOW) { return 'yellow'; }
      return 'red';
    };

    const maxTrackerListContainerHeight = 498;
    // Includes margin and border and accounts for vertical margin collapse
    // Note that page event lines do not display for the whole Tracker List
    // if a tracker item is expanded, so we do not need to account
    // for the different heights in that scenario
    const trackerListItemHeight = 65;
    const topMarginAndBorder = 2;
    const pageEventLinesHeight = Math.min(
      maxTrackerListContainerHeight,
      (filteredTrackerIDs.length * trackerListItemHeight) - topMarginAndBorder,
    );

    return (
      <div className={trackerListContainer}>
        {filteredTrackerIDs.map((key, index) => (
          <TrackerListItem
            key={key}
            id={key}
            name={trackerInformation[key].name}
            size={convertBytes(trackerInformation[key].size)}
            latency={convertMilliseconds(trackerInformation[key].latency)}
            latencyCategory={mapColorToLatency(trackerInformation[key].latency)}
            requests={trackerInformation[key].completedRequests}
            showGraph={showGraph}
            handleExpand={this.handleExpand}
            expanded={expandedTrackers.hasOwnProperty(key)}
            highlighted={(highlightedTracker === key) || (hoveredTracker === key)}
            firstTracker={index === 0}
            pageEventLinesHeight={pageEventLinesHeight}
            starred={starredTrackerIds.hasOwnProperty(key)}
            handleStar={this.handleStar}
            onMouseEnter={this.onMouseEnter}
            onMouseLeave={this.onMouseLeave}
          />
        ))}
      </div>
    );
  }

  render() {
    const {
      showHeader,
      showGraph,
      trackerInformation,
      handleClick,
      trackerListExpanded,
    } = this.props;

    const trackerInformationEmpty = isEmpty(trackerInformation);
    const filteredTrackers = this.filterBySearchInput(
      this.applyCategoryFilters(trackerInformation),
    );
    const filteredSortedTrackerIDs = this.sortTrackerList(Object.keys(filteredTrackers));
    const filteredSortedTrackerIDsEmpty = isEmpty(filteredSortedTrackerIDs);

    return (
      <div className="TrackerList">
        {showHeader && (
          <TrackerListHeader
            filteredTrackerIDs={Object.keys(filteredTrackers)}
            trackerListExpanded={trackerListExpanded}
          />
        )}
        {!showHeader && (
          <div className="TrackerList__smallHeader d-flex align-items-center justify-content-between">
            <p># Tracker Requests</p>
            {!trackerInformationEmpty && <Nav.Link onClick={handleClick}>See details</Nav.Link>}
          </div>
        )}
        {showGraph && !trackerInformationEmpty && (
          <div className="TrackerList__axisHeader">
            <svg className="TrackerList__axisContainer" />
          </div>
        )}
        {showGraph && !trackerInformationEmpty && (
          <div className="TrackerList__pageEventsContainer">
            <svg className="TrackerList__pageEventsLines">
              <defs>
                <pattern id="logPattern" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-57)">
                  <rect id="patternFillRect" width="4" height="4" fill="#555555" />
                  <rect width="1" height="4" fill="white" />
                </pattern>
              </defs>
            </svg>
          </div>
        )}
        {filteredSortedTrackerIDsEmpty && this.renderNoTrackersString(trackerInformationEmpty)}
        {!filteredSortedTrackerIDsEmpty && this.renderTrackerListItems(filteredSortedTrackerIDs)}
      </div>
    );
  }
}

TrackerList.propTypes = {
  handleClick: PropTypes.func,
  starredTrackerIds: PropTypes.objectOf(PropTypes.string).isRequired,
  showHeader: PropTypes.bool,
  showGraph: PropTypes.bool,
  expandedTrackers: PropTypes.objectOf(PropTypes.bool).isRequired,
  highlightedTracker: PropTypes.string.isRequired,
  hoveredTracker: PropTypes.string.isRequired,
  trackerInformation: PropTypes.objectOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    latency: PropTypes.number.isRequired,
    size: PropTypes.number.isRequired,
    completedRequests: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  })).isRequired,
  trackerListExpanded: PropTypes.bool,
  searchInput: PropTypes.string.isRequired,
  sortOrder: PropTypes.string.isRequired,
  filterOn: PropTypes.bool.isRequired,
  filters: PropTypes.objectOf(PropTypes.bool).isRequired,
  messageCreators: PropTypes.shape({
    sendMetrics: PropTypes.func.isRequired,
    addStarredTracker: PropTypes.func.isRequired,
    removeStarredTracker: PropTypes.func.isRequired,
  }).isRequired,
  actions: PropTypes.shape({
    addExpandedTracker: PropTypes.func.isRequired,
    removeExpandedTracker: PropTypes.func.isRequired,
    updateHighlightedTracker: PropTypes.func.isRequired,
    updateHoveredTracker: PropTypes.func.isRequired,
    clearTrackerListItemRef: PropTypes.func.isRequired,
  }).isRequired,
};

TrackerList.defaultProps = {
  handleClick: null,
  showHeader: false,
  showGraph: false,
  trackerListExpanded: false,
};

export default TrackerList;
