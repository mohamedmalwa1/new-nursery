import { Transition, Dialog } from "@headlessui/react";
import React, { Fragment } from "react";

export default function Drawer({ open, onClose, children, title }) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" onClose={onClose} className="fixed inset-0 z-50 overflow-hidden">
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
            <Dialog.Panel className="absolute right-0 top-0 h-full w-screen max-w-md bg-white dark:bg-gray-900 shadow-xl p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
                <button onClick={onClose} className="text-2xl leading-none">&times;</button>
              </div>
              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

