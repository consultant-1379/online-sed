import {Router} from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import axios from 'axios';

import {
  getpENMSEDObjectFromString,
  isIpVersionPairValid,
  validateSEDString,
  downloadSchema,
  findFileInArtifactoryRepo, downloadSchemaDirectly, checkForDuplicates
} from '../../utils/utils.js';

const router = Router();
const upload = multer({
  limits: {
    fileSize: 2000000 // Compliant: 2MB
  }
});

const API_PORT = process.env.API_PORT ? ":" + process.env.API_PORT : "";
const SED_API_URL = process.env.NODE_ENV === "production" ? "https://siteengineeringdata.internal.ericsson.com" + API_PORT + "/api/" : "http://localhost:3000/api/";
const schemesList = ["http:", "https:"];
const domainsList = ["ci-portal.seli.wh.rnd.internal.ericsson.com"];

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
router.post('/', upload.fields([{name: 'SEDFile', maxCount: 1}, {name: 'snapshotSchema', maxCount: 1}]), async (req, res) => {
  const {product, enmVersion, enmDeploymentType, ipVersion, useCase, exclusionIps} = req.body;
  var inputValues = [useCase, product, enmVersion, enmDeploymentType, ipVersion]
  var startValidateMessage = "Validating "
  for (var i = 0; i < inputValues.length; i++){
    if ( inputValues[i] !== undefined ) {
      startValidateMessage += inputValues[i] + " "
    }
  }
  console.log(startValidateMessage)
  const inputSEDFile = req.files['SEDFile'];
  const inputSnapshotSchema = req.files['snapshotSchema'];
  const parsedExclusionIps = 'exclusionIps' in req.body ? exclusionIps : [];
  const includePasswords = 'includePasswords' in req.body ? req.body.includePasswords.toLowerCase() === "true" : true;
  const artifactoryUrl = 'https://arm.seli.gic.ericsson.se';
  res.header({
        'Content-Type': "application/json; charset=utf-8",
        'Access-Control-Allow-Methods': "GET, POST, OPTIONS, PUT"
  })
  const possibleProducts = await loadProductsFromFile();
  const filteredProducts = possibleProducts.filter(p => p.shortName === product);
  if (filteredProducts.length !== 1) {
    var outputMessage = `Missing or invalid product. Must be equal to pENM`
    console.log(outputMessage)
    return res.status(400).json({success: false, message: outputMessage});
  }
  const possibleUseCases = ['install', 'upgrade'];
  if (useCase == null) {
    var outputMessage = `Missing useCase. Must be one of: ${possibleUseCases.join(', ')}`
    console.log(outputMessage)
    return res.status(400).json({success: false, message: outputMessage});
  }
  const use_Case = useCase.toLowerCase();
  if (!possibleUseCases.includes(use_Case)) {
    var outputMessage = `Invalid useCase. Must be one of: ${possibleUseCases.join(', ')}`
    console.log(outputMessage)
    return res.status(400).json({success: false, message: outputMessage});
  }
  if (product === 'pENM') {
    if (enmVersion == null) {
      var outputMessage = `Missing ${product} version`
      console.log(outputMessage)
      return res.status(400).json({success: false, message: outputMessage});
    }
    const possibleIpVersions = ['ipv4', 'ipv6_ext', 'dual'];
    if (ipVersion == null) {
      var outputMessage = `Missing ipVersion. Must be one of: ${possibleIpVersions.join(', ')}`
      console.log(outputMessage)
      return res.status(400).json({success: false, message: outputMessage});
    }
    const ip_Version = ipVersion.toLowerCase();
    if (!possibleIpVersions.includes(ip_Version)) {
      var outputMessage = `Invalid ipVersion. Must be one of: ${possibleIpVersions.join(', ')}`
      console.log(outputMessage)
      return res.status(400).json({success: false, message: outputMessage});
    }
    if (inputSEDFile == null) {
      var outputMessage = 'Missing SED file'
      console.log(outputMessage)
      return res.status(400).json({success: false, message: outputMessage});
    }
    let schema;
    if (inputSnapshotSchema != null) {
      schema = JSON.parse(inputSnapshotSchema[0].buffer.toString());
    } else {
      if (enmDeploymentType == null) {
        var outputMessage = `Missing ${product} enmDeploymentType`
        console.log(outputMessage)
        return res.status(400).json({success: false, message: outputMessage});
      }
      if (process.env.NODE_ENV === "test") {
        schema = await downloadSchema("http://localhost:3000/schema/test/pENM/ui_test_schema.json", SED_API_URL, "pENM");
      } else {
        let schemaVersion;
        const url = (new URL('https://ci-portal.seli.wh.rnd.internal.ericsson.com/api/deployment/deploymentTemplates/productSet/ENM/version/' + enmVersion));
        if (schemesList.includes(url.protocol) && domainsList.includes(url.hostname)) {
          try {
            const response = await axios.get(url);
            schemaVersion = response.data.deploymentTemplatesVersion;
          } catch (error) {
            console.error(error);
            return res.status(400).json({ success: false, message: "An error has occurred getting details for ENM product set version: " + enmVersion });
          }
        }
        let schemaFileName = '';
        if (enmDeploymentType.includes('_dd')) {
          schemaFileName = enmDeploymentType.split("_dd.xml")[0];
        } else {
          schemaFileName = enmDeploymentType.split(".xml")[0];
        }
        schemaFileName += "_schema.json";
        const filePaths = await findFileInArtifactoryRepo(artifactoryUrl, filteredProducts[0].sedSchemaRepo, filteredProducts[0].shortName.toLowerCase() + '/' + schemaVersion + '/*', schemaFileName);
        if (filePaths.length === 0) {
          let error = "Schema: " + schemaFileName + " not found in Artifactory repo.";
          console.error(error);
          return res.status(400).json({ success: false, message: error });
        }
        const schemaFileUrl = [artifactoryUrl, 'artifactory', filteredProducts[0].sedSchemaRepo, filePaths[0].path, schemaFileName].join('/');
        schema = await downloadSchemaDirectly(schemaFileUrl);
      }
    }

    if (schema === null) {
      console.error('Schema is null');
      return res.status(400).json({ success: false, message: 'An error has occurred while downloading the schema from Artifactory' });
    }

    const inputSEDString = inputSEDFile[0].buffer.toString();
    const inputSEDUnparseableLineArray = validateSEDString(inputSEDString);
    if (inputSEDUnparseableLineArray.length !== 0) {
      var outputMessage = `Unparseable line(s): ${JSON.stringify(inputSEDUnparseableLineArray)}`
      return res.status(200).json({success: false, message: outputMessage});
    }

    const inputSED = getpENMSEDObjectFromString(inputSEDString);

    if (!isIpVersionPairValid(inputSED.ip_version.toLowerCase(), ip_Version)) {
      var outputMessage = `Unsupported change from the SED ip_version value (${inputSED.ip_version}) to the ipVersion parameter (${ip_Version})`
      console.log(outputMessage)
      return res.status(200).json({success: false, message: outputMessage});
    }
    const validationResult = validateInputSEDWithSchema(inputSED, schema, parsedExclusionIps, includePasswords, use_Case, ip_Version);
    validationResult.message.newSED.ip_version = ip_Version;
    validationResult.message.newSED.environment_model = enmDeploymentType;
    if (validationResult.message.isInputSEDValid) {
      console.log("Validation complete status 200. Input SED is valid");
      return res.status(200).json(validationResult);
    }
    console.log("Validation complete status 422. Input SED is invalid");
    return res.status(422).json(validationResult);
  }
});

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
 * Validate the SED against the schema
 *
 * @param {String} product - Name of product SED is being built for pENM/cENM
 * @param {object} inputSED - Flat {key: value} object representing a pENM SED
 * @param {object} schema - Schema for a particular ENM deployment
 * @param {Array} exclusionIps - Array of IP's not to be used in the SED
 * @param {boolean} includePasswords - Boolean stating whether passwords should be included in exported SED file.
 * @param {String} useCase - the use case which is one of [install, upgrade]
 * @param {String} ipVersionInput - Selected IP version
 * @returns {object} - Results of the validation
 */
export function validateInputSEDWithSchema(inputSED, schema, exclusionIps, includePasswords, useCase, ipVersionInput) {
  const newSED = {};
  const missingKeyNameArray = [];
  const invalidKeyValues = [];
  const requiredKeyValuesNotProvided = [];
  const duplicatedKeyValues = [];
  const duplicatedKeyValuesInExclusionIps = [];
  const mismatchedKeyValues = [];
  let usedValuesToCheckForDuplicates = [];
  let isInputSEDValid = true;
  const {properties: {parameters: {properties: propertiesParameters}}} = schema;
  const definitions = schema.definitions;

  for (const keyName in propertiesParameters) {
    const {$ref, optional, ipVersion, valueMatchesKey, value, defaultValue} = propertiesParameters[keyName];
    const defKeyName = $ref.substring($ref.lastIndexOf('/') + 1, $ref.length);
    const definition = definitions[defKeyName];
    let validationPattern = definition.pattern;
    const keyDefaultValue = defaultValue || definition.defaultValue
    const preventDuplicates = definition.preventDuplicates;
    if (definition.format === "password" && !includePasswords) {
      continue;
    }
    if (value !== undefined){
      newSED[keyName] = value;
      continue;
    }
    if (ipVersion && !ipVersion.includes(ipVersionInput)){
      continue;
    }
    if (!(keyName in inputSED)) {
      if (keyDefaultValue) {
        newSED[keyName] = keyDefaultValue;
      } else if (!optional) {
        missingKeyNameArray.push(keyName);
        isInputSEDValid = false;
      }
    } else {
      const inputSEDvalue = inputSED[keyName];
      if (inputSEDvalue.trim() === '') {
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
        if (valueMatchesKey) {
          if (valueMatchesKey in inputSED) {
            if (inputSEDvalue !== inputSED[valueMatchesKey]) {
              mismatchedKeyValues.push({keyName: keyName, keyValue: inputSEDvalue, keyToMatch: valueMatchesKey});
              isInputSEDValid = false;
            }
          }
        }
        if (!RegExp(validationPattern).test(inputSEDvalue)) {
          invalidKeyValues.push({keyName: keyName, keyValue: inputSEDvalue, validationPattern: validationPattern});
          if (useCase === 'install') {
            isInputSEDValid = false;
          }
        }
        newSED[keyName] = inputSEDvalue;
      }
    }
  }
  return {
    success: true,
    message: {
      isInputSEDValid: isInputSEDValid,
      newSED: newSED,
      validationErrors: {
          missingKeyNames: missingKeyNameArray,
          invalidKeyValues,
          duplicatedKeyValues,
          duplicatedKeyValuesInExclusionIps,
          requiredKeyValuesNotProvided,
          mismatchedKeyValues
      }
    }
  }
}

export default router;