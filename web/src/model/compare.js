import {reactive} from "vue";
import {
  clearReleaseSelection,
  clearSprintSelection,
  clearVersionSelection,
  default_release_select,
  default_select,
  default_sprint_select,
  selectRelease,
  selectSprint,
  selectVersion,
} from "./index.js";
import semver from "semver";
import {normalizeProductSetVersion} from "../utils/utils.js";

export let fromStateComparisonModel = reactive({
  products: [],
  sizes: [],
  allVersions: [],
  versions: [],
  sprints: [],
  releases: [],
  ipVersions: [],
  selectedProduct: default_select,
  selectedUseCase: { alias: 'compare'},
  selectedSize: default_select,
  selectedVersion: default_select,
  selectedSprint: default_sprint_select,
  selectedRelease: default_release_select,
  selectedIpVersion: default_select,
  selectedSchema: default_select,
  schemaForm: [],
  targetAudience: import.meta.env.VITE_APP_ENV_TYPE ? import.meta.env.VITE_APP_ENV_TYPE : 'cu',
  isModelReady: false,
  productVersions: [],
  loadedSchema: {},
  artifactoryRepoData: {},
  response: {},
  displayKeys: [],
  storedSchema: {},
  includePasswords: true,
  unfilteredSprints: [],
});

export let toStateComparisonModel = reactive({
  targetAudience: import.meta.env.VITE_APP_ENV_TYPE ? import.meta.env.VITE_APP_ENV_TYPE : 'cu',
  sizes: [],
  allVersions: [],
  versions: [],
  sprints: [],
  releases: [],
  selectedUseCase: { alias: 'compare'},
  selectedSize: default_select,
  selectedVersion: default_select,
  selectedSprint: default_sprint_select,
  selectedRelease: default_release_select,
  schemaForm: [],
  productVersions: [],
  loadedSchema: {},
  response: {},
  prepared: false,
  displayKeys: [],
  storedSchema: {},
  includePasswords: true,
  allSprints: [],
  allReleases: []
});


/**
 * Get the differences between two schema models.
 *
 * @param {Object} fromModel - The source schema model.
 * @param {Object} comparisonModel - The target schema model for comparison.
 * @returns {Array} An array of schema differences represented as objects with keys and changes.
 */
export function getSchemaDifferences(fromModel, comparisonModel) {
  const fromObject = convertSchemaArrayToObject(fromModel.schemaForm);
  const comparisonObject = convertSchemaArrayToObject(comparisonModel.schemaForm);

  const removedKeys = Object.keys(fromObject).filter(key => !comparisonObject.hasOwnProperty(key));
  const newKeys = Object.keys(comparisonObject).filter(key => !fromObject.hasOwnProperty(key));
  const updatedKeys = findChangedValues(fromObject, comparisonObject);

  let newKeysData = newKeys.map(key => ({ key, change: "New Key" }));
  let removedKeysData = removedKeys.map(key => ({ key, change: "Removed Key" }));
  let updatedKeysData = Object.entries(updatedKeys).map(([key, { oldValue, newValue }]) => ({
    key,
    change: "Updated Key",
    oldValue,
    newValue,
  }));
  newKeysData = addCategoryToKeysData(newKeysData, comparisonObject, fromObject);
  removedKeysData = addCategoryToKeysData(removedKeysData, comparisonObject, fromObject);
  updatedKeysData = addCategoryToKeysData(updatedKeysData, comparisonObject, fromObject);
  return [...newKeysData, ...removedKeysData, ...updatedKeysData];
}

/**
 * Converts an array of schema parameter to an object with keys based on the 'key' property of each schema parameter.
 *
 * @param {Array} schemaArray - An array of schema parameters to be converted.
 * @returns {Object} Returns an object where keys are derived from the 'key' property of each schema parameter,
 *                   and values are filtered objects containing non-undefined and non-empty properties.
 */
export function convertSchemaArrayToObject(schemaArray) {
  return schemaArray.reduce((acc, obj) => {
    const {
      category,
      displayName,
      keys,
      options,
      required,
      keepOptional,
      preventDuplicates,
      type,
      example,
      validationMessage,
      autoPopulate,
      longDescription,
      validationPattern,
      errorMessage,
      alternateKeys,
      displayIf,
      htmlDescription,
      valueMatchesKey
    } = obj;
    const filteredValues = {
      category,
      displayName,
      keys,
      options,
      required,
      keepOptional,
      preventDuplicates,
      type,
      example,
      validationMessage,
      autoPopulate,
      longDescription,
      validationPattern,
      errorMessage,
      alternateKeys,
      displayIf,
      htmlDescription,
      valueMatchesKey
    };
    for (const [prop, value] of Object.entries(filteredValues)) {
      if (value === undefined || value === "") {
        delete filteredValues[prop];
      }
    }
    acc[obj.key] = filteredValues;
    return acc;
  }, {});
}

/**
 * Finds and returns the values that have changed between two objects.
 *
 * @param {Object} objA - The first object for comparison.
 * @param {Object} objB - The second object for comparison.
 * @returns {Object} - An object containing the keys and corresponding changed values.
 */
export function findChangedValues(objA, objB) {
  const changedValues = {};
  for (const key in objA) {
    if (objB.hasOwnProperty(key)) {
      const oldValue = {};
      const newValue = {};

      for (const prop in objA[key]) {
        if (!objectDeepEqual(objA[key][prop], objB[key][prop])) {
          oldValue[prop] = objA[key][prop];
        }
      }
      for (const prop in objB[key]) {
        if (!objectDeepEqual(objA[key][prop], objB[key][prop])) {
          newValue[prop] = objB[key][prop];
        }
      }
      if (Object.keys(oldValue).length > 0 || Object.keys(newValue).length > 0) {
        changedValues[key] = { key, oldValue, newValue };
      }
    }
  }
  return changedValues;
}

/**
 * Recursively checks the deep equality of two objects.
 *
 * @param {any} objA - The first object for comparison.
 * @param {any} objB - The second object for comparison.
 * @returns {boolean} Returns `true` if the objects are deeply equal, otherwise `false`.
 */
export function objectDeepEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }
  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }
  const keysA = Object.keys(objA);
  const keysB = new Set(Object.keys(objB));
  if (keysA.length !== keysB.size) {
    return false;
  }
  for (const key of keysA) {
    if (!keysB.has(key) || !objectDeepEqual(objA[key], objB[key])) {
      return false;
    }
  }
  return true;
}

/**
 * Select the version and filter the to state sprint list.
 *
 * @param {object} fromModelObject - The data model object of the from state.
 *
 * @param {number} vid - The unique identifier of the product to select.
 *
 * @param {object} toStateModelObject - The data model object of the to state.
 *
 */
export async function selectVersionAndFilterToStateList(fromModelObject, vid, toStateModelObject) {
  clearVersionSelection(toStateModelObject);
  clearSprintSelection(toStateModelObject);
  await selectVersion(fromModelObject, vid)
  if ( fromModelObject.selectedSprint.alias !== "default"){
    await filterSprintList(fromModelObject, toStateModelObject)
  }
  else {
    await filterReleaseList(fromModelObject, toStateModelObject)
  }
}

/**
 * Filter the to state sprint list based on the from State selection.
 *
 * @param {object} fromModelObject - The data model object of the from state.
 *
 * @param {object} toStateModelObject - The data model object of the to state.
 *
 */
export async function filterSprintList(fromModelObject, toStateModelObject) {
  const [major, minor] = fromModelObject.selectedSprint.sprintVersion.split('.').map(Number);
  toStateModelObject.sprints = toStateModelObject.sprints.filter(item => {
    const versionParts = item.sprintVersion.split('.').map(parseFloat);
    const targetVersion = [major, minor];
    for (let i = 0; i < Math.min(versionParts.length, targetVersion.length); i++) {
      if (versionParts[i] !== targetVersion[i]) {
        return versionParts[i] >= targetVersion[i];
      }
    }
    return true;
  });
  await checkIfSelectedReleaseWasLastInSprintAndRemoveSprintIfItWas(toStateModelObject, fromModelObject)
}

/**
 * If the from state selection was last in release in that sprint then remove that sprint from the to State.
 *
 * @param {object} fromModelObject - The data model object of the from state.
 *
 * @param {object} toStateModelObject - The data model object of the to state.
 *
 */
export async function checkIfSelectedReleaseWasLastInSprintAndRemoveSprintIfItWas(toStateModelObject, fromModelObject){
  const filteredVersions = fromModelObject.allVersions.filter(version => version.sprintVersion === fromModelObject.selectedSprint.sprintVersion);
  const versionNumbers = filteredVersions.map(version => version.version);
  let normalisedVersionNumbers = [];
  versionNumbers.forEach((version) => {
    normalisedVersionNumbers.push(normalizeProductSetVersion(version));
  });
  const highestVersion = semver.rsort(normalisedVersionNumbers)[0];
  const latestSprintNumber = getLatestSprintNumber(fromModelObject);
  if (highestVersion === normalizeProductSetVersion(fromModelObject.selectedVersion.version) && highestVersion.split('.').slice(0, 2).join('.') !== normalizeProductSetVersion(latestSprintNumber)){
    toStateModelObject.sprints = toStateModelObject.sprints.filter(sprint => sprint.sprintVersion !== fromModelObject.selectedSprint.sprintVersion);
  }
}


/**
 * Filter the to state Release list based on the from State selection.
 *
 * @param {object} fromModelObject - The data model object of the from state.
 *
 * @param {object} toStateModelObject - The data model object of the to state.
 *
 */
export async function filterReleaseList(fromModelObject, toStateModelObject) {
  const [major, minor] = fromModelObject.selectedRelease.releaseNumber.split('.').map(Number);
  toStateModelObject.releases = toStateModelObject.releases.filter(item => {
    const versionParts = item.releaseNumber.split('.').map(parseFloat);
    const targetVersion = [major, minor];
    for (let i = 0; i < Math.min(versionParts.length, targetVersion.length); i++) {
      if (versionParts[i] !== targetVersion[i]) {
        return versionParts[i] >= targetVersion[i];
      }
    }
    return true;
  });
  await checkIfSelectedWasLastInReleaseAndRemoveReleaseIfItWas(toStateModelObject, fromModelObject)
}

/**
 * If the from state selection was last in that release then remove that release from the to State.
 *
 * @param {object} fromModelObject - The data model object of the from state.
 *
 * @param {object} toStateModelObject - The data model object of the to state.
 *
 */
export async function checkIfSelectedWasLastInReleaseAndRemoveReleaseIfItWas(toStateModelObject, fromModelObject){
  const versionNumbers = fromModelObject.versions.map(version => version.version);
  let normalisedVersionNumbers = [];
  versionNumbers.forEach((version) => {
    normalisedVersionNumbers.push(normalizeProductSetVersion(version));
  });
  const highestVersion = semver.rsort(normalisedVersionNumbers)[0];
  if (highestVersion === normalizeProductSetVersion(fromModelObject.selectedVersion.version) && highestVersion.split('.').slice(0, 2).join('.')){
    toStateModelObject.releases = toStateModelObject.releases.filter(release => release.releaseNumber !== fromModelObject.selectedRelease.releaseNumber);
  }
}

/**
 * Select the release based on the user selection and remove latest release version if required.
 *
 * @param {object} fromModelObject - The data model object of the from state.
 *
 * @param {number} $event - The unique identifier of the product to select.
 *
 * @param {object} toModelObject - The data model object of the to state.
 */
export async function selectReleaseAndRemoveLatestReleaseInFromState(fromModelObject, $event, toModelObject){
  await selectRelease(fromModelObject, $event);
  await this.removeVeryLatestReleaseVersion(fromModelObject);
  clearVersionSelection(toModelObject);
  clearReleaseSelection(toModelObject);
  resetToStateAvailableReleases(toModelObject);
}

/**
 * Select the sprint based on the user selection and remove latest release version if required.
 *
 * @param {object} fromModelObject - The data model object of the from state.
 *
 * @param {number} $event - The unique identifier of the product to select.
 *
 * @param {object} toModelObject - The data model object of the to state.
 */
export async function selectSprintAndRemoveLatestReleaseInFromState(fromModelObject, $event, toModelObject){
  await selectSprint(fromModelObject, $event);
  await this.removeVeryLatestReleaseVersion(fromModelObject);
  clearVersionSelection(toModelObject);
  clearSprintSelection(toModelObject);
  resetToStateAvailableSprints(toModelObject);
}

/**
 * Remove the latest release in the from state model, so it can not be selected as a from state.
 *
 * @param {object} fromModelObject - The data model object of the from state.
 *
 */
export async function removeVeryLatestReleaseVersion(fromModelObject){
  if (fromModelObject.selectedSprint.alias !== "default"){
    const largestSprintVersion = getLatestSprintNumber(fromModelObject);
    if (fromModelObject.selectedSprint.sprintVersion === largestSprintVersion){
      fromModelObject.versions.shift();
    }
  }
  else {
    const releaseObjects = fromModelObject.allVersions.filter(item => item.release === true);
    const highestVersionObject = releaseObjects.reduce((max, item) => {
      const currentVersion = parseFloat(item.version.replace(/\./g, ''));
      const maxVersion = parseFloat(max.version.replace(/\./g, ''));
      return currentVersion > maxVersion ? item : max;
    }, releaseObjects[0]);
    fromModelObject.versions = fromModelObject.versions.filter(item => !(item.release === true && item.version === highestVersionObject.version));
  }
}

/**
 * Select the from State sprint and filter the available product list in the to state.
 *
 * @param {object} toModelObject - The data model object of the to state.
 *
 * @param {number} vid - The unique identifier of the product to select.
 *
 * @param {object} fromModelObject - The data model object of the from state.
 *
 */
export async function selectSprintAndFilterSprintList(toModelObject, vid, fromModelObject) {
  await selectSprint(toModelObject, vid)
  filterProductSetList(toModelObject, fromModelObject)
}

/**
 * Select the from State release and filter the available product list for to state.
 *
 * @param {object} toModelObject - The data model object of the to state.
 *
 * @param {number} vid - The unique identifier of the product to select.
 *
 * @param {object} fromModelObject - The data model object of the from state.
 *
 */
export async function selectReleaseAndFilterReleaseList(toModelObject, vid, fromModelObject){
  await selectRelease(toModelObject, vid)
  filterProductSetList(toModelObject, fromModelObject)
}

/**
 * Takes in a list of versions and sorts them from highest to lowest.
 *
 * @param {object} versionNumbers - List of version to be sorted.
 *
 * @returns {object} Sorted list of versions starting with the highest.
 */
export function sortListOfVersionNumber(versionNumbers) {
  versionNumbers.sort((a, b) => {
    const versionA = a.split('.').map(Number);
    const versionB = b.split('.').map(Number);
    for (let i = 0; i < versionA.length; i++) {
      if (versionA[i] !== versionB[i]) {
        return versionB[i] - versionA[i];
      }
    }
    return 0;
  });
  return versionNumbers
}

/**
 * Get the latest sprint number from the model.sprints.sprintVersion.
 *
 * @param {object} model - The data model object.
 *
 * @returns {string} The Latest sprint number.
 */
export function getLatestSprintNumber(model) {
  const sprintVersions = model.unfilteredSprints.map(sprint => sprint.sprintVersion);
  const highestVersion = sortListOfVersionNumber(sprintVersions)
  return highestVersion[0]
}

/**
 * Remove all products in the to state model that are equal to or less than the one selected in the from state model.
 *
 * @param {object} toModelObject - The data model object of the to state.
 *
 * @param {object} fromModelObject - The data model object of the from state.
 *
 */
export function filterProductSetList(toModelObject, fromModelObject){
  const fromVersion = fromModelObject.selectedVersion.version.split('-');
  const targetVersion = fromVersion[0].split('.').map(Number);
  toModelObject.versions = toModelObject.versions.filter(item => {
    const toVersion = item.version.split('-');
    const itemVersion = toVersion[0].split('.').map(Number);
    for (let i = 0; i < Math.min(itemVersion.length, targetVersion.length); i++) {
      if (itemVersion[i] !== targetVersion[i]) {
        return itemVersion[i] > targetVersion[i];
      }
    }
    return false;
  });
}

/**
 * Rebuild available sprints in the to state model if the user changes the selected from state sprint value
 *
 * @param {object} toModelObject - The data model object of the to state.
 *
 */
export function resetToStateAvailableSprints(toModelObject){
  toModelObject.sprints = toModelObject.allSprints;
}

/**
 * Rebuild available sprints in the to state model if the user changes the selected from state release value
 *
 * @param {object} toModelObject - The data model object of the to state.
 *
 */
export function resetToStateAvailableReleases(toModelObject){
  toModelObject.releases = toModelObject.allReleases;
}

/**
 * Append category to the keysData
 *
 * @param {Object} keysData - The first object for comparison.
 * @param {Object} comparisonObject - The target schema model for comparison.
 * @param {Object} fromObject - The source schema model.
 *
 * @returns {Object} Updated keys data with category.
 */
export function addCategoryToKeysData(keysData, comparisonObject, fromObject) {
  if (keysData === null || keysData === undefined) return keysData;
  return keysData.map(k => {
    // Use comparisonObject if it has the key; otherwise, use fromObject
    const source = comparisonObject[k.key] ? comparisonObject : fromObject;
    k.displayName = source[k.key].displayName;
    k.category = source[k.key].category;
    k.description = source[k.key].validationMessage;
    if (source[k.key].longDescription) {
      k.longDescription = source[k.key].longDescription;
    }
    if (source[k.key].htmlDescription) {
      k.htmlDescription = source[k.key].htmlDescription;
    }
    return k;
  });
}
