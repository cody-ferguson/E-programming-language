# E programming language
The E programming language is meant for educational purpose and to fix a misconception that programming languages are hard to make.
It is not meant to be taken seriously, but feel free to suggest features anytime.

The E programming language is built off node.js and currently requires [node.js](https://nodejs.org/en/) to run.<br>
This will not be the case in the future, but for now, I will not be releasing binaries for this just because features will be added so frequently. 
Feel free to download the source code and make your own binaries, but please don't release them.
# Statements
## Simple summary
```
// comment
```
Litterly just a comment<br><br>
```
#include this.e
```
Self explanatory...it includes any file you give it.<br><br>
```
var variable_name = "variable_value"
```
Variable declaration<br><br>
```
func functionName(funcionArgs) {
  // function code
}
```
Function declaration<br><br>
```
print("Meme = hello world")
```
Prints to console.<br><br>
```
if ("hello" in "hello world") {
  // true
}
```

Checks if first thing is in second thing<br><br>
```
if ("hello" equals "hello world") {
  // false
}
```

Checks if first thing equals second thing

## Detailed explaination
### Print
Translates from this format,
```
print("Meme = hello world")
```
to this in javascript.
```
console.log("Meme = hello world")
```

### In
Translates from this format,
```
"hello" in "hello world"
```
to this in javascript.
```
"hello world".includes("hello")
```

### Equals
Translates from this format,
```
"hello" equals "hello world"
```
to this in javascript.
```
"hello" == "hello world"
```
