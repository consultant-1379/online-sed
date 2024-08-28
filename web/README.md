# Online SED frontend

SED stands for **S***ite* **E***ngineering* **D***ata*.

This repository contains the web-based front-end and back-end for the Online SED tool.

This project outputs the Front-end files (HTML , JS and CSS) which can be displayed by a modern web-browser.

It is based on [Vue.js v3](https://v3.vuejs.org) web-framework.

The style is provided by Ericsson Design System (EDS).

The bundler used by the project is [Vite](https://vitejs.dev).
## Development

### Requirements
- Node.js (16.13.2 LTS and after)
- npm (8.1.2 or higher)
   - playwright/test (1.15.2 or higher)

### Getting started

Navigate to the cloned repository's `web` folder.


### To install the NPM packages:

```bash
cd web
npm install
```

### To run the application (back-end and front-end):

```bash
cd web
npm run dev
```


### To run the Vue frontend GUI webserver ONLY (internal link -  port: 5003):

```bash
cd web
npm run dev:frontend-internal
```

### To run the Vue frontend GUI webserver ONLY (external link -  port: 5002):

```bash
cd web
npm run dev:frontend-external
```


### To run the Vue frontend GUI tests:

```bash
cd web
npm run test:ui-e2e
```

### To run a specific GUI test
Update the following profile "test:ui-e2e-headed-single" in package.json file to specify the test name
```bash
cd web
npm run test:ui-e2e-headed-single
```

### To run unit tests:

```bash
cd web
npm run test:unit
```

### To run end-to-end tests:

```bash
cd web
npm run test:ui-e2e
```

### To run test coverage and get a report from SpnarQube

```bash
cd web
npm run sonar
```

### To run the tests via docker container:

Install bob as per below guide

https://gerrit.ericsson.se/plugins/gitiles/adp-cicd/bob/+/HEAD/USER_GUIDE_2.0.md#In-case-you-don_t-want-to-add-bob-as-submodule

```bash
bob run-tests
```

### To run nginx containers locally:

Build dev image:
```bash
bob build-dev-image
```

Start containers:
One container for front end and a second container for the backend api server.
The front end comes in two versions. One for cu(external) and a second for pdu(internal).
The image names are:
armdocker.rnd.ericsson.se/proj-online-sed/sed-dev-front-cu
armdocker.rnd.ericsson.se/proj-online-sed/sed-dev-front-pdu
```bash
docker stop sed sedback
docker rm sed sedback
docker network rm sed_network
docker network create --driver bridge sed_network
docker run --restart always -d -v <PATH to SED repo>web/res/data/:/web/res/data --network sed_network -p 3000:3000 --name sedback armdocker.rnd.ericsson.se/proj-online-sed/sed-dev-back:<image version built in previous step>
docker run --restart always -d -v <PATH to SED repo>web/res/data/:/web/data --network sed_network -p 8888:80 --name sed armdocker.rnd.ericsson.se/proj-online-sed/sed-dev-front-pdu:<image version built in previous step>
docker run --restart always -d -v <PATH to SED repo>web/res/data/:/web/data --network sed_network -p 8889:80 --name sed armdocker.rnd.ericsson.se/proj-online-sed/sed-dev-front-cu:<image version built in previous step>
```

The tool should now be available on your laptop at: http://localhost:5003/ for pdu or http://localhost:5002/ for cu

# Online SED backend

Express is a lightweight and flexible routing framework with minimal core features meant to be augmented through the use of Express middleware modules.
Below routes are available on the server:
- /healthcheck
- /api/extapi
- /api/validate
- /api/validatecenm
- /api/addproductset
- /api/addcenmproductset
- /api/addreleaseproductset
- /api/addcenmreleaseproductset

All previous endpoints are available using the port: 3000

API Docs can be found on Swagger using the following link: http://localhost:3000/api-docs/


### To run the Express backend server ONLY (port: 3000):

```bash
cd web
npm run dev:backend
```