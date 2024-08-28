import { createRouter, createWebHashHistory } from "vue-router";
import SiteDetails from "../views/SiteDetailsTable.vue";
import PreviewDetails from "../views/PreviewDetailsTable.vue";
import AutoPopulate from "../views/AutoPopulate.vue";
import DeploymentSetup from "../views/DeploymentSetup.vue";
import ExclusionOfIPAddresses from "../views/ExclusionOfIPAddresses.vue";
import CompareReleases from "../views/CompareReleases.vue";
import model from "../model";

const routes = [
  {
    name: "Deployment Setup",
    path: "/deploymentsetup",
    component: DeploymentSetup
  },
  {
    name: "Exclusion of IP Addresses",
    path: "/excludeipaddresses",
    component: ExclusionOfIPAddresses
  },
  {
    name: "Auto Populate",
    path: "/autopopulate",
    component: AutoPopulate
  },
  {
    name: "Site Details",
    path: "/sitedetails",
    component: SiteDetails
  },
  {
    name: "Preview Details and Export",
    path: "/previewexport",
    component: PreviewDetails
  },
  {
    name: "Compare Releases",
    path: "/compare",
    component: CompareReleases
  },
  {
    path: "/",
    redirect: "/deploymentsetup"
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach((to, from) => {
  if (model.userDataCleared == false){
    model.userDataCleared = true;
    return false;
  }
  else {
    return true;
  }
});

export default router;