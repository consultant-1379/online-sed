<template>
  <div :class="['select closed drop-down']" @click="toggleDropdown" :disabled="disabled">
    <button class="btn current-options" :disabled="disabled">{{ default_option }}</button>
    <div class="options-list">
      <div class="item" v-for="(o, i) in options" :key="i" @click="handleSelect(i)">{{ o[displaykey] }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'dropdown-select-index',
  props: {
    options: Array,
    displaykey: String,
    default_option: String,
    disabled: {
      type: Boolean,
      default: false, // Default value of the disabled prop is set to false
    },
  },
  emits: ['select'],
  data(){
    return {
      opened: false
    };
  },
  methods: {
    toggleDropdown(e) {
      var shouldOpen = (e.currentTarget.classList.contains("open")) ? false : true;

      var openDropDown = document.querySelectorAll('.drop-down');
      openDropDown.forEach(dropDown => {
        dropDown.classList.remove("open");
        dropDown.classList.add("closed");
      });

      if (!this.disabled && shouldOpen) {
        e.currentTarget.classList.remove("closed");
        e.currentTarget.classList.add("open");
      }
    },
    handleSelect(index) {
      if (!this.disabled) {
        this.$emit('select', index);
      }
    },
  },
};
</script>
