<template>
  <div class="dropdown" :id="dropdownId + 'release-version'">
    <div v-if="modelObject.targetAudience === 'pdu'">
      <b class="tooltip"
      >Select {{ displayHeadingContext }}Product Set Version:
        <i class="icon icon-info"></i>
        <span class="tooltiptext">
          This section allows the user to select the product set version. The product set versions list now only includes the most recent product set versions with comparable schemas, eliminating older versions with identical schemas. Choose the subsequent higher product set version if there are any missing product set versions.
        </span>
      </b>
    </div>
    <div v-else>
      <b class="tooltip"
      >Select {{ displayHeadingContext }}R-State:
        <i class="icon icon-info"></i>
        <span class="tooltiptext">
          This section allows the user to select the ENM AOM R-State.
        </span>
      </b>
    </div>
    <DropDownSelect
        :options="modelObject.versions"
        :displaykey="'name'"
        @select="selectVersion(modelObject, $event)"
        :default_option="modelObject.selectedVersion.name"
        :disabled="modelObject.selectedSprint.alias === 'default' && modelObject.selectedRelease.alias === 'default'"
    ></DropDownSelect>
  </div>
</template>

<script>
import { selectVersion } from "../model";
import DropDownSelect from "./DropDownSelectEmitOptionIndex.vue";

export default {
  name: "select-release-sprint-version",
  props: {
    modelObject: {
      type: Object,
      required: true
    },
    displayHeadingContext: {
      type: String,
      required: false,
      default: ""
    },
    dropdownId: {
      type: String,
      required: false,
      default: ""
    }
  },
  components: {DropDownSelect},
  data() {
    return {
      selectVersion
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