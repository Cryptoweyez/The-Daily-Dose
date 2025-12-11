import React, { useState, useEffect, useRef } from 'react';
import { PetInput, Species, Sex, FoodType, ActivityLevel } from '../types';
import { COMMON_DOG_BREEDS, COMMON_CAT_BREEDS, MEDICAL_CONDITIONS, FOOD_BRANDS } from '../constants';
import { MultiSelect } from './MultiSelect';

interface PetFormProps {
  initialValues?: PetInput;
  onSubmit: (pet: Omit<PetInput, 'id'>) => void;
  onCancel?: () => void;
  variant?: 'modal' | 'inline';
}

export const PetForm: React.FC<PetFormProps> = ({ initialValues, onSubmit, onCancel, variant = 'modal' }) => {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<Species>('Dog');
  const [breed, setBreed] = useState('');
  const [weight, setWeight] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [sex, setSex] = useState<Sex>('Male');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('Moderate');
  const [medicalConditions, setMedicalConditions] = useState<string[]>([]);
  const [foodType, setFoodType] = useState<FoodType>('Dry');
  const [foodBrands, setFoodBrands] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name);
      setSpecies(initialValues.species);
      setBreed(initialValues.breed);
      setWeight(initialValues.weight.toString());
      setAge(initialValues.age.toString());
      setSex(initialValues.sex);
      setActivityLevel(initialValues.activityLevel);
      setMedicalConditions(initialValues.medicalConditions);
      setFoodType(initialValues.foodType);
      setFoodBrands(initialValues.foodBrands);
      setImageUrl(initialValues.imageUrl || '');
    } else {
      // Reset form if initialValues is null (switching from edit to add in inline mode)
      resetForm();
    }
  }, [initialValues]);

  const resetForm = () => {
    setName('');
    setSpecies('Dog');
    setBreed('');
    setWeight('');
    setAge('');
    setSex('Male');
    setActivityLevel('Moderate');
    setMedicalConditions([]);
    setFoodType('Dry');
    setFoodBrands([]);
    setImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Derived state for breed suggestions
  const breedOptions = species === 'Dog' ? COMMON_DOG_BREEDS : COMMON_CAT_BREEDS;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || parseFloat(weight) <= 0) {
      alert("Please enter a valid weight.");
      return;
    }
    if (!age || parseFloat(age) < 0) {
      alert("Please enter a valid age.");
      return;
    }
    onSubmit({
      name,
      species,
      breed: breed || "Unknown Mix",
      weight: parseFloat(weight),
      age: parseFloat(age),
      sex,
      activityLevel,
      medicalConditions: medicalConditions.length > 0 ? medicalConditions : ["None"],
      foodType,
      foodBrands: foodBrands.length > 0 ? foodBrands : ["Generic / No Preference"],
      imageUrl
    });
    
    if (variant === 'inline' && !initialValues) {
      resetForm();
    }
  };

  const formContent = (
    <div className={`bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${variant === 'inline' ? 'rounded-xl shadow-md border border-slate-100' : ''}`}>
      <div className="sm:flex sm:items-start">
        <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
          <h3 className="text-lg leading-6 font-bold text-gray-900 mb-4" id="modal-title">
            {initialValues ? 'Edit Profile' : 'New Entry'}
          </h3>
          
          <div className="space-y-4">
            
            {/* Image Upload */}
            <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-md hover:border-brand-400 transition-colors">
              {imageUrl ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden mb-2 shadow-sm">
                   <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                   <button 
                     type="button" 
                     onClick={() => { setImageUrl(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                     className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                   >
                     ✕
                   </button>
                </div>
              ) : (
                <div className="text-gray-400 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*" 
                onChange={handleImageChange}
                className="block w-full text-xs text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-xs file:font-semibold
                  file:bg-brand-50 file:text-brand-700
                  hover:file:bg-brand-100"
              />
            </div>

            {/* Row 1: Species & Sex */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700">Species</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <button
                    type="button"
                    onClick={() => setSpecies('Dog')}
                    className={`flex-1 items-center px-2 py-1.5 rounded-l-md border text-xs font-medium ${species === 'Dog' ? 'bg-amber-100 border-amber-300 text-amber-700 z-10' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    🐶 Dog
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpecies('Cat')}
                    className={`flex-1 items-center px-2 py-1.5 rounded-r-md border-t border-r border-b text-xs font-medium ${species === 'Cat' ? 'bg-emerald-100 border-emerald-300 text-emerald-700 z-10' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    🐱 Cat
                  </button>
                </div>
              </div>
                <div>
                <label className="block text-xs font-medium text-gray-700">Sex</label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as Sex)}
                  className="mt-1 block w-full py-1.5 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 text-xs"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 focus:ring-brand-500 focus:border-brand-500 block w-full shadow-sm text-xs border-gray-300 rounded-md p-1.5 border"
                placeholder="Pet Name"
              />
            </div>

            {/* Breed & Weight */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="breed" className="block text-xs font-medium text-gray-700">Breed</label>
                <input
                  list="breeds"
                  name="breed"
                  id="breed"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  className="mt-1 focus:ring-brand-500 focus:border-brand-500 block w-full shadow-sm text-xs border-gray-300 rounded-md p-1.5 border"
                  placeholder="Search..."
                />
                <datalist id="breeds">
                  {breedOptions.map(b => <option key={b} value={b} />)}
                </datalist>
              </div>
              <div>
                <label htmlFor="weight" className="block text-xs font-medium text-gray-700">Lbs</label>
                <input
                  type="number"
                  step="0.1"
                  name="weight"
                  id="weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                  className="mt-1 focus:ring-brand-500 focus:border-brand-500 block w-full shadow-sm text-xs border-gray-300 rounded-md p-1.5 border"
                  placeholder="0.0"
                />
              </div>
            </div>

            {/* Age & Activity Level */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="age" className="block text-xs font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  step="0.1"
                  name="age"
                  id="age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                  className="mt-1 focus:ring-brand-500 focus:border-brand-500 block w-full shadow-sm text-xs border-gray-300 rounded-md p-1.5 border"
                  placeholder="Yrs"
                />
              </div>
                <div>
                <label className="block text-xs font-medium text-gray-700">Activity</label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                  className="mt-1 block w-full py-1.5 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 text-xs"
                >
                  <option value="Low">Low</option>
                  <option value="Moderate">Avg</option>
                  <option value="High">High</option>
                  <option value="Working/Athlete">Work</option>
                </select>
              </div>
            </div>

            {/* Medical Conditions */}
            <div>
              <MultiSelect 
                label="Health Issues" 
                options={MEDICAL_CONDITIONS}
                selected={medicalConditions}
                onChange={setMedicalConditions}
                placeholder="Select..."
                allowCustom={true}
              />
            </div>

            {/* Food Type */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Food Pref</label>
                <div className="flex gap-2">
                  {(['Dry', 'Wet', 'Both'] as FoodType[]).map(type => (
                    <label key={type} className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-3 w-3 text-brand-600"
                        name="foodType"
                        value={type}
                        checked={foodType === type}
                        onChange={() => setFoodType(type)}
                      />
                      <span className="ml-1 text-xs text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
            </div>

              {/* Food Brands */}
              <div>
              <MultiSelect 
                label="Preferred Brands" 
                options={FOOD_BRANDS}
                selected={foodBrands}
                onChange={setFoodBrands}
                placeholder="Brands..."
                allowCustom={false}
              />
            </div>

          </div>
        </div>
      </div>
      <div className={`mt-5 sm:mt-4 ${variant === 'modal' ? 'sm:flex sm:flex-row-reverse' : 'flex flex-col gap-2'}`}>
        <button
          type="submit"
          className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-600 text-base font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 sm:text-sm ${variant === 'modal' ? 'sm:ml-3 sm:w-auto' : ''}`}
        >
          {initialValues ? 'Save' : 'Add Pet'}
        </button>
        {variant === 'modal' && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );

  if (variant === 'inline') {
    return <form onSubmit={handleSubmit} className="h-full">{formContent}</form>;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-start justify-center min-h-screen pt-10 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onCancel}></div>
        <span className="hidden sm:inline-block sm:align-top sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-top bg-white rounded-lg text-left shadow-xl transform transition-all sm:my-12 sm:max-w-lg w-full">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg">
             {formContent}
          </form>
        </div>
      </div>
    </div>
  );
};