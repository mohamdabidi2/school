
const fs = require('fs');
const path = require('path');

class CreateManifestPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('CreateManifestPlugin', (compilation) => {
      const manifestDir = path.join(compilation.outputPath, 'server', 'app', '(dashboard)');
      const manifestPath = path.join(manifestDir, 'page_client-reference-manifest.js');
      
      if (!fs.existsSync(manifestPath)) {
        fs.mkdirSync(manifestDir, { recursive: true });
        fs.writeFileSync(manifestPath, '{}', 'utf8');
        console.log('Created missing client-reference-manifest.js file');
      }
    });
  }
}

module.exports = CreateManifestPlugin;
