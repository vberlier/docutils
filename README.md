# docutils-parser

> Simple javascript parser for docutils xml documents.

This package turns [docutils xml documents](http://docutils.sourceforge.net/docs/ref/doctree.html) into digestible javascript objects.

```js
const docutils = require('docutils-parser');

const document = docutils.parseDocument(`
  <document source=".../hello.rst">
      <section ids="hello-world" names="hello,\\ world!">
          <title>Hello, world!</title>
          <paragraph>This file is empty.</paragraph>
      </section>
  </document>
`)

console.log(document.attributes.source)
// Output: '.../hello.rst'

const section = document.children[0]
console.log(section.children[0])
// Output: { tag: 'title', attributes: {}, children: [ 'Hello, world!' ] }
```

## Installation

```bash
$ npm install docutils-parser
```

## Usage

WIP

---

License - [MIT](https://github.com/vberlier/docutils-parser/blob/master/LICENSE)
