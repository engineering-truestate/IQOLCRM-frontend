# Project Folder Structure: IQOLCRM-frontend

This document provides a comprehensive overview of the folder structure for the `IQOLCRM-frontend` project. Each directory and key file is described to help contributors and maintainers understand the organization and purpose of the codebase.

```
IQOLCRM-frontend/
│
├── public/
│   └── (static assets)
│
├── src/
│   ├── components/
│   │   ├── design-elements/
│   │   │   ├── Button.tsx
│   │   │   ├── Button_Test.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── FlexibleTable.tsx
│   │   │   ├── FlexibleTable_Test.tsx
│   │   │   ├── SelectionButtons.tsx
│   │   │   ├── SelectionButtonsGroup.tsx
│   │   │   ├── SelectionButtonsGroup_Test.tsx
│   │   │   ├── StateBaseTextField.tsx
│   │   │   ├── StateBaseTextField_Test.tsx
│   │   │   └── Tabs.tsx
│   │   ├── side-bar/
│   │   ├── acn/
│   │   └── Platforms.tsx
│   │
│   ├── layout/
│   │   └── Layout.tsx
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── canvas-homes/
│   │   └── acn/
│   │
│   ├── services/
│   │   ├── canvas-homes/
│   │   └── api.ts
│   │
│   ├── App.tsx
│   ├── Routes.ts
│   ├── firebase.ts
│   ├── main.tsx
│   ├── index.css
│   └── vite-env.d.ts
│
├── config/
│   └── (configuration files)
│
├── docs/
│   └── (project documentation)
│
├── .husky/
│   └── (git hooks configuration)
│
├── .editorconfig
├── .gitignore
├── .prettierrc.json
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

## Directory Descriptions

- **public/**: Static files served directly. Includes static assets.
- **src/**: Main source code for the React application.
    - **components/**: Reusable UI components.
        - **design-elements/**: Core UI components with their test files
            - Button components and tests
            - Dropdown component
            - FlexibleTable components and tests
            - Selection buttons components and tests
            - State-based text field components and tests
            - Tabs component
        - **side-bar/**: Sidebar navigation components
        - **acn/**: ACN-specific components
        - **Platforms.tsx**: Platform-related component
    - **layout/**: Layout components
        - **Layout.tsx**: Main layout wrapper component
    - **pages/**: Page-level components
        - **auth/**: Authentication pages
            - **Login.tsx**: Login page component
            - **Register.tsx**: Registration page component
        - **canvas-homes/**: Canvas homes related pages
        - **acn/**: ACN-specific pages
    - **services/**: Business logic and API services
        - **canvas-homes/**: Canvas homes related services
        - **api.ts**: API configuration and setup
    - **App.tsx**: Root component
    - **Routes.ts**: Application routing configuration
    - **firebase.ts**: Firebase configuration and setup
    - **main.tsx**: Entry point for React
    - **index.css**: Global styles
    - **vite-env.d.ts**: TypeScript declarations for Vite
- **config/**: Configuration files for the project
- **docs/**: Project documentation
- **.husky/**: Git hooks configuration for pre-commit checks
- **Configuration Files**:
    - **.editorconfig**: Editor configuration for consistent coding style
    - **.gitignore**: Git ignore rules
    - **.prettierrc.json**: Prettier configuration for code formatting
    - **eslint.config.js**: ESLint configuration for code linting
    - **tsconfig.json**: TypeScript configuration
    - **tsconfig.app.json**: TypeScript configuration for the application
    - **tsconfig.node.json**: TypeScript configuration for Node.js environment
    - **vite.config.ts**: Vite build tool configuration
- **package.json**: Project dependencies and scripts
- **package-lock.json**: Locked versions of dependencies

## Component Details

### Design Elements

The `design-elements` directory contains core UI components that are used throughout the application. Each component has its corresponding test file (with `_Test` suffix) for unit testing. Key components include:

- **Button**: Basic button component with variants
- **Dropdown**: Dropdown menu component
- **FlexibleTable**: Advanced table component with sorting and filtering
- **SelectionButtons**: Button group for selection options
- **StateBaseTextField**: Text input with state management
- **Tabs**: Tab navigation component

### Authentication

The `auth` directory contains authentication-related pages:

- **Login.tsx**: User login form and logic
- **Register.tsx**: User registration form and logic

### Services

The services directory is organized by feature:

- **canvas-homes/**: Services specific to canvas homes functionality
- **api.ts**: Core API configuration and setup

---

> **Note:** This structure reflects the current state of the project. The project uses TypeScript, Vite as the build tool, and includes modern development tools like ESLint, Prettier, and Husky for code quality and consistency. Each component in the design-elements directory follows a pattern of having both the main component file and a corresponding test file.
