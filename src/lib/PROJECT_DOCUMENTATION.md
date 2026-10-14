# PlaceX: College Placement Management System

PlaceX is a high-performance, secure, and modern placement management system designed to streamline the interaction between students, placement coordinators, and companies.

## 🚀 Technology Stack

- **Frontend**: React (with Vite for rapid development and HMR)
- **Styling**: Tailwind CSS (plus custom glassmorphism and high-contrast dark themes)
- **Typography**: Plus Jakarta Sans (Modern, premium sans-serif)
- **Backend/Database**: Supabase (PostgreSQL with real-time capabilities)
- **Authentication**: Supabase Auth (bridged via a custom `AuthContext` provider)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

---

## 🔐 Authentication & Security Architecture

PlaceX uses a robust authentication system that ensures data privacy through **PostgreSQL Row Level Security (RLS)**.

### The AuthContext
The `src/context/AuthContext.tsx` handles the entire user lifecycle:
- Manages the `user` object and `userRole`.
- Implements non-blocking role fetching so the UI renders instantly while permissions load in the background.
- Centralizes `signIn`, `signUp`, and `signOut` logic.

### RLS & Security Definer Functions
To prevent recursive policy deadlocks (a common PostgreSQL pitfall), PlaceX uses `SECURITY DEFINER` helper functions:
- `is_admin(user_id)`: Checks if a user has the explicit 'admin' role.
- `is_admin_or_coordinator(user_id)`: Checks for elevated privileges.
These functions run with the privileges of the creator (`postgres`), allowing them to bypass circular RLS checks when verifying user roles.

---

## 👥 Roles & Responsibilities

### 🎓 Student Role
The primary user of the system.
- **Profile Management**: Maintain academic records (CGPA, Branch, Year) and upload resumes (PDF only).
- **Placement Discovery**: Browse active and upcoming placement drives with detailed eligibility criteria.
- **Application Tracking**: One-click application to drives and a dedicated "My Applications" dashboard to track real-time status (Shortlisted, Offered, etc.).
- **Statistics**: View overall placement trends and personal progress.

### 🛡️ Admin/Coordinator Role
The system overseers.
- **Placement Drive Management**: Create, edit, and close placement opportunities.
- **Company Management**: Onboard new recruiting partners and manage their profiles.
- **Application Review**: Review student resumes, verify academic details, and update application statuses.
- **Student Management**: Oversee all registered student profiles and academic standings.

---

## 🔄 Core Workflows

### 1. The Student Lifecycle
1. **Signup/Login**: Student creates an account.
2. **Profile Completion**: **Crucial Step.** Students must set their Branch, Year, CGPA, and upload a Resume. Applying is disabled until the profile is 100% complete to ensure high-quality data for companies.
3. **Discovery**: Student explores the "Placement Drives" section.
4. **Application**: Student applies to a drive. The system automatically checks for:
    - Minimum CGPA requirements.
    - Branch eligibility.
    - Application deadlines.
5. **Tracking**: Student monitors status changes in "My Applications".

### 2. The Admin Lifecycle
1. **Onboarding**: Admin adds a new Company to the database.
2. **Setup**: Admin creates a "Placement Drive" for that company, defining package (LPA), location, and eligibility.
3. **Review**: As students apply, the Admin uses the "Review Applications" dashboard.
4. **Action**: Admin downloads resumes and updates statuses (Pending -> Shortlisted -> Selected).

---

## 📊 Database Schema Summary

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `profiles` | Stores student and admin metadata. | Ties to `auth.users` (Supabase). |
| `companies` | Directory of recruiting partners. | Parent of `placement_drives`. |
| `placement_drives`| Active job postings/drives. | Belongs to `companies`. |
| `applications` | Junction table for student entries. | Links `profiles` and `drives`. |

---

## 🎨 UI/UX Design System

PlaceX focuses on a **High-Contrast, Premium Aesthetic**:
- **Typography**: 'Plus Jakarta Sans' provides a crisp, modern feel.
- **Grayscale Contrast**: Primary text uses `text-gray-900` or `text-gray-800` to ensure maximum legibility against white backgrounds.
- **Micro-Animations**: Uses Tailwind-based animations (`animate-slide-up`, `animate-fade-in`) for smooth page transitions.
- **Glassmorphism**: Subtle backdrop blurs are used in the sidebar and header for a modern layered effect.

---

## 📁 Directory Structure

```text
src/
├── components/          # Reusable UI (Sidebar, Layout, ProtectedRoute)
├── context/             # AuthContext (The app's brain)
├── hooks/               # Custom hooks (useAuth)
├── lib/                 # Supabase client & SQL Schema
├── pages/
│   ├── admin/           # Admin-only management pages
│   └── student/         # Student dashboards and profiles
└── index.css            # Global styles and tailwind configuration
```

---

## ⚙️ Development Highlights
- **HMR Stabilization**: Fixed Vite Fast Refresh issues by decoupling the Auth Provider from unstable hook dependencies.
- **Storage Triggers**: Implemented automatic profile updates upon resume uploads via dedicated frontend logic to ensure consistency.
