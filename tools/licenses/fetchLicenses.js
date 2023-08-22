/* eslint import/no-extraneous-dependencies: 0 */
/* eslint no-console: 0 */

// dependencies
const jsonfile = require('jsonfile');
const checker = require('license-checker');
const fs = require('fs-extra');

// Build list of licenses
checker.init({
  start: '.',
  direct: true, // get top-level only
  customPath: 'licenseTemplate.json',
}, (err, licenseJSON) => {
  if (err) {
    console.error('License Fetcher error:', err);
  } else {
    const output = [];
    const packageNames = [];
    const { dependencies, devDependencies } = jsonfile.readFileSync('./package.json');
    const allDependencies = {
      ...dependencies,
      ...devDependencies,
    };

    // Get all top-level dependencies from package.json (except browser-core)
    Object.keys(allDependencies).forEach((packageName) => {
      const packagePath = `./node_modules/${packageName}/package.json`;
      if (fs.pathExistsSync(packagePath)) {
        const { name, version } = jsonfile.readFileSync(packagePath);
        if (name && version) {
          packageNames.push(`${name}@${version}`);
        }
      }
    });

    // Compare package.json dependencies against licenses found in node_modules
    Object.keys(licenseJSON).forEach((packageName) => {
      if (packageNames.indexOf(packageName) !== -1) {
        // TODO: customPath option for 'license-checker' is broken so we have to manually
        // build the output
        output.push({
          name: packageName,
          repository: licenseJSON[packageName].repository,
          licenses: licenseJSON[packageName].licenses,
          publisher: licenseJSON[packageName].publisher,
          url: licenseJSON[packageName].url,
          email: licenseJSON[packageName].email,
          licenseText: licenseJSON[packageName].licenseText,
        });
      }
    });
    jsonfile.writeFileSync('./tools/licenses/licenses.json', output);
  }
});
