
import DropdownSelect from "../../src/components/DropDownSelectEmitOption.vue";
import { mount } from '@vue/test-utils';


describe('DropDownSelectEmitOption', () => {
  test('Should display default option', () => {
    const wrapper = mount(DropdownSelect, {
      propsData: {
        options: [
          { name: 'Option 1' },
          { name: 'Option 2' },
          { name: 'Option 3' }
        ],
        displaykey: 'name',
        default_option: 'Option 1'
      }
    });

    expect(wrapper.find('.current-options').text()).toBe('Option 1');
  });


  test('Should emit select event', async () => {
    const wrapper = mount(DropdownSelect, {
      propsData: {
        options: [
          { name: 'Option 1' },
          { name: 'Option 2' },
          { name: 'Option 3' }
        ],
        displaykey: 'name',
        default_option: 'Option 1'
      }
    });

    wrapper.find('.select').trigger('click');
    await wrapper.vm.$nextTick();

    wrapper.findAll('.item').at(2).trigger('click');

    expect(wrapper.emitted().select).toBeTruthy();
    expect(wrapper.emitted().select[0]).toEqual([{ name: 'Option 3' }]);
  });

  test('Should show be invalid if parameter is required and not selected', async () => {
    const wrapper = mount(DropdownSelect, {
      propsData: {
        default_option: 'Please Select...',
        required: true,
        valid: true
      }
    });
    expect(wrapper.find('.current-options').classes('invalid')).toBe(true);
  });

  test('Should show be invalid if parameter is required and not selected', async () => {
    const wrapper = mount(DropdownSelect, {
      propsData: {
        default_option: 'Option 1',
        required: true,
        valid: false
      }
    });
    expect(wrapper.find('.current-options').classes('invalid')).toBe(true);
  });

  test('Should show be valid if parameter is optional', async () => {
    const wrapper = mount(DropdownSelect, {
      propsData: {
        default_option: 'Please Select...',
        required: false,
        valid: true
      }
    });
    expect(wrapper.find('.current-options').classes('invalid')).toBe(false);
  });

  test('Should show be valid if parameter is valid, mandatory and selected', async () => {
    const wrapper = mount(DropdownSelect, {
      propsData: {
        default_option: 'Option 1',
        required: true,
        valid: true
      }
    });
    expect(wrapper.find('.current-options').classes('invalid')).toBe(false);
  });

  test('Should be not editable if disabled parameter is true ', async () => {
    const wrapper = mount(DropdownSelect, {
      propsData: {
        options: [
          { name: 'Option 1' },
          { name: 'Option 2' },
          { name: 'Option 3' }
        ],
        displaykey: 'name',
        default_option: 'Option 1',
        disabled: true,
        valid: true
      }
    });

    wrapper.find('.select').trigger('click');
    expect(wrapper.find('.current-options').text()).toBe('Option 1');
  });

  test('Should be editable if disabled parameter is false', async () => {
    const wrapper = mount(DropdownSelect, {
      propsData: {
        options: [
          { name: 'Option 1' },
          { name: 'Option 2' },
          { name: 'Option 3' }
        ],
        displaykey: 'name',
        default_option: 'Option 1',
        disabled: false,
        valid: true
      }
    });

    wrapper.find('.select').trigger('click');
    await wrapper.vm.$nextTick();

    wrapper.findAll('.item').at(2).trigger('click');
    expect(wrapper.emitted().select).toBeTruthy();
    expect(wrapper.emitted().select[0]).toEqual([{ name: 'Option 3' }]);
  });
});