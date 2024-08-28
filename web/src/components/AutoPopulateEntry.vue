<template>
  <ConfirmationDialog
    id="confirmation-dialog"
    v-if="this.confirmPrompt"
    @hideChild="this.confirmPrompt=false"
    @continueButtonPressed="confirmAutopopulation(model, autoPopulationType)"
    @cancelButtonPressed="this.confirmPrompt=false"
  >
    <template #title>Confirm</template>
    <template #message>
      Only <b>{{ checkEnoughIPsAvailable(autoPopulationType, model) }}</b>
      out of the remaining <b>{{ getRemainingRequiredIPAddresses(autoPopulationType, model) }}</b> required addresses have been supplied. 
      Are you sure you want to proceed?</template>
  </ConfirmationDialog>

  <div class="row table">
    <div class="column sm-12 md-6 lg-2">
      <div class="tooltip">
        <p>{{ autoPopulationType.name }}
          <b><i class="icon icon-info" v-if="autoPopulationType.description != undefined"></i></b>
          <span class="tooltiptext" v-if="autoPopulationType.description != undefined">
            {{ autoPopulationType.description }}
          </span>
        </p>
      </div>
    </div>
    <div class="column sm-12 md-6 lg-2">
      <p>{{ getRemainingRequiredIPAddresses(autoPopulationType, model) }} of {{ getRequiredIPAddresses(autoPopulationType, model) }}</p>
    </div>
    <div class="column sm-12 md-6 lg-2">
      <div
        class="input-box"
        :id = "autoPopulationType.shortName + '_ipaddress_start'"
      >  
        <input
          v-model.trim="model.response[autoPopulationType.shortName + '_ipaddress_start']"
          :id = "autoPopulationType.shortName + '_ipaddress_start_input'"
          placeholder="Placeholder"
          @input="updateResponse(model, autoPopulationType.shortName + '_ipaddress_start')"
          :pattern="model.schemaForm.filter((field) => field.key == autoPopulationType.shortName + '_ipaddress_start')[0].validationPattern"
          @focus="startInputBoxIsFocused = true"
          @blur="startInputBoxIsFocused = false"
        />
      </div>
      <div class="validation-error-message"  v-if="!startInputBoxIsFocused">
        <!-- <i class="icon icon-triangle-warning" v-if="validateIPAddressInput('start', autoPopulationType, model) != '' && validateIPAddressInput('start', autoPopulationType, model) != ' '"/> -->
        <span id="start_ip_error">{{ this.validateIPAddressInput("start", autoPopulationType, model) }}</span>
      </div>
    </div>
    <div class="column sm-12 md-6 lg-2">
      <div
        class="input-box"
        :id = "autoPopulationType.shortName + '_ipaddress_end'"
      >
        <input
          v-model.trim="model.response[autoPopulationType.shortName + '_ipaddress_end']"
          :id = "autoPopulationType.shortName + '_ipaddress_end_input'"
          placeholder="Placeholder"
          @input="updateResponse(model, autoPopulationType.shortName + '_ipaddress_end')"
          :pattern="model.schemaForm.filter((field) => field.key == autoPopulationType.shortName + '_ipaddress_end')[0].validationPattern"
          @focus="endInputBoxIsFocused = true"
          @blur="endInputBoxIsFocused = false"
        />
      </div>
      <div class="validation-error-message" v-if="!endInputBoxIsFocused">
        <!-- <i class="icon icon-triangle-warning" v-if="validateIPAddressInput('end', autoPopulationType, model) != '' && validateIPAddressInput('end', autoPopulationType, model) != ' '"/> -->
        <span id="end_ip_error">{{ this.validateIPAddressInput("end", autoPopulationType, model) }}</span>
      </div>
    </div>
    <div class="column sm-12 md-6 lg-2" style="word-wrap: break-word;">
      <p id="find-next-available-address">{{ findNextAvailableAddress(model.response[autoPopulationType.shortName + '_ipaddress_start'], model.response[autoPopulationType.shortName + '_ipaddress_end'], autoPopulationType, model) }}</p>
    </div>
    <div class="column sm-12 md-6 lg-1">
      <button class="btn primary input-box" 
        id="autopopulate_button"
        @click="checkIfConfirmNeeded(model, autoPopulationType)"
        :disabled="(validateIPAddressInput('start', autoPopulationType, model) != '' ||
          validateIPAddressInput('end', autoPopulationType, model) != '') ||
          checkEnoughIPsAvailable(autoPopulationType, model) <= 0 ||
          getRemainingRequiredIPAddresses(autoPopulationType, model) === 0"
       >
        Autopopulate
      </button>
    </div>
  </div>
</template>

<script>
import model from "../model";
import { isIPv4, isIPv6, isInSubnet } from "is-in-subnet";
import { autoPopulateIpAddresses, updateResponse, colonAdder, getPopulatedValuesToCheckForDuplicates, incrementIPv6Address, incrementIPv4Address, checkFieldAutopopulationRequired } from "../model";
import ConfirmationDialog from "../../src/components/ConfirmationDialog.vue";

export default{
  name: "auto-populate-entry",
  components: {
    ConfirmationDialog
  },
  props: ["autoPopulationType"],
  data() {
   return {
    model,
    autoPopulateIpAddresses,
    updateResponse,
    colonAdder,
     getPopulatedValuesToCheckForDuplicates,
    incrementIPv6Address,
    incrementIPv4Address,
    confirmPrompt: false,
    endInputBoxIsFocused: false,
    startInputBoxIsFocused: false
   };
  },
  methods: {
    getRequiredIPAddresses(autoPopulationType, model) {
      return model.schemaForm.filter((field) => {
        return checkFieldAutopopulationRequired(field, autoPopulationType.shortName, model);
      }).length;
    },
    getUsedIPAddressesForAutopopulationType(autoPopulationType, model) {
      return model.schemaForm.filter((field) => checkFieldAutopopulationRequired(field, autoPopulationType.shortName, model) && model.response[field.key] !== undefined).length;
    },
    getRemainingRequiredIPAddresses(autoPopulationType, model){
      model.autopopulatedValuesStillRequired[autoPopulationType.shortName] = this.getRequiredIPAddresses(autoPopulationType, model) - this.getUsedIPAddressesForAutopopulationType(autoPopulationType, model);
      return this.getRequiredIPAddresses(autoPopulationType, model) - this.getUsedIPAddressesForAutopopulationType(autoPopulationType, model);
    },
    getIPAddress(startOrEnd, autoPopulationType, model) {
      return model.schemaForm.filter((field) => field.key === autoPopulationType.shortName+"_ipaddress_"+startOrEnd)[0];
    },
    confirmAutopopulation(model, autoPopulationType) {
      autoPopulateIpAddresses(model, autoPopulationType);
      this.confirmPrompt = false;
    },
    checkIfConfirmNeeded(model, autoPopulationType) {
      if (this.getRemainingRequiredIPAddresses(autoPopulationType, model) > this.checkEnoughIPsAvailable(autoPopulationType, model)) {
        this.confirmPrompt = true;
      } else {
        this.confirmAutopopulation(model, autoPopulationType);
      }
    },
    findNextAvailableAddress(startAddress, endAddress, autoPopulationType, model) {
      var nextIP, startIP;

      if (this.validateIPAddressInput('start', autoPopulationType, model) === '') {
        nextIP = startIP = startAddress;
      } else {
        return ""
      }

      if (isIPv6(startIP.split("/")[0])) {
        nextIP = colonAdder(startIP.split("/")[0]);
        if (startIP.split("/")[1] !== undefined) {
          nextIP += "/" + startIP.split("/")[1];
        }
      }

      var usedIPs = getPopulatedValuesToCheckForDuplicates(model);
      for (var i = 0;i < usedIPs.length;i++) {
        if (usedIPs[i] !== undefined) {
          if (isIPv6(usedIPs[i].toString().split('/')[0])) {
            usedIPs[i] = colonAdder(usedIPs[i]);
          }
        }
      }
      while (usedIPs.includes(nextIP)) {
        if (nextIP === endAddress) {
          return "None Available in Selected Range";
        }
        nextIP = isIPv6(nextIP.split("/")[0]) ? incrementIPv6Address(nextIP) : incrementIPv4Address(nextIP);
        if (model.response[autoPopulationType.sedSubnetKey] !== undefined) {
          if (!isInSubnet(nextIP.split("/")[0], model.response[autoPopulationType.sedSubnetKey])) {
            return "None Available";
          }
        }
      }
      autoPopulationType.nextAvailableIP = nextIP;
      return autoPopulationType.nextAvailableIP;
    },
    validateIPAddressInput(startOrEnd, autoPopulationType, model) {
      var IPAddress = this.getIPAddress(startOrEnd, autoPopulationType, model);
      return this.validIPAddressCheck(IPAddress, model.response, autoPopulationType);
    },
    validIPAddressCheck(IPAddress, response, autoPopulationType) {
      if (response[IPAddress.key] === undefined) {
        return " ";
      } else if (!new RegExp(IPAddress.validationPattern).test(response[IPAddress.key])) {
        return IPAddress.errorMessage;
      } else if (autoPopulationType.sedSubnetKey) {
        return this.correctSubnetCheck(IPAddress, response, autoPopulationType);
      }
      return "";
    },
    checkEnoughIPsAvailable(autoPopulationType, model) {
      var startIPAddress = this.getIPAddress("start", autoPopulationType, model);
      var endIPAddress = this.getIPAddress("end", autoPopulationType, model);
      var numberOfIPs = 0;
      if (this.validIPAddressCheck(startIPAddress, model.response, autoPopulationType) === '' &&
      this.validIPAddressCheck(endIPAddress, model.response, autoPopulationType) === '') {
        startIPAddress = model.response[startIPAddress.key];
        endIPAddress = model.response[endIPAddress.key];

        if (isIPv4(startIPAddress)) {
          numberOfIPs = this.countIpv4InRange(startIPAddress.split('.'), endIPAddress.split('.'));
        } else {
          var startIPv6Octet = colonAdder(startIPAddress.split("/")[0]).split(":");
          var endIPv6Octet = colonAdder(endIPAddress.split("/")[0]).split(":");
          numberOfIPs = this.countIpv6InRange(startIPv6Octet, endIPv6Octet);
        }
      }
      var usedIPs = getPopulatedValuesToCheckForDuplicates(model);
      if (numberOfIPs > 0)  {
        var ipAddressesNeeded = this.getRemainingRequiredIPAddresses(autoPopulationType, model);
        while (startIPAddress != (isIPv4(startIPAddress) ? incrementIPv4Address(endIPAddress) : incrementIPv6Address(endIPAddress))) {
          if (usedIPs.includes(startIPAddress)) {
            numberOfIPs--;
          }
          else {
            ipAddressesNeeded --;
          }
          if ( ipAddressesNeeded <= 0 ) {
            break;
          }
          startIPAddress = isIPv4(startIPAddress) ? incrementIPv4Address(startIPAddress) : incrementIPv6Address(startIPAddress);
        }
      }
      return numberOfIPs;
    },
    correctSubnetCheck(IPAddress, response, autoPopulationType) {
      var tempIPAddress = response[IPAddress.key].split("/")[0];
      var subnetMask = "";
      subnetMask = response[autoPopulationType.sedSubnetKey];

      if (subnetMask === undefined) {
        var subnet = model.schemaForm.filter((dict) => dict.key === autoPopulationType.sedSubnetKey)[0];
        var category = model.dataTypeCategories.filter((dict) => dict.shortName === subnet.category)[0];
        return "Please populate the relevant subnet in the " + category.name + " Category on the Site Details Page";
      }

      if (isIPv6(tempIPAddress)) {
        tempIPAddress = colonAdder(tempIPAddress);
        subnetMask = colonAdder(subnetMask);
        response[autoPopulationType.sedSubnetKey] = subnetMask;
      }

      if (!isInSubnet(tempIPAddress, subnetMask)) {
        return "IP Address on incorrect subnet";
      }
      return "";
    },
    countIpv4InRange(startIPv4Quadruplet, endIPv4Quadruplet) {
      var numberOfIPs = 1;
      for (var x = 0; x < 4; x++) {
        numberOfIPs += ((parseInt(endIPv4Quadruplet[x]) - parseInt(startIPv4Quadruplet[x])) * Math.pow(256, 3-x));
      }
      return numberOfIPs;
    },
    countIpv6InRange(startIPv6Octet, endIPv6Octet) {
      var startString = startIPv6Octet[5] + startIPv6Octet[6] + startIPv6Octet[7];
      var endString = endIPv6Octet[5] + endIPv6Octet[6] + endIPv6Octet[7];
      return ((parseInt(endString, 16) - parseInt(startString, 16)) + 1);
    }
  },
};
</script>

<style>

.tooltip .tooltiptext {
  width: 200px;
}

.row {
  padding: 0.5em 0em 0.5em 0em;
}
</style>