const history = Object.freeze([
  {
    version: '1.0.1',
    changes: [
      'Productify PoC changes.'
    ]
  },
  {
    version: '1.0.2',
    changes: [
      'Updates for hosting tool.'
    ]
  },
  {
    version: '1.2.1',
    changes: [
      "Fixed duplication highlighting issue where some IP's were incorrectly marked as duplicate."
    ]
  },
  {
    version: '1.3.1',
    changes: [
      "Fixed Setup Deployment to allow users to update details and load new schema."
    ]
  },
  {
    version: '1.3.2',
    changes: [
      "Fixed exported SED file being named incomplete-xxxx.",
      "Fixed data deletion notification deleting data when user selects cancel.",
      "Allow user to proceed to next category if valueMatchesKey is not set yet.",
      "Allow parameters to have empty values in the schema and include then in exported file.",
      "Validate API no longer return parameters that are not required for the selected IP version.",
    ]
  },
  {
    version: '1.3.3',
    changes: [
      "Introduce use case option to the tool for install or upgrade.",
      "Make input regex validation less strict for pENM at upgrade."
    ]
  },
  {
    version: '1.3.4',
    changes: [
      "Introduce functionality to exclude passwords from the SED."
    ]
  },
  {
    version: '1.4.1',
    changes: [
      "Fixed issue where enabling Fallback leads to it not being possible to export a SED."
    ]
  },
  {
    version: '1.5.1',
    changes: [
      "Fixed issue where Select Product Line dropdown does not show 24.1"
    ]
  },
  {
    version: '1.6.1',
    changes: [
      "Introduce schema comparison tool.",
      "Fixed problem where validation errors were being incorrectly displayed due to the Wizard clicks causing tool to loose track of current step in Site Details Page."
    ]
  },
  {
    version: '1.6.2',
    changes: [
      "Fixed issue where the same IPv6 addresses, one with upper and the other with lower case letters were not flagged as duplicate IPs."
    ]
  },
  {
    version: '1.6.3',
    changes: [
      "Fixed issue where the user is entering a huge range of IPv6 addresses fails to auto populate.",
      "Fixed issue where the user is not able to populate NAS and SAN keys in Install because of mismatch error."
    ]
  },
  {
    version: '1.7.1',
    changes: [
      "Fixed issue where some external pENM IP releases were getting deleted incorrectly."
    ]
  },
  {
    version: '1.7.2',
    changes: [
      "Updated tooltip text of Exclude passwords in SED toggle in Deployment Setup page."
    ]
  },
  {
    version: '1.8.1',
    changes: [
      "Enhanced preview page now supports error and change filtering for improved usability."
    ]
  },
  {
      version: '1.8.2',
      changes: [
          "Updated Compare Releases page to inform user of how to find changes delivered in the SED Excel prior to 23.4."
      ]
  },
  {
    version: '1.9.1',
    changes: [
      "Preserving user session after SED export.",
      "Improved usability of compare release page.",
      "Enabled support for multiple user sessions in one browser window.",
      "Allow the user to navigate to the next category with validation issues in the current category in the site details page and stop the user from exporting the sed values until the validation issues (excluding regex errors, FAIL - Invalid value) are solved in the preview details page."
    ]
  },
  {
    version: '1.9.2',
    changes: [
      "Addressed the issue where empty values were erroneously exported as 'undefined' to the SED, ensuring they are now excluded from the export process.",
    ]
  },
  {
    version: '1.9.3',
    changes: [
      "Addressed the issue in the Preview page where some changes were being incorrectly displayed.",
      "cENM: Backup schedule end date was not validated in SiteDetails page."
    ]
  },
  {
    version: '1.9.4',
    changes: [
      "Addressed the issue of the datepicker component in SiteDetails page.",
      "cENM: Addressed the issue of reading/populating dates from yaml file into the tool."
    ]
  },
  {
    version: '1.10.1',
    changes: [
      "Added support for cENM."
    ]
  },
  {
    version: '1.11.1',
    changes: [
      "Export SED keys as same order as Preview page tables rows.",
      "Update SiteDetails page table's header to remain while scrolling the page.",
      "cENM: Add missing validation on backup_scheduling_schedules (stop date)."
    ]
  },
  {
    version: '1.11.2',
    changes: [
      "UI/UX improvement for immutable entities",
      "Update SiteDetails page to be more responsive with small screens",
      "cENM: Add support to import a base yaml file for testing with schema changes (for internal use only).",
      "pENM: Export ProductSet version/R-state into txt file in Online SED for pENM."
    ]
  },
  {
    version: '1.11.3',
    changes: [
      "cENM: Add support for CSAR Lite for internal users."
    ]
  },
  {
    version: '1.12.1',
    changes: [
      "cENM: Update handling for PM Server relabel configs parameter."
    ]
  }
].reverse());

const sedPenmPreSchemaHistory = Object.freeze([
  {
    version: 'History Before 23.4',
    changes: [
      "Refer to the Revision History in the SED Excel referenced in the 23.15 Release Note for information on what has changed in the SED prior to 23.4."
    ]
  },
  {
    version: '23.16',
    changes: [
      "16/10/2023: Removed 'scp_SCP_vip_internal' parameter from ENM On Rack.",
      "16/11/2023: Updated comment for 'fb_node1_vcProfile' and highlighted it as optional.",
      "16/11/2023: Remove passwords at Upgrade.",
      "27/11/2023: Update to have neo4j passwords at Initial Install."
    ]
  }
].reverse());
export default Object.freeze({
  history,
  sedPenmPreSchemaHistory,
  currentVersion: history[0].version,
});
