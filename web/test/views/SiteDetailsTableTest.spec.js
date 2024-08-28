import { expect } from "vitest";
import SiteDetailsTable from "../../src/views/SiteDetailsTable.vue";
import model from "../../src/model";
import { mount } from '@vue/test-utils';

describe('SiteDetailsEntry', () => {

    test('All fields populated correctly', () => {

        model = {
            selectedProduct: { name: "Physical ENM", shortName: "pENM" },
            dataTypeCategories: [{name: "Test", shortName: "testCategory"}],
            response: {
                enable_fallback: true,
                enable_fallback_category: true,
                testField: "test_value",
                testIpExcludedField: "10.59.132.1",
                testDuplicateField: "test_duplicate_value",
                db_node3_iloUsername: "test_validation_username",
                db_node3_iloUsername_test_validation: "test_validation_username",
                testIpExcludedFieldNotInResponse: "testIpExcludedFieldNotInResponseValue"
            },
            displayKeys: {
                testKey: "test_value"
            },
            schemaForm: [
                {
                    displayIf: ["enable_fallback", "enable_fallback_category"]
                },
                {
                    category: "testCategory",
                    displayName: "The username for HP iLO for DB 3",
                    errorMessage: "",
                    example: "root",
                    inIPExclusionList: false,
                    isDuplicate: false,
                    isMatching: true,
                    isPassword: false,
                    isValid: true,
                    key: "db_node3_iloUsername",
                    preventDuplicates: "",
                    required: true,
                    type: "string",
                    validationMessage: "This can be any string.",
                    validationPattern: "^.+$"
                },
                {
                    category: "testCategory",
                    displayName: "The username for HP iLO for DB 3",
                    errorMessage: "",
                    example: "root",
                    inIPExclusionList: false,
                    isDuplicate: false,
                    isMatching: true,
                    isPassword: false,
                    isValid: true,
                    key: "db_node3_iloUsername_test_validation",
                    preventDuplicates: "",
                    required: true,
                    type: "string",
                    validationMessage: "This can be any string.",
                    validationPattern: "^.+$",
                    valueMatchesKey: "db_node3_iloUsername"
                },
                {
                    category: "testCategory",
                    displayName: "The username for HP iLO for DB 3",
                    errorMessage: "",
                    example: "root",
                    inIPExclusionList: false,
                    isDuplicate: false,
                    isMatching: true,
                    isPassword: false,
                    isValid: true,
                    key: "testIpExcludedField",
                    preventDuplicates: "",
                    required: true,
                    type: "string",
                    validationMessage: "This can be any string.",
                    validationPattern: "^.+$",
                },
                {
                    category: "testCategory",
                    displayName: "The username for HP iLO for DB 3",
                    errorMessage: "",
                    example: "root",
                    inIPExclusionList: false,
                    isDuplicate: false,
                    isMatching: true,
                    isPassword: false,
                    isValid: true,
                    key: "testIpExcludedFieldNotInResponse",
                    preventDuplicates: "",
                    required: true,
                    type: "string",
                    validationMessage: "This can be any string.",
                    validationPattern: "^.+$",
                },
                {
                    category: "testCategory",
                    displayName: "The username for HP iLO for DB 3",
                    errorMessage: "",
                    example: "root",
                    inIPExclusionList: false,
                    isDuplicate: false,
                    isMatching: true,
                    isPassword: false,
                    isValid: true,
                    key: "testIpExcludedFieldNotInResponseUpdated",
                    preventDuplicates: "",
                    required: false,
                    type: "string",
                    validationMessage: "This can be any string.",
                    validationPattern: "^.+$",
                }
            ],
            excludeIps: [{
                ipAddress: "10.59.132.2",
                ipDescription: "",
                isDuplicate: false,
                errorMessage: false
            }],
            selectedUseCase: {
                name: "Install"
            },
            wizardCurrentStep: 0,
            usedIpAddresses: [
              "10.59.132.2"
            ]
        };

        const wrapper = mount(SiteDetailsTable, {
             propsData: {
                 category: model.dataTypeCategories[0],
            },
        });

        wrapper.vm.allFieldsPopulatedCorrectly(model);
        expect(model.isIncomplete).toEqual(false);
    });

    test('All fields populated correctly false', () => {

        model = {
            selectedProduct: { name: "Physical ENM", shortName: "pENM" },
            dataTypeCategories: [{name: "Test", shortName: "testCategory"}],
            response: {
                enable_fallback: true,
                enable_fallback_category: true,
                testField: "test_value",
                testIpExcludedField: "10.59.132.1",
                test_duplicate: "test_validation_username_not_match",
                db_node3_iloUsername: "test_validation_username_not_match",
                db_node3_iloUsername_test_validation: "test_validation_username",
                testIpExcludedFieldNotInResponse: "testIpExcludedFieldNotInResponseValue",
                test_validation: "test_validation_longer_than_two_string",
                test_empty_required: ""
            },
            displayKeys: {
                testKey: "test_value"
            },
            schemaForm: [
                {
                    displayIf: ["enable_fallback", "enable_fallback_category"]
                },
                {
                    category: "testCategory",
                    displayName: "The username for HP iLO for DB 3",
                    errorMessage: "",
                    example: "root",
                    inIPExclusionList: false,
                    isDuplicate: false,
                    isMatching: true,
                    isPassword: false,
                    isValid: true,
                    key: "test_duplicate",
                    preventDuplicates: true,
                    required: true,
                    type: "string",
                    validationMessage: "This can be any string.",
                    validationPattern: "^.+$"
                },
                {
                    category: "testCategory",
                    displayName: "The username for HP iLO for DB 3",
                    errorMessage: "",
                    example: "root",
                    inIPExclusionList: false,
                    isDuplicate: false,
                    isMatching: true,
                    isPassword: false,
                    isValid: true,
                    key: "db_node3_iloUsername",
                    preventDuplicates: true,
                    required: true,
                    type: "string",
                    validationMessage: "This can be any string.",
                    validationPattern: "^.+$",
                    valueMatchesKey: "db_node3_iloUsername_test_validation"
                },
                {
                    category: "testCategory",
                    displayName: "The username for HP iLO for DB 3",
                    errorMessage: "",
                    example: "root",
                    inIPExclusionList: false,
                    isDuplicate: false,
                    isMatching: true,
                    isPassword: false,
                    isValid: true,
                    key: "db_node3_iloUsername_test_validation",
                    preventDuplicates: "",
                    required: true,
                    type: "string",
                    validationMessage: "This can be any string.",
                    validationPattern: "^.+$",
                    valueMatchesKey: "db_node3_iloUsername"
                },
                {
                    category: "testCategory",
                    displayName: "The username for HP iLO for DB 3",
                    errorMessage: "",
                    example: "root",
                    inIPExclusionList: false,
                    isDuplicate: false,
                    isMatching: true,
                    isPassword: false,
                    isValid: true,
                    key: "testIpExcludedField",
                    preventDuplicates: "",
                    required: true,
                    type: "string",
                    validationMessage: "This can be any string.",
                    validationPattern: "^.+$",
                },
                {
                    category: "testCategory",
                    displayName: "The username for HP iLO for DB 3",
                    errorMessage: "",
                    example: "root",
                    inIPExclusionList: false,
                    isDuplicate: false,
                    isMatching: true,
                    isPassword: false,
                    isValid: true,
                    key: "testFieldNotInResponse",
                    preventDuplicates: "",
                    required: true,
                    type: "string",
                    validationMessage: "This can be any string.",
                    validationPattern: "^.+$",
                },
                {
                    category: "testCategory",
                    displayName: "The username for HP iLO for DB 3",
                    errorMessage: "",
                    example: "root",
                    inIPExclusionList: false,
                    isDuplicate: false,
                    isMatching: true,
                    isPassword: false,
                    isValid: true,
                    key: "test_validation",
                    preventDuplicates: true,
                    required: true,
                    type: "string",
                    validationMessage: "This can be any string.",
                    validationPattern: "^[a-zA-Z0-9]{1,2}$"
                },
                {
                    category: "testCategory",
                    isValid: true,
                    key: "displayMeChild",
                    required: false,
                    type: "string",
                    displayIf: ["displayMe"]
                },
                {
                    category: "testCategory",
                    isValid: true,
                    key: "displayMe",
                    required: false,
                    type: "select",
                }
            ],
            excludeIps: [{
                ipAddress: "10.59.132.2",
                ipDescription: "",
                isDuplicate: false,
                errorMessage: false
            }],
            selectedUseCase: {
                name: "Install"
            },
            wizardCurrentStep: 0,
            usedIpAddresses: [
              "10.59.132.2"
            ]
        };

        const wrapper = mount(SiteDetailsTable, {
             propsData: {
                 category: model.dataTypeCategories[0],
            },
        });
        model.response["displayMe"] = false
        model.response["displayMeChild"] = "hello"
        model.response["testIpExcludedField"] = "10.59.132.2"
        model.response["testDuplicateField"] = "test_value"
        model.schemaForm[2].preventDuplicates = true
        model.schemaForm[2].validationPattern = "^.+$"
        wrapper.vm.allFieldsPopulatedCorrectly(model)

        model.schemaForm.filter(dict => {
            if (dict.key === "testIpExcludedField") {
                expect(dict.inIPExclusionList).toEqual(true)
            }
        })

        model.schemaForm.filter(dict => {
            if (dict.key === "testFieldNotInResponse"){
                expect(dict.isValid).toEqual(false)
            }
        })
        model.schemaForm.filter(dict => {
            if (dict.key === "test_empty_required"){
                expect(dict.isValid).toEqual(false)
            }
        })

        model.schemaForm.filter(dict => {
            if (dict.key === "db_node3_iloUsername"){
                expect(dict.isDuplicate).toEqual(true)
                expect(dict.isValid).toEqual(false)
            }
        })

        model.schemaForm.filter(dict => {
            if (dict.key === "db_node3_iloUsername_test_validation"){
                expect(dict.isMatching).toEqual(false)
                expect(dict.isValid).toEqual(false)
            }
        })

        model.schemaForm.filter(dict => {
            if (dict.key === "test_validation"){
                expect(dict.isValid).toEqual(false)
            }
        })

        wrapper.vm.allFieldsPopulatedCorrectly(model);
        expect(model.isIncomplete).to.be.true;
        expect(model.response["displayMeChild"]).to.be.undefined;
    });

    test('All fields populated correctly complex objects', () => {
        model = {
            selectedProduct: { name: "Physical ENM", shortName: "pENM" },
            dataTypeCategories: [{name: "Test", shortName: "testCategory"}],
            response: {
                someToleration: [{ key: 'key1', operator: 'Equal', effect: 'NoSchedule'}, { key: 'key2', operator: 'Equal', effect: 'NoSchedule'}],
                someArray: ["one", "two", "three"]
            },
            schemaForm: [
                {
                    category: "testCategory",
                    key: "toleration",
                    required: true,
                    type: "kubernetesToleration",
                    validationPattern: "^.+$",
                    tolerationInfo: {
                        key: {
                            type: 'string',
                            validationPattern: "^.+$",
                            required: true
                        },
                        operator: {
                            type: 'string',
                            validationPattern: "^.+$",
                        },
                        effect: {
                            type: 'string',
                            validationPattern: "^.+$",
                        },
                    }
                },
                {
                    category: "testCategory",
                    key: "someArray",
                    required: true,
                    type: "array",
                    validationPattern: "^.+$"
                },
                {
                    category: "testCategory",
                    key: "someObject",
                    type: "object"
                }
            ],
            selectedUseCase: {
                name: "Install"
            },
            wizardCurrentStep: 0,
        };

        const wrapper = mount(SiteDetailsTable, {
            propsData: {
                category: model.dataTypeCategories[0],
            },
        });

        wrapper.vm.allFieldsPopulatedCorrectly(model)
        expect(model.isIncomplete).to.be.false;
    });

    test('Fields populated incorrectly complex objects', () => {
        model = {
            selectedProduct: { name: "Physical ENM", shortName: "pENM" },
            dataTypeCategories: [{name: "Test", shortName: "testCategory"}],
            response: {
                someToleration: [{ operator: 'Equal', effect: 'NoSchedule'}],
                someArray: ["notString"]
            },
            schemaForm: [
                {
                    category: "testCategory",
                    key: "someToleration",
                    required: true,
                    type: "kubernetesToleration",
                    validationPattern: "^.+$",
                    tolerationInfo: {
                        key: {
                            type: 'string',
                            validationPattern: "^.+$",
                            required: true
                        },
                        operator: {
                            type: 'string',
                            validationPattern: "^.+$",
                        },
                        effect: {
                            type: 'string',
                            validationPattern: "^.+$",
                        },
                    }
                },
                {
                    category: "testCategory",
                    key: "someArray",
                    required: true,
                    type: "array",
                    validationPattern: "^string.+$"
                }
            ],
            selectedUseCase: {
                name: "Install"
            },
            wizardCurrentStep: 0,
        };

        const wrapper = mount(SiteDetailsTable, {
            propsData: {
                category: model.dataTypeCategories[0],
            },
        });

        wrapper.vm.allFieldsPopulatedCorrectly(model)
        expect(model.isIncomplete).to.be.true;
    });
});