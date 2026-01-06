
# ODC Hub – Frontend (React + TypeScript + Tailwind)

This repository contains the **frontend application** of the **ODC Hub platform**.  
It is built using **React, TypeScript, Vite, and Tailwind CSS** and follows a clean, modular admin-dashboard architecture.

The frontend communicates with the backend via **REST APIs** and uses **cookie-based JWT authentication** (no tokens stored in localStorage).

---

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router
- Context API
- JWT Authentication (HttpOnly cookies)

---

## Project Structure (Detailed Explanation)

```txt
FREE-REACT-TAILWIND-ADMIN-DASHBOARD-MAIN
│
├── public/
│   ├── images/                     # Static images (logos, avatars, etc.)
│   └── favicon.png
│
├── src/
│   ├── api/                        # API communication layer
│   │   ├── axios.ts                # Axios instance (baseURL, credentials)
│   │   ├── auth.ts                 # Auth APIs (login, logout, me)
│   │   └── profile.ts              # User profile APIs
│   │
│   ├── components/                 # Reusable UI components
│   │   ├── auth/                   # Authentication components
│   │   │   ├── SignInForm.tsx
│   │   │   ├── SignUpForm.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   ├── ResetPasswordPage.tsx
│   │   │   └── ProtectedRoute.tsx  # Route guard
│   │   │
│   │   ├── header/
│   │   │   ├── Header.tsx
│   │   │   ├── UserDropdown.tsx
│   │   │   └── NotificationDropdown.tsx
│   │   │
│   │   ├── form/                   # Generic form system
│   │   │   ├── Form.tsx
│   │   │   ├── Label.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── MultiSelect.tsx
│   │   │   └── date-picker.tsx
│   │   │
│   │   └── charts/                 # Charts & statistics
│   │
│   ├── context/                    # Global state management
│   │   ├── AuthContext.tsx         # Auth state (user, login, logout)
│   │   ├── ThemeContext.tsx        # Light/Dark mode
│   │   └── SidebarContext.tsx
│   │
│   ├── layout/                     # Application layout
│   │   ├── AppLayout.tsx           # Main layout wrapper
│   │   ├── AppHeader.tsx
│   │   ├── AppSidebar.tsx
│   │   ├── SidebarWidget.tsx
│   │   └── Backdrop.tsx
│   │
│   ├── pages/                      # Application pages (routes)
│   │   ├── AuthPages/
│   │   │   ├── SignIn.tsx
│   │   │   ├── SignUp.tsx
│   │   │   ├── ActivateAccount.tsx
│   │   │   ├── ResendActivation.tsx
│   │   │   └── UpdatePasswordModal.tsx
│   │   │
│   │   ├── Dashboard/              # Dashboard pages
│   │   ├── User/
│   │   │   ├── UserManagementPage.tsx
│   │   │   └── PendingUsersPage.tsx
│   │   │
│   │   ├── Calendar.tsx
│   │   ├── Charts/
│   │   ├── Tables/
│   │   ├── Forms/
│   │   └── UIElements/
│   │
│   ├── hooks/                      # Custom React hooks
│   ├── icons/                      # SVG icons
│   ├── index.css                   # Tailwind base styles
│   ├── App.tsx                     # Routes definition
│   ├── main.tsx                    # Application entry point
│   └── vite-env.d.ts
│
├── .env                            # Environment variables (not committed)
├── .gitignore
├── package.json
├── vite.config.ts
└── README.md
````

## Authentication & Security

- Authentication uses JWT stored in HttpOnly cookies
- No access or refresh token is stored in localStorage
- User data is fetched using /auth/me
- Route protection is handled by ProtectedRoute.tsx

## Running the Project

 1. Install dependencies

```bash  
npm install
```

 1. Start development server

 ```bash
npm run dev
```

The app will be available at: <http://localhost:5173>

## Backend Requirements

The frontend expects the backend to:

- Enable CORS with credentials

- Use cookie-based JWT

## Team Development Rules

- Never store secrets in code
- Always use api/axios.ts for HTTP calls
- New pages → src/pages
- Reusable UI → src/components
- API logic → src/api
- Authentification state → AuthContext
- to collaborate, push changes to your branch then open pull request → NEVER push to main directly !

## Common Issues

- Login works but user is not authenticated
- Axios must use withCredentials: true
- CORS must allow credentials

## Notes

This project follows clean architecture principles and is designed to be:

✔ Scalable

✔ Maintainable

✔Team-friendly

For backend documentation, API contracts, or onboarding guides, see the backend repository.

## Happy coding codezillas🚀
