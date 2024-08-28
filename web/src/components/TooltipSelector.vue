<template>
  <div class="tooptip-switch">
    <b class="tooltip">
      <slot name="tooltip-title"></slot>
      <i class="icon icon-info"></i>
      <span class="tooltiptext">
        <slot name="tooltip-text"></slot>
      </span>
    </b>
    <SwitchSelector
        :switchState="switchState"
        @switchChanged="switchMethod"
        :onText="onText"
        :offText="offText"
    ></SwitchSelector>
  </div>
</template>

<script>
import SwitchSelector from './SwitchSelector.vue';
export default {
  name: "TooltipSelector",
  components: {
    SwitchSelector
  },
  props: {
    switchState: Boolean,
    switchMethod: Function,
    onText: {
      type: String,
      default: "On"
    },
    offText: {
      type: String,
      default: "Off"
    }
  },
  data() {
    return {
      isEnabled: this.switchState
    }
  }
}
</script>