// src/components/Drawer.jsx
import { Transition, Dialog } from "@headlessui/react";
import React, { Fragment, useEffect } from "react";

export default function Drawer({ open, onClose, children, title, width = "50%" }) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [open]);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog 
        as="div" 
        className="fixed inset-0 z-50 overflow-hidden"
        onClose={onClose}
        static
      >
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            aria-hidden={!open}
          />
        </Transition.Child>
        
        <div className="absolute inset-0 overflow-hidden">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in-out duration-300"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel 
              className="absolute right-0 top-0 h-full bg-white shadow-xl p-6 overflow-y-auto"
              style={{ width }}
            >
              <div className="flex justify-between items-center mb-4">
                <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
                <button 
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label="Close drawer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
