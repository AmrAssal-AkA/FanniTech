# FanniTech (فني تك) — Master Project Plan & System Architecture

> **Document Version**: 1.0.0  
> **Target Scope**: V1 Single Repair Center MVP + Customer Mobile Application  
> **Audience**: AI Coding Agents, Software Architects, and Full-Stack Developers  

---

## 1. AI Agent Execution Directive & Guidance

This document is the **single authoritative source of truth** for the design, architecture, data model, business logic, and implementation of **FanniTech**. When planning or writing code for FanniTech, all AI agents **MUST** follow these core guidelines:

1. **Strict Data Normalization**:
   - Customer and Device details on tickets/requests MUST be resolved via relational joins (`REPAIR_TICKET` $\to$ `REPAIR_REQUEST` $\to$ `DEVICE` $\to$ `CUSTOMER`) rather than duplicating foreign keys on `REPAIR_TICKET`, unless snapshot tables are explicitly required.
2. **User Identity Subtyping**:
   - All authentication credentials (`email`, `password_hash`) and core timestamps reside in `USER`.
   - Role-specific attributes belong in subtype tables (`CUSTOMER`, `ADMIN`, `TECHNICIAN`) linked via 1:1 foreign keys matching `USER.user_id`.
3. **State Machine Integrity**:
   - Status transitions MUST strictly follow the defined state transition rules. Invalid state jumps (e.g., from `PENDING` directly to `COMPLETED` without ticket creation) are strictly prohibited.
4. **Audit History Enforcement**:
   - Any modification to `REPAIR_TICKET.status` MUST atomically generate a `REPAIR_STATUS_HISTORY` record.
5. **V1 Scope Boundary**:
   - Do NOT implement multi-tenancy, SaaS billing, quotation calculations, or inventory tracking in V1 code unless explicitly prompted. Build V1 to be easily extensible for V2–V7.

---

## 2. Product Vision & Multi-Version Roadmap

FanniTech is a computer repair center management platform designed to connect computer repair centers, technicians, and customers through a unified workflow.

```mermaid
timeline
    title FanniTech Multi-Version Development Strategy
    V1 — MVP : Single Repair Center Dashboard : Customer Mobile App : Core Repair Lifecycle
    V2 — Financials : Quotations : Invoices : Payments
    V3 — Supply Chain : Inventory Management : Supplier Catalog
    V4 — Scheduling : Customer Appointments : Technician Shift Schedules
    V5 — Engagement : Advanced Real-time Push Notifications : Analytics & KPIs
    V6 — SaaS Architecture : Multi-Tenant Isolation : Organization Dashboards
    V7 — SaaS Enterprise : Platform Subscriptions : Super-Admin Management
```

### Detailed Roadmap Overview

| Version | Target Feature Scope | Platform Focus |
| :--- | :--- | :--- |
| **V1 (Current)** | Single Repair Center Management, Customer Mobile App, Device Inventory, Request Submission, Ticket Lifecycle, Status Tracking, Technician Assignment, Status History. | Web Dashboard + Mobile App |
| **V2** | Quotation Generation, PDF Invoicing, Online/Offline Payment Gateways. | Web + Mobile |
| **V3** | Spare Parts Inventory Management, Stock Alerts, Supplier Profiles & Purchase Orders. | Repair Center Web |
| **V4** | Drop-off / Pickup Appointment Scheduling, Calendar Integration. | Web + Mobile |
| **V5** | Real-time WebSockets / Push Notifications, Executive Analytics & Repair Metrics. | Web + Mobile |
| **V6** | Multi-Tenant Database Architecture, Repair Center Onboarding, Organization Isolation. | Backend Platform |
| **V7** | Tenant Subscription Billing, Super-Admin Portal, Platform Metrics. | SaaS Admin Portal |

---

## 3. Core Business Rules & Domain Workflow

### 3.1 Entity Relationship Rules
1. **Customer & Devices**: A Customer owns 1 or more Devices (`1 : N`). Each Device is tied to exactly 1 Customer.
2. **Device & Repair Requests**: A Device can have multiple Repair Requests over its lifetime (`1 : N`). Each Repair Request belongs to 1 Device.
3. **Repair Request & Repair Ticket**: A Repair Request can be accepted by the repair center to become a Repair Ticket (`1 : 0..1`). A pending, rejected, or cancelled request does not produce a ticket.
4. **Technician & Repair Ticket**: A Repair Ticket can be assigned to 0 or 1 Technician at a time (`0..1 : N`). A Technician can manage multiple active tickets.
5. **Ticket & Status History**: A Repair Ticket maintains a complete record of status changes (`1 : N`).

### 3.2 End-to-End Operational Lifecycle Workflow

```mermaid
sequenceDiagram
    autonumber
    actor C as Customer (Mobile)
    participant S as FanniTech System
    actor A as Admin (Dashboard)
    actor T as Technician (Dashboard)

    C->>S: 1. Register Account / Login
    C->>S: 2. Add Device (Type, Brand, Model, Serial)
    C->>S: 3. Submit Repair Request (Problem, Description)
    S-->>A: 4. New Request Appears in Admin Triage
    alt Reject Request
        A->>S: 5a. Reject Request (Reason)
        S-->>C: 5b. Request Status: REJECTED
    else Accept Request
        A->>S: 6a. Accept Request & Create Repair Ticket
        S-->>C: 6b. Request Status: ACCEPTED (Ticket Generated)
        A->>S: 7. Assign Technician & Set Priority
        S-->>T: 8. Ticket Appears in Technician Assigned Queue
        T->>S: 9. Update Status: DIAGNOSING (Add Diagnosis Notes)
        S-->>C: 10. Status Update Notification
        T->>S: 11. Update Status: IN_REPAIR (Add Repair Notes)
        S-->>C: 12. Status Update Notification
        alt Repair Successful
            T->>S: 13a. Mark READY_FOR_PICKUP
            S-->>C: 13b. Notification: Device Ready for Pickup
            A->>S: 14a. Mark COMPLETED (Customer Picked Up)
            S-->>C: 14b. Ticket Status: COMPLETED
        else Unrepairable
            T->>S: 15a. Mark UNREPAIRABLE (Reason Notes)
            S-->>C: 15b. Notification: Device Unrepairable
        end
    end
```

---

## 4. Use Case Specifications & Actor Matrix

Derived directly from system use cases:

```mermaid
useCaseDiagram
```

```mermaid
graph LR
    subgraph Actors
        C[Customer - Mobile App]
        A[Admin - Center Dashboard]
        T[Technician - Dashboard]
    end

    subgraph Customer Use Cases
        UC1(Account: Signup/Login)
        UC2(Manage Devices: Add/Remove)
        UC3(Submit Repair Request)
        UC4(View Repair Requests)
        UC5(Track Repair Status)
        UC6(View Repair History)
        UC7(Receive Notifications)
    end

    subgraph Admin Use Cases
        UA1(Dashboard Authentication)
        UA2(Manage Customers)
        UA3(Manage Technicians)
        UA4(Manage Devices)
        UA5(Manage Requests & Tickets)
        UA6(Assign Technicians)
        UA7(Update Ticket Status)
        UA8(View Analytics & Settings)
    end

    subgraph Technician Use Cases
        UT1(Technician Login)
        UT2(View Assigned Tickets)
        UT3(View Device & Problem Info)
        UT4(Add Diagnosis & Repair Notes)
        UT5(Update Repair Status)
        UT6(Mark Repair Completed)
    end

    C --> UC1
    C --> UC2
    C --> UC3
    C --> UC4
    C --> UC5
    C --> UC6
    C --> UC7

    A --> UA1
    A --> UA2
    A --> UA3
    A --> UA4
    A --> UA5
    A --> UA6
    A --> UA7
    A --> UA8

    T --> UT1
    T --> UT2
    T --> UT3
    T --> UT4
    T --> UT5
    T --> UT6
```

### Detailed Actor Responsibilities

| Actor | Access Channel | Core Responsibilities | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **Customer** | Mobile App (iOS / Android) | Device owner submitting & tracking repair jobs. | Create account, add/remove devices, submit repair requests, view request status, track real-time repair progress, view repair history, receive push notifications. |
| **Admin** | Repair Center Web Dashboard | Center owner / manager overseeing operations. | Manage technicians and customer profiles, triage repair requests, create tickets, assign technicians, adjust ticket priorities, override ticket statuses, view dashboard metrics. |
| **Technician** | Web Dashboard / Mobile View | Service technician repairing hardware. | View queue of assigned tickets, inspect device specs & customer problem description, add technical diagnosis, record repair progress notes, transition ticket statuses, mark repairs ready/completed. |

---

## 5. Domain Class Diagram & Object Model

Below is the complete domain model mapping all attributes, methods, enumerations, and relationships:

```mermaid
classDiagram
    class User {
        -String name
        -String email
        -String password
        -String phone
        -DateTime createdAt
        +login()
        +register()
        +changePassword()
        +addPhoneNumber()
        +logout()
    }

    class Customer {
        -String notes
        +managesDevices()
        +createRepairRequest()
        +viewRepairRequest()
        +trackRepairTicket()
        +viewRepairHistory()
        +receivesNotification()
    }

    class Technician {
        -String employeeId
        -DateTime employedDate
        +viewAssignedTickets()
        +viewsCustomerDeviceInfo()
        +addDiagnosis()
        +addsRepairNotes()
        +marksRepairsCompleted()
        +updateRepairStatus()
    }

    class Admin {
        -String employeeId
        +manageTechnician()
        +manageCustomers()
        +manageRepairRequestsTickets()
        +assignTechnicians()
        +updateRepairStatus()
        +manageSetting()
        +manageDevices()
        +viewDashboard()
    }

    class Device {
        -String type
        -String brand
        -String model
        -String serialNumber
        +addDevice()
        +updateDevice()
        +viewDevice()
        +deleteDevice()
    }

    class RepairRequest {
        -String problem
        -String description
        -RepairStatus status
        -DateTime createdAt
        +createRequest()
        +viewRequest()
        +cancelRequest()
        +acceptRequest()
        +rejectRequest()
        +convertToTicket()
    }

    class RepairTicket {
        -String ticketNumber
        -String problem
        -String description
        -Priority priority
        -RepairStatus currentStatus
        -String diagnosis
        -String repairNotes
        -DateTime createdAt
        -DateTime completedAt
        +assignTechnician()
        +addDiagnosis()
        +addRepairNotes()
        +updateStatus()
        +markAsCompleted()
        +markAsReadyForPickup()
        +viewTicket()
    }

    class StatusHistory {
        -RepairStatus status
        -DateTime changedAt
        -String notes
        +recordStatusChange()
        +getStatusHistory()
    }

    class Notification {
        -String title
        -String message
        -Boolean isRead
        -DateTime createdAt
        +send()
        +markAsRead()
        +markAsUnread()
    }

    class Priority {
        <<enumeration>>
        LOW
        MEDIUM
        HIGH
    }

    class RepairStatus {
        <<enumeration>>
        PENDING
        ACCEPTED
        REJECTED
        IN_REPAIR
        DIAGNOSING
        READY_FOR_PICKUP
        UNREPAIRABLE
        COMPLETED
        CANCELLED
    }

    User <|-- Customer : Inherits
    User <|-- Technician : Inherits
    User <|-- Admin : Inherits

    Customer "1" -- "1..*" Device : owns
    Customer "1" -- "0..*" Notification : receives
    Device "1" -- "0..*" RepairRequest : subject of
    RepairRequest "0..1" -- "1" RepairTicket : converts into
    Technician "0..1" -- "0..*" RepairTicket : assigned to
    RepairTicket "1" -- "1..*" StatusHistory : logs
    RepairTicket ..> Priority : uses
    RepairTicket ..> RepairStatus : uses
    RepairRequest ..> RepairStatus : uses
    StatusHistory ..> RepairStatus : uses
```

---

## 6. Database Architecture & ERD Guidance

### 6.1 Entity-Relationship Diagram (Mermaid ERD)

```mermaid
erDiagram
    USER ||--o| CUSTOMER : "has profile"
    USER ||--o| ADMIN : "has role profile"
    USER ||--o| TECHNICIAN : "has role profile"

    CUSTOMER ||--|{ DEVICE : "owns"
    DEVICE ||--|{ REPAIR_REQUEST : "has requests"
    REPAIR_REQUEST ||--o| REPAIR_TICKET : "may become"
    TECHNICIAN o|--o{ REPAIR_TICKET : "is assigned"
    REPAIR_TICKET ||--|{ REPAIR_STATUS_HISTORY : "records"
    CUSTOMER ||--o{ NOTIFICATION : "receives"

    USER {
        int user_id PK
        string email UK
        string password_hash
        datetime created_at
        datetime updated_at
    }

    CUSTOMER {
        int user_id PK, FK
        string name
        string phone
        string address
        text notes
    }

    ADMIN {
        int user_id PK, FK
        string employee_id UK
    }

    TECHNICIAN {
        int user_id PK, FK
        string employee_id UK
        datetime employed_date
    }

    DEVICE {
        int device_id PK
        int customer_id FK
        string device_type
        string brand
        string model
        string serial_number
    }

    REPAIR_REQUEST {
        int request_id PK
        int device_id FK
        string problem
        text description
        string status
        datetime created_at
        datetime updated_at
    }

    REPAIR_TICKET {
        int ticket_id PK
        int request_id FK, UK
        int technician_id FK
        string ticket_number UK
        string priority
        string status
        text diagnosis
        text repair_notes
        datetime created_at
        datetime updated_at
        datetime completed_at
    }

    REPAIR_STATUS_HISTORY {
        int history_id PK
        int ticket_id FK
        string status
        text notes
        datetime changed_at
    }

    NOTIFICATION {
        int notification_id PK
        int customer_id FK
        string title
        text message
        boolean is_read
        datetime created_at
    }
```

### 6.2 Relational Data Dictionary

#### 1. `USER`
Stores shared account credentials and authentication data.
* `user_id` (PK, Integer, Auto-Increment)
* `email` (String, Unique, Not Null)
* `password_hash` (String, Not Null)
* `created_at` (Timestamp, Default CURRENT_TIMESTAMP)
* `updated_at` (Timestamp, Default CURRENT_TIMESTAMP)

#### 2. `CUSTOMER`
Profile table for customer-specific information.
* `user_id` (PK, FK $\to$ `USER.user_id`, Integer)
* `name` (String, Not Null)
* `phone` (String, Not Null)
* `address` (String, Nullable)
* `notes` (Text, Nullable)

#### 3. `ADMIN`
Profile table for administrative staff.
* `user_id` (PK, FK $\to$ `USER.user_id`, Integer)
* `employee_id` (String, Unique, Not Null)

#### 4. `TECHNICIAN`
Profile table for repair technician staff.
* `user_id` (PK, FK $\to$ `USER.user_id`, Integer)
* `employee_id` (String, Unique, Not Null)
* `employed_date` (Date, Nullable)

#### 5. `DEVICE`
Hardware devices registered by customers.
* `device_id` (PK, Integer, Auto-Increment)
* `customer_id` (FK $\to$ `CUSTOMER.user_id`, Integer, Not Null)
* `device_type` (String, e.g., "Laptop", "Desktop", "Tablet")
* `brand` (String, e.g., "Apple", "Dell", "Lenovo")
* `model` (String, e.g., "MacBook Pro 16", "XPS 15")
* `serial_number` (String, Nullable)

#### 6. `REPAIR_REQUEST`
Customer-submitted requests describing issue symptoms.
* `request_id` (PK, Integer, Auto-Increment)
* `device_id` (FK $\to$ `DEVICE.device_id`, Integer, Not Null)
* `problem` (String, Summary of problem)
* `description` (Text, Detailed customer notes)
* `status` (Enum/String: `PENDING`, `ACCEPTED`, `REJECTED`, `CANCELLED`)
* `created_at` (Timestamp, Default CURRENT_TIMESTAMP)
* `updated_at` (Timestamp, Default CURRENT_TIMESTAMP)

#### 7. `REPAIR_TICKET`
Active repair job managed by the repair center.
* `ticket_id` (PK, Integer, Auto-Increment)
* `request_id` (FK $\to$ `REPAIR_REQUEST.request_id`, Unique, Not Null)
* `technician_id` (FK $\to$ `TECHNICIAN.user_id`, Nullable)
* `ticket_number` (String, Unique, e.g., "TK-2026-0001")
* `priority` (Enum/String: `LOW`, `MEDIUM`, `HIGH`, Default `MEDIUM`)
* `status` (Enum/String: `ACCEPTED`, `DIAGNOSING`, `IN_REPAIR`, `READY_FOR_PICKUP`, `COMPLETED`, `REJECTED`, `CANCELLED`, `UNREPAIRABLE`)
* `diagnosis` (Text, Nullable)
* `repair_notes` (Text, Nullable)
* `created_at` (Timestamp, Default CURRENT_TIMESTAMP)
* `updated_at` (Timestamp, Default CURRENT_TIMESTAMP)
* `completed_at` (Timestamp, Nullable)

#### 8. `REPAIR_STATUS_HISTORY`
Audit log of all ticket state transitions.
* `history_id` (PK, Integer, Auto-Increment)
* `ticket_id` (FK $\to$ `REPAIR_TICKET.ticket_id`, Integer, Not Null)
* `status` (String, State entered)
* `notes` (Text, Optional context note)
* `changed_at` (Timestamp, Default CURRENT_TIMESTAMP)

#### 9. `NOTIFICATION`
In-app and push notifications for customers.
* `notification_id` (PK, Integer, Auto-Increment)
* `customer_id` (FK $\to$ `CUSTOMER.user_id`, Integer, Not Null)
* `title` (String, Not Null)
* `message` (Text, Not Null)
* `is_read` (Boolean, Default FALSE)
* `created_at` (Timestamp, Default CURRENT_TIMESTAMP)

---

## 7. State Machines & Status Transition Matrix

### 7.1 Repair Request State Machine

```mermaid
stateDiagram-v2
    [*] --> PENDING : Customer submits request
    PENDING --> ACCEPTED : Admin accepts request (Creates Ticket)
    PENDING --> REJECTED : Admin rejects request
    PENDING --> CANCELLED : Customer cancels request
    ACCEPTED --> [*]
    REJECTED --> [*]
    CANCELLED --> [*]
```

### 7.2 Repair Ticket State Machine

```mermaid
stateDiagram-v2
    [*] --> ACCEPTED : Created from accepted request
    ACCEPTED --> DIAGNOSING : Technician starts diagnosis
    DIAGNOSING --> IN_REPAIR : Diagnosis complete, repair started
    IN_REPAIR --> READY_FOR_PICKUP : Repair finished successfully
    READY_FOR_PICKUP --> COMPLETED : Customer receives device
    
    DIAGNOSING --> UNREPAIRABLE : Cannot be fixed
    IN_REPAIR --> UNREPAIRABLE : Unfixable damage found
    
    ACCEPTED --> CANCELLED : Cancelled before work starts
    DIAGNOSING --> CANCELLED : Customer cancels repair
    IN_REPAIR --> CANCELLED : Customer cancels repair

    UNREPAIRABLE --> [*]
    CANCELLED --> [*]
    COMPLETED --> [*]
```

### 7.3 Status Transition Matrix & Triggers

| Current State | Target State | Permitted Role | Mandatory Actions & Side Effects |
| :--- | :--- | :--- | :--- |
| `PENDING` | `ACCEPTED` | Admin | Creates `REPAIR_TICKET`, generates `ticket_number`, logs `REPAIR_STATUS_HISTORY`, notifies Customer. |
| `PENDING` | `REJECTED` | Admin | Updates request status, logs rejection reason, notifies Customer. |
| `PENDING` | `CANCELLED` | Customer | Updates request status. |
| `ACCEPTED` | `DIAGNOSING` | Technician / Admin | Assigns technician if unassigned, updates ticket state, logs history. |
| `DIAGNOSING` | `IN_REPAIR` | Technician | Saves `diagnosis` text, updates ticket state, logs history, notifies Customer. |
| `IN_REPAIR` | `READY_FOR_PICKUP` | Technician | Saves `repair_notes`, updates state, logs history, sends push notification to Customer. |
| `READY_FOR_PICKUP` | `COMPLETED` | Admin / Technician | Sets `completed_at` timestamp, updates status to `COMPLETED`, logs history. |
| *Any Active State* | `UNREPAIRABLE` | Technician / Admin | Saves cause in `repair_notes`, updates state, logs history, notifies Customer. |
| *Any Active State* | `CANCELLED` | Admin / Customer | Updates state, logs history, sets completion timestamp. |

---

## 8. V1 MVP Implementation Readiness Matrix

The following modules constitute the target baseline for V1 development:

```mermaid
kanban
  Backlog
    V2 Quotation Engine
    V2 PDF Invoice Generator
    V3 Inventory Management
  In Progress (V1 Target)
    Auth & Identity Subtypes
    Device Management API & UI
    Request Submission & Triage
    Ticket Lifecycle & State Machine
    Technician Assignment Queue
    Status History Audit Logging
    Customer Notification System
```

### Functional Component Summary

1. **Authentication & Identity Service**:
   - JWT or Session-based authentication for `User`.
   - Role-Based Access Control (RBAC) middleware for `Customer`, `Admin`, and `Technician`.
2. **Customer Mobile Application**:
   - Device CRUD operations.
   - Repair request wizard (select device $\to$ input problem/description $\to$ submit).
   - Real-time ticket tracking dashboard & history list.
3. **Repair Center Admin Dashboard**:
   - Live incoming request queue.
   - Ticket generator modal with technician assignment and priority picker.
   - Customer and technician directory views.
4. **Technician Workspace**:
   - Mobile/Desktop view filtered by `technician_id`.
   - Rich text input for Diagnosis and Repair Notes.
   - One-click state transition buttons with automatic history logging.
5. **Notification Engine**:
   - In-app notification dispatcher linked to state transition events.

---

## 9. Verification & Architectural Compliance

When delivering code or verifying implementation for FanniTech V1:

- **Database Foreign Keys**: Run migration scripts to verify constraints on `user_id` subtypes, `device_id`, `request_id`, and `technician_id`.
- **State Transition Unit Tests**: Assert that attempting invalid transitions (e.g. `PENDING` directly to `COMPLETED`) throws explicit domain validation errors.
- **Audit Consistency**: Assert that every update to `REPAIR_TICKET.status` creates a corresponding row in `REPAIR_STATUS_HISTORY`.
- **No Orphan Records**: Verify cascading deletes or soft-delete flags for devices and requests so user records remain intact.
