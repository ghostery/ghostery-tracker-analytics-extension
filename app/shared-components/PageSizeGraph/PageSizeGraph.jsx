import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import isEqual from 'lodash.isequal';
import * as D3 from 'd3';
import './PageSizeGraph.scss';

import StandAloneGraphHeader from '../StandAloneGraphHeader';
import { convertBytes } from '../../../src/utils/convert';

class PageSizeGraph extends Component {
  componentDidMount() {
    const { requestsBySize } = this.props;
    this.setupGraph();
    if (requestsBySize._total) {
      this.generateGraph();
    }
  }

  componentDidUpdate(prevProps) {
    const { requestsBySize } = this.props;
    if (requestsBySize._total && !isEqual(prevProps, this.props)) {
      this.generateGraph(); // TODO: add updateGraph() method for this case
    }
  }

  setupGraph() {
    D3.select(this.graphRef).selectAll('*').remove();

    const view = D3.select(this.graphRef)
      .append('svg');

    view.append('rect');
  }

  generateGraph() {
    const { requestsBySize, small } = this.props;
    const data = [];
    const labels = {
      beacon: 'Beacon',
      csp_report: 'CSP Report',
      font: 'Font',
      image: 'Image',
      imageset: 'Image Set',
      main_frame: 'Main Frame',
      media: 'Media',
      object: 'Object',
      object_subrequest: 'Object Subrequest',
      ping: 'Ping',
      script: 'Script',
      speculative: 'Speculative',
      sub_frame: 'Sub Frame',
      other: 'Miscellaneous', // This is different than the "Other" category we're using below
      stylesheet: 'Stylesheet',
      xmlhttprequest: 'XMLHttpRequest',
      websocket: 'WebSocket',
    };
    const otherCategory = {
      label: 'Other',
      amount: 0,
      key: 'other_custom',
      categories: [],
      size: 0,
      tracker_amount: 0,
    };
    Object.keys(requestsBySize).forEach((key) => {
      const amount = Math.round((requestsBySize[key].size / requestsBySize._total.size) * 100);
      const tracker_amount = requestsBySize[key].tracker_size
        ? Math.round((requestsBySize[key].tracker_size / requestsBySize[key].size) * 100)
        : 0;
      const label = labels[key];
      const { size } = requestsBySize[key];
      if (key !== '_total' && key !== '_tracker' && size > 0) {
        if (amount < 5) {
          otherCategory.categories.push({ label, size });
          otherCategory.size += size;
          if (requestsBySize[key].tracker_size) {
            otherCategory.tracker_amount += requestsBySize[key].tracker_size;
          }
        } else {
          data.push({ label, amount, key, size, tracker_amount });
        }
      }
    });
    otherCategory.amount = Math.round((otherCategory.size / requestsBySize._total.size) * 100);
    otherCategory.tracker_amount = Math.round(
      (otherCategory.tracker_amount / otherCategory.size) * 100,
    );
    otherCategory.categories.sort((a, b) => (
      b.size - a.size
    ));

    if (otherCategory.amount > 0) data.push(otherCategory);

    const compare = (a, b) => {
      if (a.amount < b.amount) return -1;
      if (a.amount > b.amount) return 1;
      return 0;
    };
    data.sort(compare);
    const { width, height } = this.props;
    const margin = {
      top: height * (small ? 0.1 : 0.05),
      bottom: height * (small ? 0.1 : 0.05),
      left: width * 0.2,
      right: width * 0.1,
    };
    const innerHeight = height - margin.top - margin.bottom;
    const xPosition = small ? width * (1 / 3) : width * (1.5 / 3) + 10;

    const heightScale = D3.scaleLinear()
      .domain([0, 100])
      .range([0, innerHeight]);
    const heights = data.map(d => heightScale(d.amount));
    const colors = ['lightgrey', 'silver', 'darkgrey', 'grey', 'dimgrey', '#4d4d4d', '#262626'];
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

    function onMouseOver(d, i) {
      const bbox = this.graphRef.getBoundingClientRect();
      const sumHeights = (i === 0
        ? 0
        : heights.slice(0, i).reduce((acc, el) => acc + el))
        + heights[i] / 2;
      const tooltipContainer = getTooltipContainer();
      tooltipContainer.tooltipCaret
        .classed('downCaret', false)
        .classed('rightCaret', false);
      tooltipContainer.tooltip.selectAll('p').remove();
      tooltipContainer.tooltip.selectAll('span').remove();
      tooltipContainer.tooltip
        .append('p')
        .html((small || (d.label === 'Other' && d.amount < 5))
          ? `${d.label} (${d.amount}%)<br>`
          : d.label)
        .style('font-weight', 'bold')
        .style('margin', '4px');
      if (d.key === 'other_custom') {
        d.categories.forEach((cat) => {
          const otherTooltipContainer = tooltipContainer
            .tooltip
            .append('span')
            .attr('class', 'd-flex justify-content-between');
          otherTooltipContainer.append('p')
            .html(cat.label)
            .style('margin', '4px');
          otherTooltipContainer.append('p')
            .html(convertBytes(cat.size))
            .style('margin', '4px');
        });
      } else {
        tooltipContainer.tooltip
          .append('p')
          .html(convertBytes(d.size))
          .style('margin', '4px');
      }
      tooltipContainer.tooltip
        .style('opacity', 0);
      const tooltipBbox = tooltipContainer.tooltip.node().getBoundingClientRect();
      const left = bbox.x - tooltipBbox.width + xPosition - 11;
      const top = !small
        ? bbox.y + sumHeights - (tooltipBbox.height / 2) + 15
        : bbox.y - window.innerHeight + sumHeights - (tooltipBbox.height / 2) + 315;

      tooltipContainer.tooltip
        .style('left', `${left}px`)
        .style('top', `${top}px`)
        .transition()
        .duration(300)
        .style('opacity', 1);

      tooltipContainer.tooltipCaret
        .style('left', `${left + tooltipBbox.width}px`)
        .style('top', `${top + (tooltipBbox.height / 2) - 5.5}px`)
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

    const container = view.selectAll('g.container')
      .data(data);

    container.exit().remove();
    container.enter()
      .append('g')
      .attr('class', 'container');

    view.selectAll('g.container')
      .attr('id', d => d.key)
      .style('cursor', 'pointer')
      .on('mouseenter', (d, i) => onMouseOver.call(this, d, i))
      .on('mouseleave', () => onMouseOut());

    // Transition delay options:
    // .delay(i * 100)
    // .delay((d, i) => ((i - 4) * -1) * 100)
    view.selectAll('g.container').each(function draw(d, i) {
      D3.select(this)
        .transition()
        .duration(700)
        .attr('transform', () => {
          const sumHeights = i === 0 ? 0 : heights.slice(0, i).reduce((acc, el) => acc + el);
          return `translate(0,${sumHeights + margin.top})`;
        });

      D3.select(this)
        .selectAll('rect.bar')
        .data([d])
        .enter()
        .append('rect')
        .attr('class', 'bar PageSizeRect')
        .attr('width', width * (1 / 3))
        .attr('x', xPosition)
        .attr('y', 0)
        .attr('height', 0);
      D3.select(this)
        .selectAll('rect.bar')
        .attr('fill', colors[i])
        .transition()
        .duration(700)
        .attr('height', heights[i]);

      if (!small) {
        D3.select(this)
          .selectAll('rect.tick')
          .data([d])
          .enter()
          .append('rect')
          .attr('class', 'tick')
          .attr('height', 1)
          .attr('width', (width * (1 / 3)) * 1.2)
          .attr('x', (width * (1.5 / 3)) - ((width * (1 / 3)) * 0.2) + 10)
          .attr('y', 0)
          .attr('fill', 'grey')
          .style('opacity', 0);
        D3.select(this)
          .selectAll('rect.tick')
          .transition()
          .duration(700)
          .delay(300)
          .style('opacity', type => (type.amount < 5 ? 0 : 1));

        D3.select(this)
          .selectAll('text.label')
          .data([d])
          .enter()
          .append('text')
          .attr('class', 'label')
          .text(type => (type.amount < 5 ? '' : type.label))
          .attr('text-anchor', 'end')
          .attr('y', 5)
          .attr('x', (width * (1.5 / 3)) - ((width * (1 / 3)) * 0.2) - 5 + 10)
          .attr('fill', 'white')
          .style('opacity', 0);
        D3.select(this)
          .selectAll('text.label')
          .text(type => (type.amount < 5 ? '' : type.label))
          .transition()
          .duration(700)
          .delay(300)
          .style('opacity', 1);

        D3.select(this)
          .selectAll('text.amount')
          .data([d])
          .enter()
          .append('text')
          .attr('class', 'amount')
          .style('pointer-events', 'none')
          .text(type => (type.amount < 5 ? '' : `${type.amount}%`))
          .attr('text-anchor', 'end')
          .attr('y', heights[i] - 3)
          .attr('x', width * (1.5 / 3) + width * (1 / 3) - 3 + 10)
          .attr('fill', () => {
            if (i < 1) return 'grey';
            return 'white';
          })
          .style('opacity', 0);
        D3.select(this)
          .selectAll('text.amount')
          .attr('y', heights[i] - 3)
          .text(type => (type.amount < 5 ? '' : `${type.amount}%`))
          .transition()
          .duration(700)
          .delay(300)
          .style('opacity', 1);
      }
    });
  }

  render() {
    const { width, height, requestsBySize, small, handleClick } = this.props;
    const styles = { width: `${width}px`, height: `${height}px` };

    const standAloneGraphKeyInfo = ClassNames('StandAloneGraphHeader__keyData', {
      small,
    });

    return (
      <div className="StandAloneGraph__background d-flex">
        {small && <div className="StandAloneGraph__blueStripe" />}
        <div className="d-flex flex-column">
          <StandAloneGraphHeader
            title="Page Size"
            small={small}
            handleClick={handleClick}
            tooltipText="View a breakdown of total page size into separate categories"
          >
            <p className={standAloneGraphKeyInfo}>
              {requestsBySize._total && convertBytes(requestsBySize._total.size)}
            </p>
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

PageSizeGraph.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  requestsBySize: PropTypes.objectOf(PropTypes.shape({
    latency: PropTypes.number.isRequired,
    size: PropTypes.number.isRequired,
    tracker_size: PropTypes.number.isRequired,
  })).isRequired,
  small: PropTypes.bool,
  handleClick: PropTypes.func,
};

PageSizeGraph.defaultProps = {
  small: false,
  handleClick: null,
};

export default PageSizeGraph;
