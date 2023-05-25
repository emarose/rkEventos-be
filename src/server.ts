import express, { Application } from "express";
import path from "path";
import dotenv from "dotenv";
const cookieParser = require("cookie-parser");
const logger = require("morgan");
dotenv.config();

const app: Application = express();
const cors = require("cors");

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

//routers
const productsRouter = require("./routes/products.routes");
const eventsRouter = require("./routes/events.routes");
const ordersRouter = require("./routes/orders.routes");

app.get("/", (req, res) => {
  res.send("Server OK on PORT " + PORT)
})

app.use("/products", productsRouter);
app.use("/events", eventsRouter);
app.use("/orders", ordersRouter);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));


app.listen(PORT, () => {
  console.log("Express conectado en el puerto", PORT);
});

module.exports = app;
