<template>
  <Transition name="fade">
    <div class="dialog eds" data-trigger="#open-warning" data-type="simple">
      <div class="content">
        <div class="top">
          <div class="title"><slot name="title"></slot></div>
        </div>
        <div class="body">
          <p><slot name="message"></slot></p>
        </div>
        <div class="bottom">
          <button id="open-warning" class="btn cancel" data-close="true">Cancel</button>
          <button id="open-warning" class="btn warning continue">Continue</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import { Dialog } from "@eds/vanilla";
export default {
  name: "ConfirmationDialog",

  mounted() {
    this.$nextTick(() => {
      const dialogs = document.querySelectorAll('.dialog.eds');
      if (dialogs) {
        Array.from(dialogs).forEach((dialogDOM) => {
          const dialog = new Dialog(dialogDOM);
          dialog.init();

          dialogDOM.querySelector('button.btn.cancel').addEventListener('click', () => {
            this.$emit('hideChild');
            this.$emit('cancelButtonPressed');
          });

          dialogDOM.querySelector('button.btn.continue').addEventListener('click', () => {
            this.$emit('hideChild');
            this.$emit('continueButtonPressed');
          });
        });
      }
    });
  }
}
</script>

<style scoped>

</style>
