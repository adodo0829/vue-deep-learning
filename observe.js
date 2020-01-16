/**
 * 属性监听器: 负责依赖收集 && 通知 && 触发更新
 */
// eslint-disable-next-line no-unused-vars
class Observe {
  // 实例属性
  constructor (data) {
    this.data = data
    this.walk(data)
  }
  // 这里应该进行递归遍历
  walk (data) {
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key])
    })
  }
  // 通过Object.defineProperties来劫持属性
  // 重写 get 和 set 方法
  defineReactive (data, key, value) {
    // 每一对象都持有一个 dep
    let dep = new Dep()
    observe(value)
    Object.defineProperties(data, key, {
      enumerable: true,
      configurable: true,
      get () {
        // 添加订阅者
        if (Dep.target) {
          dep.addSub(Dep.target)
        }
        return value
      },
      set (nv) {
        if (nv === value) {
          return
        }
        value = nv
        // 数据变化, 通知所有订阅者
        console.log('value发生改变了', value, nv)
        dep.notify()
      }
    })
  }
}

// dep: 负责收集依赖, 将观察者 Watcher 对象存放到当前闭包中的订阅者 Dep 的 subs 中
export class Dep {
  static target
  constructor () {
    this.subs = []
  }
  // 添加订阅者
  addSub (sub) {
    this.subs.push(sub)
  }
  // 订阅通知
  notify () {
    this.subs.forEach(sub => {
      // 通知订阅者
      sub.update()
    })
  }
}
Dep.target = null

export const observe = val => {
  if (!val || typeof val !== 'object') {
    return
  }
  return new Observe(val)
}
