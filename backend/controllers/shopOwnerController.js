const ShopOwner = require("../models/shopOwnerSchema");
const Customer = require("../models/customerSchema");
const Credit = require("../models/creditSchema");

const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ==============================
// REGISTER SHOP OWNER
// ==============================
const register = async (req, res) =>  {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const trimmedUsername = username.trim();

    if (trimmedUsername.length < 3) {
      return res.status(400).json({
        message: "Username must contain at least 3 characters",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters",
      });
    }

    const existUser = await ShopOwner.findOne({
      username: trimmedUsername,
    });

    if (existUser) {
      return res.status(409).json({
        message: "Username already exists",
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const newShopOwner = await ShopOwner.create({
      username: trimmedUsername,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Shop owner account created successfully",
      shopOwner: {
        id: newShopOwner._id,
        username: newShopOwner.username,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Username already exists",
      });
    }

    return res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

// ==============================
// LOGIN SHOP OWNER
// ==============================
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const shopOwner = await ShopOwner.findOne({
      username: username.trim(),
    });

    if (!shopOwner) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const isMatch = await bcryptjs.compare(
      password,
      shopOwner.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "JWT_SECRET is not configured",
      });
    }

    const token = jwt.sign(
      { id: shopOwner._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      shopOwner: {
        id: shopOwner._id,
        username: shopOwner.username,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

// ==============================
// CREATE CUSTOMER
// ==============================
const createCustomer = async (req, res) => {
  try {
    const { customerName } = req.body;

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({
        message: "Customer name is required",
      });
    }

    const name = customerName.trim();

    const existCustomer = await Customer.findOne({
      customerName: name,
      shopOwner: req.shopOwnerId,
    });

    if (existCustomer) {
      return res.status(409).json({
        message: "Customer already exists",
      });
    }

    const newCustomer = await Customer.create({
      customerName: name,
      shopOwner: req.shopOwnerId,
    });

    return res.status(201).json({
      message: "Customer created successfully",
      customer: newCustomer,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Customer already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to create customer",
      error: error.message,
    });
  }
};

// ==============================
// EDIT CUSTOMER NAME
// ==============================
const editCustomername = async (req, res) => {
  try {
    const { customerName, newCustomerName } = req.body;

    if (
      !customerName ||
      !newCustomerName ||
      !customerName.trim() ||
      !newCustomerName.trim()
    ) {
      return res.status(400).json({
        message: "Current and new customer names are required",
      });
    }

    const oldName = customerName.trim();
    const newName = newCustomerName.trim();

    const existCustomer = await Customer.findOne({
      customerName: oldName,
      shopOwner: req.shopOwnerId,
    });

    if (!existCustomer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    if (oldName === newName) {
      return res.status(200).json({
        message: "Customer name is unchanged",
        customer: existCustomer,
      });
    }

    const newNameExist = await Customer.findOne({
      customerName: newName,
      shopOwner: req.shopOwnerId,
    });

    if (newNameExist) {
      return res.status(409).json({
        message: "New customer name already exists",
      });
    }

    existCustomer.customerName = newName;
    await existCustomer.save();

    return res.status(200).json({
      message: "Customer name updated successfully",
      customer: existCustomer,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "New customer name already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to update customer name",
      error: error.message,
    });
  }
};

// ==============================
// DELETE CUSTOMER
// ==============================
const deleteCustomer = async (req, res) => {
  try {
    const { customerName } = req.body;

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({
        message: "Customer name is required",
      });
    }

    const customer = await Customer.findOne({
      customerName: customerName.trim(),
      shopOwner: req.shopOwnerId,
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    // Delete all credits associated with this customer
    await Credit.deleteMany({
      customerId: customer._id,
    });

    await Customer.deleteOne({
      _id: customer._id,
      shopOwner: req.shopOwnerId,
    });

    return res.status(200).json({
      message: "Customer and associated credits deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete customer",
      error: error.message,
    });
  }
};

// ==============================
// CREATE CREDIT
// ==============================
const createCredit = async (req, res) => {
  try {
    const { items, amount, customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({
        message: "Customer ID is required",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "At least one item is required",
      });
    }

    if (
      amount === undefined ||
      amount === null ||
      amount === "" ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0
    ) {
      return res.status(400).json({
        message: "Amount must be a valid number greater than 0",
      });
    }

    const creditAmount = Number(amount);

    const existCustomer = await Customer.findOne({
      _id: customerId,
      shopOwner: req.shopOwnerId,
    });

    if (!existCustomer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const newCredit = await Credit.create({
      items,
      amount: creditAmount,
      customerId: existCustomer._id,
    });

    existCustomer.totalCredit =
      Number(existCustomer.totalCredit || 0) + creditAmount;

    await existCustomer.save();

    return res.status(201).json({
      message: "Credit added successfully",
      credit: newCredit,
      totalCredit: existCustomer.totalCredit,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add credit",
      error: error.message,
    });
  }
};

// ==============================
// DELETE ALL CREDITS FOR CUSTOMER
// ==============================
const deleteCredit = async (req, res) => {
  try {
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({
        message: "Customer ID is required",
      });
    }

    const customer = await Customer.findOne({
      _id: customerId,
      shopOwner: req.shopOwnerId,
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    await Credit.deleteMany({
      customerId: customer._id,
    });

    customer.totalCredit = 0;
    await customer.save();

    return res.status(200).json({
      message: "All credits deleted successfully",
      totalCredit: 0,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete credits",
      error: error.message,
    });
  }
};

// ==============================
// DELETE ONE CREDIT
// ==============================
const deleteOneCredit = async (req, res) => {
  try {
    const { creditId } = req.params;

    if (!creditId) {
      return res.status(400).json({
        message: "Credit ID is required",
      });
    }

    const credit = await Credit.findById(creditId);

    if (!credit) {
      return res.status(404).json({
        message: "Credit not found",
      });
    }

    const customer = await Customer.findOne({
      _id: credit.customerId,
      shopOwner: req.shopOwnerId,
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found or access denied",
      });
    }

    await Credit.deleteOne({
      _id: credit._id,
      customerId: customer._id,
    });

    customer.totalCredit = Math.max(
      0,
      Number(customer.totalCredit || 0) - Number(credit.amount || 0)
    );

    await customer.save();

    return res.status(200).json({
      message: "Credit deleted successfully",
      totalCredit: customer.totalCredit,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete credit",
      error: error.message,
    });
  }
};
// ==============================
// REDUCE CUSTOMER CREDIT
// ==============================
// ==============================
// REDUCE CUSTOMER CREDIT
// ==============================
const reduceCredit = async (req, res) => {
  try {
    const { customerId, amount } = req.body;

    // Validate inputs
    if (!customerId || amount === undefined || amount === null || amount === "") {
      return res.status(400).json({
        message: "Customer ID and amount are required",
      });
    }

    const reduceAmount = Number(amount);

    if (!Number.isFinite(reduceAmount) || reduceAmount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    // Find customer belonging to this shop owner
    const customer = await Customer.findOne({
      _id: customerId,
      shopOwner: req.shopOwnerId,
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const totalCredit = Number(customer.totalCredit || 0);

    // Check reduction amount
    if (reduceAmount > totalCredit) {
      return res.status(400).json({
        message: "Reduce amount cannot exceed total credit",
        totalCredit,
      });
    }

    // Calculate remaining amount
    const remainingAmount = totalCredit - reduceAmount;

    // Delete old credit records
    await Credit.deleteMany({
      customerId: customer._id,
    });

    // Create remaining credit record if balance exists
    if (remainingAmount > 0) {
      await Credit.create({
        customerId: customer._id,
        items: ["pending last amount"],
        amount: remainingAmount,
      });
    }

    // Update customer balance
    customer.totalCredit = remainingAmount;
    await customer.save();

    // Update shop owner's returned amount
    await ShopOwner.findByIdAndUpdate(
      req.shopOwnerId,
      {
        $inc: { totalReturned: reduceAmount },
      }
    );

    return res.status(200).json({
      message: "Credit reduced successfully",
      customerName: customer.customerName,
      previousCredit: totalCredit,
      reducedAmount: reduceAmount,
      remainingCredit: remainingAmount,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to reduce credit",
      error: error.message,
    });
  }
};

// ==============================
// GET ONE CUSTOMER CREDIT DETAILS
// ==============================
const getCustomerCreditDetails = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({
        message: "Customer ID is required",
      });
    }

    const customer = await Customer.findOne({
      _id: customerId,
      shopOwner: req.shopOwnerId,
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const credits = await Credit.find({
      customerId: customer._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Customer credit details fetched successfully",
      customer: {
        _id: customer._id,
        customerName: customer.customerName,
        totalCredit: customer.totalCredit,
        createdAt: customer.createdAt,
      },
      credits,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch customer credit details",
      error: error.message,
    });
  }
};

// ==============================
// SHOP OWNER DASHBOARD
// ==============================
const getDashboardDetails = async (req, res) => {
  try {
    // Get shop owner
    const shopOwner = await ShopOwner.findById(req.shopOwnerId)
      .select("username totalReturned");

    if (!shopOwner) {
      return res.status(404).json({
        message: "Shop owner not found",
      });
    }

    // Calculate total outstanding credit and customer count
    const summary = await Customer.aggregate([
      {
        $match: {
          shopOwner: shopOwner._id,
        },
      },
      {
        $group: {
          _id: null,
          totalCredit: { $sum: "$totalCredit" },
          totalCustomers: { $sum: 1 },
        },
      },
    ]);

    // Get customer with highest credit
    const highestCreditCustomer = await Customer.findOne({
      shopOwner: shopOwner._id,
    })
      .sort({ totalCredit: -1 })
      .select("customerName totalCredit");

    const dashboard = summary[0] || {
      totalCredit: 0,
      totalCustomers: 0,
    };

    return res.status(200).json({
      message: "Dashboard details fetched successfully",

      dashboard: {
        shopOwnerName: shopOwner.username,

        totalCredit: dashboard.totalCredit || 0,

        totalReturned: shopOwner.totalReturned || 0,

        totalCustomers: dashboard.totalCustomers || 0,

        highestCreditCustomer: highestCreditCustomer
          ? {
              customerName: highestCreditCustomer.customerName,
              amount: highestCreditCustomer.totalCredit,
            }
          : null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch dashboard details",
      error: error.message,
    });
  }
};
// GET ALL CUSTOMERS WITH PAGINATION AND SEARCH
const getAllCustomers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const search = (req.query.search || "").trim();

    const filter = {
      shopOwner: req.shopOwnerId,
    };

    if (search) {
      filter.customerName = {
        $regex: search,
        $options: "i",
      };
    }

    const [customers, totalCustomers] = await Promise.all([
      Customer.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Customer.countDocuments(filter),
    ]);

    return res.status(200).json({
      message: "Customers fetched successfully",
      pagination: {
        currentPage: page,
        limit,
        totalCustomers,
        totalPages: Math.ceil(totalCustomers / limit),
      },
      customers,
    });
  } catch (error) {
    console.error("Get all customers error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch customers",
    });
  }
};
// GET ALL CREDIT RECORDS WITH PAGINATION
const getAllCredits = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    // Find shop owner's customers
    const customers = await Customer.find({
      shopOwner: req.shopOwnerId,
    }).select("_id customerName totalCredit");

    const customerIds = customers.map((customer) => customer._id);

    // Find credits belonging to those customers
    const [credits, totalCredits] = await Promise.all([
      Credit.find({
        customerId: { $in: customerIds },
      })
        .populate("customerId", "customerName totalCredit")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Credit.countDocuments({
        customerId: { $in: customerIds },
      }),
    ]);

    return res.status(200).json({
      message: "Credit records fetched successfully",
      pagination: {
        currentPage: page,
        limit,
        totalCredits,
        totalPages: Math.ceil(totalCredits / limit),
      },
      credits,
    });
  } catch (error) {
    console.error("Get all credits error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch credit records",
    });
  }
};
// ==============================
// EXPORT
// ==============================
module.exports = {
  register,
  login,
  createCustomer,
  editCustomername,
  deleteCustomer,
  createCredit,
  deleteCredit,
  deleteOneCredit,
  reduceCredit,
  getCustomerCreditDetails,
  getDashboardDetails,
  getAllCustomers,
  getAllCredits,
};