import React, { useState, useEffect } from 'react';
import { Pet, PetInput, User, AdminItem, PaymentConfig } from './types';
import { PetForm } from './components/PetForm';
import { PetCard } from './components/PetCard';
import { AdminPanel } from './components/AdminPanel';
import { AdvertiseModal } from './components/AdvertiseModal';
import { AuthModal } from './components/AuthModal';
import { calculateNutrition } from './services/ai';

const App: React.FC = () => {
  // State with LocalStorage Persistence
  const [pets, setPets] = useState<Pet[]>(() => {
    const saved = localStorage.getItem('daily_dose_pets');
    return saved ? JSON.parse(saved) : [];
  });

  const [adminItems, setAdminItems] = useState<AdminItem[]>(() => {
    const saved = localStorage.getItem('daily_dose_admin_items');
    return saved ? JSON.parse(saved) : [
      { id: '1', type: 'menu', title: 'Home', linkUrl: '#' },
      { id: '2', type: 'menu', title: 'About Us', linkUrl: '#' },
      { id: '3', type: 'news', title: 'New Organic Brand Alert', content: 'We are now reviewing the top organic brands for 2025. Stay tuned for updates.', date: new Date().toLocaleDateString(), linkUrl: '#' }
    ];
  });

  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>(() => {
    const saved = localStorage.getItem('daily_dose_payment_config');
    return saved ? JSON.parse(saved) : {
      textMonthly: '#',
      textYearly: '#',
      imageMonthly: '#',
      imageYearly: '#',
      bothMonthly: '#',
      bothYearly: '#'
    };
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  
  // Admin & Ad State
  const [showAdvertiseModal, setShowAdvertiseModal] = useState(false);

  // Auth State
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('daily_dose_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [pendingAuthTrigger, setPendingAuthTrigger] = useState(false);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyMissing(true);
    }
  }, []);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('daily_dose_pets', JSON.stringify(pets));
  }, [pets]);

  useEffect(() => {
    localStorage.setItem('daily_dose_admin_items', JSON.stringify(adminItems));
  }, [adminItems]);

  useEffect(() => {
    localStorage.setItem('daily_dose_payment_config', JSON.stringify(paymentConfig));
  }, [paymentConfig]);

  // Show form for new users on start if no pets
  useEffect(() => {
    if (!user && pets.length === 0) {
      // Optional: Auto-open form on fresh load
      // setIsFormOpen(true);
    }
  }, [user, pets.length]);

  const handleRegister = (newUser: User, password: string) => {
    // 1. Get existing users list
    const existingUsersStr = localStorage.getItem('daily_dose_users');
    const existingUsers = existingUsersStr ? JSON.parse(existingUsersStr) : [];

    // 2. Check if email already exists
    if (existingUsers.some((u: any) => u.email === newUser.email)) {
      alert("An account with this email already exists. Please log in.");
      return;
    }

    // 3. Add new user to the "database"
    const userRecord = { ...newUser, password };
    const updatedUsers = [...existingUsers, userRecord];
    localStorage.setItem('daily_dose_users', JSON.stringify(updatedUsers));

    // 4. Set current active session
    setUser(newUser);
    localStorage.setItem('daily_dose_user', JSON.stringify(newUser));
    
    // 5. Cleanup UI
    setShowAuthModal(false);
    setPendingAuthTrigger(false);
    alert(`Account created for ${newUser.name}! Your pets have been saved.`);
  };

  const handleLogin = (email: string, password: string) => {
    // 1. Get existing users list
    const existingUsersStr = localStorage.getItem('daily_dose_users');
    let existingUsers = existingUsersStr ? JSON.parse(existingUsersStr) : [];

    // Migration Check: If no users array, check for legacy single user
    if (existingUsers.length === 0) {
      const legacyCreds = localStorage.getItem('daily_dose_user_creds');
      if (legacyCreds) {
        existingUsers = [JSON.parse(legacyCreds)];
        // Auto-migrate to new system
        localStorage.setItem('daily_dose_users', JSON.stringify(existingUsers));
      }
    }
    
    // 2. Find matching user
    const validUser = existingUsers.find((u: any) => u.email === email && u.password === password);
    
    if (validUser) {
      const loggedInUser = { name: validUser.name, email: validUser.email };
      setUser(loggedInUser);
      localStorage.setItem('daily_dose_user', JSON.stringify(loggedInUser));
      setShowAuthModal(false);
      setPendingAuthTrigger(false);
    } else {
      alert("Invalid email or password. Please try again or create an account.");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('daily_dose_user');
  };

  const checkAuthTrigger = () => {
    if (!user && !pendingAuthTrigger) {
      setTimeout(() => {
        setAuthMode('register');
        setShowAuthModal(true);
        setPendingAuthTrigger(true);
      }, 2000);
    }
  };

  // Admin Handlers
  const handleAddAdminItem = (item: AdminItem) => {
    setAdminItems(prev => [item, ...prev]);
  };

  const handleDeleteAdminItem = (id: string) => {
    setAdminItems(prev => prev.filter(i => i.id !== id));
  };

  const handleReorderAdminItems = (items: AdminItem[]) => {
    setAdminItems(items);
  };

  const handleFormSubmit = async (petInput: Omit<PetInput, 'id'>) => {
    // Limit strictly to 4 pets based on layout request
    if (pets.length >= 4 && !editingPetId) {
      alert("You have reached the dashboard limit of 4 pets.");
      return;
    }

    if (editingPetId) {
      const originalPet = pets.find(p => p.id === editingPetId);
      
      // Check if anything actually changed
      if (originalPet) {
        const hasChanges = 
          originalPet.name !== petInput.name ||
          originalPet.species !== petInput.species ||
          originalPet.breed !== petInput.breed ||
          originalPet.weight !== petInput.weight ||
          originalPet.age !== petInput.age ||
          originalPet.sex !== petInput.sex ||
          originalPet.activityLevel !== petInput.activityLevel ||
          originalPet.foodType !== petInput.foodType ||
          JSON.stringify(originalPet.medicalConditions.sort()) !== JSON.stringify(petInput.medicalConditions.sort()) ||
          JSON.stringify(originalPet.foodBrands.sort()) !== JSON.stringify(petInput.foodBrands.sort()) ||
          originalPet.imageUrl !== petInput.imageUrl;

        if (!hasChanges) {
          setIsFormOpen(false);
          setEditingPetId(null);
          return; 
        }
      }

      // Update existing pet
      setPets(prev => prev.map(p => {
        if (p.id === editingPetId) {
          return { ...p, ...petInput, isLoading: true, error: undefined, result: undefined };
        }
        return p;
      }));
      setIsFormOpen(false);
      setEditingPetId(null);

      // Re-run calc for this pet
      const petToCalc = { ...petInput, id: editingPetId, medicalConditions: petInput.medicalConditions, foodBrands: petInput.foodBrands };
      try {
        const result = await calculateNutrition(petToCalc as PetInput);
         setPets(currentPets => 
          currentPets.map(p => 
            p.id === editingPetId 
              ? { ...p, result, isLoading: false } 
              : p
          )
        );
        checkAuthTrigger();
      } catch (error) {
        setPets(currentPets => 
          currentPets.map(p => 
            p.id === editingPetId 
              ? { ...p, isLoading: false, error: (error as Error).message } 
              : p
          )
        );
      }

    } else {
      // Create new pet
      const newPet: Pet = {
        ...petInput,
        id: crypto.randomUUID(),
        isLoading: true
      };
      
      setPets(prev => [...prev, newPet]);
      setIsFormOpen(false);

      // Trigger AI Calculation
      try {
        const result = await calculateNutrition(newPet);
        setPets(currentPets => 
          currentPets.map(p => 
            p.id === newPet.id 
              ? { ...p, result, isLoading: false } 
              : p
          )
        );
        checkAuthTrigger();
      } catch (error) {
        setPets(currentPets => 
          currentPets.map(p => 
            p.id === newPet.id 
              ? { ...p, isLoading: false, error: (error as Error).message } 
              : p
          )
        );
      }
    }
  };

  const startEditPet = (pet: Pet) => {
    setEditingPetId(pet.id);
    setIsFormOpen(true);
  };

  const cancelForm = () => {
    setIsFormOpen(false);
    setEditingPetId(null);
  }

  const removePet = (id: string) => {
    if(confirm("Are you sure you want to remove this pet?")) {
      setPets(prev => prev.filter(p => p.id !== id));
    }
  };

  const refreshPet = async (pet: Pet) => {
     setPets(currentPets => 
        currentPets.map(p => 
          p.id === pet.id 
            ? { ...p, isLoading: true, error: undefined } 
            : p
        )
      );

      try {
        const result = await calculateNutrition(pet);
        setPets(currentPets => 
          currentPets.map(p => 
            p.id === pet.id 
              ? { ...p, result, isLoading: false } 
              : p
          )
        );
        checkAuthTrigger();
      } catch (error) {
        setPets(currentPets => 
          currentPets.map(p => 
            p.id === pet.id 
              ? { ...p, isLoading: false, error: (error as Error).message } 
              : p
          )
        );
      }
  };

  const petToEdit = editingPetId ? pets.find(p => p.id === editingPetId) : undefined;

  // Render a specific slot (0, 1, 2, 3)
  const renderPetSlot = (index: number) => {
    const pet = pets[index];
    const slotNumber = index + 1;

    if (pet) {
      return (
        <PetCard 
          key={pet.id} 
          pet={pet} 
          onDelete={removePet}
          onRefresh={refreshPet}
          onEdit={startEditPet}
        />
      );
    }

    return (
      <button 
        onClick={() => { setEditingPetId(null); setIsFormOpen(true); }}
        className="w-full h-64 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-all group"
      >
        <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-brand-100 flex items-center justify-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <span className="font-medium">Add Pet {slotNumber}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="w-full px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-brand-500 rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">The Daily Dose</h1>
          </div>
          
          <div className="flex items-center gap-4">
             {user && (
               <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-600 hidden sm:block">
                    Welcome, {user.name}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="text-xs text-slate-400 hover:text-slate-600 underline"
                  >
                    Log Out
                  </button>
               </div>
             )}
             {!user && (
                <button 
                onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                disabled={apiKeyMissing}
              >
                Create Account | Login
              </button>
             )}
          </div>
        </div>
      </header>

      {/* API Key Warning */}
      {apiKeyMissing && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 text-red-700 text-sm font-medium text-center">
            Review Mode: API_KEY is missing. Calculations will not work. Please add it to .env.
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {/* We use a min-width to ensure columns don't collapse on small desktops if the user wants to see all 5 */}
      <main className="flex-grow w-full px-4 py-6 overflow-x-auto">
        <div className="min-w-[1200px] mx-auto">
          
          {/* Column Headers */}
          <div className="grid grid-cols-5 gap-6 mb-4">
             {/* Col 1: Admin */}
             <div className="bg-slate-800 text-white font-bold text-xs uppercase tracking-wider py-2 rounded text-center shadow-md">
               Admin / News
             </div>

             {/* Col 2: Pet 1 */}
             <div className={`font-bold text-xs uppercase tracking-wider py-2 rounded text-center shadow-sm border ${pets[0] ? 'bg-brand-100 text-brand-800 border-brand-200' : 'bg-slate-200 text-slate-600 border-slate-300'}`}>
               {pets[0]?.name || "Pet 1"}
             </div>

             {/* Col 3: Pet 2 */}
             <div className={`font-bold text-xs uppercase tracking-wider py-2 rounded text-center shadow-sm border ${pets[1] ? 'bg-brand-100 text-brand-800 border-brand-200' : 'bg-slate-200 text-slate-600 border-slate-300'}`}>
               {pets[1]?.name || "Pet 2"}
             </div>

             {/* Col 4: Pet 3 */}
             <div className={`font-bold text-xs uppercase tracking-wider py-2 rounded text-center shadow-sm border ${pets[2] ? 'bg-brand-100 text-brand-800 border-brand-200' : 'bg-slate-200 text-slate-600 border-slate-300'}`}>
               {pets[2]?.name || "Pet 3"}
             </div>

             {/* Col 5: Pet 4 */}
             <div className={`font-bold text-xs uppercase tracking-wider py-2 rounded text-center shadow-sm border ${pets[3] ? 'bg-brand-100 text-brand-800 border-brand-200' : 'bg-slate-200 text-slate-600 border-slate-300'}`}>
               {pets[3]?.name || "Pet 4"}
             </div>
          </div>

          {/* 5-Column Grid */}
          <div className="grid grid-cols-5 gap-6 items-start">
            
            {/* Column 1: Admin Panel */}
            <div className="col-span-1">
               <AdminPanel 
                 items={adminItems} 
                 paymentConfig={paymentConfig}
                 onAddItem={handleAddAdminItem} 
                 onDeleteItem={handleDeleteAdminItem} 
                 onReorderItems={handleReorderAdminItems}
                 onUpdatePaymentConfig={setPaymentConfig}
                 onOpenAdvertise={() => setShowAdvertiseModal(true)}
               />
            </div>

            {/* Column 2: Pet 1 Slot */}
            <div className="col-span-1">
              {renderPetSlot(0)}
            </div>

            {/* Column 3: Pet 2 Slot */}
            <div className="col-span-1">
              {renderPetSlot(1)}
            </div>

            {/* Column 4: Pet 3 Slot */}
            <div className="col-span-1">
               {renderPetSlot(2)}
            </div>

            {/* Column 5: Pet 4 Slot */}
            <div className="col-span-1">
               {renderPetSlot(3)}
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
          <p>The Daily Dose uses AI to estimate nutritional needs. Always consult your veterinarian before making significant changes to your pet's diet.</p>
        </div>
      </footer>

      {/* Modal Form - Used for Adding/Editing Pets */}
      {isFormOpen && (
        <PetForm 
          initialValues={petToEdit}
          onSubmit={handleFormSubmit} 
          onCancel={cancelForm}
          variant="modal"
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          mode={authMode}
          onRegister={handleRegister}
          onLogin={handleLogin}
          onSwitchMode={setAuthMode}
          onCancel={() => setShowAuthModal(false)}
        />
      )}

      {/* Advertise Modal */}
      {showAdvertiseModal && (
        <AdvertiseModal 
          paymentConfig={paymentConfig}
          onClose={() => setShowAdvertiseModal(false)}
        />
      )}
    </div>
  );
};

export default App;