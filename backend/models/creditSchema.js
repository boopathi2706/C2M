const mongoose = require("mongoose");

const creditSchema = new mongoose.Schema(
  {
    items: {
      type: [mongoose.Schema.Types.Mixed],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customers",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Credit", creditSchema);