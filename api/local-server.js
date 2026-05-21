import http from 'http';
import checkoutHandler from './checkout.js';
import adminHandler from './admin.js';
import confirmPaymentHandler from './confirm-payment.js';
import cancelReservationHandler from './cancel-reservation.js';
import getReservationsHandler from './get-reservations.js';

const PORT = 3002;

const server = http.createServer((req, res) => {
  console.log(`[API Server] Received request: ${req.method} ${req.url}`);
  
  // CORS configuration
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, content-type, authorization, accept, accept-version');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse path
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  
  let targetHandler = null;
  if (parsedUrl.pathname === '/api/checkout') {
    targetHandler = checkoutHandler;
  } else if (parsedUrl.pathname === '/api/admin') {
    targetHandler = adminHandler;
  } else if (parsedUrl.pathname === '/api/confirm-payment') {
    targetHandler = confirmPaymentHandler;
  } else if (parsedUrl.pathname === '/api/cancel-reservation') {
    targetHandler = cancelReservationHandler;
  } else if (parsedUrl.pathname === '/api/get-reservations') {
    targetHandler = getReservationsHandler;
  }

  if (targetHandler && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        req.body = body ? JSON.parse(body) : {};
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON body' }));
        return;
      }

      // Add helpers mock to mimic Express/Next.js/Vercel serverless request & response
      if (!req.headers.origin) {
        req.headers.origin = req.headers.referer 
          ? new URL(req.headers.referer).origin 
          : 'http://localhost:5173';
      }

      res.status = (code) => {
        res.statusCode = code;
        return res;
      };

      res.json = (data) => {
        res.writeHead(res.statusCode || 200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      };

      try {
        await targetHandler(req, res);
      } catch (err) {
        console.error('Error running API handler:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

server.listen(PORT, () => {
  console.log(`\x1b[36m✦ Casa d'Oro Local API server running at http://localhost:${PORT} ✦\x1b[0m`);
});

