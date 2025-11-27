// api/stream/activity.ts
// Server-Sent Events (SSE) endpoint for streaming live activity.
// Works on Vercel when runtime = 'nodejs' (allows streaming).

export const config = {
  runtime: 'nodejs',
};

function sendEvent(res: any, data: object) {
  // SSE event format: data: <json>\n\n
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export default function handler(req: any, res: any) {
  // Required headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  // Optional: allow CORS if your client is on different origin
  // res.setHeader('Access-Control-Allow-Origin', '*');

  // Send an initial heartbeat / welcome event
  sendEvent(res, {
    id: `init-${Date.now()}`,
    time: new Date().toLocaleTimeString(),
    message: 'Connected to activity stream',
    level: 'info',
  });

  // simple counter for demo
  let i = 0;

  const interval = setInterval(() => {
    i++;

    // create a small set of events to rotate through
    const events = [
      {
        id: `receipt-${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        message: `Received 12 units in Receipt #${1000 + i}`,
        level: 'info',
      },
      {
        id: `lowstock-${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        message: `Low stock: SKU CAB-100 (now ${Math.max(0, 40 - i)})`,
        level: i % 5 === 0 ? 'warn' : 'info',
      },
      {
        id: `transfer-${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        message: `Transfer completed: TR-${200 + i}`,
        level: 'info',
      },
    ];

    // send next event
    const ev = events[i % events.length];
    try {
      sendEvent(res, ev);
    } catch (err) {
      // If writing fails, clear interval and end response
      clearInterval(interval);
      try { res.end(); } catch (e) {}
    }

    // Safety: stop after many events to avoid runtime limits (adjust as needed)
    if (i > 1000) {
      clearInterval(interval);
      try { res.end(); } catch (e) {}
    }
  }, 5000); // every 5s

  // When the client closes the connection, cleanup the interval
  req.on && req.on('close', () => {
    clearInterval(interval);
    try { res.end(); } catch (e) {}
  });
}
