import { useState, type FormEvent, type ChangeEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { GraduationCap, Mail, Lock, User, Hash } from 'lucide-react'
import { toast } from 'react-hot-toast'

// Simple Button Component
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: "button" | "submit" | "reset"
  disabled?: boolean
  className?: string
}

const Button = ({ children, onClick, type = "button", disabled = false, className = "" }: ButtonProps) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium ${className}`}
  >
    {children}
  </button>
)

// Simple Input Component
interface InputProps {
  id: string
  type?: string
  placeholder?: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  className?: string
}

const Input = ({ id, type = "text", placeholder, value, onChange, required = false, className = "" }: InputProps) => (
  <input
    id={id}
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required={required}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${className}`}
  />
)

// Simple Label Component
interface LabelProps {
  htmlFor: string
  children: React.ReactNode
}

const Label = ({ htmlFor, children }: LabelProps) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
    {children}
  </label>
)

// Simple Select Component
interface SelectProps {
  id?: string
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}

const Select = ({ id, value, onValueChange, children }: SelectProps) => (
  <select
    id={id}
    value={value}
    onChange={(e: ChangeEvent<HTMLSelectElement>) => onValueChange(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
  >
    {children}
  </select>
)

interface SelectItemProps {
  value: string
  children: React.ReactNode
}

const SelectItem = ({ value, children }: SelectItemProps) => (
  <option value={value}>{children}</option>
)

// Simple Card Components
interface CardProps {
  children: React.ReactNode
  className?: string
}

const Card = ({ children, className = "" }: CardProps) => (
  <div className={`bg-white rounded-lg shadow-lg ${className}`}>{children}</div>
)

interface CardHeaderProps {
  children: React.ReactNode
}

const CardHeader = ({ children }: CardHeaderProps) => <div className="px-6 pt-6 pb-4">{children}</div>

interface CardTitleProps {
  children: React.ReactNode
}

const CardTitle = ({ children }: CardTitleProps) => <h2 className="text-2xl font-bold text-gray-900">{children}</h2>

interface CardDescriptionProps {
  children: React.ReactNode
}

const CardDescription = ({ children }: CardDescriptionProps) => <p className="text-sm text-gray-800 mt-1">{children}</p>

interface CardContentProps {
  children: React.ReactNode
}

const CardContent = ({ children }: CardContentProps) => <div className="px-6 pb-4">{children}</div>

interface CardFooterProps {
  children: React.ReactNode
}

const CardFooter = ({ children }: CardFooterProps) => <div className="px-6 pb-6">{children}</div>

interface FormData {
  email: string
  password: string
  name: string
  rollNumber: string
  branch: string
  currentYear: string
}

export default function Signup() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
    rollNumber: '',
    branch: '',
    currentYear: ''
  })
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signUp(formData.email, formData.password, {
        name: formData.name,
        roll_number: formData.rollNumber,
        branch: formData.branch,
        current_year: parseInt(formData.currentYear)
      })
      toast.success('Account created! Please check your email for confirmation.')
      navigate('/login')
    } catch (err: any) {
      console.error('Signup error:', err)
      toast.error(err.message || 'Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl animate-slide-up">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>
            Join PlaceX to start your placement journey
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="rollNumber">Roll Number</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="rollNumber"
                    placeholder="CS2024001"
                    value={formData.rollNumber}
                    onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@college.edu"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="branch">Branch</Label>
                <Select id="branch" value={formData.branch} onValueChange={(value: string) => handleInputChange('branch', value)}>
                  <SelectItem value="">Select branch</SelectItem>
                  <SelectItem value="CS">Computer Science</SelectItem>
                  <SelectItem value="IT">Information Technology</SelectItem>
                  <SelectItem value="ECE">Electronics & Communication</SelectItem>
                  <SelectItem value="MECH">Mechanical</SelectItem>
                  <SelectItem value="CIVIL">Civil</SelectItem>
                  <SelectItem value="EE">Electrical</SelectItem>
                </Select>
              </div>
              <div>
                <Label htmlFor="currentYear">Current Year</Label>
                <Select id="currentYear" value={formData.currentYear} onValueChange={(value: string) => handleInputChange('currentYear', value)}>
                  <SelectItem value="">Select year</SelectItem>
                  <SelectItem value="1">1st Year</SelectItem>
                  <SelectItem value="2">2nd Year</SelectItem>
                  <SelectItem value="3">3rd Year</SelectItem>
                  <SelectItem value="4">4th Year</SelectItem>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex flex-col space-y-4 w-full">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating account...' : 'Sign Up'}
              </Button>
              <p className="text-sm text-gray-800 text-center">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}