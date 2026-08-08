const fs = require('fs');

const html = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/icon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#C65D2C" />
    <meta name="description" content="HWENDO 2026 - Mission de sauvegarde du patrimoine musical du royaume Hwendo" />
    <title>HWENDO 2026 - Mission Patrimoniale</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;

fs.writeFileSync('index.html', html, 'utf8');
console.log('DONE: index.html rewritten with UTF-8 charset');