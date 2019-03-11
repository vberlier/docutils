const docutils = require('../index')

const basicDoc = require('./documents/hello.xml')
const longDoc = require('./documents/index.xml')

test('converts a basic document successfully', () => {
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

test('converts a long document successfully', () => {
  const result = docutils.parse(longDoc)
  expect(result).toMatchSnapshot()
})

test('throws error with invalid xml', () => {
  expect(() => docutils.parse('invalid xml')).toThrow()
})

test('executes plugins in the right order', () => {
  let count = 0

  const first = () => count++
  const second = () => expect(count++).toEqual(1)

  docutils.parse(basicDoc, [first, second])

  expect(count).toEqual(2)
})
