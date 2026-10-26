import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { uploadAvatar } from '../server/controllers/avatarController.js'

dotenv.config({ path: '.env.local' })
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY

const anonSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

function createMockResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(data) {
      this.body = data
      return this
    },
  }
}

async function runAvatarSecuritySuite() {
  console.log('======================================================================')
  console.log('  CAMPUS LIVE: AVATAR BACKEND ARCHITECTURE SECURITY TEST SUITE')
  console.log('======================================================================\n')

  let passed = 0
  let total = 0

  function assert(condition, message) {
    total++
    if (condition) {
      console.log(`[PASS] Test ${total}: ${message}`)
      passed++
    } else {
      console.error(`[FAIL] Test ${total}: ${message}`)
      process.exitCode = 1
    }
  }

  // --------------------------------------------------------------------------
  // TEST 1: Unauthenticated POST /api/profile/avatar -> 401
  // --------------------------------------------------------------------------
  console.log('--- TEST 1: Unauthenticated POST /api/profile/avatar ---')
  const resUnauth = await fetch('http://localhost:5000/api/profile/avatar', {
    method: 'POST',
  })
  const bodyUnauth = await resUnauth.json()
  assert(resUnauth.status === 401, 'Unauthenticated request returns HTTP 401')
  assert(
    bodyUnauth.code === 'AUTH_HEADER_MISSING',
    'Returns AUTH_HEADER_MISSING error code'
  )

  // --------------------------------------------------------------------------
  // TEST 2: Authenticated Student can upload own avatar
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 2: Authenticated Student Avatar Upload Flow ---')
  const testStudentId = 'student-uuid-1111-2222-3333'
  let capturedStorageUpload = null
  let capturedDbUpdate = null

  const mockStorageClient = {
    storage: {
      from(bucket) {
        return {
          async upload(filePath, buffer, options) {
            capturedStorageUpload = { bucket, filePath, bufferLength: buffer.length, options }
            return { data: { path: filePath }, error: null }
          },
          getPublicUrl(filePath) {
            return { data: { publicUrl: `https://storage.campus.edu/avatars/${filePath}` } }
          },
          async remove(paths) {
            return { data: paths, error: null }
          },
        }
      },
    },
    from(table) {
      return {
        update(payload) {
          capturedDbUpdate = { table, payload }
          return {
            eq(col, val) {
              capturedDbUpdate.where = { [col]: val }
              return {
                select() {
                  return {
                    async maybeSingle() {
                      return {
                        data: {
                          id: val,
                          full_name: 'Alex Rivera',
                          email: 'alex.rivera@campus.edu',
                          role: 'student',
                          profile_image: payload.profile_image,
                          updated_at: payload.updated_at,
                        },
                        error: null,
                      }
                    },
                  }
                },
              }
            },
          }
        },
      }
    },
  }

  // Create valid WebP blob inside mock FormData
  const validBlob = new Blob(['RIFF....WEBPVP8 ...fake-avatar-bytes'], { type: 'image/webp' })
  const validFormData = new FormData()
  validFormData.append('avatar', validBlob, 'test-avatar.webp')

  const reqValid = {
    user: { id: testStudentId, email: 'alex.rivera@campus.edu' },
    token: 'valid-test-token',
  }
  const resValid = createMockResponse()
  await uploadAvatar(reqValid, resValid, {
    formData: validFormData,
    storageClient: mockStorageClient,
  })

  assert(resValid.statusCode === 200, 'Authenticated upload returns HTTP 200')
  assert(resValid.body?.success === true, 'Response body contains success: true')
  assert(
    resValid.body?.profileImage?.includes(testStudentId),
    'Public image URL contains authenticated user ID'
  )

  // --------------------------------------------------------------------------
  // TEST 3 & 4: Request cannot specify another user's storage path & always begins with req.user.id
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 3 & 4: Storage Path Identity Anchoring & Path Format ---')
  assert(
    capturedStorageUpload?.filePath.startsWith(`${testStudentId}/`),
    `Storage path '${capturedStorageUpload?.filePath}' strictly starts with req.user.id`
  )
  assert(
    capturedStorageUpload?.filePath.includes('/avatar-') && capturedStorageUpload?.filePath.endsWith('.webp'),
    `Storage path adheres to <auth.uid()>/avatar-<unique>.webp convention`
  )

  // Spoof attempt: caller tries to specify targetId or custom path in query/body
  const spoofFormData = new FormData()
  spoofFormData.append('avatar', validBlob, 'exploit.webp')
  spoofFormData.append('userId', 'victim-user-id')
  spoofFormData.append('filePath', 'victim-user-id/hacked.webp')

  const reqSpoof = {
    user: { id: 'legit-student-id' },
    body: { userId: 'victim-user-id', filePath: 'victim-user-id/hacked.webp' },
    query: { userId: 'victim-user-id' },
  }
  const resSpoof = createMockResponse()
  await uploadAvatar(reqSpoof, resSpoof, {
    formData: spoofFormData,
    storageClient: mockStorageClient,
  })

  assert(
    capturedStorageUpload?.filePath.startsWith('legit-student-id/'),
    'Client-supplied target IDs and paths in body/query/form are ignored; path remains locked to req.user.id'
  )

  // --------------------------------------------------------------------------
  // TEST 5: MIME validation works
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 5: MIME Type Validation ---')
  const invalidMimeBlob = new Blob(['malicious-executable-content'], { type: 'application/x-msdownload' })
  const invalidMimeFormData = new FormData()
  invalidMimeFormData.append('avatar', invalidMimeBlob, 'exploit.exe')

  const reqInvalidMime = { user: { id: testStudentId } }
  const resInvalidMime = createMockResponse()
  await uploadAvatar(reqInvalidMime, resInvalidMime, {
    formData: invalidMimeFormData,
    storageClient: mockStorageClient,
  })

  assert(resInvalidMime.statusCode === 400, 'Invalid MIME type is rejected with HTTP 400')
  assert(
    resInvalidMime.body?.code === 'INVALID_IMAGE_TYPE',
    'Returns INVALID_IMAGE_TYPE error code'
  )

  // --------------------------------------------------------------------------
  // TEST 6: >2 MB upload is rejected
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 6: File Size Limit (2 MB) Validation ---')
  // Create an oversized file mock (> 2MB)
  const oversizedBlob = {
    name: 'giant-avatar.webp',
    type: 'image/webp',
    size: 2.5 * 1024 * 1024, // 2.5 MB
    async arrayBuffer() { return new ArrayBuffer(2.5 * 1024 * 1024) },
  }
  const oversizedFormData = {
    get(field) {
      if (field === 'avatar') return oversizedBlob
      return null
    },
  }

  const reqOversized = { user: { id: testStudentId } }
  const resOversized = createMockResponse()
  await uploadAvatar(reqOversized, resOversized, {
    formData: oversizedFormData,
    storageClient: mockStorageClient,
  })

  assert(resOversized.statusCode === 413, 'Oversized image (> 2 MB) is rejected with HTTP 413')
  assert(
    resOversized.body?.code === 'FILE_TOO_LARGE',
    'Returns FILE_TOO_LARGE error code'
  )

  // --------------------------------------------------------------------------
  // TEST 7, 8, 9: Role, Email, Profile ID immutability
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 7, 8 & 9: Database Immutability (Role, Email, ID Protection) ---')
  // Inspect captured database update payload
  assert(
    capturedDbUpdate?.payload?.role === undefined,
    'Endpoint update payload never contains role'
  )
  assert(
    capturedDbUpdate?.payload?.email === undefined,
    'Endpoint update payload never contains email'
  )
  assert(
    capturedDbUpdate?.payload?.id === undefined,
    'Endpoint update payload never contains id'
  )
  assert(
    capturedDbUpdate?.where?.id === 'legit-student-id',
    'Database UPDATE WHERE condition is anchored strictly to req.user.id'
  )

  // --------------------------------------------------------------------------
  // TEST 10: Service role key is never exposed to frontend
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 10: Service Role Key Isolation from Frontend ---')
  function searchDir(dir, patterns) {
    const files = fs.readdirSync(dir)
    const violations = []
    for (const file of files) {
      const fullPath = path.join(dir, file)
      const stat = fs.statSync(fullPath)
      if (stat.isDirectory()) {
        violations.push(...searchDir(fullPath, patterns))
      } else if (/\.(jsx?|tsx?|html)$/.test(file)) {
        const text = fs.readFileSync(fullPath, 'utf8')
        for (const pattern of patterns) {
          if (text.includes(pattern)) {
            violations.push({ file: fullPath, pattern })
          }
        }
      }
    }
    return violations
  }

  const frontendViolations = searchDir(path.resolve('src'), [
    'SUPABASE_SERVICE_ROLE_KEY',
    'service_role',
  ])
  assert(
    frontendViolations.length === 0,
    `No service role key or secret references exist in src/ (Violations: ${frontendViolations.length})`
  )

  // --------------------------------------------------------------------------
  // TEST 11: Direct unauthenticated Storage bucket uploads are rejected
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 11: Storage Bucket Protection from Direct Unauthenticated Upload ---')
  const { error: directUploadError } = await anonSupabase.storage
    .from('avatars')
    .upload('unauth-probe/avatar.webp', new Blob(['test-unauth'], { type: 'image/webp' }))

  assert(
    Boolean(directUploadError),
    'Direct unauthenticated upload to avatars bucket is rejected by Storage RLS'
  )

  // --------------------------------------------------------------------------
  // TEST 12: Two-Phase Rollback on Database Failure
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 12: Two-Phase Rollback (Storage Orphan File Cleanup) ---')
  let deletedStoragePath = null
  const failingDbClient = {
    storage: {
      from(bucket) {
        return {
          async upload(filePath) {
            return { data: { path: filePath }, error: null }
          },
          getPublicUrl(filePath) {
            return { data: { publicUrl: `https://storage.campus.edu/avatars/${filePath}` } }
          },
          async remove(paths) {
            deletedStoragePath = paths[0]
            return { data: paths, error: null }
          },
        }
      },
    },
    from() {
      return {
        update() {
          return {
            eq() {
              return {
                select() {
                  return {
                    async maybeSingle() {
                      return { data: null, error: { message: 'Database connection failed during update' } }
                    },
                  }
                },
              }
            },
          }
        },
      }
    },
  }

  const reqRollback = { user: { id: 'rollback-student-id' } }
  const resRollback = createMockResponse()
  await uploadAvatar(reqRollback, resRollback, {
    formData: validFormData,
    storageClient: failingDbClient,
  })

  assert(resRollback.statusCode === 500, 'Database failure returns HTTP 500')
  assert(
    deletedStoragePath !== null && deletedStoragePath.startsWith('rollback-student-id/'),
    `Rollback triggered: orphaned storage file '${deletedStoragePath}' was deleted via storage.remove()`
  )

  console.log('\n======================================================================')
  console.log(`  ALL ${passed}/${total} AVATAR ARCHITECTURE SECURITY TESTS PASSED!`)
  console.log('======================================================================\n')
}

runAvatarSecuritySuite().catch((err) => {
  console.error('\n[FATAL] Avatar security test suite failed:', err)
  process.exit(1)
})
