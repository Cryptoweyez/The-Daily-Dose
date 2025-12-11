import React, { useState } from 'react';
import { User } from '../types';

interface AuthModalProps {
  mode: 'login' | 'register';
  onRegister: (user: User, password: string) => void;
  onLogin: (email: string, password: string) => void;
  onCancel: () => void;
  onSwitchMode: (mode: 'login' | 'register') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  mode, 
  onRegister, 
  onLogin, 
  onCancel,
  onSwitchMode 
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const validatePassword = (pwd: string) => {
    // Min 8 chars, 1 uppercase, 1 lowercase, 1 special char, 1 number
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(pwd);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (!name || !email || !password) {
        setError("All fields are required.");
        return;
      }
      if (!validatePassword(password)) {
        setError("Password must be at least 8 characters and include a number, uppercase letter, lowercase letter, and special character.");
        return;
      }
      onRegister({ name, email }, password);
    } else {
      if (!email || !password) {
        setError("Email and password are required.");
        return;
      }
      onLogin(email, password);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onCancel}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-middle bg-white rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:max-w-md w-full">
          <form onSubmit={handleSubmit} className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-brand-100 mb-4">
                <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mode === 'register' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  )}
                </svg>
              </div>
              <h3 className="text-xl leading-6 font-bold text-gray-900" id="modal-title">
                {mode === 'register' ? 'Create Free Account' : 'Welcome Back'}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {mode === 'register' 
                  ? "Save your pet's nutrition profile and get access to more features." 
                  : "Sign in to access your saved pets and settings."}
              </p>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                />
                {mode === 'register' && (
                  <p className="mt-1 text-xs text-gray-500">
                    Min 8 chars, 1 Upper, 1 Lower, 1 Number, 1 Special Char.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-600 text-base font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 sm:text-sm"
              >
                {mode === 'register' ? 'Create Account' : 'Log In'}
              </button>
              
              <div className="text-center">
                 <button
                    type="button"
                    onClick={() => onSwitchMode(mode === 'register' ? 'login' : 'register')}
                    className="text-sm text-brand-600 hover:text-brand-800 font-medium"
                 >
                    {mode === 'register' 
                      ? "Already have an account? Log In" 
                      : "Don't have an account? Create one"}
                 </button>
              </div>

              <button
                type="button"
                onClick={onCancel}
                className="mt-2 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};