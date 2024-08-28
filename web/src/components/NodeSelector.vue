<template>
  <div class="content">
    <br />
    <div id="noRec" v-if="!(this.nodeSelectorProxy && this.nodeSelectorProxy.length > 0)">
      <p>No record.</p>
    </div>
    <table class="table" id="entryTable" v-else>
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(nodeSelectorEntry, index) in this.nodeSelectorProxy" :key="index" :id="'node_' + index"
          class="table-row">
          <td>
            <input :id="'nodeKey_' + nodeSelectorEntry.index" type="text" placeholder="Placeholder"
              v-model.trim="nodeSelectorEntry.nodeKey" :readonly="isQuestionImmutable(model)"/>
            <div class="validation-error-message" v-if="!isUniqueNodeKey(nodeSelectorEntry.nodeKey)">
              <span id="duplicate_entry_error">Duplicate nodeKey</span>
            </div>
            <div class="validation-error-message" v-if="!isValidValue(nodeSelectorEntry.nodeKey, model.currentQuestion.nodeSelectorInfo.key.validationPattern)">
              <span id="invalid_node_key_error">{{ model.currentQuestion.nodeSelectorInfo.key.errorMessage }}</span>
            </div>
          </td>
          <td>
            <input :id="'nodeValue_' + nodeSelectorEntry.index" type="text" placeholder="Placeholder"
              v-model.trim="nodeSelectorEntry.nodeValue" :readonly="isQuestionImmutable(model)"/>
            <div class="validation-error-message" v-if="!isValidValue(nodeSelectorEntry.nodeValue, model.currentQuestion.nodeSelectorInfo.value.validationPattern)">
              <span id="invalid_node_value_error">{{ model.currentQuestion.nodeSelectorInfo.value.errorMessage }}</span>
            </div>
          </td>
          <td>
            <button :id="'delete_' + nodeSelectorEntry.index" class="btn primary"
              @click="deleteRow(nodeSelectorEntry.index)" :disabled="isQuestionImmutable(model)">
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
import { isValidNode } from "../utils/CENMUtils.js";

export default {
  name: "NodeSelector",
  data() {
    return {
      nodeSelectorProxy: [],
      maxIndex: 0,
      model,
      isQuestionImmutable,
      isValidValue
    };
  },
  mounted() {
    this.syncNodeSelectorProxyToModel(model);
  },
  methods: {
    syncNodeSelectorProxyToModel(model) {
      for (const nodeKey in model.response[model.currentQuestion.key]) {
        const nodeValue = model.response[model.currentQuestion.key][nodeKey];
        this.nodeSelectorProxy.push({ nodeKey: nodeKey, nodeValue: nodeValue, index: this.maxIndex++ });
      }
    },
    isUniqueNodeKey(nodeKey) {
      return this.nodeSelectorProxy.filter(entry => entry.nodeKey === nodeKey).length === 1;
    },
    save() {
      if (this.nodeSelectorProxy && this.nodeSelectorProxy.length > 0) {
        var i = 0;
        while (i <= this.nodeSelectorProxy.length - 1) {
          if (!(isValidNode(this.nodeSelectorProxy[i], model.currentQuestion.nodeSelectorInfo))
              || !(this.isUniqueNodeKey(this.nodeSelectorProxy[i].nodeKey))) {
            showNotification('Warning', 'Please ensure all required fields are correctly populated', 'red', 'icon-check', 4000);
            return;
          }
          i++;
        }
      }
      model.response[model.currentQuestion.key] = {};
      this.nodeSelectorProxy.forEach(entry => {
        if(entry.nodeKey !== null && entry.nodeValue !== null) {
          model.response[model.currentQuestion.key][entry.nodeKey] = entry.nodeValue;
        }
      })
      showNotification('Success', 'Entries have been saved', 'green', 'icon-check', 3000);
      model.showObjectDialog = false;
    },
    addRow() {
      let lastEntry = null;
      if (this.nodeSelectorProxy.length > 0) {
        lastEntry = this.nodeSelectorProxy[this.nodeSelectorProxy.length - 1];
        if (lastEntry.nodeKey === null || lastEntry.nodeValue === null
          || lastEntry.nodeKey.length === 0 || lastEntry.nodeValue.length === 0) {
          showNotification('Warning', 'Fill in empty entry values before adding another', 'red', 'icon-check', 4000);
          return;
        }
      }
      this.nodeSelectorProxy.push({ nodeKey: null, nodeValue: null, index: this.maxIndex++ });
      lastEntry = this.nodeSelectorProxy[this.nodeSelectorProxy.length - 1];
    },
    deleteRow(index) {
      let i;
      for (i = 0; i < this.nodeSelectorProxy.length; i++) {
        if (this.nodeSelectorProxy[i].index === index) {
          break;
        }
      }
      this.nodeSelectorProxy.splice(i, 1);
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