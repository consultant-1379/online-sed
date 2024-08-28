<template>
  <div class="content">
    <p>
      This feature is optional and automatically populates IPs based on provided start and end IP addresses. It's unnecessary if IPs are populated manually or already exist. Additionally, it only fills empty IP fields and won't overwrite existing values.
    </p>
   <div class="header">
     <br>
     <u><b>IP Address</b></u>
      <div class="row table header">
        <div class="column sm-15 md-6 lg-2">
          <b>IP Address Type</b>
        </div>
        <div class="column sm-15 md-6 lg-2">
          <b class="tooltip">No. Required
            <i class="icon icon-info"></i>
            <span class="tooltiptext">
              The number of IP addresses that still need to be assigned out of the total number.
            </span>
          </b>
        </div>
        <div class="column sm-15 md-6 lg-2">
          <b class="tooltip">Start of Range
            <i class="icon icon-info"></i>
            <span class="tooltiptext">
                Do not use Gateway, Network and Broadcast IP addresses as the 'Start of IP Range' for any VLAN. <br> Do not use any addresses which are reserved by IANA.
            </span>
          </b>
        </div>
        <div class="column sm-15 md-6 lg-2">
          <b>End of Range</b>
        </div>
        <div class="column sm-15 md-6 lg-2">
          <b>Next Available</b>
        </div>
        <div class="notes column sm-15 md-6 lg-2">
          <b>Auto-populate</b>
        </div>
      </div>
          <div>
            <AutoPopulateEntry
              v-for="autoPopulationType in model.autoPopulationTypes"
              :key="autoPopulationType.id"
              :autoPopulationType="autoPopulationType"
            >
            </AutoPopulateEntry>
          </div>
      </div>
    </div>

   <div class="header" v-show="model.schemaForm.filter((dict) => dict.autoPopulate === 'hostname').length > 0">
      <hr style=" border: solid 1px;border-bottom:5px solid; margin:25px auto 15px auto;clear:both" />
      <br>
      <u><b>Hostname</b></u>
        <div class="row table header">
          <div class="column sm-30 md-6 lg-2">
            <b class="tooltip">Hostnames
              <i class="icon icon-info"></i>
              <span class="tooltiptext">
                  Hostnames to be auto-populated are specifically for nodes. The hostname will be made of: Inputted prefix, nodeName and nodeNumber
              </span>
            </b>
          </div>
          <div
            class="input-box"
            id="hostname_prefix"
          >
            <input
              v-model="model.response['hostname_prefix']"
              id="hostname_prefix"
              placeholder="Enter Hostname Prefix"
              @input="updateResponse(model, 'hostname_prefix')"
            />
          </div>
          <div class="column sm-12 md-6 lg-1">
            <button class="btn primary input-box float-right"
              @click="autoPopulateHostnames(model)"
              :disabled="!model.response['hostname_prefix']"
            >
            Autopopulate
            </button>
          </div>
          <div class="validation-error-message">
            <span id="error-message" v-if="showError">Input must not contain any special characters, only a-z, A-Z and 0-9</span>
          </div>
        </div>
   </div>
   <br>

  <div class="bottom-right">
    <div class="item">
      <router-link :to="model.selectedProduct.shortName === 'pENM' ? 'excludeipaddresses' : 'deploymentsetup'" class="btn primary">
        <i class="icon icon-arrow-left"></i>
        Back
      </router-link>
      <router-link v-if="!isAutopopulateEntry()" to="sitedetails">
        <button class="btn primary">
          <i class="icon icon-arrow-right"></i>
          Next
        </button>
      </router-link>
      <button v-if="isAutopopulateEntry()" class="btn primary" :disabled="true">
        <i class="icon icon-arrow-right"></i>
        Next
      </button>
    </div>
  </div>
</template>

<script>
import model from "../model";
import { autoPopulateHostnames, updateResponse } from "../model";

export default {
  name: "autopopulate",
  props: ["hostname_prefix", "hostname_prefix_input"],
  data() {
    return {
      model,
      autoPopulateHostnames,
      updateResponse,
      showError: false
    };
  },
  methods: {
    checkForError: function () {
      if (/^[a-zA-Z0-9.]*$/.test(model.response['hostname_prefix'])) {
        this.showError = false;
      }else{
        this.showError = true;
      }
    },
    isAutopopulateEntry: function () {
      var autopopulateEntries = ['ipaddress_ipaddress_start', 'ipaddress_ipaddress_end', 'jgroups_ipaddress_start', 'jgroups_ipaddress_end', 'internal_ipaddress_start', 'internal_ipaddress_end', 'storage_ipaddress_start', 'storage_ipaddress_end', 'backup_ipaddress_start', 'backup_ipaddress_end', 'hostname_prefix'];
      for (var entry in autopopulateEntries) {
        let numberOfIPsStillrequired = []
        Object.values(model.autopopulatedValuesStillRequired).forEach(val => numberOfIPsStillrequired.push(val))
        if (!numberOfIPsStillrequired.some(el => el > 0)) {
          return false;
        }
        else if (model.response[autopopulateEntries[entry]] && model.response[autopopulateEntries[entry]] !== model.autopopulatedValues[autopopulateEntries[entry]]) {
          return true;
        }
      }
    }
  },
};
</script>

<style scoped lang="less">
.header {
  font-size: 15px;
  border-bottom: 2px;
}
.row {
  padding: 1em 0em 1em 0em;
  border-bottom: double;
}
</style>
