
<h3 align="center"><code>cem-plugin-better-lit-types</code></h3>

<p align="center">
  Extracts Typescript types from Lit components
</p>
<br />

### Installation
> First of all you have to have [Custom Elements Manifest Analyzer](https://custom-elements-manifest.open-wc.org/analyzer/getting-started/) installed

Install module using your favorite package manager eq:
```bash
npm install -D cem-plugin-better-lit-types
```
Create or add to existing `custom-elements-manifest.config.mjs` following lines:
```javascript
import BetterLitTypesPlugin from 'cem-plugin-better-lit-types';

export default {
  plugins: [BetterLitTypesPlugin]
}
```
<br />
<br />
<h3 align="center"><code>Storybook Types Mapper</code></h3>
<br />

### About
In this package we also provides an types extractor for [storybook](https://storybook.js.org/) and `@storybook/web-components` that maps extracted types to storybook [controls](https://storybook.js.org/docs/react/essentials/controls).


### Usage
> This method works only with the Storybook's [web-components](https://www.npmjs.com/package/@storybook/web-components) framework

Add default setup for web-components in you `preview.js`
```javascript
import { setCustomElementsManifest } from '@storybook/web-components'
import customElements from '../custom-elements.json'
import { createArgsExtractor, createLitRenderer } from 'cem-plugin-better-lit-types/storybook'
```

Use extractor in your `parameters.docs` section
```javascript
export const parameters = {
  docs: {
    extractArgTypes: createArgsExtractor(customElements)
  }
}

/**
 * Custom renderer made specially for LitComponents  
 */
export const render = createLitRenderer({
  wrapSlots: true, // Wraps a non-default slot in `<span slot="name">`
  joinArray: true  // Converts array to a comma-separated string
})
```
<br /><br /><br />

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## License

Distributed under the MIT License. See `LICENSE` for more information.
