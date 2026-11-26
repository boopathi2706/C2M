const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

const {
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
} = require("../controllers/shopOwnerController");

// ==============================
// AUTHENTICATION MIDDLEWARE
// ==============================
const authenticateShopOwner = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "JWT_SECRET is not configured",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.shopOwnerId = decoded.id;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

// ==============================
// PUBLIC ROUTES
// ==============================
router.post("/register", register);
router.post("/login", login);

// ==============================
// PROTECTED ROUTES
// ==============================
router.post("/create-customer", authenticateShopOwner, createCustomer);

router.put("/edit-customer", authenticateShopOwner, editCustomername);

router.delete("/delete-customer", authenticateShopOwner, deleteCustomer);

router.post("/create-credit", authenticateShopOwner, createCredit);

router.delete("/delete-credits", authenticateShopOwner, deleteCredit);

router.delete("/delete-credit/:creditId", authenticateShopOwner, deleteOneCredit);

router.put("/reduce-credit", authenticateShopOwner, reduceCredit);

// Get one customer's credit details
router.get(
  "/customer-credit/:customerId",
  authenticateShopOwner,
  getCustomerCreditDetails
);

// Shop owner dashboard
router.get(
  "/dashboard",
  authenticateShopOwner,
  getDashboardDetails
);
// Get customers with pagination and search
router.get("/customers", authenticateShopOwner, getAllCustomers);

// Get all credit records with pagination
router.get("/credits", authenticateShopOwner, getAllCredits);

module.exports = router;