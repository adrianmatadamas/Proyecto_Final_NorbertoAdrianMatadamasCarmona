const express = require('express');
const mongoose = require('mongoose');
const { create } = require('express-handlebars');
const http = require('http');
const socketIo = require('socket.io');
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 8080;

// Conexión a MongoDB
mongoose.connect('mongodb://localhost/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conectado a MongoDB');
}).catch(err => {
  console.error('Error de conexión a MongoDB', err);
});

// Configuración de Handlebars
app.engine('handlebars', create({ defaultLayout: 'main' }).engine);
app.set('view engine', 'handlebars');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.get('/products', (req, res) => {
  res.render('index');
});

app.get('/realtimeproducts', (req, res) => {
  res.render('realTimeProducts');
});

// Socket.io
io.on('connection', (socket) => {
  console.log('Usuario conectado');
  
  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
  });

  socket.on('new-product', (data) => {
    io.emit('new-product', data);
  });

  socket.on('delete-product', (data) => {
    io.emit('delete-product', data);
  });
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

module.exports = { app, io };
