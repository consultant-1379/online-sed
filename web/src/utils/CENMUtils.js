import {
  downloadIntegrationYaml,
  INTEGRATION_YAML_FILE_URL}
  from "./utils.js";
import yaml from "js-yaml";

/**
 * generateYamlResponse - is an async function that updates the `updated_data` property of a model for cENM.
 * @async
 * @param {Object} properties - properties object in the schema which contains keys.
 * @param {Object} sedValues - sedValues object contains the values of the previous keys.
 * @returns {Object} resultData - resultData Object contains the values written into the yaml file.
 */
export async function generateYamlResponse(properties, sedValues) {
  let resultData
  for (const key in properties ) {
    if (key.endsWith("_ipaddress_start") || key.endsWith("_ipaddress_end")){
      continue;
    }
    let prop = properties[key];
    prop.keys.forEach(k => {
      if (isDisplayConditionMet(sedValues, prop.displayIf, prop.displayIfNot)) {
        const location = k.split('.');
        const locationToResponse = createNestedObject(location, sedValues[key]);
        resultData = deepMergeObjects(resultData, locationToResponse);
      }
    });
  }
  return resultData;
}

/**
 * Checks if the display conditions are met based on the input data.
 * @param {Object} inputData The input data object.
 * @param {string[]} displayIf An array of keys that need to be true for the condition to be met.
 * @param {string[]} displayIfNot An array of keys that need to be false for the condition to be met.
 * @returns {boolean} True if the display conditions are met, otherwise false.
 */
export function isDisplayConditionMet(inputData, displayIf, displayIfNot) {
  if (displayIf && !displayIf.every(key => isTrueOrStringTrue(inputData[key]))) {
    return false;
  } else if (displayIfNot && !displayIfNot.every(key => isFalseOrStringFalse(inputData[key]))) {
    return false;
  }
  return true;
}

/**
 * Creates a nested object from the given `location` array and the `response` value.
 *
 * @param {string[]} location - The array of keys that defines the structure of the nested object.
 * @param {*} response - The value to be placed in the deepest level of the nested object.
 * @returns {Object} The nested object created from the `location` array and the `response` value.
 */
export function createNestedObject(location, response) {
  return location.reduceRight((acc, cur) => ({ [cur]: acc }), response);
}

/**
 * Recursively merges properties of `dict2` into `dict1`. Nested objects will also be merged.
 *
 * @param {Object} dict1 - The base object to be merged into.
 * @param {Object} dict2 - The object to be merged.
 * @returns {Object} A new object resulting from the deep merge of `dict1` and `dict2`.
 */
export function deepMergeObjects(dict1 = {}, dict2 = {}) {
  if (dict1 === null || dict2 === null) {
    return;
  }
  return Object.entries(dict2).reduce((acc, [key, value]) => {
    if (value === null || value === undefined) {
      acc[key] = null;
    } else if (Array.isArray(value)) {
      if (key === 'exclusions') {
        // In pENM exclusions requires an array with a single object with 2 keys logplane (always null) and rules.
        for (const excl of value) {
          if (excl.hasOwnProperty('field')) {
            acc[key] = [{logplane: null, rules: value}];
          } else {
            acc[key] = value;
          }
        }
      } else {
        acc[key] = value; // Preserve Array values from dict2
      }
    } else if (acc.hasOwnProperty(key) && typeof acc[key] === 'object' && typeof value === 'object') {
      acc[key] = deepMergeObjects(acc[key], value);
    } else {
      acc[key] = stringToBoolean(value);
    }
    return acc;
  }, { ...dict1 });
}

/**
 * Converts a string representation of boolean values to actual boolean values.
 * The function converts strings "true" and "false" (case insensitive) to
 * corresponding boolean values. Other strings are returned as is.
 *
 * @param value - The value to convert to a boolean value.
 * @returns {boolean|string} - The boolean value if the input value is "true" or "false", otherwise returns the original value.
 */
export function stringToBoolean(value) {
  if(typeof value === 'string') {
    const lowerCaseStr = value.toLowerCase();
    if (lowerCaseStr === "true") {
      return true;
    } else if (lowerCaseStr === "false") {
      return false;
    }
  }
  return value;
}

/**
 * Find a value in an object by looking at multiple key paths
 *
 * @param {Object} obj - Contains the values read from a YAML file.
 * @param {Array} keyPathArray - An array of arrays representing candidate key paths in the Object.
 * @returns {any} The first value found in the object by using the given key paths, or undefined.
 *
 */
export function findInObject(obj, keyPathArray) {
  let previousValue;
  for (let i = 0; i < keyPathArray.length; i++) {
    const key_path = keyPathArray[i].split('.');
    previousValue = key_path.reduce((o, key) => {
      return o ? o[key] : undefined;
    }, obj);
    if (previousValue) {
      break;
    }
  }
  return previousValue;
}

/**
 * Reads object details based on the provided schema definition.
 * @param {Object} schemaDefinition - The schema definition containing object information.
 * @param {Object} allSchemaDefinitions - All schema definitions.
 * @param {string} objectInfo - Name of the objectInfo.
 * @returns {Object} - Object details object.
 */
export function readObjectDetails(schemaDefinition, allSchemaDefinitions, objectInfo) {
  const info = schemaDefinition[objectInfo];
  if (!info) {
    return {};
  }
  const properties = info.items.properties;
  const objectDetails = {};
  for (const propName in properties) {
    const propertyDef = properties[propName];
    const ref = propertyDef.$ref;
    const defKeyName = ref.substring(ref.lastIndexOf("/") + 1);
    const definition = allSchemaDefinitions[defKeyName];
    const inputType = definition.format !== undefined ?definition.format : definition.type;
    objectDetails[propName] = {
      required: !(propertyDef.optional || definition.optional),
      description: definition.description || '',
      errorMessage: definition.validationMessage || '',
      isValid: false,
      type: definition.enum ? 'select' : inputType,
      options: definition.enum ? [...definition.enum] : undefined,
      validationPattern: definition.pattern || '',
      preventDuplicates: definition.preventDuplicates || false,
      defaultValue: propertyDef.defaultValue || definition.defaultValue,
      tag: propertyDef.tag || ''
    };
  }
  return objectDetails;
}

/**
 * Validates a toleration object based on the specified tolerationInfo.
 *
 * @param {Object} toleration - The toleration object to be validated.
 * @param {Object} tolerationInfo - The SED schema parameter with all toleration info.
 *
 * @returns {number} - The count of errors in toleration object.
 */
export function getTolerationErrorsCount(toleration, tolerationInfo) {
  let errorCount = 0;
  Object.entries(tolerationInfo).forEach(([field, info]) => {
    if (field === "value" && toleration["operator"] === "Exists") {
      return;
    }
    if ((toleration[field] === "" || !toleration.hasOwnProperty(field))) {
      if (info.required){
        errorCount++;
      } else {
        return;
      }
    }
    if ((field === "operator" || field === "effect") && toleration[field] === undefined) {
      errorCount++;
    }
    if (!RegExp(info.validationPattern).test(toleration[field])) {
      errorCount++;
    }
  });
  return errorCount;
}

/**
 * Validates a nodeSelector object based on the specified nodeSelectorInfo.
 *
 * @param {Object} nodeSelector - The nodeSelector object to be validated.
 * @param {Object} nodeSelectorInfo - The SED schema parameter with all nodeSelector info.
 *
 * @returns {boolean} - True if the nodeSelector is valid, false otherwise.
 */
export function isValidNodeSelectors(nodeSelector, nodeSelectorInfo) {
  if (nodeSelector === undefined || nodeSelector === null || nodeSelector.length === 0) { return true };
  let errorCount = 0;
  Object.entries(nodeSelector).forEach(([key, value]) => {
    if (!isValidNode({nodeKey: key, nodeValue: value}, nodeSelectorInfo)) {
      errorCount++;
    }
  });
  return errorCount === 0;
}

/**
 * Validate nodeSelector object and return if it is valid.
 *
 * @param {object} node - The node to validate, containing 'key' and 'value' properties.
 * @param {object} nodeSelectorInfo - NodeSelectorInfo object from the schema.
 *
 * @returns {boolean} - True if the node is valid, otherwise false.
 */
export function isValidNode(node, nodeSelectorInfo) {
  if ((node.nodeKey === "" || node.nodeKey === null || !RegExp(nodeSelectorInfo.key.validationPattern).test(node.nodeKey))) {
    return false;
  }
  if ((node.nodeValue === "" || node.nodeValue === null || !RegExp(nodeSelectorInfo.value.validationPattern).test(node.nodeValue))) {
    return false;
  }
  return true;
}

/**
 * Validate array object and return if it is valid
 *
 * @param {array} inputData - The data to validate.
 * @param {String} validationPattern - The regex pattern for validation.
 *
 * @returns {boolean} True if the question is valid, false otherwise.
 */
export function isValidArray(inputData, validationPattern) {
  if (inputData !== undefined) {
    const pattern = new RegExp(validationPattern);
    const uniqueEntries = new Set(inputData);
    const hasDuplicates = uniqueEntries.size !== inputData.length;
    return inputData.every(entry => pattern.test(entry)) && !hasDuplicates;
  }
  return true;
}

/**
 * Checks if an array of objects is valid based on the provided object array information.
 * @param {Array} inputData - An object containing all inputs for the current object.
 * @param {Object} objectArrayInfo - An object containing parameter information.
 * @returns {boolean} - Returns true if the object array is valid; otherwise, false.
 */
export function isValidObjectArrayInput(inputData, objectArrayInfo) {
  if (inputData === undefined || inputData === null || Object.keys(inputData).length === 0) {
    return true;
  }
  return inputData.every(entry => isObjectArrayValid(inputData, entry, objectArrayInfo));
}

/**
 * Calculates the number of errors in an object array based on provided validation rules.
 * @param {Object} inputData - An object containing all inputs for the current object.
 * @param {Object} objectArray - The object array to validate.
 * @param {Object} arrayObjectInfo - An object containing validation information for each property in the object array.
 * @returns {boolean} - Returns true if there are validation errors; otherwise, false.
 */
export function isObjectArrayValid(inputData, objectArray, arrayObjectInfo) {
  if (Object.keys(objectArray).length === 0) {
    return false;
  }
  let index = -1;
  for (const [key, properties] of Object.entries(arrayObjectInfo)) {
    index++;
    const value = objectArray[key];
    if (value === "" || !objectArray.hasOwnProperty(key) || value === undefined ) {
      if (properties.required) {
        return false;
      }
    } else if (properties.type === "datetime-local") {
      if (!isValidDate("datetime-local", properties.required, value, properties.validationPattern, objectArray, arrayObjectInfo[key].tag)) {
        return false;
      }
    } else {
      if (properties.type === "array") {
        const inputArray = [].concat(objectArray);
        return !validateArrayInput(properties.validationPattern, parseInt(index), key, inputArray);
      } else if (!RegExp(properties.validationPattern).test(objectArray[key]) ){
        return false;
      } else {
        if (isDuplicateEntryInObject(inputData, key, properties.preventDuplicates)) {
          return false;
        }
      }
    }
  }
  return true;
}

/**
 * Validate if contents of array pass regex test.
 * @param {string} validationPattern - Regex pattern.
 * @param {string} index - The index in the array of inputs to check.
 * @param {string} key - The key to check for regex.
 * @param {object} objectData - user input to validate.
 * @returns {boolean} - Returns true if there are validation errors otherwise, false.
 */
export function validateArrayInput(validationPattern, index, key, objectData) {
  const allInputs = getAllInputsForKey(key, objectData);
  const input = allInputs[index];
  let parts;
  if (Array.isArray(input)) {
    parts = input.join(', ').split(/,|\n/).map(part => part.trim()).filter(Boolean);
  }
  else  {
    parts = input.split(/,|\n/).map(part => part.trim()).filter(Boolean);
  }
  const pattern = new RegExp(validationPattern);
  return parts.some(part => !pattern.test(part));
}

/**
 * Checks if there are duplicate entries in an array of objects based on a specified key.
 * @param {object} inputData - The data to check for duplication.
 * @param {string} key - The key to check for duplicates.
 * @param {boolean} preventDuplicate - Indicates whether duplicate entries should be prevented.
 * @returns {boolean} - Returns true if there are duplicate entries; otherwise, false.
 */
export function isDuplicateEntryInObject(inputData, key, preventDuplicate) {
  if (!preventDuplicate){
    return false;
  }
  const allInputs = getAllInputsForKey(key, inputData);
  return new Set(allInputs).size !== allInputs.length
}
/**
 * Gets all inputs for the specified key in the object data array.
 * @param {string} key - The key to retrieve inputs for.
 * @param {object} inputData - The data to check for duplication.
 * @returns {Array} - A set containing all inputs for the specified key.
 */
export function getAllInputsForKey(key, inputData) {
  const allInputs = [];
  for (const item of inputData) {
    const val = item[key];
    allInputs.push(val);
  }
  return allInputs;
}

/**
 * Validate customObject objects so no duplicated keys or empty inputs are allowed
 *
 * @param {object} list - The Proxy object containing customObjects in the model.
 * @param {object} entry - The current entry consisting of a key value pair.
 * @param {object} customObjectInfo - An object containing validation information for each property in the custom object.
 *
 * @returns {boolean} True if the custom object is valid, false otherwise.
 */
export function isValidCustomObject(list, entry, customObjectInfo) {
  if ((entry.objectKey !== null && entry.objectKey !== "") && entry.objectValue !== null) {
    if(!RegExp(customObjectInfo.key.validationPattern).test(entry.objectKey)){
      return false;
    }
    if(!RegExp(customObjectInfo.value.validationPattern).test(entry.objectValue)){
      return false;
    } else {
      return list.filter(obj => obj.objectKey === entry.objectKey).length === 1;
    }
  } else {
    return false;
  }
}

/**
 * Checks if a given date input is valid.
 * @param {string} type - The type of input (e.g., "datetime-local").
 * @param {boolean} required - Boolean value for whether the input is required or not.
 * @param {string} input - The input value.
 * @param {string} validationPattern - The validation Pattern.
 * @param {Object} inputObject - The inputObject.
 * @param {string} tag - The tag property of the input key.
 * @returns {boolean} - True if the date is valid or the type is not datetime-local, false otherwise.
 */
export function isValidDate(type, required, input, validationPattern, inputObject, tag) {
  if (type === "datetime-local") {
    if (input === undefined || input === "") {
      return !required;
    }
    if (input !== undefined) {
      if (tag === "start_date") {
        return new Date(input) > new Date() && RegExp(validationPattern).test(input);
      } else if (tag === "end_date") {
        if (inputObject["start"] !== undefined) {
          return new Date(input) > new Date(inputObject["start"]) && RegExp(validationPattern).test(input);
        } else {
          return new Date(input) > new Date() && RegExp(validationPattern).test(input);
        }
      }
    }
  }
  return true;
}

/**
 * Gets the date and time of a given datetime input in ISO 8601 format.
 * @param {string} input - The datetime input.
 * @returns {string} - The current date and time in ISO 8601 format.
 */
export function getDateTimeFormatted(input) {
  const inputDate = new Date(input);
  const year = inputDate.getFullYear();
  const month = String(inputDate.getMonth() + 1).padStart(2, '0');
  const day = String(inputDate.getDate()).padStart(2, '0');
  const hours = String(inputDate.getHours()).padStart(2, '0');
  const minutes = String(inputDate.getMinutes()).padStart(2, '0');
  const seconds = String(inputDate.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/*
 * Validates all entries in the input object against the provided custom object information.
 * @param {object} inputObject - The object whose entries need to be validated.
 * @param {object} customObjectInfo - Information about the expected structure and types of custom object entries.
 * @param {boolean} paramRequired - Is the parameter required or not.
 *
 * @returns {boolean} - True if all entries pass validation, false otherwise.
 */
export function validateAllCustomObjectEntries(inputObject, customObjectInfo, paramRequired) {
  let inputs = [];

  for (const key of Object.keys(inputObject)) {
    inputs.push({ objectKey: key, objectValue: inputObject[key]})
    if (!isValidCustomObject(inputs, { objectKey: key, objectValue: inputObject[key]}, customObjectInfo)){
      return false;
    }
  }
  if (inputs.length === 0 && paramRequired) {
    return false;
  }
  return true;
}

/**
 * Downloads the base YAML file for export based on provided parameters.
 * If csarLite is true, it retrieves the YAML file from integration_values_file_data.
 * If csarLite is false, it downloads the YAML file from a predefined URL.
 * @param {boolean} csarLite - Indicates whether the csarLite mode is enabled.
 * @param {object[]} productSetContent - Information about product set content.
 * @param {string} deploymentSize - The deployment size.
 * @param {string} schemaVersion - The schema version.
 * @param {string} sedApiUrl - The API for the Online SED API server.
 * @returns {object} - The parsed YAML object.
 */
export async function getBaseYamlFileForExport(csarLite, productSetContent, deploymentSize, schemaVersion, sedApiUrl) {
  let defaultValuesYaml;
  if (csarLite) {
    console.log("fetching CSAR Lite values file")
    const valuesFileProductionUrl = productSetContent[2]['integration_values_file_data'][0]['values_file_production_url'];
    const valuesFileDevUrl = productSetContent[2]['integration_values_file_data'][0]['values_file_dev_url'];
    const valuesFileUrlToUse = valuesFileProductionUrl ? valuesFileProductionUrl : valuesFileDevUrl;
    if (valuesFileUrlToUse === null || valuesFileUrlToUse === undefined) {
      console.error("Values file not available in product set content.");
      return null;
    }
    defaultValuesYaml = await downloadIntegrationYaml(sedApiUrl, valuesFileUrlToUse.substring(0, valuesFileUrlToUse.lastIndexOf('/')) + `/${deploymentSize}-${schemaVersion}.yaml`);
  } else {
    console.log("fetching full CSAR values file")
    defaultValuesYaml = await downloadIntegrationYaml(sedApiUrl, INTEGRATION_YAML_FILE_URL + `${deploymentSize}-${schemaVersion}.yaml`);
  }
  return yaml.load(defaultValuesYaml);
}

/**
 * Checks if the value is true or a string representation of true.
 * @param {any} value - The value to be checked.
 * @returns {boolean} Returns true if the value is true or "true", otherwise false.
 */
export function isTrueOrStringTrue(value) {
  return value === true || value === "true";
}

/**
 * Checks if the value is false or a string representation of false.
 * @param {any} value - The value to be checked.
 * @returns {boolean} Returns true if the value is false or "false", otherwise false.
 */
export function isFalseOrStringFalse(value) {
  return value === false || value === "false";
}

/**
 * Checks if the given keys are needed based on the display conditions.
 * @param {Object} inputData - The input data object.
 * @param {string[]} displayIf - An array of keys to check if they should be displayed.
 * @param {string[]} displayIfNot - An array of keys to check if they should not be displayed.
 * @param {Object} schemaData - The schema data object containing key information.
 * @returns {boolean} Returns true if the keys should be displayed, otherwise false.
 */
export function checkIfKeyIsNeeded(inputData, displayIf, displayIfNot, schemaData) {
  if (displayIf && !displayIf.every(key => checkKeys(inputData, key, schemaData, true))) {
    return false;
  } else if (displayIfNot && !displayIfNot.every(key => checkKeys(inputData, key, schemaData, false))) {
    return false;
  }
  return true;
}

/**
 * Checks if the keys should be displayed based on the given condition.
 * @param {Object} inputData - The input data object.
 * @param {string} displayKey - The key to check.
 * @param {Object} schemaData - The schema data object containing key information.
 * @param {boolean} shouldBeTrue - The expected value of the key.
 * @returns {boolean} Returns true if the keys should be displayed, otherwise false.
 */
export function checkKeys(inputData, displayKey, schemaData, shouldBeTrue) {
  const keys = schemaData[displayKey]?.keys;
  const values = keys.map(key => getProperty(inputData, key));
  return values.every(value => value === shouldBeTrue);
}

/**
 * Retrieves the property value from the given object using dot notation.
 * @param {Object} object - The object from which to retrieve the property.
 * @param {string} key - The property key in dot notation (e.g., 'foo.bar').
 * @returns {*} The value of the property if found, otherwise undefined.
 */
export function getProperty(object, key) {
  return key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined) ? obj[k] : undefined, object);
}