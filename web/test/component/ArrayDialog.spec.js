import { expect } from "vitest";
import { mount } from '@vue/test-utils';
import model from '../../src/model';
import ArrayDialog from '../../src/components/ArrayDialog.vue';

describe('Test arrayDialog component', async () => {
    beforeEach(() => {
        model = {};
        model.response = {};
        model.response.sccResources = [
            "val1",
            "val2",
            "val3"
        ];
        model.currentQuestion = {
            "key": "sccResources",
            "type": "array",
            "validationPattern": "^.+$"
        };
        model.selectedUseCase = {
            "name": "Install"
        };
    });

    test('when there is imported object array value, should exist on arrayDialog component', async () => {
        const wrapper = mount(ArrayDialog);

        // Update component
        await wrapper.vm.$nextTick();
        var tableRows = wrapper.findAll('tr');

        var row0 = wrapper.find('#entry_0');
        var inputsRow0 = row0.findAll('input');
        var valInput = inputsRow0[0].element.value;
        var deleteButtonRow0 = row0.find('#delete_0');

        // Check there are expected rows in the table, and expected entities in the row
        expect(tableRows.length).toBe(4);
        expect(valInput).toBe("val1");
        expect(deleteButtonRow0.isVisible()).toBe(true);
    });

    test('when enter invalid entry, save and close component, should not save the changes', async () => {
        const wrapper = mount(ArrayDialog);

        expect(model.response.sccResources).toEqual([
            "val1",
            "val2",
            "val3"
        ]);

        wrapper.vm.addRow();

        // Update component
        await wrapper.vm.$nextTick();

        var val1 = wrapper.find('#entry_val_1');

        var newVal = "newVal";
        val1.setValue(newVal);

        var row1 = wrapper.find('#entry_1');

        // Check no invalid message
        var validationMsg = row1.find('#invalid_entry_error');
        expect(validationMsg.exists()).toBe(false);

        // Check no duplicate message for entries
        var duplicateMsg = row1.find('#duplicate_entry_error');
        expect(duplicateMsg.exists()).toBe(false);

        // Set value back to empty to test for invalid message
        await val1.setValue('');

        row1 = wrapper.find('#entry_1');

        // Check invalid message
        validationMsg = row1.find('#invalid_entry_error');
        expect(validationMsg.text()).toBe('Invalid entry');

        // Check duplicate message
        duplicateMsg = row1.find('#duplicate_entry_error');
        expect(duplicateMsg.exists()).toBe(false);

        // Save invalid entry
        wrapper.vm.save();
        wrapper.vm.close();

        expect(model.response.sccResources).toEqual(["val1", "val2", "val3"]);
    })

    test('when enter duplicate value, should show duplicate message', async () => {
        const wrapper = mount(ArrayDialog);

        expect(model.response.sccResources).toEqual(["val1", "val2", "val3"]);

        wrapper.vm.addRow();

        // Update component
        await wrapper.vm.$nextTick();

        var entry_val1 = wrapper.find('#entry_val_3');

        var newVal = "val1";
        entry_val1.setValue(newVal);

        var entry1 = wrapper.find('#entry_3');

        // Update component
        await wrapper.vm.$nextTick();

        // Check duplicate message
        var duplicateMsg = entry1.find('#duplicate_entry_error');
        expect(duplicateMsg.text()).toBe("Duplicate entry");
    });

    test('when delete entry, save and close component, should save the deleted change', async () => {
        const wrapper = mount(ArrayDialog);

        // Update component
        await wrapper.vm.$nextTick();

        // Delete first record
        var deleteButtonInput0 = wrapper.find('#delete_0');
        await deleteButtonInput0.trigger('click');

        wrapper.vm.save();
        wrapper.vm.close();

        // Check table rows in component and entities as expected
        expect(wrapper.findAll('tr').length).toBe(3);
        expect(model.response.sccResources).toEqual(["val2", "val3"]);
    })

    test('when add row without providing value to the previous row, should not add another row', async () => {
        const wrapper = mount(ArrayDialog);
        wrapper.vm.addRow();
        wrapper.vm.addRow();

        expect(wrapper.vm.arrayData).toEqual([{"index":0, "val": "val1"}, {"index":1, "val": "val2"}, {"index":2, "val": "val3"}, {"index":3, "val": null}]);
        expect(model.response.sccResources).toEqual(["val1", "val2", "val3"]);
    });
});

describe('Test arrayDialog component immutable under upgrade', async () => {
    beforeEach(() => {
        model = {};
        model.selectedUseCase = {
            "name" : "Upgrade"
        };
        model.response = {};
        model.response.sccResources = [
            "val1",
            "val2",
            "val3"
        ]
        model.currentQuestion = {
            "key": "sccResources",
            "type": "array",
            "validationPattern": "^.+$",
            "immutable": true,
            "isValid": true
        }
    });

    test('when inputs are readonly and button is disabled during upgrade', async () => {
        const wrapper = mount(ArrayDialog);
        // Update component
        await wrapper.vm.$nextTick();
        var entry_0 = wrapper.find('#entry_val_0');
        var deleteBtn_0 = wrapper.find('#delete_0');

        expect(entry_0.attributes()).contains({"readonly": ''});
        expect(deleteBtn_0.attributes()).contains({"disabled": ''});
    });
});