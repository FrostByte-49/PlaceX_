import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { 
  LayoutDashboard, 
  Building2, 
  CalendarDays, 
  FileText, 
  BarChart3,
  Users,
  Briefcase,
  FileCheck,
  Menu,
  X,
  GraduationCap,
  LogOut,
  UserCircle,
  Shield,
  ChevronRight,
  User,
  HelpCircle,
  ChevronLeft,
} from 'lucide-react'
import { useState, useEffect } from 'react'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['student', 'admin', 'coordinator'] },
  { path: '/drives', label: 'Placement Drives', icon: CalendarDays, roles: ['student', 'admin', 'coordinator'] },
  { path: '/my-applications', label: 'My Applications', icon: FileText, roles: ['student'] },
  { path: '/companies', label: 'Companies', icon: Building2, roles: ['student', 'admin', 'coordinator'] },
  { path: '/stats', label: 'Statistics', icon: BarChart3, roles: ['student', 'admin', 'coordinator'] },
  { path: '/profile', label: 'Profile', icon: User, roles: ['student', 'admin', 'coordinator'] },
]

const adminItems = [
  { path: '/admin/drives', label: 'Manage Drives', icon: Briefcase, roles: ['admin', 'coordinator'] },
  { path: '/admin/applications', label: 'Review Applications', icon: FileCheck, roles: ['admin', 'coordinator'] },
  { path: '/admin/students', label: 'Manage Students', icon: Users, roles: ['admin'] },
  { path: '/admin/companies', label: 'Manage Companies', icon: Building2, roles: ['admin'] },
]

export function Sidebar() {
  const { user, userRole, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileOpen) {
        setIsMobileOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMobileOpen])

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

  // const getRoleDisplay = () => {
  //   switch(userRole) {
  //     case 'admin':
  //       return 'Admin'
  //     case 'coordinator':
  //       return 'Coordinator'
  //     default:
  //       return 'Student'
  //   }
  // }

  const getRoleBadge = () => {
    switch(userRole) {
      case 'admin':
        return { text: 'Admin', color: 'bg-purple-100 text-purple-700', icon: Shield }
      case 'coordinator':
        return { text: 'Coordinator', color: 'bg-blue-100 text-blue-700', icon: UserCircle }
      default:
        return { text: 'Student', color: 'bg-green-100 text-green-700', icon: GraduationCap }
    }
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const roleBadge = getRoleBadge()
  const RoleIcon = roleBadge.icon

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(userRole || 'student')
  )

  const filteredAdminItems = adminItems.filter(item => 
    item.roles.includes(userRole || 'student')
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-gradient-to-r from-primary-600 to-primary-700 text-white p-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-gradient-to-b from-white via-white to-gray-50/50
        border-r border-gray-300 z-40 shadow-xl
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className={`
            relative flex items-center h-16 px-4 border-b border-gray-300
            ${isCollapsed ? 'justify-center' : 'justify-between'}
          `}>
            {!isCollapsed && (
              <Link to="/dashboard" className="flex items-center space-x-2 group">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                    PlaceX
                  </span>
                  <p className="text-[10px] text-gray-400 -mt-1">Placement Portal</p>
                </div>
              </Link>
            )}
            {isCollapsed && (
              <Link to="/dashboard" className="group">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
              </Link>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex items-center justify-center w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all absolute -right-3 top-1/2 -translate-y-1/2 shadow-sm"
            >
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* User Profile Section (Top) - Only when expanded */}
          {!isCollapsed && (
            <div className="mx-3 mt-6 p-3 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-100">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-white text-base font-bold">{getUserInitials()}</span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{getUserName()}</p>
                  <div className="mt-1 flex items-center gap-1">
                    <RoleIcon className="w-3 h-3" />
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleBadge.color}`}>
                      Role: {roleBadge.text}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Collapsed Profile Icon */}
          {isCollapsed && (
            <div className="flex justify-center mt-4">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white text-base font-bold">{getUserInitials()}</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
            <div className="px-3 space-y-2">
              {/* Main Navigation */}
              {filteredNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`
                    group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                    ${isActive(item.path) 
                      ? 'bg-gradient-to-r from-primary-50 to-primary-100/50 text-primary-700 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${hoveredItem === item.path && !isCollapsed ? 'scale-110' : ''}`} />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                  {isActive(item.path) && !isCollapsed && (
                    <div className="absolute left-0 w-1 h-8 bg-primary-600 rounded-r-full"></div>
                  )}
                  {isCollapsed && isActive(item.path) && (
                    <div className="absolute left-0 w-1 h-8 bg-primary-600 rounded-r-full"></div>
                  )}
                </Link>
              ))}

              {/* Admin Section */}
              {filteredAdminItems.length > 0 && (
                <>
                  {!isCollapsed && (
                    <div className="pt-4 mt-4">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <span className="px-2 text-xs font-semibold text-gray-400 bg-white uppercase tracking-wider">
                            Admin Panel
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {filteredAdminItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      onMouseEnter={() => setHoveredItem(item.path)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`
                        group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                        ${isActive(item.path) 
                          ? 'bg-gradient-to-r from-purple-50 to-purple-100/50 text-purple-700 shadow-sm' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }
                        ${isCollapsed ? 'justify-center' : ''}
                      `}
                      title={isCollapsed ? item.label : ''}
                    >
                      <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${hoveredItem === item.path && !isCollapsed ? 'scale-110' : ''}`} />
                      {!isCollapsed && (
                        <span className="text-sm font-medium">{item.label}</span>
                      )}
                      {isActive(item.path) && !isCollapsed && (
                        <div className="absolute left-0 w-1 h-8 bg-purple-600 rounded-r-full"></div>
                      )}
                    </Link>
                  ))}
                </>
              )}
            </div>
          </nav>

          {/* Footer Section */}
          <div className="p-3 space-y-2 bg-gray-50/50 border-t border-gray-300">
            {/* Help Section (when expanded) */}
            {!isCollapsed && (
              <button
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all group"
                onClick={() => window.open('/help', '_blank')}
              >
                <HelpCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Help & Support</span>
              </button>
            )}

            {/* Collapsed Help Icon */}
            {isCollapsed && (
              <button
                className="w-full flex justify-center py-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
                onClick={() => window.open('/help', '_blank')}
                title="Help & Support"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            )}

            {/* Logout Button */}
            <button
              onClick={handleSignOut}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                text-red-600 hover:bg-red-50 hover:text-red-700 group
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? 'Logout' : ''}
            >
              <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
              {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
            </button>

          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden animate-fade-in"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}