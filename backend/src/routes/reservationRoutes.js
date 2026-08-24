const express = require("express");
const reservationController = require("../controllers/reservationController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/shared/:ticketId", reservationController.getShared);

router.use(authenticate, authorize("CUSTOMER"));

router.post("/", reservationController.create);
router.post("/:id/pay", reservationController.pay);
router.get("/mine", reservationController.listMine);

module.exports = router;
