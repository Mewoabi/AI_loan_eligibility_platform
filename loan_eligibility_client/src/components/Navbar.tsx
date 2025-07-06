import React, { Fragment, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Disclosure, Menu, Transition, MenuItem, MenuButton, MenuItems, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { UserCircleIcon, SunIcon, MoonIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = isAuthenticated ? [
    { name: 'Dashboard', href: '/dashboard', public: false },
    { name: 'Perform Scoring', href: '/score-user', public: false },
    { name: 'My Scores', href: '/my-scores', public: false },
    { name: 'Score History', href: '/score-history', public: false },
  ] : [
    { name: 'Home', href: '/', public: true },
    { name: 'Quick Score', href: '/quick-score', public: true },
  ];

  // Function to check if the current path matches the navigation item
  const isCurrentPath = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  // ScoreSure brand colors - blue and teal theme
  const brandGradient = 'linear-gradient(to right, rgb(14, 165, 233), rgb(20, 184, 166))';
  const brandGradientHover = 'linear-gradient(to right, rgb(2, 132, 199), rgb(13, 148, 136))';

  return (
    <Disclosure 
      as="nav" 
      className="sticky top-0 z-50 shadow-lg backdrop-blur-md transition-all duration-300"
      style={{
        background: isScrolled 
          ? isDarkMode 
            ? 'rgba(17, 24, 39, 0.9)' 
            : 'rgba(255, 255, 255, 0.9)'
          : isDarkMode 
            ? 'rgba(17, 24, 39, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)'
      }}
    >
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="flex items-center space-x-2">
                    <img 
                      src="/src/assets/scoresure.png" 
                      alt="ScoreSure" 
                      className="h-8 w-8"
                    />
                    <span className="text-xl font-bold bg-gradient-to-r from-sky-500 to-teal-500 bg-clip-text text-transparent">
                      ScoreSure
                    </span>
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map(item => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        ${
                          isCurrentPath(item.href)
                            ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                            : 'border-transparent text-gray-600 dark:text-gray-300 hover:border-teal-400 hover:text-teal-600 dark:hover:text-teal-400'
                        }
                        inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors
                      `}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? (
                    <SunIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  ) : (
                    <MoonIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  )}
                </button>

                {/* Desktop User Menu */}
                {isAuthenticated ? (
                  <div className="hidden sm:block">
                    <Menu as="div" className="ml-3 relative">
                      <div>
                        <MenuButton className="bg-gradient-to-r from-sky-500 to-teal-500 rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 p-1">
                          <span className="sr-only">Open user menu</span>
                          <UserCircleIcon className="h-6 w-6 text-white" />
                        </MenuButton>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <MenuItems className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none">
                          <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                            Welcome, <span className="font-medium">{user?.email}</span>
                          </div>
                          <MenuItem>
                            {({ active }) => (
                              <Link
                                to="/profile"
                                className={`${
                                  active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                } block px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                              >
                                View Profile
                              </Link>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ active }) => (
                              <button
                                onClick={logout}
                                className={`${
                                  active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                              >
                                Sign out
                              </button>
                            )}
                          </MenuItem>
                        </MenuItems>
                      </Transition>
                    </Menu>
                  </div>
                ) : (
                  <div className="hidden sm:flex space-x-4">
                    <Link
                      to="/login"
                      className="text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                      style={{ background: brandGradient }}
                      onMouseEnter={(e) => e.currentTarget.style.background = brandGradientHover}
                      onMouseLeave={(e) => e.currentTarget.style.background = brandGradient}
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      className="text-sky-600 dark:text-sky-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-sky-300 dark:border-sky-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Sign up
                    </Link>
                  </div>
                )}

                {/* Mobile menu button */}
                <div className="sm:hidden">
                  <DisclosureButton className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 transition-colors">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </DisclosureButton>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu panel with smooth sliding animation */}
          <Transition
            as={Fragment}
            enter="transition ease-out duration-300"
            enterFrom="transform -translate-y-full opacity-0"
            enterTo="transform translate-y-0 opacity-100"
            leave="transition ease-in duration-200"
            leaveFrom="transform translate-y-0 opacity-100"
            leaveTo="transform -translate-y-full opacity-0"
          >
            <DisclosurePanel className="sm:hidden overflow-hidden">
              <div className="pt-2 pb-3 space-y-1 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
                {navigation.map((item, index) => (
                  <div
                    key={item.name}
                    className="transform transition-all duration-300 ease-out"
                    style={{
                      transitionDelay: `${index * 50}ms`
                    }}
                  >
                    <DisclosureButton
                      as={Link}
                      to={item.href}
                      className={`
                        ${
                          isCurrentPath(item.href)
                            ? 'bg-sky-50 dark:bg-sky-900/50 border-sky-500 text-sky-700 dark:text-sky-300'
                            : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-800 dark:hover:text-gray-200'
                        }
                        block pl-3 pr-4 py-3 border-l-4 text-base font-medium transition-all duration-200 hover:scale-[1.02] hover:translate-x-1
                      `}
                    >
                      {item.name}
                    </DisclosureButton>
                  </div>
                ))}
              </div>

              {/* Mobile user section with staggered animation */}
              {isAuthenticated ? (
                <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div 
                    className="flex items-center px-4 transform transition-all duration-300 ease-out"
                    style={{ transitionDelay: '200ms' }}
                  >
                    <div className="flex-shrink-0">
                      <div className="bg-gradient-to-r from-sky-500 to-teal-500 rounded-full p-1 transition-transform duration-300 hover:scale-110">
                        <UserCircleIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <div
                      className="transform transition-all duration-300 ease-out"
                      style={{ transitionDelay: '250ms' }}
                    >
                      <DisclosureButton
                        as={Link}
                        to="/profile"
                        className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:translate-x-1"
                      >
                        View Profile
                      </DisclosureButton>
                    </div>
                    <div
                      className="transform transition-all duration-300 ease-out"
                      style={{ transitionDelay: '300ms' }}
                    >
                      <DisclosureButton
                        as="button"
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:translate-x-1"
                      >
                        Sign out
                      </DisclosureButton>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="space-y-3 px-4">
                    <div
                      className="transform transition-all duration-300 ease-out"
                      style={{ transitionDelay: '200ms' }}
                    >
                      <DisclosureButton
                        as={Link}
                        to="/login"
                        className="block w-full text-center text-white px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
                        style={{ background: brandGradient }}
                      >
                        Log in
                      </DisclosureButton>
                    </div>
                    <div
                      className="transform transition-all duration-300 ease-out"
                      style={{ transitionDelay: '250ms' }}
                    >
                      <DisclosureButton
                        as={Link}
                        to="/register"
                        className="block w-full text-center text-sky-600 dark:text-sky-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-sky-300 dark:border-sky-600 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
                      >
                        Sign up
                      </DisclosureButton>
                    </div>
                  </div>
                </div>
              )}
            </DisclosurePanel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;