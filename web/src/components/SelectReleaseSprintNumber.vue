<template>
  <div v-if="modelObject.targetAudience === 'pdu'" class="dropdown" :id="dropdownId + 'sprint-number'">
    <div>
      <b class="tooltip"
      >Select {{ displayHeadingContext }}Sprint Number:
        <i class="icon icon-info"></i>
        <span class="tooltiptext">
          This section allows the user to select the sprint number.
        </span>
      </b>
    </div>
    <DropDownSelect
        :options="modelObject.sprints"
        :displaykey="'sprintVersion'"
        @select="selectSprint(modelObject, $event)"
        :default_option="modelObject.selectedSprint.sprintVersion"
        :disabled="modelObject.selectedUseCase.alias === 'default'"
    ></DropDownSelect>
  </div>
  <div v-else class="dropdown" :id="dropdownId + 'release-number'">
    <div>
      <b class="tooltip"
      >Select {{ displayHeadingContext }}Product Line:
        <i class="icon icon-info"></i>
        <span class="tooltiptext">
          This section allows the user to select the product line.
        </span>
      </b>
    </div>
    <DropDownSelect
        :options="modelObject.releases"
        :displaykey="'releaseNumber'"
        @select="selectRelease(modelObject, $event)"
        :default_option="modelObject.selectedRelease.releaseNumber"
        :disabled="modelObject.selectedUseCase.alias === 'default'"
    ></DropDownSelect>
  </div>
</template>

<script>
import { selectSprint, selectRelease } from "../model";
import DropDownSelect from "./DropDownSelectEmitOptionIndex.vue";

export default {
  name: "select-release-sprint-number",
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
  components: { DropDownSelect },
  data() {
    return {
      selectSprint,
      selectRelease
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