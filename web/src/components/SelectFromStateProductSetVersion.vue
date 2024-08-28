<template>
  <div class="dropdown" :id="dropdownId + 'release-version'">
    <div v-if="fromModelObject.targetAudience === 'pdu'">
      <b class="tooltip"
      >Select {{ displayHeadingContext }}Product Set Version:
        <i class="icon icon-info"></i>
        <span class="tooltiptext">
          This section allows the user to select the product set version.
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
        :options="fromModelObject.versions"
        :displaykey="'name'"
        @select="selectVersionAndFilterToStateList(fromModelObject, $event, toStateModelObject)"
        :default_option="fromModelObject.selectedVersion.name"
        :disabled="fromModelObject.selectedSprint.alias === 'default' && fromModelObject.selectedRelease.alias === 'default'"
    ></DropDownSelect>
  </div>
</template>

<script>
import { selectVersion} from "../model";
import DropDownSelect from "./DropDownSelectEmitOptionIndex.vue";
import {
  selectVersionAndFilterToStateList,
  filterSprintList,
  checkIfSelectedReleaseWasLastInSprintAndRemoveSprintIfItWas,
  getLatestSprintNumber
} from "../model/compare.js";

export default {
  name: "select-to-state-product-set-version",
  props: {
    fromModelObject: {
      type: Object,
      required: true
    },
    toStateModelObject: {
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
      selectVersion,
      getLatestSprintNumber,
      selectVersionAndFilterToStateList,
      filterSprintList,
      checkIfSelectedReleaseWasLastInSprintAndRemoveSprintIfItWas
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