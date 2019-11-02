var express = require("express");
var router = express.Router();
var productModel = require("../models/product");
var createError = require("http-errors");
var authenticationMiddleware = require("../middleware/authentication");

var ObjectId = require("mongoose").Types.ObjectId; // get Time Stamp from db ObjectId hex

/* GET products listing. */

router.get("/", authenticationMiddleware, async (req, res, next) => {
  const item = await productModel.find().catch(err => createError(400, err));
  // const  [{ _id: _id, name: name, price: price, discount: discount, isOnSale: isOnSale }] } = [...item];
  const items = item.map(p => {
    return {
      _id: p.id,
      name: p.name,
      price: p.price,
      discount: p.discount,
      isOnSale: p.isOnSale
    };
  });

  res.send(items);
});

router.get("/:_id", authenticationMiddleware, async (req, res, next) => {
  const item = await productModel
    .findById(req.params._id)
    .catch(err => createError(400, err));
  res.send(item);
});

router.delete("/:_id", authenticationMiddleware, async (req, res, next) => {
  // the return gets the next item from db not the deleted item
  // const item = await productModel.findOneAndRemove(req.params._id).catch(err => createError(400, err));

  const item = await productModel
    .deleteOne({ _id: req.params._id })
    .catch(err => createError(400, err));
  res.send(item);
});

router.post("/", authenticationMiddleware, (req, res, next) => {
  const product = new productModel(req.body);
  product.save(err => {
    if (err) return next(createError(400, err));
    res.send(product);
  });
});

// product guard
// router.post('/', authenticationMiddleware, (req, res, next) => {
//   console.log("post");
//   res.send(req.product);
// });

// router.get('/', authenticationMiddleware, (req, res, nex) => {
//   console.log("get");
//   res.send(req.body);
// });

module.exports = router;
