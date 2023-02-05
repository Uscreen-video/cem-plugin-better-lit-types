import * as TJS from "typescript-json-schema";
import path from 'path'
import process from 'process'
import ts from 'typescript'

const unhandledFunctions: string[] = []

const warn = console.warn

/**
 * Dirty hack to handle console.warn messages from TJS  
 * It raises when initializers are not found
 */
console.warn = (...msg) => {
  const execStr = 'exception evaluating initializer for property'
  const expressionStr = 'initializer is expression for property'
  const unknownStr = 'unknown initializer for property'
  const text: string = msg[0] || ''
  if (text.includes(execStr) || text.includes(expressionStr)) {
    return unhandledFunctions.push(text.split(' ').at(-1) as never)
  }
  if (text.includes(unknownStr)) {
    return unhandledFunctions.push((text.match(new RegExp(unknownStr +'(.*):'))![1] as never))
  }
  return warn(...msg)
}

const getReferenceType = (type: any, symbol: any) => {
  const typeName = type.$ref.split('/')[2]
  if (/HTML(.*)Element/.test(type.$ref)) return
  return symbol.definitions[typeName]
}

const mergeRefs = (type: any, symbol: any) => {
  Object.keys(type).forEach(k => {
    if (type[k]?.$ref) {
      type[k] = getReferenceType(type[k], symbol)
    }
  })
  if (!type?.$ref) return type
  const source = getReferenceType(type, symbol)
  return { ...type, ...source, $ref: undefined }
}

const updateTypes = (arr: any[], schema: any) => {
  arr?.forEach((attr: any, index: number) => {
    const propName = schema.properties?.[attr.fieldName || attr.name]
    if (unhandledFunctions.includes((attr.name as never))) attr.kind = 'method'
    if (propName) {
      arr[index] = { ...attr, ...mergeRefs(propName, schema) }
    }
  })
}

const updateModules = (generator: TJS.JsonSchemaGenerator) => (module: any) => {
  module.declarations.forEach((declaration: any) => {
    if (!generator['allSymbols'][declaration.name]) return
    const schema = generator.getSchemaForSymbol(declaration.name)
    updateTypes(declaration.attributes, schema)
    updateTypes(declaration.members, schema)
  })
}

const createGenerator = (manifest: any) => {
  const cwd = process.cwd()
  const configFile = path.resolve(cwd, 'tsconfig.json')
  const raw = ts.sys.readFile(configFile);

  if (!raw) throw new Error(`Can't find tsconfig.json file`)

  const files = manifest.modules.map((m: { path: string }) => path.resolve(cwd, m.path))
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
export const betterLitTypes = {
  name: 'BETTER TYPES',
  packageLinkPhase({ customElementsManifest }: { customElementsManifest: any }) {
    const generator = createGenerator(customElementsManifest)
    customElementsManifest.modules.forEach(updateModules(generator))
  }
}
