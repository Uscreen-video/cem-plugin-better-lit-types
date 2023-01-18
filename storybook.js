import { html, unsafeStatic } from 'lit/static-html.js';
import { spread as _spread } from '@open-wc/lit-helpers'

export const getDeclaration = (customElements, tagName) => {
  let _declaration
  customElements?.modules?.forEach((_module) => {
    _module?.declarations?.forEach((declaration) => {
      if (declaration.tagName === tagName) {
        _declaration = declaration;
      }
    });
  });
  return _declaration
}

export const getControlOptions = (item) => {
  if (item.enum) return {
    type: 'select',
    options: item.enum
  }
  if (item.format === 'date-time') return {
    type: 'date'
  }
  if (item.type === 'string') return {
    type: 'text',
  } 
  return {
    type: item.type
  }
}

export const getType = (item) => {
  switch (item.type) {
    case 'string':
      return 'text'
    default:
      return item.type
  }
}

export const getItemProps = (item, key) => {
  const type = getType(item)
  const isAttribute = key === 'attributes'
  if (key === 'slots') return {
    name: item.name || 'default',
    required: false,
    type: 'text',
    description: item.description,
    defaultValue: '',
    control: {
      type: 'text'
    },
    table: {
      category: 'slots',
    },
  }
  if (item.privacy === 'private') return
  if (item.kind === 'method') {
    if (item.privacy !== 'public') return
    return {
      name: item.name,
      required: false,
      description: item.description,
      table: {
        category: 'methods'
      },
    }
  }

  if (!isAttribute && item.privacy !== 'public') return

  return {
    name: item.name,
    required: false,
    description: item.description,
    type: type,
    control: isAttribute ? getControlOptions(item) : false,
    defaultValue: item.default,
    table: {
      category: isAttribute ? 'attributes' : 'properties',
      defaultValue: {
        summary: item.default,
      },
    },
  }
}

export const reduceProps = (arr, key) => {
  if (!arr?.length) return
  return arr.reduce((acc, item) => {
    const itemProps = getItemProps(item, key)
    if (!itemProps) return acc
    acc[item.name || key === 'slots' && 'slot'] = itemProps
    return acc
  }, {})
}

const getPrefix = (element) => {
  switch (typeof element){
    case 'boolean':
      return '?'
    case 'object':
      return '.'
    default:
      return ''
  }
}

export const spread = (args, { joinArrays }) => {
  return _spread(Object.keys(args).reduce((acc, key) => {
    const element = args[key]
    const isArray = Array.isArray(element)
    const prefix = !joinArrays && isArray ? '' : getPrefix(element)
    acc[prefix + key] = !joinArrays && isArray ? element.join(',') : element
    return acc
  }, {}))
}

const getAttrsAndSlots = (props, types, { wrapSlots }) => {
  let slots = ''
  const attributes = {}
  Object.keys(props).forEach(key => {
    if (!props[key]) return
    if (types[key]?.table?.category === 'slots') {
     slots += !wrapSlots || key === 'slot'
        ? props[key]
        : `<span slot="${key}">${props[key]}</span>`
    } else {
      attributes[key] = props[key]
    }
  })
  return [attributes, slots]
}

export const createLitRenderer = (settings = {}) = (props, options) => {
  const tag = unsafeStatic(options.component)
  const [attributes, slots] = getAttrsAndSlots(props, options.argTypes, settings)
  return html`<${tag} ${spread(attributes, settings)}>${unsafeStatic(slots)}</${tag}>`
}

export const createArgsExtractor = manifest => componentName => {
  const declaration = getDeclaration(manifest, componentName)
  if (!declaration) return
  return {
    ...reduceProps(declaration.attributes, 'attributes'),
    ...reduceProps(declaration.members, 'properties'),
    ...reduceProps(declaration.slots, 'slots')
  }
}
