import { expect, vi } from "vitest";
import axios from 'axios';
import PreviewDetailsTable from "../../src/views/PreviewDetailsTable.vue";
import { shallowMount } from '@vue/test-utils';
import model from "../../src/model";

describe('When there are no validation errors', () => {
  let mockedResponse;
  let question;

  beforeEach(() => {
    model = {};
    model.expandCategories = true;
    model.schemaForm = [
        {
            key: "test_ip1",
            displayName: "test1",
            type: "string",
            category: "category1",
            validationMessage: "ipv4",
            validationPattern: "^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$",
            preventDuplicates: true,
            isValid: true
        },
        {
            key: "test_ip2",
            displayName: "test2",
            type: "string",
            category: "category1",
            validationMessage: "ipv4",
            validationPattern: "^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$",
            preventDuplicates: true,
            isValid: true
        }
    ];
    model.dataTypeCategories = [{name: "category1", shortName: "category1", id: 0, collapsed: false}];
    model.selectedProduct= { vid: 1, sedSchemaRepo: "some_url", shortName: "pENM"};
    model.selectedUseCase =  { name: "Upgrade", alias: "upgrade", shortName: "upgrade", };
    model.selectedVersion= {version: '23.11', schemaVersion: '2.28.9', targetAudience: 'pdu'};
    model.selectedIpVersion= { name: 'ipv4' };
    model.displayKeys= ['enable_service'];
    model.excludeIps = [{ ipAddress: '23.23.23.1', ipDescription: '', isDuplicate: false, errorMessage: false }]
    model.includePasswords = false;
    model.loadedSchema = { properties: { parameters: { properties: {} } } };
    model.response = {
        ip_version: 'ipv4',
        test_ip1: '192.168.1.5',
        test_ip2: '192.168.1.6',
        deployment_id: 'id23222',
        enable_service: 'true'
    };
    model.immutableImportedData =  {
        ip_version: 'ipv4',
        test_ip1: '192.168.1.5',
        test_ip2: '192.168.1.6',
        deployment_id: 'id23222',
        enable_service: 'true'
    };
    model.displayAll = true;
    model.displayErrors= false;
    model.displayChanged = false;
    model.expandCategories = true
    question = {
        category: "category1",
        displayName: "Enm deployment ID",
        key: "deployment_id",
        displayIf: ["enable_service"],
        validationPattern: "^(?=.*[a-zA-Z])[A-Za-z0-9-]{1,30}$",
        isValid: false
    };
    mockedResponse = {
        status: 200,
        statusText: "OK",
        data: {
            success: true,
            message: {
                isInputSEDValid: true,
                newSED: {
                   test_ip1: '192.168.1.5',
                   test_ip2: '192.168.1.6',
                   enable_service: 'true'
               },
               validationErrors: {
                   missingKeyNames: [],
                   invalidKeyValues: [{keyName: "test_ip1", keyValue: "someValue"}, {keyName: "test_ip2", keyValue: "someValue"}],
                   duplicatedKeyValues: [],
                   duplicatedKeyValuesInExclusionIps: [],
                   requiredKeyValuesNotProvided: [],
                   mismatchedKeyValues: []
               }
            }
        }
    };
  });

  test('render the view', async () => {
    axios.post = vi.fn().mockResolvedValue(mockedResponse);
    const wrapper = shallowMount(PreviewDetailsTable);
    expect(wrapper.exists()).toBe(true);
  });

  test('should return status 200 and export button should be enabled', async () => {
    model.usePreviousSED = true;
    axios.post = vi.fn().mockResolvedValue(mockedResponse);
    const wrapper = shallowMount(PreviewDetailsTable);
    await wrapper.setData({validForExport: true});
    const button = wrapper.find('#export_button');
    expect(button.exists()).toBe(true);
    await button.trigger('click');
    const confirmSpy = vi.spyOn(wrapper.vm, 'isThereInvalidFieldsOnExport');
    await wrapper.vm.isThereInvalidFieldsOnExport();
    expect(confirmSpy).toBeCalled();
  });

  test('should change the status of variableNameEnabled', async () => {
    model.variableNameEnabled = true;
    const wrapper = shallowMount(PreviewDetailsTable);
    expect(wrapper.exists()).toBe(true);
    const toggleName = wrapper.find('#enable_name_button');
    expect(toggleName.exists()).toBe(true);
    await toggleName.trigger('click');
    expect(wrapper.vm.variableNameEnabled).toBeFalsy();
  });

  test('should collapse the category details when "more" icon is clicked', async () => {
    model.usePreviousSED = false;
    const wrapper = shallowMount(PreviewDetailsTable);
    const r1 = wrapper.find('div.row.key');
    expect(r1.exists()).toBe(true);
    expect(r1.isVisible()).toBe(true);
    const detailsDiv = wrapper.find('div.details');
    expect(detailsDiv.exists()).toBe(true);
    expect(detailsDiv.isVisible()).toBe(true);
    const expandButton = wrapper.find('i.icon.icon-more');
    await expandButton.trigger('click');
    expect(r1.isVisible()).toBe(false);
    expect(detailsDiv.isVisible()).toBe(false);
  });

  test('should expand the category when toggle is clicked', async () => {
    model.usePreviousSED = false;
    const wrapper = shallowMount(PreviewDetailsTable);
    const r1 = wrapper.find('div.row.key');
    expect(r1.isVisible()).toBe(true);
    const detailsDiv = wrapper.find('div.details');
    expect(detailsDiv.isVisible()).toBe(true);
    const expandButton = wrapper.find('i.icon.icon-more');
    await expandButton.trigger('click');
    expect(r1.isVisible()).toBe(false);
    expect(detailsDiv.isVisible()).toBe(false);
    const toggleCat = wrapper.find("#expand_all_button");
    expect(toggleCat.exists()).toBe(true);
    await toggleCat.trigger('click');
    expect(detailsDiv.isVisible()).toBe(true);
    expect(r1.isVisible()).toBe(true);
  });

  test('should upgrade the columns width when previous SED is true', async () => {
    model.usePreviousSED = true;
    const wrapper = shallowMount(PreviewDetailsTable);
    expect(wrapper.vm.upgradeColumnWidth).toBe(true);
  });

  test('Check only errors displayed if show errors button is clicked', async () => {
    const wrapper = shallowMount(PreviewDetailsTable);
    const button = wrapper.find('#show_errors_button');
    expect(button.exists()).to.be.true;
    await button.trigger('click');
    expect(model.displayErrors).to.be.true;
    expect(model.displayAll).to.be.false;
    expect(model.displayChanged).to.be.false;
  });

  test('Check display changes button is not available if file was not imported', async () => {
    model.usePreviousSED = false;
    const wrapper = shallowMount(PreviewDetailsTable);
    const button = wrapper.find('#show_changes_button');
    expect(button.exists()).to.be.false;
  });

  test('Check only changes displayed if show errors changes is clicked', async () => {
    model.usePreviousSED = true;
    const wrapper = shallowMount(PreviewDetailsTable);
    const button = wrapper.find('#show_changes_button');
    expect(button.exists()).to.be.true;
    await button.trigger('click');
    expect(model.displayChanged).to.be.true;
    expect(model.displayAll).to.be.false;
    expect(model.displayErrors).to.be.false;
  });

  test('test checkIfEntryIsDisplayed displayIf should return false when enable_service is false', async () => {
    model.response = {
        enable_service: 'false'
    };
    let question = {
        displayIf: ["enable_service"]
    };
    let shouldDisplay = PreviewDetailsTable.methods.checkIfEntryIsDisplayed(question)
    expect(shouldDisplay).toBe(false);
  });

  test('test checkIfEntryIsDisplayed displayIfNot should return true when enable_service is false', async () => {
    model.response = {
        enable_service: 'false'
    };
    let question = {
        displayIfNot: ["enable_service"],
    };
    let shouldDisplay = PreviewDetailsTable.methods.checkIfEntryIsDisplayed(question)
    expect(shouldDisplay).toBe(true);
  });

  test('test displayOnlyInvalidEntries displayIfNot should return true when enable_service is false', async () => {
    model.response = {
        enable_service: 'false'
    };
    let question = {
        displayIfNot: ["enable_service"]
    };
    let shouldDisplay = PreviewDetailsTable.methods.displayOnlyInvalidEntries(question)
    expect(shouldDisplay).toBe(true);
  });

  test('test displayOnlyInvalidEntries displayIfNot should return false when enable_service is true', async () => {
    let question = {
        displayIfNot: ["enable_service"],
    };
    let shouldDisplay = PreviewDetailsTable.methods.displayOnlyInvalidEntries(question)
    expect(shouldDisplay).toBe(false);
  });
});

describe('With invalid fields', () => {
    let mockedError;

    beforeEach(() => {
        model = {};
        model.usePreviousSED = false;
        model.expandCategories = true;
        model.schemaForm = [
            {
                key: "test_ip1",
                displayName: "test1",
                type: "string",
                category: "Category1",
                validationMessage: "ipv4",
                validationPattern: "^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$",
                preventDuplicates: true
            },
            {
                key: "test_ip2",
                displayName: "test2",
                type: "string",
                category: "Category1",
                validationMessage: "ipv4",
                validationPattern: "^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$",
                preventDuplicates: true
            },
            {
                key: "test_ip3",
                displayName: "test3",
                type: "string",
                category: "Category1",
                validationMessage: "ipv4",
                validationPattern: "^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$",
                preventDuplicates: true
            },
            {
                key: "test_ip4",
                displayName: "test4",
                type: "string",
                category: "Category1",
                validationMessage: "ipv4",
                validationPattern: "^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$",
                preventDuplicates: true
            },
            {
                key:  "VLAN_ID_heartbeat1",
                displayName: "VLAN ID for heartbeat 1",
                category: "VlanIDs",
                validationPattern: "^.+$",
                example: "2021"
            },
            {
                key:  "VLAN_ID_heartbeat2",
                displayName: "VLAN ID for heartbeat 2",
                category: "VlanIDs",
                validationPattern: "^.+$",
                example: "2022"
            }
        ];
        model.dataTypeCategories = [{name: "Category1", shortName: "Category1"}];
        model.selectedProduct= { vid: 1, sedSchemaRepo: "some_url", shortName: "pENM"};
        model.selectedUseCase =  { name: "Install", alias: "install", shortName: "install", };
        model.selectedVersion= {version: '23.11', schemaVersion: '2.28.9', targetAudience: 'pdu'};
        model.selectedIpVersion= { name: 'ipv4' };
        model.displayKeys= [];
        model.includePasswords = false;
        model.loadedSchema = { properties: { parameters: { properties: {} } } };
        model.response = {
            test_ip1: '192.168.1.5',
            test_ip2: '192.168.1.5',
            test_ip3: '192.168.1.6/23',
            test_ip4: '110.59.132.12'
        };
        mockedError = {
            message: "Request failed with status code 422",
            name: "AxiosError",
            code: "ERR_BAD-REQUEST",
            isAxiosError: true,
            response: {
                status: 422,
                data: {
                    success: true,
                    message: {
                        isInputSEDValid: false,
                        newSED: {
                            test_ip1: '192.168.1.5',
                            test_ip2: '192.168.1.5',
                            test_ip3: '192.168.1.6/23',
                            test_ip4: '110.59.132.12'
                        },
                        validationErrors: {
                            missingKeyNames: ["VLAN_ID_heartbeat1" , "VLAN_ID_heartbeat2"],
                            invalidKeyValues: [{keyName: "test_ip3", keyValue: "192.168.1.6/23", validationPattern: "^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$"}],
                            duplicatedKeyValues: [{keyName: "test_ip1", keyValue: "192.168.1.5"},{keyName: "test_ip2", keyValue: "192.168.1.5"}],
                            duplicatedKeyValuesInExclusionIps: [{keyName: "test_ip4", keyValue: "110.59.132.12"}],
                            requiredKeyValuesNotProvided: ["VLAN_ID_heartbeat1"],
                            mismatchedKeyValues: [{keyName: "test_ip3", keyValue: "192.168.1.5"}, {keyName: "test_ip4", keyValue: "192.168.1.5"}]
                        }
                    }
                }
            }
        }
    });

    test('with validation errors it should return status 422 and export button is enabled', async () => {
        vi.spyOn(axios,'post').mockRejectedValueOnce(mockedError);
        const wrapper = shallowMount(PreviewDetailsTable);
        expect(wrapper.vm.validForExport).toEqual("");
        expect(wrapper.exists()).toBe(true);
        const button = wrapper.find('#export_button');
        expect(button.exists()).toBe(true);
        await button.trigger('click');
        const confirmSpy = vi.spyOn(wrapper.vm, 'isThereInvalidFieldsOnExport');
        await wrapper.vm.isThereInvalidFieldsOnExport();
        expect(confirmSpy).toBeCalled();
    });

    test('with validation errors export button should be enabled and show a warning notification', async () => {
        model.selectedUseCase.name = 'Upgrade';
        vi.spyOn(axios,'post').mockRejectedValueOnce(mockedError);
        const wrapper = shallowMount(PreviewDetailsTable);
        const button = wrapper.find('#export_button');
        await button.trigger('click');
        const confirmSpy = vi.spyOn(wrapper.vm, 'isThereInvalidFieldsOnExport');
        await wrapper.vm.isThereInvalidFieldsOnExport();
        expect(confirmSpy).toBeCalled();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.validationIssuesMessage).toEqual(true);
    });


    test('with dryRunMode enabled and validation errors export button should be enabled and show a warning', async () => {
        model.dryRunMode = true;
        model.selectedUseCase.name = 'Upgrade';
        vi.spyOn(axios,'post').mockRejectedValueOnce(mockedError);
        const wrapper = shallowMount(PreviewDetailsTable);
        const button = wrapper.find('#export_button');
        await button.trigger('click');
        const confirmSpy = vi.spyOn(wrapper.vm, 'isThereInvalidFieldsOnExport');
        await wrapper.vm.$nextTick();
        await wrapper.vm.isThereInvalidFieldsOnExport();
        expect(confirmSpy).toBeCalled();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.incompleteValuesWarn).toEqual(true);
    });

    test('when the error has status code different to 422, it should print the error', async () => {
        mockedError = {
            message: "Request failed with status code 404",
            response: {
                status: 404,
            }
        };
        vi.spyOn(axios,'post').mockRejectedValueOnce(mockedError);
        const wrapper = shallowMount(PreviewDetailsTable);
        expect(wrapper.vm.errorMessage).not.toBeNull();
    });
});

describe('displayOnlyInvalidSections', () => {
  beforeEach(() => {
    model = {};
    model.schemaForm = [
      {
        key: "test_ip1",
        category: "category1",
        isValid: true
      },
      {
        key: "test_ip2",
        category: "category2",
        isValid: false,
      },
      {
        key: "question1",
        category: "category3",
        isValid: false,
        displayIf: ["question3"]
      }
    ];
    model.response = {
      question1: '1.1.1.100000',
      question3: false
    };
  });

  test('Returns false if section contain a valid entry', () => {
    const section = {
      shortName: 'category1',
    };
    expect(PreviewDetailsTable.methods.displayOnlyInvalidSections(section)).to.be.false;
  });

  test('Returns true if section contain a valid entry', () => {
    const section = {
      shortName: 'category2',
    };
    expect(PreviewDetailsTable.methods.displayOnlyInvalidSections(section)).to.be.true;
  });

  test('returns false if key should not be displayed due to displayIf/displayNotIf', () => {
    const section = {
      shortName: 'category3',
    };
    expect(PreviewDetailsTable.methods.displayOnlyInvalidSections(section)).to.be.false;
  });
});

describe('displayChangedEntries', () => {
  beforeEach(() => {
    model = {};
    model.response = {
      question1: 'value1',
      question2: 'value2',
      question3: false
    };
    model.immutableImportedData = {
      question1: 'value1',
      question2: 'value2',
      question4: '',
      question5: null
    };
    model.usePreviousSED = true;
  });

  test('returns false if responseValue is undefined and immutableImportedDataValue is empty', () => {
    const question = { key: 'question1' };
    expect(PreviewDetailsTable.methods.displayChangedEntries(question, model)).to.be.false;
  });

  test('returns true if responseValue is different from immutableImportedDataValue', () => {
    const question = { key: 'question1' };
    model.immutableImportedData.question1 = 'differentValue';
    expect(PreviewDetailsTable.methods.displayChangedEntries(question, model)).to.be.true;
  });

  test('returns false if usePreviousSED is false', () => {
    const question = { key: 'question1' };
    model.usePreviousSED = false;
    expect(PreviewDetailsTable.methods.displayChangedEntries(question, model)).to.be.false;
  });

  test('returns false if key should not be displayed due to displayIf/displayNotIf', () => {
    const question = {
      key: 'question1',
      displayIf: ["question3"]
    };
    model.usePreviousSED = false;
    expect(PreviewDetailsTable.methods.displayChangedEntries(question, model)).to.be.false;
  });

  test('returns false if key imported value is empty and undefined in response', () => {
    const question = { key: 'question4' };
    model.usePreviousSED = false;
    expect(PreviewDetailsTable.methods.displayChangedEntries(question, model)).to.be.false;
  });
  test('returns false if key imported value is null and undefined in response', () => {
    const question = { key: 'question5' };
    model.usePreviousSED = false;
    expect(PreviewDetailsTable.methods.displayChangedEntries(question, model)).to.be.false;
  });
});

describe('displayOnlySectionsWithChangedValues', () => {
  beforeEach(() => {
    model = {};
    model.usePreviousSED = true;
    model.schemaForm = [
      {
        key: "test_ip1",
        category: "category1",
        isValid: true
      },
      {
        key: "test_ip2",
        category: "category2",
        isValid: false
      }
    ];
    model.response = {
      "test_ip2": "newValue",
      "test_ip1": "value"
    }
    model.immutableImportedData = {
      "test_ip2": "oldValue",
      "test_ip1": "value"
    }
  });
  test('returns true if usePreviousSED is true and at least one question in a section has changed values', () => {
    const section = { shortName: 'category2' };
    expect(PreviewDetailsTable.methods.displayOnlySectionsWithChangedValues(section)).to.be.true;
  });

  test('returns false if usePreviousSED is true and no question in a section has changed values', () => {
    const section = { shortName: 'category1' };
    expect(PreviewDetailsTable.methods.displayOnlySectionsWithChangedValues(section)).to.be.false;
  });

  test('returns false if usePreviousSED is false', () => {
    const section = { shortName: 'category1' };
    model.usePreviousSED = false;
    expect(PreviewDetailsTable.methods.displayOnlySectionsWithChangedValues(section)).to.be.false;
  });
});