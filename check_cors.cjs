const https = require('https');

const options = {
  hostname: 'api.fichajes.believ3.top',
  port: 443,
  path: '/api/collections/locations/records',
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://ais-dev-k75t5fqox3naqtad7g44hj-294802884813.europe-west2.run.app',
    'Access-Control-Request-Method': 'GET'
  }
};

const req = https.request(options, (res) => {
  console.log('STATUS:', res.statusCode);
  console.log('HEADERS:', res.headers);
});

req.on('error', (e) => {
  console.error('Problem with request:', e.message);
});

req.end();
