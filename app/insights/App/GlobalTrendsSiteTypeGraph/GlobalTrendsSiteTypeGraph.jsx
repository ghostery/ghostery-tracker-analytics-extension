import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as D3 from 'd3';

class GlobalTrendsSiteTypeGraph extends Component {
  componentDidMount() {
    this.generateGraph();
  }

  generateGraph() {
    D3.select(this.graphRef).selectAll('*').remove();

    const { data } = this.props;

    data.sort((a, b) => a.percentage - b.percentage);

    const otherCategory = { name: 'Other', percentage: 0 };

    let dataWithOther = data;
    if (dataWithOther.length > 6) {
      dataWithOther.slice(0, dataWithOther.length - 5).forEach((category) => {
        otherCategory.percentage += category.percentage;
      });
      dataWithOther = dataWithOther.slice(dataWithOther.length - 5, dataWithOther.length);
      dataWithOther.unshift(otherCategory);
    }

    const margin = {
      top: 2,
      bottom: 2,
      left: 2,
      right: 2,
    };
    const containerWidth = 150;
    const containerHeight = (dataWithOther.length * 10)
      + ((dataWithOther.length - 1) * 7) + margin.top + margin.bottom;

    const width = containerWidth - margin.left - margin.right - 20;
    const height = (dataWithOther.length * 10) + ((dataWithOther.length - 1) * 7);

    const x = D3.scaleLinear()
      .domain([0, D3.max(dataWithOther, d => d.percentage)])
      .range([30, width]);

    const y = D3.scaleBand()
      .domain(dataWithOther.map(d => (d.name)))
      .range([height, 0]);

    const svg = D3.select(this.graphRef)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', containerHeight);

    const view = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const bar = view.selectAll('.bar')
      .data(dataWithOther)
      .enter()
      .append('g')
      .attr('class', 'bar')
      .attr('transform', d => `translate(0,${y(d.name) + margin.top})`);

    bar.append('rect')
      .attr('x', 30)
      .attr('height', 10)
      .transition()
      .duration(500)
      .attr('width', d => x(d.percentage))
      .attr('fill', '#00aef0');

    bar.append('text')
      .attr('x', 40)
      .attr('dy', '0.9em')
      .attr('text-anchor', 'left')
      .style('fill', '#FFFFFF')
      .attr('font-size', '10px')
      .text(d => d.name);

    bar.append('text')
      .attr('x', 0)
      .attr('dy', '0.9em')
      .attr('text-anchor', 'left')
      .style('fill', '#FFFFFF')
      .attr('font-size', '11px')
      .text(d => `${(d.percentage * 100).toFixed(0)} %`);
  }


  render() {
    return (
      <div
        className="GlobalTrendsSiteTypeGraph"
        ref={(node) => { this.containerRef = node; }}
      >
        <div ref={(node) => { this.graphRef = node; }} />
      </div>
    );
  }
}

GlobalTrendsSiteTypeGraph.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    percentage: PropTypes.number.isRequired,
  })).isRequired,
};

export default GlobalTrendsSiteTypeGraph;
