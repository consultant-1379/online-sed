# Online SED front-end

SED stands for **S***ite* **E***ngineering* **D***ata*.

This repository contains the web-based front-end and back-end for the Online SED tool.

This project outputs the Front-end files (HTML , JS and CSS) which can be displayed by a modern web-browser.

It is based on [Vue.js v3](https://v3.vuejs.org) web-framework.

The style is provided by Ericsson Design System (EDS).

The bundler used by the project is [Vite](https://vitejs.dev).

## Jenkins

[Precommit Pipeline](https://fem16s11-eiffel004.eiffel.gic.ericsson.se:8443/jenkins/job/online-sed_precommit/)

[Release master branch Pipeline](https://fem16s11-eiffel004.eiffel.gic.ericsson.se:8443/jenkins/job/online-sed/)

[Release staging branch Pipeline](https://fem16s11-eiffel004.eiffel.gic.ericsson.se:8443/jenkins/job/online-sed_staging/)

### Jobs
[sed_add_release_product_set](https://fem16s11-eiffel004.eiffel.gic.ericsson.se:8443/jenkins/job/sed_add_release_product_set/)
:To add R-state of pENM product externally

[sed_add_cenm_release_product_set](https://fem16s11-eiffel004.eiffel.gic.ericsson.se:8443/jenkins/job/sed_add_cenm_release_product_set/)
:To add R-state of cENM product externally

[sed_add_cenm_product_set](https://fem16s11-eiffel004.eiffel.gic.ericsson.se:8443/jenkins/job/sed_add_cenm_product_set/)
:To add product set version of cENM product internally

## Production

https://siteengineeringdata.internal.ericsson.com/

## MT Internal Green build Product sets

https://siteengineeringdata.internal.ericsson.com:8888/

## Repo

https://gerrit.ericsson.se/#/admin/projects/OSS/ENM-Parent/SQ-Gate/com.ericsson.oss.deployment.tools/online-sed

## Project architecture and details

Please check [`./web/docs/README.md`](./docs/README.md) for more information.