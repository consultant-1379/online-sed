
import { expect } from "vitest";
import AutoPopulateEntry from "../../src/components/AutoPopulateEntry.vue";
import model, {checkFieldAutopopulationRequired} from "../../src/model";
import { mount } from '@vue/test-utils';

describe('IPAddressAutopopulateEntry', () => {
    const startIP = "1.1.1.1";
    const invalidIP = "invalid";
    const notEnoughIPs = "1.1.1.1";
    const endIP = "1.1.1.5";
    const startIP_ipv6 = "2000:0000:0000:0000:0000:0000:0000:0001/64";
    const endIP_ipv6 = "2000:0000:0000:0000:0000:0000:0000:0100/64";
    const invalidSubnet = "1.1.3.1";

    beforeEach(() => {
        model = {};
         model.autopopulatedValuesStillRequired = {
            'Backup': 0,
            'Internal': 0
        }
        model.autoPopulationTypes = [
            { name: "test", shortName: "test", sedSubnetKey: "test_subnet" }
        ];
        model.selectedProduct = { name: "Physical ENM", shortName: "pENM" };
        model.dataTypeCategories = [{name: "Test", shortName: "test_category"}];
        model.response = {
            test_subnet: "1.1.1.0/24",
            testDisplayIfKey: 'true'
        };
        model.schemaForm = [
            {
                key: "test_ipaddress_start",
                displayName: "test_start",
                type: "string",
                validationMessage: "ipv4",
                validationPattern: "^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$",

            },
            {
                key: "test_ipaddress_end",
                displayName: "test_end",
                type: "string",
                validationMessage: "ipv4",
                validationPattern: "^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$",
                errorMessage: "Input must follow the IPv4 format and can only contain the following characters: 0-9 and ."
            },
            {
                key: "test_ip1",
                displayName: "test1",
                type: "string",
                category: "notSet",
                validationMessage: "ipv4",
                validationPattern: "^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$",
                autoPopulate: "test",
                preventDuplicates: true,
                required: 'true'
            },
            {
                key: "test_ip2",
                displayName: "test1",
                type: "string",
                validationMessage: "ipv4",
                validationPattern: "^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$",
                autoPopulate: "test",
                preventDuplicates: true,
                required: 'true'
            },
            {
                key: "test_subnet",
                displayName: "test1",
                type: "string",
                category: "test_category",
                validationMessage: "ipv4_cidr",
                validationPattern: "^(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)(\\.(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)){3}/(3[0-2]|[1-2]?[0-9])$",
            },
            {
                key: "test_ipv6_ipaddress_start",
                displayName: "test_start",
                type: "string",
                validationMessage: "ipv6_cidr",
                validationPattern: "^\\s*((?:(?:(?:[0-9A-Fa-f]{1,4}:){7}(?:[0-9A-Fa-f]{1,4}|:))|(?:(?:[0-9A-Fa-f]{1,4}:){6}(?::[0-9A-Fa-f]{1,4}|(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(?:(?:[0-9A-Fa-f]{1,4}:){5}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(?:(?:[0-9A-Fa-f]{1,4}:){4}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,3})|(?:(?::[0-9A-Fa-f]{1,4})?:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){3}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,4})|(?:(?::[0-9A-Fa-f]{1,4}){0,2}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){2}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,5})|(?:(?::[0-9A-Fa-f]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){1}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,6})|(?:(?::[0-9A-Fa-f]{1,4}){0,4}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?::(?:(?:(?::[0-9A-Fa-f]{1,4}){1,7})|(?:(?::[0-9A-Fa-f]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:)))(?:%.+)?)\\/(6[0-4]|[3-5][0-9]|2[4-9])$",
            },
            {
                key: "test_ipv6_ipaddress_end",
                displayName: "test_end",
                type: "string",
                validationMessage: "ipv6_cidr",
                validationPattern: "^\\s*((?:(?:(?:[0-9A-Fa-f]{1,4}:){7}(?:[0-9A-Fa-f]{1,4}|:))|(?:(?:[0-9A-Fa-f]{1,4}:){6}(?::[0-9A-Fa-f]{1,4}|(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(?:(?:[0-9A-Fa-f]{1,4}:){5}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(?:(?:[0-9A-Fa-f]{1,4}:){4}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,3})|(?:(?::[0-9A-Fa-f]{1,4})?:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){3}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,4})|(?:(?::[0-9A-Fa-f]{1,4}){0,2}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){2}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,5})|(?:(?::[0-9A-Fa-f]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){1}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,6})|(?:(?::[0-9A-Fa-f]{1,4}){0,4}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?::(?:(?:(?::[0-9A-Fa-f]{1,4}){1,7})|(?:(?::[0-9A-Fa-f]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:)))(?:%.+)?)\\/(6[0-4]|[3-5][0-9]|2[4-9])$",
            },
            {
                key: "test_ipv6_ip1",
                displayName: "test1",
                type: "string",
                category: "notSet",
                validationMessage: "ipv6",
                validationPattern: "^\\s*((?:(?:(?:[0-9A-Fa-f]{1,4}:){7}(?:[0-9A-Fa-f]{1,4}|:))|(?:(?:[0-9A-Fa-f]{1,4}:){6}(?::[0-9A-Fa-f]{1,4}|(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(?:(?:[0-9A-Fa-f]{1,4}:){5}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(?:(?:[0-9A-Fa-f]{1,4}:){4}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,3})|(?:(?::[0-9A-Fa-f]{1,4})?:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){3}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,4})|(?:(?::[0-9A-Fa-f]{1,4}){0,2}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){2}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,5})|(?:(?::[0-9A-Fa-f]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){1}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,6})|(?:(?::[0-9A-Fa-f]{1,4}){0,4}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?::(?:(?:(?::[0-9A-Fa-f]{1,4}){1,7})|(?:(?::[0-9A-Fa-f]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:)))(?:%.+)?)\\/(6[0-4]|[3-5][0-9]|2[4-9])$",
                autoPopulate: "test_ipv6",
                preventDuplicates: true
            },
            {
                key: "test_ipv6_ip2",
                displayName: "test1",
                type: "string",
                validationMessage: "ipv6",
                validationPattern: "^\\s*((?:(?:(?:[0-9A-Fa-f]{1,4}:){7}(?:[0-9A-Fa-f]{1,4}|:))|(?:(?:[0-9A-Fa-f]{1,4}:){6}(?::[0-9A-Fa-f]{1,4}|(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(?:(?:[0-9A-Fa-f]{1,4}:){5}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(?:(?:[0-9A-Fa-f]{1,4}:){4}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,3})|(?:(?::[0-9A-Fa-f]{1,4})?:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){3}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,4})|(?:(?::[0-9A-Fa-f]{1,4}){0,2}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){2}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,5})|(?:(?::[0-9A-Fa-f]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){1}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,6})|(?:(?::[0-9A-Fa-f]{1,4}){0,4}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?::(?:(?:(?::[0-9A-Fa-f]{1,4}){1,7})|(?:(?::[0-9A-Fa-f]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:)))(?:%.+)?)\\/(6[0-4]|[3-5][0-9]|2[4-9])$",
                autoPopulate: "test_ipv6",
                preventDuplicates: true
            },
            {
                key: "test_ipv6_subnet",
                displayName: "test2",
                type: "string",
                category: "test_category",
                validationMessage: "ipv6_cidr",
                validationPattern: "^\\s*((?:(?:(?:[0-9A-Fa-f]{1,4}:){7}(?:[0-9A-Fa-f]{1,4}|:))|(?:(?:[0-9A-Fa-f]{1,4}:){6}(?::[0-9A-Fa-f]{1,4}|(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(?:(?:[0-9A-Fa-f]{1,4}:){5}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(?:(?:[0-9A-Fa-f]{1,4}:){4}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,3})|(?:(?::[0-9A-Fa-f]{1,4})?:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){3}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,4})|(?:(?::[0-9A-Fa-f]{1,4}){0,2}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){2}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,5})|(?:(?::[0-9A-Fa-f]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){1}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,6})|(?:(?::[0-9A-Fa-f]{1,4}){0,4}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?::(?:(?:(?::[0-9A-Fa-f]{1,4}){1,7})|(?:(?::[0-9A-Fa-f]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:)))(?:%.+)?)\\/(6[0-4]|[3-5][0-9]|2[4-9])$",
            },
            {
                key: "test_ip1_displayIf",
                displayName: "test1",
                type: "string",
                category: "notSet",
                validationMessage: "ipv4",
                validationPattern: "^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$",
                displayIf: ["testDisplayIfKey"],
                required: 'false',
                autoPopulate: "test"
            },
        ];
        model.usedIpAddresses = ["10.10.10.11", "fd5b:1fd5:8295:5340:0000:0000:0000:0010", "2001:1b70:82a1:0380:0000:0000:0000:003F/64"];
    });

    test('Should disable autopopulate button when input is invalid', () => {
        const wrapper = mount(AutoPopulateEntry, {
            propsData: {
                autoPopulationType: model.autoPopulationTypes[0],
            },
        });
        wrapper.find('#test_ipaddress_start_input').setValue(startIP);
        wrapper.find('#test_ipaddress_end_input').setValue(invalidIP);
        const button = wrapper.find('#autopopulate_button');
        button.isDisabled = (wrapper.vm.validateIPAddressInput("start", model.autoPopulationTypes[0], model) != "" 
        || wrapper.vm.validateIPAddressInput("end", model.autoPopulationTypes[0], model) != ""
        || wrapper.vm.checkEnoughIPsAvailable(model.autoPopulationTypes[0], model) <= 0);
        expect(button.isDisabled).toEqual(true);
        expect(wrapper.vm.validateIPAddressInput("end", model.autoPopulationTypes[0], model)).toEqual("Input must follow the IPv4 format and can only contain the following characters: 0-9 and .");
    });

    test('Should disable autopopulate button when input subnet is invalid', () => {
        const wrapper = mount(AutoPopulateEntry, {
            propsData: {
                autoPopulationType: model.autoPopulationTypes[0],
            },
        });

        wrapper.find('#test_ipaddress_start_input').setValue(startIP);
        wrapper.find('#test_ipaddress_end_input').setValue(invalidSubnet);
        const button = wrapper.find('#autopopulate_button');
        button.isDisabled = (wrapper.vm.validateIPAddressInput("start", model.autoPopulationTypes[0], model) != "" 
        || wrapper.vm.validateIPAddressInput("end", model.autoPopulationTypes[0], model) != ""
        || wrapper.vm.checkEnoughIPsAvailable(model.autoPopulationTypes[0], model) <= 0);
        expect(button.isDisabled).toEqual(true);
        expect(wrapper.vm.validateIPAddressInput("end", model.autoPopulationTypes[0], model)).toEqual("IP Address on incorrect subnet");
    });

    test('Should disable autopopulate button when input is empty', () => {
        const wrapper = mount(AutoPopulateEntry, {
            propsData: {
                autoPopulationType: model.autoPopulationTypes[0],
            },
        });

        wrapper.find('#test_ipaddress_start_input').setValue("");
        wrapper.find('#test_ipaddress_end_input').setValue("");
        const button = wrapper.find('#autopopulate_button');
        button.isDisabled = (wrapper.vm.validateIPAddressInput("start", model.autoPopulationTypes[0], model) != "" 
        || wrapper.vm.validateIPAddressInput("end", model.autoPopulationTypes[0], model) != ""
        || wrapper.vm.checkEnoughIPsAvailable(model.autoPopulationTypes[0], model) <= 0);
        expect(button.isDisabled).toEqual(true);
        expect(wrapper.vm.validateIPAddressInput("start", model.autoPopulationTypes[0], model)).toEqual(" ");
    });

    test('Should enable autopopulate button when ipv4 input is valid', () => {
        const wrapper = mount(AutoPopulateEntry, {
            propsData: {
                autoPopulationType: model.autoPopulationTypes[0],
            },
        });

        wrapper.find('#test_ipaddress_start_input').setValue(startIP);
        wrapper.find('#test_ipaddress_end_input').setValue(endIP);
        const button = wrapper.find('#autopopulate_button');
        button.isDisabled = (wrapper.vm.validateIPAddressInput("start", model.autoPopulationTypes[0], model) != "" 
        || wrapper.vm.validateIPAddressInput("end", model.autoPopulationTypes[0], model) != ""
        || wrapper.vm.checkEnoughIPsAvailable(model.autoPopulationTypes[0], model) <= 0);
        expect(wrapper.vm.getRemainingRequiredIPAddresses(model.autoPopulationTypes[0], model)).to.equal(3);
        expect(button.isDisabled).toEqual(false);
    });

    test('Should autopopulate when ipv6 input is valid', () => {
        model.autoPopulationTypes = [
            { name: "test_ipv6", shortName: "test_ipv6",  sedSubnetKey: "test_ipv6_subnet" }
        ];
        const wrapper = mount(AutoPopulateEntry, {
            propsData: {
                autoPopulationType: model.autoPopulationTypes[0]
            },
        });
        model.response = {
            "test_ipv6_subnet": "2000::0000/64"
        };
        wrapper.find('#test_ipv6_ipaddress_start_input').setValue(startIP_ipv6);
        wrapper.find('#test_ipv6_ipaddress_end_input').setValue(endIP_ipv6);
        const button = wrapper.find('#autopopulate_button');
        button.isDisabled = (wrapper.vm.validateIPAddressInput("start", model.autoPopulationTypes[0], model) != ""
        || wrapper.vm.validateIPAddressInput("end", model.autoPopulationTypes[0], model) != ""
        || wrapper.vm.checkEnoughIPsAvailable(model.autoPopulationTypes[0], model) <= 0);
        expect(button.isDisabled).toEqual(false);
        const confirmSpy = vi.spyOn(wrapper.vm, 'checkIfConfirmNeeded')
        wrapper.vm.checkIfConfirmNeeded(model, model.autoPopulationTypes[0]);
        expect(confirmSpy).toBeCalled();
        expect(model.response["test_ipv6_subnet"]).toEqual("2000:0000:0000:0000:0000:0000:0000:0000/64");
    });

    test('Should autopopulate when ipv6 input is valid and with a tremendous range', () => {
        model.autoPopulationTypes = [
            { name: "test_ipv6", shortName: "test_ipv6",  sedSubnetKey: "test_ipv6_subnet" }
        ];
        const wrapper = mount(AutoPopulateEntry, {
            propsData: {
                autoPopulationType: model.autoPopulationTypes[0]
            },
        });
        model.response = {
            "test_ipv6_subnet": "2a01:cf84:22f:f801:0000:0000:0000:003/64"
        };
        wrapper.find('#test_ipv6_ipaddress_start_input').setValue("2a01:cf84:22f:f801:0000:0000:0000:003/64");
        wrapper.find('#test_ipv6_ipaddress_end_input').setValue("2a01:cf84:22f:f801:ffff:ffff:ffff:ffff/64");
        const button = wrapper.find('#autopopulate_button');
        button.isDisabled = (wrapper.vm.validateIPAddressInput("start", model.autoPopulationTypes[0], model) != ""
            || wrapper.vm.validateIPAddressInput("end", model.autoPopulationTypes[0], model) != ""
            || wrapper.vm.checkEnoughIPsAvailable(model.autoPopulationTypes[0], model) <= 0);
        expect(button.isDisabled).toEqual(false);
        const confirmSpy = vi.spyOn(wrapper.vm, 'checkIfConfirmNeeded')
        wrapper.vm.checkIfConfirmNeeded(model, model.autoPopulationTypes[0]);
        expect(confirmSpy).toBeCalled();
        expect(model.response["test_ipv6_subnet"]).toEqual("2a01:cf84:022f:f801:0000:0000:0000:003/64");
    });

    test('Should indicate user to populate subnet mask', async () => {
        model.autoPopulationTypes = [
            { name: "test_ipv6", shortName: "test_ipv6",  sedSubnetKey: "test_ipv6_subnet" }
        ];
        const wrapper = mount(AutoPopulateEntry, {
            propsData: {
                autoPopulationType: model.autoPopulationTypes[0]
            },
        });
        wrapper.find('#test_ipv6_ipaddress_start_input').setValue(startIP_ipv6);
        expect(wrapper.vm.validateIPAddressInput("start", model.autoPopulationTypes[0], model)).toEqual("Please populate the relevant subnet in the Test Category on the Site Details Page");
    });

    test('Should allow autopopulation if no subnetkey available', async () => {
        model.autoPopulationTypes = [
            { name: "test_ipv6", shortName: "test_ipv6" }
        ];
        const wrapper = mount(AutoPopulateEntry, {
            propsData: {
                autoPopulationType: model.autoPopulationTypes[0]
            },
        });
        wrapper.find('#test_ipv6_ipaddress_start_input').setValue(startIP_ipv6);
        wrapper.find('#test_ipv6_ipaddress_end_input').setValue(endIP_ipv6);
        const button = wrapper.find('#autopopulate_button');
        button.isDisabled = (wrapper.vm.validateIPAddressInput("start", model.autoPopulationTypes[0], model) != "" 
        || wrapper.vm.validateIPAddressInput("end", model.autoPopulationTypes[0], model) != ""
        || wrapper.vm.checkEnoughIPsAvailable(model.autoPopulationTypes[0], model) <= 0);
        expect(button.isDisabled).toEqual(false);
    });

    test('should allow autopopulation if insufficient addresses supplied', async () => {
        const wrapper = mount(AutoPopulateEntry, {
            propsData: {
                autoPopulationType: model.autoPopulationTypes[0],
            },
        });

        wrapper.find('#test_ipaddress_start_input').setValue(startIP);
        wrapper.find('#test_ipaddress_end_input').setValue(notEnoughIPs);
        const button = wrapper.find('#autopopulate_button');
        button.isDisabled(wrapper.vm.validateIPAddressInput("start", model.autoPopulationTypes[0], model) != "" 
        || wrapper.vm.validateIPAddressInput("end", model.autoPopulationTypes[0], model) != ""
        || wrapper.vm.checkEnoughIPsAvailable(model.autoPopulationTypes[0], model) <= 0);
        await button.trigger('click');
        await wrapper.vm.checkIfConfirmNeeded(model, model.autoPopulationTypes[0]);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.confirmPrompt).toEqual(true);
        await wrapper.vm.confirmAutopopulation(model, model.autoPopulationTypes[0]);
        expect(wrapper.vm.confirmPrompt).toEqual(false);
    });

    test('should deduct used IPv4s', async () => {
        const wrapper = mount(AutoPopulateEntry, {
            propsData: {
                autoPopulationType: model.autoPopulationTypes[0],
            },
        });

        wrapper.find('#test_ipaddress_start_input').setValue(startIP);
        wrapper.find('#test_ipaddress_end_input').setValue(notEnoughIPs);
        const button = wrapper.find('#autopopulate_button');
        button.isDisabled(wrapper.vm.validateIPAddressInput("start", model.autoPopulationTypes[0], model) != "" 
        || wrapper.vm.validateIPAddressInput("end", model.autoPopulationTypes[0], model) != ""
        || wrapper.vm.checkEnoughIPsAvailable(model.autoPopulationTypes[0], model) <= 0);
        await button.trigger('click');
        await wrapper.vm.checkIfConfirmNeeded(model, model.autoPopulationTypes[0]);
        await wrapper.vm.$nextTick();
        await wrapper.vm.confirmAutopopulation(model, model.autoPopulationTypes[0]);
        wrapper.find('#test_ipaddress_end_input').setValue("1.1.1.3");
        expect(wrapper.vm.checkEnoughIPsAvailable(model.autoPopulationTypes[0], model)).toEqual(2);
    });

    test('Should display next available IPv4', async () => {
        const wrapper = mount(AutoPopulateEntry, {
            propsData: {
                autoPopulationType: model.autoPopulationTypes[0]
            },
        });

        // checking if next available address is provided if value is set
        wrapper.find('#test_ipaddress_start_input').setValue("1.1.1.2");
        nextAvailableAddress = wrapper.vm.findNextAvailableAddress(model.response['test_ipaddress_start'], model.response['test_ipaddress_end'], model.autoPopulationTypes[0], model);
        expect(nextAvailableAddress).toEqual("1.1.1.2");

        // checking if next available address is incremented if start value is used
        model.response['test_ip1'] = "1.1.1.1";
        wrapper.find('#test_ipaddress_start_input').setValue("1.1.1.1");
        nextAvailableAddress = wrapper.vm.findNextAvailableAddress(model.response['test_ipaddress_start'], model.response['test_ipaddress_end'], model.autoPopulationTypes[0], model);
        expect(nextAvailableAddress).toEqual("1.1.1.2");

        // checking if 'none available' appears if no more addresses are left for the ip provided
        model.response['test_ip1'] = "1.1.1.254";
        model.response['test_ip2'] = "1.1.1.255";
        wrapper.find('#test_ipaddress_start_input').setValue("1.1.1.254");
        nextAvailableAddress = wrapper.vm.findNextAvailableAddress(model.response['test_ipaddress_start'], model.response['test_ipaddress_end'], model.autoPopulationTypes[0], model);
        expect(nextAvailableAddress).toEqual("None Available");

        // checking if 'none available in selected range' appears if no more addresses are left in range selected
        model.response['test_ip1'] = "1.1.1.1";
        model.response['test_ip2'] = "1.1.1.2";
        wrapper.find('#test_ipaddress_start_input').setValue("1.1.1.1");
        wrapper.find('#test_ipaddress_end_input').setValue("1.1.1.2");
        nextAvailableAddress = wrapper.vm.findNextAvailableAddress(model.response['test_ipaddress_start'], model.response['test_ipaddress_end'], model.autoPopulationTypes[0], model);
        expect(nextAvailableAddress).toEqual("None Available in Selected Range");

        // checking if next available address is provided if value is set and no subnet is provided
        model.response['test_subnet'] = undefined;
        wrapper.find('#test_ipaddress_start_input').setValue("1.1.1.4");
        var nextAvailableAddress = wrapper.vm.findNextAvailableAddress(model.response['test_ipaddress_start'], model.response['test_ipaddress_end'], model.autoPopulationTypes[0], model);
        expect(nextAvailableAddress).toEqual("");

    });

    test('Should display next available IPv6', async () => {
        model.autoPopulationTypes = [
            { name: "test_ipv6", shortName: "test_ipv6", sedSubnetKey:"test_ipv6_subnet" }
        ];
        const wrapper = mount(AutoPopulateEntry, {
            propsData: {
                autoPopulationType: model.autoPopulationTypes[0]
            },
        });
        model.response = {
            "test_ipv6_subnet": "2000:0000:0000:0000:0000:0000:0000:0000/64"
        };

        // checking if next available address is provided if value is set
        wrapper.find('#test_ipv6_ipaddress_start_input').setValue("2000:0000:0000:0000:0000:0000:0000:0001/64");
        nextAvailableAddress = wrapper.vm.findNextAvailableAddress(model.response['test_ipv6_ipaddress_start'], model.response['test_ipv6_ipaddress_end'], model.autoPopulationTypes[0], model);
        expect(nextAvailableAddress).toEqual("2000:0000:0000:0000:0000:0000:0000:0001/64");

        // checking if expanded next available address is provided if shortened value is set
        wrapper.find('#test_ipv6_ipaddress_start_input').setValue("2000::0001/64");
        nextAvailableAddress = wrapper.vm.findNextAvailableAddress(model.response['test_ipv6_ipaddress_start'], model.response['test_ipv6_ipaddress_end'], model.autoPopulationTypes[0], model);
        expect(nextAvailableAddress).toEqual("2000:0000:0000:0000:0000:0000:0000:0001/64");

        // checking if next available address is provided if value is set
        model.response['test_ipv6_ip2'] = "2000:0000:0000:0000:0000:0000:0000:0001/64";
        wrapper.find('#test_ipv6_ipaddress_start_input').setValue("2000:0000:0000:0000:0000:0000:0000:0001/64");
        nextAvailableAddress = wrapper.vm.findNextAvailableAddress(model.response['test_ipv6_ipaddress_start'], model.response['test_ipv6_ipaddress_end'], model.autoPopulationTypes[0], model);
        expect(nextAvailableAddress).toEqual("2000:0000:0000:0000:0000:0000:0000:0002/64");

        // checking if next available address is provided if value is set - previous ip entered in shortened form
        model.response['randomIP1'] = "2000::0001/64";
        wrapper.find('#test_ipv6_ipaddress_start_input').setValue("2000:0000:0000:0000:0000:0000:0000:0001/64");
        nextAvailableAddress = wrapper.vm.findNextAvailableAddress(model.response['test_ipv6_ipaddress_start'], model.response['test_ipv6_ipaddress_end'], model.autoPopulationTypes[0], model);
        expect(nextAvailableAddress).toEqual("2000:0000:0000:0000:0000:0000:0000:0002/64");

        // checking if 'none available' appears if no more addresses are left for the ip provided
        model.response['test_ipv6_ip1'] = "2000:0000:0000:0000:ffff:ffff:ffff:fffe/64";
        model.response['test_ipv6_ip2'] = "2000:0000:0000:0000:ffff:ffff:ffff:ffff/64";
        await wrapper.find('#test_ipv6_ipaddress_start_input').setValue("2000:0000:0000:0000:ffff:ffff:ffff:ffff/64");
        nextAvailableAddress = wrapper.vm.findNextAvailableAddress(model.response['test_ipv6_ipaddress_start'], model.response['test_ipv6_ipaddress_end'], model.autoPopulationTypes[0], model);
        expect(nextAvailableAddress).toEqual("None Available");

        // checking if 'none available in selected range' appears if no more addresses are left in range selected
        model.response['test_ipv6_ip1'] = "2000:0000:0000:0000:0000:0000:0000:0001/64";
        model.response['test_ipv6_ip2'] = "2000:0000:0000:0000:0000:0000:0000:0002/64";
        await wrapper.find('#test_ipv6_ipaddress_start_input').setValue("2000:0000:0000:0000:0000:0000:0000:0001/64");
        await wrapper.find('#test_ipv6_ipaddress_end_input').setValue("2000:0000:0000:0000:0000:0000:0000:0002/64");
        nextAvailableAddress = wrapper.vm.findNextAvailableAddress(model.response['test_ipv6_ipaddress_start'], model.response['test_ipv6_ipaddress_end'], model.autoPopulationTypes[0], model);
        expect(nextAvailableAddress).toEqual("None Available in Selected Range");

        // checking if next available address is provided if value is set and no subnet is provided
        model.response['test_ipv6_subnet'] = undefined;
        model.response['randomIP1'] = undefined;
        wrapper.find('#test_ipv6_ipaddress_start_input').setValue("2000:0000:0000:0000:0000:0000:0000:0001/64");
        var nextAvailableAddress = wrapper.vm.findNextAvailableAddress(model.response['test_ipv6_ipaddress_start'], model.response['test_ipv6_ipaddress_end'], model.autoPopulationTypes[0], model);
        expect(nextAvailableAddress).toEqual("");
    });
});