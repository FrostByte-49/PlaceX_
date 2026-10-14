import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { GraduationCap, Mail, Lock } from 'lucide-react'
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
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
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

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      console.error('Login error:', err)
      toast.error(err.message || 'Failed to sign in. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md animate-slide-up">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle>Welcome to PlaceX</CardTitle>
          <CardDescription>
            Sign in to access your placement dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex flex-col space-y-4 w-full">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              <p className="text-sm text-gray-800 text-center">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary-600 hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}