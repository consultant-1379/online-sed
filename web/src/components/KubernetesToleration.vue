<template>
  <div class="content">
    <br>
    <div>
      <div id="tolerationNoRec" v-if="this.localTolerations.length===0">
        <p>No record.</p>
      </div>
      <table class="table" id="tolerationsTable" v-else>
        <thead>
          <tr>
            <th>Key</th>
            <th>Operator</th>
            <th>Value</th>
            <th>Effect</th>
            <th v-if="sedParam.tolerationInfo.tolerationSeconds">Toleration Seconds</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(toleration, index) in this.localTolerations" :key="index">
            <td :id="'toleration-key-' + index">
              <input
                  v-model.trim="toleration.key"
                  :type="sedParam.tolerationInfo.key.type"
                  :required="sedParam.tolerationInfo.key.required"
                  :pattern="sedParam.tolerationInfo.key.validationPattern"
                  placeholder="Placeholder"
                  :readonly="isQuestionImmutable(model)"
                  />
              <div class="validation-error-message" v-if="!validateEntry(toleration, 'key', sedParam.tolerationInfo.key.validationPattern)">
                <span :id="'error-message-toleration-key-' + index">
                  {{ sedParam.tolerationInfo.key.errorMessage }}
                </span>
              </div>
            </td>
            <td>
              <div :id="'toleration-operator-' + index" class="select" data-type="single">
                <button class="btn current-options" type="button" :disabled="isQuestionImmutable(model)">{{ toleration.operator || 'Please select...' }}</button>
                <div class="options-list">
                  <div v-for="option in sedParam.tolerationInfo.operator.options" :key="option" class="item">{{ option }}</div>
                </div>
              </div>
            </td>
            <td class="input-box" :id="'toleration-value-' + index">
              <input
                  :disabled="toleration.operator !== 'Equal'"
                  v-model.trim="toleration.value"
                  :type="sedParam.tolerationInfo.value.type"
                  :pattern="sedParam.tolerationInfo.value.validationPattern"
                  :required="toleration.operator === 'Equal'"
                  placeholder="Placeholder"
                  :readonly="isQuestionImmutable(model)"/>
              <div class="validation-error-message" v-if="!validateEntry(toleration, 'value', sedParam.tolerationInfo.value.validationPattern)">
                <span :id="'error-message-toleration-value-' + index">
                  {{ sedParam.tolerationInfo.value.errorMessage }}
                </span>
              </div>
            </td>
            <td>
              <div :id="'toleration-effect-' + index" class="select" data-type="single">
                <button class="btn current-options" type="button" :disabled="isQuestionImmutable(model)">{{ toleration.effect || 'Please select...' }}</button>
                <div class="options-list">
                  <div v-for="option in sedParam.tolerationInfo.effect.options" :key="option" class="item">{{ option }}</div>
                </div>
              </div>
            </td>
            <td v-if="sedParam.tolerationInfo.tolerationSeconds" class="input-box" :id="'toleration-seconds-' + index">
              <input
                  v-model.trim="toleration.tolerationSeconds"
                  :type="sedParam.tolerationInfo.tolerationSeconds.type"
                  :pattern="sedParam.tolerationInfo.tolerationSeconds.validationPattern"
                  :required="sedParam.tolerationInfo.tolerationSeconds.required"
                  placeholder="Placeholder"
                  :readonly="isQuestionImmutable(model)"/>
              <div class="validation-error-message" v-if="!validateEntry(toleration, 'tolerationSeconds', sedParam.tolerationInfo.tolerationSeconds.validationPattern)">
                <span :id="'error-message-toleration-seconds-' + index">
                  {{ sedParam.tolerationInfo.tolerationSeconds.errorMessage }}
                </span>
              </div>
            </td>
            <td >
              <button :id="'delete-toleration-' + index" class="btn primary" @click="removeToleration(index)" :disabled="isQuestionImmutable(model)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import {Select} from "@eds/vanilla";
import model, {showNotification, isValidToleration, isQuestionImmutable} from "../model";
export default {
  name: "KubernetesToleration",
  props: {
    tolerations: {
      type: Array,
      default: []
    },
    sedParam: Object,
    existingTolerations: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      localTolerations: [],
      model
    };
  },
  mounted() {
    this.initializeSelects();
  },
  updated() {
    this.initializeSelects();
  },
  methods: {
    isQuestionImmutable,
    initializeSelects() {
      this.$nextTick(() => {
        // Only find selects in scope of current vue
        const selects = this.$el.querySelectorAll('.select');
        if (selects) {
          Array.from(selects).forEach((selectDOM) => {
            if (!model.initializedK8sTolerationSelects.includes(selectDOM)) {
              const select = new Select(selectDOM);
              select.init();
              model.initializedK8sTolerationSelects.push(selectDOM);
              selectDOM.addEventListener('selectOption', (evt) => {
                this.handleLocalTolerationChanges(select, selectDOM)
              });
            }
          });
        }
      });
    },
    handleLocalTolerationChanges(select, selectDOM) {
      if (select.value.length > 0) {
        const index = selectDOM.id.split("-")[2]
        const type = selectDOM.id.split("-")[1]
        this.localTolerations[index][type] = select.value[0];
        if (type === "operator" && this.localTolerations[index][type] === "Exists") {
          delete this.localTolerations[index]["value"];
        }
      }
    },
    removeToleration(index) {
      this.localTolerations.splice(index, 1);
    },
    save() {
      if (this.localTolerations.every(toleration => isValidToleration(toleration, this.sedParam))) {
        showNotification('Success', 'Tolerations have been saved', 'green', 'icon-check', 3000);
        model.response[this.sedParam.key] = this.localTolerations;
        model.showTolerationDialog=false;
        model.currentQuestion.isValid = true
      }
    },
    addToleration() {
      if (this.localTolerations.every(toleration => isValidToleration(toleration, this.sedParam))) {
        this.localTolerations.push({});
      }
    },
    validateEntry(toleration, key, pattern) {
      const isValid = RegExp(pattern).test(toleration[key]);
      return isValid || toleration[key] === undefined || toleration[key] === "";
    },
    close(){
      model.response[this.sedParam.key] = this.existingTolerations;
      model.showTolerationDialog=false;
    },
  },
  watch: {
    tolerations: {
      handler(newValue, oldValue) {
        this.localTolerations = [...newValue];
      },
      immediate: true,
    }
  }
};
</script>
<style scoped>
.select .options-list {
  position: inherit;
}
.validation-error-message {
  color: #bb0b02;
  padding-top: 2px;
  font-size: 12px;
}
</style>