import { expect } from "vitest";
import { mount } from '@vue/test-utils';
import model from '../../src/model';
import CustomObject from '../../src/components/CustomObject.vue';

describe('Test CustomObject component', async () => {
    beforeEach(() => {
        model = {};
        model.response = {};
        model.currentQuestion = {
            "key": "annotations",
            "type": "customObject",
            "validationPattern": "^.+$"
        };
        model.response[model.currentQuestion.key] = {
            "key1": "value1"
        }
        model.previousDialogValue = model.response[model.currentQuestion.key];
        model.currentQuestion = {};
        model.currentQuestion.key = "annotations";
        model.currentQuestion.type = "customObject";
        model.currentQuestion.format = "customObject";
        model.currentQuestion.customObjectInfo = {};
        model.currentQuestion.customObjectInfo.key = {
            "description": "This must be any string.",
            "errorMessage": "This must be any string of max length 10.",
            "validationPattern": "^[a-zA-Z0-9_\\-.]{1,10}$"
        };
        model.currentQuestion.customObjectInfo.value = {
            "description": "This must be any string.",
            "errorMessage": "This must be any string of max length 10.",
            "validationPattern": "^[a-zA-Z0-9_\\-.]{1,10}$"
        };
        model.selectedUseCase = {
            "name": "Install"
        };
    });

    test('when there is imported annotation value, should exist on CustomObject component', async () => {
        const wrapper = mount(CustomObject);

        // Update component
        await wrapper.vm.$nextTick();
        let tableRows = wrapper.findAll('tr');

        let row0 = wrapper.find('#object_0');
        let inputsRow0 = row0.findAll('input');
        let customObjectKeyInput0 = inputsRow0[0].element.value;
        let customObjectValueInput0= inputsRow0[1].element.value;
        let deleteButtonRow0 = row0.find('#delete_0');

        expect(tableRows.length).toBe(2);
        expect(customObjectKeyInput0).toBe("key1");
        expect(customObjectValueInput0).toBe("value1");
        expect(deleteButtonRow0.isVisible()).toBe(true);
    });

    test('when add new customObject and save, data should save in model.response', async () => {
        const wrapper = mount(CustomObject);

        expect(model.response[model.currentQuestion.key]).toEqual({ key1: 'value1'});

        wrapper.vm.addRow();

        // Update component
        await wrapper.vm.$nextTick();

        let tableRows = wrapper.findAll('tr');
        let customObjectKeyInput1 = wrapper.find('#objectKey_1');
        let customObjectValueInput1= wrapper.find('#objectValue_1');

        // Check there are expected rows in the customObject table, and expected entities in the row
        expect(tableRows.length).toBe(3);
        expect(customObjectKeyInput1.element.value).toBe("");
        expect(customObjectValueInput1.element.value).toBe("");

        let newKey = "newKey";
        let newVal = "newVal";
        customObjectKeyInput1.setValue(newKey);
        customObjectValueInput1.setValue(newVal);

        wrapper.vm.save();
        wrapper.vm.close();
        expect(await model.response[model.currentQuestion.key]).toEqual({ key1: 'value1', newKey: 'newVal' });
    });

    test('when adding new entry, closing the component without saving it, should not save the changes', async () => {
        const wrapper = mount(CustomObject);

        expect(model.response[model.currentQuestion.key]).toEqual({ key1: 'value1'});

        wrapper.vm.addRow();

        // Update component
        await wrapper.vm.$nextTick();

        let tableRows = wrapper.findAll('tr');
        let customObjectKeyInput1 = wrapper.find('#objectKey_1');
        let customObjectValueInput1= wrapper.find('#objectValue_1');

        // Check there are expected rows in the customObject table, and expected entities in the row
        expect(tableRows.length).toBe(3);
        expect(customObjectKeyInput1.element.value).toBe("");
        expect(customObjectValueInput1.element.value).toBe("");

        let newKey = "newKey";
        let newVal = "newVal";
        customObjectKeyInput1.setValue(newKey);
        customObjectValueInput1.setValue(newVal);

        // Closing component
        wrapper.vm.close();
        expect(model.response[model.currentQuestion.key]).toEqual({ key1: 'value1'});
    });

    test('when delete customObject, without saving and component is closed, changes should not be saved', async () => {
        const wrapper = mount(CustomObject);

        // Update component
        await wrapper.vm.$nextTick();

        // Delete first record
        let deleteButtonInput0 = wrapper.find('#delete_0');
        await deleteButtonInput0.trigger('click');

        wrapper.vm.close();

        expect(await model.response[model.currentQuestion.key]).toEqual({ key1: 'value1' });

        let confirmSpyOnSyncCutomObjectToModel = await vi.spyOn(wrapper.vm, 'syncCustomObjectToModel');
        await wrapper.vm.syncCustomObjectToModel(model);
        expect(await confirmSpyOnSyncCutomObjectToModel).toBeCalled();

        // Check table rows in component as expected
        expect(wrapper.findAll('tr').length).toBe(2);
    })

    test('when delete customObject, save and close component, should save the deleted change', async () => {
        const wrapper = mount(CustomObject);

        // Update component
        await wrapper.vm.$nextTick();

        // Delete first record
        let deleteButtonInput0 = wrapper.find('#delete_0');
        await deleteButtonInput0.trigger('click');

        wrapper.vm.save();
        wrapper.vm.close();

        // Check table rows in component and entities as expected
        expect(wrapper.findAll('tr').length).toBe(0);
        expect(await model.response[model.currentQuestion.key]).toEqual({});
        expect(wrapper.text()).toBe("No record.");
    });

    test('when enter invalid customObject key and value, save and close component, should not save the changes', async () => {
        const wrapper = mount(CustomObject);

        expect(model.response[model.currentQuestion.key]).toEqual({ key1: 'value1'});

        wrapper.vm.addRow();

        // Update component
        await wrapper.vm.$nextTick();

        let customObjectKeyInput1 = wrapper.find('#objectKey_1');
        let customObjectValueInput1= wrapper.find('#objectValue_1');

        let newKey = "newKey";
        let newVal = "newVal";
        customObjectKeyInput1.setValue(newKey);
        customObjectValueInput1.setValue(newVal);

        let object1Row = wrapper.find('#object_1');

        // Check no invalid message
        let keyValidationMsg = object1Row.find('#invalid_CustomObj_key_error');
        expect(keyValidationMsg.exists()).toBe(false);

        // Check no duplicate message for key
        let keyDuplicateMsg = object1Row.find('#duplicated_key_error');
        expect(keyDuplicateMsg.exists()).toBe(false);

        // Check no invalid message message for value
        let valueValidationMsg = object1Row.find('#invalid_CustomObj_value_error');
        expect(valueValidationMsg.exists()).toBe(false);

        // Set key and value back to empty to test for invalid message
        customObjectKeyInput1.setValue('');
        customObjectValueInput1.setValue('');

        let currentCustomObject = wrapper.vm.customObjectProxy[1];

        let confirmSpyOnIsValidCustomObjectKey = await vi.spyOn(wrapper.vm, 'isValidValue');
        let validustomObjectKey = wrapper.vm.isValidValue(currentCustomObject.objectKey, model.currentQuestion.customObjectInfo.key.validationPattern);
        expect(confirmSpyOnIsValidCustomObjectKey).toBeCalled();
        expect(validustomObjectKey).toBe(false);

        let confirmSpyOnIsValidCustomObjectValue = await vi.spyOn(wrapper.vm, 'isValidValue');
        let validCustomObjectValue = wrapper.vm.isValidValue(currentCustomObject.objectValue, model.currentQuestion.customObjectInfo.value.validationPattern);
        expect(confirmSpyOnIsValidCustomObjectValue).toBeCalled();
        expect(validCustomObjectValue).toBe(false);

        object1Row = wrapper.find('#object_1');

        // Check invalid message for key
        keyValidationMsg = object1Row.find('#invalid_CustomObj_key_error');
        expect(keyValidationMsg.text()).toBe('This must be any string of max length 10.');

        // Check invalid message message for value
        valueValidationMsg = object1Row.find('#invalid_CustomObj_value_error');
        expect(valueValidationMsg.text()).toBe('This must be any string of max length 10.');

        // Save invalid entry
        wrapper.vm.save();

        expect(wrapper.vm.customObjectProxy).toEqual([{objectKey: "key1", objectValue: "value1", index: 0}, {objectKey: "", objectValue: "", index: 1}]);
        expect(model.response[model.currentQuestion.key]).toEqual({key1: 'value1'});
    });

    test('when add row without providing value to the first customObject, should not add another row', async () => {
        const wrapper = mount(CustomObject);
        wrapper.vm.addRow();
        wrapper.vm.addRow();

        wrapper.vm.save();
        expect(wrapper.vm.customObjectProxy).toEqual([{objectKey: "key1", objectValue: "value1", index: 0}, {objectKey: null, objectValue: null, index: 1}]);
    });
});