const fs = require('fs')
const { spawn } = require('child_process')
const args = process.argv.slice(2)
function print(...vals){console.log(...vals)}
function getBetween(str,firstChar,secondChar) {
    var firstIndexes = charPos(str, firstChar)
    var secondIndexes = charPos(str, secondChar)
    var strlist = []
    if (firstChar == secondChar){
        firstIndexes = firstIndexes.filter(function(_, i) {
            return (i + 1) % 2;
        })
        secondIndexes = secondIndexes.filter(function(_, i) {
            return (i + 0) % 2;
        })
    }
    for(let index = 0; index < firstIndexes.length; index++){
        const i1 = firstIndexes[index]+1
        const i2 = secondIndexes[index]
        strlist.push(str.substring(i1,i2))
    }
    return strlist
}
function charPos(str, char) {
    return str
        .split("")
        .map(function (c, i) { if (c == char) return i; })
        .filter(function (v) { return v >= 0; });
}
function stringStartsWith(str, substrs) {
  print(str,substrs)
  substrs.forEach((substr) => {
    if (str.startsWith(substr)) {
      print(true)
      return true
    }
  })
  return false
}
class token {
    constructor(type, val){
        this.type = type
        this.val = val
    }
}
file = args[0]
var filePath, code, tokens
if (String(file).includes('/')) {
    filePath = file
} else {
    filePath = `${process.cwd()}/${file}`
}
const contents = fs.readFileSync(filePath).toString()
const lines = contents.split('\n')
var tokens = [], newcontent = '', funcs = [], cfile = '',filei = 0
lines.forEach((line) => {
  if (line.startsWith('#include')) {
    const contents = fs.readFileSync(line.replace('#include ','')).toString()
    newcontent = `${newcontent}\nfrom: ${line.replace('#include ','')}\n${contents}\nfrom: test.e\n`
  }
  else {
    newcontent = `${newcontent}\n${line}`
  }
})
const newlines = newcontent.split('\n')
newlines.forEach((line,i) => {
  regexp = new RegExp('^(?:' + funcs.join('|') + ')\\b');
  if (line.startsWith('from')) {
    cfile = line.replace('from: ','')
    filei = i
  }
  else if (line.trim().startsWith('print')) {
    if (line.endsWith(")")) {tokens.push(new token('PRINT',getBetween(line,"(",")")[0]))}
    else {
      console.error(`missing parantisess in print statement on line ${i-filei} of file ${cfile}`)
      process.exit(1)
    }
  }
  else if (line.trim().startsWith('var')) {
    tokens.push(new token('VAR_DECLARE',{name: line.replace('var ','').split('=')[0].trim(), val: line.replace('var ').split('=')[1].trim()}))
  }
  else if (line.trim().startsWith('func')) {
    tokens.push(new token('FUNC_DECLARE',{name: line.substring(5,line.indexOf('(')).trim(), args: getBetween(line,"(",")")[0]}))
    funcs.push(line.substring(4,line.indexOf('(')).trim())
  }
  else if (line.trim().startsWith('}')) {
    tokens.push(new token('FUNC_END'))
  }
  else if (regexp.test(line)) {
    tokens.push(new token('FUNC_CALL',{name: line.substring(0,line.indexOf('(')), args: getBetween(line,"(",")")[0]}))
  }
})
print(tokens)
var code = ''
tokens.forEach((token) => {
  if (token.type == "PRINT") {
    code = `${code}\nconsole.log(${token.val})`
  }
  else if (token.type == "VAR_DECLARE") {
    code = `${code}\nvar ${token.val.name} = ${token.val.val}`
  }
  else if (token.type == 'FUNC_DECLARE') {
    code = `${code}\nfunction ${token.val.name}(${token.val.args}) {`
  }
  else if (token.type == 'FUNC_END') {
    code = `${code}\n}`
  }
  else if (token.type == 'FUNC_CALL') {
    code = `${code}\n${token.val.name}(${token.val.args})`
  }
})
fs.writeFileSync('file.js',code)
const node = spawn('node',['file.js'])
node.stderr.on('data', (data) => {
  console.error(data.toString())
})
node.stdout.on('data', (data) => {
  console.log(`${data}`)
})