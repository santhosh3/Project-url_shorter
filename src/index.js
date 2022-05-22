const express = require("express");
var bodyParser = require("body-parser");
const route = require("./routes/route");
const mongoose = require("mongoose");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


try {
     mongoose.connect("mongodb+srv://ashishvyas1407:UC9yz82WjVua2m9v@cluster0.osyiq.mongodb.net/group91Database", { useNewUrlParser: true });
     console.log("MongoDB is Connected successfully...")
}
catch(error) {
     console.log(error.message)   
}


app.use("/", route);

app.listen(3000, console.log("Express App is Running on port 3000..."))




