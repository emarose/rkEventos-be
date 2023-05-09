var express = require("express");
var router = express.Router();
const eventsController = require("../controllers/events.controller");

router.get("/", eventsController.getAll);
router.get("/getLastEvents", eventsController.getLastEvents);
router.get("/getLabels", eventsController.getLabels);
router.get("/getById/:id", eventsController.getById);
router.put("/:id", eventsController.update);
router.post("/add", eventsController.add);
router.delete("/:id", eventsController.deleteEvent);

module.exports = router;
