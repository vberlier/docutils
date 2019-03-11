const libxmljs = require('libxmljs')

function emptyNode (tag) {
  return {
    tag,
    attributes: {},
    children: []
  }
}

class DocumentParser {
  constructor () {
    this.root = null
    this.stack = []
    this.preserveSpace = null

    this.sax = new libxmljs.SaxParser()

    this.events = [
      'startDocument',
      'startElementNS',
      'endElementNS',
      'characters'
    ]

    for (const eventName of this.events) {
      this.sax.on(eventName, this[eventName].bind(this))
    }
  }

  parse (string) {
    if (this.sax.parseString(string)) {
      return this.root.children[0]
    }
    return null
  }

  startDocument () {
    this.root = emptyNode('root')
    this.stack = [this.root]
    this.preserveSpace = null
  }

  startElementNS (elem, attrs) {
    const element = emptyNode(elem)
    this.stack[this.stack.length - 1].children.push(element)

    this.stack.push(element)

    for (const [key, prefix, , value] of attrs) {
      if (prefix === 'xml') {
        if (key === 'space' && value === 'preserve') {
          if (!this.preserveSpace) {
            this.preserveSpace = element
          }
        }
      } else {
        element.attributes[key] = value
      }
    }
  }

  endElementNS () {
    const element = this.stack.pop()

    if (this.preserveSpace === element) {
      this.preserveSpace = null
    }
  }

  characters (chars) {
    if (!this.preserveSpace) {
      chars = chars.replace(/\s+/g, ' ').trim()
    }

    if (chars) {
      const children = this.stack[this.stack.length - 1].children

      if (typeof children[children.length - 1] === 'string') {
        children[children.length - 1] += chars
      } else {
        children.push(chars)
      }
    }
  }
}

function parseDocument (string) {
  const parser = new DocumentParser()
  return parser.parse(string)
}

module.exports = { DocumentParser, parseDocument, emptyNode }
