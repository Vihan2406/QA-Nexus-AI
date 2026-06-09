-- ═══════════════════════════════════════════════════════════════
-- QA Nexus AI — Seed Data (Optional)
-- Run AFTER the migration file and AFTER creating your first user.
-- Replace 'YOUR-USER-UUID-HERE' with your actual auth.users UUID.
-- ═══════════════════════════════════════════════════════════════

-- To find your user UUID:
-- SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1;

DO $$
DECLARE
  v_user_id    UUID := 'YOUR-USER-UUID-HERE'; -- ← Replace this
  v_project1   UUID := uuid_generate_v4();
  v_project2   UUID := uuid_generate_v4();
  v_project3   UUID := uuid_generate_v4();
  v_suite1     UUID := uuid_generate_v4();
  v_suite2     UUID := uuid_generate_v4();
BEGIN

  -- ── Projects ─────────────────────────────────────────────────
  INSERT INTO public.projects
    (id, user_id, name, description, status, priority, total_story_points, remaining_story_points, start_date, target_date, tags)
  VALUES
    (
      v_project1, v_user_id,
      'User Authentication Module',
      'Complete login, registration, and SSO flows with session management and JWT handling.',
      'In Progress', 'Critical', 120, 45,
      NOW() - INTERVAL '30 days', NOW() + INTERVAL '14 days',
      ARRAY['Auth', 'Security', 'Backend']
    ),
    (
      v_project2, v_user_id,
      'Payment Gateway Integration',
      'Stripe and PayPal integration with subscription billing and webhook handlers.',
      'Under Review', 'High', 80, 12,
      NOW() - INTERVAL '60 days', NOW() + INTERVAL '7 days',
      ARRAY['Payments', 'Stripe', 'Webhooks']
    ),
    (
      v_project3, v_user_id,
      'Mobile App QA Regression',
      'Full regression suite for iOS and Android apps across 3 OS versions.',
      'Completed', 'High', 200, 0,
      NOW() - INTERVAL '90 days', NOW() - INTERVAL '10 days',
      ARRAY['Mobile', 'iOS', 'Android', 'Regression']
    );

  -- ── Test Suites ───────────────────────────────────────────────
  INSERT INTO public.test_suites (id, project_id, title, description)
  VALUES
    (v_suite1, v_project1, 'Login & Registration', 'All authentication-related test cases'),
    (v_suite2, v_project1, 'Session Management',   'Token refresh, expiry, and logout flows');

  -- ── Test Cases ────────────────────────────────────────────────
  INSERT INTO public.test_cases (suite_id, title, steps, expected_result, automation_status, priority, generated_code)
  VALUES
    (
      v_suite1,
      'TC-001: Successful login with valid credentials',
      ARRAY[
        'Navigate to /login',
        'Enter valid email: test@example.com',
        'Enter valid password: SecurePass123!',
        'Click Sign In button',
        'Verify redirect to /dashboard'
      ],
      'User is authenticated and redirected to dashboard. Auth token stored in localStorage.',
      'Automated', 'Critical',
      'cy.get(''[data-testid="email-input"]'').type(''test@example.com'');'
    ),
    (
      v_suite1,
      'TC-002: Login failure with wrong password',
      ARRAY[
        'Navigate to /login',
        'Enter valid email',
        'Enter incorrect password',
        'Click Sign In button',
        'Verify error message is displayed'
      ],
      'Error toast shows "Invalid email or password". User stays on login page.',
      'Automated', 'Critical',
      NULL
    ),
    (
      v_suite1,
      'TC-003: Empty form submission validation',
      ARRAY[
        'Navigate to /login',
        'Leave all fields empty',
        'Click Sign In button',
        'Verify field-level validation errors appear'
      ],
      'Email field shows "Required" error. Password field shows "Required" error.',
      'Manual', 'Medium',
      NULL
    ),
    (
      v_suite2,
      'TC-004: JWT token auto-refresh',
      ARRAY[
        'Log in as a valid user',
        'Wait for access token to expire (or mock expiry)',
        'Trigger an authenticated API call',
        'Verify the call succeeds with a refreshed token'
      ],
      'App silently refreshes the JWT and the API call succeeds without logout.',
      'Automated', 'High',
      NULL
    );

  -- ── Activity Log ──────────────────────────────────────────────
  INSERT INTO public.activity_log (user_id, project_id, action, description)
  VALUES
    (v_user_id, v_project1, 'project_created',  'Created project: User Authentication Module'),
    (v_user_id, v_project1, 'suite_created',     'Added test suite: Login & Registration'),
    (v_user_id, v_project1, 'testcase_created',  'Generated 4 AI test cases for Authentication'),
    (v_user_id, v_project3, 'project_completed', 'Marked project as Completed: Mobile App QA Regression');

END $$;
