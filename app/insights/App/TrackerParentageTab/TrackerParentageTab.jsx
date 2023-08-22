import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import * as D3 from 'd3';
import * as D3Shape from 'd3-shape';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Collapse from 'react-bootstrap/Collapse';
import cloneDeep from 'lodash.clonedeep';

import { truncateString } from '../../../../src/utils/convert';
import './TrackerParentageTab.scss';

class TrackerParentageTab extends Component {
  static initialHighlightedTypeState = { highlighted: false, onGraph: false }

  static initialHighlightedTypesState = {
    beacon: cloneDeep(TrackerParentageTab.initialHighlightedTypeState),
    csp_report: cloneDeep(TrackerParentageTab.initialHighlightedTypeState),
    font: cloneDeep(TrackerParentageTab.initialHighlightedTypeState),
    image: cloneDeep(TrackerParentageTab.initialHighlightedTypeState),
    main_frame: cloneDeep(TrackerParentageTab.initialHighlightedTypeState),
    media: cloneDeep(TrackerParentageTab.initialHighlightedTypeState),
    miscellaneous: cloneDeep(TrackerParentageTab.initialHighlightedTypeState),
    object: cloneDeep(TrackerParentageTab.initialHighlightedTypeState),
    ping: cloneDeep(TrackerParentageTab.initialHighlightedTypeState),
    script: cloneDeep(TrackerParentageTab.initialHighlightedTypeState),
    stylesheet: cloneDeep(TrackerParentageTab.initialHighlightedTypeState),
    sub_frame: cloneDeep(TrackerParentageTab.initialHighlightedTypeState),
    websocket: cloneDeep(TrackerParentageTab.initialHighlightedTypeState),
    xmlhttprequest: cloneDeep(TrackerParentageTab.initialHighlightedTypeState),
    other: cloneDeep(TrackerParentageTab.initialHighlightedTypeState),
  }

  constructor(props) {
    super(props);
    this.state = {
      width: 2000,
      height: 2000,
      newRequestData: false,
      graphFiltered: false,
      hoveredNode: null,
      highlightedNodes: new Map(),
      highlightedTypes: cloneDeep(
        TrackerParentageTab.initialHighlightedTypesState,
      ),
      keyDropdownOpen: true,
      refreshDropdownOpen: true,
    };
  }

  componentDidMount() {
    const { messageCreators } = this.props;
    messageCreators.requestTrackerParentage();
    setTimeout(this.scrollGraphIntoView, 50);
    window.addEventListener('load', this.scrollGraphIntoView);
  }

  componentDidUpdate(prevProps) {
    const { trackerParentage, requestsCount } = this.props;
    const { newRequestData } = this.state;

    if (trackerParentage.nodes.length !== prevProps.trackerParentage.nodes.length
      || trackerParentage.links.length !== prevProps.trackerParentage.links.length) {
      this.resetGraph();
      if (trackerParentage.nodes.length && trackerParentage.links.length) {
        this.drawGraph();
      }
    }

    if (requestsCount !== prevProps.requestsCount
      && newRequestData === false && prevProps.requestsCount !== 0) {
      this.setState({ newRequestData: true }); // eslint-disable-line react/no-did-update-set-state
    }
  }

  componentWillUnmount() {
    const { actions } = this.props;
    window.removeEventListener('load', this.scrollGraphIntoView);
    actions.clearTrackerParentage();
  }

  scrollGraphIntoView() {
    if (this.graphContainerRef) {
      this.graphContainerRef.scrollTo({ top: 750, left: 650, behavior: 'smooth' });
    }
  }

  resetGraph() {
    D3.select(this.graphRef).selectAll('*').remove();
    const view = D3.select(this.graphRef).append('svg');
    view.append('g').attr('class', 'TrackerParentageTab__links');
    view.append('g').attr('class', 'TrackerParentageTab__nodes');
    this.setState({
      newRequestData: false,
      graphFiltered: false,
      hoveredNode: null,
      highlightedNodes: new Map(),
      highlightedTypes: cloneDeep(
        TrackerParentageTab.initialHighlightedTypesState,
      ),
    });
  }

  drawGraph() {
    const { width, height } = this.state;
    const { trackerParentage: { nodes, links } } = this.props;
    const highlightedTypes = cloneDeep(
      TrackerParentageTab.initialHighlightedTypesState,
    );

    const view = D3.select(this.graphRef).select('svg');
    view.attr('width', width).attr('height', height);

    const simulation = D3.forceSimulation()
      .force('link', D3.forceLink().id(d => d.requestId))
      .force('charge', D3.forceManyBody())
      .force('center', D3.forceCenter(width / 2, height / 2));

    const link = view.select('.TrackerParentageTab__links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line');

    const dragstarted = (d) => {
      if (!D3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    };

    const dragged = (d) => {
      d.fx = D3.event.x;
      d.fy = D3.event.y;
    };

    const dragended = (d) => {
      if (!D3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    };

    const node = view.select('.TrackerParentageTab__nodes')
      .selectAll('path')
      .data(nodes)
      .enter()
      .append('path')
      .attr('class', (d) => {
        const type = highlightedTypes[d.type] ? d.type : 'other';
        highlightedTypes[type].onGraph = true;

        return `TrackerParentageTab__node node${d.requestId}`;
      })
      .attr('d', (d) => {
        if (d.type === 'main_frame') {
          return D3Shape.symbol().type(D3Shape.symbolWye).size(120)();
        }
        if (d.trackerId) {
          return D3Shape.symbol().type(D3Shape.symbolDiamond).size(75)();
        }
        return D3Shape.symbol().type(D3Shape.symbolTriangle).size(75)();
      })
      .attr('fill', (d) => {
        if (d.type === 'main_frame') { return '#bd10e0'; }
        if (d.trackerId) { return '#00aef0'; }
        return '#000000';
      })
      .on('mouseenter', (d) => {
        const { requestId } = d;
        this[`requestRef${requestId}`].scrollIntoView({ behavior: 'smooth' });
        this.showNodeTooltip(d, this.selectRequestNode(d));
        this.setState({ hoveredNode: requestId });
      })
      .on('mouseleave', () => {
        this.hideNodeTooltip();
        this.setState({ hoveredNode: null });
      })
      .call(D3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    const ticked = () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    };

    simulation
      .nodes(nodes)
      .on('tick', ticked);

    simulation.force('link')
      .links(links);

    this.setState({ highlightedTypes });
    this.scrollGraphIntoView();
  }

  selectRequestNode(request) {
    // This would be much more optimized if we could simply select the node based off of class,
    // like this: D3.select(`.TrackerParentageTab__node node${request.requestId}`),
    // but it hasn't worked as expected (ie. it returns null when .node() is called)
    return D3.select('.TrackerParentageTab__nodes')
      .selectAll('path')
      .filter(d => d.requestId === request.requestId);
  }

  scrollNodeIntoView(requestNode) {
    const nodeBbox = requestNode.node().getBoundingClientRect();
    const graphContainerBbox = this.graphContainerRef.getBoundingClientRect();
    const graphContainerTop = this.graphContainerRef.scrollTop;
    const graphContainerLeft = this.graphContainerRef.scrollLeft;

    const verticalMargin = 50;
    const leftMargin = 260;
    const rightMargin = 220;
    let top = graphContainerTop;
    let left = graphContainerLeft;
    if (nodeBbox.top < (graphContainerBbox.top + verticalMargin)) {
      top = top - (graphContainerBbox.top - nodeBbox.top) - verticalMargin;
    } else if (nodeBbox.bottom > (graphContainerBbox.bottom - verticalMargin)) {
      top = top + (nodeBbox.bottom - graphContainerBbox.bottom) + verticalMargin;
    }
    if (nodeBbox.left < (graphContainerBbox.left + leftMargin)) {
      left = left - (graphContainerBbox.left - nodeBbox.left) - leftMargin;
    } else if (nodeBbox.right > (graphContainerBbox.right - rightMargin)) {
      left = left + (nodeBbox.right - graphContainerBbox.right) + rightMargin;
    }

    const scrollingRequired = top !== graphContainerTop || left !== graphContainerLeft;
    if (scrollingRequired) {
      this.graphContainerRef.scrollTo({ top, left, behavior: 'smooth' });
    }
    return scrollingRequired;
  }

  selectTooltipContainer() {
    const tooltip = D3.select('.Graph__tooltip');
    const tooltipCaret = D3.select('.Graph__tooltipCaret');
    return {
      tooltip,
      tooltipCaret,
    };
  }

  showNodeTooltip(request, requestNode) {
    const tooltipContainer = this.selectTooltipContainer();
    tooltipContainer.tooltipCaret
      .classed('rightCaret', false)
      .classed('downCaret', true);
    tooltipContainer.tooltip.selectAll('p').remove();
    tooltipContainer.tooltip.selectAll('span').remove();
    tooltipContainer.tooltip
      .append('p')
      .html(truncateString(
        `${request.trackerId ? request.trackerName : 'Unknown'} - ${request.type}`,
        50,
      ))
      .style('font-weight', 'bold')
      .style('margin', '4px');
    tooltipContainer.tooltip
      .append('p')
      .html(truncateString(request.src, 50))
      .style('margin', '4px');
    tooltipContainer.tooltip
      .style('opacity', 0);

    const nodeBbox = requestNode.node().getBoundingClientRect();
    const tooltipBbox = tooltipContainer.tooltip.node().getBoundingClientRect();
    const top = nodeBbox.y - tooltipBbox.height - 6;
    let leftMargin = 1;
    if (request.type === 'main_frame') {
      leftMargin = 2;
    } else if (request.trackerId) {
      leftMargin = -1;
    }
    const left = nodeBbox.x - (tooltipBbox.width / 2) + leftMargin;
    tooltipContainer.tooltip
      .style('left', `${left}px`)
      .style('top', `${top}px`)
      .transition()
      .duration(300)
      .style('opacity', 1);

    tooltipContainer.tooltipCaret
      .style('left', `${left + tooltipBbox.width / 2}px`)
      .style('top', `${top + tooltipBbox.height}px`)
      .style('opacity', 0)
      .transition()
      .duration(300)
      .style('opacity', 1);
  }

  hideNodeTooltip() {
    const tooltipContainer = this.selectTooltipContainer();
    tooltipContainer.tooltip
      .transition()
      .duration(300)
      .style('opacity', 0);
    tooltipContainer.tooltipCaret
      .transition()
      .duration(300)
      .style('opacity', 0);
  }

  sortRequests() {
    const { trackerParentage: { nodes } } = this.props;
    const trackerRequests = [];
    const unknownRequests = [];
    nodes.forEach((requestNode) => {
      if (requestNode.trackerId) {
        trackerRequests.push(requestNode);
      } else {
        unknownRequests.push(requestNode);
      }
    });

    const sortAlphabetically = (stringA, stringB) => {
      const stringAUpperCase = stringA.toUpperCase();
      const stringBUpperCase = stringB.toUpperCase();
      if (stringAUpperCase < stringBUpperCase) { return -1; }
      if (stringAUpperCase > stringBUpperCase) { return 1; }
      return 0;
    };
    trackerRequests.sort((a, b) => sortAlphabetically(a.trackerName, b.trackerName));
    unknownRequests.sort((a, b) => sortAlphabetically(a.type, b.type));

    return trackerRequests.concat(unknownRequests);
  }

  toggleRequestNodeHighlight(request, requestFilter) {
    const { highlightedNodes } = this.state;

    const requestNodeHighlighted = highlightedNodes.has(request.requestId);
    if (requestFilter) {
      if (requestFilter.override) {
        highlightedNodes.set(request.requestId, true);
      } else {
        highlightedNodes.delete(request.requestId);
      }
    } else if (requestNodeHighlighted) {
      highlightedNodes.delete(request.requestId);
    } else {
      highlightedNodes.set(request.requestId, true);
    }

    const updatedGraphFiltered = highlightedNodes.size > 0;
    this.setState({ highlightedNodes, graphFiltered: updatedGraphFiltered });

    D3.selectAll('.TrackerParentageTab__node')
      .classed('dim', d => updatedGraphFiltered && !highlightedNodes.has(d.requestId));
  }

  toggleRequestTypeHighlight(type) {
    const { trackerParentage: { nodes } } = this.props;
    const { highlightedTypes } = this.state;

    highlightedTypes[type].highlighted = !highlightedTypes[type].highlighted;
    this.setState({ highlightedTypes });

    nodes.forEach((requestNode) => {
      if (requestNode.type === type) {
        this.toggleRequestNodeHighlight(
          requestNode,
          { override: highlightedTypes[type].highlighted },
        );
      }
    });
  }

  handleRequestListItemClick(request) {
    const { messageCreators } = this.props;

    this.toggleRequestNodeHighlight(request);

    messageCreators.sendMetrics({ type: 'tracker_parentage_click_request_list_item' });
  }

  handleFilterButtonClick(type) {
    const { messageCreators } = this.props;
    const { highlightedTypes } = this.state;

    if (!highlightedTypes[type].onGraph) return;

    this.toggleRequestTypeHighlight(type);

    messageCreators.sendMetrics({ type: 'tracker_parentage_click_request_type_filter' });
  }

  renderFilterButtons() {
    const { highlightedTypes } = this.state;

    return Object.keys(highlightedTypes).map((type) => {
      const filterButtonClassNames = ClassNames(
        'TrackerParentageTab__filterButton', 'd-flex', 'align-items-center', 'justify-content-center',
        {
          highlighted: highlightedTypes[type].highlighted,
          onGraph: highlightedTypes[type].onGraph,
        },
      );

      return (
        <div
          className={filterButtonClassNames}
          key={type}
          onClick={() => this.handleFilterButtonClick(type)}
        >
          <div className="TrackerParentageTab__buttonText">{type}</div>
        </div>
      );
    });
  }

  renderSortedRequestList() {
    const { tooltipRef } = this.props;
    const { graphFiltered, highlightedNodes, hoveredNode } = this.state;
    const sortedRequests = this.sortRequests();

    return sortedRequests.map((request) => {
      const { requestId } = request;
      const requestClassNames = ClassNames(
        'TrackerParentageTab__request',
        'd-flex',
        'align-items-center',
        {
          dimmed: graphFiltered && !highlightedNodes.has(requestId),
          hovered: requestId === hoveredNode,
        },
      );
      let categoryImage = 'unknown-triangle';
      if (request.type === 'main_frame') {
        categoryImage = 'host-wye';
      } else if (request.trackerId) {
        categoryImage = 'tracker-diamond';
      }

      return (
        <Fragment key={requestId}>
          <OverlayTrigger
            container={tooltipRef}
            placement="right"
            overlay={(
              <Tooltip className="parentageRequestList tooltipCenter">
                <p className="TrackerParentageTab--boldText">
                  {truncateString(`${request.trackerId ? request.trackerName : 'Unknown'} - ${request.type}`, 200)}
                </p>
                <p>
                  {truncateString(request.src, 500)}
                </p>
              </Tooltip>
            )}
          >
            <div
              className={requestClassNames}
              onClick={() => this.handleRequestListItemClick(request)}
              onMouseEnter={() => {
                const requestNode = this.selectRequestNode(request);
                this.scrollNodeIntoView(requestNode);
                requestNode.classed('hovered', true);
              }}
              onMouseLeave={() => {
                this.selectRequestNode(request).classed('hovered', false);
              }}
              ref={(node) => { this[`requestRef${requestId}`] = node; }}
            >
              <img
                alt={categoryImage}
                src={`/dist/images/app/${categoryImage}.svg`}
              />
              <div className="TrackerParentageTab__requestNameAndType">
                {`${request.trackerId ? request.trackerName : 'Unknown'} - ${request.type}`}
              </div>
            </div>
          </OverlayTrigger>
        </Fragment>
      );
    });
  }

  renderKeyDropdown() {
    const { keyDropdownOpen } = this.state;
    const refreshDropdownCaretClassNames = ClassNames(
      'TrackerParentageTab__dropdownCaret',
      { open: keyDropdownOpen },
    );

    return (
      <div className="TrackerParentageTab__dropdown">
        <div
          className="TrackerParentageTab__dropdownHeader d-flex align-items-center justify-content-between"
          onClick={() => this.setState({ keyDropdownOpen: !keyDropdownOpen })}
        >
          <div>Key</div>
          <div className={refreshDropdownCaretClassNames} />
        </div>
        <Collapse in={keyDropdownOpen} timeout={200}>
          <div className="TrackerParentageTab__dropdownContentContainer">
            <div className="TrackerParentageTab__dropdownContent keyContent d-flex flex-column align-items-start justify-content-between">
              <div className="TrackerParentageTab__keyTrackerDiamond d-flex align-items-center">
                <img
                  alt="tracker-diamond"
                  src="/dist/images/app/tracker-diamond.svg"
                />
                <div className="TrackerParentageTab__keyDropdownText">Tracker</div>
              </div>
              <div className="TrackerParentageTab__keyUnknown d-flex align-items-center">
                <img
                  alt="unknown-triangle"
                  src="/dist/images/app/unknown-triangle.svg"
                />
                <div className="TrackerParentageTab__keyDropdownText">Unknown</div>
              </div>
              <div className="TrackerParentageTab__keyCurrentSite d-flex align-items-center">
                <img
                  alt="host-wye"
                  src="/dist/images/app/host-wye.svg"
                />
                <div className="TrackerParentageTab__keyDropdownText">Current Site</div>
              </div>
            </div>
          </div>
        </Collapse>
      </div>
    );
  }

  renderRefreshDropdown() {
    const { isLive, messageCreators } = this.props;
    const { refreshDropdownOpen, newRequestData } = this.state;
    const refreshDropdownCaretClassNames = ClassNames(
      'TrackerParentageTab__dropdownCaret',
      { open: refreshDropdownOpen },
    );
    const refreshButtonClassNames = ClassNames(
      'TrackerParentageTab__refreshButton',
      'd-flex',
      'align-items-center',
      'justify-content-center',
      { disabled: !isLive || !newRequestData },
    );

    return (
      <div className="TrackerParentageTab__dropdown">
        <div
          className="TrackerParentageTab__dropdownHeader d-flex align-items-center justify-content-between"
          onClick={() => this.setState({ refreshDropdownOpen: !refreshDropdownOpen })}
        >
          <div>Parentage Refresh</div>
          <div className={refreshDropdownCaretClassNames} />
        </div>
        <Collapse in={refreshDropdownOpen} timeout={200}>
          <div className="TrackerParentageTab__dropdownContentContainer">
            <div className="TrackerParentageTab__dropdownContent d-flex flex-column align-items-center justify-content-between">
              <div className="TrackerParentageTab__refreshDropdownText">
                {newRequestData ? (
                  'Refresh with latest request information'
                ) : (
                  'Up to date, no new request information to display'
                )}
              </div>
              <div
                className={refreshButtonClassNames}
                onClick={() => {
                  if (!newRequestData || !isLive) { return; }
                  this.setState({ newRequestData: false });
                  messageCreators.requestTrackerParentage();
                }}
              >
                Refresh
              </div>
            </div>
          </div>
        </Collapse>
      </div>
    );
  }

  renderBottomItems() {
    const { tooltipRef } = this.props;
    const tooltipText = 'Select a request from the list to highlight it in the Parentage graph';
    const { width, height } = this.state;
    const styles = { width: `${width}px`, height: `${height}px` };

    return (
      <Fragment>
        <div className="d-flex flex-column">
          <div className="TrackerParentageTab__requestListHeader d-flex align-items-center">
            <div>Requests</div>
            <OverlayTrigger
              container={tooltipRef}
              placement="auto"
              overlay={(
                <Tooltip className="tooltipLeft">{tooltipText}</Tooltip>
              )}
            >
              <img
                src={[chrome.extension.getURL('dist/images/shared/info-icon.svg')]}
                className="TrackerParentageTab__infoIcon"
                width="16"
                height="16"
                alt={`More info hover: ${tooltipText}`}
              />
            </OverlayTrigger>
          </div>
          <div className="TrackerParentageTab__requestList">
            {this.renderSortedRequestList()}
          </div>
        </div>
        <div
          className="TrackerParentageTab__graphContainer"
          ref={(node) => { this.graphContainerRef = node; }}
        >
          <div styles={styles} ref={(node) => { this.graphRef = node; }} />
        </div>
        <div className="TrackerParentageTab__dropdownContainer">
          {this.renderKeyDropdown()}
          {this.renderRefreshDropdown()}
        </div>
      </Fragment>
    );
  }

  renderBlankDataMessage() {
    return (
      <div className="TrackerParentageTab__blankDataBackground d-flex align-items-center justify-content-center">
        <div className="TrackerParentageTab__blankDataMessage">
          Tracker parentage cannot be analyzed while parent tab is closed
        </div>
      </div>
    );
  }

  render() {
    const { trackerParentage: { nodes } } = this.props;
    const blankData = !nodes.length;

    return (
      <div className="TrackerParentageTab">
        <div className="TrackerParentageTab__filters">
          <div className="TrackerParentageTab__filtersHeader">
            Filter nodes by category:
          </div>
          <div className="TrackerParentageTab__filterButtons d-flex flex-wrap">
            {this.renderFilterButtons()}
          </div>
        </div>
        <div className="TrackerParentageTab__bottomGroup d-flex">
          {blankData ? this.renderBlankDataMessage() : this.renderBottomItems()}
        </div>
      </div>
    );
  }
}

TrackerParentageTab.propTypes = {
  trackerParentage: PropTypes.shape({
    nodes: PropTypes.arrayOf(PropTypes.object).isRequired,
    links: PropTypes.arrayOf(PropTypes.object).isRequired,
  }).isRequired,
  requestsCount: PropTypes.number.isRequired,
  isLive: PropTypes.bool.isRequired,
  tooltipRef: PropTypes.instanceOf(PropTypes.element),
  actions: PropTypes.shape({
    clearTrackerParentage: PropTypes.func.isRequired,
  }).isRequired,
  messageCreators: PropTypes.shape({
    requestTrackerParentage: PropTypes.func.isRequired,
    sendMetrics: PropTypes.func.isRequired,
  }).isRequired,
};

TrackerParentageTab.defaultProps = {
  tooltipRef: null,
};

export default TrackerParentageTab;
