import { NextFunction, Request, Response } from "express";
import { Order } from "../interfaces/orders.interface";
import { OrderProduct } from "../interfaces/orderProduct.interface";
const db = require("../../database/db.js");

export async function add(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> {
  /* 
  Inserts a new order and creates the relationship between the order and the event in the event_order table. 
  Body: event_id, orderProduct[product_id, quantity], discount, payment_method
  Endpoint: http://{URL}/orders/add
  */

  const event_id: Number = req.body.event_id;
  const orderProducts = req.body.orderProducts;
  const { discount, payment_method } = req.body;

  // Insert the order

  const orderResult = await db.query(
    "INSERT INTO orders(discount, payment_method, event_id) VALUES ($1, $2, $3) RETURNING order_id",
    [discount, payment_method, event_id]
  );

  const orderId = orderResult.rows[0].order_id;

  const promises = orderProducts.map(async (order: any) => {
    const product_id = order.product.product_id;
    const quantity = order.quantity;

    await db.query(
      "INSERT INTO order_product (order_id, product_id, quantity) VALUES ($1, $2, $3)",
      [orderId, product_id, quantity]
    );
  });

  await Promise.all(promises);
  await db.query(
    "INSERT INTO event_order (event_id, order_id) VALUES ($1, $2)",
    [event_id, orderId]
  );

  return res.json("ok");
  /* for (let i = 0; i < orderProducts.length; i++) {
    const order = orderProducts[i];
    const product_id = order.product.product_id;
    const quantity = order.quantity;

    await db.query(
      "INSERT INTO order_product (order_id, product_id, quantity) VALUES ($1, $2, $3)",
      [orderId, product_id, quantity]
  } */

  // Insert the order_product

  /*   await db.query(
    "INSERT INTO order_product (order_id, product_id, quantity) VALUES ($1, $2, $3)",
    [orderId, orderProducts.product.product_id, orderProducts.quantity]
  ); */

  // Insert the event_order
}

export async function getAll(req: Request, res: Response): Promise<Response> {
  /*  
  Returns all orders
  Endpoint: http://{URL}/orders/
  */

  const query = await db.query(`
    SELECT order_details.order_id, order_details.event_name, order_details.payment_method,
    order_details.product_name, order_details.quantity, order_details.product_price, order_details.total, order_details.order_total
    FROM (
    SELECT orders.order_id, event.description as event_name, orders.payment_method,
    product.description as product_name, product.price as product_price, order_product.quantity, order_product.quantity * product.price AS total,
    SUM(order_product.quantity * product.price) OVER(PARTITION BY orders.order_id) AS order_total
    FROM orders
    JOIN event ON orders.event_id = event.event_id
    JOIN order_product ON orders.order_id = order_product.order_id
    JOIN product ON order_product.product_id = product.product_id
    ) AS order_details`);

  let result = query.rows;
  return res.json(result);
}

export async function getById(req: Request, res: Response): Promise<Response> {
  /*  
  Returns all orders that are associated with the specified order_id
  Params: id
  Endpoint: http://{URL}/orders/getById/1
  */
  const order_id = req.params.id;
  const query = await db.query("SELECT * FROM order WHERE order_id = $1", [
    order_id,
  ]);
  let result: Order = query.rows;
  return res.json(result);
}

export async function getByEventId(
  req: Request,
  res: Response
): Promise<Response> {
  /*  
  Returns all orders that are associated with the specified event, 
  by joining the orders and event_order tables on their respective ID and order ID columns,
  and filtering the results by the specified event ID.
  Params: event_id
  Endpoint: http://{URL}/orders/getByEventId/1
  */

  const event_id = req.params.event_id;
  const response = await db.query(
    `SELECT *
        FROM orders
        JOIN event_order ON orders.order_id = event_order.order_id
        WHERE event_order.event_id = $1`,
    [event_id],
    (err: any, results: Response) => {
      if (err) throw err;
    }
  );

  return res.json(response);
}

export async function update(req: Request, res: Response): Promise<Response> {
  const {
    purchase_date,
    is_annulled,
    payment_date,
    payment_status,
    shipping_date,
    shipping_address,
    shipping_status,
    customer_id,
    payment_method_id,
    shipping_method_id,
    sale_mode_id,
    discount_id,
    order_item_id,
    event_id,
  } = req.body;
  const order_id = req.params.id;

  await db.query(
    "UPDATE order SET purchase_date = $1, is_annulled = $2, payment_date = $3, payment_status = $4, shipping_date = $5, shipping_address = $6, shipping_status = $7, customer_id = $8, payment_method_id = $9, shipping_method_id = $10, discount_id = $11, order_item_id = $12, event_id = $13, sale_mode_id = $14 WHERE order_id = $15",
    [
      purchase_date,
      is_annulled,
      payment_date,
      payment_status,
      shipping_date,
      shipping_address,
      shipping_status,
      customer_id,
      payment_method_id,
      shipping_method_id,
      sale_mode_id,
      discount_id,
      order_item_id,
      event_id,
    ],
    (err: any, results: Response) => {
      if (err) throw err;
    }
  );
  return res.status(200).send(`Modified with ID: ${order_id}`);
}

export async function deleteOrder(
  req: Request,
  res: Response
): Promise<Response> {
  const order_id = req.params.id;
  await db.query(
    "DELETE FROM order WHERE order_id = $1",
    [order_id],
    (err: any, results: Response) => {
      if (err) throw err;
    }
  );
  return res.status(200).send(`Deleted with ID: ${order_id}`);
}
