const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const socket = require('./socket');
const { getPool } = require('./config/db');
require('dotenv').config();

// ========== MIDDLEWARE ==========
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://tf-task-management-system.netlify.app',
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// ========== VIEW ENGINE ==========
app.set('view engine', 'ejs');

// ========== ROUTES ==========
const Tasks = require('./routes/tasks');
const Task = require('./routes/task');
const Login = require('./routes/login');
const Register = require('./routes/Register');
const Dashboard = require('./routes/Dashboard');
const Collaborate = require('./routes/Collaborate');
const Edit = require('./routes/Edit');
const AddTasks = require('./routes/AddTasks');
const AuthRoutes = require('./routes/auth');
const Teams = require('./routes/teams');
const AiEnhance = require('./routes/aiEnhance');

// ========== ROUTE MOUNTS ==========
app.use('/tasks', Tasks);
app.use('/task', Task);
app.use('/login', Login);
app.use('/register', Register);
app.use('/dashboard', Dashboard);
app.use('/collaborate', Collaborate);
app.use('/edit', Edit);
app.use('/addtasks', AddTasks);
app.use('/auth', AuthRoutes);
app.use('/teams', Teams);
app.use('/ai', AiEnhance);

// ========== HOME PAGE ==========
app.get('/', (req, res) => {
  res.render('index');
});

// ========== SERVER & SOCKET ==========
const server = http.createServer(app);
socket.init(server);

const PORT = process.env.PORT || 3000;

getPool()
  .then(() => {
    console.log('✅ MySQL connected and schema ready');
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  });
