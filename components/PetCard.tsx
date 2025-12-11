import React, { useState, useEffect } from 'react';
import { Pet, ProductRecommendation } from '../types';

interface PetCardProps {
  pet: Pet;
  onDelete: (id: string) => void;
  onRefresh: (pet: Pet) => void;
  onEdit: (pet: Pet) => void;
}

const CatLoadingAnimation = () => {
  const [progress, setProgress] = useState(0);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    setProgress(0);
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        // Slow down as we get closer to 99%
        if (prev >= 99) return 99;
        const remaining = 100 - prev;
        const increment = Math.max(1, Math.floor(Math.random() * (remaining > 20 ? 5 : 2)));
        return Math.min(99, prev + increment);
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-8 h-full">
      <div className="relative w-28 h-20 mb-3 flex items-center justify-center">
        {!showFallback ? (
           <video 
             src="/loader.mp4" 
             className="w-full h-full object-contain"
             autoPlay 
             loop 
             muted 
             playsInline
             onError={() => setShowFallback(true)}
           />
        ) : (
          <div className="relative w-16 h-16">
            <svg 
              viewBox="0 0 100 100" 
              className="w-full h-full animate-spin text-brand-500 fill-current" 
              style={{ animationDuration: '2s' }}
            >
              <path d="M50 10 C 27.9 10 10 27.9 10 50 C 10 72.1 27.9 90 50 90 C 72.1 90 90 72.1 90 50 C 90 38.9 85.5 28.9 78.2 21.8 L 72.5 27.5 C 77.1 33.3 80 41.3 80 50 C 80 66.6 66.6 80 50 80 C 33.4 80 20 66.6 20 50 C 20 33.4 33.4 20 50 20 C 58.7 20 66.6 23.9 72 30 L 78 24 C 71 15.5 61 10 50 10 Z" />
              <circle cx="50" cy="15" r="5" />
            </svg>
          </div>
        )}
      </div>
      
      <div className="flex flex-col items-center">
        <div className="flex items-baseline gap-0.5">
           <span className="text-4xl font-black text-brand-600 tabular-nums tracking-tighter">{progress}</span>
           <span className="text-xl font-bold text-brand-400">%</span>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 animate-pulse">Analyzing</p>
      </div>
    </div>
  );
};

const RecommendationList: React.FC<{ items: ProductRecommendation[]; species: string }> = ({ items, species }) => {
  if (items.length === 0) {
     return <div className="p-4 text-sm text-slate-500 italic text-center">No recommendations in this category.</div>
  }
  return (
    <ul className="space-y-3 p-3">
      {items.map((rec, idx) => (
        <li key={idx} className="text-sm border-b border-slate-100 last:border-0 pb-2 last:pb-0">
          <div className="flex justify-between items-start gap-2">
            <span className="font-semibold text-slate-800">{rec.name}</span>
            <a 
              href={`https://www.google.com/search?tbm=shop&q=${encodeURIComponent(rec.name + ' for ' + species)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand-600 hover:text-brand-800 whitespace-nowrap bg-brand-50 px-2 py-0.5 rounded border border-brand-100"
            >
              Buy / Prices &rarr;
            </a>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{rec.reason}</p>
        </li>
      ))}
    </ul>
  );
}

export const PetCard: React.FC<PetCardProps> = ({ pet, onDelete, onRefresh, onEdit }) => {
  const [activeTab, setActiveTab] = useState<'wet' | 'dry'>('wet');
  const isDog = pet.species === 'Dog';
  const displayTitle = pet.name.trim() ? pet.name : `Pet`;

  // Determine which tab to show initially if one is empty
  React.useEffect(() => {
    if (pet.result) {
      if (pet.result.recommendations.wet.length === 0 && pet.result.recommendations.dry.length > 0) {
        setActiveTab('dry');
      } else if (pet.result.recommendations.wet.length > 0 && pet.result.recommendations.dry.length === 0) {
        setActiveTab('wet');
      } else {
        // Default to preference if both exist
        if (pet.foodType === 'Dry') setActiveTab('dry');
        else setActiveTab('wet');
      }
    }
  }, [pet.result, pet.foodType]);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 transition-all hover:shadow-lg flex flex-col h-full">
      {pet.imageUrl ? (
        <div className="h-40 w-full overflow-hidden relative">
          <img src={pet.imageUrl} alt={displayTitle} className="w-full h-full object-cover" />
          <div className={`absolute bottom-0 left-0 right-0 h-2 ${isDog ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
        </div>
      ) : (
        <div className={`h-2 ${isDog ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
      )}
      
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-800">{displayTitle}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isDog ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                {pet.species}
              </span>
            </div>
            <p className="text-sm text-slate-500">{pet.breed} • {pet.sex} • {pet.weight} lbs</p>
          </div>
          <button 
            onClick={() => onDelete(pet.id)}
            className="text-slate-400 hover:text-red-500 transition-colors"
            title="Remove Pet"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Health Issues</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {pet.medicalConditions.length > 0 ? (
                pet.medicalConditions.map(c => (
                  <span key={c} className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-xs">{c}</span>
                ))
              ) : (
                <span className="text-slate-600">None</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Food Prefs</p>
            <p className="text-slate-700 mt-1">
              {pet.foodType} food
              {pet.foodBrands.length > 0 && pet.foodBrands[0] !== "Generic / No Preference" && (
                <span className="block text-slate-500 text-xs truncate">
                  Brands: {pet.foodBrands.join(', ')}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 flex-grow flex flex-col">
          {pet.isLoading ? (
            <CatLoadingAnimation />
          ) : pet.error ? (
             <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
               <p className="font-bold">Calculation Failed</p>
               <p>{pet.error}</p>
               <button 
                 onClick={() => onRefresh(pet)}
                 className="mt-2 text-red-800 underline hover:text-red-900"
               >
                 Try Again
               </button>
             </div>
          ) : pet.result ? (
            <div className="space-y-4 flex-grow">
              <div className="flex items-center justify-between bg-brand-50 p-3 rounded-lg">
                <div>
                  <p className="text-xs text-brand-600 font-bold uppercase tracking-wider">Recommended Calories</p>
                  <p className="text-2xl font-bold text-brand-900">{pet.result.dailyCalories} <span className="text-sm font-normal text-brand-700">kcal/day</span></p>
                </div>
                <div className="text-right flex gap-2">
                   <button onClick={() => onEdit(pet)} className="text-xs bg-white border border-brand-200 text-brand-700 px-2 py-1 rounded hover:bg-brand-50 transition-colors">Edit</button>
                   <button onClick={() => onRefresh(pet)} className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded hover:bg-brand-200 transition-colors">Recalculate</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">Wet Food <span className="font-normal lowercase">(Per Day)</span></p>
                  <p className="font-medium text-slate-800">{pet.result.wetFoodAmount}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">Dry Food <span className="font-normal lowercase">(Per Day)</span></p>
                  <p className="font-medium text-slate-800">{pet.result.dryFoodAmount}</p>
                </div>
              </div>

               {/* Recommended Products Tab View */}
               {pet.result.recommendations && (
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <div className="flex border-b border-slate-200 bg-slate-50">
                     <button
                       className={`flex-1 py-2 text-sm font-medium ${activeTab === 'wet' ? 'bg-white text-brand-600 border-b-2 border-brand-500' : 'text-slate-500 hover:text-slate-700'}`}
                       onClick={() => setActiveTab('wet')}
                     >
                       Wet Recommendations
                     </button>
                     <button
                       className={`flex-1 py-2 text-sm font-medium ${activeTab === 'dry' ? 'bg-white text-brand-600 border-b-2 border-brand-500' : 'text-slate-500 hover:text-slate-700'}`}
                       onClick={() => setActiveTab('dry')}
                     >
                       Dry Recommendations
                     </button>
                  </div>
                  <div className="bg-white">
                    {activeTab === 'wet' && (
                       <RecommendationList items={pet.result.recommendations.wet} species={pet.species} />
                    )}
                    {activeTab === 'dry' && (
                       <RecommendationList items={pet.result.recommendations.dry} species={pet.species} />
                    )}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1">Why this plan?</p>
                <p className="text-sm text-slate-600 leading-relaxed">{pet.result.summary}</p>
              </div>

              {(pet.result.advice && pet.result.advice !== "None") && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-md">
                   <p className="text-xs text-amber-800 font-bold uppercase mb-1">Vet Nutrition Advice</p>
                   <p className="text-sm text-amber-900 italic">"{pet.result.advice}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <button 
                onClick={() => onRefresh(pet)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
              >
                Calculate Plan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};