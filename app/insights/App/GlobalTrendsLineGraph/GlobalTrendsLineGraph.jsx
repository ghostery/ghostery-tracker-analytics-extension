import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as D3 from 'd3';

import './GlobalTrendsLineGraph.scss';

class GlobalTrendsLineGraph extends Component {
  componentDidMount() {
    this.generateGraph();
  }

  generateGraph() {
    D3.select(this.graphRef).selectAll('*').remove();

    const parseDate = D3.timeParse('%Y-%m');
    const formatDate = D3.timeFormat('%b %y');

    const { data } = this.props;
    data.forEach((d) => { d.date = parseDate(d.date); });

    data.sort((a, b) => a.date - b.date);
    const bisectDate = D3.bisector(d => d.date).right;

    const containerWidth = 70;
    const containerHeight = 15;

    const margin = {
      top: 2,
      bottom: 2,
      left: 2,
      right: 2,
    };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const y = D3.scaleLinear()
      .domain([D3.min(data, d => d.percentage), D3.max(data, d => d.percentage)])
      .range([height, 0]);

    const x = D3.scaleTime()
      .domain(D3.extent(data, d => (d.date)))
      .range([0, width]);

    const svg = D3.select(this.graphRef)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', containerHeight);

    const view = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const vline = D3.line()
      .x(d => x(d.date))
      .y(d => y(d.percentage))
      .curve(D3.curveMonotoneX);

    const path = view.append('path')
      .attr('class', 'line')
      .attr('d', vline(data))
      .attr('fill', 'none')
      .attr('stroke', '#00aef0');

    const totalLength = path.node().getTotalLength();

    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(500)
      .ease(D3.easeLinear)
      .attr('stroke-dashoffset', 0);

    view.append('circle')
      .attr('cx', x(data.slice(-1)[0].date) - 1)
      .attr('cy', y(data.slice(-1)[0].percentage) - 1)
      .attr('r', 0)
      .attr('fill', '#00aef0')
      .transition()
      .delay(450)
      .attr('r', 2);

    const tooltip = D3.select('.Graph__tooltip');
    const tooltipCaret = D3.select('.Graph__tooltipCaret');

    function removeTooltip() {
      tooltip.html('').style('opacity', 0);
      tooltipCaret.style('opacity', 0);
    }

    function drawTooltip() {
      // getBoundingClientRect is not supported in Safari and Edge
      const bbox = this.getBoundingClientRect();
      const x0 = x.invert(D3.mouse(this)[0]);
      const i = bisectDate(data, x0);
      const d0 = data[i - 1];
      const d1 = data[i];

      let d = d1;
      if (d0) {
        if (d1) {
          d = x0 - (d0.date) > (d1.date) - x0 ? d1 : d0;
        } else {
          d = d0;
        }
      }

      tooltip.html(`${(d.percentage * 100).toFixed(2)} % on ${formatDate(d.date)}`)
        .style('left', `${bbox.x - 55 + x(d.date)}px`)
        .style('top', `${bbox.y - 43 + y(d.percentage)}px`)
        .style('opacity', 1);

      const tooltipWidth = tooltip.node().getBoundingClientRect().width;

      tooltipCaret.classed('rightCaret', false)
        .classed('downCaret', true)
        .style('left', `${bbox.x - 55 + x(d.date) + (tooltipWidth / 2 - 6)}px`)
        .style('top', `${bbox.y - 9 + y(d.percentage)}px`)
        .style('opacity', 1);
    }

    svg.append('rect')
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .attr('fill', 'none')
      .style('pointer-events', 'all')
      .on('mouseout', removeTooltip)
      .on('mousemove', drawTooltip);
  }

  render() {
    return (
      <div className="GlobalTrendsLineGraph">
        <div ref={(node) => { this.graphRef = node; }} />
      </div>
    );
  }
}

GlobalTrendsLineGraph.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string.isRequired,
    percentage: PropTypes.number.isRequired,
  })).isRequired,
};

export default GlobalTrendsLineGraph;
