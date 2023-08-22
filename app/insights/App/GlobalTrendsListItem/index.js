import { connect } from 'react-redux';

import GlobalTrendsListItem from './GlobalTrendsListItem.jsx';
import {
  sendMetrics,
} from '../../../store/messages/messageCreators';

const mapStateToProps = () => ({
  messageCreators: { sendMetrics },
});

export default connect(mapStateToProps)(GlobalTrendsListItem);
