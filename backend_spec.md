# Backend Specification Document

## Executive Summary

This document specifies the backend requirements for a gym management system based on a comprehensive analysis of the frontend React application. The system supports multiple user roles (superadmin, admin, manager, receptionist, personal_trainer, general_trainer, housekeeping, member) with branch-level access control. The backend must be built using Node.js, Express, Prisma ORM, MySQL, Cloudinary for file uploads, Nodemailer for emails, and Winston/Pino for logging.

The frontend makes extensive use of REST APIs for CRUD operations on entities like members, staff, classes, sessions, plans, branches, and more. Authentication uses JWT tokens sent in Authorization headers. The system includes QR code check-ins, payment processing, reporting, and communication features.

## Component-to-API Mapping Table

| Component | API Endpoints Used |
|-----------|-------------------|
| Login | POST /auth/login |
| Signup | POST /auth/signup (inferred) |
| ForgotPassword | POST /auth/forgot-password (inferred) |
| AdminDashboard | GET /dashboard/stats (inferred) |
| ManageMembers | GET /members, POST /members, PUT /members/:id, DELETE /members/:id, PUT /members/:id/activate |
| WalkInRegistration | GET /walk-ins, POST /walk-ins, PUT /walk-ins/:id, DELETE /walk-ins/:id, GET /plans |
| ClassesSchedule | GET /classes, GET /classes/trainers, POST /classes, PUT /classes/:id, DELETE /classes/:id |
| PersonalTrainerSessionBookings | GET /sessions, GET /sessions/trainers/list, GET /sessions/members/list, POST /sessions, PUT /sessions/:id, DELETE /sessions/:id |
| Groups | GET /groups, POST /groups, PUT /groups/:id, DELETE /groups/:id |
| RoleManagement | GET /staff-roles, POST /staff-roles, PUT /staff-roles/:id, DELETE /staff-roles/:id |
| DutyRoster | GET /duty-rosters, GET /duty-rosters/staff-members, GET /duty-rosters/managers, POST /duty-rosters, PUT /duty-rosters/:id, DELETE /duty-rosters/:id, PATCH /duty-rosters/:id/approve |
| ManageStaff | GET /staff, GET /staff-roles, POST /staff, PUT /staff/:id, DELETE /staff/:id |
| SalaryCalculator | GET /staff, GET /staff-roles, GET /salaries, POST /salaries, PUT /salaries/:id, DELETE /salaries/:id |
| SuperAdminBranches | GET /branches, GET /branches/available-admins, POST /branches, PUT /branches/:id, DELETE /branches/:id |
| SuperAdminMembers | GET /members, GET /branches, GET /plans, POST /members, PUT /members/:id, DELETE /members/:id, PUT /members/:id/status |
| SuperAdminStaff | GET /staff, GET /branches, GET /staff-roles, POST /staff, PUT /staff/:id, DELETE /staff/:id |
| Reports (various) | GET /reports/attendance, GET /reports/sales, GET /reports/membership (inferred) |
| QR Check-in components | POST /attendance/checkin (inferred) |
| Payment components | GET /payments, POST /payments (inferred) |

## Full Endpoint Documentation

### Authentication Endpoints

#### POST /auth/login
- **Request Body**: `{ email: string, password: string }`
- **Response**: `{ token: string, user: User }`
- **Validation**: Email format, password required
- **Auth**: None
- **Permissions**: Any user
- **Logs**: Login attempts, success/failure
- **Emails**: None

#### POST /auth/signup
- **Request Body**: `{ firstName: string, lastName: string, email: string, password: string, confirmPassword: string }`
- **Response**: `{ message: string, user: User }`
- **Validation**: All fields required, email unique, password strength
- **Auth**: None
- **Permissions**: Any user
- **Logs**: Signup attempts
- **Emails**: Verification email

#### POST /auth/forgot-password
- **Request Body**: `{ email: string }`
- **Response**: `{ message: string }`
- **Validation**: Email exists
- **Auth**: None
- **Permissions**: Any user
- **Logs**: Password reset requests
- **Emails**: Reset password email

#### POST /auth/reset-password
- **Request Body**: `{ token: string, password: string }`
- **Response**: `{ message: string }`
- **Validation**: Valid token, password strength
- **Auth**: None
- **Permissions**: Any user
- **Logs**: Password resets
- **Emails**: None

### Member Management Endpoints

#### GET /members
- **Query Params**: `page`, `limit`, `search`, `branchId`
- **Response**: `{ members: Member[], total: number, page: number }`
- **Auth**: JWT
- **Permissions**: Admin, Manager, Receptionist
- **Branch Restrictions**: Users can only access members from their branch unless superadmin

#### POST /members
- **Request Body**: Member data with optional profile image
- **Response**: `{ member: Member }`
- **Auth**: JWT
- **Permissions**: Admin, Manager, Receptionist
- **Uploads**: Profile image to Cloudinary
- **Emails**: Welcome email

#### PUT /members/:id
- **Request Body**: Updated member data
- **Response**: `{ member: Member }`
- **Auth**: JWT
- **Permissions**: Admin, Manager, Receptionist
- **Branch Restrictions**: Same branch only

#### DELETE /members/:id
- **Response**: `{ message: string }`
- **Auth**: JWT
- **Permissions**: Admin, Manager
- **Logs**: Member deletions

#### PUT /members/:id/activate
- **Response**: `{ member: Member }`
- **Auth**: JWT
- **Permissions**: Admin, Manager

### Staff Management Endpoints

#### GET /staff
- **Query Params**: `branchId`, `role`
- **Response**: `{ staff: Staff[], total: number }`
- **Auth**: JWT
- **Permissions**: Admin, Manager, Superadmin
- **Branch Restrictions**: Branch-specific access

#### POST /staff
- **Request Body**: Staff data with profile image
- **Response**: `{ staff: Staff }`
- **Auth**: JWT
- **Permissions**: Admin, Superadmin
- **Uploads**: Profile image
- **Emails**: Account creation notification

#### PUT /staff/:id
- **Request Body**: Updated staff data
- **Response**: `{ staff: Staff }`
- **Auth**: JWT
- **Permissions**: Admin, Superadmin
- **Branch Restrictions**: Same branch

#### DELETE /staff/:id
- **Response**: `{ message: string }`
- **Auth**: JWT
- **Permissions**: Admin, Superadmin

### Class and Session Management

#### GET /classes
- **Query Params**: `branchId`, `date`
- **Response**: `{ classes: Class[], total: number }`
- **Auth**: JWT
- **Permissions**: Admin, Manager, Trainers, Receptionist

#### POST /classes
- **Request Body**: `{ name: string, trainerId: number, day: string, time: string, maxParticipants: number, branchId: number }`
- **Response**: `{ class: Class }`
- **Auth**: JWT
- **Permissions**: Admin, Manager

#### GET /sessions
- **Query Params**: `date`, `trainerId`, `memberId`
- **Response**: `{ sessions: Session[], total: number }`
- **Auth**: JWT
- **Permissions**: Admin, Manager, Personal Trainers

#### POST /sessions
- **Request Body**: Session booking data
- **Response**: `{ session: Session }`
- **Auth**: JWT
- **Permissions**: Admin, Manager, Receptionist
- **Emails**: Booking confirmation

### Branch Management

#### GET /branches
- **Response**: `{ branches: Branch[] }`
- **Auth**: JWT
- **Permissions**: Superadmin, Admin

#### POST /branches
- **Request Body**: Branch data
- **Response**: `{ branch: Branch }`
- **Auth**: JWT
- **Permissions**: Superadmin

### Reporting Endpoints

#### GET /reports/attendance
- **Query Params**: `dateFrom`, `dateTo`, `branchId`, `role`
- **Response**: Attendance statistics and data
- **Auth**: JWT
- **Permissions**: Admin, Manager

#### GET /reports/sales
- **Query Params**: `dateFrom`, `dateTo`, `branchId`
- **Response**: Sales and revenue data
- **Auth**: JWT
- **Permissions**: Admin, Manager

#### GET /reports/membership
- **Query Params**: `dateFrom`, `dateTo`, `branchId`
- **Response**: Membership statistics
- **Auth**: JWT
- **Permissions**: Admin, Manager

### Walk-in and Payment Endpoints

#### GET /walk-ins
- **Query Params**: `branchId`, `date`
- **Response**: `{ walkIns: WalkIn[], total: number }`
- **Auth**: JWT
- **Permissions**: Admin, Manager, Receptionist

#### POST /walk-ins
- **Request Body**: Walk-in registration data
- **Response**: `{ walkIn: WalkIn }`
- **Auth**: JWT
- **Permissions**: Admin, Manager, Receptionist

#### GET /payments
- **Query Params**: `memberId`, `status`
- **Response**: `{ payments: Payment[], total: number }`
- **Auth**: JWT
- **Permissions**: Admin, Manager, Receptionist

## Complete Prisma Model Documentation

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  role      Role
  branchId  Int?
  branch    Branch?  @relation(fields: [branchId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  member    Member?
  staff     Staff?
  sessions  Session[] @relation("TrainerSessions")

  @@map("users")
}

model Branch {
  id          Int      @id @default(autoincrement())
  name        String
  address     String?
  phone       String?
  email       String?
  managerId   Int?
  manager     User?    @relation(fields: [managerId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  users       User[]
  members     Member[]
  staff       Staff[]
  classes     Class[]
  sessions    Session[]

  @@map("branches")
}

model Member {
  id                Int         @id @default(autoincrement())
  userId            Int         @unique
  user              User        @relation(fields: [userId], references: [id])
  branchId          Int
  branch            Branch      @relation(fields: [branchId], references: [id])
  firstName         String
  lastName          String
  phone             String?
  address           String?
  dateOfBirth       DateTime?
  gender            String?
  profileImage      String?
  membershipPlanId  Int?
  membershipPlan    Plan?       @relation(fields: [membershipPlanId], references: [id])
  joinDate          DateTime    @default(now())
  expiryDate        DateTime?
  status            String      @default("active") // active, expired, suspended
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  // Relations
  sessions          Session[]
  payments          Payment[]
  attendance        Attendance[]

  @@map("members")
}

model Staff {
  id           Int      @id @default(autoincrement())
  userId       Int      @unique
  user         User     @relation(fields: [userId], references: [id])
  branchId     Int
  branch       Branch   @relation(fields: [branchId], references: [id])
  firstName    String
  lastName     String
  phone        String?
  address      String?
  profileImage String?
  role         StaffRole
  salary       Float?
  joinDate     DateTime @default(now())
  status       String   @default("active")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relations
  classes      Class[]  @relation("TrainerClasses")
  sessions     Session[]
  dutyRosters  DutyRoster[]
  salaries     Salary[]

  @@map("staff")
}

model Plan {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  type        String   // group, personal
  duration    Int      // days
  price       Float
  sessions    Int?
  status      String   @default("active")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  members     Member[]

  @@map("plans")
}

model Class {
  id              Int      @id @default(autoincrement())
  name            String
  trainerId       Int
  trainer         Staff    @relation("TrainerClasses", fields: [trainerId], references: [id])
  branchId        Int
  branch          Branch   @relation(fields: [branchId], references: [id])
  day             String   // Monday, Tuesday, etc.
  time            String   // HH:MM format
  maxParticipants Int
  status          String   @default("active")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  sessions        Session[]

  @@map("classes")
}

model Session {
  id          Int         @id @default(autoincrement())
  memberId    Int
  member      Member      @relation(fields: [memberId], references: [id])
  trainerId   Int
  trainer     User        @relation("TrainerSessions", fields: [trainerId], references: [id])
  classId     Int?
  class       Class?      @relation(fields: [classId], references: [id])
  branchId    Int
  branch      Branch      @relation(fields: [branchId], references: [id])
  date        DateTime
  startTime   String
  endTime     String?
  status      String      @default("scheduled") // scheduled, completed, cancelled
  type        String      // group, personal
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  // Relations
  attendance  Attendance?

  @@map("sessions")
}

model Attendance {
  id        Int      @id @default(autoincrement())
  sessionId Int      @unique
  session   Session  @relation(fields: [sessionId], references: [id])
  memberId  Int
  member    Member   @relation(fields: [memberId], references: [id])
  checkIn   DateTime
  checkOut  DateTime?
  status    String   @default("present")
  mode      String   @default("manual") // manual, qr
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("attendance")
}

model Payment {
  id          Int      @id @default(autoincrement())
  memberId    Int
  member      Member   @relation(fields: [memberId], references: [id])
  amount      Float
  description String?
  status      String   @default("pending") // pending, paid, failed
  paymentDate DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("payments")
}

model WalkIn {
  id         Int      @id @default(autoincrement())
  firstName  String
  lastName   String
  phone      String
  email      String?
  planId     Int?
  plan       Plan?    @relation(fields: [planId], references: [id])
  branchId   Int
  branch     Branch   @relation(fields: [branchId], references: [id])
  visitDate  DateTime @default(now())
  status     String   @default("active")
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@map("walk_ins")
}

model StaffRole {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  permissions Json     // Array of permission strings
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  staff       Staff[]

  @@map("staff_roles")
}

model DutyRoster {
  id        Int      @id @default(autoincrement())
  staffId   Int
  staff     Staff    @relation(fields: [staffId], references: [id])
  date      DateTime
  shift     String   // morning, evening, night
  status    String   @default("pending") // pending, approved, rejected
  approvedBy Int?
  approvedByUser User? @relation(fields: [approvedBy], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("duty_rosters")
}

model Salary {
  id        Int      @id @default(autoincrement())
  staffId   Int
  staff     Staff    @relation(fields: [staffId], references: [id])
  amount    Float
  month     Int
  year      Int
  status    String   @default("pending") // pending, paid
  paidDate  DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([staffId, month, year])
  @@map("salaries")
}

model Group {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  branchId    Int
  branch      Branch   @relation(fields: [branchId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("groups")
}

enum Role {
  superadmin
  admin
  manager
  receptionist
  personal_trainer
  general_trainer
  housekeeping
  member
}

enum StaffRole {
  receptionist
  personal_trainer
  general_trainer
  housekeeping
  manager
}
```

## File Upload Rules

### Profile Images
- **Endpoints**: POST /members, PUT /members/:id, POST /staff, PUT /staff/:id
- **Allowed Types**: image/jpeg, image/png, image/jpg
- **Max Size**: 5MB (from MAX_FILE_SIZE env var)
- **Storage**: Cloudinary public uploads
- **Naming**: user_{userId}_{timestamp}.{ext}
- **Replacement**: Delete old image when updating
- **Deletion**: Remove from Cloudinary when user deleted

### Document Uploads (INFERRED)
- **Endpoints**: POST /payments/receipt, PUT /payments/:id/receipt
- **Allowed Types**: image/jpeg, image/png, application/pdf
- **Max Size**: 10MB
- **Storage**: Cloudinary private uploads
- **Naming**: receipt_{paymentId}_{timestamp}.{ext}

## Email Rules

### Signup Verification
- **Trigger**: POST /auth/signup
- **Template Data**: user.name, verificationLink
- **Recipient**: user.email
- **Subject**: "Verify Your Gym Account"

### Forgot Password
- **Trigger**: POST /auth/forgot-password
- **Template Data**: user.name, resetLink
- **Recipient**: user.email
- **Subject**: "Reset Your Password"

### OTP Login (INFERRED)
- **Trigger**: POST /auth/otp-login
- **Template Data**: otp, expiryTime
- **Recipient**: user.email
- **Subject**: "Your Login OTP"

### Booking Confirmation
- **Trigger**: POST /sessions
- **Template Data**: member.name, session.details, trainer.name
- **Recipient**: member.email
- **Subject**: "Session Booking Confirmed"

### Payment Notifications
- **Trigger**: Payment status changes
- **Template Data**: member.name, amount, status
- **Recipient**: member.email
- **Subject**: "Payment Update"

### Staff Notifications
- **Trigger**: New assignments, schedule changes
- **Template Data**: staff.name, details
- **Recipient**: staff.email
- **Subject**: "Schedule Update"

## Logger Rules

### Events to Log
- **Authentication**: Login attempts (success/failure), signup, password resets
- **Authorization**: Permission denied attempts
- **CRUD Operations**: Create, update, delete on all entities
- **Payments**: Payment processing, status changes
- **Attendance**: Check-in/check-out events
- **Errors**: All API errors (4xx, 5xx)
- **Security**: Suspicious activities (multiple failed logins)

### Log Format
```json
{
  "timestamp": "ISO8601",
  "level": "info|warn|error",
  "userId": 123,
  "branchId": 456,
  "action": "login|create_member|payment_failed",
  "resource": "members|payments|sessions",
  "resourceId": 789,
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "details": { "additional": "data" }
}
```

### Log Storage
- **Format**: JSON
- **Location**: logs/ directory
- **Rotation**: Daily rotation, compress old logs
- **Retention**: 30 days for info, 90 days for errors
- **External**: Send critical errors to monitoring service

## Validation Rules

### Authentication
- **Email**: Required, valid email format, unique
- **Password**: Required, min 8 chars, contains uppercase, lowercase, number, special char
- **Confirm Password**: Must match password

### User/Member/Staff
- **Names**: Required, 2-50 chars, letters and spaces only
- **Phone**: Optional, valid phone format
- **Date of Birth**: Optional, valid date, not future
- **Gender**: Optional, enum: male/female/other

### Branch Restrictions
- **All Operations**: Users can only access data from their branch unless superadmin
- **Middleware**: Check req.user.branchId against resource.branchId

### Input Sanitization
- **All Text Inputs**: Trim whitespace, escape HTML
- **SQL Injection**: Use Prisma parameterized queries
- **XSS**: Sanitize user inputs before storage/display

### Rate Limits
- **Login Attempts**: 5 per minute per IP
- **API Calls**: 100 per minute per user
- **File Uploads**: 10 per hour per user

## Data Flow Documentation

### User Login Flow
1. User submits email/password to POST /auth/login
2. Backend validates credentials against User table
3. JWT token generated with user.id, user.role, user.branchId
4. Token stored in Authorization header: Bearer {token}
5. Frontend stores token in localStorage
6. Subsequent requests include token in headers

### Member Registration Flow
1. Receptionist/Admin fills member form
2. POST /members with form data + profile image
3. Backend uploads image to Cloudinary, gets URL
4. Creates User record with hashed password
5. Creates Member record linked to User
6. Sends welcome email
7. Returns member data with image URL

### Session Booking Flow
1. User selects trainer, date, time
2. POST /sessions with booking data
3. Backend validates trainer availability
4. Creates Session record
5. Sends confirmation email to member
6. Updates trainer's schedule

### QR Check-in Flow
1. Member scans QR code with member_id, timestamp, nonce
2. POST /attendance/checkin with QR data
3. Backend validates QR (not expired, member exists)
4. Creates Attendance record with checkIn time
5. Returns success message

### Branch Access Control
1. All requests include JWT token
2. Middleware extracts user.branchId from token
3. For non-superadmin users, queries filter by branchId
4. API responses only include branch-specific data

## Seed Data & Testing Plan

### Required Seed Data
- **Branches**: 3 branches (Downtown, Uptown, Suburban)
- **Users**: 1 superadmin, 3 admins (one per branch), managers, staff for each role
- **Plans**: Basic, Premium, VIP membership plans
- **Members**: 50 members distributed across branches
- **Staff**: 20 staff members with various roles
- **Classes**: 10 group classes per branch
- **Sessions**: 100 past and upcoming sessions

### Test Cases

#### Authentication Tests
- [ ] Valid login returns token and user data
- [ ] Invalid credentials return 401
- [ ] JWT token validation works
- [ ] Password reset flow works
- [ ] Role-based redirects work

#### Authorization Tests
- [ ] Superadmin can access all branches
- [ ] Admin can only access own branch
- [ ] Member cannot access admin endpoints
- [ ] Branch restrictions enforced on all CRUD operations

#### Member Management Tests
- [ ] Create member with profile image upload
- [ ] Update member information
- [ ] Delete member (soft delete)
- [ ] List members with pagination and search
- [ ] Branch filtering works

#### Error Handling Tests
- [ ] Invalid input returns 400 with validation errors
- [ ] Unauthorized access returns 403
- [ ] Not found resources return 404
- [ ] Server errors return 500 with logging

#### File Upload Tests
- [ ] Valid image uploads to Cloudinary
- [ ] Invalid file types rejected
- [ ] File size limits enforced
- [ ] Image URLs returned correctly

#### Email Tests
- [ ] Signup sends verification email
- [ ] Password reset sends reset link
- [ ] Booking confirmation emails sent
- [ ] Email templates render correctly

## Final Developer Checklist

- [ ] Set up Node.js + Express server with TypeScript
- [ ] Configure Prisma with MySQL database
- [ ] Implement JWT authentication middleware
- [ ] Create branch access control middleware
- [ ] Set up Cloudinary configuration
- [ ] Configure Nodemailer with Gmail
- [ ] Implement Winston/Pino logging
- [ ] Create user authentication routes
- [ ] Implement all CRUD routes for entities
- [ ] Add file upload handling with Multer
- [ ] Implement email service with templates
- [ ] Add comprehensive input validation
- [ ] Implement rate limiting
- [ ] Add error handling middleware
- [ ] Create seed data scripts
- [ ] Write unit and integration tests
- [ ] Set up API documentation (Swagger)
- [ ] Configure environment variables
- [ ] Implement data backup strategy
- [ ] Add monitoring and alerting
- [ ] Perform security audit
- [ ] Load testing for performance

## Appendix: INFERRED Assumptions

1. **Database Relations**: Assumed many-to-one relationships based on frontend data usage patterns
2. **Soft Deletes**: Assumed for critical entities like members and staff
3. **Status Fields**: Added status fields where logical (active/inactive, pending/approved)
4. **Timestamps**: Added createdAt/updatedAt to all models
5. **Unique Constraints**: Email uniqueness assumed across all user types
6. **File Upload Endpoints**: Specific upload endpoints inferred from form handling
7. **Email Templates**: Email content and templates assumed based on common patterns
8. **Logging Details**: Log metadata inferred from security best practices
9. **Rate Limits**: Limits assumed based on typical API protection needs
10. **Seed Data Volume**: Sample data sizes estimated for testing purposes
11. **API Response Formats**: JSON structures inferred from frontend usage
12. **Error Codes**: HTTP status codes assumed based on REST conventions
13. **Authentication Flow**: JWT with Bearer token assumed from axios interceptors
14. **Branch Model**: Branch entity with manager relationship inferred
15. **Payment Integration**: Razorpay integration assumed from frontend references