import React, { useState, useRef, useEffect } from 'react';

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  allowCustom?: boolean;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  allowCustom = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customValue, setCustomValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Combine standard options with any custom selected values that aren't in the standard list
  // ignoring "None" for the custom check
  const customSelected = selected.filter(s => !options.includes(s) && s !== "None");
  const displayOptions = [...options];

  const filteredOptions = displayOptions.filter(opt =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option));
    } else {
      if (option === "None") {
        onChange(["None"]);
      } else {
        const newSelected = selected.filter(s => s !== "None");
        newSelected.push(option);
        onChange(newSelected);
      }
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customValue.trim()) {
      const val = customValue.trim();
      if (!selected.includes(val)) {
        const newSelected = selected.filter(s => s !== "None");
        newSelected.push(val);
        onChange(newSelected);
      }
      setCustomValue("");
    }
  };

  const handleRemove = (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter(s => s !== option));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div
        className="min-h-[42px] w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 bg-white cursor-pointer focus-within:ring-1 focus-within:ring-brand-500 focus-within:border-brand-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-2">
          {selected.length === 0 && (
            <span className="text-gray-400 select-none">{placeholder}</span>
          )}
          {selected.map(item => (
            <span key={item} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-100 text-brand-800">
              {item}
              <button
                type="button"
                onClick={(e) => handleRemove(item, e)}
                className="ml-1 text-brand-600 hover:text-brand-900 focus:outline-none"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm flex flex-col max-h-80">
          <div className="sticky top-0 bg-white p-2 border-b z-20 flex gap-2">
            <input
              type="text"
              className="flex-grow border-gray-300 border rounded-md p-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            <button
               type="button"
               onClick={() => setIsOpen(false)}
               className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md border border-gray-300 text-xs font-medium"
            >
              Close
            </button>
          </div>
          
          <div className="overflow-auto flex-grow">
            {filteredOptions.length === 0 && !allowCustom ? (
              <div className="cursor-default select-none relative py-2 px-4 text-gray-700">No options found.</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option}
                  className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-brand-50 ${selected.includes(option) ? 'bg-brand-50' : ''}`}
                  onClick={() => toggleOption(option)}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                      checked={selected.includes(option)}
                      readOnly
                    />
                    <span className={`ml-3 block truncate ${selected.includes(option) ? 'font-semibold' : 'font-normal'}`}>
                      {option}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {allowCustom && (
            <div className="p-2 border-t bg-gray-50 sticky bottom-0 z-20">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  placeholder="Other (type & add)"
                  className="flex-grow border-gray-300 border rounded-md p-1 sm:text-sm focus:ring-brand-500 focus:border-brand-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustom(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustom}
                  className="px-3 py-1 bg-brand-600 text-white rounded-md text-xs font-medium hover:bg-brand-700"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};