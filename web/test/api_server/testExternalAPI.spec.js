import axios from 'axios';
import { describe, test, expect, vi } from 'vitest'
import {externalAPIRoute} from '../../src/api_server/routes/ExternalAPI';

const NOT_FOUND = 'Not Found!';

describe('test fetching schema object from external API', () => {
  const dataEndPoint = '/api/extapi/data/?dir=';
  const schemaVersion = '2.28.9';
  const schemaFolder1 = { uri: '/ENMOnRack', folder: true };
  const schema1 = { uri: '/ENMOnRack__production_IPv4__2evt_racks_1eba_schema.json', folder: false };
  const schema2 = { uri: '/ENMOnRack__production_IPv4_schema.json', folder: false };
  const invalidSchema = {uri: '/xxxschema.json' }
  const invalidSchemaVersion = 'xVersion';
  const folderSchemaResult = [
      { uri: '/ENMOnRack', folder: true },
      { uri: '/extraLarge', folder: true },
      { uri: '/geoMetro', folder: true },
      { uri: '/interim_expansion_dd', folder: true },
      { uri: '/large', folder: true },
      { uri: '/medium', folder: true },
      { uri: '/test', folder: true }
  ];

  test('Get list of folders from JFrog artifactory API return 200 OK', async () => {
    let response = await axios.get(dataEndPoint + "penm/" +  schemaVersion);
    expect(response.status).to.equal(200);
    expect(response.data).toBeTypeOf('object');
    expect(Array.isArray(response.data.children)).toBe(true);
    expect(response.data.children[0]).toHaveProperty('uri');
    expect(response.data.children[0]).toHaveProperty('folder');
    expect(response.data.children).toStrictEqual(folderSchemaResult);
  });

  test('Get list of schemas from JFrog artifactory API return 200 OK', async () => {
    let response = await axios.get(dataEndPoint + "penm/" +  schemaVersion + schemaFolder1.uri);
    expect(response.status).to.equal(200);
    expect(response.data).toBeTypeOf('object')
    expect(Array.isArray(response.data.children)).toBe(true);
    expect(response.data.children[0]).toHaveProperty('uri');
    expect(response.data.children[0]).toHaveProperty('folder');
    expect(response.data.children.some(e => e.uri === schema1.uri && e.folder === schema1.folder)).to.be.true;
    expect(response.data.children.some(e => e.uri === schema2.uri && e.folder === schema2.folder)).to.be.true;
    expect(response.data.children.some(e => e.uri === invalidSchema.uri && e.folder === invalidSchema.folder)).to.be.false;
  });

  test('Get folders from JFrog artifactory API return 404 not found', async () => {
    try {
      await axios.get(dataEndPoint + invalidSchemaVersion);
    } catch (error) {
      expect(error.response.status).to.equal(404);
      expect(error.response.data.success).to.equal(false);
      expect(error.response.data.message).to.include(NOT_FOUND);
    }
  });
});

describe('test getting schema from external API', () => {
  const schemaEndPoint = '/api/extapi/schema';
  const schemaLink = 'https://arm.seli.gic.ericsson.se/artifactory/proj-online-sed-generic-local/penm/2.28.9/ENMOnRack/ENMOnRack__production_IPv4__2evt_racks_1eba_schema.json';
  const invalidSchemaLink = 'https://arm.seli.gic.ericsson.se/artifactory/proj-online-sed-generic-local/penm/2.28.9/x/1/schema.json';

  test('Get schema from JFrog artifactory return 200 OK', async () => {
    let response = await axios.post(schemaEndPoint, { params: { link: schemaLink } });
    expect(response.status).to.equal(200);
    expect(typeof response.data === 'object').toBe(true);
    expect('autoPopulationTypes' in response.data).toBe(true);
    expect('categories' in response.data).toBe(true);
    expect('definitions' in response.data).toBe(true);
    expect('properties' in response.data).toBe(true);
    expect('version' in response.data).toBe(true);
  });

  test('Get schema from JFrog artifactory return 404 not found', async () => {
    try {
      await axios.post(schemaEndPoint, { params: { link: invalidSchemaLink } });
    } catch (error) {
      expect(error.response.status).to.equal(404);
      expect(error.response.data.success).to.equal(false);
      expect(error.response.data.message).to.include(NOT_FOUND);
    }
  });
});

describe('test download-schema external API', () => {
  const schemaEndPoint = '/api/extapi/download-schema';

  test('Download schema information return 200 OK', async () => {
    let response = await axios.get(schemaEndPoint, { params: { product: 'penm', enmVersion: '2.28.9', selectedSize: 'ENMOnRack',
                                                        schemaFileName: 'ENMOnRack__production_IPv4__2evt_racks_1eba_schema.json' } });
    expect(response.status).to.equal(200);
  });

  test('Download schema information return 400 error missing parameter in get request', async () => {
    try {
      let response = await axios.get(schemaEndPoint, { params: { product: '', enmVersion: '2.28.9', selectedSize: 'ENMOnRack',
                                                        schemaFileName: 'ENMOnRack__production_IPv4__2evt_racks_1eba_schema.json' } });
    } catch (error) {
      expect(error.response.status).to.equal(400);
      expect(error.response.data).to.equal('Error...Required parameter missing from get request.');
    }
  });

  test('Download schema information return 404 error schema not available in artifactory', async () => {
    try {
      let response = await axios.get(schemaEndPoint, { params: { product: 'cenm', enmVersion: '2.28.9', selectedSize: 'ENMOnRack',
                                                        schemaFileName: 'ENMOnRack__production_IPv4__2evt_racks_1eba_schema.json' } });
    } catch (error) {
      expect(error.response.status).to.equal(404);
      expect(error.response.data.message).to.equal('An error has occurred while downloading the schema from Artifactory');
    }
  });

});
