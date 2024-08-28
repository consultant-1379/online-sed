import {
  convertSchemaArrayToObject,
  findChangedValues,
  getSchemaDifferences,
  filterSprintList,
  checkIfSelectedReleaseWasLastInSprintAndRemoveSprintIfItWas,
  filterProductSetList,
  removeVeryLatestReleaseVersion,
  getLatestSprintNumber,
  sortListOfVersionNumber,
  selectReleaseAndFilterReleaseList,
  selectSprintAndFilterSprintList,
  selectVersionAndFilterToStateList,
  selectReleaseAndRemoveLatestReleaseInFromState,
  selectSprintAndRemoveLatestReleaseInFromState,
  resetToStateAvailableReleases,
  resetToStateAvailableSprints,
  filterReleaseList,
  checkIfSelectedWasLastInReleaseAndRemoveReleaseIfItWas
} from "../../src/model/compare.js";

describe('Test getSchemaDifferences', () =>{
  test('it should return an array of schema differences', () => {
    const fromModel = { schemaForm: [{ key: 'a', type: 'string', category: "catA", displayName: "Display Name", validationMessage: "desA" }, { key: 'b', type: 'string', category: "catB", displayName: "Display Name", validationMessage: "desB" }] };
    const comparisonModel = { schemaForm: [{ key: 'b', type: 'number', category: "catB", displayName: "Display Name", validationMessage: "desB"}, { key: 'c', type: 'boolean', category: "catC", displayName: "Display Name", validationMessage: "desC" }] };
    const changes = getSchemaDifferences(fromModel, comparisonModel);
    expect(changes).to.deep.equal([
      { key: 'c', change: 'New Key', category: "catC", displayName: "Display Name", description: "desC",},
      { key: 'a', change: 'Removed Key', category: "catA", displayName: "Display Name", description: "desA"},
      { key: 'b', change: 'Updated Key', oldValue: { type: 'string' }, newValue: { type: 'number' }, description: "desB", category: "catB", displayName: "Display Name",}
    ]);
  });

  test('it should return empty array if there are no schema differences', () => {
    const fromModel = { schemaForm: [{ key: 'a', type: 'string' }, { key: 'b', type: 'number' }] };
    const comparisonModel = { schemaForm: [{ key: 'a', type: 'string' }, { key: 'b', type: 'number' }] };
    const changes = getSchemaDifferences(fromModel, comparisonModel);
    expect(changes).to.be.empty;
  });
});

describe('Test objectDeepEqual', () => {
  test('should find changed values for simple objects', () => {
    const objA = { key1: { prop1: 'value1', prop2: 'value2' } };
    const objB = { key1: { prop1: 'changed', prop2: 'value2' } };

    const result = findChangedValues(objA, objB);

    expect(result).to.deep.equal({
      key1: {
        key: 'key1',
        oldValue: { prop1: 'value1' },
        newValue: { prop1: 'changed' },
      },
    });
  });

  test('should handle objects with nested structures', () => {
    const objA = { key: { nestedKey: { prop: 'value' } } };
    const objB = { key: { nestedKey: { prop: 'changedValue' } } };

    const result = findChangedValues(objA, objB);

    expect(result).to.deep.equal({
      key: {
        key: 'key',
        oldValue: { nestedKey: { prop: 'value' } },
        newValue: { nestedKey: { prop: 'changedValue' } },
      },
    });
  });

  test('should handle added and removed properties', () => {
    const objA = { key1: { prop1: 'value1', prop2: 'value2' } };
    const objB = { key1: { prop1: 'changed' } };

    const result = findChangedValues(objA, objB);

    expect(result).to.deep.equal({
      key1: {
        key: 'key1',
        oldValue: { prop1: 'value1', prop2: 'value2' },
        newValue: { prop1: 'changed' },
      },
    });
  });

  test('should handle multiple keys', () => {
    const objA = { key1: { prop1: 'value1' }, key2: { prop2: 'value2' } };
    const objB = { key1: { prop1: 'changed' }, key2: { prop2: 'value2' } };

    const result = findChangedValues(objA, objB);

    expect(result).to.deep.equal({
      key1: {
        key: 'key1',
        oldValue: { prop1: 'value1' },
        newValue: { prop1: 'changed' },
      },
    });
  });

  test('should return an empty object if there are no changes', () => {
    const objA = { key1: { prop1: 'value1' } };
    const objB = { key1: { prop1: 'value1' } };

    const result = findChangedValues(objA, objB);

    expect(result).to.be.empty;
  });
});

describe('Test convertSchemaArrayToObject', () => {
  test('convertSchemaArrayToObject correctly converts schema array to object', () => {
    const schemaArray = [
      {key: 'key1', category: 'cat1', displayName: 'Name1'},
      {key: 'key2', category: 'cat2', displayName: 'Name2'},
    ];
    const result = convertSchemaArrayToObject(schemaArray);
    assert.equal(result.key1.category, 'cat1');
    assert.equal(result.key2.displayName, 'Name2');
  });

  test('convertSchemaArrayToObject filters out undefined and empty values', () => {
    const schemaArray = [
      {key: 'key1', category: 'cat1', displayName: 'Name1', validationMessage: undefined},
      {key: 'key2', category: 'cat2', displayName: '', validationMessage: 'Message'},
    ];
    const result = convertSchemaArrayToObject(schemaArray);
    assert.isUndefined(result.key1.validationMessage);
    assert.equal(result.key2.validationMessage, 'Message');
  });
});

describe('filterProductSetList', () => {
  test('should return the only list of products greater than the one selected in from state', async () => {
    const fromModelObject = {
      selectedVersion: {name: '23.17.112', version: '23.17.112'},
      selectedSprint: {alias: '23.16', version: '23.16'},
      sprints: [
        {sprintVersion: "23.17"},
        {sprintVersion: "23.16"}
      ],
      allVersions: [
        {
          name: '23.17.115',
          schemaVersion: '2.33.4',
          targetAudience: 'pdu',
          version: '23.17.115',
          sprintVersion: '23.17'
        },
        {name: '23.17.98', schemaVersion: '2.33.2', targetAudience: 'pdu', version: '23.17.98', sprintVersion: '23.17'},
        {name: '23.17.68', schemaVersion: '2.32.16', targetAudience: 'pdu', version: '23.17.68', sprintVersion: '23.17'}
      ]
    };
    const toModelObject = {
      selectedSprint: {alias: '23.17', version: '23.17'},
      sprints: [
        {sprintVersion: "23.17"},
        {sprintVersion: "23.16"}
      ],
      versions: [
        {
          name: '23.17.115',
          schemaVersion: '2.33.4',
          targetAudience: 'pdu',
          version: '23.17.115',
          sprintVersion: '23.17'
        },
        {name: '23.17.98', schemaVersion: '2.33.2', targetAudience: 'pdu', version: '23.17.98', sprintVersion: '23.17'},
        {name: '23.17.68', schemaVersion: '2.32.16', targetAudience: 'pdu', version: '23.17.68', sprintVersion: '23.17'}
      ]
    };
    filterProductSetList(toModelObject, fromModelObject);
    expect(toModelObject.versions[0].name).toBe("23.17.115");
    expect(toModelObject.versions.length).toBe(1);
  });
});

describe('removeVeryLatestReleaseVersion', () => {
  test('should remove the very latest sprint release so its not available in from state dropdown', async () => {
    const fromModelObject = {
      selectedSprint: {alias: '23.17', version: '23.17', sprintVersion: "23.17"},
      unfilteredSprints: [
        {sprintVersion: "23.17"},
        {sprintVersion: "23.16"}
      ],
      sprints: [
        {sprintVersion: "23.17"},
        {sprintVersion: "23.16"}
      ],
      versions: [
        {
          name: '23.17.115',
          schemaVersion: '2.33.4',
          targetAudience: 'pdu',
          version: '23.17.115',
          sprintVersion: '23.17'
        },
        {name: '23.17.98', schemaVersion: '2.33.2', targetAudience: 'pdu', version: '23.17.98', sprintVersion: '23.17'},
        {name: '23.17.68', schemaVersion: '2.32.16', targetAudience: 'pdu', version: '23.17.68', sprintVersion: '23.17'}
      ]
    };
    await removeVeryLatestReleaseVersion(fromModelObject);
    expect(fromModelObject.versions[0].name).toBe("23.17.98");
    expect(fromModelObject.versions.length).toBe(2);
  });

  test('should remove the very latest Rstate release so its not available in from state dropdown', async () => {
    const fromModelObject = {
      selectedSprint: {alias: "default"},
      allVersions: [
        {name: '23.17.115', release: true, releaseNumber: "23.4", schemaVersion: '2.33.4', targetAudience: 'cu', version: '23.17.115', sprintVersion: '23.17'},
        {name: '23.17.98', release: true, releaseNumber: "23.4", schemaVersion: '2.33.2', targetAudience: 'pdu', version: '23.17.98', sprintVersion: '23.17'},
        {name: '23.17.68', release: true, releaseNumber: "23.4", schemaVersion: '2.32.16', targetAudience: 'cu', version: '23.17.68', sprintVersion: '23.17'},
        {name: '23.17.24', release: true, releaseNumber: "23.4", schemaVersion: '2.32.15', targetAudience: 'pdu', version: '23.17.24', sprintVersion: '23.17'}
      ],
      sprints: [
        {sprintVersion: "23.17"},
        {sprintVersion: "23.16"}
      ],
      versions: [
        {
          name: '23.17.115',
          schemaVersion: '2.33.4',
          targetAudience: 'pdu',
          version: '23.17.115',
          sprintVersion: '23.17',
          release: true
        },
        {name: '23.17.98', schemaVersion: '2.33.2', targetAudience: 'pdu', version: '23.17.98', sprintVersion: '23.17', release: true,},
        {name: '23.17.68', schemaVersion: '2.32.16', targetAudience: 'pdu', version: '23.17.68', sprintVersion: '23.17', release: true,}
      ]
    };
    await removeVeryLatestReleaseVersion(fromModelObject);
    expect(fromModelObject.versions[0].name).toBe("23.17.98");
    expect(fromModelObject.versions.length).toBe(2);
  });
});

describe('getLatestSprintNumber', () => {
  test('should return the highest sprint version in model.sprints', () => {
    const model = {
      unfilteredSprints: [
        {sprintVersion: "23.17"},
        {sprintVersion: "23.16"},
      ]
    }
    const result = getLatestSprintNumber(model);
    expect(result).toBe("23.17");
  });
});

describe('filterSprintList', () => {
  test('should return the only list of products greater than the one selected in from state', async () => {
    const fromModelObject = {
      selectedVersion: {name: '23.17.98', version: '23.17.98', sprintVersion: "23.17"},
      selectedSprint: {alias: '23.17', version: '23.17', sprintVersion: "23.17"},
      unfilteredSprints: [
        {sprintVersion: "23.17"},
        {sprintVersion: "23.16"}
      ],
      sprints: [
        {sprintVersion: "23.17"},
        {sprintVersion: "23.16"}
      ],
      allVersions: [
        {
          name: '23.17.115',
          schemaVersion: '2.33.4',
          targetAudience: 'pdu',
          version: '23.17.115',
          sprintVersion: '23.17'
        },
        {name: '23.17.98', schemaVersion: '2.33.2', targetAudience: 'pdu', version: '23.17.98', sprintVersion: '23.17'},
        {name: '23.17.68', schemaVersion: '2.32.16', targetAudience: 'pdu', version: '23.17.68', sprintVersion: '23.17'}
      ]
    };
    const toModelObject = {
      selectedVersion: {name: '23.17.98', version: '23.17.98', sprintVersion: "23.17"},
      selectedSprint: {alias: '23.17', version: '23.17', sprintVersion: "23.17"},
      sprints: [
        {sprintVersion: "23.17"},
        {sprintVersion: "23.16"}
      ],
      versions: [
        {
          name: '23.17.115',
          schemaVersion: '2.33.4',
          targetAudience: 'pdu',
          version: '23.17.115',
          sprintVersion: '23.17'
        },
        {name: '23.17.98', schemaVersion: '2.33.2', targetAudience: 'pdu', version: '23.17.98', sprintVersion: '23.17'},
        {name: '23.17.68', schemaVersion: '2.32.16', targetAudience: 'pdu', version: '23.17.68', sprintVersion: '23.17'}
      ]
    };
    await filterSprintList(fromModelObject, toModelObject);
    expect(toModelObject.sprints[0].sprintVersion).toBe("23.17");
    expect(toModelObject.sprints.length).toBe(1);
  });
});
describe('filterReleaseList', () => {
  test('should return only a list releases greater than the one selected in from state', async () => {
    const fromModelObject = {
      selectedVersion: {name: '23.17.98', version: '23.17.98', sprintVersion: "23.17"},
      selectedRelease: { releaseNumber: '24.1' },
      versions: [
        {
          name: '23.17.115',
          schemaVersion: '2.33.4',
          targetAudience: 'pdu',
          version: '23.17.115',
          sprintVersion: '23.17'
        },
        {name: '23.17.98', schemaVersion: '2.33.2', targetAudience: 'pdu', version: '23.17.98', sprintVersion: '23.17'},
        {name: '23.17.68', schemaVersion: '2.32.16', targetAudience: 'pdu', version: '23.17.68', sprintVersion: '23.17'}
      ]
    };
    const toModelObject = {
      selectedVersion: {name: '23.17.98', version: '23.17.98', sprintVersion: "23.17"},
      selectedRelease: { releaseNumber: '23.4' },
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
          schemaVersion: '2.33.4',
          targetAudience: 'pdu',
          version: '23.17.115',
          sprintVersion: '23.17'
        },
        {name: '23.17.98', schemaVersion: '2.33.2', targetAudience: 'pdu', version: '23.17.98', sprintVersion: '23.17'},
        {name: '23.17.68', schemaVersion: '2.32.16', targetAudience: 'pdu', version: '23.17.68', sprintVersion: '23.17'}
      ]
    };
    await filterReleaseList(fromModelObject, toModelObject);
    expect(toModelObject.releases[0].sprintNumber).toBe("23.17");
    expect(toModelObject.releases.length).toBe(1);
  });
});


describe('checkIfSelectedWasLastInReleaseAndRemoveReleaseIfItWas', () => {
  test('should remove release if selected version was last in that release', async () => {
    const fromModelObject = {
      selectedVersion: {name: '23.17.115', version: '23.17.115', sprintVersion: "23.17"},
      selectedRelease: { releaseNumber: '24.1' },
      versions: [
        {
          name: '23.17.115',
          schemaVersion: '2.33.4',
          targetAudience: 'pdu',
          version: '23.17.115',
          sprintVersion: '23.17'
        }
      ]
    };
    const toModelObject = {
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
          schemaVersion: '2.33.4',
          targetAudience: 'pdu',
          version: '23.17.115',
          sprintVersion: '23.17'
        }
      ]
    };
    await checkIfSelectedWasLastInReleaseAndRemoveReleaseIfItWas(toModelObject, fromModelObject);
    expect(toModelObject.releases.length).toBe(1);
    expect(toModelObject.releases[0].sprintNumber).toBe("23.16");
  });

  test('should only remove release if selected version was last in that release ', async () => {
    const fromModelObject = {
      selectedVersion: {name: '23.17.115', version: '23.17.115', sprintVersion: "23.17"},
      selectedRelease: { releaseNumber: '24.1' },
      versions: [
          {
          name: '23.17.116',
          schemaVersion: '2.33.5',
          targetAudience: 'pdu',
          version: '23.17.116',
          sprintVersion: '23.17'
        },
        {
          name: '23.17.115',
          schemaVersion: '2.33.4',
          targetAudience: 'pdu',
          version: '23.17.115',
          sprintVersion: '23.17'
        }
      ]
    };
    const toModelObject = {
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
          name: '23.17.116',
          schemaVersion: '2.33.5',
          targetAudience: 'pdu',
          version: '23.17.116',
          sprintVersion: '23.17'
        },
        {
          name: '23.17.115',
          schemaVersion: '2.33.4',
          targetAudience: 'pdu',
          version: '23.17.115',
          sprintVersion: '23.17'
        }
      ]
    };
    await checkIfSelectedWasLastInReleaseAndRemoveReleaseIfItWas(toModelObject, fromModelObject);
    expect(toModelObject.versions.length).toBe(2);
    expect(toModelObject.versions[0].version).toBe("23.17.116");
  });

});

describe('checkIfSelectedReleaseWasLastInSprintAndRemoveSprintIfItWas', () => {
  test('should remove sprint 23.16 from toModelObject if highest 23.16 release is selected in fromstate', async () => {
    const fromModelObject = {
      selectedSprint: {alias: '23.16', version: '23.16', sprintVersion: "23.16"},
      selectedVersion: {name: '23.16.98', version: '23.16.98', sprintVersion: "23.16"},
      unfilteredSprints: [
        {sprintVersion: "23.17"},
        {sprintVersion: "23.16"},
        {sprintVersion: "23.15"}
      ],
      sprints: [
        {sprintVersion: "23.17"},
        {sprintVersion: "23.16"},
        {sprintVersion: "23.15"}
      ],
      allVersions: [
        {name: '23.16.98', schemaVersion: '2.33.2', targetAudience: 'pdu', version: '23.16.98', sprintVersion: '23.16'},
      ]
    };
    const toModelObject = {
      sprints: [
        {sprintVersion: "23.17"},
        {sprintVersion: "23.16"}
      ],
    };
    await checkIfSelectedReleaseWasLastInSprintAndRemoveSprintIfItWas(toModelObject, fromModelObject);
    expect(toModelObject.sprints[0].sprintVersion).toBe("23.17");
    expect(toModelObject.sprints.length).toBe(1);
  });
});

describe('sortListOfVersionNumber', () => {
  test('should a sorted list highest to lowest', async () => {
    const versionNumbers = ['23.15', '23.17', '23.16']
    const sortedList = sortListOfVersionNumber(versionNumbers);
    expect(sortedList[0]).toBe("23.17");
  });
});

describe('selectVersionAndFilterToStateList', () => {
  test('To state selected version should be 23.17.115 and to state sprints should be only contain two sprints', async () => {
    const fromModelObject = {
      selectedSprint: {alias: '23.17', version: '23.17', sprintVersion: "23.17"},
      selectedProduct: {
        name: "Physical ENM",
        sedFileFormat: "txt",
        sedSchemaRepo: "proj-online-sed-generic-local",
        shortName: "pENM"
      },
      unfilteredSprints: [
        {sprintVersion: "23.17"},
        {sprintVersion: "23.16"}
      ],
      sprints: [
        {sprintVersion: "23.17"},
        {sprintVersion: "23.16"}
      ],
      versions: [
        {
          name: '23.17.115',
          schemaVersion: '2.33.4',
          targetAudience: 'pdu',
          version: '23.17.115',
          sprintVersion: '23.17'
        },
        {name: '23.17.98', schemaVersion: '2.33.2', targetAudience: 'pdu', version: '23.17.98', sprintVersion: '23.17'},
        {name: '23.17.68', schemaVersion: '2.32.16', targetAudience: 'pdu', version: '23.17.68', sprintVersion: '23.17'}
      ],
      allVersions: [
        {
          name: '23.17.115',
          schemaVersion: '2.33.4',
          targetAudience: 'pdu',
          version: '23.17.115',
          sprintVersion: '23.17'
        },
        {name: '23.17.98', schemaVersion: '2.33.2', targetAudience: 'pdu', version: '23.17.98', sprintVersion: '23.17'},
        {name: '23.17.68', schemaVersion: '2.32.16', targetAudience: 'pdu', version: '23.17.68', sprintVersion: '23.17'}
      ]
    };
    const toModelObject = {
      sprints: [
        {sprintVersion: "23.17"},
        {sprintVersion: "23.16"}
      ],
      versions: [
        {
          name: '23.17.115',
          schemaVersion: '2.33.4',
          targetAudience: 'pdu',
          version: '23.17.115',
          sprintVersion: '23.17'
        },
        {name: '23.17.98', schemaVersion: '2.33.2', targetAudience: 'pdu', version: '23.17.98', sprintVersion: '23.17'},
        {name: '23.17.68', schemaVersion: '2.32.16', targetAudience: 'pdu', version: '23.17.68', sprintVersion: '23.17'}
      ]
    };
    const vid = 1;
    await selectVersionAndFilterToStateList(fromModelObject, vid, toModelObject);
    expect(toModelObject.versions[0].name).toBe("23.17.115");
    expect(toModelObject.sprints.length).toBe(1);
    expect(fromModelObject.selectedVersion.version).toBe('23.17.98');
  });
});

  describe('selectReleaseAndRemoveLatestReleaseInFromState', () => {
    test('Slected from state release should be 23.17', async () => {
      const fromModelObject = {
        allVersions: [
          {name: '23.17.115', release: true, releaseNumber: "23.4", schemaVersion: '2.33.4', targetAudience: 'cu', version: '23.17.115', sprintVersion: '23.17'},
          {name: '23.17.98', release: false, releaseNumber: "23.4", schemaVersion: '2.33.2', targetAudience: 'pdu', version: '23.17.98', sprintVersion: '23.17'},
          {name: '23.17.68', release: true, releaseNumber: "23.4", schemaVersion: '2.32.16', targetAudience: 'cu', version: '23.17.68', sprintVersion: '23.17'},
          {name: '23.17.24', release: true, releaseNumber: "23.4", schemaVersion: '2.32.15', targetAudience: 'pdu', version: '23.17.24', sprintVersion: '23.17'}
        ],
        selectedVersion: {name: '23.17.98', version: '23.17.98', sprintVersion: "23.17"},
        selectedSprint: {alias: '23.17', version: '23.17', sprintVersion: "23.17"},
        unfilteredSprints: [
          {sprintVersion: "23.17"},
          {sprintVersion: "23.16"}
        ],
        sprints: [
          {sprintVersion: "23.17"},
          {sprintVersion: "23.16"}
        ],
        releases: [
          {
            releaseNumber: "23.4",
            sprintNumber: "23.16",
            visible: true
          }
        ],
        versions: [
          {
            name: "R1GK",
            release: true,
            releaseNumber: "23.4",
            schemaVersion: "2.31.12",
            sprintVersion: "23.15",
            targetAudience: "cu",
            version: "23.15.116"
          }
        ]
      };
      const toModelObject = {
        releases: [
          {
            releaseNumber: "23.4",
            sprintNumber: "23.16",
            visible: true
          },
          {
            releaseNumber: "23.3",
            sprintNumber: "23.15",
            visible: true
          }
        ],
      };
      const vid = 0;
      await selectReleaseAndRemoveLatestReleaseInFromState(fromModelObject, vid, toModelObject)
      expect(fromModelObject.selectedRelease.releaseNumber).toBe("23.4");
    });
  });

describe('selectSprintAndRemoveLatestReleaseInFromState', () => {
  test('Selected From state sprint should be 23.17', async () => {
      const fromModelObject = {
        allVersions: [
          {name: '23.17.115', release: true, releaseNumber: "23.4", schemaVersion: '2.33.4', targetAudience: 'cu', version: '23.17.115', sprintVersion: '23.17'},
          {name: '23.17.98', release: false, releaseNumber: "23.4", schemaVersion: '2.33.2', targetAudience: 'pdu', version: '23.17.98', sprintVersion: '23.17'},
          {name: '23.17.68', release: true, releaseNumber: "23.4", schemaVersion: '2.32.16', targetAudience: 'cu', version: '23.17.68', sprintVersion: '23.17'},
          {name: '23.17.24', release: true, releaseNumber: "23.4", schemaVersion: '2.32.15', targetAudience: 'pdu', version: '23.17.24', sprintVersion: '23.17'}
        ],
        selectedSprint: {alias: '23.17', version: '23.17', sprintVersion: "23.17"},
        unfilteredSprints: [
          {sprintVersion: "23.17"},
          {sprintVersion: "23.16"}
        ],
        sprints: [
          {sprintVersion: "23.17"},
          {sprintVersion: "23.16"}
        ],
        versions: [
          {
            name: '23.17.115',
            schemaVersion: '2.33.4',
            targetAudience: 'pdu',
            version: '23.17.115',
            sprintVersion: '23.17'
          },
          {name: '23.17.98', schemaVersion: '2.33.2', targetAudience: 'pdu', version: '23.17.98', sprintVersion: '23.17'},
          {name: '23.17.68', schemaVersion: '2.32.16', targetAudience: 'pdu', version: '23.17.68', sprintVersion: '23.17'}
        ],
        selectedProduct: {
          name: "Physical ENM",
          sedFileFormat: "txt",
          sedSchemaRepo: "proj-online-sed-generic-local",
          shortName: "pENM"
        }
      };
    const toModelObject = {
      sprints: [
        {sprintVersion: "23.17"},
      ],
    };
    const vid = 0;
    await selectSprintAndRemoveLatestReleaseInFromState(fromModelObject, vid, toModelObject)
    expect(fromModelObject.selectedSprint.sprintVersion).toBe("23.17");
  });
});

describe('selectSprintAndFilterSprintList', () => {
  test('From state sprint should be set to 23.17', async () => {
    const fromModelObject = {
      selectedVersion: {name: '23.17.98', version: '23.17.98', sprintVersion: "23.17"},
      allVersions: [
        {name: '23.17.115', release: true, releaseNumber: "23.4", schemaVersion: '2.33.4', targetAudience: 'cu', version: '23.17.115', sprintVersion: '23.17'},
        {name: '23.17.98', release: false, releaseNumber: "23.4", schemaVersion: '2.33.2', targetAudience: 'pdu', version: '23.17.98', sprintVersion: '23.17'},
        {name: '23.17.68', release: true, releaseNumber: "23.4", schemaVersion: '2.32.16', targetAudience: 'cu', version: '23.17.68', sprintVersion: '23.17'},
        {name: '23.17.24', release: true, releaseNumber: "23.4", schemaVersion: '2.32.15', targetAudience: 'pdu', version: '23.17.24', sprintVersion: '23.17'}
      ],
      selectedSprint: {alias: '23.17', version: '23.17', sprintVersion: "23.17"},
      sprints: [
        {sprintVersion: "23.17"},
        {sprintVersion: "23.16"}
      ],
      versions: [
        {name: '23.17.115', schemaVersion: '2.33.4', targetAudience: 'pdu', version: '23.17.115', sprintVersion: '23.17'},
        {name: '23.17.98', schemaVersion: '2.33.2', targetAudience: 'pdu', version: '23.17.98', sprintVersion: '23.17'},
        {name: '23.17.68', schemaVersion: '2.32.16', targetAudience: 'pdu', version: '23.17.68', sprintVersion: '23.17'}
      ],
      selectedProduct: {
        name: "Physical ENM",
        sedFileFormat: "txt",
        sedSchemaRepo: "proj-online-sed-generic-local",
        shortName: "pENM"
      }
    };
    const toModelObject = {
      sprints: [
        {sprintVersion: "23.17"},
        {sprintVersion: "23.16"}
      ],
      allVersions: [
        {name: '23.17.115', release: true, releaseNumber: "23.4", schemaVersion: '2.33.4', targetAudience: 'cu', version: '23.17.115', sprintVersion: '23.17'},
        {name: '23.17.98', release: false, releaseNumber: "23.4", schemaVersion: '2.33.2', targetAudience: 'pdu', version: '23.17.98', sprintVersion: '23.17'},
        {name: '23.17.68', release: true, releaseNumber: "23.4", schemaVersion: '2.32.16', targetAudience: 'cu', version: '23.17.68', sprintVersion: '23.17'},
        {name: '23.17.24', release: true, releaseNumber: "23.4", schemaVersion: '2.32.15', targetAudience: 'pdu', version: '23.17.24', sprintVersion: '23.17'}
      ],
      versions: [
        {name: '23.17.115', schemaVersion: '2.33.4', targetAudience: 'pdu', version: '23.17.115', sprintVersion: '23.17'},
        {name: '23.17.98', schemaVersion: '2.33.2', targetAudience: 'pdu', version: '23.17.98', sprintVersion: '23.17'},
        {name: '23.17.68', schemaVersion: '2.32.16', targetAudience: 'pdu', version: '23.17.68', sprintVersion: '23.17'}
      ],
      selectedProduct: {
        name: "Physical ENM",
        sedFileFormat: "txt",
        sedSchemaRepo: "proj-online-sed-generic-local",
        shortName: "pENM"
      }
    };
    const vid = 0;
    await selectSprintAndFilterSprintList(toModelObject, vid, fromModelObject)
    expect(fromModelObject.selectedSprint.sprintVersion).toBe("23.17");
  });
});

describe('selectReleaseAndFilterReleaseList', () => {
  test('Selected From state release should be 23.17', async () => {
    const fromModelObject = {
      releases: [
        {
          releaseNumber: "23.4",
          sprintNumber: "23.16",
          visible: true
        }
      ],
      selectedVersion: {name: '23.17.98', version: '23.17.98', sprintVersion: "23.17"},
      selectedSprint: {alias: '23.17', version: '23.17', sprintVersion: "23.17"},
      sprints: [
        {sprintVersion: "23.17"},
        {sprintVersion: "23.16"}
      ],
    };
    const toModelObject = {
      releases: [
        {
          releaseNumber: "23.4",
          sprintNumber: "23.16",
          visible: true
        }
      ],
      allVersions: [
        {name: '23.17.115', release: true, releaseNumber: "23.4", schemaVersion: '2.33.4', targetAudience: 'cu', version: '23.17.115', sprintVersion: '23.17'},
        {name: '23.17.98', release: false, releaseNumber: "23.4", schemaVersion: '2.33.2', targetAudience: 'pdu', version: '23.17.98', sprintVersion: '23.17'},
        {name: '23.17.68', release: true, releaseNumber: "23.4", schemaVersion: '2.32.16', targetAudience: 'cu', version: '23.17.68', sprintVersion: '23.17'},
        {name: '23.17.24', release: true, releaseNumber: "23.4", schemaVersion: '2.32.15', targetAudience: 'pdu', version: '23.17.24', sprintVersion: '23.17'}
      ],
    };
    const vid = 0;
    await selectReleaseAndFilterReleaseList(toModelObject, vid, fromModelObject)
    expect(fromModelObject.selectedSprint.sprintVersion).toBe("23.17");
  });
});

describe('resetToStateAvailableSprints', () => {
  test('toStateModel.sprints should equal fromModelObject.sprints', async () => {
    const fromModelObject = {
      selectedVersion: {name: '23.17.98', version: '23.17.98', sprintVersion: "23.17"},
      selectedSprint: {alias: '23.17', version: '23.17', sprintVersion: "23.17"},
      sprints:
          [
            {name: '23.17.8', schemaVersion: '2.32.12', targetAudience: 'pdu', version: '23.17.8', sprintVersion: '23.17'},
            {name: '23.16.31', schemaVersion: '2.32.1', targetAudience: 'pdu', version: '23.16.31', sprintVersion: '23.16'}
          ],
    };
    const toModelObject = {
      selectedVersion: {name: '23.17.98', version: '23.17.98', sprintVersion: "23.17"},
      selectedSprint: {alias: '23.17', version: '23.17', sprintVersion: "23.17"},
      allSprints:
          [
            {name: '23.17.8', schemaVersion: '2.32.12', targetAudience: 'pdu', version: '23.17.8', sprintVersion: '23.17'},
            {name: '23.16.31', schemaVersion: '2.32.1', targetAudience: 'pdu', version: '23.16.31', sprintVersion: '23.16'}
          ],
      sprints:
          [
            {name: '23.17.8', schemaVersion: '2.32.12', targetAudience: 'pdu', version: '23.17.8', sprintVersion: '23.17'},
          ],
    };
    await resetToStateAvailableSprints(toModelObject);
    expect(toModelObject.sprints).toEqual(fromModelObject.sprints);
  });
});

describe('resetToStateAvailableReleases', () => {
  test('toStateModel.releases should equal fromModelObject.releases', async () => {
    const fromModelObject = {
      selectedVersion: {name: '23.17.98', version: '23.17.98', sprintVersion: "23.17"},
      selectedRelease: { releaseNumber: '24.1' },
      sprints:
          [
            {name: '23.17.8', schemaVersion: '2.32.12', targetAudience: 'pdu', version: '23.17.8', sprintVersion: '23.17'},
            {name: '23.16.31', schemaVersion: '2.32.1', targetAudience: 'pdu', version: '23.16.31', sprintVersion: '23.16'}
          ],
      releases:
          [
            {
              releaseNumber: "23.4",
              sprintNumber: "23.16",
              visible: true
            },
            {
              releaseNumber: "23.3",
              sprintNumber: "23.15",
              visible: true
            }
          ],
    };
    const toModelObject = {
      selectedVersion: {name: '23.17.98', version: '23.17.98', sprintVersion: "23.17"},
      selectedRelease: { releaseNumber: '24.1' },
      allReleases: [
          {
            releaseNumber: "23.4",
            sprintNumber: "23.16",
            visible: true
          },
          {
            releaseNumber: "23.3",
            sprintNumber: "23.15",
            visible: true
          }
          ],
      releases:
          [
            {
              releaseNumber: "23.4",
              sprintNumber: "23.16",
              visible: true
            }
          ],
    };
    await resetToStateAvailableReleases(toModelObject);
    expect(toModelObject.releases).toEqual(fromModelObject.releases);
  });
});

