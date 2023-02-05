
import { convertToArgs } from './converter.js'
import { FIELD } from './types.js'

const defaultMapper = (i: any) => i

export const reduceTypes = (
  arr: any[],
  key: FIELD,
  mapArgs = defaultMapper) => {
  if (!arr?.length) return
  return arr.reduce((acc, type) => {
    const itemProps = mapArgs(convertToArgs(type, key))
    if (!itemProps) return acc
    const name = key === FIELD.slots && itemProps.name === 'default'
      ? 'slot'
      : itemProps.name

    acc[name] = itemProps
    return acc
  }, {})
}

export const getComponentDeclaration = (manifest: any, tagName: string) => {
  let _declaration
  manifest?.modules?.forEach((_module: any) => {
    _module?.declarations?.forEach((declaration: any) => {
      if (declaration.tagName === tagName) {
        _declaration = declaration;
      }
    });
  });
  return _declaration
}

export const createArgsExtractor = (manifest: any, mapArgs?: typeof defaultMapper) => (componentName: string) => {
  const declaration: any = getComponentDeclaration(manifest, componentName)
  if (!declaration) return
  return {
    ...reduceTypes(declaration.attributes, FIELD.attributes, mapArgs),
    ...reduceTypes(declaration.members, FIELD.properties, mapArgs),
    ...reduceTypes(declaration.slots, FIELD.slots, mapArgs),
    ...reduceTypes(declaration.cssProperties, FIELD.css, mapArgs)
  }
}
