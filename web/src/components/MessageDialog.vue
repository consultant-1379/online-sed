<template>
  <Transition name="fade">
    <div class="dialog">
      <div class="content">
        <div class="top">
          <div class="title">
            <i class="icon icon-failed" style="margin-right: 5px"></i>
            <slot name="title"></slot>
          </div>
        </div>
        <div class="body">
          <span class="message right">
            <slot name="message"></slot>
          </span>
        </div>
        <div class="bottom">
          <button class="btn" v-on:click="hideChildAndContinue">{{ buttonText }}</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
export default {
  name: "MessageDialog",
  props: {
    buttonText: {
      type: String,
      default: "Confirm"
    }
  },
  methods: {
    hideChildAndContinue() {
      this.$emit('hide-child');
      this.$emit( this.buttonText + 'ButtonPressed' );
    }
  }
}
</script>

<style scoped>
</style>