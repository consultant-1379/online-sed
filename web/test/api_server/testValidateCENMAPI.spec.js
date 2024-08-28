import axios from 'axios';
import fs from 'fs';
import {downloadSchema} from "../../src/utils/utils.js";
import {SED_API_URL} from "../../src/model/index.js";

describe('Bad cENM API POST requests', () => {
  let formData;
  let postOptions;
  const endPoint = '/api/validatecenm';
  const SEDfilePath = 'test/resources/cENM/extraLarge_IPv4.yaml';
  let SEDfileData = fs.readFileSync(SEDfilePath, 'utf-8');
  let SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});

  beforeEach(() => {
    formData = new FormData();
    formData.append('useCase', 'upgrade');
    formData.append('enmVersion', '24.03.30-2');
    formData.append('enmDeploymentType', 'extraLarge');
    formData.append('ipVersion', 'IPv4');
    formData.append('SEDFile', SEDfileBlob);
    postOptions = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
  });

  test('cENM - Should return a 400 status response if the useCase param is missing', async () => {
    formData.delete("useCase");
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(400);
      expect(error.response.data.success).to.equal(false);
      expect(error.response.data.message).to.include('Missing useCase');
    }
  });

  test('cENM - Should return a 400 status response if the enmDeploymentType param is missing', async () => {
    formData.delete("enmDeploymentType");
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(400);
      expect(error.response.data.success).to.equal(false);
      expect(error.response.data.message).to.include('Missing cENM enmDeploymentType');
    }
  });

  test('cENM - Should return a 400 status response if the ipVersion param is missing', async () => {
    formData.set('ipVersion', undefined);
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(400);
      expect(error.response.data.success).to.equal(false);
      expect(error.response.data.message).to.include('Invalid ipVersion');
    }
  });

  test('cENM - Should return a 400 status response if the ipVersion param has a non-acceptable value', async () => {
    formData.set('ipVersion', 'wrongValue');
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(400);
      expect(error.response.data.success).to.equal(false);
      expect(error.response.data.message).to.include('Invalid ipVersion');
    }
  });

  test('cENM - Should return a 400 status response if the SED file param is missing for an upgrade', async () => {
    formData.set('SEDFile', undefined);
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(400);
      expect(error.response.data.success).to.equal(false);
      expect(error.response.data.message).to.include('Missing SED file');
    }
  });

  test('cENM - Should return a 400 status response if the enmVersion param is missing', async () => {
    formData.delete("enmVersion");
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(400);
      expect(error.response.data.success).to.equal(false);
      expect(error.response.data.message).to.include('Missing cENM version');
    }
  });

});

describe('cENM yaml file contains validation errors', () => {
  let formData;
  let postOptions;
  const endPoint = '/api/validatecenm';
  const SEDfilePath = 'test/resources/cENM/extraLarge_IPv4.yaml';
  let SEDfileData = fs.readFileSync(SEDfilePath, 'utf-8');
  let SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});

  beforeEach(() => {
    formData = new FormData();
    formData.append('useCase', 'upgrade');
    formData.append('enmVersion', '24.05.90');
    formData.append('enmDeploymentType', 'extraLarge');
    formData.append('ipVersion', 'IPv4');
    formData.append('SEDFile', SEDfileBlob);
    postOptions = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
  });

  test('Should return a 422 status response with invalidKeyValues errors', async () => {
    let SEDfileData =
        `global:
            vips:
              svc_FM_vip_ipaddress: 10.42.14.
              svc_FM_vip_fwd_ipaddress: 10.42.14.164
              svc_CM_vip_ipaddress: 10.42.14.1652
              svc_PM_vip_ipaddress: 10.42.14.166`;
    let SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});
    formData.set('SEDFile', SEDfileBlob);
    const expectedInvalidKeyValues =[
      {
        keyName: 'svc_FM_vip_ipaddress',
        keyValue: '10.42.14.',
        validationPattern: '^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$'
      },
      {
        keyName: 'svc_CM_vip_ipaddress',
        keyValue: '10.42.14.1652',
        validationPattern: '^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$'
      }
    ]
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.data.newSedString).not.to.equal("");
      expect(error.response.status).to.equal(422);
      expect(error.response.data.success).to.equal(true);
      expect(error.response.data.message.isInputSEDValid).to.equal(false);
      expect(error.response.data.message.validationErrors.invalidKeyValues).to.not.equal(undefined);
      assert.deepEqual(error.response.data.message.validationErrors.invalidKeyValues, expectedInvalidKeyValues);
    }
  });

  test('Should return a 422 status response with missingKeyNames errors', async () => {
    let SEDfileData = `
global:
  ip_version: IPv4
  emailServer: email.athtem.eei.ericsson.se
eric-enm-int-log-transformer:
  enabled: true
  eric-log-transformer:
    enabled: true
    resources:
      logtransformer:
        requests:
          ephemeral-storage: 6Gi
        limits:
          ephemeral-storage: 6Gi
    egress:
      syslog:
        enabled: false
        inclusions: []
        exclusions: []`;
    let SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});
    formData.set('SEDFile', SEDfileBlob);
    const expectedMissingKeyNames =[
      'rwx_storageClass',
      'rwo_storageClass',
      'host_system_identifier',
      'COM_INF_LDAP_ROOT_SUFFIX',
      'COM_INF_LDAP_ADMIN_CN',
      'enmHost',
      'ingressClass',
      'svc_FM_vip_ipaddress',
      'svc_FM_vip_fwd_ipaddress',
      'svc_CM_vip_ipaddress',
      'svc_PM_vip_ipaddress',
      'amos_vip_address',
      'general_scripting_vip_address',
      'visinamingsb_service',
      'itservices_0_vip_address',
      'itservices_1_vip_address',
      'timezone',
      'securityServiceLoadBalancerIP',
      'certificatesRevListDistributionPointService_IPv4_enable',
      'certificates_rev_list_distribution_point_service_IPv6_enable',
      'load_balancer_IP',
      'podNetworkCIDR',
      'cniMode',
      'hostPort',
      'registry_url',
      'pullSecret',
      'certificatesRevListDistributionPointServiceDnsEnable',
      'publicKeyInfraRegAutorithyPublicServerName',
      'enforcedUserHardening',
      'ingressControllerLoadBalancerIP',
      'sentinelHostname',
      'cron',
      'home',
      'ddp_site_id',
      'ddc_account',
      'ddc_password',
      'pm_server_external_remote_write_enabled',
      'ingress_class',
      'ingress_hostname',
      'scripting_sshd_max_startups'
    ]
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.data.newSedString).not.to.equal("");
      expect(error.response.status).to.equal(422);
      expect(error.response.data.success).to.equal(true);
      expect(error.response.data.message.isInputSEDValid).to.equal(false);
      expect(error.response.data.message.validationErrors.missingKeyNames).to.not.equal(undefined);
      assert.deepEqual(error.response.data.message.validationErrors.missingKeyNames, expectedMissingKeyNames);
    }
  });

  test('Should return a 422 status response with invalid toleration object', async () => {
    let SEDfileData =
        `global:
            ip_version: IPv4
            tolerations:
              - key: Ke y1 
                operator: Equal
                value: Value1
                effect: PreferNoSchedule
                tolerationSeconds: 3
              - key: Key2
                operator: Exists
                effect: NoSchedule
                tolerationSeconds: "A"`;
    let SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});
    formData.set('SEDFile', SEDfileBlob);
    const expectedInvalidKeyValues =[
      {
        keyName: "tolerations",
        keyValue:  [
          {
            key: 'Ke y1',
            operator: 'Equal',
            value: 'Value1',
            effect: 'PreferNoSchedule',
            tolerationSeconds: 3
          },
          {
            key: 'Key2',
            operator: 'Exists',
            effect: 'NoSchedule',
            tolerationSeconds: 'A'
             }
        ],
        validationPattern: ""
      }
    ]
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(422);
      expect(error.response.data.message.isInputSEDValid).to.equal(false);
      assert.deepEqual(error.response.data.message.validationErrors.invalidKeyValues, expectedInvalidKeyValues);
    }
  });

  test('Should return a 422 status response with invalid nodeSelector object', async () => {
    let SEDfileData =
        `global:
            ip_version: IPv4
            nodeSelector:
              ke y1: value1
              Key2: Null
              node: cENM_Nodes`;
    let SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});
    formData.set('SEDFile', SEDfileBlob);
    const expectedInvalidKeyValues =[
      {
        keyName: "nodeSelector",
        keyValue: {
          'Key2': null,
          'ke y1': 'value1',
          'node': 'cENM_Nodes'
        },
        validationPattern: ""
      }
    ]
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(422);
      expect(error.response.data.message.isInputSEDValid).to.equal(false);
      assert.deepEqual(error.response.data.message.validationErrors.invalidKeyValues, expectedInvalidKeyValues);
    }
  });

  test('Should return a 422 status response with duplicatedKeyValues errors', async () => {
    let SEDfileData =
        `global:
            vips:
              svc_FM_vip_ipaddress: 10.42.14.164
              svc_FM_vip_fwd_ipaddress: 10.42.14.164
              svc_CM_vip_ipaddress: 10.42.14.165
              svc_PM_vip_ipaddress: 10.42.14.166`;
    let SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});
    formData.set('SEDFile', SEDfileBlob);
    const expectedDuplicatedKeyValues =[
      {
        "keyName": "svc_FM_vip_ipaddress",
        "keyValue": "10.42.14.164"
      },
      {
        "keyName": "svc_FM_vip_fwd_ipaddress",
        "keyValue": "10.42.14.164"
      }
    ]
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(422);
      expect(error.response.data.message.isInputSEDValid).to.equal(false);
      assert.deepEqual(error.response.data.message.validationErrors.duplicatedKeyValues, expectedDuplicatedKeyValues);
    }
  });

  test('Should return a 422 status response with duplicatedKeyValuesInExclusionIps errors', async () => {
    let SEDfileData =
        `global:
            vips:
              svc_FM_vip_ipaddress: 10.42.14.164
              svc_CM_vip_ipaddress: 10.42.14.165
              svc_PM_vip_ipaddress: 10.42.14.166`;
    let SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});
    formData.set('SEDFile', SEDfileBlob);
    formData.append('exclusionIps[]', '10.42.14.164');
    const expectedDuplicatedKeyValuesInExclusionIps =[
      {
        "keyName": "svc_FM_vip_ipaddress",
        "keyValue": "10.42.14.164"
      }
    ]
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(422);
      expect(error.response.data.message.isInputSEDValid).to.equal(false);
      assert.deepEqual(error.response.data.message.validationErrors.duplicatedKeyValuesInExclusionIps, expectedDuplicatedKeyValuesInExclusionIps);
    }
  });

  test('Should return a 422 status response with invalid (duplicate) sccResource object', async () => {
    let SEDfileData =
        `global:
            ip_version: IPv4
            sccResources:
              - scc1
              - scc1`;
    let SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});
    formData.set('SEDFile', SEDfileBlob);
    const expectedInvalidKeyValues =[
      {
        "keyName": "sccResources",
        "keyValue": [
          "scc1",
          "scc1"
        ],
        "validationPattern": ""
      }
    ]
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(422);
      expect(error.response.data.message.isInputSEDValid).to.equal(false);
      assert.deepEqual(error.response.data.message.validationErrors.invalidKeyValues, expectedInvalidKeyValues);
    }
  });

  test('Should return a 422 status response with invalid customObject object', async () => {
    let SEDfileData =
      `eric-oss-ingress-controller-nx:
         service:
           annotations:
             key: "Va   lue1"`;
    let SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});
    formData.set('SEDFile', SEDfileBlob);
    formData.set('ipVersion', 'Dual');
    const expectedInvalidKeyValues =[
      {
        keyName: "annotations",
        keyValue: {key: 'Va   lue1'},
        "validationPattern": ""
      }
    ]
    try {
      await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(422);
      expect(error.response.data.message.isInputSEDValid).to.equal(false);
      assert.deepEqual(error.response.data.message.validationErrors.invalidKeyValues, expectedInvalidKeyValues);
    }
  });
});

describe('Pass snapshot schema to validate CENM API', async () => {
  let formData;
  let postOptions;
  const endPoint = '/api/validatecenm';
  const SEDfilePath = 'test/resources/cENM/cENM_Small_dual.yaml';
  let SEDfileData = fs.readFileSync(SEDfilePath, 'utf-8');
  let SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});
  const snapshotSchemaData = await downloadSchema("http://localhost:3000/schema/test/ui_test_schema.json", SED_API_URL, "cENM");
  let snapshotSchemaBlob = new Blob([JSON.stringify(snapshotSchemaData)], {type: 'application/json'});
  beforeEach(() => {
    formData = new FormData();
    formData.append('useCase', 'upgrade');
    formData.append('enmVersion', '24.05.90');
    formData.append('enmDeploymentType', 'small');
    formData.append('ipVersion', 'Dual');
    formData.append('SEDFile', SEDfileBlob);
    formData.append('snapshotSchema', snapshotSchemaBlob);
    postOptions = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
  });

  test('Should return Valid status with NO validation errors', async () => {
    const res = await axios.post(endPoint, formData, {postOptions});
    expect(res.status).to.equal(200);
    expect(res.data.success).to.equal(true);
  });

  test('Should have the provided yaml base file values in the returned object', async () => {
    const SEDfilePath = 'test/resources/cENM/cENM_fully_populated.yaml';
    let SEDfileData = fs.readFileSync(SEDfilePath, 'utf-8');
    let snapshotBaseValuesYaml = new Blob([SEDfileData], {type: 'text/plain'});
    formData.append('snapshotBaseValuesYaml', snapshotBaseValuesYaml);
    const res = await axios.post(endPoint, formData, {postOptions});
    expect(res.data.message.newSED.global['newKeyAddedToBeExported']).to.equal("newValueAddedToBeExported");
    expect(res.status).to.equal(200);
    expect(res.data.success).to.equal(true);
  });
});

describe('Use CSAR Lite option for cENM', async () => {
  let formData;
  let postOptions;
  const endPoint = '/api/validatecenm';
  const SEDfilePath = 'test/resources/cENM/cENM_Small_dual.yaml';
  let SEDfileData = fs.readFileSync(SEDfilePath, 'utf-8');
  let SEDfileBlob = new Blob([SEDfileData], {type: 'text/plain'});
  const SEDfilePathCsarLite = 'test/resources/cENM/cENM_Small_dual_CSAR_lite.yaml';
  let SEDfileDataCsarLite = fs.readFileSync(SEDfilePathCsarLite, 'utf-8');
  let SEDfileBlobCsarLite = new Blob([SEDfileDataCsarLite], {type: 'text/plain'});
  const snapshotSchemaData = await downloadSchema("http://localhost:3000/schema/test/ui_test_schema.json", SED_API_URL, "cENM");
  let snapshotSchemaBlob = new Blob([JSON.stringify(snapshotSchemaData)], {type: 'application/json'});

  beforeEach(() => {
    formData = new FormData();
    formData.append('useCase', 'upgrade');
    formData.append('enmVersion', '24.05.90');
    formData.append('enmDeploymentType', 'small');
    formData.append('ipVersion', 'Dual');
    formData.append('snapshotSchema', snapshotSchemaBlob);
    postOptions = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
  });

  test('Should return Valid status with NO validation errors CSAR Lite true', async () => {
    formData.append('csarLite', 'true');
    formData.append('SEDFile', SEDfileBlobCsarLite);
    const res = await axios.post(endPoint, formData, {postOptions});
    expect(res.status).to.equal(200);
    expect(res.data.success).to.equal(true);
    assert.equal(res.data.message.newSED.global.registry.url, "container-registry.eccd.local:30948/some_other_path");
  });

  test('Should return Valid status with NO validation errors CSAR Lite false', async () => {
    formData.append('csarLite', 'false');
    formData.append('SEDFile', SEDfileBlob);
    const res = await axios.post(endPoint, formData, {postOptions});
    expect(res.status).to.equal(200);
    expect(res.data.success).to.equal(true);
    assert.equal(res.data.message.newSED.global.registry.url, "container-registry.eccd.local:30948/proj-enm");
  });

  test('Should return invalid status with validation error CSAR Lite false and registry_url does not contain proj-enm', async () => {
    const expectedInvalidKeyValues =[
      {
        keyName: "registry_url",
        keyValue: "container-registry.eccd.local:30948/some_other_path",
        validationPattern: "^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*)(.*)(\\/proj-enm)$",
      }
    ]
    try {
      formData.append('csarLite', 'false');
      formData.append('SEDFile', SEDfileBlobCsarLite);
      const res = await axios.post(endPoint, formData, {postOptions});
    } catch (error) {
      expect(error.response.status).to.equal(422);
      expect(error.response.data.message.isInputSEDValid).to.equal(false);
      assert.deepEqual(error.response.data.message.validationErrors.invalidKeyValues, expectedInvalidKeyValues);
    }
  });

  test('Should return Valid status with NO validation errors CSAR Lite true and registry_url does not contain proj-enm', async () => {
    formData.append('csarLite', 'true');
    formData.append('SEDFile', SEDfileBlobCsarLite);
    const res = await axios.post(endPoint, formData, {postOptions});
    expect(res.status).to.equal(200);
    expect(res.data.success).to.equal(true);
    assert.equal(res.data.message.newSED.global.registry.url, "container-registry.eccd.local:30948/some_other_path");
  });
});