export type Task = 'response' | 'fixation'
export type Response = 'left' | 'right'
export type KeyboardResponse = 'f' | 'j'

export interface RecursiveRecord {
  [key: string]: number | string | RecursiveRecord
}

// prettier-ignore
// eslint-disable-next-line @stylistic/max-len
export type RecursiveRecordArray = Record<string, number | string | RecursiveRecord | number[] | string[] | RecursiveRecord[]>

export interface TrialData {
  chosen_words: string[]
  exp_phase: string
  intended_words: string[]
  words: string[]
  trial_order: number
  clue: string
  num_correct: number

  subject_id: number

  task: string
  response: string
  correct: boolean
  correct_response: string
  saveToFirestore: boolean
}
