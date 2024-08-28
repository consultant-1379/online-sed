import axios from 'axios';
import fs from 'fs';
import {downloadSchema, loadVersionFile} from '../../src/utils/utils.js';
import model, {SED_API_URL} from "../../src/model/index.js";

describe('Bad API POST requests', () => {
  let formData;
  let postOptions;
  const endPoint = '/api/validate';
  const SEDfilePath = 'test/resources/pENM/sed.txt';
  const SEDfileData = fs.readFileSync(SEDfilePath, 'utf-8');
  const SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});

  beforeEach(() => {
    formData = new FormData();
    formData.append('product', 'pENM');
    formData.append('useCase', 'upgrade');
    formData.append('enmVersion', '23.07');
    formData.append('enmDeploymentType', 'Large_ENM');
    formData.append('ipVersion', 'ipv4');
    formData.append('SEDFile', SEDfileBlob);
    postOptions = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
  });

  test('Should return a 400 status response if the product param is missing', async () => {
    formData.set('product', undefined);
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(400);
      expect(error.response.data.success).to.equal(false);
      expect(error.response.data.message).to.include('Missing or invalid product');
    }
  });

  test('Should return a 400 status response if the useCase param is missing', async () => {
    formData.delete("useCase");
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(400);
      expect(error.response.data.success).to.equal(false);
      expect(error.response.data.message).to.include('Missing useCase');
    }
  });

  test('Should return a 400 status response if the useCase param has a non-acceptable value', async () => {
    formData.set('useCase', 'unsupportedUseCase');
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(400);
      expect(error.response.data.success).to.equal(false);
      expect(error.response.data.message).to.include('Invalid useCase');
    }
  });

  test('Should return a 400 status response if the product param has a non-acceptable value', async () => {
    formData.set('product', 'unsupportedProduct');
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(400);
      expect(error.response.data.success).to.equal(false);
      expect(error.response.data.message).to.include('Missing or invalid product');
    }
  });

  test('Should return a 400 status response if the enmDeploymentType param is missing', async () => {
    formData.delete("enmDeploymentType");
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(400);
      expect(error.response.data.success).to.equal(false);
      expect(error.response.data.message).to.include('Missing pENM enmDeploymentType');
    }
  });

  test('Should return a 400 status response if the enmDeploymentType param has a non-acceptable value', async () => {
    formData.set('enmDeploymentType', undefined);
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(400);
      expect(error.response.data.success).to.equal(false);
      expect(error.response.data.message).to.include('Schema: undefined_schema.json not found in Artifactory');
    }
  });

  test('Should return a 400 status response if the ipVersion param is missing', async () => {
    formData.set('ipVersion', undefined);
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(400);
      expect(error.response.data.success).to.equal(false);
      expect(error.response.data.message).to.include('Invalid ipVersion');
    }
  });

  test('Should return a 400 status response if the ipVersion param has a non-acceptable value', async () => {
    formData.set('ipVersion', 'wrongValue');
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(400);
      expect(error.response.data.success).to.equal(false);
      expect(error.response.data.message).to.include('Invalid ipVersion');
    }
  });

  test('Should return a 400 status response if the enmVersion param is missing', async () => {
    formData.delete("enmVersion");
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(400);
      expect(error.response.data.success).to.equal(false);
      expect(error.response.data.message).to.include('Missing pENM version');
    }
  });

  test('Should return a 400 status response if the SED file param is missing for an upgrade', async () => {
    formData.set('SEDFile', undefined);
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(400);
      expect(error.response.data.success).to.equal(false);
      expect(error.response.data.message).to.include('Missing SED file');
    }
  });
});


describe('Mismatch between SED values and POST request params', () => {
  let formData;
  let postOptions;
  const endPoint = '/api/validate';
  const SEDfilePath = 'test/resources/pENM/sed.txt';
  let SEDfileData = fs.readFileSync(SEDfilePath, 'utf-8');
  let SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});

  beforeEach(() => {
    formData = new FormData();
    formData.append('product', 'pENM');
    formData.append('useCase', 'upgrade');
    formData.append('enmVersion', '23.07');
    formData.append('enmDeploymentType', 'Large_ENM');
    formData.append('ipVersion', 'ipv4');
    formData.append('SEDFile', SEDfileBlob);
    postOptions = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
  });

  test('Should return a 200 status response and the unparseable SED lines', async () => {
    SEDfileData = [
      'k1=v1',
      '   k2=v2',
      ' k3=',
      'k4',
      '=k5'
    ].join('\n');
    SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});
    formData.set('SEDFile', SEDfileBlob);
    const response = await axios.post(endPoint, formData, {postOptions});
    expect(response.status).to.equal(200);
    expect(response.data.success).to.equal(false);
    expect(response.data.message).to.include('Unparseable line(s): ["k4","=k5"]');
  });
});


describe('SED files correctly generated', () => {
  let formData;
  let postOptions;
  const endPoint = '/api/validate';
  const SEDfilePath = 'test/resources/pENM/sed.txt';
  let SEDfileData = fs.readFileSync(SEDfilePath, 'utf-8');
  let SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});

  beforeEach(() => {
    formData = new FormData();
    formData.append('product', 'pENM');
    formData.append('useCase', 'install');
    formData.append('enmVersion', '23.07');
    formData.append('enmDeploymentType', 'Large_ENM');
    formData.append('ipVersion', 'ipv4');
    formData.append('SEDFile', SEDfileBlob);
    postOptions = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
  });

  test('Should return a 422 status response and an upgraded SED, with invalid validation', async () => {
    let SEDfileData = [
      'Variable_Name=Variable_Value',
      '',
      'ip_version=ipv4',
      'ENMservices_subnet=131.xx.yy',
    ].join('\n');
    let SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});
    formData.set('SEDFile', SEDfileBlob);
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(422);
      expect(error.response.data.success).to.equal(true);
      expect(error.response.data.message.newSED).to.not.equal(undefined);
      expect(error.response.data.message.isInputSEDValid).to.equal(false);
    }
  });
});


describe('SED file contains validation errors', () => {
  let formData;
  let postOptions;
  const endPoint = '/api/validate';
  const SEDfilePath = 'test/resources/pENM/sed.txt';
  let SEDfileData = fs.readFileSync(SEDfilePath, 'utf-8');
  let SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});

  beforeEach(() => {
    formData = new FormData();
    formData.append('product', 'pENM');
    formData.append('useCase', 'install');
    formData.append('enmVersion', '23.07');
    formData.append('enmDeploymentType', 'Large_ENM');
    formData.append('ipVersion', 'ipv4');
    formData.append('SEDFile', SEDfileBlob);
    postOptions = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
  });

  test('Should return a 422 status response and an upgraded SED, with InvalidKeyValues errors', async () => {
    let SEDfileData = [
      'ip_version=        ipv4',
      'hostPort=hello',
      'itservices_1_ipaddress=1.1.1.1',
    ].join('\n');
    let SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});
    formData.set('SEDFile', SEDfileBlob);
    const expectedInvalidKeyValues =[
      {
        keyName: "hostPort",
        keyValue: "hello",
        validationPattern: "^(102[5-9]|10[3-9]\\d|1[1-9]\\d{2}|[2-9]\\d{3}|[1-5]\\d{4}|6[0-4]\\d{3}|65[0-4]\\d{2}|655[0-2]\\d|6553[0-5])|22$"
      }
    ]
    try {
      formData.append('includePasswords', true);
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(422);
      expect(error.response.data.success).to.equal(true);
      expect(error.response.data.message.newSED).to.not.equal(undefined);
      expect(error.response.data.message.isInputSEDValid).to.equal(false);
      assert.deepEqual(error.response.data.message.validationErrors.invalidKeyValues, expectedInvalidKeyValues);
    }
  });

  test('Should return a 422 status response and an upgraded SED, with DuplicatedKeyValues errors', async () => {
    let SEDfileData = [
      'ip_version= dual ',
      'amos_vip_address=1.1.1.1',
      'fm_vip_address=1.1.1.1'
    ].join('\n');
    let SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});
    formData.set('SEDFile', SEDfileBlob);
    const response = await axios.post(endPoint, formData, {postOptions});
    const expectedDuplicatedKeyValues = [
      { keyName: 'fm_vip_address', keyValue: '1.1.1.1' },
      { keyName: 'amos_vip_address', keyValue: '1.1.1.1' }
    ]
    try {
      formData.append('includePasswords', "true");
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(422);
      expect(error.response.data.success).to.equal(true);
      expect(error.response.data.message.newSED).to.not.equal(undefined);
      expect(error.response.data.message.isInputSEDValid).to.equal(false);
      assert.deepEqual(error.response.data.message.validationErrors.duplicatedKeyValues, expectedDuplicatedKeyValues);
    }
  });

  test('Should return a 422 status response and an upgraded SED, with IPv6 case sensitive DuplicatedKeyValues errors ', async () => {
    let SEDfileData = [
      'ip_version= dual ',
      'amos_vip_address=2001:4c48:0210:0900:0000:0000:0000:000a',
      'fm_vip_address=2001:4c48:0210:0900:0000:0000:0000:000A'
    ].join('\n');
    let SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});
    formData.set('SEDFile', SEDfileBlob);
    const response = await axios.post(endPoint, formData, {postOptions});
    const expectedDuplicatedKeyValues = [
      { keyName: 'fm_vip_address', keyValue: '2001:4c48:0210:0900:0000:0000:0000:000A' },
      { keyName: 'amos_vip_address', keyValue: '2001:4c48:0210:0900:0000:0000:0000:000a' }
    ]
    try {
      formData.append('includePasswords', "true");
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(422);
      expect(error.response.data.success).to.equal(true);
      expect(error.response.data.message.newSED).to.not.equal(undefined);
      expect(error.response.data.message.isInputSEDValid).to.equal(false);
      assert.deepEqual(error.response.data.message.validationErrors.duplicatedKeyValues, expectedDuplicatedKeyValues);
    }
  });

  test('Should return a 422 status response and an upgraded SED, with RequiredKeyValuesNotProvided errors', async () => {
    let SEDfileData = [
      'Variable_Name=Variable_Value',
      'ip_version=ipv4',
      'smrs_sftp_securePort=22',
      'rwx_storageClass=nfs-enm',
      'rwo_storageClass=network-block',
      'fm_vip_address=1.2.3.4',
      'podNetworkCIDR=192.168.0.0/16',
      'hostPort=9100',
      'pullSecret=secret',
      'environment_model=extraLarge__production_dualStack__3evt_racks_2eba.xml',
      'enable_fallback=false',
      'ipv4_vips_ipaddress_start=1.2.3.1',
      'ipv4_vips_ipaddress_end=1.2.3.7',
      'enable_fallback_domain_proxy=false',
      'amos_vip_address=',
      'host_system_identifier='
    ].join('\n');
    let SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});
    formData.set('SEDFile', SEDfileBlob);
    const expectedRequiredKeyValuesNotProvided = [
         'amos_vip_address',
    ]
    try {
      formData.append('includePasswords', 'TRUE');
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(422);
      expect(error.response.data.success).to.equal(true);
      expect(error.response.data.message.newSED).to.not.equal(undefined);
      expect(error.response.data.message.isInputSEDValid).to.equal(false);
      assert.deepEqual(error.response.data.message.validationErrors.requiredKeyValuesNotProvided, expectedRequiredKeyValuesNotProvided);
    }
  });

  test('Should return a 422 status response and an upgraded SED, with ipv4 MissingKeyNames errors', async () => {
    let SEDfileData = [
      'ip_version=IPv4',
      'smrs_sftp_securePort=22',
      'rwx_storageClass=nfs-enm',
      'rwo_storageClass=network-block',
      'fm_vip_address=1.2.3.4',
      'podNetworkCIDR=192.168.0.0/16',
      'hostPort=9100',
      'pullSecret=secret',
      'environment_model=extraLarge__production_dualStack__3evt_racks_2eba.xml',
      'enable_fallback=false',
      'ipv4_vips_ipaddress_start=1.2.3.1',
      'ipv4_vips_ipaddress_end=1.2.3.7',
      'enable_fallback_domain_proxy=false',
    ].join('\n');
    let SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});
    formData.set('SEDFile', SEDfileBlob);
    const expectedMissingKeyNames = [
      'svc_CM_vip_ipaddress',
      'amos_vip_address',
      'hostname_prefix',
      'scp_node4_hostname',
      'httpd_fqdn',
      'SSO_COOKIE_DOMAIN',
      'evt_node2_IP',
      'password1',
      'password2',
      "sfs_console_IP",
      "san_spaIP",
      "visinamingsb_service",
      "itservices_0_vip_address",
      "itservices_1_vip_address"
    ]
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(422);
      expect(error.response.data.success).to.equal(true);
      expect(error.response.data.message.newSED).to.not.equal(undefined);
      expect(error.response.data.message.isInputSEDValid).to.equal(false);
      assert.deepEqual(error.response.data.message.validationErrors.missingKeyNames, expectedMissingKeyNames);
    }
  });

  test('Should return a 422 status response and an upgraded SED, with ipv6 MissingKeyNames errors', async () => {
    let SEDfileData = [
      'ip_version=dual',
      'smrs_sftp_securePort=22',
      'rwx_storageClass=nfs-enm',
      'rwo_storageClass=network-block',
      'fm_vip_address=1.2.3.4',
      'podNetworkCIDR=192.168.0.0/16',
      'hostPort=9100',
      'pullSecret=secret',
      'environment_model=extraLarge__production_dualStack__3evt_racks_2eba.xml',
      'enable_fallback=false',
      'ipv4_vips_ipaddress_start=1.2.3.1',
      'ipv4_vips_ipaddress_end=1.2.3.7',
      'enable_fallback_domain_proxy=false',
    ].join('\n');
    let SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});
    formData.set('SEDFile', SEDfileBlob);
    formData.set('ipVersion', 'dual');
    const expectedMissingKeyNames = [
      'svc_CM_vip_ipaddress',
      'amos_vip_address',
      'hostname_prefix',
      'scp_node4_hostname',
      'httpd_fqdn',
      'SSO_COOKIE_DOMAIN',
      'LMS_IPv6',
      "evt_node2_IP",
      'password1',
      'password2',
      "sfs_console_IP",
      "san_spaIP",
      "visinamingsb_service",
      "itservices_0_vip_address",
      "itservices_1_vip_address"
    ]
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(422);
      expect(error.response.data.success).to.equal(true);
      expect(error.response.data.message.newSED).to.not.equal(undefined);
      expect(error.response.data.message.isInputSEDValid).to.equal(false);
      assert.deepEqual(error.response.data.message.validationErrors.missingKeyNames, expectedMissingKeyNames);
    }
  });

});

describe('SED file contains validation errors with upgrade useCase', () => {
  let formData;
  let postOptions;
  const endPoint = '/api/validate';
  const SEDfilePath = 'test/resources/pENM/sed.txt';
  let SEDfileData = fs.readFileSync(SEDfilePath, 'utf-8');
  let SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});

  beforeEach(() => {
    formData = new FormData();
    formData.append('product', 'pENM');
    formData.append('useCase', 'upgrade');
    formData.append('enmVersion', '23.07');
    formData.append('enmDeploymentType', 'Large_ENM');
    formData.append('ipVersion', 'ipv4');
    formData.append('SEDFile', SEDfileBlob);
    postOptions = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
  });

  test('Should return a 200 status response and an upgraded SED, with InvalidKeyValues errors', async () => {
    let SEDfileData = [
      'ip_version=        ipv4',
      'hostPort=hello',
      'itservices_1_ipaddress=1.1.1.1',
      'smrs_sftp_securePort=22',
      'enable_fallback=false',
      'enable_fallback_domain_proxy=false',
      'rwo_storageClass=network-block',
      'podNetworkCIDR=192.168.0.0/16',
      'pullSecret=secret',
      'ipv4_vips_ipaddress_start=1.2.3.4',
      'ipv4_vips_ipaddress_end=1.2.3.14',
      'amos_vip_address=1.1.1',
      'host_system_identifier=test',
      'environment_model=extraLarge__production_dualStack__3evt_racks_2eba.xml',
      'hostname_prefix=test_prefix',
      'scp_node4_hostname=test_hostname',
      'httpd_fqdn=test',
      'SSO_COOKIE_DOMAIN=test',
      'password1=test',
      'password2=test',
      'sfs_console_IP=1.2.3.4',
      'san_spaIP=1.2.3.4',
      'evt_node2_IP=1.2.5.3',
      'visinamingsb_service=10.42.14.172',
      'itservices_0_vip_address=10.42.14.173',
      'itservices_1_vip_address=10.42.14.171',
      'svc_CM_vip_ipaddress=23.23.1.1'
    ].join('\n');
    let SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});
    formData.set('SEDFile', SEDfileBlob);
    const expectedInvalidKeyValues =[
      {
        keyName: 'hostPort',
        keyValue: 'hello',
        validationPattern: '^(102[5-9]|10[3-9]\\d|1[1-9]\\d{2}|[2-9]\\d{3}|[1-5]\\d{4}|6[0-4]\\d{3}|65[0-4]\\d{2}|655[0-2]\\d|6553[0-5])|22$'
      },
      {
        keyName: 'amos_vip_address',
        keyValue: '1.1.1',
        validationPattern: '^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$'
      },
      {
        keyName: 'hostname_prefix',
        keyValue: 'test_prefix',
        validationPattern: '^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*$'
      },
      {
        keyName: 'scp_node4_hostname',
        keyValue: 'test_hostname',
        validationPattern: '^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*$'
      },
      {
        keyName: 'password1',
        keyValue: 'test',
        validationPattern: '^[A-Za-z0-9!@#$%^&*()~_+{}|:<>?\\-=\\[\\];,.\\/]{8,20}$'
      },
      {
        keyName: 'password2',
        keyValue: 'test',
        validationPattern: '^[A-Za-z0-9!@#$%^&*()~_+{}|:<>?\\-=\\[\\];,.\\/]{8,20}$'
      }
    ]
    const response = await axios.post(endPoint, formData, {postOptions});
    expect(response.status).to.equal(200);
    expect(response.data.success).to.equal(true);
    expect(response.data.message.newSED).to.not.equal(undefined);
    expect(response.data.message.isInputSEDValid).to.equal(true);
    assert.deepEqual(response.data.message.validationErrors.invalidKeyValues, expectedInvalidKeyValues);

  });

  test('Should return a 200 status response and an upgraded SED, with InvalidKeyValues errors - passwords excluded ', async () => {
    let SEDfileData = [
      'ip_version=        ipv4',
      'hostPort=hello',
      'itservices_1_ipaddress=1.1.1.1',
      'smrs_sftp_securePort=22',
      'enable_fallback=false',
      'enable_fallback_domain_proxy=false',
      'rwo_storageClass=network-block',
      'podNetworkCIDR=192.168.0.0/16',
      'pullSecret=secret',
      'ipv4_vips_ipaddress_start=1.2.3.4',
      'ipv4_vips_ipaddress_end=1.2.3.14',
      'amos_vip_address=1.1.1',
      'host_system_identifier=test',
      'environment_model=extraLarge__production_dualStack__3evt_racks_2eba.xml',
      'hostname_prefix=test_prefix',
      'scp_node4_hostname=test_hostname',
      'httpd_fqdn=test',
      'SSO_COOKIE_DOMAIN=test',
      'password1=test',
      'password2=test',
      'sfs_console_IP=1.2.3.4',
      'san_spaIP=1.2.3.4',
      'evt_node2_IP=1.2.5.3',
      'visinamingsb_service=10.42.14.172',
      'itservices_0_vip_address=10.42.14.173',
      'itservices_1_vip_address=10.42.14.171',
      'svc_CM_vip_ipaddress=23.23.1.1'
    ].join('\n');
    let SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});
    formData.set('SEDFile', SEDfileBlob);
    formData.append('includePasswords', 'false');
    const expectedInvalidKeyValues =[
      {
        keyName: 'hostPort',
        keyValue: 'hello',
        validationPattern: '^(102[5-9]|10[3-9]\\d|1[1-9]\\d{2}|[2-9]\\d{3}|[1-5]\\d{4}|6[0-4]\\d{3}|65[0-4]\\d{2}|655[0-2]\\d|6553[0-5])|22$'
      },
      {
        keyName: 'amos_vip_address',
        keyValue: '1.1.1',
        validationPattern: '^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$'
      },
      {
        keyName: 'hostname_prefix',
        keyValue: 'test_prefix',
        validationPattern: '^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*$'
      },
      {
        keyName: 'scp_node4_hostname',
        keyValue: 'test_hostname',
        validationPattern: '^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*$'
      }
    ]
    const response = await axios.post(endPoint, formData, {postOptions});
    expect(response.status).to.equal(200);
    expect(response.data.success).to.equal(true);
    expect(response.data.message.newSED).to.not.equal(undefined);
    expect(response.data.message.isInputSEDValid).to.equal(true);
    assert.deepEqual(response.data.message.validationErrors.invalidKeyValues, expectedInvalidKeyValues);
  });
});

describe('Exclusion IP List tests', () => {
  let formData;
  let postOptions;
  const endPoint = '/api/validate';

  beforeEach(() => {
    formData = new FormData();
    formData.append('product', 'pENM');
    formData.append('useCase', 'upgrade');
    formData.append('enmVersion', '23.07');
    formData.append('enmDeploymentType', 'Large_ENM');
    formData.append('ipVersion', 'dual');

    postOptions = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
  });

  test('Should return duplicatedKeyValuesInExclusionIps error', async () => {
    let SEDfileData = [
      'ip_version=dual',
      'amos_vip_address=1.2.3.4',
    ].join('\n');
    let SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});
    formData.append('SEDFile', SEDfileBlob);
    formData.append('exclusionIps[]', '1.2.3.4');
    const expectedDuplicatedKeyValues = [
      { keyName: 'amos_vip_address', keyValue: '1.2.3.4' }
    ]
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(422);
      expect(error.response.data.success).to.equal(true);
      expect(error.response.data.message.newSED).to.not.equal(undefined);
      expect(error.response.data.message.isInputSEDValid).to.equal(false);
      assert.deepEqual(error.response.data.message.validationErrors.duplicatedKeyValuesInExclusionIps, expectedDuplicatedKeyValues);
    }
  });

  test('Should return duplicatedKeyValuesInExclusionIps error multiple duplicate IPs', async () => {
    let SEDfileData = [
      'ip_version=dual',
      'amos_vip_address=1.2.3.4',
      'fm_vip_address=1.2.3.5'
    ].join('\n');
    let SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});
    formData.append('SEDFile', SEDfileBlob);
    formData.append('exclusionIps[]', '1.2.3.4');
    formData.append('exclusionIps[]', '1.2.3.5');
    const expectedDuplicatedKeyValues = [
      { keyName: 'fm_vip_address', keyValue: '1.2.3.5' },
      { keyName: 'amos_vip_address', keyValue: '1.2.3.4' }
    ]
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(422);
      expect(error.response.data.success).to.equal(true);
      expect(error.response.data.message.newSED).to.not.equal(undefined);
      expect(error.response.data.message.isInputSEDValid).to.equal(false);
      assert.deepEqual(error.response.data.message.validationErrors.duplicatedKeyValuesInExclusionIps, expectedDuplicatedKeyValues);
    }
  });

  test('Should return no duplicatedKeyValuesInExclusionIps error', async () => {
    let SEDfileData = [
      'amos_vip_address=1.1.1.1',
      'ip_version=dual',
    ].join('\n');
    let SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});
    formData.append('SEDFile', SEDfileBlob);
    formData.append('exclusionIps[]', ['1.1.1.2'])
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(422);
      expect(error.response.data.success).to.equal(true);
      expect(error.response.data.message.newSED).to.not.equal(undefined);
      expect(error.response.data.message.isInputSEDValid).to.equal(false);
      assert.deepEqual(error.response.data.message.validationErrors.duplicatedKeyValuesInExclusionIps, []);
    }
  });
});

describe('Pass snapshot schema to validate API, with invalid validation', async () => {
  let formData;
  let postOptions;
  const endPoint = '/api/validate';
  const SEDfilePath = 'test/resources/pENM/sed.txt';
  let SEDfileData = fs.readFileSync(SEDfilePath, 'utf-8');
  let SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});
  const snapshotSchemaData = await downloadSchema("http://localhost:3000/schema/test/ui_test_schema.json", SED_API_URL, "pENM");
  let snapshotSchemaBlob = new Blob([JSON.stringify(snapshotSchemaData)], {type: 'application/json'});
  beforeEach(() => {
    formData = new FormData();
    formData.append('product', 'pENM');
    formData.append('useCase', 'upgrade');
    formData.append('enmVersion', '23.07');
    formData.append('enmDeploymentType', 'Large_ENM');
    formData.append('ipVersion', 'dual');
    formData.append('SEDFile', SEDfileBlob);
    formData.append('snapshotSchema', snapshotSchemaBlob);
    postOptions = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
  });

  test('Should return a 422 status response with Invalid status and validation errors', async () => {
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(422);
      expect(error.response.data.success).to.equal(true);
      expect(error.response.data.message.newSED).to.not.equal(undefined);
      expect(error.response.data.message.isInputSEDValid).to.equal(false);
      expect(error.response.data.message.validationErrors.missingKeyNames).to.not.equal(undefined);
    }
  });
});

describe('addProductSet API tests', () => {
  const endPoint = '/api/addproductset';
  const dummyVersion = '11.11.100';

  test('Should return nothing to do when a versions already exists', async () => {
    const expectedJSON = {
      "deploymentTemplatesVersion": "2.32.1",
      "mediaArtifactVersion": "2.32.31",
      "deploymentTemplatesName": "ERICenmdeploymenttemplates_CXP9031758",
      "mediaArtifact": "ERICenm_CXP9027091"
    }
    const response = await axios.get(endPoint + "/" + "23.16.31");
    expect(response.status).to.equal(200);
    expect(response.data.success).to.equal(true);
    expect(response.data.message).to.equal("ENM product set [23.16.31] already exists nothing to do!");
    assert.deepEqual(response.data.result, expectedJSON);
  });

  test('Should update existing entry if new version added but the PS has changed', async () => {
    const expectedJSON = {
      "deploymentTemplatesVersion": "2.31.7",
      "mediaArtifactVersion": "2.32.32",
      "deploymentTemplatesName": "ERICenmdeploymenttemplates_CXP9031758",
      "mediaArtifact": "ERICenm_CXP9027091"
    }
    const response = await axios.get(endPoint + "/" + "23.16.32");
    expect(response.status).to.equal(200);
    expect(response.data.success).to.equal(true);
    expect(response.data.message).to.equal("Updated existing ENM schema version [2.31.7] with product set [23.16.32] successfully!");
    assert.deepEqual(response.data.result, expectedJSON);
  });

  test('Should not update existing entry if new version added but the PS has changed and the existing version has attribute release:true', async () => {
    const expectedJSON = {
      "deploymentTemplatesVersion": "2.31.12",
      "mediaArtifactVersion": "2.31.115",
      "deploymentTemplatesName": "ERICenmdeploymenttemplates_CXP9031758",
      "mediaArtifact": "ERICenm_CXP9027091"
    }
    const response = await axios.get(endPoint + "/" + "23.15.116");
    expect(response.status).to.equal(200);
    expect(response.data.success).to.equal(true);
    expect(response.data.message).to.equal("ENM product set [23.15.116] was added successfully!");
    expect(response.data.message).not.to.contain("Updated existing ENM schema version");
    assert.deepEqual(response.data.result, expectedJSON);
  });

  test('Should add a new PS', async () => {
    const expectedJSON = {
      "deploymentTemplatesVersion": "2.31.7",
      "mediaArtifactVersion": "2.31.113",
      "deploymentTemplatesName": "ERICenmdeploymenttemplates_CXP9031758",
      "mediaArtifact": "ERICenm_CXP9027091"
    }
    const response = await axios.get(endPoint + "/" + "23.15.114");
    expect(response.status).to.equal(200);
    expect(response.data.success).to.equal(true);
    expect(response.data.message).to.equal("ENM product set [23.15.114] was added successfully!");
    assert.deepEqual(response.data.result, expectedJSON);
  });

  test('Should add a new PS called in the first sprint', async () => {
    const expectedJSON = {
      "deploymentTemplatesVersion": "2.34.1",
      "mediaArtifactVersion": "2.34.41",
      "deploymentTemplatesName": "ERICenmdeploymenttemplates_CXP9031758",
      "mediaArtifact": "ERICenm_CXP9027091"
    }
    const response = await axios.get(endPoint + "/" + "24.01.41");
    expect(response.status).to.equal(200);
    expect(response.data.success).to.equal(true);
    expect(response.data.message).to.equal("ENM product set [24.01.41] was added successfully!");
    assert.deepEqual(response.data.result, expectedJSON);
  });

  test('Should return a 400 status response with not found version', async () => {
    try {
      const response = await axios.get(endPoint + "/" + dummyVersion);
    } catch (error) {
      expect(error.response.status).to.equal(400);
      expect(error.response.data.success).to.equal(false);
      expect(error.response.data.message).to.equal("An error has occurred or the version [11.11.100] was not found!");
      expect(error.response.data.result).to.not.equal(undefined);
    }
  });

  test('Should return a 400 status response when no version is provided', async () => {
    try {
      const response = await axios.get(endPoint + "/");
    } catch (error) {
      expect(error.response.status).to.equal(400);
      expect(error.response.data.success).to.equal(false);
      expect(error.response.data.message).to.equal("Missing version parameter!");
      expect(error.response.data.result).to.not.equal(undefined);
    }
  });
});

describe('addReleaseProductSet API tests', () => {
  const endPoint = '/api/addreleaseproductset';
  const version = '23.15.116';
  const dummyVersion = '11.11.100';

  test('Should return correct response from ENM endpoint with the specific version', async () => {
    const expectedJSON = {
      "success": true,
      "message": "Version [23.15.116 (R1GK)] was updated successfully!",
      "result": "AOM 901 151 R1GK"
    }
    const response = await axios.get(endPoint + "/" + version);
    expect(response.status).to.equal(200);
    assert.deepEqual(response.data, expectedJSON);
  });

  test('Should return a 400 status response with error message in result', async () => {
    try {
      const response = await axios.get(endPoint + "/" + dummyVersion);
    } catch (error) {
      expect(error.response.status).to.equal(400);
      expect(error.response.data.success).to.equal(false);
      expect(error.response.data.message).to.equal("An error has occurred or the version is not found!");
      expect(error.response.data.result).to.not.equal(undefined);
    }
  });

  test('Should cleanup intermediate versions lower than specific version', async () => {
    let expectedJSON = {
      "success": true,
      "message": "ENM product set [23.15.114] was added successfully!",
      "result": {
          "deploymentTemplatesVersion": "2.31.7",
          "mediaArtifactVersion": "2.31.113",
          "deploymentTemplatesName": "ERICenmdeploymenttemplates_CXP9031758",
          "mediaArtifact": "ERICenm_CXP9027091"
      }
    }
    const versionsFileBefore = await loadVersionFile("pENM", false);
    let response = await axios.get("/api/addproductset/23.15.114");
    assert.deepEqual(response.data, expectedJSON);
    expectedJSON = {
      "success": true,
      "message": "Version [23.15.116 (R1GK)] was updated successfully!",
      "result": "AOM 901 151 R1GK"
    }
    response = await axios.get(endPoint + "/" + version);
    expect(response.status).to.equal(200);
    assert.deepEqual(response.data, expectedJSON);
    const versionsFileAfter = await loadVersionFile("pENM", false);
    assert.deepEqual(versionsFileBefore, versionsFileAfter);
  });

  test('Should update PSV and schema version of existing R-state', async () => {
    const expectedJSON = {
      "success": true,
      "message": "Version [23.14.110 (R1GJ)] was updated successfully!",
      "result": "AOM 901 151 R1GJ"
    }
    let internalVersionsObject = await loadVersionFile("pENM", false);
    expect(internalVersionsObject.filter(internalVersionsObject => internalVersionsObject.name.includes("23.14.100"))).not.to.equal(null);
    const response = await axios.get(endPoint + "/23.14.110");
    expect(response.status).to.equal(200);
    assert.deepEqual(response.data, expectedJSON);
    internalVersionsObject = await loadVersionFile("pENM", false);
    expect(internalVersionsObject.filter(internalVersionsObject => internalVersionsObject.name.includes("23.14.100"))).to.be.empty;
    expect(internalVersionsObject.filter(internalVersionsObject => internalVersionsObject.name.includes("23.14.110"))).not.to.equal(null);
  });
});

describe('healthChecker endpoint tests', () => {
  const endPoint = '/healthcheck';

  test('Should return correct response from healthcheck endpoint', async () => {
    const response = await axios.get(endPoint);
    expect(response.status).to.equal(200);
    expect(response.data.message).to.equal("OK");
    expect(response.data.uptime).to.not.equal(undefined);
    expect(response.data.timestamp).to.not.equal(undefined);
  });
});

describe('addCENMProductSet API tests', () => {
  const endPoint = '/api/addcenmproductset';

  test('Should return nothing to do when the requested versions already exists in the version.json file', async () => {
    const response = await axios.get(endPoint + "/" + "24.04.96");
    expect(response.status).to.equal(200);
    expect(response.data.success).to.equal(true);
    expect(response.data.message).to.equal("ENM product set [24.04.96] already exists nothing to do!");
  });

  test('Should add a new PS', async () => {
    const response = await axios.get(endPoint + "/" + "24.03.103");
    expect(response.status).to.equal(200);
    expect(response.data.success).to.equal(true);
    expect(response.data.message).to.equal("ENM product set [24.03.103] was added successfully!");
  });


  test('Should return a 400 status response with not found version', async () => {
    try {
      const response = await axios.get(endPoint + "/" + '11.11.11');
    } catch (error) {
      expect(error.response.status).to.equal(400);
      expect(error.response.data.success).to.equal(false);
      expect(error.response.data.message).to.equal("An error has occurred or the version [11.11.11] was not found!");
    }
  });

  test('Should return a 400 status response when no version is provided', async () => {
    try {
      const response = await axios.get(endPoint + "/");
    } catch (error) {
      expect(error.response.status).to.equal(400);
      expect(error.response.data.success).to.equal(false);
      expect(error.response.data.message).to.equal("Missing version parameter!");
    }
  });
});

describe('addCENMReleaseProductSet API tests', () => {
  const endPoint = '/api/addcenmreleaseproductset/';
  const version = '24.03.102';
  const dummyVersion = '11.11.100';

  test('Should return correct response from ENM endpoint with the specific version', async () => {
    const expectedJSON = {
      "success": true,
      "message": "Version [24.03.102 (R1GT IP5)] was added successfully!",
      "result": "AOM 901 151 R1GT/5"
    }
    const response = await axios.get(endPoint + "/" + version);
    expect(response.status).to.equal(200);
    assert.deepEqual(response.data, expectedJSON);
  });

  test('Request contains a product product set that does nor exist. Should return a 400 status response with an error message in result', async () => {
    try {
      const response = await axios.get(endPoint + "/" + dummyVersion);
    } catch (error) {
      expect(error.response.status).to.equal(400);
      expect(error.response.data.success).to.equal(false);
      expect(error.response.data.message).to.equal("An error has occurred or the version [11.11.100] was not found!");
    }
  });

  test('Should Updated existing ENM schema version', async () => {
    let response = await axios.get(endPoint + "/" + version);
    let expectedJSON = {
      "success": true,
      "message": "Version [24.03.102 (R1GT IP5)] was updated successfully!",
      "result": "AOM 901 151 R1GT/5"
    }
    expect(response.status).to.equal(200);
    assert.deepEqual(response.data, expectedJSON);
  });
});