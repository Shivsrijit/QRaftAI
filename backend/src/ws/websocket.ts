import { Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { config } from '../config/env';

// Track connected clients subscribed to specific assignment IDs
const subscriptions = new Map<string, Set<WebSocket>>();

let wss: WebSocketServer | null = null;

export function initializeWebSocketServer(server: Server) {
  wss = new WebSocketServer({ server });

  console.log('WebSocket server initialized and listening on the shared HTTP server.');

  wss.on('connection', (ws) => {
    console.log('New client connected to WebSocket.');

    ws.on('message', (message: string) => {
      try {
        const parsed = JSON.parse(message);
        
        if (parsed.type === 'subscribe' && parsed.assignmentId) {
          const assignmentId = parsed.assignmentId;
          
          if (!subscriptions.has(assignmentId)) {
            subscriptions.set(assignmentId, new Set());
          }
          
          subscriptions.get(assignmentId)!.add(ws);
          console.log(`Client subscribed to assignment updates [ID: ${assignmentId}]. Total subscribers: ${subscriptions.get(assignmentId)!.size}`);
          
          ws.send(JSON.stringify({ 
            type: 'subscribed', 
            assignmentId,
            message: `Successfully subscribed to updates for assignment ${assignmentId}`
          }));
        }
      } catch (err) {
        console.error('Failed to process WebSocket message:', err);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message structure' }));
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket.');
      // Remove connection from all subscriptions
      for (const [assignmentId, clients] of subscriptions.entries()) {
        if (clients.delete(ws)) {
          if (clients.size === 0) {
            subscriptions.delete(assignmentId);
          }
        }
      }
    });
  });
}

// Notify all client subscribers about real-time assignment generation status
export function notifyProgress(
  assignmentId: string, 
  progress: number, 
  status: 'pending' | 'processing' | 'completed' | 'failed',
  result?: any,
  errorMsg?: string,
  pdfUrl?: string
) {
  const clients = subscriptions.get(assignmentId);
  if (!clients || clients.size === 0) {
    return;
  }

  const payload = JSON.stringify({
    type: 'progress',
    assignmentId,
    progress,
    status,
    result,
    errorMsg,
    pdfUrl
  });

  console.log(`Pushing WebSocket update for assignment [ID: ${assignmentId}]: ${progress}% [${status}]`);
  
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}
