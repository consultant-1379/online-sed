<template>
  <div v-if="fromModelObject.targetAudience === 'pdu'" class="dropdown" :id="dropdownId + 'sprint-number'">
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
        :options="fromModelObject.sprints"
        :displaykey="'sprintVersion'"
        @select="this.selectSprintAndRemoveLatestReleaseInFromState(fromModelObject, $event, toModelObject)"
        :default_option="fromModelObject.selectedSprint.sprintVersion"
        :disabled="fromModelObject.selectedUseCase.alias === 'default'"
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
        :options="fromModelObject.releases"
        :displaykey="'releaseNumber'"
        @select="this.selectReleaseAndRemoveLatestReleaseInFromState(fromModelObject, $event, toModelObject)"
        :default_option="fromModelObject.selectedRelease.releaseNumber"
        :disabled="fromModelObject.selectedUseCase.alias === 'default'"
    ></DropDownSelect>
  </div>
</template>

<script>
import {selectSprint, selectRelease} from "../model";
import DropDownSelect from "./DropDownSelectEmitOptionIndex.vue";
import {
  selectReleaseAndRemoveLatestReleaseInFromState,
  selectSprintAndRemoveLatestReleaseInFromState,
  removeVeryLatestReleaseVersion, getLatestSprintNumber
} from "../model/compare.js";

export default {
  name: "select-from-state-release-sprint-number",
  props: {
    fromModelObject: {
      type: Object,
      required: true
    },
    toModelObject: {
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
      selectRelease,
      getLatestSprintNumber,
      selectReleaseAndRemoveLatestReleaseInFromState,
      selectSprintAndRemoveLatestReleaseInFromState,
      removeVeryLatestReleaseVersion
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