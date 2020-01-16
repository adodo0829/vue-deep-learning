import { Watch } from './watch'

/**
 * 解析器
 * 1、解析模版指令，并替换模版数据，初始化视图 parse => AST => gen code
 * 2、将模版指令对应的节点绑定对应的更新函数，初始化相应的订阅器 Watcher
 */
export class Compile {
  constructor (el, vm) {
    this.vm = vm
    this.el = document.querySelector(el)
    this.fragment = null
    this.init()
  }
  // 初始化
  init () {
    if (this.el) {
      this.fragment = this.node2fragment(this.el)
      this.compileElement(this.fragment)
      this.el.appendChild(this.fragment)
    } else {
      alert('DOM节点不存在...')
    }
  }
  // node => 文档
  node2fragment (el) {
    let fragment = document.createDocumentFragment()
    let child = el.firstChild
    while (child) {
      fragment.appendChild(child)
      child = el.firstChild
    }
    return fragment
  }
  // 节点编译
  compileElement (el) {
    // 拿到父节点
    let childNodes = el.childNodes
    // 遍历子节点进行转化
    Array.prototype.slice.call(childNodes).forEach(node => {
      const reg = /\{\{(.*)}\}/
      const text = node.textContent

      // 判断节点类型, 进行不同编译
      if (isEleNode(node)) {
        this.compile(node)
      } else if (isTextNode(node) && reg.test(text)) {
        this.compileText(node, reg.exec(text)[1].trim())
      }

      if (node.childNodes && node.childNodes.length) {
        // 递归遍历子节点
        this.compileElement(node)
      }
    })
  }
  // 指令编译
  compile (node) {
    const nodeAttrs = node.attributes

    Array.prototype.forEach.call(nodeAttrs, attr => {
      let attrName = attr.name
      if (isDirective(attrName)) {
        const exp = attr.value
        const dir = attrName.substring(2)

        if (isEvent(dir)) {
          this.compileEvent(node, exp, dir)
        } else {
          this.compileVModel(node, exp)
        }

        node.removeAttribute(attrName)
      }
    })
  }
  // 编译{{}}
  compileText (node, exp) {
    let initText = this.vm[exp]
    this.updateText(node, initText) // 初始化
    // 订阅 && 派发更新
    // eslint-disable-next-line no-new
    new Watch(this.vm, exp, value => {
      this.updateText(node, value)
    })
  }
  // 编译事件 v-on
  compileEvent (node, exp, dir) {
    const eventType = dir.split(':')[1]
    const cb = this.vm.methods && this.vm.methods[exp]
    if (eventType && cb) {
      node.addEventListener(eventType, cb.bind(this.vm))
    }
  }
  // 编译自定义指令 v-model
  compileVModel (node, exp) {
    let val = this.vm[exp]
    this.updateModel(node, val) // 初始化
    // 实例化一个 Watcher 订阅者, 观测器变化
    // eslint-disable-next-line no-new
    new Watch(this.vm, exp, value => {
      this.updateModel(node, value)
    })

    node.addEventListener('input', e => {
      let nv = e.target.value
      if (val === nv) {
        return
      }
      this.vm[exp] = nv
      val = nv
    })
  }
  // 更新{{  }} DOM 数据
  updateText (node, value) {
    node.textContent = typeof value === 'undefined' ? '' : value
  }
  // 更新 v-model 数据
  updateModel (node, value) {
    node.value = typeof value === 'undefined' ? '' : value
  }
}

/**
 * 工具函数
 */
// 是否是指令
function isDirective (attr) {
  return attr.indexOf('v-') === 0
}
// 是否事件
function isEvent (dir) {
  return dir.indexOf('on:') === 0
}
// 元素节点
function isEleNode (node) {
  return node.nodeType === 1
}
// 文本节点
function isTextNode (node) {
  return node.nodeType === 3
}
