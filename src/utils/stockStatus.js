export const getStockStatus = (stock) => {
  if (stock >= 10) {
    return {
      label: "In Stock",
      color: "text-green-600 bg-green-50"
    };
  } else if (stock > 0) {
    return {
      label: "Low Stock",
      color: "text-yellow-600 bg-yellow-50"
    };
  } else {
    return {
      label: "Out of Stock",
      color: "text-red-600 bg-red-50"
    };
  }
}; 