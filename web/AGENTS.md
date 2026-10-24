# FanniTech - web Staff Portal

# Overview

The FanniTech web staff Portal is a web application designed to facilitate the management of staff-related tasks and information, providing a user-friendly interface for staff memebers to access and manage their work-related data efficiently. The portal is built using modern web technologies and follows best practices in web development to ensure a seamless user experience. the portal is designed for managing between Admin and Technicians, allowing to enhance the service quality that offer to Customers.

this cotext file is offer specific view of the FanniTech web staff portal, providing an overview of its features, architecture, and development guidelines and it works on a side of `front-web-skill`so it complements the other documentation.

---

# Product Scope

The FanniTech web staff portal is is designed to provide a comprehensive solution for managing staff-related tasks and information. The portal offers the following features and functionalities:

- User authentication and authorization
- Staff profile management
- Task assignment and tracking
- Communication tools
- Reporting and analytics

---
# Tech Stack

the FanniTech web staff portal is built using the following technologies:

- **Next.js**: A React framework for building server-side rendered and statically generated web applications.
- **TypeScript**: A statically typed superset of JavaScript that adds type safety and improved developer experience.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development and styling.
- **zustand**: A state management library for managing application state in a simple and efficient manner.
- **Axios**: A promise-based HTTP client for making API requests to the backend server.
- **shadecn/ui**: A component library for building user interfaces with pre-designed components and styles.
- **lucide-react**: A library for using Lucide icons in React applications.

---

# Project Structure

- FanniTech web Staff Portal is organized into the following main directories:

- `public/`: Contains static assets such as images, fonts, and other files that are publicly accessible.
- `src/`: Contains the source code of the application, including components, pages, styles, and utilities.
    - `components/`: Contains reusable UI components used throughout the application.
    - `pages/`: Contains the Next.js pages that define the routes and views of the application
    - `Hooks/`: Contains custom React hooks that can be used across the application.
    - `Portal/`: Contains zustand state-management store for managing application state.
    - `utils/`: Contains utility functions and helper methods used throughout the application.
    - `services/`: Contains services for making API requests and handling data interactions with the backend server.
    - `lib/`: Contains libraries and modules that provide additional functionality to the application.
    - `types/`: Contains TypeScript type definitions and interfaces used in the application.
    - `app/api/`: Contains API route handlers for server-side logic and data processing.

the project structure is designed to promote reusability, maintainability, and scalability, allowing developers to easily navigate and work on different parts of the application.

---

# Project Architecture

- FanniTech web staff portal split the pages into two main sections:

``` flow
    (admin)/
    |
    |-- Dashboard
    |- Customers
    |- Technicians
    |- Reports
    |- Settings
    |__Notification
    
    (Technician)/
    |
    |- Dashboard
    |- assigned Repair Tickets
    |- profile
    |__ settings

```

this is the main architecture of the FanniTech web staff portal, allowing for clear separation of concerns and efficient management of staff-related tasks and information.

---

# Excutable Commands

- FanniTech web staff portal provides the following commands for development and production:

- `npm run dev`: Starts the development server and allows developers to view and test the application locally.
- `npm run build`: Builds the application for production, optimizing the code and assets for deployment.
- `npm run start`: Starts the production server to serve the built application.
- `npm run lint`: Runs the ESLint tool to analyze the code for potential errors and enforce coding standards.
- `npm run type-check`: Runs the TypeScript compiler to check for type errors in the codebase without emitting any output files.

These is the main commands used for development and production, allowing developers to efficiently build, test, and deploy the FanniTech web staff portal.

---

# state management

- FanniTech web staff portal uses `zustand` for state management, providing a simple and efficient way to manage application state. The state management is organized into the following main stores:

- `Dialog visibility`: Manages the visibility of dialog components in the application, allowing for easy control of modal windows and pop-ups.
- `Temporary UI state`:  Manages temporary UI state, such as loading indicators, error messages, and success notifications.
- `Local filters`: Manages local filters for data display, allowing users to customize the view of information based on their preferences.

Keep stores focused around meaningful application domains.

DO NOT make authentication store manges by `zustand` because it is a sensitive data.

Only Create Store when shared state is actually require it.

---

# Api Communication

FanniTech web staff portal uses `Axios` for making HTTP requests to the backend server, allowing for efficient communication and data exchange between the frontend and backend. The API communication is organized into the following main services:

- all Api backend communication is handled by `api/` directory, which contains and handled all the API requests and responses, providing a centralized location for managing API interactions.
- `services/` directory contains Business logic and data processing, allowing for separation of concerns and improved maintainability of the codebase.
- `utils/` directory contains utility functions and helper methods for handling API requests and responses, providing reusable code for common tasks such as error handling, data formatting, and request configuration.

## some rules about API communication

- MUST all the Api communication should be handled by `api/` directory, which contains and handled all the API requests and responses, providing a centralized location for managing API interactions.
- MUST all the Business logic and data processing should be handled by `services/` directory, allowing for separation of concerns and improved maintainability of the codebase.
- MUST all the utility functions and helper methods for handling API requests and responses should be handled by `utils/` directory, providing reusable code for common tasks such as error handling, data formatting, and request configuration.
- MUST all the API endpoints should be well-documented and follow a consistent naming convention.

- Do Every API request should be handled by a service function, which encapsulates the logic for making the request and processing the response, allowing for easy reuse and testing of API interactions.

- DO NOT make any Backend HTTP requests directly from the components, instead use the `api/` directory to handle all API interactions, ensuring a clear separation of concerns and improved maintainability of the codebase.
- DO NOT make any Business logic and data processing directly in the components, instead use the `services/` directory to handle all business logic and data processing, ensuring a clear separation of concerns and improved maintainability of the codebase.

---

# Best practices

FanniTech web staff portal follows best practices in web development to ensure a high-quality codebase and maintainable application. Some of the best practices include:

- MUST NOT use mappingApiResponse function, rather than use interfaces and types to define the expected structure of API responses, allowing for better type safety and improved code readability.
- MUST use TypeScript interfaces and types to define the expected structure of API responses, allowing for better type safety and improved code readability.
``` tsx
    // bad and unpopular way
    const mappingApiResponse = (response: any): User => {
        return {
            id: response.id,
            name: response.name,
            email: response.email,
            // map other properties as needed
        }
    }
```
rather than use this way preferable: 
``` tsx
    // good and popular way
    interface User {
        id: number;
        name: string;
        email: string;
        // define other properties as needed
    }

    const fetchUser = async (): Promise<User> => {
        const response = await axios.get('/api/user');
        return response.data as User;
    }
```
- DO NOT use any third-party libraries for API response mapping, instead rely on TypeScript interfaces and types to define the expected structure of API responses, ensuring a consistent and maintainable codebase.
- DO NOT use any third-party libraries for state management, instead use `zustand` for managing application state, providing a simple and efficient solution for state management in the FanniTech web staff portal.

---

# Data Fetching

For FanniTech web staff portal, data fetching is an essential aspect of the application, allowing for efficient retrieval and display of dynamic data. The following guidelines should be followed for data fetching:

- MUST use server-side rendering (SSR) for pages that require dynamic data fetching, allowing for improved SEO and faster initial page load times.
- MUST use `useSWR` Hook for client-side data fetching, providing a simple and efficient way to fetch and cache data in React components.
- MUST handle errors and loading states appropriately when fetching data, providing a smooth user experience and clear feedback to users.
- MUST optimize data fetching for performance, minimizing the number of API calls and reducing the amount of data transferred.
- MUST NOT use any third-party libraries for data fetching, instead rely on built-in Next.js features and `useSWR` Hook for efficient data fetching and caching in the FanniTech web staff portal.
- MUST NOT use any global state management for data fetching, instead use local state and `useSWR` Hook for managing data fetching and caching in individual components, ensuring a clear separation of concerns and improved maintainability of the codebase.

This is the se are the main guidelines for data fetching in the FanniTech web staff portal, ensuring efficient retrieval and display of dynamic data while following best practices in web development.

---

# SEO

- this part is extend for the SEO part in the `front-web-skill` documentation, and it is used to provide specific guidelines and best practices for optimizing the FanniTech web staff portal for search engines.

** FanniTech web staff portal not need to be optimized for SEO because it is a private portal for staff members and not intended for public access. However, the following guidelines can be followed to ensure that the portal is optimized for search engines if needed in the future:**

---

# Accessibility

- this part is extend for the Accessibility part in the `front-web-skill` documentation, and it is used to provide specific guidelines and best practices for ensuring that the FanniTech web staff portal is accessible to all users, including those with disabilities.

---

# Performance Optimization

- this part is extend for the Performance Optimization part in the `front-web-skill` documentation, and it is used to provide specific guidelines and best practices for optimizing the performance of the FanniTech web staff portal, ensuring fast load times and smooth user interactions, here some specific guidelines for performance optimization in the FanniTech web staff portal:

- MUST use code splitting and lazy loading for components and modules, allowing for faster initial page load times and improved performance.
- MUST Dashboard page should be optimized for performance, as it is the main entry point for staff members and may contain a large amount of data and components.
- MUST use caching strategies for API requests and data fetching, reducing the number of API calls and improving performance.
- MUST optimize images and other media assets for performance, reducing file sizes and improving load times.
- Must optimize Dashboard Graphs and Charts for performance, as they may contain a large amount of data and require efficient rendering.

- Must NOT use any third-party libraries for performance optimization, instead rely on built-in Next.js features and best practices for optimizing the performance of the FanniTech web staff portal.

---

# Error Handling

this Error handleing part is extend for the Error Handling part in the `front-web-skill`, `front-end-skill` documentation, and it is used to provide specific guidelines and best practices for handling errors in the FanniTech web staff portal, ensuring a smooth user experience and clear feedback to users.

