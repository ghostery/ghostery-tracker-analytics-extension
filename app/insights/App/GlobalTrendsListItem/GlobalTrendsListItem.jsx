import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import GlobalTrendsLineGraph from '../GlobalTrendsLineGraph';
import GlobalTrendsSiteTypeGraph from '../GlobalTrendsSiteTypeGraph';
import categoryMapping from '../../../../src/utils/stringMaps';
import { truncateString } from '../../../../src/utils/convert';
import './GlobalTrendsListItem.scss';


class GlobalTrendsListItem extends Component {
  constructor(props) {
    super(props);

    this.state = { displayExpandedView: false };
  }

  handleClick = () => {
    const { displayExpandedView } = this.state;
    const { messageCreators } = this.props;
    if (!displayExpandedView) {
      messageCreators.sendMetrics({ type: 'tracker_expand_trackerInformationList' });
    }
    this.setState({ displayExpandedView: !displayExpandedView });
  }

  prepareDataForGraphs = () => {
    const { listItemWtmData } = this.props;
    if (!listItemWtmData) {
      return { reach: null, siteReach: null, categoryPresence: null, lastUpdated: null };
    }

    const siteReachLength = listItemWtmData.reach_time_series.site.length;
    const tsLength = listItemWtmData.reach_time_series.ts.length;
    const reach = [];
    const siteReach = [];
    const categoryPresence = [];
    listItemWtmData.reach_time_series.ts.forEach((month, index) => {
      reach.push({ date: month, percentage: listItemWtmData.reach_time_series.page[index] });
      if (index > tsLength - siteReachLength - 1) {
        siteReach.push({
          date: month,
          percentage: listItemWtmData.reach_time_series.site[tsLength - index - 1] / 10000,
        });
      }
    });

    listItemWtmData.presence_by_category.forEach((presence) => {
      categoryPresence.push({ name: presence[0], percentage: presence[1] / 100 });
    });

    reach.sort((a, b) => (new Date(a.date) - new Date(b.date)));

    const date = new Date(reach[reach.length - 1].date);
    date.setDate(date.getDate() + 1);
    const dateString = date.toDateString();
    const lastUpdated = `${dateString.slice(4, 8)}${dateString.slice(11, 15)}`;

    return { reach, siteReach, categoryPresence, lastUpdated };
  }

  render() {
    const {
      id, listItemWtmData, handleStar, starred, name, category,
    } = this.props;
    const { displayExpandedView } = this.state;
    const expandedView = ClassNames('GlobalTrendsListItem__expandedView', {
      expanded: displayExpandedView,
    });
    const GlobalTrendsListItemCircle = ClassNames(
      'GlobalTrendsListItem__circle',
      category,
    );
    const starIconFilePath = starred
      ? 'dist/images/shared/star-filled.svg'
      : 'dist/images/shared/star-empty.svg';

    const { reach, siteReach, categoryPresence, lastUpdated } = this.prepareDataForGraphs();

    return (
      <div className="GlobalTrendsListItem">
        <div
          className="GlobalTrendsListItem__header d-flex justify-content-between"
          onClick={this.handleClick}
        >
          <Container fluid>
            <Row className="GlobalTrendsListItem--paddingZeroTop">
              <Col className="GlobalTrendsListItem--paddingZeroBottom d-flex align-items-center" sm={1}>
                <img
                  alt="Star Tracker"
                  src={[chrome.extension.getURL(starIconFilePath)]}
                  className="GlobalTrendsListItem__star GlobalTrendsListItem--paddingZero"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStar(id, name);
                  }}
                />
              </Col>
              <Col
                className="GlobalTrendsListItem--paddingZero d-flex align-items-center justify-content-center"
                sm={1}
              >
                {listItemWtmData ? listItemWtmData.overview.reach_rank : (
                  <img
                    alt="No Data For This Tracker"
                    src="/dist/images/app/small-bar.svg"
                    width="15"
                    height="3"
                  />
                )}
              </Col>
              <Col className="GlobalTrendsListItem--paddingZero" sm={1} />
              <Col className="GlobalTrendsListItem--paddingZero" sm={5}>
                {truncateString(name, 40)}
              </Col>
              <Col className="GlobalTrendsListItem--paddingZero d-flex flex-row align-items-center" sm={4}>
                <div className={GlobalTrendsListItemCircle} />
                <div className="GlobalTrendsListItem--paddingZero">
                  {categoryMapping[category]}
                </div>
              </Col>
            </Row>
          </Container>
        </div>
        <div className={expandedView}>
          <span className="d-flex">
            <span className="GlobalTrendsListItem__leftSide d-flex flex-column justify-content-start">
              <p>Tracker Reach</p>
              <div className="GlobalTrendsListItem__lineGraph d-flex justify-content-start align-items-center">
                <img
                  src="/dist/images/app/tracker-info-traffic.svg"
                  width="32"
                  height="33"
                  alt="Tracker info line graph (traffic)"
                />
                <span className="GlobalTrendsListItem__graphGroup d-flex flex-column justify-content-between">
                  <p className="GlobalTrendsListItem--smallFont">
                    {`Web traffic that is tracked by ${name}`}
                  </p>
                  {listItemWtmData && displayExpandedView ? (
                    <span className="d-flex justify-content-start align-items-center">
                      <p className="GlobalTrendsListItem--largeFont">
                        {`${(listItemWtmData.overview.reach * 100).toFixed(2)} %`}
                      </p>
                      <GlobalTrendsLineGraph data={reach} />
                    </span>
                  ) : (
                    <p className="GlobalTrendsListItem__noDataText">
                      Data not yet available
                    </p>
                  )}
                </span>
              </div>
              <div className="GlobalTrendsListItem__lineGraph d-flex justify-content-start align-items-center">
                <img
                  src="/dist/images/app/tracker-info-site.svg"
                  width="32"
                  height="33"
                  alt="Tracker info line graph (sites)"
                />
                <span className="GlobalTrendsListItem__graphGroup d-flex flex-column justify-content-between">
                  <p className="GlobalTrendsListItem--smallFont">
                    {`Sites using the ${name} tracker`}
                  </p>
                  {listItemWtmData && displayExpandedView ? (
                    <span className="d-flex justify-content-start align-items-center">
                      <p className="GlobalTrendsListItem--largeFont">
                        {`${listItemWtmData.overview.site_reach_top10k / 100} %`}
                      </p>
                      <GlobalTrendsLineGraph data={siteReach} />
                    </span>
                  ) : (
                    <p className="GlobalTrendsListItem__noDataText">
                      Data not yet available
                    </p>
                  )}
                </span>
              </div>
              <p className="GlobalTrendsListItem--smallFont">
                {listItemWtmData && `Data last updated in ${lastUpdated}`}
              </p>
            </span>
            <span className="GlobalTrendsListItem__rightSide d-flex flex-column justify-content-start">
              <p>Seen On These Types Of Websites</p>
              {listItemWtmData && displayExpandedView ? (
                <GlobalTrendsSiteTypeGraph data={categoryPresence} />
              ) : (
                <p className="GlobalTrendsListItem__noDataText reduceTopPadding addBottomPadding">
                  Data not yet available
                </p>
              )}
              <p className="GlobalTrendsListItem--marginZero">Tracking Methods</p>
              {!listItemWtmData && (
                <p className="GlobalTrendsListItem__noDataText reduceTopPadding">
                  Data not yet available
                </p>
              )}
              {listItemWtmData && listItemWtmData.tracking_method.cookies && (
                <span className="GlobalTrendsListItem__trackingType d-flex justify-content-start align-items-center">
                  <img
                    src="/dist/images/app/cookies.svg"
                    width="24"
                    height="24"
                    alt="Cookie icon (tracking type)"
                  />
                  <p className="GlobalTrendsListItem__trackingTypeText">Cookies</p>
                  <OverlayTrigger
                    placement="right"
                    overlay={(
                      <Tooltip className="tooltipLeft">
                        Files placed by a website into the browser that are used to identify the user.
                      </Tooltip>
                    )}
                  >
                    <img
                      src="/dist/images/shared/info-icon.svg"
                      className="infoIcon"
                      width="16"
                      height="16"
                      alt="More info hover"
                    />
                  </OverlayTrigger>
                </span>
              )}
              {listItemWtmData && listItemWtmData.tracking_method.fingerprinting && (
                <span className="GlobalTrendsListItem__trackingType d-flex justify-content-start align-items-center">
                  <img
                    src="/dist/images/app/fingerprint.svg"
                    width="20"
                    height="23"
                    alt="Fingerprinting icon (tracking type)"
                  />
                  <p className="GlobalTrendsListItem__trackingTypeText">
                    Fingerprinting
                  </p>
                  <OverlayTrigger
                    placement="right"
                    overlay={(
                      <Tooltip className="tooltipLeft">
                        Data collected for the purpose of identification and can be used to identify individuals or devices even when cookies are turned off
                      </Tooltip>
                    )}
                  >
                    <img
                      src="/dist/images/shared/info-icon.svg"
                      className="infoIcon"
                      width="16"
                      height="16"
                      alt="More info hover"
                    />
                  </OverlayTrigger>
                </span>
              )}
              {listItemWtmData && !listItemWtmData.tracking_method.cookies
              && !listItemWtmData.tracking_method.fingerprinting && (
                <p className="GlobalTrendsListItem__notDetectedText">
                  Method not detected
                </p>
              )}
            </span>
          </span>
        </div>
      </div>
    );
  }
}

GlobalTrendsListItem.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  messageCreators: PropTypes.shape({
    sendMetrics: PropTypes.func.isRequired,
  }).isRequired,
  handleStar: PropTypes.func.isRequired,
  starred: PropTypes.bool.isRequired,
  listItemWtmData: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.shape({
      tracking_method: PropTypes.shape({
        cookies: PropTypes.bool.isRequired,
        fingerprinting: PropTypes.bool.isRequired,
      }).isRequired,
      presence_by_category: PropTypes.arrayOf(PropTypes.arrayOf(
        PropTypes.oneOfType([
          PropTypes.string.isRequired,
          PropTypes.number.isRequired,
        ]).isRequired,
      )).isRequired,
      overview: PropTypes.shape({
        reach: PropTypes.number.isRequired,
        site_reach_top10k: PropTypes.number.isRequired,
        reach_rank: PropTypes.number.isRequired,
      }).isRequired,
      reach_time_series: PropTypes.shape({
        page: PropTypes.arrayOf(PropTypes.number).isRequired,
        ts: PropTypes.arrayOf(PropTypes.string).isRequired,
        site: PropTypes.arrayOf(PropTypes.number).isRequired,
      }).isRequired,
    }),
  ]).isRequired,
};

export default GlobalTrendsListItem;
