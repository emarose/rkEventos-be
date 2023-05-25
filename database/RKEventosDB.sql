CREATE TABLE IF NOT EXISTS "event" ("event_id" BIGSERIAL NOT NULL, "description" TEXT NOT NULL, "address" TEXT, "cost" FLOAT check(cost >= 0), "event_date" date NOT NULL, PRIMARY KEY ("event_id"));

CREATE TABLE IF NOT EXISTS "orders" ("order_id" BIGSERIAL NOT NULL,"created_at" TIMESTAMP  DEFAULT CURRENT_TIMESTAMP NOT NULL,"is_annulled" BOOLEAN DEFAULT FALSE,"discount" FLOAT DEFAULT 0,"payment_method" TEXT NOT NULL,"event_id" BIGSERIAL NOT NULL,PRIMARY KEY ("order_id"),CONSTRAINT "event_fk" FOREIGN KEY ("event_id") REFERENCES "event"("event_id") ON DELETE CASCADE);

CREATE TABLE IF NOT EXISTS "product" ("product_id" BIGSERIAL NOT NULL,"description" TEXT NOT NULL,"price" FLOAT NOT NULL check(price >= 1),PRIMARY KEY ("product_id"));

CREATE TABLE IF NOT EXISTS "order_product" ("order_product_id" BIGSERIAL NOT NULL,"quantity" INT NOT NULL check(quantity >= 1),"product_id" BIGSERIAL NOT NULL,"order_id" BIGSERIAL NOT NULL,PRIMARY KEY ("order_product_id"),CONSTRAINT "product_fk" FOREIGN KEY ("product_id") REFERENCES "product"("product_id") ON DELETE CASCADE, CONSTRAINT "order_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE CASCADE);

CREATE TABLE IF NOT EXISTS "event_order" ("event_order_id" BIGSERIAL NOT NULL,"event_id" BIGSERIAL NOT NULL,"order_id" BIGSERIAL NOT NULL,PRIMARY KEY ("event_order_id"),CONSTRAINT "event_fk1" FOREIGN KEY ("event_id") REFERENCES "event"("event_id") ON DELETE CASCADE, CONSTRAINT "event_fk2" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE CASCADE);