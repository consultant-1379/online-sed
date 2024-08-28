import {Router} from 'express';
import {Readable} from 'stream';
import axios from "axios";
import { returnErrorResponse, downloadSchemaDirectly } from '../../utils/utils.js';

const router = Router();
const JFROG_FILE_API = "https://arm.seli.gic.ericsson.se/artifactory/api/storage/proj-online-sed-generic-local/";
const serverTimeout = 5000;
const schemesList = ["http:", "https:"];
const domainsList = ["arm.seli.gic.ericsson.se"];

router.get('/data', (req, res) => {
  var dir = req.query.dir;
  const url = (new URL(dir, JFROG_FILE_API, { timeout: serverTimeout }));
  if (schemesList.includes(url.protocol) && domainsList.includes(url.hostname)) {
    axios.get(url)
      .then((response) => {
        return res.json(response.data);
      }).catch(error => {
        return returnErrorResponse(res, error);
      });
  }
});

router.post('/schema', (req, res) => {
  axios.get(req.body.params.link, { timeout: serverTimeout })
    .then((response) => {
      return res.json(response.data);
    }).catch(error => {
      return returnErrorResponse(res, error);
    });
})

router.post('/integrationyaml', (req, res) => {
  axios.get(req.body.params.link, { timeout: serverTimeout })
    .then((response) => {
      return res.json(response.data);
    }).catch(error => {
      return returnErrorResponse(res, error);
    });
})

router.get('/download-schema', async (req, res) => {
  const { product, enmVersion, selectedSize, schemaFileName } = req.query;
  if (!product || !enmVersion || !selectedSize  || !schemaFileName) {
    res.status(400).send('Error...Required parameter missing from get request.');
    return;
  }
  console.log('Getting schema information for: ' + product + ' ' + enmVersion +  ' ' + selectedSize +  ' ' + schemaFileName)
  const schemaFileUrl = ['https://arm.seli.gic.ericsson.se',
                         'artifactory',
                         'proj-online-sed-generic-local',
                          product,
                          enmVersion,
                          selectedSize,
                          schemaFileName + '.json'].join('/');

  console.log('schemaFileUrl = ' + schemaFileUrl)

  let schemaFile = await downloadSchemaDirectly(schemaFileUrl, product);
  if (schemaFile === null) {
    console.error('Schema is null');
    return res.status(404).json({ success: false, message: 'An error has occurred while downloading the schema from Artifactory' });
  }
  const jsonObject = schemaFile.properties.parameters.properties;
  const dataSet = [];

  for (const key in jsonObject) {
    if (Object.prototype.hasOwnProperty.call(jsonObject, key)) {
      const property = jsonObject[key];
      const data = {
        KeyName: key,
        DisplayName: property.displayName,
        Optional: property.optional,
        Example: property.example,
        Description: property.description
      };
    dataSet.push(data);
    }
  }
  const headers = Object.keys(dataSet[0]).join(',') + '\n';
  const csvData = dataSet
    .map(item => Object.values(item)
      .map(value => {
        if (value === undefined) {
          return ''; // Replace undefined with an empty string
        } else if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`; // Add double quotes if the value is a string and contains a comma
        } else {
          return value;
        }
      })
      .join(',')
    )
  .join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=schema_content.csv');
  const readableStream = Readable.from([headers, csvData]);
  readableStream.pipe(res);
});

export default router;