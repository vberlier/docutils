const docutils = require('../index')

const basicDoc = require('./documents/hello.xml')
const longDoc = require('./documents/index.xml')

test('converts a basic document successfully', () => {
  const result = docutils.parseDocument(basicDoc)
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
  const result = docutils.parseDocument(longDoc)
  expect(result).toMatchSnapshot()
})
