parallel async function execution and callback
========
Allows to trigger multiple async functions with a single common callback that is called once they have all returned. For full length example, see [example.js](https://github.com/Sheraff/parallel/blob/master/example.js).

Documentation below:
 - [simple use](https://github.com/Sheraff/parallel/tree/master#simple-use)
 - [nested calls](https://github.com/Sheraff/parallel/tree/master#nested-calls)
 - [resistant](https://github.com/Sheraff/parallel/tree/master#resistant)
 - [passing arguments](https://github.com/Sheraff/parallel/tree/master#passing-arguments)
 - [caveat](https://github.com/Sheraff/parallel/tree/master#caveat)


# Simple use
Just create a `Parallel` object and assign it functions to run with `.add()`: these functions will be called with a callback as last argument. The function passed to `.done()` will be called when all `add`ed functions have returned.
```javascript
new Parallel()
  .add(func1)
  .done(function(){ console.log('done') })
  
function func1(callback){
  console.log('hello')
  callback()
}
/*
 * hello
 * done
 */
```

# Nested calls
You can nest adding functions:
```javascript
var parallel = new Parallel()
  .add(function(callback){
    parallel.add(function(callback){
      console.log('nested')
      callback()
    })
    console.log('main level')
    callback()
  })
  .done(function(){ console.log('done') })
/*
 * main level
 * nested
 * done
 */
```
or even nest instances:
```javascript
new Parallel()
  .add(function(callback){
    new Parallel()
      .done(callback)
      .add(function(callback){
        console.log('nested')
        callback()
      })
    console.log('main level')
  })
  .done(function(){ console.log('done') })
/*
 * main level
 * nested
 * done
 */
```

# Resistant
You can `add()` and `done()` in any order:
```javascript
new Parallel()
  .add(func1)
  .done(func0)
  .add(func2)
// this still waits for func1 & func2 before executing func0
```
any number of times:
```javascript
new Parallel()
  .add(func1)
  .add(function(callback){
    callback();
    callback();
  })
  .done(func0)
// this still waits for func1 before executing func0
```
with any delay:
```javascript
var parallel = new Parallel()
setTimeout(function () {
	parallel.done(func0)
}, 3000);
setTimeout(function () {
	parallel.add(func1)
}, 2000);
setTimeout(function () {
	parallel.add(func2)
}, 1000);
// this still waits for func1 & func2 before executing func0
```

# Passing arguments
This could sound tricky to some people so here it is:
```javascript
new Parallel()
  .add(func1.bind(undefined, "argument"))
  .done(function(){ console.log("done") })
function func1(str, callback){
  console.log("received this argument: "+str)
  callback()
}
```

# Caveat
The function passed to `.done()` will be executed either:
 - if `.done()` was called before and all functions passed to `.add()` have called their `callback()`
 - if all functions passed to `.add()` have called their `callback()` before and `.done()` is called
 
meaning that the following examples would call the function passed to `.done()` prematurely:
```javascript
var parallel = new Parallel()
setTimeout(function () {
	parallel.done(func0)
}, 2000);
setTimeout(function () {
	parallel.add(func1)
}, 1000);
setTimeout(function () {
	parallel.add(func2)
}, 3000);
// here func0 is called before func2 returns
```
```javascript
var parallel = new Parallel()
  .done(func0)
  .add(func1)
setTimeout(function () {
	parallel.add(func2)
}, 1000);
// here func0 is called before func2 returns
```
