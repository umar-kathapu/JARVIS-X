const http = require('http');

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/health',
  method: 'GET',
};

console.log('🩺 Monitoring Fastify Backend API health...');

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log(`✅ Backend API Healthy (Status: ${res.statusCode}): ${body}`);
      process.exit(0);
    } else {
      console.error(`❌ Backend API Unhealthy (Status: ${res.statusCode})`);
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Backend API Health Check Failed:', err.message);
  process.exit(1);
});

req.end();
