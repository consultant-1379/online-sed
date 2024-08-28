import {
  deepMergeObjects,
  findInObject,
  createNestedObject,
  generateYamlResponse,
  readObjectDetails,
  isValidNodeSelectors,
  getTolerationErrorsCount,
  isValidArray,
  stringToBoolean,
  isValidObjectArrayInput,
  isObjectArrayValid,
  isDuplicateEntryInObject,
  getAllInputsForKey,
  isValidCustomObject,
  getDateTimeFormatted,
  isValidDate,
  validateAllCustomObjectEntries,
  validateArrayInput,
  isDisplayConditionMet,
  isTrueOrStringTrue,
  isFalseOrStringFalse,
  getBaseYamlFileForExport,
  checkIfKeyIsNeeded,
  getProperty,
  checkKeys

} from "../../src/utils/CENMUtils.js";
import {describe, expect, test, vi} from "vitest";

describe('deepMergeObjects', () => {
  test('Should merge two objects with no shared keys', () => {
    const dict1 = { a: 1, b: 2 };
    const dict2 = { c: 3, d: 4 };
    const expected = { a: 1, b: 2, c: 3, d: 4 };
    const result = deepMergeObjects(dict1, dict2);
    assert.deepEqual(result, expected);
  });

  test('Should merge two objects with shared keys', () => {
    const dict1 = { a: 1, b: 2 };
    const dict2 = { b: 3, c: 4 };
    const expected = { a: 1, b: 3, c: 4 };
    const result = deepMergeObjects(dict1, dict2);
    assert.deepEqual(result, expected);
  });

  test('Should return null value if null not undefined', () => {
    const dict1 = { a: 1 };
    const dict2 = { a: null };
    const expected = { a: null };
    const result = deepMergeObjects(dict1, dict2);
    assert.deepEqual(result, expected);
  });

  test('Should return null value if undefined not undefined', () => {
    const dict1 = { a: 1 };
    const dict2 = { a: undefined };
    const expected = { a: null };
    const result = deepMergeObjects(dict1, dict2);
    assert.deepEqual(result, expected);
  });

  test('Should merge two objects with shared nested keys', () => {
    const dict1 = { a: 1, b: { c: 2, d: 3 } };
    const dict2 = { b: { d: 4, e: 5 } };
    const expected = { a: 1, b: { c: 2, d: 4, e: 5 } };
    const result = deepMergeObjects(dict1, dict2);
    assert.deepEqual(result, expected);
  });

  test('Should return the first object if the second object is empty', () => {
    const dict1 = { a: 1, b: 2 };
    const dict2 = {};
    const expected = { a: 1, b: 2 };
    const result = deepMergeObjects(dict1, dict2);
    assert.deepEqual(result, expected);
  });

  test('Should return the second object if the first object is empty', () => {
    const dict1 = {};
    const dict2 = { a: 1, b: 2 };
    const expected = { a: 1, b: 2 };
    const result = deepMergeObjects(dict1, dict2);
    assert.deepEqual(result, expected);
  });

  test('Should create nested array object and keep as an array object', () => {
    const dict1 = {z :1, x: 2};
    const dict2 = {arr: [{'a':'aa', 'a1':'aa1', 'a2':'aa2'}, {'b': 'bb', 'b1':12}, {'c':'cc'}]};
    const result = deepMergeObjects(dict1, dict2);
    const expected = {z :1, x: 2, arr: [{'a':'aa', 'a1':'aa1', 'a2':'aa2'}, {'b': 'bb', 'b1':12}, {'c':'cc'}]};
    assert.deepEqual(result, expected);
  });

  test('Should return nothing if dict1 is null', () => {
    const dict1 = null;
    const dict2 = {arr: [{'a':'aa', 'a1':'aa1', 'a2':'aa2'}, {'b': 'bb', 'b1':12}, {'c':'cc'}]};
    const result = deepMergeObjects(dict1, dict2);
    assert.deepEqual(result, undefined);
  });

  test('Should return nothing if dict2 is null', () => {
    const dict1 = {arr: [{'a':'aa', 'a1':'aa1', 'a2':'aa2'}, {'b': 'bb', 'b1':12}, {'c':'cc'}]};
    const dict2 = null;
    const result = deepMergeObjects(dict1, dict2);
    assert.deepEqual(result, undefined);
  });

  test('Should preserve array value from dict2 input arrays with shared keys', () => {
    const dict1 = { arr: [{ a: 1 }, { b: 2 }] };
    const dict2 = { arr: [{ b: 3 }, { c: 4 }] };
    const expected = { arr: [{b: 3 }, {c: 4 }] };
    const result = deepMergeObjects(dict1, dict2);
    assert.deepEqual(result, expected);
  });

  test('Should merge read exclusions from dict2 object', () => {
    const dict1 = {};
    const dict2 = { exclusions: [{ field: 'value2', other: 'test' }, { field: 'value3' }] };
    const result = deepMergeObjects(dict1, dict2);
    const expected = { exclusions: [{ logplane: null, rules: [{ field: 'value2', other: 'test' }, { field: 'value3' }]}] };
    assert.deepEqual(result, expected);
  });

  test('Should keep existing value if exclusion object does not contain "field" attribute', () => {
    const dict1 = {};
    const dict2 = {exclusions: [{ logplane: null, rules: [{ field: 'value2'}]}]};
    const result = deepMergeObjects(dict1, dict2);
    const expected = {exclusions: [{ logplane: null, rules: [{ field: 'value2'}]}]};
    assert.deepEqual(result, expected);
  });

  test('Should merge arrays with non-array values', () => {
    const dict1 = { arr: { a: 1 } };
    const dict2 = { arr: { b: 2 } };
    const expected = { arr: { a: 1, b: 2 } };
    const result = deepMergeObjects(dict1, dict2);
    assert.deepEqual(result, expected);
  });

  test('Should merge arrays with values converted using stringToBoolean', () => {
    const dict1 = { arr: 'true' };
    const dict2 = { arr: 'false' };
    const expected = { arr: false };
    const result = deepMergeObjects(dict1, dict2);
    assert.deepEqual(result, expected);
  });
});

describe('createNestedObject', () => {
  test('Should create a nested object based on the elements of the location array', () => {
    const location = ['a', 'b', 'c'];
    const response = 'hello';
    const result = createNestedObject(location, response);

    expect(result).toEqual({ a: { b: { c: 'hello' } } });
  });

  test('Should handle an empty location array', () => {
    const location = [];
    const response = 'hello';
    const result = createNestedObject(location, response);

    expect(result).toEqual('hello');
  });
});

describe('findInObject', () => {
  const obj = {
    "eric-pm-node-exporter": {
      "enabled": true,
      "nodeExporter": {
        "service": {
          "hostPort": "9321",
          "madeUpHostPort": "87654"
        }
      },
      "prometheus": {
        "nodeExporter": {
          "service": {
            "servicePort": "9100"
          }
        }
      }
    }
  };
  test('Should return a value found in the object', () => {
    const keyPathArray = [
      "eric-pm-node-exporter.nodeExporter.nonExistingKey.hostPort",
      "eric-pm-node-exporter.nodeExporter.service.hostPort",
      "eric-pm-node-exporter.nodeExporter.service.madeUpHostPort"
    ];

    const previousValue = findInObject(obj, keyPathArray)
    expect(previousValue).toBe('9321');
  });

  test('Should return undefined if none of the keys are found in the object', () => {
    const keyPathArray = [
      "eric-pm-node-exporter.prometheus.nodeExporter.service.nonExistingKey",
      "eric-pm-node-exporter.nodeExporter.service.servicePort"
    ];

    const previousValue = findInObject(obj, keyPathArray)
    expect(previousValue).toBe(undefined);
  });
});

describe('generateYamlResponse', () => {
  test('Should update model data for each property in schemaForm', async () => {
    const schema = {
      sccResources: {
        '$ref': '#/definitions/scc_resources',
        category: 'configuration',
        displayName: 'SCC Resources',
        example: '[val1, val2]',
        description: 'Global SCC resources',
        optional: true,
        keys: [ 'global.sccResources' ]
      },
      storageClassCephCapped: {
        '$ref': '#/definitions/any_string',
        category: 'configuration',
        displayName: 'Storage class ceph capped',
        example: '',
        description: 'Read Write Many (RWX) Storage class ceph capped',
        keys: [ 'global.rwx.storageClassCephCapped' ]
      },
      externalStorageCredentials: {
        '$ref': '#/definitions/any_string',
        category: 'configuration',
        displayName: 'Bro external storage credentials',
        example: '',
        description: 'If you want to enable automatic export of scheduled backups, you must create a Kubernetes Secret containing access credentials for the SFTP server.',
        keys: [ 'global.bro.externalStorageCredentials' ]
      },
      host_system_identifier: {
        '$ref': '#/definitions/any_string_max_length_32',
        category: 'configuration',
        displayName: 'Host system identifier',
        example: 'ieatenmc12a009',
        immutable: true,
        description: 'The value must be a string with a maximum length of 32 characters. To distinguish between the ENM deployments, a hostname is displayed on the UI, on the right-hand side of the ENM system bar. The host_system_identifier is a subdomain of the FQDN, which distinguishes these deployments.',
        keys: [ 'global.enmProperties.host_system_identifier' ]
      },
      COM_INF_LDAP_ROOT_SUFFIX: {
        '$ref': '#/definitions/any_string',
        category: 'security',
        displayName: 'Suffix for ENM users LDAP tree',
        example: 'dc=ieatenmc12a,dc=com',
        immutable: true,
        longDescription: [
          'Suffix for ENM users LDAP tree. RFC 4511 - Lightweight Directory Access Protocol',
          '(LDAP):',
          'The Protocol RFC 4512 - Lightweight Directory',
          'Access Protocol (LDAP):',
          'Directory Information Models'
        ],
        keys: [ 'global.enmProperties.COM_INF_LDAP_ROOT_SUFFIX' ]
      },
      COM_INF_LDAP_ADMIN_CN: {
        '$ref': '#/definitions/any_string',
        category: 'security',
        displayName: 'COM INF LDAP ADMIN CN',
        immutable: true,
        example: 'uid=ssouser,ou=people,dc=ieatenmc12a,dc=com',
        keys: [ 'global.enmProperties.COM_INF_LDAP_ADMIN_CN' ]
      },
      test__ipaddress_start: {
      },
      test__ipaddress_end: {
      }
    };

    const sedValues = {
      sccResources: [ 'Val1', 'Val2' ],
      storageClassCephCapped: 'test',
      externalStorageCredentials: 'test',
      rwx_storageClass: 'nfs-enm',
      rwo_storageClass: 'network-block',
      host_system_identifier: 'ieatenmc12a009',
      COM_INF_LDAP_ROOT_SUFFIX: 'dc=ieatenmc12a,dc=com',
      COM_INF_LDAP_ADMIN_CN: 'uid=ssouser,ou=people,dc=ieatenmc12a,dc=com'
    };

    const result = await generateYamlResponse(schema, sedValues);
    const expected =
    {
      global: {
        sccResources: [ 'Val1', 'Val2' ],
        rwx: { storageClassCephCapped: 'test' },
        bro: { externalStorageCredentials: 'test' },
        enmProperties: {
          host_system_identifier: 'ieatenmc12a009',
          COM_INF_LDAP_ROOT_SUFFIX: 'dc=ieatenmc12a,dc=com',
          COM_INF_LDAP_ADMIN_CN: 'uid=ssouser,ou=people,dc=ieatenmc12a,dc=com'
        }
      }
    }
    assert.deepEqual(result, expected);
  });
});

describe('readObjectDetails', () => {
  const mockSchemaDefinition = {
    tolerationInfo: {
      items: {
        properties: {
          key: { $ref: '#/definitions/string', "defaultValue": "some_key" },
          operator: { $ref: '#/definitions/toleration_operator' },
          effect: { $ref: '#/definitions/toleration_effect' },
        },
      },
    },
  };

  const mockAllSchemaDefinitions = {
    string: {
      type: 'string',
      description: 'This is a string definition',
      optional: false,
      validationMessage: 'Invalid string',
      pattern: '^\\w+$',
    },
    toleration_operator: {
      description: "This must be a valid Kubernetes Toleration operator.",
      type: "string",
      enum: ["Equal", "Exists"],
      pattern: '^\\w+$',
    },
    toleration_effect: {
      description: "This must be a valid Kubernetes Toleration Effect.",
      type: "string",
      enum: ["NoSchedule", "PreferNoSchedule", "NoExecute"],
      pattern: '^\\w+$',
    },
  };

  test('should return toleration details based on schema definition', () => {
    const result = readObjectDetails(mockSchemaDefinition, mockAllSchemaDefinitions, "tolerationInfo");
    expect(result).to.deep.equal({
      key: {
        defaultValue: "some_key",
        required: true,
        description: 'This is a string definition',
        errorMessage: 'Invalid string',
        isValid: false,
        type: 'string',
        validationPattern: '^\\w+$',
        options: undefined,
        preventDuplicates: false,
        tag: '',
      },
      operator: {
        defaultValue: undefined,
        required: true,
        description: 'This must be a valid Kubernetes Toleration operator.',
        errorMessage: '',
        isValid: false,
        type: 'select',
        options: ['Equal', 'Exists'],
        validationPattern: '^\\w+$',
        preventDuplicates: false,
        tag: '',
      },
      effect: {
        defaultValue: undefined,
        required: true,
        description: 'This must be a valid Kubernetes Toleration Effect.',
        errorMessage: '',
        isValid: false,
        type: 'select',
        options: ['NoSchedule', 'PreferNoSchedule', 'NoExecute'],
        validationPattern: '^\\w+$',
        preventDuplicates: false,
        tag: '',
      },
    });
  });

  test('should handle schema definition without tolerationInfo', () => {
    const schemaDefinitionWithoutToleration = { otherField: 'value' };
    const result = readObjectDetails(schemaDefinitionWithoutToleration, mockAllSchemaDefinitions, "tolerationInfo");
    expect(result).to.deep.equal({});
  });

  test('should handle schema definition with an empty properties object', () => {
    const schemaDefinitionWithEmptyProperties = { tolerationInfo: { items: { properties: {} } } };
    const result = readObjectDetails(schemaDefinitionWithEmptyProperties, mockAllSchemaDefinitions, "tolerationInfo");
    expect(result).to.deep.equal({});
  });
});

describe('getTolerationErrors', () => {
  const toleration = [
    {
      key: 'Key1',
      operator: 'Equal',
      value: 'Value1',
      effect: 'PreferNoSchedule',
      tolerationSeconds: 3
    },
    {
      key: 'Ke y2',
      operator: 'Exists',
      effect: 'NoSchedule',
      tolerationSeconds: "A"
    },
    {
      operator: 'Exists',
      effect: 'NoSchedule'
    },
    {
      key: 'Key4',
      effect: 'NoSchedule'
    }
  ];
  const mockTolerationInfo = {
    key: {
      required: true,
      description: 'This must be any string with no spaces.',
      errorMessage: 'This can be any string with no spaces.',
      isValid: false,
      type: 'string',
      options: undefined,
      validationPattern: '^[^\\s]*$'
    },
    operator: {
      required: true,
      description: 'This must be a valid Kubernetes Toleration operator.',
      errorMessage: '',
      isValid: false,
      type: 'select',
      options: [ 'Equal', 'Exists' ],
      validationPattern: ''
    },
    effect: {
      required: true,
      description: 'This must be a valid Kubernetes Toleration Effect.',
      errorMessage: '',
      isValid: false,
      type: 'select',
      options: [ 'NoSchedule', 'PreferNoSchedule', 'NoExecute' ],
      validationPattern: ''
    },
    value: {
      required: true,
      description: 'This must be a valid Kubernetes Label.',
      errorMessage: 'Must be 63 characters or less. The allowed characters are alphanumeric, dashes, underscores, and dots.',
      isValid: false,
      type: 'string',
      options: undefined,
      validationPattern: '^[a-zA-Z0-9]([a-zA-Z0-9_\\.\\-]{0,61}[a-zA-Z0-9])?$'
    },
    tolerationSeconds: {
      required: false,
      description: 'This must be any integer',
      errorMessage: 'Must be an integer greater than 0.',
      isValid: false,
      type: 'string',
      options: undefined,
      validationPattern: '^[1-9][0-9]*$'
    }
  };
  test('should return zero error based on the toleration input', () => {
    const result = getTolerationErrorsCount(toleration[0], mockTolerationInfo);
    expect(result).to.equal(0);
  });

  test('should return two errors based on the toleration input', () => {
    const result = getTolerationErrorsCount(toleration[1], mockTolerationInfo);
    expect(result).to.equal(2);
  });

  test('should return one error if required field is missing', () => {
    const result = getTolerationErrorsCount(toleration[2], mockTolerationInfo);
    expect(result).to.equal(1);
  });

  test('should return one error if operator is empty', () => {
    const result = getTolerationErrorsCount(toleration[3], mockTolerationInfo);
    expect(result).to.equal(3);
  });
});

describe('getNodeSelectorErrors', () => {
  const correctNodeSelector = { 'key1': 'value1',
    Key2: 'value2',
    node: 'cENM_Nodes'
  };
  const wrongNodeSelector = { 'ke y1': 'value1',
    Key2: null,
    node: 'cENM_Nodes'
  };
  const wrongNodeSelector2 = { 'ke y1': 'value1'};
  const wrongNodeSelector3 = { 'key1': 'value 1'};
  const mockNodeSelectorInfo = {
    key: {
      required: true,
      description: 'This must be any string with no spaces.',
      errorMessage: 'This can be any string with no spaces.',
      isValid: false,
      type: 'string',
      options: undefined,
      validationPattern: '^[^\\s]*$'
    },
    value: {
      required: true,
      description: 'This must be any string with no spaces.',
      errorMessage: 'This can be any string with no spaces.',
      isValid: false,
      type: 'string',
      options: undefined,
      validationPattern: '^[^\\s]*$'
    }
  };

  test('should return true based on the nodeSelector input', () => {
    const result = isValidNodeSelectors(correctNodeSelector, mockNodeSelectorInfo);
    expect(result).to.equal(true);
  });

  test('should return false based on the nodeSelector input', () => {
    const result = isValidNodeSelectors(wrongNodeSelector, mockNodeSelectorInfo);
    expect(result).to.equal(false);
  });

  test('should return false based on the nodeSelector invalid key input', () => {
    const result = isValidNodeSelectors(wrongNodeSelector2, mockNodeSelectorInfo);
    expect(result).to.equal(false);
  });

  test('should return false based on the nodeSelector invalid value input', () => {
    const result = isValidNodeSelectors(wrongNodeSelector3, mockNodeSelectorInfo);
    expect(result).to.equal(false);
  });
});

describe('isValidArray', () => {
  test('should return true for valid array entries', () => {
    const result = isValidArray(['123', '456', '789'], '^\\d+$');
    expect(result).to.be.true;
  });

  test('should return false for invalid array entries', () => {
    const result = isValidArray(['abc', 'def', 'ghi'], '^\\d+$');
    expect(result).to.be.false;
  });

  test('should return false for duplicate array entries', () => {
    const result = isValidArray(['123', '456', '123'], '^\\d+$');
    expect(result).to.be.false;
  });

  test('should return true for empty array', () => {
    const result = isValidArray([], '^\\d+$');
    expect(result).to.be.true;
  });

  test('should return true for undefined array', () => {
    const result = isValidArray(undefined, '^\\d+$');
    expect(result).to.be.true;
  });
});

describe('stringToBoolean', () => {
  test('Should return true for "true"', () => {
    expect(stringToBoolean('true')).to.be.true
  });

  test('Should return false for "false"', () => {
    expect(stringToBoolean('false')).to.be.false;
  });

  test('Should return the input value if it is not "true" or "false"', () => {
    expect(stringToBoolean('')).to.be.empty;
    expect(stringToBoolean('random')).to.equal('random');
    expect(stringToBoolean(123)).to.equal(123);
    expect(stringToBoolean(undefined)).to.be.undefined;

  });

  test('Should return the input value if it is not a string', () => {
    expect(stringToBoolean(true)).to.be.true;
    expect(stringToBoolean(false)).to.be.false;
    expect(stringToBoolean(0)).to.equal(0);
    expect(stringToBoolean(null)).to.be.null;
    expect(stringToBoolean(undefined)).to.be.undefined;
    expect(stringToBoolean([1,2,3])).to.deep.equal([1,2,3]);
    expect(stringToBoolean({})).to.deep.equal({});
  });
});

describe('isValidObjectArrayInput', () => {
  it('returns true if objectArray is undefined', () => {
    const inputData = {};
    const objectArray = undefined;
    expect(isValidObjectArrayInput(inputData, {})).to.be.true;
  });

  it('returns true if objectArray is null', () => {
    const inputData = {};
    const objectArray = null;
    expect(isValidObjectArrayInput(inputData, {})).to.be.true;
  });

  it('returns true if objectArray is an empty array', () => {
    const inputData = {};
    const objectArray = [];
    expect(isValidObjectArrayInput(inputData, {})).to.be.true;
  });

  it('returns the result of isObjectArrayValid if objectArray is not empty', () => {
    const inputData = [
      {
        every: "1w2d3h",
        start: "2022-10-28T01:15:30",
        stop: "2022-10-28T01:15:30"
      }
    ];
    const objectArrayInfo = {
      every: {
        validationPattern: "^(\\d+w)?(\\d+d)?(\\d+h)?(\\d+m)?$",
        preventDuplicates: true,
      },
      start: {
        validationPattern: "^[0-9]{1,4}\\-[0-9]{1,2}\\-[0-9]{1,2}T[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}$",
      },
      stop: {
        validationPattern: "^[0-9]{1,4}\\-[0-9]{1,2}\\-[0-9]{1,2}T[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}$",
      }
    };
    expect(isValidObjectArrayInput(inputData, objectArrayInfo)).to.be.true;
  });
});

describe('isObjectArrayValid', () => {
  it('returns false if objectArray is empty', () => {
    const inputData = [];
    const objectArray = {};
    const arrayObjectInfo = {};
    expect(isObjectArrayValid(inputData, objectArray, arrayObjectInfo)).to.be.false;
  });

  it('returns false if any property in objectArray is required but missing', () => {
    const inputData = [];
    const objectArray = {
      every: "",

      start: "2022-10-28T01:15:30",
      stop: "2022-10-28T01:15:30"
    };
    const arrayObjectInfo = {
      every: { validationPattern: "^(\\d+w)?(\\d+d)?(\\d+h)?(\\d+m)?$", required: true},
      start: { validationPattern: "^[0-9]{1,4}\\-[0-9]{1,2}\\-[0-9]{1,2}T[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}$" },
      stop: { validationPattern: "^[0-9]{1,4}\\-[0-9]{1,2}\\-[0-9]{1,2}T[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}$" }
    };
    expect(isObjectArrayValid(inputData, objectArray, arrayObjectInfo)).to.be.false;
  });

  it('returns false if any property in objectArray does not match validationPattern', () => {
    const inputData = [];
    const objectArray = {
      every: "1w2d3h",
      start: "2022-10-28T01:15:30",
      stop: "2022-10-28T01:15:30"
    };
    const arrayObjectInfo = {
      every: { validationPattern: "^(\\d+w)?(\\d+d)?(\\d+h)?(\\d+m)?$" },
      start: { validationPattern: "invalid-pattern" },
      stop: { validationPattern: "^[0-9]{1,4}\\-[0-9]{1,2}\\-[0-9]{1,2}T[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}$" }
    };
    expect(isObjectArrayValid(inputData, objectArray, arrayObjectInfo)).to.be.false;
  });

  it('returns false if 1st date is invalid', () => {
    const inputData = [];
    const objectArray = {
      every: "1w2d3h",
      start: "2022-10-28T01:15:30",
      stop: "2060-10-28T01:15:30"
    };
    const arrayObjectInfo = {
      every: { validationPattern: "^(\\d+w)?(\\d+d)?(\\d+h)?(\\d+m)?$" },
      start: { type: "datetime-local", tag: "start_date" },
      stop: { type: "datetime-local" , tag: "end_date" }
    };
    expect(isObjectArrayValid(inputData, objectArray, arrayObjectInfo)).to.be.false;
  });

   it('returns true for valid array', () => {
    const inputData = [];
    const objectArray = {
      source_labels: "123",
    };
    const arrayObjectInfo = {
      source_labels: { type: "array" },
    };
    expect(isObjectArrayValid(inputData, objectArray, arrayObjectInfo)).to.be.true;
  });

  it('returns false if 2nd date is invalid', () => {
    const inputData = [];
    const objectArray = {
      every: "1w2d3h",
      start: "2060-10-28T01:15:30",
      stop: "2022-10-28T01:15:30"
    };
    const arrayObjectInfo = {
      every: { validationPattern: "^(\\d+w)?(\\d+d)?(\\d+h)?(\\d+m)?$" },
      start: { type: "datetime-local", tag: "start_date" },
      stop: { type: "datetime-local", tag: "end_date" }
    };
    expect(isObjectArrayValid(inputData, objectArray, arrayObjectInfo)).to.be.false;
  });

  it('returns false if any property in objectArray is a duplicate', () => {
    const inputData = [
      {
        every: "1w2d3h",
        start: "2022-10-28T01:15:30",
        stop: "2022-10-28T01:15:30"
      },
      {
        "every": "1w2d3h"
      }
    ];
    const objectArray = {
      every: "1w2d3h",
      start: "2022-10-28T01:15:30",
      stop: "2022-10-28T01:15:30"
    };
    const arrayObjectInfo = {
      every: { validationPattern: "^(\\d+w)?(\\d+d)?(\\d+h)?(\\d+m)?$", preventDuplicates: true },
      start: { validationPattern: "^[0-9]{1,4}\\-[0-9]{1,2}\\-[0-9]{1,2}T[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}$" },
      stop: { validationPattern: "^[0-9]{1,4}\\-[0-9]{1,2}\\-[0-9]{1,2}T[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}$" }
    };
    expect(isObjectArrayValid(inputData, objectArray, arrayObjectInfo)).to.be.false;
  });

  it('returns true if all conditions are met', () => {
    const inputData = [{
      every: "1w2d3h",
      start: "2022-10-28T01:15:30",
      stop: "2022-10-28T01:15:30"
    }];
    const objectArray = {
      every: "1w2d3h",
      start: "2022-10-28T01:15:30",
      stop: "2022-10-28T01:15:30"
    };
    const arrayObjectInfo = {
      every: { validationPattern: "^(\\d+w)?(\\d+d)?(\\d+h)?(\\d+m)?$", preventDuplicates: true },
      start: { validationPattern: "^[0-9]{1,4}\\-[0-9]{1,2}\\-[0-9]{1,2}T[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}$", preventDuplicates: false },
      stop: { validationPattern: "^[0-9]{1,4}\\-[0-9]{1,2}\\-[0-9]{1,2}T[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}$", preventDuplicates: false }
    };
    expect(isObjectArrayValid(inputData, objectArray, arrayObjectInfo)).to.be.true;
  });

  it('returns true when type is datetime-local and date is valid', () => {
    const inputData = [{
      start: "2060-03-29T13:57:00"
    }];
    const objectArray = {
      start: "2060-03-29T13:57:00"
    };
    const arrayObjectInfo = {
      start: { type: "datetime-local", validationPattern: "^[0-9]{1,4}\\-[0-9]{1,2}\\-[0-9]{1,2}T[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}$", preventDuplicates: false },
    };
    expect(isObjectArrayValid(inputData, objectArray, arrayObjectInfo)).to.be.true;
  });
});

describe('isDuplicateEntryInObject', () => {
  it('returns false if preventDuplicate is false', () => {
    const inputData = [];
    const key = 'exampleKey';
    const preventDuplicate = false;
    expect(isDuplicateEntryInObject(inputData, key, preventDuplicate)).to.be.false;
  });

  it('returns false if there are no duplicate entries', () => {
    const inputData = [
      { exampleKey: 'value1' },
      { exampleKey: 'value2' },
      { exampleKey: 'value3' }
    ];
    const key = 'exampleKey';
    const preventDuplicate = true;
    expect(isDuplicateEntryInObject(inputData, key, preventDuplicate)).to.be.false;
  });

  it('returns true if there are duplicate entries', () => {
    const inputData = [
      { exampleKey: 'value1' },
      { exampleKey: 'value2' },
      { exampleKey: 'value1' }
    ];
    const key = 'exampleKey';
    const preventDuplicate = true;
    expect(isDuplicateEntryInObject(inputData, key, preventDuplicate)).to.be.true;
  });
});

describe('getAllInputsForKey', () => {
  it('returns an array of values for the specified key', () => {
    const inputData = [
      { key1: 'value1', key2: 'value2' },
      { key1: 'value3', key2: 'value4' },
      { key1: 'value5', key2: 'value6' }
    ];
    const key = 'key1';
    const expected = ['value1', 'value3', 'value5'];
    expect(getAllInputsForKey(key, inputData)).to.deep.equal(expected);
  });

  it('returns an empty array if inputData is empty', () => {
    const inputData = [];
    const key = 'key1';
    const expected = [];
    expect(getAllInputsForKey(key, inputData)).to.deep.equal(expected);
  });
});

describe('validateCustomObject', () => {
  const customObjectList = [
    { objectKey: "key1", objectValue: "val1", index: 0 },
    { objectKey: "key2", objectValue: "val2", index: 1}
  ];
  const errorsCustomObjectList1 = [
    { objectKey: "key1", objectValue: "val1", index: 0 },
    { objectKey: "key2", objectValue: "val2", index: 1 },
    { objectKey: "key1", objectValue: "val3", index: 2 },
  ];
  const customObject1 = { index: 0, objectKey: "key1", objectValue: "val1"};
  const customObject2 = { index: 2, objectKey: "key1", objectValue: "val2"};
  const customObWithInvalid_key = { index: 3, objectKey: "key 3", objectValue: "val2"};
  const customObWithInvalid_value = { index: 3, objectKey: "key3", objectValue: "val 2"};
  const customObEmpty = { index: 4, objectKey: "", objectValue: "val2"};
  const customObENull = { index: 4, objectKey: null, objectValue: "val2"};
  const mockCustomObjectInfo = {
    key: {
      required: true,
      description: 'This must be any string with no spaces.',
      errorMessage: 'This can be any string with no spaces.',
      isValid: false,
      type: 'string',
      options: undefined,
      validationPattern: '^[^\\s]*$'
    },
    value: {
      required: true,
      description: 'This must be any string with no spaces.',
      errorMessage: 'This can be any string with no spaces.',
      isValid: false,
      type: 'string',
      options: undefined,
      validationPattern: '^[^\\s]*$'
    }
  };

  test('should return true based on the customObject input', () => {
    const result = isValidCustomObject(customObjectList, customObject1, mockCustomObjectInfo);
    expect(result).to.equal(true);
  });

  test('should return false with a duplicated key', () => {
    const result = isValidCustomObject(errorsCustomObjectList1, customObject2, mockCustomObjectInfo);
    expect(result).to.equal(false);
  });

  test('should return false with an invalid input', () => {
    const result = isValidCustomObject(customObjectList, customObWithInvalid_key, mockCustomObjectInfo);
    expect(result).to.equal(false);
    const resultB = isValidCustomObject(customObjectList, customObWithInvalid_value, mockCustomObjectInfo);
    expect(resultB).to.equal(false);
  });

  test('should return false with an empty input', () => {
    const result = isValidCustomObject(customObjectList, customObEmpty, mockCustomObjectInfo);
    expect(result).to.equal(false);
  });

  test('should return false with null input', () => {
    const result = isValidCustomObject(customObjectList, customObENull, mockCustomObjectInfo);
    expect(result).to.equal(false);
  });
});

describe('isValidDate', () => {
  const validationPattern = "^[0-9]{1,4}\\-[0-9]{1,2}\\-[0-9]{1,2}T[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}$";
  const inputObject = {
    "every": "1w",
    "start": "2060-03-29T13:57:00",
    "stop": "2060-01-29T13:57:00"
  };
  const inputObjectWithNoStart = {
    "every": "1w",
    "stop": "2060-01-29T13:57:00"
  };

  test('valid datetime-local start_date input', () => {
    expect(isValidDate('datetime-local', false, '2060-03-29T13:57:00', validationPattern, inputObject, "start_date")).to.be.true;
  });

  test('valid datetime-local end_date input', () => {
    expect(isValidDate('datetime-local', false, '2060-01-29T13:57:00', validationPattern, inputObject, "end_date")).to.be.false;
  });

  test('invalid datetime-local input', () => {
    expect(isValidDate('datetime-local', false, 'invalid-date', validationPattern, "", "start_date")).to.be.false;
  });

  test('empty datetime-local input and required', () => {
    expect(isValidDate('datetime-local', true, '', validationPattern, "", "start_date")).to.be.false;
  });

  test('empty datetime-local input and not required', () => {
    expect(isValidDate('datetime-local', false, '', validationPattern)).to.be.true;
  });

  test('undefined datetime-local input and required', () => {
    expect(isValidDate('datetime-local', true, undefined, validationPattern, "", "start_date")).to.be.false;
  });

  test('non-datetime-local input', () => {
    expect(isValidDate('string', false, 'any-value')).to.be.true;
  });

  test('valid datetime-local end_date input', () => {
    expect(isValidDate('datetime-local', false, '2060-01-29T13:57:00', validationPattern, inputObjectWithNoStart, "end_date")).to.be.true;
  });
});

describe('getDateTimeFormatted', () => {
  test('returns the date and time of a given date input in ISO 8601 format', () => {
    expect(getDateTimeFormatted(new Date())).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    expect(getDateTimeFormatted("2024-04-04T10:30:00.000Z")).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    const result = getDateTimeFormatted("2024-05-01T06:30:00")
    expect(result).to.equal("2024-05-01T06:30:00");
  });
});

describe('validateAllCustomObjectEntries', () => {
  const mockCustomObjectInfo = {
    key: {
      required: true,
      validationPattern: '^[^\\s]*$'
    },
    value: {
      required: true,
      validationPattern: '^[^\\s]*$'
    }
  };
  it('returns true for an empty object', () => {
    const inputObject = {};
    expect(validateAllCustomObjectEntries(inputObject, mockCustomObjectInfo, false)).to.be.true;
  });

  it('returns true for an object with valid entries', () => {
    const inputObject = { key1: 'value1', key2: 'value2' };
    expect(validateAllCustomObjectEntries(inputObject, mockCustomObjectInfo, true)).to.be.true;
  });

  it('returns false for an object with invalid entries', () => {
    const inputObject = { key1: 'v   alue1', key2: 'va   lue2' }; // Adjust to contain invalid entries
    expect(validateAllCustomObjectEntries(inputObject, mockCustomObjectInfo, true)).to.be.false;
  });

  it('returns true for an empty object with required entries', () => {
    const inputObject = {};
    expect(validateAllCustomObjectEntries(inputObject, mockCustomObjectInfo, true)).to.be.false;
  });
});

describe('isDisplayConditionMet', () => {
  test('with displayIf and displayIfNot', () => {
    const inputData = {
      key1: true,
      key2: false,
      key3: 'true',
      key4: 'false',
    };
    const displayIf = ['key1', 'key3'];
    const displayIfNot = ['key2', 'key4'];
    expect(isDisplayConditionMet(inputData, displayIf, displayIfNot)).toBe(true);
  });

  test('without displayIf and displayIfNot', () => {
    const inputData = {
      key1: true,
      key2: false,
      key3: 'true',
      key4: 'false',
    };
    expect(isDisplayConditionMet(inputData, null, null)).toBe(true);
  });

  test('with displayIf but not displayIfNot', () => {
    const inputData = {
      key1: true,
      key2: false,
      key3: 'true',
      key4: 'false',
    };
    const displayIf = ['key1', 'key3'];
    expect(isDisplayConditionMet(inputData, displayIf, null)).toBe(true);
  });

  test('with displayIfNot but not displayIf', () => {
    const inputData = {
      key1: true,
      key2: false,
      key3: 'true',
      key4: 'false',
    };
    const displayIfNot = ['key2', 'key4'];
    expect(isDisplayConditionMet(inputData, null, displayIfNot)).toBe(true);
  });

  test('with displayIf not met', () => {
    const inputData = {
      key1: false,
      key2: true,
    };
    const displayIf = ['key1'];
    expect(isDisplayConditionMet(inputData, displayIf, null)).toBe(false);
  });

  test('with displayIfNot not met', () => {
    const inputData = {
      key1: true,
      key2: true,
    };
    const displayIfNot = ['key2'];
    expect(isDisplayConditionMet(inputData, null, displayIfNot)).toBe(false);
  });
});

describe('getBaseYamlFileForExport', () => {
  test('test fetch values for CSAR Lite production_url', async () => {
    const productSetContent = [{}, {},
      { integration_values_file_data: [{ values_file_production_url: 'production_url', values_file_dev_url: 'dev_url' }] },
    ];
    console.log = vi.fn();
    await getBaseYamlFileForExport(true, productSetContent, 'size', 'version', 'api_url');
    expect(console.log).toHaveBeenCalledWith('fetching CSAR Lite values file');
  });

  test('test fetch values for CSAR Lite dev_url', async () => {
    const productSetContent = [{}, {},
      { integration_values_file_data: [{ values_file_dev_url: 'dev_url' }] },
    ];
    console.log = vi.fn();
    await getBaseYamlFileForExport(true, productSetContent, 'size', 'version', 'api_url');
    expect(console.log).toHaveBeenCalledWith('fetching CSAR Lite values file');
  });

  test('test fetch values for full CSAR', async () => {
    console.log = vi.fn();
    await getBaseYamlFileForExport(false, [], 'size', 'version', 'api_url');
    expect(global.console.log).toHaveBeenCalledWith('fetching full CSAR values file');
  });

  test('test fetch values for CSAR lite when Values files in CI portal are null', async () => {
    const badPsContent = [
      {},
      {},
      {
        "integration_values_file_data": [
          {
            "values_file_version": "1.59.0-4",
          }
        ]
      }
    ]
    console.error = vi.fn();
    await getBaseYamlFileForExport(true, badPsContent, 'size', 'version', 'api_url');
    expect(global.console.error).toHaveBeenCalledWith('Values file not available in product set content.');
  });
});

test('isTrueOrStringTrue', () => {
  expect(isTrueOrStringTrue(true)).toBe(true);
  expect(isTrueOrStringTrue('true')).toBe(true);
  expect(isTrueOrStringTrue(false)).toBe(false);
  expect(isTrueOrStringTrue('false')).toBe(false);
});

test('isFalseOrStringFalse', () => {
  expect(isFalseOrStringFalse(false)).toBe(true);
  expect(isFalseOrStringFalse('false')).toBe(true);
  expect(isFalseOrStringFalse(true)).toBe(false);
  expect(isFalseOrStringFalse('true')).toBe(false);
});

describe('checkIfKeyIsNeeded function', () => {
  test('should return true when all displayIf keys are present and true', () => {
    const inputData = { a: true, b: true };
    const displayIf = ['a', 'b'];
    const displayIfNot = null;
    const schemaData = { a: { keys: ['a'] }, b: { keys: ['b'] } };
    expect(checkIfKeyIsNeeded(inputData, displayIf, displayIfNot, schemaData)).toBe(true);
  });

  test('should return false when any displayIf key is absent or false', () => {
    const inputData = { a: true, b: false };
    const displayIf = ['a', 'b'];
    const displayIfNot = null;
    const schemaData = { a: { keys: ['a'] }, b: { keys: ['b'] } };
    expect(checkIfKeyIsNeeded(inputData, displayIf, displayIfNot, schemaData)).toBe(false);
  });

  test('should return true when displayIfNot keys are not present or false', () => {
    const inputData = { a: false, b: false };
    const displayIf = null;
    const displayIfNot = ['a', 'b'];
    const schemaData = { a: { keys: ['a'] }, b: { keys: ['b'] } };
    expect(checkIfKeyIsNeeded(inputData, displayIf, displayIfNot, schemaData)).toBe(true);
  });

  test('should return false when any displayIfNot key is present and true', () => {
    const inputData = { a: false, b: true };
    const displayIf = null;
    const displayIfNot = ['a', 'b'];
    const schemaData = { a: { keys: ['a'] }, b: { keys: ['b'] } };
    expect(checkIfKeyIsNeeded(inputData, displayIf, displayIfNot, schemaData)).toBe(false);
  });
});

describe('checkKeys function', () => {
  test('should return true if all values for displayKey are true', () => {
    const inputData = { a: true, b: true };
    const displayKey = 'key';
    const schemaData = { key: { keys: ['a', 'b'] } };
    expect(checkKeys(inputData, displayKey, schemaData, true)).toBe(true);
  });

  test('should return false if any value for displayKey is false', () => {
    const inputData = { a: true, b: false };
    const displayKey = 'key';
    const schemaData = { key: { keys: ['a', 'b'] } };
    expect(checkKeys(inputData, displayKey, schemaData, true)).toBe(false);
  });

});

describe('getProperty function', () => {
  test('should return the property value for a valid key', () => {
    const inputData = { a: { b: { c: 123 } } };
    const key = 'a.b.c';
    expect(getProperty(inputData, key)).toBe(123);
  });

  test('should return undefined for an invalid key', () => {
    const inputData = { a: { b: { c: 123 } } };
    const key = 'x.y.z';
    expect(getProperty(inputData, key)).toBe(undefined);
  });
});

describe('validateArrayInput', () => {
  const index = 0
  const source_labels = 'source_labels'
  const validationPattern = '^[a-zA-Z0-9]([a-zA-Z0-9_\.\-]{0,61}[a-zA-Z0-9])?$'
  test('finds errors, some entries are invalid', async () => {
    const objectData = [{
        source_labels: '1 23,\n345,\n678\n\n12 3,', regex: 'test'
    }];
   const objectArray = [{
      source_labels: '1234567891234567891234567891234567891234567890123456789098765431,\n345,\n678\n\n123,', regex: 'test'
    }];
    expect(validateArrayInput(validationPattern, index, source_labels, objectData)).to.be.true;
  });

  test('finds no errors, all entries are valid', async () => {
    const objectData = [{
      source_labels: '12345678912345678912345678912345678912345678901234567890987654, 123', regex: 'test'
    }];
    expect(validateArrayInput(validationPattern, index, source_labels, objectData)).to.be.false;
  });
});

