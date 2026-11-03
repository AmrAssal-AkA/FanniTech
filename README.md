# FanniTech (فني تك)

> **Computer Repair Center Management Platform**  
> **Version**: 1.0.0 (V1 MVP)  
> **Architecture Reference**: [docs/project-plan.md](file:///Users/amrassal/Documents/Projects/FanniTech/docs/project-plan.md)

FanniTech is an end-to-end computer repair center management system designed to connect repair centers, service technicians, and customers through a unified, transparent operational workflow.

---

## Table of Contents

- [Overview & Product Vision](#overview--product-vision)
- [V1 MVP Scope & Feature Capabilities](#v1-mvp-scope--feature-capabilities)
- [Multi-Version Roadmap](#multi-version-roadmap)
- [System Architecture & Tech Stack](#system-architecture--tech-stack)
- [Domain & Data Model](#domain--data-model)
- [Lifecycle Workflows & State Machines](#lifecycle-workflows--state-machines)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Architectural & Implementation Rules](#architectural--implementation-rules)

---

## Overview & Product Vision

Repair shops frequently suffer from fragmented tracking across paper tickets, spreadsheets, and disconnected messaging apps. FanniTech centralizes repair intake, triage, technician assignment, diagnostic reporting, and live customer updates into a single coordinated ecosystem.

### Target Actors & Access Channels

| Actor | Access Channel | Core Capabilities |
| :--- | :--- | :--- |
| **Customer** | **Mobile App** (iOS / Android) | Device registry, repair request submission, real-time ticket tracking, timeline status history, and in-app/push alerts. |
| **Admin** | **Web Dashboard** | Customer & technician directory management, incoming request triage, ticket generation, technician assignment, priority scheduling, and status overrides. |
| **Technician** | **Web Dashboard / Mobile View** | Assigned repair queue, device inspection details, diagnostic findings entry, repair progress notes, and state-machine transitions. |

---

## V1 MVP Scope & Feature Capabilities

V1 focuses on the core single-shop repair lifecycle and customer engagement:

- **Identity & Role Subtyping**: Unified authentication with strict 1:1 role profiles (`Customer`, `Admin`, `Technician`) and Role-Based Access Control (RBAC).
- **Customer Device Registry**: Customers manage hardware profiles (Device Type, Brand, Model, Serial Number).
- **Repair Request Triage**: Customer issue submission with admin review workflow (`PENDING` $\to$ `ACCEPTED`, `REJECTED`, or `CANCELLED`).
- **Ticket Lifecycle Management**: Accepted requests auto-convert into tracked repair tickets (`TK-YYYY-XXXX`) with priority levels (`LOW`, `MEDIUM`, `HIGH`).
- **Technician Workbench**: Assignment queue with technical logging for diagnostic reports and repair work notes.
- **Audit Logging**: Mandatory, immutable status history recording on every ticket state update.
- **Customer Notifications**: Real-time dispatch of in-app status notifications triggered by state transitions.

---

## Multi-Version Roadmap

```mermaid
graph LR
    V1["V1: MVP (Current)<br/>Single Center, Mobile App & Core Lifecycle"] --> V2["V2: Financials<br/>Quotations, Invoices & Payments"]
    V2 --> V3["V3: Supply Chain<br/>Parts Inventory & Supplier Orders"]
    V3 --> V4["V4: Scheduling<br/>Drop-off/Pickup Appointments"]
    V4 --> V5["V5: Engagement<br/>WebSockets & Executive Analytics"]
    V5 --> V6["V6: SaaS Multi-Tenant<br/>Tenant Isolation & Org Dashboards"]
    V6 --> V7["V7: Enterprise SaaS<br/>Platform Subscriptions & Super-Admin"]
```

---

## System Architecture & Tech Stack

```mermaid
graph TD
    subgraph Clients["Frontend Clients"]
        Mobile["Customer Mobile App<br/>(React Native / Expo)"]
        WebAdmin["Admin & Technician Dashboard<br/>(Next.js / React)"]
    end

    subgraph BackendServices["Backend Services"]
        API["FanniTech Core API<br/>(NestJS)"]
        Queue["Async Job Processing<br/>(BullMQ)"]
    end

    subgraph DataStore["Data Layer"]
        DB[(PostgreSQL Database<br/>Prisma ORM)]
    end

    Mobile -->|REST API & Auth| API
    WebAdmin -->|REST API & Auth| API
    API --> Queue
    API --> DB
```

### Technology Matrix

| Layer | Technologies |
| :--- | :--- |
| **Backend API** (`server/`) | [NestJS](https://nestjs.com/), TypeScript, [Prisma ORM](https://www.prisma.io/), PostgreSQL, BullMQ, Vitest, Oxlint |
| **Web Dashboard** (`web/`) | [Next.js](https://nextjs.org/) (App Router), React, Tailwind CSS, Shadcn UI / Base UI, Zustand, SWR / Axios |
| **Mobile App** (`mobile/`) | [React Native](https://reactnative.dev/), [Expo](https://expo.dev/) (Expo Router), NativeWind, TanStack Query, SecureStore |

---

## Domain & Data Model

The V1 database schema uses a strictly normalized entity structure with user subtyping and audit logging:

```mermaid
erDiagram
    USER ||--o| CUSTOMER : "profile"
    USER ||--o| ADMIN : "profile"
    USER ||--o| TECHNICIAN : "profile"

    CUSTOMER ||--|{ DEVICE : "registers"
    CUSTOMER ||--o{ NOTIFICATION : "receives"
    DEVICE ||--|{ REPAIR_REQUEST : "initiates"
    REPAIR_REQUEST ||--o| REPAIR_TICKET : "converts to"
    TECHNICIAN o|--o{ REPAIR_TICKET : "assigned to"
    REPAIR_TICKET ||--|{ REPAIR_STATUS_HISTORY : "tracks"
```

### Key Entities

- **`USER`**: Core authentication record (`user_id`, `email`, `password_hash`, timestamps).
- **`CUSTOMER`**: Profile details (`user_id` FK, `name`, `phone`, `address`, `notes`).
- **`ADMIN`**: Center management profile (`user_id` FK, `employee_id`).
- **`TECHNICIAN`**: Service staff profile (`user_id` FK, `employee_id`, `employed_date`).
- **`DEVICE`**: Hardware registry (`device_id`, `customer_id`, `device_type`, `brand`, `model`, `serial_number`).
- **`REPAIR_REQUEST`**: Intake problem record (`request_id`, `device_id`, `problem`, `description`, `status`).
- **`REPAIR_TICKET`**: Operational job (`ticket_id`, `request_id`, `technician_id`, `ticket_number`, `priority`, `status`, `diagnosis`, `repair_notes`).
- **`REPAIR_STATUS_HISTORY`**: Audit log of all status changes (`history_id`, `ticket_id`, `status`, `notes`, `changed_at`).
- **`NOTIFICATION`**: User alerts (`notification_id`, `customer_id`, `title`, `message`, `is_read`).

---

## Lifecycle Workflows & State Machines

### 1. Repair Request Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PENDING : Customer submits request
    PENDING --> ACCEPTED : Admin accepts (creates ticket)
    PENDING --> REJECTED : Admin rejects with reason
    PENDING --> CANCELLED : Customer cancels
    ACCEPTED --> [*]
    REJECTED --> [*]
    CANCELLED --> [*]
```

### 2. Repair Ticket Lifecycle

```mermaid
stateDiagram-v2
    [*] --> ACCEPTED : Created from accepted request
    ACCEPTED --> DIAGNOSING : Technician starts diagnosis
    DIAGNOSING --> IN_REPAIR : Diagnosis complete, repair in progress
    IN_REPAIR --> READY_FOR_PICKUP : Hardware fixed & tested
    READY_FOR_PICKUP --> COMPLETED : Customer received device

    DIAGNOSING --> UNREPAIRABLE : Unrepairable fault diagnosed
    IN_REPAIR --> UNREPAIRABLE : Critical component failure
    
    ACCEPTED --> CANCELLED : Cancelled before work
    DIAGNOSING --> CANCELLED : Cancelled during diagnosis
    IN_REPAIR --> CANCELLED : Cancelled during repair

    UNREPAIRABLE --> [*]
    CANCELLED --> [*]
    COMPLETED --> [*]
```

### 3. Transition Rules & Mandatory Triggers

| Current State | Target State | Authorized Actor | Automated Actions |
| :--- | :--- | :--- | :--- |
| `PENDING` | `ACCEPTED` | Admin | Generates `REPAIR_TICKET`, issues `ticket_number`, logs audit history, notifies customer. |
| `PENDING` | `REJECTED` | Admin | Stores rejection reason, updates request status, notifies customer. |
| `ACCEPTED` | `DIAGNOSING` | Technician / Admin | Validates technician assignment, logs history, updates ticket status. |
| `DIAGNOSING` | `IN_REPAIR` | Technician | Saves `diagnosis` report, logs status change, sends status notification. |
| `IN_REPAIR` | `READY_FOR_PICKUP` | Technician | Saves `repair_notes`, logs status change, sends pickup alert. |
| `READY_FOR_PICKUP` | `COMPLETED` | Admin / Technician | Sets `completed_at` timestamp, closes ticket, logs audit history. |
| *Active State* | `UNREPAIRABLE` | Technician / Admin | Records cause in `repair_notes`, logs state, triggers customer alert. |
| *Active State* | `CANCELLED` | Admin / Customer | Terminates repair job, records reason, updates audit history. |

---

## Project Structure

A modular multi-package repository containing backend, web dashboard, and mobile client codebases:

```
FanniTech/
├── docs/                       # Architectural specifications & task implementation plans
│   ├── project-plan.md         # V1 Master Project Plan & System Architecture
│   └── tasks/                  # Feature implementation blueprints & guides
├── mobile/                     # Customer Mobile Application (React Native / Expo)
│   ├── assets/                 # App icons, splash screens, and image assets
│   ├── src/
│   │   ├── app/                # Expo Router screen declarations & navigation layouts
│   │   ├── components/         # Shared presentation & UI components
│   │   └── features/           # Feature modules (auth, alerts, devices, home, profile)
│   ├── app.json                # Expo configuration
│   └── package.json            # Mobile dependencies & run scripts
├── server/                     # Backend API & Domain Services (NestJS)
│   ├── prisma/                 # Prisma database schema, migrations & seed scripts
│   ├── src/
│   │   ├── admin-dashboard/    # Center administration endpoints & services
│   │   ├── authentication/     # JWT authentication, guards & user subtyping logic
│   │   ├── devices/            # Device registration and management
│   │   ├── notifications/      # Notification dispatching engine
│   │   ├── repair-requests/    # Customer request submission & handling
│   │   ├── technician-dashboard/# Technician queue & ticket progression
│   │   └── main.ts             # Application bootstrap & configuration
│   ├── test/                   # Integration and end-to-end test suites
│   └── package.json            # Server dependencies & run scripts
├── web/                        # Repair Center Web Dashboard (Next.js)
│   ├── public/                 # Static web assets
│   ├── src/
│   │   ├── app/                # Next.js App Router pages and layouts
│   │   ├── components/         # UI components & design system primitives
│   │   ├── Hooks/              # Custom React hooks
│   │   ├── Portal/             # Role-based dashboard interfaces
│   │   └── services/           # Backend API integration clients
│   └── package.json            # Web dependencies & run scripts
└── README.md                   # Project documentation
```

---

## Getting Started

### Prerequisites

- **Node.js**: `v20.x` or higher
- **Package Manager**: `npm` (or `pnpm` / `yarn`)
- **Database**: PostgreSQL `15+`
- **Mobile Development**: [Expo Go](https://expo.dev/go) on iOS/Android or local simulator

---

### 1. Server Setup (Backend API)

```bash
# Navigate to the server workspace
cd server

# Install dependencies
npm install

# Configure environment variables
# Define: DATABASE_URL, JWT_SECRET, PORT, etc. in your local environment

# Run database migrations and generate Prisma client
npx prisma migrate dev
npx prisma db seed

# Start server in development mode
npm run start:dev
```

The server initializes by default on `http://localhost:3000` with Swagger API docs at `http://localhost:3000/api`.

---

### 2. Web Setup (Admin & Technician Dashboard)

```bash
# Navigate to the web workspace
cd web

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the assigned port if 3000 is occupied by server) in your browser.

---

### 3. Mobile Setup (Customer Mobile Application)

```bash
# Navigate to the mobile workspace
cd mobile

# Install dependencies
npm install

# Start Expo development server
npx expo start
```

Scan the QR code with **Expo Go** (Android) or the **Camera app** (iOS) to launch the app on your physical device or simulator.

---

## Architectural & Implementation Rules

All development within FanniTech follows the architectural standards defined in `docs/project-plan.md`:

1. **Relational Normalization**: Resolve device and customer details via joins (`REPAIR_TICKET` $\to$ `REPAIR_REQUEST` $\to$ `DEVICE` $\to$ `CUSTOMER`) rather than duplicating columns.
2. **User Identity Subtyping**: Store base auth credentials in `USER`. Do not create separate login tables for customers, technicians, and admins.
3. **State Machine Strictness**: State transitions must strictly follow the transition rules. Direct state jumps (e.g. bypassing ticket creation or diagnosis) are prohibited.
4. **Audit Consistency**: Every change to a ticket's status must atomically create a record in `REPAIR_STATUS_HISTORY`.
5. **Clean Version Boundary**: Adhere strictly to V1 requirements; defer multi-tenancy, billing, quotations, and parts inventory to future roadmap versions (V2–V7).
