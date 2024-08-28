<template>
  <div class="sector">
    <label class="switch">
      <input type="checkbox" @click="$emit('switchChanged', isEnabled)" v-model="isEnabled">
      <i class="ball"></i>
      <span>{{ isEnabled ? onText : offText }}</span>
    </label>
  </div>
</template>

<script>
export default {
  name: "SwitchSelector",
  props: {
    switchState: Boolean,
    onText: String,
    offText: String
  },
  data() {
    return {
      isEnabled: this.switchState
    };
  }
};
</script>

<style scoped>
.sector {
  padding: 11px 22px 0 22px;
  max-width: 170px;
  width: 170px;
}

.ball {
  padding: 2px 0px 0px 2px;
}
</style>