/**
 * @namespace LicenseClasses
 */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import './License.scss';

/**
 * @class Handles license entry on internal licenses.html page
 * which displays licenses for all third-party packages used by Ghostery
 * @memberOf  LicenseClasses
 */
class License extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
    };
  }

  /**
   * Toggle expansion of a license full text.
   */
  toggleLicenseText = () => {
    const { expanded } = this.state;
    this.setState({ expanded: !expanded });
  }

  /**
   * Render single license entry.
   * @return {ReactComponent}   ReactComponent instance
   */
  render() {
    const { license, isLastItem } = this.props;
    const {
      name,
      repository,
      licenses,
      publisher,
      url,
      email,
      licenseText,
    } = license;
    const { expanded } = this.state;

    const hasInfo = {
      name: typeof (name) !== 'undefined',
      repository: typeof (repository) !== 'undefined',
      licenses: typeof (licenses) !== 'undefined',
      publisher: typeof (publisher) !== 'undefined',
      url: typeof (url) !== 'undefined',
      email: typeof (email) !== 'undefined',
      licenseText: typeof (licenseText) !== 'undefined',
    };

    return (
      <Fragment>
        <div className="License">
          {hasInfo.name && <div>{`Module: ${name}`}</div>}
          {hasInfo.repository && (
            <div>
              <span>Repository: </span>
              <a className="License__link" href={repository} target="_blank" rel="noopener noreferrer">
                <span>
                  {repository}
                </span>
              </a>
            </div>
          )}
          {hasInfo.licenses && <div>{`License type(s): ${licenses}`}</div>}
          {hasInfo.publisher && <div>{`Publisher: ${publisher}`}</div>}
          {hasInfo.url && <div>{`Url: ${url}`}</div>}
          {hasInfo.email && <div>{`Email: ${email}`}</div>}
          {hasInfo.licenseText && (
            <div>
              <div className="License__textToggle" onClick={this.toggleLicenseText}>
                License Text
              </div>
              {
                expanded && (
                  <div className="License__text">
                    {licenseText}
                  </div>
                )
}
            </div>
          )}
        </div>
        {!isLastItem && <div className="License__hr" />}
      </Fragment>
    );
  }
}

License.propTypes = {
  license: PropTypes.shape({
    name: PropTypes.string.isRequired,
    repository: PropTypes.string,
    licenses: PropTypes.string.isRequired,
    publisher: PropTypes.string,
    email: PropTypes.string,
    licenseText: PropTypes.string,
    url: PropTypes.string,
  }).isRequired,
  isLastItem: PropTypes.bool.isRequired,
};

export default License;
