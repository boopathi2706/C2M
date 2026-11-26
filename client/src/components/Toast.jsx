import React from "react";
export default function Toast({ message, type = "success", onClose }) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`toast ${type}`} role="status">
      <span>{type === "error" ? "⚠" : "✓"}</span>
      {message}
      <button onClick={onClose}>×</button>
    </div>
  );
}
