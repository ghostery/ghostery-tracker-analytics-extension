import React from 'react';
import PropTypes from 'prop-types';

import TrackerDistributionGraph from '../../../shared-components/TrackerDistributionGraph';
import PageLatencyGraph from '../../../shared-components/PageLatencyGraph';
import PageSizeGraph from '../../../shared-components/PageSizeGraph';
import TrackerList from '../../../shared-components/TrackerList';
import './OverviewTab.scss';

const OverviewTab = ({
  trackerListExpanded, trackerDistributionExpanded, pageLatencyExpanded,
}) => {
  const topGraphExpanded = trackerDistributionExpanded || pageLatencyExpanded;
  return (
    <div className="d-flex flex-column align-items-center">
      {!trackerListExpanded && (
        <div className="OverviewTab__topGraphs d-flex align-items-center justify-content-between">
          {(!topGraphExpanded || trackerDistributionExpanded) && (
            <TrackerDistributionGraph
              expanded={trackerDistributionExpanded}
              width={trackerDistributionExpanded ? 950 : 300}
              height={300}
            />
          )}
          {(!topGraphExpanded || pageLatencyExpanded) && (
            <PageLatencyGraph
              expanded={pageLatencyExpanded}
              width={pageLatencyExpanded ? 950 : 350}
              height={300}
            />
          )}
          {!topGraphExpanded && (
            <PageSizeGraph height={300} width={250} />
          )}
        </div>
      )}
      <div className="OverviewTab__trackerTimeline">
        <TrackerList trackerListExpanded={trackerListExpanded} showHeader showGraph />
      </div>
    </div>
  );
};

OverviewTab.propTypes = {
  trackerListExpanded: PropTypes.bool.isRequired,
  trackerDistributionExpanded: PropTypes.bool.isRequired,
  pageLatencyExpanded: PropTypes.bool.isRequired,
};

export default OverviewTab;
