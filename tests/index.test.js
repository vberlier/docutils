const docutils = require('../index')

const basicDoc = require('./documents/hello.xml')
const longDoc = require('./documents/index.xml')

describe('parser', () => {
  test('basic document', () => {
    const result = docutils.parse(basicDoc)
    expect(result).toEqual({
      tag: 'document',
      attributes: {
        source: '.../hello.rst'
      },
      children: [
        {
          tag: 'section',
          attributes: {
            ids: 'hello-world',
            names: 'hello,\\ world!'
          },
          children: [
            {
              tag: 'title',
              attributes: {},
              children: [
                'Hello, world!'
              ]
            },
            {
              tag: 'paragraph',
              attributes: {},
              children: [
                'This file is empty.'
              ]
            }
          ]
        }
      ]
    })
  })

  test('long document', () => {
    const result = docutils.parse(longDoc)
    expect(result).toMatchSnapshot()
  })

  test('invalid document', () => {
    expect(() => docutils.parse('invalid xml')).toThrow()
  })
})

describe('parser plugins', () => {
  test('execution order', () => {
    let count = 0
    const first = jest.fn(() => expect(count++).toEqual(0))
    const second = jest.fn(() => expect(count++).toEqual(1))

    docutils.parse(basicDoc, [first, second])

    expect(first).toBeCalled()
    expect(second).toBeCalled()
  })

  test('can use parser', () => {
    const plugin = jest.fn(parser => {
      expect(parser).toBeInstanceOf(docutils.DocumentParser)
    })

    docutils.parse(basicDoc, [plugin])

    expect(plugin).toBeCalled()
  })
})

describe('parser events', () => {
  let parser

  beforeEach(() => {
    parser = new docutils.DocumentParser()
  })

  test('document:start', () => {
    const callback = jest.fn(() => {
      expect(parser.root.children.length).toEqual(0)
    })

    parser.on('document:start', callback).parse(basicDoc)

    expect(callback).toBeCalled()
  })

  test('document:end', () => {
    const callback = jest.fn(document => {
      expect(document).toBe(parser.root.children[0])
    })

    parser.on('document:end', callback).parse(basicDoc)

    expect(callback).toBeCalled()
  })

  test('element', () => {
    const visits = ['document', 'section', 'paragraph', 'title']

    const callback = jest.fn(element => {
      expect(element.tag).toEqual(visits.pop())
    })

    parser.on('element', callback).parse(basicDoc)

    expect(callback).toBeCalled()
    expect(visits).toEqual([])
  })

  test('element:not_present_in_document', () => {
    const callback = jest.fn()

    parser.on('element:not_present_in_document', callback).parse(basicDoc)

    expect(callback).not.toBeCalled()
  })

  test('element:title', () => {
    const callback = jest.fn(element => {
      expect(element).toBe(parser.root.children[0].children[0].children[0])
    })

    parser.on('element:title', callback).parse(basicDoc)

    expect(callback).toBeCalled()
  })
})
