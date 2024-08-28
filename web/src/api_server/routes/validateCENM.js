import {Router} from 'express';
import multer from 'multer';

import {
  downloadSchema,
  downloadSchemaDirectly,
  loadProductsFromFile,
  getCloudNativeProductSetContent,
  checkForDuplicates,
  DEPLOYMENT_SIZE_MAPPING
} from '../../utils/utils.js';
import yaml from "js-yaml";
import {
  deepMergeObjects,
  findInObject,
  generateYamlResponse,
  isValidNodeSelectors,
  getTolerationErrorsCount,
  readObjectDetails,
  isValidArray,
  isValidObjectArrayInput,
  validateAllCustomObjectEntries,
  getBaseYamlFileForExport,
  checkIfKeyIsNeeded
} from "../../utils/CENMUtils.js";

const router = Router();
const upload = multer({
  limits: {
    fileSize: 2000000 // Compliant: 2MB
  }
});

const API_PORT = process.env.API_PORT ? ":" + process.env.API_PORT : "";
const SED_API_URL = process.env.NODE_ENV === "production" ? "https://siteengineeringdata.internal.ericsson.com" + API_PORT + "/api/" : "http://localhost:3000/api/";

/**
 * API endpoint for creating and Upgrade or Initial SED
 *
 * The Upgrade use case expects an input SED. The response includes a new SED,
 * based on the target version schema and the values copied from the input SED
 *
 * The Initial use case response includes a new SED based,
 * on the target version schema, where all values are empty
 * except enmDeployment and ipVersion
 *
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Object} - HTTP response object
 */
router.post('/', upload.fields([{name: 'SEDFile', maxCount: 1}, {name: 'snapshotSchema', maxCount: 1},  {name: 'snapshotBaseValuesYaml', maxCount: 1}]), async (req, res) => {
  const {enmVersion, enmDeploymentType, ipVersion, useCase, exclusionIps} = req.body;
  var inputValues = [useCase, enmVersion, ipVersion, enmDeploymentType]
  var startValidateMessage = "Validating "
  for (var i = 0; i < inputValues.length; i++) {
    if (inputValues[i] !== undefined) {
      startValidateMessage += inputValues[i] + " "
    }
  }
  console.log(startValidateMessage)
  const inputSEDFile = req.files['SEDFile'];
  const inputSnapshotSchema = req.files['snapshotSchema'];
  const inputSnapshotBaseValuesYamlFile = req.files['snapshotBaseValuesYaml'];
  const parsedExclusionIps = 'exclusionIps' in req.body ? exclusionIps : [];
  const includePasswords = 'includePasswords' in req.body ? req.body.includePasswords : true;
  const csarLite = 'csarLite' in req.body ? req.body.csarLite : false;
  res.header({
    'Content-Type': "application/json; charset=utf-8",
    'Access-Control-Allow-Methods': "GET, POST, OPTIONS, PUT"
  })
  var outputMessage = '';
  const possibleProducts = await loadProductsFromFile();
  const filteredProducts = possibleProducts.filter(p => p.shortName === 'cENM');
  const possibleUseCases = ['install', 'upgrade'];
  if (useCase == null) {
    outputMessage = `Missing useCase. Must be one of: ${possibleUseCases.join(', ')}`
    console.log(outputMessage)
    return res.status(400).json({success: false, message: outputMessage});
  }
  const use_Case = useCase.toLowerCase();
  if (!possibleUseCases.includes(use_Case)) {
    outputMessage = `Invalid useCase. Must be one of: ${possibleUseCases.join(', ')}`
    console.log(outputMessage)
    return res.status(400).json({success: false, message: outputMessage});
  }
  if (enmVersion === null || enmVersion === undefined) {
    outputMessage = `Missing cENM version`
    console.log(outputMessage)
    return res.status(400).json({success: false, message: outputMessage});
  }
  let possibleIpVersions = filteredProducts[0].ipVersions;
  possibleIpVersions = possibleIpVersions.map(v => v.name);
  if (ipVersion === null) {
    outputMessage = `Missing ipVersion. Must be one of: ${possibleIpVersions.join(', ')}`
    console.log(outputMessage)
    return res.status(400).json({success: false, message: outputMessage});
  }
  if (!possibleIpVersions.includes(ipVersion)) {
    outputMessage = `Invalid ipVersion. Must be one of: ${possibleIpVersions.join(', ')}`
    console.log(outputMessage)
    return res.status(400).json({success: false, message: outputMessage});
  }
  let possibleDeploymentSizes = filteredProducts[0].deploymentSizes;
  possibleDeploymentSizes = possibleDeploymentSizes.map(d => d.name);
  if (enmDeploymentType == null || enmDeploymentType === undefined) {
    outputMessage = `Missing cENM enmDeploymentType. Must be one of: ${possibleDeploymentSizes.map(item => item).join(', ')}.`
    console.log(outputMessage)
    return res.status(400).json({success: false, message: outputMessage});
  }
  if (!possibleDeploymentSizes.includes(enmDeploymentType)) {
    outputMessage = `Invalid cENM enmDeploymentType. Must be one of: ${possibleDeploymentSizes.map(item => item).join(', ')}.`
    console.log(outputMessage)
    return res.status(400).json({success: false, message: outputMessage});
  }
  if (inputSEDFile === null || inputSEDFile === undefined) {
    outputMessage = 'Missing SED file'
    console.log(outputMessage)
    return res.status(400).json({success: false, message: outputMessage});
  }
  let schema;
  let productSetContent = await getCloudNativeProductSetContent(enmVersion.split('.').slice(0, 2).join('.'), enmVersion);
  if (productSetContent === null) {
    outputMessage = 'Error Cloud Native Product Set Content values is null';
    console.error(outputMessage);
    return res.status(400).json({success: false, message: outputMessage});
  }
  let schemaVersion = productSetContent[2]['integration_values_file_data'][0]['values_file_version'];
  if (inputSnapshotSchema != null) {
    schema = JSON.parse(inputSnapshotSchema[0].buffer.toString());
  } else {
    if (process.env.NODE_ENV === "test") {
      schema = await downloadSchema("http://localhost:3000/schema/test/cENM/ui_test_schema.json", SED_API_URL, "cENM");
    } else {
      const schemaFileUrl = [`https://arm.seli.gic.ericsson.se/artifactory/proj-online-sed-generic-local/cenm/${schemaVersion}/eric-enm-integration-values-sed-schema.json`].join('/');
      console.log("cENM schemaFileUrl: ", schemaFileUrl);
      schema = await downloadSchemaDirectly(schemaFileUrl, 'cENM');
    }
  }
  if (schema === null) {
    console.error('Schema is null');
    return res.status(400).json({
      success: false,
      message: 'An error has occurred while downloading the schema from Artifactory'
    });
  }
  let emptyValuesContent;
  if (inputSnapshotBaseValuesYamlFile !== null && inputSnapshotBaseValuesYamlFile !== undefined) {
    emptyValuesContent = await readInputYaml(inputSnapshotBaseValuesYamlFile[0]);
  } else {
    const deploymentSize = DEPLOYMENT_SIZE_MAPPING[enmDeploymentType];
    emptyValuesContent = await getBaseYamlFileForExport(csarLite==="true", productSetContent, deploymentSize, schemaVersion, SED_API_URL);
    if (emptyValuesContent === null) {
      outputMessage = 'Error Cloud Native Product Set Content values files are null.';
      console.error(outputMessage);
      return res.status(400).json({success: false, message: outputMessage});
    }
  }
  const inputSED = await readInputYaml(inputSEDFile[0]);
  if (inputSED.sedMetadata === undefined) {
    inputSED.sedMetadata = {};
  }
  inputSED.sedMetadata.csarLite = csarLite === "true";
  const validationResult = await validateInputSEDWithSchema(inputSED, schema, parsedExclusionIps, includePasswords, use_Case, ipVersion, emptyValuesContent);

  if (validationResult.message.isInputSEDValid) {
    console.log("Validation complete status 200. Input SED is valid");
    return res.status(200).json(validationResult);
  }
  console.log("Validation complete status 422. Input SED is invalid");
  return res.status(422).json(validationResult);
});

/**
 * Validate the SED against the schema
 *
 * @param {object} inputSED - the content of the Input SED YAML file
 * @param {object} schema - Schema for a particular ENM deployment
 * @param {Array} exclusionIps - Array of IP's not to be used in the SED
 * @param {boolean} includePasswords - Boolean stating whether passwords should be included in exported SED file
 * @param {String} useCase - the use case which is one of [install, upgrade]
 * @param {String} ipVersionInput - Selected IP version
 * @param {object} emptyValuesContent - the content of the unpopulated integration YAML file
 * @returns {object} - Results of the validation
 */
export async function validateInputSEDWithSchema(inputSED, schema, exclusionIps, includePasswords, useCase, ipVersionInput, emptyValuesContent) {
  const newSED = {};
  const missingKeyNameArray = [];
  const invalidKeyValues = [];
  const requiredKeyValuesNotProvided = [];
  const duplicatedKeyValues = [];
  const duplicatedKeyValuesInExclusionIps = [];
  let usedValuesToCheckForDuplicates = [];

  let isInputSEDValid = true;
  const {properties: {parameters: {properties: propertiesParameters}}} = schema;
  const definitions = schema.definitions;

  for (const keyName in propertiesParameters) {
    const {$ref, optional, ipVersion, keys, defaultValue, displayIf, displayIfNot} = propertiesParameters[keyName];
    const defKeyName = $ref.substring($ref.lastIndexOf('/') + 1, $ref.length);
    const definition = definitions[defKeyName];
    let validationPattern = definition.pattern;
    let keyType = definition.type;
    let keyFormat = definition.format;
    if (keyFormat !== undefined && keyFormat !== null && keyFormat !=='') {
      keyType = keyFormat;
    }
    const keyDefaultValue = defaultValue || definition.defaultValue
    const preventDuplicates = definition.preventDuplicates;
    if (keyName.endsWith("_ipaddress_start") || keyName.endsWith("_ipaddress_end")) {
      continue;
    }
    const inputSEDvalue = findInObject(inputSED, keys);
    if (ipVersion && !ipVersion.some(version => version.toLowerCase() === ipVersionInput.toLowerCase())) {
      continue;
    }
    if (!checkIfKeyIsNeeded(inputSED, displayIf, displayIfNot, propertiesParameters)) {
      continue;
    }
    if (inputSEDvalue === undefined) {
      if (keyDefaultValue) {
        newSED[keyName] = keyDefaultValue;
      } else if (!optional) {
        missingKeyNameArray.push(keyName);
        isInputSEDValid = false;
      }
    } else {
      if (inputSEDvalue === '' || inputSEDvalue === null) {
        if (!optional) {
          requiredKeyValuesNotProvided.push(keyName);
          isInputSEDValid = false;
        }
      } else {
        if (preventDuplicates) {
          let sedValue = inputSEDvalue.toString().toLowerCase()
          if (!usedValuesToCheckForDuplicates[sedValue]) {
            usedValuesToCheckForDuplicates[sedValue] = [keyName];
          } else {
            usedValuesToCheckForDuplicates[sedValue].push(keyName);
          }
          const validationResult = checkForDuplicates(preventDuplicates, sedValue, keyName, exclusionIps, usedValuesToCheckForDuplicates, duplicatedKeyValues, duplicatedKeyValuesInExclusionIps);
          if (!validationResult) {
            isInputSEDValid = validationResult;
          }
        }
        if (keyType === "kubernetesToleration") {
          const tolerationInfo = readObjectDetails(definition, definitions, "tolerationInfo");
          if (inputSEDvalue.some(toleration => getTolerationErrorsCount(toleration, tolerationInfo) !== 0)) {
            invalidKeyValues.push({keyName: keyName, keyValue: inputSEDvalue, validationPattern: ""});
          }
        } else if (keyType === "nodeSelector") {
          const nodeSelectorInfo = readObjectDetails(definition, definitions, "nodeSelectorInfo");
          if (!isValidNodeSelectors(inputSEDvalue, nodeSelectorInfo)) {
            invalidKeyValues.push({keyName: keyName, keyValue: inputSEDvalue, validationPattern: ""});
          }
        } else if (keyType === "objectArray") {
          const objectArrayInfo = readObjectDetails(definition, definitions, "objectInfo");
          if (!isValidObjectArrayInput(inputSEDvalue, objectArrayInfo)) {
            invalidKeyValues.push({keyName: keyName, keyValue: inputSEDvalue, validationPattern: ""});
          }
        } else if (keyType === "array") {
          if (!isValidArray(inputSEDvalue, validationPattern)) {
            invalidKeyValues.push({keyName: keyName, keyValue: inputSEDvalue, validationPattern: ""});
          }
        } else if (keyType === 'customObject') {
          const customObjectInfo = readObjectDetails(definition, definitions, "customObjectInfo");
          if (!validateAllCustomObjectEntries(inputSEDvalue, customObjectInfo, !optional)) {
            invalidKeyValues.push({keyName: keyName, keyValue: inputSEDvalue, validationPattern: ""});
          }
        }
        if (!RegExp(validationPattern).test(inputSEDvalue)) {
          invalidKeyValues.push({keyName: keyName, keyValue: inputSEDvalue, validationPattern: validationPattern});
          isInputSEDValid = false;
        }
        if (inputSEDvalue === "false") {
          newSED[keyName] = false;
        } else if (inputSEDvalue === "true") {
          newSED[keyName] = true;
        } else if (inputSEDvalue === null) {
          newSED[keyName] = "";
        } else {
          newSED[keyName] = inputSEDvalue;
        }
      }
    }
  }
  const inputValues = await generateYamlResponse(propertiesParameters, newSED);
  const mergedValues = deepMergeObjects(emptyValuesContent, inputValues);
  return {
    success: true,
    message: {
      isInputSEDValid: isInputSEDValid,
      newSED: mergedValues,
      newSedString: yaml.dump(mergedValues),
      validationErrors: {
          missingKeyNames: missingKeyNameArray,
          invalidKeyValues,
          duplicatedKeyValues,
          duplicatedKeyValuesInExclusionIps,
          requiredKeyValuesNotProvided
      }
    }
  }
}

export async function readInputYaml(inputSEDFile) {
  try {
    let inputSEDString = inputSEDFile.buffer.toString()
    return await yaml.load(inputSEDString, { schema: yaml.CORE_SCHEMA });
  } catch (e) {
    console.log('Error loading YAML file')
    console.error(e);
  }
}

export default router;