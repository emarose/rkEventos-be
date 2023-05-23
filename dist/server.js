"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookieParser = require("cookie-parser");
const logger = require("morgan");
dotenv_1.default.config();
const app = (0, express_1.default)();
const cors = require("cors");
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express_1.default.json());
//routers
const productsRouter = require("./routes/products.routes");
const eventsRouter = require("./routes/events.routes");
const ordersRouter = require("./routes/orders.routes");
app.get("/", (req, res) => {
    res.send("Server OK on PORT " + PORT);
});
app.use("/products", productsRouter);
app.use("/events", eventsRouter);
app.use("/orders", ordersRouter);
// view engine setup
app.set("views", path_1.default.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(logger("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.listen(PORT, () => {
    console.log("Express conectado en el puerto", PORT);
});
module.exports = app;
