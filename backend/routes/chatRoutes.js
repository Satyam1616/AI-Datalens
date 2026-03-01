const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

router.post('/query', chatController.handleQuery);
router.get('/schema', chatController.getSchema);
router.post('/schema', chatController.updateSchema);
router.get('/db-status', chatController.getDbStatus);

module.exports = router;
