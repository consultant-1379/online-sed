<template>
  <div class="content">
    <br />
    <table class="table">
      <caption>
        <p id="description">
          This optional page should be used to list IP Addresses assigned to other products that exist in the customer network. 
          <br>
          The already reserved IP Address will be excluded from SED auto-population feature and the duplicates will be highlighted to the SED user as not allowed.
        </p>
        </caption>
       <button @click="addRow" class="btn primary">Add IP Address</button>
       <div class="table-container">
      <thead>
        <tr>
          <th>IP Address</th>
          <th>Description</th>
          <th>Actions</th>
        </tr>
      </thead>
        <tbody>
          <tr v-for="(tableData, index) in model.excludeIps" :key="index" :id="index" class="table-row">
            <td>
              <input :id="'exclusion_ip_' + index" type="text"
                  v-model="tableData.ipAddress"
                  :pattern=ALL_IP_VERSIONS_REGEX
                  @input="validateInput(model, index)"
                  @focus="tableData.isFocused = true"
                  @blur="tableData.isFocused = false"
              />
              <div class="validation-error-message" v-if="tableData.isDuplicate && tableData.ipAddress.length > 0">
                <span id="duplicate_entry_error"> Duplicate entry. Please see Preview Details and Export page for information about where this value has already been used. </span>
             </div>
             <div class="validation-error-message" v-if="!tableData.isFocused && tableData.errorMessage && tableData.ipAddress.length > 0">
               <span id="invalid_entry_error"> Invalid entry. Please enter a valid IPv4, IPv6 or IPv6 CIDR address.</span>
             </div>
            </td>
            <td>
              <input :id="'exclusion_description_' + index"
                     type="text"
                     v-model="tableData.ipDescription"
              />
            </td>
            <td>
              <button class="btn primary" @click="deleteRow(index)">Delete</button>
            </td>

          </tr>
        </tbody>
      </div>
    </table>
  </div>
  <div class="bottom-right">
    <div class="item">
      <router-link to="deploymentsetup">
        <button class="btn primary">
          <i class="icon icon-arrow-left"></i>
          Back
        </button>
      </router-link>
      <router-link to="autopopulate">
        <button class="btn primary" id="btn primary"
                :hidden=false>
          <i class="icon icon-arrow-right"></i>
          Next
        </button>
      </router-link>
    </div>
  </div>
</template>
<script>
import model, {
  getPopulatedValuesToCheckForDuplicates,
  isValidIp,
  ALL_IP_VERSIONS_REGEX,
  showNotification
} from "../model";

export default {
  name: "exclude-ips",
  data() {
    return {
      model,
      getPopulatedValuesToCheckForDuplicates,
      showNotification,
      ALL_IP_VERSIONS_REGEX,
      fieldErrors: true,
    };
  },
  mounted() {
    this.validateInput(model)
  },
  methods: {
     validateInput(model, index) {
       let invalidFields = [];
       model.excludeIps.forEach(function (field) {
         if (field.ipAddress.length > 0 && index!== undefined){
           const populatedValues = getPopulatedValuesToCheckForDuplicates(model);
           const occurrence = populatedValues.filter(value => value.toLowerCase() === field.ipAddress.toLowerCase()).length;
           field.isDuplicate = occurrence > 1;
           field.errorMessage = !isValidIp(field.ipAddress);
           if (field.isDuplicate || field.errorMessage){
             invalidFields.push(field);
           }
         }
       });
       document.getElementById("btn primary").hidden = invalidFields.length !== 0;
    },
    addRow() {
       let isEmpty = false;
       model.excludeIps.forEach( (entry) => {
        if (entry.ipAddress.length <= 0) {
          isEmpty = true;
          showNotification('Warning', 'Fill in empty IP address values before adding another', 'red', 'icon-check', 4000);
        }
       });
       if (!isEmpty) {
         model.excludeIps.push({ ipAddress: "", ipDescription: "" });
       }
    },
    deleteRow(index) {
       model.excludeIps.splice(index, 1);
    },
  }
};
</script>
<style scoped lang="less">
@import (reference) "@eds/vanilla/variables/light";
.light .table .table-container {
  max-height: 450px;
  overflow: auto;

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
    width: 1000px;
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