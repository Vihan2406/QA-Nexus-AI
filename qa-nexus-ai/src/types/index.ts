export type ProjectStatus = 'Not Started' | 'In Progress' | 'Under Review' | 'Completed'
export type Priority = 'Critical' | 'High' | 'Medium' | 'Low'
export type AutomationStatus = 'Manual' | 'Automated'
export type ScriptFramework = 'cypress' | 'playwright'

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  status: ProjectStatus
  priority: Priority
  total_story_points: number
  remaining_story_points: number
  start_date: string | null
  target_date: string | null
  created_at: string
  tags: string[] | null
}

export interface TestSuite {
  id: string
  project_id: string
  title: string
  description: string | null
  created_at: string
  test_cases?: TestCase[]
}

export interface TestCase {
  id: string
  suite_id: string
  title: string
  steps: string[]
  expected_result: string
  automation_status: AutomationStatus
  priority: Priority
  generated_code: string | null
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id: string
  project_id: string | null
  action: string
  description: string
  created_at: string
}

export interface BurndownPoint {
  date: string
  ideal: number
  actual: number | null
}

export interface GeneratedTestCase {
  title: string
  priority: Priority
  steps: string[]
  expectedResult: string
  automationCode: string
  framework: ScriptFramework
}

export interface DashboardStats {
  totalProjects: number
  completedProjects: number
  totalStoryPoints: number
  remainingStoryPoints: number
  automatedTests: number
  manualTests: number
}
