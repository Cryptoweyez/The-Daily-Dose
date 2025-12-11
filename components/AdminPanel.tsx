import React, { useState, useRef } from 'react';
import { AdminItem, AdminItemType, PaymentConfig } from '../types';

interface AdminPanelProps {
  items: AdminItem[];
  paymentConfig: PaymentConfig;
  onAddItem: (item: AdminItem) => void;
  onDeleteItem: (id: string) => void;
  onReorderItems: (items: AdminItem[]) => void;
  onUpdatePaymentConfig: (config: PaymentConfig) => void;
  onOpenAdvertise: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  items, 
  paymentConfig, 
  onAddItem, 
  onDeleteItem, 
  onReorderItems,
  onUpdatePaymentConfig,
  onOpenAdvertise
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<AdminItemType | 'view'>('view');
  
  // Settings State
  const [tempPaymentConfig, setTempPaymentConfig] = useState<PaymentConfig>(paymentConfig);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [bgColor, setBgColor] = useState('#FEF3C7'); // Default yellow-100
  const [txtColor, setTxtColor] = useState('#78350F'); // Default yellow-900

  // Drag and Drop State
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Mia') {
      setIsAuthenticated(true);
      setShowLogin(false);
    } else {
      alert('Incorrect passphrase');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setShowSettings(false);
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setImageUrl('');
    setLinkUrl('');
    setBgColor('#FEF3C7');
    setTxtColor('#78350F');
    setActiveTab('view');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'view') return;

    const newItem: AdminItem = {
      id: crypto.randomUUID(),
      type: activeTab,
      title,
      content,
      imageUrl,
      linkUrl,
      backgroundColor: activeTab === 'ad-text' ? bgColor : undefined,
      textColor: activeTab === 'ad-text' ? txtColor : undefined,
      date: new Date().toLocaleDateString()
    };

    onAddItem(newItem);
    resetForm();
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePaymentConfig(tempPaymentConfig);
    setShowSettings(false);
    alert('Payment links updated.');
  };

  const handleAddPage = () => {
    const pageName = prompt("Enter Page Name:");
    if (pageName) {
      onAddItem({
        id: crypto.randomUUID(),
        type: 'menu',
        title: pageName,
        linkUrl: '#'
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isAuthenticated) return;
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || !isAuthenticated) return;

    const newItems = [...items];
    const itemToMove = newItems[draggedItemIndex];
    newItems.splice(draggedItemIndex, 1);
    newItems.splice(index, 0, itemToMove);

    onReorderItems(newItems);
    setDraggedItemIndex(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col h-full min-h-[600px] relative">
      <div className="bg-slate-800 p-3 flex justify-between items-center">
        <span className="text-white font-bold text-sm">News & Info</span>
        {isAuthenticated ? (
          <div className="flex gap-2">
             <button onClick={() => setShowSettings(!showSettings)} className="text-xs text-brand-300 hover:text-white underline">Settings</button>
             <button onClick={handleLogout} className="text-xs text-slate-300 hover:text-white">Logout</button>
          </div>
        ) : (
          <button onClick={() => setShowLogin(!showLogin)} className="text-[10px] text-slate-500 hover:text-slate-300">Admin</button>
        )}
      </div>

      {/* Login Overlay */}
      {showLogin && !isAuthenticated && (
        <div className="absolute inset-0 z-50 bg-white/95 flex flex-col items-center justify-center p-6">
           <h3 className="text-lg font-bold text-slate-800 mb-4">Master Admin</h3>
           <form onSubmit={handleLogin} className="w-full max-w-xs space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Passphrase"
              className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-slate-800 text-white py-2 rounded text-sm hover:bg-slate-700">Login</button>
              <button type="button" onClick={() => setShowLogin(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded text-sm hover:bg-gray-300">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Payment Settings Overlay */}
      {showSettings && isAuthenticated && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col p-4 overflow-y-auto">
           <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase border-b pb-2">Payment Links Configuration</h3>
           <form onSubmit={handleSaveSettings} className="space-y-3 flex-grow">
              <div className="grid grid-cols-1 gap-3">
                 <div>
                   <label className="text-xs font-bold text-gray-500 block mb-1">Text Ad (Monthly)</label>
                   <input className="w-full text-xs p-2 border rounded" value={tempPaymentConfig.textMonthly} onChange={e => setTempPaymentConfig({...tempPaymentConfig, textMonthly: e.target.value})} placeholder="https://paypal.com/..." />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-gray-500 block mb-1">Text Ad (Yearly)</label>
                   <input className="w-full text-xs p-2 border rounded" value={tempPaymentConfig.textYearly} onChange={e => setTempPaymentConfig({...tempPaymentConfig, textYearly: e.target.value})} placeholder="https://paypal.com/..." />
                 </div>
                 <hr className="border-slate-100 my-1"/>
                 <div>
                   <label className="text-xs font-bold text-gray-500 block mb-1">Image Ad (Monthly)</label>
                   <input className="w-full text-xs p-2 border rounded" value={tempPaymentConfig.imageMonthly} onChange={e => setTempPaymentConfig({...tempPaymentConfig, imageMonthly: e.target.value})} placeholder="https://paypal.com/..." />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-gray-500 block mb-1">Image Ad (Yearly)</label>
                   <input className="w-full text-xs p-2 border rounded" value={tempPaymentConfig.imageYearly} onChange={e => setTempPaymentConfig({...tempPaymentConfig, imageYearly: e.target.value})} placeholder="https://paypal.com/..." />
                 </div>
                 <hr className="border-slate-100 my-1"/>
                 <div>
                   <label className="text-xs font-bold text-gray-500 block mb-1">Both (Monthly)</label>
                   <input className="w-full text-xs p-2 border rounded" value={tempPaymentConfig.bothMonthly} onChange={e => setTempPaymentConfig({...tempPaymentConfig, bothMonthly: e.target.value})} placeholder="https://paypal.com/..." />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-gray-500 block mb-1">Both (Yearly)</label>
                   <input className="w-full text-xs p-2 border rounded" value={tempPaymentConfig.bothYearly} onChange={e => setTempPaymentConfig({...tempPaymentConfig, bothYearly: e.target.value})} placeholder="https://paypal.com/..." />
                 </div>
              </div>
              <div className="flex gap-2 pt-4 mt-auto">
                 <button type="submit" className="flex-1 bg-brand-600 text-white py-2 rounded text-xs font-bold">Save URLs</button>
                 <button type="button" onClick={() => setShowSettings(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded text-xs font-bold">Cancel</button>
              </div>
           </form>
        </div>
      )}

      {/* Admin Actions (Visible only when auth) */}
      {isAuthenticated && (
        <div className="p-2 bg-slate-100 border-b border-slate-200 grid grid-cols-2 gap-2">
          <button onClick={() => setActiveTab('ad-image')} className={`text-xs p-1 rounded ${activeTab === 'ad-image' ? 'bg-brand-500 text-white' : 'bg-white shadow-sm'}`}>+ Img Ad</button>
          <button onClick={() => setActiveTab('ad-text')} className={`text-xs p-1 rounded ${activeTab === 'ad-text' ? 'bg-brand-500 text-white' : 'bg-white shadow-sm'}`}>+ Text Ad</button>
          <button onClick={() => setActiveTab('news')} className={`text-xs p-1 rounded ${activeTab === 'news' ? 'bg-brand-500 text-white' : 'bg-white shadow-sm'}`}>+ News</button>
          <button onClick={() => setActiveTab('menu')} className={`text-xs p-1 rounded ${activeTab === 'menu' ? 'bg-brand-500 text-white' : 'bg-white shadow-sm'}`}>+ Nav Link</button>
          <button onClick={handleAddPage} className="col-span-2 text-xs p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 font-bold shadow-sm">+ Add a Page</button>
        </div>
      )}

      {/* Input Area (Visible only when auth and adding) */}
      {isAuthenticated && activeTab !== 'view' && (
        <div className="p-4 border-b border-slate-200 bg-slate-50 overflow-y-auto max-h-96">
           <form onSubmit={handleSubmit} className="space-y-3">
             <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase text-slate-500">New: {activeTab}</h4>
                <button type="button" onClick={resetForm} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
             </div>
             
             {(activeTab === 'news' || activeTab === 'menu' || activeTab === 'ad-text') && (
               <input 
                 className="w-full text-xs p-2 border rounded shadow-sm" 
                 placeholder={activeTab === 'menu' ? "Link Label" : "Title / Headline"} 
                 value={title} 
                 onChange={e => setTitle(e.target.value)} 
                 required
               />
             )}
             
             {(activeTab === 'news' || activeTab === 'ad-text') && (
                <textarea 
                  className="w-full text-xs p-2 border rounded shadow-sm" 
                  placeholder="Body Text" 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  rows={3}
                />
             )}

             {/* Image Upload */}
             {(activeTab === 'ad-image') && (
               <div className="space-y-2">
                 <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        {imageUrl ? (
                          <img src={imageUrl} alt="Preview" className="h-full w-full object-contain p-2" />
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                            <p className="text-xs text-gray-500">Click to upload image</p>
                          </div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} required={!imageUrl} />
                    </label>
                 </div>
                 {imageUrl && <button type="button" onClick={() => { setImageUrl(''); if(fileInputRef.current) fileInputRef.current.value=''; }} className="text-xs text-red-500 underline w-full text-center">Remove Image</button>}
               </div>
             )}

            {/* Colors for Text Ads */}
            {activeTab === 'ad-text' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                   <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Background</label>
                   <div className="flex items-center gap-2">
                      <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="h-8 w-8 rounded border p-0 overflow-hidden cursor-pointer" />
                   </div>
                </div>
                <div>
                   <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Text Color</label>
                   <div className="flex items-center gap-2">
                      <input type="color" value={txtColor} onChange={e => setTxtColor(e.target.value)} className="h-8 w-8 rounded border p-0 overflow-hidden cursor-pointer" />
                   </div>
                </div>
              </div>
            )}

            {(activeTab !== 'menu') && (
              <input 
                  className="w-full text-xs p-2 border rounded shadow-sm" 
                  placeholder="Link URL (e.g. https://google.com)" 
                  value={linkUrl} 
                  onChange={e => setLinkUrl(e.target.value)} 
                />
            )}

             <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-brand-600 text-white text-xs py-2 rounded shadow-sm hover:bg-brand-700">Add Item</button>
                <button type="button" onClick={resetForm} className="flex-1 bg-white border border-slate-300 text-slate-700 text-xs py-2 rounded shadow-sm hover:bg-slate-50">Cancel</button>
             </div>
           </form>
        </div>
      )}

      {/* Content Display Area (Feed) */}
      <div className="flex-grow p-4 overflow-y-auto bg-slate-50 relative">
        {items.length === 0 && (
          <div className="text-center text-slate-400 text-xs py-10">
            No news or ads yet.
          </div>
        )}
        
        <div className="space-y-5 pb-48">
            {/* Render Items */}
            {items.map((item, index) => (
              <div 
                key={item.id} 
                className={`relative group transition-all duration-200 ${draggedItemIndex === index ? 'opacity-40 scale-95' : ''}`}
                draggable={isAuthenticated}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
              >
                {/* Admin Overlay Controls */}
                {isAuthenticated && (
                  <>
                    <div className="absolute left-1/2 -top-2 transform -translate-x-1/2 bg-slate-200 h-1 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-move z-20"></div>
                    <button 
                      onClick={() => onDeleteItem(item.id)} 
                      className="absolute -top-2 -right-2 bg-white rounded-full w-6 h-6 flex items-center justify-center text-red-500 shadow-md opacity-0 group-hover:opacity-100 z-30 font-bold leading-none hover:bg-red-50 border border-slate-200"
                      title="Delete"
                    >
                      &times;
                    </button>
                  </>
                )}
                
                {/* Menu Item */}
                {item.type === 'menu' && (
                   <div className="bg-white p-3 rounded shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                      <a href={item.linkUrl} className="block text-sm font-bold text-brand-700 hover:underline">{item.title}</a>
                   </div>
                )}

                {/* Image Ad */}
                {item.type === 'ad-image' && item.imageUrl && (
                  <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <a href={item.linkUrl || '#'} target="_blank" rel="noopener noreferrer" className="block hover:opacity-90 transition-opacity">
                      <img src={item.imageUrl} alt="Ad" className="w-full h-auto object-cover" />
                    </a>
                  </div>
                )}

                {/* Text Ad */}
                {item.type === 'ad-text' && (
                  <a 
                    href={item.linkUrl || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block p-5 rounded shadow-sm border border-transparent hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                    style={{ backgroundColor: item.backgroundColor || '#FEF3C7' }}
                  >
                    {item.title && (
                      <h4 
                        className="font-black text-lg mb-2 leading-tight" 
                        style={{ color: item.textColor || '#78350F' }}
                      >
                        {item.title}
                      </h4>
                    )}
                    <p 
                      className="text-sm font-medium leading-relaxed" 
                      style={{ color: item.textColor ? item.textColor : '#92400E' }}
                    >
                      {item.content}
                    </p>
                    {item.linkUrl && (
                      <span className="text-[10px] uppercase font-bold mt-3 block opacity-80" style={{ color: item.textColor || '#78350F' }}>
                        Open Link &rarr;
                      </span>
                    )}
                  </a>
                )}

                {/* News Item */}
                {item.type === 'news' && (
                   <div className="bg-white p-4 border border-slate-200 rounded shadow-sm hover:shadow-md transition-shadow">
                     <div className="flex justify-between items-baseline mb-2">
                       <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wide">News</span>
                       <span className="text-[10px] text-slate-400">{item.date}</span>
                     </div>
                     <h4 className="font-bold text-base text-slate-800 leading-snug mb-2">{item.title}</h4>
                     <p className="text-sm text-slate-600 leading-relaxed mb-3">{item.content}</p>
                     {item.linkUrl && (
                       <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-brand-500 hover:text-brand-700 hover:underline inline-block">
                         Read full story &rarr;
                       </a>
                     )}
                   </div>
                )}
              </div>
            ))}
        </div>

        {/* Advertise Here Footer Link */}
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-50 to-transparent text-center">
            <video 
              src="/cat-walking.mp4" 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-auto max-h-28 object-contain mx-auto mb-2 mix-blend-multiply opacity-90"
            />
            <button 
              onClick={onOpenAdvertise}
              className="text-xs font-bold text-brand-400 hover:text-brand-600 uppercase tracking-widest hover:underline transition-all"
            >
              Advertise Here
            </button>
        </div>
      </div>
    </div>
  );
};