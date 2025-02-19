const CategoryFilter = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="mb-12 flex gap-4 overflow-x-auto">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-6 py-3 text-lg rounded-xl transition-all duration-200 shadow-2xs cursor-pointer ${
            activeCategory === category
              ? "bg-gray-900 text-white"
              : "bg-white hover:bg-gray-50"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter; 