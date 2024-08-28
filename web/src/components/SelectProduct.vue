<template>
  <div v-if="modelObject.products.length > 1" class="dropdown" id="deployment-product">
    <div>
      <b class="tooltip"
      >Select Product:
        <i class="icon icon-info"></i>
        <span class="tooltiptext">
          This section allows the user to select the Product.
        </span>
      </b>
    </div>
    <DropDownSelect
        :options="modelObject.products"
        :displaykey="'name'"
        @select="selectProduct($event, modelObject, comparisonModelObject)"
        :default_option="modelObject.selectedProduct.name"
    ></DropDownSelect>
  </div>
</template>

<script>
import { selectProduct } from "../model";
import DropDownSelect from "./DropDownSelectEmitOptionIndex.vue";

export default {
  name: "select-product",
  props: {
    modelObject: {
      type: Object,
      required: true
    },
    comparisonModelObject: {
      type: Object,
      required: false,
      default: undefined
    }
  },
  components: { DropDownSelect },
  data() {
    return {
      selectProduct
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