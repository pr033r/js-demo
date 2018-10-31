'use strict';

// Functions are objects.

{ // {...} is newer than (function () {...})();
}

(function () {

    // * A variable is a property of a special internal object (Lexical Environment), 
    //   associated with the currently executing block/function/script.
    // * Working with variables is actually working with the properties of that object.

    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const sum1 = multipleArgs(1, 2, 3, 4, 5);
    const sum2 = multipleArgs(...arr, 1); // multipleArgs(arr) will not work

    // in browser there is global object window, in NodeJS is global, but it is used rarely (both of them)
    const globalObject = this === window;

    const stringToBeJoined = 'The Lord Of The Rings';
    const joinedString = joinChars([...stringToBeJoined]); // same as Array.from(stringToBeJoined);, but three dots are only for iterable
    const nameOfAFunction = joinChars.name;

    callingHandlers('Adam', name => console.log(`Hello: ${name}`), name => console.log(`Goodbye ${name}`));
    const countOfParams = callingHandlers.length; // it ignores ...rest params

    const counter = counterHandler();
    const alternativeFunctionCalling = counterHandler()();
    counter.count = 10; // without using function property, we cannot access to count variable in outer counterHandler() function
    let counterValue = counter();
    counterValue = counter();

    // with added name after function, we can refer to that function. 
    // If we'd use pow.property, the name 'pow' can be changed in future and function will throw error
    let squarePow = function func(base) {
        func.base = base;
        return func.base ** func.base;
    };

    const countSquare = squarePow(2);
    const mathPow = squarePow;
    squarePow = null; // no error will appear, because function have own name 'func'
    const countAnotherSquare = mathPow(3);

    // The code of that function is not known at the time of writing the script (that’s why we don’t use regular functions), 
    // but will be known in the process of execution. We may receive it from the server or from another source.
    const addNumbers = new Function('a', 'b', 'return a + b');
    const helloWorld = new Function('return `Hello world!`');
    const addedNumbers = addNumbers(5, 5);
    const returnedString = helloWorld();

    // sheddulingACall();
    // alert(asynchronousSetTimeout(10, 20, 30));
    const myTimer = MyTimer(1e5);
    myTimer();

    const primaryName = {
        name: 'Adam',
    }
    const numbers = [19, 20, 5, 100];
    const greetings = sayHi.call(primaryName, 'Valentina'); // passing reference to 'this' object
    const minimum = Math.min.apply(null, numbers); // same as call, just second arg is array

    const createdHash = createHash('adam', 'lasak', '96075837');

})();

// or we can use arguments[], note: in arrow F are not allower arguments, the have not this operator either
// arguments[] is array-like object !!
function multipleArgs(...args) {
    let sum = 0;
    args.forEach(value => sum += value);
    return sum;
}

function joinChars(args) {
    return args.map(value => `_${value}_`);
}

function callingHandlers(name, ...handlers) {
    for (let handler of handlers) {
        handler(name);
    }
}

function counterHandler() {
    // let count = 0; // previous usage

    function increment() {
        return increment.count++;
    }
    increment.count = 0; // property of function - it's NOT variable! Does not define a local variable counter inside function
    return increment;
}

function sheddulingACall() {

    function getString(name, surname) {
        alert(`${name} ${surname}`);
    }

    const firstGreeting = setTimeout(getString, 1000, 'Adam', 'Lasak'); // first arg is reference to function, so getString() is wrong
    const secondGreeting = setTimeout((name, surname) => alert(`Hello ${name} ${surname}`), 1000, 'Adam', 'Lasak');

    const timerId = setInterval(() => alert(`Hi`), 500);
    setTimeout(clearInterval, 10000, timerId); // after 10 seconds we disable setInterval, cleanInterval clears setInterval function from memory

    // !! Recursive setTimeout guarantees a delay between the executions, setInterval – does not. !!
    let recursiveTimeoutId = setTimeout(function tick() {
        alert('tick');
        recursiveTimeoutId = setTimeout(tick, 2000);
    }, 2000);

}

function asynchronousSetTimeout(...args) {
    let sum = 0;

    // unction is scheduled to run “right after” the current code. In other words, asynchronously.
    // it can be used for background calculating or requesting on server and meanwhile user still can click through UI
    const timeoutId = setTimeout(() => alert(`Asynchronous calling...`), 0);

    for (let number of args) {
        sum += number;
    }
    return sum;
}

function MyTimer(max) {

    function tick() {
        if (tick.count <= max) {
            counterElement.innerHTML = tick.count++;
            setTimeout(tick, 0); // without setTimeout result of max number will be rendered immediately
            // tick();
        }
    }
    tick.count = 0;
    return tick;
}

function sayHi(secondName) {
    return `Hi ${this.name} and ${secondName}!`;
}

function createHash() {
    // return arguments.join(); // arguments.join is not a function => arguments is array-like !
    return [].join.apply(arguments); // "method borrowing" , join() simply concate 'this' arguments, many functions use this method
}