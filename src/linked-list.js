class Node {
  constructor({ id, next = null, prev = null }) {
    this.id = id
    this.nextNode = next
    this.prevNode = prev
    this.next = this.next.bind(this)
    this.prev = this.prev.bind(this)
  }
  next() {
    return this.nextNode
  }
  prev() {
    return this.prevNode
  }
  setPrev(prev) {
    this.prevNode = prev
  }
  setNext(next) {
    this.nextNode = next
  }

  name() {
    return this.id
  }

  toString() {
    return JSON.stringify({
      name: this.id,
      id: this.id,
    })
  }
}
export default class LinkedList {
  constructor(nodes) {
    this.count = nodes
    this.makeNodes()

    this.currentNode = this.nodes[0]
  }
  makeNodes() {
    this.nodes = Array.from({ length: this.count }, (_, i) => i + 1).map(
      i => new Node({ id: i }),
    )
    this.nodes.forEach((node, index, nodes) => {
      if (index !== 0 && index !== nodes.length - 1) {
        node.setNext(nodes[index + 1])
        node.setPrev(nodes[index - 1])
      } else if (index === 0) {
        node.setNext(nodes[index + 1])
      } else if (index === nodes.length - 1) {
        node.setPrev(nodes[index - 1])
      }
    })
    this.nodes[0].setPrev(this.nodes[this.count - 1])
    this.nodes[this.count - 1].setNext(this.nodes[0])
    this.nodes[0].setPrev(this.nodes[this.count - 1])
    this.nodes[this.count - 1].setNext(this.nodes[0])
  }

  current() {
    return this.currentNode
  }

  toString() {
    return JSON.stringify({
      count: this.count,
      current: this.currentNode.toString(),
    })
  }
}
