# vue-deep-learning
vue 知识点的深入学习 & 源码学习

## vue源码学习
数据更新DOM,数据驱动DOM
### vue入口
- vue 本身
```
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}
Vue就是一个Function构造函数, 通过 new Vue()实例化;可以通过prototype去扩展公共方法和属性;
备注: 通过 Object.create(null) 创建一个纯净可定制的 map 数据结构
```
- 初始化 _init
```
调用initGlobalAPI方法, 添加全局的静态方法等; 传入配置项 options;
合并配置，初始化生命周期，初始化事件中心，初始化渲染，初始化 data、props、computed、watcher 等...
if (vm.$options.el) {
    vm.$mount(vm.$options.el)
  }
初始化的最后，检测到如果有 el 属性，则调用 vm.$mount 方法挂载 vm，挂载的目标就是把模板渲染成最终的 DOM
就是template => render() => VNode 的过程
通过 mountComponent() 函数 => 调用实例的_render 和 _update 函数
```
- render 函数
```
# virtual dom
用原生的 JS 对象去描述一个 DOM 节点，它比创建一个DOM的代价要小很多, 避免使用 document.createElement
创建大量不必要的属性
# vnode 创建
核心定义包含几个关键属性，标签名、数据、子节点、键值等, 参考源码 _createElement方法

function _createElement (
  context: Component,
  tag?: string | Class<Component> | Function | Object,
  data?: VNodeData,
  children?: any,
  normalizationType?: number
): VNode | Array<VNode> {
  if (isDef(data) && isDef((data: any).__ob__)) {
    process.env.NODE_ENV !== 'production' && warn(
      `Avoid using observed data object as vnode data: ${JSON.stringify(data)}\n` +
      'Always create fresh vnode data objects in each render!',
      context
    )
    return createEmptyVNode()
  }
  // object syntax in v-bind
  if (isDef(data) && isDef(data.is)) {
    tag = data.is
  }
  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode()
  }
  // warn against non-primitive key
  if (process.env.NODE_ENV !== 'production' &&
    isDef(data) && isDef(data.key) && !isPrimitive(data.key)
  ) {
    if (!__WEEX__ || !('@binding' in data.key)) {
      warn(
        'Avoid using non-primitive value as key, ' +
        'use string/number value instead.',
        context
      )
    }
  }
  // support single function children as default scoped slot
  if (Array.isArray(children) &&
    typeof children[0] === 'function'
  ) {
    data = data || {}
    data.scopedSlots = { default: children[0] }
    children.length = 0
  }
  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children)
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children)
  }
  let vnode, ns
  if (typeof tag === 'string') {
    let Ctor
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      )
    } else if (isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      vnode = createComponent(Ctor, data, context, children, tag)
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      )
    }
  } else {
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children)
  }
  if (Array.isArray(vnode)) {
    return vnode
  } else if (isDef(vnode)) {
    if (isDef(ns)) applyNS(vnode, ns)
    if (isDef(data)) registerDeepBindings(data)
    return vnode
  } else {
    return createEmptyVNode()
  }
}
备注: vnode children 参数扁平化,规范化 Array.prototype.concat.apply([], children)
```
```
# vnode 到真实的DOM树
通过_update 方法, 核心是 patch 方法的调用(区分平台)
function patch (oldVnode, vnode, hydrating, removeOnly) {}
  oldVnode 表示旧的 VNode 节点，它也可以不存在或者是一个 DOM 对象；
  vnode 表示执行 _render 后返回的 VNode 的节点；
  hydrating 表示是否是服务端渲染；
  removeOnly 是给 transition-group 用的

递归插入子节点元素
```
- vue 初始化过程
  new Vue实例 -> init初始化参数 -> $mount调用 -> compile编译template -> render生成节点 -> vnode -> pacth映射dom -> DOM
  初始化即是一个深度遍历的过程

### Component组件化
- render 中的 h()函数
```
可以传入组件对象; 或者 tag 标签. 然后对应的调用createComponent方法
可分为组件 vnode 和 标签元素vnode
```
- 普通元素根节点组件的 vnode patch
```
function createElm (
  vnode,
  insertedVnodeQueue,
  parentElm,
  refElm,
  nested,
  ownerArray,
  index
) {
  // ...
  if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
    return
  }

  const data = vnode.data
  const children = vnode.children
  const tag = vnode.tag
  if (isDef(tag)) {
    // ...

    vnode.elm = vnode.ns
      ? nodeOps.createElementNS(vnode.ns, tag)
      : nodeOps.createElement(tag, vnode)
    setScope(vnode)

    /* istanbul ignore if */
    if (__WEEX__) {
      // ...
    } else {
      createChildren(vnode, children, insertedVnodeQueue)
      if (isDef(data)) {
        invokeCreateHooks(vnode, insertedVnodeQueue)
      }
      insert(parentElm, vnode.elm, refElm)
    }
    
    // ...
  } else if (isTrue(vnode.isComment)) {
    vnode.elm = nodeOps.createComment(vnode.text)
    insert(parentElm, vnode.elm, refElm)
  } else {
    vnode.elm = nodeOps.createTextNode(vnode.text)
    insert(parentElm, vnode.elm, refElm)
  }
}
```
- 子组件 vnode patch
```
function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
  let i = vnode.data
  if (isDef(i)) {
    // ....
    if (isDef(i = i.hook) && isDef(i = i.init)) {
      i(vnode, false /* hydrating */)
    }
    // ...
    if (isDef(vnode.componentInstance)) {
      initComponent(vnode, insertedVnodeQueue)
      insert(parentElm, vnode.elm, refElm)
      if (isTrue(isReactivated)) {
        reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
      }
      return true
    }
  }
}
```
完成组件的整个 patch 过程后，最后执行 insert(parentElm, vnode.elm, refElm) 完成组件的 DOM 插入，正常过程dom 插入顺序是先父后子, 但如果组件 patch 过程中又创建了子组件，那么DOM 的插入顺序是先子后父。这里我们也可以分析父子组件的生命周期等特性...

- 初始化配置合并 vm.$options
```
Vue.prototype._init = function (options?: Object) {
  // merge options
  if (options && options._isComponent) {
    // optimize internal component instantiation
    // since dynamic options merging is pretty slow, and none of the
    // internal component options needs special treatment.
    initInternalComponent(vm, options)
  } else {
    vm.$options = mergeOptions(
      resolveConstructorOptions(vm.constructor),
      options || {},
      vm
    )
  }
  // ...
}
```
两种情况下的 merge 逻辑: 分别为: new Vue() 和 Vue.extend()
第二个继承自 Vue, 最后生成的配置项在 options 的__proto__中
- lifecycle
```
1.beforeCreate && created
Vue.prototype._init = function (options?: Object) {
  // ...
  initLifecycle(vm)
  initEvents(vm)
  initRender(vm)
  callHook(vm, 'beforeCreate')
  initInjections(vm)   // resolve injections before data/props
  initState(vm)        // 初始化 props、data、methods、watch、computed 等属性
  initProvide(vm)      // resolve provide after data/props
  callHook(vm, 'created')
  // 在 created 钩子中可以访问 props 等属性...
}

2.beforeMount && mounted
mounted钩子: 组件的 VNode patch 到 DOM 后，会执行 invokeInsertHook 函数，把 insertedVnodeQueue 里保存的钩子函数依次执行一遍, insertedVnodeQueue 的添加顺序是先子后父，所以对于同步渲染的子组件而言，mounted 钩子函数的执行顺序也是先子后父;
同时, 也会实例化一个渲染的 Watcher 去监听 vm 上的数据变化重新渲染

3.beforeUpdate & updated
beforeUpdate 和 updated 的钩子函数执行时机都是在数据更新的时候
beforeUpdate 的执行时机是在渲染 Watcher 的 before 函数中
update 的执行时机是在flushSchedulerQueue 函数调用的时候

4.beforeDestroy & destroyed
自内向外递归销毁组件自身
```
- 高阶异步组件
```
const AsyncComp = () => ({
  // 需要加载的组件。应当是一个 Promise
  component: import('./MyComp.vue'),
  // 加载中应当渲染的组件
  loading: LoadingComp,
  // 出错时渲染的组件
  error: ErrorComp,
  // 渲染加载中组件前的等待时间。默认：200ms。
  delay: 200,
  // 最长等待时间。超出此时间则渲染错误组件。默认：Infinity
  timeout: 3000
})
Vue.component('async-example', AsyncComp)
```

### 响应式原理
- 响应式对象
```
Object.defineProperty(obj, prop, desc)
obj 是要在其上定义属性的对象；
prop 是要定义或修改的属性的名称；
descriptor 是将被定义或修改的属性描述符,是一个键值对,其中核心的 get 和 set属性

export function initState (vm: Component) {
  vm._watchers = []
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props)
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}
在初始化的过程中, 会调用各种 init 方法, 这里以 data 的初始化为例
```
- data 初始化
```
function initData (vm: Component) {
  let data = vm.$options.data
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {}
  if (!isPlainObject(data)) {
    data = {}
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    )
  }
  // proxy data on instance
  const keys = Object.keys(data)
  const props = vm.$options.props
  const methods = vm.$options.methods
  let i = keys.length
  while (i--) {
    const key = keys[i]
    if (process.env.NODE_ENV !== 'production') {
      if (methods && hasOwn(methods, key)) {
        warn(
          `Method "${key}" has already been defined as a data property.`,
          vm
        )
      }
    }
    if (props && hasOwn(props, key)) {
      process.env.NODE_ENV !== 'production' && warn(
        `The data property "${key}" is already declared as a prop. ` +
        `Use prop default value instead.`,
        vm
      )
    } else if (!isReserved(key)) {
      proxy(vm, `_data`, key)
    }
  }
  // observe data
  observe(data, true /* asRootData */)
}
data 的初始化主要过程也是做两件事，一个是对定义 data 函数返回对象的遍历，通过 proxy 把每一个值 vm._data.xxx 都代理到 vm.xxx 上；另一个是调用 observe 方法观测整个 data 的变化，把 data 也变成响应式，可以通过 vm._data.xxx 访问到定义 data 返回函数中对应的属性.
```
- proxy 代理
```
代理的主要作用是吧_data, _prop 等 私有属性代理到实例 vm上, 使我们可以通过实例 vm 来访问 data, prop 中的值, 也就是我们经常通过 this.xxx 来访问一些定义在组件中的属性
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

export function proxy (target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
```
- observe 监测数据的变化
```
export function observe (value: any, asRootData: ?boolean): Observer | void {
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  let ob: Observer | void
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value)
  }
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
}
observe 方法的作用就是给非 VNode 的对象类型数据添加一个 Observer，如果已经添加过则直接返回，否则在满足一定条件下去实例化一个 Observer 对象实例。
```
- Observer类
Observer 是一个类，它的作用是给对象的属性添加 getter 和 setter，用于依赖收集和派发更新
```
demo
```