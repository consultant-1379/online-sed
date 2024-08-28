import { reactive } from "vue";
import { saveAs } from "file-saver";

import yaml from "js-yaml";
import YAML from "yaml";
import { Notification } from '@eds/vanilla';
import { isIP } from "is-in-subnet";
import axios from 'axios';
const serverTimeout = 3000;
import { downloadSchema,
  getCloudNativeProductSetContent,
  DEPLOYMENT_SIZE_MAPPING
} from "../utils/utils.js"
import {
  deepMergeObjects,
  findInObject,
  createNestedObject,
  getTolerationErrorsCount,
  readObjectDetails,
  isValidNodeSelectors,
  isValidArray,
  isValidObjectArrayInput,
  validateAllCustomObjectEntries,
  getBaseYamlFileForExport,
  isDisplayConditionMet
} from "../utils/CENMUtils.js";
export const default_select = { name: "Please select...", alias: "default", shortName: "Please select...", };
export const default_sprint_select = { sprintVersion: "Please select...", alias: "default", };
export const default_release_select = { releaseNumber: "Please select...", alias: "default", };
const DATA_PATH = "/data";
const IPV4 = "ipv4";
const IPV6 = "ipv6";
const ENVIRONMENT_MODEL = "environment_model";
export const IPV4_REGEX = "^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$";
export const IPV6_REGEX = "^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(([0-9A-Fa-f]{1,4}(:[0-9A-Fa-f]{1,4})*)?)::(([0-9A-Fa-f]{1,4}(:[0-9A-Fa-f]{1,4})*)?))$";
export const IPV6_CIDR_REGEX = "^\\s*((?:(?:(?:[0-9A-Fa-f]{1,4}:){7}(?:[0-9A-Fa-f]{1,4}|:))|(?:(?:[0-9A-Fa-f]{1,4}:){6}(?::[0-9A-Fa-f]{1,4}|(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(?:(?:[0-9A-Fa-f]{1,4}:){5}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(?:(?:[0-9A-Fa-f]{1,4}:){4}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,3})|(?:(?::[0-9A-Fa-f]{1,4})?:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){3}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,4})|(?:(?::[0-9A-Fa-f]{1,4}){0,2}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){2}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,5})|(?:(?::[0-9A-Fa-f]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){1}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,6})|(?:(?::[0-9A-Fa-f]{1,4}){0,4}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?::(?:(?:(?::[0-9A-Fa-f]{1,4}){1,7})|(?:(?::[0-9A-Fa-f]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:)))(?:%.+)?)\\/(6[0-4]|[3-5][0-9]|2[4-9])$";
const OR = "|";
export const ALL_IP_VERSIONS_REGEX = IPV4_REGEX + OR + IPV6_REGEX + OR + IPV6_CIDR_REGEX;
export const API_PORT = import.meta.env.VITE_APP_ENV_API_PORT ? ":" + import.meta.env.VITE_APP_ENV_API_PORT  : "";
export const SED_API_URL = import.meta.env.PROD ? "https://siteengineeringdata.internal.ericsson.com" + API_PORT + "/api/" : "http://localhost:3000/api/";
export const SED_API_DOCS_URL = import.meta.env.PROD ? "https://siteengineeringdata.internal.ericsson.com" + API_PORT + "/api-docs/" : "http://localhost:3000/api-docs/";
const DEFAULT_MODEL = JSON.stringify({
  products: [],
  sizes: [],
  allVersions: [],
  versions: [],
  sprints: [],
  releases: [],
  ipVersions: [],
  selectedProduct: default_select,
  selectedUseCase: default_select,
  selectedSize: default_select,
  selectedVersion: default_select,
  selectedSprint: default_sprint_select,
  selectedRelease: default_release_select,
  selectedIpVersion: default_select,
  dataTypeCategories: [],
  schemaForm: [],
  response: {},
  importedData: {},
  immutableImportedData: {},
  updated_data: {},
  prepared: false,
  showDescriptionModal: false,
  showDuplicatedValues: false,
  currentQuestion: {},
  default_select: {name: "Please select...", },
  targetAudience: import.meta.env.VITE_APP_ENV_TYPE ? import.meta.env.VITE_APP_ENV_TYPE : 'cu',
  sedApiDocsUrl: SED_API_DOCS_URL,
  userDataCleared: true,
  isModelReady: false,
  usePreviousSED: true,
  importedFileContent: null,
  importedFileName: null,
  showpENMSizeMismatchNotification: false,
  showcENMSizeMismatchNotification: false,
  showIpVersionMismatchNotification: false,
  dryRunMode: false,
  isIncomplete: true,
  showDeleteAllDataConfirmation: false,
  wizardCurrentStep: 0,
  variableNameEnabled: true,
  autoPopulationTypes: [],
  excludeIps: [{ ipAddress: '', ipDescription: '', isDuplicate: false, errorMessage: false }],
  usedIpAddresses: [],
  displayKeys: [],
  productVersions: [],
  loadedSchema: {},
  selectedSchema: default_select,
  artifactoryRepoData: {},
  schemaFromFileMode: false,
  importBaseYaml: false,
  importedBaseYamlContent: null,
  importedBaseYamlFileName: null,
  importedSchemaFileName: null,
  includePasswords: true,
  storedSchema: {},
  autopopulatedValues: [],
  autopopulatedValuesStillRequired: {},
  displayAll: true,
  displayErrors: false,
  displayChanged: false,
  expandCategories: true,
  showTolerationDialog: false,
  initializedK8sTolerationSelects: [],
  initializedObjectArrayInputSelects: [],
  csarLite: false
});

let model = reactive(JSON.parse(DEFAULT_MODEL));

/**
 * Selects a product from the available products and fetches its data.
 *
 * @async
 * @param {string} vid - The unique identifier of the product to select.
 * @param {Object} model - Global object to store the schema and state of deployment.
 * @param {Object} comparisonModel - [Optional] Global object to store the state info for comparison deployment.
 */
export async function selectProduct(vid, model, comparisonModel=undefined) {
  model.selectedProduct = model.products[vid];
  clearSizeSelection(model);
  clearSprintSelection(model);
  clearReleaseSelection(model);
  clearVersionSelection(model);
  clearIPVersionSelection(model);
  clearIPVersionsAvailableToSelect(model);
  clearSizeSelection(model);
  clearSchemasAvailableToSelect(model);
  clearSchemaSelection(model);
  if (comparisonModel === undefined) {
    resetUseCase(model);
    resetIncludePassword(model);
    clearSchemaFromFileMode(model);
    clearPopulateValuesFromImportedSedFile(model);
  }
  resetIncludePassword(model);
  clearSchemaFromFileMode(model);
  clearPopulateValuesFromImportedSedFile(model);

  try {
    let res;
    let versions;
    if (model.targetAudience === 'pdu') {
      res = await fetch(DATA_PATH + "/" + model.selectedProduct.shortName + "/internalVersions.json", {cache: "no-store"});
      versions = await res.json();
      let internalVersions = versions.filter((i) => (i.targetAudience === model.targetAudience));
      model.sprints = [...new Map(internalVersions.map(item =>[item['sprintVersion'], item])).values()];
    } else {
      res = await fetch(DATA_PATH + "/" + model.selectedProduct.shortName + "/externalVersions.json", {cache: "no-store"});
      versions = await res.json();
      try {
        const res = await fetch(DATA_PATH + "/releases.json", {cache: "no-store"});
        let externalReleases = await res.json();
        let releases = versions.filter(item => item.release === true);
        let releaseNumbers = []
        for (let item in releases ){
          releaseNumbers.push(releases[item].releaseNumber)
        }
        externalReleases = externalReleases.filter(item => releaseNumbers.includes(item.releaseNumber));
        model.releases = [...new Map(externalReleases.map(item =>[item['releaseNumber'], item])).values()];
      } catch (err) {
        console.error("Error fetching data: " + err);
      }
    }
    model.allVersions = versions;
    model.versions = versions;
    if(comparisonModel !== undefined) {
      await configureComparisonModels(model, comparisonModel, vid);
    }
  } catch (err) {
    console.error("Error fetching data: " + err);
  }
  model.ipVersions = model.products[vid].ipVersions;
}


/**
 * Configure the models for the compare page
 *
 * @param {Object} model - Global object to store the schema and state of deployment.
 * @param {Object} comparisonModel - Global object to store the state info for comparison deployment.
 * @param {string} vid - The unique identifier of the product to select.
 *
 */
export async function configureComparisonModels(model, comparisonModel, vid) {
  comparisonModel.selectedProduct = model.products[vid];
  comparisonModel.sprints = model.sprints;
  comparisonModel.versions = model.versions;
  comparisonModel.allVersions = model.allVersions;
  comparisonModel.releases = model.releases;
  comparisonModel.allSprints = model.sprints;
  comparisonModel.allReleases = model.releases;
  model.unfilteredSprints = model.sprints;
  model.unfilteredReleases = model.releases;
  if (model.sprints.length > 0){
    filterAndRemoveIfSingle(model, 'sprints', 'sprintVersion');
  }
  if (model.releases.length > 0){
    await filterAndRemoveIfSingle(model, 'releases', 'releaseNumber', item => item.targetAudience === 'cu');
  }
}

/**
 * Remove latest sprint or release from the model if it is the most recent Sprint/Release with only one entry
 *
 * @param {Object} model - Global object to store the schema and state of deployment.
 * @param {String} arrayName - object in model to filter (sprints/releases)
 * @param {String} versionProperty - Property of model to use
 * @param {function(*, *): boolean} additionalFilter - additional filter parameter for release object
 *
 */
export async function filterAndRemoveIfSingle(model, arrayName, versionProperty, additionalFilter = () => true) {
  if (model[arrayName].length > 0) {
    const highestValueObject = model[arrayName].reduce((maxObject, currentObject) => {
      const maxValue = parseFloat(maxObject[versionProperty]);
      const currentValue = parseFloat(currentObject[versionProperty]);
      return maxValue >= currentValue ? maxObject : currentObject;
    }, model[arrayName][0]);

    const result = model.versions.filter(item =>
        item[versionProperty] === highestValueObject[versionProperty] && additionalFilter(item)
    );

    if (result.length === 1) {
      model[arrayName] = model[arrayName].filter(item => item[versionProperty] !== highestValueObject[versionProperty]);
    }
  }
}

/**
 * Get the possible IP versions for a schema version.
 *
 * @param {Object} model - Global object to store the schema and state of deployment.
 * @param {String} schemaVersion - Name of a schemaVersion
 * @returns {Array} An array of IP version objects
 */
export async function getPossibleIPVersions(model, schemaVersion) {
  model.artifactoryRepoData = await getDeploymentSizeFromArtifactory(model, schemaVersion);
  const ipVersionsArray = [];
  Object.values(model.artifactoryRepoData).forEach((size) => {
    size.forEach((schemaObj) => {
      if (schemaObj.uri.includes('IPv4')) ipVersionsArray.push('ipv4');
      if (schemaObj.uri.includes('IPv6_EXT')) ipVersionsArray.push('ipv6_ext');
      if (schemaObj.uri.includes('dualStack')) ipVersionsArray.push('dual');
    });
  });
  return Array.from(new Set(ipVersionsArray), name => ({ name }));
}

/**
 * Get the possible release deployment sizes for an IP version.
 *
 * @param {Object} model - Global object to store the schema and state of deployment.
 * @param {Object} ipVersion - An object representing a selected IP version
 * @returns {Array} An array of deployment sizes objects
 */
export async function getPossibleDeploymentSizes(model, ipVersion) {
  const mappedIpVersion = {
    ipv4: 'IPv4',
    ipv6_ext: 'IPv6',
    dual: 'dualStack'
  }[ipVersion.name];
  return Object
    .keys(model.artifactoryRepoData)
    .filter((size) => model.artifactoryRepoData[size].some(schema => schema.uri.includes(mappedIpVersion)))
    .map(size => ({name: size.replace('/', '')}));
}

/**
 * Get the possible schemas for an IP version and deployment size.
 *
 * @param {Object} model - Global object to store the schema and state of deployment.
 * @param {Object} ipVersion - An object representing a selected IP version
 * @param {Object} deploymentSize - An object representing a selected deployment size
 * @returns {Array} An array of schema objects
 */
export async function getPossibleSchemas(model, ipVersion, deploymentSize) {
  const mappedIpVersion = {
    'ipv4': 'IPv4',
    'ipv6_ext': 'IPv6',
    'dual': 'dualStack'
  }[ipVersion.name];

  return model.artifactoryRepoData[deploymentSize.name]
    .filter((schemaObj) => schemaObj.uri.includes(mappedIpVersion))
    .map(schemaObj => ({
      uri: schemaObj.uri,
      shortName: getSchemaFileShortName(schemaObj.uri, model.selectedProduct.shortName).trim(),
      name: schemaObj.uri.replace('_schema.json', '').replace('/', ''),
      sizeAlias: schemaObj.uri.replace('_schema.json', '_dd.xml').replace('/', ''),
    }))
    .sort((schemaObj1, schemaObj2) => schemaObj1.name.localeCompare(schemaObj2.name));
}

/**
 * Get the possible schemas for an IP version and deployment size.
 *
 * @param {Object} model - Global object to store the schema and state of deployment.
 * @returns {Array} An array of schema objects
 */
export async function getPossibleCENMSchemas(model) {
  return model.artifactoryRepoData
    .map(schemaObj => ({
      uri: schemaObj.uri.replace('/', ''),
      shortName: getSchemaFileShortName(schemaObj.uri, model.selectedProduct.shortName).trim(),
      name: schemaObj.uri.replace('/', ''),
      sizeAlias: schemaObj.uri.replace('/', ''),
    }));
}

/**
 * Shorten a JSON schema filename to make it fit into the GUI.
 *
 * @param {string} schemaFileName - A schema JSON filename as stored in Artifactory.
 * @returns {string} Shortened schema filename
 */
export function getSchemaFileShortName(schemaFileName, product) {
  if (product === 'pENM') {
    return schemaFileName
      .replace('/', '')
      .replace('__production', ' ')
      .replace('__test', ' ')
      .replace('_IPv4', 'IPv4 ')
      .replace('_IPv6_EXT', 'IPv6 EXT ')
      .replace('_dualStack', 'Dual ')
      .replace('_geoMetro', 'geoMetro ')
      .replace('__', '')
      .replace('_reducedGen10', 'Reduced Gen 10 ')
      .replace('_schema.json', '');
  } else {
    return schemaFileName
      .replace('/', '')
      .replace('-', ' ')
      .replace('-', ' ')
      .replace('-', ' ')
      .replace('-', ' ')
      .replace('-schema.json', '');
  }
}

/**
 * Generates an updated SED file for the selected version, size, and updated data in the form.
 *
 * @param {Object} model - Global object to store the schema and state of deployment.
 *
 * @async
 */

export async function generateUpdatedSEDFile(model) {
  try {
    let blob;
    if (model.selectedProduct.sedFileFormat === "yaml") {
      blob = new Blob([YAML.stringify(model.updated_data)], {
        type: "application/yaml",
      });
    } else if (model.selectedProduct.sedFileFormat === "txt") {
      blob = new Blob(model.updated_data);
    }
    let schemaName = model.selectedSchema.name;
    if (model.schemaFromFileMode) {
      schemaName = model.importedSchemaFileName;
    }
    schemaName = schemaName.replace('sed-schema.json', '');
    if(model.selectedProduct.sedFileFormat === "yaml") {
      schemaName += model.selectedSize.name;
    }
    schemaName += "-" + model.selectedVersion.name + "." + model.selectedProduct.sedFileFormat;
    if (model.isIncomplete === true) {
      blob = new Blob(["## THIS SED FILE IS INCOMPLETE AND NOT SUITABLE TO USE, PLEASE UPLOAD THIS FILE TO THE ONLINE SED AND POPULATE ALL INCOMPLETE VALUES  ##\n", blob], {type: model.selectedProduct.sedFileFormat});
      saveAs(blob, "incomplete-" + schemaName);
      showNotification('Success', 'Incomplete values file has been generated', 'green', 'icon-check', 3000);
    } else {
      saveAs(blob, schemaName);
      showNotification('Success', 'Updated values file has been generated', 'green', 'icon-check', 3000);
    }
  } catch (e) {
    const title = 'Error generating updated values file';
    const description = e.message;
    const stripeColor = 'red';
    const icon = 'icon-triangle-warning';
    showNotification(title, description, stripeColor, icon);
    console.error(e.message);
  }
}


/**
 * Load products from /data/products.json.
 *
 * @param {Object} model - Global object to store the schema and state of deployment.
 * @param {Object} comparisonModel - [Optional] Global object to store the state info for comparison deployment.
 *
 * @async
 */
export async function loadProducts(model, comparisonModel=undefined) {
  try {
    const res = await fetch(DATA_PATH + "/products.json", { cache: "no-store" });
    let products = await res.json();
    model.products = products;
    if (comparisonModel !== undefined) {
      comparisonModel.products = products;
    }
    if (model.products.length === 1) {
      await selectProduct(0, model, comparisonModel);
    }
  } catch (err) {
    console.error("Error loading products: " + err);
  }
}

/**
 * A function that resets the deployment by resetting some model fields.
 *
 * @param {Object} model - Global object to store the schema and state of deployment.
 *
 * @async
 */
export async function resetDeployment(model) {
  Object.assign(model, {
    isModelReady: false,
    prepared: false,
    schemaForm: [],
    dataTypeCategories: [],
    wizardCurrentStep: 0
  });
}

/**
 * Updates the 'required' and 'optional' properties of a question in the model based on the provided conditions.
 *
 * @param {Object} model - Global object to store the schema and state of deployment.
 * @param {object} sedParam - The SED parameter object to be checked for required status.
 */
export function updateRequiredProperty(model, sedParam) {
  sedParam.required = sedParam.keepOptional ? false : checkShouldParamBeDisplayed(model, sedParam);
  model.loadedSchema.properties.parameters.properties[sedParam.key]['optional'] = !sedParam.required;
}

/**
 * A function that sets the enabled optional services' dependent keys to be required.
 *
 * @param {Object} model - Global object to store the schema and state of deployment.
 *
 * @async
 */
export async function setEnabledOptionalServiceRequired(model) {
  for (const key in model.response) {
    if (model.displayKeys.includes(key) && model.response[key] === "true") {
      model.schemaForm.filter( question => {
        if (question.displayIf && question.displayIf.includes(key)) {
          updateRequiredProperty(model, question);
        }
      });
    }
  }
}

/**
 * A function that removes the unused ip categories from the array of categories
 *
 * @param {Array} categories - An array of Categories
 * @param {String} selectedIpVersion - Ip version that is selected for the model
 * @param {String} ipKey - Ip key that is used to filter for the model
 *
 */
export function removeUnusedIpaddressFields(categories, selectedIpVersion, ipKey) {
  if (!selectedIpVersion.includes("dual")) {
    if (selectedIpVersion.includes(IPV6) ) {
      return categories.filter(item => !item.hasOwnProperty(ipKey) || !item[ipKey].toLowerCase().includes(IPV4));
    }
    if (selectedIpVersion.includes(IPV4)) {
      return categories.filter(item => !item.hasOwnProperty(ipKey) || !item[ipKey].toLowerCase().includes(IPV6));
    }
  }
  return categories;
}

/**
 * A function that prepares the deployment.
 *
 * @param {Object} model - Global object to store the schema and state of deployment.
 * @param {Object} router - Router object for navigation.
 *
 * @async
 */
export async function setupDeployment(model, router){
  if(model.firstrun){
    await setupDeploymentSchema(model, router);
    model.firstrun=false;
  } else {
    model.showDeleteAllDataConfirmation = true;
  }
}

/**
 * A function that prepares the deployment's schema.
 *
 * @param {Object} model - Global object to store the schema and state of deployment.
 * @param {Object} router - [Optional] Router object for navigation. Not needed in Comparison Tool.
 *
 * @async
 */
export async function setupDeploymentSchema(model, router=undefined) {
  model.isModelReady = true;
  model.schemaForm = [];
  if (!model.schemaFromFileMode) {
    try {
      let schemaFileUrl = "";
      if (model.selectedProduct.shortName === 'pENM') {
        schemaFileUrl = ['https://arm.seli.gic.ericsson.se',
          'artifactory',
          model.selectedProduct.sedSchemaRepo,
          model.selectedProduct.shortName.toLowerCase(),
          model.selectedVersion.schemaVersion,
          model.selectedSize.name,
          model.selectedSchema.uri].join('/');
      } else {
        schemaFileUrl = ['https://arm.seli.gic.ericsson.se',
          'artifactory',
          model.selectedProduct.sedSchemaRepo,
          model.selectedProduct.shortName.toLowerCase(),
          model.selectedVersion.schemaVersion,
          model.selectedSchema.uri].join('/');
      }
      model.loadedSchema = await downloadSchema(schemaFileUrl, SED_API_URL, model.selectedProduct.shortName);
    } catch (e) {
      const title = 'Error fetching schema from Artifactory. Please try again later.';
      showNotification(title, e.message, 'red', 'icon-triangle-warning');
      console.error(e);
    }
  }
  await getSchemaForm(model.loadedSchema, model);
  storeDeploymentDetails(model);

  if (model.showDeleteAllDataConfirmation === false && model.selectedIpVersion.name !== "Please select...") {
    let usedIpsDeleted = [];
    model.usedIpAddresses.forEach((entry) => {
      if (entry !== undefined && entry !== null) {
        if (model.schemaForm.find(element => element.key === entry.name) === undefined) {
          usedIpsDeleted.push(entry.value);
        }
      }
    });
  }
  if (model.selectedUseCase.alias !== 'compare') {
    populateValuesFromImportedSedFile(model);
    if (model.importedFileContent) {
      await setEnabledOptionalServiceRequired(model);
    }
    var categories = removeUnusedIpaddressFields(model.loadedSchema.categories, model.selectedIpVersion.name.toLowerCase(), "shortName");
    categories.forEach((section, i) => {
      section.id = i;
      section.collapsed = false;
    });
    model.response["csarLite"] = model.csarLite;
    model.response["ip_version"] = model.selectedIpVersion.name;
    model.dataTypeCategories = categories;
    model.autoPopulationTypes = removeUnusedIpaddressFields(model.loadedSchema.autoPopulationTypes, model.selectedIpVersion.name.toLowerCase(), "name");
    model.prepared = true

    if (model.showDeleteAllDataConfirmation === false && model.selectedIpVersion.name !== "Please select...") {
      let usedIpsDeleted = [];
      model.usedIpAddresses.forEach((entry) => {
        if (entry !== undefined) {
          if (model.schemaForm.find(element => element.key === entry.name) === undefined) {
            usedIpsDeleted.push(entry.value);
          }
        }
      });
      model.usedIpAddresses = usedIpsDeleted;
      if (router !== undefined) {
        (model.selectedProduct.shortName === 'pENM') ? router.push("/excludeipaddresses") : router.push("/autopopulate");
      }
    } else {
      model.prepared = false;
    }
  }
}

/**
 * generateYamlResponse - is an async function that updates the `updated_data` property of a model for cENM.
 * @async
 * @param {Object} model - Global object to store the schema and state of deployment.
 */
export async function generateYamlResponse(model) {
  let tempData;
  model.schemaForm.forEach(prop => {
    if (prop.keys === undefined) {
      return;
    }
    prop.keys.forEach(k => {
      if (isDisplayConditionMet(model.response, prop.displayIf, prop.displayIfNot)) {
        const location = k.split('.');
        const locationToResponse = createNestedObject(location, model.response[prop.key]);
        tempData = deepMergeObjects(tempData, locationToResponse);
      }
    });
  });
  let productSetContent = await getCloudNativeProductSetContent(model.selectedVersion.sprintVersion, model.selectedVersion.version);
  const deploymentSize = DEPLOYMENT_SIZE_MAPPING[model.selectedSize.name];
  let integrationYamlVersion = productSetContent[2]['integration_values_file_data'][0]['values_file_version'];
  let emptyValuesContent;
  if (model.importBaseYaml && model.importedBaseYamlContent !== null) {
    emptyValuesContent = model.importedBaseYamlContent;
  } else {
    emptyValuesContent = await getBaseYamlFileForExport(model.csarLite, productSetContent, deploymentSize, integrationYamlVersion, SED_API_URL);
    if (emptyValuesContent === null) {
      showNotification('Error generating Yaml data.', 'Cloud Native Product Set Content values files are null. The generated SED will not be complete.', 'red', 'icon-check');
    }
  }
  model.updated_data = deepMergeObjects(emptyValuesContent, tempData);
  model.updated_data.sedMetadata = {};
  model.updated_data.sedMetadata["csarLite"] = model.csarLite;
  if (Object.keys(model.response).some(key => key.includes('ipaddress_end') || key.includes('ipaddress_start'))){
    model.updated_data.autopopulatedValues = {};
    Object.entries(model.response).forEach(([key, value]) => {
      if (key.includes('ipaddress_end') || key.includes('ipaddress_start')) {
        model.updated_data.autopopulatedValues[key] = value;
      }
    });
  }
}

/**
 * generateKeyValueTextResponse - is an async function that updates the `updated_data` property of a model for pENM.
 * @async
 * @param {Object} model - Global object to store the schema and state of deployment.
 */
export async function generateKeyValueTextResponse(model) {
  var exportStore = [];
  var updatedResponse = Object.entries(model.response);
  let arrangedKeys = sortedKeys(model);

  let productVersion = "";
  productVersion = model.selectedVersion.name;
  if (model.targetAudience === 'cu') {
    productVersion = model.selectedVersion.releaseNumber + " - " + productVersion;
  }
  productVersion = "ProductVersion = " + productVersion;
  exportStore.push(productVersion);
  exportStore.push("\n");
  for (let i = 0; i < arrangedKeys.length; i++) {
    updatedResponse.forEach(([key, value]) => {
      if (arrangedKeys[i] === key){
        var line = `${key}=${value}`;
        exportStore.push(line);
        exportStore.push("\n");
      }
    });
  }
  updatedResponse.forEach(([key, value]) => {
      if (key.includes('ip_to_exclude_address_') || key.includes('ip_to_exclude_description_')){
        var line = `${key}=${value}`;
        exportStore.push(line);
        exportStore.push("\n");
      }
    });
  model.updated_data = exportStore;
}

/**
 * Generates a schema form based on the input schema
 *
 * @param {object} schema - A JSON schema object
 * @param {Object} model - Global object to store the schema and state of deployment.
 *
 * Each form object has the following properties:
 * - key: the key name of the parameter
 * - displayName: the display name of the parameter
 * - type: the form type, either "password", "select", or determined from the definition type
 * - category: the category of the parameter
 * - keys: the keys of the parameter
 * - validationMessage: the description of the parameter or the definition description
 * - validationPattern: the pattern of the definition
 * - example: example of the parameter
 * - longDescription: longer description for a key
 * - options: the options for a select form type, determined from the definition "enum" property
 * - inIPExclusionList: is user input in the IP exclusion list (default: false)
 * - preventDuplicates: Flag to mark parameters that should not allow duplicate entries
 * - isDuplicate: is user input a duplicate entry (default: false)
 * - required: is the parameter required (default: true)
 * - isPassword: is the parameter of type password
 * - isValid: is user input valid (default: true)
 * - errorMessage: the message to print if the user input is invalid
 * - value: the value of the parameter.
 * - valueMatchesKey: the parameter that should save the same value for validation.
 * - immutable: parameter which value that has to remain the same as in FROM state when doing upgrade
 * - defaultValue: Value to be set for a parameter if it is not overridden by an imported value.
 */
export async function getSchemaForm(schema, model) {
  const { properties: { parameters: {properties: propertiesParameters } } } = schema;
  const definitions = schema.definitions;

  for (const keyName in propertiesParameters) {
    const { displayName, category, keys, $ref, example, longDescription, description, optional, ipVersion, deploymentType, alternateKeys, autoPopulate, value, displayIf, displayIfNot, htmlDescription, valueMatchesKey, keepOptional, immutable, defaultValue } = propertiesParameters[keyName];
    const defKeyName = $ref.substring($ref.lastIndexOf("/") + 1, $ref.length);
    var definition = definitions[defKeyName];
    const validationMessage = description || definition.description;
    const preventDuplicates = definition.preventDuplicates || "";
    const errorMessage = definition.validationMessage || "";
    const nodeSelectorInfo = readObjectDetails(definition, definitions, "nodeSelectorInfo");
    const customObjectInfo = readObjectDetails(definition, definitions, "customObjectInfo");
    const tolerationInfo = readObjectDetails(definition, definitions, "tolerationInfo");
    const objectArrayInfo = readObjectDetails(definition, definitions, "objectInfo");
    if (deploymentType !== undefined && !deploymentType.includes(model.selectedSize.datapath)) {
      continue;
    }
    let type = definition.type;
    let options;
    if (ipVersion !== undefined && !ipVersion.some(version => version.toLowerCase() === model.selectedIpVersion.name.toLowerCase()))
      continue;
    if (definition.format) {
      type = definition.format;
      if (type === "password" && !model.includePasswords) {
        continue;
      }
    }
    if (definition.enum) {
      type = "select";
      options = definition.enum.map(item => ({ name: item }));
    }
    if (value !== undefined) {
      model.response[keyName] = value;
    }
    if (displayIf) {
      displayIf.forEach(e => (!model.displayKeys.includes(e)) ? model.displayKeys.push(e) : null);
    }
    if (definition.$ref) {
      var refName = definition.$ref.substring(definition.$ref.lastIndexOf("/") + 1, definition.$ref.length);
      definition = definitions[refName];
    }
    model.schemaForm.push({
      category,
      displayName,
      key: keyName,
      keys,
      options,
      required: (!optional),
      keepOptional,
      preventDuplicates,
      isDuplicate: false,
      inIPExclusionList: false,
      type,
      example,
      validationMessage,
      autoPopulate,
      longDescription,
      validationPattern: definition.pattern,
      isValid: true,
      isPassword: type === 'password',
      errorMessage,
      alternateKeys,
      displayIf,
      displayIfNot,
      htmlDescription,
      valueMatchesKey,
      isMatching: true,
      immutable,
      format: definition.format,
      nodeSelectorInfo,
      tolerationInfo,
      customObjectInfo,
      defaultValue: defaultValue || definition.defaultValue,
      objectArrayInfo
    });
  }
}

/**
 * selectSize - This function updates the selected size, selected size datapath and ip versions in the model
 *
 * @param {number} vid  The index of the selected size option
 * @param {object} model The data model object
 */
export async function selectSize(vid, model) {
  model.selectedSize = model.sizes[vid];
  clearSchemaSelection(model);
  clearSchemasAvailableToSelect(model);
  if (model.selectedProduct.shortName === 'pENM') {
    model.schemas = await getPossibleSchemas(model, model.selectedIpVersion, model.selectedSize);
  } else {
    model.schemas = await getPossibleCENMSchemas(model);
    model.selectedSchema = model.schemas[0];
  }
}

/**
 * selectSchema - This function updates the selected schema in the model
 *
 * @param {number} vid  The index of the selected size option
 * @param {object} model The data model object
 */
export function selectSchema(vid, model) {
  model.selectedSchema = model.schemas[vid];
  if(model.storedSchema.type !== undefined && model.storedSchema.type !== model.selectedSchema){
    model.prepared = false;
    if(model.storedSchema.loadedFileContent !== null){
      model.importedFileContent = null;
      model.importedFileName = null;
    }
  }
}

/**
 * Check user input for duplicate entry's.
 *
 * @param {object} model The data model object.
 * @param {object} field - The input field value.
 * @param {object} response - The key values of populated fields.
 */
export function checkDuplicates(model, field, response) {
  const populatedValues = getPopulatedValuesToCheckForDuplicates(model);
  var occurrence = populatedValues.filter(value => {
    if (value !== undefined && response[field.key] !== undefined) {
      return value.toLowerCase() === response[field.key].toLowerCase();
    }
    return false;
  }).length;
  if (model.usedIpAddresses.includes(response[field.key]) === true) {
    occurrence++;
  }
  return occurrence > 1;
}

/**
 * Is value a valid IP of type IPv4/IPv6/IPv6cidr.
 *
 * @param {string} valueToTest - The key values to validate.
 */
export function isValidIp(valueToTest) {
  return new RegExp(ALL_IP_VERSIONS_REGEX).test(valueToTest)
}

/**
 * Get list of IP's from excluded IP list.
 *
 * @param {object} model The data model object.
 */
export function getExcludedIps(model) {
  var excludedIPList = [];
  if (model.excludeIps){
    model.excludeIps.forEach(function(obj){
      if (obj.ipAddress.length > 0){
        excludedIPList.push(obj.ipAddress);
      }
    })
  }
  return excludedIPList
}

/**
 * Check user input against list of excluded IP's.
 *
 * @param {object} model The data model object.
 * @param {string} key - The key value of populated fields.
 */
export function checkIpInExclusionIps(model, key) {
  const excludeIPValues = getExcludedIps(model);
  return excludeIPValues.filter(value => value === key).length;
}

/**
 * Select an IP version for the given model.
 *
 * @param {number} vid - The index of the desired IP version
 * @param {object} model The data model object
 */
export async function selectIpVersion(vid, model) {
  clearSizeSelection(model);
  clearSchemaSelection(model);
  clearSchemasAvailableToSelect(model);

  model.selectedIpVersion = model.ipVersions[vid];
  if (model.selectedProduct.shortName === 'pENM') {
    model.sizes = await getPossibleDeploymentSizes(model, model.selectedIpVersion);
  } else {
    model.sizes = model.selectedProduct.deploymentSizes;
  }
}

/**
 * Reset dryRun toggle
 *
 * @param {object} model The data model object
 */
export function resetDryRun(model) {
  model.dryRunMode = false;
}

/**
 * Reset includePassword toggle
 *
 * @param {object} model The data model object
 */
export function resetIncludePassword(model) {
  model.includePasswords = true;
}

/**
 * Clear schemaFromFileMode toggle
 *
 * @param {object} model The data model object
 */
export function clearSchemaFromFileMode(model) {
  model.schemaFromFileMode = false;
  model.loadedSchema= {};
  model.importedSchemaFileName = null;
}

/**
 * Clear populateValuesFromImportedSedFile toggle
 *
 * @param {object} model The data model object
 */
export function clearPopulateValuesFromImportedSedFile(model) {
  model.usePreviousSED = true;
  clearImportedDataFromPreviousSEDFile(model);
}

/**
 * Clear imported data when previous SED file is set to false
 *
 * @param {object} model The data model object
 */
export function clearImportedDataFromPreviousSEDFile(model) {
  model.importedFileContent = null;
  model.importedFileName = null;
  model.excludeIps = [{ ipAddress: '', ipDescription: '', isDuplicate: false, errorMessage: false }];
}

/**
 * Reset sizes
 *
 * @param {object} model The data model object
 */
export function clearSizesAvailableToSelect(model) {
  model.sizes = []
}

/**
 * Reset size selection
 *
 * @param {object} model The data model object
 */
export function clearSizeSelection(model) {
  model.selectedSize = default_select;
}

/**
 * Reset Versions
 *
 * @param {object} model The data model object
 */
export function clearVersionsAvailableToSelect(model) {
  model.versions = []
}

/**
 * Reset version selection
 *
 * @param {object} model The data model object
 */
export function clearVersionSelection(model) {
  model.selectedVersion = default_select;
}

/**
 * Reset Sprints
 *
 * @param {object} model The data model object
 */
export function clearSprintsAvailableToSelect(model) {
  model.sprints = []
}

/**
 * Reset sprint selection
 *
 * @param {object} model The data model object
 */
export function clearSprintSelection(model) {
  model.selectedSprint = default_sprint_select;
}

/**
 * Reset Releases
 *
 * @param {object} model The data model object
 */
export function clearReleasesAvailableToSelect(model) {
  model.releases = []
}

/**
 * Reset release selection
 *
 * @param {object} model The data model object
 */
export function clearReleaseSelection(model) {
  model.selectedRelease = default_release_select;
}

/**
 * Reset IP Versions
 *
 * @param {object} model The data model object
 */
export function clearIPVersionsAvailableToSelect(model) {
  model.ipVersions = []
}

/**
 * Reset use case toggle
 *
 * @param {object} model The data model object
 */
export function resetUseCase(model) {
  model.selectedUseCase = default_select;
}

/**
 * Reset Selected Product selection
 *
 * @param {object} model The data model object
 */
export function resetSelectedProduct(model) {
  model.selectedProduct = default_select;
}

export function clearIPVersionSelection(model) {
  model.selectedIpVersion = default_select;
  model.artifactoryRepoData = {};
}

/**
 * Reset Schemas
 *
 * @param {object} model The data model object
 */
export function clearSchemasAvailableToSelect(model) {
  model.prepared = false;
  model.schemas = [];
}

/**
 * Reset schema selection
 *
 * @param {object} model The data model object
 */
export function clearSchemaSelection(model) {
  model.selectedSchema = default_select;
}

/**
 * Select a sprint number.
 *
 * @param {number} vid - The index of the desired sprint
 * @param {object} model The data model object
 */
export async function selectSprint(model, vid) {
  model.selectedSprint = model.sprints[vid];
  model.versions = model.allVersions.filter((i) => (i.targetAudience === model.targetAudience && i.sprintVersion === model.selectedSprint.sprintVersion));

  model.importedFileContent = null;
  model.isModelReady = false;
  clearVersionSelection(model);
  clearIPVersionSelection(model);
  clearSizeSelection(model);
  clearSizesAvailableToSelect(model);
  clearSchemaSelection(model);
  clearSchemasAvailableToSelect(model);
}

/**
 * Select a release number.
 *
 * @param {number} vid - The index of the desired sprint
 * @param {object} model The data model object
 */
export async function selectRelease(model, vid) {
  model.selectedRelease = model.releases[vid];
  model.versions = model.allVersions.filter((i) => (i.targetAudience === model.targetAudience && i.releaseNumber === model.selectedRelease.releaseNumber));

  model.importedFileContent = null;
  model.isModelReady = false;
  clearVersionSelection(model);
  clearIPVersionSelection(model);
  clearSizeSelection(model);
  clearSizesAvailableToSelect(model);
  clearSchemaSelection(model);
  clearSchemasAvailableToSelect(model);
}

/**
 * Select a release version for the given model.
 *
 * @param {number} vid - The index of the desired version
 * @param {object} model The data model object
 */
export async function selectVersion(model, vid) {
  model.selectedVersion = model.versions[vid];
  clearImportedDataFromPreviousSEDFile(model);
  model.isModelReady = false;
  clearIPVersionSelection(model);
  clearSizeSelection(model);
  clearSizesAvailableToSelect(model);
  clearSchemaSelection(model);
  clearSchemasAvailableToSelect(model);
  if (model.selectedProduct.shortName === 'pENM') {
    model.ipVersions = await getPossibleIPVersions(model, model.selectedVersion.schemaVersion);
  } else {
    model.artifactoryRepoData = await getDeploymentSizeFromArtifactory(model, model.selectedVersion.schemaVersion);
    model.ipVersions = model.selectedProduct.ipVersions;
  }
}

/**
 * Store the model object into the browser session storage
 *
 * @param {String} model_id unique identifier of the model data in the session storage
 * @param {object} model The data model object
 */
export function storeModel(model_id, model) {
  sessionStorage.setItem(model_id, JSON.stringify(model));
}

/**
 * Load the model object data from the session storage
 *
 * @param {String} model_id unique identifier of the model data ine the session storage
 * @param {object} model The data model object
 */
export function loadModelFromStorage(model_id, model) {
  if (JSON.parse(sessionStorage.getItem(model_id))){
    for (var key of Object.keys(model)) {
      model[key] = JSON.parse(sessionStorage.getItem(model_id))[key];
    }
    return true;
  }
  return false;
}

/**
 * Add the list of Excluded IP's and descriptions to the model.response
 *
 * @param {object} model - The data model object
 */
export function addExcludedIpsToResponse(model){
  model.excludeIps.forEach(function(item, index) {
    if (item['ipAddress'] != '') {
      model.response['ip_to_exclude_address_' + index] = item['ipAddress']
      if (item['ipDescription']){
        model.response['ip_to_exclude_description_' + index] = item['ipDescription']
      }
    }
  });
}

/**
 * submits model for export
 *
 * @param {object} model - The data model object
 * @param {object} router - Router object for navigation.
 */
export async function submitForm(model, router) {
  if (model.selectedProduct.sedFileFormat === "yaml") {
    await generateYamlResponse(model);
  }
  if (model.selectedProduct.sedFileFormat === "txt") {
    if (model.response[ENVIRONMENT_MODEL] === undefined) {
      showNotification('Error exporting SED file', 'To proceed, set Environment model', 'red', 'icon-check');
      throw new Error("To proceed, set Environment model");
    }
    addExcludedIpsToResponse(model);
    await generateKeyValueTextResponse(model);
  }
  await generateUpdatedSEDFile(model);
}

/**
 * filters entries in model based on category
 *
 * @param {object} category - The category name
 */
export function filterCategory(category, model) {
  let substring = "enable_";
  let keysInCategory = model.schemaForm.filter((dict) => dict.category === category);
  return keysInCategory.filter((dict) => (dict.key).startsWith(substring)).sort(function(a, b) {
      return a.key === b.key ? 0 : a.key > b.key ? 1 : -1;
    }).concat(keysInCategory.filter((dict) => !(dict.key).startsWith(substring)).sort(function(a, b) {
      return a.key === b.key ? 0 : a.key > b.key ? 1 : -1; })
    );
}

/**
 * Show a File input dialog to the user and load SED values into the model.
 *
 * @param {Object} model - Global object to store the schema and state of deployment.
 *
 */
export function loadFileFromLocalSEDFile(model) {
  const input = document.createElement('input');
  input.type = 'file';
  if (model.selectedProduct.sedFileFormat === "yaml") {
    input.accept = '.yaml,.yml';
  } else if (model.selectedProduct.sedFileFormat === "txt") {
    input.accept = '.txt,.cfg';
  }
  input.onchange = (event) => {
    readLocalSEDFile(event, model, 'select');
  };
  input.click();
}

/**
 * Allow user to drag in file and load SED values into the model.
 *
 * @param {Object} event - Event to read the SED files.
 * @param {Object} model - Global object to store the schema and state of deployment.
 *
 */
export function dragFileFromLocalSEDFile(event, model) {
  try {
    if (event.dataTransfer.files.length > 1) {
      throw new Error("Multiple files uploaded");
    }
    if (model.selectedProduct.sedFileFormat === "yaml") {
      if (event.dataTransfer.files[0].name.endsWith(".yaml") || event.dataTransfer.files[0].type.endsWith(".yml")) {
        readLocalSEDFile(event, model, 'drop');
      } else {
        throw new Error("Incompatible file type");
      }
    } else if (model.selectedProduct.sedFileFormat === "txt") {
      if (event.dataTransfer.files[0].name.endsWith(".txt") || event.dataTransfer.files[0].name.endsWith(".cfg")) {
        readLocalSEDFile(event, model, 'drop');
      } else {
        throw new Error("Incompatible file type");
      }
    }
  } catch(e) {
    if (e.message === "Multiple files uploaded") {
      showNotification('Error loading SED file', 'Upload of multiple files is unsupported, please upload one SED file only', 'red', 'icon-triangle-warning', 5000);
    }
    if (e.message === "Incompatible file type") {
      showNotification('Error loading SED file', 'SED file imported is incompatible with the Selected Product', 'red', 'icon-triangle-warning', 5000);
    }
    console.error(e);
  }
}

/**
 * Show a File input dialog to the user and load a schema into the model.
 *
 * @param {Object} model - Global object to store the schema and state of deployment.
 *
 */
export function loadFileFromLocalSchemaFile(model) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (event) => {
    readLocalSchemaFile(event, model, 'select');
  };
  input.click();
}

/**
 * Allow user to drag in file and load a schema into the model.
 *
 * @param {Object} event - Event to read the SED files.
 * @param {Object} model - Global object to store the schema and state of deployment.
 *
 */
export function dragFileFromLocalSchemaFile(event, model) {
  try {
    if (event.dataTransfer.files.length > 1) {
      throw new Error("Multiple files uploaded");
    }
    if (event.dataTransfer.files[0].name.endsWith(".json")) {
      readLocalSchemaFile(event, model, 'drop');
      }
    else {
      throw new Error("Incompatible file type");
    }
  } catch(e) {
    if (e.message === "Multiple files uploaded") {
      showNotification('Error loading Schema file', 'Upload of multiple files is unsupported, please upload one Schema file only', 'red', 'icon-triangle-warning', 5000);
    }
    if (e.message === "Incompatible file type") {
      showNotification('Error loading Schema file', 'Schema file imported is incompatible with the Selected Product', 'red', 'icon-triangle-warning', 5000);
    }
    console.error('Error importing schema: '+ e.message);
  }
}

/**
 * Read a local schema file into the model.
 *
 * @param {Object} model - Global object to store the schema and state of deployment.
 * @param {Object} event - Event to read the Schema file.
 * @param {string} uploadType - Dictates whether the file has been dropped or selected
 *
 */
export function readLocalSchemaFile(event, model, uploadType) {
  var file;

  if (uploadType === "select") {
    file = event.target.files[0];
  } else if (uploadType === "drop") {
    file = event.dataTransfer.files[0];
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      if (!reader.result.trim()) {
        throw new Error("File is empty. Please check the file.");
      }
      model.loadedSchema = JSON.parse(reader.result);
      model.importedSchemaFileName = file.name;
      model.selectedSchema.alias = 'someSchema';
      showNotification('Success', 'Schema file has been loaded', 'green', 'icon-check', 3000);
    } catch (e) {
      const title = 'Error loading Schema file';
      var description = e.message;
      const stripeColor = 'red';
      const icon = 'icon-triangle-warning';
      showNotification(title, description, stripeColor, icon);
      console.error(e);
      model.importedSchemaFileName = null;
    }
  };
  reader.readAsText(file);
}

/**
 * Read SED values into the model.
 *
 * @param {Object} model - Global object to store the schema and state of deployment.
 * @param {Object} event - Event to read the SED files.
 * @param {string} uploadType - Dictates whether the file has been dropped or selected
 *
 */

export function readLocalSEDFile(event, model, uploadType) {
  var file;
  model.usedIpAddresses = [];
  if (uploadType === "select") {
    file = event.target.files[0];
  } else if (uploadType === "drop") {
    file = event.dataTransfer.files[0];
  }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      if (!reader.result.trim()) {
        throw new Error;
      }
      if (model.selectedProduct.sedFileFormat === "yaml") {
        model.importedFileContent = yaml.load(reader.result, { schema: yaml.CORE_SCHEMA });
      } else if (model.selectedProduct.sedFileFormat === "txt") {
        model.importedData = {};
        var tempArray = reader.result.split("\n");
        var ignoreIPAddresses = ["Services (public IPv6)_ipaddress_start=", "Services (public IPv6)_ipaddress_end=", "Jgroups_ipaddress_start=", "Jgroups_ipaddress_end=",
                                 "Internal_ipaddress_start=", "Internal_ipaddress_end=", "Storage_ipaddress_start=", "Storage_ipaddress_end="];
        tempArray = tempArray.filter((line) => !ignoreIPAddresses.some((temp) => line.includes(temp)));
        model.importedFileContent = tempArray.filter(line => (!line.startsWith("#"))).filter(line => line.trim().length > 0).filter(line => line !== "\r");
        model.importedFileContent = model.importedFileContent.map(e => e.trim());
        let exclusion_ip_address = [];
        let exclusion_ip_descriptions = [];
        model.importedFileContent.forEach((entry) => {
          var lineNo = tempArray.indexOf(entry) + 1;
          if (!entry.match(/^[\\s\\t]*[^\\s\\t=]+.*=.*$/i)) {
            throw new Error("To proceed, resolve the unexpected error at line " + lineNo + " in imported file");
          }
          var [key, value] = entry.split('=');
          value = value.trim();
          if (key === "ip_version" && !model.ipVersions.some(item => item.name.toLowerCase() === value.toLowerCase())) {
            throw new Error("The ip_version key has value: " + value + " at line " + lineNo + ". Allowed values are : [" + model.ipVersions.map(item => item.name) + "]");
          }
          const isEnvironmentModel = (element) => element.includes(ENVIRONMENT_MODEL);
          if (tempArray.findIndex(isEnvironmentModel) == -1) {
            throw new Error("To proceed, set Environment model");
          }
          if (key.includes('ip_to_exclude_address_')){
            const splitArr = key.split("_");
            let index = splitArr[splitArr.length - 1];
            exclusion_ip_address.push({value: value, index: index })
          }
          if (key.includes('ip_to_exclude_description_')){
            const splitArr = key.split("_");
            var index = splitArr[splitArr.length - 1];
            exclusion_ip_descriptions.push({value: value, index: index })
          }
          if ((value !== undefined && value !== null) && (isIP(value.split('/')[0]) == 4 || isIP(value.split('/')[0]) == 6)) {
            model.usedIpAddresses.push({ name: key, value: value });
          }
        });
        for (let i = 0; i < exclusion_ip_address.length; i++) {
          model.excludeIps.splice(exclusion_ip_address[i]['index'],1,{ ipAddress: exclusion_ip_address[i]['value'], ipDescription: '', isDuplicate: false, errorMessage: false });
        }
        for (let i = 0; i < exclusion_ip_descriptions.length; i++) {
          model.excludeIps[exclusion_ip_descriptions[i]['index']]['ipDescription'] = exclusion_ip_descriptions[i]['value'];
        }
      }
      checkLoadedENMSize(model);
      checkIPversion(model);
      model.importedFileName = file.name;
      showNotification('Success', 'SED file has been loaded', 'green', 'icon-check', 3000);
    } catch (e) {
      const message = e.message;
      let errNo = message.match(/line (\d+)|\((\d+):/);
      const title = 'Error loading SED file';
      var description = message;
      const stripeColor = 'red';
      const icon = 'icon-triangle-warning';
      if (!reader.result.trim()) {
        description = "File is empty. Please check the file.";
      }
      else if (model.selectedProduct.sedFileFormat === "yaml")  {
        description = "To proceed, resolve the unexpected error at line " + (errNo[1] || errNo[2]) + " in imported file";
      }
      showNotification(title, description, stripeColor, icon);
      console.error(e);
      model.importedFileContent = null;
      model.importedFileName = null;
    }
  };
  reader.readAsText(file);
}

/**
 * Toggle between an Initial and an Upgrade scenario.
 * For an Initial, reset importedFileContent data read from a previous SED file.
 *
 * @param {Object} model - Global object to store the schema and state of deployment.
 *
 */
export function togglePreviousSED(model) {
  model.usePreviousSED = !model.usePreviousSED;
  if(model.selectedUseCase.name === 'Upgrade' && !model.usePreviousSED) {
    model.showPreviousSedFileNeeded = true;
  }
  if (!model.usePreviousSED) {
    clearImportedDataFromPreviousSEDFile(model);
  }
}

/**
 * Traverse the schema and populate the model with YAML/TXT values read from the previous SED.
 *
 * @param {Object} model - Global object to store the schema and state of deployment.
 *
 */
export function populateValuesFromImportedSedFile(model) {
  if (model.importedFileContent) {
    if (model.selectedProduct.sedFileFormat === "yaml") {
      model.schemaForm.forEach(prop => {
        const alternateKeys = prop.alternateKeys;
        if (prop.keys !== undefined) {
          const keyPathArray = prop.keys.concat(alternateKeys ? alternateKeys : []);
          const previousValue = findInObject(model.importedFileContent, keyPathArray);
          model.importedData[prop.key] = previousValue;
          if (previousValue !== "" && previousValue !== undefined && previousValue !== null) {
            model.response[prop.key] = previousValue;
          }
        }
     });
      model.autopopulatedValues = model.importedFileContent.autopopulatedValues
      model.response = { ...model.response, ...model.autopopulatedValues };
      model.immutableImportedData = JSON.parse(JSON.stringify(model.importedData));
    } else if (model.selectedProduct.sedFileFormat === "txt") {
      const keysToCompare = findKeysToCompare(model.schemaForm);
      model.importedFileContent.forEach(line => {
        const [key, value] = [line.substring(0, line.indexOf('=')), line.substring(line.indexOf('=')+1)];
        // if there is a value in the schema for a field it will be honoured unless the keys start with "enable_"
        // to handle keys that have a default value that is expected to change e.g. enable_fallback.
        if (model.response[key] && !key.startsWith("enable_")) {
          model.importedData[key] = value.trim();
          return;
        }
        if (keysToCompare[key] && value !== "") {
          model.response[key] = model.importedData[key] = value.trim();
        }
        model.immutableImportedData = model.importedData;
      });
    }
  }
}

/**
 * Find a value in an object by looking at keys in schemaForm
 *
 * @param {Object} tempSchemaForm - Contains the values read from the schemaForm.
 * @returns {Object} keysToCompare - Dictionary of all keys present in schemaForm
 *
 */
export function findKeysToCompare(tempSchemaForm) {
  const keysToCompare = {};
  tempSchemaForm.forEach(prop => {
    keysToCompare[prop.key] = true;
  });
  return keysToCompare;
}

/**
 * Returns a list of Keys in the schemaForm sorted by category
 *
 * @param {Object} model - Global object to store the schema and state of deployment.
 * @returns {Object} sortedListOfKeysByCategories - Dictionary of all keys in the schemaForm sorted by category
 *
*/
export function sortedKeys(model) {
  let cats = model.dataTypeCategories.map(a => a.shortName);
  model.schemaForm.forEach(prop => {
    if (!cats.includes(prop.category)) {
      cats.push(prop.category);
    }
  });
  const sortedListOfKeysByCategories = [];
  cats.forEach(cat => sortedListOfKeysByCategories.push(...filterCategory(cat, model).map(a => a.key)));
  return sortedListOfKeysByCategories;
}

/**
 * Show a temporary popup notification
 *
 * @param {string} title - Notification title
 * @param {string} description - Notification description
 * @param {string} stripeColor - Notification left side stripe: 'gray', 'red', 'orange', 'yellow', 'purple', 'blue' or 'green'
 * @param {string} icon - Icon displayed next to the title of the notification: 'icon-check' or 'icon-triangle-warning'
 *
 */
export function showNotification(title, description, stripeColor, icon, timeout=null) {
  const notification = new Notification({
    title: title,
    description: description,
    icon: icon,
    stripeColor: stripeColor,
    timeout: timeout
  })
  notification.init();
}


/**
 * Verify that the ENM size selected on the GUI dropdown matches the ENM read from the SED file.
 * It not, enable the visibility of a Notification popup and reset the values loaded from the file.
 *
 * @param {Object} model - Global object to store the schema and state of deployment.
 *
 */
export function checkLoadedENMSize(model) {
  let fromStateENMSize = '';
  let toStateENMSize = '';
  if (model.selectedProduct.sedFileFormat === "yaml") {
    toStateENMSize = model.selectedSize.type;
    fromStateENMSize = model.importedFileContent?.global?.enmProperties?.enm_deployment_type;
    if (toStateENMSize !== fromStateENMSize) {
      console.error('Error - Sizes do not match. From state size: ' + fromStateENMSize + '. To state size: ' + toStateENMSize);
      model.showcENMSizeMismatchNotification = true;
    }
  } else if (model.selectedProduct.sedFileFormat === "txt") {
    const matcher = new RegExp(ENVIRONMENT_MODEL + `=`, 'g');
    const [entry] = model.importedFileContent.filter(word => word.match(matcher));
    fromStateENMSize = entry.split('=')[1];
    toStateENMSize = model.selectedSchema.sizeAlias;
    if (toStateENMSize !== fromStateENMSize) {
      console.error('Error - Sizes do not match. From state size: ' + fromStateENMSize + '. To state size: ' + toStateENMSize);
      model.showpENMSizeMismatchNotification = true;
    }
  }
}

/**
 * Verify that the Ip Version selected on the GUI dropdown matches the Ip version read from the SED file.
 * It not, enable the visibility of a Notification popup and reset the values loaded from the file.
 *
 * @param {Object} model - Global object to store the schema and state of deployment.
 *
 */
export function checkIPversion(model) {
  let toStateIpVersion = model.selectedIpVersion.name;
  let fromStateIpVersion = '';
  if (model.selectedProduct.sedFileFormat === "yaml") {
    fromStateIpVersion = model.importedFileContent?.global?.ip_version;
  } else if (model.selectedProduct.sedFileFormat === "txt") {
    const matcher = new RegExp('ip_version=', 'g');
    const [entry] = model.importedFileContent.filter(word => word.match(matcher));
    fromStateIpVersion = entry.split('=')[1];
  }

  if (toStateIpVersion.toLowerCase() !== fromStateIpVersion.toLowerCase()) {
    console.error('Error - Ip Versions do not match');
    model.showIpVersionMismatchNotification = true;
  }
}

/**
 * Event listener for the OK button pressed on the Dialog to delete all previously filled data
 *
 * @param {Object} model - Global object to store the schema and state of deployment.
 * @param {Object} router - Router object for navigation.
 *
 */
export function deleteAllDataDialogOkFunction(model, router) {
  var defaultResponse = '{"ip_version":' + JSON.stringify(model.response.ip_version) + '}';
  model["response"] = JSON.parse(defaultResponse);
  model.updated_data = {};
  model.showDeleteAllDataConfirmation = true;
  resetDeployment(model)
  setupDeploymentSchema(model, router);
}

/**
 * Event listener for the Cancel button pressed on the Dialog to delete all previously filled data
 *
 * @param {Object} model - Global object to store the schema and state of deployment.
 * @param {Object} router - Router object for navigation.
 *
 */
export function deleteAllDataDialogCancelFunction(model, router) {
  model.userDataCleared = false;
  model.showDeleteAllDataConfirmation = true;
  model.selectedIpVersion = model.storedSchema.ipVersion;
  model.selectedVersion = model.storedSchema.version;
  model.selectedSprint = model.storedSchema.sprint;
  model.selectedRelease = model.storedSchema.release;
  model.selectedSchema = model.storedSchema.type;
  model.selectedSize = model.storedSchema.size;
  model.schemas = model.storedSchema.availableSchema;
  if(model.storedSchema.loadedFileContent !== null) {
    model.usePreviousSED = true;
    model.importedFileContent = model.storedSchema.loadedFileContent;
    model.importedFileName = model.storedSchema.loadedFileName;
  }
  setupDeploymentSchema(model, router);
}

/**
 * Event listener for the OK button pressed on the Dialog at the end page to export SED
 *
 * @param {Object} model - Global object to store the schema and state of deployment.
 */
export function exportSEDConfirm(model) {
  model.showDeleteAllDataConfirmation = true;
}

/**
 * AutoPopulates IP Address for any specified IP Address Type
 *
 * @param {Object} autoPopulationType - a type of IP Address
 * @param {Object} model - Global object to store the schema and state of deployment.
 */
export function autoPopulateIpAddresses(model, autoPopulationType) {
 try {
  var usedIps = getPopulatedValuesToCheckForDuplicates(model);
  var nextIP = model.response[autoPopulationType.shortName + '_ipaddress_start'];
  var lastIP = model.response[autoPopulationType.shortName + '_ipaddress_end'];
  nextIP = nextIP.includes(':') ? colonAdder(nextIP) : nextIP;
  lastIP = lastIP.includes(':') ? colonAdder(lastIP) : lastIP;
  var fields = model.schemaForm.filter((dict) => checkFieldAutopopulationRequired(dict, autoPopulationType.shortName, model));
  fields.forEach((field) => {
   while (usedIps.includes(nextIP)) {
     (nextIP.includes(':') ? nextIP = incrementIPv6Address(nextIP) : nextIP = incrementIPv4Address(nextIP));
   }
   if (isNextIPLessThanLastIP(nextIP, lastIP) && !usedIps.includes(nextIP) && !model.response[field.key]) {
    usedIps.push(nextIP);
    model.response[field.key] = nextIP;
   }
  });
  model.autopopulatedValues[autoPopulationType.shortName + '_ipaddress_start'] = model.response[autoPopulationType.shortName + '_ipaddress_start'];
  model.autopopulatedValues[autoPopulationType.shortName + '_ipaddress_end'] = model.response[autoPopulationType.shortName + '_ipaddress_end'];
   showNotification('Success', autoPopulationType.name + ' Auto-population has been successful', 'green', 'icon-check', 3000);
 } catch (e) {
    const title = 'Error in Auto-population process';
    const description = e.message;
    const stripeColor = 'red';
    const icon = 'icon-triangle-warning';
    showNotification(title, description, stripeColor, icon);
    console.error(e.message);
 }
}

/**
 * Returns all used values that should be checked for duplicates
 *
 * @param {Object} model - Global object to store the schema and state of deployment.
 */
export function getPopulatedValuesToCheckForDuplicates(model) {
  const schemaFormKeys = model.schemaForm
    .filter(item => item.preventDuplicates === true)
    .map(item => item.key);
  let usedValues = Object.entries(model.response)
    .filter(([key]) => schemaFormKeys.includes(key))
    .map(([_, value]) => value);
  usedValues.push(...getExcludedIps(model));
  model.usedIpAddresses.forEach((ipAddress) => {
    usedValues.push(ipAddress);
  });
  return usedValues.filter(value => value !== null && value !== '');
}

/**
 * Increments IPv4 Address
 *
 * @param {string} ipv4Address - a standard ipv4Address
 */
export function incrementIPv4Address(ipv4Address) {
  var segments = ipv4Address.split('.');
  let ip = (segments[0] << 24) | (segments[1] << 16) | (segments[2] << 8) | (segments[3] << 0);
  ip++;
  return [ip >> 24 & 0xff, ip >> 16 & 0xff, ip >> 8 & 0xff, ip >> 0 & 0xff].join(".");
}

/**
 * Increments IPv6 Address
 *
 * @param {string} ipv6Address - a standard ipv6Address
 */
export function incrementIPv6Address(ipv6Address) {
  const parts = ipv6Address.split('/');
  ipv6Address = parts[0];
  ipv6Address = ipv6Address.slice(0, ipv6Address.lastIndexOf(':')) + ':'.repeat(8 - ipv6Address.split(':').length) + ipv6Address.slice(ipv6Address.lastIndexOf(':'));
  ipv6Address = ipv6Address.replace(/:(?=:)/g, ':0').replace(/:$/, ':0');
  const address = ipv6Address.toLowerCase();
  const segments = address.split(':');
  const ints = segments.map(segment => parseInt(segment, 16));
  ints[7]++;

  for (let i = 7; i >= 0; i--) {
     if (ints[i] > 65535) {
        ints[i] = 0;
        ints[i - 1]++;
     }
  }

  const hexSegments = ints.map(int => int.toString(16).padStart(4, '0'));
  const nextIPv6Address = hexSegments.join(':');
  return (parts.length > 1) ? `${nextIPv6Address}/${parts[1]}` : nextIPv6Address;
}

/**
 * Check if there is a value to be updated in input box.
 *
 * @param {string} key: the key name of the parameter
 */
export function updateResponse(model, key) {
  if (model.response[key].length === 0) {
    delete model.response[key];
  }
}

/**
 * Check if Ip address are less than Last Ip address allowed in range
 *
 * @param {string} nextIP: the nextIp to be checked
 * @param {string} lastIP: the lastIP in the range
 */
export function isNextIPLessThanLastIP(nextIP, lastIP) {
  if (nextIP.includes(':')) {
    var tempNextIP = nextIP.split('/');
    var tempLastIP = lastIP.split('/');
    nextIP = tempNextIP[0];
    lastIP = tempLastIP[0];
    nextIP = nextIP.slice(0, nextIP.lastIndexOf(':')) + ':'.repeat(8 - nextIP.split(':').length) + nextIP.slice(nextIP.lastIndexOf(':'));
    lastIP = lastIP.slice(0, lastIP.lastIndexOf(':')) + ':'.repeat(8 - lastIP.split(':').length) + lastIP.slice(nextIP.lastIndexOf(':'));
    nextIP = nextIP.replace(/:(?=:)/g, ':0').replace(/:$/, ':0');
    lastIP = lastIP.replace(/:(?=:)/g, ':0').replace(/:$/, ':0');
    nextIP = nextIP.split(':').map(str => Number('0x'+str)).reduce(function(int, value) { return BigInt(int) * BigInt(65536) + BigInt(+value) });
    lastIP = lastIP.split(':').map(str => Number('0x'+str)).reduce(function(int, value) { return BigInt(int) * BigInt(65536) + BigInt(+value) });
  } else {
    nextIP = nextIP.split('.').reduce(function(ipInt, octet) { return (ipInt<<8) + parseInt(octet, 10)}, 0) >>> 0;
    lastIP = lastIP.split('.').reduce(function(ipInt, octet) { return (ipInt<<8) + parseInt(octet, 10)}, 0) >>> 0;
  }
  return (nextIP <= lastIP);
}

/**
 * Check if Ipv6 address octet length is 8 by adding more zeros for padding
 *
 * @param {string} incompleteIP: the IPv6 to be checked
 */
export function colonAdder(incompleteIP) {
  if (incompleteIP.split(":").length < 8) {
    const index = incompleteIP.lastIndexOf(":");
    return colonAdder(incompleteIP.slice(0, index) + ":" + incompleteIP.slice(index));
  }
  let ipAfterReplace = incompleteIP.replace(/:(?=:)/g, ':0').replace(/:$/, ':0');
  var completeIP = ipAfterReplace.split(":").map(x => x.padStart(4, '0'));
  return completeIP.join(":");
}

/**
 * AutoPopulates Hostnames for all hostnames if not pre-occupuied
 *
 *
 * @param {Object} model - Global object to store the schema and state of deployment.
 */
export function autoPopulateHostnames(model) {
 try {
  const prefix = model.response['hostname_prefix'];
  const sfsHostNames = ["sfs_node1_hostname", "sfs_node2_hostname"];
  const fieldsToAutoPopulate = model.schemaForm.filter((dict) => checkFieldAutopopulationRequired(dict, "hostname", model));
  fieldsToAutoPopulate.forEach((field) => {
   if (!model.response[field.key]) {
     var target = field.key.split("_");
     var node = target[0];
     var nodeNumber = target[1].match(/\d/g);
     if (sfsHostNames.includes(field.key)) {
       model.response[field.key] = prefix + "nas" + nodeNumber;
     } else if (field.key === "LMS_hostname") {
       model.response[field.key] = prefix + "ms";
     } else {
       model.response[field.key] = prefix + node + nodeNumber;
     }
   }
   model.autopopulatedValues['hostname_prefix'] = model.response['hostname_prefix'];
  });
   showNotification('Success', 'Hostname auto-population has been successful', 'green', 'icon-check', 3000);
 } catch (e) {
    const title = 'Error in Auto-population process';
    const description = e.message;
    const stripeColor = 'red';
    const icon = 'icon-triangle-warning';
    showNotification(title, description, stripeColor, icon);
    console.error(e.message);
 }
}

/**
 * Get an object of deployment size that contains the schema structure from backend API
 *
 * @param {Object} model - Global object to store the schema and state of deployment.
 * @param {string} schemaVersion: The schema version of deployment size to get
 * @returns {Object} - The object of deployment size that contains the schema structure
 */
export async function getDeploymentSizeFromArtifactory(model, schemaVersion) {
  let backend_ext_api = SED_API_URL + "extapi/data/?dir=";
  let schemaStructure = {};
  try {
    let folders = await axiosGetSubList(backend_ext_api + model.selectedProduct.shortName.toLowerCase() + "/" + schemaVersion);

    if (model.selectedProduct.shortName === 'pENM') {
      if(folders && Array.isArray(folders)) {
        for (const folder of folders) {
          if (folder.folder) {
            const folderFile = await axiosGetSubList(backend_ext_api + model.selectedProduct.shortName.toLowerCase() + "/" + schemaVersion + folder.uri);
            if (folderFile) {
              const k = folder.uri.replace('/', '');
              schemaStructure[k] = folderFile;
              schemaStructure[k].folder = true;
            }
          }
        }
      }
    } else {
      return folders;
    }
  } catch(e) {
    const title = 'Error fetching data from Artifactory. Please try again later.';
    showNotification(title, e.message, 'red', 'icon-triangle-warning');
    console.error(title + e);
  }
  return schemaStructure;
}

/**
 * Given the link to the backend API and call to get the children data from the response
 *
 * @param {string} url: The link to JFROG API
 * @returns {Object} - Children(sublist) data of the given link
 */
export async function axiosGetSubList(url) {
  return await axios.get(url, { timeout: serverTimeout })
                .then(res => {
                  if(res.data.children) {
                    return res.data.children;
                  } else {
                    console.error("No sublist has been found!");
                    return res.data;
                  }
                })
                .catch(error => {
                  if (error.code === 'ECONNABORTED') {
                    console.error('Request timed out, please try again later');
                  } else {
                    console.error("There was an error!", error);
                  }
                });
}

/**
 * Checks if a given SED parameter should be autopopulated
 *
 * @param {Object} sedParam - The SED parameter object to check if IP autopopulation is required
 * @param {String} autoPopulationTypeName - A type of IP Address
 * @param {Object} model - Global object to store the schema and state of deployment.
 */
export function checkFieldAutopopulationRequired(sedParam, autoPopulationTypeName, model) {
  if (sedParam.autoPopulate === autoPopulationTypeName) {
    return checkShouldParamBeDisplayed(model, sedParam);
  }
  return false;
}

/**
 * storeDeploymentDetails - This function stores selected schema in a dictionary
 *
 * @param {object} model The data model object
 */
export function storeDeploymentDetails(model) {
  model.storedSchema.type= model.selectedSchema;
  model.storedSchema.size = model.selectedSize;
  model.storedSchema.ipVersion = model.selectedIpVersion;
  model.storedSchema.version = model.selectedVersion;
  model.storedSchema.sprint = model.selectedSprint;
  model.storedSchema.release = model.selectedRelease;
  model.storedSchema.availableSchema = model.schemas;
  model.storedSchema.loadedFileContent = model.importedFileContent;
  model.storedSchema.loadedFileName = model.importedFileName;
  model.storedSchema.csarLite = model.csarLite;
}

/**
 * Checks if a SED parameter should be displayed based on the provided model and display conditions.
 *
 * @param {object} model - The data model object.
 * @param {object} sedParam - The SED parameter object to be checked for required status.
 *
 * @returns {boolean} True if the question is displayed, false otherwise.
 */
export function checkShouldParamBeDisplayed(model, sedParam) {
  if (!sedParam.displayIf && !sedParam.displayIfNot) {
    return true;
  }
  if (!Array.isArray(sedParam.displayIf) && !Array.isArray(sedParam.displayIfNot)) {
    return false;
  }
  if (Array.isArray(sedParam.displayIf)) {
    let keyValues =[];
    sedParam.displayIf.forEach((entry) => {
      if (model.response[entry] === undefined && entry === 'enable_fallback') {
        keyValues.push(model.response['enable_fallback_category']);
      } else {
        keyValues.push(model.response[entry]);
      }
    });
    let includesFalseOrUndefined = keyValues.includes(false) || keyValues.includes("false") || keyValues.includes(undefined);
    return keyValues.length > 0 && !includesFalseOrUndefined;
  }
  if (Array.isArray(sedParam.displayIfNot)){
    return sedParam.displayIfNot.every(key => (model.response[key] === false || model.response[key] === "false"));
  }
}

/**
 * Updates the 'optional' property in the loaded schema based on the provided model.
 *
 * This function examines the response properties of the model and sets certain parameters as required or optional
 * in the loaded schema based on display conditions and configuration.
 *
 * @param {Object} model - The data model object.
*/
export function updateSchemaOptionalValues(model){
  let setRequired = []
  for (const key in model.response) {
    if (model.displayKeys.includes(key) && model.response[key] === "true") {
      setRequired.push(key)
    }
  }
  for (const param in model.loadedSchema.properties.parameters.properties) {
    if (model.loadedSchema.properties.parameters.properties[param]['displayIf']) {
      model.loadedSchema.properties.parameters.properties[param]['optional'] = true;
    }
  }
  if (setRequired.length){
    for (let i = 0; i < setRequired.length; i++) {
      for (const param in model.loadedSchema.properties.parameters.properties) {
        if (model.loadedSchema.properties.parameters.properties[param]['displayIf'] &&
          model.loadedSchema.properties.parameters.properties[param]['displayIf'].includes(setRequired[i]) &&
          !model.loadedSchema.properties.parameters.properties[param]['keepOptional']) {
          model.loadedSchema.properties.parameters.properties[param]['optional'] = false;
        }
      }
    }
  }
}

/**
 * Validates a toleration object based on the specified tolerationInfo.
 *
 * @param {Object} toleration - The toleration object to be validated.
 * @param {Object} sedParam - The SED schema parameter with all toleration info.
 * @param {Object} displayNotification - Toggle to display the error Notification. Default is True.
 *
 * @returns {boolean} - True if the toleration is valid, false otherwise.
 */
export function isValidToleration(toleration, sedParam, displayNotification=true) {
  let errorCount = getTolerationErrorsCount(toleration, sedParam.tolerationInfo);
  if (displayNotification && errorCount > 0) {
    showNotification('Error', 'Please ensure all Toleration(s) are correctly populated or deleted.', 'red', 'icon-check', 6000);
  }
  return errorCount === 0;
}

/**
 * Validate object and return if it is valid and add isValid to the object
 *
 * @param {object} model - The data model object.
 * @param {object} currentQuestion - The currentQuestion that includes the validation information
 *
 * @returns {boolean} True if the question is valid, false otherwise.
 */
export function isValidObject(model, currentQuestion) {
  let isValid;
  if (model.response[currentQuestion.key] === undefined) {
    return !currentQuestion.required;
  }
  if (currentQuestion.type === 'nodeSelector') {
    isValid = isValidNodeSelectors(model.response[currentQuestion.key], currentQuestion.nodeSelectorInfo);
  } else if (currentQuestion.type === 'objectArray') {
    isValid = isValidObjectArrayInput(model.response[currentQuestion.key], currentQuestion.objectArrayInfo);
  } else  if (currentQuestion.type === 'array') {
    isValid = isValidArray(model.response[currentQuestion.key], currentQuestion.validationPattern);
  } else if (currentQuestion.type === 'customObject') {
    isValid = validateAllCustomObjectEntries(model.response[currentQuestion.key], currentQuestion.customObjectInfo, currentQuestion.required);
  }
  let currentSchema = model.schemaForm.find( parameter => {
    return parameter.key === currentQuestion.key;
  });
  currentSchema.isValid = isValid;
  return isValid;
}

/**
 * Check if question is immutable
 *
 * @param {object} model - The data model object.
 *
 * @returns {boolean} True if the question is valid and immutable, false otherwise if question is invalid.
 */
export function isQuestionImmutable(model) {
  if(model.selectedUseCase.name === 'Upgrade' && model.currentQuestion.immutable === true) {
    return model.currentQuestion.isValid;
  }
  return false;
}

/**
 * Checks if a value is valid based on a given validation pattern.
 * @param {String} value - The value to be validated.
 * @param {string} validationPattern - The validation pattern to match against.
 * @returns {boolean} Returns true if the value is valid according to the validation pattern, otherwise false.
 */
export function isValidValue(value, validationPattern) {
  if (value === null || value === undefined) {
    return true;
  }
  if (value === "") {
    return false;
  }
  return new RegExp(validationPattern).test(value);
}

/**
 * Convert dec to hex string
 *
 * @param {string} dec - dec number
 *
 * @returns {string} - hex string format of dec number
 */
export function dec2hex (dec) {
  return dec.toString(16).padStart(2, "0");
}

/**
 * Loads a YAML file selected by the user and reads its content.
 * @param {Object} model - The model object where the YAML content will be stored.
 */
export function loadFileFromLocalBaseTemplateFile(model) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.yaml,.yml';
  input.onchange = (event) => {
    readBaseYamlTemplateFile(event, model, 'select');
  };
  input.click();
}

/**
 * Reads the content of a YAML values file template uploaded by the user.
 @param {Event} event - The event object triggered by the file upload.
 @param {Object} model - The model object where the YAML content will be stored.
 @param {string} uploadType - The type of upload ('select' for file selection, 'drop' for drag and drop).
 */
export function readBaseYamlTemplateFile(event, model, uploadType) {
  let file;
  if (uploadType === "select") {
    file = event.target.files[0];
  } else if (uploadType === "drop") {
    file = event.dataTransfer.files[0];
  }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      if (!reader.result.trim()) {
        throw new Error(
            "File is empty. Please check the file."
        );
      }
      model.importedBaseYamlContent = yaml.load(reader.result, {schema: yaml.CORE_SCHEMA});
      model.importedBaseYamlFileName = file.name;
      showNotification('Success', 'File has been loaded', 'green', 'icon-check', 3000);
    } catch (e) {
      const message = e.message;
      let errNo = message.match(/line (\d+)|\((\d+):/);
      let description = message;
      if (!reader.result.trim()) {
        description = "File is empty. Please check the file.";
      } else if (model.selectedProduct.sedFileFormat === "yaml") {
        description = "To proceed, resolve the unexpected error at line " + (errNo[1] || errNo[2]) + " in imported file";
      }
      showNotification('Error loading Yaml file', description, 'red', 'icon-triangle-warning');
      console.error(e);
      model.importedBaseYamlContent = null;
      model.importedBaseYamlFileName = null;
    }
  };
  reader.readAsText(file);
}
export default model;
