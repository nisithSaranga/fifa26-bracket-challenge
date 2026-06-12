/**
 * Socket.io setup — the real-time push channel.
 *
 * HTTP is request/response: clients must ASK for updates (polling).
 * WebSockets keep a connection open so the SERVER can push the moment
 * something happens — goal scored -> every viewer knows within a second.
 *
 * ROOMS pattern: clients join "match:<fdMatchId>" rooms for games they
 * watch. We broadcast a match update only into its room — viewers of
 * other matches receive nothing. At scale this is the difference
 * between sending thousands of irrelevant messages and exactly the
 * right ones.
 */
import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { env } from './env';

let io: Server | null = null;

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: { origin: env.clientOrigin, credentials: true },
  });

  io.on('connection', (socket) => {
    // Client says: "I'm watching match 537327"
    socket.on('match:join', (fdMatchId: number) => {
      socket.join(`match:${fdMatchId}`);
    });
    socket.on('match:leave', (fdMatchId: number) => {
      socket.leave(`match:${fdMatchId}`);
    });
  });

  console.log('[socket] Socket.io initialized');
  return io;
}

/** Used by the worker to broadcast. Safe no-op if called before init. */
export function getIO(): Server | null {
  return io;
}