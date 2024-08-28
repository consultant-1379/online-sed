import {response, Router} from 'express';
import axios from 'axios';
import {
    loadVersionFile,
    loadReleaseFile,
    addInternalProductSet
} from '../../utils/utils.js';

const router = Router();
const schemesList = ["http:", "https:"];
const domainsList = ["ci-portal.seli.wh.rnd.internal.ericsson.com"];

/**
 * API endpoint for getting the Deployment Templates Version from ENM Media Artifact in ENM Product Set
 *
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Object} - HTTP response object
 */
router.get('/:version?', async (req, res) => {
  res.header({
        'Content-Type': "application/json; charset=utf-8",
        'Access-Control-Allow-Methods': "GET, POST, OPTIONS, PUT"
  })
  const version = req.params.version;
  let product = "pENM"
  let versionsObject = await loadVersionFile(product, false);
  let releasesObject = await loadReleaseFile();
  if (version) {
    console.log("Adding " + version);
    const url = (new URL('https://ci-portal.seli.wh.rnd.internal.ericsson.com/api/deployment/deploymentTemplates/productSet/ENM/version/' + version));
    if (schemesList.includes(url.protocol) && domainsList.includes(url.hostname)) {
      axios.get(url)
        .then(async (response) => {
            let schemaVersion = response.data.deploymentTemplatesVersion;
            let sprintVersion = version.split(".").slice(0, 2).join(".");
            let releaseNumber = releasesObject.filter(obj => obj.sprintNumber === sprintVersion);
            if (releaseNumber.length > 0) {
                releaseNumber = releaseNumber[0].releaseNumber;
            } else {
                releaseNumber = "";
            }
            let results = response.data
            await addInternalProductSet(version, product, schemaVersion, sprintVersion, releaseNumber, versionsObject, results, res)
        }).catch(error => {
          const logMessage = `An error has occurred or the version [${version}] was not found!`;
          console.log(logMessage)
          return res.status(400).json({success: false, message: logMessage, result: error});
        });
    }
  } else {
    return res.status(400).json({success: false, message: "Missing version parameter!", result: {}});
  }
});

export default router;