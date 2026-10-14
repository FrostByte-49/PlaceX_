import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Users, Search, GraduationCap, Mail, Hash, BookOpen, 
  Filter, TrendingUp, Award, Calendar, Download, 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  roll_number: string | null;
  branch: string | null;
  current_year: number | null;
  cgpa: number | null;
  phone?: string | null;
}

export default function ManageStudents() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('name');
        
      if (error) throw error;
      setStudents(data as StudentProfile[]);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Get unique branches for filter
  const branches = ['all', ...new Set(students.map(s => s.branch).filter((b): b is string => Boolean(b)))];

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      student.roll_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBranch = selectedBranch === 'all' || student.branch === selectedBranch;
    const matchesYear = selectedYear === 'all' || student.current_year?.toString() === selectedYear;
    
    return matchesSearch && matchesBranch && matchesYear;
  });

  const getCGPAStatus = (cgpa: number | null) => {
    if (!cgpa) return { color: 'text-gray-500', label: 'N/A', badge: 'bg-gray-100 text-gray-600' };
    if (cgpa >= 8.5) return { color: 'text-green-600', label: 'Excellent', badge: 'bg-green-100 text-green-700' };
    if (cgpa >= 7) return { color: 'text-blue-600', label: 'Good', badge: 'bg-blue-100 text-blue-700' };
    if (cgpa >= 6) return { color: 'text-yellow-600', label: 'Average', badge: 'bg-yellow-100 text-yellow-700' };
    return { color: 'text-red-600', label: 'Needs Improvement', badge: 'bg-red-100 text-red-700' };
  };

  const getBranchColor = (branch: string | null) => {
    const colors: Record<string, string> = {
      'CS': 'bg-blue-100 text-blue-700',
      'IT': 'bg-cyan-100 text-cyan-700',
      'ECE': 'bg-purple-100 text-purple-700',
      'MECH': 'bg-orange-100 text-orange-700',
      'CIVIL': 'bg-green-100 text-green-700',
      'EE': 'bg-yellow-100 text-yellow-700',
    };
    return colors[branch || ''] || 'bg-gray-100 text-gray-700';
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Roll Number', 'Email', 'Branch', 'Year', 'CGPA'];
    const csvData = filteredStudents.map(s => [
      s.name,
      s.roll_number || '',
      s.email,
      s.branch || '',
      s.current_year || '',
      s.cgpa || ''
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Student list exported successfully');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600 font-medium animate-pulse">Loading Student Records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-2xl shadow-xl">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
        <div className="relative px-6 md:px-8 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                Manage Students
              </h1>
              <p className="text-primary-100 text-base md:text-lg capitalize">
                View & track all registered student profiles
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2.5">
                <Users className="w-4 h-4 text-primary-200" />
                <span className="text-white text-sm font-medium">{students.length} Total Students</span>
              </div>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/20 transition-all border border-white/20"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-400"></div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, roll number, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-11 pr-4 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-8">
          <div className="flex items-center gap-1">
            <GraduationCap className="w-4 h-4 text-gray-400" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {branches.map(branch => (
                <option key={branch} value={branch}>
                  {branch === 'all' ? 'All Branches' : branch}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredStudents.length}</span> out of <span className="font-semibold text-gray-900">{students.length}</span> students
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Filter className="w-4 h-4" />
          <span>Sorted By Name</span>
        </div>
      </div>

      {/* Students Grid/Table */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-16 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {students.length === 0 ? (
              <Users className="w-12 h-12 text-gray-400" />
            ) : (
              <Search className="w-12 h-12 text-gray-400" />
            )}
          </div>
          <p className="text-gray-600 text-lg font-medium">
            {students.length === 0 ? 'No students registered yet' : 'No matching students found'}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {students.length === 0 
              ? 'Students will appear here once they register'
              : 'Try adjusting your search or filter criteria'}
          </p>
          {(searchQuery || selectedBranch !== 'all' || selectedYear !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBranch('all');
                setSelectedYear('all');
              }}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary-100 rounded-lg">
                <Users className="w-4 h-4 text-primary-600" />
              </div>
              <h3 className="font-bold text-gray-900">Student Registry</h3>
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {filteredStudents.length} Records
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Student Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Academics</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Performance</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Contact</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student, index) => {
                  const cgpaStatus = getCGPAStatus(student.cgpa);
                  return (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors group animate-slide-up" style={{ animationDelay: `${index * 30}ms` }}>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center text-primary-700 font-bold text-lg shadow-sm">
                            {student.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                              {student.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500 flex items-center gap-1 mt-0.5">
                              <Hash className="w-3 h-3" />
                              {student.roll_number || 'Not set'}
                            </div>
                          </div>
                        </div>
                       </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${getBranchColor(student.branch)}`}>
                              {student.branch || 'N/A'}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Calendar className="w-3 h-3" />
                              {student.current_year ? `${student.current_year}${getYearSuffix(student.current_year)} Year` : 'N/A'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <BookOpen className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-gray-700">CGPA:</span>
                            <span className={`font-bold ${cgpaStatus.color}`}>
                              {student.cgpa || 'N/A'}
                            </span>
                          </div>
                        </div>
                       </td>
                      <td className="px-6 py-5">
                        {student.cgpa ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-gray-400" />
                              <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${cgpaStatus.badge}`}>
                                {cgpaStatus.label}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-primary-600 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${(student.cgpa / 10) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Not available</span>
                        )}
                       </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <a 
                            href={`mailto:${student.email}`} 
                            className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors truncate max-w-[200px]"
                          >
                            {student.email}
                          </a>
                        </div>
                       </td>
                     </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Stats Section */}
      {students.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <p className="text-xs text-gray-600">Total Students</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{students.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-4 border border-green-100">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-green-600" />
              <p className="text-xs text-gray-600">High Achievers (CGPA ≥ 8.5)</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{students.filter(s => (s.cgpa || 0) >= 8.5).length}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-4 border border-purple-100">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-purple-600" />
              <p className="text-xs text-gray-600">Branches</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{branches.length - 1}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-4 border border-orange-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <p className="text-xs text-gray-600">Placement Eligible</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{students.filter(s => (s.cgpa || 0) >= 7).length}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function for year suffix
function getYearSuffix(year: number): string {
  if (year === 1) return 'st';
  if (year === 2) return 'nd';
  if (year === 3) return 'rd';
  return 'th';
}