import React, { useState, useRef } from 'react';
import { PaymentConfig } from '../types';

interface AdvertiseModalProps {
  onClose: () => void;
  paymentConfig: PaymentConfig;
}

type PlanType = 'text' | 'image' | 'both';
type BillingCycle = 'monthly' | 'yearly';

export const AdvertiseModal: React.FC<AdvertiseModalProps> = ({ onClose, paymentConfig }) => {
  const [plan, setPlan] = useState<PlanType>('text');
  const [billing, setBilling] = useState<BillingCycle>('monthly');
  
  // Ad Content State
  const [adText, setAdText] = useState('');
  const [adTitle, setAdTitle] = useState('');
  const [bgColor, setBgColor] = useState('#FEF3C7');
  const [txtColor, setTxtColor] = useState('#78350F');
  const [imageUrl, setImageUrl] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const getPrice = () => {
    if (plan === 'text') return billing === 'monthly' ? 25 : 255;
    if (plan === 'image') return billing === 'monthly' ? 45 : 459;
    return billing === 'monthly' ? 65 : 663;
  };

  const getSavings = () => {
    if (billing === 'monthly') return 0;
    const monthlyPrice = plan === 'text' ? 25 : plan === 'image' ? 45 : 65;
    const yearlyPrice = getPrice();
    return (monthlyPrice * 12) - yearlyPrice;
  };

  const getPaymentUrl = () => {
    if (plan === 'text') return billing === 'monthly' ? paymentConfig.textMonthly : paymentConfig.textYearly;
    if (plan === 'image') return billing === 'monthly' ? paymentConfig.imageMonthly : paymentConfig.imageYearly;
    return billing === 'monthly' ? paymentConfig.bothMonthly : paymentConfig.bothYearly;
  };

  const handlePayment = () => {
    const url = getPaymentUrl();
    if (!url || url === '#') {
      alert("Payment link not configured by admin yet. Please contact support.");
      return;
    }
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-xl text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-600 to-brand-800 px-6 py-4 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white">Advertise with Us</h3>
              <span className="inline-block bg-green-400 text-green-900 text-xs font-bold px-2 py-0.5 rounded mt-1">
                Free for 1st 60 Days
              </span>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-6 py-4">
            <p className="text-sm text-gray-500 mb-6">
              Reach thousands of pet owners daily. Pricing starts after your 60-day free trial. Cancel anytime.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column: Plans */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">1. Choose Plan</h4>
                  <div className="space-y-3">
                    <label className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${plan === 'text' ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-gray-200 hover:border-brand-300'}`}>
                      <div className="flex items-center">
                        <input type="radio" name="plan" className="h-4 w-4 text-brand-600 focus:ring-brand-500" checked={plan === 'text'} onChange={() => setPlan('text')} />
                        <span className="ml-3 font-medium text-gray-900">Text Ad</span>
                      </div>
                      <span className="text-sm text-gray-500">$25/mo</span>
                    </label>

                    <label className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${plan === 'image' ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-gray-200 hover:border-brand-300'}`}>
                      <div className="flex items-center">
                        <input type="radio" name="plan" className="h-4 w-4 text-brand-600 focus:ring-brand-500" checked={plan === 'image'} onChange={() => setPlan('image')} />
                        <span className="ml-3 font-medium text-gray-900">Image Ad</span>
                      </div>
                      <span className="text-sm text-gray-500">$45/mo</span>
                    </label>

                    <label className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${plan === 'both' ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-gray-200 hover:border-brand-300'}`}>
                      <div className="flex items-center">
                        <input type="radio" name="plan" className="h-4 w-4 text-brand-600 focus:ring-brand-500" checked={plan === 'both'} onChange={() => setPlan('both')} />
                        <span className="ml-3 font-medium text-gray-900">Both</span>
                      </div>
                      <span className="text-sm text-gray-500">$65/mo</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-3">2. Billing Cycle</h4>
                  <div className="flex rounded-md shadow-sm" role="group">
                    <button
                      type="button"
                      onClick={() => setBilling('monthly')}
                      className={`flex-1 px-4 py-2 text-sm font-medium border rounded-l-lg ${billing === 'monthly' ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setBilling('yearly')}
                      className={`flex-1 px-4 py-2 text-sm font-medium border rounded-r-lg ${billing === 'yearly' ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    >
                      Yearly <span className="text-xs ml-1 opacity-80">(Save 15%)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Preview & Create */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col h-full">
                <h4 className="font-bold text-gray-900 mb-3">3. Create Ad</h4>
                
                <div className="flex-grow space-y-4 overflow-y-auto max-h-[300px] pr-1">
                  {(plan === 'text' || plan === 'both') && (
                    <div className="space-y-3 p-3 bg-white rounded border border-gray-200 shadow-sm">
                      <p className="text-xs font-bold text-gray-400 uppercase">Text Ad Content</p>
                      <input 
                        type="text" 
                        placeholder="Ad Headline" 
                        className="w-full text-sm p-2 border rounded" 
                        value={adTitle}
                        onChange={(e) => setAdTitle(e.target.value)}
                      />
                      <textarea 
                        placeholder="Ad Body Text" 
                        className="w-full text-sm p-2 border rounded" 
                        rows={3}
                        value={adText}
                        onChange={(e) => setAdText(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <div>
                          <label className="text-[10px] text-gray-500 block">Bg Color</label>
                          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-6 w-8 p-0 border rounded cursor-pointer" />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 block">Text Color</label>
                          <input type="color" value={txtColor} onChange={(e) => setTxtColor(e.target.value)} className="h-6 w-8 p-0 border rounded cursor-pointer" />
                        </div>
                      </div>
                    </div>
                  )}

                  {(plan === 'image' || plan === 'both') && (
                    <div className="space-y-3 p-3 bg-white rounded border border-gray-200 shadow-sm">
                      <p className="text-xs font-bold text-gray-400 uppercase">Image Ad Upload</p>
                      <div className="text-xs text-gray-500 mb-1">Recommended: 300x250px or 600x600px</div>
                       <input 
                        type="file" 
                        ref={fileInputRef}
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                      />
                      {imageUrl && <img src={imageUrl} alt="Preview" className="w-full h-32 object-contain bg-gray-100 rounded" />}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Due Today</p>
                      <p className="text-2xl font-bold text-gray-900">$0.00</p>
                    </div>
                    <div className="text-right">
                       <p className="text-xs text-gray-500">Recurring after 60 days</p>
                       <p className="text-lg font-bold text-brand-700">${getPrice().toFixed(2)}/{billing === 'monthly' ? 'mo' : 'yr'}</p>
                       {billing === 'yearly' && <p className="text-xs text-green-600 font-bold">You save ${getSavings().toFixed(2)}/yr!</p>}
                    </div>
                  </div>
                  
                  <button 
                    onClick={handlePayment}
                    className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <span className="mr-2">Setup on PayPal</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M20.067 8.169c-.276-2.924-2.222-4.996-5.46-4.996h-6.19c-.432 0-.806.294-.925.71L5.19 19.508c-.035.124.059.248.188.248h3.337c.432 0 .806-.294.925-.71l.66-2.316c.119-.416.493-.71.925-.71h2.246c4.28 0 6.941-2.094 7.62-6.526.152-.988.16-1.89.043-2.646l-.067-.375z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <p className="text-[10px] text-center text-gray-400 mt-2">
                    Secure payment processed by PayPal. Redirects in new tab.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};