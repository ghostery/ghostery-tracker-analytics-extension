import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Navbar from 'react-bootstrap/Navbar';
import ClassNames from 'classnames';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Dropdown from 'react-bootstrap/Dropdown';

import LiveFreezeToggle from '../LiveFreezeToggle';
import Settings from '../Settings';
import MoreDropdownToggle from './MoreDropdownToggle.jsx';
import './Header.scss';

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = ({ dropdownToggle: false });
  }

  toggleDropdown = (show) => {
    this.setState({ dropdownToggle: show });
  }

  _renderFreeTrialNotification() {
    const {
      messageCreators,
      panel,
      userInfo: {
        freeTrialDaysRemaining,
      },
    } = this.props;

    const freeTrialDaysClasses = ClassNames('Header__freeTrialDays', { panel });

    return (
      <p className={freeTrialDaysClasses}>
        {freeTrialDaysRemaining}
        <span>{` trial day${freeTrialDaysRemaining === 1 ? '' : 's'} left.`}</span>
        <span> </span>
        {panel && (<br />)}
        <span
          className="Header__link"
          onClick={() => messageCreators.subscribe()}
        >
          Upgrade to Plus now.
        </span>
      </p>
    );
  }

  _showDropdown() {
    const { dropdownToggle } = this.state;
    return dropdownToggle;
  }

  render() {
    const {
      children,
      panel,
      tooltipRef,
      messageCreators,
      parentTabClosed,
      userInfo: {
        freeTrial,
      },
      isPageNotScanned,
    } = this.props;

    const logoClasses = ClassNames('Header__logo',
      'd-flex',
      'align-items-center',
      { panel });
    const exportIconClasses = ClassNames('Header__exportIcon', {
      panel,
      disabled: parentTabClosed,
    });
    const dropdownMenuClasses = ClassNames('Header__dropdownMenu', { panel });

    const parentTabClosedText = 'Parent tab has been closed and data will not be updated. Please start a new session.';

    return (
      <Navbar className="Header d-flex justify-content-between">
        <div className="d-flex align-items-center">
          <Navbar.Brand className={logoClasses}>
            <img
              alt="Insights by Ghostery Icon"
              src={[chrome.extension.getURL('dist/images/logo-icons/insights-white-text-beta.svg')]}
            />
          </Navbar.Brand>
          {children}
        </div>
        {freeTrial && this._renderFreeTrialNotification()}
        <div className="d-flex align-items-center">
          {parentTabClosed && (
            <p className="Header__parentTabClosedText">{parentTabClosedText}</p>
          )}
          <LiveFreezeToggle panel={panel} disabled={parentTabClosed} />
          <OverlayTrigger
            container={tooltipRef}
            placement="bottom"
            overlay={(
              <Tooltip className="tooltipLeft">
                Export tracker list (CSV) and raw page data/settings (JSON)
              </Tooltip>
            )}
            delay={{ show: 500 }}
          >
            <svg
              className={exportIconClasses}
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="20"
              onClick={() => {
                messageCreators.downloadDataFiles();
                messageCreators.sendMetrics({
                  type: 'export_data',
                  insightsView: panel ? '0' : '1',
                });
              }}
            >
              <path fill="#FFF" d="M9.9 3.233v9.061c0 .522-.4.944-.9.944-.497 0-.9-.423-.9-.944V3.23L7.083 4.298a.864.864 0 0 1-1.266-.006.98.98 0 0 1-.006-1.332L8.368.274A.864.864 0 0 1 8.996 0l.006.003c.229 0 .456.091.627.27l2.557 2.687a.973.973 0 0 1-.005 1.332.87.87 0 0 1-1.267.006L9.9 3.233zm-8.1 14.26h14.4V10.87c0-.52.4-.941.9-.941.497 0 .9.424.9.94v7.574c0 .26-.1.495-.262.666a.881.881 0 0 1-.637.276H.9a.875.875 0 0 1-.634-.275.97.97 0 0 1-.265-.667V10.87c0-.52.4-.941.9-.941.497 0 .9.424.9.94v6.624z" />
            </svg>
          </OverlayTrigger>
          <Dropdown
            alignRight
            onToggle={(openSettings) => {
              this.toggleDropdown(openSettings);
              if (openSettings) {
                messageCreators.sendMetrics({
                  type: 'open_settings_panel',
                  insightsView: panel ? '0' : '1',
                });
              }
            }}
            onClick={e => e.stopPropagation()}
            show={this._showDropdown()}
          >
            <Dropdown.Toggle as={MoreDropdownToggle} />
            {!isPageNotScanned && (
              <Dropdown.Menu className={dropdownMenuClasses}>
                <Settings closeDropdown={() => this.toggleDropdown(false)} panel={panel} />
              </Dropdown.Menu>
            )}
          </Dropdown>
        </div>
      </Navbar>
    );
  }
}

Header.propTypes = {
  panel: PropTypes.bool,
  children: PropTypes.element,
  tooltipRef: PropTypes.instanceOf(PropTypes.element),
  userInfo: PropTypes.shape({
    signedIn: PropTypes.bool.isRequired,
    insightsUser: PropTypes.bool.isRequired,
    freeTrial: PropTypes.bool.isRequired,
    freeTrialDaysRemaining: PropTypes.number.isRequired,
  }).isRequired,
  messageCreators: PropTypes.shape({
    downloadDataFiles: PropTypes.func.isRequired,
    sendMetrics: PropTypes.func.isRequired,
    subscribe: PropTypes.func.isRequired,
  }).isRequired,
  parentTabClosed: PropTypes.bool,
  isPageNotScanned: PropTypes.bool.isRequired,
};

Header.defaultProps = {
  panel: false,
  children: null,
  tooltipRef: null,
  parentTabClosed: false,
};

export default Header;
