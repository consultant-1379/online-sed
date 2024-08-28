import { shallowMount } from '@vue/test-utils';
import SwitchSelector from '../../src/components/SwitchSelector.vue';

describe('SwitchSelector', () => {
  test('renders the component', () => {
    const wrapper = shallowMount(SwitchSelector);
    expect(wrapper.exists()).toBe(true);
  });

  test('renders the checkbox input', () => {
    const wrapper = shallowMount(SwitchSelector);
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
  });

  test('initializes the isEnabled data property based on the switchState prop', () => {
    const switchState = true;
    const wrapper = shallowMount(SwitchSelector, {
      propsData: {
        switchState
      }
    });
    expect(wrapper.vm.isEnabled).toBe(switchState);
  });

  test('updates the isEnabled data property when the checkbox is clicked', async () => {
    const wrapper = shallowMount(SwitchSelector);
    const checkbox = wrapper.find('input[type="checkbox"]');

    expect(wrapper.vm.isEnabled).toBe(false);

    await checkbox.setChecked();

    expect(wrapper.vm.isEnabled).toBe(true);
  });

  test('displays the onText when isEnabled is true', () => {
    const onText = 'On';
    const offText = 'Off';
    const wrapper = shallowMount(SwitchSelector, {
      propsData: {
        switchState: true,
        onText,
        offText
      }
    });

    expect(wrapper.find('span').text()).toBe(onText);
  });

  test('displays the offText when isEnabled is false', () => {
    const onText = 'On';
    const offText = 'Off';
    const wrapper = shallowMount(SwitchSelector, {
      propsData: {
        switchState: false,
        onText,
        offText
      }
    });

    expect(wrapper.find('span').text()).toBe(offText);
  });
});
