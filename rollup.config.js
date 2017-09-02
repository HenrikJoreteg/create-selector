export default {
  input: 'src/index.js',
  output: {
    format: 'cjs',
    file: 'index.js'
  },
  external: [ 'reselect' ]
}
