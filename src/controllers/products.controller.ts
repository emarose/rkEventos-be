import { NextFunction, Request, Response } from "express";
import { Product } from "../interfaces/products.interface";

const db = require("../../database/db.js");

export async function add(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> {
  const { description, price } = req.body;
  const response = await db.query(
    "INSERT INTO product(description, price) VALUES ($1, $2)",
    [description, price],
    (err: any, res: Response) => {
      if (err) return next(err);
      res.send(res);
    }
  );
  return res.json(response.rows);
}

export async function addBulk(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> {
  const productsArray = req.body;

  for (let index = 0; index < productsArray.length; index++) {
    const product = productsArray[index];
    console.log(product);

    // Check if the product already exists in the table
    const existingProduct = await db.query(
      "SELECT * FROM product WHERE description = $1",
      [product.description]
    );

    if (existingProduct.rows.length === 0) {
      // Product doesn't exist, perform the insertion
      await db.query(
        "INSERT INTO product(description, price) VALUES ($1, $2)",
        [product.description, product.price]
      );
    }
  }

  return res.json("Bulk insertion successful");
}

export async function getAll(req: Request, res: Response): Promise<Response> {
  const rows = await db.query(
    "SELECT product_id, description, TRIM(to_char(price, 'FM$999G999D00')) AS price FROM product ORDER BY description ASC"
  );

  return res.json(rows);
}

export async function getById(req: Request, res: Response): Promise<Response> {
  const product_id = req.params.id;
  const query = await db.query("SELECT * FROM product WHERE product_id = $1", [
    product_id,
  ]);
  let result: Product = query.rows;
  return res.json(result);
}

export async function getPopularProducts(req: Request, res: Response): Promise<Response> {
  const product_id = req.params.id;
  const query = await db.query(`
  
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
  
    `
  );
  let result: Product = query.rows;
  return res.json(result);
}

export async function update(req: Request, res: Response): Promise<Response> {
  const { description, price } = req.body;
  const product_id = req.params.id;

  await db.query(
    "UPDATE product SET description = $1, price = $2 WHERE product_id = $3",
    [description, price, product_id],
    (err: any, results: Response) => {
      if (err) throw err;
    }
  );
  return res.status(200).send(`Modified product with ID: ${product_id}`);
}

export async function deleteProduct(
  req: Request,
  res: Response
): Promise<Response> {
  const product_id = req.params.id;
  await db.query(
    "DELETE FROM product WHERE product_id = $1",
    [product_id],
    (err: any, results: Response) => {
      if (err) throw err;
    }
  );
  return res.status(200).send(`Deleted product with ID: ${product_id}`);
}
