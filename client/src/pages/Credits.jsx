import { ReceiptText } from "lucide-react";
import React from "react";
export default function Credits() {
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Credit</h1>
          <p>Credit overview.</p>
        </div>
      </div>
      <div className="panel empty-api">
        <ReceiptText size={34} />
        <h3>Credit overview API not added yet</h3>
        <p>
          Your backend currently supports creating and deleting credits and
          retrieving a customer’s credit entries. It does not yet have an
          endpoint to list all credit entries across the shop. This page is
          ready to connect once that API is added.
        </p>
      </div>
    </>
  );
}
