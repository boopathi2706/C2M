const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    totalCredit: {
      type: Number,
      default: 0,
      min: 0,
    },

    shopOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShopOwner",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Same customer name can exist in different shops,
// but not twice in the same shop.
customerSchema.index(
  { customerName: 1, shopOwner: 1 },
  { unique: true }
);

module.exports = mongoose.model("Customers", customerSchema);