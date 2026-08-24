const express = require("express");
const catalogController = require("../controllers/catalogController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get(
  "/search",
  authenticate,
  authorize("ORGANIZER"),
  catalogController.search,
);

module.exports = router;
