# docutils-parser

[![Build Status](https://travis-ci.com/vberlier/docutils-parser.svg?branch=master)](https://travis-ci.com/vberlier/docutils-parser)
![npm](https://img.shields.io/npm/v/docutils-parser.svg)

> Simple javascript parser for docutils xml documents.

This package uses [libxmljs](https://github.com/libxmljs/libxmljs) to parse and turn [docutils xml documents](http://docutils.sourceforge.net/docs/ref/doctree.html) into digestible javascript objects. This can be useful for working with documentation generated by tools like [sphinx](http://www.sphinx-doc.org).

```js
const docutils = require('docutils-parser');

const document = docutils.parse(`
  <document source=".../hello.rst">
    <section ids="hello-world" names="hello,\\ world!">
      <title>Hello, world!</title>
    </section>
  </document>
`);

console.log(document.children[0].children[0]);
// Output: { tag: 'title', attributes: {}, children: [ 'Hello, world!' ] }
```

## Installation

You can install `docutils-parser` with your `npm` client of choice.

```bash
$ npm install docutils-parser
```

## Usage

### docutils.parse(string, plugins = [])

Parse the input string and return a hierarchy of plain javascript objects. The function will throw an error if the input string isn't valid xml.

Let's take a look at what the function returned in the previous example.

```js
{
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
        }
      ]
    }
  ]
}
```

As you can see, each element is represented as a plain javascript object with a specific structure:

- The `tag` property is the name of the element
- The `attributes` property is an object mapping each attribute name to its value
- The `children` property is an array that can contain strings and other elements

Remember to catch parsing errors where appropriate.

```js
try {
  docutils.parse('invalid document');
} catch (err) {
  console.log(err);
  // Error: Start tag expected, '<' not found
}
```

#### Plugins

The second argument of the `docutils.parse()` function is an optional array of plugins. Plugins are simply functions that take an instance of `docutils.DocumentParser` as parameter.

```js
const titleToUpperCase = parser => {
  parser.on('element:title', element => {
    element.children[0] = element.children[0].toUpperCase();
  });
};

const document = docutils.parse(string, [titleToUpperCase]);

console.log(document.children[0].children[0]);
// Output: { tag: 'title', attributes: {}, children: [ 'HELLO, WORLD!' ] }
```

### docutils.DocumentParser({ plugins = [] } = {})

While you should probably always use the `docutils.parse()` function directly, instantiating the parser yourself is also possible.

```js
const parser = new docutils.DocumentParser();
const document = parser.parse(string);
```

Most of the time, you'll only interact with the parser through plugins. The `docutils.DocumentParser` class inherits from the nodejs [`EventEmitter`](https://nodejs.org/api/events.html#events_class_eventemitter) and lets you hook into various stages of the parsing process.

Event              | Arguments   | Description
------------------ | ----------- | ----------------------------------------------
`document:start`   |             | Emitted before parsing a document
`document:end`     | `document`  | Emitted after parsing a document
`element`          | `element`   | Emitted after parsing an element
`element:TAG_NAME` | `element`   | Emitted after parsing a `TAG_NAME` element

## Contributing

Contributions are welcome. This project uses [jest](https://jestjs.io/) for testing.

```bash
$ npm test
```

The code follows the [javascript standard](https://standardjs.com/) style guide.

```bash
$ npm run lint
```

---

License - [MIT](https://github.com/vberlier/docutils-parser/blob/master/LICENSE)
