/**
 * vue3 响应式前置知识回顾
 */

// Set, new Set([iterable])
let set = new Set()
// Prop: size
// API: add has delete clear
set.add({ hello: 1 }).add({ hello: 1 }).add(1)
// 迭代器遍历, for...of, forEach, set.keys(), set.values()等
for (const item of set.keys()) {
  console.log(item)
}

// WeakSet
// WeakSet 的成员只能是对象，而不能是其他类型的值
// WeakSet 中的对象都是弱引用,, 垃圾回收机制不考虑 WeakSet 对该对象的引用
// WeakSet 里面的引用都不计入垃圾回收机制, 因此适合临时存放一组对象，以及存放跟对象绑定的信息。
// 只要这些对象在外部消失，它在 WeakSet 里面的引用就会自动消失; 且成员不可遍历
let wset = new WeakSet()

// Map
let map = new Map()
// Prop: size
// API: add has delete clear
console.log(map)
