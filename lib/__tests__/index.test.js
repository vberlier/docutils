const docutils = require('../index')

const basicDoc = require('./documents/hello.xml')

test('converts a basic document successfully', () => {
  const result = docutils.parseDocument(basicDoc)

  expect(result).toEqual({
    tag: 'root',
    attributes: {
      source: '.../docs/hello.rst'
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
          'This page is empty.'
        ]
      }
    ]
  })
})
