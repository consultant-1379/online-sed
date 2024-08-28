import assert from 'assert';

import {
  loadProductsFromFile,
  validateInputSEDWithSchema
} from '../../src/api_server/routes/validatePENM.js';

import {
  validateSEDString,
  getpENMSEDObjectFromString,
  isIpVersionPairValid
  } from '../../src/utils/utils.js';


describe('checkDmtSEDIsParseable', () => {
  test('Should return a empty list when all lines are parseable', () => {
    const inputArray = [
      '# Some valid comment',
      '  ##  Some more valid comment',
      'key  =    value',
      'key =   some_string_witoutSpaces',
      'key= string with spaces',
      'key=',
      'key=value',
      'key==',
      'key= =',
      '   key with spaces=value',
      '   key with spaces =  value=',
      'key=value=morestring',
    ];
    const dmtSEDUnparseableLineArray = validateSEDString(inputArray.join('\n'));
    expect(dmtSEDUnparseableLineArray).toEqual([]);
  });

    test('Should return a list of unparseable lines', () => {
    const inputArray = [
      'key',
      '  // A line commented wrongly',
      '=value',
      '= value',
      '==value',
      '  =  value',
      ' = = value'
    ];
    const dmtSEDUnparseableLineArray = validateSEDString(inputArray.join('\n'));
    expect(dmtSEDUnparseableLineArray).toEqual(inputArray);
  });
});


describe('getpENMSEDObjectFromString', () => {
  test('Should parse a multiline string into a {key: value} object', () => {
    const inputString = [
        'key1=value1',
        '',
        '  key2  =   value2',
        '',
        '   key3= value3',
        '  key4  =value4'
    ].join('\n');

    const expected = {
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
      key4: 'value4',
    };
    const dmtSED = getpENMSEDObjectFromString(inputString);
    assert.deepEqual(dmtSED, expected);
  });
});


describe('loadProductsFromFile', () => {
  test('Should load the products file into an array', async () => {
    const productsArray = await loadProductsFromFile();
    const expected = [{
      "name": "Physical ENM",
      "shortName": "pENM",
      "sedFileFormat": "txt",
      "sedSchemaRepo": "proj-online-sed-generic-local",
      "useCaseOptions": [
        {
          name: "Install",
        },
        {
          name: "Upgrade",
        },
      ],
      "ipVersions": [
        {
          "name": "ipv4"
        },
        {
          "name": "dual"
        },
        {
          "name": "ipv6_ext"
        }
      ],
    },
    {
      "name": "Cloud Native ENM",
      "shortName": "cENM",
      "sedFileFormat": "yaml",
      "sedSchemaRepo": "proj-online-sed-generic-local",
      "useCaseOptions": [
        {
          name: "Install",
        },
        {
          name: "Upgrade",
        },
       ],
      "ipVersions": [
        {
          "name": "IPv4"
        },
        {
          "name": "Dual"
        },
        {
          "name": "IPv6_EXT"
        }
      ],
      "deploymentSizes"  : [
        {
          "name": "small",
          "datapath": "eric-enm-integration-production-values",
          "type": "Small_CloudNative_ENM"
        },
        {
          "name": "extraLarge",
          "datapath": "eric-enm-integration-extra-large-production-values",
          "type": "Extra_Large_CloudNative_ENM"
        },
        {
          "name": "singleInstance",
          "datapath": "eric-enm-single-instance-production-integration-values",
          "displayInExternalSED": false,
          "type": "Small_CloudNative_ENM"
        },
        {
          "name": "multiInstance",
          "datapath": "eric-enm-multi-instance-functional-integration-values",
          "displayInExternalSED": false,
          "type": "Small_CloudNative_ENM"
        }
      ]
    }
    ];
    assert.deepEqual(productsArray.sort(), expected.sort());
  });
});


describe('isIpVersionPairValid', () => {
  test('Should verify if the ipVersions are compatible', async () => {
    const pairsArray = [
      ['ipv4', 'ipv4', true],
      ['ipv4', 'ipv6_ext', false],
      ['ipv4', 'dual', true],

      ['ipv6_ext', 'ipv4', false],
      ['ipv6_ext', 'ipv6_ext', true],
      ['ipv6_ext', 'dual', true],

      ['dual', 'ipv4', false],
      ['dual', 'ipv6_ext', false],
      ['dual', 'dual', true],
    ];
    pairsArray.forEach(tuple => {
      const [sedIpVersion, finalIpVersion, expectedResult] = tuple
      assert.equal(isIpVersionPairValid(sedIpVersion, finalIpVersion), expectedResult);
    });
  });
});


describe('validateInputSEDWithSchema', async() => {
  const dmtSED = {
    key1: '',
    key2: 'value2',
    unknownKey3: 'value3',
    key4: 'foo',
    key5: 'value to match',
    key6: 'value not matched',
  }
  const schema = {
    properties: {
      parameters: {
        properties: {
          key1: {
            $ref: "#/definitions/def1",
            optional: "True"
          },
          key2: {
            $ref: "#/definitions/def2",
            autoPopulate: undefined
          },
          key4: {
            $ref: "#/definitions/ipv4",
          },
          key5: {
            $ref: "#/definitions/def1",
            autoPopulate: undefined
          },
          key6: {
            $ref: "#/definitions/def1",
            autoPopulate: undefined,
            valueMatchesKey: "key5"
          },
          ipkey1: {
            $ref: "#/definitions/ipv4",
          },
          ipkey2: {
            $ref: "#/definitions/ipv4",
            ipVersion: ['ipv4', 'dual']
          },
          ipkey3: {
            $ref: "#/definitions/ipv4",
            value: ""
          },
          ip_ipaddress_start: {
            $ref: "#/definitions/ipv4_allow_duplicates",
            optional: true
          },
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
      },
      ipv4: {
        pattern: "^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$",
        description: "This must be a valid IPv4 address.",
        type: "string",
        preventDuplicates: true
      },
      ipv4_allow_duplicates: {
        pattern: "^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$",
        description: "This must be a valid IPv4 address.",
        type: "string"
      },
    }
  };
  const expectedResult = {
    success: true,
    message: {
      isInputSEDValid: false,
      newSED: {
        ipkey3: "",
        key2: 'value2',
        key4: 'foo',
        key5: 'value to match',
        key6: 'value not matched',
      },
      validationErrors: {
        duplicatedKeyValues: [],
        duplicatedKeyValuesInExclusionIps: [],
        invalidKeyValues: [
          {
            keyName: 'key4',
            keyValue: 'foo',
            validationPattern: '^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$'
          }
        ],
        missingKeyNames: [
          "ipkey1",
          "ipkey2"
        ],
        requiredKeyValuesNotProvided: [],
        mismatchedKeyValues: [{keyName: 'key6', keyValue: 'value not matched', keyToMatch: "key5"}]
      }
    }
  };

  test('Should validate the SED object against the schema and include passwords', () => {
    const validationResult = validateInputSEDWithSchema(dmtSED, schema, [], true, "upgrade", "dual");
    assert.deepEqual(validationResult, expectedResult);
  });

  test('Should validate the SED object against the schema and exclude passwords', () => {
    let localExpectedResult = JSON.parse(JSON.stringify(expectedResult));
    localExpectedResult.message.newSED = {
      ipkey3: '',
      key2: 'value2',
      key4: 'foo'
    }
    localExpectedResult.message.validationErrors.mismatchedKeyValues = [];
    const validationResult = validateInputSEDWithSchema(dmtSED, schema, [], false, "upgrade", "dual");
    assert.deepEqual(validationResult, localExpectedResult);
  });

  test('Should validate and return duplicate IPs', () => {
    const inputSED = {
      ipkey1: '192.168.1.1',
      ipkey2: '192.168.1.1',
      ipkey3: '192.168.1.2',
      ip_ipaddress_start: '192.168.1.2',
    }
    const validationResult = validateInputSEDWithSchema(inputSED, schema, [], true, "upgrade", "dual");
    const localExpectedResult = [
      {
        keyName: 'ipkey1',
        keyValue: '192.168.1.1'
      },
      {
        keyName: 'ipkey2',
        keyValue: '192.168.1.1'
      }
    ]
    assert.equal(validationResult.message.isInputSEDValid, false);
    assert.deepEqual(validationResult.message.validationErrors.duplicatedKeyValues, localExpectedResult);
  });

  test('Should validate and return duplicate IPs from exclusion IPs', () => {
    const inputSED = {
      ipkey2: '192.168.1.2'
    }
    const validationResult = validateInputSEDWithSchema(inputSED, schema, ['192.168.1.2'], true, "upgrade", "dual");
    const localExpectedResult = [
      {
        keyName: 'ipkey2',
        keyValue: '192.168.1.2'
      }
    ]
    assert.equal(validationResult.message.isInputSEDValid, false);
    assert.deepEqual(validationResult.message.validationErrors.duplicatedKeyValuesInExclusionIps, localExpectedResult);
  });

  test('Should validate the SED object against the schema and ignore non IPv6 field in schema', () => {
    let localExpectedResult = JSON.parse(JSON.stringify(expectedResult));;
    localExpectedResult.message.validationErrors.missingKeyNames = [
      "ipkey1"
    ]
    const validationResult = validateInputSEDWithSchema(dmtSED, schema, [], true, "install", "ipv6");
    assert.deepEqual(validationResult, localExpectedResult);
  });
});

describe('validateInputSEDWithSchema - strictIpv6Validation parameter tests', async() => {
  const schema = {
    properties: {
      parameters: {
        properties: {
          LMS_IPv6: {
            $ref: "#/definitions/ipv6_cidr",
          }
        }
      }
    },
    definitions: {
      ipv6_cidr: {
        pattern: "^\\s*((?:(?:(?:[0-9A-Fa-f]{1,4}:){7}(?:[0-9A-Fa-f]{1,4}|:))|(?:(?:[0-9A-Fa-f]{1,4}:){6}(?::[0-9A-Fa-f]{1,4}|(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(?:(?:[0-9A-Fa-f]{1,4}:){5}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(?:(?:[0-9A-Fa-f]{1,4}:){4}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,3})|(?:(?::[0-9A-Fa-f]{1,4})?:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){3}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,4})|(?:(?::[0-9A-Fa-f]{1,4}){0,2}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){2}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,5})|(?:(?::[0-9A-Fa-f]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){1}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,6})|(?:(?::[0-9A-Fa-f]{1,4}){0,4}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?::(?:(?:(?::[0-9A-Fa-f]{1,4}){1,7})|(?:(?::[0-9A-Fa-f]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:)))(?:%.+)?)\\/(([0-9]|[1-9][0-9]|1[01][0-9]|12[0-8]))$",

      },
      ipv6_or_ipv6_cidr: {
        pattern: "^\\s*((?:(?:(?:[0-9A-Fa-f]{1,4}:){7}(?:[0-9A-Fa-f]{1,4}|:))|(?:(?:[0-9A-Fa-f]{1,4}:){6}(?::[0-9A-Fa-f]{1,4}|(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(?:(?:[0-9A-Fa-f]{1,4}:){5}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(?:(?:[0-9A-Fa-f]{1,4}:){4}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,3})|(?:(?::[0-9A-Fa-f]{1,4})?:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){3}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,4})|(?:(?::[0-9A-Fa-f]{1,4}){0,2}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){2}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,5})|(?:(?::[0-9A-Fa-f]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){1}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,6})|(?:(?::[0-9A-Fa-f]{1,4}){0,4}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?::(?:(?:(?::[0-9A-Fa-f]{1,4}){1,7})|(?:(?::[0-9A-Fa-f]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:)))(?:%.+)?)\\/(([0-9]|[1-9][0-9]|1[01][0-9]|12[0-8]))|((?:(?:(?:[0-9A-Fa-f]{1,4}:){7}(?:[0-9A-Fa-f]{1,4}|:))|(?:(?:[0-9A-Fa-f]{1,4}:){6}(?::[0-9A-Fa-f]{1,4}|(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(?:(?:[0-9A-Fa-f]{1,4}:){5}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(?:(?:[0-9A-Fa-f]{1,4}:){4}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,3})|(?:(?::[0-9A-Fa-f]{1,4})?:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){3}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,4})|(?:(?::[0-9A-Fa-f]{1,4}){0,2}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){2}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,5})|(?:(?::[0-9A-Fa-f]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){1}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,6})|(?:(?::[0-9A-Fa-f]{1,4}){0,4}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?::(?:(?:(?::[0-9A-Fa-f]{1,4}){1,7})|(?:(?::[0-9A-Fa-f]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:)))(?:%.+)?)$",
      }
    }
  };
  test('Should return a SED for pENM even if IPv6 addresses are not in CIDR format if useCase is upgrade', async () => {
    const inputSED = {
      LMS_IPv6: '1::1'
    }
    const validationResult = validateInputSEDWithSchema(inputSED, schema, [], false, 'upgrade', 'dual');
    assert.equal(validationResult.message.isInputSEDValid, true);
    assert.equal(validationResult.message.validationErrors.invalidKeyValues.length, 1);
  });

  test('Should return an invalidKeyValues error if IPv6 addresses are not in CIDR format if useCase is install', async () => {
    const inputSED = {
      LMS_IPv6: '1::1'
    }
    const validationResult = validateInputSEDWithSchema(inputSED, schema, [], true, 'install', 'dual');
    assert.equal(validationResult.message.isInputSEDValid, false);
    assert.equal(validationResult.message.validationErrors.invalidKeyValues.length, 1);
  });

  test('Should return an no invalidKeyValues error if IPv6 addresses are in CIDR format if strictIpv6Validation is true', async () => {
    const inputSED = {
      LMS_IPv6: '1::1/64'
    }
    const validationResult = validateInputSEDWithSchema(inputSED, schema, [], true, "upgrade", "dual");
    assert.equal(validationResult.message.isInputSEDValid, true);
    assert.equal(validationResult.message.validationErrors.invalidKeyValues.length, 0);
  });
});