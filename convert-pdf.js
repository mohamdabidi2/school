const fs = require('fs');
const path = require('path');

// Simple conversion using md-to-pdf (no PhantomJS / markdown-pdf dependency)
async function convertToPdf() {
  const markdownFile = path.join(__dirname, 'GUIDE_UTILISATION.md');
  const outputFile = path.join(__dirname, 'GUIDE_UTILISATION.pdf');

  console.log('🔄 Conversion du Markdown en PDF avec md-to-pdf...\n');

  try {
    const { mdToPdf } = require('md-to-pdf');

    console.log('✅ Utilisation de md-to-pdf...');

    const pdf = await mdToPdf(
      { path: markdownFile },
      {
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
      }
    );

    if (pdf) {
      fs.writeFileSync(outputFile, pdf.content);
      console.log('✅ Conversion réussie !');
      console.log(`📑 PDF créé: ${outputFile}`);
      console.log(`📊 Taille du fichier: ${(pdf.content.length / 1024 / 1024).toFixed(2)} MB`);
    } else {
      console.log('❌ Erreur: Aucun PDF généré');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la conversion:', error.message);
    console.log('\n📝 Instructions alternatives:');
    console.log('1. Installez Pandoc: https://pandoc.org/installing.html');
    console.log('2. Puis exécutez: pandoc GUIDE_UTILISATION.md -o GUIDE_UTILISATION.pdf --pdf-engine=xelatex -V geometry:margin=2cm --toc');
    console.log('\nOu utilisez un service en ligne comme:');
    console.log('- https://www.markdowntopdf.com/');
    console.log('- https://dillinger.io/');
  }
}

convertToPdf();

