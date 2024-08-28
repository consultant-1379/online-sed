<template>
  <div class="dropdown" id="ip-version">
    <div>
      <b class="tooltip"
      >Select IP Version:
        <i class="icon icon-info"></i>
        <span class="tooltiptext">
          This section allows the user to select The IP address version.
        </span>
      </b>
    </div>
    <DropDownSelect
        :options="modelObject.ipVersions"
        :displaykey="'name'"
        @select="selectIpVersion($event, modelObject)"
        :default_option="modelObject.selectedIpVersion.name"
        :disabled="Object.keys(modelObject.artifactoryRepoData).length === 0"
    ></DropDownSelect>
  </div>
</template>

<script>
import { selectIpVersion } from "../model";
import DropDownSelect from "./DropDownSelectEmitOptionIndex.vue";

export default {
  name: "select-ip-version",
  props: {
    modelObject: {
      type: Object,
      required: true
    }
  },
  components: {DropDownSelect},
  data() {
    return {
      selectIpVersion
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