const express = require('express');
const promClient = require('prom-client');
const app = express();
const port = 3000;

// Create a Registry to register metrics
const register = new promClient.Registry();

// Add default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new promClient.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

// Register custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeConnections);

// Middleware to track request metrics
app.use((req, res, next) => {
  const start = Date.now();
  
  // Track active connections
  activeConnections.inc();
  
  // When response finishes
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    
    // Record metrics
    httpRequestDuration.labels(req.method, req.path, res.statusCode).observe(duration);
    httpRequestTotal.labels(req.method, req.path, res.statusCode).inc();
    activeConnections.dec();
  });
  
  next();
});

// Main page
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
          .metrics-link {
            margin-top: 30px;
            padding: 15px 30px;
            background: rgba(255,255,255,0.2);
            border-radius: 10px;
            display: inline-block;
          }
          a {
            color: white;
            text-decoration: none;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <h1>🚀 Production-Grade CI/CD Platform</h1>
        <p>Version 3.0 - Deployed with Helm + GitOps! 📦</p>
        <p>Hostname: ${require('os').hostname()}</p>
        <p>Monitored by Prometheus + Grafana 📊</p>
        <div class="metrics-link">
          <a href="/metrics">View Prometheus Metrics</a>
        </div>
      </body>
    </html>
  `);
});

// Health check endpoint (used by Kubernetes and ArgoCD)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    version: '3.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Metrics endpoint (Prometheus scrapes this)
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`App running on port ${port}`);
  console.log(`Metrics available at http://localhost:${port}/metrics`);
});