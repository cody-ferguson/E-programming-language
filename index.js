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
var tokens = [], newcontent = `from ${file}`, funcs = [], cfile = '',filen = 0
lines.forEach((line) => {
  if (line.startsWith('#include')) {
    const contents = fs.readFileSync(line.replace('#include ','')).toString()
    newcontent = `${newcontent}\nfrom ${line.replace('#include ','')}\n${contents}\nfrom ${file}\n`
  }
  if (line.includes("//")) {
    const comment = line.substring(line.indexOf('//') + 1);
    newcontent = `${newcontent}\n${line.replace(comment,'')}`
  }
  else {
    newcontent = `${newcontent}\n${line}`
  }
})
const newlines = newcontent.split('\n')
newlines.forEach((line,n) => {
  regexp = new RegExp('^(?:' + funcs.join('|') + ')\\b');
  if (line.startsWith('from')) {
    cfile = line.replace('from ','')
    filen = n
  }
  else if (line.trim().startsWith('print')) {
    if (line.endsWith(")")) {tokens.push(new token('PRINT',getBetween(line,"(",")")[0]))}
    else {
      console.error(`missing parantisess in print statement on line ${n-filen} of file ${cfile}`)
      console.error(line)
      process.exit(1)
    }
  }
  else if (line.trim().startsWith('var')) {
    tokens.push(new token('VAR.DECLARE',{name: line.replace('var ','').split('=')[0].trim(), val: line.replace('var ').split('=')[1].trim()}))
  }
  else if (line.trim().startsWith('func')) {
    tokens.push(new token('FUNC.DECLARE',{name: line.substring(5,line.indexOf('(')).trim(), args: getBetween(line,"(",")")[0]}))
    funcs.push(line.substring(4,line.indexOf('(')).trim())
  }
  else if (line.trim().startsWith('}')) {
    tokens.push(new token('BRACKETS.END'))
  }
  else if (line.trim().startsWith('if')){
    let content = getBetween(line,"(",")")[0]
    if (/("?(?:\w*)"?) in ("?(?:\w*)"?)/.test(content)) {
      let matches = content.match(/("?(?:\w*)"?) in ("?(?:\w*)"?)/)
      tokens.push(new token('IF',new token("IN",{first: matches[1], second: matches[2]})))
    }
    else if (/("?(?:\w*)"?) = ("?(?:\w*)"?)/.test(content)) {
      let matches = content.match(/("?(?:\w*)"?) = ("?(?:\w*)"?)/)
      tokens.push(new token('IF',new token("EQUAL",{first: matches[1], second: matches[2]})))
    }
  }
  else if (regexp.test(line)) {
    tokens.push(new token('FUNC.CALL',{name: line.substring(0,line.indexOf('(')), args: getBetween(line,"(",")")[0]}))
  }
})
var code = '', lastfunc
tokens.forEach((token,i) => {
  if (token.type == "PRINT") {
    code = `${code}\nconsole.log(${token.val})`
  }
  else if (token.type == "VAR.DECLARE") {
    code = `${code}\nvar ${token.val.name} = ${token.val.val}`
  }
  else if (token.type == 'FUNC.DECLARE') {
    code = `${code}\nfunction ${token.val.name}(${token.val.args}) {`
    lastfunc = i
  }
  else if (token.type == 'IF') {
    if (token.val.type == 'IN') {
      code = `${code}\nif (${token.val.val.second}.includes(${token.val.val.first})) {`
    }
    else if (token.val.type == 'EQUAL') {
      code = `${code}\nif (${token.val.val.second} == ${token.val.val.first}) {`
    }
  }
  else if (token.type == 'BRACKETS.END') {
    code = `${code}\n}`
  }
  else if (token.type == 'FUNC.CALL') {
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