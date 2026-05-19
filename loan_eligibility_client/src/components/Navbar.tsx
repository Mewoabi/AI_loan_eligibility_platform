import React, { Fragment, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Disclosure,
  Menu,
  Transition,
  MenuItem,
  MenuButton,
  MenuItems,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import {
  UserCircleIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = isAuthenticated
    ? [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Perform Scoring', href: '/score-user' },
        { name: 'My Scores', href: '/my-scores' },
        { name: 'Score History', href: '/score-history' },
      ]
    : [
        { name: 'Home', href: '/' },
        { name: 'Quick Score', href: '/quick-score' },
      ];

  const isCurrentPath = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const navLinkClass = (href: string) =>
    cn(
      'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors',
      isCurrentPath(href)
        ? 'border-sky-500 text-sky-600 dark:text-sky-400'
        : 'border-transparent text-gray-600 dark:text-gray-300 hover:border-teal-400 hover:text-teal-600 dark:hover:text-teal-400'
    );

  return (
    <Disclosure
      as="nav"
      className={cn(
        'sticky top-0 z-50 border-b backdrop-blur-xl transition-all duration-300',
        isScrolled
          ? 'bg-white/90 dark:bg-gray-900/90 border-gray-200/80 dark:border-gray-800/80 shadow-md'
          : 'bg-white/80 dark:bg-gray-900/80 border-transparent'
      )}
    >
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="flex items-center gap-2.5 group">
                    <img
                      src="/favicon-192x192.png"
                      alt="ScoreSure"
                      className="h-9 w-9 rounded-xl shadow-sm ring-1 ring-sky-500/20 group-hover:ring-sky-500/40 transition-all"
                    />
                    <span className="text-xl font-bold bg-gradient-to-r from-sky-500 to-teal-500 bg-clip-text text-transparent">
                      ScoreSure
                    </span>
                  </Link>
                </div>
                <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
                  {navigation.map((item) => (
                    <Link key={item.name} to={item.href} className={navLinkClass(item.href)}>
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleDarkMode}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? (
                    <SunIcon className="h-5 w-5 text-amber-400" />
                  ) : (
                    <MoonIcon className="h-5 w-5 text-gray-600" />
                  )}
                </button>

                {isAuthenticated ? (
                  <div className="hidden sm:block">
                    <Menu as="div" className="relative">
                      <MenuButton className="rounded-full bg-gradient-to-r from-sky-500 to-teal-500 p-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 shadow-md">
                        <UserCircleIcon className="h-6 w-6 text-white" />
                      </MenuButton>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                      >
                        <MenuItems className="absolute right-0 mt-2 w-52 origin-top-right rounded-xl surface-card py-1 shadow-xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-none">
                          <div className="px-4 py-3 border-b border-gray-200/80 dark:border-gray-700/80">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {user?.email}
                            </p>
                          </div>
                          <MenuItem>
                            {({ focus }) => (
                              <Link
                                to="/profile"
                                className={cn(
                                  'block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300',
                                  focus && 'bg-gray-50 dark:bg-gray-800'
                                )}
                              >
                                View Profile
                              </Link>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ focus }) => (
                              <button
                                type="button"
                                onClick={logout}
                                className={cn(
                                  'block w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300',
                                  focus && 'bg-gray-50 dark:bg-gray-800'
                                )}
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
                  <div className="hidden sm:flex gap-2">
                    <Link to="/login" className="btn-primary text-sm px-4 py-2">
                      Log in
                    </Link>
                    <Link to="/register" className="btn-secondary text-sm px-4 py-2">
                      Sign up
                    </Link>
                  </div>
                )}

                <div className="sm:hidden">
                  <DisclosureButton className="inline-flex items-center justify-center p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                  </DisclosureButton>
                </div>
              </div>
            </div>
          </div>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 -translate-y-2"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 -translate-y-2"
          >
            <DisclosurePanel className="sm:hidden border-t border-gray-200/80 dark:border-gray-800/80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
              <div className="py-2 space-y-1">
                {navigation.map((item) => (
                  <DisclosureButton
                    key={item.name}
                    as={Link}
                    to={item.href}
                    className={cn(
                      'block px-4 py-3 text-base font-medium border-l-4 transition-colors',
                      isCurrentPath(item.href)
                        ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-500 text-sky-700 dark:text-sky-300'
                        : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                  >
                    {item.name}
                  </DisclosureButton>
                ))}
              </div>
              {isAuthenticated ? (
                <div className="border-t border-gray-200/80 dark:border-gray-800/80 py-3 px-4 space-y-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{user?.email}</p>
                  <DisclosureButton
                    as={Link}
                    to="/profile"
                    className="block py-2 text-base text-gray-600 dark:text-gray-300"
                  >
                    View Profile
                  </DisclosureButton>
                  <DisclosureButton
                    as="button"
                    onClick={logout}
                    className="block w-full text-left py-2 text-base text-gray-600 dark:text-gray-300"
                  >
                    Sign out
                  </DisclosureButton>
                </div>
              ) : (
                <div className="border-t border-gray-200/80 dark:border-gray-800/80 p-4 flex flex-col gap-2">
                  <DisclosureButton as={Link} to="/login" className="btn-primary text-center w-full">
                    Log in
                  </DisclosureButton>
                  <DisclosureButton as={Link} to="/register" className="btn-secondary text-center w-full">
                    Sign up
                  </DisclosureButton>
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
