<template>
  <div class="dropdown" id="deployment-size">
    <div>
      <b class="tooltip"
      >Select Deployment Size:
        <i class="icon icon-info"></i>
        <span class="tooltiptext">
          This section allows the user to select the Deployment Size.
        </span>
      </b>
    </div>
    <DropDownSelect
        :options="filterSizes(modelObject.sizes)"
        :displaykey="'name'"
        @select="selectSize($event, modelObject)"
        :default_option="modelObject.selectedSize.name"
        :disabled="modelObject.selectedIpVersion.alias === 'default'"
    ></DropDownSelect>
  </div>
  <br>
  <div class="dropdown" id="schema-file" v-if="isThereMultipleSchemas()">
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
import { selectSchema, selectSize } from "../model";
import DropDownSelect from "./DropDownSelectEmitOptionIndex.vue";

export default {
  name: "select-schema",
  props: {
    modelObject: {
      type: Object,
      required: true
    }
  },
  components: { DropDownSelect },
  data() {
    return {
      selectSchema,
      selectSize
    };
  },
  methods: {
    filterSizes(sizes) {
      if (this.modelObject.targetAudience !== "pdu") {
        const ii = sizes.findIndex(e => e.name === 'test' || (!e.displayInExternalSED && e.displayInExternalSED !== undefined));
        if (ii > -1) {
          sizes.splice(ii, 1)
        }
      }
      return sizes
    },
    isThereMultipleSchemas() {
      if (this.modelObject.selectedProduct.alias == "default" || this.modelObject.selectedProduct.name == "Physical ENM") {
        return true;
      }
      return false;
    }
  }
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