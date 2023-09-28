import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import Tab from 'react-bootstrap/Tab';
import Nav from 'react-bootstrap/Nav';

import Globals from '../../../src/classes/Globals';
import FavoriteTrackersSearch from './FavoriteTrackersSearch';
import './Settings.scss';

const {
  EXTENSION_VERSION,
} = Globals;


class Settings extends Component {
  constructor(props) {
    super(props);
    const { messageCreators } = props;
    this.state = {
      view: 'mainTabs',
      viewLinks: {
        about: [
          { pos: 1, type: 'title', text: 'About' },
          { pos: 2, type: 'text', text: 'Ghostery Insights Beta for Chrome' },
          { pos: 3, type: 'text', text: `Version ${EXTENSION_VERSION}` },
          { pos: 4, type: 'internalLink', text: 'Licenses', handler: messageCreators.openLicenses },
          { pos: 5, type: 'link', text: 'Privacy Policy', link: 'https://www.ghostery.com/about-ghostery/ghostery-plans-and-products-privacy-policy/' },
          { pos: 6, type: 'link', text: 'End-User License Agreement', link: 'https://www.ghostery.com/about-ghostery/ghostery-subscription-products-end-user-license-agreement/' },
          { pos: 7, type: 'link', text: 'Imprint', link: 'https://www.ghostery.com/about-ghostery/imprint/' },
          { pos: 8, type: 'link', text: 'Ghostery Website', link: 'https://www.ghostery.com/' },
        ],
        support: [
          { pos: 1, type: 'title', text: 'Submit a bug', additionalClass: 'Settings--marginTop' },
          { pos: 2, type: 'link', text: 'support-insights@ghostery.com', link: 'mailto:support-insights@ghostery.com', disableTarget: true },
        ],
      },
    };
  }

  handleClickSetView = (view) => {
    this.setState({ view });
  }

  render() {
    const {
      closeDropdown,
      panel,
      messageCreators,
      showBlueBar,
      showToasts,
      isPageNotScanned,
    } = this.props;
    const { view, viewLinks } = this.state;
    const defaultPositionTextClasses = ClassNames(
      'Settings__blueNotificationText',
      { disabled: !showBlueBar },
    );
    const blueBarToggleClasses = ClassNames(
      'Settings__toggle',
      'd-flex',
      'align-items-center',
      { on: showBlueBar },
    );
    const toastsToggleClasses = ClassNames(
      'Settings__toggle',
      'd-flex',
      'align-items-center',
      { on: showToasts },
    );
    const blueBarToggleText = showBlueBar ? 'On' : 'Off';
    const toastToggleText = showToasts ? 'On' : 'Off';
    const displayLinks = viewLinks[view];

    return (
      <React.Fragment>
        {!isPageNotScanned && (
          <div className="Settings">
            {view === 'mainTabs' && (
              <div className="Settings__main d-flex flex-column">
                <img
                  src={[chrome.extension.getURL('dist/images/shared/x-icon.svg')]}
                  className="Settings__closeButton"
                  alt="Star icon"
                  onClick={closeDropdown}
                />
                <div className="Settings__settingsTabsContainer d-flex flex-column justify-content-between">
                  <Tab.Container defaultActiveKey={1}>
                    <div className="Settings__settingsTabs d-flex flex-column">
                      <div className="d-flex">
                        <div className="Settings__blackLine" />
                        <Nav>
                          <Nav.Item key="display">
                            <Nav.Link className="Settings__settingsTab" eventKey={1}>
                              Settings &amp; Help
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item key="favorite">
                            <Nav.Link className="Settings__settingsTab" eventKey={2}>
                              Favorite Trackers
                            </Nav.Link>
                          </Nav.Item>
                        </Nav>
                        <div className="Settings__blackLine" />
                      </div>
                      <Tab.Content className="d-flex flex-column">
                        <Tab.Pane className="Settings__tabPane" key="display" eventKey={1}>
                          <div className="Settings__displaySettingsTabContent d-flex flex-column align-items-start">
                            <div className="Settings__textToggleContainer d-flex justify-content-between align-items-center">
                              <p className="Settings__headerText">Blue Summary Bar</p>
                              <div
                                className={blueBarToggleClasses}
                                onClick={() => messageCreators.toggleBlueBar(!showBlueBar)}
                              >
                                <div className="Settings__toggleSlider" />
                                <div className="Settings__toggleButton" />
                                <p>{blueBarToggleText}</p>
                              </div>
                            </div>
                            <p
                              className={defaultPositionTextClasses}
                              onClick={() => messageCreators.resetBlueBar('default')}
                            >
                              Reset to default position
                            </p>
                            <div className="Settings__textToggleContainer d-flex justify-content-between align-items-center">
                              <p className="Settings__headerText">Pop-Up Notifications</p>
                              <div
                                className={toastsToggleClasses}
                                onClick={() => messageCreators.toggleToasts(!showToasts)}
                              >
                                <div className="Settings__toggleSlider" />
                                <div className="Settings__toggleButton" />
                                <p>{toastToggleText}</p>
                              </div>
                            </div>
                            <div
                              className="Settings__primaryPageLink Settings--smallVerticalMargin"
                              onClick={() => messageCreators.openProductTour()}
                            >
                              Open Product Tour
                            </div>
                            <div
                              className="Settings__primaryPageLink Settings--smallVerticalMargin"
                              onClick={() => messageCreators.openGlossary()}
                            >
                              Open Glossary
                            </div>
                            <a className="Settings__primaryPageLink Settings--smallVerticalMargin" href="https://www.surveymonkey.com/r/2J3P5CG" target="_blank" rel="noopener noreferrer">
                              Give us feedback
                            </a>
                          </div>
                        </Tab.Pane>
                        <Tab.Pane className="Settings__tabPane" key="favorite" eventKey={2}>
                          <FavoriteTrackersSearch panel={panel} />
                        </Tab.Pane>
                      </Tab.Content>
                    </div>
                  </Tab.Container>
                  <div className="Settings__footer d-flex flex-column align-items-start">
                    <div
                      className="Settings__footerSettingContainer d-flex justify-content-start clickable"
                      onClick={() => this.handleClickSetView('about')}
                    >
                      <img
                        alt="About"
                        src={[chrome.extension.getURL('/dist/images/shared/info-icon-settings.svg')]}
                        className="Settings__footerIcon"
                      />
                      <p className="Settings__footerText">About</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {displayLinks && (
              <div className="Settings__secondaryPage">
                <div
                  className="Settings__backButton d-flex align-items-center"
                  onClick={() => this.handleClickSetView('mainTabs')}
                >
                  <img
                    className="Settings__backArrow"
                    alt="Go back to Settings main menu"
                    src={[chrome.extension.getURL('/dist/images/shared/caret-down-dark.svg')]}
                  />
                  <p>Back</p>
                </div>
                <div className="Settings__secondaryPageContent d-flex flex-column align-items-start">
                  {displayLinks.map((linkObj) => {
                    switch (linkObj.type) {
                      case 'title': {
                        const titleClasses = ClassNames(
                          'Settings__secondaryPageTitle',
                          [linkObj.additionalClass],
                        );
                        return (
                          <p key={linkObj.pos} className={titleClasses}>
                            {linkObj.text}
                          </p>
                        );
                      }
                      case 'text': {
                        return (
                          <p key={linkObj.pos} className="Settings--smallVerticalMargin">
                            {linkObj.text}
                          </p>
                        );
                      }
                      case 'link': {
                        return (
                          <a
                            key={linkObj.pos}
                            className="Settings__secondaryPageLink Settings--smallVerticalMargin"
                            href={linkObj.link}
                            target={!linkObj.disableTarget ? '_blank' : undefined}
                            rel="noopener noreferrer"
                          >
                            {linkObj.text}
                          </a>
                        );
                      }
                      case 'internalLink': {
                        return (
                          <p
                            key={linkObj.pos}
                            className="Settings__secondaryPageInternalLink Settings--smallVerticalMargin"
                            onClick={(e) => {
                              e.stopPropagation();
                              linkObj.handler();
                            }}
                          >
                            {linkObj.text}
                          </p>
                        );
                      }
                      default: {
                        return (<div key={linkObj.pos} />);
                      }
                    }
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </React.Fragment>
    );
  }
}

Settings.propTypes = {
  panel: PropTypes.bool,
  closeDropdown: PropTypes.func.isRequired,
  userInfo: PropTypes.shape({
    freeTrial: PropTypes.bool.isRequired,
    email: PropTypes.string.isRequired,
  }).isRequired,
  showBlueBar: PropTypes.bool.isRequired,
  showToasts: PropTypes.bool.isRequired,
  messageCreators: PropTypes.shape({
    toggleBlueBar: PropTypes.func.isRequired,
    resetBlueBar: PropTypes.func.isRequired,
    toggleToasts: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
    sendMetrics: PropTypes.func.isRequired,
    openAccountPage: PropTypes.func.isRequired,
    openProductTour: PropTypes.func.isRequired,
    openGlossary: PropTypes.func.isRequired,
    openLicenses: PropTypes.func.isRequired,
  }).isRequired,
  actions: PropTypes.shape({
    closeToast: PropTypes.func.isRequired,
  }).isRequired,
  isPageNotScanned: PropTypes.bool.isRequired,
};

Settings.defaultProps = {
  panel: false,
};

export default Settings;
