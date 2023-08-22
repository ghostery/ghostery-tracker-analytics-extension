import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import isEqual from 'lodash.isequal';
import isEmpty from 'lodash.isempty';
import * as D3 from 'd3';
import { convertBytes, convertMilliseconds } from '../../../src/utils/convert';

import StandAloneGraphHeader from '../StandAloneGraphHeader';
import ThemedLegend from '../ThemedLegend';
import './TrackerDistributionGraph.scss';

class TrackerDistributionGraph extends Component {
  componentDidMount() {
    const { trackerInformation, trackerListItemRefs } = this.props;
    this.setupGraph();
    if (!isEmpty(trackerInformation)) { this.generateGraph(); }
    if (!isEmpty(trackerListItemRefs)) { this.mapClickHandlers(); }
  }

  componentDidUpdate(prevProps) {
    const {
      trackerInformation,
      hoveredTracker,
      highlightedTracker,
      trackerListItemRefs,
      expanded,
    } = this.props;

    if (isEmpty(trackerInformation)) {
      D3.select(this.graphRef).selectAll('*').remove();
    } else if (!isEmpty(trackerInformation) && isEmpty(prevProps.trackerInformation)) {
      this.setupGraph();
    }

    if (!isEmpty(trackerInformation)
      && !isEqual(prevProps.trackerInformation, trackerInformation)) {
      this.generateGraph(); // TODO: add updateGraph() method for this case
    }

    if (!isEmpty(trackerInformation)
      && (!isEqual(prevProps.highlightedTracker, highlightedTracker)
        || !isEqual(prevProps.hoveredTracker, hoveredTracker))) {
      const view = D3.select(this.graphRef).select('svg');
      view.selectAll('circle')
        .style('stroke', 'none');

      if (highlightedTracker !== '') {
        view.select(`#circle-${highlightedTracker}`)
          .style('stroke', '#00aef0')
          .style('stroke-width', 3);
      }

      if (hoveredTracker !== '') {
        view.select(`#circle-${hoveredTracker}`)
          .style('stroke', '#00aef0')
          .style('stroke-width', 3);
      }
    }

    if (!isEqual(prevProps.trackerListItemRefs, trackerListItemRefs)) {
      this.mapClickHandlers();
    }

    if (expanded !== prevProps.expanded) {
      if (!expanded) { D3.select(this.graphRef).selectAll('circle').remove(); }
      this.moveText();
      this.generateGraph();
      this.mapClickHandlers();
    }
  }

  setupGraph() {
    const { small } = this.props;
    const smallClass = small ? 'small' : '';

    D3.select(this.graphRef).selectAll('*').remove();

    const view = D3.select(this.graphRef)
      .append('svg');

    view.append('rect');

    view.append('g')
      .attr('class', `TrackerDistributionGraph__xAxis ${smallClass}`);

    view.append('g')
      .attr('class', `TrackerDistributionGraph__yAxis ${smallClass}`);

    view.append('g')
      .attr('class', 'TrackerDistributionGraph__gridlines');

    view.append('g')
      .attr('class', 'container');
  }

  moveText = () => {
    const { width } = this.props;
    const view = D3.select(this.graphRef).select('svg');

    view.selectAll('text.x-label')
      .attr('x', width / 2);
  }

  mapClickHandlers = () => {
    const { trackerListItemRefs, actions, messageCreators, small } = this.props;
    const view = D3.select(this.graphRef).select('svg');
    const clickHandler = (id) => {
      actions.updateHighlightedTracker(id);
      const trackerListItem = trackerListItemRefs[id];
      trackerListItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      messageCreators.sendMetrics({
        type: 'tracker_click_trackerDistribution',
        insightsView: small ? '0' : '1',
      });
    };
    Object.keys(trackerListItemRefs).forEach((key) => {
      view.select(`#circle-${key}`)
        .on('click', () => clickHandler(key));
    });
  }

  generateGraph() {
    const {
      width, height, trackerInformation, actions, small, expanded, highlightedTracker,
    } = this.props;

    const data = [];
    Object.keys(trackerInformation).forEach((key) => {
      const val = { ...trackerInformation[key] };
      val.id = key;
      data.push(val);
    });

    const returnWidthMultiplier = () => {
      if (small) { return 0.15; }
      if (expanded) { return 0.05; }
      return 0.1;
    };

    const margin = {
      top: height * (small ? 0.1 : 0.15),
      bottom: height * 0.2,
      left: width * (expanded ? 0.08 : 0.2),
      right: width * returnWidthMultiplier(),
    };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const maxY = D3.max(data, d => d.size);
    const maxX = D3.max(data, d => d.latency);
    const y = D3.scaleLinear()
      .domain([0, Math.max(1, maxY)])
      .range([innerHeight, 0]);

    const x = D3.scaleLinear()
      .domain([0, Math.max(1, maxX)])
      .range([0, innerWidth]);

    const yAxis = D3.axisLeft(y).ticks(maxY === 0 ? 0.5 : 7).tickSize(0);

    const xAxis = D3.axisBottom(x).ticks(maxY === 0 ? 0.5 : 4).tickSize(0).tickPadding(10);
    // TODO: These will later come from settings props that will also be used
    // to populate the legend in the header of this graph
    const TRACKER_LATENCY_THRESHOLD_SLOW = 500;
    const TRACKER_LATENCY_THRESHOLD_MEDIUM = 100;
    function getTooltipContainer() {
      const tooltip = !small
        ? D3.select('.Graph__tooltip')
        : D3.select(document.querySelector('.resolved').shadowRoot).select('.Graph__tooltip');
      const tooltipCaret = !small
        ? D3.select('.Graph__tooltipCaret')
        : D3.select(document.querySelector('.resolved').shadowRoot).select('.Graph__tooltipCaret');
      return {
        tooltip,
        tooltipCaret,
      };
    }

    function onMouseOver(d) {
      actions.updateHoveredTracker(d.id);
      const bbox = this.graphRef.getBoundingClientRect();
      const tooltipContainer = getTooltipContainer();
      tooltipContainer.tooltipCaret
        .classed('downCaret', false)
        .classed('rightCaret', false);
      tooltipContainer.tooltip.selectAll('p').remove();
      tooltipContainer.tooltip.selectAll('span').remove();
      tooltipContainer.tooltip
        .append('p')
        .html(d.name)
        .style('font-weight', 'bold')
        .style('margin', '4px');
      tooltipContainer.tooltip
        .append('p')
        .html(`${convertBytes(d.size)}<br>${convertMilliseconds(d.latency)}`)
        .style('margin', '4px');
      tooltipContainer.tooltip
        .style('opacity', 0);
      const tooltipBbox = tooltipContainer.tooltip.node().getBoundingClientRect();
      const top = !small
        ? bbox.y + y(d.size) + margin.top - (tooltipBbox.height / 2)
        : bbox.y - window.innerHeight + y(d.size) + margin.top - (tooltipBbox.height / 2) + 295;
      const left = bbox.x + x(d.latency) + margin.left - tooltipBbox.width - 15;
      tooltipContainer.tooltip
        .style('left', `${left}px`)
        .style('top', `${top}px`)
        .transition()
        .duration(300)
        .style('opacity', 1);
      tooltipContainer.tooltipCaret
        .style('display', 'block')
        .style('left', `${tooltipBbox.width + left}px`)
        .style('top', `${(tooltipBbox.height / 2) + top - 5.5}px`)
        .style('opacity', 0)
        .transition()
        .duration(300)
        .style('opacity', 1);
    }

    function onMouseOut() {
      actions.updateHoveredTracker('');
      const tooltipContainer = getTooltipContainer();
      tooltipContainer.tooltip
        .transition()
        .duration(300)
        .style('opacity', 0);
      tooltipContainer.tooltipCaret
        .transition()
        .duration(300)
        .style('opacity', 0);
    }

    const view = D3.select(this.graphRef)
      .select('svg')
      .attr('width', width)
      .attr('height', height);

    view.select('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'black')
      .attr('fill-opacity', 0.5);

    view.select('g.TrackerDistributionGraph__xAxis')
      .attr('transform', `translate(${margin.left},${innerHeight + margin.top})`)
      // Commenting this out for now because this transition doesn't match the
      // expanded animation in the Page Latency graph
      // .transition()
      // .duration(300)
      .call(xAxis);

    view.select('g.TrackerDistributionGraph__yAxis')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      // Commenting this out for now because this transition doesn't match the
      // expanded animation in the Page Latency graph
      // .transition()
      // .duration(300)
      .call(yAxis);

    view.select('g.TrackerDistributionGraph__gridlines')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      // Commenting this out for now because this transition doesn't match the
      // expanded animation in the Page Latency graph
      // .transition()
      // .duration(200)
      .call(yAxis.tickSize(-innerWidth).tickFormat(''));

    const circles = view.select('g.container')
      .selectAll('circle')
      .data(data, d => d.id);

    const green = '#9ecc42';
    const yellow = '#ffc063';
    const red = '#be4948';

    circles.enter()
      .append('circle')
      .attr('id', d => `circle-${d.id}`)
      .attr('cx', d => x(d.latency) + margin.left)
      .attr('cy', d => y(d.size) + margin.top)
      .attr('r', 0)
      .attr('opacity', small ? 1 : 0.5)
      .style('cursor', 'pointer')
      .transition()
      .delay((d, i) => i * (500 / data.length))
      .duration(500)
      .attr('r', small ? 2 : 4)
      .attr('fill', (d) => {
        if (small) { return 'white'; }
        if (d.latency > TRACKER_LATENCY_THRESHOLD_SLOW) { return red; }
        if (d.latency > TRACKER_LATENCY_THRESHOLD_MEDIUM) { return yellow; }
        return green;
      });

    view.select('g.container')
      .selectAll('circle')
      .on('mouseover', d => onMouseOver.call(this, d))
      .on('mouseout', d => onMouseOut(d))
      .transition()
      .duration(500)
      .attr('r', small ? 2 : 4)
      .attr('cx', d => x(d.latency) + margin.left)
      .attr('cy', d => y(d.size) + margin.top)
      .delay((d, i) => i * (500 / data.length))
      .attr('fill', (d) => {
        if (small) { return 'white'; }
        if (d.latency > TRACKER_LATENCY_THRESHOLD_SLOW) { return red; }
        if (d.latency > TRACKER_LATENCY_THRESHOLD_MEDIUM) { return yellow; }
        return green;
      });

    circles.exit().remove();

    if (view.select('.y-label').empty() && view.select('.x-label').empty()) {
      view.append('text')
        .attr('class', 'y-label')
        .attr('x', small ? margin.left / 2 : margin.left + 5)
        .attr('y', small ? height / 2 : margin.top / 2)
        .style('text-anchor', small ? 'middle' : 'end')
        .attr('font-size', 10)
        .attr('fill', 'white')
        .attr('stroke', 'none')
        .text(small ? 'Size' : 'Size (bytes)');

      view.append('text')
        .attr('class', 'x-label')
        .attr('x', width / 2)
        .attr('y', small ? (height - (margin.bottom / 2)) : (height - (margin.bottom / 4)))
        .style('text-anchor', 'middle')
        .attr('font-size', 10)
        .attr('fill', 'white')
        .attr('stroke', 'none')
        .text(small ? 'Time' : 'Time (ms)');
    }
    if (highlightedTracker !== '') {
      view.select(`#circle-${highlightedTracker}`)
        .style('stroke', '#00aef0')
        .style('stroke-width', 3);
    }
  }

  render() {
    const {
      width, height, trackerInformation, small, handleClick, expanded, actions,
    } = this.props;
    const styles = { width: `${width}px`, height: `${height}px` };
    const empty = isEmpty(trackerInformation);

    const trackerDistributionGraphEmptyState = ClassNames(
      'TrackerDistributionGraph__emptyState',
      'd-flex',
      'justify-content-center',
      'align-items-center',
      { small },
    );

    return (
      <div className="StandAloneGraph__background d-flex">
        {small && <div className="StandAloneGraph__blueStripe" />}
        <div className="d-flex flex-column">
          <StandAloneGraphHeader
            title="Tracker Distribution"
            small={small}
            handleClick={handleClick}
            hideSeeDetails={empty}
            tooltipText="View the distribution of trackers based on size and latency"
            expanded={expanded}
            expandGraph={() => {
              actions.expandOrCollapseComponent({ trackerDistribution: !expanded });
            }}
            expandable
          >
            {!small && <ThemedLegend />}
          </StandAloneGraphHeader>
          <div className="TrackerDistributionGraph__container" style={styles}>
            <div ref={(node) => { this.graphRef = node; }} />
            {empty && (
              <div className={trackerDistributionGraphEmptyState} style={styles}>
                <p>No trackers found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

TrackerDistributionGraph.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  trackerInformation: PropTypes.objectOf(PropTypes.shape({
    latency: PropTypes.number.isRequired,
    size: PropTypes.number.isRequired,
  })).isRequired,
  highlightedTracker: PropTypes.string.isRequired,
  hoveredTracker: PropTypes.string.isRequired,
  actions: PropTypes.shape({
    updateHighlightedTracker: PropTypes.func.isRequired,
    updateHoveredTracker: PropTypes.func.isRequired,
    expandOrCollapseComponent: PropTypes.func.isRequired,
  }).isRequired,
  trackerListItemRefs: PropTypes.shape({ id: PropTypes.element }).isRequired,
  small: PropTypes.bool,
  handleClick: PropTypes.func,
  expanded: PropTypes.bool.isRequired,
  messageCreators: PropTypes.shape({
    sendMetrics: PropTypes.func.isRequired,
  }).isRequired,
};

TrackerDistributionGraph.defaultProps = {
  small: false,
  handleClick: null,
};

export default TrackerDistributionGraph;
