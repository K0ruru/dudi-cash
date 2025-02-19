export const seed = async function(knex) {
  // Clear existing entries
  await knex('vouchers').del();
  
  // Insert entries with future dates
  await knex('vouchers').insert([
    {
      code: "WELCOME10",
      description: "New customer discount",
      discount: 10,
      claimed_count: 145,
      max_claims: 200,
      expiry_date: "2025-04-01",
      status: "active"
    },
    {
      code: "SUMMER25",
      description: "Summer sale discount",
      discount: 25,
      claimed_count: 89,
      max_claims: 100,
      expiry_date: "2025-03-15",
      status: "active"
    },
    {
      code: "SPECIAL15",
      description: "Special event discount",
      discount: 15,
      claimed_count: 200,
      max_claims: 200,
      expiry_date: "2024-02-01",
      status: "expired"
    },
    {
      code: "FLASH30",
      description: "Flash sale discount",
      discount: 30,
      claimed_count: 48,
      max_claims: 50,
      expiry_date: "2025-03-30",
      status: "active"
    }
  ]);
}; 