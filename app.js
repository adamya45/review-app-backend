const express = require("express");
require("express-async-errors");
const morgan = require("morgan");
require("dotenv").config();
require("./db");
const userRouter = require("./routes/user");
const { errorHandler } = require("./middlewares/error");

const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/user", userRouter);

app.use(errorHandler);

/*app.post("/sign-in",
  (req, res, next) => {
    const { email, password } = req.body
    if (!email || !password)
      return res.json({ error: 'email/ password missing!' })
    next()
  },
  (req, res) => {
    res.send("<h1>Hello I am from your backend about</h1>");
  });*/

app.listen(8000, () => {
  console.log("the port is listening on port 8000");
});
