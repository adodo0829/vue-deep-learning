const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: () => {},
  set: () => {}
}
// target: Object, sourceKey: string, key: string
export function proxy (target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
const t = {
  _data: {
    a: 1
  }
}
// 将 '_data' 对象的值代理到 t 上
proxy(t, '_data', 'a')
console.log(t)
