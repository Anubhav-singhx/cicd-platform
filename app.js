const express = require('express');
const app = express();
const port = 3000;

// This is the main page
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>My CI/CD Platform</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          h1 { font-size: 3em; }
          p { font-size: 1.5em; }
        </style>
      </head>
      <body>
        <h1>🚀 Production-Grade CI/CD Platform</h1>
        <p>Version 2.0 - Auto-Deployed with ArgoCD!</p>
        <p>Hey there - from anubhav</p>
        <p>Hostname: ${require('os').hostname()}</p>
      </body>
    </html>
  `);
});


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', version: '1.0' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`App running on port ${port}`);
});