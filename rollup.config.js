import buble from 'rollup-plugin-buble'

export default {
  input: 'src/index.js',
  output: {
    format: 'cjs',
    file: 'index.js'
  },
  plugins: [ buble() ],
  external: [ 'reselect' ]
}
