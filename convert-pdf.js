const fs = require('fs');
const path = require('path');

// Simple conversion using markdown-pdf if available, otherwise provide instructions
async function convertToPdf() {
  const markdownFile = path.join(__dirname, 'GUIDE_UTILISATION.md');
  const outputFile = path.join(__dirname, 'GUIDE_UTILISATION.pdf');

  console.log('🔄 Tentative de conversion Markdown vers PDF...\n');

  // Try using markdown-pdf
  try {
    const markdownPdf = require('markdown-pdf');
    
    console.log('✅ Utilisation de markdown-pdf...');
    
    markdownPdf({
      paperFormat: 'A4',
      paperOrientation: 'portrait',
      paperBorder: '2cm',
      renderDelay: 1000
    })
    .from(markdownFile)
    .to(outputFile, function () {
      console.log('✅ Conversion réussie !');
      console.log(`📑 PDF créé: ${outputFile}`);
      const stats = fs.statSync(outputFile);
      console.log(`📊 Taille du fichier: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    });
  } catch (error) {
    console.log('❌ markdown-pdf non disponible. Tentative avec une autre méthode...\n');
    
    // Try using md-to-pdf with proper require
    try {
      const { mdToPdf } = require('md-to-pdf');
      
      console.log('✅ Utilisation de md-to-pdf...');
      
      mdToPdf({ path: markdownFile }, {
        dest: outputFile,
        pdf_options: {
          format: 'A4',
          margin: {
            top: '2cm',
            right: '2cm',
            bottom: '2cm',
            left: '2cm',
          },
        },
      }).then(pdf => {
        if (pdf) {
          fs.writeFileSync(outputFile, pdf.content);
          console.log('✅ Conversion réussie !');
          console.log(`📑 PDF créé: ${outputFile}`);
          console.log(`📊 Taille du fichier: ${(pdf.content.length / 1024 / 1024).toFixed(2)} MB`);
        }
      });
    } catch (error2) {
      console.error('❌ Erreur:', error2.message);
      console.log('\n📝 Instructions alternatives:');
      console.log('1. Installez Pandoc: https://pandoc.org/installing.html');
      console.log('2. Puis exécutez: pandoc GUIDE_UTILISATION.md -o GUIDE_UTILISATION.pdf --pdf-engine=xelatex -V geometry:margin=2cm --toc');
      console.log('\nOu utilisez un service en ligne comme:');
      console.log('- https://www.markdowntopdf.com/');
      console.log('- https://dillinger.io/');
    }
  }
}

convertToPdf();

