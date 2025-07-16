const http = require('http');

console.log('🧪 Test des services EcoDeli...\n');

// Test API
const testAPI = () => {
  return new Promise((resolve) => {
    const req = http.request('http://localhost:3000', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ API (port 3000) : Accessible');
          resolve(true);
        } else {
          console.log('❌ API (port 3000) : Erreur HTTP', res.statusCode);
          resolve(false);
        }
      });
    });
    
    req.on('error', () => {
      console.log('❌ API (port 3000) : Non accessible');
      resolve(false);
    });
    
    req.setTimeout(3000, () => {
      console.log('❌ API (port 3000) : Timeout');
      resolve(false);
    });
    
    req.end();
  });
};

// Test Frontend
const testFrontend = () => {
  return new Promise((resolve) => {
    const req = http.request('http://localhost:5173', (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Frontend (port 5173) : Accessible');
        resolve(true);
      } else {
        console.log('❌ Frontend (port 5173) : Erreur HTTP', res.statusCode);
        resolve(false);
      }
    });
    
    req.on('error', () => {
      console.log('❌ Frontend (port 5173) : Non accessible');
      resolve(false);
    });
    
    req.setTimeout(3000, () => {
      console.log('❌ Frontend (port 5173) : Timeout');
      resolve(false);
    });
    
    req.end();
  });
};

// Exécuter les tests
async function runTests() {
  const apiOk = await testAPI();
  const frontendOk = await testFrontend();
  
  console.log('\n📊 Résultats :');
  
  if (apiOk && frontendOk) {
    console.log('🎉 Tous les services sont opérationnels !');
    console.log('\n🔗 Accès :');
    console.log('   Frontend : http://localhost:5173');
    console.log('   API      : http://localhost:3000');
  } else {
    console.log('⚠️  Certains services ne sont pas accessibles.');
    console.log('\n💡 Pour démarrer les services :');
    console.log('   npm run dev');
  }
}

runTests();