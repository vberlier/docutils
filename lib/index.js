const EventEmitter = require('events')
const { parser } = require('sax')

const decodeAttribute = require('./decodeAttribute')
const textElements = require('./textElements')

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

    this.document = null
    this.stack = []
    this.preserveSpace = null

    this.sax = parser(true, { xmlns: true })

    this.sax.onready = () => {
      this.stack.push(emptyNode('root'))
      this.preserveSpace = null

      this.emit('document:start')
    }

    this.sax.onend = () => {
      this.document = this.stack.pop().children[0]

      this.emit('document:end', this.document)
    }

    this.sax.onopentag = (node) => {
      const element = emptyNode(node.name)
      this.stack[this.stack.length - 1].children.push(element)

      this.stack.push(element)

      for (const { local, value, prefix } of Object.values(node.attributes)) {
        if (prefix === 'xml') {
          if (local === 'space' && value === 'preserve') {
            if (!this.preserveSpace) {
              this.preserveSpace = element
            }
          }
        } else {
          element.attributes[local] = decodeAttribute(value)
        }
      }
    }

    this.sax.onclosetag = () => {
      const element = this.stack.pop()

      if (this.preserveSpace === element) {
        this.preserveSpace = null
      }

      this.emit('element', element)
      this.emit('element:' + element.tag, element)
    }

    this.sax.ontext = (text) => {
      if (!this.preserveSpace) {
        text = text.replace(/\s+/g, ' ')
      }

      const parent = this.stack[this.stack.length - 1]

      if (text !== ' ' || textElements.has(parent.tag)) {
        const { children } = parent

        if (typeof children[children.length - 1] === 'string') {
          children[children.length - 1] += text
        } else {
          children.push(text)
        }
      }
    }

    for (const plugin of this.plugins) {
      plugin(this)
    }

    this.sax.onready()
  }

  parse (string) {
    this.sax.write(string).close()
    return this.document
  }
}

function parse (string, plugins = []) {
  const parser = new DocumentParser({ plugins })
  return parser.parse(string)
}

module.exports = { parse, DocumentParser }
