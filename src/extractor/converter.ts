import { FIELD } from "./types"

const makeControls = (item: any, field: FIELD) => {
  if (field === FIELD.methods) return undefined
  if (field === FIELD.css) return {
    name: item.name,
    description: item.description || undefined,
    default: item.default,
    control: {
      type: 'text',
    },
  }
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
    description: createObjectDescription(item.description, item.properties),
    control: {
      type: 'object',
    }
  }
  if (item.type === 'array') {
    if (item.items?.enum) return {
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

const wrapDescription = (description: string, typeDesc: string) => {
  return `
${description || ''}
<details>
  <summary>*Object properties*</summary>
  <ul>
  ${typeDesc}
  </ul>
</details>
  `
}

const createObjectDescription = (description: string, obj: any) => {
  if (!obj) return description || undefined
  const typeDesc = Object.keys(obj).map(key => `
    <li>
      <details>
        <summary>${key}: \`${obj[key].type || 'object'}\`</summary>
        ${obj[key].description}
      </details>
    </li>
  `).join('\n')
  return wrapDescription(description, typeDesc)
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
  if (field === FIELD.slots || field === FIELD.css) return false
  if (privacy !== 'public' && (kind === 'method' || field !== 'attributes')) return true
  return false
}

export const convertToArgs = (type: any, field: FIELD) => {
  if (isIgnored(type, field)) return undefined

  const res = {
    type: 'text',
    ...makeDefaultFields(type, field),
    ...makeControls(type, field),
    table: getTableFields(type, field)
  }
  return res
}
