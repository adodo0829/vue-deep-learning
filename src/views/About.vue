<template>
  <div class="about">
    <h1>This is an about page</h1>
    <child v-model="v"></child>
    <p>value is: {{ v }}</p>
  </div>
</template>

<script>
import child from '../components/child'

export default {
  components: {
    child
  },
  data () {
    return {
      v: 'hello'
    }
  }
}
</script>
