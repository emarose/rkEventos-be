var express = require("express");
var router = express.Router();
const payMethodsController = require("../controllers/payMethods.controller");

router.get("/", payMethodsController.getAll);
router.get("/getById/:id", payMethodsController.getById);
router.put("/update/:id", payMethodsController.update);
router.post("/add", payMethodsController.add);
router.delete("/delete/:id", payMethodsController.deletePayMethod);

module.exports = router;
