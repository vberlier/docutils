const EventEmitter = require('events')
const libxmljs = require('libxmljs')

const decodeAttribute = require('./decodeAttribute')

function emptyNode (tag) {
  return {
    tag,
    attributes: {},
    children: []
  }
}

class DocumentParser extends EventEmitter {
  constructor ({ plugins = [] } = {}) {
    super()

    this.plugins = plugins

    this.root = null
    this.stack = []
    this.preserveSpace = null

    this.sax = new libxmljs.SaxParser()

    this.events = [
      'startDocument',
      'endDocument',
      'startElementNS',
      'endElementNS',
      'characters'
    ]

    for (const eventName of this.events) {
      this.sax.on(eventName, this[eventName].bind(this))
    }

    this.sax.on('error', message => {
      throw new Error(message)
    })

    for (const plugin of this.plugins) {
      plugin(this)
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

    this.emit('document:start')
  }

  endDocument () {
    this.emit('document:end', this.root.children[0])
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
        element.attributes[key] = decodeAttribute(value)
      }
    }
  }

  endElementNS () {
    const element = this.stack.pop()

    if (this.preserveSpace === element) {
      this.preserveSpace = null
    }

    this.emit('element', element)
    this.emit('element:' + element.tag, element)
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

function parse (string, plugins = []) {
  const parser = new DocumentParser({ plugins })
  return parser.parse(string)
}

module.exports = { parse, DocumentParser }
