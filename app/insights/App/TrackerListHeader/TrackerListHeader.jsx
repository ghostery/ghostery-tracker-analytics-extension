import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';

import SearchInput from '../../../shared-components/SearchInput';
import ThemedToggle from '../../../shared-components/ThemedToggle';
import ThemedLegend from '../../../shared-components/ThemedLegend';
import categoryMapping from '../../../../src/utils/stringMaps';
import './TrackerListHeader.scss';

const SEARCH_INPUT_DROPDOWN_ITEM_HEIGHT = 25;
const SEARCH_INPUT_DROPDOWN_MAX_VISIBLE_ITEMS = 5;

class TrackerListHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkboxSelected: false,
      filterDropdownOpen: false,
      pageEventsDropdownOpen: false,
      sortOrderDropdownOpen: false,
      showLeftShadow: false,
    };
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClickAway);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickAway);
  }

  handleClickAway = (e) => {
    const {
      checkboxSelected,
      filterDropdownOpen,
      pageEventsDropdownOpen,
      sortOrderDropdownOpen,
    } = this.state;

    if (checkboxSelected) {
      this.setState({ checkboxSelected: false });
      return;
    }

    const closeDropdownOnClickAway = (open, key, ref) => {
      if (open && !ref.contains(e.target)) {
        this.setState({ [`${key}`]: false });
      }
    };

    // TODO simplify signature
    closeDropdownOnClickAway(pageEventsDropdownOpen, 'pageEventsDropdownOpen', this.pageEventsDropdownRef);
    closeDropdownOnClickAway(filterDropdownOpen, 'filterDropdownOpen', this.filterDropdownRef);
    closeDropdownOnClickAway(sortOrderDropdownOpen, 'sortOrderDropdownOpen', this.sortDropdownRef);
  }

  handleExpandClick = (e) => {
    e.stopPropagation();
    const { trackerListExpanded, actions } = this.props;
    actions.expandOrCollapseComponent({ trackerList: !trackerListExpanded });
  }

  handleToggleClick = (buttonValue) => {
    const { scale, messageCreators } = this.props;
    const linOrLog = buttonValue === 0 ? 'linear' : 'logarithmic';
    if (linOrLog === scale) { return; }
    messageCreators.toggleScale(linOrLog);
    messageCreators.sendMetrics({ type: `toggle_${linOrLog}` });
  }

  renderDropdownMenuListItem = ({ text, selected, toggleOn, toggleOff, disabled }) => {
    const dropdownBoxClasses = ClassNames(
      'TrackerListHeader__dropdownBox',
      { disabled },
    );
    const dropdownTextClasses = ClassNames(
      'TrackerListHeader__dropdownText',
      { disabled },
    );
    const boxClick = () => {
      if (disabled) { return; }
      this.setState({ checkboxSelected: true });
      toggleOn();
    };
    const svgClick = () => {
      this.setState({ checkboxSelected: true });
      toggleOff();
    };

    return (
      <div
        className="TrackerListHeader__dropdownMenuItem d-flex align-items-center"
        key={text}
      >
        {!selected || disabled ? (
          <div
            className={dropdownBoxClasses}
            onClick={boxClick}
          />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
            className="TrackerListHeader__dropdownCheck"
            onClick={svgClick}
          >
            <g fill="none" fillRule="evenodd">
              <path d="M-1-1h15v15H-1z" />
              <path fill="#00AEF0" d="M10.875.875h-8.75c-.688 0-1.25.563-1.25 1.25v8.75c0 .688.563 1.25 1.25 1.25h8.75c.688 0 1.25-.563 1.25-1.25v-8.75c0-.688-.563-1.25-1.25-1.25zM5.25 9.625L2.125 6.62 3 5.78l2.25 2.163L10 3.375l.875.841L5.25 9.625z" />
            </g>
          </svg>
        )}
        <p className={dropdownTextClasses}>{text}</p>
      </div>
    );
  }

  renderDropdownToggle = (title, open, handleClick, filters) => {
    const toggleClasses = ClassNames(
      'TrackerListHeader__dropdownToggle',
      'd-flex',
      'align-items-center',
      { open, filters },
    );
    const caretClasses = ClassNames('TrackerListHeader__dropdownCaret', { open });
    return (
      <div className={toggleClasses} onClick={handleClick}>
        <p className="TrackerListHeader__dropdownTitle">{title}</p>
        <div className={caretClasses} />
      </div>
    );
  }

  renderPageEventsDropdown = () => {
    const { pageEventsDropdownOpen } = this.state;
    const { pageEvents, messageCreators, timingPerformance } = this.props;
    const dropdownMenuClasses = ClassNames('TrackerListHeader__dropdownMenu', 'pageEvents', {
      show: pageEventsDropdownOpen,
    });

    return (
      <div
        className="TrackerListHeader__dropdown pageEvents"
        ref={(node) => { this.pageEventsDropdownRef = node; }}
      >
        <div className={dropdownMenuClasses}>
          {Object.keys(timingPerformance).map(pageEvent => (
            this.renderDropdownMenuListItem({
              text: pageEvent,
              selected: pageEvents.hasOwnProperty(pageEvent),
              toggleOn: () => messageCreators.addPageEvent(pageEvent),
              toggleOff: () => messageCreators.removePageEvent(pageEvent),
              disabled: !(timingPerformance[pageEvent] > 0),
            })
          ))}
        </div>
        {this.renderDropdownToggle('Page Events', pageEventsDropdownOpen, () => {
          this.setState({ pageEventsDropdownOpen: !pageEventsDropdownOpen });
        })}
      </div>
    );
  }

  toggleAllFilters = (selected) => {
    const { filters, actions } = this.props;
    Object.keys(categoryMapping).forEach((category) => {
      if (!!filters[category] !== selected) {
        actions.toggleFilter({ category, selected });
      }
    });
  }

  renderFilterDropdown = () => {
    const { filterDropdownOpen } = this.state;
    const { filters, actions } = this.props;
    const dropdownMenuClasses = ClassNames('TrackerListHeader__dropdownMenu', 'filters', {
      show: filterDropdownOpen,
    });

    return (
      <div
        className="TrackerListHeader__dropdown"
        ref={(node) => { this.filterDropdownRef = node; }}
      >
        <div className={dropdownMenuClasses}>
          <div className="TrackerListHeader__filterMenuWrapper d-flex flex-column flex-wrap">
            {Object.keys(categoryMapping).map(category => (
              this.renderDropdownMenuListItem({
                text: categoryMapping[category],
                selected: filters.hasOwnProperty(category),
                toggleOn: () => actions.toggleFilter({ category, selected: true }),
                toggleOff: () => actions.toggleFilter({ category, selected: false }),
                disabled: false,
              })
            ))}
          </div>
          <div className="TrackerListHeader__dropdownBottomButtons d-flex">
            <div
              className="TrackerListHeader__dropdownBottomButton d-flex align-items-center justify-content-center"
              onClick={() => this.toggleAllFilters(true)}
            >
              <div>Select All</div>
            </div>
            <div
              className="TrackerListHeader__dropdownBottomButton d-flex align-items-center justify-content-center"
              onClick={() => this.toggleAllFilters(false)}
            >
              <div>Clear All</div>
            </div>
          </div>
        </div>
        {this.renderDropdownToggle('Filter Categories', filterDropdownOpen, () => {
          this.setState({ filterDropdownOpen: !filterDropdownOpen });
        }, true)}
      </div>
    );
  }

  onSearchInputUpdate = (newInput) => {
    const { actions } = this.props;

    actions.updateSearchInput(newInput);
  }

  onSearchInputSelection = (selection) => {
    const { actions } = this.props;
    const { text } = selection;

    actions.updateSearchInput(text);
  }

  scrollFilterList = (e, backwards) => {
    const leftScrollPosition = this.filterScrollRef.scrollLeft;
    const pixelsToScroll = backwards ? -200 : 200;
    this.filterScrollRef.scrollTo({
      left: leftScrollPosition + pixelsToScroll,
      behavior: 'smooth',
    });

    const showLeftShadow = leftScrollPosition + pixelsToScroll > 0;
    this.setState({ showLeftShadow });
  }

  removeFilterCategory = (category) => {
    const { actions } = this.props;
    actions.toggleFilter({ category, selected: false });

    setTimeout(() => {
      if (this.filterScrollRef.scrollLeft <= 0) {
        this.setState({ showLeftShadow: false });
      }
    }, 1);
  }

  renderFilterScrollingList = () => {
    const { showLeftShadow } = this.state;
    const { filters } = this.props;
    const ref = this.filterScrollRef;

    const isOverflown = ref
      && ref.scrollWidth > ref.clientWidth;
    const boxShadowClasses = ClassNames('TrackerListHeader__boxShadowOverlay', {
      showLeftShadow,
    });

    return (
      <div className="TrackerListHeader__filterScrollingListContainer">
        <div
          className="TrackerListHeader__filterScrollingList d-flex align-items-center justify-content-start"
          ref={(node) => { this.filterScrollRef = node; }}
        >
          {Object.keys(filters).map((category) => {
            const colorBandClasses = ClassNames('TrackerListHeader__colorBand', category);
            return (
              <div
                className="TrackerListHeader__filterScrollingListItemContainer"
                key={category}
              >
                <div className="TrackerListHeader__filterScrollingListItem d-flex align-items-center">
                  <div className={colorBandClasses} />
                  <div>{categoryMapping[category]}</div>
                  <img
                    alt="Close Toast"
                    src={[chrome.extension.getURL('dist/images/app/x-icon-thin.svg')]}
                    className="TrackerListHeader__xIcon"
                    onClick={() => this.removeFilterCategory(category)}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {isOverflown && (
          <Fragment>
            <div className={boxShadowClasses} />
            <div className="TrackerListHeader__leftRightCarets d-flex">
              <div
                className="TrackerListHeader__caretContainer d-flex align-items-center justify-content-center"
                onClick={e => this.scrollFilterList(e, true)}
              >
                <img
                  alt="Scroll Left"
                  src={[chrome.extension.getURL('/dist/images/app/caret-down.svg')]}
                  className="TrackerListHeader__caret left"
                />
              </div>
              <div
                className="TrackerListHeader__caretContainer d-flex align-items-center justify-content-center"
                onClick={e => this.scrollFilterList(e)}
              >
                <img
                  alt="Scroll Right"
                  src={[chrome.extension.getURL('/dist/images/app/caret-down.svg')]}
                  className="TrackerListHeader__caret right"
                />
              </div>
            </div>
          </Fragment>
        )}
      </div>
    );
  };

  // Sort Options Section Start
  onSortDropdownItemClick = (item) => {
    const { actions: { setSortOrder } } = this.props;
    setSortOrder(item);
  }

  renderSortText = (sortOrder) => {
    let sortCategoryText = 'Favorites';
    const sortOrderText = sortOrder === 'Favorites' ? '' : `: ${sortOrder}`;

    if (sortOrder === 'Fastest to Slowest' || sortOrder === 'Slowest to Fastest') {
      sortCategoryText = 'Latency';
    } else if (sortOrder === 'Largest to Smallest' || sortOrder === 'Smallest to Largest') {
      sortCategoryText = 'Size';
    } else if (sortOrder === 'A-Z' || sortOrder === 'Z-A') {
      sortCategoryText = 'Alphabetically';
    }

    return (
      <Fragment>
        <span className="TrackerListHeader--bold">{`${sortCategoryText}`}</span>
        {sortOrderText}
      </Fragment>
    );
  }

  renderSortDropdown = () => {
    const { sortOrder } = this.props;
    const sortListItems = [
      'Slowest to Fastest',
      'Fastest to Slowest',
      'Largest to Smallest',
      'Smallest to Largest',
      'A-Z',
      'Z-A',
      'Favorites',
    ];

    return (
      <div
        className="TrackerListHeader__sortDropdown"
      >
        {sortListItems.filter(item => item !== sortOrder)
          .map((item, index) => (
            this.renderSortDropdownItem(item, index)
          ))}
      </div>
    );
  }

  renderSortDropdownItem = (item, index) => (
    <div
      key={`sortDropdownItem${index}`}
      className="TrackerListHeader__sortDropdownItem"
      onClick={() => this.onSortDropdownItemClick(item)}
    >
      {this.renderSortText(item)}
    </div>
  );

  renderSortToggle = () => {
    const { sortOrder } = this.props;
    const { sortOrderDropdownOpen } = this.state;

    const toggleCLasses = ClassNames('TrackerListHeader__sortToggle', { focused: sortOrderDropdownOpen });
    const caretClasses = ClassNames(
      'TrackerListHeader__dropdownCaret',
      'TrackerListHeader--sortCaret',
      { open: sortOrderDropdownOpen },
    );

    return (
      <div
        className={toggleCLasses}
        ref={(node) => { this.sortDropdownRef = node; }}
        onClick={() => this.setState({ sortOrderDropdownOpen: !sortOrderDropdownOpen })}
      >
        <img
          src={[chrome.extension.getURL('dist/images/app/sort-icon.svg')]}
          className="TrackerListHeader__sortIcon"
          width="14"
          height="12"
          alt="Tracker List sort icon"
        />
        <p className="TrackerListHeader__sortText">
          {this.renderSortText(sortOrder)}
        </p>
        <div className={caretClasses} />
      </div>
    );
  }

  renderSortWrapper = () => {
    const { sortOrderDropdownOpen } = this.state;

    return (
      <div className="TrackerListHeader__sortDropdownWrapper">
        <div className="TrackerListHeader__sortDropdownContainer">
          {this.renderSortToggle()}
          {sortOrderDropdownOpen && this.renderSortDropdown()}
        </div>
      </div>
    );
  }
  // Sort Options Section End

  renderSearchInput = () => {
    const {
      filteredTrackerIDs,
      searchInput,
      trackerInformation,
    } = this.props;

    const searchDropdownItems = filteredTrackerIDs.map(trackerID => (
      {
        id: trackerID,
        text: trackerInformation[trackerID].name,
      }
    ));

    return (
      <SearchInput
        cssPrefix="TrackerListHeader"
        dropdownItems={searchDropdownItems}
        dropdownItemHeight={SEARCH_INPUT_DROPDOWN_ITEM_HEIGHT}
        dropdownMaxVisibleItems={SEARCH_INPUT_DROPDOWN_MAX_VISIBLE_ITEMS}
        placeholderText="Search for a tracker"
        reportInputUpdate={this.onSearchInputUpdate}
        reportSelection={this.onSearchInputSelection}
        searchIconFilepath="dist/images/app/search-icon.svg"
        searchInput={searchInput}
        showSearchIcon
      />
    );
  }

  render() {
    const {
      scale,
      trackerListExpanded,
    } = this.props;
    const activeButton = scale === 'linear' ? 0 : 1;

    const trackerListHeader = ClassNames(
      'TrackerListHeader',
      'd-flex',
      'flex-column',
      'align-items-center',
      { trackerListExpanded },
    );
    const trackerListHeaderExpandCaret = ClassNames(
      'TrackerListHeader__expandCaret',
      { flipped: !trackerListExpanded },
    );

    const linearFilePath = activeButton === 0
      ? '/dist/images/app/linear-option-blue.svg'
      : '/dist/images/app/linear-option.svg';
    const logarithmicFilePath = activeButton === 1
      ? '/dist/images/app/logarithmic-option-blue.svg'
      : '/dist/images/app/logarithmic-option.svg';
    const tooltipSrings = [
      'Display linear scaling',
      'Display logarithmic scaling',
    ];

    return (
      <div className={trackerListHeader}>
        <div
          className="TrackerListHeader__expand d-flex justify-content-center"
          onClick={e => this.handleExpandClick(e)}
        >
          <img
            alt="Hover to Show Expand Tracker List Option"
            src="/dist/images/app/small-bar.svg"
            className="TrackerListHeader__expandHoverToggle"
          />
          <div className="TrackerListHeader__expandDisplay d-flex flex-column align-items-center">
            <div className="TrackerListHeader__expandHalfCircle d-flex justify-content-center">
              <img
                alt="Expand or Collapse Tracker List"
                src="/dist/images/app/caret-down.svg"
                className={trackerListHeaderExpandCaret}
              />
            </div>
            <div className="TrackerListHeader__expandBar" />
          </div>
        </div>
        <div className="d-flex align-items-center">
          <p className="TrackerListHeader__trackerListTitle "># Tracker Requests</p>
          <div className="TrackerListHeader__timelineOptions d-flex align-items-center justify-content-between">
            <div className="TrackerListHeader__linLogToggle d-flex align-items-center">
              <p className="TrackerListHeader__legendTitle">Timeline</p>
              <ThemedToggle
                handleClick={this.handleToggleClick}
                activeButton={activeButton}
                icons
                tooltipPosition="top"
                tooltipStrings={tooltipSrings}
              >
                <img
                  key="linear"
                  alt="Linear Option"
                  src={linearFilePath}
                  width="20"
                  height="5"
                  className="d-inline-block align-top"
                />
                <img
                  key="logarithmic"
                  alt="Logarithmic Option"
                  src={logarithmicFilePath}
                  width="22"
                  height="5"
                  className="d-inline-block align-top"
                />
              </ThemedToggle>
            </div>
            <ThemedLegend pageEvent />
            {this.renderPageEventsDropdown()}
          </div>
        </div>
        <div className="TrackerListHeader__listingControls d-flex">
          <div className="TrackerListHeader__searchAndSort">
            {this.renderSearchInput()}
            <div className="TrackerListHeader__sortSection">
              <p className="TrackerListHeader__sortLabel">Sort By</p>
              {this.renderSortWrapper()}
            </div>
          </div>
          <div className="TrackerListHeader__filter">
            {this.renderFilterDropdown()}
            {this.renderFilterScrollingList()}
          </div>
        </div>
      </div>
    );
  }
}

TrackerListHeader.propTypes = {
  scale: PropTypes.string.isRequired,
  pageEvents: PropTypes.objectOf(PropTypes.bool).isRequired,
  timingPerformance: PropTypes.objectOf(PropTypes.number).isRequired,
  trackerListExpanded: PropTypes.bool.isRequired,
  searchInput: PropTypes.string.isRequired,
  sortOrder: PropTypes.string.isRequired,
  filters: PropTypes.objectOf(PropTypes.bool).isRequired,
  filteredTrackerIDs: PropTypes.arrayOf(PropTypes.number).isRequired,
  trackerInformation: PropTypes.objectOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    latency: PropTypes.number.isRequired,
    size: PropTypes.number.isRequired,
    completedRequests: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  })).isRequired,
  messageCreators: PropTypes.shape({
    sendMetrics: PropTypes.func.isRequired,
    toggleScale: PropTypes.func.isRequired,
    addPageEvent: PropTypes.func.isRequired,
    removePageEvent: PropTypes.func.isRequired,
  }).isRequired,
  actions: PropTypes.shape({
    expandOrCollapseComponent: PropTypes.func.isRequired,
    toggleFilter: PropTypes.func.isRequired,
    setSortOrder: PropTypes.func.isRequired,
    updateSearchInput: PropTypes.func.isRequired,
  }).isRequired,
};

export default TrackerListHeader;
