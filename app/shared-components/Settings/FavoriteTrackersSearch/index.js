import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import FavoriteTrackersSearch from './FavoriteTrackersSearch.jsx';
import { openToast } from '../../../store/actions/UserInterfaceActions';
import {
  searchBugDb, addStarredTracker, removeStarredTracker,
} from '../../../store/messages/messageCreators';

const mapStateToProps = state => ({
  bugDbSearchResults: state.UserInterfaceReducer.bugDbSearchResults,
  starredTrackerIds: state.SettingsReducer.localSettings.starredTrackerIds,
  showToasts: state.SettingsReducer.localSettings.showToasts,
  messageCreators: { searchBugDb, addStarredTracker, removeStarredTracker },
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ openToast }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(FavoriteTrackersSearch);
