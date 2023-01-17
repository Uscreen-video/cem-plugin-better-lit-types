import * as TJS from "typescript-json-schema";
import path from 'path'
import process from 'process'
import ts from 'typescript'

const unhandledFunctions = []

const warn = console.warn

console.warn = (...msg) => {
  const execStr = 'exception evaluating initializer for property'
  const expressionStr = 'initializer is expression for property'
  const unknownStr = 'unknown initializer for property'
  if (msg[0].includes(execStr) || msg[0].includes(expressionStr)) {
    return unhandledFunctions.push(msg[0].split(' ').at(-1))
  }
  if (msg[0].includes(unknownStr)) {
    return  unhandledFunctions.push(msg[0].match(new RegExp(unknownStr +'(.*):'))[1])
  }
  return warn(...msg)
}

const mergeRefs = (type, symbol) => {
  if (!type.$ref) return type
  const source = symbol.definitions[type.$ref.split('/')[2]]
  return { ...type, ...source, $ref: undefined }
}

const updateTypes = (arr, schema) => {
  arr?.forEach((attr, index) => {
    const propName = schema.properties?.[attr.fieldName || attr.name]
    if (unhandledFunctions.includes(attr.name)) attr.kind = 'method'
    if (propName) {
      arr[index] = { ...attr, ...mergeRefs(propName, schema) }
    }
  })
}

const updateModules = generator => module => {
  module.declarations.forEach(declaration => {
    if (!generator.allSymbols[declaration.name]) return
    const schema = generator.getSchemaForSymbol(declaration.name)
    updateTypes(declaration.attributes, schema)
    updateTypes(declaration.members, schema)
  })
}

const createGenerator = (manifest) => {
  const cwd = process.cwd()
  const configFile = path.resolve(cwd, 'tsconfig.json')
  const raw = ts.sys.readFile(configFile);

  if (!raw) throw new Error(`Can't find tsconfig.json file`)

  const files = manifest.modules.map((m) => path.resolve(cwd, m.path))
  const { config } = ts.parseConfigFileTextToJson(configFile, raw)

  const program = TJS.getProgramFromFiles(files, config.compilerOptions, cwd);

  return TJS.buildGenerator(program, {
    ignoreErrors: true,
    noExtraProps: true,
    include: [path.resolve(cwd, 'global.d.ts')]
  })
}

/**
 * Creates better types for LitElement
 */
export default {
  name: 'BETTER TYPES',
  packageLinkPhase({ customElementsManifest }) {
    const generator = createGenerator(customElementsManifest)
    customElementsManifest.modules.forEach(updateModules(generator))
  }
}
