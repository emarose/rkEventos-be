var express = require("express");
var router = express.Router();
const productsController = require("../controllers/products.controller");

router.get("/", productsController.getAll);
router.get("/getById/:id", productsController.getById);
router.put("/:id", productsController.update);
router.post("/add", productsController.add);
router.delete("/:id", productsController.deleteProduct);

module.exports = router;
