import fs from 'fs/promises';

import axios from 'axios';
import semver from "semver";

const ARTIFACTORY_AUTHORIZATION_VALUE = 'Basic cmNkdXNlcjE6ZUFFTGgqNmo3aGJCZDgyYXFobnk0NSFA';
export const INTEGRATION_YAML_FILE_URL = "https://arm.seli.gic.ericsson.se/artifactory/proj-enm-dev-internal-helm/eric-enm-integration-csar-values/";
export const DEPLOYMENT_SIZE_MAPPING = {
  extraLarge: "eric-enm-integration-extra-large-production-values",
  small: "eric-enm-integration-production-values",
  singleInstance: "eric-enm-single-instance-production-integration-values",
  multiInstance: "eric-enm-multi-instance-functional-integration-values"
};

/**
 * Check that the SED lines are parseable into a {key: value} object,
 * which roughly corresponds to checking that the lines look like these formats ...:
 *
 *   key=value
 * or
 *   key=
 *
 * ... but see corner cases below.
 *
 *
 * These should be considered valid lines by the regex:
*   # Some valid comment
*     ##  Some more valid comment
*   key  =    value
*   key =   some_string_witoutSpaces
*   key= string with spaces
*   key=
*   key=value
*   key==
*   key= =
*      key with spaces=value
*      key with spaces =  value=
*   key=value=morestring
 *
 * These should be considered invalid lines by the regex:
 *  key
 *    // A line commented wrongly
 *  =value
 *  = value
 *  ==value
 *    =  value
 *   = = value
 *
 * @param {string} inputString - Multiline string representation of a pENM SED
 * @returns {Array} - Array of lines that do not pass the regex check
 */
export function validateSEDString(inputString) {
  const SEDStringUnparseableLineArray = [];
  const validationRegex = '^[\\s\\t]*[^\\s\\t=]+.*=.*$';
  inputString
      .split(/\r?\n/)
      .filter(line => line.trim() !== '')
      .filter(line => !line.trim().startsWith('#'))
      .forEach((line) => {
        if (!RegExp(validationRegex).test(line)) {
          SEDStringUnparseableLineArray.push(line);
        }
  });
  return SEDStringUnparseableLineArray;
}

/**
 * Generate an Object representing a pENM SED from a string of lines
 *
 * @param {string} inputString - Multiline string representation of a pENM SED
 * @returns {Object} - Flat {key: value} object representing a pENM SED
 */
export function getpENMSEDObjectFromString(inputString) {
  const obj = {};
  inputString
      .split(/\r?\n/)
      .filter(line => line.trim() !== '')
      .filter(line => !line.trim().startsWith('#'))
      .forEach((line) => {
        const index = line.indexOf('=');
        if (index !== -1) {
          const key   = line.substring(0, index);
          const value = line.substring(index + 1);
          obj[key.trim()] = value.trim();
        }
      });
  return obj;
}

/**
 * Check if the given IP version pair is valid
 *
 * @param {string} sedIpVersion - IP version on the SED input file
 * @param {string} finalIpVersion - IP version received as upgrade parameter
 * @returns {boolean} - Result of the validation
 */
export function isIpVersionPairValid(sedIpVersion, finalIpVersion) {
  return ((finalIpVersion === 'dual') || (sedIpVersion === finalIpVersion));
}

/**
 * Given error message return error message based on the status code
 *
 * @param {Object} req - HTTP request object
 * @param {Object} error - HTTP Error received
 * @returns {Object} - HTTP response object. Response with error code with an object contains key of success and message of the error
 */
export function returnErrorResponse(res, error) {
  if (error.response === undefined) {
    return res.status(400).json({success: false, message: "Server error"})
  } else if (error.response.status === undefined) {
    return res.status(400).json({success: false, message: "Server error"})
  } else if(error.response.status === 404) {
    return res.status(404).json({success: false, message: "Not Found!"});
  } else if (error.code === 'ECONNABORTED') {
    return res.status(408).json({success: false, message: "Request timed out!"});
  }
  return res.status(400).json({success: false, message: "There was an error!", error: error});
}

/**
 * Load supported products from file
 *
 * @returns {Array} - Array of supported product strings
 * @async
 */
export async function loadProductsFromFile() {
 const data = await fs.readFile('./res/data/products.json', {cache: 'no-store'});
 return JSON.parse(data);
}

/**
 * Load data from pENM versions file
 *
 * @returns {Object} - JSON object contains the versions
*/
export async function loadVersionFile(product, external) {
  let data;
  if (external) {
    data = await fs.readFile('./res/data/' + product + '/externalVersions.json', {cache: 'no-store'});
  } else {
    data = await fs.readFile('./res/data/' + product + '/internalVersions.json', {cache: 'no-store'});
  }
  return JSON.parse(data);
}

/**
 * Load data from releases file
 *
 * @returns {Object} - JSON object contains the reeases
*/
export async function loadReleaseFile() {
  const data = await fs.readFile('./res/data/releases.json', {cache: 'no-store'});
  return JSON.parse(data);
}

/**
 * Write an object(new version) into versions file
 *
 * The versions file has been updated with the new version, or an error has been thrown
*/
export function updateVersionFile(versionsObject, product, external) {
  if (product === "pENM"){
    versionsObject.sort((a, b) => semver.rcompare(a.version, b.version));
  }
  else {
    versionsObject.sort((a, b) => semver.rcompare(a.normalisedVersion, b.normalisedVersion));
  }
  let jsonContent = JSON.stringify(versionsObject, null, 2);
  let versionsFilePath;
  if (external) {
    versionsFilePath = "./res/data/" + product + "/externalVersions.json";
  } else {
    versionsFilePath = "./res/data/" + product + "/internalVersions.json";
  }
  fs.writeFile(versionsFilePath, jsonContent, (error) => {
    if (error) {
      console.error(error);     // logging the error
      throw error;             // throwing the error in case of a writing problem
    }
  });
}

/**
 * Fetches a test schema from the specified URL, falling back to a default schema if the file does not exist.
 * @param {string} url - The URL of the schema file.
 * @param {string} product - The product for selected schema.
 * @returns {Promise<Response>} A Promise that resolves to the response object representing the schema file.
 */
export async function fetchTestSchema(url, product) {
  product = product.toLowerCase();
  let testUrl = "http://localhost:3000/schema/test/" + product + "/";
  var urlSegments = url.split(product + '/');
  let filename = urlSegments[urlSegments.length - 1];
  await fetch(testUrl + filename, {method: "HEAD"}) // Check if file exists
    .then(async (res) => {
      if (!res.ok) {
        filename = "ui_test_schema.json"
      }
    });
  return fetch(testUrl + filename, {cache: "no-store"});
}

/**
 * downloadSchema - This function uDownloads the schema from the specified URL
 *                - If NODE_ENV is set to "test" the ui_test_schema.json will be returned.
 *
 * @param {string} url  The URL to the schema
 * @param {string} apiUrl  The SED API URL
 */
export async function downloadSchema(url, apiUrl, product) {
  try {
    if (process.env.NODE_ENV === "test") {
      // Front end tests set NODE_ENV to 'test' to use local test schemas
      const response = await fetchTestSchema(url, product);
      return await response.json();
    } else {
      const response = await axios.post(apiUrl + "extapi/schema", {
        params: { link: url },
      });
      return response.data;
    }
  } catch (error) {
    console.error("There was an error downloading the schema!", error);
  }
}

/**
 * downloadSchemaDirectly
 *   - This function uDownloads the schema from the specified URL directly,
 *   without making a call to the internal API
 *   - If NODE_ENV is set to "test" the ui_test_schema.json will be returned.
 *
 * @param {string} url - The URL to the schema
 * @param {string} product - The product for selected schema.
 */
export async function downloadSchemaDirectly(url, product) {
  try {
    if (process.env.NODE_ENV === "test") {
      // Front end tests set NODE_ENV to 'test' to use local test schema
      const response = await fetchTestSchema(url, product);
      return await response.json();
    } else {
      const serverTimeout = 5000;
      const response = await axios.get(url, {timeout: serverTimeout})
      return response.data;
    }
  } catch (error) {
    console.error("There was an error downloading the schema!");
    console.error(error);
    return null;
  }
}

/**
 * downloadIntegrationYaml
 *   - This function Downloads the Integration Yaml from the specified URL,
 *
 * @param {string} url - The URL to the integration yaml
 */
export async function downloadIntegrationYaml(SED_API_URL, url) {
  try {
      const response = await axios.post(SED_API_URL + "extapi/integrationyaml", {
        params: { link: url },
      });
      return response.data;
  } catch (error) {
    console.error("There was an error downloading the integration yaml!");
    console.error(error);
    return null;
  }
}

/**
 * getCloudNativeProductSetContent
 *   - This function gets the contents of a given product set,
 *
 * @param {string} sprintVersion - The sprint version number
 * @param {string} version - The sprint version build number
 */
export async function getCloudNativeProductSetContent(sprintVersion, version) {
  try {
      let cpi_url = "https://ci-portal.seli.wh.rnd.internal.ericsson.com/api/cloudnative/getCloudNativeProductSetContent/" + sprintVersion + "/" + version + "/";
      const serverTimeout = 5000;
      const response = await axios.get(cpi_url, {timeout: serverTimeout})
      return response.data;
  } catch (error) {
    console.error("There was an error downloading the product set contents!");
    console.error(error);
    return null;
  }
}

/**
 * Find a file in the Artifactory repo
 *
 * @param {string} baseUrl - Base URL of SED file
 * @param {string} repoName - RName of the repo in Artifactory
 * @param {string} searchPath - Path to search for file in the repo
 * @param {string} fileName - Name of file to look for
 * @returns {object} - ENM SED
 */
export async function findFileInArtifactoryRepo(baseUrl, repoName, searchPath, fileName){
  const url = baseUrl + '/artifactory/api/search/aql';
  const headers = {
    headers: {
    'Content-Type': 'text/plain',
    'Authorization': ARTIFACTORY_AUTHORIZATION_VALUE
    },
  };
  const data = `items.find({
    "repo": {"$eq": "${repoName}"},
    "path": {"$match": "${searchPath}"},
    "name": {"$eq": "${fileName}"}
  })`;
  return new Promise((resolve, reject) => {
    axios.post(url, data, headers)
      .then(response => {
        resolve(response.data.results);
      })
      .catch(error => {
        console.error(error);
        reject(error);
      });
  });
};

/**
 * normalizeProductSetVersion
 * This function normalize a product set version.
 *
 * @param {string} version - The Version to be normalized
 */
export function normalizeProductSetVersion(version) {
  const parts = version.split("-");
  const versionNumbers = parts[0];
  const suffix = parts.length > 1 ? "-" + parts.slice(1).join("-") : "";

  // Process each part of the version number.
  const formattedVersionNumbers = versionNumbers.split(".")
      .map((p, i) => (i === 0 ? p : parseInt(p, 10)))
      .join(".");

  // Reattach the suffix.
  return formattedVersionNumbers + suffix;
}

/**
 * This function gets the Rstate for a product version and updates the version.json file with a given release.
 *
 * @param {string} version - The ENM Version
 *
 * @param {string} product - The product name cENM/pENM
 *
 * @param {string} schemaVersion - The Schema Version number
 *
 * @param {string} sprintVersion - The Version to be normalized
 *
 * @param {string} releaseNumber - The release number
 *
 * @param {object} externalVersionsObject - Object containing existing external versions in externalVersion.js
 *
 * @param {object} internalVersionsObject - Object containing existing internal versions in internalVersion.js
 *
 * @param {Object} res - HTTP response object
 *
 * @param {string} versionsList - The Version list
 *
 */
export async function addReleaseProductSet(version, product, schemaVersion, sprintVersion, releaseNumber, externalVersionsObject, internalVersionsObject, res, versionsList) {
  axios.get('https://ci-portal.seli.wh.rnd.internal.ericsson.com/getAOMRstate/?product=ENM&drop=' + sprintVersion)
    .then((response) => {
      if (!response.data.includes("Error")) {
        let rState = response.data.split(" ").pop();
        const index = rState.indexOf('/');
        if (index > -1) {
          rState = rState.substring(0, index) + " IP" + rState.substring(index + 1);
        }
        console.log(`Adding [${version} (${rState})]`);
        let newVersionObject = {
          name: rState,
          schemaVersion,
          targetAudience: "cu",
          version: normalizeProductSetVersion(version),
          sprintVersion,
          releaseNumber,
          release: true,
        }
        let newVersionObjectInternal = {
          name: version + " (" + rState + ")",
          schemaVersion,
          targetAudience: "pdu",
          version: normalizeProductSetVersion(version),
          sprintVersion,
          releaseNumber,
          release: true,
        }
        if (product === "cENM"){
          newVersionObjectInternal.normalisedVersion = normalizeProductSetVersion(version);
          newVersionObject.normalisedVersion = normalizeProductSetVersion(version);
          newVersionObjectInternal.version = version;
          newVersionObject.version = version;
        }
        let logMessage;
        if (versionsList.includes(rState)) {
          externalVersionsObject = externalVersionsObject.filter(externalVersionsObject => !externalVersionsObject.name.includes(rState))
          externalVersionsObject.push(newVersionObject);
          internalVersionsObject = internalVersionsObject.filter(internalVersionsObject => !internalVersionsObject.name.includes(rState))
          internalVersionsObject.push(newVersionObjectInternal);
          logMessage = `Version [${version} (${rState})] was updated successfully!`;
        } else {
          externalVersionsObject.push(newVersionObject);
          internalVersionsObject.push(newVersionObjectInternal);
          logMessage = `Version [${version} (${rState})] was added successfully!`;
        }
        if (product === "cENM"){
          updateVersionFile(externalVersionsObject.filter(x => semver.gt(x.normalisedVersion, normalizeProductSetVersion(version)) || x.release), product, true);
          updateVersionFile(internalVersionsObject.filter(x => semver.gt(x.normalisedVersion, normalizeProductSetVersion(version)) || x.release), product, false);
        }
        else {
          updateVersionFile(externalVersionsObject.filter(x => semver.gt(x.version, normalizeProductSetVersion(version)) || x.release), product, true);
          updateVersionFile(internalVersionsObject.filter(x => semver.gt(x.version, normalizeProductSetVersion(version)) || x.release), product, false);
        }
        console.log(logMessage);
        return res.status(200).json({success: true, message: logMessage, result: response.data});
      } else {
        const logMessage = `An error has occurred or the version [${version}] is not found!`;
        console.log(logMessage)
        return res.status(400).json({success: false, message: logMessage, result: response.data});
      }
    }).catch(error => {
      const logMessage = `An error has occurred or the version is not found!`;
      console.log(logMessage)
      return res.status(400).json({success: false, message: logMessage, result: error});
  });
}


/**
 * This function updates the version.json file with a given sprint version.
 *
 * @param {string} version - The ENM Version
 *
 * @param {string} product - The product name cENM/pENM
 *
 * @param {string} schemaVersion - The Schema Version number
 *
 * @param {string} sprintVersion - The Version to be normalized
 *
 * @param {string} releaseNumber - The release number
 *
 * @param {object} versionsObject - Object containing existing versions in version.js
 *
 * @param {Object} results - result object
 *
 * @param {Object} res - HTTP response object
 */
export async function addInternalProductSet(version, product, schemaVersion, sprintVersion, releaseNumber, versionsObject, results, res) {
  let newVersionObject ={
    name: version,
    schemaVersion,
    targetAudience: "pdu",
    version: normalizeProductSetVersion(version),
    sprintVersion,
    releaseNumber,
    release: false
  }
  if (product === "cENM"){
    newVersionObject.normalisedVersion =  normalizeProductSetVersion(version);
    newVersionObject.version =  version;
  }
  const existingVersionIndex = versionsObject.findIndex(obj => obj.schemaVersion === schemaVersion && !obj.release);
  if (existingVersionIndex !== -1 && versionsObject[existingVersionIndex].sprintVersion === sprintVersion) {
    if (product === "pENM") {
      if (versionsObject[existingVersionIndex].version === normalizeProductSetVersion(version)) {
        const logMessage = `ENM product set [${version}] already exists nothing to do!`;
        console.log(logMessage)
        return res.status(200).json({success: true, message: logMessage, result: results});
      }
    } else {
      if (versionsObject[existingVersionIndex].version === version) {
        const logMessage = `ENM product set [${version}] already exists nothing to do!`;
        console.log(logMessage)
        return res.status(200).json({success: true, message: logMessage, result: results});
      }
    }
    versionsObject[existingVersionIndex] = newVersionObject;
    updateVersionFile(versionsObject, product, false);
    const logMessage = `Updated existing ENM schema version [${schemaVersion}] with product set [${version}] successfully!`;
    console.log(logMessage)
    return res.status(200).json({success: true, message: logMessage, result: results});
  } else {
      versionsObject.push(newVersionObject);
      await updateVersionFile(versionsObject, product, false);
      const logMessage = `ENM product set [${version}] was added successfully!`;
      console.log(logMessage)
      return res.status(200).json({success: true, message: logMessage, result: results});
  }
}

/**
 * This function checks for duplication in SED IPs or duplication with exclusion IPs.
 *
 * @param {boolean} preventDuplicates - Flag to check for duplicates
 *
 * @param {string} inputSEDValue - The SED value for specific key
 *
 * @param {string} keyName - The SED key name
 *
 * @param {Array} exclusionIps - The array of exclusion IPs to be checked for duplication
 *
 * @param {Array} usedValuesToCheckForDuplicates - The array of IPs to be checked
 *
 * @param {Array} duplicatedKeyValues - The array of duplicatedKeyValues
 *
 * @param {Array} duplicatedKeyValuesInExclusionIps - The array of duplicatedKeyValuesInExclusionIps
 *
 * @returns {boolean} - Return true if the input SED does not have duplicated values based on the value of preventDuplicates argument
 */
export function checkForDuplicates(preventDuplicates, inputSEDValue, keyName, exclusionIps, usedValuesToCheckForDuplicates, duplicatedKeyValues, duplicatedKeyValuesInExclusionIps) {
  let isInputSEDValid = true;
  if (usedValuesToCheckForDuplicates[inputSEDValue].length > 1) {
    if (usedValuesToCheckForDuplicates[inputSEDValue]) {
      const uniqueKeys = [...new Set(usedValuesToCheckForDuplicates[inputSEDValue])];
      uniqueKeys.forEach(key => {
        if (!duplicatedKeyValues.some(item => item.keyName.toLowerCase() === key.toLowerCase() && item.keyValue.toLowerCase() === inputSEDValue)) {
          duplicatedKeyValues.push({keyName: key, keyValue: inputSEDValue});
        }
      });
    }
    isInputSEDValid = false;
  }
  if (exclusionIps.length > 0) {
    const occurrenceExclusionIp = exclusionIps.filter(value => value === inputSEDValue).length;
    if (occurrenceExclusionIp > 0) {
      duplicatedKeyValuesInExclusionIps.push({keyName: keyName, keyValue: inputSEDValue});
      isInputSEDValid = false;
    }
  }
  return isInputSEDValid;
}