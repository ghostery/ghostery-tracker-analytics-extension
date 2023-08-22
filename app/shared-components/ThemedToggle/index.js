import { connect } from 'react-redux';
import ThemedToggle from './ThemedToggle.jsx';

const mapStateToProps = state => ({
  tooltipRef: state.UserInterfaceReducer.tooltipRef,
});

export default connect(mapStateToProps)(ThemedToggle);
