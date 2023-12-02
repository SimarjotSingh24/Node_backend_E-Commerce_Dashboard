const express = require("express");
require("./db/config");
const User = require("./db/User");
const cors = require("cors");
const Product = require("./db/Product");
const Jwt = require('jsonwebtoken');
const jwtKey = 'e-comm';

const app = express();

//Middleware
app.use(express.json());
app.use(cors());

//Register API 
app.post("/register", async (req, resp) => {
  let user = new User(req.body);
  let result = await user.save(user);
  result = result.toObject();
  delete result.password;
  delete result.__v;
  if (result) {
    Jwt.r({ user }, jwtKey, { expiresIn: '24h' }, (err, token) => {
      if (err) {
        resp.send({ result: "Something went wrong, Please try after sometime" });
      }
      resp.send({ user, auth: token });
    })
  }
  else {
    resp.send({ result: "No User Found" });
  }
});

//Login API
app.post("/login", async (req, resp) => {
  console.log(req);
  if (req.body.password && req.body.email) {
    let user = await User.findOne(req.body).select("-__v").select("-password");
    if (user) {
      resp.send(user);
    }
    else {
      resp.send({ result: "No User Found" });
    }
  }
  else {
    resp.send("No User Found");
  }
});

//Add Product API
app.post("/add_product", async (req, resp) => {
  console.log(req);
  let product = new Product(req.body);
  let result = await product.save(product);
  resp.send(result);
});

//Get Product List 
app.get("/products", async (req, resp) => {
  console.log(req);
  let products = await Product.find();
  if (products.length > 0) {
    resp.send(products);
  }
  else {
    resp.send({ result: "No Products Found" });
  }
});

//Delete Product API
app.delete("/delete/:id", async (req, resp) => {
  let result = await Product.deleteOne({ _id: req.params.id });
  resp.send(result);
});

//Get Single Product API
app.get("/product/:id", async (req, resp) => {
  let result = await Product.findOne({ _id: req.params.id });
  if (result) {
    resp.send(result);
  }
  else {
    resp.send({ result: "No Record Found" });
  }
});

//Update Single Product API
app.put("/product/:id", async (req, resp) => {
  let result = await Product.updateOne(
    { _id: req.params.id },
    {
      $set: req.body
    }
  )
  resp.send(result);
});

app.listen(6500);
