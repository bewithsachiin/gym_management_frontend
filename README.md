# Gym Management System Backend

A comprehensive backend API for managing gym operations, including user authentication, branch management, staff administration, membership plans, class scheduling, and more.

## Project Overview

This backend system provides a robust API for a multi-branch gym management platform. It supports role-based access control with different user types (SuperAdmin, Admin, Trainers, Receptionists, Members, Housekeeping) and enforces branch-level data isolation. The system handles membership management, class scheduling, staff administration, and various gym operations through a RESTful API.

## Tech Stack

### Core Technologies
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)

### Security & Middleware
- **Password Hashing**: bcrypt
- **Security Headers**: Helmet
- **CORS**: cors middleware
- **Logging**: Winston + Morgan
- **File Upload**: Multer
- **Cloud Storage**: Cloudinary

### Utilities
- **Email Service**: Nodemailer
- **Validation**: Built-in Express validation
- **Response Handling**: Custom response handler utility
- **Error Handling**: Centralized error middleware

## Architecture Overview

The backend follows a layered architecture pattern:

```
src/
├── app.js              # Main Express application setup
├── server.js           # Server entry point
├── routes/             # API route definitions
│   ├── auth.routes.js
│   ├── branchRoutes.js
│   ├── staffRoutes.js
│   ├── memberRoutes.js
│   ├── planRoutes.js
│   ├── branchPlanRoutes.js
│   ├── classScheduleRoutes.js
│   └── groupRoutes.js
├── controllers/        # Request handlers
├── services/          # Business logic layer
├── middlewares/       # Custom middleware
│   ├── auth.middleware.js
│   ├── accessControl.middleware.js
│   ├── errorHandler.js
│   └── uploadMiddleware.js
├── config/            # Configuration files
│   ├── db.js
│   └── cloudinary.js
└── utils/             # Utility functions
    ├── jwt.js
    ├── logger.js
    ├── responseHandler.js
    └── nodemailer.js
```

## Data Flow Explanation

### Request Flow
1. **Client Request** → Express receives HTTP request
2. **CORS & Security** → Helmet and CORS middleware process request
3. **Authentication** → JWT token verification in `authenticateToken` middleware
4. **Access Control** → Role-based and branch-based filtering via `accessControl` middleware
5. **Route Matching** → Request routed to appropriate controller
6. **Controller Logic** → Controller validates input and calls service layer
7. **Service Operations** → Business logic executed, database operations via Prisma
8. **Database Query** → Prisma client interacts with MySQL database
9. **Response Formatting** → Custom response handler formats and sends JSON response

### Key Middleware Layers
- **Authentication**: Verifies JWT tokens and attaches user info to request
- **Access Control**: Applies global filters based on user role and branch
- **Error Handling**: Centralized error processing and logging
- **Upload Handling**: File upload processing with Multer and Cloudinary

## API Routes Summary

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Purpose | Access |
|--------|----------|---------|---------|
| POST | `/login` | User login | Public |
| POST | `/signup` | User registration | Public |
| POST | `/forgot-password` | Request password reset | Public |
| POST | `/reset-password` | Reset password with OTP | Public |

### Branches (`/api/v1/branches`)
| Method | Endpoint | Purpose | Access |
|--------|----------|---------|---------|
| GET | `/` | List branches | Authenticated |
| POST | `/` | Create branch | SuperAdmin |
| PUT | `/:id` | Update branch | SuperAdmin |
| DELETE | `/:id` | Delete branch | SuperAdmin |

### Staff (`/api/v1/staff`)
| Method | Endpoint | Purpose | Access |
|--------|----------|---------|---------|
| GET | `/` | List staff | Authenticated |
| POST | `/` | Create staff | SuperAdmin |
| PUT | `/:id` | Update staff | SuperAdmin |
| DELETE | `/:id` | Delete staff | SuperAdmin |

### Staff Roles (`/api/v1/staff-roles`)
| Method | Endpoint | Purpose | Access |
|--------|----------|---------|---------|
| GET | `/` | List staff roles | SuperAdmin |
| POST | `/` | Create staff role | SuperAdmin |
| PUT | `/:id` | Update staff role | SuperAdmin |
| DELETE | `/:id` | Delete staff role | SuperAdmin |

### Members (`/api/v1/members`)
| Method | Endpoint | Purpose | Access |
|--------|----------|---------|---------|
| GET | `/` | List members | Authenticated |
| POST | `/` | Create member | SuperAdmin, Admin |
| PUT | `/:id` | Update member | SuperAdmin, Admin |
| DELETE | `/:id` | Delete member | SuperAdmin, Admin |

### Plans (`/api/v1/plans`)
| Method | Endpoint | Purpose | Access |
|--------|----------|---------|---------|
| GET | `/` | List plans | Authenticated |
| GET | `/features` | Get plan features | Authenticated |
| GET | `/:id` | Get single plan | Authenticated |
| POST | `/` | Create plan | SuperAdmin, Admin |
| PUT | `/:id` | Update plan | SuperAdmin, Admin |
| DELETE | `/:id` | Delete plan | SuperAdmin, Admin |
| PATCH | `/:id/toggle-status` | Toggle plan status | SuperAdmin, Admin |
| GET | `/bookings/requests` | Get booking requests | SuperAdmin, Admin |
| POST | `/bookings/request` | Create booking request | Member |
| PATCH | `/bookings/:id/approve` | Approve booking | SuperAdmin, Admin |
| PATCH | `/bookings/:id/reject` | Reject booking | SuperAdmin, Admin |

### Branch Plans (`/api/v1/branch-plans`)
| Method | Endpoint | Purpose | Access |
|--------|----------|---------|---------|
| GET | `/` | List branch plans | Authenticated |
| GET | `/:id` | Get single branch plan | Authenticated |
| POST | `/` | Create branch plan | SuperAdmin, Admin |
| PUT | `/:id` | Update branch plan | SuperAdmin, Admin |
| DELETE | `/:id` | Delete branch plan | SuperAdmin, Admin |
| PATCH | `/:id/toggle-status` | Toggle plan status | SuperAdmin, Admin |
| GET | `/bookings/requests` | Get booking requests | SuperAdmin, Admin |
| PATCH | `/bookings/:id/approve` | Approve booking | SuperAdmin, Admin |
| PATCH | `/bookings/:id/reject` | Reject booking | SuperAdmin, Admin |

### Classes (`/api/v1/classes`)
| Method | Endpoint | Purpose | Access |
|--------|----------|---------|---------|
| GET | `/` | List classes | Authenticated |
| GET | `/:id` | Get single class | Authenticated |
| POST | `/` | Create class | SuperAdmin, Admin |
| PUT | `/:id` | Update class | SuperAdmin, Admin |
| DELETE | `/:id` | Delete class | SuperAdmin, Admin |

### Groups (`/api/v1/groups`)
| Method | Endpoint | Purpose | Access |
|--------|----------|---------|---------|
| GET | `/` | List groups | Authenticated |
| GET | `/:id` | Get single group | Authenticated |
| POST | `/` | Create group | SuperAdmin, Admin |
| PUT | `/:id` | Update group | SuperAdmin, Admin |
| DELETE | `/:id` | Delete group | SuperAdmin, Admin |

## Database Structure

### Core Models

#### User
- **Purpose**: Authentication and role management
- **Key Fields**: id, firstName, lastName, email, password, role, branchId
- **Relationships**: Branches (admin/creator), Staff, Plans, Bookings, etc.

#### Branch
- **Purpose**: Gym branch management
- **Key Fields**: id, name, code, address, phone, email, status, hours
- **Relationships**: Users, Staff, Plans, Classes, Groups

#### Staff
- **Purpose**: Staff member management
- **Key Fields**: id, userId, branchId, roleId, staff_id, salary info
- **Relationships**: User, Branch, StaffRole

#### Plan & BranchPlan
- **Purpose**: Membership plans (global and branch-specific)
- **Key Fields**: id, name, type, sessions, validity, priceCents, currency
- **Relationships**: Bookings, MemberPlans

#### ClassSchedule
- **Purpose**: Gym class management
- **Key Fields**: id, class_name, trainer_id, date, time, schedule_day
- **Relationships**: Trainer (User), Admin (User), Branch

#### Group
- **Purpose**: Member groups
- **Key Fields**: id, name, photo, branchId
- **Relationships**: Members (Users), Branch

### Key Relationships
- **Branch Isolation**: Most data is filtered by branchId for security
- **Role Hierarchy**: SuperAdmin > Admin > Staff Roles > Members
- **Audit Trail**: AuditLog model for tracking actions
- **QR System**: QRCheck model for attendance tracking

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MySQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gym-management-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="mysql://username:password@localhost:3306/gym_db"

   # JWT
   JWT_SECRET="your-super-secret-jwt-key"

   # Email (for password reset)
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASS="your-app-password"

   # Cloudinary (for image uploads)
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"

   # Server
   PORT=5000
   NODE_ENV="development"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Run database migrations
   npm run prisma:migrate

   # Seed the database (optional)
   npm run prisma:seed
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000` (or your configured PORT).

## Common Issues & Debugging Tips

### Database Connection Issues
- **Error**: "Can't connect to MySQL server"
- **Solution**: Ensure MySQL is running and DATABASE_URL is correct
- **Debug**: Check MySQL service status and credentials

### JWT Token Issues
- **Error**: "Invalid token" or "Token expired"
- **Solution**: Check JWT_SECRET in .env file
- **Debug**: Verify token expiration (24h default)

### CORS Issues
- **Error**: "CORS policy blocked"
- **Solution**: Add frontend URL to allowedOrigins in app.js
- **Debug**: Check request origin against allowedOrigins array

### File Upload Issues
- **Error**: "Image upload failed"
- **Solution**: Verify Cloudinary credentials in .env
- **Debug**: Check file size limits and supported formats

### Access Control Issues
- **Error**: "Access denied" or "Branch isolation enforced"
- **Solution**: Ensure user has correct role and branch assignment
- **Debug**: Check user.branchId and request parameters

### Common Debug Commands
```bash
# Check database connection
npm run prisma:studio

# View logs
tail -f logs/all.log

# Test API endpoints
curl -X GET http://localhost:5000/api/health
```

### Environment Variables Checklist
- [ ] DATABASE_URL
- [ ] JWT_SECRET
- [ ] EMAIL_USER & EMAIL_PASS
- [ ] CLOUDINARY_* credentials
- [ ] PORT (optional)

### Performance Tips
- Use connection pooling for production MySQL
- Implement Redis for session caching if needed
- Monitor database query performance with Prisma logging
- Use proper indexing on frequently queried fields

---

For more detailed API documentation, see the individual route files and controller implementations.
