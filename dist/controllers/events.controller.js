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
exports.deleteEvent = exports.update = exports.getById = exports.getLastEvents = exports.getLabels = exports.getAll = exports.add = void 0;
const db = require("../../database/db.js");
function add(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { description, address, cost, event_date } = req.body;
        const response = yield db.query("INSERT INTO event(description, address, cost, event_date) VALUES ($1, $2, $3, $4)", [description, address, cost, event_date], (err, res) => {
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
        const rows = yield db.query("SELECT event_id, description, address, TRIM(to_char(cost, 'FM$999G999D00')) AS cost, event_date FROM event");
        return res.json(rows);
    });
}
exports.getAll = getAll;
function getLabels(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const rows = yield db.query("SELECT event_id, event_date, description FROM event");
        return res.json(rows);
    });
}
exports.getLabels = getLabels;
function getLastEvents(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const rows = yield db.query(`
    WITH discounted_totals AS (
      SELECT
          e.event_id,
          SUM(CASE
              WHEN o.discount <> 0 THEN (p.price * op.quantity - o.discount)
              ELSE p.price * op.quantity
          END) AS sum_discounted_order_total
      FROM orders o
      JOIN event e ON o.event_id = e.event_id
      JOIN order_product op ON o.order_id = op.order_id
      JOIN product p ON op.product_id = p.product_id
      GROUP BY e.event_id
    )
    SELECT
        main_query.*,
        TRIM(to_char(dt.sum_discounted_order_total, 'FM$999G999D00')) AS grand_total,
        GREATEST(0, dt.sum_discounted_order_total - main_query.cost) AS balance,
        TRIM(to_char(GREATEST(0, dt.sum_discounted_order_total - main_query.cost), 'FM$999G999D00')) AS balance_currency
    FROM (
        SELECT 
            event.event_id,
            event.description,
            event.cost,
            event.event_date,
            event.address,
            json_build_object('order_id', orders.order_id, 'order_total', TRIM(to_char(order_totals.order_total, 'FM$999G999D00'))) AS best_order
        FROM 
            event
            JOIN event_order ON event.event_id = event_order.event_id
            JOIN orders ON event_order.order_id = orders.order_id
            JOIN (
                SELECT 
                    order_id,
                    SUM(quantity * price) AS order_total
                FROM 
                    order_product
                    JOIN product ON order_product.product_id = product.product_id
                GROUP BY 
                    order_id
            ) AS order_totals ON orders.order_id = order_totals.order_id
            JOIN order_product ON orders.order_id = order_product.order_id
            JOIN (
                SELECT 
                    event.event_id,
                    MAX(order_totals.order_total) AS best_order
                FROM 
                    event
                    JOIN event_order ON event.event_id = event_order.event_id
                    JOIN orders ON event_order.order_id = orders.order_id
                    JOIN (
                        SELECT 
                            order_id,
                            SUM(quantity * price) AS order_total
                        FROM 
                            order_product
                            JOIN product ON order_product.product_id = product.product_id
                        GROUP BY 
                            order_id
                    ) AS order_totals ON orders.order_id = order_totals.order_id
                    JOIN order_product ON orders.order_id = order_product.order_id
                GROUP BY 
                    event.event_id
            ) AS best_orders ON event.event_id = best_orders.event_id AND order_totals.order_total = best_orders.best_order
        GROUP BY 
            event.event_id,
            event.description, 
            event.cost,
            event.event_date,
            event.address,
            orders.order_id,
            order_totals.order_total
        ORDER BY 
            event.event_date DESC
        LIMIT 
            10
    ) AS main_query
    LEFT JOIN discounted_totals dt ON main_query.event_id = dt.event_id;
`);
        return res.json(rows);
    });
}
exports.getLastEvents = getLastEvents;
function getById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const event_id = req.params.id;
        const query = yield db.query(`
    WITH discounted_totals AS (
      SELECT
          e.event_id,
          SUM(CASE
              WHEN o.discount <> 0 THEN (p.price * op.quantity - o.discount)
              ELSE p.price * op.quantity
          END) AS sum_discounted_order_total
      FROM orders o
      JOIN event e ON o.event_id = e.event_id
      JOIN order_product op ON o.order_id = op.order_id
      JOIN product p ON op.product_id = p.product_id
      GROUP BY e.event_id
  )
  SELECT
      main_query.*,
      TRIM(to_char(dt.sum_discounted_order_total, 'FM$999G999D00')) AS grand_total
  FROM
  (
      SELECT
          o.order_id,
          o.payment_method,
          CASE
              WHEN o.discount <> 0 THEN TRIM(to_char((SUM(p.price * op.quantity) - o.discount), 'FM$999G999D00'))
              ELSE TRIM(to_char(SUM(p.price * op.quantity), 'FM$999G999D00'))
          END AS discounted_order_total,
          CASE
              WHEN o.discount <> 0 THEN TRIM(to_char(o.discount, 'FM$999G999D00'))
              ELSE NULL
          END AS discount,
          json_agg(json_build_object('description', p.description, 'price', TRIM(to_char(p.price, 'FM$999G999D00')), 'quantity', op.quantity)) AS products,
          TRIM(to_char(SUM(p.price * op.quantity), 'FM$999G999D00')) AS order_total,
          json_build_object('order_id', best_order.order_id, 'order_total', TRIM(to_char(best_order.order_total, 'FM$999G999D00'))) AS best_order,
          e.description AS event_description,
          e.event_date,
          TRIM(to_char(e.cost, 'FM$999G999D00')) AS cost,
          e.address,
          e.event_id,
          (SELECT COUNT(*) FROM orders o2 WHERE o2.event_id = e.event_id) AS order_count,
          TRIM(to_char(
              (SELECT SUM(p2.price * op2.quantity - o.discount) FROM orders o2 JOIN order_product op2 ON o2.order_id = op2.order_id JOIN product p2 ON op2.product_id = p2.product_id WHERE o2.event_id = e.event_id) - e.cost,
              'FM$999G999D00'
          )) AS balance,
          (SELECT json_object_agg(p.payment_method, TRIM(to_char(p.total, 'FM$999G999D00'))) FROM (
              SELECT e.event_id, o.payment_method, SUM(p.price * op.quantity - o.discount) AS total
              FROM orders o
              JOIN event e ON o.event_id = e.event_id
              JOIN order_product op ON o.order_id = op.order_id
              JOIN product p ON op.product_id = p.product_id
              GROUP BY e.event_id, o.payment_method
          ) p
          WHERE p.event_id = e.event_id) AS payment_methods
      FROM orders o
      JOIN event e ON o.event_id = e.event_id
      JOIN order_product op ON o.order_id = op.order_id
      JOIN product p ON op.product_id = p.product_id
      JOIN (
          SELECT
              o.event_id,
              o.order_id,
              SUM(p.price *op.quantity) AS order_total,
              RANK() OVER (PARTITION BY o.event_id ORDER BY SUM(p.price * op.quantity) DESC) AS rank
          FROM orders o
          JOIN order_product op ON o.order_id = op.order_id
          JOIN product p ON op.product_id = p.product_id
          GROUP BY o.event_id, o.order_id
      ) best_order ON e.event_id = best_order.event_id AND best_order.rank = 1
      JOIN (
          SELECT
              o.event_id,
              SUM(p.price * op.quantity) AS order_total
          FROM orders o
          JOIN order_product op ON o.order_id = op.order_id
          JOIN product p ON op.product_id = p.product_id
          GROUP BY o.event_id
      ) order_totals ON e.event_id = order_totals.event_id
      WHERE e.event_id = $1
      GROUP BY
          o.order_id,
          o.payment_method,
          e.description,
          e.event_date,
          e.cost,
          e.address,
          e.event_id,
          best_order.order_id,
          best_order.order_total
  ) main_query
  JOIN discounted_totals dt ON main_query.event_id = dt.event_id;
  
    `, [event_id]);
        let result = query.rows;
        return res.json(result);
    });
}
exports.getById = getById;
function update(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { description, address, cost } = req.body;
        const event_id = req.params.id;
        const event_date = new Date(req.body.event_date).toISOString().split("T")[0];
        yield db.query("UPDATE event SET description = $1, address = $2, cost = $3, event_date = $4 WHERE event_id = $5", [description, address, cost, event_date, event_id], (err, results) => {
            if (err)
                throw err;
        });
        return res.status(200).send(`Modified with ID: ${event_id}`);
    });
}
exports.update = update;
function deleteEvent(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const event_id = req.params.id;
        yield db.query("DELETE FROM orders WHERE event_id = $1", [event_id], (err, results) => {
            if (err)
                throw err;
        });
        yield db.query("DELETE FROM event WHERE event_id = $1", [event_id], (err, results) => {
            if (err)
                throw err;
        });
        return res.status(200).send(`Deleted with ID: ${event_id}`);
    });
}
exports.deleteEvent = deleteEvent;
