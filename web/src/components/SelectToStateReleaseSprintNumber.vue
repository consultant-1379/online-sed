<template>
  <div v-if="toModelObject.targetAudience === 'pdu'" class="dropdown" :id="dropdownId + 'sprint-number'">
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
        :options="toModelObject.sprints"
        :displaykey="'sprintVersion'"
        @select="selectSprintAndFilterSprintList(toModelObject, $event, fromModelObject)"
        :default_option="toModelObject.selectedSprint.sprintVersion"
        :disabled="fromModelObject.selectedVersion.name  === 'Please select...'"
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
        :options="toModelObject.releases"
        :displaykey="'releaseNumber'"
        @select="selectReleaseAndFilterReleaseList(toModelObject, $event, fromModelObject)"
        :default_option="toModelObject.selectedRelease.releaseNumber"
        :disabled="fromModelObject.selectedVersion.name  === 'Please select...'"
    ></DropDownSelect>
  </div>
</template>

<script>
import {selectSprint, selectRelease} from "../model";
import DropDownSelect from "./DropDownSelectEmitOptionIndex.vue";
import {
  selectSprintAndFilterSprintList,
  selectReleaseAndFilterReleaseList,
  filterProductSetList
} from "../model/compare.js";

export default {
  name: "select-to-state-release-sprint-number",
  props: {
    toModelObject: {
      type: Object,
      required: true
    },
    fromModelObject: {
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
      selectSprintAndFilterSprintList,
      selectReleaseAndFilterReleaseList,
      filterProductSetList
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