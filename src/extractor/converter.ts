import { FIELD } from "./types"

const makeControls = (item: any, field: FIELD) => {
  if (field === FIELD.methods) return undefined
  if (field === FIELD.slots) return {
    control: {
      type: 'text',
    },
  }
  if (item.enum) return {
    options: item.enum,
    control: {
      type: 'select',
    }
  }
  if (item.type === 'object') return {
    control: {
      type: 'object',
    }
  }
  if (item.type === 'array') {
    if (item.items) return {
      options: item.items?.enum,
      control: {
        type: 'multi-select',
      }
    }
    return {
      control: {
        type: 'object',
      }
    }
  }
  if (item.format === 'date-time') return {
    control: {
      type: 'date',
    },
  }
  if (item.type === 'string') return {
    control: {
      type: 'text',
    },
  }
  if (item.type === 'boolean') return {
    type: 'boolean',
    control: {
      type: 'boolean',
    },
  }
  if (item.type === 'number') return {
    type: 'number',
    control: {
      type: 'number',
    },
  }
  return {
    type: item.type
  }
}

const getTableFields = (item: any, field: FIELD) => {
  const category = item.kind === FIELD.methods ? FIELD.methods : field
  const defaultValue = {
    summary: item.default || undefined 
  }
  return {
    category,
    defaultValue
  }
}

const makeDefaultFields = ({ name, description }: any, field: FIELD) => ({
  name: field === FIELD.slots && !name ? 'default' : name,
  description: description || undefined,
  required: false,
})

const isIgnored = ({ privacy, kind }: any, field: FIELD) => {
  if (privacy === 'private') return true
  if (field === FIELD.slots) return false
  if (privacy !== 'public' && (kind === 'method' || field !== 'attributes')) return true
  return false
}

export const convertToArgs = (type: any, field: FIELD) => {
  if (isIgnored(type, field)) return undefined

  const res = {
    type: 'text',
    ...makeControls(type, field),
    ...makeDefaultFields(type, field),
    table: getTableFields(type, field)
  }
  return res
}
