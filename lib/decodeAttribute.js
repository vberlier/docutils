const LIST_LITERAL_TOKENS = {
  OPEN_BRACKET: /\[/,
  CLOSE_BRACKET: /\]/,
  COMMA: /,/,
  SINGLE_QUOTED_STRING: /'(?:\\.|[^\\])*?'/,
  DOUBLE_QUOTED_STRING: /"(?:\\.|[^\\])*?"/,
  NONE_LITERAL: /None/,
  INVALID: /.+/
}

const LIST_LITERAL_REGEX = new RegExp(
  Object.values(LIST_LITERAL_TOKENS)
    .map(regex => `\\s*(${regex.source})\\s*`)
    .join('|'),
  'g'
)

function * tokenizeListLiteral (literal) {
  for (const [, ...groups] of literal.matchAll(LIST_LITERAL_REGEX)) {
    const token = Object.keys(LIST_LITERAL_TOKENS).reduce(
      (token, currentType, i) =>
        token || (groups[i] && { type: currentType, value: groups[i] }),
      undefined
    )

    yield token.type === 'INVALID' ? undefined : token
  }
}

class ListLiteralParser {
  constructor (literal) {
    this.tokens = tokenizeListLiteral(literal)
    this.current = undefined
    this.next()
  }

  getValueAsList () {
    if (!this.current || this.current.type !== 'OPEN_BRACKET') {
      return undefined
    }

    const value = this.parseList()

    return !this.next() ? value : undefined
  }

  next () {
    const { value, done } = this.tokens.next()
    this.current = done ? undefined : value
    return this.current
  }

  parseList () {
    const result = []

    while (this.next() && this.current.type !== 'CLOSE_BRACKET') {
      let item

      switch (this.current.type) {
        case 'SINGLE_QUOTED_STRING':
        case 'DOUBLE_QUOTED_STRING':
          item = this.parseString()
          break
        case 'NONE_LITERAL':
          item = this.parseNone()
          break
        case 'OPEN_BRACKET':
          item = this.parseList()
          break
      }

      if (item === undefined) {
        return undefined
      }

      result.push(item)

      if (!this.next()) {
        return undefined
      }

      if (this.current.type === 'COMMA') {
        continue
      }

      return this.current.type === 'CLOSE_BRACKET' ? result : undefined
    }

    return this.current && result
  }

  parseString () {
    return this.current.value
      .substring(1, this.current.value.length - 1)
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
  }

  parseNone () {
    return null
  }
}

module.exports = value => {
  value = value.replace(/\\ /g, ' ')

  return new ListLiteralParser(value).getValueAsList() || value
}
