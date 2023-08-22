import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import isEqual from 'lodash.isequal';
import * as D3 from 'd3';

import StandAloneGraphHeader from '../StandAloneGraphHeader';
import { convertMilliseconds } from '../../../src/utils/convert';
import './PageLatencyGraph.scss';

class PageLatencyGraph extends Component {
  componentDidMount() {
    const { timingPerformance } = this.props;
    this.setupGraph();
    if (timingPerformance.loadEventEnd > 0) {
      this.generateGraph();
    }
  }

  componentDidUpdate(prevProps) {
    const { timingPerformance, expanded } = this.props;
    const { navigationStart } = timingPerformance;

    if (expanded !== prevProps.expanded) {
      this.moveText();
      if (!expanded) {
        this.setupGraph();
        this.generateGraph();
      }
    }

    if (!isEqual(prevProps.timingPerformance.navigationStart, navigationStart)) {
      D3.select(this.graphRef).selectAll('rect.bar').remove();
    }

    if (timingPerformance.loadEventEnd > 0 && !isEqual(prevProps, this.props)) {
      this.generateGraph();
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
      .attr('class', `PageLatencyGraph__xAxis ${smallClass}`);
    view.append('g')
      .attr('class', `PageLatencyGraph__yAxis ${smallClass}`);
    view.append('g')
      .attr('class', 'PageLatencyGraph__gridlines');
  }

  moveText = () => {
    const { width } = this.props;
    const view = D3.select(this.graphRef).select('svg');

    view.selectAll('text.x-label')
      .attr('x', width / 2);
  }

  generateGraph() {
    const { timingPerformance } = this.props;
    const { navigationStart, loadEventEnd } = timingPerformance;
    const domainLimit = loadEventEnd - navigationStart;

    const data = [
      { label: 'App cache', start: 0, duration: 0 },
      { label: 'DNS', start: 0, duration: 0 },
      { label: 'TCP', start: 0, duration: 0 },
      { label: 'Request', start: 0, duration: 0 },
      { label: 'Response', start: 0, duration: 0 },
      { label: 'Processing', start: 0, duration: 0 },
      { label: 'OnLoad', start: 0, duration: 0 },
    ];
    if (timingPerformance.redirectStart > 0) {
      data.unshift({ label: 'Redirect', start: 0, end: 0 });
    }
    data.forEach((el) => {
      switch (el.label) {
        case 'Redirect': {
          el.start = timingPerformance.redirectStart - navigationStart;
          el.duration = timingPerformance.redirectEnd - navigationStart - el.start;
          break;
        }
        case 'App cache': {
          el.start = timingPerformance.fetchStart - navigationStart;
          el.duration = timingPerformance.domainLookupStart - navigationStart - el.start;
          break;
        }
        case 'DNS': {
          el.start = timingPerformance.domainLookupStart - navigationStart;
          el.duration = timingPerformance.domainLookupEnd - navigationStart - el.start;
          break;
        }
        case 'TCP': {
          el.start = timingPerformance.connectStart - navigationStart;
          el.duration = timingPerformance.connectEnd - navigationStart - el.start;
          break;
        }
        case 'Request': {
          el.start = timingPerformance.requestStart - navigationStart;
          el.duration = timingPerformance.responseStart - navigationStart - el.start;
          break;
        }
        case 'Response': {
          el.start = timingPerformance.responseStart - navigationStart;
          el.duration = timingPerformance.responseEnd - navigationStart - el.start;
          break;
        }
        case 'Processing': {
          el.start = timingPerformance.domLoading - navigationStart;
          el.duration = timingPerformance.loadEventStart - navigationStart - el.start;
          break;
        }
        case 'OnLoad': {
          el.start = timingPerformance.loadEventStart - navigationStart;
          el.duration = timingPerformance.loadEventEnd - navigationStart - el.start;
          break;
        }
        default: break;
      }
    });

    const { width, height, small, expanded } = this.props;

    const returnWidthMultiplier = (right = false) => {
      if (small) { return right ? 0.15 : 0.25; }
      if (expanded) { return right ? 0.05 : 0.08; }
      return right ? 0.1 : 0.2;
    };

    const margin = {
      top: height * 0.15,
      bottom: height * 0.2,
      left: width * returnWidthMultiplier(),
      right: width * returnWidthMultiplier(true),
    };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const y = D3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, innerHeight]);

    const x = D3.scaleLinear()
      .domain([0, domainLimit])
      .range([0, innerWidth]);
    const view = D3.select(this.graphRef)
      .select('svg')
      .attr('width', width)
      .attr('height', height);

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
      const bbox = this.graphRef.getBoundingClientRect();
      const tooltipContainer = getTooltipContainer();
      tooltipContainer.tooltipCaret
        .classed('downCaret', false)
        .classed('rightCaret', false);
      tooltipContainer.tooltip.selectAll('p').remove();
      tooltipContainer.tooltip.selectAll('span').remove();
      tooltipContainer.tooltip
        .append('p')
        .html(d.label)
        .style('font-weight', 'bold')
        .style('margin', '4px');
      tooltipContainer.tooltip
        .append('p')
        .html(convertMilliseconds(d.duration))
        .style('margin', '4px');
      tooltipContainer.tooltip
        .style('opacity', 0);

      const tooltipBbox = tooltipContainer.tooltip.node().getBoundingClientRect();
      const top = !small
        ? bbox.y + y(d.label) + margin.top - (tooltipBbox.height / 2) + 9.8
        : bbox.y - window.innerHeight + y(d.label) + 295
          + margin.top + 6.1 - (tooltipBbox.height / 2);
      const left = bbox.x + x(d.start) + margin.left - tooltipBbox.width - 10;
      tooltipContainer.tooltip
        .style('left', `${left}px`)
        .style('top', `${top}px`)
        .transition()
        .duration(300)
        .style('opacity', 1);

      tooltipContainer.tooltipCaret
        .style('left', `${left + tooltipBbox.width}px`)
        .style('top', `${top + (tooltipBbox.height / 2) - 3}px`)
        .style('opacity', 0)
        .transition()
        .duration(300)
        .style('opacity', 1);
    }

    function onMouseOut() {
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

    view.select('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'black')
      .attr('fill-opacity', 0.5);

    const bars = view.selectAll('rect.bar')
      .data(data, d => d.label);

    bars.exit().remove();

    bars.enter()
      .append('rect')
      .attr('class', 'bar PageLatencyRect');

    view.selectAll('rect.bar')
      .attr('id', d => d.label)
      .attr('x', d => x(d.start) + margin.left)
      .attr('y', d => y(d.label) + margin.top + (small ? 4 : 2.8))
      .attr('height', height * (small ? 0.045 : 0.065))
      .attr('fill', 'white')
      .style('cursor', 'pointer')
      .on('mouseenter', d => onMouseOver.call(this, d))
      .on('mouseleave', () => onMouseOut())
      .transition()
      .delay((d, i) => i * 30)
      .duration(600)
      .attr('width', d => x(d.duration));

    view.select('g.PageLatencyGraph__xAxis')
      .attr('transform', `translate(${margin.left},${innerHeight + margin.top - (small ? 1 : 2)})`)
      .call(D3.axisBottom(x).ticks(4).tickSize(0).tickPadding(10));

    const yAxis = D3.axisLeft(y).ticks(7).tickSize(0);

    view.select('g.PageLatencyGraph__yAxis')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .call(yAxis);

    view.select('g.PageLatencyGraph__gridlines')
      .attr('transform', `translate(${margin.left},${margin.top - (height * (small ? 0.048 : 0.051))})`)
      .call(yAxis.tickSize(-innerWidth).tickFormat(''));

    if (view.select('.y-label').empty() && view.select('.x-label').empty()) {
      view.append('text')
        .attr('class', 'y-label')
        .attr('x', small ? margin.left / 2 + 5 : margin.left - 10)
        .attr('y', margin.top / 2)
        .style('text-anchor', small ? 'middle' : 'end')
        .attr('font-size', 10)
        .attr('fill', 'white')
        .attr('stroke', 'none')
        .text('Events');

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
  }

  render() {
    const {
      width,
      height,
      timingPerformance,
      small,
      handleClick,
      expanded,
      actions,
    } = this.props;
    const styles = { width: `${width}px`, height: `${height}px` };

    const standAloneGraphKeyInfo = ClassNames('StandAloneGraphHeader__keyData', {
      small,
    });

    const displayTotalPageLoad = () => {
      const { redirectStart, fetchStart, loadEventEnd } = timingPerformance;
      if (loadEventEnd === 0) { return null; }
      const start = redirectStart > 0 ? redirectStart : fetchStart;
      const duration = loadEventEnd - start;

      if (small) {
        return (
          <div className={standAloneGraphKeyInfo}>
            <p>{convertMilliseconds(duration)}</p>
            <p id="StandAloneGraphHeader__smallSubHeader">Page Load Time</p>
          </div>
        );
      }

      return (
        <p className={standAloneGraphKeyInfo}>
          {`Page Load Time: ${convertMilliseconds(duration)}`}
        </p>
      );
    };

    return (
      <div className="StandAloneGraph__background d-flex">
        {small && <div className="StandAloneGraph__blueStripe" />}
        <div className="d-flex flex-column">
          <StandAloneGraphHeader
            title="Page Latency"
            small={small}
            handleClick={handleClick}
            tooltipText="View a breakdown of the page load process into separate events"
            expanded={expanded}
            expandGraph={() => actions.expandOrCollapseComponent({ pageLatency: !expanded })}
            expandable
          >
            {displayTotalPageLoad()}
          </StandAloneGraphHeader>
          <div
            style={styles}
            ref={(node) => { this.graphRef = node; }}
          />
        </div>
      </div>
    );
  }
}

PageLatencyGraph.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  timingPerformance: PropTypes.objectOf(PropTypes.number).isRequired,
  small: PropTypes.bool,
  handleClick: PropTypes.func,
  expanded: PropTypes.bool.isRequired,
  actions: PropTypes.shape({
    expandOrCollapseComponent: PropTypes.func.isRequired,
  }).isRequired,
};

PageLatencyGraph.defaultProps = {
  small: false,
  handleClick: null,
};

export default PageLatencyGraph;
