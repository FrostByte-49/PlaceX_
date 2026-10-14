import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Sidebar } from './Sidebar'
import { 
  Bell,
  ChevronDown,
  Shield,
  Briefcase,
  GraduationCap,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Calendar,
  Sparkles,
  CheckCircle,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export function Layout() {
  const { user, signOut, userRole } = useAuth()
  const navigate = useNavigate()
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  
  const userDropdownRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const getUserInitials = () => {
    const name = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'
    return name.charAt(0).toUpperCase()
  }

  const getUserName = () => {
    return user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'
  }

  const getUserEmail = () => {
    return user?.email || ''
  }

  const getRoleDisplay = () => {
    switch(userRole) {
      case 'admin':
        return { text: 'Admin', color: 'bg-purple-100 text-purple-700', icon: Shield }
      case 'coordinator':
        return { text: 'Coordinator', color: 'bg-blue-100 text-blue-700', icon: Briefcase }
      default:
        return { text: 'Student', color: 'bg-green-100 text-green-700', icon: GraduationCap }
    }
  }

  const roleDisplay = getRoleDisplay()
  const RoleIcon = roleDisplay.icon

  // Sample notifications with better structure
  const notifications = [
    { id: 1, title: 'New placement drive added', message: 'Google is hiring for 2025 batch', time: '5 min ago', read: false, type: 'success' },
    { id: 2, title: 'Application status updated', message: 'Your application for Microsoft has been shortlisted', time: '1 hour ago', read: false, type: 'info' },
    { id: 3, title: 'Upcoming drive', message: 'Amazon drive starts tomorrow', time: '1 day ago', read: true, type: 'warning' },
  ]

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'info':
        return <Bell className="w-4 h-4 text-blue-500" />
      case 'warning':
        return <Calendar className="w-4 h-4 text-orange-500" />
      default:
        return <Sparkles className="w-4 h-4 text-primary-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100/50 flex">
      {/* Sidebar Component */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen md:pl-0">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-300 sticky top-0 z-30 h-16">
          <div className="h-full px-4 md:px-6">
            <div className="flex items-center justify-end h-full">
              {/* Right side - User menu and notifications */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative p-2 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in">
                      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-primary-100/30">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-primary-600" />
                            <h3 className="font-bold text-gray-900">Notifications</h3>
                          </div>
                          <button className="text-xs text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                            Mark all as read
                          </button>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${!notification.read ? 'bg-primary-50/30' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-0.5">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                                <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                        <button className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors">
                          View all notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 hover:bg-gray-100 transition-all duration-200 border border-gray-300 hover:border-gray-300 shadow-sm"
                  >
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-bold shadow-md">
                      {getUserInitials()}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-bold text-gray-900">
                        {getUserName()}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <RoleIcon className="w-3.5 h-3.5" />
                        <p className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${roleDisplay.color}`}>
                          {roleDisplay.text}
                        </p>
                      </div>
                    </div>
                    <ChevronDown className={`hidden lg:block w-4 h-4 text-gray-500 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Enhanced User Dropdown */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-300 py-2 z-50 animate-scale-in">
                      {/* User Info Section */}
                      <div className="px-4 py-4 border-b border-gray-300 bg-gradient-to-r from-primary-50/50 to-secondary-50/50 rounded-t-2xl">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-bold text-lg shadow-md">
                            {getUserInitials()}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900">{getUserName()}</p>
                            <p className="text-xs text-gray-500 truncate">{getUserEmail()}</p>
                            <div className="flex items-center gap-1 mt-1.5">
                              <RoleIcon className="w-3 h-3" />
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleDisplay.color}`}>
                                {roleDisplay.text}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <button
                          onClick={() => {
                            navigate('/profile')
                            setUserDropdownOpen(false)
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3 group"
                        >
                          <User className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                          <span className="font-medium group-hover:text-primary-600 transition-colors">View Profile</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            navigate('/settings')
                            setUserDropdownOpen(false)
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3 group"
                        >
                          <Settings className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                          <span className="font-medium group-hover:text-primary-600 transition-colors">Settings</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            window.open('/help', '_blank')
                            setUserDropdownOpen(false)
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3 group"
                        >
                          <HelpCircle className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                          <span className="font-medium group-hover:text-primary-600 transition-colors">Help & Support</span>
                        </button>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-300 my-1"></div>

                      {/* Sign Out */}
                      <div className="py-2">
                        <button
                          onClick={() => { handleSignOut() }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 group"
                        >
                          <LogOut className="w-4 h-4 text-red-500 group-hover:text-red-600 transition-colors" />
                          <span className="font-semibold">Sign Out</span>
                        </button>
                      </div>

                      {/* Version Info */}
                      <div className="px-4 pt-2 pb-1">
                        <p className="text-[10px] text-gray-400 text-center">
                          PlaceX v1.0.0
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 bg-gray-50/50 md:pl-[256px] transition-all duration-300">
          <div className="p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}