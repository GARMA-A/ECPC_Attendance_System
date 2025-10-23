# QR-Based Attendance System

A complete web application for QR-based attendance tracking where instructors display QR codes in class and students scan them to register attendance.

## Features

- **Authentication**: JWT-based auth with HTTP-only cookies
- **QR Token System**: HMAC-SHA256 signed tokens with configurable expiry (default 5 minutes)
- **Auto-rotating QR**: Instructor dashboard auto-generates new QR codes every 4 minutes
- **Real-time Attendance**: Live attendance list with auto-refresh
- **Student Dashboard**: View attendance stats, weekly breakdown chart, and recent attendance
- **Instructor Dashboard**: Create sessions, display QR codes, view live attendance, export CSV
- **Admin Panel**: Manage users, view all attendance records, correct attendance
- **Duplicate Prevention**: Students cannot check-in twice for the same session
- **Bilingual UI**: Full Arabic/English support with RTL layout
- **ngrok Ready**: Easy configuration for public URL exposure

## Tech Stack

### Backend

- Node.js + Express
- Prisma ORM + SQLite (PostgreSQL ready)
- bcrypt for password hashing
- JWT for authentication
- QRCode library for QR generation
- HMAC-SHA256 for token signing

### Frontend

- React + Vite
- Tailwind CSS
- React Router
- html5-qrcode for camera scanning
- Recharts for data visualization

## Prerequisites

- Node.js 18+ (recommended: Node.js 20)
- npm or yarn
- (Optional) ngrok for public URL exposure

## Installation & Setup

### 1. Clone or Download the Repository

```powershell
cd "d:\Projects\Let's hope it works\ECPC Registration app"
```

### 2. Backend Setup

```powershell
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment variables
copy .env.example .env

# Edit .env file and set your secrets (optional for local dev)
# notepad .env

# Run Prisma migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Seed the database with demo accounts
node prisma/seed.js

# Start the backend server
npm run dev
```

The backend will start on **http://localhost:3000**

### 3. Frontend Setup

Open a **new PowerShell window**:

```powershell
# Navigate to frontend
cd "d:\Projects\Let's hope it works\ECPC Registration app\frontend"

# Install dependencies
npm install

# Copy environment variables
copy .env.example .env

# Start the frontend dev server
npm run dev
```

The frontend will start on **http://localhost:5173**

### 4. Access the Application

Open your browser and go to: **http://localhost:5173**

#### Demo Accounts (all passwords: `password123`)

| Role       | Username    | Password    |
| ---------- | ----------- | ----------- |
| Instructor | instructor1 | password123 |
| Student 1  | student1    | password123 |
| Student 2  | student2    | password123 |
| Admin      | admin1      | password123 |

## Using with ngrok (Public URL)

To allow students to scan QR codes from their phones and access the system remotely:

### 1. Install ngrok

Download from: https://ngrok.com/download

### 2. Expose Backend with ngrok

In a **new PowerShell window**:

```powershell
# Expose backend on port 3000
ngrok http 3000
```

You'll see output like:

```
Forwarding   https://1234-xxxx-xxxx.ngrok.io -> http://localhost:3000
```

**Copy the HTTPS URL** (e.g., `https://1234-xxxx-xxxx.ngrok.io`)

### 3. Update Backend Environment

Edit `backend/.env`:

```env
PUBLIC_BACKEND_URL=https://1234-xxxx-xxxx.ngrok.io
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
```

**Restart the backend server** (Ctrl+C and `npm run dev`)

### 4. Update Frontend Environment (Optional)

If students access the frontend through ngrok too, edit `frontend/.env`:

```env
VITE_API_URL=https://1234-xxxx-xxxx.ngrok.io
```

**Restart the frontend server** (Ctrl+C and `npm run dev`)

### 5. Test the Flow

1. **Instructor**: Login at http://localhost:5173 (or ngrok URL) as `instructor1`
2. **Create a session** and click "Show QR"
3. **Student**: Login on phone/another device as `student1`
4. **Navigate to "Scan QR"** page
5. **Point camera** at the QR code displayed by instructor
6. **Attendance is recorded** automatically!

The QR code contains a URL like:

```
https://1234-xxxx.ngrok.io/api/attendance/scan?token=<signed-token>
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login user

  ```json
  {
    "username": "student1",
    "password": "password123"
  }
  ```

  Response: Sets httpOnly cookie, returns user object

- `POST /api/auth/logout` - Logout user

- `GET /api/auth/me` - Get current user info

### Sessions (Instructor/Admin)

- `POST /api/sessions` - Create new session

  ```json
  {
    "name": "Lecture 1: Introduction",
    "courseName": "CS 101",
    "date": "2025-10-19T10:00:00"
  }
  ```

- `GET /api/sessions` - Get all sessions

- `GET /api/sessions/:id` - Get session details with attendance

- `GET /api/sessions/:id/qr` - Generate QR code for session
  Response:

  ```json
  {
    "success": true,
    "token": "1:1729334400000:abcdef123456...",
    "expiresAt": "2025-10-19T10:05:00",
    "qrCode": "data:image/png;base64,...",
    "expiresIn": 300
  }
  ```

- `GET /api/sessions/:id/attendance?format=csv` - Export attendance as CSV

### Attendance (Student)

- `POST /api/attendance` - Record attendance

  ```json
  {
    "token": "1:1729334400000:abcdef123456...",
    "latitude": 24.7136,
    "longitude": 46.6753
  }
  ```

  Response:

  ```json
  {
    "success": true,
    "message": "Attendance recorded successfully",
    "messageAr": "تم تسجيل حضورك بنجاح",
    "attendance": {
      "id": 1,
      "sessionName": "Lecture 1",
      "courseName": "CS 101",
      "scannedAt": "2025-10-19T10:02:30"
    }
  }
  ```

- `GET /api/attendance/scan?token=<token>` - Direct scan endpoint (returns HTML page)

### Users

- `GET /api/users/:id/stats` - Get user attendance statistics
  Response includes:
  - Total sessions
  - Attendance count
  - Absence count
  - Attendance rate
  - Weekly breakdown
  - Recent attendances

### Admin

- `GET /api/admin/users` - Get all users

- `GET /api/admin/attendance?page=1&limit=50` - Get all attendance records (paginated)

- `DELETE /api/admin/attendance/:id` - Delete attendance record

- `POST /api/admin/attendance` - Manually add attendance
  ```json
  {
    "userId": 2,
    "sessionId": 1
  }
  ```

## Testing with cURL

### Login and Get Cookie

```powershell
# Login as student
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"student1\",\"password\":\"password123\"}' `
  -c cookies.txt

# Get current user
curl http://localhost:3000/api/auth/me -b cookies.txt
```

### Record Attendance

```powershell
# First, get a valid token from instructor dashboard or generate one
# Replace <token> with actual token from QR generation

curl -X POST http://localhost:3000/api/attendance `
  -H "Content-Type: application/json" `
  -b cookies.txt `
  -d '{\"token\":\"1:1729334400000:abcdef123456...\"}'
```

### With ngrok

```powershell
# Replace with your ngrok URL
$ngrokUrl = "https://1234-xxxx.ngrok.io"

# Login
curl -X POST "$ngrokUrl/api/auth/login" `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"student1\",\"password\":\"password123\"}' `
  -c cookies.txt

# Record attendance
curl -X POST "$ngrokUrl/api/attendance" `
  -H "Content-Type: application/json" `
  -b cookies.txt `
  -d '{\"token\":\"<valid-token>\"}'
```

## Running Tests

```powershell
cd backend
npm test
```

Tests include:

- QR token generation and validation
- Token signature verification
- Token expiry validation
- Forged token rejection

## Database Management

### View Database with Prisma Studio

```powershell
cd backend
npx prisma studio
```

Opens at http://localhost:5555

### Reset Database

```powershell
cd backend
# Delete database file
Remove-Item dev.db

# Run migrations
npx prisma migrate dev --name init

# Seed data
node prisma/seed.js
```

### Switch to PostgreSQL

1. Edit `backend/prisma/schema.prisma`:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Edit `backend/.env`:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/attendance_db?schema=public"
   ```

3. Run migrations:
   ```powershell
   npx prisma migrate dev --name init
   ```

## Docker Deployment (Optional)

### Using Docker Compose

```powershell
# Build and start all services
docker-compose up --build

# Stop services
docker-compose down
```

Services will be available at:

- Backend: http://localhost:3000
- Frontend: http://localhost:5173

## Project Structure

```
attendance-qr-system/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── seed.js                # Seed script
│   ├── src/
│   │   ├── middleware/
│   │   │   ├── auth.js            # Authentication middleware
│   │   │   └── rateLimiter.js     # Rate limiting
│   │   ├── routes/
│   │   │   ├── auth.js            # Auth routes
│   │   │   ├── sessions.js        # Session routes
│   │   │   ├── attendance.js      # Attendance routes
│   │   │   ├── users.js           # User routes
│   │   │   └── admin.js           # Admin routes
│   │   ├── services/
│   │   │   ├── qrToken.js         # QR token generation/validation
│   │   │   └── attendance.js      # Attendance logic
│   │   ├── utils/
│   │   │   ├── jwt.js             # JWT utilities
│   │   │   └── logger.js          # Logger
│   │   └── index.js               # Express server
│   ├── tests/
│   │   └── qrToken.test.js        # Token validation tests
│   ├── .env.example
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── LanguageToggle.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── ScanQR.jsx
│   │   │   ├── InstructorDashboard.jsx
│   │   │   └── AdminPanel.jsx
│   │   ├── services/
│   │   │   └── api.js             # API service
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── LanguageContext.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Security Considerations

### Production Checklist

1. **Change all secrets** in `.env`:

   - `JWT_SECRET`: Use a strong random string (32+ characters)
   - `QR_SECRET`: Use a different strong random string

2. **Use HTTPS** in production:

   - Set `COOKIE_SECURE=true`
   - Set `COOKIE_SAME_SITE=none` or `strict`

3. **Configure CORS** properly:

   - Update `FRONTEND_URL` to your production domain
   - Remove wildcard CORS in production

4. **Use PostgreSQL** instead of SQLite for production

5. **Add rate limiting** (already implemented for critical endpoints)

6. **Keep QR expiry short** (5-10 minutes recommended)

7. **Regular security audits**:
   ```powershell
   npm audit
   npm audit fix
   ```

## Troubleshooting

### Issue: Backend won't start

**Solution**: Check if port 3000 is already in use

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### Issue: Frontend can't connect to backend

**Solution**: Check CORS settings and make sure backend is running

- Verify `VITE_API_URL` in `frontend/.env`
- Check browser console for CORS errors

### Issue: QR scanner not working

**Solution**:

- Use HTTPS (required for camera access)
- Allow camera permissions in browser
- Use ngrok for HTTPS testing locally

### Issue: Cookies not working with ngrok

**Solution**: Update backend `.env`:

```env
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
```

### Issue: "Attendance already recorded"

This is expected - duplicate check-ins are prevented. To test again:

1. Use Prisma Studio to delete the attendance record
2. Or create a new session

## Advanced Configuration

### Custom QR Token Expiry

Edit `backend/.env`:

```env
QR_TOKEN_EXPIRY=600  # 10 minutes in seconds
```

### Adjust QR Rotation Interval

Edit `frontend/src/pages/InstructorDashboard.jsx` line ~66:

```javascript
// Refresh every 4 minutes (240000 ms)
qrIntervalRef.current = setInterval(() => {
  generateQR(sessionId);
}, 4 * 60 * 1000);
```

### Custom JWT Expiry

Edit `backend/src/utils/jwt.js`:

```javascript
{
  expiresIn: "7d";
} // Change to '1d', '12h', etc.
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License

## Support

For questions or issues:

1. Check this README thoroughly
2. Review the code comments
3. Check browser console and backend logs
4. Test with provided demo accounts first

---

**Happy Attendance Tracking! 📱✅**
