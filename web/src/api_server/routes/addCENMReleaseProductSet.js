import {Router} from 'express';
import {
  loadVersionFile,
  loadReleaseFile,
  getCloudNativeProductSetContent,
  addReleaseProductSet
} from '../../utils/utils.js';

const router = Router();

/**
 * API endpoint to update the cENM version.js with a given release version
 *
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {Object} - HTTP response object
 */

router.get('/:version?', async (req, res) => {
  try {
    res.header({
      'Content-Type': "application/json; charset=utf-8",
      'Access-Control-Allow-Origin': "*",
      'Access-Control-Allow-Methods': "GET, POST, OPTIONS, PUT"
    })
    const version = req.params.version;
    let product = "cENM"
    let externalVersionsObject = await loadVersionFile(product, true);
    let internalVersionsObject = await loadVersionFile(product, false);
    let releasesObject = await loadReleaseFile();
    const versionsList = externalVersionsObject.map(obj => obj.name);
    if (version) {
      console.log("Adding " + version);
      let productSetContent = await getCloudNativeProductSetContent(version.split('.').slice(0, 2).join('.'), version);
      if (productSetContent === null) {
        const logMessage = `An error has occurred or the version [${version}] was not found!`;
        console.log(logMessage)
        return res.status(400).json({success: false, message: logMessage});
      }
      let schemaVersion = productSetContent[2]['integration_values_file_data'][0]['values_file_version'];
      let sprintVersion = version.split(".").slice(0, 2).join(".")
      let releaseNumber = releasesObject.filter(obj => obj.sprintNumber === sprintVersion);
      if (releaseNumber.length > 0) {
        releaseNumber = releaseNumber[0].releaseNumber;
      } else {
        releaseNumber = "";
      }
      await addReleaseProductSet(version, product, schemaVersion, sprintVersion, releaseNumber, externalVersionsObject, internalVersionsObject, res, versionsList);
    } else {
      return res.status(400).json({success: false, message: "Missing version parameter.", result: {}});
    }
  }
  catch (error) {
    const logMessage = `An error has occurred: ${error}`;
    console.log(logMessage, error)
    return res.status(400).json({success: false, message: logMessage, result: error});
  }
});

export default router;