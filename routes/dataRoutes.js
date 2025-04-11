const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

router.post('/items', dataController.addItem);
router.get('/items', dataController.getItems); 

module.exports = router;
