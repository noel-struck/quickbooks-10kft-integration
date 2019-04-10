const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    console.log('Get request');
})

router.post('/', (req, res) => {
    console.log('listening');
})

module.exports = router;