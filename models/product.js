const mongoose = require("mongoose");
const createError = require("http-errors");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String
    },
    img: { type: String },
    description: String,
    category: String,
    price: {
      type: Number
    },
    discount: {
      type: Number
    },
    isOnSale: Boolean,
    paymentTypes: Array,
    tags: Array
  },
  {
    toJSON: {
      hidden: ["__v"],
      transform: true
    }
  }
);

productSchema.options.toJSON.transform = function(doc, ret, options) {
  try {
    if (Array.isArray(options.hidden)) {
      options.hidden.forEach(prop => {
        delete ret[prop];
      });
    }
  } catch (err) {
    console.log(err);
  }
  return ret;
};

productSchema.pre("save", async function(next) {
  const product = this;
  if (
    product.modifiedPaths().includes(`name`) &&
    product.modifiedPaths().includes(`price`) &&
    product.modifiedPaths().includes(`paymentTypes`) &&
    product.modifiedPaths().includes(`discount`) &&
    product.modifiedPaths().includes(`price`)
  ) {
    if (
      product.name.length > 0 &&
      product.price > 0 &&
      product.paymentTypes.length > 0 &&
      product.discount < product.price
    ) {
      next();
    } else {
      next(
        createError(
          `Name & Price & PaymentTypes must be entered \n discount must be less than price`
        )
      );
      // createError(`Name & Price & PaymentTypes must be entered \n discount must be less than price`);
    }
  } else {
    next(createError(`not all data provided`));
  }
});

const product = mongoose.model("product", productSchema);
module.exports = product;
