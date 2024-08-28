import http from 'k6/http';
import { FormData } from 'https://jslib.k6.io/formdata/0.0.2/index.js';

const valid_sed_file = open('./res/large__production_IPv4__1aut-23.12.112-no-exclusion-ips Updated_TRUE.txt')
const invalid_sed_file = open('./res/large__production_IPv4__1aut-23.12.112-no-exclusion-ips Updated.txt')

export default function () {
  //const url = 'http://localhost:3000';
  const url = 'https://siteengineeringdata.internal.ericsson.com';
  const fd = new FormData();
  fd.append('product', 'pENM');
  fd.append('useCase', 'upgrade');
  fd.append('enmDeploymentType', 'large__production_IPv4__1aut_dd.xml');
  fd.append('enmVersion', '23.15.57');
  fd.append('ipVersion', 'ipv4');
  fd.append('SEDFile', http.file(valid_sed_file, 'sed.txt', 'text/plain'));

  const params = {
    headers: {
      'Content-Type': 'multipart/form-data; boundary=' + fd.boundary
      //'Content-Length': fd.body.length,
    },
  };

  const res = http.post(url + '/api/validate', fd.body(), params);
  //console.log(res.body);
}
