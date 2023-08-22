import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import capitalize from '../../utils/javascript/capitalize';

const NO_SELECTION = -1;
const RESET_DISPLAY_VALUE = true;

// Table of Contents
// I. React lifecycle methods
// II. Event listeners
// III. State update & data processing delegates
// IV. Render Methods

// This component does not import its associated stylesheet
// because it does not provide any default styling.
// The stylesheet is a template that explains what styles
// client components should define, and how.

class SearchInput extends Component {
  // I. React lifecycle methods
  constructor(props) {
    super(props);

    this.state = {
      displayValue: props.searchInput,
      dropdownJustScrolled: false,
      dropdownOpen: false,
      selectedDropdownIndex: NO_SELECTION,
    };

    this.inputRef = React.createRef();
  }

  componentDidMount() {
    document.addEventListener('click', this.onClickAway);
  }

  componentDidUpdate() {
    this.inputRef.current.scrollLeft = this.inputRef.current.scrollWidth;
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.onClickAway);
  }

  // II. Event listeners
  onClickAway = (e) => {
    const { dropdownOpen } = this.state;

    if (dropdownOpen && !this.containerRef.contains(e.target)) {
      this.closeDropdown();
    }
  }

  onKeyboardInput = (e) => {
    const { dropdownOpen } = this.state;

    if (e.key === 'Escape') {
      if (dropdownOpen) {
        this.closeDropdown(RESET_DISPLAY_VALUE);
      } else {
        this.clearInput();
      }
    } else if (e.key === 'Enter') {
      this.selectDropdownItem();
      this.closeDropdown();
    } else if (e.key === 'ArrowDown') {
      this.scrollDropdownDown();
    } else if (e.key === 'ArrowUp') {
      // Prevent search input cursor from jumping to the start
      e.preventDefault();
      this.scrollDropdownUp();
    }
  }

  onDropdownItemClick = (e) => {
    const { cssPrefix } = this.props;

    let name = '';
    const targetParent = e.target.parentElement;
    const targetParentClass = targetParent.className;
    // If the dropdown item has a substring match with the search input,
    // the item will have internal structure so that the matching bit can be styled differently
    // In this case, we need to go up one level to the parent to make sure we grab the whole text
    if (targetParentClass.includes(`${cssPrefix}__searchDropdownItem`)) {
      name = targetParent.innerText;
    } else if (targetParentClass.includes(`${cssPrefix}__searchDropdown`)) {
      name = e.target.innerText;
    }

    this.updateSearchInput(name);
    this.selectDropdownItem();
    this.closeDropdown();
  }

  onDropdownItemMouseMove = (e) => {
    const { selectedDropdownIndex } = this.state;

    const newSelectedDropdownIndex = parseInt(e.target.getAttribute('data-index'), 10);

    if (selectedDropdownIndex !== newSelectedDropdownIndex) {
      this.setState({
        selectedDropdownIndex: newSelectedDropdownIndex,
      });
    }
  }

  // We use both mouse events to account for the case when a user re-opens a closed dropdown
  // and a dropdown item ends up being positioned under the mouse cursor
  onDropdownItemMouseOver = (e) => {
    const { dropdownJustScrolled } = this.state;

    if (dropdownJustScrolled) {
      this.setState({
        dropdownJustScrolled: false,
      });
    } else {
      this.onDropdownItemMouseMove(e);
    }
  }

  onDropdownItemMouseOut = () => {
    const { dropdownJustScrolled } = this.state;

    if (dropdownJustScrolled) return;

    this.setState({
      selectedDropdownIndex: NO_SELECTION,
    });
  }

  onTyping = e => (this.updateSearchInput(e.target.value));

  onFocus = () => {
    this.inputRef.current.scrollLeft = this.inputRef.current.scrollWidth;
  }

  // III. State update & data processing delegates
  clearInput = () => this.updateSearchInput('');

  closeDropdown = (resetDisplayValue = false) => {
    const { searchInput } = this.props;

    this.dropdownRef.scrollTop = 0;

    this.setState(state => ({
      dropdownOpen: false,
      selectedDropdownIndex: NO_SELECTION,
      displayValue: resetDisplayValue ? searchInput : state.displayValue,
    }));
  }

  scrollDropdownDown = () => {
    const {
      dropdownItemHeight,
      dropdownItems,
      dropdownMaxVisibleItems,
      searchInput,
    } = this.props;

    const dropdownMaxHeight = (
      dropdownItemHeight
      * (dropdownMaxVisibleItems - 1)
    );

    this.setState((state) => {
      // Figure out which item should now be selected
      // and whether we need to scroll the dropdown item container
      const needToWrapAround = (
        state.selectedDropdownIndex
        >= dropdownItems.length - 1
      );
      const newSelectedIndex = (
        !state.dropdownOpen
        || needToWrapAround
      )
        ? NO_SELECTION
        : state.selectedDropdownIndex + 1;
      const needToScrollDown = (
        newSelectedIndex * dropdownItemHeight
        > this.dropdownRef.scrollTop + dropdownMaxHeight
      );

      // Scroll the dropdown item container
      if (needToScrollDown) {
        this.dropdownRef.scrollTop += dropdownItemHeight;
      }
      if (needToWrapAround) {
        this.dropdownRef.scrollTop = 0;
      }

      let newDisplayValue = state.displayValue;
      if (newSelectedIndex === NO_SELECTION) {
        // Reset the display value if the dropdown was already open,
        // but not if we have just re-opened it after closing it by clicking away
        if (state.dropdownOpen) newDisplayValue = searchInput;
      } else {
        newDisplayValue = dropdownItems[newSelectedIndex].text;
      }

      return ({
        dropdownJustScrolled: needToScrollDown || needToWrapAround,
        dropdownOpen: true,
        selectedDropdownIndex: newSelectedIndex,
        displayValue: newDisplayValue,
      });
    });
  }

  scrollDropdownUp = () => {
    const {
      dropdownItemHeight,
      dropdownItems,
      searchInput,
    } = this.props;

    this.setState((state) => {
      // Figure out which item should now be selected
      // and whether we need to scroll the dropdown item container
      const lastItemIndex = dropdownItems.length - 1;
      const needToWrapAround = (
        state.dropdownOpen
        && state.selectedDropdownIndex === NO_SELECTION
      );
      const newSelectedIndex = needToWrapAround
        ? lastItemIndex
        : Math.max(NO_SELECTION, state.selectedDropdownIndex - 1);
      const needToScrollUp = (
        newSelectedIndex * dropdownItemHeight
        < this.dropdownRef.scrollTop
      );

      // Scroll the dropdown item container
      if (needToScrollUp) {
        this.dropdownRef.scrollTop -= dropdownItemHeight;
      }
      if (needToWrapAround) {
        this.dropdownRef.scrollTop = lastItemIndex * dropdownItemHeight;
      }

      let newDisplayValue = state.displayValue;
      if (newSelectedIndex === NO_SELECTION) {
        // Reset the display value if the dropdown was already open,
        // but not if we have just re-opened it after closing it by clicking away
        if (state.dropdownOpen) newDisplayValue = searchInput;
      } else {
        newDisplayValue = dropdownItems[newSelectedIndex].text;
      }

      return ({
        dropdownJustScrolled: needToWrapAround || needToScrollUp,
        dropdownOpen: true,
        selectedDropdownIndex: newSelectedIndex,
        displayValue: newDisplayValue,
      });
    });
  }

  selectDropdownItem = () => {
    const { dropdownItems, reportSelection } = this.props;
    const { displayValue, selectedDropdownIndex } = this.state;

    if (selectedDropdownIndex === NO_SELECTION) {
      reportSelection({ text: displayValue });
    } else {
      reportSelection(dropdownItems[selectedDropdownIndex]);
    }
  }

  updateSearchInput = (newInput) => {
    const { reportInputUpdate } = this.props;

    reportInputUpdate(newInput);

    this.setState({
      dropdownOpen: newInput.length > 0,
      selectedDropdownIndex: -1,
      displayValue: newInput,
    });
  }

  // IV. Render Methods
  renderDropdown = () => {
    const { cssPrefix, dropdownItems } = this.props;
    const { dropdownOpen } = this.state;

    return (
      <div
        className={`${cssPrefix}__searchDropdown`}
        style={{ display: dropdownOpen ? 'block' : 'none' }}
        ref={(node) => { this.dropdownRef = node; }}
      >
        {dropdownItems.map((item, index) => (
          this.renderDropdownItem(item, index)
        ))}
      </div>
    );
  }

  renderDropdownItem = (item, index) => {
    const { cssPrefix, searchInput } = this.props;
    const { selectedDropdownIndex } = this.state;
    const { id, text } = item;

    // We COULD handle all substring matches, but this might look strange
    // and would add substantial complexity for little gain,
    // as most substring matches should be at the start
    const startsWithExactMatch = text.startsWith(capitalize(searchInput));

    const selected = index === selectedDropdownIndex;
    const classNames = ClassNames(`${cssPrefix}__searchDropdownItem`, {
      selected,
    });

    return (
      <div
        data-index={index}
        key={id}
        className={classNames}
        onClick={this.onDropdownItemClick}
        onMouseOver={this.onDropdownItemMouseOver}
        onMouseMove={this.onDropdownItemMouseMove}
        onMouseOut={this.onDropdownItemMouseOut}
      >
        {!startsWithExactMatch && text}
        {startsWithExactMatch && ([
          <span data-index={index} className="exact-substring-match">{text.slice(0, searchInput.length)}</span>,
          <span data-index={index}>{text.slice(searchInput.length)}</span>,
        ])}
      </div>
    );
  }

  render() {
    const {
      cssPrefix,
      labelText,
      placeholderText,
      searchIconFilepath,
      searchIconHeight,
      searchIconWidth,
      showLabel,
      showSearchIcon,
      xIconFilepath,
      xIconHeight,
      xIconWidth,
    } = this.props;
    const { displayValue } = this.state;

    return (
      <div className={`${cssPrefix}__search`}>
        {showLabel && (
          <label
            htmlFor={`${cssPrefix}__searchInput`}
            className={`${cssPrefix}__searchLabel`}
          >
            {labelText}
          </label>
        )}
        <div
          className={`${cssPrefix}__searchInputContainer`}
          ref={(node) => { this.containerRef = node; }}
        >
          {showSearchIcon && (
            <img
              src={[chrome.extension.getURL(`${searchIconFilepath}`)]}
              className={`${cssPrefix}__searchIcon`}
              width={searchIconWidth}
              height={searchIconHeight}
              alt="Search input decorative icon"
            />
          )}
          <input
            id={`${cssPrefix}__searchInput`}
            ref={this.inputRef}
            placeholder={placeholderText}
            className={`${cssPrefix}__searchInput`}
            onChange={this.onTyping}
            onKeyDown={this.onKeyboardInput}
            onFocus={this.onFocus}
            value={displayValue}
          />
          {displayValue !== '' && (
            <img
              src={[chrome.extension.getURL(`${xIconFilepath}`)]}
              className={`${cssPrefix}__searchXIcon`}
              width={xIconWidth}
              height={xIconHeight}
              alt="X icon to clear search input"
              onClick={this.clearInput}
            />
          )}
          {this.renderDropdown()}
        </div>
      </div>
    );
  }
}

SearchInput.propTypes = {
  cssPrefix: PropTypes.string.isRequired,
  dropdownItemHeight: PropTypes.number.isRequired, // needed for scrolling logic
  dropdownMaxVisibleItems: PropTypes.number.isRequired, // needed for scrolling logic
  dropdownItems: PropTypes.objectOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
  })).isRequired,
  labelText: PropTypes.string,
  placeholderText: PropTypes.string,
  reportInputUpdate: PropTypes.func.isRequired,
  reportSelection: PropTypes.func.isRequired,
  searchIconHeight: PropTypes.number,
  searchIconWidth: PropTypes.number,
  searchIconFilepath: PropTypes.string,
  searchInput: PropTypes.string.isRequired,
  showLabel: PropTypes.bool,
  showSearchIcon: PropTypes.bool,
  xIconFilepath: PropTypes.string,
  xIconHeight: PropTypes.number,
  xIconWidth: PropTypes.number,
};

SearchInput.defaultProps = {
  placeholderText: '',
  searchIconFilepath: '',
  searchIconHeight: 11,
  searchIconWidth: 12,
  showSearchIcon: false,
  showLabel: true,
  labelText: 'Search',
  xIconFilepath: 'dist/images/shared/x-icon.svg',
  xIconHeight: 11,
  xIconWidth: 12,
};

export default SearchInput;
