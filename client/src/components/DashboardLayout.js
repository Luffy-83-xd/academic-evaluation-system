import React, { useContext, useState, useMemo } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { FiGrid, FiFileText, FiClipboard, FiBarChart2, FiBookOpen, FiMessageSquare, FiLogOut, FiBell, FiMenu } from 'react-icons/fi';

const studentLinks = [
  { icon: <FiFileText />, name: 'Documents', path: '/student/documents' },
  { icon: <FiClipboard />, name: 'Quizzes', path: '/student/quizzes' },
  { icon: <FiGrid />, name: 'Projects', path: '/student/projects' },
  { icon: <FiBarChart2 />, name: 'Analytics', path: '/student/analytics' },
  { icon: <FiBookOpen />, name: 'Resources', path: '/student/resources' },
  { icon: <FiMessageSquare />, name: 'Chat', path: '/student/chat' },
];
const proctorLinks = [
    { icon: <FiFileText />, name: 'Documents', path: '/proctor/documents' },
    { icon: <FiClipboard />, name: 'Quizzes', path: '/proctor/quizzes' },
    { icon: <FiGrid />, name: 'Projects', path: '/proctor/projects' },
    { icon: <FiBarChart2 />, name: 'Analytics', path: '/proctor/analytics' },
    { icon: <FiBookOpen />, name: 'Resources', path: '/proctor/resources' },
    { icon: <FiMessageSquare />, name: 'Chat', path: '/proctor/chat' },
];

const DashboardLayout = () => {
  const { user, logout, notifications, markNotificationsAsRead } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const links = user?.role === 'student' ? studentLinks : proctorLinks;

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const handleBellClick = () => {
    setIsDropdownOpen(prev => !prev);
    if (unreadCount > 0) {
        markNotificationsAsRead();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Collapsible Sidebar */}
      <aside className={`flex-shrink-0 bg-gray-800 text-white flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
        <div className={`overflow-hidden ${isSidebarOpen ? 'block' : 'hidden'}`}>
            <div className="h-16 flex items-center justify-center text-2xl font-bold border-b border-gray-700">AEMS</div>
            <nav className="flex-1 px-2 py-4 space-y-2">
            {links.map((link) => (
                <NavLink key={link.name} to={link.path} className={({ isActive }) => `flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 hover:bg-gray-700 ${isActive ? 'bg-blue-600' : ''}`}>
                    <span className="text-lg">{link.icon}</span>
                    <span className="ml-4">{link.name}</span>
                </NavLink>
            ))}
            </nav>
            <div className="px-2 py-4 border-t border-gray-700">
            <button onClick={logout} className="flex items-center w-full px-4 py-2.5 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-colors duration-200">
                <FiLogOut className="text-lg" />
                <span className="ml-4">Logout</span>
            </button>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white shadow-md flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-600 hover:text-gray-800">
              <FiMenu size={24} />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">{user?.role === 'student' ? "Student" : "Proctor"} Dashboard</h1>
          </div>
          <div className="flex items-center gap-6">
            
            {/* THIS IS THE CORRECTED NOTIFICATION BELL SECTION */}
            <div className="relative">
              <button onClick={handleBellClick} className="relative text-gray-600 hover:text-gray-800">
                <FiBell size={24} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">{unreadCount}</span>
                )}
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-20">
                    <div className="p-3 font-bold border-b">Notifications</div>
                    <ul className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? notifications.map(n => (
                            <li key={n._id}>
                                <Link to={n.link || '#'} onClick={() => setIsDropdownOpen(false)} className={`block p-3 hover:bg-gray-100 ${!n.isRead ? 'bg-blue-50' : ''}`}>
                                    <p className="text-sm text-gray-700">{n.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                </Link>
                            </li>
                        )) : <p className="p-4 text-sm text-gray-500">No notifications yet.</p>}
                    </ul>
                </div>
              )}
            </div>
            {/* END OF CORRECTED SECTION */}

            <Link to={user?.role === 'student' ? '/student/profile' : '/proctor/profile'} className="flex items-center gap-4">
              <span className="font-medium">{user?.name}</span>
              <img src={`http://localhost:8080/${user?.avatar}`} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;