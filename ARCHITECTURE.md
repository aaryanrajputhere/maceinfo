# Maceinfo - System Architecture Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Data Flow](#data-flow)
9. [External Integrations](#external-integrations)
10. [File Structure Reference](#file-structure-reference)

---

## Project Overview

**Maceinfo** is a comprehensive construction materials procurement and RFQ (Request for Quote) management platform. It enables contractors and builders to:

- Browse construction materials with indicative pricing
- Use built-in calculators for material estimation
- Build and manage quotes
- Send RFQs to multiple vendors via email
- Collect and compare vendor responses
- Award contracts to vendors
- Track all RFQ activities in Google Sheets

The system consists of a React/TypeScript frontend built with Vite, and an Express/TypeScript backend with PostgreSQL database managed by Prisma ORM.

---

## Technology Stack

### Backend

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL
- **ORM**: Prisma 6.x
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer
- **Email Service**: SendGrid (@sendgrid/mail)
- **External APIs**:
  - Google Drive API (file storage)
  - Google Sheets API (data logging)
- **Development**: ts-node-dev, nodemon

### Frontend

- **Framework**: React 19.x with TypeScript
- **Build Tool**: Vite 7.x
- **Routing**: React Router DOM 7.x
- **Styling**: Tailwind CSS 4.x
- **Icons**: Lucide React
- **Type Safety**: TypeScript 5.8.x

### Infrastructure

- **Deployment**: Railway (backend), Vercel (frontend)
- **File Storage**: Google Drive (Shared Drive)
- **Data Logging**: Google Sheets
- **Version Control**: Git

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │    React Frontend (Vite + TypeScript + Tailwind CSS)     │   │
│  │  - Materials Catalog - Quote Builder - Vendor Portal     │   │
│  │  - Calculators - Award Interface                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS / REST API
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Express.js Backend (TypeScript + Node.js)        │   │
│  │                                                           │   │
│  │  Routes → Controllers → Services → External APIs         │   │
│  │  - Quotes  - Materials  - Vendors  - Awards              │   │
│  │  - Drive   - Sync-Sheet                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  PostgreSQL  │  │ Google Drive │  │   Google Sheets      │  │
│  │   (Prisma)   │  │ (Files/Docs) │  │   (RFQ & Replies)    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                              │
│  ┌──────────────┐                    ┌──────────────────────┐  │
│  │   SendGrid   │                    │   Google APIs        │  │
│  │  (Email/RFQ) │                    │ (Auth & Services)    │  │
│  └──────────────┘                    └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Backend Architecture

### Directory Structure

```
backend/
├── src/
│   ├── app.ts                    # Express app configuration
│   ├── server.ts                 # Server entry point
│   ├── controllers/              # Request handlers
│   ├── routes/                   # API route definitions
│   ├── services/                 # Business logic & external services
│   └── utils/                    # Helper functions
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Database migrations
└── package.json                  # Dependencies & scripts
```

### Core Files

#### `src/server.ts`

**Purpose**: Application entry point**Role**:

- Loads environment variables via dotenv
- Starts Express server on specified PORT (default: 5000)
- Initializes the HTTP listener

**Architecture Fit**: Bootstrap layer that initializes the application

---

#### `src/app.ts`

**Purpose**: Express application configuration**Role**:

- Configures middleware (CORS, JSON parsing, URL encoding)
- Registers all API routes
- Exports configured Express app

**Architecture Fit**: Central application orchestrator that wires together routes and middleware

**Routes Registered**:

- `/api/quotes` → Quote/RFQ management
- `/api/materials` → Materials CRUD
- `/api/vendors` → Vendor management & replies
- `/api/sync-sheet` → Google Sheets synchronization
- `/api/awards` → Award management
- `/api/drive` → File uploads

---

### Routes Layer

#### `src/routes/quotes.routes.ts`

**Purpose**: RFQ submission endpoints**Endpoints**:

- `POST /api/quotes/apply` - Submit new RFQ with files
  **Controllers**: `quotes.controller.createQuote`
  **Middleware**: Multer file upload (memory storage)

---

#### `src/routes/materials.routes.ts`

**Purpose**: Materials catalog management**Endpoints**:

- `GET /api/materials` - Get all materials
- `POST /api/materials` - Create new material
- `PUT /api/materials/:id` - Update material
- `DELETE /api/materials/:id` - Delete material
  **Controllers**: `materials.controller.*`

---

#### `src/routes/vendors.routes.ts`

**Purpose**: Vendor management and reply submission**Endpoints**:

- `GET /api/vendors` - Get all vendors
- `POST /api/vendors` - Create vendor
- `DELETE /api/vendors/:name` - Delete vendor
- `GET /api/vendors/get-items/:rfqId/:token` - Vendor view items
- `POST /api/vendors/vendor-reply/:rfqId/:token` - Submit vendor reply with files

**Controllers**: `vendors.controller.*`
**Security**: JWT token authentication for vendor-specific operations

---

#### `src/routes/awards.routes.ts`

**Purpose**: Award management for RFQs**Endpoints**:

- `GET /api/awards/getVendorReplyItems/:rfq_id/:token` - Get vendor replies for award UI
- `POST /api/awards/awardItem/:rfq_id/:token` - Award item to vendor

**Controllers**: `awards.controller.*`
**Security**: JWT token authentication

---

#### `src/routes/drive.routes.ts`

**Purpose**: Image/file upload to Google Drive**Endpoints**:

- `POST /api/drive/upload-image` - Upload material image

**Controllers**: `drive.controller.uploadFilesToFolder`
**Middleware**: Multer single file upload

---

#### `src/routes/sync-sheet.routes.ts`

**Purpose**: Sync data with Google Sheets**Endpoints**:

- `POST /api/sync-sheet/materials` - Sync materials to sheets
- `POST /api/sync-sheet/vendors` - Sync vendors to sheets
- `POST /api/sync-sheet/rfqs` - Sync RFQs to sheets

**Controllers**: `sync-sheet.controller.*`

---

### Controllers Layer

#### `src/controllers/quotes.controller.ts`

**Purpose**: Handle RFQ creation and vendor email dispatch
**Key Function**: `createQuote`

**Responsibilities**:

1. Validates project info and contact details
2. Generates unique RFQ ID
3. Maps items to vendors based on selectedVendors
4. Uploads files to Google Drive (creates RFQ folder)
5. Stores RFQ in PostgreSQL database
6. Logs RFQ to Google Sheets
7. Sends personalized RFQ emails to each vendor via SendGrid
8. Sends award access email to requester

**Architecture Fit**: Orchestrates the entire RFQ creation workflow across multiple services

**Data Flow**:

```
Request → Validate → Generate RFQ ID → Upload Files → Save to DB → 
Log to Sheets → Send Emails → Return Response
```

---

#### `src/controllers/materials.controller.ts`

**Purpose**: CRUD operations for materials catalog**Functions**:

- `getMaterials()` - Fetch all materials from DB
- `createMaterial()` - Add new material
- `updateMaterial()` - Update existing material
- `deleteMaterial()` - Remove material

**Architecture Fit**: Direct database interface for materials management

---

#### `src/controllers/vendors.controller.ts`

**Purpose**: Vendor management and reply handling**Key Functions**:

- `getAllVendors()` - Fetch vendor list
- `createVendor()` - Add vendor
- `deleteVendor()` - Remove vendor
- `getItems()` - Vendor retrieves their assigned RFQ items (JWT protected)
- `handleVendorReply()` - Process vendor reply submission

**Complex Logic in `handleVendorReply`**:

1. Validates JWT token
2. Parses item replies and files from FormData
3. Groups files by item
4. Uploads files to Google Drive (vendor-replies folder structure)
5. Calculates pricing totals
6. Logs consolidated reply to Google Sheets
7. Stores individual items in VendorReplyItem table
8. Sends confirmation email to vendor

**Architecture Fit**: Handles vendor-specific workflows with security and file management

---

#### `src/controllers/awards.controller.ts`

**Purpose**: Award items to vendors**Key Functions**:

- `getVendorReplyItems()` - Retrieve all vendor replies for an RFQ
- `awardItem()` - Award specific item to vendor

**Award Workflow**:

1. Validates JWT token
2. Updates VendorReplyItem status to "awarded"
3. Sends notification email to requester
4. Sends award notification to vendor with project details

**Architecture Fit**: Manages the final stage of RFQ lifecycle

---

#### `src/controllers/drive.controller.ts`

**Purpose**: Image upload for materials
**Functionality**: Handles single image uploads to Google Drive for material catalog

---

#### `src/controllers/sync-sheet.controller.ts`

**Purpose**: Synchronize database data to Google Sheets
**Functions**: Manual sync operations for materials, vendors, and RFQs

---

### Services Layer

#### `src/services/drive.service.ts`

**Purpose**: Google Drive API integration**Key Functions**:

1. **`uploadFilesToFolder(files, folderId)`**

   - Uploads files to specified folder
   - Returns array of Google Drive links
   - Sets file permissions (inherited from parent in Shared Drive)
2. **`saveRFQFiles(files, rfqId)`**

   - Creates RFQ-specific subfolder in "rfq-uploads"
   - Uploads all RFQ files
   - Returns folder link and file links
3. **`saveVendorReplyFiles(replyId, itemFiles)`**

   - Creates structured folder hierarchy: `vendor-replies/Reply-{replyId}/Item-{itemId}/`
   - Groups files by item
   - Returns reply folder link, item folder links, and file links

**Architecture Fit**: Abstracts all Google Drive operations with structured file organization

**Authentication**: Uses service account credentials via `googleAuth.ts`

---

#### `src/services/mail.service.ts`

**Purpose**: Email dispatch via SendGrid**Key Functions**:

1. **`sendRFQEmail(rfqId, projectInfo, items, vendor, driveLinks)`**

   - Generates JWT token for vendor (7-day expiry)
   - Creates personalized email with vendor-specific items
   - Includes secure reply link: `https://maceinfo.com/vendor-reply/{rfqId}/{token}`
   - Lists project details and materials
2. **`rfqAward(email, rfqId)`**

   - Generates JWT token for award access
   - Sends award interface link to requester
   - Link format: `https://maceinfo.com/award/{rfqId}/{token}`
3. **`vendorAwardNotification(email, rfqId, itemName, ...details)`**

   - Notifies vendor they won an item
   - Includes project details, buyer contact info
   - Shows awarded item details and total value
4. **`userAwardNotification(email, rfqId, itemName, vendorName)`**

   - Confirms to requester that award was successful

**Architecture Fit**: Centralized email service with HTML templates and JWT security

**Security**: All vendor/award links use JWT tokens to prevent unauthorized access

---

#### `src/services/sheets.service.ts`

**Purpose**: Google Sheets API integration**Key Functions**:

1. **`addRFQToSheet(rfqData)`**

   - Logs new RFQ to Google Sheets
   - Columns: rfq_id, created_at, requester details, project info, items_json, vendors_json, drive_folder_url
2. **`addVendorReplyToSheet(replyData)`**

   - Logs vendor reply to separate sheet
   - Includes pricing breakdown, lead time, notes, file links
   - Stores consolidated view of vendor response

**Architecture Fit**: Persistent logging layer for business intelligence and audit trail

**Authentication**: Uses service account via `googleAuth.ts`

---

### Utilities

#### `src/utils/generateRFQ.ts`

**Purpose**: Generate unique RFQ identifiers
**Function**: `generateRFQ()` - Returns `RFQ-{timestamp}`
**Architecture Fit**: Simple ID generation utility

---

#### `src/utils/googleAuth.ts`

**Purpose**: Google API authentication singleton**Functions**:

- `getGoogleAuth()` - Returns cached GoogleAuth instance
- `getDriveClient()` - Returns Drive v3 client
- `getSheetsClient()` - Returns Sheets v4 client
- `getGmailClient()` - Returns Gmail v1 client

**Configuration**: Uses GOOGLE_CREDENTIALS from environment (service account JSON)

**Scopes**:

- drive (file management)
- spreadsheets (sheet access)
- gmail.send (email sending)

**Architecture Fit**: Centralized authentication manager for all Google services

---

### Database (Prisma)

#### `prisma/schema.prisma`

**Purpose**: Database schema definition

**Models**:

1. **Material**

   - Fields: id, category, itemName, size, unit, price, image, vendors, createdAt
   - Unique constraint: [category, itemName, size, unit, price]
   - Purpose: Materials catalog
2. **Vendor**

   - Fields: id, name (unique), email, phone, notes, createdAt
   - Purpose: Vendor directory
3. **rFQ**

   - Fields: id, rfq_id (unique), created_at, requester info, project info, items_json, vendors_json, drive_folder_url, status, award details
   - Purpose: Main RFQ records
4. **VendorReplyItem**

   - Fields: id, rfq_id, reply_id, item details, pricing, leadTime, vendor info, status
   - Purpose: Individual item responses from vendors
   - Status: "pending" | "awarded"

**Architecture Fit**: Single source of truth for transactional data

**Migrations**: Located in `prisma/migrations/` with timestamped folders

---

## Frontend Architecture

### Directory Structure

```
frontend/
├── src/
│   ├── main.tsx                  # App entry point
│   ├── App.tsx                   # Root component & routing
│   ├── pages/                    # Page components
│   ├── components/               # Reusable UI components
│   ├── hooks/                    # Custom React hooks
│   ├── utils/                    # Helper functions
│   ├── types/                    # TypeScript types
│   ├── styles/                   # Global CSS
│   └── assets/                   # Images, fonts
├── public/                       # Static assets
├── index.html                    # HTML entry point
├── vite.config.ts               # Vite configuration
└── package.json                 # Dependencies
```

---

### Core Files

#### `src/main.tsx`

**Purpose**: Application entry point**Role**:

- Renders root React component
- Wraps app in `BrowserRouter` for routing
- Imports global CSS

**Architecture Fit**: Bootstrap layer for React application

---

#### `src/App.tsx`

**Purpose**: Root component and route configuration**Role**:

- Defines all application routes
- Conditionally renders Header/Footer (hidden on vendor-reply page)
- Provides consistent layout container

**Routes**:

- `/` - Landing page
- `/materials` - Materials catalog
- `/calculators/studs` - Stud calculator
- `/calculators/osb` - OSB calculator
- `/quote` - Quote builder
- `/vendor-reply/:rfqId/:token` - Vendor reply interface
- `/award/:rfq_id/:token` - Award interface

**Architecture Fit**: Application shell and navigation manager

---

#### `vite.config.ts`

**Purpose**: Build configuration
**Plugins**: React, Tailwind CSS
**Architecture Fit**: Development and build tooling

---

### Pages

#### `src/pages/home.tsx`

**Purpose**: Landing page / marketing page**Content**:

- Hero section with call-to-action
- Feature cards (Materials Catalog, Calculators, Quote Builder, RFQ System)
- Navigation to main features

**Architecture Fit**: Entry point for users

---

#### `src/pages/materials.tsx`

**Purpose**: Materials catalog browser**Components Used**:

- `SearchBar` - Search and filters
- `Sidebar` - Category filtering with counts
- `MaterialCard` - Individual material display

**State Management**:

- `useMaterials` hook for data fetching
- Local state for filters and sidebar visibility

**Features**:

- Real-time filtering by search term, category, price range
- Sorting by price/name
- Responsive layout (drawer on mobile, fixed sidebar on desktop)
- Displays material count

**Architecture Fit**: Browse interface for materials with filtering

---

#### `src/pages/quote.tsx`

**Purpose**: Quote/RFQ builder interface**Components Used**:

- `QuoteHeader` - Page header
- `QuoteItemsTable` - Items list with edit/delete
- `ProjectInfoForm` - Project and contact details
- `FileUploadSection` - File attachments
- `SubmitSection` - Submit/Cancel buttons
- `SuccessMessage` - Post-submission confirmation

**State Management**: `useQuoteData` hook

**Workflow**:

1. Load items from localStorage (added from materials/calculators)
2. Edit quantities, prices, vendors
3. Fill project info and contact details
4. Attach files
5. Submit → Creates RFQ → Sends to vendors

**Architecture Fit**: Central interface for RFQ creation

---

#### `src/pages/vendor-reply.tsx`

**Purpose**: Vendor reply submission interface
**URL**: `/vendor-reply/:rfqId/:token`

**Components Used**:

- `VendorReplyHeader` - Page header with RFQ ID
- `VendorReplyTable` - Items table with pricing fields
- `VendorReplySummary` - Delivery charges, discount, notes
- `VendorReplySubmitButton` - Submit button
- `VendorReplyLoading` - Loading state
- `VendorReplyInvalid` - Error state
- `VendorReplySuccess` - Success confirmation

**Workflow**:

1. Validates token and fetches vendor's assigned items
2. Vendor fills pricing, lead time, notes, substitutions
3. Upload files per item
4. Enter delivery charges and discounts
5. Submit → Saves to DB and Sheets → Sends confirmation email

**Security**: JWT token required (from email link)

**Architecture Fit**: Vendor-facing interface for submitting quotes

---

#### `src/pages/award.tsx`

**Purpose**: Award interface for comparing vendor quotes
**URL**: `/award/:rfq_id/:token`

**Components Used**:

- `AwardTable` - Comparison table of vendor quotes

**Hook**: `useVendorReplyItems` - Fetches all vendor replies

**Utility**: `transformVendorReplies` - Groups replies by item

**Workflow**:

1. Validates token and loads vendor replies
2. Displays items with vendor quotes side-by-side
3. User selects winning vendor per item
4. Submit award → Updates status → Sends notifications

**Security**: JWT token required (from award email)

**Architecture Fit**: Decision-making interface for RFQ requester

---

#### `src/pages/calculators/stud.tsx` & `osb.tsx`

**Purpose**: Material quantity calculators**Functionality**:

- Calculate studs or OSB sheets needed based on dimensions
- Add calculated quantities to quote

**Architecture Fit**: Utility tools that feed into quote builder

---

### Custom Hooks

#### `src/hooks/useMaterials.ts`

**Purpose**: Fetch and filter materials from backend
**Interface**: `FilterOptions` - searchTerm, category, sortBy, availability, priceRange

**Logic**:

1. Fetches all materials on mount
2. Applies client-side filtering and sorting when filters change
3. Handles multiple response formats from backend

**Returns**: `{ materials, loading, error }`

**Architecture Fit**: Data access layer for materials with filtering logic

---

#### `src/hooks/useQuoteData.ts`

**Purpose**: Manage quote builder state and submission**State**:

- Contact info (name, email, phone)
- Project info (name, address, needed by, notes)
- Items array
- Files
- Form status (isSubmitting, submitSuccess, isFormValid)

**Functions**:

- `updateItem()` - Edit item field
- `deleteItem()` - Remove item
- `calculateItemTotal()` - Price × Quantity
- `calculateGrandTotal()` - Sum all items
- `handleFileUpload()` - Add files
- `handleSubmit()` - Submit RFQ via POST to backend

**Architecture Fit**: Centralized state management for quote workflow

---

#### `src/hooks/useVendorReplyItems.ts`

**Purpose**: Fetch vendor replies for award interface
**Parameters**: `rfq_id`, `token`
**Returns**: `{ vendorReplies, loading, error }`

**Architecture Fit**: Data access layer for award interface

---

### Utilities

#### `src/utils/awardMap.ts`

**Purpose**: Transform flat vendor reply data into grouped structure
**Function**: `transformVendorReplies(replies: VendorReply[])`

**Transformation**:

- Input: Flat array of vendor replies
- Output: Items grouped by item_name with vendors array

**Structure**:

```typescript
ItemWithVendors {
  id, itemName, requestedPrice, quantity, unit,
  vendors: [
    { vendorName, leadTime, quotedPrice, notes, status, ... }
  ]
}
```

**Architecture Fit**: Data transformation layer for award UI

---

#### `src/utils/api.ts`

**Purpose**: API utility functions (currently empty placeholder)
**Architecture Fit**: Placeholder for future centralized API calls

---

### Types

#### `src/types/materials.ts`

**Purpose**: TypeScript interfaces for materials
**Interface**: `Material` - Defines material object structure

**Architecture Fit**: Type safety layer for materials data

---

### Components

The frontend uses a component-driven architecture with reusable UI elements organized by feature:

**Layout Components**:

- `Header.tsx` - Top navigation
- `Footer.tsx` - Footer with links

**Materials Feature**:

- `MaterialCard.tsx` - Individual material display
- `MaterialsGrid.tsx` - Grid layout for materials
- `SearchBar.tsx` - Search and filter controls
- `Sidebar.tsx` - Category navigation

**Quote Feature**:

- `QuoteHeader.tsx` - Page title
- `QuoteItemsTable.tsx` - Editable items table
- `ProjectInfoForm.tsx` - Form fields
- `FileUploadSection.tsx` - File upload UI
- `SubmitSection.tsx` - Action buttons
- `SuccessMessage.tsx` - Confirmation page
- `Tooltip.tsx` - Help tooltips

**Vendor Reply Feature**:

- `VendorReplyHeader.tsx` - Page header
- `VendorReplyTable.tsx` - Reply form table
- `VendorReplyFooter.tsx` - Footer
- `VendorReplyLoading.tsx` - Loading state
- `VendorReplyInvalid.tsx` - Error state
- `VendorReplyMessage.tsx` - Alert messages
- `VendorReplySubmitButton.tsx` - Submit button
- `VendorReplySuccess.tsx` - Success confirmation
- `VendorReplySummary.tsx` - Pricing summary

**Award Feature**:

- `AwardTable.tsx` - Vendor comparison table

**Architecture Fit**: Modular, reusable components following single responsibility principle

---

## Database Schema

### Material

```prisma
model Material {
  id        Int      @id @default(autoincrement())
  category  String
  itemName  String
  size      String
  unit      String
  price     Float
  image     String?
  vendors   String?
  createdAt DateTime @default(now())

  @@unique([category, itemName, size, unit, price])
}
```

**Purpose**: Stores materials catalog
**Unique Constraint**: Prevents duplicate materials with same specifications

---

### Vendor

```prisma
model Vendor {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  email     String?
  phone     String?
  notes     String?
  createdAt DateTime @default(now())
}
```

**Purpose**: Vendor directory
**Key**: Vendor name is unique identifier

---

### rFQ

```prisma
model rFQ {
  id                     Int       @id @default(autoincrement())
  rfq_id                 String    @unique
  created_at             DateTime  @default(now())
  requester_name         String
  requester_email        String
  requester_phone        String
  project_name           String
  project_address        String
  needed_by              String?
  notes                  String?
  items_json             String
  vendors_json           String
  drive_folder_url       String?
  status                 String?
  email_message_id       String?
  decision_at            DateTime?
  awarded_vendor_name    String?
  awarded_reply_id       String?
  awarded_total_price    Float?
  awarded_lead_time_days Int?
  po_number              String?
  po_date                DateTime?
  po_notes               String?
}
```

**Purpose**: Master RFQ records**JSON Fields**:

- `items_json`: Array of requested items
- `vendors_json`: Comma-separated vendor list

**Award Fields**: Tracks final award decision

---

### VendorReplyItem

```prisma
model VendorReplyItem {
  id              Int      @id @default(autoincrement())
  rfq_id          String
  reply_id        String
  item_name       String
  size            String
  unit            String
  quantity        Int
  unit_price      Float
  total_price     Float
  discount        Float?
  delivery_charge Float?
  leadTime        DateTime @db.Timestamptz
  substitutions   String?
  notes           String?
  file_link       String?
  vendor_name     String
  vendor_email    String
  created_at      DateTime @default(now())
  status          String?  @default("pending")
}
```

**Purpose**: Individual vendor quote items
**Status Values**: "pending" | "awarded"
**Grouping**: Multiple items per reply_id

---

## API Endpoints

### Quotes/RFQ

- `POST /api/quotes/apply` - Submit new RFQ

### Materials

- `GET /api/materials` - List all materials
- `POST /api/materials` - Create material
- `PUT /api/materials/:id` - Update material
- `DELETE /api/materials/:id` - Delete material

### Vendors

- `GET /api/vendors` - List vendors
- `POST /api/vendors` - Create vendor
- `DELETE /api/vendors/:name` - Delete vendor
- `GET /api/vendors/get-items/:rfqId/:token` - Get vendor items (JWT protected)
- `POST /api/vendors/vendor-reply/:rfqId/:token` - Submit reply (JWT protected)

### Awards

- `GET /api/awards/getVendorReplyItems/:rfq_id/:token` - Get replies (JWT protected)
- `POST /api/awards/awardItem/:rfq_id/:token` - Award item (JWT protected)

### Drive

- `POST /api/drive/upload-image` - Upload material image

### Sync

- `POST /api/sync-sheet/materials` - Sync materials to sheets
- `POST /api/sync-sheet/vendors` - Sync vendors to sheets
- `POST /api/sync-sheet/rfqs` - Sync RFQs to sheets

---

## Data Flow

### RFQ Creation Flow

```
User (Frontend)
  ↓ Browse materials & add to quote
  ↓ Fill project details
  ↓ Attach files
  ↓ Submit RFQ
Backend (quotes.controller)
  ↓ Generate RFQ ID
  ↓ Upload files to Drive
  ↓ Save to PostgreSQL
  ↓ Log to Google Sheets
  ↓ Map items to vendors
  ↓ Send emails via SendGrid (with JWT links)
  ↓ Send award access email to requester
Vendor (Email)
  ↓ Click link (vendor-reply/:rfqId/:token)
  ↓ View assigned items
  ↓ Fill pricing & details
  ↓ Upload files
  ↓ Submit reply
Backend (vendors.controller)
  ↓ Validate JWT
  ↓ Upload files to Drive
  ↓ Save to VendorReplyItem table
  ↓ Log to Google Sheets
  ↓ Send confirmation email
Requester (Award Email)
  ↓ Click award link (award/:rfq_id/:token)
  ↓ View vendor quotes
  ↓ Select winning vendor
  ↓ Submit award
Backend (awards.controller)
  ↓ Update status to "awarded"
  ↓ Send notification emails
  ↓ Complete workflow
```

---

## External Integrations

### Google Drive

**Purpose**: File storage for RFQ documents and vendor replies**Authentication**: Service account (GOOGLE_CREDENTIALS)**Folder Structure**:

- `rfq-uploads/{RFQ-{id}}/` - RFQ files
- `vendor-replies/Reply-{replyId}/Item-{itemId}/` - Vendor files
- Material images folder (GOOGLE_DRIVE_FOLDER_ID)

**API**: googleapis (drive v3)

---

### Google Sheets

**Purpose**: Business intelligence and audit logging**Authentication**: Service account**Sheets**:

- RFQs Sheet: Logs all RFQ submissions
- Vendor Replies Sheet: Logs all vendor responses

**API**: googleapis (sheets v4)

---

### SendGrid

**Purpose**: Transactional email delivery**Authentication**: SENDGRID_API_KEY**Email Types**:

- RFQ emails to vendors
- Award access emails to requesters
- Vendor reply confirmations
- Award notifications (requester & vendor)

**Sender**: rfq@maceinfo.com

---

### JWT Authentication

**Purpose**: Secure vendor and award links**Secret**: JWT_SECRET / SECRET env variable**Expiry**: 7 days**Token Payload**:

- Vendor links: `{ vendorName, vendorEmail, rfqId }`
- Award links: `{ email, rfqId }`

---

## File Structure Reference

### Backend Files

| File                                     | Purpose            | Key Functions/Endpoints                |
| ---------------------------------------- | ------------------ | -------------------------------------- |
| `server.ts`                            | App entry point    | Server initialization                  |
| `app.ts`                               | Express config     | Route registration, middleware         |
| `routes/quotes.routes.ts`              | RFQ routes         | POST /apply                            |
| `routes/materials.routes.ts`           | Materials routes   | GET, POST, PUT, DELETE                 |
| `routes/vendors.routes.ts`             | Vendor routes      | GET, POST, DELETE, vendor-reply        |
| `routes/awards.routes.ts`              | Award routes       | GET replies, POST award                |
| `routes/drive.routes.ts`               | Drive routes       | POST upload-image                      |
| `routes/sync-sheet.routes.ts`          | Sync routes        | POST materials/vendors/rfqs            |
| `controllers/quotes.controller.ts`     | RFQ logic          | createQuote                            |
| `controllers/materials.controller.ts`  | Materials CRUD     | getMaterials, create, update, delete   |
| `controllers/vendors.controller.ts`    | Vendor logic       | getItems, handleVendorReply            |
| `controllers/awards.controller.ts`     | Award logic        | getVendorReplyItems, awardItem         |
| `controllers/drive.controller.ts`      | Drive logic        | uploadFilesToFolder                    |
| `controllers/sync-sheet.controller.ts` | Sync logic         | syncMaterials, vendors, rfqs           |
| `services/drive.service.ts`            | Drive integration  | saveRFQFiles, saveVendorReplyFiles     |
| `services/mail.service.ts`             | Email service      | sendRFQEmail, rfqAward, notifications  |
| `services/sheets.service.ts`           | Sheets integration | addRFQToSheet, addVendorReplyToSheet   |
| `utils/generateRFQ.ts`                 | RFQ ID generator   | generateRFQ()                          |
| `utils/googleAuth.ts`                  | Google auth        | getGoogleAuth, clients                 |
| `prisma/schema.prisma`                 | Database schema    | Material, Vendor, rFQ, VendorReplyItem |

---

### Frontend Files

| File                             | Purpose           | Key Components/Functions          |
| -------------------------------- | ----------------- | --------------------------------- |
| `main.tsx`                     | App entry         | ReactDOM render                   |
| `App.tsx`                      | Root component    | Routes, layout                    |
| `pages/home.tsx`               | Landing page      | Hero, features                    |
| `pages/materials.tsx`          | Materials browser | MaterialsGrid, Sidebar, SearchBar |
| `pages/quote.tsx`              | Quote builder     | QuoteItemsTable, ProjectInfoForm  |
| `pages/vendor-reply.tsx`       | Vendor interface  | VendorReplyTable, submission      |
| `pages/award.tsx`              | Award interface   | AwardTable                        |
| `pages/calculators/stud.tsx`   | Stud calculator   | Calculation logic                 |
| `pages/calculators/osb.tsx`    | OSB calculator    | Calculation logic                 |
| `hooks/useMaterials.ts`        | Materials data    | Fetch, filter, sort               |
| `hooks/useQuoteData.ts`        | Quote state       | Quote management, submission      |
| `hooks/useVendorReplyItems.ts` | Award data        | Fetch vendor replies              |
| `utils/api.ts`                 | API utils         | (Placeholder)                     |
| `utils/awardMap.ts`            | Data transform    | transformVendorReplies            |
| `types/materials.ts`           | TypeScript types  | Material interface                |
| `components/Header.tsx`        | Header            | Navigation                        |
| `components/Footer.tsx`        | Footer            | Links                             |
| `components/materials/*`       | Materials UI      | MaterialCard, Sidebar, SearchBar  |
| `components/quote/*`           | Quote UI          | ItemsTable, InfoForm, FileUpload  |
| `components/vendor-reply/*`    | Vendor UI         | ReplyTable, Summary, buttons      |
| `components/award/*`           | Award UI          | AwardTable                        |

---

## Environment Variables

### Backend

```env
DATABASE_URL                 # PostgreSQL connection string
PORT                        # Server port (default: 5000)
GOOGLE_CREDENTIALS          # Service account JSON
DRIVE_PARENT_FOLDER_ID      # RFQ uploads folder ID
VENDOR_REPLIES_FOLDER_ID    # Vendor replies folder ID
GOOGLE_DRIVE_FOLDER_ID      # Material images folder ID
RFQ_SHEET_ID                # Google Sheets ID for RFQs
RFQ_SHEET_NAME              # Sheet name (default: RFQs)
VENDOR_REPLY_SHEET_ID       # Google Sheets ID for replies
VENDOR_REPLY_SHEET_NAME     # Sheet name (default: VendorReplies)
SENDGRID_API_KEY            # SendGrid API key
JWT_SECRET / SECRET         # JWT signing secret
```

### Frontend

```env
VITE_BACKEND_URL            # Backend API URL
```

---

## Deployment

### Backend

- **Platform**: Railway
- **URL**: https://mace-construction-production-82bc.up.railway.app
- **Database**: PostgreSQL (managed by Railway)
- **Build**: `npm run build` (TypeScript → JavaScript)
- **Start**: `npm start` (runs dist/server.js)

### Frontend

- **Platform**: Vercel
- **URL**: https://maceinfo.com
- **Build**: `npm run build` (Vite → static files)
- **Framework**: React (detected automatically)

---

## Security Considerations

1. **JWT Tokens**: All vendor and award links use JWT for authentication
2. **Token Expiry**: 7-day expiration on vendor/award links
3. **Environment Variables**: Sensitive credentials stored in env vars
4. **CORS**: Enabled on backend for cross-origin requests
5. **Input Validation**: Email format validation, required fields
6. **File Upload**: Multer with file size limits (10MB for vendor replies)
7. **Google Service Account**: Limited scopes for Drive/Sheets access

---

## Future Enhancements

- Real-time notifications (WebSockets)
- PDF generation for RFQs
- Advanced reporting and analytics
- Purchase order management
- Mobile app
- Multi-language support
- Vendor portal with dashboard
- Integration with accounting systems

---

## Maintenance Notes

- **Database Migrations**: Use `npx prisma migrate dev` for schema changes
- **API Changes**: Update both backend routes and frontend hooks
- **Google Drive**: Regularly clean up old files
- **Email Templates**: HTML templates in mail.service.ts
- **Dependencies**: Keep packages updated for security

---

## Contact & Support

- **System Owner**: Maceinfo
- **Email**: rfq@maceinfo.com
- **Documentation**: This file (ARCHITECTURE.md)

---

**Last Updated**: January 7, 2026
**Version**: 1.0
**Author**: AI-Generated Architecture Documentation
