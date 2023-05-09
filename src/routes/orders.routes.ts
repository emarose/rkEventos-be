var express = require("express");
var router = express.Router();
const ordersController = require("../controllers/orders.controller");

router.get("/", ordersController.getAll);
router.get("/getById/:id", ordersController.getById);
router.get("/getByEventId/:event_id", ordersController.getByEventId);
router.put("/update/:id", ordersController.update);
router.post("/add", ordersController.add);
router.delete("/:order_id", ordersController.deleteOrder);

module.exports = router;
