'use client';

import { useOpenfort } from '@openfort/react';
import React from 'react'

export const LogoutButton = () => {

    const { user, logout } = useOpenfort();
  return (
    <button 
    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors"
    onClick={() => {
        logout();
    }}>
        Logout
    </button>
  )
}