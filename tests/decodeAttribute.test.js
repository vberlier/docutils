const decodeAttribute = require('../lib/decodeAttribute')

test('decode escaped spaces', () => {
  expect(decodeAttribute('hello\\ world')).toEqual('hello world')
})

test('decode normal string', () => {
  expect(decodeAttribute('foo')).toEqual('foo')
})

test('decode list attribute', () => {
  expect(decodeAttribute('[]')).toEqual([])
})

test("decode attribute that could look like a list but isn't", () => {
  expect(decodeAttribute('["hello\\ world",+]')).toEqual('["hello world",+]')
})

test('decode a list with a trailing comma', () => {
  expect(decodeAttribute('["hello\\ world",]')).toEqual(['hello world'])
})

test('decode an heterogeneous list', () => {
  expect(
    decodeAttribute('["hello\\ world", None, \'\', "", "\\"None"]')
  ).toEqual(['hello world', null, '', '', '"None'])
})

test('decode a recursive list', () => {
  expect(
    decodeAttribute('[["hello\\ world", [None, []], \'\',], "", "\\"None"]')
  ).toEqual([['hello world', [null, []], ''], '', '"None'])
})

test('decode funky spacing', () => {
  expect(
    decodeAttribute(
      `[   [    "hello\\ world"  \n , [
       None, \n[ \n]], ''
       ,], "", "\\"None" ]   \n `
    )
  ).toEqual([['hello world', [null, []], ''], '', '"None'])
})
