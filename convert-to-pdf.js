const { mdToPdf } = require('md-to-pdf');
const fs = require('fs');
const path = require('path');

async function convertMarkdownToPdf() {
  const markdownFile = path.join(__dirname, 'GUIDE_UTILISATION.md');
  const outputFile = path.join(__dirname, 'GUIDE_UTILISATION.pdf');

  console.log('🔄 Conversion du Markdown en PDF...');
  console.log(`📄 Fichier source: ${markdownFile}`);
  console.log(`📑 Fichier de sortie: ${outputFile}`);

  try {
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
          printBackground: true,
        },
        stylesheet: `
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          h1 {
            color: #2563eb;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
            margin-top: 30px;
          }
          h2 {
            color: #1e40af;
            margin-top: 25px;
            border-left: 4px solid #2563eb;
            padding-left: 10px;
          }
          h3 {
            color: #1e3a8a;
            margin-top: 20px;
          }
          code {
            background-color: #f3f4f6;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
          }
          pre {
            background-color: #f3f4f6;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #2563eb;
            color: white;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          blockquote {
            border-left: 4px solid #2563eb;
            padding-left: 20px;
            margin: 20px 0;
            font-style: italic;
            color: #555;
          }
          img {
            max-width: 100%;
            height: auto;
            margin: 20px 0;
            border: 1px solid #ddd;
            border-radius: 5px;
          }
          .page-break {
            page-break-after: always;
          }
        `,
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
    console.error('❌ Erreur lors de la conversion:', error);
    process.exit(1);
  }
}

convertMarkdownToPdf();

