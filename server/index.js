/* global process */
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { isSupabaseConfigured, testSupabaseConnection } from './supabase.js'
import authRouter from './routes/auth.js'
import profileRouter from './routes/profile.js'
import avatarRouter from './routes/avatar.js'
import adminRouter from './routes/admin.js'
import activitiesRouter from './routes/activities.js'
import registrationsRouter from './routes/registrations.js'
import clubsRouter from './routes/clubs.js'
import supportRouter from './routes/support.js'

// 1. Environment Variable Configuration
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })
dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config({ path: '.env.local' })
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// 2. CORS Configuration for React Vite Frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      return callback(new Error(`CORS origin not allowed: ${origin}`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
)

// 3. Request Parsing Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 4. Health Check Endpoint
app.get('/api/health', async (req, res) => {
  const supabaseStatus = await testSupabaseConnection()

  res.status(200).json({
    status: 'ok',
    message: 'Campus Live API backend is operational',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    supabase: {
      configured: isSupabaseConfigured,
      connected: supabaseStatus.connected,
      message: supabaseStatus.message,
    },
  })
})

// 5. Authentication & Identity Routes
app.use('/api/auth', authRouter)

// 6. User Profile Avatar Upload Route
app.use('/api/profile/avatar', avatarRouter)

// 7. User Profile Routes
app.use('/api/profile', profileRouter)

// 8. Administrative & Provisioning Routes
app.use('/api/admin', adminRouter)

// 9. Student & Campus Activities Routes
app.use('/api/activities', activitiesRouter)

// 10. Student Activity Registrations Routes
app.use('/api/registrations', registrationsRouter)

// 11. Student Clubs & Memberships Routes
app.use('/api/clubs', clubsRouter)

// 12. Student Support Tickets Routes
app.use('/api/support', supportRouter)

// 13. 404 Route Not Found Middleware
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  })
})

// 6. Global Error-Handling Middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[Backend Error]', err)

  if (err.message && err.message.startsWith('CORS origin not allowed')) {
    return res.status(403).json({
      error: 'CORS Error',
      message: err.message,
    })
  }

  res.status(err.status || 500).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred on the server.',
  })
})

// 7. Start Server
const server = app.listen(PORT, () => {
  console.log(`[Campus Live Backend] Server running on http://localhost:${PORT}`)
  console.log(`[Campus Live Backend] Health check available at http://localhost:${PORT}/api/health`)
})

export { app, server }
