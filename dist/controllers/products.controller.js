"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.update = exports.getPopularProducts = exports.getById = exports.getAll = exports.add = void 0;
const db = require("../../database/db.js");
function add(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { description, price } = req.body;
        const response = yield db.query("INSERT INTO product(description, price) VALUES ($1, $2)", [description, price], (err, res) => {
            if (err)
                return next(err);
            res.send(res);
        });
        return res.json(response.rows);
    });
}
exports.add = add;
function getAll(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const rows = yield db.query("SELECT product_id, description, TRIM(to_char(price, 'FM$999G999D00')) AS price FROM product");
        //const rows = await db.query("SELECT * FROM product");
        return res.json(rows);
    });
}
exports.getAll = getAll;
function getById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const product_id = req.params.id;
        const query = yield db.query("SELECT * FROM product WHERE product_id = $1", [
            product_id,
        ]);
        let result = query.rows;
        return res.json(result);
    });
}
exports.getById = getById;
function getPopularProducts(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const product_id = req.params.id;
        const query = yield db.query(`
  
  SELECT
    p.product_id,
    p.description,
    p.price,
    COUNT(op.order_id) AS quantity,
    p.price * COUNT(op.order_id) AS profits,
    TRIM(to_char( p.price * COUNT(op.order_id), 'FM$999G999D00')) AS profits_currency
FROM
    product p
JOIN
    order_product op ON p.product_id = op.product_id
JOIN
    event_order eo ON eo.order_id = op.order_id
GROUP BY
    p.product_id,
    p.description,
    p.price
ORDER BY
    COUNT(op.order_id) DESC
LIMIT 3;
  
    `);
        let result = query.rows;
        return res.json(result);
    });
}
exports.getPopularProducts = getPopularProducts;
function update(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { description, price } = req.body;
        const product_id = req.params.id;
        yield db.query("UPDATE product SET description = $1, price = $2 WHERE product_id = $3", [description, price, product_id], (err, results) => {
            if (err)
                throw err;
        });
        return res.status(200).send(`Modified product with ID: ${product_id}`);
    });
}
exports.update = update;
function deleteProduct(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const product_id = req.params.id;
        yield db.query("DELETE FROM product WHERE product_id = $1", [product_id], (err, results) => {
            if (err)
                throw err;
        });
        return res.status(200).send(`Deleted product with ID: ${product_id}`);
    });
}
exports.deleteProduct = deleteProduct;
