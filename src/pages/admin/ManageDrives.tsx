import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  Plus, Edit, Trash2, Calendar, MapPin, DollarSign, Info, ShieldCheck,
  Building2, Briefcase, Clock, TrendingUp,
  X, Save, CheckCircle, Filter, Search
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Company {
  id: string
  name: string
}

interface Drive {
  id: string
  title: string
  company_id: string
  companies?: { name: string }
  drive_date: string
  application_deadline: string
  package_lpa: number
  role: string
  location: string
  status: string
  description: string
  eligibility_criteria: any
}

export default function ManageDrives() {
  const [drives, setDrives] = useState<Drive[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingDrive, setEditingDrive] = useState<Drive | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formData, setFormData] = useState({
    title: '',
    company_id: '',
    description: '',
    drive_date: '',
    application_deadline: '',
    package_lpa: '',
    role: '',
    location: '',
    status: 'upcoming',
    min_cgpa: '7.0',
    allowed_branches: [] as string[],
    no_backlogs: false
  })

  useEffect(() => {
    fetchDrives()
    fetchCompanies()
  }, [])

  const fetchDrives = async () => {
    try {
      const { data, error } = await supabase
        .from('placement_drives')
        .select(`
          *,
          companies (
            name
          )
        `)
        .order('drive_date', { ascending: false })

      if (error) throw error
      setDrives(data || [])
    } catch (error) {
      console.error('Error fetching drives:', error)
      toast.error('Failed to fetch drives')
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name')

      if (error) throw error
      setCompanies(data || [])
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const driveData = {
      title: formData.title,
      company_id: formData.company_id,
      description: formData.description,
      drive_date: formData.drive_date,
      application_deadline: formData.application_deadline,
      package_lpa: parseFloat(formData.package_lpa),
      role: formData.role,
      location: formData.location,
      status: formData.status,
      eligibility_criteria: {
        min_cgpa: parseFloat(formData.min_cgpa),
        allowed_branches: formData.allowed_branches,
        no_backlogs: formData.no_backlogs
      }
    }

    try {
      if (editingDrive) {
        const { error } = await supabase
          .from('placement_drives')
          .update(driveData)
          .eq('id', editingDrive.id)

        if (error) throw error
        toast.success('Placement drive updated successfully!')
      } else {
        const { error } = await supabase
          .from('placement_drives')
          .insert([driveData])

        if (error) throw error
        toast.success('New placement drive posted successfully!')
      }

      setShowForm(false)
      setEditingDrive(null)
      resetForm()
      fetchDrives()
    } catch (error) {
      console.error('Error saving drive:', error)
      toast.error('Failed to save placement drive')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this drive? This will also remove all student applications for it.')) return

    try {
      const { error } = await supabase
        .from('placement_drives')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Drive deleted successfully')
      fetchDrives()
    } catch (error) {
      console.error('Error deleting drive:', error)
      toast.error('Failed to delete drive')
    }
  }

  const handleEdit = (drive: Drive) => {
    setEditingDrive(drive)
    setFormData({
      title: drive.title,
      company_id: drive.company_id,
      description: drive.description || '',
      drive_date: drive.drive_date,
      application_deadline: drive.application_deadline,
      package_lpa: drive.package_lpa.toString(),
      role: drive.role || '',
      location: drive.location || '',
      status: drive.status,
      min_cgpa: drive.eligibility_criteria?.min_cgpa?.toString() || '7.0',
      allowed_branches: drive.eligibility_criteria?.allowed_branches || [],
      no_backlogs: drive.eligibility_criteria?.no_backlogs || false
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      company_id: '',
      description: '',
      drive_date: '',
      application_deadline: '',
      package_lpa: '',
      role: '',
      location: '',
      status: 'upcoming',
      min_cgpa: '7.0',
      allowed_branches: [],
      no_backlogs: false
    })
  }

  const getStatusCount = (status: string) => {
    if (status === 'all') return drives.length
    return drives.filter(d => d.status === status).length
  }

  const filteredDrives = drives.filter(drive => {
    const matchesStatus = statusFilter === 'all' || drive.status === statusFilter
    const matchesSearch = searchTerm === '' || 
      drive.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drive.companies?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drive.role.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const branches = ['CS', 'IT', 'ECE', 'MECH', 'CIVIL', 'EE', 'OTHER']

  if (loading && drives.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600 font-medium animate-pulse">Loading Placement Drives...</p>
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
                Manage Placement Drives
              </h1>
              <p className="text-primary-100 text-base md:text-lg capitalize">
                Create, update & track recruitment drives across companies
              </p>
            </div>
            <button
              onClick={() => {
                setEditingDrive(null)
                resetForm()
                setShowForm(true)
              }}
              className="flex items-center gap-2 px-6 py-3 bg-white text-primary-600 rounded-xl font-bold hover:bg-primary-50 transition-all shadow-lg active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Post New Drive
            </button>
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
            placeholder="Search drives by title, company, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-11 pr-4 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          {['all', 'upcoming', 'ongoing', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg capitalize transition-all duration-200 text-sm font-medium flex items-center gap-2 ${
                statusFilter === status
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{status === 'all' ? 'All Drives' : status}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                statusFilter === status 
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
      {drives.length > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredDrives.length}</span> out of <span className="font-semibold text-gray-900">{drives.length}</span> drives
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="w-4 h-4" />
            <span>Sorted By Drive Date</span>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Briefcase className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingDrive ? 'Edit Placement Drive' : 'Post New Recruitment Drive'}
                </h2>
              </div>
              <button 
                onClick={() => { setShowForm(false); setEditingDrive(null); }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary-500" />
                    Drive Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., SDE-1 Recruitment 2025"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary-500" />
                    Partner Company
                  </label>
                  <select
                    required
                    value={formData.company_id}
                    onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select a company</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>{company.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary-500" />
                  Job Description & Requirements
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide details about the role, expectations, and selection process..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary-500" />
                    Drive Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.drive_date}
                    onChange={(e) => setFormData({ ...formData, drive_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.application_deadline}
                    onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    Package (LPA)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder="e.g., 12.5"
                    value={formData.package_lpa}
                    onChange={(e) => setFormData({ ...formData, package_lpa: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    Job Location
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Remote, Bangalore, Delhi"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary-500" />
                  Drive Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-5 rounded-xl border border-primary-100 space-y-5">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary-600" />
                  Eligibility Criteria
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Minimum CGPA Required</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={formData.min_cgpa}
                      onChange={(e) => setFormData({ ...formData, min_cgpa: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Target Branches</label>
                    <select
                      multiple
                      value={formData.allowed_branches}
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, option => option.value)
                        setFormData({ ...formData, allowed_branches: values })
                      }}
                      className="w-full px-4 py-2.5 bg-white border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[100px]"
                    >
                      {branches.map((branch) => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500">Hold Ctrl/Cmd to select multiple branches</p>
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-lg border border-primary-100">
                  <input
                    type="checkbox"
                    checked={formData.no_backlogs}
                    onChange={(e) => setFormData({ ...formData, no_backlogs: e.target.checked })}
                    className="w-4 h-4 rounded border-primary-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Strict Policy: No Active Backlogs Allowed</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingDrive(null); }}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Processing...' : (editingDrive ? 'Update Drive' : 'Post Drive')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drives List */}
      {filteredDrives.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-16 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-12 h-12 text-gray-400" />
          </div>
          <p className="text-gray-600 text-lg font-medium">
            {searchTerm || statusFilter !== 'all' ? 'No matching drives found' : 'No placement drives yet'}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Click the "Post New Drive" button to get started'}
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
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
                <Info className="w-4 h-4 text-primary-600" />
              </div>
              <h3 className="font-bold text-gray-900">Placement Drives Registry</h3>
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {filteredDrives.length} Drives Listed
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Opportunity</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Compensation</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Timeline</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDrives.map((drive, index) => (
                  <tr key={drive.id} className="hover:bg-gray-50 transition-colors group animate-slide-up" style={{ animationDelay: `${index * 30}ms` }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                            {drive.title}
                          </div>
                          <div className="text-xs font-medium text-gray-500 mt-0.5">{drive.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900">{drive.companies?.name}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{drive.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-extrabold text-green-600">₹{drive.package_lpa} LPA</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(drive.drive_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-orange-600 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>Deadline: {new Date(drive.application_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${
                        drive.status === 'upcoming' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        drive.status === 'ongoing' ? 'bg-green-50 text-green-700 border border-green-200' :
                        'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {drive.status === 'upcoming' && <Clock className="w-3 h-3" />}
                        {drive.status === 'ongoing' && <TrendingUp className="w-3 h-3" />}
                        {drive.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(drive)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                          title="Edit Drive"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(drive.id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                          title="Delete Drive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
      {drives.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <p className="text-xs text-gray-600">Total Drives</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{drives.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-4 border border-green-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <p className="text-xs text-gray-600">Active/Ongoing</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{drives.filter(d => d.status === 'ongoing').length}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-4 border border-purple-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <p className="text-xs text-gray-600">Upcoming</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{drives.filter(d => d.status === 'upcoming').length}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-gray-600" />
              <p className="text-xs text-gray-600">Completed</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{drives.filter(d => d.status === 'completed').length}</p>
          </div>
        </div>
      )}
    </div>
  )
}