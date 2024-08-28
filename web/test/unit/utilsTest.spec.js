import {
  findFileInArtifactoryRepo,
  normalizeProductSetVersion,
  loadVersionFile,
  fetchTestSchema, addReleaseProductSet, addInternalProductSet, checkForDuplicates
}
  from "../../src/utils/utils";
import axios from 'axios';
import {vi} from "vitest";
import mock from 'mock-fs';
import fs from "fs";

vi.mock('axios');

test('findFileInArtifactoryRepo should return an array of results', async () => {
  const baseUrl = 'https://example.com';
  const repoName = 'my-repo';
  const searchPath = '/path/to/search';
  const fileName = 'file.txt';
  axios.post = vi.fn()
    .mockResolvedValue({ data: { results: ['file1', 'file2'] } });
  const results = await findFileInArtifactoryRepo(baseUrl, repoName, searchPath, fileName);
  assert.deepEqual(results, ['file1', 'file2']);
});

test('findFileInArtifactoryRepo should reject with an error if axios.post fails', async () => {
  const baseUrl = 'https://example.com';
  const repoName = 'my-repo';
  const searchPath = '/path/to/search';
  const fileName = 'file.txt';
  axios.post = vi.fn()
   .mockRejectedValue(new Error('Request failed'));
  try {
    await findFileInArtifactoryRepo(baseUrl, repoName, searchPath, fileName);
  } catch (error) {
    assert.deepEqual(error.message, 'Request failed');
  }
});

describe('Test normalizeProductSetVersion function', () => {
  test('Should return correct version after normalizing it', async () => {
    const NormalizedVersion = normalizeProductSetVersion("24.01.41");
    expect(NormalizedVersion).to.equal("24.1.41");
  });
});

describe('Test loadVersionFile function', () => {
  test('Should return correct versions after loading it from versions.json', async () => {
    const expectedCENMVersions = [
      {
        "name": "24.07.57",
        "schemaVersion": "1.57.0-37",
        "targetAudience": "pdu",
        "version": "24.07.57",
        "sprintVersion": "24.07",
        "releaseNumber": "24.2",
        "release": false,
        "normalisedVersion": "24.7.57"
      },
      {
        "name": "24.05.104",
        "schemaVersion": "1.55.0-69",
        "targetAudience": "pdu",
        "version": "24.05.104",
        "sprintVersion": "24.05",
        "releaseNumber": "24.2",
        "release": false,
        "normalisedVersion": "24.5.104"
      },
      {
        "name": "24.05.90",
        "schemaVersion": "1.55.0-61",
        "targetAudience": "pdu",
        "version": "24.05.90",
        "sprintVersion": "24.05",
        "releaseNumber": "24.2",
        "release": false,
        "normalisedVersion": "24.5.90"
      },
      {
        "name": "24.04.96",
        "schemaVersion": "1.54.0-69",
        "targetAudience": "pdu",
        "version": "24.04.96",
        "sprintVersion": "24.04",
        "releaseNumber": "24.2",
        "release": false,
        "normalisedVersion": "24.4.96"
      },
      {
        "name": "24.04.81-5",
        "schemaVersion": "1.54.0-62",
        "targetAudience": "pdu",
        "version": "24.04.81-5",
        "sprintVersion": "24.04",
        "releaseNumber": "24.2",
        "release": false,
        "normalisedVersion": "24.4.81-5"
      },
      {
        "name": "24.03.102 (R1GL)",
        "schemaVersion": "1.53.0-76",
        "targetAudience": "pdu",
        "version": "24.03.102",
        "sprintVersion": "24.03",
        "releaseNumber": "24.1",
        "release": true,
        "normalisedVersion": "24.3.102"
      },
      {
        "name": "24.03.102 (R1GT IP1)",
        "schemaVersion": "1.53.0-76",
        "targetAudience": "pdu",
        "version": "24.03.102",
        "sprintVersion": "24.03",
        "releaseNumber": "24.1",
        "release": true,
        "normalisedVersion": "24.3.102"
      }
    ]
    const CENMVersions = await loadVersionFile("cENM", false);
    assert.deepEqual(CENMVersions, expectedCENMVersions);
  });
});

describe('fetchTestSchema', () => {
  test('fetches the schema from the provided URL', async () => {
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({ testData: 'example' }) });
    const url = "https://arm.seli.gic.ericsson.se/artifactory/proj-online-sed-generic-local/penm/2.32.12/ENMOnRack/ENMOnRack__production_IPv4_schema.json";
    const response = await fetchTestSchema(url, 'penm');

    expect(response.ok).to.be.true;
    const data = await response.json();
    expect(data).to.deep.equal({ testData: 'example' });
  });

  test('falls back to the default schema if the file does not exist', async () => {
    globalThis.fetch = async () => ({
      ok: false,
      json: async () => ({ defaultData: 'example' }) });
    const url = 'http://example.com/penm/nonexistent-schema.json';
    const response = await fetchTestSchema(url, 'penm');

    expect(response.ok).to.be.false;
    const data = await response.json();
    expect(data).to.deep.equal({ defaultData: 'example' });
  });

  test('handles errors during the fetch operation', async () => {
    globalThis.fetch = async () => { throw new Error('Network error'); };
    const url = 'http://example.com/penm/some-schema.json';
    try {
      await fetchTestSchema(url, 'penm');
    } catch (error) {
      expect(error.message).to.equal('Network error');
    }
  });
});

describe('Test addReleaseProductSet function for cENM', () => {
  const originalInternalVersionOfFile = [
    {
      "name": "24.03.102 (R1GT)",
      "schemaVersion": "1.53.0-76",
      "targetAudience": "pdu",
      "version": "24.03.102",
      "sprintVersion": "24.03",
      "releaseNumber": "24.1",
      "release": true,
      "normalisedVersion": "24.3.102"
    },
    {
      "name": "24.03.30-2",
      "schemaVersion": "1.53.0-22",
      "targetAudience": "pdu",
      "version": "24.03.30-2",
      "sprintVersion": "24.03",
      "releaseNumber": "24.1",
      "release": false,
      "normalisedVersion": "24.3.30"
    }
  ]
  const originalExternalVersionOfFile = [
    {
      "name": "R1GT",
      "schemaVersion": "1.53.0-76",
      "targetAudience": "cu",
      "version": "24.03.102",
      "sprintVersion": "24.03",
      "releaseNumber": "24.1",
      "release": true,
      "normalisedVersion": "24.3.102"
    }
  ]
  beforeEach(() => {
    mock({ './res/data/cENM/externalVersions.json': JSON.stringify(originalExternalVersionOfFile), });
    mock({ './res/data/cENM/internalVersions.json': JSON.stringify(originalInternalVersionOfFile), });
    vi.spyOn(console, 'log').mockImplementation(() => {})

  });
  afterEach(() => {
    mock.restore();
    vi.restoreAllMocks();
  });

  test('Should update the versions file with a given release', async () => {
    let res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    axios.get = vi.fn()
        .mockResolvedValue({data: 'AOM 901 151 R1GU'});

    const updatedInternalVersionFile = [
      {
        "name": "24.04.102 (R1GU)",
        "schemaVersion": "1.53.0-76",
        "targetAudience": "pdu",
        "version": "24.04.102",
        "sprintVersion": "24.04",
        "releaseNumber": "24.1",
        "release": true,
        "normalisedVersion": "24.4.102"
      },
      {
        "name": "24.03.102 (R1GT)",
        "schemaVersion": "1.53.0-76",
        "targetAudience": "pdu",
        "version": "24.03.102",
        "sprintVersion": "24.03",
        "releaseNumber": "24.1",
        "release": true,
        "normalisedVersion": "24.3.102"
      }
    ]

    const updatedExternalVersionFile = [
      {
        "name": "R1GU",
        "schemaVersion": "1.53.0-76",
        "targetAudience": "cu",
        "version": "24.04.102",
        "sprintVersion": "24.04",
        "releaseNumber": "24.1",
        "release": true,
        "normalisedVersion": "24.4.102"
      },
      {
        "name": "R1GT",
        "schemaVersion": "1.53.0-76",
        "targetAudience": "cu",
        "version": "24.03.102",
        "sprintVersion": "24.03",
        "releaseNumber": "24.1",
        "release": true,
        "normalisedVersion": "24.3.102"
      }
    ]

    let version = '24.04.102'
    let product = 'cENM'
    let schemaVersion = '1.53.0-76'
    let sprintVersion = '24.04'
    let releaseNumber = '24.1'
    let versionsList = "['R1GT']"
    await addReleaseProductSet(version, product, schemaVersion, sprintVersion, releaseNumber, originalExternalVersionOfFile, originalInternalVersionOfFile, res, versionsList);
    const CENMInternalVersions = await loadVersionFile("cENM", false);
    assert.deepEqual(CENMInternalVersions, updatedInternalVersionFile);
    const CENMExternalVersions = await loadVersionFile("cENM", true);
    assert.deepEqual(CENMExternalVersions, updatedExternalVersionFile);
  });

  test('Should update an already existing release', async () => {
    let res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    axios.get = vi.fn()
        .mockResolvedValue({data: 'AOM 901 151 R1GT'});

    const updatedInternalVersionFile = [
      {
        "name": "24.04.102 (R1GU)",
        "normalisedVersion": "24.4.102",
        "release": true,
        "releaseNumber": "24.1",
        "schemaVersion": "1.53.0-76",
        "sprintVersion": "24.04",
        "targetAudience": "pdu",
        "version": "24.04.102",
      },
      {
        "name": "24.03.112 (R1GT)",
        "schemaVersion": "1.53.0-76",
        "targetAudience": "pdu",
        "version": "24.03.112",
        "sprintVersion": "24.03",
        "releaseNumber": "24.1",
        "release": true,
        "normalisedVersion": "24.3.112"
      }
    ]

    const updatedExternalVersionFile = [
      {
        "name": "R1GU",
        "normalisedVersion": "24.4.102",
        "release": true,
        "releaseNumber": "24.1",
        "schemaVersion": "1.53.0-76",
        "sprintVersion": "24.04",
        "targetAudience": "cu",
        "version": "24.04.102",
      },
      {
        "name": "R1GT",
        "schemaVersion": "1.53.0-76",
        "targetAudience": "cu",
        "version": "24.03.112",
        "sprintVersion": "24.03",
        "releaseNumber": "24.1",
        "release": true,
        "normalisedVersion": "24.3.112"
      }
    ]

    let version = '24.03.112'
    let product = 'cENM'
    let schemaVersion = '1.53.0-76'
    let sprintVersion = '24.03'
    let releaseNumber = '24.1'
    let versionsList = "['R1GT']"
    await addReleaseProductSet(version, product, schemaVersion, sprintVersion, releaseNumber, originalExternalVersionOfFile, originalInternalVersionOfFile, res, versionsList);
    const CENMInternalVersions = await loadVersionFile("cENM", false);
    assert.deepEqual(CENMInternalVersions, updatedInternalVersionFile);
    const CENMExternalVersions = await loadVersionFile("cENM", true);
    assert.deepEqual(CENMExternalVersions, updatedExternalVersionFile);
    expect(console.log).toHaveBeenCalledWith('Version [24.03.112 (R1GT)] was updated successfully!');
  });

  test('Should return "An error has occurred or the version [11.11.11] is not found"', async () => {
    let res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    axios.get = vi.fn()
        .mockResolvedValue({data: 'Error'});
    const originalInternalVersionOfFile = [
      {
        "name": "24.03.102 (R1GL)",
        "schemaVersion": "1.53.0-76",
        "targetAudience": "pdu",
        "version": "24.03.102",
        "sprintVersion": "24.03",
        "releaseNumber": "24.1",
        "release": true,
        "normalisedVersion": "24.3.102"
      }
    ]
    const originalExternalVersionOfFile = [
      {
        "name": "R1GL",
        "schemaVersion": "11.11.11",
        "targetAudience": "cu",
        "version": "11.11.11",
        "sprintVersion": "24.03",
        "releaseNumber": "24.1",
        "release": true,
        "normalisedVersion": "11.11.11"
      },
    ]

    let version = '11.11.11'
    let product = 'cENM'
    let schemaVersion = '1.53.0-76'
    let sprintVersion = '24.03'
    let releaseNumber = '24.1'
    let versionsList = "['11.11.11', 'R1GL', '11.11.11', '11.11.11']"
    await addReleaseProductSet(version, product, schemaVersion, sprintVersion, releaseNumber, originalExternalVersionOfFile, originalInternalVersionOfFile, res, versionsList);
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(console.log).toHaveBeenCalledWith('An error has occurred or the version [11.11.11] is not found!');
  });
});

describe('Test addReleaseProductSet function for pENM', () => {
  const originalInternalVersionOfFile = [
    {
      "name": "23.16.127",
      "schemaVersion": "2.32.17",
      "targetAudience": "pdu",
      "version": "23.16.127",
      "sprintVersion": "23.16",
      "releaseNumber": "23.4",
      "release": false
    },
    {
      "name": "23.16.125",
      "schemaVersion": "2.32.12",
      "targetAudience": "pdu",
      "version": "23.16.125",
      "sprintVersion": "23.16",
      "releaseNumber": "23.4",
      "release": false
    },
    {
      "name": "23.16.124",
      "schemaVersion": "2.32.12",
      "targetAudience": "pdu",
      "version": "23.16.124",
      "sprintVersion": "23.16",
      "releaseNumber": "23.4",
      "release": false
    },
    {
      "name": "23.15.116 (R1GK)",
      "schemaVersion": "2.31.12",
      "targetAudience": "pdu",
      "version": "23.15.116",
      "sprintVersion": "23.15",
      "releaseNumber": "23.4",
      "release": true
    }
  ]
  const originalExternalVersionOfFile = [
    {
      "name": "R1GK",
      "schemaVersion": "2.31.12",
      "targetAudience": "cu",
      "version": "23.15.116",
      "sprintVersion": "23.15",
      "releaseNumber": "23.4",
      "release": true
    }
  ]
  beforeEach(() => {
    mock({ './res/data/pENM/externalVersions.json': JSON.stringify(originalExternalVersionOfFile), });
    mock({ './res/data/pENM/internalVersions.json': JSON.stringify(originalInternalVersionOfFile), });
    vi.spyOn(console, 'log').mockImplementation(() => {})
    fs.readFile = vi.fn((path, encoding, callback) => {
      if (typeof encoding === 'function') {
        callback = encoding;
        encoding = null;
      }
      process.nextTick(() =>
          callback(null, JSON.stringify(originalExternalVersionOfFile))
      );
    });

  });
  afterEach(() => {
    mock.restore();
    vi.restoreAllMocks();
  });

  test('Should update the pENM versions file with a given release', async () => {
    let res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    axios.get = vi.fn()
        .mockResolvedValue({data: 'AOM 901 151 R1GL'});

    const updatedInternalVersionFile = [
      {
        "name": "23.16.131 (R1GL)",
        "schemaVersion": "2.32.20",
        "targetAudience": "pdu",
        "version": "23.16.131",
        "sprintVersion": "23.16",
        "releaseNumber": "23.4",
        "release": true
      },
      {
        "name": "23.15.116 (R1GK)",
        "schemaVersion": "2.31.12",
        "targetAudience": "pdu",
        "version": "23.15.116",
        "sprintVersion": "23.15",
        "releaseNumber": "23.4",
        "release": true
      }
    ]

    const updatedExternalVersionFile = [
      {
        "name": "R1GL",
        "schemaVersion": "2.32.20",
        "targetAudience": "cu",
        "version": "23.16.131",
        "sprintVersion": "23.16",
        "releaseNumber": "23.4",
        "release": true
      },
      {
        "name": "R1GK",
        "schemaVersion": "2.31.12",
        "targetAudience": "cu",
        "version": "23.15.116",
        "sprintVersion": "23.15",
        "releaseNumber": "23.4",
        "release": true
      }
    ]
    let version = '23.16.131'
    let product = 'pENM'
    let schemaVersion = '2.32.20'
    let sprintVersion = '23.16'
    let releaseNumber = '23.4'
    let versionsList = "['R1GK']"
    await addReleaseProductSet(version, product, schemaVersion, sprintVersion, releaseNumber, originalExternalVersionOfFile, originalInternalVersionOfFile, res, versionsList);
    const PENMInternalVersions = await loadVersionFile("pENM", false);
    assert.deepEqual(PENMInternalVersions, updatedInternalVersionFile);
    const PENMExternalVersions = await loadVersionFile("pENM", true);
    assert.deepEqual(PENMExternalVersions, updatedExternalVersionFile);
  });

  test('Should update already existing pENM release', async () => {
    let res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    axios.get = vi.fn()
        .mockResolvedValue({data: 'AOM 901 151 R1GK'});

    let version = '23.15.116'
    let product = 'pENM'
    let schemaVersion = '2.31.12'
    let sprintVersion = '23.15'
    let releaseNumber = '23.4'
    let versionsList = "['R1GK']"
    await addReleaseProductSet(version, product, schemaVersion, sprintVersion, releaseNumber, originalExternalVersionOfFile, originalInternalVersionOfFile, res, versionsList);
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(console.log).toHaveBeenCalledWith('Version [23.15.116 (R1GK)] was updated successfully!');
  });

  test('Should add new cENM release', async () => {
    let res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    axios.get = vi.fn()
        .mockResolvedValue({data: 'R1GT'});

    const updatedExternalVersionFile =[
      {
        "name": "R1GL",
        "schemaVersion": "1.53.0-76",
        "targetAudience": "cu",
        "version": "24.03.102",
        "sprintVersion": "24.03",
        "releaseNumber": "24.1",
        "release": true,
        "normalisedVersion": "24.3.102"
      }
    ]
    const updatedInternalVersionFile =[
      {
        "name": "24.03.102 (R1GL)",
        "schemaVersion": "1.53.0-76",
        "targetAudience": "pdu",
        "version": "24.03.102",
        "sprintVersion": "24.03",
        "releaseNumber": "24.1",
        "release": true,
        "normalisedVersion": "24.3.102"
      },
    ]
    mock({ './res/data/cENM/externalVersions.json': JSON.stringify(updatedExternalVersionFile), });
    let version = '24.03.102'
    let product = 'cENM'
    let schemaVersion = '2.32.99'
    let sprintVersion = '24.03'
    let releaseNumber = '24.1'
    let versionsList = "R1GM"
    await addReleaseProductSet(version, product, schemaVersion, sprintVersion, releaseNumber, updatedExternalVersionFile, updatedInternalVersionFile, res, versionsList);
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(console.log).toHaveBeenCalledWith('Version [24.03.102 (R1GT)] was added successfully!');
  });
});

describe('Test updateVersionsFile function', () => {
  const originalVersionOfFile =
      [
        {
          "name": "23.17.98",
          "schemaVersion": "2.33.2",
          "targetAudience": "pdu",
          "version": "23.17.98",
          "sprintVersion": "23.17",
          "releaseNumber": "24.1",
          "release": false
        }
      ]
  beforeEach(() => {
    mock({ './res/data/pENM/externalVersions.json': JSON.stringify(originalVersionOfFile), });
    vi.spyOn(console, 'log').mockImplementation(() => {})
    fs.readFile = vi.fn((path, encoding, callback) => {
      if (typeof encoding === 'function') {
        callback = encoding;
        encoding = null;
      }
      process.nextTick(() =>
          callback(null, JSON.stringify(originalVersionOfFile))
      );
    });

  });
  afterEach(() => {
    mock.restore();
    vi.restoreAllMocks();
  });

  test('Should update the pENM versions file with a given release', async () => {
    let res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    const updatedVersionFile = [
      {
        "name": "R1GM",
        "schemaVersion": "2.33.5",
        "targetAudience": "cu",
        "version": "23.17.120",
        "sprintVersion": "23.17",
        "releaseNumber": "24.1",
        "release": true
      },
      {
        "name": "23.17.120 (R1GM)",
        "schemaVersion": "2.33.5",
        "targetAudience": "pdu",
        "version": "23.17.120",
        "sprintVersion": "23.17",
        "releaseNumber": "24.1",
        "release": true
      },
      {
        "name": "R1GL",
        "schemaVersion": "2.32.20",
        "targetAudience": "cu",
        "version": "23.16.131",
        "sprintVersion": "23.16",
        "releaseNumber": "23.4",
        "release": true
      },
      {
        "name": "23.16.131 (R1GL)",
        "schemaVersion": "2.32.20",
        "targetAudience": "pdu",
        "version": "23.16.131",
        "sprintVersion": "23.16",
        "releaseNumber": "23.4",
        "release": true
      },
    ]
    let version = '23.17.120'
    let product = 'pENM'
    let schemaVersion = '2.32.20'
    let sprintVersion = '23.16'
    let releaseNumber = '23.4'
    let results = {};
    results["enmVersion"] = version;
    results["schemaVersion"] = schemaVersion;
    await addInternalProductSet(version, product, schemaVersion, sprintVersion, releaseNumber, updatedVersionFile, results, res)
    const PENMVersions = await loadVersionFile("pENM", false);
    assert.deepEqual(PENMVersions, updatedVersionFile);
  });

  test('Should return ENM product set [23.17.115] already exists nothing to do!', async () => {
    let res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const updatedVersionFile =[
      {
        "name": "23.17.115",
        "schemaVersion": "2.33.4",
        "targetAudience": "pdu",
        "version": "23.17.115",
        "sprintVersion": "23.17",
        "releaseNumber": "24.1",
        "release": false
      },
      {
        "name": "23.17.98",
        "schemaVersion": "2.33.2",
        "targetAudience": "pdu",
        "version": "23.17.98",
        "sprintVersion": "23.17",
        "releaseNumber": "24.1",
        "release": false
      }
    ]

    let version = '23.17.115'
    let product = 'pENM'
    let schemaVersion = '2.33.4'
    let sprintVersion = '23.17'
    let releaseNumber = '24.1'
    let results = {};
    results["enmVersion"] = version;
    results["schemaVersion"] = schemaVersion;
    await addInternalProductSet(version, product, schemaVersion, sprintVersion, releaseNumber, updatedVersionFile, results, res)
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(console.log).toHaveBeenCalledWith('ENM product set [23.17.115] already exists nothing to do!');
  });

  test('Should return ENM product set [23.17.115] already exists nothing to do!', async () => {
    let res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const updatedVersionFile =[
      {
        "name": "23.17.115",
        "schemaVersion": "2.33.4",
        "targetAudience": "pdu",
        "version": "23.17.115",
        "sprintVersion": "23.17",
        "releaseNumber": "24.1",
        "release": false
      },
      {
        "name": "23.17.98",
        "schemaVersion": "2.33.2",
        "targetAudience": "pdu",
        "version": "23.17.98",
        "sprintVersion": "23.17",
        "releaseNumber": "24.1",
        "release": false
      }
    ]

    let version = '23.17.116'
    let product = 'pENM'
    let schemaVersion = '2.33.4'
    let sprintVersion = '23.17'
    let releaseNumber = '24.1'
    let results = {};
    results["enmVersion"] = version;
    results["schemaVersion"] = schemaVersion;
    await addInternalProductSet(version, product, schemaVersion, sprintVersion, releaseNumber, updatedVersionFile, results, res)
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(console.log).toHaveBeenCalledWith('Updated existing ENM schema version [2.33.4] with product set [23.17.116] successfully!');
  });

  test('Should add a new pENM product set', async () => {
    let res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const updatedVersionFile =[
      {
        "name": "23.17.98",
        "schemaVersion": "2.33.2",
        "targetAudience": "pdu",
        "version": "23.17.98",
        "sprintVersion": "23.17",
        "releaseNumber": "24.1",
        "release": false
      }
    ]
    let version = '23.17.116'
    let product = 'pENM'
    let schemaVersion = '2.33.4'
    let sprintVersion = '23.17'
    let releaseNumber = '24.1'
    let results = {};
    results["enmVersion"] = version;
    results["schemaVersion"] = schemaVersion;
    await addInternalProductSet(version, product, schemaVersion, sprintVersion, releaseNumber, updatedVersionFile, results, res)
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(console.log).toHaveBeenCalledWith('ENM product set [23.17.116] was added successfully!');
  });

  test('Should add a new cENM product set', async () => {
    const originalCENMVersionOfFile =[
      {
        "name": "23.17.99",
        "schemaVersion": "2.33.1",
        "targetAudience": "pdu",
        "version": "23.17.99",
        "sprintVersion": "23.17",
        "releaseNumber": "24.1",
        "release": false,
        "normalisedVersion": "23.17.99"
      }
    ]
    mock({ './res/data/cENM/internalVersions.json': JSON.stringify(originalCENMVersionOfFile), });
    let res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    let version = '23.17.98'
    let product = 'cENM'
    let schemaVersion = '2.33.2'
    let sprintVersion = '23.17'
    let releaseNumber = '24.1'
    let results = {};
    results["enmVersion"] = version;
    results["schemaVersion"] = schemaVersion;
    await addInternalProductSet(version, product, schemaVersion, sprintVersion, releaseNumber, originalCENMVersionOfFile, results, res)
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(console.log).toHaveBeenCalledWith('ENM product set [23.17.98] was added successfully!');
  });
});

describe('Test checkForDuplicates function', () => {
  test('Should return true when there is no duplication - SED file is valid', async () => {
    const result = checkForDuplicates(true,'10.42.14.164', 'svc_FM_vip_ipaddress', [], {'10.42.14.164': [ 'svc_FM_vip_ipaddress' ]}, [], []);
    expect(result).to.equal(true);
  });

  test('Should return false when there is duplication - SED file is invalid', async () => {
    const result = checkForDuplicates(true,'10.42.14.164', 'svc_FM_vip_ipaddress', [], {"10.42.14.164": [ "amos_vip_address", "general_scripting_vip_address"]}, [], []);
    expect(result).to.equal(false);
  });

});