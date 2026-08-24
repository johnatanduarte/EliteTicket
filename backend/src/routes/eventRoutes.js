const express = require("express");
const eventController = require("../controllers/eventController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", eventController.listAll);
router.get(
  "/mine",
  authenticate,
  authorize("ORGANIZER"),
  eventController.listMine,
);
router.get("/:id", eventController.getById);

router.post("/", authenticate, authorize("ORGANIZER"), eventController.create);
router.put(
  "/:id",
  authenticate,
  authorize("ORGANIZER"),
  eventController.update,
);
router.delete(
  "/:id",
  authenticate,
  authorize("ORGANIZER"),
  eventController.remove,
);

module.exports = router;
