const os = require('os');
const { execSync } = require('child_process');

const arch = os.arch();
console.log(`🖥 Aktuelle Architektur: ${arch}`);

if (arch !== 'arm64') {
  console.warn('⚠️ Du bist auf einem x86_64 Mac oder unter Rosetta. Stelle sicher, dass du unter Rosetta 2 arbeitest, falls du M1/M2 hast.');
} else {
  console.log('✅ Native ARM64 erkannt – alles korrekt.');
}

// Check sqlite3 binary (optional, falls sqlite3 verwendet wird)
try {
  const output = execSync('file node_modules/sqlite3/build/Release/node_sqlite3.node').toString();
  console.log(`ℹ️ Sqlite3 Build Info: ${output}`);
  if (!output.includes('arm64')) {
    console.error('🚨 WARNUNG: Sqlite3 wurde NICHT für ARM64 gebaut. Bitte führe erneut aus:');
    console.error('    rm -rf node_modules package-lock.json && npm install');
    process.exit(1);
  } else {
    console.log('✅ Sqlite3 korrekt für ARM64 installiert.');
  }
} catch (error) {
  console.warn('⚠️ Konnte Sqlite3 Binary nicht prüfen. Vermutlich fehlt sie noch.');
}