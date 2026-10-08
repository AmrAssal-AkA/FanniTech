# FanniTech Backend server Api

# overview

The FanniTech Backend server Api is the cental API and business-logic layer for the FanniTech platform. It is responsible for handling requests from the frontend, processing data, and interacting with the database and other services required by the repair center management Dashboard and customer Mobile Application.

The Backend I Build using nestjs framework and TypeScript language. the nestjs provide a modular architecture, suitable for building scalable and maintainable server-side applications, and testing server-side applications. The nestjs framework is built on top of Express.js, which is a popular web application framework for Node.js.

---

# Tech Stack

- Node.js
- NestJS
- TypeScript
- PostgreSQL
- Redis
- Docker
- Swagger
- VJest
- zod
- lint
- prisma
- Prettier

---

# excutable commands

- `npm run start:dev` - Start the server in development mode with hot-reloading.
- `npm run start:prod` - Start the server in production mode.
- `npm run Start:debug` - Start the server in debug mode.
- `nest generate <resource>` - Generate a new resource (module, controller, service, etc.) using the NestJS CLI.
- `npm run lint` - Run the linter to check for code style and formatting issues.
- `npm run test` - Run the unit tests using Jest.
- `npm run test:watch` - Run the unit tests in watch mode, re-running tests on file changes.
- `npm run test:cov` - Run the unit tests and generate a code coverage report.
- `npm run typecheck` - Run the TypeScript compiler to check for type errors without emitting any output files.
- `npm run test:e2e` - Run the end-to-end tests using Jest.
- `npm run format` - Format the code using Prettier.

---

# Backend responsiblities

the backend provide the APIs and business logic for the FanniTech platform, including:

- Authentication customer and repair center users.
- manage customer and thier devices.
- Receive and manage customer repair requests.
- convert acceptable repair requests into repair tickets.
- manage repair requests througnt the repair process, including assigning technicians, tracking progress, and updating status.
- Allow technician to perform diagnostic checks and provide a repair notes.
- Manage repair statuses and status history.
- Maintan customer repair history and provide repair history to customer and repair center users.
- Provide real-time notifications to customers and repair center users about the status of their repair requests.
- provide Dashboard-related data for repair-center users.
- Enforce role-based permissions for Owner/Admin and Technician users.

---

# supported Application

the backend serves two main client applications:

## Repair Center Management Dashboard

the web dashboard is used by:

- Owner/Admin users to manage the repair center operations, including managing customers, devices, repair requests, technicians, and viewing reports.
- Technician users to view and manage their assigned repair requests, perform diagnostic checks, and update repair statuses.

it provides funtionalities for dashbords, customer management, repair request management, repair tickets, technician management, and reporting.

## Customer Mobile Application

The customer mobile application is used by customers to:

- create an account.
- login to their account and logout.
- Manage their devices and view device details.
- submit repair requests for their devices.
- Track the status of their repair requests and view repair history.
- Receive real-time notifications about the status of their repair requests.

The Backend therefore exposes APIs for both the Repair Center Management Dashboard and the Customer Mobile Application, enabling seamless communication and data exchange between the frontend applications and the backend server.

---

# Authentication

- Customer Authentication:
  - login
  - register
  - logout
  - reset password
  - forgot password
  - verify email

- Repair Center Authentication:
  - Admin Login
  - Technician Login
  - logout
  - password reset

---

# Authorization and roles

- Owner/Admin:
  - Manage Technicians: Add, update, and remove technicians from the system.
  - Manage Customers: View and manage customer accounts and their associated devices.
  - Manage devices: Add, update, and remove devices from the system.
  - Manage repair requests: View and manage all repair requests, including assigning technicians and updating statuses.
  - Assign Technicians: Assign technicians to repair requests based on their availability and expertise.
  - Update Repair Statuses: Update the status of repair requests as they progress through the repair process.
  - View Dashboard: Access the dashboard to view key metrics, reports, and analytics related to the repair center operations.
  - Manage Basic settings: Update basic settings for the repair center, such as contact information, working hours, and notification preferences.

- Technician:
  - View Assigned Repair Requests: Access a list of repair requests assigned to them, along with relevant details such as customer information, device details, and repair history.
  - Update Repair Statuses: Update the status of repair requests they are working on, such as marking them as "In Progress," "Completed," or "On Hold."
  - Perform Diagnostic Checks: Conduct diagnostic checks on devices and provide repair notes or recommendations for further action.
  - View Repair History: Access the repair history of devices they have worked on, including previous repairs and customer feedback.
  - Add Repair Notes: Add notes or comments related to the repair process, including observations, findings, and recommendations for future repairs.
  - View Customer Information: Access relevant customer information, such as contact details and repair history, to facilitate communication and provide better service.
  - Mark Repair Requests as Completed: Indicate when a repair request has been successfully completed and notify the customer accordingly.
  - View Device Details: Access detailed information about the devices they are repairing, including specifications, previous repairs, and any relevant documentation.

---

# Core Domain

The backend manages the relationship between the following core domain entities:

- Customer: Represents the end-users who submit repair requests for their devices. Customers can create accounts, manage their devices, and track the status of their repair requests.
- Device: Represents the devices owned by customers that require repair services. Each device is associated with a customer and can have multiple repair requests over time.
- Repair Request: Represents a customer's request for repair services for a specific device. Repair requests can be submitted through the customer mobile application and are managed by the repair center dashboard. Each repair request has a status that indicates its progress through the repair process.
- Repair Ticket: Represents an accepted repair request that has been converted into a repair ticket for processing. Repair tickets are assigned to technicians and tracked throughout the repair process. Each repair ticket has a status that indicates its progress and can have associated repair notes and diagnostic checks performed by technicians.
- Technician: Represents the repair center staff responsible for handling repair requests and performing diagnostic checks on devices. Technicians can view their assigned repair requests, update repair statuses, and add repair notes. They play a crucial role in ensuring that repair requests are processed efficiently and effectively.
- Repair Status: Represents the current state of a repair request or repair ticket. Repair statuses can include "Pending," "In Progress," "Completed," and "On Hold." The status of a repair request or ticket is updated as it progresses through the repair process, providing customers and repair center staff with real-time information about the progress of their repairs.
- Diagnostic Check: Represents the process of evaluating a device to identify issues and determine the necessary repairs. Technicians perform diagnostic checks on devices and provide repair notes or recommendations for further action. Diagnostic checks are an essential part of the repair process, ensuring that devices are accurately assessed and repaired.
- Repair Note: Represents the notes or comments added by technicians during the repair process. Repair notes can include observations, findings, and recommendations for future repairs. They provide valuable information for both customers and repair center staff, helping to ensure that devices are repaired effectively and efficiently.
- Repair History: Represents the record of all repairs performed on a specific device. Repair history includes information about previous repair requests, repair tickets, diagnostic checks, and repair notes. It provides customers and repair center staff with a comprehensive view of a device's repair history, helping to inform future repairs and maintenance.

```flow
Customer
   │
   ├── owns one or more Devices
   │
   └── submits Repair Requests
              │
              └── relates to one Device
                       │
                       └── accepted request
                              │
                              ▼
                         Repair Ticket
                              │
                              └── assigned to Technician
                                         │
                                         ▼
                                      Diagnosis
                                         │
                                         ▼
                                      Repair
                                         │
                                         ▼
                                  Ready for Pickup
                                         │
                                         ▼
                                     Completed

```

---

# Repair request API Domain

Customer Can submit repair requests for their devices through the customer mobile application. The repair request API domain handles the creation, management, and tracking of these repair requests. It provides endpoints for customers to submit new repair requests, view the status of their existing requests, and access their repair history.

- A repair request contain information such like:
  - Customer: The customer who submitted the repair request, including their contact information and account details.
  - Device: The device that requires repair, including its specifications, model, and any relevant documentation.
  - problem: A description of the issue or problem that the customer is experiencing with their device, which helps technicians understand the nature of the repair needed.
  - description: A more detailed explanation of the problem, providing additional context and information for technicians to assess the repair request accurately.
  - Request Status: The current status of the repair request, which indicates its progress through the repair process. Possible statuses include "Pending," "In Progress," "Completed," and "On Hold."

- The Repair cneter can:
  - View incomming repair requests submitted by customers, along with relevant details such as customer information, device specifications, and problem descriptions.
  - Review repair requests and determine whether they can be accepted or rejected based on the information provided.
  - Accept repair requests and convert them into repair tickets for processing, assigning them to technicians as needed.
  - Reject repair requests that cannot be accommodated, providing customers with feedback and guidance on alternative options or next steps.
  - Cancel repair requests that have been submitted but are no longer needed or relevant, updating the status accordingly and notifying customers of the cancellation.

---

# Repair Ticket API Domain

The repair Ticket is the core entity of FanniTech, it represents an accepted repair request that has been converted into a repair ticket for processing. The repair ticket API domain handles the management and tracking of these repair tickets, providing endpoints for repair center staff to view, update, and manage the repair process.

- A repair ticket contains information such as:
  - Customer: The customer who submitted the original repair request, including their contact information and account details.
  - Device: The device that requires repair, including its specifications, model, and any relevant documentation.
  - Problem: A description of the issue or problem that the customer is experiencing with their device, which helps technicians understand the nature of the repair needed.
  - Description: A more detailed explanation of the problem, providing additional context and information for technicians to assess the repair ticket accurately.
  - Repair Status: The current status of the repair ticket, which indicates its progress through the repair process. Possible statuses include "Pending," "In Progress," "Completed," and "On Hold."
  - Assigned Technician: The technician responsible for handling the repair ticket, including their contact information and expertise.
  - priority: The priority level of the repair ticket, which helps repair center staff determine the order in which tickets should be addressed based on urgency and importance.
  - Current status: The current state of the repair ticket, which reflects its progress through the repair process. This status is updated as the ticket moves through different stages, providing customers and repair center staff with real-time information about the progress of their repairs.
  - Diagnosis: The process of evaluating the device to identify issues and determine the necessary repairs. Technicians perform diagnostic checks on devices and provide repair notes or recommendations for further action.
  - Repair Notes: The notes or comments added by technicians during the repair process, which provide valuable information for both customers and repair center staff, helping to ensure that devices are repaired effectively and efficiently.
  - Repair History: The record of all repairs performed on the specific device, including information about previous repair requests, repair tickets, diagnostic checks, and repair notes. This history provides customers and repair center staff with a comprehensive view of the device's repair history, helping to inform future repairs and maintenance.
  - createdAt: The date and time when the repair ticket was created, providing a timestamp for tracking the progress of the repair process.
  - UpadatedAt: The date and time when the repair ticket was last updated, providing a timestamp for tracking changes and updates to the ticket throughout the repair process.
  - CompletedAt: The date and time when the repair ticket was completed, providing a timestamp for tracking the successful resolution of the repair request.

The Backend provides endpoints for repair center staff to view incoming repair tickets, update their statuses, assign technicians, perform diagnostic checks, add repair notes, and manage the overall repair process. Customers can also access their repair tickets to track the status of their repairs and view their repair history.

---

# Repair workflow

The repair workflow represents the process of handling a repair request from submission to completion. It outlines the steps involved in managing repair requests, converting them into repair tickets, assigning technicians, performing diagnostic checks, and ultimately completing the repair process.

```flow
PENDING
   ↓
ACCEPTED
   ↓
DIAGNOSING
   ↓
IN_REPAIR
   ↓
READY_FOR_PICKUP
   ↓
COMPLETED

```

Addistional statues include this:

- REJECTED: The repair request has been rejected, typically due to the device being beyond repair or the customer requesting cancellation.
  CANCELLED: The repair request has been cancelled by the customer or the repair center.
  UNREPAIRABLE: The device is deemed unrepairable, either due to the extent of damage or the cost of repairs exceeding the device's value.

Every important status change is recorded in the repair history, providing a comprehensive view of the repair process for both customers and repair center staff. This workflow ensures that repair requests are handled efficiently and effectively, with clear communication and updates provided to all parties involved.

---

# Scope of the Backend

The FanniTech Backend should focus on the essential repair center management functionalities, including:

``` flow 
Customer
   ↓
Customer Mobile App
   ↓
Repair Request
   ↓
Repair Center Dashboard
   ↓
Repair Ticket
   ↓
Technician Assignment
   ↓
Diagnosis
   ↓
Repair
   ↓
Ready for Pickup
   ↓
Completed
   ↓
Customer
```

---

# Backend architecture Directory structure

the backend should be organized into a modular architecture, with each module representing a specific domain or functionality. The following directory structure is recommended:

```
src/
├── app.module.ts          # Root module of the application
├── main.ts                # Entry point of the application
├── config/                # Configuration files for the application
├── modules/               # Application modules
│   ├── auth/              # Authentication module
│   ├── customers/         # Customer management module
│   ├── devices/           # Device management module
│   ├── repair-requests/   # Repair request management module
│   ├── repair-tickets/    # Repair ticket management module
│   ├── technicians/       # Technician management module
│   ├── notifications/     # Notification management module
│   ├── dashboard/         # Dashboard module for repair center users
│   └── common/            # Common utilities, services, and shared components
├── Prisma/              # Prisma schema and migration files for database management
├── tests/                 # Test files for unit and integration tests
└── utils/                 # Utility functions and helpers
```

---

# Best Practices for Backend Development

- Use nestjs modules to organize the application into cohesive units of functionality, promoting maintainability and scalability.
- generate resources using the NestJS CLI to ensure consistent code structure and adherence to best practices.
- Use TypeScript for type safety and improved developer experience, leveraging its features to catch errors at compile time.
- Implement authentication and authorization mechanisms to secure the application and protect sensitive data.
- Use Prisma as the ORM for database management, providing a type-safe and efficient way to interact with the PostgreSQL database.
- Implement unit and integration tests using Jest to ensure code quality and reliability, covering critical functionalities and edge cases.
- Use Prettier and linting tools to enforce code style and formatting standards, promoting consistency across the codebase.

---

