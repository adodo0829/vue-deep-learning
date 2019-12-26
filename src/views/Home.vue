<template>
  <div class="home">
    <func-button @click="handleClick">
      hello button
    </func-button>
    <t-title :id="id">我是标题{{id}}</t-title>
    <button @click="next">下一级标题</button>
    <hr>
    <List :data="['香蕉','苹果','橘子']" :render="render"></List>
  </div>
</template>

<script>
import FuncButton from '../function-components/func-button'
import TTitle from '../components/jsx-demo'
import List from '../components/list'

export default {
  name: 'home',
  components: {
    FuncButton,
    TTitle,
    List
  },
  data () {
    return {
      id: 1
    }
  },
  methods: {
    handleClick () {
      alert('你点到我了')
    },
    next () {
      ++this.id
    },
    // data是函数式组件在list组件中每次循环出来的结果
    render (h, data) { 
      return <span>{data}</span>
    }
  }
}
</script>
