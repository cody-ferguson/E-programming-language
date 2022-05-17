const vm = require('vm')
const code = `console.log('hello from the vm')`
vm.runInThisContext(code) // hello from the vm