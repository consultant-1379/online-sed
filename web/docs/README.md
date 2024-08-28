# Online SED details

## Project structure

```
.
├── containers
│  ├── DockerfileAPIServer
│  ├── DockerfileDevAPIServer
│  ├── DockerfileDevFrontServer
│  ├── DockerfileFrontServer
├── JenkinsSEDPipelines
│  ├── AddCenmSedAndRcdReleaseProductSetJenkinsFile
│  ├── JenkinsfileWatcher
│  ├── SEDAddCENMInternalProductSetJenkinsFile
│  ├── SEDAddCENMReleaseProductSetJenkinsFile
│  ├── SEDAddReleaseProductSetJenkinsFile
├── test
│  ├── test_scripts
│     ├── execute_api_server.sh
│     ├── execute_sonarqube_scan.sh
│     ├── execute_web_coverage.sh
│     ├── execute_web_playwright.sh
│  ├── Dockerfile
├── utils
│  ├── compare_sed.py                       A script used for finding the differences in Keys and Values of 2 json schema files
│  ├── README.md
├── web
│  ├── docs
│  ├── .env.internal
│  ├── index.html                           Entry point of recursive dependency walking
│  ├── node_modules                         Dependency folder (git ignored)
│  ├── package-lock.json                    Dependency details
│  ├── package.json                         Project configuration
│  ├── README.md        
│  ├── playwright.config.js                 playwright settings
│  ├── run_api_server.sh                    script to run backend Express server
│  ├── sonar-project.properties             sonar project properties
│  ├── swagger.json                         Docs gen - swagger
│  ├── src              
│  │  ├── api_server                        REST API server
│  │  │  ├── addCENMProductSet.js           A GET request to add product set version of cENM product internally
│  │  │  ├── addCENMReleaseProductSet.js    A GET request to add R-state of cENM product externally
│  │  │  ├── addProductSet.js               A GET request to add product set version of pENM product internally
│  │  │  ├── addReleaseProductSet.js        A GET request to add R-state of pENM product externally
│  │  │  ├── ExternalAPI.js                 Set of API endpoints to get data from artifactory (e.g. schemas information)
│  │  │  ├── healthChecker.js               A GET request to check the status of backend server (Express.js)
│  │  │  ├── validateCENM.js                A post request to validate a SED file (txt) for pENM
│  │  │  ├── validatePENM.js                A post request to validate a SED file (yaml) for cENM
│  │  ├── components                        All the sub-components
│  │  ├── model                             Data-model
│  │  ├── router                            All routes for the project
│  │  ├── utils                             Common utilities
│  │  ├── views                             Views used in the project
│  │  ├── App.vue                           Main Component, contains the base layout of the site
│  │  └── main.js                           Main script, initializes Vue, component-routing, and the data-model
│  └── vite.config.js                       Bundler config
```

## Model

[`./model.md`](./model.md)


## Components

[`./components.md`](./components.md)
