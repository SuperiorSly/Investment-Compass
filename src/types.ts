export interface QuestionOption {
  value: string
  label: string
}

export interface SurveyQuestion {
  id: string
  number: number
  prompt: string
  type?: 'radio' | 'text' | 'checkbox'
  required?: boolean
  options?: QuestionOption[]
}

export type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

export interface SurveyPayload {
  answers: Record<string, string>
  email: string | null
  phone: string | null
  submittedAt: string
  source: string
}
