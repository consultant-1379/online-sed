
import { expect } from "vitest";
import SiteDetailEntry from "../../src/components/SiteDetailEntry.vue";
import model from "../../src/model";
import { mount } from '@vue/test-utils';


describe('SiteDetailsEntry', () => {

    beforeEach(() => {
        model = {
            selectedUseCase: { name: "Upgrade"},
            selectedProduct: { name: "Physical ENM", shortName: "pENM" },
            dataTypeCategories: [{name: "Test", shortName: "test_category", id: 0}],
            wizardCurrentStep: 0,
            response: {
                enable_fallback: "true",
                enable_fallback_category: "true",
                test_empty_key: "",
                ip_address: "10.59.132.1",
                used_ip_address: "10.59.132.1",
                not_used_ip_address: "10.59.132.2"
            },
            displayKeys: [
                "enable_fallback",
                "enable_fallback_category"
            ],
            schemaForm: [
                {
                    displayIf: ["enable_fallback", "enable_fallback_category"],
                    key: "enable_fallback_category",
                    required: "false"
                },
                {
                    key: "some_password",
                    required: "false",
                    type: "password"
                },
                {
                    key: 'key',
                    type: 'nodeSelector',
                    format: 'nodeSelector',
                    isValid: null
                }
            ],
            loadedSchema: {
              properties: {
                parameters: {
                  properties: {
                    enable_fallback_category: {
                      optional: "true",
                      keys: "global.enable-fallback-category"
                    }
                  }
                }
              }
            }
        };
    });

    test('Set optional keys require value', () => {
        const wrapper = mount(SiteDetailEntry, {
             propsData: {
                 category: model.dataTypeCategories[0],
            },
        });

        expect(wrapper.vm.model.response["enable_fallback_category"]).toEqual("true");
        expect(wrapper.vm.model.loadedSchema.properties.parameters.properties["enable_fallback_category"]["optional"]).toEqual("true");

        wrapper.vm.selectEnum("enable_fallback_category", {name: "false"});
        expect(wrapper.vm.model.response["enable_fallback_category"]).toEqual("false");
        expect(wrapper.vm.model.loadedSchema.properties.parameters.properties["enable_fallback_category"]["optional"]).toEqual(true);

        wrapper.vm.selectEnum("enable_fallback_category", {name: "true"});
        expect(wrapper.vm.model.loadedSchema.properties.parameters.properties["enable_fallback_category"]["optional"]).toEqual(false);

    });

    test('Is used in from state', () => {
        const wrapper = mount(SiteDetailEntry, {
             propsData: {
                 category: model.dataTypeCategories[0],
            },
        });
        var test_used_ip_addresses = wrapper.vm.isUsedInFromState({key: "used_ip_address"})
        expect(test_used_ip_addresses).toEqual(false);

        var test_not_used_ip_addresses = wrapper.vm.isUsedInFromState({key: "not_used_ip_address"})
        expect(test_not_used_ip_addresses).toEqual(true);
    });

    test('Show password', () => {
        const wrapper = mount(SiteDetailEntry, {
             propsData: {
                 category: model.dataTypeCategories[0],
            },
        });
        wrapper.vm.showPassword(wrapper.vm.model.schemaForm[1])
        expect(wrapper.vm.model.schemaForm[1].type).toEqual("string");

        wrapper.vm.showPassword(wrapper.vm.model.schemaForm[1])
        expect(wrapper.vm.model.schemaForm[1].type).toEqual("password");
    });

    test('Show entry dialog currentQuestion assigned correctly', () => {
        var question = {
            key:"key",
            type : "nodeSelector",
            format : "nodeSelector",
            nodeSelectorInfo : {
                key: {
                    "description": "This must be any string, at least one character with no spaces.",
                    "errorMessage": "This can be any string with at least one character and no space is allowed.",
                    "validationPattern": "^[^\\s]*$"
                },
                value: {
                    "description": "This must be any string, at least one character with no spaces.",
                    "errorMessage": "This can be any string with at least one character and no space is allowed.",
                    "validationPattern": "^[^\\s]*$"
                }
            }
        };
        const wrapper = mount(SiteDetailEntry, {
            propsData: {
                category: model.dataTypeCategories[0],
           },
       });
       wrapper.vm.displayEntryDialog(question);
       expect(wrapper.vm.model.currentQuestion).toEqual(question);
    });

    test('Test getDefaultValue - key value is true', () => {
        const wrapper = mount(SiteDetailEntry, {
            propsData: {
                category: model.dataTypeCategories[0],
            },
        });
        model.response = {
            true_key: "true"
        }
        let value = wrapper.vm.getDefaultValue({key: "true_key"})
        expect(value).toEqual("true");
        expect(model.response["true_key"]).toEqual("true")
    });

    test('Test getDefaultValue - key value is false', () => {
        const wrapper = mount(SiteDetailEntry, {
            propsData: {
                category: model.dataTypeCategories[0],
            },
        });
        model.response = {
            false_key: "false"
        };
        let value = wrapper.vm.getDefaultValue({key: "false_key"})
        expect(value).toEqual("false");
        expect(model.response["false_key"]).toEqual("false")
    });

    test('Test getDefaultValue - key value is true when undefined and default is set', () => {
        const wrapper = mount(SiteDetailEntry, {
            propsData: {
                category: model.dataTypeCategories[0],
            },
        });
        model.response = {
            new_key: undefined
        };
        let value = wrapper.vm.getDefaultValue({key: "new_key", defaultValue: "true"})
        expect(value).toEqual("true");
        expect(model.response["new_key"]).toEqual("true")
    });

    test('Test getDefaultValue - key value is true even if default is false', () => {
        const wrapper = mount(SiteDetailEntry, {
            propsData: {
                category: model.dataTypeCategories[0],
            },
        });
        model.response = {
            true_key: "true"
        };
        let value = wrapper.vm.getDefaultValue({key: "true_key", defaultValue: "false"})
        expect(value).toEqual("true");
        expect(model.response["true_key"]).toEqual("true")
    });

    test('Test getDefaultValue - key undefined returns ""', () => {
        const wrapper = mount(SiteDetailEntry, {
            propsData: {
                category: model.dataTypeCategories[0],
            },
        });
        model.response = {
            new_key: undefined
        };
        let value = wrapper.vm.getDefaultValue({key: "new_key"})
        expect(value).toEqual("");
        expect(model.response["new_key"]).to.be.undefined;
    });

    test('Test getDefaultValue - not existing key returns ""', () => {
        const wrapper = mount(SiteDetailEntry, {
            propsData: {
                category: model.dataTypeCategories[0],
            },
        });
        model.response = {};
        let value = wrapper.vm.getDefaultValue({key: "new_key"})
        expect(value).toEqual("");
        expect(model.response["new_key"]).to.be.undefined;
    });

    test('Test getDefaultValue - not existing key returns default value', () => {
        const wrapper = mount(SiteDetailEntry, {
            propsData: {
                category: model.dataTypeCategories[0],
            },
        });
        model.response = {};
        let value = wrapper.vm.getDefaultValue({key: "new_key", defaultValue: "false"})
        expect(value).toEqual("false");
        expect(model.response["new_key"]).toEqual("false")
    });

    test('Test tooltip values', () => {
        const wrapper = mount(SiteDetailEntry, {
            propsData: {
                category: model.dataTypeCategories[0],
            },
        });
        expect(wrapper.vm.model.loadedSchema.properties.parameters.properties["enable_fallback_category"]["keys"]).toEqual("global.enable-fallback-category");
    });

    test('Test immutableKeyAndValueMissing during upgrade true', () => {
        const question = {
            key: 'select_dropdown',
            immutable: true,
            isValid: false
        }
        const wrapper = mount(SiteDetailEntry, {
          propsData: {
              category: model.dataTypeCategories[0],
          }
        });
        expect(wrapper.vm.immutableKeyAndValueMissing(question)).to.be.true;
    });

    test('Test immutableKeyAndValueMissing during upgrade false', () => {
        const question = {
            key: 'select_dropdown',
            immutable: true,
            isValid: true
        }
        const wrapper = mount(SiteDetailEntry, {
            propsData: {
                category: model.dataTypeCategories[0],
            }
        });
        expect(wrapper.vm.immutableKeyAndValueMissing(question)).to.be.false;
    });

    test('Test immutableKeyAndValueMissing question is mutable', () => {
        model.selectedUseCase.name === 'install';
        const question = {
            key: 'select_dropdown',
            immutable: false,
            isValid: false
        }
        const wrapper = mount(SiteDetailEntry, {
            propsData: {
                category: model.dataTypeCategories[0],
            }
        });
        expect(wrapper.vm.immutableKeyAndValueMissing(question)).to.be.false;
    });
});
