<template>
  <div class="content">
    <br>
    <div>
      <div id="noRec" v-if="this.objectData.length===0">
        <p>No record.</p>
      </div>
      <table class="table" id="objectArrayTable" v-else>
        <caption hidden="hidden"></caption>
        <thead>
          <tr>
            <th v-for="key in Object.keys(model.currentQuestion.objectArrayInfo)" :key="key">{{ key }}</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(existingObject, index) in this.objectData" :key="index" :id="'object-key-' + index" class="table-row">
            <td v-for="(param, key) in model.currentQuestion.objectArrayInfo" :key="key">
              <div v-if="param.type === 'select'"
                   :id="'objectArray-select--' + key + '--' + index"
                   class="select"
                   data-type="single">
                <button class="btn current-options" type="button" :disabled="isQuestionImmutable(model)">
                  {{ existingObject[key] || 'Please select...' }}
                </button>
                <div class="options-list">
                  <div v-for="option in param.options" :key="option" class="item">{{ option }}</div>
                </div>
              </div>
              <div v-else-if="param.type === 'datetime-local'">
                <input :id="'objectArray-input-' + key + '-' + index"
                       :type="param.type"
                       :value="getDateTimeFormatted(getDefaultValue(index, key, param))"
                       @blur="updateDate($event, key, index)"
                       :readonly="isQuestionImmutable(model)"
                       :min="getDateTimeFormatted(new Date())"
                       :required="param.required"
                       step="1"/>
              </div>
              <div v-else-if="param.type === 'array'">
                <textarea :id="'objectArray-input-' + key + '-' + index"
                       placeholder="Placeholder"
                       v-model="existingObject[key]"
                       :readonly="isQuestionImmutable(model)"
                       :value="getDefaultValue(index, key, param)"
                       :required="param.required"/>
              </div>
              <div v-else>
                <input :id="'objectArray-input-' + key + '-' + index"
                       :type="param.type"
                       placeholder="Placeholder"
                       v-model.trim="existingObject[key]"
                       :readonly="isQuestionImmutable(model)"
                       :value="getDefaultValue(index, key, param)"
                       :pattern="param.validationPattern"
                       :required="param.required"/>
              </div>
              <div class="validation-error-message" v-if="existingObject[key] !== undefined && isValueDuplicated(key, existingObject[key], param.preventDuplicates)">
                <span id="duplicate_entry_error">Duplicate entry</span>
              </div>
              <div class="validation-error-message" v-if="(param.type !== 'datetime-local' && !isValidValue(existingObject[key], param.validationPattern) && validateArrayInput(param.validationPattern, index, key, this.objectData)) || !isValidDate(param.type, param.required, existingObject[key], param.validationPattern, existingObject, param.tag)">
                <div id="invalid_field_error" v-if="param.errorMessage !== ''" >{{ param.errorMessage || 'Invalid Entry' }}</div>
              </div>
            </td>
            <td>
              <button :id="'delete-object-array-' + index" class="btn primary"
                @click="deleteRow(index)" :disabled="isQuestionImmutable(model)">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import model, {
  isQuestionImmutable,
  isValidValue,
  showNotification
} from "../model";
import { Select } from "@eds/vanilla";
import {
  isValidObjectArrayInput,
  validateArrayInput,
  getAllInputsForKey,
  getDateTimeFormatted,
  isValidDate
} from "../utils/CENMUtils.js";

export default {
  name: "ObjectArray",
  data() {
    return {
      objectData: [],
      model,
    };
  },
  mounted() {
    this.syncDataFromModel(model);
    this.initializeSelects();
  },
  updated() {
    this.initializeSelects();
  },
  methods: {
    getDateTimeFormatted,
    validateArrayInput,
    isValidDate,
    isQuestionImmutable,
    isValidValue,
    getAllInputsForKey,
    initializeSelects() {
      this.$nextTick(() => {
        // Only find selects in scope of current vue
        const selects = this.$el.querySelectorAll('.select');
        if (selects) {
          Array.from(selects).forEach((selectDOM) => {
            if (!model.initializedObjectArrayInputSelects.includes(selectDOM)) {
              const select = new Select(selectDOM);
              select.init();
              model.initializedObjectArrayInputSelects.push(selectDOM);
              selectDOM.addEventListener('selectOption', (evt) => {
                this.handleLocalDataChanges(select, selectDOM)
              });
            }
          });
        }
      });
    },
    handleLocalDataChanges(select, selectDOM) {
      if (select.value.length > 0) {
        const parts = selectDOM.id.split("--")
        const type = parts[1]
        const index = parts[parts.length -1]
        this.objectData[index][type] = select.value[0];
      }
    },
    syncDataFromModel(model) {
      if (model.response[model.currentQuestion.key] !== undefined){
        this.objectData = model.response[model.currentQuestion.key];
      }
    },
    save() {
      if (!this.objectData.every(arrayObj => isValidObjectArrayInput(this.objectData, model.currentQuestion.objectArrayInfo))) {
        showNotification('Warning', 'Please ensure all required fields are correctly populated', 'red', 'icon-check', 4000);
      } else {
        model.response[model.currentQuestion.key] = [];
        const arrayTypes = [];
        for (const key in  model.currentQuestion.objectArrayInfo) {
          if ( model.currentQuestion.objectArrayInfo[key].type === 'array') {
            arrayTypes.push(key);
          }
        }
        this.objectData.forEach(entry => {
        if (arrayTypes.length > 0 ){
          if (!Array.isArray(entry[arrayTypes])) {
            entry[arrayTypes] = [entry[arrayTypes]];
          }
          entry[arrayTypes] = entry[arrayTypes].join(', ').split(/,|\n/).map(part => part.trim()).filter(Boolean);
        }
        model.response[model.currentQuestion.key].push(entry);
        });
        showNotification('Success', 'Entries have been saved', 'green', 'icon-check', 3000);
        this.close();
      }
    },
    addRow() {
      if (isValidObjectArrayInput(this.objectData, model.currentQuestion.objectArrayInfo)) {
        this.objectData.push({});
      } else {
        showNotification('Warning', 'Ensure all current entries are populated before adding another!', 'red', 'icon-check', 4000);
      }
    },
    deleteRow(index) {
      this.objectData.splice(index, 1);
    },
    close() {
      model.showObjectDialog = false;
    },
    getDefaultValue(objectDataIndex, key, sedParameter) {
      if (this.objectData[objectDataIndex][key] === undefined) {
        this.objectData[objectDataIndex][key] = sedParameter.defaultValue;
      }
      return this.objectData[objectDataIndex][key];
    },
    isValueDuplicated(key, value, preventDuplicates) {
      if (preventDuplicates) {
        const allInputs = getAllInputsForKey(key, this.objectData);
        const occurrences = allInputs.filter(item => item === value);
        return occurrences.length > 1;
      }
      return false;
    },
    updateDate(event, key, index) {
      this.objectData[index][key] = getDateTimeFormatted(event.target.value);
    }
  }
};

</script>

<style scoped lang="less">
@import (reference) "@eds/vanilla/variables/light";

.light .table {
  border-spacing: 0;
  border-collapse: separate;

  th {
    font-size: 15px;
    font-weight: bold;
    text-transform: capitalize;
  }

  tr td {
    margin: 15px 10px 20px;
    font-size: 14px;
    font-weight: 500;
    border-top: 1px solid #878787;
    border-bottom: none;
  }

  tr:hover {
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

.select .options-list {
  position: inherit;
}

tbody,
.entry {
  border-top: 1px solid #878787;
  border-bottom: none;
}
</style>