import React from 'react';
import PropTypes from 'prop-types';
import Navbar from 'react-bootstrap/Navbar';
import './PageNotScannedOverlay.scss';

const PageNotScannedOverlay = (props) => {
  const { isPageNotScanned } = props;
  const logoUrlRoot = 'dist/images/logo-icons';
  const pageNotScannedIcon = `${logoUrlRoot}/icon_pageNotScanned.svg`;
  const logoIcon = `${logoUrlRoot}/insights-white-text-beta.svg`;
  const ui = {
    logoIcon: {
      src: chrome.extension.getURL(logoIcon),
      alt: 'Insights by Ghostery Icon',
    },
    pageNotScannedIcon: {
      src: chrome.extension.getURL(pageNotScannedIcon),
      alt: 'Page not scanned',
    },
    header: { copy: 'Oh dear, nothing to uncover here.' },
    text: { copy: 'This is a non-website, which means Ghostery Insights can\'t analyze it. Head to a real webpage, then give us another go.' },
    subtext: { copy: 'Need some help?' },
    link: { copy: 'Reach out to Support' },
  };

  return (
    <React.Fragment>
      {isPageNotScanned && (
        <div className="PageNotScannedOverlay">
          <div className="PageNotScannedOverlay__container d-flex align-items-center flex-column">
            <Navbar.Brand
              href="https://www.ghostery.com/products/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={ui.logoIcon.src}
                alt="Insights by Ghostery Icon"
              />
            </Navbar.Brand>
            <div>
              <img
                src={ui.pageNotScannedIcon.src}
                className="PageNotScannedOverlay__image"
                alt={ui.pageNotScannedIcon.alt}
              />
              {ui.header.copy && (
                <div className="PageNotScannedOverlay__header">
                  {ui.header.copy}
                </div>
              )}
              <div className="PageNotScannedOverlay__text">
                {ui.text.copy}
              </div>
              <div className="PageNotScannedOverlay__subText">
                {ui.subtext.copy}
                {' '}
                <a
                  className="PageNotScannedOverlay__link"
                  href="mailto: support-insights@ghostery.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Reach out to Support
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

PageNotScannedOverlay.propTypes = {
  isPageNotScanned: PropTypes.bool.isRequired,
};

export default PageNotScannedOverlay;
