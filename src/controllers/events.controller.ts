import { NextFunction, Request, Response } from "express";
import { Event } from "../interfaces/events.interface";
import { formatDateString } from "../utils/utils";

const db = require("../../database/db.js");

export async function add(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> {
  const { description, address, cost, event_date }: Event = req.body;
  console.log(req.body.event_date);
  const response = await db.query(
    "INSERT INTO event(description, address, cost, event_date) VALUES ($1, $2, $3, $4)",
    [description, address, cost, event_date],
    (err: any, res: Response) => {
      if (err) return next(err);
      res.send(res);
    }
  );
  return res.json(response.rows);
}

export async function getAll(req: Request, res: Response): Promise<Response> {
  const rows = await db.query(
    "SELECT event_id, description, address, TRIM(to_char(cost, 'FM$999G999D00')) AS cost, event_date FROM event"
  );

  return res.json(rows);
}

export async function getLabels(
  req: Request,
  res: Response
): Promise<Response> {
  const rows = await db.query(
    "SELECT event_id, event_date, description FROM event"
  );

  return res.json(rows);
}

export async function getById(req: Request, res: Response): Promise<Response> {
  const event_id = req.params.id;
  const query = await db.query(
    `
    SELECT o.order_id, o.payment_method, json_agg(json_build_object('description', p.description, 'price', TRIM(to_char(p.price, 'FM$999G999D00')), 'quantity', op.quantity)) AS products, 
    TRIM(to_char(SUM(p.price * op.quantity), 'FM$999G999D00')) AS order_total, e.description AS event_description, e.event_date, TRIM(to_char(cost, 'FM$999G999D00')) AS cost, e.address, e.event_id
    FROM orders o
    JOIN event e ON o.event_id = e.event_id
    JOIN order_product op ON o.order_id = op.order_id
    JOIN product p ON op.product_id = p.product_id
    WHERE e.event_id = $1
    GROUP BY o.order_id, e.description, e.event_date, e.cost, e.address, e.event_id, o.payment_method;      
    `,
    [event_id]
  );
  let result: Event = query.rows;
  return res.json(result);
}

export async function update(req: Request, res: Response): Promise<Response> {
  const { description, address, cost }: Event = req.body;
  const event_id = req.params.id;
  console.log("EVENT DATE DESDE EL BODY: ", req.body.event_date);

  const event_date = new Date(req.body.event_date).toISOString().split("T")[0];

  console.log(event_date);
  //const event_date = formatDateString(req.body.event_date);
  await db.query(
    "UPDATE event SET description = $1, address = $2, cost = $3, event_date = $4 WHERE event_id = $5",
    [description, address, cost, event_date, event_id],
    (err: any, results: Response) => {
      if (err) throw err;
    }
  );
  return res.status(200).send(`Modified with ID: ${event_id}`);
}

export async function deleteEvent(
  req: Request,
  res: Response
): Promise<Response> {
  const event_id = req.params.id;
  console.log(event_id);
  await db.query(
    "DELETE FROM event WHERE event_id = $1",
    [event_id],
    (err: any, results: Response) => {
      if (err) throw err;
    }
  );
  return res.status(200).send(`Deleted with ID: ${event_id}`);
}
