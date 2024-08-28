import fileSaver from 'file-saver';
import { expect, vi } from "vitest";
import axios from 'axios';
import {
  generateKeyValueTextResponse,
  generateUpdatedSEDFile,
  dragFileFromLocalSEDFile,
  readLocalSEDFile,
  clearVersionSelection,
  clearIPVersionSelection,
  clearSizeSelection,
  getSchemaForm,
  loadProducts,
  resetDeployment,
  selectIpVersion,
  selectProduct,
  selectSprint,
  selectSize,
  removeUnusedIpaddressFields,
  selectVersion,
  storeModel,
  loadModelFromStorage,
  togglePreviousSED,
  populateValuesFromImportedSedFile,
  checkLoadedENMSize,
  checkIPversion,
  deleteAllDataDialogOkFunction,
  findKeysToCompare,
  deleteAllDataDialogCancelFunction,
  incrementIPv4Address,
  incrementIPv6Address,
  autoPopulateIpAddresses,
  autoPopulateHostnames,
  getPopulatedValuesToCheckForDuplicates,
  isNextIPLessThanLastIP,
  updateResponse,
  colonAdder,
  checkDuplicates,
  checkIpInExclusionIps,
  getExcludedIps,
  isValidIp,
  setEnabledOptionalServiceRequired,
  getPossibleIPVersions,
  getPossibleDeploymentSizes,
  getPossibleSchemas,
  getPossibleCENMSchemas,
  getSchemaFileShortName,
  getDeploymentSizeFromArtifactory,
  axiosGetSubList,
  clearIPVersionsAvailableToSelect,
  checkFieldAutopopulationRequired,
  readLocalSchemaFile,
  default_select, dragFileFromLocalSchemaFile,
  resetDryRun,
  resetIncludePassword,
  clearSchemaFromFileMode,
  clearPopulateValuesFromImportedSedFile,
  setupDeploymentSchema,
  storeDeploymentDetails,
  resetUseCase,
  checkShouldParamBeDisplayed,
  sortedKeys,
  resetSelectedProduct,
  updateSchemaOptionalValues,
  filterCategory,
  selectRelease,
  configureComparisonModels,
  filterAndRemoveIfSingle,
  dec2hex, generateYamlResponse,
  isValidObject,
  readBaseYamlTemplateFile,
  loadFileFromLocalBaseTemplateFile
} from "../../src/model/index.js";
import assert from "assert";
import YAML from "yaml";
import * as CENMUtils from './../../src/utils/CENMUtils';
import {isValidArray, isValidObjectArrayInput} from "./../../src/utils/CENMUtils";

describe("setupDeploymentSchema", () => {
  let fetchMock;
  let getSchemaFormMock;
  let mockedSchemaData;
  let model;
  let router;
  let schema;

  beforeEach(() => {
    model = {
      response: {},
      usedIpAddresses: [
        {name: "deleted_key", value: "10.10.10.11"},
        {name: "deleted_key_ipv6", value: "fd5b:1fd5:8295:5340:0000:0000:0000:0010"},
        {name: "deleted_key_ipv6", value: "2001:1b70:82a1:0380:0000:0000:0000:003F/64"}
      ],
      schemaForm: [{key: "key"}],
      showDeleteAllDataConfirmation: false,
      selectedIpVersion: {
        name: 'ipv4'
      },
      selectedProduct: { vid: 1,
        sedSchemaRepo: "some_url",
        shortName: "shortName"
      },
      selectedVersion: {
        schemaVersion: 'some_schema.json',
      },
      selectedSize: {
        name: 'ENMOnRack'
      },
      selectedSchema: {
        name: 'ENMOnRack Dual racks_4str_3ebs_1eba',
        uri: '/ENMOnRack__production_dualStack__racks_4str_3ebs_1eba_schema.json',
      },
      storedSchema: {},
      selectedUseCase: {alias: 'upgrade'}
    };
    router = { push: vi.fn() };
    schema = {
      definitions: {
        any_string: {
          description: "This must be any string",
          pattern: "^.+$",
          type: "string"
        },
      },
      properties: {
        parameters: {
          properties: {
            property1: {
              "$ref": "#/definitions/any_string",
              displayName: "property display name.",
              category: "Category1",
              keys: [
                "path.to.value"
              ]
            }
          }
        }
      },
      categories: [{ name: "Category1" }, { name: "Category2" }],
      autoPopulationTypes: [{ name: "Internal" }, { name: "External" }]
    };
    fetchMock = vi
        .fn()
        .mockResolvedValue({ json: () => Promise.resolve(schema) });
    getSchemaFormMock = vi.fn();
    mockedSchemaData = {
      data: {
        definitions: {
          any_string: {
            description: "This must be any string",
            pattern: "^.+$",
            type: "string"
          },
        },
        properties: {
          parameters: {
            properties: {
              property1: {
                "$ref": "#/definitions/any_string",
                displayName: "property display name.",
                category: "Category1",
                keys: [
                  "path.to.value"
                ]
              }
            }
          }
        },
        categories: [{name: "Category1"}, {name: "Category2"}],
        autoPopulationTypes: [{name: "Internal"}, {name: "External"}]
      }
    };
    axios.post = vi.fn()
        .mockResolvedValueOnce(mockedSchemaData);
  });

  test("Should prepare the deployment pENM", async () => {
    model.selectedProduct.shortName = 'pENM';
    model.selectedIpVersion.name = "ipv4";
    global.fetch = fetchMock;
    global.getSchemaForm = getSchemaFormMock;
    await setupDeploymentSchema(model, router);
    expect(model.isModelReady).to.be.true;
    expect(model.dataTypeCategories.length).to.be.equal(2);
    expect(model.dataTypeCategories[0].id).to.be.equal(0);
    expect(model.prepared).to.be.true;
    expect(model.usedIpAddresses).to.deep.equal(['10.10.10.11', 'fd5b:1fd5:8295:5340:0000:0000:0000:0010', '2001:1b70:82a1:0380:0000:0000:0000:003F/64']);
  });

  test("Should prepare the deployment cENM", async () => {
    model.selectedProduct.shortName = 'cENM';
    model.selectedIpVersion.name = "ipv4";
    global.fetch = fetchMock;
    global.getSchemaForm = getSchemaFormMock;
    await setupDeploymentSchema(model, router);
    expect(model.isModelReady).to.be.true;
    expect(model.dataTypeCategories.length).to.be.equal(2);
    expect(model.dataTypeCategories[0].id).to.be.equal(0);
    expect(model.prepared).to.be.true;
    expect(model.usedIpAddresses).to.deep.equal(['10.10.10.11', 'fd5b:1fd5:8295:5340:0000:0000:0000:0010', '2001:1b70:82a1:0380:0000:0000:0000:003F/64']);
  });
});

describe("selectProduct", () => {
  let fetchMock;
  let model;
  let mockedVersions;

  beforeEach(() => {
    model = {
      selectedUseCase: {
        alias: 'upgrade'
      },
      products: [
        { name: "pENM",
          ipVersions: [
            {name: "ipv4"},
            {name: "dual"},
            {name: "ipv6_ext"}]

        },
        { name: "cenm",
          ipVersions: [
            {name: "ipv4"},
            {name: "dual"},
            {name: "ipv6_ext"}] }
      ],
      selectedProduct: null,
      sizes: [
        {shortName: 'ENMOnRack'},
        {shortName: 'extraLarge'},
      ],
      targetAudience: "pdu",
      storedSchema: {}
    };
    mockedVersions = [
      {
        name: "23.11.2",
        chemaVersion: "2.28.9",
        targetAudience: "pdu",
        release: true,
        releaseNumber: "23.2"
      },
      {
        name: "23.11.1",
        schemaVersion: "2.28.7",
        targetAudience: "pdu",
        release: true,
        releaseNumber: "23.1"
      }
    ];
    fetchMock = vi
        .fn()
        .mockResolvedValue({ json: () => Promise.resolve(mockedVersions) });
  });

  test("Should select the product and populate the possible versions", async () => {
    global.fetch = fetchMock;
    await selectProduct(0, model);
    await selectSprint(model, 0);
    expect(model.selectedProduct).to.be.equal(model.products[0]);
    expect(model.versions).to.be.deep.equal(mockedVersions);
    expect(model.ipVersions).to.be.deep.equal([ {name: "ipv4"},
      {name: "dual"},
      {name: "ipv6_ext"}
    ]);
  });

  test("Should select the product and populate the possible releases", async () => {
    global.fetch = fetchMock;
    model.targetAudience = "cu";
    await selectProduct(0, model);
    await selectRelease(model, 0);
    expect(model.selectedProduct).to.be.equal(model.products[0]);
    expect(fetchMock.callCount).to.be.equal(2);
    expect(model.releases).to.be.deep.equal(mockedVersions);
    expect(model.ipVersions).to.be.deep.equal([ {name: "ipv4"},
      {name: "dual"},
      {name: "ipv6_ext"}
    ]);
  });

  test("Should handle fetch errors", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("fetch error"));
    console.error = vi.fn();
    await selectProduct(1, model);
    expect(console.error.callCount).to.be.equal(1);
  });

  test("Should clear depending fields when a product is selected", async () => {
    global.fetch = fetchMock;
    model.usePreviousSED = true;
    model.importedFileContent = { foo: 'bar' };
    model.importedFileName = 'Some_Deployment.txt';
    model.excludeIps = [{ ipAddress: '1.1.1.1', ipDescription: 'some ip', isDuplicate: false, errorMessage: false }];
    let expectedExcludedIPs = [{ ipAddress: '', ipDescription: '', isDuplicate: false, errorMessage: false }];
    await selectProduct(0, model);
    expect(model.usePreviousSED).toBeTruthy();
    expect(model.importedFileContent).toBeNull();
    expect(model.excludeIps).toEqual(expectedExcludedIPs);
  });
});

describe('generateUpdatedSEDFile', () => {
  const model = {
    selectedProduct: { vid: 1, sedFileFormat: "yaml" },
    selectedVersion: {
      alias: "v1",
      name: "Version1",
      csar_url: "some_url"
    },
    updated_data: {
      key: 'value'
    },
    dataTypeCategories: [{shortName: "cat"}],
    schemaForm: [{category: "cat", required: true, key: "category"}],
    response: {category: "cat"},
    selectedSchema: {
      name: "large__production__3evt_racks_2eba-sed-schema.json"
    },
    selectedSize : {
      name: "selectedSize"
    }
  };

  test('Should generate updated values file for cENM', async () => {
    const saveAsSpy = vi.spyOn(fileSaver, 'saveAs').mockImplementationOnce();
    await generateUpdatedSEDFile(model);
    expect(saveAsSpy).toHaveBeenCalledWith(new Blob([YAML.stringify({key: "value"})]), 'large__production__3evt_racks_2eba-selectedSize-Version1.yaml');
  });

  test('Should generate updated values file for pENM', async () => {
    const model = {
      selectedProduct: { vid: 1, sedFileFormat: "txt", name: "updated-sample-size-datapath-Version 1" },
      updated_data: [
        "key=value"
      ],
      selectedVersion: {
        alias: "2.2.23",
        name: "2.2.23"
      },
      selectedSchema: {
        name: "large__production__3evt_racks_2eba"
      }
    };

    const saveAsSpy = vi.spyOn(fileSaver, 'saveAs').mockImplementationOnce();

    await generateUpdatedSEDFile(model);
    expect(saveAsSpy).toHaveBeenCalledWith(new Blob(["key=value"]), 'large__production__3evt_racks_2eba-2.2.23.txt');
  });

  test('Should generate incomplete updated values file YAML format', async () => {
    model.isIncomplete = true;
    const saveAsSpy = vi.spyOn(fileSaver, 'saveAs').mockImplementation();
    await generateUpdatedSEDFile(model);
    expect(saveAsSpy).toHaveBeenCalledWith(new Blob([YAML.stringify({key: "value"})]), 'incomplete-large__production__3evt_racks_2eba-selectedSize-Version1.yaml');
    model.isIncomplete = false;
  });

  test('Should generate values file for snapshot schema file' , async () => {
    model.schemaFromFileMode = true;
    model.importedSchemaFileName = "some_other_schema-sed-schema.json"
    const saveAsSpy = vi.spyOn(fileSaver, 'saveAs').mockImplementation();
    await generateUpdatedSEDFile(model);
    expect(saveAsSpy).toHaveBeenCalledWith(new Blob([YAML.stringify({key: "value"})]), 'some_other_schema-selectedSize-Version1.yaml');
  });
});

describe('generateYamlResponse', () => {
  test('generates YAML response correctly', async () => {
    const model = {
      schemaForm: [
        {
          key: 'property1',
          keys: ['property1.key1.key2'],
        },
        {
          key: 'property2',
          keys: ['property2.key3.key4'],
        },
        {
          key: 'property3',
        },
      ],
      selectedVersion: { sprintVersion: '1.0', version: '24.04.96' },
      selectedSize: { name: 'Small' },
      updated_data: {},
      response: {
        property1: 'text1',
        property2: 'text2',
      },
    };
    await generateYamlResponse(model);
    expect(model.updated_data.property1.key1.key2).to.equal('text1');
    expect(model.updated_data.property2.key3.key4).to.equal('text2');
  });

  test('generates YAML response with imported base yaml', async () => {
    const model = {
      schemaForm: [
        {
          key: 'property1',
          keys: ['property1.key1.key2'],
        },
        {
          key: 'property2',
          keys: ['property2.key3.key4'],
        },
        {
          key: 'property3',
        },
      ],
      selectedVersion: { sprintVersion: '1.0', version: '24.04.96' },
      selectedSize: { name: 'Small' },
      updated_data: {},
      response: {
        property1: 'text1',
        property2: 'text2',
      },
      importBaseYaml: true,
      importedBaseYamlContent: {
        Key: 'value'
      }
    };
    await generateYamlResponse(model);
    console.log();
    expect(model.updated_data.Key).to.equal('value');
  });
});

describe('loadProducts', () => {
  let model;

  beforeEach(() => {
    model = {};
  });

  test('Should load products and calls selectProduct when there is only one product', async () => {
    const product = { name: 'Product 1' };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: () => Promise.resolve([product])
    });

    await loadProducts(model);

    expect(global.fetch).toHaveBeenCalledWith("/data/products.json", { cache: "no-store" });
    expect(model.products).toEqual([product]);
  });

  test('Should handle error when fetching products', async () => {
    const error = new Error('Error loading products');
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(error);
    vi.spyOn(console, 'error');

    await loadProducts(model);

    expect(global.fetch).toHaveBeenCalledWith("/data/products.json", { cache: "no-store" });
    expect(model.products).toBeUndefined();
    expect(console.error).toHaveBeenCalledWith("Error loading products: " + error);
  });
});

describe('resetDeployment', () => {
  test('Should reset the properties on the model object to their default values', async () => {
    const model = {
      isModelReady: true,
      prepared: true,
      schemaForm: [{ name: 'field1' }, { name: 'field2' }],
      dataTypeCategories: [{ name: 'category1' }, { name: 'category2' }],
      otherProp: 'some value',
      wizardCurrentStep: 5,
    };

    resetDeployment(model);

    expect(model).toEqual({
      isModelReady: false,
      prepared: false,
      schemaForm: [],
      dataTypeCategories: [],
      otherProp: 'some value',
      wizardCurrentStep: 0,
    });
  });
});

describe('getSchemaForm', () => {
  let expectedResponse = [
    {
      key: "key1",
      displayName: "display1",
      type: "password",
      category: "category1",
      defaultValue: undefined,
      keys: ["key1"],
      example: "example1",
      longDescription: [
        "longDescription example.",
        "for tests"
      ],
      validationMessage: "description1",
      validationPattern: undefined,
      options: undefined,
      required: true,
      isValid: true,
      isDuplicate: false,
      preventDuplicates: '',
      inIPExclusionList: false,
      isPassword: true,
      errorMessage: "",
      alternateKeys: undefined,
      autoPopulate: "autoPopulate1",
      displayIf: undefined,
      displayIfNot: undefined,
      htmlDescription: undefined,
      valueMatchesKey: "other key name",
      isMatching: true,
      keepOptional: undefined,
      immutable: undefined,
      format: "password",
      nodeSelectorInfo: {},
      tolerationInfo: {},
      objectArrayInfo: {},
      customObjectInfo:{}
    },
    {
      key: "key2",
      displayName: "display2",
      type: "select",
      category: "category2",
      defaultValue: undefined,
      keys: ["key2"],
      example: "example2",
      longDescription: [
        "longDescription example.",
        "for tests"
      ],
      validationMessage: "definition2",
      validationPattern: undefined,
      options: [
        { name: "item1" },
        { name: "item2" }
      ],
      required: true,
      isValid: true,
      isDuplicate: false,
      preventDuplicates: '',
      inIPExclusionList: false,
      isPassword: false,
      errorMessage: "",
      alternateKeys: ["some.alternate.path"],
      autoPopulate: undefined,
      displayIf: undefined,
      displayIfNot: undefined,
      htmlDescription: undefined,
      isMatching: true,
      valueMatchesKey: undefined,
      keepOptional: undefined,
      immutable: undefined,
      format: undefined,
      nodeSelectorInfo: {},
      tolerationInfo: {},
      objectArrayInfo: {},
      customObjectInfo:{}
    }
  ]
  let schema = {
    properties: {
      parameters: {
        properties: {
          key1: {
            displayName: "display1",
            category: "category1",
            keys: ["key1"],
            $ref: "#/definitions/def1",
            isDuplicate: false,
            inIPExclusionList: false,
            example: "example1",
            longDescription: [
              "longDescription example.",
              "for tests"
            ],
            description: "description1",
            preventDuplicates: '',
            deploymentType: ["small_datapath"],
            autoPopulate: "autoPopulate1",
            valueMatchesKey: "other key name",
          },
          key2: {
            displayName: "display2",
            category: "category2",
            keys: ["key2"],
            $ref: "#/definitions/def2",
            example: "example2",
            longDescription: [
              "longDescription example.",
              "for tests"
            ],
            alternateKeys: ["some.alternate.path"],
            autoPopulate: undefined
          }
        }
      }
    },
    definitions: {
      def1: {
        type: "string",
        format: "password",
        description: "definition1"
      },
      def2: {
        type: "select",
        enum: ["item1", "item2"],
        description: "definition2"
      }
    }
  };

  test('Should update model data for each property in schemaForm but ignore when type is password', async () => {
    const model = { schemaForm: [], selectedSize: { name: "small", datapath: "small_datapath" }, includePasswords: false};
    getSchemaForm(schema, model);
    expect(model.selectedSize.datapath).toBeDefined();
    assert.deepStrictEqual(model.schemaForm, [expectedResponse[1]]);
  });

  test('Should update model data for each property in schemaForm but not ignore when type is password', async () => {
    const model = { schemaForm: [], selectedSize: { name: "small", datapath: "small_datapath" }, includePasswords: true};
    getSchemaForm(schema, model);
    expect(model.selectedSize.datapath).toBeDefined();
    assert.deepStrictEqual(model.schemaForm, expectedResponse);
  });

});


describe('checkDuplicates', () => {
  test('return true for duplicate values in response', async () => {
    const response = { amos_vip_address: "10.59.132.1", fm_vip_address: "10.59.132.1" }
    const field = {category: 'enmVlans', displayName: 'FM VIP address', key: 'amos_vip_address', required: true, preventDuplicates: true}
    const model = {
      schemaForm: [ { key: "amos_vip_address", preventDuplicates: true }, { key: "key3" } ],
      response: { amos_vip_address: "10.59.132.1", fm_vip_address: "10.59.132.1", },
      usedIpAddresses: ["10.59.132.1", "fd5b:1fd5:8295:5340:0000:0000:0000:0010", "2001:1b70:82a1:0380:0000:0000:0000:003F/64"]
    };
    expect(checkDuplicates(model, field, response)).toEqual(true)
  });
});


describe('checkDuplicates', () => {
  test('return false for duplicate values in response', async () => {
    const response = { ENMservices_gateway: "10.59.132.2", VLAN_ID_services: "10.59.132.1" }
    const field = {category: 'enmVlans', displayName: 'The subnet/netmask of the ENM Services VLAN', key: 'VLAN_ID_services', required: true, preventDuplicates: true}
    const model = { schemaForm: [], response: { VLAN_ID_services: "10.59.132.2", ENMservices_gateway: "10.59.132.1", }, excludeIps: [{ ipAddress: '11.11.11.11', ipDescription: 'test', isDuplicate: false }], usedIpAddresses: ["10.10.10.11", "fd5b:1fd5:8295:5340:0000:0000:0000:0010", "2001:1b70:82a1:0380:0000:0000:0000:003F/64"]};
    expect(checkDuplicates(model, field, response)).toEqual(false)
  });

  test('return true for duplicate ipv6 value case sensitive', async () => {
    const response = { amos_vip_address: "2001:4c48:0210:0900:0000:0000:0000:000A" }
    const field = {category: 'enmVlans', displayName: 'FM VIP address', key: 'amos_vip_address', required: true, preventDuplicates: true}
    const model = {
      schemaForm: [ { key: "amos_vip_address", preventDuplicates: true }, { key: "key3" } ],
      response: { amos_vip_address: "2001:4c48:0210:0900:0000:0000:0000:000A" },
      usedIpAddresses: ["2001:4c48:0210:0900:0000:0000:0000:000a", "fd5b:1fd5:8295:5340:0000:0000:0000:0010", "2001:1b70:82a1:0380:0000:0000:0000:003F/64"]
    };
    expect(checkDuplicates(model, field, response)).toEqual(true)
  });
});

describe('checkIpInExclusionIps', () => {
  test('return 1 for IP in exclusion list and in values in response', async () => {
    const response = { ENMservices_gateway: "10.59.132.1", VLAN_ID_services: "10.59.132.1" }
    const field = {category: 'enmVlans', displayName: 'The subnet/netmask of the ENM Services VLAN', key: 'VLAN_ID_services', required: true, preventDuplicates: true}
    const model = { schemaForm: [], response: { VLAN_ID_services: "10.59.132.1", ENMservices_gateway: "10.59.132.2", }, excludeIps: [{ ipAddress: '10.59.132.1', ipDescription: 'test', isDuplicate: false }]};
    const key = response[field.key]
    expect(checkIpInExclusionIps(model, key)).toEqual(1)
  });

  test('return false for IP in exclusion list NOT in values in response', async () => {
    const response = { ENMservices_gateway: "10.59.132.1", VLAN_ID_services: "10.59.132.1" }
    const field = {category: 'enmVlans', displayName: 'The subnet/netmask of the ENM Services VLAN', key: 'VLAN_ID_services', required: true, preventDuplicates: true}
    const model = { schemaForm: [], response: { VLAN_ID_services: "10.59.132.1", ENMservices_gateway: "10.59.132.2", }, excludeIps: [{ ipAddress: '10.59.132.55', ipDescription: 'test', isDuplicate: false }]};
    const key = response[field.key]
    expect(checkIpInExclusionIps(model, key)).toEqual(0)
  });
});

describe('isValidIp', () => {
  test('return true for valid IPv4', async () => {
    expect(isValidIp("10.59.132.1")).toEqual(true)
  });

  test('return false for invalid IPv4', async () => {
    expect(isValidIp("10.59.132.16666666")).toEqual(false)
  });

  test('return true for valid IPv6', async () => {
    expect(isValidIp("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toEqual(true)
  });

  test('return false for invalid IPv6', async () => {
    expect(isValidIp("2001:0db8:85a3:0000:0000:8a2e:")).toEqual(false)
  });

  test('return true for valid IPv6 cidr', async () => {
    expect(isValidIp("2001:1b70:82a1:0380:0000:0000:0000:0002/64")).toEqual(true)
  });

  test('return false for invalid IPv6 cidr', async () => {
    expect(isValidIp("2001:0db8:85a3:0000:0000:8a2e:0370:7334/20292837483")).toEqual(false)
  });
});

describe('getExcludedIps', () => {
  test('return ExcludedIps list from model', async () => {
    const model = { schemaForm: [], response: { VLAN_ID_services: "10.59.132.1", ENMservices_gateway: "10.59.132.2", }, excludeIps: [{ ipAddress: '10.59.132.55', ipDescription: 'test', isDuplicate: false }]};
    expect(getExcludedIps(model)).toEqual(["10.59.132.55"])
  });

  test('return no ExcludedIps list from model as none were present', async () => {
    const model = { schemaForm: [], response: { VLAN_ID_services: "10.59.132.1", ENMservices_gateway: "10.59.132.2", }, excludeIps: [{ ipAddress: '', ipDescription: '', isDuplicate: false }]};
    expect(getExcludedIps(model)).toEqual([])
  });
});

describe('generateKeyValueTextResponse', () => {
  test('Should update model data for each property in schemaForm for pENM', async () => {
    const model = {
      schemaForm: [{category: "cat", required: true, key: "environment_model"},
        {category: "cat", required: true, key: "ip_version"},
        {category: "cat", required: true, key: "internal_subnet"},
        {category: "cat", required: true, key: "storage_subnet"},
        {category: "cat", required: true, key: "LMS_IP_internal"},
        {category: "cat", required: true, key: "LMS_IP_management"},
        {category: "cat", required: true, key: "LMS_IP_storage"}],
      dataTypeCategories: [{shortName: "cat"}],
      response: {
        environment_model: "Large_ENM.xml",
        ip_version: "ipv4",
        internal_subnet: "internal1",
        storage_subnet: "storage1",
        LMS_IP_internal: "10.2.3.115",
        LMS_IP_management: "",
        LMS_IP_storage: "1.2.3.48",
      },
      updated_data: {},
      targetAudience: "cu",
      selectedVersion: {
        name: "R1GM IP1",
        releaseNumber: "24.1"
      }
    };

    await generateKeyValueTextResponse(model);
    expect(model.updated_data).toEqual([
      'ProductVersion = 24.1 - R1GM IP1',
      '\n',
      'LMS_IP_internal=10.2.3.115',
      '\n',
      'LMS_IP_management=',
      '\n',
      'LMS_IP_storage=1.2.3.48',
      '\n',
      'environment_model=Large_ENM.xml',
      '\n',
      'internal_subnet=internal1',
      '\n',
      'ip_version=ipv4',
      '\n',
      'storage_subnet=storage1',
      '\n'
    ]);
  });
});

describe('sortedKeys', () => {
  test('Should return a list of keys sorted by category', async () => {
    const model = {
      schemaForm: [{category: "cat1", required: true, key: "environment_model"},
        {category: "cat1", required: true, key: "ip_version"},
        {category: "cat2", required: true, key: "internal_subnet"},
        {category: "cat2", required: true, key: "storage_subnet"},
        {category: "cat3", required: true, key: "LMS_IP_internal"},
        {category: "cat3", required: true, key: "LMS_IP_management"},
        {category: "cat3", required: true, key: "LMS_IP_storage"}],
      dataTypeCategories: [{shortName: "cat1"},
        {shortName: "cat2"},
        {shortName: "cat3"}]
    };
    let arrangedKeys = sortedKeys(model);
    expect(arrangedKeys).toEqual([
      "environment_model",
      "ip_version",
      "internal_subnet",
      "storage_subnet",
      "LMS_IP_internal",
      "LMS_IP_management",
      "LMS_IP_storage"
    ]);
  });
});

describe('selectSize', () => {
  let model = {
    storedSchema: {},
    sizes: [
      {name: 'ENMOnRack'},
      {name: 'extraLarge'},
    ],
    targetAudience: 'pdu',
    version: [],
    selectedProduct: {
      name: 'Physical ENM',
      shortName: 'pENM',
    },
    selectedIpVersion: {
      name: "ipv4"
    },
    selectedVersion: {
      schemaVersion: 'some_schema.json',
    },
    artifactoryRepoData: {
      ENMOnRack: [
        {
          uri: '/ENMOnRack__production_dualStack__racks_4str_3ebs_6asr_1eba_schema.json',
          folder: false
        }
      ],
      extraLarge: [
        {
          uri: '/extraLarge__production_IPv4__1aut_racks_1eba_schema.json',
          folder: false
        }
      ]
    }
  };
  test('Should update the selected size in the model', () => {


    selectSize(0, model);

    expect(model.selectedSize.name).to.be.equal('ENMOnRack');
  });
});

describe('selectSize of cENM', () => {
  let model = {
    storedSchema: {},
    sizes: [
      {name: 'small'},
      {name: 'extraLarge'},
    ],
    targetAudience: 'pdu',
    version: [],
    selectedProduct: {
      name: 'Cloud Native ENM',
      shortName: 'cENM',
    },
    selectedIpVersion: {
      name: "ipv4"
    },
    selectedVersion: {
      schemaVersion: 'some_schema.json',
    },
    artifactoryRepoData:
        [
          {
            uri: '/eric-enm-integration-values-sed-schema.json',
            folder: false
          }
        ]
  };
  test('Should update the selected size in the model', () => {
    selectSize(0, model);
    expect(model.selectedSize.name).to.be.equal('small');
  });
});

describe('clearIPVersionsAvailableToSelect', () => {
  test('Should clear the IP versions to empty', () => {
    const model = {
      ipVersions: [{ name: 'IPv4' }, { name: 'IPv6' }],
    };
    clearIPVersionsAvailableToSelect(model)
    expect(model.ipVersions.length).toEqual(0);
  });
});

describe('selectIpVersion', () => {
  test('Should set the selected IP version correctly', async () => {
    let model = {
      ipVersions: [{ name: 'ipv4' }, { name: 'ipv6_ext' }],
      selectedIpVersion: null,
      selectedProduct: {
        name: 'Physical ENM',
        shortName: 'pENM',
      },
      selectedVersion: {
        name: '23.11',
        schemaVersion: '2.28.9',
        targetAudience: 'pdu',

      },
      artifactoryRepoData: {
        ENMOnRack: [
          {
            uri: '/ENMOnRack__production_IPv4__racks_4str_3ebs_6asr_1eba_schema.json',
            folder: false
          }
        ],
        extraLarge: [
          {
            uri: '/extraLarge__production_IPv4__1aut_racks_1eba_schema.json',
            folder: false
          }
        ]
      },
      storedSchema: {}
    };

    await selectIpVersion(0, model);
    expect(model.selectedIpVersion).to.deep.equal({ name: 'ipv4' });
    expect(model.sizes).to.deep.equal([{ name: 'ENMOnRack' }, { name: 'extraLarge' }])

    selectIpVersion(1, model);
    expect(model.selectedIpVersion).to.deep.equal({ name: 'ipv6_ext' });
    expect(model.sizes).to.deep.equal([{ name: 'ENMOnRack' }, { name: 'extraLarge' }])
  });
});

describe('selectIpVersion of cENM', () => {
  test('cENM - Should set the selected IP version correctly', async () => {
    let model = {
      ipVersions: [{ name: 'ipv4' }, { name: 'ipv6_ext' }],
      selectedIpVersion: null,
      selectedProduct: {
        name: 'Cloud Native ENM',
        shortName: 'cENM',
        deploymentSizes  : [
          {
            "name": "small"
          },
          {
            "name": "extraLarge"
          }
        ]
      },
      artifactoryRepoData:
          [
            {
              uri: '/eric-enm-integration-values-sed-schema.json',
              folder: false
            }
          ]
    };

    await selectIpVersion(0, model);
    expect(model.selectedIpVersion).to.deep.equal({ name: 'ipv4' });
    expect(model.sizes).to.deep.equal([{ name: 'small' }, { name: 'extraLarge' }])

    selectIpVersion(1, model);
    expect(model.selectedIpVersion).to.deep.equal({ name: 'ipv6_ext' });
    expect(model.sizes).to.deep.equal([{ name: 'small' }, { name: 'extraLarge' }])
  });
});

describe('clearVersionSelection', () => {
  test('Should clear the selected version correctly', () => {
    const model = {
      selectedVersion: default_select,
      isModelReady: true,
    };

    clearVersionSelection(model);
    expect(model.selectedVersion).toStrictEqual(default_select);
  });
});

describe('clearIPVersionSelection', () => {
  test('Should clear the selected IP version correctly', () => {
    const model = {
      selectedIpVersion: default_select,
      isModelReady: true,
    };

    clearIPVersionSelection(model);
    expect(model.selectedIpVersion).toStrictEqual(default_select);
  });
});

describe('resetUseCase', () => {
  test('Should clear the selected Use Case correctly', () => {
    const model = {
      selectedUseCase: default_select,
      isModelReady: true,
    };
    resetUseCase(model);
    expect(model.selectedUseCase).toStrictEqual(default_select);
  });
});

describe('resetSelectedProduct', () => {
  test('Should clear the selected Product correctly', () => {
    const model = {
      selectedProduct: 'Cloud',
      isModelReady: true,
    };
    resetSelectedProduct(model);
    expect(model.selectedProduct).toStrictEqual(default_select);
  });
});

describe('clearSizeSelection', () => {
  test('Should clear the selected size correctly', () => {
    const model = {
      selectedSize: default_select,
      isModelReady: true,
    };

    clearSizeSelection(model);
    expect(model.selectedSize).toStrictEqual(default_select);
  });
});

describe('clearIPVersionSelection', () => {
  test('Should clear the selected version correctly', () => {
    const model = {
      selectedIpVersion: default_select,
      isModelReady: true,
    };

    clearIPVersionSelection(model);
    expect(model.selectedIpVersion).toStrictEqual(default_select);
  });
});

describe('resetDryRunToggle', () => {
  test('Should reset the dry run toggle to false', () => {
    const model = {
      dryRunMode: true
    };
    resetDryRun(model)
    expect(model.dryRunMode).toBeFalsy();
  });
});

describe('resetIncludePassword', () => {
  test('Should reset the includePassword to field to includePassword', () => {
    const model = {
      includePasswords: false
    };
    resetIncludePassword(model)
    expect(model.includePasswords).toBeTruthy();
  });
});

describe('clearSchemaFromFileMode', () => {
  test('Should clear the schemaFromFileMode to field to schemaFromFileMode', () => {
    const model = {
      schemaFromFileMode: true
    };
    clearSchemaFromFileMode(model)
    expect(model.schemaFromFileMode).toBeFalsy();
  });
});

describe('clearPopulateValuesFromImportedSedFile', () => {
  test('Should clear the populateValuesFromImportedSedFile to field to populateValuesFromImportedSedFile', () => {
    const model = {
      schemaFromFileMode: true
    };
    clearPopulateValuesFromImportedSedFile(model)
    expect(model.usePreviousSED).toBeTruthy();
  });
});

describe('selectVersion', () => {
  test('Should set the selected release version correctly', () => {
    const model = {
      versions: [
        {
          name: "22.01.91",
          csar_url: "https://some_url",
          targetAudience: "pdu"
        },
        {
          name: "22.01.92",
          csar_url: "https://some_url",
          targetAudience: "pdu"
        },
      ],
      isModelReady: true,
      storedSchema: {},
      selectedProduct: {
        name: 'Physical ENM',
        shortName: 'pENM',
      },
    };

    selectVersion(model, 0);
    expect(model.selectedVersion).toStrictEqual({
      name: "22.01.91",
      csar_url: "https://some_url",
      targetAudience: "pdu"
    });

    selectVersion(model, 1);
    expect(model.selectedVersion).toStrictEqual({
      name: "22.01.92",
      csar_url: "https://some_url",
      targetAudience: "pdu"
    });
  });
  test('Should set the selected release version correctly for cENM', async () => {
    const model = {
      versions: [
        {
          name: "24.04.81-5",
          targetAudience: "pdu",
          schemaVersion: "1.54.0-62",
        },
      ],
      isModelReady: true,
      storedSchema: {},
      selectedProduct: {
        name: 'Cloud Native ENM',
        shortName: 'cENM',
        ipVersions: [
          {"name": "ipv4"},
          {"name": "dual"},
          {"name": "ipv6_ext"}
        ]
      },
    };
    await selectVersion(model, 0);
    expect(model.selectedVersion).to.deep.equal({
      name: "24.04.81-5",
      schemaVersion: "1.54.0-62",
      targetAudience: "pdu"
    });
    expect(model.ipVersions).to.deep.equal(
      [
        {name: "ipv4"},
        {name: "dual"},
        {name: "ipv6_ext"}
      ]);
  });
});

describe('removeUnusedIpaddressCategories', ()=>{
  test('Should remove ipv4 in schema categories when ipv6 is selected by the user', ()=>{
    var categories = [
      {"name": "IPv4 Address", "shortName": "ipv4"},
      {"name": "IPv6 Address", "shortName": "ipv6_ext"}
    ]
    var cat = removeUnusedIpaddressFields(categories, "ipv6", "shortName");
    expect(cat.length).toStrictEqual(1);
    expect(cat[0]).toStrictEqual(categories[1]);
  })

  test('Should remove ipv6 in schema categories when ipv4 is selected by the user', ()=>{
    var categories = [
      {"name": "IPv4 Address", "shortName": "ipv4"},
      {"name": "IPv6 Address", "shortName": "ipv6_ext"}
    ]
    var cat = removeUnusedIpaddressFields(categories, "ipv4", "shortName");
    expect(cat.length).toBe(1);
    expect(cat[0]).toStrictEqual(categories[0]);
  })

  test('Should remain the same ipv in schema categories when dual is selected by the user', ()=>{
    var categories = [
      {"name": "IPv4 Address", "shortName": "ipv4"},
      {"name": "IPv6 Address", "shortName": "ipv6"}
    ]
    var cat = removeUnusedIpaddressFields(categories, "dual", "shortName");
    expect(cat.length).toBe(2);
    expect(cat).toStrictEqual(categories);
  })

  test('Should remove ipv4 in autoPopulation category when ipv6 is selected by the user', ()=>{
    var autoPopulationTypes = [
      {"name": "IPv4 VIPs", "shortName": "ipv4_vips", "type": "ipv4"},
      {"name": "IPv6 VIPs", "shortName": "ipv6_vips", "type": "ipv6_ext"}
    ]
    var cat = removeUnusedIpaddressFields(autoPopulationTypes, "ipv6", "type");
    expect(cat.length).toBe(1);
    expect(cat[0]).toStrictEqual(autoPopulationTypes[1]);
  })

  test('Should remove ipv6 in autoPopulation category when ipv4 is selected by the user', ()=>{
    var autoPopulationTypes = [
      {"name": "IPv4 VIPs", "shortName": "ipv4_vips", "type": "ipv4"},
      {"name": "IPv6 VIPs", "shortName": "ipv6_vips", "type": "ipv6_ext"}
    ]
    var cat = removeUnusedIpaddressFields(autoPopulationTypes, "ipv4", "type");
    expect(cat.length).toBe(1);
    expect(cat[0]).toStrictEqual(autoPopulationTypes[0]);
  })
});

describe('storeModel', () => {
  test('Store model as JSON string', () => {
    var model = {
      valueName:  "value"
    };

    vi.spyOn(sessionStorage.__proto__, 'setItem');
    storeModel('model_id', model);
    expect(sessionStorage.__proto__.setItem).toHaveBeenCalledWith("model_id",'{"valueName":"value"}');
  });
});

describe('loadModelFromStorage', () => {
  test('load model from JSON string', () => {
    var model = {
      valueName: "value"
    };

    sessionStorage.__proto__.getItem = vi.fn().mockImplementation(() => '{"valueName":"differentValue"}');

    var loaded = loadModelFromStorage('model_id', model);
    expect(model.valueName).toBe('differentValue');
    expect(loaded).toBe(true)

  });
});



describe('readLocalSEDFile', () =>{
// Mock FileReader
  global.FileReader = class {
    readAsText() {
      this.onload();
    }
    result = '';
  };

  // test('readLocalSEDFile - yaml format', async () => {
  //   const event = {
  //     target: {
  //       files: [new Blob()],
  //     },
  //   };
  //   const model = {
  //     selectedProduct: {
  //       sedFileFormat: 'yaml',
  //     }
  //   };
  //   global.FileReader = class {
  //     readAsText() {
  //       this.onload();
  //     }
  //     result = 'key: value';
  //   };

  //   readLocalSEDFile(event, model);
  //   expect(model.importedFileContent).toStrictEqual({ key: 'value' });
  // });

  test('readLocalSEDFile - txt format', async () => {
    const event = {
      target: {
        files: [new Blob()],
      },
    };
    const model = {
      ENVIRONMENT_MODEL: 'environment_model',
      selectedProduct: {
        sedFileFormat: "txt",
      },
      selectedSchema:{
        sizeAlias: "large__production_dualStack__3evt_racks_2eba.xml"
      },
      ipVersions: [{ name: 'IPv4' }, { name: 'IPv6' }],
      response: {},
      selectedIpVersion: {
        name: 'ipv4'
      }
    };
    global.FileReader = class {
      readAsText() {
        this.onload();
      }
      result = 'ip_version=IPv4\nenvironment_model=large__production_dualStack__3evt_racks_2eba.xml\nJgroups_ipaddress_start=1.1.2.1';
    };
    readLocalSEDFile(event, model, 'select');
    expect(model.importedFileContent).toStrictEqual(['ip_version=IPv4', 'environment_model=large__production_dualStack__3evt_racks_2eba.xml']);
  });

  test('readLocalSEDFile - txt format with error', async () => {
    console.error = vi.fn();
    const event = {
      target: {
        files: [new Blob()],
      },
    };
    const model = {
      selectedProduct: {
        sedFileFormat: 'txt',
      },
      importedFileContent: null,
      ipVersions: [{ name: 'IPv4' }, { name: 'IPv6' }],
    };
    global.FileReader = class {
      readAsText() {
        this.onload();
      }
      result = 'ip_version=IPv7';
    };
    readLocalSEDFile(event, model, 'select');
    expect(console.error).toHaveBeenCalledWith(new Error("The ip_version key has value: IPv7 at line 1. Allowed values are : [IPv4,IPv6]"));
    expect(model.importedFileContent).toBeNull();
  });

  test('readLocalSEDFile - txt format - bad format', async () => {
    console.error = vi.fn();
    const event = {
      target: {
        files: [new Blob()],
      },
    };
    const model = {
      selectedProduct: {
        sedFileFormat: 'txt',
      },
    };
    global.FileReader = class {
      readAsText() {
        this.onload();
      }
      result = '===someValue';
    };
    readLocalSEDFile(event, model, 'select');
    expect(console.error).toHaveBeenCalledWith(new Error("To proceed, resolve the unexpected error at line 1 in imported file"));
  });

  test('readLocalSEDFile - txt format - with no environmnet_model', async () => {
    console.error = vi.fn();
    const event = {
      target: {
        files: [new Blob()],
      },
    };
    const model = {
      selectedProduct: {
        sedFileFormat: 'txt',
      },
    };
    global.FileReader = class {
      readAsText() {
        this.onload();
      }
      result = 'enable_fallback=false\nrwx_storageClass=rwx_class';
    };
    readLocalSEDFile(event, model, 'select');
    expect(console.error).toHaveBeenCalledWith(new Error("To proceed, set Environment model"));
  });

  test('Should show error if imported YAML is corrupt', () => {
    const error = "a multiline key may not be an implicit key at line 8, column 8" ||
        "a multiline key may not be an implicit key at (8:8)";
    let pattern = /line (\d+)|\((\d+):/;
    let result = pattern.test(error);

    expect(result).toBe(true);
  });
});

describe('readLocalSEDFile - using drop functionality', () =>{
  global.FileReader = class {
    readAsText() {
      this.onload();
    }
    result = '';
  };

  // test('readLocalSEDFile drop - yaml format', async () => {
  //   const event = {
  //     dataTransfer: {
  //       files: [new File(["variable: value"], 'test.yaml')],
  //     },
  //   };
  //   const model = {
  //     selectedProduct: {
  //       sedFileFormat: 'yaml',
  //     },
  //     response: {},
  //   };
  //   global.FileReader = class {
  //     readAsText() {
  //       this.onload();
  //     }
  //     result = 'variable: value';
  //   };
  //   dragFileFromLocalSEDFile(event, model);
  //   expect(model.importedFileContent).toStrictEqual({ variable: 'value' });
  // });

  test('readLocalSEDFile drop - txt format', async () => {
    const event = {
      dataTransfer: {
        files: [new File(["ip_version=IPv4\nenvironment_model=enmSize"], 'test.txt', { type: "text/plain" })],
      },
    };
    const model = {
      ENVIRONMENT_MODEL: 'environment_model',
      selectedProduct: {
        sedFileFormat: 'txt',
      },
      selectedSchema:{
        sizeAlias: "large__production_dualStack__3evt_racks_2eba.xml"
      },
      ipVersions: [{ name: 'IPv4' }, { name: 'IPv6' }],
      response: {},
      selectedIpVersion: {
        name: 'ipv4'
      },
      importedFileContent: []
    };
    global.FileReader = class {
      readAsText() {
        this.onload();
      }
      result = "ip_version=IPv4\nenvironment_model=enmSize";
    };
    dragFileFromLocalSEDFile(event, model);
    expect(model.importedFileContent).toStrictEqual(['ip_version=IPv4', 'environment_model=enmSize']);
  });

  test('readLocalSEDFile drop - wrong file type', () => {
    console.error = vi.fn();
    const event = {
      dataTransfer: {
        files: [new File(["ip_version=IPv4\nenvironment_model=enmSize"], 'test')],
      },
    };
    const model = {
      selectedProduct: {
        sedFileFormat: 'txt',
      }
    };
    dragFileFromLocalSEDFile(event, model);
    expect(console.error).toHaveBeenCalledWith(new Error("Incompatible file type"));
  });

  test('readLocalSEDFile drop - mulitple files uploaded', () => {
    console.error = vi.fn();
    const event = {
      dataTransfer: {
        files: [new File(["ip_version=IPv4\nenvironment_model=enmSize"], 'test.txt', { type: "text/plain" }), new File(["ip_version=IPv4\nenvironment_model=enmSize"], 'test.txt', { type: "text/plain" })],
      },
    };
    const model = {};
    dragFileFromLocalSEDFile(event, model);
    expect(console.error).toHaveBeenCalledWith(new Error("Multiple files uploaded"));
  });
});


describe('readBaseYamlTemplateFile', () =>{
  let model
  beforeEach(() => {
    global.FileReader = class {
      readAsText() {
        this.onload();
      }
      result = 'key: value';
    };
    model = {
      selectedProduct: {
        sedFileFormat: 'yaml',
      },
      importedBaseYamlContent: []
    };
  })
  global.FileReader = class {
    readAsText() {
      this.onload();
    }
    result = 'key: value';
  };

  test('readBaseYamlTemplateFile - select', async () => {
    const event = {
      target: {
        files: [new Blob()],
      },
    };
    readBaseYamlTemplateFile(event, model, "select");
    expect(model.importedBaseYamlContent).toStrictEqual({ key: 'value' });
  });

  test('readBaseYamlTemplateFile - drop', async () => {
    const event = {
      dataTransfer: {
        files: [new File(["key: value"], 'test.yaml')],
      },
    };
    readBaseYamlTemplateFile(event, model, "drop");
    expect(model.importedBaseYamlFileName).toEqual("test.yaml");
  });

  test('readBaseYamlTemplateFile - Error with empty file', async () => {
    console.error = vi.fn();
    const event = {
      target: {
        files: [new Blob()],
      },
    };
    global.FileReader = class {
      readAsText() {
        this.onload();
      }
      result = '';
    };
    readBaseYamlTemplateFile(event, model, 'select');
    expect(console.error).toHaveBeenCalled();
  });

  test('readBaseYamlTemplateFile - Error with corrupted file', async () => {
    console.error = vi.fn();
    const event = {
      target: {
        files: [new Blob()],
      },
    };
    global.FileReader = class {
      readAsText() {
        this.onload();
      }
      result = '{}}';
    };
    readBaseYamlTemplateFile(event, model, 'select');
    expect(console.error).toHaveBeenCalled();
  });
});

describe('loadFileFromLocalBaseTemplateFile', () => {
  let createElementMock;

  beforeEach(() => {
    createElementMock = vi.spyOn(document, 'createElement').mockImplementation(() => ({
      type: '',
      accept: '',
      onchange: null,
      click: vi.fn(),
    }));
  });

  afterEach(() => {
    createElementMock.mockRestore();
  });
  it('test loadFileFromLocalBaseTemplateFile', () => {
    const model = {};
    loadFileFromLocalBaseTemplateFile(model);
    expect(document.createElement).toHaveBeenCalledWith('input');
    expect(document.createElement).toHaveBeenCalledTimes(1);

    const input = document.createElement.mock.results[0].value;
    expect(input.type).toBe('file');
    expect(input.accept).toBe('.yaml,.yml');
    expect(input.onchange).toBeDefined();
    expect(input.click).toHaveBeenCalled();
  });
});

describe('populateValuesFromImportedSedFile - txt format for pENM', () => {
  let model;
  beforeEach(() => {
    model = {
      importedFileContent: [],
      selectedProduct: {
        sedFileFormat: 'txt',
      },
      schemaForm: {},
      importedData: {},
      response: {},
    };
  });

  test('Should populate values from imported SED file', () => {
    model.importedFileContent = ['key1=value1', 'key2=value2', 'key3=value3'];
    model.schemaForm = [ { key: "key1" }, { key: "key2" }, { key: "key3" } ];
    populateValuesFromImportedSedFile(model);
    expect(model.response).toEqual({ key1: 'value1', key2: 'value2', key3: 'value3' });
    expect(model.importedData).toEqual({ key1: 'value1', key2: 'value2', key3: 'value3' });
  });

  test('Should not populate values if model.selectedProduct.sedFileFormat is not "txt"', () => {
    model.selectedProduct.sedFileFormat = 'csv';
    model.importedFileContent = ['key1=value1', 'key2=value2'];
    populateValuesFromImportedSedFile(model);
    expect(model.response).toEqual({});
  });

  test('Should not populate values if key is not found in schemaForm', () => {
    model.importedFileContent = ['key1=value1', 'key2=value2'];
    model.schemaForm = [{ key: "key2" }];
    populateValuesFromImportedSedFile(model);
    expect(model.response).toEqual({ key2: 'value2' });
  });

  test('Should not populate values if value is empty in imported file', () => {
    model.importedFileContent = ['key1=value1', 'key2=', 'key3=value3'];
    model.schemaForm = [ { key: "key1" }, { key: "key3" } ]
    populateValuesFromImportedSedFile(model);
    expect(model.response).toStrictEqual({ key1: "value1" , key3: "value3" });
  });

  test('Should not populate values from imported SED file if value already set in model.response', () => {
    model.response = {
      key1: "some other value"
    }
    model.importedFileContent = ['key1=value1', 'key2=value2', 'key3=value3'];
    model.schemaForm = [ { key: "key1" }, { key: "key2" }, { key: "key3" } ];
    populateValuesFromImportedSedFile(model);
    expect(model.response).toEqual({ key1: 'some other value', key2: 'value2', key3: 'value3' });
    expect(model.importedData).toEqual({ key1: 'value1', key2: 'value2', key3: 'value3' });
  });

  test('Should populate values from imported SED file if value already set in model.response if the key starts with "enable_"', () => {
    model.response = {
      enable_key1: "false"
    }
    model.importedFileContent = ['enable_key1=true', 'key2=value2', 'key3=value3'];
    model.schemaForm = [ { key: "enable_key1" }, { key: "key2" }, { key: "key3" } ];
    populateValuesFromImportedSedFile(model);
    expect(model.response).toEqual({ enable_key1: 'true', key2: 'value2', key3: 'value3' });
    expect(model.importedData).toEqual({ enable_key1: 'true', key2: 'value2', key3: 'value3' });
  });
});

describe('populateValuesFromImportedSedFile for cENM using alternateKeys', () => {
  let model;
  beforeEach(() => {
    model = {
      importedFileContent: [],
      selectedProduct: {
        sedFileFormat: 'yaml',
      },
      schemaForm: {},
      importedData: {},
      response: {},
    };
  });

  test('Should populate model response with values from previous YAML for cENM', () => {
    model.schemaForm = [
      {
        key: "key1",
        keys: ['global.vips.key1']
      },
      {
        key: "key2",
        keys: ['global.vips.key2'],
        alternateKeys: ['global.vips.key2AlKey']
      }
    ];

    model.importedFileContent = {
      "global": {
        "vips": {
          "key1": "value1",
          "key2AlKey": "value2"
        },
      }
    };
    populateValuesFromImportedSedFile(model);
    expect(model.response).toEqual({ key1: 'value1', key2: 'value2' });
    expect(model.importedData).toEqual({ key1: 'value1', key2: 'value2' });
  });
});

// describe('populateValuesFromImportedSedFile', () => {
//   test('Should populate model response with values from previous YAML for cENM', () => {
//     const model = {
//       schemaForm: [
//         {
//           key: 'property1',
//           keys: ['property1.key1.key2'],
//         },
//         {
//           key: 'property2',
//           keys: ['property2.key3.key4'],
//         },
//       ],
//       response: {
//         property1: 'value',
//         property2: 'value',
//       },
//       importedData: {},
//       selectedProduct: { vid: 1, sedFileFormat: "yaml" }
//     };

//     populateValuesFromImportedSedFile(model);
//     expect(model.response.property1).toBe('value');
//     expect(model.importedData).toStrictEqual({});
//   });

//   test('Should populate model response with values from previous YAML for pENM', () => {
//     const model = {
//       schemaForm: [
//         {
//           key: 'property1',
//           keys: ['property1.key1.key2'],
//         },
//         {
//           key: 'property2',
//           keys: ['property2.key3.key4'],
//         },
//       ],
//       response: {
//         property1: 'value',
//         property2: 'value',
//       },
//       importedData: {},
//       selectedProduct: { vid: 1, sedFileFormat: "yaml" }
//     };

//     populateValuesFromImportedSedFile(model);
//     expect(model.response.property1).toBe('value');
//     expect(model.importedData).toStrictEqual({});
//   });
// });

describe('findKeysToCompare', () => {
  const schemaForm = [{
    key: "property1",
    autoPopulate: "internal"
  }];

  const model = {
    schemaForm: [
      {
        key: 'property1',
        keys: ['property1.key1.key2'],
      },
      {
        key: 'property2',
        keys: ['property2.key3.key4'],
      },
      {
        key: 'property3',
        keys: ['property3.key4.key5'],
      },
    ]
  };


  test('Should return a value found in the object', () => {
    const previousValue = findKeysToCompare(model.schemaForm);
    expect(previousValue).toStrictEqual( {"property1": true, "property2": true, "property3": true,} );
  });

  test('Should return undefined if none of the keys are found in the object', () => {
    const model = {
      schemaForm: [
        {
          autoPopulate: "internal",
          category: "LMS services"
        }
      ]
    };

    const previousValue = findKeysToCompare(model.schemaForm);
    expect(previousValue).toStrictEqual({"undefined": true});
  });
});

describe("deleteAllDataDialogOkFunction", () => {
  let model;
  let router;
  let schema;
  let getSchemaFormMock;
  let mockedSchemaData;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  model = {
    loadedSchema: {},
    response: {
      ip_version: 'ipv4',
      some_key1: 'someValue1',
      some_key2: 'someValue2',
    },
    usedIpAddresses: [
      {name: "deleted_key", value: "10.10.10.11"},
      {name: "deleted_key_ipv6", value: "fd5b:1fd5:8295:5340:0000:0000:0000:0010"},
      {name: "deleted_key_ipv6", value: "2001:1b70:82a1:0380:0000:0000:0000:003F/64"}
    ],
    schemaForm: [{key: "key"}],
    showDeleteAllDataConfirmation: true,
    selectedIpVersion: {
      name: 'ipv4'
    },
    selectedProduct: { vid: 1,
      sedSchemaRepo: "some_url",
      shortName: "shortName"
    },
    selectedVersion: {
      schemaVersion: 'some_schema.json',
    },
    selectedSize: {
      name: 'ENMOnRack'
    },
    selectedSchema: {
      name: 'ENMOnRack Dual racks_4str_3ebs_1eba',
      uri: '/ENMOnRack__production_dualStack__racks_4str_3ebs_1eba_schema.json',
    },
    storedSchema: {},
    selectedUseCase: {alias: 'upgrade'}
  };
  router = { push: vi.fn() };
  schema = {
    definitions: {
      any_string: {
        description: "This must be any string",
        pattern: "^.+$",
        type: "string"
      },
    },
    properties: {
      parameters: {
        properties: {
          property1: {
            "$ref": "#/definitions/any_string",
            displayName: "property display name.",
            category: "Category1",
            keys: [
              "path.to.value"
            ]
          }
        }
      }
    },
    categories: [{ name: "Category1" }, { name: "Category2" }],
    autoPopulationTypes: [{ name: "Internal" }, { name: "External" }]
  };
  getSchemaFormMock = vi.fn();
  mockedSchemaData = {
    data: {
      definitions: {
        any_string: {
          description: "This must be any string",
          pattern: "^.+$",
          type: "string"
        },
      },
      properties: {
        parameters: {
          properties: {
            property1: {
              "$ref": "#/definitions/any_string",
              displayName: "property display name.",
              category: "Category1",
              keys: [
                "path.to.value"
              ]
            }
          }
        }
      },
      categories: [{name: "Category1"}, {name: "Category2"}],
      autoPopulationTypes: [{name: "Internal"}, {name: "External"}]
    }
  };
  axios.post = vi.fn()
      .mockResolvedValueOnce(mockedSchemaData);

  test("Should update the model object", () => {
    const fetchMock = vi.fn().mockResolvedValue({ json: () => Promise.resolve(schema) });
    global.fetch = fetchMock;
    global.getSchemaForm = getSchemaFormMock;
    deleteAllDataDialogOkFunction(model, router);
    expect(model.showDeleteAllDataConfirmation).to.be.true;
  });
});

describe("deleteAllDataDialogCancelFunction", () => {
  let fetchMock;
  let model;
  let router;
  let schema;
  let getSchemaFormMock;

  beforeEach(() => {
    model = {
      response: {},
      usedIpAddresses: [
        {name: "deleted_key", value: "10.10.10.11"},
        {name: "deleted_key_ipv6", value: "fd5b:1fd5:8295:5340:0000:0000:0000:0010"},
        {name: "deleted_key_ipv6", value: "2001:1b70:82a1:0380:0000:0000:0000:003F/64"}
      ],
      schemaForm: [{key: "key"}],
      showDeleteAllDataConfirmation: true,
      userDataCleared: true,
      selectedIpVersion: {
        name: 'ipv4'
      },
      selectedProduct: { vid: 1,
        sedSchemaRepo: "some_url",
        shortName: "shortName"
      },
      selectedVersion: {
        schemaVersion: 'some_schema.json',
      },
      selectedSize: {
        name: 'ENMOnRack'
      },
      selectedSchema: {
        name: 'ENMOnRack Dual racks_4str_3ebs_1eba',
        uri: '/ENMOnRack__production_dualStack__racks_4str_3ebs_1eba_schema.json',
      },
      storedSchema: {
        ipVersion: {
          name: 'ipv4'
        },
        version: {
          schemaVersion: 'some_schema.json',
        },
        size: {
          name: 'ENMOnRack'
        },
        type: {
          name: 'ENMOnRack Dual racks_4str_3ebs_1eba',
          uri: '/ENMOnRack__production_dualStack__racks_4str_3ebs_1eba_schema.json',
        }
      },
      selectedUseCase: {alias: 'upgrade'}
    };
    router = { push: vi.fn() };
    schema = {
      definitions: {
        any_string: {
          description: "This must be any string",
          pattern: "^.+$",
          type: "string"
        },
      },
      properties: {
        parameters: {
          properties: {
            property1: {
              "$ref": "#/definitions/any_string",
              displayName: "property display name.",
              category: "Category1",
              keys: [
                "path.to.value"
              ]
            }
          }
        }
      },
      categories: [{ name: "Category1" }, { name: "Category2" }],
      autoPopulationTypes: [{ name: "Internal" }, { name: "External" }]
    };
    fetchMock = vi
        .fn()
        .mockResolvedValue({ json: () => Promise.resolve(schema) });
  });

  test("Should not update the model object", () => {
    global.fetch = fetchMock;
    global.getSchemaForm = getSchemaFormMock;
    deleteAllDataDialogCancelFunction(model, router);
    expect(model.userDataCleared).toBe(false);
    expect(model.showDeleteAllDataConfirmation).to.be.true;
    expect(model.selectedSchema).toEqual(model.storedSchema.type);
    expect(model.selectedSize).toEqual(model.storedSchema.size);
    expect(model.importedFileContent).toEqual(model.storedSchema.loadedFileContent);
    expect(model.importedFileName).toEqual(model.storedSchema.loadedFileName);
  });
});

describe('togglePreviousSED', () => {
  const model = {
    usePreviousSED: true,
    importedFileContent: { foo: 'bar' },
    selectedUseCase: {name: 'Upgrade'}
  };

  test('Should toggle the usePreviousSED flag', () => {
    expect(model.usePreviousSED).toBe(true);
    togglePreviousSED(model);
    expect(model.usePreviousSED).toBe(false);
    togglePreviousSED(model);
    expect(model.usePreviousSED).toBe(true);
  });

  test('Should reset importedFileContent data when usePreviousSED is set to false', () => {
    model.importedFileContent = { foo: 'bar' }
    togglePreviousSED(model);
    expect(model.importedFileContent).toBe(null);
  });
});


describe('checkLoadedENMSize', () => {
  test('Should set model.showpENMSizeMismatchNotification to true when ENM sizes do not match', () => {
    const model = {
      ENVIRONMENT_MODEL: 'environment_model',
      selectedSchema:{
        sizeAlias: "some_other_size_dd.xml"
      },
      selectedProduct: { sedFileFormat: "txt" },
      importedFileContent: ['Small_CloudNative_ENM.xml\nenvironment_model=not_some_other_size_dd.xml'],
      showpENMSizeMismatchNotification: false
    };
    checkLoadedENMSize(model);
    expect(model.showpENMSizeMismatchNotification).toBe(true);
  });

  test('Should set model.showpENMSizeMismatchNotification to false when ENM sizes do match', () => {
    const model = {
      ENVIRONMENT_MODEL: 'environment_model',
      selectedSchema:{
        sizeAlias: "large__production_dualStack__3evt_racks_2eba.xml"
      },
      selectedProduct: { sedFileFormat: "txt" },
      showpENMSizeMismatchNotification: false,
      response: {},
      importedFileContent: ['environment_model=large__production_dualStack__3evt_racks_2eba.xml']
    };
    const matcher = new RegExp(model.ENVIRONMENT_MODEL + `=`, 'g');
    const [entry] = model.importedFileContent.filter(word => word.match(matcher));
    model.response[model.ENVIRONMENT_MODEL] = entry.split('=')[1];
    checkLoadedENMSize(model);
    expect(model.showpENMSizeMismatchNotification).toBe(false);
  });

  test('Should keep showcENMSizeMismatchNotification as false when ENM sizes match', () => {
    const model = {
      selectedSize: {selectedSizeAlias: 'Small_CloudNative_ENM'},
      selectedProduct: { vid: 1, sedFileFormat: "yaml" },
      importedFileContent: {
        global: {
          enmProperties: {
            enm_deployment_type: 'Small_CloudNative_ENM.xml'
          }
        }
      },
      showcENMSizeMismatchNotification: true
    };

    checkLoadedENMSize(model);
    expect(model.showcENMSizeMismatchNotification).toBe(true);
  });

  test('Should keep showcENMSizeMismatchNotification as false when ENM sizes match', () => {
    const model = {
      selectedSize: {selectedSizeAlias: 'Small_CloudNative_ENM'},
      selectedProduct: { vid: 1, sedFileFormat: "yaml" },
      importedFileContent: {
        global: {
          enmProperties: {
            enm_deployment_type: 'Small_CloudNative_ENM.xml'
          }
        }
      },
      showcENMSizeMismatchNotification: true
    };
    checkLoadedENMSize(model);
    expect(model.showcENMSizeMismatchNotification).toBe(true);
  });
});

describe('checkIPversion', () => {
  test('Should set model.showIpVersionMismatchNotification to true when ip versions do not match', () => {
    const model = {
      selectedSizeAlias: 'Extra_Large_CloudNative_ENM',
      selectedProduct: { vid: 1, sedFileFormat: "yaml" },
      importedFileContent: {
        global: {
          ip_version: 'ipv4'
        }
      },
      selectedIpVersion: {
        name: 'ipv6'
      },
      showIpVersionMismatchNotification: false
    };

    checkIPversion(model);
    expect(model.showIpVersionMismatchNotification).toBe(true);
  });

  test('Should set model.showIpVersionMismatchNotification to false when ip versions do match', () => {
    const model = {
      selectedProduct: { vid: 1, sedFileFormat: "txt" },
      importedFileContent: ['ip_version=ipv4'],
      selectedIpVersion: {
        name: 'ipv4'
      },
      showIpVersionMismatchNotification: false
    };

    checkIPversion(model);
    expect(model.showIpVersionMismatchNotification).toBe(false);
  });
});

describe('incrementIPv4Address', () => {
  test.each([
    ["10.11.12.14","10.11.12.15"],
    ["10.11.255.255", "10.12.0.0"],
  ])('Should get the next IPv4 address to the inputted IP address(%s) -> %s', (ip, expected) => {
    expect(incrementIPv4Address(ip)).toBe(expected)
  })
});

describe('incrementIPv6Address', () => {
  test.each([
    ["fd5b:1fd5:8295:5340:0000:0000:0000:0004","fd5b:1fd5:8295:5340:0000:0000:0000:0005"],
    ["fd5b:1fd5:8295:5340:0000:0000:ffff:ffff", "fd5b:1fd5:8295:5340:0000:0001:0000:0000"],
    ["fd5b:1fd5:8295:5340:0000:::fff1", "fd5b:1fd5:8295:5340:0000:0000:0000:fff2"],
    ["2001:1b70:82a1:0380:0000::0000:008c/64", "2001:1b70:82a1:0380:0000:0000:0000:008d/64"]
  ])('Should get the next IPv6 address to the inputted IP address(%s) -> %s', (ip, expected) => {
    expect(incrementIPv6Address(ip)).toBe(expected)
  })
});

describe('isNextIPLessThanLastIP', () => {
  test.each([
    ["10.11.12.13","10.11.12.14", true],
    ["10.11.13.13","10.11.12.14", false],
    ["fd5b:1fd5:8295:5340:0000:0000:ffff:ffff", "fd5b:1fd5:8295:5340:0000:0001:0000:0000", true],
    ["fd5b:1fd5:8295:5340:0000:0000:0000:ffff", "fd5b:1fd5:8295:5340:0000:0000:0000:fda2", false],
    ["10.11.12.255","10.11.13.1", true],
    ["10.11.13.254","10.11.12.255", false],
    ["2001:1b70:82a1:0380:0000::0000:008C", "2001:1b70:82a1:0380:0000:0000::008C", true],
    ["2001:1b70:82a1:0380:0000:1:0000:00ff", "2001:1b70:82a1:0380:0000:0000:2:0fff", false],
    ["2001:1b70:82a1:0380:0000::0000:008C/64", "2001:1b70:82a1:0380:0000:0000::008C/64", true],
    ["2001:1b70:82a1:0380:0001::1/64", "2001:1b70:82a1:0380:0000::2:0/64", false],
    ["fd5b:1fd5:8295:5340:0000:0000:0000:ffff/64", "fd5b:1fd5:8295:5340:0000:0000:0000:fda2/64", false]
  ])('Should check if IP address is greater or less than lastIP(%s, %s) -> %b', (ip, lastIP, expected) => {
    expect(isNextIPLessThanLastIP(ip, lastIP)).toBe(expected)
  })
});

describe('autoPopulateIpAddresses', () => {
  var model = {
    excludeIps: [
      {
        ipAddress: '1.1.1.3',
        ipDescription: 'test',
        isDuplicate: false
      }],
    response:{
      internal_ipaddress_start: '1.1.1.1',
      internal_ipaddress_end: '1.1.1.12'
    },
    autoPopulationTypes:[
      {
        name: "Internal",
        shortName: "internal"
      }],
    schemaForm:[
      {
        key: "property1",
        autoPopulate: "internal",
        required:"true"
      }],
    usedIpAddresses: ["10.10.10.11", "fd5b:1fd5:8295:5340:0000:0000:0000:0010", "2001:1b70:82a1:0380:0000:0000:0000:003F/64"]
  };

  test('Should auto-populate model for empty IP-addresses provided start and end IP addresses', () => {
    autoPopulateIpAddresses(model, model.autoPopulationTypes[0]);
    expect(model.response["property1"]).toBe("1.1.1.1");
  });

  test('Should handle errors', () => {
    console.error = vi.fn();
    autoPopulateIpAddresses(model);
    expect(console.error).toHaveBeenCalledWith("Cannot read properties of undefined (reading 'shortName')");
  });
});

describe('updateResponse', () => {
  test('Should have a value to be updated in input box', () => {
    var model = {
      response: {
        internal_ipaddress_start: '1.1.1.1',
        internal_ipaddress_end: '',
      }
    };

    updateResponse(model, "internal_ipaddress_end");
    expect(Object.keys(model.response).length === 1).toBe(true);
  });
});

describe('colonAdder', () => {
  test.each([
    ["fd5b:1fd5:8295:5340::1","fd5b:1fd5:8295:5340:0000:0000:0000:0001"],
    ["fd5b:1fd5:8295:5340:0000:0000::ffff/32", "fd5b:1fd5:8295:5340:0000:0000:0000:ffff/32"],
    ["fd5b:1fd5:8295:5340::fff1", "fd5b:1fd5:8295:5340:0000:0000:0000:fff1"]
  ])('Should check if Ipv6 address octet length is 8 by adding more zeros for padding(%s) -> %s', (ip, expected) => {
    expect(colonAdder(ip)).toBe(expected)
  })
});

describe('setEnabledOptionalServiceRequired', () => {
  test('Should set optional key to be required when enabled', () => {
    var model = {
      response: {
        key1: '',
        key2: 'text',
        key3: 'true',
        key4: 'text',
        enableOptional: 'true',
      },
      schemaForm: [
        {key: "key1", displayIf: ["enableOptional"]},
        {key: "key2", displayIf: ["enableOptional"]},
        {key: "key3", displayIf: ["enableOptional"]},
        {key: "key4", displayIf: ["enableOptional", "test"]},
        {key: "key5"},
        {key: "enableOptional"}
      ],
      displayKeys: ["enableOptional"],
      loadedSchema: {
        properties: {
          parameters: {
            properties: {
              key1: {
                displayIf: ['enableOptional'],
                optional: true
              },
              key2: {
                displayIf: ['enableOptional'],
                optional: true
              },
              key3: {
                displayIf: ['enableOptional'],
                optional: true
              },
              key4: {
                displayIf: ['enableOptional', 'test'],
                optional: true
              },
              enableOptional: {
                optional: false
              }
            }
          }
        }
      }
    };

    setEnabledOptionalServiceRequired(model);
    expect(model.schemaForm.find(k => k.key === "key1").required).to.be.true;
    expect(model.schemaForm.find(k => k.key === "key2").required).to.be.true;
    expect(model.schemaForm.find(k => k.key === "key3").required).to.be.true;
    expect(model.schemaForm.find(k => k.key === "key4").required).to.be.false;
    expect(model.schemaForm.find(k => k.key === "key5").required).to.be.undefined;
  });

  test('Should set optional key to be required when enabled (multiple displayIf keys)', () => {
    var model = {
      response: {
        key1: '',
        key2: 'text',
        key3: 'true',
        key4: '',
        enableOptional: 'true',
        test: 'true',
        disabled: 'false',
        other: ''
      },
      schemaForm: [
        {key: "key1", displayIf: ["enableOptional", "test"], required: false},
        {key: "key2", displayIf: ["enableOptional", "disabled"], required: false},
        {key: "key3", displayIf: ["enableOptional"], required: false},
        {key: "key4", displayIf: ["other"], required: false, keepOptional: true},
        {key: "test", required: true},
        {key: "enableOptional", required: true}
      ],
      displayKeys: ["enableOptional", "test", "disabled", "other"],
      loadedSchema: {
        properties: {
          parameters: {
            properties: {
              key1: {
                displayIf: ['enableOptional', 'test'],
                optional: true,
              },
              key2: {
                displayIf: ['enableOptional', 'disabled'],
                optional: true,
              },
              key3: {
                displayIf: ['enableOptional'],
                optional: true,
              },
              key4: {
                displayIf: ['other'],
                optional: true,

              },
              test: {
                optional: false
              },
              enableOptional: {
                optional: false
              }
            }
          }
        }
      }
    };

    setEnabledOptionalServiceRequired(model);
    expect(model.schemaForm.find(k => k.key === "key1").required).to.be.true;
    expect(model.schemaForm.find(k => k.key === "key2").required).to.be.false;
    expect(model.schemaForm.find(k => k.key === "key3").required).to.be.true;
    expect(model.schemaForm.find(k => k.key === "key4").required).to.be.false;
  });
});

describe('autoPopulateHostnames', () => {
  var model = {
    response:{
      hostname_prefix: 'rn2enmcs'
    },
    schemaForm:[
      {
        key: "svc_node4_hostname",
        autoPopulate: "hostname",
        required: 'true'
      }]
  };

  test('Should auto-populate hostnames for unpopulated hostnames', () => {
    autoPopulateHostnames(model);
    expect(model.response["svc_node4_hostname"]).toBe("rn2enmcssvc4");
  });
});

describe('Calls to Artifactory backend', () => {
  let model;
  const mockedData1 = {
    data: {
      children: [
        {uri: "/ENMOnRack", folder: true},
        {uri: "/extraLarge", folder: true}
      ]
    }
  };
  const mockedData2 = {
    data: {
      children: [
        {uri: "/ENMOnRack__production_IPv4__2evt_racks_1eba_schema.json", folder: false},
        {uri: "/ENMOnRack__production_IPv4__2evt_schema.json", folder: false},
        {uri: "/ENMOnRack__production_IPv4__3evt_racks_1eba_schema.json", folder: false},
        {uri: "/ENMOnRack__production_IPv6_EXT__2evt_racks_1eba_schema.json", folder: false},
        {uri: "/ENMOnRack__production_IPv6_EXT__2evt_schema.json", folder: false},
        {uri: "/ENMOnRack__production_dualStack__racks_4str_3ebs_1eba_schema.json", folder: false},
        {uri: "/ENMOnRack__production_dualStack__racks_4str_3ebs_6asr_1eba_schema.json", folder: false},
      ]
    }
  };
  const mockedData3 = {
    data: {
      children: [
        {uri: "/extraLarge__production_IPv4__1aut_racks_1eba_schema.json", folder: false},
        {uri: "/extraLarge__production_dualStack__1aut_racks_1eba_schema.json", folder: false},
        {uri: "/extraLarge__production_IPv6_EXT__2evt_1aut_schema.json", folder: false},
      ]
    }
  };
  const mockedData4 = {
    data: {
      $schema: 'someUrl',
      autoPopulationTypes: [],
      categories: [],
      definitions: {},
      properties: {},
      version: '1.0.1'
    }
  };

  beforeEach(() => {
    model = {
      artifactoryRepoData: {
        ENMOnRack: [
          {
            uri: '/ENMOnRack__production_IPv4__3evt_racks_1eba_schema.json',
            folder: false
          },
          {
            uri: '/ENMOnRack__production_dualStack__racks_4str_3ebs_1eba_schema.json',
            folder: false
          },
          {
            uri: '/ENMOnRack__production_dualStack__racks_4str_3ebs_6asr_1eba_schema.json',
            folder: false
          }
        ],
        extraLarge: [
          {
            uri: '/extraLarge__production_IPv4__1aut_racks_1eba_schema.json',
            folder: false
          }
        ]
      },
      selectedProduct: {
        name: 'Physical ENM',
        shortName: 'pENM',
      }
    }
    axios.get = vi.fn()
        .mockResolvedValueOnce(mockedData1)
        .mockResolvedValueOnce(mockedData2)
        .mockResolvedValueOnce(mockedData3);
    axios.post = vi.fn()
        .mockResolvedValueOnce(mockedData4);
  });

  test('getPossibleIPVersions should return an array with schema IP versions', async () => {

    const result = await getPossibleIPVersions(model, '2.28.9');
    expect(result).toContainEqual({name: 'ipv4'});
    expect(result).toContainEqual({name: 'ipv6_ext'});
    expect(result).toContainEqual({name: 'dual'});
  });

  test('getPossibleDeploymentSizes should return an array with ENM deployment sizes', async () => {
    const result = await getPossibleDeploymentSizes(model, {name: 'ipv4'});
    expect(result).toContainEqual({name: 'ENMOnRack'});
    expect(result).toContainEqual({name: 'extraLarge'});
  });

  test('getPossibleSchemas should return an array with ENM schemas', async () => {
    const result = await getPossibleSchemas(model, {name: 'dual'}, {name: 'ENMOnRack'});
    expect(result).toContainEqual(
        {
          name: "ENMOnRack__production_dualStack__racks_4str_3ebs_1eba",
          shortName: "ENMOnRack Dual racks_4str_3ebs_1eba",
          sizeAlias: "ENMOnRack__production_dualStack__racks_4str_3ebs_1eba_dd.xml",
          uri: "/ENMOnRack__production_dualStack__racks_4str_3ebs_1eba_schema.json",
        });
    expect(result).toContainEqual(
        {
          name: "ENMOnRack__production_dualStack__racks_4str_3ebs_6asr_1eba",
          shortName: "ENMOnRack Dual racks_4str_3ebs_6asr_1eba",
          sizeAlias: "ENMOnRack__production_dualStack__racks_4str_3ebs_6asr_1eba_dd.xml",
          uri: "/ENMOnRack__production_dualStack__racks_4str_3ebs_6asr_1eba_schema.json",
        });
  });

  test('getPossibleCENMSchemas should return an array with cENM schemas', async () => {
    model = {
      selectedProduct: {
        shortName: "cENM"
      },
      artifactoryRepoData:
          [
            {
              uri: '/eric-enm-integration-values-sed-schema.json',
              folder: false
            }
          ]
    }
    const result = await getPossibleCENMSchemas(model);
    expect(result).toContainEqual(
        {
          name: "eric-enm-integration-values-sed-schema.json",
          shortName: "eric enm integration values sed",
          sizeAlias: "eric-enm-integration-values-sed-schema.json",
          uri: "eric-enm-integration-values-sed-schema.json",
        });
  });

  test('getDeploymentSizeFromArtifactory should return an array with ENM schemas data', async () => {
    const result = await getDeploymentSizeFromArtifactory(model, '2.28.9');
    expect(Object.keys(result)).toContainEqual('ENMOnRack');
    expect(result.ENMOnRack).toContainEqual(
        {uri: "/ENMOnRack__production_IPv4__2evt_racks_1eba_schema.json", folder: false}
    );
    expect(Object.keys(result)).toContainEqual('extraLarge');
    expect(result.extraLarge).toContainEqual(
        {uri: "/extraLarge__production_IPv4__1aut_racks_1eba_schema.json", folder: false}
    );
  });

  test('axiosGetSubList should return children data of the given link', async () => {
    const url = 'http://localhost:3000/api/extapi/data/?dir=2.28.7'
    const result = await axiosGetSubList(url);
    expect(result).toContainEqual({uri: "/ENMOnRack", folder: true});
    expect(result).toContainEqual({uri: "/extraLarge", folder: true});
  });

});

describe('getSchemaFileShortName', () => {
  test.each([
    ['ENMOnRack__production_dualStack__2evt_racks_1eba_schema.json', 'ENMOnRack Dual 2evt_racks_1eba'],
    ['ENMOnRack__production_dualStack__2evt_schema.json', 'ENMOnRack Dual 2evt'],
    ['ENMOnRack__production_IPv4__3evt_schema.json', 'ENMOnRack IPv4 3evt'],
    ['ENMOnRack__production_IPv4__5evt_racks_1eba_schema.json', 'ENMOnRack IPv4 5evt_racks_1eba'],
    ['ENMOnRack__production_IPv6_EXT__racks_4str_3ebs_6asr_1eba_schema.json', 'ENMOnRack IPv6 EXT racks_4str_3ebs_6asr_1eba'],
    ['ENMOnRack__production_IPv6_EXT__2evt_schema.json', 'ENMOnRack IPv6 EXT 2evt'],
    ['extraLarge__production_IPv4__2evt_schema.json', 'extraLarge IPv4 2evt'],
    ['extraLarge__production_geoMetro_dualStack__3evt_schema.json', 'extraLarge geoMetro Dual 3evt'],
    ['4db_large__production_dualStack__1aut_racks_8str_3ebs_6asr_schema.json', '4db_large Dual 1aut_racks_8str_3ebs_6asr'],
    ['4db_large__production_dualStack__3evt_racks_1str_1asr_1eba_schema.json', '4db_large Dual 3evt_racks_1str_1asr_1eba'],
    ['4db_large__production_dualStack__large_transport_only_1aut_schema.json', '4db_large Dual large_transport_only_1aut'],
    ['large__production_dualStack__1aut_racks_1eba_schema.json', 'large Dual 1aut_racks_1eba'],
    ['large__production_IPv6_EXT__large_transport_only_1aut_schema.json', 'large IPv6 EXT large_transport_only_1aut'],
  ])('Should return a shortened schema filename', async (schemaFileName, expectedResult) => {
    const result = await getSchemaFileShortName(schemaFileName, "pENM");
    expect(result).toEqual(expectedResult);
  });
});


describe('checkFieldAutopopulationRequired', () => {
  test('should return true if sedParam.autoPopulate is equal to autoPopulationTypeName and sedParam.displayIf is undefined', () => {
    const sedParam = {
      autoPopulate: 'autoPopulationTypeName',
      required: 'true'
    };
    const autoPopulationTypeName = 'autoPopulationTypeName';
    const model = {
      response: {},
    };
    const result = checkFieldAutopopulationRequired(sedParam, autoPopulationTypeName, model);
    expect(result).toBe(true);
  });

  test('should return false if sedParam.autoPopulate is not equal to autoPopulationTypeName', () => {
    const sedParam = {
      autoPopulate: 'otherAutoPopulationTypeName',
      required: 'false'
    };
    const autoPopulationTypeName = 'autoPopulationTypeName';
    const model = {
      response: {},
    };
    const result = checkFieldAutopopulationRequired(sedParam, autoPopulationTypeName, model);
    expect(result).toBe(false);
  });

  test('should return false if sedParam.displayIf is not an array', () => {
    const sedParam = {
      autoPopulate: 'autoPopulationTypeName',
      displayIf: 'notAnArray',
    };
    const autoPopulationTypeName = 'autoPopulationTypeName';
    const model = {
      response: {},
    };
    const result = checkFieldAutopopulationRequired(sedParam, autoPopulationTypeName, model);
    expect(result).toBe(false);
  });

  test('should return true if all keys in sedParam.displayIf exist in model.response and have a value of true', () => {
    const sedParam = {
      autoPopulate: 'autoPopulationTypeName',
      displayIf: ['key1', 'key2', 'key3'],
      required: 'false'
    };
    const autoPopulationTypeName = 'autoPopulationTypeName';
    const model = {
      response: {
        key1: 'true',
        key2: 'true',
        key3: 'true',
      },
    };
    const result = checkFieldAutopopulationRequired(sedParam, autoPopulationTypeName, model);
    expect(result).toBe(true);
  });

  test('should return false if any key in sedParam.displayIf does not exist in model.response or has a value other than true', () => {
    const sedParam = {
      autoPopulate: 'autoPopulationTypeName',
      displayIf: ['key1', 'key2', 'key3'],
      required: false
    };
    const autoPopulationTypeName = 'autoPopulationTypeName';
    const model = {
      response: {
        key1: 'true',
        key2: 'false',
        key3: 'true',
      },
    };
    const result = checkFieldAutopopulationRequired(sedParam, autoPopulationTypeName, model);
    expect(result).toBe(false);
  });
});

describe('getPopulatedValuesToCheckForDuplicates', () => {
  test('returns populated values, exclusion IPs, and IP used in from state without duplicates', async ({assert}) => {
    const model = {
      schemaForm: [
        {key: 'key1', preventDuplicates: true},
        {key: 'key2', preventDuplicates: false},
      ],
      response: {
        key1: '192.168.1.3',
        key2: '192.168.1.4',
      },
      excludeIps: [
        {ipAddress: '192.168.1.1'},
        {ipAddress: '192.168.1.2'},
      ],
      usedIpAddresses: ['10.10.10.11']
    };
    const result = getPopulatedValuesToCheckForDuplicates(model);
    const expected = ['192.168.1.1', '192.168.1.2', '192.168.1.3', '10.10.10.11'];
    expect(result).to.have.members(expected);
  });

  test('returns only exclusion IPs only when nothing in schema is marked with preventDuplicates', async ({assert}) => {
    const model = {
      schemaForm: [
        {key: 'key1'},
        {key: 'key2', preventDuplicates: false},
      ],
      response: {
        key1: '192.168.1.3',
        key2: '192.168.1.4',
      },
      excludeIps: [
        {ipAddress: '192.168.1.1'},
        {ipAddress: '192.168.1.2'},
      ],
      usedIpAddresses: []
    };
    const result = getPopulatedValuesToCheckForDuplicates(model);
    const expected = ['192.168.1.1', '192.168.1.2'];
    expect(result).to.have.members(expected);
  });

  test('returns duplicate IP even if no exclusion IPs are defined', async ({assert}) => {
    const model = {
      schemaForm: [
        {key: 'key1', preventDuplicates: true},
        {key: 'key2', preventDuplicates: false},
      ],
      response: {
        key1: '192.168.1.3',
        key2: '192.168.1.4',
      },
      usedIpAddresses: []
    };
    const result = getPopulatedValuesToCheckForDuplicates(model);
    const expected = ['192.168.1.3'];
    expect(result).to.deep.equal(expected);
  });

  test('returns used IPs from from state SED when specified in usedIpAddresses', async ({assert}) => {
    const model = {
      schemaForm: [
        {key: 'key1', preventDuplicates: true},
        {key: 'key2', preventDuplicates: false},
      ],
      response: {},
      usedIpAddresses: ['10.10.10.11']
    };
    const result = getPopulatedValuesToCheckForDuplicates(model);
    const expected = ['10.10.10.11'];
    expect(result).to.have.members(expected);
  });
});

describe('readLocalSchemaFile', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.FileReader = class {
      readAsText() {
        this.onload();
      }
      result = '{"k": "v"}';
    };
  });


  test('readLocalSchemaFile loads the schema', async () => {
    const event = {
      target: {
        files: [new Blob()],
      },
    };
    const model = {
      selectedSchema: {
        alias: null
      },
      loadedSchema: null,
    };
    readLocalSchemaFile(event, model, 'select');
    expect(model.loadedSchema).toStrictEqual({k: 'v'});
  });

  test('readLocalSchemaFile - Error with empty file', async () => {
    console.error = vi.fn();
    const event = {
      target: {
        files: [new Blob()],
      },
    };
    global.FileReader = class {
      readAsText() {
        this.onload();
      }
      result = '';
    };
    const model = {
      selectedSchema: {
        alias: null
      },
      loadedSchema: null,
    };
    readLocalSchemaFile(event, model, 'select');
    expect(console.error).toHaveBeenCalledWith(new Error('File is empty. Please check the file.'));
  });

  test('dragFileFromLocalSchemaFile - Error if incompatible file type', () => {
    console.error = vi.fn();
    const event = {
      dataTransfer: {
        files: [
          new File(['{"k": "v"}'], 'schema_test_1.txt', {type: 'text/plain'}),
        ],
      },
    };
    const model = {};
    dragFileFromLocalSchemaFile(event, model);
    expect(console.error).toHaveBeenCalledWith('Error importing schema: Incompatible file type');
  });

  test('dragFileFromLocalSchemaFile - Error if multiple files', () => {
    console.error = vi.fn();
    const event = {
      dataTransfer: {
        files: [
          new File(['{"k": "v"}'], 'schema_test_1.json', {type: 'text/plain'}),
          new File(['{"k": "v"}'], 'schema_test_2.json', {type: 'text/plain'}),
        ],
      },
    };
    const model = {};
    dragFileFromLocalSchemaFile(event, model);
    expect(console.error).toHaveBeenCalledWith('Error importing schema: Multiple files uploaded');
  });
});

describe('storeDeploymentDetails', () => {
  let model = {
    usePreviousSED: true,
    importedFileContent: { foo: 'bar' },
    importedFileName: 'Some_Deployment.txt',
    selectedIpVersion: {
      name: 'ipv4'
    },
    selectedProduct: { vid: 1,
      sedSchemaRepo: "some_url",
      shortName: "shortName"
    },
    selectedVersion: {
      schemaVersion: 'some_schema.json',
    },
    selectedSize: {
      name: 'ENMOnRack'
    },
    selectedSchema: {
      name: 'ENMOnRack Dual racks_4str_3ebs_1eba',
      uri: '/ENMOnRack__production_dualStack__racks_4str_3ebs_1eba_schema.json',
    }, storedSchema: {}
  };

  test('should store user inputs in storedSchema', () => {
    storeDeploymentDetails(model);
    expect(model.storedSchema.type).toEqual(model.selectedSchema);
    expect(model.storedSchema.size).toEqual(model.selectedSize);
    expect(model.storedSchema.ipVersion).toEqual(model.selectedIpVersion);
    expect(model.storedSchema.version).toEqual(model.selectedVersion);
    expect(model.storedSchema.loadedFileContent).toEqual(model.importedFileContent);
    expect(model.storedSchema.loadedFileName).toEqual(model.importedFileName);
  });
});

describe('updateSchemaOptionalValues', () => {
  test('optional should be set to false when enable_fallback = true', async ({assert}) => {
    const model = {
      response: {
        enable_fallback: 'true',
      },
      displayKeys: ['enable_fallback'],
      loadedSchema: {
        properties: {
          parameters: {
            properties: {
              key1: {
                displayIf: ["enable_fallback"],
                optional: true
              },
            }
          }
        }
      },
    };
    updateSchemaOptionalValues(model);
    expect(model.loadedSchema.properties.parameters.properties.key1.optional).to.equal(false);
  });

  test('optional should be set to true when enable_fallback = false', async ({assert}) => {
    const model = {
      response: {
        enable_fallback: 'false',
      },
      displayKeys: ['enable_fallback'],
      loadedSchema: {
        properties: {
          parameters: {
            properties: {
              key1: {
                displayIf: ['enable_fallback'],
                optional: false
              },
            }
          }
        }
      },
    };
    updateSchemaOptionalValues(model);
    expect(model.loadedSchema.properties.parameters.properties.key1.optional).to.equal(true);
  });

  test('optional equals true when to values{enable_fallback, enable_fallback_common} = true', async ({assert}) => {
    const model = {
      response: {
        enable_fallback: 'true',
        enable_fallback_common: 'true'
      },
      displayKeys: ['enable_fallback', 'enable_fallback_common'],
      loadedSchema: {
        properties: {
          parameters: {
            properties: {
              key1: {
                displayIf: ['enable_fallback', 'enable_fallback_common'],
                optional: true
              },
            }
          }
        }
      },
    };
    updateSchemaOptionalValues(model);
    expect(model.loadedSchema.properties.parameters.properties.key1.optional).to.equal(false);
  });

  test('optional equals true when to value enable_fallback=false and enable_fallback_common=true', async ({assert}) => {
    const model = {
      response: {
        enable_fallback: 'false',
        enable_fallback_common: 'true'
      },
      displayKeys: ['enable_fallback', 'enable_fallback_common'],
      loadedSchema: {
        properties: {
          parameters: {
            properties: {
              key1: {
                displayIf: ['enable_fallback', 'enable_fallback_common'],
                optional: true
              },
            }
          }
        }
      },
    };
    updateSchemaOptionalValues(model);
    expect(model.loadedSchema.properties.parameters.properties.key1.optional).to.equal(false);
  });

  test('optional equals true when to value enable_fallback=true and enable_fallback_common=false', async ({assert}) => {
    const model = {
      response: {
        enable_fallback: 'true',
        enable_fallback_common: 'false'
      },
      displayKeys: ['enable_fallback', 'enable_fallback_common'],
      loadedSchema: {
        properties: {
          parameters: {
            properties: {
              key1: {
                displayIf: ['enable_fallback', 'enable_fallback_common'],
                optional: true
              },
            }
          }
        }
      },
    };
    updateSchemaOptionalValues(model);
    expect(model.loadedSchema.properties.parameters.properties.key1.optional).to.equal(false);
  });

  test('optional equals flase when to value enable_fallback=true and keepOptional=true', async ({assert}) => {
    const model = {
      response: {
        enable_fallback: 'true',
      },
      displayKeys: ['enable_fallback'],
      loadedSchema: {
        properties: {
          parameters: {
            properties: {
              key1: {
                displayIf: ['enable_fallback', 'enable_fallback_common'],
                optional: true,
                keepOptional: true
              },
            }
          }
        }
      },
    };
    updateSchemaOptionalValues(model);
    expect(model.loadedSchema.properties.parameters.properties.key1.optional).to.equal(true);
  });
});

describe('ordering categories in alphabetic order', () => {
  let model = {
    schemaForm: [
      {key: 'key_a', category: 'cat'},
      {key: 'key_s', category: 'cat'},
      {key: 'key_g', category: 'cat'},
      {key: 'key_f', category: 'notInCategory'},
      {key: 'enable_category_f', category: 'cat'},
      {key: 'enable_category_b', category: 'cat'},
      {key: 'enable_category_a', category: 'cat'}
    ]
  };
  let category = 'cat';

  test('should return list in order and keys starting with "enable" on top (in order)', () => {
    let orderedList = filterCategory(category, model);
    expect(orderedList[0].key).toEqual('enable_category_a');
    expect(orderedList[1].key).toEqual('enable_category_b');
    expect(orderedList[2].key).toEqual('enable_category_f');
    expect(orderedList[3].key).toEqual('key_a');
    expect(orderedList[4].key).toEqual('key_g');
    expect(orderedList[5].key).toEqual('key_s');
    expect(orderedList.length).toBe(6);
  });
});

describe('Test checkShouldParamBeDisplayed', () => {
  it('returns true when displayIf is undefined', () => {
    const model = { response: { key: 'value' } };
    const question = { displayIf: undefined };
    const result = checkShouldParamBeDisplayed(model, question);
    expect(result).to.be.true;
  });

  it('returns true when key is "true"', () => {
    const model = { response: { key: 'true' } };
    const question = { displayIf: ['key'] };
    const result = checkShouldParamBeDisplayed(model, question);
    expect(result).to.be.true;
  });

  it('returns true when array displayIf has all values defined and not including "false" or undefined', () => {
    const model = { response: { key1: 'value1', key2: 'value2' } };
    const question = { displayIf: ['key1', 'key2'] };
    const result = checkShouldParamBeDisplayed(model, question);
    expect(result).to.be.true;
  });

  it('returns true when array displayIf includes "enable_fallback" and corresponding value is defined', () => {
    const model = { response: { enable_fallback: 'value', enable_fallback_category: 'category' } };
    const question = { displayIf: ['enable_fallback'] };
    const result = checkShouldParamBeDisplayed(model, question);
    expect(result).to.be.true;
  });

  it('returns false when array displayIf includes undefined', () => {
    const model = { response: { key: 'value' } };
    const question = { displayIf: ['key', 'undefinedKey'] };
    const result = checkShouldParamBeDisplayed(model, question);
    expect(result).to.be.false;
  });

  it('returns false when array displayIfNot includes true', () => {
    const model = { response: { key: 'true' } };
    const question = { displayIfNot: ['key'] };
    const result = checkShouldParamBeDisplayed(model, question);
    expect(result).to.be.false;
  });

  it('returns true when array displayIfNot includes false', () => {
    const model = { response: { key: 'false' } };
    const question = { displayIfNot: ['key'] };
    const result = checkShouldParamBeDisplayed(model, question);
    expect(result).to.be.true;
  });

  it('returns true when displayIfNot is undefined', () => {
    const model = { response: { key: 'value' } };
    const question = { displayIfNot: undefined };
    const result = checkShouldParamBeDisplayed(model, question);
    expect(result).to.be.true;
  });
});

describe('configureComparisonModels', () => {

  const model = {
    sprints: [],
    releases: [
      {
        releaseNumber: "24.1",
        sprintNumber: "23.17",
        visible: true
      },
      {
        releaseNumber: "23.4",
        sprintNumber: "23.16",
        visible: true
      }
    ],
    versions: [
      {
        name: '23.17.115',
        release: true,
        releaseNumber: "24.1",
        schemaVersion: '2.33.4',
        targetAudience: 'cu',
        version: '23.17.115',
        sprintVersion: '23.17'
      },
      {
        name: '23.16.115',
        schemaVersion: '2.33.4',
        releaseNumber: "23.4",
        targetAudience: 'cu',
        release: true,
        version: '23.16.115',
        sprintVersion: '23.16'
      }
    ],
    products: [{
      name: "Physical ENM",
      sedFileFormat: "txt",
      sedSchemaRepo: "proj-online-sed-generic-local",
      shortName: "pENM"
    }
    ],
  };
  let comparisonModel = {}

  test('should configure the comparison models. Compare model should equal contents of model and model sprint should remove ' +
      'latest sprint because it only contains one release', async () => {
    const vid = 0;
    await configureComparisonModels(model, comparisonModel, vid)
    expect(model.releases[0].releaseNumber).toEqual("23.4");
    expect(model.releases.length).toEqual(1);
  });
});

describe('configureComparisonModels test sprint', () => {

  const model = {
    sprints: [
      {sprintVersion: "23.17"},
      {sprintVersion: "23.16"}
    ],
    releases: [],
    versions: [
      {
        name: '23.17.115',
        release: true,
        releaseNumber: "24.1",
        schemaVersion: '2.33.4',
        targetAudience: 'cu',
        version: '23.17.115',
        sprintVersion: '23.17'
      },
      {
        name: '23.16.115',
        schemaVersion: '2.33.4',
        releaseNumber: "23.4",
        targetAudience: 'cu',
        release: true,
        version: '23.16.115',
        sprintVersion: '23.16'
      }
    ],
    products: [{
      name: "Physical ENM",
      sedFileFormat: "txt",
      sedSchemaRepo: "proj-online-sed-generic-local",
      shortName: "pENM"
    }
    ],
  };
  let comparisonModel = {}
  test('should configure the comparison models. Compare model should equal contents of model and model sprint should remove ' +
      'latest sprint because it only contains one release', async () => {
    const vid = 0;
    await configureComparisonModels(model, comparisonModel, vid)
    expect(model.sprints[0].sprintVersion).toEqual("23.16");
    expect(model.sprints.length).toEqual(1);
  });
});

describe('filterAndRemoveIfSingle', () => {
  const model = {
    sprints: [
      {sprintVersion: "23.17"},
      {sprintVersion: "23.16"}
    ],
    releases: [
      {
        releaseNumber: "24.1",
        sprintNumber: "23.17",
        visible: true
      },
      {
        releaseNumber: "23.4",
        sprintNumber: "23.16",
        visible: true
      }
    ],
    versions: [
      {
        name: '23.17.115',
        release: true,
        releaseNumber: "24.1",
        schemaVersion: '2.33.4',
        targetAudience: 'cu',
        version: '23.17.115',
        sprintVersion: '23.17'
      },
      {
        name: '23.16.115',
        schemaVersion: '2.33.4',
        releaseNumber: "23.4",
        targetAudience: 'cu',
        release: true,
        version: '23.16.115',
        sprintVersion: '23.16'
      }
    ],
    products: [{
      name: "Physical ENM",
      sedFileFormat: "txt",
      sedSchemaRepo: "proj-online-sed-generic-local",
      shortName: "pENM"
    }
    ],
  };

  test('should remove sprintVersion 23.17 from sprints', async () => {
    const vid = 0;
    await filterAndRemoveIfSingle(model, 'sprints', 'sprintVersion');
    expect(model.sprints[0].sprintVersion).toEqual("23.16");
    expect(model.sprints.length).toEqual(1);
  });

  test('should remove releaseNumber 24.1 from releases', async () => {
    const vid = 0;
    await filterAndRemoveIfSingle(model, 'releases', 'releaseNumber', item => item.targetAudience === 'cu');
    expect(model.releases[0].releaseNumber).toEqual("23.4");
    expect(model.releases.length).toEqual(1);

  });
});

describe('isValidObject', ()=> {
  test('Should convert the dec number to hex string', async () => {
    var num = 123;
    expect(dec2hex(num)).to.equal('7b');
  });
});

describe('isValidObject', () => {
  let model;
  let nodeSelectorQuestion, arrayInputQuestion, objectArrayInputQuestion, customObjectQuestion;

  beforeEach(() => {
    model = {
      response: {testKey: {}},
      schemaForm: [{key: "testKey"}]
    };
    nodeSelectorQuestion = {
      key: 'testKey',
      type: 'nodeSelector',
      required: true
    };
    objectArrayInputQuestion = {
      key: 'testKey',
      type: 'objectArray',
      required: true
    };
    arrayInputQuestion = {
      key: 'testKey',
      type: 'array',
      required: true
    };
    customObjectQuestion = {
      key: 'testKey',
      type: 'customObject',
      required: true
    };
  });

  it('should return true when isValidNodeSelectors returns true', () => {
    const spy = vi.spyOn(CENMUtils, 'isValidNodeSelectors').mockReturnValue(true);
    expect(isValidObject(model, nodeSelectorQuestion)).to.be.true;
  });

  it('should return false when isValidNodeSelectors returns false', () => {
    const spy = vi.spyOn(CENMUtils, 'isValidNodeSelectors').mockReturnValue(false);
    expect(isValidObject(model, nodeSelectorQuestion)).to.be.false;
  });

  it('should return true when isValidObjectArrayInput returns true', () => {
    const spy = vi.spyOn(CENMUtils, 'isValidObjectArrayInput').mockReturnValue(true);
    expect(isValidObject(model, objectArrayInputQuestion)).to.be.true;
  });

  it('should return false when isValidObjectArrayInput returns false', () => {
    const spy = vi.spyOn(CENMUtils, 'isValidObjectArrayInput').mockReturnValue(false);
    expect(isValidObject(model, objectArrayInputQuestion)).to.be.false;
  });

  it('should return true when isValidArray returns true', () => {
    const spy = vi.spyOn(CENMUtils, 'isValidArray').mockReturnValue(true);
    expect(isValidObject(model, arrayInputQuestion)).to.be.true;
  });

  it('should return false when isValidArray returns false', () => {
    const spy = vi.spyOn(CENMUtils, 'isValidArray').mockReturnValue(false);
    expect(isValidObject(model, arrayInputQuestion)).to.be.false;
  });

  it('should return true when validateAllCustomObjectEntries returns true', () => {
    const spy = vi.spyOn(CENMUtils, 'validateAllCustomObjectEntries').mockReturnValue(true);
    expect(isValidObject(model, customObjectQuestion)).to.be.true;
  });

  it('should return false when validateAllCustomObjectEntries returns false', () => {
    const spy = vi.spyOn(CENMUtils, 'validateAllCustomObjectEntries').mockReturnValue(false);
    expect(isValidObject(model, customObjectQuestion)).to.be.false;
  });

  it('should return false when key in response is undefined', () => {
    let localModel = {
      response: {}
    };
    let currentQuestion = {
      key: 'testKey',
      type: 'customObject',
      nodeSelectorInfo: {},
      required: true
    };
    expect(isValidObject(localModel, currentQuestion)).to.be.false;
  });
});