const http = require('http');

console.log('🧪 Testeando endpoint...');

const options = {
  hostname: 'localhost',
  port: 9999,
  path: '/api/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('✅ Health check:', data);
  });
});

req.on('error', (e) => {
  console.error(`❌ Error:`, e.message);
});

req.end();

// Test del endpoint de películas por plataforma
setTimeout(() => {
  const options2 = {
    hostname: 'localhost',
    port: 9999,
    path: '/api/movies/user/2/by-platforms?page=1',
    method: 'GET'
  };

  const req2 = http.request(options2, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      const json = JSON.parse(data);
      console.log('\n✅ Platform movies endpoint:');
      console.log('   Películas encontradas:', json.count);
      if (json.movies && json.movies.length > 0) {
        console.log('   Primeras 3:');
        json.movies.slice(0, 3).forEach(m => {
          console.log(`     • ${m.title}`);
        });
      }
    });
  });

  req2.on('error', (e) => {
    console.error(`❌ Error en platform movies:`, e.message);
  });

  req2.end();
}, 1000);
