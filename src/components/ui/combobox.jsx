import { useState, useRef, useEffect } from "react";
import { cn } from "../../lib/utils";

const Combobox = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options
    .filter(option => 
      option.toLowerCase().includes(inputValue?.toLowerCase() || '')
      && option.toLowerCase() !== inputValue?.toLowerCase()
    )
    .slice(0, 3); // Only show last 3 matches

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setIsOpen(newValue.length > 0);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={inputValue || ''}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-gray-200"
      />
      
      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-auto">
          {filteredOptions.map((option) => (
            <li
              key={option}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onChange(option);
                setInputValue(option);
                setIsOpen(false);
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Combobox; 