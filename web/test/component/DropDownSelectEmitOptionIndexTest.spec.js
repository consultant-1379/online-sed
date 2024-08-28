
import DropdownSelectIndex from "../../src/components/DropDownSelectEmitOptionIndex.vue";
import { mount } from '@vue/test-utils';


describe('DropdownSelectIndex', () => {
  test('Should emit select event when an option is clicked', () => {
    const options = [
      { name: 'Option 1' },
      { name: 'Option 2' },
      { name: 'Option 3' },
    ];
    const displaykey = 'name';
    const default_option = 'Select an option';
    const wrapper = mount(DropdownSelectIndex, {
      propsData: {
        options,
        displaykey,
        default_option,
      },
    });
    const secondOption = wrapper.findAll('.item').at(1);
    secondOption.trigger('click');
    expect(wrapper.emitted().select).toBeTruthy();
    expect(wrapper.emitted().select[0]).toEqual([1]);
  });
});