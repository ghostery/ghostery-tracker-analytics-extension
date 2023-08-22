import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';

import './FavoriteTrackersSearch.scss';

class FavoriteTrackersSearch extends Component {
  constructor(props) {
    super(props);
    this.state = { focusedResult: '' };
  }

  handleChange = (e) => {
    const { messageCreators } = this.props;
    messageCreators.searchBugDb(e.target.value);
    this.setState({ focusedResult: '' });
  }

  handleKeyDown = (e) => {
    e.stopPropagation();
    const { focusedResult } = this.state;
    const { bugDbSearchResults, panel } = this.props;
    if (e.target.value === '') { return; }
    if (bugDbSearchResults.length === 0) {
      this.setState({ focusedResult: '' });
      return;
    }

    // TODO: If we ever build for IE/Edge, we'll need to use e.keyCode instead
    // of e.key and ensure that the various key codes associated with each key
    // across different browsers are included
    switch (e.key) {
      case 'ArrowDown': {
        if (focusedResult === '') {
          this.setState({ focusedResult: `searchResult_${bugDbSearchResults[0].key}` });
          break;
        }

        const nextSibling = panel
          ? document.querySelector('.resolved').shadowRoot.getElementById(focusedResult).nextElementSibling
          : document.getElementById(focusedResult).nextElementSibling;

        if (nextSibling) {
          const nextBbox = nextSibling.getBoundingClientRect();
          const containerBbox = nextSibling.parentElement.getBoundingClientRect();
          if (nextBbox.bottom > containerBbox.bottom) {
            nextSibling.parentElement.scrollTop += 20;
          }
          this.setState({
            focusedResult: nextSibling.id,
          });
        }

        break;
      }

      case 'ArrowUp': {
        if (focusedResult === '') { break; }

        const previousSibling = panel
          ? document.querySelector('.resolved').shadowRoot.getElementById(focusedResult).previousElementSibling
          : document.getElementById(focusedResult).previousElementSibling;

        if (previousSibling) {
          const previousBbox = previousSibling.getBoundingClientRect();
          const containerBbox = previousSibling.parentElement.getBoundingClientRect();
          if (previousBbox.top < containerBbox.top) {
            previousSibling.parentElement.scrollTop -= 20;
          }
          this.setState({ focusedResult: previousSibling.id });
        } else {
          this.setState({ focusedResult: '' });
        }

        break;
      }

      case 'Enter': {
        let focusedOrSingleResult;
        if (bugDbSearchResults.length === 1) {
          focusedOrSingleResult = `searchResult_${bugDbSearchResults[0].key}`;
        } else {
          focusedOrSingleResult = focusedResult;
        }

        const focusedElement = panel
          ? document.querySelector('.resolved').shadowRoot.getElementById(focusedOrSingleResult)
          : document.getElementById(focusedOrSingleResult);
        const trackerName = focusedElement.getAttribute('trackername');
        const trackerId = focusedElement.getAttribute('trackerid');
        this.starOrRemoveTracker(trackerId, trackerName);
        this.setState({ focusedResult: '' });

        break;
      }
      default:
    }
  }

  starOrRemoveTracker = (trackerId, trackerName) => {
    const { actions, starredTrackerIds, messageCreators, panel, showToasts } = this.props;
    if (trackerId in starredTrackerIds) {
      if (showToasts) {
        actions.openToast({
          toastText: `${trackerName} is already a favorite tracker`,
        }, 2000);
      }
    } else {
      messageCreators.addStarredTracker({ trackerId, trackerName, view: panel ? '2' : '3' });
      if (showToasts) {
        actions.openToast({
          toastText: `${trackerName} has been added to favorite trackers`,
        }, 2000);
      }
    }
    this.searchRef.value = '';
    messageCreators.searchBugDb('');
  }

  handleRemoveStarred = (trackerId, trackerName) => {
    const { messageCreators, panel } = this.props;
    messageCreators.removeStarredTracker({
      trackerId, trackerName, view: panel ? '2' : '3',
    });
  }

  render() {
    const { bugDbSearchResults, starredTrackerIds, panel } = this.props;
    const { focusedResult } = this.state;

    const starredTrackerKeys = Object.keys(starredTrackerIds);
    starredTrackerKeys.sort((a, b) => (
      starredTrackerIds[a].toLowerCase().localeCompare(starredTrackerIds[b].toLowerCase())
    ));

    const starredListClasses = ClassNames('FavoriteTrackersSearch__starredList', {
      show: starredTrackerKeys.length > 0,
      panel,
    });

    return (
      <div className="FavoriteTrackersSearch__favoriteSettingsTabContent">
        <div className="FavoriteTrackersSearch__inputDropdownGroup">
          <div className="FavoriteTrackersSearch__favoriteTabHeader d-flex align-items-center justify-content-start">
            <img
              src={[chrome.extension.getURL('dist/images/shared/star-settings.svg')]}
              className="FavoriteTrackersSearch__starIcon"
              alt="Star icon"
            />
            <p>Your Favorite Trackers</p>
          </div>
          <InputGroup className="FavoriteTrackersSearch__searchInputContainer">
            <FormControl
              className="FavoriteTrackersSearch__searchInput"
              placeholder="Search"
              onChange={this.handleChange}
              onKeyDown={this.handleKeyDown}
              ref={(node) => { this.searchRef = node; }}
            />
          </InputGroup>
          <div className="FavoriteTrackersSearch__searchDropdown" style={{ display: `${bugDbSearchResults.length > 0 ? 'block' : 'none'}` }}>
            {bugDbSearchResults.map(tracker => (
              <div
                id={`searchResult_${tracker.key}`}
                key={tracker.key}
                trackername={tracker.name}
                trackerid={tracker.key}
                className={`FavoriteTrackersSearch__searchResult ${focusedResult === `searchResult_${tracker.key}` ? 'focused' : ''}`}
                onClick={() => this.starOrRemoveTracker(tracker.key, tracker.name)}
              >
                {tracker.name}
              </div>
            ))}
          </div>
          <p className="FavoriteTrackersSearch__favoriteText">
            Favorited trackers appear at the top of your list when they are detected on a page.
          </p>
        </div>
        <div className={starredListClasses}>
          {starredTrackerKeys.map(key => (
            <div className="FavoriteTrackersSearch__starredTracker  d-flex justify-content-between align-items-center" key={key}>
              {starredTrackerIds[key]}
              <img
                src={[chrome.extension.getURL('dist/images/shared/cross.svg')]}
                alt="Remove tracker from favorite list"
                onClick={() => this.handleRemoveStarred(key, starredTrackerIds[key])}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
}

FavoriteTrackersSearch.propTypes = {
  messageCreators: PropTypes.shape({
    searchBugDb: PropTypes.func.isRequired,
    removeStarredTracker: PropTypes.func.isRequired,
    addStarredTracker: PropTypes.func.isRequired,
  }).isRequired,
  showToasts: PropTypes.bool.isRequired,
  actions: PropTypes.shape({
    openToast: PropTypes.func.isRequired,
  }).isRequired,
  starredTrackerIds: PropTypes.objectOf(PropTypes.string).isRequired,
  bugDbSearchResults: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      trackerName: PropTypes.string,
      trackerId: PropTypes.string,
    }),
  ).isRequired,
  panel: PropTypes.bool,
};

FavoriteTrackersSearch.defaultProps = {
  panel: false,
};

export default FavoriteTrackersSearch;
