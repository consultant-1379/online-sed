<template>
  <div class="content">
    <br />
    <div id="noRec" v-if="!(this.arrayData && this.arrayData.length > 0)">
      <p>No record.</p>
    </div>
    <table class="table" id="entryTable" v-else>
      <thead>
        <tr>
          <th>Value</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(entry, index) in this.arrayData" :key="index" :id="'entry_' + index"
          class="table-row">
          <td>
            <input :id="'entry_val_' + entry.index" type="text" placeholder="Placeholder"
              v-model.trim="entry.val" :readonly="isQuestionImmutable(model)" />
            <div class="validation-error-message" v-if="!isUniqueValue(entry.val)">
              <span id="duplicate_entry_error">Duplicate entry</span>
            </div>
            <div class="validation-error-message" v-if="!isValidValue(entry.val, model.currentQuestion.validationPattern)">
              <span id="invalid_entry_error">Invalid entry</span>
            </div>
          </td>
          <td>
            <button :id="'delete_' + entry.index" class="btn primary"
              @click="deleteRow(entry.index)" :disabled="isQuestionImmutable(model)">
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

export default {
  name: "ArrayDialog",
  data() {
    return {
      arrayData: [],
      maxIndex: 0,
      model,
      isQuestionImmutable,
      isValidValue
    };
  },
  mounted() {
    this.syncEntriesToModel(model);
  },
  methods: {
    syncEntriesToModel(model) {
      for (const i in model.response[model.currentQuestion.key]) {
        var val = model.response[model.currentQuestion.key][i];
        this.arrayData.push({ val: val, index: this.maxIndex++ });
      }
    },
    isValidEntry(val) {
      if (val === '' || val === null) return false;
      return new RegExp(model.currentQuestion.validationPattern).test(val);
    },
    isUniqueValue(val) {
      return this.arrayData.filter(entry => entry.val === val).length === 1;
    },
    save() {
      if (this.arrayData && this.arrayData.length > 0) {
        var i = 0;
        while (i <= this.arrayData.length - 1) {
          if (!(this.isValidEntry(this.arrayData[i].val)) || !(this.isUniqueValue(this.arrayData[i].val))) {
            showNotification('Warning', 'Please ensure all required fields are correctly populated', 'red', 'icon-check', 4000);
            return;
          }
          i++;
        }
      }
      model.response[model.currentQuestion.key] = [];
      this.arrayData.forEach(entry => {
        if(entry.val !== null) {
          (model.response[model.currentQuestion.key]).push(entry.val);
        }
      })
      showNotification('Success', 'Entries have been saved', 'green', 'icon-check', 3000);
      model.showObjectDialog = false;
    },
    addRow() {
      let lastEntry = null;
      if (this.arrayData.length > 0) {
        lastEntry = this.arrayData[this.arrayData.length - 1];
        if (lastEntry.val === null || lastEntry.val.length === 0) {
          showNotification('Warning', 'Fill in empty entry before adding another', 'red', 'icon-check', 4000);
          return;
        }
      }
      this.arrayData.push({ val: null, index: this.maxIndex++ });
      lastEntry = this.arrayData[this.arrayData.length - 1];
    },
    deleteRow(index) {
      let i;
      for (i = 0; i < this.arrayData.length; i++) {
        if (this.arrayData[i].index === index) {
          break;
        }
      }
      this.arrayData.splice(i, 1);
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