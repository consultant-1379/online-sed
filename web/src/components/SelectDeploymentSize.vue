<template>
  <div class="dropdown" id="schema-file">
    <div>
      <b class="tooltip"
      >Select Deployment Type:
        <i class="icon icon-info"></i>
        <span class="tooltiptext">
          This section allows the user to select a deployment type.
        </span>
      </b>
    </div>
    <DropDownSelect
        :options="modelObject.schemas"
        :displaykey="'shortName'"
        @select="selectSchema($event, modelObject)"
        :default_option="modelObject.selectedSchema.shortName"
        :disabled="modelObject.selectedSize.alias === 'default'"
    ></DropDownSelect>
  </div>
</template>

<script>
import { selectSchema } from "../model";
import DropDownSelect from "./DropDownSelectEmitOptionIndex.vue";

export default {
  name: "select-deployment-size",
  props: {
    modelObject: {
      type: Object,
      required: true
    }
  },
  components: { DropDownSelect },
  data() {
    return {
      selectSchema
    };
  },
};
</script>
<style scoped lang="less">
.select {
  padding: 11px 22px 11px 22px;
  max-width: 420px;
  width: 420px;
}
.select .options-list {
  max-width: 272px;
}
</style>