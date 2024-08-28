import { expect } from "vitest";
import { mount } from '@vue/test-utils';
import model from '../../src/model';
import NodeSelector from '../../src/components/NodeSelector.vue';

describe('Test NodeSelector component', async () => {
    beforeEach(() => {
        model = {};
        model.response = {};
        model.response.nodeSelector = {
            "key1": "value1"
        }
        model.previousDialogValue = model.response.nodeSelector;
        model.currentQuestion = {};
        model.currentQuestion.key = "nodeSelector";
        model.currentQuestion.type = "nodeSelector";
        model.currentQuestion.format = "nodeSelector";
        model.currentQuestion.nodeSelectorInfo = {};
        model.currentQuestion.nodeSelectorInfo.key = {
            "description": "This must be any string, at least one character with no spaces.",
            "errorMessage": "This can be any string with at least one character and no space is allowed.",
            "validationPattern": "^[^\\s]*$"
        };
        model.currentQuestion.nodeSelectorInfo.value = {
            "description": "This must be any string, at least one character with no spaces.",
            "errorMessage": "This can be any string with at least one character and no space is allowed.",
            "validationPattern": "^[^\\s]*$"
        };
        model.selectedUseCase = {
            "name": "Install"
        };
    });

    test('when there is imported nodeSelector value, should exist on nodeSelector component', async () => {
        const wrapper = mount(NodeSelector);

        // Update component
        await wrapper.vm.$nextTick();
        var tableRows = wrapper.findAll('tr');

        var row0 = wrapper.find('#node_0');
        var inputsRow0 = row0.findAll('input');
        var nodeKeyInput0 = inputsRow0[0].element.value;
        var nodeValueInput0= inputsRow0[1].element.value;
        var deleteButtonRow0 = row0.find('#delete_0');

        // Check there are expected rows in the nodeSelector table, and expected entities in the row
        expect(tableRows.length).toBe(2);
        expect(nodeKeyInput0).toBe("key1");
        expect(nodeValueInput0).toBe("value1");
        expect(deleteButtonRow0.isVisible()).toBe(true);
    });

    test('when add node and save, data should save in model.response', async () => {
        const wrapper = mount(NodeSelector);

        expect(model.response.nodeSelector).toEqual({ key1: 'value1'});

        wrapper.vm.addRow();

        // Update component
        await wrapper.vm.$nextTick();

        var tableRows = wrapper.findAll('tr');
        var nodeKeyInput1 = wrapper.find('#nodeKey_1');
        var nodeValueInput1= wrapper.find('#nodeValue_1');

        // Check there are expected rows in the nodeSelector table, and expected entities in the row
        expect(tableRows.length).toBe(3);
        expect(nodeKeyInput1.element.value).toBe("");
        expect(nodeValueInput1.element.value).toBe("");

        var newKey = "newKey";
        var newVal = "newVal";
        nodeKeyInput1.setValue(newKey);
        nodeValueInput1.setValue(newVal);

        nodeKeyInput1 = wrapper.find('#nodeKey_1');
        nodeValueInput1= wrapper.find('#nodeValue_1');

        wrapper.vm.save();
        expect(await model.response.nodeSelector).toEqual({ key1: 'value1', newKey: 'newVal' });
    })

    test('when add node, close the component without saving it, should not save the changes', async () => {
        const wrapper = mount(NodeSelector);

        expect(model.response.nodeSelector).toEqual({ key1: 'value1'});

        wrapper.vm.addRow();

        // Update component
        await wrapper.vm.$nextTick();

        var tableRows = wrapper.findAll('tr');
        var nodeKeyInput1 = wrapper.find('#nodeKey_1');
        var nodeValueInput1= wrapper.find('#nodeValue_1');

        // Check there are expected rows in the nodeSelector table, and expected entities in the row
        expect(tableRows.length).toBe(3);
        expect(nodeKeyInput1.element.value).toBe("");
        expect(nodeValueInput1.element.value).toBe("");

        var newKey = "newKey";
        var newVal = "newVal";
        nodeKeyInput1.setValue(newKey);
        nodeValueInput1.setValue(newVal);

        // Closing component
        wrapper.vm.close();
        expect(model.response.nodeSelector).toEqual({ key1: 'value1'});
    })

    test('when add node, save and close the component, should save in the model.response ', async () => {
        const wrapper = mount(NodeSelector);

        expect(model.response.nodeSelector).toEqual({ key1: 'value1'});

        wrapper.vm.addRow();

        // Update component
        await wrapper.vm.$nextTick();

        var tableRows = wrapper.findAll('tr');
        var nodeKeyInput1 = wrapper.find('#nodeKey_1');
        var nodeValueInput1= wrapper.find('#nodeValue_1');

        // Check there are expected rows in the nodeSelector table, and expected entities in the row
        expect(tableRows.length).toBe(3);
        expect(nodeKeyInput1.element.value).toBe("");
        expect(nodeValueInput1.element.value).toBe("");

        var newKey = "newKey";
        var newVal = "newVal";
        nodeKeyInput1.setValue(newKey);
        nodeValueInput1.setValue(newVal);

        // Save and close component
        wrapper.vm.save();
        wrapper.vm.close();
        expect(await model.response.nodeSelector).toEqual({ key1: 'value1', newKey: 'newVal' });
    })

    test('when delete node, do not save and close component, should not save the change', async () => {
        const wrapper = mount(NodeSelector);

        // Update component
        await wrapper.vm.$nextTick();

        // Delete first record
        var deleteButtonInput0 = wrapper.find('#delete_0');
        await deleteButtonInput0.trigger('click');

        wrapper.vm.close();

        expect(await model.response.nodeSelector).toEqual({ key1: 'value1' });

        var confirmSpyOnSyncNodeSelectorProxyToModel = await vi.spyOn(wrapper.vm, 'syncNodeSelectorProxyToModel');
        await wrapper.vm.syncNodeSelectorProxyToModel(model);
        await expect(await confirmSpyOnSyncNodeSelectorProxyToModel).toBeCalled();

        // Check table rows in component as expected
        expect(wrapper.findAll('tr').length).toBe(2);
    })

    test('when delete node, save and close component, should save the deleted change', async () => {
        const wrapper = mount(NodeSelector);

        // Update component
        await wrapper.vm.$nextTick();

        // Delete first record
        var deleteButtonInput0 = wrapper.find('#delete_0');
        await deleteButtonInput0.trigger('click');

        wrapper.vm.save();
        wrapper.vm.close();

        // Check table rows in component and entities as expected
        expect(wrapper.findAll('tr').length).toBe(0);
        expect(await model.response.nodeSelector).toEqual({});
        expect(wrapper.text()).toBe("No record.");
    })

    test('when enter invalid node key and value, save and close component, should not save the changes', async () => {
        const wrapper = mount(NodeSelector);

        expect(model.response.nodeSelector).toEqual({ key1: 'value1'});

        wrapper.vm.addRow();

        // Update component
        await wrapper.vm.$nextTick();

        var nodeKeyInput1 = wrapper.find('#nodeKey_1');
        var nodeValueInput1= wrapper.find('#nodeValue_1');

        var newKey = "newKey";
        var newVal = "newVal";
        nodeKeyInput1.setValue(newKey);
        nodeValueInput1.setValue(newVal);

        var node1Row = wrapper.find('#node_1');

        // Check no invalid message
        var keyValidationMsg = node1Row.find('#invalid_node_key_error');
        expect(keyValidationMsg.exists()).toBe(false);

        // Check no duplicate message for node key
        var keyDuplicateMsg = node1Row.find('#duplicate_entry_error');
        expect(keyDuplicateMsg.exists()).toBe(false);

        // Check no invalid message message for node value
        var valueValidationMsg = node1Row.find('#invalid_node_value_error');
        expect(valueValidationMsg.exists()).toBe(false);

        // Set key and value back to empty to test for invalid message
        nodeKeyInput1.setValue('');
        nodeValueInput1.setValue('');

        var currentNodeSelector = wrapper.vm.nodeSelectorProxy[1];

        var confirmSpyOnIsValidNodeKey = await vi.spyOn(wrapper.vm, 'isValidValue');
        var validNodeKey = wrapper.vm.isValidValue(currentNodeSelector.nodeKey, model.currentQuestion.nodeSelectorInfo.key.validationPattern);
        expect(confirmSpyOnIsValidNodeKey).toBeCalled();
        expect(validNodeKey).toBe(false);

        var confirmSpyOnIsValidNodeValue = await vi.spyOn(wrapper.vm, 'isValidValue');
        var validNodeValue = wrapper.vm.isValidValue(currentNodeSelector.nodeKey, model.currentQuestion.nodeSelectorInfo.value.validationPattern);
        expect(confirmSpyOnIsValidNodeValue).toBeCalled();
        expect(validNodeValue).toBe(false);

        node1Row = wrapper.find('#node_1');

        // Check invalid message for node key
        keyValidationMsg = node1Row.find('#invalid_node_key_error');
        expect(keyValidationMsg.text()).toBe('This can be any string with at least one character and no space is allowed.');

        // Check no duplicate message for node key
        keyDuplicateMsg = node1Row.find('#duplicate_entry_error');
        expect(keyDuplicateMsg.exists()).toBe(false);

        // Check invalid message message for node value
        valueValidationMsg = node1Row.find('#invalid_node_value_error');
        expect(valueValidationMsg.text()).toBe('This can be any string with at least one character and no space is allowed.');

        // Save invalid node
        wrapper.vm.save();

        expect(wrapper.vm.nodeSelectorProxy).toEqual([{nodeKey: "key1", nodeValue: "value1", index: 0}, {nodeKey: "", nodeValue: "", index: 1}]);
        expect(model.response.nodeSelector).toEqual({key1: 'value1'});
    })

    test('when enter duplicate node, should show duplicate message', async () => {
        const wrapper = mount(NodeSelector);

        expect(model.response.nodeSelector).toEqual({ key1: 'value1'});

        wrapper.vm.addRow();

        // Update component
        await wrapper.vm.$nextTick();

        var nodeKeyInput1 = wrapper.find('#nodeKey_1');
        var nodeValueInput1= wrapper.find('#nodeValue_1');

        var newKey = "key1";
        var newVal = "newVal";
        nodeKeyInput1.setValue(newKey);
        nodeValueInput1.setValue(newVal);

        // Update component
        await wrapper.vm.$nextTick();

        var node1Row = wrapper.find('#node_1');

        // Check duplicate message for node key
        var keyDuplicateMsg = node1Row.find('#duplicate_entry_error');
        expect(keyDuplicateMsg.text()).toBe("Duplicate nodeKey");
    });

    test('when add row without providing value to the first nodeSelector, should not add another row', async () => {
        const wrapper = mount(NodeSelector);
        wrapper.vm.addRow();
        wrapper.vm.addRow();

        wrapper.vm.save();
        expect(wrapper.vm.nodeSelectorProxy).toEqual([{nodeKey: "key1", nodeValue: "value1", index: 0}, {nodeKey: null, nodeValue: null, index: 1}]);
    });
});

describe('Test NodeSelector component immutable under upgrade scenario', async () => {
    beforeEach(() => {
        model = {};
        model.response = {};
        model.selectedUseCase = {
            "name" : "Upgrade"
        };
        model.response.nodeSelector = {
            "key1": "value1"
        };
        model.previousDialogValue = model.response.nodeSelector;
        model.currentQuestion = {};
        model.currentQuestion.immutable = true;
        model.currentQuestion.isValid = true;
        model.currentQuestion.key = "nodeSelector";
        model.currentQuestion.type = "nodeSelector";
        model.currentQuestion.format = "nodeSelector";
        model.currentQuestion.nodeSelectorInfo = {};
        model.currentQuestion.nodeSelectorInfo.key = {
            "description": "This must be any string, at least one character with no spaces.",
            "errorMessage": "This can be any string with at least one character and no space is allowed.",
            "validationPattern": "^[^\\s]*$"
        };
        model.currentQuestion.nodeSelectorInfo.value = {
            "description": "This must be any string, at least one character with no spaces.",
            "errorMessage": "This can be any string with at least one character and no space is allowed.",
            "validationPattern": "^[^\\s]*$"
        };
    });

    test('when inputs are readonly and button is disabled during upgrade', async () => {
        const wrapper = mount(NodeSelector);

        // Update component
        await wrapper.vm.$nextTick();

        var nodeKey_0 = wrapper.find('#nodeKey_0');
        var nodeVal_0 = wrapper.find('#nodeValue_0');
        var deleteBtn_0 = wrapper.find('#delete_0');

        expect(nodeKey_0.attributes()).contains({"readonly": ''});
        expect(nodeVal_0.attributes()).contains({"readonly": ''});
        expect(deleteBtn_0.attributes()).contains({"disabled": ''});
    });
});