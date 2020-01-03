# vue-deep-learning
vue 知识点的深入学习 & 源码学习

## vue源码学习

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
### Component组件化
- render 中的 h()函数
```
可以传入组件对象; 或者 tag 标签. 然后对应的调用createComponent方法
可分为组件 vnode 和 标签元素vnode
```
- patch 函数

