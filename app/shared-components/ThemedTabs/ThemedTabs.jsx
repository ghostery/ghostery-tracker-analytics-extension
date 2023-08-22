import React, { Component } from 'react';
import Tab from 'react-bootstrap/Tab';
import Nav from 'react-bootstrap/Nav';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';

import './ThemedTabs.scss';

class ThemedTabs extends Component {
  constructor(props) {
    super(props);

    this.state = { activeKey: this.setActiveKey() };
  }

  componentDidMount() {
    window.addEventListener('hashchange', this.handleHashChange, false);
  }

  componentWillUnmount() {
    window.removeEventListener('hashchange', this.handleHashChange, false);
  }

  handleHashChange = () => {
    const { passedSelectHandler } = this.props;
    const activeKey = this.setActiveKey();
    this.setState({ activeKey });
    if (!passedSelectHandler) { return; }
    passedSelectHandler(activeKey);
  }

  setActiveKey = () => {
    const hashParams = window.location.hash.split('tab=');
    if (hashParams.length === 0 || hashParams[0].length === 0) { return 1; }
    return hashParams[1][0];
  }

  tabSelectHandler = (selectedKey) => {
    const { hash } = window.location;
    window.location.hash = hash.replace(/(tab=.)/, `tab=${selectedKey}`);
  }

  _renderNavItem(tab, tabKey, tabClassNames, isLastOne) {
    const { activeKey } = this.state;

    const navLinkClassNames = ClassNames(
      'ThemedTabs__tabNavLink',
      { inLastTab: isLastOne },
    );

    const navLinkLabelClassNames = ClassNames(
      'ThemedTabs__tabLabel',
      {
        inActiveTab: tabKey === parseInt(activeKey, 10),
        inLastTab: isLastOne,
      },
    );

    return (
      <Nav.Item
        className={tabClassNames}
        key={tab.title}
      >
        <Nav.Link
          className={navLinkClassNames}
          eventKey={tabKey}
          active={tabKey === parseInt(activeKey, 10)}
        >
          <div className={navLinkLabelClassNames}>
            {tab.title}
          </div>
        </Nav.Link>
      </Nav.Item>
    );
  }

  _renderNavItems(tabs) {
    const tabClassNames = ClassNames(
      'ThemedTabs__tab',
      'd-flex',
      'justify-content-center',
      'align-items-center',
    );

    return (tabs.map((tab, i) => (
      this._renderNavItem(tab, i + 1, tabClassNames, i === tabs.length - 1)))
    );
  }

  render() {
    const { tabs, altTabs, stickyNavItems, mountOnEnter } = this.props;
    const { activeKey } = this.state;

    const tabsContainer = ClassNames({
      'ThemedTabs--reg': !altTabs,
      'ThemedTabs--alt': altTabs,
    });
    const tabsSelection = ClassNames('d-flex', {
      'justify-content-end': altTabs,
      themedTabsStickyPosition: stickyNavItems && activeKey === '2',
    });

    return (
      <div className={tabsContainer}>
        <Tab.Container
          className="ThemedTabs__tab"
          activeKey={activeKey}
          onSelect={this.tabSelectHandler}
          mountOnEnter={mountOnEnter}
          unmountOnExit
        >
          <div className={tabsSelection}>
            {!altTabs && <div className="ThemedTabs__whiteLine flex-grow-1" />}
            <Nav>
              {this._renderNavItems(tabs)}
            </Nav>
            {!altTabs && <div className="ThemedTabs__whiteLine flex-grow-1" />}
          </div>
          <Tab.Content>
            {tabs.map((tab, i) => (
              <Tab.Pane
                key={tab.title}
                eventKey={i + 1}
                active={`${i + 1}` === activeKey}
              >
                {React.cloneElement(tab.view, { active: `${i + 1}` === activeKey })}
              </Tab.Pane>
            ))}
          </Tab.Content>
        </Tab.Container>
      </div>
    );
  }
}

ThemedTabs.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    view: PropTypes.element.isRequired,
  })).isRequired,
  altTabs: PropTypes.bool,
  stickyNavItems: PropTypes.bool,
  passedSelectHandler: PropTypes.func,
  mountOnEnter: PropTypes.bool,
};

ThemedTabs.defaultProps = {
  altTabs: false,
  stickyNavItems: false,
  passedSelectHandler: null,
  mountOnEnter: false,
};

export default ThemedTabs;
