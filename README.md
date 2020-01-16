# vue2的实现原理
```
// vue 响应式
import { observe } from './observe'
import { Compile } from './compile'

class MyVue {
  constructor (options) {
    // 初始化 这里省略一些初始化工作...
    this.data = options.data
    this.methods = options.methods
    // 代理对象属性
    this._proxy(options.data)
    // 添加数据监听
    observe(this.data)
    // 模板解析: parse, optimize, generate, 其中 watcher 写在 complile 中了
    // 当 解析生成的render function 被渲染的时候，因为会读取所需对象的值，所以会触发 getter 函数进行依赖收集，依赖收集的目的是将观察者 Watcher 对象存放到当前闭包中的订阅者 Dep 的 subs 中。
    new Compile(options.el, this)
    // 挂载DOM
    options.mounted.call(this)
  }

  // 将 key 代理待 this 上
  _proxy (data) {
    const that = this
    Object.keys(data).forEach(key => {
      Object.defineProperties(that, key, {
        enumerable: true,
        configurable: true,
        get () {
          return that.data[key]
        },
        set (nv) {
          that.data[key] = nv
        }
      })
    })
  }
}

```
