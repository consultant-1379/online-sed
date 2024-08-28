<template>
  <div class="tile">
    <div class="content">
      <p>This tool allows users to compare two different schema versions for the SED tool.</p>
      <br>
      <div v-if="fromStateComparisonModel.selectedProduct.shortName==='pENM'">
        <button
            class="btn primary"
            @click="showSEDHistoryModal = true"
            id="showOldSedHistory"
        >
          <span class="term">History Before ENM 23.4</span>
          <i class="icon"></i>
        </button>
      </div>
      <SelectProduct
          :modelObject="fromStateComparisonModel"
          :comparisonModelObject="toStateComparisonModel">
      </SelectProduct>
      <br>
      <SelectFromStateReleaseSprintNumber
          :fromModelObject="fromStateComparisonModel"
          :toModelObject="toStateComparisonModel"
          displayHeadingContext="From State "
          dropdownId="from-">
      </SelectFromStateReleaseSprintNumber>
      <br>
      <SelectFromStateProductSetVersion
          :fromModelObject="fromStateComparisonModel"
          :toStateModelObject="toStateComparisonModel"
          displayHeadingContext="From State "
          dropdownId="from-">
      </SelectFromStateProductSetVersion>
      <br>
      <SelectToStateReleaseSprintNumber
          :toModelObject="toStateComparisonModel"
          :fromModelObject="fromStateComparisonModel"
          displayHeadingContext="To State "
          dropdownId="to-">
      </SelectToStateReleaseSprintNumber>
      <br>
      <SelectProductSetVersion
          :modelObject="toStateComparisonModel"
          displayHeadingContext="To State "
          dropdownId="to-">
      </SelectProductSetVersion>
      <br>
      <SelectIpVersion :modelObject="fromStateComparisonModel"></SelectIpVersion>
      <br>
      <selectSchema :modelObject="fromStateComparisonModel"></selectSchema>
      <div>
        <div>
          <button
              class="btn primary setup-deployment-btn"
              v-on:click="this.compareReleases(fromStateComparisonModel, toStateComparisonModel)"
              :disabled='fromStateComparisonModel.selectedSchema.alias === "default"'
          >
            Compare Releases
          </button>
        </div>
      </div>
      <div v-show="this.comparisonComplete && this.displayList.length>0">
        <div class="table-top">
          <div class="table-top-left">
            <div class="table-info"></div>
          </div>
        </div>
        <table id="comparison-table" class="table"></table>
      </div>
        <div id="comparison-no-changes" v-if="this.comparisonComplete && this.displayList.length === 0" >
          <h3>No changes Found.</h3>
        </div>
    </div>
  </div>
  <transition name="dialog" id="old-version-history-dialog">
    <div v-if="showSEDHistoryModal" @click.self="showSEDHistoryModal=false" class="dialog">
      <div class="content">
        <div class="top">
          <div class="title">SED Pre 23.4 Version History</div>
          <div class="right">
            <i @click="showSEDHistoryModal=false" class="icon icon-cross"></i>
          </div>
        </div>
        <div class="body">
          <div class="timeline">
            <ul class="main-list">
              <li class="entry" v-for="v in versionHistory.sedPenmPreSchemaHistory" :key="v.version">
                <div class="target">
                  <h4 class="title">{{ v.version }}</h4>
                  <div class="content">
                    <p v-for="(change, idx) in v.changes" :key="idx">{{ change }}</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
import model, {loadProducts, setupDeploymentSchema} from "../model";
import {
  fromStateComparisonModel,
  toStateComparisonModel,
  getSchemaDifferences
} from "../model/compare.js";
import ConfirmationDialog from "../../src/components/ConfirmationDialog.vue";
import SelectFromStateReleaseSprintNumber from "../components/SelectFromStateReleaseSprintNumber.vue";
import SelectIpVersion from "../components/SelectIpVersion.vue";
import SelectProductSetVersion from "../components/SelectProductSetVersion.vue";
import SelectToStateReleaseSprintNumber from "../components/SelectToStateReleaseSprintNumber.vue";
import SelectFromStateProductSetVersion from "../components/SelectFromStateProductSetVersion.vue";
import SelectSchema from "../components/SelectSchema.vue";
import SelectProduct from "../components/SelectProduct.vue";
import { Table } from '@eds/vanilla';
import versionHistory from "../model/versionHistory";

export default {
  name: "compareReleases",
  components: {
    SelectSchema,
    SelectProductSetVersion,
    SelectIpVersion,
    SelectFromStateReleaseSprintNumber,
    SelectToStateReleaseSprintNumber,
    SelectFromStateProductSetVersion,
    ConfirmationDialog,
    SelectProduct
  },
  data() {
    return {
      fromStateComparisonModel,
      toStateComparisonModel,
      comparisonComplete: false,
      table: null,
      displayList: [],
      showSEDHistoryModal: false,
      versionHistory,
      schemaProperties: {},
      model
    };
  },
  methods: {
    async compareReleases(fromModel, comparisonModel){
      this.displayList = [];
      this.comparisonComplete = false;
      comparisonModel.selectedIpVersion = fromModel.selectedIpVersion;
      comparisonModel.selectedSchema = fromModel.selectedSchema;
      comparisonModel.selectedSize = fromModel.selectedSize;
      comparisonModel.selectedProduct = fromModel.selectedProduct;
      await setupDeploymentSchema(fromModel);
      await setupDeploymentSchema(comparisonModel);
      this.displayList = getSchemaDifferences(fromModel, comparisonModel);
      if (this.table) {
        this.table.update(this.displayList);
      }
      this.comparisonComplete = true;
    },
    async readSchemaProperties() {
      try {
        const response = await fetch('../../data/schemaProperties.json');
        this.schemaProperties = await response.json();
      } catch (error) {
        console.error('Failed to load schemaProperties.json:', error);
      }
     },
    objectToHtmlList(obj) {
      let html = '<ul>';
      for (const key in obj) {
        const tooltip = this.schemaProperties[key] || "No description available";
        let keyVal = obj[key];
        if (key === "options") {
          keyVal = "";
          for(let i = 0; i < obj[key].length; i++) {
            keyVal += obj[key][i]["name"];
            if (i < obj[key].length - 1) {
              keyVal += ", ";
            }
          }
        }
        html += `<li><b class="tooltip">${key} <i class="icon icon-info"></i><span class="tooltiptext">${tooltip}</span></b> : ${keyVal}</li>`;
      }
      html += '</ul>';
      return html;
    },
    setupTable(){
      const tableDOM = document.querySelector('#comparison-table');
      const table = new Table(tableDOM, {
        data: [],
        model,
        columns: [
          {
            key: 'key',
            title: 'Key',
            sort: 'none',
          },
          {
            key: 'change',
            title: 'Change',
            sort: 'none',
          },
          {
            key: 'category',
            title: 'Category',
            sort: 'none',
          },
          {
            key: 'description',
            title: 'Description'
          },
        ],
        expandable: true,
        sortable: true,
        onCreatedRow: (tr, data) => {
          const tds = tr.getElementsByTagName("td");
          if (tds.length > 4 && (data['longDescription'] || data['htmlDescription'])) {
            model.currentQuestion={"displayName": data['displayName']};
            const moreInfoDiv = document.createElement('div');
            moreInfoDiv.textContent = 'more info';
            moreInfoDiv.classList.add('moreInfoSelector');
            // Add click event listener
            moreInfoDiv.addEventListener('click', () => {
              model.currentQuestion = data;
              model.showDescriptionModal=true;
            });

            tds[4].appendChild(moreInfoDiv);
          }
        },
        onCreatedDetailsRow: (td, data) => {
          if(data['change'] === 'Updated Key'){
            var oldValHtml = `<p>${this.objectToHtmlList(data['oldValue'])}</p>`;
            var newValHtml = `<p>${this.objectToHtmlList(data['newValue'])}</p>`;
            var noValHtml = `<p>No value presented</p>`;
            if(JSON.stringify(data['newValue']) === '{}') {
              newValHtml = noValHtml;
            }
            if(JSON.stringify(data['oldValue']) === '{}') {
              oldValHtml = noValHtml;
            }
            var startHtml = `<div>
                            <div>
                                <h3>From Value Change(s)</h3>`;
            var midHtml = `</div>
                            <div>
                              <h3>To Value Change(s)</h3>`;
            var endHtml = `  </div>
                           </div>`;
            td.innerHTML = startHtml + oldValHtml + midHtml + newValHtml + endHtml;
          } else if(data['change'] === 'New Key'){
            td.innerHTML = `<div >No data to display for new key.</div>`;
          } else if(data['change'] === 'Removed Key'){
            td.innerHTML = `<div >No data to display for removed key.</div>`;
          } else {
            td.innerHTML = `<div >No data to display.</div>`;
          }
        }
      });
      table.init();
      this.table= table;
    }
  },
  mounted() {
    loadProducts(fromStateComparisonModel, toStateComparisonModel);
    this.$nextTick(() => {
      this.setupTable();
      this.readSchemaProperties();
    });
  }
};
</script>