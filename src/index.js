const express = require("express");
var bodyParser = require("body-parser");
const route = require("./routes/route");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://ashishvyas1407:UC9yz82WjVua2m9v@cluster0.osyiq.mongodb.net/group91Database",
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB is connected"))
  .catch((err) => console.log(err));

app.use("/", route);

app.listen(process.env.PORT || 3000, function () {
  console.log("Express app is running on " + " " + (process.env.PORT || 3000));
});




