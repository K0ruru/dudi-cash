export const seed = async function(knex) {
  // Clear existing entries
  await knex('products').del();
  
  // Insert seed entries
  await knex('products').insert([
    {
      name: "Americano",
      sku: "SKU001123",
      price: 35000,
      image: "http://localhost:7070/uploads/americano.jpg",
      category: "Beverages",
      supplier: "ABC Foods",
      popular: true,
      description: "Rich espresso with hot water",
      stock: 50
    },
    {
      name: "Green Tea Latte",
      sku: "SKU001124",
      price: 38000,
      image: "https://placehold.co/200x200/333/FFF?text=Green+Tea",
      category: "Beverages",
      supplier: "XYZ Beverages",
      popular: false,
      description: "Matcha with steamed milk",
      stock: 25
    },
    {
      name: "Club Sandwich",
      sku: "SKU001125",
      price: 45000,
      image: "https://placehold.co/200x200/333/FFF?text=Club+Sandwich",
      category: "Food",
      supplier: "Fresh Farms",
      popular: true,
      description: "Triple-decker classic",
      stock: 20
    },
    {
      name: "Chocolate Cake",
      sku: "SKU001126",
      price: 42000,
      image: "https://placehold.co/200x200/333/FFF?text=Chocolate+Cake",
      category: "Desserts",
      supplier: "ABC Foods",
      popular: true,
      description: "Rich dark chocolate",
      stock: 12
    },
    {
      name: "Macarons Set",
      sku: "SKU001127",
      price: 55000,
      image: "https://placehold.co/200x200/333/FFF?text=Macarons",
      category: "Desserts",
      supplier: "ABC Foods",
      popular: false,
      description: "Assorted flavors",
      stock: 8
    },
    {
      name: "Caesar Salad",
      sku: "SKU001128",
      price: 48000,
      image: "https://placehold.co/200x200/333/FFF?text=Caesar+Salad",
      category: "Food",
      supplier: "Fresh Farms",
      popular: false,
      description: "Fresh romaine lettuce",
      stock: 15
    }
  ]);
}; 