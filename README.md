# Campus Live

> **"Discover. Participate. Connect."**

Campus Live is a comprehensive college campus activity and engagement management web application designed to centralize information about college activities and make it easier for students to discover and participate in campus events.

The platform is engineered as a role-based system catering to three distinct user groups:
- **Students**
- **Faculty / Staff**
- **Super Admin**

> [!NOTE]
> **Living Document Notice:**
> This documentation is updated continuously as Campus Live development progresses. Features marked as planned or in development are not considered completed until they are implemented and tested. The current development stage is primarily focused on building the frontend user interface and application structure using realistic mock datasets. No active backend database or cloud authentication service has been connected yet.

---

## Table of Contents

1. [Project Objective](#1-project-objective)
2. [Current Technology Stack](#2-current-technology-stack)
3. [Currently Implemented Features](#3-currently-implemented-features)
4. [Student Interface Features](#4-student-interface-features)
5. [Authentication UI](#5-authentication-ui)
6. [Faculty Interface Features](#6-faculty-interface-features)
7. [Important Project Rules & Design Decisions](#7-important-project-rules--design-decisions)
8. [Current Routes](#8-current-routes)
9. [Project Directory Structure](#9-project-directory-structure)
10. [Current Development Status](#10-current-development-status)
11. [Local Setup & Execution](#11-local-setup--execution)
12. [Version Control with Git](#12-version-control-with-git)
13. [Planned Backend & Database Architecture](#13-planned-backend--database-architecture)
14. [Future Database Schema Concept](#14-future-database-schema-concept)
15. [Future Business Logic](#15-future-business-logic)
16. [Development Roadmap](#16-development-roadmap)
17. [Viva & Project Defense Quick Reference](#17-viva--project-defense-quick-reference)
18. [Project Information](#18-project-information)

---

## 1. Project Objective

In traditional collegiate environments, information regarding workshops, hackathons, seminars, cultural events, and technical symposiums is scattered across fragmented communication channels such as disparate WhatsApp groups, notice boards, circulars, and departmental bulletin threads. As a direct result, students frequently miss co-curricular opportunities, face friction during registrations, and lack a single record of their campus engagements.

Campus Live resolves this fundamental communication gap by providing a single, unified digital hub where:

**Students can:**
- Discover upcoming campus activities across multiple categories.
- Access verified details regarding dates, venues, faculty organizers, and registration deadlines.
- Register for activities with immediate feedback and capacity indicators.
- Track their active and past registrations.
- Maintain a verified activity and participation history.
- Explore student clubs, chapter leadership, and upcoming club events.
- Receive campus announcements and activity reminders.
- Submit support tickets and view college FAQ guides.
- Manage academic profiles and professional portfolio links.

**Faculty can:**
- Create and publish new campus activities with eligibility rules and deadlines.
- Manage live activity listings, review applicant rosters, and update session details.
- Access dedicated registration dashboards with search, filtering, and applicant statuses.
- Search the student directory by name, student ID, and college email.
- Inspect the comprehensive **Student 360** profile to review academic standing, registration history, verified on-site participation, and club affiliations.

*Note: Complete backend API integration, authentication services, and database persistence will be implemented in subsequent phases.*

---

## 2. Current Technology Stack

The following technologies are actively integrated into the current codebase:

### Core Frontend & Tooling
- **React (v19.2.8)**: Modern component-based declarative UI library utilizing hooks (`useMemo`, `useState`, `useCallback`, `useParams`, `useNavigate`, `useSearchParams`).
- **Vite (v8.3.0)**: Next-generation frontend build tool and lightning-fast development server with Hot Module Replacement (HMR).
- **JavaScript (ES Modules)**: Modern ECMAScript standard for clean modular architecture.
- **Tailwind CSS (v4.3.3)**: High-performance utility-first styling engine integrated via `@tailwindcss/vite`.
- **React Router DOM (v7.18.4)**: Client-side routing system powering application navigation, URL parameter extraction, and nested route hierarchies.
- **ESLint (v10.10.0)**: Static code analysis framework ensuring code consistency and React hook dependency compliance.
- **Git**: Distributed version control for incremental feature development and branch checkpoints.
- **Google Antigravity / Antigravity IDE**: AI-assisted development environment used for pair programming, architectural design, and refactoring.

> [!IMPORTANT]
> **Architecture Clarification:**
> The current application does **NOT** yet connect to Supabase, PostgreSQL, Express, or Supabase Auth. All current functionality runs locally on the client using structured mock data models. Planned backend services are documented separately under [Planned Backend & Database Architecture](#13-planned-backend--database-architecture).

---

## 3. Currently Implemented Features

### Student Interface
- [x] **Student Dashboard**: Overview metrics, registered upcoming activities, recommended events, announcements, and quick navigation.
- [x] **Explore Activities**: Filterable activity catalog with search, category tabs, department filters, date filters, and capacity badges.
- [x] **Activity Details**: Comprehensive activity breakdown, schedule, venue, organizer profile, eligibility criteria, and registration modal.
- [x] **My Registrations**: Filterable registered activity view (Upcoming, Completed, Cancelled) with registration withdrawal modal.
- [x] **My Activity**: Timeline of participated campus events, attendance records, and engagement summary.
- [x] **Clubs Directory**: Student club discovery interface grouped by technical, cultural, sports, and academic domains.
- [x] **Club Details**: Club profile, leadership/board members, membership requirements, and club-hosted activities.
- [x] **Student Notifications**: Categorized alerts, system updates, activity deadlines, and read/unread filters.
- [x] **Student Support**: Helpdesk ticket submission interface, grievance categories, and collapsible FAQ directory.
- [x] **Student Profile**: Academic profile overview, department, roll number, division, and external social/professional links:
  - LinkedIn
  - GitHub
  - Personal Portfolio
  - Other external URL
- [x] **Student Settings**: Profile preferences, notification controls, UI appearance options, security settings, and password update interface.

### Authentication UI
- [x] **Login Page (`/login`)**: Client-side validated login form with password visibility toggle, role preview hints, and navigation links.
- [x] **Register Page (`/register`)**: Student onboarding form with academic field validation (student ID, department, course, graduation year).
- [x] **Forgot Password Page (`/forgot-password`)**: Password recovery email submission with validation and simulated confirmation state.

### Faculty Interface
- [x] **Faculty Dashboard (`/faculty/dashboard`)**: Activity metrics overview, upcoming department activities, recent student registrations, participation distribution, quick actions, and recent activity logs.
- [x] **Faculty Activities (`/faculty/activities`)**: Activity management directory with search, type/status filters, capacity indicators, and status badges.
- [x] **Create Activity (`/faculty/activities/create`)**: Multi-step activity creation form with validation for title, type, description, banner upload UI preview, dates, registration deadlines, venue, organizer details, eligibility, maximum capacity, and draft/publish actions.
- [x] **Faculty Registrations (`/faculty/registrations`)**: Dedicated registration oversight page with an activity selector dropdown, applicant statistics, search/filter table, applicant details modal, and direct student profile navigation.
- [x] **Faculty Students Directory (`/faculty/students`)**: Searchable student directory featuring instant search (name, student ID, email), multi-criteria filters (Department, Course, Academic Year, Status), and summary metrics.
- [x] **Student 360 (`/faculty/students/:id`)**: Holistic student profile view for authorized faculty mentors including academic information, verified professional links, registration history, separate on-site participation history, club memberships, and chronological activity timeline.

### Super Admin Interface
- [x] **Admin Dashboard Shell (`/admin/dashboard`)**: Initial administrative overview framework for multi-department management.

---

## 4. Student Features

Every student feature is implemented with clean, accessible UI components and local state management:

### 1. Student Dashboard (`/student/dashboard`)
- Welcoming interface with time-aware greeting.
- Quick statistical summaries: Active Registrations, Activities Completed, and Club Memberships.
- "Upcoming Activities" timeline displaying next-up events with countdown cues.
- Recommended activities carousel based on the student's department.
- Campus announcement banner highlighting institutional notifications.

### 2. Explore Activities (`/student/activities`)
- Search bar matching activity titles, tags, and organizer names.
- Category filters: *All, Technical, Cultural, Sports, Workshop, Seminar, Hackathon*.
- Status and date filters (Today, This Week, This Month).
- Activity cards showcasing title, thumbnail preview, date/time, venue, seats remaining, and "Register" button.

### 3. Activity Details (`/student/activities/:id`)
- High-resolution activity banner with category and status badges.
- Full event description, learning takeaways, and speaker/faculty coordinator details.
- Practical information grid: Venue, Eligibility, Registration Deadline, and Available Seats.
- Interactive Registration Action opening a confirmation modal with seat count validation.

### 4. My Registrations (`/student/my-registrations`)
- Tabbed view: *All, Confirmed, Waitlisted, Cancelled*.
- Shows application date, confirmation ID, and event schedule.
- Safe cancellation dialog allowing students to withdraw registrations to free up seats.

### 5. My Activity (`/student/my-activity`)
- Personal record of verified activity participation.
- Historical attendance status: *Participated, Attended, Certificate Issued*.
- Chronological breakdown of campus engagement by semester.

### 6. Clubs Directory & Details (`/student/clubs`, `/student/clubs/:id`)
- Catalog of collegiate student organizations and technical societies.
- Club details page showing mission, faculty advisor, student executive committee, and membership status.
- Listing of past and upcoming events hosted by the club.

### 7. Notifications (`/student/notifications`)
- Notification center with categories: *All, Activities, Registrations, System*.
- Read/Unread toggles and timestamp indicators.

### 8. Support & Helpdesk (`/student/support`)
- Interactive FAQ accordion covering common campus queries.
- Ticket creation form with priority selection (Low, Medium, High) and category tagging.
- Contact directory for student affairs and technical support.

### 9. Profile & Settings (`/student/profile`, `/student/settings`)
- Personal information card (Name, PRN/Student ID, Branch, Semester, College Email).
- Professional links UI displaying clickable links to LinkedIn, GitHub, and Portfolio.
- Settings management: email notification preferences, appearance theme toggles, and change password interface.

---

## 5. Authentication UI

The authentication screens are fully built with client-side state handling and form validation:

- **Login (`/login`)**:
  - Email and password input fields with inline error messaging.
  - Show/hide password visibility toggle.
  - Role switcher helper buttons to test Student and Faculty personas.
  - Direct routes to "Create an account" and "Forgot password?".
- **Registration (`/register`)**:
  - Fields for Full Name, College Email, Student ID / Roll Number, Department, Course, and Password confirmation.
  - Real-time password strength validation rules.
  - Terms of service and privacy policy consent check.
- **Forgot Password (`/forgot-password`)**:
  - Email recovery form with strict format validation.
  - Simulated submission state providing user feedback.
  - Navigation back to login.

> [!NOTE]
> Authentication screens operate as a frontend prototype with mock session simulation. Connection to Supabase Auth and server-side token generation will be added during the authentication integration phase.

---

## 6. Faculty Features

The faculty portal empowers educators and event coordinators to oversee activities and student progress:

### 1. Faculty Dashboard (`/faculty/dashboard`)
- High-level metric cards: Total Activities Created, Total Registrations Received, Average Turnout Rate, and Active Activities.
- "Upcoming Activities" table with live enrollment counters.
- "Recent Registrations" live stream showing newly applied students.
- "Turnout & Participation Overview" showing conversion rates by activity type.
- Quick Actions: Create Activity, Manage Registrations, Search Students.

### 2. Faculty Activities (`/faculty/activities`)
- Comprehensive listing of department-managed events.
- Search filter by activity title and coordinator name.
- Filter chips: *Status (Published, Ongoing, Completed, Draft)* and *Type (Workshop, Hackathon, Seminar, etc.)*.
- Capacity progress indicator (`Registrations / Max Capacity`).
- Quick-edit modal to update venue, timing, or participant limits on the fly.

### 3. Create Activity (`/faculty/activities/create`)
- Professional multi-section form:
  - **Activity Details**: Title, Type dropdown, Description textarea, Banner upload UI with live thumbnail preview.
  - **Schedule & Location**: Date, Start/End Time, Registration Deadline, Venue / Room Number.
  - **Capacity & Eligibility**: Target Department, Eligible Batches, Maximum Participants, Registration Open/Close toggles.
  - **Coordinator Info**: Faculty In-Charge, Student Leads, Department Contact.
- Save as Draft or Publish immediately with full frontend validation.

### 4. Faculty Registrations (`/faculty/registrations`)
- Activity selector dropdown displaying aggregate stats for the chosen event.
- Real-time enrollment metric cards: Confirmed, Waitlisted, Cancelled, Attendance Rate.
- Searchable registration table showing student name, ID, department, registration timestamp, and status badge.
- Applicant inspection modal with direct link to the student's Student 360 profile.

### 5. Faculty Students Directory (`/faculty/students`)
- Overview metrics: Total Students, Active Students, Students with Registrations, Students with Club Memberships.
- Instant search bar matching Name, Student ID, or College Email.
- Filter controls: Department (*Computer Science, IT, Electronics, Mechanical, Civil, Other*), Course (*B.Tech, M.Tech, BCA, MCA*), Academic Year (*1st, 2nd, 3rd, 4th Year*), and Status (*Active, Inactive*).
- Responsive student table with direct "View Student" navigation to `/faculty/students/:id`.

### 6. Student 360 (`/faculty/students/:id`)
- **Header**: Avatar, Name, Student ID, College Email, Department, Course, Year, Status, and "Contact Student" mailto trigger.
- **Basic Information Card**: Full academic record, phone, division, plus verified professional links (LinkedIn, GitHub, Portfolio) opening in new tabs.
- **Activity Overview**: Separated metrics for Total Registrations, Activities Participated, Upcoming Registrations, and Cancelled Registrations.
- **Registration History**: Application records with event dates and registration status (`Registered` vs `Cancelled`).
- **Participation History**: Distinct section displaying verified attendance records (`Participated` vs `Not Participated`) and recording dates.
- **Club Memberships**: List of joined student organizations, category, role (*Member*, *Volunteer*, *Core Member*), and activities organized.
- **Activity Timeline**: Chronological event stream tracking registrations, attendances, and club milestones.

---

## 7. Important Project Rules & Design Decisions

The development of Campus Live strictly adheres to these foundational principles:

1. **No Activity Points or Gamification Scoring**:
   Campus Live does **NOT** incorporate "Activity Points", leaderboards, or artificial gamified scoring. The application is built for genuine activity management, student discovery, and authentic participation tracking.

2. **Strict Separation of Registration and Participation**:
   - **Registration**: Indicates that a student has reserved a seat or submitted an application for an activity.
   - **Participation**: Indicates verified on-site attendance and completion of the activity.
   - Registrations are **never** automatically converted into participation. They remain separate database concepts and metric cards throughout the system.

3. **Dynamic Available Seat Calculation**:
   Seat availability is calculated strictly using the formula:
   $$\text{Available Seats} = \text{Maximum Participants} - \text{Valid Confirmed Registrations}$$
   Cancelled or withdrawn registrations release capacity back to the available pool.

4. **Data-Driven Analytics**:
   All metrics and chart representations are structured to derive directly from transactional database records rather than arbitrary hardcoded summaries.

5. **Strict Role-Based Privacy & Separation**:
   Faculty tools and Student 360 profiles are restricted to authorized faculty and staff. Students cannot access other students' Student 360 records or internal faculty management views.

---

## 8. Current Routes

All routes configured in [`src/App.jsx`](file:///d:/Campuslive_Activity_Management/src/App.jsx):

### Public & Authentication
| Route | Component | Description |
|---|---|---|
| `/` | `Home` | Public landing page introducing Campus Live |
| `/login` | `Login` | Role-aware login screen with validation |
| `/register` | `Register` | Student registration and onboarding screen |
| `/forgot-password` | `ForgotPassword` | Password reset request screen |

### Student Portal
| Route | Component | Description |
|---|---|---|
| `/student/dashboard` | `StudentDashboard` | Primary student command center & metrics |
| `/student/activities` | `ExploreActivities` | Filterable catalog of campus activities |
| `/student/activities/:id` | `ActivityDetails` | Detailed activity info and registration modal |
| `/student/my-registrations` | `MyRegistrations` | Active and past registration records |
| `/student/registrations` | `MyRegistrations` | Alternate route alias for registrations |
| `/student/my-activity` | `MyActivity` | Personal participation and attendance timeline |
| `/student/history` | `MyActivity` | Alternate route alias for participation history |
| `/student/clubs` | `StudentClubs` | Directory of student clubs and chapters |
| `/student/clubs/:id` | `ClubDetails` | In-depth club profile and event listing |
| `/student/notifications` | `StudentNotifications` | Notification center and announcements |
| `/student/support` | `StudentSupport` | Helpdesk ticket submission & FAQ library |
| `/student/profile` | `StudentProfile` | Personal student profile & social links |
| `/student/settings` | `StudentSettings` | Account, notification, and appearance settings |

### Faculty Portal
| Route | Component | Description |
|---|---|---|
| `/faculty/dashboard` | `FacultyDashboard` | Faculty overview, stats, and live activity feed |
| `/faculty/activities` | `FacultyActivities` | Activity catalog management & status filters |
| `/faculty/activities/create` | `FacultyCreateActivity` | Activity creation form with banner preview |
| `/faculty/activities/:id` | `FacultyPlaceholder` | Parameterized activity preview placeholder |
| `/faculty/activities/:id/edit`| `FacultyPlaceholder` | Activity editing workflow placeholder |
| `/faculty/registrations` | `FacultyRegistrations` | Activity-based student registration roster |
| `/faculty/students` | `FacultyStudents` | Searchable directory of college students |
| `/faculty/students/:id` | `FacultyStudent360` | Comprehensive Student 360 profile |
| `/faculty/clubs` | `FacultyPlaceholder` | Faculty club sponsorship overview |
| `/faculty/analytics` | `FacultyPlaceholder` | Departmental engagement analytics placeholder |
| `/faculty/notifications` | `FacultyPlaceholder` | Faculty notification center placeholder |
| `/faculty/support` | `FacultyPlaceholder` | Faculty support requests placeholder |
| `/faculty/profile` | `FacultyPlaceholder` | Faculty account profile placeholder |

### Super Admin Portal
| Route | Component | Description |
|---|---|---|
| `/admin/dashboard` | `AdminDashboard` | Campus-wide administrative overview |

---

## 9. Project Directory Structure

```text
Campuslive_Activity_Management/
├── dist/                          # Production build output
├── public/                        # Static assets (favicons, manifest)
├── src/                           # Source code root
│   ├── assets/                    # Static image and SVG assets
│   ├── components/                # Reusable UI component library
│   │   ├── common/                # Atomic and molecular components
│   │   │   ├── ActivityCard.jsx   # Card displaying activity details and action
│   │   │   ├── Badge.jsx          # Status and category badge indicator
│   │   │   ├── Breadcrumb.jsx     # Hierarchical page breadcrumb navigation
│   │   │   ├── Button.jsx         # Accessible primary, outline, ghost buttons
│   │   │   ├── Card.jsx           # Clean rounded content container card
│   │   │   ├── ClubCard.jsx       # Card displaying student club metadata
│   │   │   ├── ConfirmationDialog.jsx # Modal confirmation dialog for actions
│   │   │   ├── Dropdown.jsx       # Custom accessible dropdown selector
│   │   │   ├── EmptyState.jsx     # Zero-data fallback component with action
│   │   │   ├── IconButton.jsx     # Button styled for standalone icons
│   │   │   ├── Input.jsx          # Form text input with label and validation
│   │   │   ├── LoadingState.jsx   # Spinner and skeleton loader component
│   │   │   ├── Modal.jsx          # Accessible backdrop modal dialog
│   │   │   ├── NotificationItem.jsx # Single notification feed item
│   │   │   ├── PageHeader.jsx     # Reusable title, subtitle & action bar
│   │   │   ├── PasswordInput.jsx  # Input with visibility toggle
│   │   │   ├── SearchBar.jsx      # Clean search input with clear trigger
│   │   │   ├── Select.jsx         # Form select dropdown component
│   │   │   ├── StatCard.jsx       # Metric card with icon, change, and subtext
│   │   │   ├── Table.jsx          # Reusable responsive table wrapper
│   │   │   ├── Tabs.jsx           # Tab switcher with active underline
│   │   │   ├── Textarea.jsx       # Form textarea component
│   │   │   └── index.js           # Central barrel export for common components
│   │   ├── icons/                 # SVG icon components (Inter, Lucide-style)
│   │   │   └── Icons.jsx          # Curated SVG icons collection
│   │   └── layout/                # Shell and structural layout elements
│   │       ├── BaseLayout.jsx     # Foundation layout with Sidebar + Navbar
│   │       ├── Navbar.jsx         # Top header with profile, search, alerts
│   │       └── Sidebar.jsx        # Navigation sidebar with responsive collapse
│   ├── config/                    # Configuration and static navigations
│   │   └── navigation.js          # Student, Faculty, and Admin route trees
│   ├── data/                      # Realistic mock datasets for frontend UI
│   │   ├── activitiesData.js      # Student activity catalog mock records
│   │   ├── clubsData.js           # Student club and committee records
│   │   ├── facultyActivitiesData.js # Faculty-managed activity records
│   │   ├── facultyDashboardData.js  # Faculty metrics, turnouts, and feeds
│   │   ├── facultyRegistrationsData.js # Registration applicants by activity
│   │   ├── facultyStudentsData.js # 12 detailed student records with 360 data
│   │   ├── myActivityData.js      # Verified student participation timeline
│   │   ├── notificationsData.js   # Notification center mock feed
│   │   ├── profileData.js         # Student profile details and social links
│   │   ├── registrationsData.js   # Student registration records
│   │   ├── studentDashboardData.js # Student metric cards and quick events
│   │   └── supportData.js         # FAQ items and ticket categories
│   ├── layouts/                   # Role-specific layout wrappers
│   │   ├── FacultyLayout.jsx      # Faculty layout binding facultyNav
│   │   ├── StudentLayout.jsx      # Student layout binding studentNav
│   │   └── SuperAdminLayout.jsx   # Admin layout binding adminNav
│   ├── pages/                     # Routed view components
│   │   ├── ActivityDetails.jsx    # Student activity detail & registration modal
│   │   ├── AdminDashboard.jsx     # Super Admin overview dashboard
│   │   ├── ClubDetails.jsx        # Individual club view with board members
│   │   ├── ExploreActivities.jsx  # Student activity discovery page
│   │   ├── FacultyActivities.jsx  # Faculty activity management page
│   │   ├── FacultyCreateActivity.jsx # New activity creation workflow
│   │   ├── FacultyDashboard.jsx   # Faculty command center
│   │   ├── FacultyPlaceholder.jsx # Reusable fallback for secondary pages
│   │   ├── FacultyRegistrations.jsx # Faculty activity applicant roster
│   │   ├── FacultyStudent360.jsx  # Detailed Student 360 profile
│   │   ├── FacultyStudents.jsx    # Faculty student directory
│   │   ├── ForgotPassword.jsx     # Password recovery form
│   │   ├── Home.jsx               # Landing page
│   │   ├── Login.jsx              # Role-aware authentication login
│   │   ├── MyActivity.jsx         # Student participation history
│   │   ├── MyRegistrations.jsx    # Student registered events & cancel modal
│   │   ├── Register.jsx           # Student registration form
│   │   ├── StudentClubs.jsx       # Student clubs catalog
│   │   ├── StudentDashboard.jsx   # Student main dashboard
│   │   ├── StudentNotifications.jsx # Student notification center
│   │   ├── StudentProfile.jsx     # Student profile & social links
│   │   ├── StudentSettings.jsx    # Student preferences & security
│   │   └── StudentSupport.jsx     # Helpdesk, tickets, and FAQs
│   ├── App.css                    # Application-wide supplementary rules
│   ├── App.jsx                    # Root router and route declarations
│   ├── index.css                  # Tailwind CSS root imports and base tokens
│   └── main.jsx                   # React application entry point
├── .gitignore                     # Git ignored files (node_modules, dist)
├── eslint.config.js               # ESLint configuration
├── index.html                     # HTML document template
├── package.json                   # Project metadata, dependencies, scripts
├── package-lock.json              # Deterministic dependency lockfile
├── README.md                      # Project documentation
└── vite.config.js                 # Vite bundler configuration
```

---

## 10. Current Development Status

| Feature / Module | Status | Notes |
|---|---|---|
| **Project Setup & Tooling** | Completed | React 19, Vite, Tailwind CSS v4, React Router DOM |
| **Common UI Design System** | Completed | 23 reusable components (Buttons, Cards, Modals, Forms, Stats) |
| **Student Dashboard** | Completed | Overview metrics, quick events, announcements |
| **Explore Activities** | Completed | Search, multi-category filters, event cards |
| **Activity Details** | Completed | Detailed description, organizer info, registration modal |
| **My Registrations** | Completed | Application status tracking, cancel registration flow |
| **My Activity (Participation)** | Completed | Participation history, attendance milestones |
| **Student Clubs & Club Details** | Completed | Club directory, committee board, hosted activities |
| **Notifications & Support** | Completed | Filterable alerts, FAQ accordions, ticket creation UI |
| **Student Profile & Settings** | Completed | Academic details, professional links (LinkedIn, GitHub), preferences |
| **Authentication UI** | Completed | Login, Register, Forgot Password with client validation |
| **Faculty Dashboard** | Completed | Summary stats, upcoming sessions, registration stream, turnout metrics |
| **Faculty Activities** | Completed | Activity listing, search, status filters, edit modal |
| **Create Activity UI** | Completed | Comprehensive form, banner upload preview, draft/publish actions |
| **Faculty Registrations** | Completed | Activity dropdown selector, applicant table, filter/search, detail modal |
| **Faculty Students Directory** | Completed | Student directory, search by name/ID/email, 4-way filter, stats |
| **Student 360 Profile** | Completed | Holistic student view, basic info, separate registration & participation history, clubs, timeline |
| **Super Admin Dashboard Shell** | Completed | Basic overview layout |
| **Supabase Database Integration** | Planned | Database connection to be added in future phase |
| **PostgreSQL Schema & Tables** | Planned | Relational entities designed, pending migration setup |
| **Express REST APIs** | Planned | Backend server endpoints planned for data persistence |
| **Supabase Auth Integration** | Planned | Real JWT-based authentication to replace mock state |
| **Real Notifications System** | Planned | Database-backed alerts and webhooks |
| **Real-time Analytics Engine** | Planned | SQL aggregations and reporting |
| **Row Level Security (RLS)** | Planned | Database authorization rules for multi-tenant isolation |
| **Production Cloud Deployment** | Planned | Cloud hosting and CI/CD pipelines |

---

## 11. Local Setup & Execution

Follow these steps to run the Campus Live frontend application on your local machine:

### Prerequisites
- **Node.js**: `v18.0.0` or higher (Node.js 20 LTS recommended)
- **npm**: `v9.0.0` or higher
- **Git**: Installed and configured on your command line

### Installation
1. Clone the repository or navigate to the project directory:
   ```bash
   cd Campuslive_Activity_Management
   ```
2. Install all project dependencies:
   ```bash
   npm install
   ```

### Running the Development Server
Launch Vite's hot-reloading development server:
```bash
npm run dev
```
Once started, the application will be accessible at:
```text
http://localhost:5173
```

### Running the Linter
Verify code style and check for hook or syntax issues:
```bash
npm run lint
```

### Building for Production
Create an optimized production bundle in the `dist/` directory:
```bash
npm run build
```

### Previewing the Production Build
Locally serve and preview the compiled production distribution:
```bash
npm run preview
```

---

## 12. Version Control with Git

Git is utilized to track all incremental milestones, feature additions, and UI refactors.

### Typical Development Workflow
```bash
# Check modified and untracked files
git status

# Stage changes
git add .

# Create a clear descriptive commit
git commit -m "feat(faculty): implement students directory and student 360 profile"

# View recent commit history
git log --oneline -n 5
```

---

## 13. Planned Backend & Database Architecture

> [!IMPORTANT]
> **Planned Architecture Notice:**
> The components described below represent the technical architecture planned for future development phases. None of these backend services are currently active or connected.

```text
┌────────────────────────────────────────────────────────┐
│               React + Vite Frontend Client             │
│            (Campus Live Role-Based Interface)          │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / REST / JSON
                            ▼
┌────────────────────────────────────────────────────────┐
│             API Gateway & Authentication Layer         │
│             • Supabase Auth (JWT Verification)         │
│             • Optional Express.js REST API Layer       │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│           Supabase Cloud / Managed PostgreSQL          │
│             • PostgreSQL Relational Database           │
│             • Row Level Security (RLS) Policies        │
│             • Supabase Storage (Activity Banners)      │
│             • Database Triggers & Stored Procedures    │
└────────────────────────────────────────────────────────┘
```

### Planned Backend Services
1. **Supabase Auth**: Secure user signup, login, session tokens, and role metadata (Student, Faculty, Super Admin).
2. **Managed PostgreSQL**: Relational database engine enforcing strict foreign key constraints and ACID transactions.
3. **Supabase Storage**: Secure object storage buckets for activity thumbnails, student avatars, and club logos.
4. **Express.js API Layer**: Custom business logic endpoints for seat reservations, waitlist processing, and bulk attendance recording.
5. **Row Level Security (RLS)**: Fine-grained database authorization ensuring students can only view or modify their own registrations, while faculty can only access authorized departmental cohorts.

---

## 14. Future Database Schema Concept

The planned database structure uses a relational design to model interconnected campus entities:

### Expected Relational Tables
- **`users` / `profiles`**: User identity, role (`student`, `faculty`, `super_admin`), college email, full name, phone, department, academic year, division, and social profile links.
- **`activities`**: Activity title, category, full description, banner image URL, date, start/end time, registration deadline, venue, organizer information, eligibility criteria, maximum capacity, status (`Draft`, `Published`, `Cancelled`, `Completed`), and created by faculty ID.
- **`registrations`**: Many-to-many relationship linking a student to an activity. Fields: registration timestamp, status (`Registered`, `Waitlisted`, `Cancelled`), cancellation timestamp, and remarks.
- **`participation`**: Verified on-site attendance record separate from registration. Fields: activity ID, student ID, verification timestamp, attendance status (`Participated`, `Not Participated`), and verified by faculty ID.
- **`clubs`**: Club name, description, category, logo URL, established date, and faculty advisor ID.
- **`club_memberships`**: Relational junction table linking students to clubs. Fields: student ID, club ID, role (`Member`, `Volunteer`, `Core Member`, `Lead`), joined date, and status.
- **`notifications`**: Targeted user alerts, notification type, title, message body, read status, and delivery timestamp.
- **`support_tickets`**: Student support inquiries, subject, category, priority, status (`Open`, `In Progress`, `Resolved`), and created timestamp.
- **`ticket_messages`**: Threaded conversation history for support tickets.

### Why PostgreSQL?
Relational databases are ideal for Campus Live because campus engagements are inherently relational:
- A student belongs to one department and has multiple registrations.
- An activity has a strict capacity limit and many registered applicants.
- A club has multiple members with varying leadership roles.
- Registrations and participations must maintain referential integrity without data duplication.

---

## 15. Future Business Logic

The following core business logic rules are planned for server-side implementation:

1. **Atomic Available Seat Calculation & Concurrency**:
   - To prevent over-subscription when multiple students apply simultaneously, database transactions with row-level locking will validate available seats before confirming an application:
     $$\text{Seats Remaining} = \text{max\_participants} - \text{COUNT}(\text{valid confirmed registrations})$$
2. **Registration vs. Participation Decoupling**:
   - Registering for an activity reserves a seat.
   - Participation is marked separately by faculty coordinators using QR code check-in or manual roster verification.
   - Non-attendance does not delete the registration history; it updates participation records to `Not Participated`.
3. **Automated Registration Capacity Checks**:
   - If an activity reaches capacity, further registration attempts will be placed on a waitlist or blocked with a clear "Event Full" notification.
4. **Registration Cancellation & Seat Recycling**:
   - When a student cancels an upcoming registration, the seat is released back to the general pool or allocated to the next waitlisted applicant.
5. **Role-Based Access Enforcement**:
   - Students cannot access faculty creation workflows or other students' Student 360 dashboards.
   - Faculty cannot alter system-wide administrative settings.

---

## 16. Development Roadmap

- [x] **Phase 1: Project Setup & UI Foundation** — Vite setup, Tailwind CSS configuration, router hierarchy, and atomic component library.
- [x] **Phase 2: Student Portal UI** — Dashboard, activity catalog, activity details, registrations, participation history, clubs, notifications, support, and profile.
- [x] **Phase 3: Authentication UI** — Login, registration, and forgot password screens with client validation.
- [x] **Phase 4: Faculty Portal UI** — Faculty dashboard, activity management, activity creation workflow, registration management, student directory, and Student 360 profile.
- [ ] **Phase 5: Super Admin Portal UI** — Multi-department oversight, user role administration, and institutional reporting interfaces.
- [ ] **Phase 6: Supabase Database Setup** — Schema creation, foreign key constraints, indexes, and initial seeding.
- [ ] **Phase 7: Authentication Integration** — Supabase Auth client, secure session tokens, and route authorization guards.
- [ ] **Phase 8: Express REST API Endpoints** — Dedicated backend services for business logic and data manipulation.
- [ ] **Phase 9: Real Registration & Capacity Engine** — Transactional registration engine with race condition handling.
- [ ] **Phase 10: Real-time Notification Dispatcher** — Email and in-app alerts for event confirmations and schedule changes.
- [ ] **Phase 11: Analytics & Reporting Engine** — Live SQL aggregation queries for faculty and admin dashboards.
- [ ] **Phase 12: Security & Row Level Security (RLS)** — Fine-grained multi-tenant access control policies.
- [ ] **Phase 13: End-to-End Testing** — Automated integration tests, accessibility audits, and responsiveness checks.
- [ ] **Phase 14: Cloud Production Deployment** — Frontend deployment on Vercel/Netlify, managed database hosting, and domain configuration.

---

## 17. Viva & Project Defense Quick Reference

Concise answers to common technical and architectural questions:

**Q: What is Campus Live?**  
**A:** Campus Live is a web-based campus activity and engagement management platform that centralizes college activities, registrations, student clubs, notifications, and participation records into a single role-based application.

**Q: What core problem does it solve?**  
**A:** It eliminates communication scatter where event details are fragmented across informal messaging groups and notice boards, ensuring students never miss opportunities and faculty can manage activities effectively.

**Q: Why was React chosen?**  
**A:** React provides a declarative, component-based architecture that enables the creation of reusable UI components (cards, tables, modals) and efficient state synchronization across complex workflows.

**Q: Why was Vite chosen over Create React App?**  
**A:** Vite leverages native ES modules to offer near-instant development server boot times, extremely fast Hot Module Replacement (HMR), and optimized production bundling using Rollup.

**Q: Why use Tailwind CSS?**  
**A:** Tailwind CSS eliminates bloated stylesheets through utility-first classes, enabling responsive layouts, consistent design tokens, and clean UI styling directly within components.

**Q: What are the main user roles in Campus Live?**  
**A:** Three distinct roles: **Student** (event discovery, registration, participation tracking), **Faculty / Staff** (activity creation, registration management, Student 360 review), and **Super Admin** (institutional configuration and platform governance).

**Q: Why are registration and participation treated as separate concepts?**  
**A:** Registration indicates an intention to attend (reserving a seat), whereas participation indicates verified on-site presence. Treating them separately ensures accurate attendance analytics and prevents automated inflation of participation figures.

**Q: What is the Student 360 view?**  
**A:** Student 360 is a faculty-only comprehensive dashboard that aggregates a student's academic profile, professional links, registration records, verified participation history, club memberships, and chronological engagement timeline in one place.

**Q: Why is PostgreSQL planned as the database engine?**  
**A:** The platform's data model is relational by nature (students, activities, registrations, clubs, and tickets are strictly linked). PostgreSQL guarantees referential integrity, ACID compliance, and complex query capabilities.

**Q: Why is Supabase planned for backend services?**  
**A:** Supabase offers a managed PostgreSQL database, built-in user authentication with JWTs, row-level security (RLS), and object storage without the overhead of building standard boilerplate services from scratch.

---

## 18. Project Information

- **Project Name**: Campus Live
- **Tagline**: Discover. Participate. Connect.
- **Lead Developer / Student**: Nisarg Thombre
- **Institution**: [To be added]
- **Department**: [To be added]
- **Academic Year**: [To be added]
- **Project Guide**: [To be added]

---
*(End of Documentation — Updated for Phase 4: Faculty Students & Student 360 Implementation)*
