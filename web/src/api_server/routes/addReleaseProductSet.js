import {Router} from 'express';
import axios from 'axios';
import {
  loadVersionFile,
  loadReleaseFile, addReleaseProductSet
} from '../../utils/utils.js';

const router = Router();
const schemesList = ["http:", "https:"];
const domainsList = ["ci-portal.seli.wh.rnd.internal.ericsson.com"];

router.get('/:version?', async (req, res) => {
  res.header({
        'Content-Type': "application/json; charset=utf-8",
        'Access-Control-Allow-Methods': "GET, POST, OPTIONS, PUT"
  })
  const version = req.params.version;
  let product = "pENM"
  let externalVersionsObject = await loadVersionFile(product, true);
  let internalVersionsObject = await loadVersionFile(product, false);
  let releasesObject = await loadReleaseFile();
  const versionsList = externalVersionsObject.map(obj => obj.name);
  let schemaVersion = "";
  if (version) {
    console.log("Adding " + version);
    const url = (new URL('https://ci-portal.seli.wh.rnd.internal.ericsson.com/api/deployment/deploymentTemplates/productSet/ENM/version/' + version));
    if (schemesList.includes(url.protocol) && domainsList.includes(url.hostname)) {
      axios.get(url)
        .then(async (response) => {
            schemaVersion = response.data.deploymentTemplatesVersion;
            let sprintVersion = version.split(".").slice(0, 2).join(".")
            let releaseNumber = releasesObject.filter(obj => obj.sprintNumber === sprintVersion);
            if (releaseNumber.length > 0) {
                releaseNumber = releaseNumber[0].releaseNumber;
            } else {
                releaseNumber = "";
            }
            await addReleaseProductSet(version, product, schemaVersion, sprintVersion, releaseNumber, externalVersionsObject, internalVersionsObject, res, versionsList);
        }).catch(error => {
          const logMessage = "An error has occurred or the version is not found!";
          console.log(logMessage)
          return res.status(400).json({success: false, message: logMessage, result: error});
        });
    }
  } else {
    return res.status(400).json({success: false, message: "Missing version parameter", result: {}});
  }
});

export default router;