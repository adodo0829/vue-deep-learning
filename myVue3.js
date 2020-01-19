/**
 * @description vue3 的相关原理
 */

// 负责记录所有obj的依赖, 类似 Dep 的作用
const objMap = new WeakMap()
// Symbol创建一个唯一值来作为target一个特殊的key，我们去循环我们的代理对象时，
// 这个key会收集依赖，当我们的代理对象有新增Key或删除Key时触发 相关依赖
const ONLY_KEY = Symbol('only')

let activeEffect = null // 当前正在处理的依赖

// 触发 getter 时收集依赖
function track (obj, type, key) {
  if (!activeEffect) return
  // target obj
  let depsMap = objMap.get('obj')
  if (!depsMap) {
    depsMap = new Map()
    objMap.set(obj, depsMap)
  }

  // target key
  let deps = depsMap.get(key)
  if (!deps) {
    deps = new Set()
    depsMap.set(key, deps)
  }

  // 记录
  deps.add(key, deps)
  activeEffect.deps.push(deps)
  activeEffect.options.onTrack({
    effect: activeEffect,
    obj,
    type,
    key
  })
}

// 触发 setter 是触发依赖更新
function trigger (obj, type, key) {
  const depsMap = objMap.get(obj)
  if (depsMap) {
    if (type === 'add' || type === 'delete') {
      key = ONLY_KEY
    }
    const deps = depsMap.get(key)
    if (deps) {
      depsMap.forEach(effect => {
        effect.options.onTrigger(effect, obj, type, key)
        effect()
      })
    }
  }
}
// reactive可以理解为vue的Observer，负责将复杂对象转换成响应式数据
function reactive (obj) {
  return new Proxy(obj, handler)
}

// effect可以理解为vue的Watcher, 即依赖追踪,观察者
function effect (cb, options) {
  const effect = () => {
    // 缓存
    activeEffect = effect
    const res = cb()
    activeEffect = null
    return res
  }
  effect.deps = []
  effect.options = options
  effect()
  return effect
}

// proxy 的 handler
const handler = {
  get (obj, key, receiver) {
    const res = Reflect.get(obj, key)
    // 收集,追踪依赖
    track(obj, 'get', key)
    return typeof res === 'object' ? reactive(res) : res
  },
  set (obj, key, value, receiver) {
    const hasKey = Object.prototype.hasOwnProperty.call(obj, key)
    const res = Reflect.set(obj, key, value)
    // 捕捉,更新依赖
    trigger(obj, hasKey ? 'set' : 'add', key)
    return res
  }
}

export default {
  reactive,
  effect
}

// demo
let data = {
  name: 'huhua',
  age: 25
}

let reactiveData = reactive(data)

// effect(fn, options)
// fn中读取的Key会收集依赖，当key被设置时触发，并再次执行fn
let options = {
  onTrack (effect, target, key, type) {
    // key被读取时的回调
    // console.log(...arguments)
    console.log(target, key)
    // console.log('this is my origin name', target[key])
  },
  onTrigger (effect, target, key, type) {
    // key被设置时的回调
    console.log(...arguments)
    // console.log('this is my change name', target[key])
  }
}
effect(() => {
  Object.keys(reactiveData).forEach(key => {
    console.log(key, reactiveData[key])
  })
}, options)

reactiveData.name = 'vue3'
