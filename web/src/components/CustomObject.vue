<template>
    <div class="content">
      <br />
      <div id="noRec" v-if="!(customObjectProxy.length > 0)">
        <p>No record.</p>
      </div>
      <table class="table" id="entryTable" v-else>
        <caption style="text-align:right" hidden="true">Adding a custom object</caption>
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(customObjectEntry, index) in customObjectProxy" :key="index" :id="'object_' + index"
            class="table-row">
            <td>
              <input
                :id="'objectKey_' + customObjectEntry.index"
                type="text"
                placeholder="Placeholder"
                v-model.trim="customObjectEntry.objectKey"
                :readonly="isQuestionImmutable(model)"
              />
              <div class="validation-error-message" v-if="!isValidValue(customObjectEntry.objectKey, model.currentQuestion.customObjectInfo.key.validationPattern)">
                <span id="invalid_CustomObj_key_error">{{ model.currentQuestion.customObjectInfo.key.errorMessage }}</span>
              </div>
              <div class="validation-error-message" v-if="!isUniqueKey(customObjectEntry.objectKey)">
                <span id="duplicated_key_error">Duplicated key</span>
              </div>
            </td>
            <td>
              <input
                :id="'objectValue_' + customObjectEntry.index"
                type="text"
                placeholder="Placeholder"
                v-model.trim="customObjectEntry.objectValue"
                :readonly="isQuestionImmutable(model)"/>
              <div class="validation-error-message" v-if="!isValidValue(customObjectEntry.objectValue, model.currentQuestion.customObjectInfo.value.validationPattern)">
                <span id="invalid_CustomObj_value_error">{{ model.currentQuestion.customObjectInfo.value.errorMessage }}</span>
              </div>
            </td>
            <td>
              <button :id="'delete_' + customObjectEntry.index" class="btn primary"
                @click="deleteRow(customObjectEntry.index)" :disabled="isQuestionImmutable(model)">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>

<script>
import model, {
  showNotification, isQuestionImmutable, isValidValue
} from "../model";
import { isValidCustomObject } from "../utils/CENMUtils.js";

export default {
  name: "CustomObject",
  data() {
    return {
      customObjectProxy: [],
      maxIndex: 0,
      model,
      isValidValue,
      isQuestionImmutable
    };
  },
  mounted() {
    this.syncCustomObjectToModel(model);
  },
  methods: {
    syncCustomObjectToModel(model) {
      for (const objectKey in model.response[model.currentQuestion.key]) {
        const objectValue = model.response[model.currentQuestion.key][objectKey];
        this.customObjectProxy.push({ objectKey: objectKey, objectValue: objectValue, index: this.maxIndex++ });
      }
    },
    save() {
      if (this.customObjectProxy.length > 0) {
        if (!this.customObjectProxy.every(customObject => isValidCustomObject(this.customObjectProxy, customObject, model.currentQuestion.customObjectInfo))) {
          showNotification('Warning', 'Please ensure all required fields are correctly populated', 'red', 'icon-check', 4000);
          return;
        }
      }
      model.response[model.currentQuestion.key] = {};
      this.customObjectProxy.forEach(entry => {
        model.response[model.currentQuestion.key] = { ...model.response[model.currentQuestion.key],[entry.objectKey] : entry.objectValue};
      })
      showNotification('Success', 'Entries have been saved', 'green', 'icon-check', 3000);
      model.showObjectDialog = false;
    },
    isUniqueKey(objectKey) {
      return this.customObjectProxy.filter(entry => entry.objectKey === objectKey).length === 1;
    },
    addRow() {
      let lastEntry = null;
      if (this.customObjectProxy.length > 0) {
        lastEntry = this.customObjectProxy[this.customObjectProxy.length - 1];
         if (!isValidCustomObject(this.customObjectProxy, lastEntry, model.currentQuestion.customObjectInfo)) {
          showNotification('Warning', 'Please ensure all required fields are correctly populated', 'red', 'icon-check', 4000);
          return;
        }
      }
      this.customObjectProxy.push({ objectKey: null, objectValue: null, index: this.maxIndex++ });
    },
    deleteRow(index) {
      const i = this.customObjectProxy.findIndex(obj => obj.index === index);
      if (i !== -1) {
        this.customObjectProxy.splice(i, 1);
      }
    },
    close() {
      model.showObjectDialog = false;
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

.details {
  padding-bottom: 1.5em;
}

.row {
  margin-left: 4em;
  padding: 0.5em 0em 0.5em 0em;
}

#description {
  text-align: left;
  padding-left: 20px;
}
</style>