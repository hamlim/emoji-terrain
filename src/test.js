class Node {
  constructor({ id, next = null, prev = null }) {
    this.id = id
    this.next = next
    this.prev = prev
  }
  next() {
    return this.next
  }
  prev() {
    return this.prev
  }
  setPrev(prev) {
    this.prev = prev
  }
  setNext(next) {
    this.next = next
  }
}
class LinkedList {
  constructor(nodes) {
    this.count = nodes
    this.makeNodes()

    this.currentNode = this.nodes[0]
  }
  makeNodes() {
    this.nodes = Array.from(
      { length: this.count },
      (_, i) => i,
    ).map(i => new Node({ id: i }))
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
}

const list = new LinkedList(5)

console.log(list.current())
