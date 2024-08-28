<template>
  <div class = "wrap" :class="['select', opened ? 'open' : 'closed']" @click="opened = (disabled ? false : !opened)">
    <button class="btn current-options" :class="[checkIfValid ? '': 'invalid', disabled ? 'disabled': '']">{{ defaultOption }}</button>
    <div class="options-list">
      <div class="item" v-for="o in options" :key="o" @click="$emit('select', o)">
        {{ o[displaykey] }}
      </div>
    </div>
  </div>
</template>
<script>
import { Select } from "@eds/vanilla";
export default {
  name: "dropdown-select-option",
  props: ["options", "displaykey", "default_option", "valid", "disabled", "required"],
  emits: ["select"],
  data() {
    return {
      opened: false,
    };
  },
  computed: {
    defaultOption() {
      return this.default_option || 'Please Select...'
    },
    checkIfValid() {
      if (!this.required || (this.valid && this.defaultOption !== 'Please Select...')) {
        return true;
      } else {
        return false;
      }
    },
  }
};
</script>
<style scoped>
.select {
  width: 175px;
}
.select .options-list {
  max-width: 175px;
}

.invalid {
  border: 2px solid #bb0b02;
}

.wrap {
 max-width: 100%;
}
</style>