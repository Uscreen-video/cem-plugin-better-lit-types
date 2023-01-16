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
  if (item.privacy === 'private') return
  if (item.kind === 'method') {
    if (item.privacy !== 'public') return
    return {
      item: item,
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

export const reduceProps = (arr, key) => arr.reduce((acc, item) => {
  const itemProps = getItemProps(item, key)
  if (!itemProps) return acc
  acc[item.name] = itemProps
  return acc
}, {})

export const createArgsExtractor = manifest => componentName => {
  const declaration = getDeclaration(manifest, componentName)
  if (!declaration) return
  return {
    ...reduceProps(declaration.attributes, 'attributes'),
    ...reduceProps(declaration.members, 'properties')
  }
}
