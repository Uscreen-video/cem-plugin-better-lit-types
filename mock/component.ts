import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { Enum, Number } from './types'

/**
 * Lit component types example
 */
@customElement('ds-avatar')
export class TestComponent extends LitElement {

  /**
   * This property will be in `attributes` and `members` with the following members:
   * ```
   * {
   *  type: 'string',
   *  default: 'bar',
   *  enum: ['foo', 'bar', 'baz']
   * }
   */
  @property({ type: Boolean })
  prop1: keyof typeof Enum = 'bar'


  /**
   * This property will be in `attributes` and `members` with the following members:
   * ```
   * {
   *  type: 'number',
   *  default: 1
   * }
   */
  @property({ type: Boolean, attribute: 'attr1' })
  prop2: Number = 1

  /**
   * This property have to be only in `attributes` section
   */
  prop3: string = 'foo'

  /**
   * This prop have to be ignored
   */
  prop4: HTMLAreaElement

  /**
   * This method will be set to `members` with kind "method"
   */
  method1 = (a: string, b: string) => {
    return a + b
  }

  /**
   * This method will be set to `members` with kind "method"
   */
  method2(a: string, b: string) {
    return a + b
  }


  render() {
    return html`
      <slot></slot>
    `
  }
}
