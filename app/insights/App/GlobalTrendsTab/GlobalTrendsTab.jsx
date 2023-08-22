import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import isEqual from 'lodash.isequal';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import GlobalTrendsListItem from '../GlobalTrendsListItem';
import { convertBytes } from '../../../../src/utils/convert';
import './GlobalTrendsTab.scss';

class GlobalTrendsTab extends Component {
  constructor(props) {
    super(props);
    this.state = { sort: 'favorites' };
  }

  componentDidMount() {
    this.fetchNewWTMData(true);
  }

  componentDidUpdate(prevProps) {
    this.fetchNewWTMData(false, prevProps);
  }

  fetchNewWTMData = (initialFetch, prevProps) => {
    const { actions, trackerInformation, wtmData } = this.props;
    if (initialFetch || !(isEqual(prevProps.trackerInformation, trackerInformation))) {
      const newTrackers = [];
      Object.keys(trackerInformation).forEach((trackerId) => {
        if (!(trackerId in wtmData)) {
          newTrackers.push(trackerId);
        }
      });
      actions.fetchWTMData(newTrackers);
    }
  }

  handleStar = (trackerId, trackerName) => {
    const { starredTrackerIds, messageCreators } = this.props;

    if (starredTrackerIds.hasOwnProperty(trackerId)) {
      messageCreators.removeStarredTracker({ trackerId, trackerName, view: '5' });
    } else {
      messageCreators.addStarredTracker({ trackerId, trackerName, view: '5' });
    }
  }

  handleClick = (sortType) => {
    const { messageCreators } = this.props;
    const sortTypeMapping = {
      favorites: '0',
      prevalence: '1',
      category: '2',
    };
    messageCreators.sendMetrics({
      type: 'sort_trackerInformationTab',
      sortType: sortTypeMapping[sortType],
    });
    this.setState({ sort: sortType });
  }

  sortTrackerIds = () => {
    const { sort } = this.state;
    const { trackerInformation, wtmData, starredTrackerIds } = this.props;

    const sortedTrackerIds = Object.keys(trackerInformation);
    sortedTrackerIds.sort((a, b) => (
      trackerInformation[a].name.toLowerCase().localeCompare(
        trackerInformation[b].name.toLowerCase(),
      )
    ));

    if (sort === 'favorites') {
      sortedTrackerIds.sort((a, b) => {
        if ((a in starredTrackerIds) === (b in starredTrackerIds)) { return 0; }
        if (a in starredTrackerIds) { return -1; }
        return 1;
      });
    } else if (sort === 'prevalence') {
      sortedTrackerIds.sort((a, b) => {
        if (!wtmData[a] && !wtmData[b]) { return 0; }
        if (wtmData[a] && !wtmData[b]) { return -1; }
        if (!wtmData[a] && wtmData[b]) { return 1; }
        return wtmData[a].overview.reach_rank - wtmData[b].overview.reach_rank;
      });
    } else if (sort === 'category') {
      sortedTrackerIds.sort((a, b) => (
        trackerInformation[a].category.toLowerCase()
          .localeCompare(trackerInformation[b].category.toLowerCase())
      ));
    }

    return sortedTrackerIds;
  }

  render() {
    const { sort } = this.state;
    const { wtmData, trackerInformation, starredTrackerIds, totalSize } = this.props;
    const setButtonClasses = sortType => (
      ClassNames(
        'GlobalTrendsTab__headerButton',
        'd-flex',
        'justify-content-center',
        'align-items-center',
        { active: sortType },
      )
    );

    const sortedTrackerIds = this.sortTrackerIds();

    const favoritesClassNames = setButtonClasses(sort === 'favorites');
    const prevalenceClassNames = setButtonClasses(sort === 'prevalence');
    const categoryClassNames = setButtonClasses(sort === 'category');

    return (
      <div className="GlobalTrendsTab d-flex justify-content-between align-items-start">
        <div className="GlobalTrendsTab__list GlobalTrendsTab--opaqueBackground">
          <div className="GlobalTrendsTab__listHeader d-flex flex-column justify-content-between">
            <div className="d-flex justify-content-start align-items-center">
              <h3 className="GlobalTrendsTab--marginRight">
                Known Tracker Trends
              </h3>
              <OverlayTrigger
                placement="auto"
                overlay={(
                  <Tooltip className="tooltipRight">
                    View available statistics and trends over time for trackers on this page
                  </Tooltip>
                )}
              >
                <img
                  className="infoIcon"
                  src="/dist/images/shared/info-icon.svg"
                  width="16"
                  height="16"
                  alt="More info hover: View known tracker trends"
                />
              </OverlayTrigger>
            </div>
            <div className="GlobalTrendsTab__headerButtonList d-flex justify-content-between align-items-center">
              <p>Sort by: </p>
              <OverlayTrigger
                placement="top"
                delay={{ show: 500 }}
                overlay={(
                  <Tooltip className="tooltipLeft">
                    Sort by favorited trackers
                  </Tooltip>
                )}
              >
                <div
                  className={favoritesClassNames}
                  onClick={() => this.handleClick('favorites')}
                >
                  <p>Favorites</p>
                </div>
              </OverlayTrigger>
              <OverlayTrigger
                placement="top"
                delay={{ show: 500 }}
                overlay={(
                  <Tooltip className="tooltipLeft">
                    Sort by most common trackers
                  </Tooltip>
                )}
              >
                <div
                  className={prevalenceClassNames}
                  onClick={() => this.handleClick('prevalence')}
                >
                  <p>Prevalence</p>
                </div>
              </OverlayTrigger>
              <OverlayTrigger
                placement="top"
                delay={{ show: 500 }}
                overlay={(
                  <Tooltip className="tooltipLeft">Sort by tracker type</Tooltip>
                )}
              >
                <div
                  className={categoryClassNames}
                  onClick={() => this.handleClick('category')}
                >
                  <p>Category</p>
                </div>
              </OverlayTrigger>
            </div>
          </div>
          <div className="GlobalTrendsTab__tableHeader">
            <Container fluid className="GlobalTrendsTab__tableHeaderContainer">
              <Row>
                <Col className="GlobalTrendsListItem--paddingZero" sm={1} />
                <Col className="GlobalTrendsListItem__prevalence GlobalTrendsListItem--paddingZero" sm={2}>Prevalence</Col>
                <Col className="GlobalTrendsListItem--paddingZero" sm={5}>Tracker</Col>
                <Col className="GlobalTrendsListItem--paddingZero" sm={4}>Category</Col>
              </Row>
            </Container>
          </div>
          {sortedTrackerIds.map(trackerId => (
            <GlobalTrendsListItem
              key={trackerId}
              id={trackerId}
              name={trackerInformation[trackerId].name}
              category={trackerInformation[trackerId].category}
              listItemWtmData={wtmData[trackerId] || false}
              handleStar={this.handleStar}
              starred={starredTrackerIds.hasOwnProperty(trackerId)}
            />
          ))}
        </div>
        <div className="GlobalTrendsTab__stats">
          <div className="GlobalTrendsTab__statDisplay GlobalTrendsTab--opaqueBackground">
            <div className="d-flex justify-content-start align-items-center">
              <h3 className="GlobalTrendsTab--marginRight">
                Total Tracker Size on this Page
              </h3>
              <OverlayTrigger
                placement="auto"
                overlay={(
                  <Tooltip className="tooltipLeft">
                    Aggregate size of all trackers found on this page
                  </Tooltip>
                )}
              >
                <img
                  src="/dist/images/shared/info-icon.svg"
                  className="infoIcon"
                  width="16"
                  height="16"
                  alt="More info hover: Aggregate size of all trackers found on this page"
                />
              </OverlayTrigger>
            </div>
            <p className="GlobalTrendsTab__statText">{convertBytes(totalSize)}</p>
          </div>
        </div>
      </div>
    );
  }
}

GlobalTrendsTab.propTypes = {
  actions: PropTypes.shape({
    fetchWTMData: PropTypes.func.isRequired,
  }).isRequired,
  trackerInformation: PropTypes.oneOfType([
    PropTypes.shape({}),
    PropTypes.shape({
      trackerId: PropTypes.shape({
        name: PropTypes.string.isRequired,
      }),
    }),
  ]).isRequired,
  totalSize: PropTypes.number.isRequired,
  wtmData: PropTypes.shape({}).isRequired,
  starredTrackerIds: PropTypes.objectOf(PropTypes.string).isRequired,
  messageCreators: PropTypes.shape({
    sendMetrics: PropTypes.func.isRequired,
    addStarredTracker: PropTypes.func.isRequired,
    removeStarredTracker: PropTypes.func.isRequired,
  }).isRequired,
};

export default GlobalTrendsTab;
