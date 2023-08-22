import React, { Component } from 'react';
import ClassNames from 'classnames';
import cloneDeep from 'lodash.clonedeep';

import glossaryText from './glossaryText.json';
import './Glossary.scss';

class Glossary extends Component {
  constructor(props) {
    super(props);

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const alphabeticalIndex = [];
    alphabet.split('').forEach((letter) => {
      alphabeticalIndex.push({ letter, firstWord: null, ref: null });
    });

    const sortedGlossaryTerms = Object.keys(glossaryText).sort((a, b) => {
      if (a.toLowerCase() < b.toLowerCase()) { return -1; }
      if (a.toLowerCase() > b.toLowerCase()) { return 1; }
      return 0;
    });

    let termIdx = 0;
    for (let letterIdx = 0; letterIdx < alphabeticalIndex.length; letterIdx++) {
      const indexItem = alphabeticalIndex[letterIdx];
      while (sortedGlossaryTerms[termIdx]
      && sortedGlossaryTerms[termIdx][0].toUpperCase() === indexItem.letter) {
        if (!indexItem.firstWord) { indexItem.firstWord = sortedGlossaryTerms[termIdx]; }
        termIdx++;
      }
    }

    this.state = {
      alphabeticalIndex,
      sortedGlossaryTerms,
      currentSection: 0,
      sectionScrollPoints: [],
    };
  }

  componentDidMount() {
    const { alphabeticalIndex } = this.state;
    const alphabeticalIndexCopy = cloneDeep(alphabeticalIndex);
    alphabeticalIndexCopy.forEach((indexItem) => {
      if (indexItem.firstWord) { indexItem.ref = this[indexItem.firstWord]; }
    });
    this.setState({ alphabeticalIndex: alphabeticalIndexCopy }, this.addScrollPoints);
    this.contentRef.addEventListener('scroll', this.handleScroll);
  }

  addScrollPoints = () => {
    const { alphabeticalIndex } = this.state;
    const newSectionScrollPoints = [];
    alphabeticalIndex.forEach((indexItem) => {
      if (indexItem.firstWord) {
        newSectionScrollPoints.push({
          letter: indexItem.letter,
          scrollRef: indexItem.ref,
        });
      }
    });
    this.setState({ sectionScrollPoints: newSectionScrollPoints });
  }

  handleScroll = () => {
    const { currentSection, sectionScrollPoints } = this.state;

    if (this.contentRef.scrollTop < sectionScrollPoints[currentSection].scrollRef.offsetTop - 10) {
      if (currentSection === 0) { return; }
      this.setState({ currentSection: currentSection - 1 });
    } else if (sectionScrollPoints[currentSection + 1]
    && this.contentRef.scrollTop
    >= sectionScrollPoints[currentSection + 1].scrollRef.offsetTop - 10) {
      this.setState({ currentSection: currentSection + 1 });
    }
  }

  renderLetterIndex = () => {
    const { currentSection, sectionScrollPoints, alphabeticalIndex } = this.state;

    const scrollToFirstMatch = (ref) => {
      if (!ref) { return; }
      ref.scrollIntoView({ behavior: 'smooth' });
    };

    return (
      alphabeticalIndex.map((indexItem) => {
        const indexItemClasses = ClassNames('Glossary__indexItem', 'd-flex', 'justify-content-center', {
          active: indexItem.firstWord,
          current: sectionScrollPoints[currentSection]
          && sectionScrollPoints[currentSection].letter === indexItem.letter,
        });
        return (
          <p
            className={indexItemClasses}
            onClick={() => scrollToFirstMatch(indexItem.ref)}
            key={indexItem.letter}
          >
            {indexItem.letter}
          </p>
        );
      })
    );
  }

  render() {
    const { sortedGlossaryTerms } = this.state;

    const scrollToDisclaimer = () => {
      this.disclaimerRef.scrollIntoView({ behavior: 'smooth' });
    };

    return (
      <div className="Glossary d-flex">
        <div className="Glossary__header">
          <h2>Glossary of Terms</h2>
          <p>
            Confused about an Insights feature or technical term? Navigate to an entry below to learn more.
          </p>
        </div>
        <div
          className="Glossary__content d-flex"
          ref={(node) => { this.contentRef = node; }}
        >
          <div className="Glossary__index d-flex flex-wrap align-items-start">
            {this.renderLetterIndex()}
          </div>
          <div className="Glossary__entries d-flex flex-column align-items-start">
            {sortedGlossaryTerms.map((term, i) => (
              <div
                className="Glossary__entry"
                ref={(node) => { this[term] = node; }}
                key={term}
              >
                <h2>{term}</h2>
                <p>
                  {glossaryText[term].definition}
                  {glossaryText[term].mdnContent && (
                    <span onClick={scrollToDisclaimer}>*</span>
                  )}
                </p>
                {i === sortedGlossaryTerms.length - 1 ? (null) : (
                  <div className="Glossary__termDivider" />
                )}
              </div>
            ))}
            <div
              className="Glossary__disclaimer d-flex flex-wrap align-items-center justify-content-start"
              ref={(node) => { this.disclaimerRef = node; }}
            >
              {/* https://developer.mozilla.org/en-US/docs/MDN/About#Copyrights_and_licenses */}
              <p>
                *These definitions were pulled from the&nbsp;
                <a
                  href="https://developer.mozilla.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Mozilla Developer Network
                </a>
                &nbsp;website, where the content is licensed under the&nbsp;
                <a
                  href="https://creativecommons.org/licenses/by-sa/2.5/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CC-BY-SA 2.5 license
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Glossary;
