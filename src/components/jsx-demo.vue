<script>
export default {
  name: 'h-title',
  props: {
    id: {
      type: Number,
      default: 1
    }
  },
  render () {
    const hText = `<h${this.id}>${this.$slots.default[0].text}</h${this.id}>`
    return <div domPropsInnerHTML={hText}></div>
  }
}
</script>
