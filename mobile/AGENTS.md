# FanniTech Mobile Application

## Overview

FanniTech is a mobile App is a Customer-facing application that allows users to access, monitor, and manage thier devices and status for repair process. the app provides a user-friendly interface for customers to interact with the FanniTech services, track their repair requests, and receive notifications about the status of their devices.The mobile application is part of the FanniTech V1 product, which focuses on the workflow between the customer, the repair center, and the technician. The core workflow starts when a customer submits a repair request and continues through request acceptance, diagnosis, repair, readiness for pickup, and completion.The application is designed to give customers visibility into the repair process and their devices while providing a simple interface for interacting with the repair center.

---

## Tech Stack

- **Library/Framework:** expo React Native
- **State Management:** Zustand / TanStack Query / React Hook Form
- **Navigation:** Expo Router
- **UI Components:** shadecn-ui/ React Native components/ React Native Paper
- **Networking:** Axios
- **Icons:** Lucide Icons
- **Testing:** Jest, React Native Testing Library
- **Linting and Formatting:** ESLint, Prettier

---

## running the application command

- `npx expo start` - Start the development server and launch the Expo Dev Tools.
- `npx expo install  <package-name>` - Install a package and its dependencies using Expo's package manager.
- `npx expo build:android` - Build the Android version of the application.
- `npx expo build:ios` - Build the iOS version of the application.

---

## Features

- **User Authentication:** Secure login and registration for customers to access their accounts.
- **Profile Management:** Customers can view and update their profile information, including contact details and preferences.
- **Repair Request Submission:** Customers can submit repair requests for their devices, providing necessary details and selecting the type of repair needed.
- **Repair Status Tracking:** Customers can track the status of their repair requests in real-time, receiving updates on each stage of the process.
- **Notifications:** Push notifications to inform customers about important updates regarding their repair requests, such as acceptance, diagnosis, and completion.
- **Device Management:** Customers can view and manage their devices, including adding new devices and viewing repair history.

---

## Architecture

The FanniTech mobile application follows a feature oriented Architecture, where each feature is organized into its own module. This modular approach allows for better maintainability and scalability of the application. The architecture is designed to separate concerns, making it easier to manage and update individual features without affecting the entire application.

The application is separate into UI Components, State Management, Hooks, app, feature, utils and Services. the UI Components are responsible for rendering the user interface, while State Management handles the application's state and data flow. Hooks provide reusable logic for various features, and the app module serves as the entry point for the application. The feature modules contain the core functionality of the application, and utils provide utility functions that can be used across different modules. Services handle communication with external APIs and backend services.

the common components that applies on all app preferable to put it in the `src/components` folder, and the feature specific components should be put in the `src/features/<feature-name>/components` folder. the same applies for hooks, utils and services.

the common hooks that applies on all app preferable to put it in the `src/hooks` folder, and the feature specific hooks should be put in the `src/features/<feature-name>/hooks` folder. the same applies for utils and services.

### Main Layers

the application is structured into several main layers, each serving a specific purpose:

- **src**: The source code of the application, containing all the necessary files and directories for the app's functionality.
- **app**: The entry point of the application, responsible for initializing the app and setting up navigation.
- **features**: Contains the core features of the application, organized into separate modules for better maintainability and scalability.
- **components**: common UI components that can be used across different features and screens, promoting code reusability and consistency in the user interface.
- **hooks**: Custom hooks that encapsulate reusable logic and state management for various features, allowing for cleaner and more maintainable code.
- **services**: Handles communication with external APIs and backend services, providing a centralized location for managing data fetching and interactions with the server.
- **utils**: Utility functions and helpers that can be used across different modules, promoting code reusability and reducing duplication.
- **types**: TypeScript type definitions and interfaces that provide type safety and improve code quality by catching errors during development.
- **stores**: Contains Zustand stores for managing local UI state and global application state, allowing for easy access and updates to state across different components and features.

The dependency directions are designed to ensure that higher-level modules can depend on lower-level modules without creating circular dependencies. This allows for a clear separation of concerns and promotes a more maintainable codebase.

```flow
app -> features -> hooks/services -> utils
    -> components
    -> types
    -> stores
```

---

## Project Structure

- **src**: Contains the source code of the application, including all features, components, hooks, services, utils, and types.
  - **app**: The entry point of the application, responsible for initializing the app and setting up navigation.
  - **features**: Contains the core features of the application, organized into separate modules for better maintainability and scalability.
  - **components**: Reusable UI components that can be used across different features and screens, promoting code reusability and consistency in the user interface.
  - **hooks**: Custom hooks that encapsulate reusable logic and state management for various features, allowing for cleaner and more maintainable code.
  - **services**: Handles communication with external APIs and backend services, providing a centralized location for managing data fetching and interactions with the server.
  - **utils**: Utility functions and helpers that can be used across different modules, promoting code reusability and reducing duplication.
  - **types**: TypeScript type definitions and interfaces that provide type safety and improve code quality by catching errors during development.

### Root configuration files

- **package.json**: Contains the project's dependencies, scripts, and metadata.
- **tsconfig.json**: TypeScript configuration file that defines compiler options and settings for the project.
- **.eslintrc.js**: ESLint configuration file that defines linting rules and settings for the project.
- **.prettierrc**: Prettier configuration file that defines formatting rules and settings for the project.
- **.gitignore**: Specifies files and directories that should be ignored by Git version control.
- **README.md**: Provides an overview of the project, its features, and instructions for setup and usage.
- **app.json**: Expo configuration file that defines app settings, such as name, version, and platform-specific configurations.
- **babel.config.js**: Babel configuration file that defines presets and plugins for transpiling JavaScript code.
- **metro.config.js**: Metro bundler configuration file that defines settings for bundling and serving the application during development.
- **tailwind.config.js**: Tailwind CSS configuration file that defines custom styles, themes, and settings for the application.

---

## Data & Business Flow

```flow
customer -> Mobile App -> Repair Request -> Repair Center -> Repair Tickets -> technician -> diagnosis -> repair -> ready for pickup -> completion
```

this is the main flow of the application, where a customer submits a repair request through the mobile app, which is then processed by the repair center. The repair center creates repair tickets and assigns them to technicians for diagnosis and repair. Once the repair is completed, the device is marked as ready for pickup, and the customer is notified of the completion.

---

## Api/services Layer

All communication with the backend services is handled through the `services` layer, which provides a centralized location for managing data fetching and interactions with external APIs. The services layer is responsible for making HTTP requests, handling responses, and managing errors. The services layer is designed to be reusable and modular, allowing for easy integration with different features of the application. It abstracts the complexity of API communication, providing a simple interface for the rest of the application to interact with backend services. The services layer also includes utility functions for handling common tasks, such as authentication, data transformation, and error handling. This ensures that the application can efficiently communicate with the backend services while maintaining a clean and maintainable codebase.

UI components and screens should not directly communicate with the backend services. Instead, they should rely on the services layer to handle all API interactions. This separation of concerns promotes a more maintainable and scalable architecture, allowing for easier updates and modifications to the backend services without affecting the UI components and screens.

A services layer is responsible for:

- Authentication Request
- Customer operations
- Device operations
- Repair Request operations
- Repair Ticket/status retrieval
- Notifications

---

## State Management

the application uses Zustand and TanStack Query for state management. Zustand is a lightweight state management library that provides a simple and intuitive API for managing application state. It allows for easy creation of global state stores and provides a reactive approach to state management, making it easy to update and access state across different components.

the application distinguishes between:

- **Local UI State**: Managed using Zustand, this state is used for managing UI-related data, such as form inputs, modal visibility, and other local component states. Zustand provides a simple and efficient way to manage local UI state without the need for complex state management solutions.
- **server/Api state**: Managed using TanStack Query, this state is used for managing data fetched from the backend services. TanStack Query provides a powerful and efficient way to manage server state, including caching, background updates, and automatic refetching of data. It allows for easy integration with the services layer, providing a seamless experience for fetching and managing data from the backend.
- **form state**: Managed using React Hook Form, this state is used for managing form inputs and validation. React Hook Form provides a simple and efficient way to manage form state, including handling input values, validation, and submission. It allows for easy integration with the UI components and services layer, providing a seamless experience for managing form data in the application.

State should keeped as close as posible to the feature that uses it, and should not be shared between features unless necessary. This promotes a more modular and maintainable architecture, allowing for easier updates and modifications to individual features without affecting the entire application.

---

## Performance

The application should Provide a smooth and responsive user experience, with fast load times and minimal lag. The application should be optimized for performance, with efficient data fetching, caching, and rendering. The application should also be designed to handle large amounts of data and complex interactions without compromising performance.

### Guidelines for Performance Optimization

- Avoid unnecessary component re-renders.
- Keep the expensive computations outside the rendering components.
- Use appropriate list visualization for large collections, such as FlatList or SectionList.
- Avoid loading large amounts of dataset at once, and implement pagination or infinite scrolling when necessary.
- Optimize Image and Avoid unnecessary large assets loading, and use appropriate image formats and sizes.
- Avoid unnecessary API calls and implement caching strategies to reduce network requests.
- Cach server Data where appropriate, and use TanStack Query for efficient data fetching and caching.
- Display loading State while asyncronous operations are in progress, and provide feedback to the user during data fetching or processing.
- Handle slow or failed network requests gracefully, and provide appropriate error messages and retry options for failed requests.
- Keep screens responsive and avoid blocking the main thread with heavy computations or long-running tasks.
- Avoid unnecessary State updates and re-renders, and use memoization techniques to optimize performance.

---

## Error & Network Handling

the application should handle:

- Network failures gracefully, providing appropriate error messages and retry options for failed requests.
- Api errors and unexpected responses, providing appropriate error messages and handling edge cases.
- Unexpected application errors, providing appropriate error messages and logging for debugging purposes.
- Authentication errors, providing appropriate error messages and handling token expiration or invalid credentials.
- Empty states and no data scenarios, providing appropriate messages and UI feedback for users when there is no data to display.
- Loading states and feedback for users during data fetching or processing, providing appropriate loading indicators and messages to inform users of ongoing operations.
- Unexpected errors and exceptions, providing appropriate error messages and logging for debugging purposes.

Errors should be presented to the user in a clean and actionable way, the application should not expose the raw Backend errors directly to the user, but instead provide user-friendly error messages that guide the user on how to resolve the issue or retry the operation. The application should also log errors for debugging purposes, allowing developers to identify and fix issues in a timely manner.

---

## UI/Design System

- **Design System:** shadecn-ui/ React Native components/ React Native Paper
- **Typografy:** Use a consistent typography system throughout the application, including font sizes, weights, and styles. Ensure that text is legible and accessible across different devices and screen sizes.
- **Color Palette:** Use a consistent color palette throughout the application, including primary, secondary, and accent colors. Ensure that colors are accessible and provide sufficient contrast for readability.
- **Dark and Light Mode:** Implement dark and light mode support, allowing users to switch between themes based on their preferences. Ensure that the UI components and colors adapt appropriately to the selected theme.
- **Styling Tool**: Use nativewind for styling, providing a utility-first approach to styling components and screens. Ensure that styles are consistent and reusable across different features and modules of the application.

---

## Testing

Testing should be cover the following areas:

1. Authentication
2. Repair Request Submission
3. Repair Status Tracking
4. Notifications
5. Error Handling
6. Form Validation
7. Device Management
8. Critical reusable components

the testing tools used in the application is Jest, which is a JavaScript testing framework, and React Native Testing Library, which provides utilities for testing React Native components. The testing strategy should include unit tests, integration tests, and end-to-end tests to ensure the application functions as expected and meets the requirements.

---

## Environment configuration

Environment-specific configuration must not be hardcoded in the application.

Examples include:

- API Base URL
- Environment configuration
- public application configuration
- Feature Flag

All the Environment varibles must be contain in the `.env` file, and should loaded `process.env` using `react-native-dotenv` package.

---

## Development Conventions

- use TypeScript for type safety and improved code quality.
- follow a consistent code style and naming conventions.
- write clean, maintainable, and well-documented code.
- use version control effectively to manage changes and collaborate with other developers.
- Keep API communicatin in `services` layer, and avoid direct API calls from UI components or screens.
- Reuse existing components and hooks whenever possible, and avoid duplicating code.
- Follow the project naming conventions and folder structure for consistency and maintainability.
- Do not introduce new dependencies without proper evaluation and approval, and avoid unnecessary bloat in the project.
- Do not modify project architecture unnecessarily.
- Avoid using `any` type in TypeScript, and strive for strong typing throughout the application.
- Use `eslint` and `prettier` for code linting and formatting, and ensure that code adheres to the defined rules and standards.

---

## Forbidden Practices

- Avoid using `any` type in TypeScript, and strive for strong typing throughout the application.
- Avoid using inline styles, and use the defined styling system and utility classes for consistency and maintainability.
- Must not use funtion like `MapApiResponse` in the services layer.
- Avoid writing unnecessary complex logic in UI components or screens, and keep the logic in hooks or services layer for better maintainability and testability.
- Avoid writing unnecessary comments in the codebase, and strive for self-explanatory code that is easy to read and understand.
- Avoid using deprecated or outdated libraries or packages, and keep the project dependencies up to date with the latest stable versions.
- Avoid using hardcoded values or magic numbers in the codebase, and use constants or configuration files for better maintainability and readability.
- Avoid using global state for managing local UI state, and keep the state as close as possible to the feature that uses it. Use Zustand for local UI state management and TanStack Query for server state management.
