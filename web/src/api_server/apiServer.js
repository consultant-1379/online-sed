import express from 'express';
import https from 'https';
import fs from 'fs';
import validatePENM from './routes/validatePENM.js';
import validateCENM from "./routes/validateCENM.js";
import healthChecker from './routes/healthChecker.js';
import externalAPIRoute from './routes/ExternalAPI.js';
import addProductSet from './routes/addProductSet.js';
import addReleaseProductSet from './routes/addReleaseProductSet.js';
import addCENMProductSet from './routes/addCENMProductSet.js';
import addCENMReleaseProductSet from './routes/addCENMReleaseProductSet.js';

import http from "http";

import swaggerUi from 'swagger-ui-express';

import bodyParser from 'body-parser';
import cors from 'cors';

import { readFileSync } from "fs";
const swaggerFile = JSON.parse(readFileSync("./swagger.json"));

const app = express()
const timeout = 5000;
var server;
var port;

app.use(express.json())
app.use(bodyParser.json());
app.use(cors());
app.use('/healthcheck', healthChecker);
app.use('/api/validate', validatePENM);
app.use('/api/validatecenm', validateCENM);
app.use('/api/extapi', externalAPIRoute);
app.use('/api/addproductset', addProductSet);
app.use('/api/addreleaseproductset', addReleaseProductSet);
app.use('/api/addcenmreleaseproductset', addCENMReleaseProductSet);
app.use('/api/addcenmproductset', addCENMProductSet);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerFile)
);
app.use(express.static('res'));

if (process.env.NODE_ENV === 'production') {
  // Production environment - Use HTTPS

  // Trust the NGINX proxy
  app.set('trust proxy', true);

  // Create HTTPS server using NGINX's SSL/TLS certificates
  const serverOptions = {
    key: fs.readFileSync('/ssl_certs/siteengineeringdata_internal_ericsson_com.key'),
    cert: fs.readFileSync('/ssl_certs/cabundle.crt')
  };

  // Start the HTTPS server
  port = 3000;
  server = https.createServer(serverOptions, app);
  server.listen(port, () => {
    console.log(`Express app running over HTTPS on port ${port}`);
  });
} else {
  // Local development environment - Use HTTP
  // Start the HTTP server
  port = process.env.PORT || 3000;
  server = http.createServer(app);
  server.listen(port, () => {
    console.log(`Express app running over HTTP on port ${port}`);
  });
}
server.setTimeout(timeout);
