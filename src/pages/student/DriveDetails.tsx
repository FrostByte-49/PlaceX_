import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ChevronLeft,
  Briefcase,
  ExternalLink,
  GraduationCap,
  Globe,
  Shield,
  Zap,
  TrendingUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Drive {
  id: string;
  title: string;
  description: string;
  drive_date: string;
  application_deadline: string;
  package_lpa: number;
  role: string;
  location: string;
  status: string;
  eligibility_criteria: {
    min_cgpa: number;
    allowed_branches: string[];
    no_backlogs: boolean;
  };
  companies: {
    name: string;
    industry: string;
    website: string;
    description: string;
  };
}

interface Application {
  id: string;
  status: string;
}

export default function DriveDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [drive, setDrive] = useState<Drive | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [resumeOption, setResumeOption] = useState<'profile' | 'new'>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id && user) {
      fetchData();
    }
  }, [id, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const { data: driveData, error: driveError } = await supabase
        .from('placement_drives')
        .select(`
          *,
          companies (*)
        `)
        .eq('id', id)
        .single();

      if (driveError) throw driveError;
      setDrive(driveData);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      const { data: appData } = await supabase
        .from('applications')
        .select('*')
        .eq('drive_id', id)
        .eq('student_id', user?.id)
        .single();

      if (appData) setApplication(appData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load drive details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!profile?.cgpa || !profile?.branch) {
      toast.error('Please complete your profile first');
      navigate('/profile');
      return;
    }

    if (drive && profile.cgpa < drive.eligibility_criteria.min_cgpa) {
      toast.error('Minimum CGPA requirement not met');
      return;
    }

    if (drive && !drive.eligibility_criteria.allowed_branches.includes(profile.branch)) {
      toast.error('Your branch is not eligible for this drive');
      return;
    }

    setSubmitting(true);
    try {
      let finalResumeUrl = profile.resume_url;

      if (resumeOption === 'new' && fileInputRef.current?.files?.[0]) {
        const file = fileInputRef.current.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(filePath);
        
        finalResumeUrl = publicUrl;
      }

      if (!finalResumeUrl) {
        toast.error('Please provide a resume');
        setSubmitting(false);
        return;
      }

      const { data, error } = await supabase
        .from('applications')
        .insert([
          {
            student_id: user?.id,
            drive_id: id,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      if (resumeOption === 'new') {
        await supabase.from('profiles').update({ resume_url: finalResumeUrl }).eq('id', user?.id);
      }

      setApplication(data);
      setShowApplyForm(false);
      toast.success('Application submitted successfully!');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600 font-medium animate-pulse">Loading Drive Details...</p>
      </div>
    );
  }

  if (!drive) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-md">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Drive not found</h2>
        <p className="text-gray-600 mb-4">The placement drive you're looking for doesn't exist.</p>
        <button 
          onClick={() => navigate('/drives')} 
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Drives
        </button>
      </div>
    );
  }

  const isExpired = new Date(drive.application_deadline) < new Date();

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <button 
          onClick={() => navigate('/drives')}
          className="group flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-primary-600 font-medium transition-all duration-200 hover:bg-primary-50 rounded-lg"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" /> 
          Back to All Drives
        </button>
        {application && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg font-medium animate-fade-in">
            <CheckCircle2 className="w-4 h-4" /> 
            Applied | {application.status}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-8">
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              ></div>
              <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                      drive.status === 'Upcoming' ? 'bg-blue-500/20 text-blue-100' : 
                      drive.status === 'Ongoing' ? 'bg-green-500/20 text-green-100' : 
                      'bg-gray-500/20 text-gray-100'
                    }`}>
                      {drive.status}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                    {drive.title}
                  </h1>
                  <p className="flex items-center gap-2 text-primary-100 font-medium">
                    <Building2 className="w-4 h-4" /> 
                    {drive.companies.name}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <Briefcase className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
            
            {/* Key Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Package
                </p>
                <p className="text-2xl font-bold text-gray-900">₹{drive.package_lpa} <span className="text-sm font-normal text-gray-500">LPA</span></p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Location
                </p>
                <p className="text-lg font-semibold text-gray-900">{drive.location}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> Role
                </p>
                <p className="text-lg font-semibold text-gray-900 truncate">{drive.role}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Experience
                </p>
                <p className="text-lg font-semibold text-gray-900">Fresher</p>
              </div>
            </div>

            {/* Description Section */}
            <div className="p-6 space-y-6">
              <section className="space-y-3">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-1.5 bg-primary-50 rounded-lg">
                    <FileText className="w-5 h-5 text-primary-600" />
                  </div>
                  Job Description
                </h3>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap pl-11">
                  {drive.description || 'No detailed description provided.'}
                </div>
              </section>

              <hr className="border-gray-100" />

              {/* Eligibility Section */}
              <section className="space-y-3">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-1.5 bg-primary-50 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-primary-600" />
                  </div>
                  Eligibility Criteria
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-11">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 space-y-2">
                    <p className="text-sm font-semibold text-gray-600">Minimum CGPA</p>
                    <p className="text-2xl font-bold text-primary-600">{drive.eligibility_criteria.min_cgpa}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-white rounded-xl border border-orange-100 space-y-2">
                    <p className="text-sm font-semibold text-gray-600">Backlogs Policy</p>
                    <p className="text-lg font-bold text-orange-600">
                      {drive.eligibility_criteria.no_backlogs ? 'Not Allowed' : 'Allowed'}
                    </p>
                  </div>
                  <div className="md:col-span-2 p-4 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100 space-y-2">
                    <p className="text-sm font-semibold text-gray-600">Allowed Branches</p>
                    <div className="flex flex-wrap gap-2">
                      {drive.eligibility_criteria.allowed_branches.map(branch => (
                        <span key={branch} className="px-3 py-1.5 bg-white border border-purple-200 rounded-lg text-sm font-medium text-purple-700 shadow-sm">
                          {branch}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          {/* Application Card */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden top-24">
            <div className="bg-gradient-to-r from-primary-50 to-primary-100/30 px-6 py-4 border-b border-primary-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary-600" />
                Application Details
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <CalendarDays className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Drive Date</p>
                    <p className="font-semibold text-gray-900">{new Date(drive.drive_date).toLocaleDateString(undefined, { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Application Deadline</p>
                    <p className={`font-semibold ${isExpired ? 'text-red-600' : 'text-orange-600'}`}>
                      {new Date(drive.application_deadline).toLocaleDateString(undefined, { 
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    {!isExpired && (
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.ceil((new Date(drive.application_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {!application ? (
                <div className="space-y-4 pt-4">
                  {isExpired ? (
                    <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 font-semibold">
                      <AlertCircle className="w-5 h-5" /> 
                      Applications are now closed
                    </div>
                  ) : showApplyForm ? (
                    <div className="space-y-6 animate-fade-in">
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-gray-700">Select Resume</p>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setResumeOption('profile')}
                            className={`px-4 py-2.5 text-sm font-semibold rounded-xl border-2 transition-all ${
                              resumeOption === 'profile' 
                                ? 'bg-primary-600 border-primary-600 text-white shadow-md' 
                                : 'bg-white border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                            }`}
                          >
                            Use Profile Resume
                          </button>
                          <button
                            onClick={() => setResumeOption('new')}
                            className={`px-4 py-2.5 text-sm font-semibold rounded-xl border-2 transition-all ${
                              resumeOption === 'new' 
                                ? 'bg-primary-600 border-primary-600 text-white shadow-md' 
                                : 'bg-white border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                            }`}
                          >
                            Upload New
                          </button>
                        </div>
                      </div>

                      {resumeOption === 'new' && (
                        <div className="space-y-2 animate-slide-up">
                          <label className="block text-sm font-semibold text-gray-700">Upload Resume (PDF)</label>
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept=".pdf"
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-colors cursor-pointer"
                          />
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => setShowApplyForm(false)}
                          className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleApply}
                          disabled={submitting}
                          className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submitting ? 'Submitting...' : 'Confirm Application'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowApplyForm(true)}
                      className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-bold hover:from-primary-700 hover:to-primary-800 shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                    >
                      Apply Now <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="pt-4">
                  <div className="w-full py-4 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-xl font-semibold border-2 border-green-200 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> 
                    Application Submitted
                  </div>
                  <p className="text-xs text-center text-gray-500 mt-3">Status: {application.status}</p>
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                  By applying, you agree to our placement terms and conditions
                </p>
              </div>
            </div>
          </div>

          {/* Company Info Card */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-purple-100/30 px-6 py-4 border-b border-purple-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                About Company
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{drive.companies.name}</h4>
                  <p className="text-xs text-gray-500">{drive.companies.industry || 'Corporate'}</p>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                {drive.companies.description || 'No company description available.'}
              </p>
              {drive.companies.website && (
                <a 
                  href={drive.companies.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary-600 font-semibold text-sm hover:text-primary-700 transition-colors group"
                >
                  <Globe className="w-4 h-4" />
                  Visit Website
                  <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </a>
              )}
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-gradient-to-r from-secondary-50 via-primary-50 to-secondary-50 rounded-2xl p-5 border border-secondary-100">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-secondary-600" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Application Tips</h4>
                <p className="text-gray-700 text-xs leading-relaxed">
                  • Ensure your resume is up-to-date<br />
                  • Double-check eligibility criteria<br />
                  • Apply before the deadline<br />
                  • Keep your documents ready
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}