const axios = require('axios');

async function testEndpoint() {
  try {
    console.log('🧪 Testeando endpoint /api/movies/user/2/by-platforms\n');
    
    const response = await axios.get('http://localhost:9999/api/movies/user/2/by-platforms', {
      params: { page: 1 }
    });
    
    console.log('✅ Response status:', response.status);
    console.log('\n📊 Response data:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.status);
      console.error('Response:', error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testEndpoint();
