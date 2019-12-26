// export default {
//   name: 'functional-button',
//   functional: true,
//   render (h, context) {
//     return h('button', '按钮 1 号')
//   }
// }
// export default {
//   name: 'funtional-button',
//   functional: true,
//   render (h, { children }) {
//     return h('button', children)
//   }
// }
export default {
  functional: true,
  render (h, { props, listeners, children }) {
    return h(
      'button',
      {
        attrs: props,
        on: {
          click: listeners.click
        }
      },
      children
    )
  }
}
