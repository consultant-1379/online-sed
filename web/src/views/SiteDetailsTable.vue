<template>
  <!-- Wizard -->
  <div id="siteDetailsWizard" class="wizard">
    <!-- Steps -->
    <div class="wizard-steps">
      <div class="arrow left">
        <i class="icon icon-arrow-left"></i>
      </div>

      <div class="steps">
        <div
          v-for="category in model.dataTypeCategories"
          :key="category.id"
          class="step"
        >
          <div class="prevbar"></div>
          <div class="nextbar"></div>
          <div class="sphere"></div>
          <div class="description">{{ category.id +1 }}. {{ category.name }}</div>
        </div>
      </div>

      <div class="arrow right visible">
        <i class="icon icon-arrow-right"></i>
      </div>
    </div>
    <!-- Wizard Contents -->
    <div class="wizard-content" >
      <SiteDetailEntry
        v-for="category in model.dataTypeCategories"
        :key="category.id"
        :category="category"
      >
      </SiteDetailEntry>
    </div>

    <!-- Wizard footer -->
    <div class="wizard-footer">
      <div class="item">
        <button class="btn" hidden>Cancel</button>
      </div>

      <div class="item">
        <button class="btn wizard-previous"
        >
          <i class="icon icon-arrow-left"></i>
          <span class="term">Previous</span>
        </button>
        <button
          class="btn primary wizard-next"
          @click="scrollToTop();"
          id="next"
          :disabled="!allFieldsPopulatedCorrectly(model)"
        >
          <span class="term">Next</span>
          <i class="icon icon-arrow-right"></i>
        </button>
        <button
          class="btn primary"
          :disabled="!allFieldsPopulatedCorrectly(model)"
          :hidden="model.wizardCurrentStep !== model.dataTypeCategories.length - 1"
          @click="this.$router.push('/previewexport')"
        >
          <span class="term">Continue</span>
        </button>
        <button class="btn primary wizard-finish" hidden disabled>Finish</button>
        <button class="btn primary wizard-finished" hidden disabled>Finished</button>
      </div>
    </div>
  </div>
  <transition name="objectDialogTransition" class="dialog">
    <div v-if="model.showObjectDialog" id="objectDialog" class="dialog">
      <div class="content">
        <div class="top dialogTop">
          <div class="title">
            <strong>{{model.currentQuestion.displayName}}</strong>
            <div v-if="model.currentQuestion.longDescription || model.currentQuestion.htmlDescription" @click="model.showDescriptionModal=true" class="moreInfoSelector">
              More information
            </div>
          </div>
          <i v-if="model.currentQuestion.type==='nodeSelector'" id="closeBtn" @click="$refs.NodeSelector.close" class="icon icon-cross"></i>
          <i v-else-if="model.currentQuestion.type==='customObject'" id="closeBtn" @click="$refs.CustomObject.close" class="icon icon-cross"></i>
          <i v-else-if="model.currentQuestion.type==='array'" id="closeBtn" @click="$refs.ArrayObject.close" class="icon icon-cross"></i>
          <i v-else-if="model.currentQuestion.type==='objectArray'" id="closeBtn" @click="$refs.ObjectArray.close" class="icon icon-cross"></i>
        </div>
        <div>
          <p>
            {{model.currentQuestion.validationMessage}}<br>
            Select <strong>SAVE</strong> to save the {{model.currentQuestion.displayName}}. If there is any invalid record, changes will not be saved.<br>
          </p>
        </div>
        <div class="body">
          <div class="timeline">
            <div class="target">
              <NodeSelector v-if="model.currentQuestion.type==='nodeSelector'" ref="NodeSelector"></NodeSelector>
              <CustomObject v-if="model.currentQuestion.type==='customObject'" ref="CustomObject"></CustomObject>
              <ArrayDialog v-if="model.currentQuestion.type==='array'" ref="ArrayObject"></ArrayDialog>
              <ObjectArray v-if="model.currentQuestion.type==='objectArray'" ref="ObjectArray"></ObjectArray>
              <div v-if="isQuestionImmutable(model)">
                Immutable parameter values cannot be edited when populating from previous SED file.
              </div>
            </div>
          </div>
        </div>
        <div class="bottom">
          <div v-if="model.currentQuestion.type==='nodeSelector'">
            <button
              @click="$refs.NodeSelector.addRow" class="btn primary no-margin-left" id="addBtn" :disabled="isQuestionImmutable(model)">
              Add entry
            </button>
            <button @click="$refs.NodeSelector.save" class="btn primary" id="saveBtn" :disabled="isQuestionImmutable(model)">
              Save
            </button>
          </div>
          <div v-if="model.currentQuestion.type==='objectArray'">
            <button
              @click="$refs.ObjectArray.addRow" class="btn primary no-margin-left" id="addBtn" :disabled="isQuestionImmutable(model)">
              Add entry
            </button>
            <button @click="$refs.ObjectArray.save" class="btn primary" id="saveBtn" :disabled="isQuestionImmutable(model)">
              Save
            </button>
          </div>
          <div v-else-if="model.currentQuestion.type==='array'">
            <button @click="$refs.ArrayObject.addRow" class="btn primary no-margin-left" id="addBtn" :disabled="isQuestionImmutable(model)">
              Add entry
            </button>
            <button @click="$refs.ArrayObject.save" class="btn primary" id="saveBtn" :disabled="isQuestionImmutable(model)">Save</button>
          </div>
          <div v-else-if="model.currentQuestion.type==='customObject'">
            <button @click="$refs.CustomObject.addRow" class="btn primary no-margin-left" id="addBtnCustObj" :disabled="isQuestionImmutable(model)">
              Add entry
            </button>
            <button @click="$refs.CustomObject.save" class="btn primary" id="saveBtnCustomObj" :disabled="isQuestionImmutable(model)">Save</button>
          </div>
        </div>
      </div>
    </div>
  </transition>
  <transition name="dialog">
    <div v-if="model.showTolerationDialog" id="displayTolerationInputDialog" class="dialog">
      <div class="content">
        <div class="top dialogTop">
          <div class="title">
            <strong>{{model.currentQuestion.displayName}}</strong>
          </div>
          <i id="closeTolerationBtn" @click="$refs.KubernetesToleration.close" class="icon icon-cross"></i>
        </div>
        <div>
          <p>
            {{model.currentQuestion.validationMessage}}<br>
            Select <strong>SAVE</strong> to save changes.<br>
          </p>
        </div>
        <div class="body">
          <div class="timeline">
            <div class="target">
              <KubernetesToleration
                  ref="KubernetesToleration"
                  :tolerations="model.response[model.currentQuestion.key]"
                  :sedParam="model.currentQuestion"
                  :existingTolerations="model.response[model.currentQuestion.key]">
              </KubernetesToleration>
            </div>
          </div>
        </div>
        <div class="bottom">
          <button @click="$refs.KubernetesToleration.addToleration" class="btn primary no-margin-left" id="addTolerationBtn" :disabled="isQuestionImmutable(model)">Add entry</button>
          <button @click="$refs.KubernetesToleration.save" class="btn primary" id="saveTolerationBtn" :disabled="isQuestionImmutable(model)">Save</button>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
import model, {checkIpInExclusionIps, checkDuplicates, isQuestionImmutable, isValidIp, isValidToleration, isValidObject} from "../model";
import NodeSelector from "../../src/components/NodeSelector.vue";
import ArrayDialog from "../../src/components/ArrayDialog.vue";
import ObjectArray from "../../src/components/ObjectArray.vue";
import CustomObject from "../../src/components/CustomObject.vue";
import KubernetesToleration from "../../src/components/KubernetesToleration.vue";
import { Wizard } from "@eds/vanilla";

export default {
  name: "site-details",
  components: {
    NodeSelector,
    ArrayDialog,
    ObjectArray,
    CustomObject,
    KubernetesToleration
  },
  data() {
    return {
      model,
    };
  },
  mounted() {
    this.$nextTick(() => {
      const wizardDom = document.getElementById("siteDetailsWizard");
      if (wizardDom) {
        const wizard = new Wizard(wizardDom);
        wizard.init();
        wizard.goToStep(model.wizardCurrentStep);
        wizardDom.addEventListener('wizardState', (evt) => model.wizardCurrentStep = wizard.steps.state.currentStep);
      }
    });
  },
  methods: {
    checkDuplicates,
    checkIpInExclusionIps,
    isQuestionImmutable,
    scrollToTop(){
      document.querySelector('.wizard-content').scrollTo(0,0);
    },
    isTrueOrStringTrue(value) {
      return value === true || value === "true";
    },
    allFieldsPopulatedCorrectly(model) {
      const { dataTypeCategories, schemaForm, response } = model;
      let invalidFields = [];
      let category = dataTypeCategories[model.wizardCurrentStep].shortName;
      let fields = schemaForm.filter((dict) => dict.category === category);
        fields.forEach((field) => {
          field.isValid = true;
          field.inIPExclusionList = false;
          if (field.displayIf && !field.displayIf.every(key => this.isTrueOrStringTrue(response[key]))) {
            if (field.type !== "select") {
              delete response[field.key];
            }
            return;
          }
          if(field.type) {
            if (field.type === "object") {
              return;
            }
            if (field.type === "kubernetesToleration") {
              if (response[field.key] !== undefined && !response[field.key].every(toleration => isValidToleration(toleration, field, false))) {
                invalidFields.push(field.key);
              }
              return;
            }
            if (['array', 'nodeSelector', 'objectArray', 'customObject'].includes(field.type)) {
              if (response[field.key] !== undefined && !isValidObject(model, field)) {
                invalidFields.push(field.key);
              }
              return;
            }
          }
          if (isValidIp(response[field.key])) {
            if (this.checkIpInExclusionIps(model, response[field.key]) > 0){
              field.inIPExclusionList = true;
              invalidFields.push(field.key);
            }
          }
          if (field.preventDuplicates === true) {
            field.isDuplicate = false;
            if (this.checkDuplicates(model,field,response) === true && response[field.key] !== undefined) {
              field.isDuplicate = true;
              field.isValid = false;
              invalidFields.push(field.key);
            }
          }
          if (field.required && (response[field.key] === undefined || response[field.key] === "")) {
            field.isValid = false;
            invalidFields.push(field.key);
          }
          if (field.key in response && response[field.key] !== "" && response[field.key] !== undefined && !new RegExp(field.validationPattern).test(response[field.key])) {
            field.isValid = false;
            if (model.selectedUseCase.name !== 'Upgrade' || model.selectedProduct.shortName === 'cENM') {
              invalidFields.push(field.key);
            }
          }
          if (field.key in response && new RegExp(field.validationPattern).test(response[field.key]) && field.valueMatchesKey !== undefined) {
            if (response[field.key] !== response[field.valueMatchesKey] && response[field.valueMatchesKey] !== undefined) {
              field.isValid = false;
              field.isMatching = false;
              invalidFields.push(field.key);
            } else {
              field.isMatching = true;
            }
          }
        });
      model.isIncomplete = invalidFields.length !== 0;
      return true;
    }
  },
};
</script>
<style lang="less">
.light .dialog {
  transition: opacity 0.3s ease;
  visibility: visible;
  opacity: 1;
  & > .content {
    transition: all 0.3s ease;
    opacity: 1;
    display: flex;
    max-height: 80%;
    max-width: 80%;
    & > .top {
      margin-bottom: 16px;
    }
    & > .body {
      padding: 0;
      margin: 0;
    }
  }
  &.dialog-enter-from,
  &.dialog-leave-to {
    opacity: 0;
  }
  &.dialog-leave-active .content {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
  }
}

.info-table{
  border-collapse: collapse;
}

th{
  border-bottom: 1px solid black;
  background-color: #ebebeb;
  padding:8px;
  text-align: left;
}

td{
  padding: 8px;
  border-bottom: 1px solid black;
}

table{
  border-bottom: 1px solid black;
  table-layout: fixed;
  width: 100%;
}

.column{
  word-wrap: break-word
}

.light .notifications-wrapper {
  z-index: 100;
}

.dialogTop {
  display: flex;
  justify-content: space-between;
}
</style>
