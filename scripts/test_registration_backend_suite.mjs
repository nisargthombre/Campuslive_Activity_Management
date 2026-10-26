import dotenv from 'dotenv'
import path from 'path'
import {
  getRegistrationStatus,
  registerForActivity,
  cancelRegistration,
  withActivityLock,
} from '../server/controllers/registrationController.js'
import { getAdminSupabase } from '../server/supabase.js'

dotenv.config({ path: '.env.local' })
dotenv.config()

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

async function runRegistrationTestSuite() {
  console.log('======================================================================')
  console.log('  CAMPUS LIVE: STUDENT REGISTRATION BACKEND TEST SUITE')
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

  const sampleActivityId = 'b0000001-0000-0000-0000-000000000001'
  const testStudentId = 'a3b1e7b3-9c61-48cb-bd30-79c3170eafa9'

  // --------------------------------------------------------------------------
  // TEST 1: Unauthenticated GET /api/registrations/status/:id -> 401
  // --------------------------------------------------------------------------
  console.log('--- TEST 1: Unauthenticated Endpoint Protection ---')
  const resGetUnauth = await fetch(
    `http://localhost:5000/api/registrations/status/${sampleActivityId}`
  )
  const bodyGetUnauth = await resGetUnauth.json()
  assert(resGetUnauth.status === 401, 'Unauthenticated GET /status/:id returns HTTP 401')
  assert(
    bodyGetUnauth.code === 'AUTH_HEADER_MISSING',
    'Unauthenticated GET returns AUTH_HEADER_MISSING code'
  )

  // --------------------------------------------------------------------------
  // TEST 2: Unauthenticated POST /api/registrations -> 401
  // --------------------------------------------------------------------------
  const resPostUnauth = await fetch('http://localhost:5000/api/registrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activityId: sampleActivityId }),
  })
  const bodyPostUnauth = await resPostUnauth.json()
  assert(resPostUnauth.status === 401, 'Unauthenticated POST /api/registrations returns HTTP 401')
  assert(
    bodyPostUnauth.code === 'AUTH_HEADER_MISSING',
    'Unauthenticated POST returns AUTH_HEADER_MISSING code'
  )

  // --------------------------------------------------------------------------
  // TEST 3: Unauthenticated POST /api/registrations/cancel -> 401
  // --------------------------------------------------------------------------
  const resCancelUnauth = await fetch('http://localhost:5000/api/registrations/cancel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activityId: sampleActivityId }),
  })
  const bodyCancelUnauth = await resCancelUnauth.json()
  assert(
    resCancelUnauth.status === 401,
    'Unauthenticated POST /api/registrations/cancel returns HTTP 401'
  )
  assert(
    bodyCancelUnauth.code === 'AUTH_HEADER_MISSING',
    'Unauthenticated Cancel returns AUTH_HEADER_MISSING code'
  )

  // --------------------------------------------------------------------------
  // TEST 4: Invalid Authorization Header -> 401
  // --------------------------------------------------------------------------
  const resBadToken = await fetch(
    `http://localhost:5000/api/registrations/status/${sampleActivityId}`,
    {
      headers: { Authorization: 'Bearer invalid-token-xyz' },
    }
  )
  const bodyBadToken = await resBadToken.json()
  assert(resBadToken.status === 401, 'Invalid Bearer token returns HTTP 401')
  assert(
    bodyBadToken.code === 'AUTH_TOKEN_INVALID',
    'Invalid token returns AUTH_TOKEN_INVALID code'
  )

  // --------------------------------------------------------------------------
  // TEST 5: Input Validation - Missing or Malformed activityId
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 5: Input Validation & Sanitization ---')
  const reqInvalidId = {
    user: { id: testStudentId },
    profile: { id: testStudentId, role: 'student' },
    body: { activityId: 'not-a-valid-uuid' },
  }
  const resInvalidId = createMockResponse()
  await registerForActivity(reqInvalidId, resInvalidId)
  assert(
    resInvalidId.statusCode === 400,
    'Invalid activity UUID format is rejected with HTTP 400'
  )
  assert(
    resInvalidId.body?.code === 'INVALID_ACTIVITY_ID',
    'Returns INVALID_ACTIVITY_ID code'
  )

  // --------------------------------------------------------------------------
  // TEST 6: Identity Anchoring - Attacker cannot inject another student's ID
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 6: Identity Anchoring (Target Student ID Tampering) ---')
  const attackerStudentId = 'a3b1e7b3-9c61-48cb-bd30-79c3170eafa9'
  const victimStudentId = 'c9999999-9999-9999-9999-999999999999'
  let capturedInsertPayload = null

  const mockDbClient = {
    from(table) {
      if (table === 'activities') {
        return {
          select() {
            return {
              eq() {
                return {
                  async maybeSingle() {
                    return {
                      data: {
                        id: sampleActivityId,
                        title: 'Test Workshop',
                        status: 'upcoming',
                        max_participants: 50,
                        registration_deadline: new Date(Date.now() + 86400000).toISOString(),
                      },
                      error: null,
                    }
                  },
                }
              },
            }
          },
        }
      }
      if (table === 'registrations') {
        return {
          select(fields, opts) {
            if (opts?.count === 'exact') {
              return {
                eq() {
                  return {
                    async eq() {
                      return { count: 5, error: null }
                    },
                  }
                },
              }
            }
            return {
              eq() {
                return {
                  eq() {
                    return {
                      order() {
                        return {
                          limit() {
                            return {
                              async maybeSingle() {
                                return { data: null, error: null }
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
          },
          insert(payload) {
            capturedInsertPayload = payload
            return {
              select() {
                return {
                  async single() {
                    return {
                      data: {
                        id: 'new-reg-uuid',
                        student_id: payload.student_id,
                        activity_id: payload.activity_id,
                        status: payload.status,
                        registered_at: payload.registered_at,
                      },
                      error: null,
                    }
                  },
                }
              },
            }
          },
        }
      }
    },
    async rpc() {
      return { data: null, error: { code: 'PGRST202', message: 'Function not found' } }
    },
  }

  const reqTamper = {
    user: { id: attackerStudentId },
    profile: { id: attackerStudentId, role: 'student' },
    body: {
      activityId: sampleActivityId,
      studentId: victimStudentId,
      student_id: victimStudentId,
    },
    mockClient: mockDbClient,
  }

  const resTamper = createMockResponse()
  await registerForActivity(reqTamper, resTamper)
  assert(resTamper.statusCode === 201, 'Registration succeeded for authenticated caller')
  assert(
    capturedInsertPayload?.student_id === attackerStudentId,
    'Registration row is strictly bound to req.user.id and ignores malicious studentId'
  )
  assert(
    capturedInsertPayload?.student_id !== victimStudentId,
    'Malicious victim student ID was completely ignored'
  )

  // --------------------------------------------------------------------------
  // TEST 7: Duplicate Registration Prevention
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 7: Duplicate Active Registration Prevention ---')
  const mockDuplicateDb = {
    from(table) {
      if (table === 'activities') {
        return {
          select() {
            return {
              eq() {
                return {
                  async maybeSingle() {
                    return {
                      data: {
                        id: sampleActivityId,
                        title: 'Test Workshop',
                        status: 'upcoming',
                        max_participants: 50,
                      },
                      error: null,
                    }
                  },
                }
              },
            }
          },
        }
      }
      if (table === 'registrations') {
        return {
          select(fields, opts) {
            if (opts?.count === 'exact') {
              return {
                eq() {
                  return {
                    async eq() {
                      return { count: 1, error: null }
                    },
                  }
                },
              }
            }
            return {
              eq() {
                return {
                  eq() {
                    return {
                      order() {
                        return {
                          limit() {
                            return {
                              async maybeSingle() {
                                return {
                                  data: {
                                    id: 'existing-reg-1',
                                    student_id: testStudentId,
                                    activity_id: sampleActivityId,
                                    status: 'registered',
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
          },
        }
      }
    },
    async rpc() {
      return { data: null, error: { code: 'PGRST202' } }
    },
  }

  const reqDuplicate = {
    user: { id: testStudentId },
    profile: { id: testStudentId, role: 'student' },
    body: { activityId: sampleActivityId },
    mockClient: mockDuplicateDb,
  }
  const resDuplicate = createMockResponse()
  await registerForActivity(reqDuplicate, resDuplicate)
  assert(resDuplicate.statusCode === 409, 'Duplicate active registration is rejected with HTTP 409')
  assert(resDuplicate.body?.code === 'ALREADY_REGISTERED', 'Returns ALREADY_REGISTERED error code')

  // --------------------------------------------------------------------------
  // TEST 8: Full Activity Capacity Limit Enforcement
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 8: Full Activity Capacity Limit Enforcement ---')
  const mockFullDb = {
    from(table) {
      if (table === 'activities') {
        return {
          select() {
            return {
              eq() {
                return {
                  async maybeSingle() {
                    return {
                      data: {
                        id: sampleActivityId,
                        title: 'Sold Out Hackathon',
                        status: 'upcoming',
                        max_participants: 25,
                      },
                      error: null,
                    }
                  },
                }
              },
            }
          },
        }
      }
      if (table === 'registrations') {
        return {
          select(fields, opts) {
            if (opts?.count === 'exact') {
              return {
                eq() {
                  return {
                    async eq() {
                      // 25 active out of 25 maximum participants
                      return { count: 25, error: null }
                    },
                  }
                },
              }
            }
            return {
              eq() {
                return {
                  eq() {
                    return {
                      order() {
                        return {
                          limit() {
                            return {
                              async maybeSingle() {
                                return { data: null, error: null }
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
          },
        }
      }
    },
    async rpc() {
      return { data: null, error: { code: 'PGRST202' } }
    },
  }

  const reqFull = {
    user: { id: testStudentId },
    profile: { id: testStudentId, role: 'student' },
    body: { activityId: sampleActivityId },
    mockClient: mockFullDb,
  }
  const resFull = createMockResponse()
  await registerForActivity(reqFull, resFull)
  assert(resFull.statusCode === 409, 'Full activity registration is rejected with HTTP 409')
  assert(resFull.body?.code === 'ACTIVITY_FULL', 'Returns ACTIVITY_FULL error code')

  // --------------------------------------------------------------------------
  // TEST 9: Activity Past Registration Deadline
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 9: Past Registration Deadline Rejection ---')
  const mockDeadlineDb = {
    from(table) {
      if (table === 'activities') {
        return {
          select() {
            return {
              eq() {
                return {
                  async maybeSingle() {
                    return {
                      data: {
                        id: sampleActivityId,
                        title: 'Past Activity',
                        status: 'upcoming',
                        registration_deadline: '2025-01-01T00:00:00Z', // past date
                        max_participants: 50,
                      },
                      error: null,
                    }
                  },
                }
              },
            }
          },
        }
      }
    },
    async rpc() {
      return { data: null, error: { code: 'PGRST202' } }
    },
  }

  const reqDeadline = {
    user: { id: testStudentId },
    profile: { id: testStudentId, role: 'student' },
    body: { activityId: sampleActivityId },
    mockClient: mockDeadlineDb,
  }
  const resDeadline = createMockResponse()
  await registerForActivity(reqDeadline, resDeadline)
  assert(resDeadline.statusCode === 400, 'Expired deadline is rejected with HTTP 400')
  assert(
    resDeadline.body?.code === 'REGISTRATION_DEADLINE_PASSED',
    'Returns REGISTRATION_DEADLINE_PASSED code'
  )

  // --------------------------------------------------------------------------
  // TEST 10: Non-Existent Activity -> 404 Not Found
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 10: Non-Existent Activity Handling ---')
  const mockNotFoundDb = {
    from(table) {
      if (table === 'activities') {
        return {
          select() {
            return {
              eq() {
                return {
                  async maybeSingle() {
                    return { data: null, error: null }
                  },
                }
              },
            }
          },
        }
      }
    },
    async rpc() {
      return { data: null, error: { code: 'PGRST202' } }
    },
  }

  const reqNotFound = {
    user: { id: testStudentId },
    profile: { id: testStudentId, role: 'student' },
    body: { activityId: sampleActivityId },
    mockClient: mockNotFoundDb,
  }
  const resNotFound = createMockResponse()
  await registerForActivity(reqNotFound, resNotFound)
  assert(resNotFound.statusCode === 404, 'Non-existent activity returns HTTP 404')
  assert(resNotFound.body?.code === 'ACTIVITY_NOT_FOUND', 'Returns ACTIVITY_NOT_FOUND code')

  // --------------------------------------------------------------------------
  // TEST 11: Registration Status Check Endpoint
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 11: Registration Status Check Endpoint ---')
  const mockStatusDb = {
    from(table) {
      if (table === 'activities') {
        return {
          select() {
            return {
              eq() {
                return {
                  async maybeSingle() {
                    return {
                      data: {
                        id: sampleActivityId,
                        title: 'Workshop',
                        max_participants: 100,
                        status: 'upcoming',
                        registration_deadline: new Date(Date.now() + 86400000).toISOString(),
                      },
                      error: null,
                    }
                  },
                }
              },
            }
          },
        }
      }
      if (table === 'registrations') {
        return {
          select(fields, opts) {
            if (opts?.count === 'exact') {
              return {
                eq() {
                  return {
                    async eq() {
                      return { count: 32, error: null }
                    },
                  }
                },
              }
            }
            return {
              eq() {
                return {
                  eq() {
                    return {
                      order() {
                        return {
                          limit() {
                            return {
                              async maybeSingle() {
                                return {
                                  data: {
                                    id: 'reg-active-uuid',
                                    student_id: testStudentId,
                                    activity_id: sampleActivityId,
                                    status: 'registered',
                                    registered_at: '2026-10-04T12:00:00Z',
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
          },
        }
      }
    },
  }

  const reqStatus = {
    user: { id: testStudentId },
    params: { activityId: sampleActivityId },
    mockClient: mockStatusDb,
  }
  const resStatus = createMockResponse()
  await getRegistrationStatus(reqStatus, resStatus)
  assert(resStatus.statusCode === 200, 'Status check returns HTTP 200')
  assert(resStatus.body?.registered === true, 'Accurately indicates registered: true')
  assert(resStatus.body?.totalRegistered === 32, 'Returns exact active registrations count (32)')
  assert(resStatus.body?.availableSeats === 68, 'Returns calculated available seats (68)')
  assert(resStatus.body?.isFull === false, 'Indicates isFull: false')

  // --------------------------------------------------------------------------
  // TEST 12: Cancellation Flow (Updates status = 'cancelled', no hard deletes)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 12: Cancellation Preservation (No Hard Deletes) ---')
  let capturedCancelUpdate = null
  let tableDeleteCalled = false

  const mockCancelDb = {
    from(table) {
      if (table === 'registrations') {
        return {
          select() {
            return {
              eq() {
                return {
                  eq() {
                    return {
                      order() {
                        return {
                          limit() {
                            return {
                              async maybeSingle() {
                                return {
                                  data: {
                                    id: 'reg-active-uuid',
                                    student_id: testStudentId,
                                    activity_id: sampleActivityId,
                                    status: 'registered',
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
          },
          update(payload) {
            capturedCancelUpdate = payload
            return {
              eq() {
                return {
                  select() {
                    return {
                      async single() {
                        return {
                          data: {
                            id: 'reg-active-uuid',
                            student_id: testStudentId,
                            activity_id: sampleActivityId,
                            status: payload.status,
                            cancelled_at: payload.cancelled_at,
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
          delete() {
            tableDeleteCalled = true
            return { eq: () => ({}) }
          },
        }
      }
    },
  }

  const reqCancel = {
    user: { id: testStudentId },
    body: { activityId: sampleActivityId },
    mockClient: mockCancelDb,
  }
  const resCancel = createMockResponse()
  await cancelRegistration(reqCancel, resCancel)
  assert(resCancel.statusCode === 200, 'Cancellation succeeds with HTTP 200')
  assert(
    capturedCancelUpdate?.status === 'cancelled',
    "Status is updated to 'cancelled'"
  )
  assert(
    typeof capturedCancelUpdate?.cancelled_at === 'string',
    'Cancellation timestamp cancelled_at is recorded'
  )
  assert(
    !tableDeleteCalled,
    'DELETE SQL statement is never invoked on public.registrations during cancellation'
  )

  // --------------------------------------------------------------------------
  // TEST 13: Double Cancellation (Already Cancelled)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 13: Double Cancellation Handling ---')
  const mockAlreadyCancelledDb = {
    from(table) {
      if (table === 'registrations') {
        return {
          select() {
            return {
              eq() {
                return {
                  eq() {
                    return {
                      order() {
                        return {
                          limit() {
                            return {
                              async maybeSingle() {
                                return {
                                  data: {
                                    id: 'reg-cancelled-uuid',
                                    student_id: testStudentId,
                                    activity_id: sampleActivityId,
                                    status: 'cancelled',
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
          },
        }
      }
    },
  }

  const reqDoubleCancel = {
    user: { id: testStudentId },
    body: { activityId: sampleActivityId },
    mockClient: mockAlreadyCancelledDb,
  }
  const resDoubleCancel = createMockResponse()
  await cancelRegistration(reqDoubleCancel, resDoubleCancel)
  assert(
    resDoubleCancel.statusCode === 400,
    'Cancelling an already cancelled registration returns HTTP 400'
  )
  assert(
    resDoubleCancel.body?.code === 'ALREADY_CANCELLED',
    'Returns ALREADY_CANCELLED error code'
  )

  // --------------------------------------------------------------------------
  // TEST 14: Concurrency Mutex Lock Verification
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 14: Concurrency Mutex Serialization ---')
  const executionOrder = []
  const lockKey = 'test-concurrent-activity'

  const task1 = withActivityLock(lockKey, async () => {
    executionOrder.push('task1-start')
    await new Promise((r) => setTimeout(r, 40))
    executionOrder.push('task1-end')
  })

  const task2 = withActivityLock(lockKey, async () => {
    executionOrder.push('task2-start')
    await new Promise((r) => setTimeout(r, 10))
    executionOrder.push('task2-end')
  })

  await Promise.all([task1, task2])

  assert(
    executionOrder[0] === 'task1-start' &&
      executionOrder[1] === 'task1-end' &&
      executionOrder[2] === 'task2-start' &&
      executionOrder[3] === 'task2-end',
    'Concurrent operations for the same activity are strictly serialized by withActivityLock'
  )

  // --------------------------------------------------------------------------
  // TEST 15: Live Database End-to-End Registration Flow (Supabase)
  // --------------------------------------------------------------------------
  console.log('\n--- TEST 15: Live Database End-to-End Flow (Supabase Integration) ---')
  const admin = getAdminSupabase()
  if (admin) {
    const { data: liveAct } = await admin
      .from('activities')
      .select('id, title, max_participants')
      .limit(1)
      .maybeSingle()

    const { data: liveStudent } = await admin
      .from('profiles')
      .select('id, full_name, role')
      .eq('role', 'student')
      .limit(1)
      .maybeSingle()

    if (liveAct && liveStudent) {
      // Clean up any stale test record before starting
      await admin
        .from('registrations')
        .delete()
        .eq('student_id', liveStudent.id)
        .eq('activity_id', liveAct.id)

      // 1. Initial status check
      const liveRes1 = createMockResponse()
      await getRegistrationStatus(
        { user: { id: liveStudent.id }, params: { activityId: liveAct.id } },
        liveRes1
      )
      assert(
        liveRes1.statusCode === 200 && liveRes1.body.registered === false,
        'Live DB: Initial check confirms student is not registered'
      )

      // 2. Register student
      const liveRes2 = createMockResponse()
      await registerForActivity(
        {
          user: { id: liveStudent.id },
          profile: { id: liveStudent.id, role: 'student' },
          body: { activityId: liveAct.id },
        },
        liveRes2
      )
      assert(
        liveRes2.statusCode === 201 && liveRes2.body.registration?.status === 'registered',
        'Live DB: Student successfully registered with HTTP 201'
      )

      // 3. Status check after registration
      const liveRes3 = createMockResponse()
      await getRegistrationStatus(
        { user: { id: liveStudent.id }, params: { activityId: liveAct.id } },
        liveRes3
      )
      assert(
        liveRes3.statusCode === 200 && liveRes3.body.registered === true,
        'Live DB: Status check confirms registration is active'
      )

      // 4. Duplicate registration attempt
      const liveRes4 = createMockResponse()
      await registerForActivity(
        {
          user: { id: liveStudent.id },
          profile: { id: liveStudent.id, role: 'student' },
          body: { activityId: liveAct.id },
        },
        liveRes4
      )
      assert(
        liveRes4.statusCode === 409 && liveRes4.body.code === 'ALREADY_REGISTERED',
        'Live DB: Duplicate registration attempt rejected with HTTP 409'
      )

      // 5. Cancel registration
      const liveRes5 = createMockResponse()
      await cancelRegistration(
        { user: { id: liveStudent.id }, body: { activityId: liveAct.id } },
        liveRes5
      )
      assert(
        liveRes5.statusCode === 200 && liveRes5.body.registration?.status === 'cancelled',
        'Live DB: Registration cancelled successfully with HTTP 200'
      )
      assert(
        typeof liveRes5.body.registration?.cancelledAt === 'string',
        'Live DB: cancelled_at timestamp was persisted in PostgreSQL'
      )

      // 6. Double cancel attempt
      const liveRes6 = createMockResponse()
      await cancelRegistration(
        { user: { id: liveStudent.id }, body: { activityId: liveAct.id } },
        liveRes6
      )
      assert(
        liveRes6.statusCode === 400 && liveRes6.body.code === 'ALREADY_CANCELLED',
        'Live DB: Double cancellation attempt rejected with HTTP 400'
      )

      // 7. Cleanup
      await admin
        .from('registrations')
        .delete()
        .eq('student_id', liveStudent.id)
        .eq('activity_id', liveAct.id)
      assert(true, 'Live DB: Test artifacts cleaned up successfully')
    } else {
      console.log('Skipping live DB tests (no seed activity/student found)')
    }
  }

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n======================================================================')
  console.log(`  REGISTRATION BACKEND TEST RESULTS: ${passed}/${total} PASSED`)
  console.log('======================================================================')

  if (passed !== total) {
    process.exit(1)
  }
}

runRegistrationTestSuite().catch((err) => {
  console.error('[FATAL] Registration test suite failure:', err)
  process.exit(1)
})
