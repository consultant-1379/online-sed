<template>
  <div :class="[category.id === 0 ? 'content' : 'content hidden']">
    <div class="table-header">
      <div>
        <b class="tooltip">
          Toggle Variable Names
          <i class="icon icon-info"></i>
          <span class="tooltiptext">
            This allows the user to display the SED keys of parameters.
          </span>
        </b>
      </div>
      <div class="switchtoggle">
        <label class="switch">
          <input type="checkbox" v-on:click="model.variableNameEnabled=!model.variableNameEnabled" v-model="model.variableNameEnabled">
          <i class="ball"></i>
          <span class ="sw" data-enabled="On" data-disabled="Off"></span>
        </label>
      </div>
      <br/>
      <div class="title space">
        <b>{{ category.name }}</b> &nbsp;
        <div class="block">
          Step
          <span class="current">{{ category.id + 1 }}</span>
          of
          <span class="total">{{ model.dataTypeCategories.length }}</span>
        </div>
      </div>
      <div class="validation-issues-message">
        <span v-if="model.isIncomplete">
          There are validation issues below
        </span>
      </div>
      <div class="row table">
        <div class="column sm-12 md-6 lg-3">
          <p id="header-name-display"><b>Parameter {{ model.variableNameEnabled ? "Key" : "Name" }} </b></p>
        </div>
        <div class="column sm-12 md-6 lg-3">
          <p><b>Parameter Value</b></p>
        </div>
        <div class="column sm-12 md-6 lg-3">
          <p><b>Example Value</b></p>
        </div>
        <div class="notes column sm-12 md-6 lg-3">
         <p><b>Description</b></p>
        </div>
      </div>
    </div>
    <div
      v-for="question in filterCategory(category.shortName, model)"
      :key="question.key"
      :id="question.key"
    >
      <div class="row table" v-if="checkShouldParamBeDisplayed(model, question)">
        <div class="column sm-12 md-6 lg-3">
          <p class="inline" id="name-display">{{ model.variableNameEnabled ? question.key :question.displayName }}</p>
          <span class="tooltip" v-if="question.keys != null">
          <i class="icon icon-info"></i>
            <div class="tooltiptext shape-a" style="height: auto; width: auto; text-align: start;">
              This maps to the following locations in the SED file:
                <ul class= "shape-b" style="color: white;">
                  <li v-for="key in question.keys" :key=key :id=key>
                    {{ key }}
                  </li>
                </ul>
            </div>
          </span>
        </div>
        <div class="column sm-12 md-6 lg-3">
          <div class="input-box" v-if="question.type === 'select'">
            <DropDownSelectList
              :options="question.options"
              :displaykey="'name'"
              :default_option="immutableKeyAndValueMissing(question)? 'None selected' :getDefaultValue(question)"
              :valid="question.isValid"
              :disabled="immutableKeyOrValueMissing(question)"
              :required="question.required"
              @select="selectEnum(question.key, $event)"
            >
            </DropDownSelectList>
          </div>
          <div v-else-if="['array', 'nodeSelector', 'objectArray', 'customObject'].includes(question.type)">
            <button class="input-button btn wrap"
                    :class="isValidObject(model, question) ? '': 'invalid'" id="displayObjectDialog"
                    @click="getDefaultValue(question); displayEntryDialog(question)">
              Add {{question.displayName}}
            </button>
          </div>
          <div v-else-if="question.type === 'kubernetesToleration'">
            <button class="input-button btn wrap"
                    :class="{'invalid': model.response[question.key] && model.response[question.key].some(toleration => getTolerationErrorsCount(toleration, question.tolerationInfo) !== 0)}"
                    id="displayToleration"
                    @click="getDefaultValue(question); displayTolerations(question)">
              Add {{question.displayName}}
            </button>
          </div>
          <div v-else-if="question.type === 'datetime-local'">
            <input :type="question.type"
                   :value="getDateTimeFormatted(getDefaultValue(question))"
                   @blur="updateDate($event, question.key)"
                   :readonly="isQuestionImmutable(model)"
                   :required="question.required"
                   step="1"/>
          </div>
          <div class="input-box" v-else>
            <div v-if="question.type === 'big-text'">
              <textarea
                class = "wrap"
                :type="question.type"
                v-model.trim="model.response[question.key]"
                :required="question.required"
                :placeholder="immutableKeyOrValueMissing(question) ? 'null' : 'Placeholder'"
                :pattern="question.validationPattern"
                :readonly="immutableKeyOrValueMissing(question)"
                :class="[{'invalidReadOnly' : (immutableKeyOrValueMissing(question) && !question.isValid)},
                        (question.isDuplicate || question.inIPExclusionList || !question.isMatching) ? 'invalid' : '']"
                :value="getDefaultValue(question)"
                @focus="question.isFocused = true"
                @blur="question.isFocused = false"
              >
              </textarea>
            </div>
            <div v-else>
              <input
                class = "wrap"
                :type="question.type"
                v-model.trim="model.response[question.key]"
                :required="question.required"
                :placeholder="immutableKeyOrValueMissing(question) ? 'null' : 'Placeholder'"
                :pattern="question.validationPattern"
                :readonly="immutableKeyOrValueMissing(question)"
                :class="[{'invalidReadOnly' : (immutableKeyOrValueMissing(question) && !question.isValid)},
                        (question.isDuplicate || question.inIPExclusionList || !question.isMatching) ? 'invalid' : '']"
                :value="getDefaultValue(question)"
                @focus="question.isFocused = true"
                @blur="question.isFocused = false"
              />
              <span class="icon-background" v-if="question.isPassword" >
                <i class="icon icon-eye"
                  @click="showPassword(question)"/>
              </span>
            </div>
            <div :id="'error_message_' + question.key" class="validation-error-message" v-if="model.response[question.key] != undefined && !question.isFocused && ((question.errorMessage !== '' && !question.isValid) || question.isDuplicate === true || question.inIPExclusionList === true || question.isMatching === false || question.immutable)">
              <div v-if="question.inIPExclusionList === true" > Invalid entry. This value is included in the IP exclusion list. Please enter a unique value.</div>
              <div v-if="question.isDuplicate === true && isUsedInFromState(question) && question.inIPExclusionList !== true" > This value is used in the from state SED and cannot be used again in this upgrade. Please enter a different value.</div>
              <div v-else-if="question.isDuplicate === true && question.inIPExclusionList !== true" > Duplicate Entry Error. See preview page for details.</div>
              <div v-if="question.isMatching === false && model.response[question.key] !== '' && model.response[question.valueMatchesKey] !== ''" >Invalid entry. Value must match the key {{ question.valueMatchesKey }} which has the value: {{ model.response[question.valueMatchesKey] }}</div>
              <div v-if="question.errorMessage !== '' && !question.isValid && question.isDuplicate !== true && question.isMatching !== false" >{{ question.errorMessage }}</div>
            </div>
          </div>
        </div>
        <div class="column sm-12 md-6 lg-3" style="word-wrap: break-word;">
          <p>{{ question.example }}</p>
        </div>
        <div class="column sm-12 md-6 lg-3">
          <p>{{ question.validationMessage }}
          <div v-if="question.longDescription || question.htmlDescription" @click="model.currentQuestion=question, model.showDescriptionModal=true" class="moreInfoSelector">
                  more info
          </div>
          <div v-if="question.immutable && model.selectedUseCase.name === 'Upgrade'">
            Immutable parameter values cannot be edited when populating from previous SED file.
          </div>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import model, {
  checkIpInExclusionIps,
  checkDuplicates,
  isValidObject,
  filterCategory,
  checkShouldParamBeDisplayed,
  updateRequiredProperty,
  isQuestionImmutable
} from "../model";
import DropDownSelectList from "./DropDownSelectEmitOption.vue";
import {getDateTimeFormatted, getTolerationErrorsCount} from "../utils/CENMUtils.js";

export default {
  name: "site-detail-entry",
  props: ["category"],
  components: {
    DropDownSelectList
  },
  data() {
    return {
      model,
    };
  },
  methods: {
    isQuestionImmutable,
    getTolerationErrorsCount,
    isValidObject,
    checkShouldParamBeDisplayed,
    checkDuplicates,
    checkIpInExclusionIps,
    filterCategory,
    setOptionalKeysRequireValue(key, val) {
      if (model.displayKeys.includes(key)) {
        model.schemaForm.filter( question => {
          if (question.displayIf && question.displayIf.includes(key)) {
            updateRequiredProperty(model, question);
            if ( val.name === "false" ) {
              if (question.key in model.response && (model.response[question.key] === "true" || model.response[question.key] === "false")) {
                model.response[question.key] = "false";
              } else {
                delete model.response[question.key];
              }
            }
          }
        });
      }
    },
    selectEnum(key, val) {
      model.response[key] = val.name;
      this.setOptionalKeysRequireValue(key, val);
    },
    showPassword(key) {
      if (key.type === "password") {
        key.type = "string";
      } else {
        key.type = "password";
      }
    },
    isUsedInFromState(question) {
      var allEntries = Object.entries(model.response);
      var usedEntries = Object.fromEntries(allEntries.filter(([key, value]) => !key.includes("_ipaddress_start") && !key.includes("_ipaddress_end")));
      var usedValues = Object.values(usedEntries);
      var ipAddressUses = usedValues.filter(entry => entry === model.response[question.key]).length;
      if (ipAddressUses > 1) {
        return false;
      }
      return true;
    },
    displayEntryDialog(question) {
      model.currentQuestion=question;
      model.showObjectDialog=true;
      isValidObject(model, question);
    },
    displayTolerations(question) {
      model.currentQuestion=question;
      model.showTolerationDialog=true;
    },
    immutableKeyOrValueMissing(question) {
      return model.selectedUseCase.name === 'Upgrade' && question.immutable && (model.importedData[question.key] !== undefined);
    },
    immutableKeyAndValueMissing(question) {
      return model.selectedUseCase.name === 'Upgrade' && question.immutable && !question.isValid;
    },
    getDefaultValue(question) {
      const response = model.response[question.key];
      if (response === undefined){
        if(question.defaultValue !== undefined) {
          model.response[question.key] = question.defaultValue;
          return question.defaultValue;
        } else {
          return "";
        }
      } else {
        return response.toString();
      }
    },
    updateDate(event, key) {
      model.response[key] = getDateTimeFormatted(event.target.value);
    }
  }
};
</script>
<style>
.moreInfoSelector {
  cursor: pointer;
  color: #002561;
  text-decoration: underline;
}

.icon-background {
  background-color: #ffffff;
  margin: 0 0 0 -30px;
  padding-left: 3px;
  cursor: pointer;
}

.validation-error-message {
  color: #bb0b02;
  padding-top: 2px;
  font-size: 12px;
}

.column {
  transition: max-width 0.25s ease-in-out;
}

.variable-name {
  padding-left: 1em;
}

.switchtoggle {
  padding: 11px 0px 0px 22px;
}

.ball {
  padding: 2px 0px 0px 2px;
}

.input-button {
  width: 175px;
  font-family: "Ericsson Hilda",Helvetica,sans-serif;
  font-weight: 400;
  font-size: 14px;
  padding: 6px 7px 5px;
  margin: 0;
}

.validation-issues-message {
  color: #bb0b02;
  padding-top: 2px;
  font-size: 16px;
}

.light input[type=number] {
  width: 175px;
  -moz-appearance: textfield;
}

.btn.invalid{
  border: 2px solid #bb0b02;
}

.shape-a {
 white-space: nowrap;
 padding: 10px;
}

.shape-b {
 list-style-type: square;
 margin-bottom: 4px;
}

.table-header {
 position: sticky;
 top: 0;
 z-index: 1;
 background-color: #ebebeb;
}

.space {
 padding-bottom: 10px;
 font-size: 16px;
}

.block {
 display: inline-block;
 font-size: 12px;
 opacity: 0.6;
}

.invalidReadOnly {
  border: 1px solid #bb0b02 !important;
  padding: 5px 7px 4px !important;
}

.inline {
 display: inline;
}

.wrap {
 max-width: 100%;
}

.light textarea:invalid:not(.pristine) {
 border: 2px solid #bb0b02;
}
</style>
