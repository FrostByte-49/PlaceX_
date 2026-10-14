import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  Eye, CheckCircle, XCircle, Download, ExternalLink, Filter, 
  UserCheck, UserX, UserPlus, FileSearch, Clock, Calendar,
  Award, Briefcase, Mail, GraduationCap, TrendingUp,
  Users, Search, AlertCircle, Star
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Application {
  id: string
  status: string
  application_date: string
  student_id: string
  drive_id: string
  profiles: {
    name: string
    roll_number: string
    email: string
    branch: string
    cgpa: number
    resume_url: string
  }
  placement_drives: {
    title: string
    companies: {
      name: string
    }
  }
}

export default function ReviewApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          profiles (
            name,
            roll_number,
            email,
            branch,
            cgpa,
            resume_url
          ),
          placement_drives (
            title,
            companies (
              name
            )
          )
        `)
        .order('application_date', { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast.error('Failed to fetch applications')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      toast.success(`Candidate status moved to: ${status.toUpperCase()}`)
      fetchApplications()
      setSelectedApp(null)
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      shortlisted: 'bg-blue-50 text-blue-700 border-blue-200',
      selected: 'bg-green-50 text-green-700 border-green-200',
      rejected: 'bg-red-50 text-red-700 border-red-200'
    }
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending': return <Clock className="w-3 h-3" />
      case 'shortlisted': return <Star className="w-3 h-3" />
      case 'selected': return <CheckCircle className="w-3 h-3" />
      case 'rejected': return <XCircle className="w-3 h-3" />
      default: return null
    }
  }

  const getStatusCount = (status: string) => {
    if (status === 'all') return applications.length
    return applications.filter(app => app.status === status).length
  }

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filter === 'all' || app.status === filter
    const matchesSearch = searchTerm === '' || 
      app.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.profiles?.roll_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.placement_drives?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.placement_drives?.companies?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600 font-medium animate-pulse">Loading Applications...</p>
      </div>
    )
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
                Review Applications
              </h1>
              <p className="text-primary-100 text-base md:text-lg capitalize">
                Shortlist candidates & manage recruitment workflow
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Users className="w-4 h-4 text-primary-200" />
              <span className="text-white text-sm font-medium">{applications.length} Total Applications</span>
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
            placeholder="Search by candidate name, roll number, drive, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-11 pr-4 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          {['all', 'pending', 'shortlisted', 'selected', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg capitalize transition-all duration-200 text-sm font-medium flex items-center gap-2 ${
                filter === status
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{status === 'all' ? 'All Applications' : status}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                filter === status 
                  ? 'bg-white/20 text-white' 
                  : 'bg-gray-300 text-gray-700'
              }`}>
                {getStatusCount(status)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {applications.length > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredApplications.length}</span> out of <span className="font-semibold text-gray-900">{applications.length}</span> applications
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="w-4 h-4" />
            <span>Sorted By Latest First</span>
          </div>
        </div>
      )}

      {/* Applications Table */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-16 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {applications.length === 0 ? (
              <Users className="w-12 h-12 text-gray-400" />
            ) : (
              <Search className="w-12 h-12 text-gray-400" />
            )}
          </div>
          <p className="text-gray-600 text-lg font-medium">
            {applications.length === 0 ? 'No applications yet' : 'No matching applications'}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {applications.length === 0 
              ? 'Students will appear here once they apply for drives'
              : 'No applications match your current search or filter criteria'}
          </p>
          {(searchTerm || filter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('')
                setFilter('all')
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
                <FileSearch className="w-4 h-4 text-primary-600" />
              </div>
              <h3 className="font-bold text-gray-900">Applications Queue</h3>
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {filteredApplications.length} Applications
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Candidate</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Opportunity</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Academic</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Applied On</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredApplications.map((app, index) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors group animate-slide-up" style={{ animationDelay: `${index * 30}ms` }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center text-primary-700 font-bold shadow-sm">
                          {app.profiles?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                            {app.profiles?.name}
                          </div>
                          <div className="text-xs font-medium text-gray-500">{app.profiles?.roll_number}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{app.placement_drives?.title}</div>
                      <div className="text-xs font-medium text-primary-600 flex items-center gap-1 mt-0.5">
                        <Briefcase className="w-3 h-3" />
                        {app.placement_drives?.companies?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                        {app.profiles?.branch}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-green-600 mt-0.5">
                        <Award className="w-3 h-3" />
                        CGPA: {app.profiles?.cgpa}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Calendar className="w-3 h-3" />
                        {new Date(app.application_date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border ${getStatusBadge(app.status)}`}>
                        {getStatusIcon(app.status)}
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-primary-600 hover:text-white transition-all"
                          title="View Full Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {app.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateStatus(app.id, 'shortlisted')}
                              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                              title="Shortlist Candidate"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateStatus(app.id, 'rejected')}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                              title="Reject Candidate"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {app.status === 'shortlisted' && (
                          <button
                            onClick={() => updateStatus(app.id, 'selected')}
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all"
                            title="Final Selection"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Stats Section */}
      {applications.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
          <div className="bg-gradient-to-br from-yellow-50 to-white rounded-xl p-4 border border-yellow-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <p className="text-xs text-gray-600">Pending Review</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{getStatusCount('pending')}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-blue-600" />
              <p className="text-xs text-gray-600">Shortlisted</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{getStatusCount('shortlisted')}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-4 border border-green-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-xs text-gray-600">Selected</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{getStatusCount('selected')}</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-white rounded-xl p-4 border border-red-100">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <p className="text-xs text-gray-600">Rejected</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{getStatusCount('rejected')}</p>
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {selectedApp.profiles?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedApp.profiles?.name}</h2>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <FileSearch className="w-3.5 h-3.5" />
                    {selectedApp.profiles?.roll_number} | {selectedApp.profiles?.branch}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedApp(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Candidate Info */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" />
                      Candidate Profile
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                        <p className="text-xs font-medium text-gray-500">CGPA</p>
                        <p className="text-xl font-bold text-gray-900 mt-1">{selectedApp.profiles?.cgpa || 'N/A'}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                        <p className="text-xs font-medium text-gray-500">Status</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wide border ${getStatusBadge(selectedApp.status)}`}>
                          {selectedApp.status}
                        </span>
                      </div>
                      <div className="col-span-2 bg-white rounded-lg p-3 border border-gray-100">
                        <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          Email
                        </p>
                        <p className="text-sm font-semibold text-primary-600 mt-1 break-all">{selectedApp.profiles?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Download className="w-3.5 h-3.5" />
                      Resume
                    </h3>
                    {selectedApp.profiles?.resume_url ? (
                      <div className="text-center">
                        <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <FileSearch className="w-8 h-8 text-primary-600" />
                        </div>
                        <a
                          href={selectedApp.profiles.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all shadow-md"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Resume
                        </a>
                      </div>
                    ) : (
                      <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
                        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-red-600">No resume uploaded</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Application Info */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-primary-900 to-primary-800 rounded-xl p-5 text-white">
                    <h3 className="text-xs font-bold text-primary-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5" />
                      Application Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-primary-300">Recruitment Drive</p>
                        <p className="font-bold text-white">{selectedApp.placement_drives?.title}</p>
                      </div>
                      <div>
                        <p className="text-xs text-primary-300">Company</p>
                        <p className="font-semibold text-primary-100">{selectedApp.placement_drives?.companies?.name}</p>
                      </div>
                      <div className="pt-2 border-t border-primary-800">
                        <p className="text-xs text-primary-300">Applied On</p>
                        <p className="font-medium text-primary-100">
                          {new Date(selectedApp.application_date).toLocaleDateString('en-US', { 
                            weekday: 'long',
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Workflow Decisions
                    </h3>
                    <div className="space-y-3">
                      {selectedApp.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(selectedApp.id, 'shortlisted')}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-md"
                          >
                            <UserCheck className="w-4 h-4" />
                            Shortlist Candidate
                          </button>
                          <button
                            onClick={() => updateStatus(selectedApp.id, 'rejected')}
                            className="w-full py-3 bg-white text-red-600 border-2 border-red-200 rounded-xl font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                          >
                            <UserX className="w-4 h-4" />
                            Reject Candidate
                          </button>
                        </>
                      )}
                      
                      {selectedApp.status === 'shortlisted' && (
                        <button
                          onClick={() => updateStatus(selectedApp.id, 'selected')}
                          className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-md"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Confirm Final Selection
                        </button>
                      )}

                      {(selectedApp.status === 'selected' || selectedApp.status === 'rejected') && (
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            This application has been {selectedApp.status}
                          </p>
                        </div>
                      )}

                      <button
                        onClick={() => setSelectedApp(null)}
                        className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}