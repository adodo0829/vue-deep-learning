import { Dep } from './observe'
// 订阅器, 也可以叫作观察者
// 主要是根据 依赖变化 和 订阅者dep发过来的通知(notify)来更新视图(update)
/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 */
// Wathcer 在构造函数中会初始化 2 个 Dep 实例数组，newDeps 表示新添加的 Dep 实例数组，而 deps 表示上一次添加的 Dep 实例数组。
export class Watcher {
  constructor (vm, expression, cb) {
    this.vm = vm
    this.expression = expression
    this.cb = cb
    this.value = this.get()
  }
  // 派发更新
  update () {
    this.run()
  }
  run () {
    // 这里有一个 watcher 队列, 会在 nextTick 进行批量异步更新
    let val = this.vm.data[this.expression]
    let oldVal = this.value
    // 判断新旧值
    if (val !== oldVal) {
      this.value = val
      // 执行回调
      this.cb.call(this.vm, val, oldVal)
    }
  }
  get () {
    // 缓存订阅者 self
    Dep.target = this
    let value = this.vm.data[this.expression]
    Dep.target = null
    return value
  }
}
