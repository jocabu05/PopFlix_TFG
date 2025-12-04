const axios = require('axios');

async function testPlatformFiltering() {
  const baseURL = 'http://localhost:9999';
  const userId = 2;

  try {
    console.log('🧪 Testeando endpoint de filtering por plataformas\n');

    // Test 1: Obtener películas por plataformas
    console.log('📍 Test 1: Obtener películas filtradas por plataforma (User 2)...');
    const platformMoviesRes = await axios.get(`${baseURL}/api/movies/user/${userId}/by-platforms`, {
      params: { page: 1 }
    });
    
    console.log(`   ✅ Respuesta recibida:`);
    console.log(`   • Películas encontradas: ${platformMoviesRes.data.count}`);
    console.log(`   • Página: ${platformMoviesRes.data.page}/${platformMoviesRes.data.totalPages}`);
    console.log(`   • Mensaje: ${platformMoviesRes.data.message}`);
    
    if (platformMoviesRes.data.movies && platformMoviesRes.data.movies.length > 0) {
      console.log('\n   🎬 Primeras películas:');
      platformMoviesRes.data.movies.slice(0, 5).forEach(m => {
        console.log(`      • ${m.title} (ID: ${m.id}, Rating: ${m.rating})`);
      });
    } else {
      console.log('   ⚠️  No hay películas en las plataformas seleccionadas');
    }

    console.log('\n✨ ¡Test completado!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    if (error.response?.data?.error) {
      console.error('   Detalles:', error.response.data.error);
    }
  }
}

testPlatformFiltering();
