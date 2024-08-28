import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import model from "./model";
import { loadProducts, storeModel, loadModelFromStorage, dec2hex } from "./model";
import DropDownSelect from "./components/DropDownSelectEmitOptionIndex.vue";
import DropDownSelectList from "./components/DropDownSelectEmitOption.vue";
import SiteDetailEntry from "./components/SiteDetailEntry.vue";
import AutoPopulateEntry from "./components/AutoPopulateEntry.vue";
import SelectReleaseSprintNumber from "./components/SelectReleaseSprintNumber.vue";
import SelectProductSetVersion from "./components/SelectProductSetVersion.vue";
import SelectIpVersion from "./components/SelectIpVersion.vue";
import SelectSchema from "./components/SelectSchema.vue";
import SelectProduct from "./components/SelectProduct.vue";
import NodeSelector from "./components/NodeSelector.vue";
import KubernetesToleration from "./components/KubernetesToleration.vue";
import CustomObject from "./components/CustomObject.vue";
import ObjectArray from "./components/ObjectArray.vue";

const app = createApp(App);
app.component("DropDownSelect", DropDownSelect);
app.component("DropDownSelectList", DropDownSelectList);
app.component("SiteDetailEntry", SiteDetailEntry);
app.component("AutoPopulateEntry", AutoPopulateEntry);
app.component("SelectReleaseSprintNumber", SelectReleaseSprintNumber);
app.component("SelectProductSetVersion", SelectProductSetVersion);
app.component("SelectIpVersion", SelectIpVersion);
app.component("SelectSchema", SelectSchema);
app.component("SelectProduct", SelectProduct);
app.component("NodeSelector", NodeSelector);
app.component("KubernetesToleration", KubernetesToleration);
app.component("CustomObject", CustomObject);
app.component("ObjectArray", ObjectArray)
app.config.devtools = true;
app.use(router);
app.mount("#app");

if (!window.name) {
  var arr = new Uint8Array((10 || 40) / 2);
  window.crypto.getRandomValues(arr);
  window.name = Array.from(arr, dec2hex).join('');
}

// define model_id unique to the current tab
const model_id = "model_" + window.name;

if (!loadModelFromStorage(model_id, model)) {
  model.firstrun=true;
  loadProducts(model);
  router.push("/");
}

window.onbeforeunload = function() {
  storeModel(model_id, model);
}

// Close all dropdown when click on the page
document.addEventListener("click", function(e) {
  var tParent = e.target.parentNode;
  if (tParent.classList && !tParent.classList.contains("drop-down")) {
    var openDropDown = document.querySelectorAll('.drop-down');
    openDropDown.forEach(dropDown => {
      dropDown.classList.remove("open");
      dropDown.classList.add("closed");
    })
  }
});
