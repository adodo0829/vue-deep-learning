<template>
  <div>
    <input :value="value" @input="listenValue" type="text">
  </div>
</template>

<script>
export default {
  props: {
    value: String
  },
  methods: {
    listenValue (ev) {
      this.$emit('input', ev.target.value)
    }
  }
}
</script>
