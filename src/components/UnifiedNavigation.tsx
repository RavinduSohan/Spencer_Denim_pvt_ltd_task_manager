'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Fragment } from 'react';
import { Menu, Transition, Dialog } from '@headlessui/react';
import { 
  UserCircleIcon, 
  ChevronDownIcon, 
  Cog6ToothIcon,
  BellIcon,
  PlusIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { DatabaseSelector } from './DatabaseSelector';

interface UnifiedNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onNewTask?: () => void;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function UnifiedNavigation({ activeTab, onTabChange, onNewTask }: UnifiedNavigationProps) {
  const { data: session } = useSession();
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  if (!session) return null;

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'tasks', name: 'Tasks', icon: ClipboardDocumentListIcon },
    { id: 'orders', name: 'Orders', icon: DocumentTextIcon },
    { id: 'dynamic-tables', name: 'Dynamic Tables', icon: Cog6ToothIcon },
  ];

  return (
    <>
      {/* Premium Unified Navigation Header */}
      <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 shadow-2xl border-b border-blue-800/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 justify-between items-center">
            {/* Logo and Company Info */}
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">SD</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Spencer Denim Industries</h1>
                <p className="text-sm text-blue-200">Advanced Task Management System</p>
              </div>
            </div>

            {/* Premium Action Buttons */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <button className="p-2.5 text-blue-200 hover:text-white hover:bg-blue-800/50 rounded-xl transition-all duration-200">
                <BellIcon className="h-6 w-6" />
              </button>

              {/* Settings Button */}
              <button 
                onClick={() => setShowSettingsModal(true)}
                className="p-2.5 text-blue-200 hover:text-white hover:bg-blue-800/50 rounded-xl transition-all duration-200"
              >
                <Cog6ToothIcon className="h-6 w-6" />
              </button>

              {/* New Task Button */}
              {onNewTask && (
                <button
                  onClick={onNewTask}
                  className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Task
                </button>
              )}

              {/* User Profile Dropdown */}
              <Menu as="div" className="relative ml-3">
                <div>
                  <Menu.Button className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl text-sm hover:from-slate-600 hover:to-slate-500 transition-all duration-200 shadow-lg">
                    {session.user.image ? (
                      <img
                        className="h-8 w-8 rounded-full ring-2 ring-white/20"
                        src={session.user.image}
                        alt=""
                      />
                    ) : (
                      <UserCircleIcon className="h-8 w-8 text-blue-200" />
                    )}
                    <div className="text-left">
                      <div className="text-white font-medium">{session.user.name}</div>
                      <div className="text-blue-200 text-xs capitalize">{session.user.role}</div>
                    </div>
                    <ChevronDownIcon className="h-4 w-4 text-blue-200" />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-2xl bg-white py-2 shadow-2xl ring-1 ring-black/10 focus:outline-none border border-gray-100">
                    <Menu.Item>
                      {({ active }) => (
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="font-semibold text-gray-900">{session.user.name}</div>
                          <div className="text-sm text-gray-500">{session.user.email}</div>
                          <div className="text-xs text-blue-600 capitalize bg-blue-50 px-2 py-1 rounded-md mt-2 inline-block">
                            {session.user.role}
                          </div>
                        </div>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => signOut()}
                          className={classNames(
                            active ? 'bg-red-50 text-red-600' : 'text-gray-700',
                            'block w-full text-left px-4 py-2 text-sm font-medium'
                          )}
                        >
                          Sign Out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>

          {/* Premium Tab Navigation */}
          <div className="border-t border-blue-800/30 -mb-px">
            <nav className="flex space-x-8 pt-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={classNames(
                    'group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-all duration-200',
                    activeTab === tab.id
                      ? 'border-blue-400 text-white bg-blue-800/30 rounded-t-lg'
                      : 'border-transparent text-blue-200 hover:text-white hover:border-blue-300'
                  )}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Premium Settings Modal */}
      <Transition appear show={showSettingsModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setShowSettingsModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title as="h3" className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                      <Cog6ToothIcon className="h-6 w-6 text-blue-600" />
                      <span>System Settings</span>
                    </Dialog.Title>
                    <button
                      onClick={() => setShowSettingsModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Database Configuration</h4>
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                        <DatabaseSelector className="" />
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <h5 className="font-medium text-gray-900 mb-2">About Database Types</h5>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>PostgreSQL:</strong> Main production database</div>
                        <div><strong>SQLite:</strong> Dynamic tables and local storage</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setShowSettingsModal(false)}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Done
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}