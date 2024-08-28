<template>
  <div class="tile">
    <div class="content">
      <p>
        This tool generates a Site Engineering Data (SED) file. It is imperative for the user
        of this tool to use the correct setup specific to their deployment. If you wish to
        take several attempts on SED creation switch on the Dry-run mode.
      </p>
      <br />
      <div id="dry-run">
        <TooltipSelector
          :switchMethod="() => {  model.dryRunMode = !model.dryRunMode; }"
          :switchState="model.dryRunMode"
          :key="model.dryRunMode"
          class="tooltip-switch"
        >
          <template #tooltip-title>Switch Dry-run Mode: </template>
          <template #tooltip-text>
            Dry-run mode should never be enabled when creating the SED that will be used for actual deployment activities.
            The purpose of "Dry-run mode" is only to create a partially populated SED (in a single browser session) or to skip validation checks.
            This should never be used to create the SED file to be used on the deployment.
          </template>
        </TooltipSelector>
      </div>
      <br>
      <SelectProduct :modelObject="model"></SelectProduct>
      <br>
      <div v-if="model.selectedProduct.shortName === 'pENM' || model.selectedProduct.alias === 'default'" id="include-passwords">
        <TooltipSelector
            :switchMethod="() => { model.includePasswords = !model.includePasswords; model.isModelReady = false}"
            :switchState="!model.includePasswords"
            :key="model.includePasswords"
            onText="Exclude"
            offText="Include"
            class="tooltip-switch"
        >
          <template #tooltip-title>Exclude Passwords in SED: </template>
          <template #tooltip-text>Allows the user to remove all passwords from this tool and the exported SED file.
            Passwords should be excluded for standard ENM Upgrade and ENM Firmware Upgrade only. For any other deployment or administration activities this must be set to 'Include'.
          </template>
        </TooltipSelector>
      </div>
      <div v-if="'useCaseOptions' in model.selectedProduct" class="dropdown" id="use-case">
        <div>
          <b class="tooltip"
          >Select Use Case:
            <i class="icon icon-info"></i>
            <span class="tooltiptext">
              This section allows the user to select the required Use Case.
            </span>
          </b>
        </div>
        <DropDownSelect
            :options="model.selectedProduct.useCaseOptions"
            :displaykey="'name'"
            @select="model.selectedUseCase = model.selectedProduct.useCaseOptions[$event]"
            :default_option="model.selectedUseCase.name"
            :disabled="model.selectedProduct.alias==='default'"
        ></DropDownSelect>
      </div>
      <br>
      <SelectReleaseSprintNumber :modelObject="model"></SelectReleaseSprintNumber>
      <br>
      <SelectProductSetVersion :modelObject="model"></SelectProductSetVersion>
      <br>
      <SelectIpVersion :modelObject="model"></SelectIpVersion>
      <br>
      <div v-if="model.targetAudience === 'pdu'" id="upload-schema-selector">
        <TooltipSelector
          :switchMethod="
          () => {
            model.schemaFromFileMode = !model.schemaFromFileMode;
          }
          "
          :switchState="model.schemaFromFileMode"
          :key="model.schemaFromFileMode"
          class="tooltip-switch"
        >
          <template #tooltip-title>Upload schema from file: </template>
          <template #tooltip-text>
            This allows the upload of a schema file</template
          >
        </TooltipSelector>
      </div>
      <br>
      <div v-if="model.schemaFromFileMode">
        <div style="margin-bottom: 1.5em">
          <div id="drag-schema-file" class="drag-file" @dragover="dragoverFile" @dragleave="dragleaveFile" @drop.prevent @drop="dropSchemaFile">
          <span class="btn" @click="loadFileFromLocalSchemaFile(model)">
            <i class="icon icon-upload"></i>
            Choose JSON Schema file
          </span>
            <br>
            <b style="padding: 20px">Or</b>
            <br>
            Drag JSON Schema file here
          </div>
          <div class="file-name" v-if="model.importedSchemaFileName !== null">
          <span id="file-name"><b>File Name:</b> {{ model.importedSchemaFileName }}</span
          ><i class="icon icon-check"></i>
          </div>
        </div>
        <br/>
        <div v-if="model.selectedProduct.sedFileFormat === 'yaml'" id="upload-base-yaml-selector">
          <TooltipSelector
              :switchMethod="
              () => {
                model.importBaseYaml = !model.importBaseYaml;
              }
              "
              :switchState="model.importBaseYaml"
              :key="model.importBaseYaml"
              class="tooltip-switch"
          >
            <template #tooltip-title>Upload integration values file template: </template>
            <template #tooltip-text>
              This allows the upload of a snapshot values file with changes not yet released to published values files.</template
            >
          </TooltipSelector>
          <div v-if="model.importBaseYaml">
            <div id="drag-yaml-template-file" class="drag-file" @dragover="dragoverFile" @dragleave="dragleaveFile" @drop.prevent @drop="dropBaseYamlTemplate">
              <span class="btn" @click="loadFileFromLocalBaseTemplateFile(model)">
                <i class="icon icon-upload"></i>
                Choose Yaml file
              </span>
              <br>
              <b style="padding: 20px">Or</b>
              <br>
              Drag Yaml file here
            </div>
            <div class="file-name" v-if="model.importedBaseYamlFileName !== null">
              <span id="file-name"><b>File Name:</b> {{ model.importedBaseYamlFileName }}</span
              ><i class="icon icon-check"></i>
            </div>
          </div>
        </div>
        <br>
      </div>
      <div v-if="model.targetAudience === 'pdu' && model.selectedProduct.sedFileFormat === 'yaml'" id="csar-lite">
        <TooltipSelector
            :switchMethod="() => {  model.csarLite = !model.csarLite; }"
            :switchState="model.csarLite"
            :key="model.csarLite"
            class="tooltip-switch"
        >
          <template #tooltip-title>CSAR Lite:</template>
          <template #tooltip-text>
            This toggle flag should be enabled when using 'CSAR Lite' to deploy Cloud Native ENM, otherwise keep it disabled.
          </template>
        </TooltipSelector>
      </div>
      <!-- Deployment Size selection is still required when uploading a schema as the size is not always known. -->
      <div v-if="!model.schemaFromFileMode || model.targetAudience === 'pdu'">
        <SelectSchema :modelObject="model"></SelectSchema>
        <br />
      </div>
      <div
        class="dropdown"
        id="upgrade"
        v-show="model.selectedSchema.alias !== 'default'"
      >
        <TooltipSelector
          :switchMethod="
          () => {
            togglePreviousSED(model);
          }
          "
          :switchState="model.usePreviousSED"
          :key="model.usePreviousSED"
          class="tooltip-switch"
        >
          <template #tooltip-title>Populate from previous SED: </template>
          <template #tooltip-text
            >This section allows the user to load values from existing complete or
            incomplete SED file.
            <div v-if="model.selectedUseCase.name === 'Upgrade' && model.selectedProduct.shortName === 'cENM'">
            Immutable parameters with existing values in the 'From State' file cannot be updated on an Upgrade use case. </div></template
          >
        </TooltipSelector>
      </div>
      <br />

      <div v-show="model.usePreviousSED && model.selectedSchema.alias !== 'default'">
        <div style="margin-bottom: 1.5em">
          <div id="drag-sed-file" class="drag-file" @dragover="dragoverFile" @dragleave="dragleaveFile" @drop.prevent @drop="dropSEDFile">
            <span class="btn" @click="loadFileFromLocalSEDFile(model)">
              <i class="icon icon-upload"></i>
              Choose SED file
            </span>
            <br /><br />
            <b style="padding: 20px">Or</b>
            <br /><br />
            Drag SED file here
          </div>
          <div class="file-name" v-if="model.importedFileContent !== null">
            <span id="file-name"><b>File Name:</b> {{ model.importedFileName }}</span
            ><i class="icon icon-check"></i>
          </div>
        </div>
      </div>
      <br />

      <div>
        <div>
          <button
            class="btn primary setup-deployment-btn"
            v-on:click="setupDeployment(model, this.$router)"
            :disabled="computeSetupDeploymentButtonDisabled"
          >
            Setup Deployment
          </button>
        </div>
      </div>
    </div>
  </div>

  <ConfirmationDialog
    v-show="model.showDeleteAllDataConfirmation"
    @hideChild="model.showDeleteAllDataConfirmation = false"
    @continueButtonPressed="deleteAllDataDialogOkFunction(model, this.$router);model.showDeleteAllDataConfirmation = false"
    @cancelButtonPressed="deleteAllDataDialogCancelFunction(model, this.$router);model.showDeleteAllDataConfirmation = false"
  >
    <template #title>Warning</template>
    <template #message>Changing deployment setup configuration will delete currently entered data.</template>
  </ConfirmationDialog>

  <MessageDialog
    v-show="model.showpENMSizeMismatchNotification"
    @hideChild="model.showpENMSizeMismatchNotification = false"
  >
    <template #title>ENM Deployment Size must match</template>
    <template #message
      >Please ensure the selected ENM Deployment Size is same as the environment_model
      value on the imported file.</template
    >
  </MessageDialog>

  <MessageDialog
    v-show="model.showcENMSizeMismatchNotification"
    @hideChild="model.showcENMSizeMismatchNotification = false"
  >
    <template #title>ENM Deployment Type must match</template>
    <template #message
      >Please ensure the selected ENM Deployment Type is same as the enm_deployment_type
      value on the imported file.</template
    >
  </MessageDialog>

  <MessageDialog
    v-show="model.showIpVersionMismatchNotification"
    @hideChild="model.showIpVersionMismatchNotification = false"
  >
    <template #title>IP Versions must match</template>
    <template #message
      >Please ensure the selected IP Version is same as the IP version value on
      the imported file.</template
    >
  </MessageDialog>

  <MessageDialog
    v-show="model.showPreviousSedFileNeeded"
    @hideChild="model.showPreviousSedFileNeeded = false"
    @ConfirmButtonPressed="model.usePreviousSED = true;"
  >
    <template #title>Previous SED file must be uploaded</template>
    <template #message
      >When the use case is Upgrade, please ensure to enable 'Populate from previous SED'
      and import a file.</template
    >
  </MessageDialog>
</template>

<script>
import {
  setupDeployment,
  selectProduct,
  selectSize,
  selectIpVersion,
  selectVersion,
  selectSprint,
  selectRelease,
  togglePreviousSED,
  loadFileFromLocalSEDFile,
  dragFileFromLocalSEDFile,
  loadFileFromLocalSchemaFile,
  dragFileFromLocalSchemaFile,
  deleteAllDataDialogOkFunction,
  deleteAllDataDialogCancelFunction,
  selectSchema,
  loadFileFromLocalBaseTemplateFile,
  readBaseYamlTemplateFile
} from "../model";
import versionHistory from "../model/versionHistory";
import model from "../model";
import DropDownSelect from "../../src/components/DropDownSelectEmitOptionIndex.vue";
import MessageDialog from "../../src/components/MessageDialog.vue";
import ConfirmationDialog from "../../src/components/ConfirmationDialog.vue";
import TooltipSelector from "../../src/components/TooltipSelector.vue";
import SelectReleaseSprintNumber from "../components/SelectReleaseSprintNumber.vue";
import SelectProductSetVersion from "../components/SelectProductSetVersion.vue";
import SelectIpVersion from "../components/SelectIpVersion.vue";
import SelectSchema from "../components/SelectSchema.vue";

export default {
  name: "deploymentsetup",
  components: {
    TooltipSelector,
    DropDownSelect,
    ConfirmationDialog,
    MessageDialog,
    SelectReleaseSprintNumber,
    SelectProductSetVersion,
    SelectIpVersion,
    SelectSchema
  },
  data: () => ({
    model,
    versionHistory,
    selectProduct,
    selectSize,
    selectIpVersion,
    selectVersion,
    selectSprint,
    selectRelease,
    selectSchema,
    setupDeployment,
    togglePreviousSED,
    loadFileFromLocalSEDFile,
    loadFileFromLocalSchemaFile,
    deleteAllDataDialogOkFunction,
    deleteAllDataDialogCancelFunction,
    default_select: "Please select...",
  }),
  computed: {
    computeSetupDeploymentButtonDisabled() {
      if (model.selectedSchema.alias === "default") {
        return true;
      }
      if (model.usePreviousSED && !model.importedFileContent) {
        return true;
      }
      if (model.selectedUseCase.name === 'Upgrade' && !model.usePreviousSED) {
        return true;
      }
      if (model.schemaFromFileMode && !model.importedSchemaFileName) {
        return true;
      }
      if (model.importBaseYaml && !model.importedBaseYamlContent) {
        return true;
      }
      return false;
    },
  },
  methods: {
    loadFileFromLocalBaseTemplateFile,
    dropSEDFile(ev) {
      if (model.usePreviousSED && model.selectedSize.alias !== "default") {
        dragFileFromLocalSEDFile(ev, model);
      }
      ev.currentTarget.classList.remove('border-highlight');
    },
    dropSchemaFile(ev) {
      dragFileFromLocalSchemaFile(ev, model);
      ev.currentTarget.classList.remove('border-highlight');
    },
    dropBaseYamlTemplate(ev) {
      readBaseYamlTemplateFile(ev, model, "drop");
      ev.currentTarget.classList.remove('border-highlight');
    },
    dragoverFile(ev) {
      ev.preventDefault();
      ev.currentTarget.classList.add('border-highlight');
    },
    dragleaveFile(ev) {
      ev.preventDefault();
      ev.currentTarget.classList.remove('border-highlight');
    },
    filterSizes(sizes) {
      if (model.targetAudience !== "pdu") {
        const ii = sizes.findIndex(e => e.name === 'test');
        if (ii > -1) {
          sizes.splice(ii, 1)
        }
      }
      return sizes
    },
    selectUseCase(model, vid){
      model.selectedUseCase = model.selectedProduct.useCaseOptions[vid];
      model.importedFileContent = null;
      model.isModelReady = false;
    }
  },
};
</script>

<style scoped lang="less">
.content {
  margin-left: 20px;
}
.dropdown {
  padding-top: 20px;
}
.content {
  align-items: center;
}
.select {
  padding: 11px 22px 11px 22px;
  max-width: 420px;
  width: 420px;
}
.select .options-list {
  max-width: 272px;
}

.drag-file {
  padding: 25px;
  margin: 5px;
  border: dashed 1px #242424;
  border-radius: 3px;
  max-width: 320px;
  text-align: center;
}

.border-highlight {
  border: dashed 2px blue;
  border-radius: 10px;
}

.file-name {
  margin: 10px;
  #file-name {
    margin: 5px;
  }
}

.setup-deployment-btn {
  margin-bottom: 10px;
}
</style>
