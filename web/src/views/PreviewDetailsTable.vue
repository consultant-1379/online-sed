<template>

  <ConfirmationDialog
    v-show="this.incompleteValuesWarn"
    @hideChild="this.incompleteValuesWarn=false"
    @continueButtonPressed="this.incompleteValuesWarn=false; submitForm(model, this.$router)"
    @cancelButtonPressed="this.incompleteValuesWarn=false"
  >
    <template #title>Warning</template>
    <template #message>
      <div v-if="model.selectedUseCase.name === 'Upgrade'">
        The data entered contains one or more validation errors. Please proceed with caution!
      </div>
      <div v-if="model.dryRunMode">
        The export will generate an incomplete SED file, this is allowed because you are in Dry-run mode.
        On the next iteration upload this file to the online SED to populate all incomplete values or continue
        working in the Dry-run mode if you wish to take multiple attempts to fully populate SED.
      </div>
    </template>
  </ConfirmationDialog>

  <MessageDialog
    v-show="this.validationIssuesMessage"
    @hideChild="this.validationIssuesMessage=false"
    :buttonText='"Continue"'
  >
    <template #title>Validation issues</template>
    <template #message>
      <div>
        The data entered contains one or more validation issues. Please solve the validation issues and attempt to export.
      </div>
    </template>
  </MessageDialog>


  <div class="content">
    <table class="table">
      <caption id="preview_caption" hidden="hidden">This page gives an overview of all parameter keys and values and their validation.</caption>
      <thead class="table-header">
        <div class="table-top">
          <th class="table-top-left title">
            Categories
          </th>
          <div class="table-top-right">
            <div class="item">
              <router-link to="sitedetails">
                <button class="btn primary">
                  <i class="icon icon-arrow-left"></i>
                  Back
                </button>
              </router-link>
              <button class="btn primary" id="export_button" @click="isThereInvalidFieldsOnExport()" :disabled="validForExport===''">
                <i class="icon icon-download-save"></i>
                Export SED
              </button>
            </div>
            <button class="btn primary wizard-finished" hidden disabled>Finished</button>
          </div>
        </div>
      </thead>
      <div class="btn-group horizontal" id="previewTableButtonGroup">
        <button type="button" id="enable_name_button" class="btn" :class="{ 'active-blue': model.variableNameEnabled }"
                @click="model.variableNameEnabled = !model.variableNameEnabled">
          Show Variable Names
          <b class="tooltip">
            <i class="icon icon-info"></i>
            <span class="tooltiptext">
              This allows the user to display the SED variable name instead of the key.
            </span>
          </b>
        </button>
        <button type="button" id="show_errors_button" class="btn" :class="{ 'active-blue': model.displayErrors }"
                @click="clickDisplay('errors')">
          Show Errors Only
          <b class="tooltip">
            <i class="icon icon-info"></i>
            <span class="tooltiptext">
              This allows the user to filter the table to show only fields with validation errors.
            </span>
          </b>
        </button>
        <button v-if="model.usePreviousSED" type="button" id="show_changes_button" class="btn" :class="{ 'active-blue': model.displayChanged }"
                @click="clickDisplay('changes')">
          Show Changed Entries Only
          <b class="tooltip">
            <i class="icon icon-info"></i>
            <span class="tooltiptext">
              This allows the user to show only entries that have been updated from the value imported.
            </span>
          </b>
        </button>
        <button type="button" id="expand_all_button" class="btn" :class="{ 'active-blue': model.expandCategories }"
                @click="model.expandCategories = !model.expandCategories;">
          Expand Category Validation
          <b class="tooltip">
            <i class="icon icon-info"></i>
            <span class="tooltiptext">
              This allows the user to show the validation details of all categories.
            </span>
          </b>
        </button>
      </div>
      <tbody v-for="sec in model.dataTypeCategories" :key="sec.id" :id="sec.shortName">
      <tr :id="sec.id"
         :class="[
          'rectr',
          expandable ? 'expandable' : '',
          model.expandCategories === true ? sec.collapsed = false : '',
          model.expandCategories === false ? sec.collapsed = true : '',
          (expandable && sec.collapsed) ? 'expanded' : '',]"
          @click="collapseRows(expandable, sec)"
          v-if="shouldDisplaySection(sec)">
        <td><i class="icon icon-more"></i> {{ sec.name }}</td>
      </tr>
      <div class="details" :hidden="sec.collapsed" v-if="shouldDisplaySection(sec)">
        <div class="row key">
          <div class="column sm-12 md-6 lg-4" id="header-name-display">
            <b>Parameter {{ model.variableNameEnabled ? "Key" : "Name" }} </b>
          </div>
          <div class="column sm-12 md-6 lg-3" v-if="model.usePreviousSED">
            <b>Imported Value</b>
          </div>
          <div class="column sm-12 md-6" :class="{ 'lg-3': upgradeColumnWidth, 'lg-5': !upgradeColumnWidth }">
            <b>{{ model.usePreviousSED ? 'New ' : '' }} Value</b>
          </div>
          <div class="notes column sm-12 lg-2" id="header-validation-column">
            <b>Validation</b>
          </div>
        </div>
        <div v-for="question in filterCategory(sec.shortName, model)" :key="question.key">
          <div class="row entry" :id="question.key" v-if="shouldDisplayEntry(question)">
            <div class="column sm-12 md-6 lg-4" id="name-display">
              {{ model.variableNameEnabled ? question.key : question.displayName }}
            </div>
            <div class="column sm-12 md-6 lg-3" id="import-display" style="word-wrap: break-word;"
                 v-if="model.usePreviousSED">
              {{ model.immutableImportedData[question.key] }}
            </div>
            <div class="column sm-12 md-6"
                 id="response-display"
                 :class="{ 'lg-3': upgradeColumnWidth, 'lg-5': !upgradeColumnWidth }"
                 style="word-wrap: break-word;">
              {{ model.response[question.key] }}
            </div>
            <div id="validation-display" class="column sm-12 md-6 lg-2" :class="{ 'fail': !question.isValid }">
              {{ question.isValid ? 'Pass' : 'FAIL' + ' - ' +  question.errorType }}
              <div v-if="question.errorType === 'Duplicate'" @click="model.currentQuestion=question, model.showDuplicatedValues=true" class="moreInfoSelector">
                more info
              </div>
              <div v-else-if="question.errorType === 'Mismatched value'">
                Must match value of {{ question.valueMatchesKey }}
              </div>
            </div>
          </div>
        </div>
      </div>
      </tbody>
    </table>
    <p v-if="noDataToDisplay" class="no-data-message">No data to display</p>
  </div>
  <transition name="dialog" class="dialog">
    <div v-if="model.showDuplicatedValues" @click="model.showDuplicatedValues=false" class="dialog">
      <div class="content">
        <div class="top">
          <div class="title"><strong>Duplicates:</strong></div>
            <div class="right">
              <i @click="model.showDuplicatedValues = false" class="icon icon-cross"></i>
            </div>
          </div>
          <div class="body">
            <div class="timeline">
              <div class="target">
                <div class="content" v-if="model.showDuplicatedValues">
                  <ul>
                    <li v-for="(key, value) in Object.fromEntries(Object.entries(duplicatedValues).filter(key => key.includes(model.response[model.currentQuestion.key])))">
                      <li v-for="item in key">
                        {{item}}
                      </li>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  </transition>
</template>
<script>
import model, {generateYamlResponse} from "../model";
import { filterCategory, submitForm, exportSEDConfirm, getExcludedIps, SED_API_URL } from "../model";
import ConfirmationDialog from "../../src/components/ConfirmationDialog.vue";
import MessageDialog from "../../src/components/MessageDialog.vue";
import axios from 'axios';
import { RouterLink } from 'vue-router'
import yaml from "js-yaml";
import {isFalseOrStringFalse, isTrueOrStringTrue} from "../utils/CENMUtils.js";

export default {
  name: "previewdetails",
  components: {
    ConfirmationDialog,
    RouterLink,
    MessageDialog
  },
  data() {
    return {
      model,
      upgradeColumnWidth: false,
      filterCategory,
      expandable: true,
      incompleteValuesWarn: false,
      validationIssuesMessage: false,
      validationErrors: {},
      errorMessage: "",
      duplicatedValues: {},
      validForExport: "",
    };
  },
  created() {
    this.adjustColumns();
    this.checkValidationErrors();
  },
  computed: {
    noDataToDisplay() {
      for (const sec in this.model.dataTypeCategories) {
        if (this.shouldDisplaySection(this.model.dataTypeCategories[sec])) {
          return false;
        }
      }
      return true;
    }
  },
  methods: {
    submitForm,
    isThereInvalidFieldsOnExport() {
      if (model.schemaForm.some(field => !field.isValid)) {
        if (this.validForExport) {
          this.incompleteValuesWarn = true;
        } else {
          this.validationIssuesMessage = true;
        }
      } else{
        submitForm(model, this.$router);
      }
    },
    adjustColumns() {
      if (model.usePreviousSED) this.upgradeColumnWidth = true;
    },
    collapseRows(expandable, sec) {
      model.expandCategories = null;
      expandable ? (sec.collapsed = !sec.collapsed, sec.collapsed === true ? model.expandCategories = null: '') : null
    },
    clickDisplay(displayProp) {
      model.displayErrors = displayProp === 'errors' ? !model.displayErrors : false;
      model.displayChanged = displayProp === 'changes' ? !model.displayChanged : false;
      model.displayAll = !model.displayErrors && !model.displayChanged;
    },
    displayOnlyInvalidEntries(question) {
      if (!this.isDisplayConditionMet(question, model.response)) {
        return false;
      }
      return !question.isValid;
    },
    checkIfEntryIsDisplayed(question) {
      if (!this.isDisplayConditionMet(question, model.response)) {
        return false;
      }
      if (model.usePreviousSED) {
        if (model.response[question.key] !== model.immutableImportedData[question.key] || !question.isValid) {
          return true;
        }
      }
      return true;
    },
    displayOnlyInvalidSections(sec) {
      const parameters = filterCategory(sec.shortName, model);
      return Object.values(parameters).some(question => this.displayOnlyInvalidEntries(question));
    },
    displayChangedEntries(question) {
      if (!this.isDisplayConditionMet(question, model.response)) {
        return false;
      }
      const inputValue = model.response[question.key];
      const importedDataValue = model.immutableImportedData[question.key];
      if ((inputValue === undefined || inputValue === null || inputValue === "") && (importedDataValue === undefined || importedDataValue === null || importedDataValue === "")) {
        return false;
      }
      return model.usePreviousSED && JSON.stringify(inputValue) !== JSON.stringify(importedDataValue);
    },
    displayOnlySectionsWithChangedValues(sec) {
      if (model.usePreviousSED) {
        const parameters = filterCategory(sec.shortName, model);
        return Object.values(parameters).some(question => this.displayChangedEntries(question));
      }
      return false;
    },
    shouldDisplaySection(sec) {
      return (model.displayAll) || (model.displayErrors && this.displayOnlyInvalidSections(sec)) || (model.displayChanged && this.displayOnlySectionsWithChangedValues(sec));
    },
    shouldDisplayEntry(question) {
      return (model.displayAll && this.checkIfEntryIsDisplayed(question)) || (model.displayErrors && this.displayOnlyInvalidEntries(question)) || (model.displayChanged && this.displayChangedEntries(question));
    },
    isDisplayConditionMet(question, response) {
      if (question.displayIf && !question.displayIf.every(key => isTrueOrStringTrue(response[key]))) {
        delete model.response[question.key]
        return false;
      } else if (question.displayIfNot && !question.displayIfNot.every(key => isFalseOrStringFalse(response[key]))) {
        delete model.response[question.key]
        return false;
      }
      return true;
    },
    async checkValidationErrors(){
      let SEDFileContent = Object.entries(model.response).join('\r\n').replaceAll(',', '=');
      let SEDfileBlob = new Blob([SEDFileContent], {type: 'text/plain'});
      let formData = new FormData();
      let apiUrl = '';
      if (model.selectedProduct.shortName === 'pENM') {
        apiUrl = SED_API_URL + 'validate';
        formData.append('product', model.selectedProduct.shortName);
        formData.append('SEDFile', SEDfileBlob);
      } else {
        apiUrl = SED_API_URL + 'validatecenm';
        await generateYamlResponse(model);
        formData.append('SEDFile', new Blob([yaml.dump(model.updated_data)], {type: 'text/plain'}));
        formData.append('enmDeploymentType', model.selectedSize.name);
        formData.append('csarLite', model.csarLite);
        if (model.importBaseYaml && model.importedBaseYamlContent !== null) {
          formData.append('snapshotBaseValuesYaml', new Blob([yaml.dump(model.importedBaseYamlContent)], {type: 'text/plain'}));
        }
      }
      formData.append('enmVersion', model.selectedVersion.version);
      formData.append('useCase', model.selectedUseCase.name);
      formData.append('includePasswords', model.includePasswords);
      formData.append('ipVersion', model.selectedIpVersion.name);

      let schemaFileBlob = new Blob([JSON.stringify(model.loadedSchema)], {type: 'application/json'});
      formData.append('snapshotSchema', schemaFileBlob);

      getExcludedIps(model).forEach(value => {
        formData.append('exclusionIps[]', value);
      });
      let postOptions = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      axios.post(apiUrl, formData, {postOptions}).then((response) => {
        model.isIncomplete = false;
        this.validForExport = true;
        console.log("Validation passed successfully");
        this.validationErrors = response.data.message['validationErrors'];
        if (this.validationErrors) {
          for (const [key, value] of Object.entries(this.validationErrors['invalidKeyValues'])) {
            const field = model.schemaForm.filter((item) => item.key === value["keyName"]);
            if(field[0]){
              field[0].isValid = false;
              field[0].errorType = "Invalid value";
            }
          }
        }
      }).catch(error => {
        console.error("There was an error!", error.message);
        if (error.response.status === 422) {
          let validationErrorCount = 0;
          this.validationErrors = error.response.data.message['validationErrors'];
          model.schemaForm.forEach((field) => {
             field.isValid = true;
             field.errorType = "";
          });
          if (this.validationErrors) {
            for (const type in this.validationErrors){
              switch(type) {
                case 'missingKeyNames':
                  for (const [key, value] of Object.entries(this.validationErrors[type])) {
                    const field = model.schemaForm.filter((item) => item.key === value);
                    if(field[0]){
                      validationErrorCount += 1;
                      field[0].isValid = false;
                      field[0].errorType = "Required but not provided";
                    }
                  }
                  break;
                case 'requiredKeyValuesNotProvided':
                  for (const [key, value] of Object.entries(this.validationErrors[type])) {
                    const field = model.schemaForm.filter((item) => item.key === value);
                    if(field[0]){
                      validationErrorCount += 1;
                      field[0].isValid = false;
                      field[0].errorType = "Required but no value provided";
                    }
                  }
                  break;
                case 'duplicatedKeyValuesInExclusionIps':
                  for (const [key, value] of Object.entries(this.validationErrors[type])) {
                    const field = model.schemaForm.filter((item) => item.key === value["keyName"]);
                    if(field[0]){
                      validationErrorCount += 1;
                      field[0].isValid = false;
                      field[0].errorType = "IP excluded in Exclusion IPs";
                    }
                  }
                  break;
                case 'duplicatedKeyValues':
                  let duplicatedValues = this.validationErrors[type].reduce(function (r, a) {
                           r[a.keyValue] = r[a.keyValue] || [];
                           r[a.keyValue].push(a.keyName);
                           return r;
                       }, Object.create(null));
                  this.duplicatedValues = duplicatedValues;
                  for (const [key, value] of Object.entries(this.validationErrors[type])) {
                    const field = model.schemaForm.filter((item) => item.key === value["keyName"]);
                    if(field[0]){
                      validationErrorCount += 1;
                      field[0].isValid = false;
                      field[0].errorType = "Duplicate";
                      field[0].duplicatedValues = Object.fromEntries(Object.entries(duplicatedValues).filter(([key]) => key === value["keyName"]));
                    }
                  }
                  break;
                case 'invalidKeyValues':
                  for (const [key, value] of Object.entries(this.validationErrors[type])) {
                    const field = model.schemaForm.filter((item) => item.key === value["keyName"]);
                    if(field[0]){
                      if (model.selectedUseCase.name !== 'Upgrade') {
                        validationErrorCount += 1;
                      }
                      field[0].isValid = false;
                      field[0].errorType = "Invalid value";
                    }
                  }
                  break;
                case 'mismatchedKeyValues':
                  for (const [key, value] of Object.entries(this.validationErrors[type])) {
                    const field = model.schemaForm.filter((item) => item.key === value["keyName"]);
                    if (field[0]) {
                      validationErrorCount += 1;
                      field[0].isValid = false;
                      field[0].errorType = "Mismatched value";
                    }
                  }
                  break;
              }
            }
          }
          if (model.dryRunMode) {
            this.validForExport = true;
          } else {
            this.validForExport = validationErrorCount === 0;
          }
        } else {
          this.errorMessage = error.message;
          console.error("There was an error!", error);
          this.validForExport = "";
        }
      });
    },

  }
};
</script>
<style scoped lang="less">
@import (reference) "@eds/vanilla/variables/light";

.light .table {
  border-spacing: 0;
  border-collapse: separate;
  th {
    border-bottom: none;
  }
  tr td {
    margin: 15px 10px 20px;
    font-size: 14px;
    font-weight: 500;
    border-top: 1px solid #878787;
    border-bottom: none;
  }
  tbody:hover {
    background-color: #dcdcdc;
  }
}

.table-header {
  position: -webkit-sticky;
  position: sticky;
  top: 0px;
  background: #ebebeb;
  .table-top {
    margin-bottom: 10px;
  }
}

.title {
  padding: 15px 0 10px 10px;
  font-size: 16px;
  font-weight: 500;
}

tbody,
.entry {
  border-top: 1px solid #878787;
  border-bottom: none;
}

.entry,
.key {
  font-size: 13px;
}

.key {
  font-weight: 400;
}

.fail {
  font-weight: 500;
  color: #942228;
}

.details {
  padding-bottom: 1.5em;
}

.row {
  margin-left: 4em;
  padding: 0.5em 0em 0.5em 0em;
}

.moreInfoSelector {
  cursor: pointer;
  color: #002561;
  text-decoration: underline;
}

.active-blue {
  color: #fff;
  background-color: #1174e6;
}

#preview_caption {
  text-align: left;
  padding-bottom: 20px;
}

.no-data-message {
  padding-left: 20px;
  font-size: 16px;
}
</style>
