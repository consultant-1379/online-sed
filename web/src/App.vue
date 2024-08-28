<template>
  <div>
    <header class="sysbar">
      <div class="items-container">
        <div @click="$router.push('/')" class="item">
          <i class="icon icon-econ" />
          <span class="product">Site Engineering Data</span>
          <span class="acronym">SED</span>
        </div>
      </div>
    </header>
    <main>
      <aside class="syspanel hidden" />
      <div class="app slide-right">
        <nav class="appbar">
          <div class="actions-left">
            <div class="item">
              <i class="navigation-toggle closed" />
            </div>
            <div class="menu-anchor open-menu">Menu</div>
            <div class="title open-menu">
              <span class="title-name">{{ $route.name }}</span>
              <span v-if="model.isModelReady" class="subtitle">
                {{ model.selectedSize.name }}:{{ model.selectedVersion.name }}</span
              >
            </div>
          </div>
          <div class="actions-right" />
        </nav>
        <div class="appbody">
          <div class="appnav">
            <div class="tree navigation" ref="nav">
              <ul>
                <li>
                  <router-link class="item" to="deploymentsetup" active-class="active">
                    <i class="icon icon-options"></i>Deployment Setup
                  </router-link>
                </li>
                <li v-if="model.selectedProduct.shortName === 'pENM'">
                  <router-link
                    to="excludeipaddresses"
                    :class="setRouterViewClass()"
                    active-class="active"
                  >
                    <i class="icon icon-options"></i>Exclusion of IP Addresses
                  </router-link>
                </li>
                <li>
                  <router-link
                    to="autopopulate"
                    :class="setRouterViewClass()"
                    active-class="active"
                  >
                    <i class="icon icon-options"></i>Auto Populate
                  </router-link>
                </li>
                <li>
                  <router-link
                    to="sitedetails"
                    :class="setRouterViewClass()"
                    active-class="active"
                  >
                    <i class="icon icon-options"></i>Site Details
                  </router-link>
                </li>
                <li>
                  <router-link
                    to="previewexport"
                    :class="setRouterViewClass()"
                    active-class="active"
                  >
                    <i class="icon icon-options"></i>Preview and Export
                  </router-link>
                </li>
                <li>
                  <router-link
                    to="compare"
                    class="item"
                    active-class="active"
                  >
                    <i class="icon icon-options"></i>Compare Releases
                  </router-link>
                </li>
              </ul>
              <ul>
              <div v-if="model.targetAudience === 'pdu'" class="documentation"  id="API_docs_URL">
                <a @click="getApiDocURL()">API documentation</a>
              </div>
              <div @click="showVersionModal = true" class="appversion">
                Version History: v{{ versionHistory.currentVersion }}
              </div>
              </ul>
            </div>
          </div>
          <div class="appcontent">
            <router-view />
          </div>
        </div>
      </div>
    </main>
    <transition name="dialog">
      <div v-if="showVersionModal" @click.self="showVersionModal = false" class="dialog">
        <div class="content">
          <div class="top">
            <div class="title">Version history</div>
            <div class="right">
              <i @click="showVersionModal = false" class="icon icon-cross"></i>
            </div>
          </div>
          <div class="body">
            <div class="timeline">
              <ul class="main-list">
                <li class="entry" v-for="v in versionHistory.history" :key="v.version">
                  <div class="target">
                    <h4 class="title">v{{ v.version }}</h4>
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
    <transition name="dialog" class="dialog">
      <div v-if="model.showDescriptionModal" @click="model.showDescriptionModal=false" class="dialog">
        <div class="content">
          <div class="top">
            <div class="title"><strong>{{model.currentQuestion.displayName}}</strong></div>
            <div class="right">
              <i @click="model.showDescriptionModal = false" class="icon icon-cross"></i>
            </div>
          </div>
          <div class="body">
            <div class="timeline">
              <div class="target">
                <div class="content" v-if="model.currentQuestion.longDescription">
                  <ul >
                    <li v-for="(longDescription, index) in model.currentQuestion.longDescription" :key="index">
                      {{longDescription}}
                    </li>
                  </ul>
                </div>
                <div class="content" v-else>
                  <div v-html="model.currentQuestion.htmlDescription"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { Layout } from "@eds/vanilla/common/scripts/Layout";
import { Tree } from "@eds/vanilla/tree/Tree";
import model from "./model";
import versionHistoryData from "./model/versionHistory";

export default {
  name: "app",
  data() {
    return {
      model: model,
      versionHistory: versionHistoryData,
      showVersionModal: false,
      showSchemaHistory: false,
    };
  },
  mounted() {
    const layout = new Layout(document.body);
    layout.init();
    const tree = new Tree(this.$refs.nav);
    tree.init();
  },
  methods: {
    setRouterViewClass() {
      return this.model.prepared ? "item" : "item link-disabled";
    },
    getApiDocURL() {
      window.open(model.sedApiDocsUrl, '_blank');
    }
  },
};
</script>

<style scoped lang="less">
.appversion {
  position: absolute;
  bottom: 10px;
  margin: 8px 16px;
  cursor: pointer;
}

.documentation {
  position: absolute;
  bottom: 40px;
  margin: 8px 16px;
  cursor: pointer;
}

.dialog > .content > .top > .right {
  font-size: 20px;
}

.light .switch input:checked + .ball,
.light .sysbar .switch input:checked + .ball,
.light .syspanel .switch input:checked + .ball {
  background-color: #181818 !important;
  border: solid 1px #767676 !important;
}

.link-disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>

<style>
.btn {
  margin: 5px;
}

.tooltip {
  position: relative;
  display: inline-block;
}
.tooltip .tooltiptext {
  visibility: hidden;
  width: 120px;
  background-color: black;
  color: #fff;
  text-align: center;
  padding: 5px 0;
  position: absolute;
  z-index: 1;
  top: -5px;
  left: 110%;
}
.tooltip .tooltiptext::after {
  content: "";
  position: absolute;
  top: 15%;
  right: 100%;
  margin-top: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: transparent black transparent transparent;
}
.tooltip:hover .tooltiptext {
  visibility: visible;
}

.input-box {
  margin-top: -7px;
}

.light input:invalid:not(.pristine) {
  border: 2px solid #bb0b02;
}
</style>
