import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';

import ThemedToggle from '../ThemedToggle';
import './LiveFreezeToggle.scss';

class LiveFreezeToggle extends Component {
  componentDidUpdate(prevProps) {
    const { isLive, toast, actions, showToasts } = this.props;
    const liveOrFreezeShown = isLive ? 'liveShown' : 'freezeShown';
    if (showToasts && isLive !== prevProps.isLive && !toast[liveOrFreezeShown]) {
      const toastText = isLive
        ? ('You are in Live Mode. Data is streaming in real-time.')
        : ('You are in Freeze Mode. Data streaming is paused.');
      actions.openToast({ toastText, [liveOrFreezeShown]: true }, 5000);
    } else if (isLive !== prevProps.isLive && toast.show) {
      actions.closeToast();
    }
  }

  handleClick = (buttonValue) => {
    const { isLive, messageCreators, panel } = this.props;
    if (!!buttonValue === isLive) {
      messageCreators.setIsLive(!isLive);
      if (!isLive) {
        messageCreators.sendMetrics({ type: 'toggle_live', insightsView: panel ? '0' : '1' });
      } else {
        messageCreators.sendMetrics({ type: 'toggle_freeze', insightsView: panel ? '0' : '1' });
      }
    }
  }

  render() {
    const { isLive, panel, disabled } = this.props;
    const liveFreezeToggleClasses = ClassNames(
      'LiveFreezeToggle',
      'd-flex',
      'align-items-center',
      { disabled },
    );
    const modeIndicatorClasses = ClassNames('LiveFreezeToggle__modeIndicator', {
      panel,
      live: isLive,
    });
    const tooltipStrings = [
      'Stream data in real-time',
      'Pause data streaming',
    ];

    const returnModeIndicator = () => {
      if (disabled) {
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="21"
            className={modeIndicatorClasses}
          >
            <path fill="#00AEF0" stroke="#00AEF0" d="M14.295 6.4c-.204-.2-.531-.2-.715 0L10 9.9 6.42 6.4c-.204-.2-.531-.2-.715 0a.476.476 0 0 0 0 .7l3.58 3.5-3.58 3.5a.476.476 0 0 0 0 .7.5.5 0 0 0 .368.14.5.5 0 0 0 .368-.14l3.58-3.5 3.579 3.5a.5.5 0 0 0 .368.14.5.5 0 0 0 .368-.14.476.476 0 0 0 0-.7l-3.58-3.5 3.58-3.5c.164-.2.164-.5-.04-.7zm4.398.3c-.327-.98-.88-1.68-1.677-2.12-.86-.5-1.718-.98-2.577-1.46-.86-.48-1.719-.96-2.578-1.46a3.76 3.76 0 0 0-1.718-.48c-.736-.02-1.37.12-1.923.44-.49.28-.981.54-1.452.82-1.227.68-2.495 1.4-3.743 2.12-1.186.7-1.82 1.78-1.82 3.1-.02 1.3 0 2.62 0 3.9v1.94c0 .38.06.74.163 1.04.327.92.88 1.62 1.657 2.06.839.48 1.698.96 2.557 1.44S7.3 19 8.139 19.48c.511.3 1.043.46 1.656.5h.287c.654 0 1.248-.16 1.78-.46 1.677-.96 3.415-1.96 5.133-2.92a3.37 3.37 0 0 0 1.33-1.28c.368-.62.532-1.14.532-1.7V7.64c-.02-.28-.062-.62-.164-.94zm-.88 6.96c0 .36-.122.74-.408 1.2-.225.4-.532.7-.941.92-1.739.96-3.478 1.96-5.155 2.92-.43.24-.9.34-1.473.32-.45-.04-.838-.16-1.206-.38-.86-.48-1.698-.96-2.557-1.44-.86-.48-1.698-.96-2.557-1.44-.573-.32-.961-.8-1.207-1.52a1.9 1.9 0 0 1-.123-.72V7.68c0-1 .43-1.72 1.33-2.26C4.743 4.7 6.01 4 7.239 3.3c.49-.28.981-.54 1.472-.82.369-.22.757-.32 1.248-.32h.123c.45.02.859.14 1.248.36.859.5 1.718.98 2.577 1.46s1.718.96 2.577 1.46c.573.32.961.82 1.207 1.56.061.2.102.44.102.68v5.98h.02z" />
          </svg>
        );
      }

      if (isLive) {
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="14"
            className={modeIndicatorClasses}
          >
            <g fill="#00AEF0">
              <path d="M15.3.28a.769.769 0 0 0-1.144 0 .898.898 0 0 0 0 1.22c2.85 3.04 2.85 7.98 0 11.02a.898.898 0 0 0 0 1.22c.15.16.356.26.563.26a.72.72 0 0 0 .562-.26C18.77 10.02 18.77 3.98 15.3.28z" />
              <path d="M12.619 3.12a.769.769 0 0 0-1.144 0 .898.898 0 0 0 0 1.22c1.369 1.46 1.388 3.86 0 5.32a.898.898 0 0 0 0 1.22c.15.16.356.26.563.26a.72.72 0 0 0 .562-.26c2.044-2.14 2.025-5.62.019-7.76zM3.844 1.5a.898.898 0 0 0 0-1.22.769.769 0 0 0-1.144 0c-3.469 3.7-3.469 9.74 0 13.44.15.16.356.26.563.26a.72.72 0 0 0 .562-.26.898.898 0 0 0 0-1.22C.994 9.48.994 4.54 3.844 1.5z" />
              <path d="M6.506 4.34a.898.898 0 0 0 0-1.22.769.769 0 0 0-1.144 0c-2.006 2.14-2.006 5.62 0 7.76.15.16.357.26.563.26a.72.72 0 0 0 .563-.26.898.898 0 0 0 0-1.22c-1.35-1.46-1.35-3.86.018-5.32z" />
              <ellipse cx="9" cy="7" rx="1.369" ry="1.46" />
            </g>
          </svg>
        );
      }

      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="18"
          className={modeIndicatorClasses}
        >
          <path fill="#00AEF0" d="M15.6 10.25a.5.5 0 0 1-.048.372.482.482 0 0 1-.291.229l-2.166.593 2.073 1.221c.152.086.247.25.248.427a.493.493 0 0 1-.243.43.47.47 0 0 1-.485-.006l-2.069-1.222.58 2.216a.5.5 0 0 1-.048.372.482.482 0 0 1-.415.246.482.482 0 0 1-.463-.364l-.828-3.163-2.965-1.75v3.5l2.264 2.315a.498.498 0 0 1 .128.475.486.486 0 0 1-.341.35.473.473 0 0 1-.465-.13L8.48 14.738v2.443c0 .27-.215.49-.48.49a.486.486 0 0 1-.48-.49v-2.443l-1.586 1.625a.473.473 0 0 1-.465.13.486.486 0 0 1-.34-.35.498.498 0 0 1 .127-.475l2.264-2.315V9.85l-2.965 1.751-.828 3.162a.482.482 0 0 1-.587.347.482.482 0 0 1-.291-.229.5.5 0 0 1-.048-.372l.58-2.216-2.069 1.223a.47.47 0 0 1-.485.006.493.493 0 0 1-.243-.43.493.493 0 0 1 .248-.426l2.069-1.221-2.166-.593a.487.487 0 0 1-.34-.348.5.5 0 0 1 .123-.476.474.474 0 0 1 .465-.128l3.097.85L7.04 9 4.08 7.25.983 8.1a.484.484 0 0 1-.601-.41.49.49 0 0 1 .353-.538l2.166-.593L.832 5.335a.497.497 0 0 1-.168-.667.474.474 0 0 1 .648-.184l2.069 1.222L2.8 3.49a.499.499 0 0 1 .114-.488.473.473 0 0 1 .474-.13c.17.048.3.188.338.364l.83 3.163 2.964 1.75v-3.5L5.256 2.335a.5.5 0 0 1-.002-.696.474.474 0 0 1 .68-.002L7.52 3.261V.818c0-.27.215-.49.48-.49s.48.22.48.49v2.443l1.586-1.625a.472.472 0 0 1 .676.004c.186.19.187.499.002.691L8.48 4.65v3.5l2.965-1.751.828-3.163a.486.486 0 0 1 .338-.364.473.473 0 0 1 .474.13c.123.129.167.316.114.488l-.58 2.216 2.069-1.222a.474.474 0 0 1 .648.184.497.497 0 0 1-.168.666l-2.069 1.222 2.166.593a.49.49 0 0 1 .353.539.484.484 0 0 1-.601.41L11.92 7.25 8.96 9l2.96 1.75 3.097-.85a.48.48 0 0 1 .583.35z" />
        </svg>
      );
    };

    return (
      <div className={liveFreezeToggleClasses}>
        {!panel && !disabled && (
          <p className="LiveFreezeToggle__modeText">Mode</p>
        )}
        {returnModeIndicator()}
        <ThemedToggle
          handleClick={this.handleClick}
          activeButton={isLive ? 0 : 1}
          tooltipPosition="bottom"
          tooltipStrings={tooltipStrings}
        >
          <p>Live</p>
          <p>Freeze</p>
        </ThemedToggle>
        {disabled && <div className="LiveFreezeToggle__greyOut" />}
      </div>
    );
  }
}

LiveFreezeToggle.propTypes = {
  isLive: PropTypes.bool.isRequired,
  showToasts: PropTypes.bool.isRequired,
  toast: PropTypes.shape({
    liveShown: PropTypes.bool.isRequired,
    freezeShown: PropTypes.bool.isRequired,
    show: PropTypes.bool.isRequired,
  }).isRequired,
  actions: PropTypes.shape({
    openToast: PropTypes.func.isRequired,
    closeToast: PropTypes.func.isRequired,
  }).isRequired,
  messageCreators: PropTypes.shape({
    setIsLive: PropTypes.func.isRequired,
    sendMetrics: PropTypes.func.isRequired,
  }).isRequired,
  panel: PropTypes.bool,
  disabled: PropTypes.bool,
};

LiveFreezeToggle.defaultProps = {
  panel: false,
  disabled: false,
};

export default LiveFreezeToggle;
