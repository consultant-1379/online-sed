import { shallowMount } from '@vue/test-utils';
import TooltipSelector from '../../src/components/TooltipSelector.vue';
import SwitchSelector from '../../src/components/SwitchSelector.vue';
import { vi } from "vitest";

describe('TooltipSelector', () => {
  test('renders the component', () => {
    const wrapper = shallowMount(TooltipSelector);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the SwitchSelector component', () => {
    const wrapper = shallowMount(TooltipSelector);
    expect(wrapper.findComponent(SwitchSelector).exists()).toBe(true);
  });

  test('passes the correct props to the SwitchSelector component', () => {
    const switchState = true;
    const switchMethod = function() {};
    const onText = 'On';
    const offText = 'Off';

    const wrapper = shallowMount(TooltipSelector, {
      propsData: {
        switchState,
        switchMethod,
        onText,
        offText
      }
    });

    const switchSelector = wrapper.findComponent(SwitchSelector);
    expect(switchSelector.props('switchState')).toBe(switchState);
    expect(switchSelector.props('onText')).toBe(onText);
    expect(switchSelector.props('offText')).toBe(offText);
  });

  test('calls the switchMethod when switchChanged event is emitted', () => {
    const switchMethod = vi.fn();
    const wrapper = shallowMount(TooltipSelector, {
      propsData: {
        switchMethod
      }
    });
    wrapper.findComponent(SwitchSelector).vm.$emit('switchChanged');
    expect(switchMethod).toHaveBeenCalled();
  });
});


