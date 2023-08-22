import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import * as D3 from 'd3';
import { convertBytes, convertMilliseconds } from '../../../src/utils/convert';

import './TrackerTimelineGraph.scss';

class TrackerTimelineGraph extends Component {
  componentDidMount() {
    this.generateGraph();
  }

  componentDidUpdate(prevProps) {
    const {
      expanded,
      firstTracker,
      latestTrackerTimeStamp,
      pageEvents,
      scale,
      trackerListExpanded,
      pageEventLinesHeight,
    } = this.props;
    if (latestTrackerTimeStamp !== prevProps.latestTrackerTimeStamp
      || expanded !== prevProps.expanded
      || pageEvents !== prevProps.pageEvents
      || scale !== prevProps.scale
      || trackerListExpanded !== prevProps.trackerListExpanded
      || (firstTracker && pageEventLinesHeight !== prevProps.pageEventLinesHeight)) {
      // Need to create a function to update graph instead of redrawing everytime
      this.generateGraph();
    }
  }

  generateGraph() {
    D3.select(this.graphRef).selectAll('*').remove();

    const {
      requests,
      firstTracker,
      pageEventLinesHeight,
      expanded,
      firstTrackerTimeStamp,
      latestTrackerTimeStamp,
      latencyCategory,
      handleClick,
      pageEvents,
      scale,
      timingPerformance,
    } = this.props;
    const { navigationStart } = timingPerformance;

    const latencyColors = {
      green: '#9ecc42',
      yellow: '#ffc063',
      red: '#be4948',
    };

    const data = [];
    Object.keys(requests).forEach((key) => {
      const val = {};
      val.src = requests[key].src;
      val.endTime = requests[key].endTime - navigationStart;
      val.startTime = requests[key].startTime - navigationStart;
      val.latency = requests[key].latency;
      val.size = requests[key].size;
      data.push(val);
    });

    const firstRequestTime = firstTrackerTimeStamp - navigationStart;
    const timePassed = latestTrackerTimeStamp - navigationStart;

    const width = this.containerRef.clientWidth;
    const height = data.length > 0 ? 62 + (data.length * 38) : 101;

    let x;
    if (scale === 'logarithmic') {
      x = D3.scaleLog()
        .domain(([0.8 * firstRequestTime, timePassed]))
        .range([0, width - 5]);
    } else {
      x = D3.scaleLinear()
        .domain([-(timePassed / 30), timePassed])
        .range([0, width - 5]);
    }

    const view = D3.select(this.graphRef)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('overflow', 'visible');

    const axisContainer = D3.select('.TrackerList__axisContainer');

    const patternFill = D3.select('#patternFillRect');

    view.append('rect')
      .attr('width', '100%')
      .attr('height', 62)
      .attr('fill', 'black')
      .style('opacity', 0.7)
      .style('cursor', 'pointer')
      .on('click', handleClick);

    const events = [];
    const logEarlyEvents = { event: [], time: (0.8 * firstRequestTime) + navigationStart };

    Object.keys(pageEvents).forEach((key) => {
      const val = {};
      val.event = key;
      val.time = timingPerformance[key];
      if (val.time > 0) {
        if (scale === 'logarithmic' && val.time <= logEarlyEvents.time) {
          logEarlyEvents.event.push({ name: key, time: timingPerformance[key] - navigationStart });
        } else {
          events.push(val);
        }
      }
    });

    const tooltip = D3.select('.Graph__tooltip');
    const tooltipCaret = D3.select('.Graph__tooltipCaret');

    const returnWidthOrMinumum = (dataEntry) => {
      const calculatedWidth = x(dataEntry.endTime) - x(dataEntry.startTime);
      const smallestWidth = 3;
      if (calculatedWidth < smallestWidth) {
        return smallestWidth;
      }
      return calculatedWidth;
    };

    function drawTooltip(d, i, top) {
      view.append('g')
        .attr('class', 'hover')
        .append('rect')
        .attr('width', () => returnWidthOrMinumum(d))
        .attr('height', 62 + (i * 38) + 19 - (62 / 2))
        .attr('x', x(d.startTime))
        .attr('y', 62 / 2)
        .attr('fill', '#cccccc')
        .attr('fill-opacity', 0)
        .transition()
        .duration(300)
        .attr('fill-opacity', 0.7);
      const bbox = this.graphRef.getBoundingClientRect();
      tooltip.selectAll('p').remove();
      tooltip.selectAll('span').remove();
      tooltip.append('p')
        .html(`Latency: ${convertMilliseconds(d.latency)}<br>Size: ${d.size ? convertBytes(d.size) : 'Unknown'}`)
        .style('margin', '4px');
      tooltip.style('opacity', 0);
      const tooltipBbox = tooltip.node().getBoundingClientRect();
      const topOffset = top
        ? bbox.y - tooltipBbox.height + 14
        : bbox.y + 22 + (i * 38) + 42.5 - tooltipBbox.height;
      const leftOffset = bbox.x + x(d.startTime)
        + (returnWidthOrMinumum(d) / 2) - (tooltipBbox.width / 2);
      tooltip.style('left', `${leftOffset}px`)
        .style('top', `${topOffset}px`)
        .transition()
        .duration(300)
        .style('opacity', 1);
      tooltipCaret.classed('rightCaret', false)
        .classed('downCaret', true)
        .style('left', `${(tooltipBbox.width / 2) - 5.5 + leftOffset}px`)
        .style('top', `${topOffset + tooltipBbox.height}px`)
        .style('opacity', 0)
        .transition()
        .duration(300)
        .style('opacity', 1);
      view.selectAll('g.hover').moveToBack();
    }

    function removeTooltip() {
      view.selectAll('g.hover')
        .transition()
        .duration(300)
        .attr('fill-opacity', 0);
      view.selectAll('g.hover').remove();
      tooltip.transition()
        .duration(300)
        .style('opacity', 0);
      tooltipCaret.transition()
        .duration(300)
        .style('opacity', 0);
    }

    function onMouseEnterCollapsed(d, logFlag, graphRef) {
      let rect;
      if (!logFlag) {
        rect = D3.select(this.parentNode)
          .select(`rect.actualRect#${d.event}`)
          .attr('x', x(d.time - navigationStart) + 300 + 6 - 1)
          .attr('width', 2);
      } else {
        rect = D3.select(this.parentNode)
          .select('rect.actualRect#logEarlyEvents');
      }
      rect.moveToFront();

      tooltip.selectAll('p').remove();
      tooltip.selectAll('span').remove();
      const bbox = graphRef.getBoundingClientRect();

      if (logFlag) {
        d.event.forEach((logEvent) => {
          const otherTooltipContainer = tooltip
            .append('span')
            .attr('class', 'd-flex justify-content-between');
          otherTooltipContainer.append('p')
            .html(logEvent.name)
            .style('margin', '1px');
          otherTooltipContainer.append('p')
            .html(convertMilliseconds(logEvent.time))
            .style('margin', '1px')
            .style('padding-left', '5px');
        });
      } else {
        tooltip.append('p')
          .style('margin', 0)
          .html(d.event);
      }
      const tooltipBbox = tooltip.node().getBoundingClientRect();
      const topOffset = D3.event.pageY - 7;
      const leftOffset = bbox.x + 2 + x(d.time - navigationStart);
      tooltip.style('left', `${leftOffset + 12}px`)
        .style('top', `${topOffset - (tooltipBbox.height / 2) + 5}px`);
      tooltipCaret.classed('downCaret', false)
        .classed('rightCaret', true)
        .style('display', 'block')
        .style('left', `${leftOffset}px`)
        .style('top', `${topOffset}px`)
        .transition()
        .duration(300)
        .style('opacity', 1);

      tooltip.transition()
        .duration(300)
        .style('opacity', 1);
    }

    function onMouseOutCollapsed(d, logFlag) {
      if (!logFlag) {
        D3.select(this.parentNode)
          .select(`rect.actualRect#${d.event}`)
          .attr('x', x(d.time - navigationStart) + 300 + 6 - 0.5)
          .attr('width', 1);
      }

      tooltip.transition()
        .duration(300)
        .style('opacity', 0);
      tooltipCaret.transition()
        .duration(300)
        .style('opacity', 0);
    }

    function onMouseMoveCollapsed() {
      const tooltipBbox = tooltip.node().getBoundingClientRect();
      const topOffset = D3.event.pageY - 7;
      tooltip.style('top', `${topOffset - (tooltipBbox.height / 2) + 5}px`);
      tooltipCaret.style('top', `${topOffset}px`);
    }

    function onMouseEnterExpanded(d, logFlag, graphRef) {
      let rect;
      if (!logFlag) {
        rect = D3.select(this.parentNode)
          .select(`rect.actualRect#${d.event}`)
          .attr('fill', '#00aef0');
      } else {
        rect = D3.select(this.parentNode)
          .select('rect.actualRect#logEarlyEvents');
        patternFill.attr('fill', '#00aef0');
      }
      rect.moveToFront();
      tooltip.selectAll('p').remove();
      tooltip.selectAll('span').remove();
      const bbox = graphRef.getBoundingClientRect();

      if (logFlag) {
        d.event.forEach((logEvent) => {
          const otherTooltipContainer = tooltip
            .append('span')
            .attr('class', 'd-flex justify-content-between');
          otherTooltipContainer.append('p')
            .html(logEvent.name)
            .style('margin', '1px');
          otherTooltipContainer.append('p')
            .html(convertMilliseconds(logEvent.time))
            .style('margin', '1px')
            .style('padding-left', '5px');
        });
      } else {
        tooltip.append('p')
          .style('margin', 0)
          .html(d.event);
      }
      const tooltipBbox = tooltip.node().getBoundingClientRect();
      const topOffset = D3.event.pageY - 7;
      const leftOffset = bbox.x + 2 + x(d.time - navigationStart);
      tooltip.style('left', `${leftOffset + 12}px`)
        .style('top', `${topOffset - (tooltipBbox.height / 2) + 5}px`);
      tooltipCaret.classed('downCaret', false)
        .classed('rightCaret', true)
        .style('display', 'block')
        .style('left', `${leftOffset}px`)
        .style('top', `${topOffset}px`)
        .transition()
        .duration(300)
        .style('opacity', 1);

      tooltip.transition()
        .duration(300)
        .style('opacity', 1);
    }

    function onMouseOutExpanded(d, logFlag) {
      if (!logFlag) {
        D3.select(this.parentNode)
          .select(`rect.actualRect#${d.event}`)
          .attr('fill', '#555555');
      } else {
        patternFill.attr('fill', '#555555');
      }
      tooltip.transition()
        .duration(300)
        .style('opacity', 0);
      tooltipCaret.transition()
        .duration(300)
        .style('opacity', 0);
    }

    function onMouseMoveExpanded() {
      const tooltipBbox = tooltip.node().getBoundingClientRect();
      const topOffset = D3.event.pageY - 7;
      tooltip.style('top', `${topOffset - (tooltipBbox.height / 2) + 5}px`);
      tooltipCaret.style('top', `${topOffset}px`);
    }

    function drawPageEvents(graphRef) {
      const graphPageEvents = D3.select('.TrackerList__pageEventsLines')
        .attr('height', 650)
        .attr('width', 950)
        .attr('id', 'TrackerListPageEventsLineContainer');

      if (expanded) {
        graphPageEvents.selectAll('g').remove();
        view.append('g')
          .attr('class', 'pageEventRectsExpanded')
          .selectAll('rect.transparentRect')
          .data(events)
          .enter()
          .append('rect')
          .attr('class', 'transparentRect')
          .attr('y', 0)
          .attr('height', height + 10)
          .attr('x', d => x(d.time - navigationStart) - 1.5)
          .attr('width', 3)
          .attr('fill', 'transparent')
          .style('cursor', 'pointer')
          .attr('pointer-events', 'all')
          .on('mouseenter', function mouseEnterExpanded(d) { onMouseEnterExpanded.call(this, d, false, graphRef); })
          .on('mouseleave', function mouseOutExpanded(d) { onMouseOutExpanded.call(this, d, false); })
          .on('mousemove', function mouseMoveExpanded() { onMouseMoveExpanded.call(this); });
        view.select('g.pageEventRectsExpanded')
          .selectAll('rect.actualRect')
          .data(events)
          .enter()
          .append('rect')
          .attr('class', 'actualRect')
          .attr('id', d => d.event)
          .attr('y', 0)
          .attr('height', height + 10)
          .attr('x', d => x(d.time - navigationStart) - 0.5)
          .attr('width', 1)
          .attr('fill', '#555555')
          .style('cursor', 'pointer')
          .attr('pointer-events', 'all')
          .on('mouseenter', function mouseEnterExpanded(d) { onMouseEnterExpanded.call(this, d, false, graphRef); })
          .on('mouseleave', function mouseOutExpanded(d) { onMouseOutExpanded.call(this, d, false); })
          .on('mousemove', function mouseMoveExpanded() { onMouseMoveExpanded.call(this); });
        if (logEarlyEvents.event.length > 0) {
          view.select('g.pageEventRectsExpanded')
            .append('rect')
            .datum(logEarlyEvents)
            .attr('class', 'actualRect')
            .attr('id', 'logEarlyEvents')
            .attr('y', 0)
            .attr('height', height + 10)
            .attr('x', d => x(d.time - navigationStart) - 0.5)
            .attr('width', 3)
            .attr('fill', 'url(#logPattern)')
            .style('cursor', 'pointer')
            .attr('pointer-events', 'all')
            .on('mouseenter', function mouseEnterExpanded(d) { onMouseEnterExpanded.call(this, d, true, graphRef); })
            .on('mouseleave', function mouseOutExpanded(d) { onMouseOutExpanded.call(this, d, true); })
            .on('mousemove', function mouseMoveExpanded() { onMouseMoveExpanded.call(this); });
          patternFill.attr('fill', '#555555');
        }
      } else if (firstTracker) {
        graphPageEvents.selectAll('g').remove();

        graphPageEvents.append('g')
          .attr('class', 'pageEventRects')
          .selectAll('rect.transparentRect')
          .data(events)
          .enter()
          .append('rect')
          .attr('class', 'transparentRect')
          .attr('id', d => d.event)
          .attr('y', 1)
          .attr('height', pageEventLinesHeight)
          .attr('x', d => x(d.time - navigationStart) + 300 + 6 - 1.5)
          .attr('width', 3)
          .attr('fill', 'transparent')
          .style('cursor', 'pointer')
          .attr('pointer-events', 'all')
          .on('mouseenter', function mouseEnterCollapsed(d) { onMouseEnterCollapsed.call(this, d, false, graphRef); })
          .on('mouseleave', function mouseOutCollapsed(d) { onMouseOutCollapsed.call(this, d, false); })
          .on('mousemove', function mouseMoveCollapsed() { onMouseMoveCollapsed.call(this); });
        graphPageEvents.select('g.pageEventRects')
          .selectAll('rect.actualRect')
          .data(events)
          .enter()
          .append('rect')
          .attr('class', 'actualRect')
          .attr('id', d => d.event)
          .attr('y', 1)
          .attr('height', pageEventLinesHeight)
          .attr('x', d => x(d.time - navigationStart) + 300 + 6 - 0.5)
          .attr('width', 1)
          .attr('fill', '#00aef0')
          .style('cursor', 'pointer')
          .attr('pointer-events', 'all')
          .on('mouseenter', function mouseEnterCollapsed(d) { onMouseEnterCollapsed.call(this, d, false, graphRef); })
          .on('mouseleave', function mouseOutCollapsed(d) { onMouseOutCollapsed.call(this, d, false); })
          .on('mousemove', function mouseMoveCollapsed() { onMouseMoveCollapsed.call(this); });
        if (logEarlyEvents.event.length > 0) {
          graphPageEvents.select('g.pageEventRects')
            .append('rect')
            .datum(logEarlyEvents)
            .attr('class', 'actualRect')
            .attr('id', 'logEarlyEvents')
            .attr('y', 1)
            .attr('height', pageEventLinesHeight)
            .attr('x', d => x(d.time - navigationStart) + 300 + 6 - 0.5)
            .attr('width', 3)
            .attr('fill', 'url(#logPattern)')
            .attr('background', 'blue')
            .style('cursor', 'pointer')
            .attr('pointer-events', 'all')
            .on('mouseenter', function mouseEnterCollapsed(d) { onMouseEnterCollapsed.call(this, d, true, graphRef); })
            .on('mouseleave', function mouseOutCollapsed(d) { onMouseOutCollapsed.call(this, d, true); })
            .on('mousemove', function mouseMoveCollapsed() { onMouseMoveCollapsed.call(this); });
          patternFill.attr('fill', '#00aef0');
        }
      }
    }

    D3.selection.prototype.moveToFront = function moveToFront() {
      return this.each(function move() {
        this.parentNode.appendChild(this);
      });
    };

    axisContainer.selectAll('g').remove();
    axisContainer.append('g')
      .attr('class', 'axis top')
      .style('stroke-dasharray', '2 5')
      .call(D3.axisBottom(x).ticks(7, 'd').tickSize(0).tickPadding(6));

    if (data.length < 1) {
      drawPageEvents(this.graphRef);
      return;
    }

    const pathGroup = view.append('g').datum([data[0], data[data.length - 1]]);
    const line = D3.line()
      .x(d => x(d.endTime))
      .y(62 / 2);

    pathGroup.append('path')
      .attr('stroke', latencyColors[latencyCategory])
      .attr('stroke-width', 1.5)
      .style('stroke-dasharray', '4,4')
      .attr('d', line);

    const linePointGroup = view.append('g');
    linePointGroup.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => x(d.startTime))
      .attr('width', d => returnWidthOrMinumum(d))
      .attr('y', 62 / 2 - 3.5)
      .attr('height', 7)
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('fill', latencyColors[latencyCategory]);

    const dataPointGroup = view.append('g');
    dataPointGroup.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => x(d.startTime))
      .attr('width', d => returnWidthOrMinumum(d))
      .attr('y', (d, i) => 62 + (i * 38) + 19 - 6)
      .attr('height', 12)
      .attr('rx', 6)
      .attr('ry', 6)
      .attr('fill', latencyColors[latencyCategory])
      .style('cursor', 'pointer')
      .on('mouseleave', removeTooltip)
      .on('mouseenter', (d, i) => drawTooltip.call(this, d, i, false));

    if (expanded) {
      linePointGroup.selectAll('rect')
        .attr('x', d => x(d.startTime))
        .attr('width', d => returnWidthOrMinumum(d))
        .attr('y', 62 / 2 - 6)
        .attr('height', 12)
        .attr('rx', 6)
        .attr('ry', 6)
        .attr('fill', '#c8c7c2')
        .attr('stroke', latencyColors[latencyCategory])
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseleave', removeTooltip)
        .on('mouseenter', (d, i) => drawTooltip.call(this, d, i, true));

      const lineContainer = view.append('g');

      lineContainer.selectAll('line')
        .data(data)
        .enter()
        .append('line')
        .attr('x1', 0)
        .attr('y1', (d, i) => 62 + (38 * (i + 1)))
        .attr('x2', width + 280)
        .attr('y2', (d, i) => 62 + (38 * (i + 1)))
        .attr('transform', 'translate(-295, 0)')
        .attr('stroke', 'black')
        .style('opacity', 0.46)
        .style('stroke-width', (d, i) => (i === (data.length - 1) ? 0 : 1));

      drawPageEvents(this.graphRef);

      view.append('g')
        .attr('class', 'axis top')
        .style('stroke-dasharray', '2 5')
        .call(D3.axisBottom(x).tickSize(0).tickValues([]));

      view.append('g')
        .attr('class', 'axis bottom')
        .attr('transform', `translate(0,${height + 9})`)
        .style('stroke-dasharray', '2 5')
        .call(D3.axisTop(x).ticks(7, 'd').tickSize(0).tickPadding(6));
    } else if (firstTracker) {
      drawPageEvents(this.graphRef);
    }

    D3.selection.prototype.moveToBack = function moveToBack() {
      return this.each(function moveEachBack() {
        const { firstChild } = this.parentNode;
        if (firstChild) {
          this.parentNode.insertBefore(this, firstChild);
        }
      });
    };
  }

  render() {
    const { expanded } = this.props;
    const trackerTimelineGraphClasses = ClassNames('TrackerTimelineGraph', { expanded });

    return (
      <div
        className="TrackerTimelineGraph__container"
        ref={(node) => { this.containerRef = node; }}
      >
        <div
          className={trackerTimelineGraphClasses}
          ref={(node) => { this.graphRef = node; }}
        />
      </div>
    );
  }
}

TrackerTimelineGraph.propTypes = {
  requests: PropTypes.arrayOf(PropTypes.shape({
    src: PropTypes.string.isRequired,
    endTime: PropTypes.number.isRequired,
    startTime: PropTypes.number.isRequired,
    latency: PropTypes.number.isRequired,
    size: PropTypes.number.isRequired,
  })).isRequired,
  firstTrackerTimeStamp: PropTypes.number.isRequired,
  latestTrackerTimeStamp: PropTypes.number.isRequired,
  expanded: PropTypes.bool.isRequired,
  firstTracker: PropTypes.bool.isRequired,
  pageEventLinesHeight: PropTypes.number.isRequired,
  pageEvents: PropTypes.objectOf(PropTypes.bool).isRequired,
  scale: PropTypes.string.isRequired,
  timingPerformance: PropTypes.objectOf(PropTypes.number).isRequired,
  latencyCategory: PropTypes.string.isRequired,
  handleClick: PropTypes.func.isRequired,
  trackerListExpanded: PropTypes.bool.isRequired,
};


export default TrackerTimelineGraph;
