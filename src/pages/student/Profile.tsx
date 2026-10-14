import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { 
  User, 
  Mail, 
  Hash, 
  GraduationCap,
  Save, 
  FileText, 
  Upload, 
  ExternalLink, 
  Trash2,
  Phone,
  Calendar,
  Award,
  Shield,
  Sparkles,
  CheckCircle,
  Pencil,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Profile {
  name: string;
  roll_number: string;
  email: string;
  branch: string;
  current_year: number;
  cgpa: number | null;
  phone: string | null;
  resume_url: string | null;
}

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setFormData(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update(formData).eq('id', user?.id);

      if (error) throw error;
      setProfile(formData as Profile);
      setEditMode(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ resume_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, resume_url: publicUrl } : null);
      toast.success('Resume uploaded successfully!');
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error('Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveResume = async () => {
    if (!confirm('Are you sure you want to remove your resume?')) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ resume_url: null })
        .eq('id', user?.id);

      if (error) throw error;
      setProfile(prev => prev ? { ...prev, resume_url: null } : null);
      toast.success('Resume removed');
    } catch (error) {
      console.error('Error removing resume:', error);
      toast.error('Failed to remove resume');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600 font-medium animate-pulse">Loading Profile...</p>
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
                Student Profile
              </h1>
              <p className="text-primary-100 text-base md:text-lg capitalize">
                Manage your professional information & placement details
              </p>
            </div>
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20"
              >
                <Pencil className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setEditMode(false)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white text-primary-600 rounded-xl font-bold hover:bg-primary-50 disabled:opacity-50 transition-all shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-400"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            {/* Cover Image */}
            <div className="relative h-32 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700">
              <div className="absolute inset-0 bg-black/10"></div>
            </div>
            
            {/* Avatar Section */}
            <div className="relative px-6">
              <div className="relative -mt-12 mb-6">
                <div className="w-28 h-28 bg-white p-1 rounded-full shadow-xl">
                  <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                    <span className="text-4xl font-bold text-primary-700">
                      {profile?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="group">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-1">
                      <User className="w-3.5 h-3.5 text-primary-500" />
                      Full Name
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium text-gray-900 transition-all"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900 font-semibold">
                        {profile?.name || 'Not set'}
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-1">
                      <Hash className="w-3.5 h-3.5 text-primary-500" />
                      Roll Number
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.roll_number || ''}
                        onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium text-gray-900 transition-all"
                        placeholder="Enter your roll number"
                      />
                    ) : (
                      <p className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900 font-semibold">
                        {profile?.roll_number || 'Not set'}
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-1">
                      <Mail className="w-3.5 h-3.5 text-primary-500" />
                      Email Address
                    </label>
                    <p className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900 font-semibold truncate">
                      {profile?.email}
                    </p>
                  </div>

                  <div className="group">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-1">
                      <Phone className="w-3.5 h-3.5 text-primary-500" />
                      Phone Number
                    </label>
                    {editMode ? (
                      <input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium text-gray-900 transition-all"
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <p className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900 font-semibold">
                        {profile?.phone || 'Not set'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="group">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-1">
                      <GraduationCap className="w-3.5 h-3.5 text-primary-500" />
                      Branch
                    </label>
                    {editMode ? (
                      <select
                        value={formData.branch || ''}
                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium text-gray-900 transition-all"
                      >
                        <option value="" disabled>Select your branch</option>
                        <option value="CS">Computer Science</option>
                        <option value="IT">Information Technology</option>
                        <option value="ECE">Electronics & Communication</option>
                        <option value="MECH">Mechanical</option>
                        <option value="CIVIL">Civil</option>
                        <option value="EE">Electrical</option>
                      </select>
                    ) : (
                      <p className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900 font-semibold">
                        {profile?.branch || 'Not set'}
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-primary-500" />
                      Current Year
                    </label>
                    {editMode ? (
                      <select
                        value={formData.current_year || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, current_year: parseInt(e.target.value) })
                        }
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium text-gray-900 transition-all"
                      >
                        <option value="" disabled>Select current year</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                    ) : (
                      <p className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900 font-semibold">
                        {profile?.current_year ? `${profile.current_year}${getYearSuffix(profile.current_year)} Year` : 'Not set'}
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-1">
                      <Award className="w-3.5 h-3.5 text-primary-500" />
                      CGPA
                    </label>
                    {editMode ? (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={formData.cgpa || ''}
                        onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium text-gray-900 transition-all"
                        placeholder="Enter your CGPA"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="flex-1 px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900 font-semibold">
                          {profile?.cgpa || 'Not set'}
                        </p>
                        {profile?.cgpa && profile.cgpa >= 8 && (
                          <div className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Excellent
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-3 border border-primary-100">
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-primary-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-gray-700">Profile Completion</p>
                        <div className="mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-primary-600 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${calculateProfileCompletion(profile)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{calculateProfileCompletion(profile)}% Complete</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Resume Card */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-50 to-primary-100/30 px-6 py-4 border-b border-primary-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-600" />
                My Resume
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              {profile?.resume_url ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-primary-50 to-white rounded-xl border-2 border-primary-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                        <FileText className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-gray-900 truncate">Resume.pdf</p>
                        <p className="text-xs text-gray-500 font-medium">Uploaded successfully</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <a
                      href={profile.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-all shadow-md"
                    >
                      <ExternalLink className="w-4 h-4" /> View Resume
                    </a>
                    <button
                      onClick={handleRemoveResume}
                      className="px-4 py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center space-y-3 cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary-100 transition-colors">
                    <Upload className="w-8 h-8 text-gray-500 group-hover:text-primary-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-gray-900">Upload Resume</p>
                    <p className="text-xs text-gray-500">PDF files up to 5MB</p>
                  </div>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleResumeUpload}
                accept=".pdf"
                className="hidden"
              />

              {uploading && (
                <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium text-gray-700">Uploading...</span>
                </div>
              )}
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-gradient-to-br from-secondary-50 via-primary-50 to-secondary-50 rounded-xl p-6 border border-secondary-100">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-secondary-600" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Pro Tips</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600 mt-0.5" />
                    <span>Keep your CGPA updated</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600 mt-0.5" />
                    <span>Upload an ATS-friendly resume</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600 mt-0.5" />
                    <span>Ensure contact details are correct</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Profile Stats</h4>
              <Award className="w-4 h-4 text-primary-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Applications Made</span>
                <span className="font-semibold text-gray-900">--</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shortlisted</span>
                <span className="font-semibold text-green-600">--</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Profile Views</span>
                <span className="font-semibold text-gray-900">--</span>
              </div>
            </div>
          </div>
        </div>
      </div>
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

// Helper function to calculate profile completion
function calculateProfileCompletion(profile: Profile | null): number {
  if (!profile) return 0;
  let completed = 0;
  const fields = ['name', 'roll_number', 'email', 'branch', 'current_year', 'cgpa', 'phone'];
  fields.forEach(field => {
    if (profile[field as keyof Profile]) completed++;
  });
  if (profile.resume_url) completed++;
  return Math.round((completed / (fields.length + 1)) * 100);
}