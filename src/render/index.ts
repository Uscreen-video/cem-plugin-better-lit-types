import { html, unsafeStatic } from 'lit/static-html.js';
import { spread as _spread } from '@open-wc/lit-helpers'

type Settings = {
  joinArrays?: boolean,
  wrapSlots?: boolean
}

const getPrefix = (element: any) => {
  switch (typeof element){
    case 'boolean':
      return '?'
    case 'object':
      return '.'
    default:
      return ''
  }
}

const getAttrsAndSlots = (props: any, types: any, { wrapSlots }: Settings): [Record<string, any>, string] => {
  let slots = ''
  const attributes:Record<string, any> = {}
  Object.keys(props).forEach(key => {
    if (!props[key]) return
    if (types[key]?.table?.category === 'slots') {
     slots += !wrapSlots || key === 'slot'
        ? props[key]
        : props[key].startsWith('<')
         ? props[key].replace(/(>|\/>)/, ` slot="${key}">`)
         : `<span slot="${key}">${props[key]}</span>`
    } else {
      attributes[key] = props[key]
    }
  })
  return [attributes, slots]
}

export const spread = (args: any, { joinArrays }: Settings = {}) => {
  return _spread(Object.keys(args).reduce<Record<string, any>>((acc, key) => {
    const element = args[key]
    const isArray = Array.isArray(element)
    const prefix = joinArrays && isArray ? '' : getPrefix(element)
    acc[prefix + key] = joinArrays && isArray ? element.join(',') : element
    return acc
  }, {}))
}

export const createLitRenderer = (settings: Settings = {}) => (props:any, options:any) => {
  const tag = unsafeStatic(options.component)
  const [attributes, slots] = getAttrsAndSlots(props, options.argTypes, settings)
  return html`<${tag} ${spread(attributes, settings)}>${unsafeStatic(slots)}</${tag}>`
}
