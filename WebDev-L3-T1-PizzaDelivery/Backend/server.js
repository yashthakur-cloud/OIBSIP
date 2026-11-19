const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./src/db/db');
const startStockAlertJob = require('./src/jobs/stockAlertJob');

dotenv.config();

const app = require("./src/app");
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

connectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
  },
});
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

startStockAlertJob();

const port = process.env.PORT || 3000;
server.listen(port,()=> {
    console.log(`Server is running on port ${port}`);
});

