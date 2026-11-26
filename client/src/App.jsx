import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";
import Credits from "./pages/Credits";
import React from "react"
function Protected({ children }) {
  return localStorage.getItem("token") ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
}
function PublicOnly({ children }) {
  return localStorage.getItem("token") ? (
    <Navigate to="/dashboard" replace />
  ) : (
    children
  );
}
export default function App() {
  const loc = useLocation();
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnly>
            <Auth />
          </PublicOnly>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnly>
            <Auth register />
          </PublicOnly>
        }
      />
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/:customerId" element={<CustomerDetails />} />
        <Route path="/credits" element={<Credits />} />
      </Route>
      <Route
        path="*"
        element={
          <Navigate
            to={localStorage.getItem("token") ? "/dashboard" : "/login"}
            replace
          />
        }
      />
    </Routes>
  );
}
