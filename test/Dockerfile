FROM node:19.0 AS node-deps

# COPY gen /gen
# RUN apt-get update && \
#     apt-get install -y python3-pip && \
#     pip3 install -r /gen/requirements.txt && \
#     pip3 install pylint

# FROM base as node-deps

RUN apt-get update && \
    apt-get install -y openjdk-17-jre && \
    apt-get clean;

COPY web/package.json /web/package.json
COPY web/playwright.config.js /web/playwright.config.js
RUN npm config set @eds:registry https://arm.rnd.ki.sw.ericsson.se/artifactory/api/npm/proj-eds-npm-local && \
    cd web && npm install && \
    npx playwright install-deps && \
    npx playwright install

FROM node-deps

COPY web /web
# COPY web/res/schema/ui_test_schema.json /web/res/schema/cENM/schema.json
COPY test/test_scripts /test_scripts
