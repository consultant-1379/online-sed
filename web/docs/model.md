# Model

The application has a single central model, which is explicitly made reactive.

Upon changing Product, UseCase,IP Version, Deployment Size and Deployment Type, a new JSON file gets downloaded, processed and loaded into the previously created model. Due to the reactive manner of the model, after changing any value in it, all the components which are using that specific data get updated.

Here is an overview on the definition of data-model using typescript syntax.

## Top level model
```ts
{
    products: [],
    sizes: [],
    allVersions: [],
    versions: [],
    sprints: [],
    releases: [],
    ipVersions: [],
    selectedProduct: default_select,
    selectedUseCase: default_select,
    selectedSize: default_select,
    selectedVersion: default_select,
    selectedSprint: default_sprint_select,
    selectedRelease: default_release_select,
    selectedIpVersion: default_select,
    dataTypeCategories: [],
    schemaForm: [],
    response: {},
    importedData: {},
    immutableImportedData: {},
    updated_data: {},
    prepared: false,
    showDescriptionModal: false,
    showDuplicatedValues: false,
    currentQuestion: {},
    default_select: {name: "Please select...", },
    targetAudience: import.meta.env.VITE_APP_ENV_TYPE ? import.meta.env.VITE_APP_ENV_TYPE : 'cu',
    sedApiDocsUrl: SED_API_DOCS_URL,
    userDataCleared: true,
    isModelReady: false,
    usePreviousSED: true,
    importedFileContent: null,
    importedFileName: null,
    showpENMSizeMismatchNotification: false,
    showcENMSizeMismatchNotification: false,
    showIpVersionMismatchNotification: false,
    dryRunMode: false,
    isIncomplete: true,
    showDeleteAllDataConfirmation: false,
    wizardCurrentStep: 0,
    variableNameEnabled: true,
    autoPopulationTypes: [],
    excludeIps: [{ ipAddress: '', ipDescription: '', isDuplicate: false, errorMessage: false }],
    usedIpAddresses: [],
    displayKeys: [],
    productVersions: [],
    loadedSchema: {},
    selectedSchema: default_select,
    artifactoryRepoData: {},
    schemaFromFileMode: false,
    importedSchemaFileName: null,
    includePasswords: true,
    storedSchema: {},
    autopopulatedValues: [],
    autopopulatedValuesStillRequired: {},
    displayAll: true,
    displayErrors: false,
    displayChanged: false,
    expandCategories: true,
    showTolerationDialog: false,
    initializedK8sTolerationSelects: [],
    initializedObjectArrayInputSelects: []
}
```