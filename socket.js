let io;
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

module.exports = {
  init: (server) => {
    io = require('socket.io')(server, {
      cors: {
        origin: allowedOrigins,
        credentials: true,
      },
    });

    io.on('connection', (socket) => {
      socket.on('join_user', (username) => {
        if (username) {
          socket.join(String(username));
        }
      });

      socket.on('join_teams', (teamIds = []) => {
        (Array.isArray(teamIds) ? teamIds : []).forEach((teamId) => {
          if (teamId == null || teamId === '') return;
          socket.join(String(teamId));
        });
      });

      socket.on('disconnect', () => {});
    });

    return io;
  },

  getIO: () => {
    if (!io) throw new Error('Socket.io not initialized!');
    return io;
  },
};
