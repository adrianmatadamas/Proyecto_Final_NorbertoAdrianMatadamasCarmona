const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { io } = require('../app');

// Obtener todos los productos
router.get('/', async (req, res) => {
  const { limit = 10, page = 1, query, sort } = req.query;
  const options = {
    limit: parseInt(limit),
    page: parseInt(page),
    sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {}
  };
  
  const filter = query ? { category: query } : {};
  
  try {
    const products = await Product.paginate(filter, options);
    res.json({
      status: 'success',
      payload: products.docs,
      totalPages: products.totalPages,
      prevPage: products.prevPage,
      nextPage: products.nextPage,
      page: products.page,
      hasPrevPage: products.hasPrevPage,
      hasNextPage: products.hasNextPage,
      prevLink: products.hasPrevPage ? `/api/products?limit=${limit}&page=${products.prevPage}` : null,
      nextLink: products.hasNextPage ? `/api/products?limit=${limit}&page=${products.nextPage}` : null
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Obtener producto por id
router.get('/:pid', async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid);
    if (!product) return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Crear un nuevo producto
router.post('/', async (req, res) => {
  const { title, description, code, price, stock, category, thumbnails } = req.body;
  
  try {
    const newProduct = new Product({ title, description, code, price, stock, category, thumbnails });
    await newProduct.save();
    res.status(201).json(newProduct);
    io.emit('new-product', newProduct);
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

// Actualizar un producto
router.put('/:pid', async (req, res) => {
  const { title, description, code, price, stock, category, thumbnails } = req.body;
  
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.pid, { title, description, code, price, stock, category, thumbnails }, { new: true });
    if (!updatedProduct) return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

// Eliminar un producto
router.delete('/:pid', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.pid);
    if (!deletedProduct) return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    res.json(deletedProduct);
    io.emit('delete-product', deletedProduct);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
