export type FieldTypeValue =
  | 'text'
  | 'textarea'
  | 'number'
  | 'checkbox'
  | 'single-select'
  | 'multi-select'
  | 'date'
  | 'editor'

export interface FieldType {
  label: string
  value: FieldTypeValue
}

export interface ItemOption {
  key: string
  label: string
}

export interface Item {
  key: string
  label: string
  type: FieldTypeValue
  required: boolean
  options?: ItemOption[]
}

export const useNFormFieldHelper = () => {
  return {}
}
