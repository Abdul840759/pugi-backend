import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Course } from './models/Course';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pugi';

const richContent: Record<string, string> = {

'What is JavaScript?': `# What is JavaScript?

JavaScript is the programming language of the web. It was created in 1995 by Brendan Eich in just 10 days while he was working at Netscape. Despite its rushed creation, JavaScript has grown into one of the most widely used programming languages in the world — running in every web browser, on servers, mobile devices, desktop apps, and even IoT devices.

## Why JavaScript Matters

Before JavaScript, web pages were completely static. HTML gave structure, CSS gave style, but nothing could move or respond. JavaScript changed everything by making pages interactive and dynamic.

Think about everything you do on a modern website:
- You type in a search box and suggestions appear instantly
- You click a button and content loads without refreshing the page
- You drag and drop items in a list
- You see real-time notifications

All of that is JavaScript.

## Where JavaScript Runs

JavaScript was originally built only for browsers, but today it runs almost everywhere:

**In the Browser:**
Every modern browser ships with a JavaScript engine built in. Chrome uses V8, Firefox uses SpiderMonkey, Safari uses JavaScriptCore. These engines take your JavaScript code and execute it at near-native speed.

**On the Server (Node.js):**
In 2009, Ryan Dahl took Chrome's V8 engine and built Node.js — a runtime that lets JavaScript run outside the browser. This means you can use JavaScript to build web servers, APIs, command-line tools, and more. PUGI's backend is built with Node.js.

**Mobile Apps:**
React Native (built on JavaScript and React) lets you build native iOS and Android apps from a single codebase. Apps like Facebook, Instagram, and Airbnb use React Native.

**Desktop Apps:**
Electron uses JavaScript to build desktop applications. VS Code — the editor you're probably using right now — is built with JavaScript.

## Your First Program

Open your browser, right-click anywhere on the page, and select "Inspect" or "Inspect Element". Click the "Console" tab. You're now in a JavaScript REPL — a place where you can type and run JavaScript immediately.

Type this and press Enter:

\`\`\`js
console.log("Hello, world!");
\`\`\`

You should see \`Hello, world!\` printed immediately. \`console.log()\` is the most basic way to output information in JavaScript — you'll use it constantly for debugging.

## Variables — Storing Information

Variables are containers that store values. JavaScript has three ways to declare them:

\`\`\`js
// var — the old way (avoid this in modern code)
var oldSchool = "I exist everywhere in my function";

// let — block-scoped, can be reassigned
let age = 25;
age = 26; // perfectly fine

// const — block-scoped, cannot be reassigned
const name = "Amara";
// name = "David"; // ❌ TypeError: Assignment to constant variable

const PI = 3.14159265;
\`\`\`

**The rule:** Use \`const\` by default. Switch to \`let\` only when you know the value will change. Never use \`var\` in modern code.

## Data Types — What Kind of Information

JavaScript has 8 data types. The first 7 are called "primitive" types:

\`\`\`js
// 1. String — text
const greeting = "Hello, PUGI!";
const template = \`My name is \${name}\`; // template literal

// 2. Number — integers and decimals (no separate float type)
const score    = 95;
const price    = 29.99;
const negative = -10;
const infinity = Infinity;
const notNum   = NaN; // "Not a Number" — result of invalid math

// 3. Boolean — true or false
const isLoggedIn = true;
const isPremium  = false;

// 4. null — intentionally empty value
const selectedCourse = null; // no course selected yet

// 5. undefined — declared but not assigned
let futureValue;
console.log(futureValue); // undefined

// 6. Symbol — unique identifier (advanced, rarely needed as a beginner)
const uniqueId = Symbol('id');

// 7. BigInt — integers larger than 2^53
const bigNumber = 9007199254740991n;

// 8. Object — collections of key-value pairs (not primitive)
const user   = { name: "Amara", age: 27 };
const scores = [95, 87, 100]; // arrays are objects too
\`\`\`

## Checking Types with typeof

\`\`\`js
console.log(typeof "hello");     // "string"
console.log(typeof 42);          // "number"
console.log(typeof true);        // "boolean"
console.log(typeof undefined);   // "undefined"
console.log(typeof null);        // "object" ← famous JS quirk/bug
console.log(typeof {});          // "object"
console.log(typeof []);          // "object" ← arrays are objects
console.log(typeof function(){}); // "function"
\`\`\`

The \`typeof null === "object"\` result is a long-standing bug in JavaScript that has never been fixed to preserve backward compatibility.

## String Operations

Strings are one of the most used types. Here are the essential operations:

\`\`\`js
const first = "PUGI";
const last  = "LMS";

// Concatenation (old way)
console.log(first + " " + last); // "PUGI LMS"

// Template literals (modern, preferred)
console.log(\`\${first} is the best \${last} platform\`);

// String methods
console.log("hello".toUpperCase());      // "HELLO"
console.log("WORLD".toLowerCase());      // "world"
console.log("  spaces  ".trim());        // "spaces"
console.log("  spaces  ".trimStart());   // "spaces  "
console.log("a,b,c".split(","));         // ["a", "b", "c"]
console.log("hello world".includes("world")); // true
console.log("hello".startsWith("hel"));  // true
console.log("hello".endsWith("lo"));     // true
console.log("hello".replace("l", "r"));  // "herlo" (first match)
console.log("hello".replaceAll("l","r")); // "herro"
console.log("hello".indexOf("l"));       // 2
console.log("hello world".slice(6));     // "world"
console.log("hello world".slice(0, 5));  // "hello"
console.log("ha".repeat(3));             // "hahaha"
console.log("hello".padStart(8, "*"));   // "***hello"
console.log(String(42));                 // "42"
console.log((3.14159).toFixed(2));       // "3.14"

// String length
console.log("PUGI".length); // 4
\`\`\`

## Type Conversion

JavaScript often converts types automatically (type coercion), but it's better to do it explicitly:

\`\`\`js
// To number
Number("42");        // 42
Number("3.14");      // 3.14
Number("");          // 0
Number("abc");       // NaN
Number(true);        // 1
Number(false);       // 0
parseInt("42px");    // 42 (stops at non-numeric)
parseFloat("3.14em"); // 3.14

// To string
String(100);         // "100"
String(true);        // "true"
String(null);        // "null"
(42).toString();     // "42"
(255).toString(16);  // "ff" (hexadecimal)

// To boolean
Boolean(0);          // false
Boolean("");         // false
Boolean(null);       // false
Boolean(undefined);  // false
Boolean(NaN);        // false
Boolean("hello");    // true (any non-empty string)
Boolean(42);         // true (any non-zero number)
Boolean({});         // true (any object, even empty)
Boolean([]);         // true (any array, even empty)
\`\`\`

## Operators

\`\`\`js
// Arithmetic
console.log(10 + 3);  // 13
console.log(10 - 3);  // 7
console.log(10 * 3);  // 30
console.log(10 / 3);  // 3.3333...
console.log(10 % 3);  // 1 (remainder/modulo)
console.log(10 ** 3); // 1000 (exponentiation)

// Comparison — always use === not ==
console.log(5 === 5);   // true (strict equality — checks type AND value)
console.log(5 === "5"); // false (different types)
console.log(5 == "5");  // true (loose equality — dangerous! converts types)
console.log(5 !== 3);   // true (strict not-equal)
console.log(5 > 3);     // true
console.log(5 >= 5);    // true

// Logical
console.log(true && false); // false (AND)
console.log(true || false); // true (OR)
console.log(!true);         // false (NOT)

// Nullish coalescing — use default if null or undefined
const username = null ?? "Guest"; // "Guest"
const score    = 0 ?? 100;        // 0 (0 is not null/undefined!)

// Optional chaining — safely access nested properties
const user = null;
console.log(user?.profile?.avatar); // undefined (no error)
\`\`\``,

'Functions and Scope': `# Functions and Scope

Functions are the building blocks of JavaScript programs. They let you package a piece of logic, give it a name, and reuse it anywhere. Understanding functions deeply — including how scope and closures work — is what separates beginners from intermediate developers.

## Why Functions Exist

Without functions, every time you needed to calculate something, you'd have to write the same code again. Functions solve this:

\`\`\`js
// Without functions — repeated logic
const area1 = 5 * 10;
const area2 = 3 * 7;
const area3 = 8 * 4;

// With functions — write once, use everywhere
function calculateArea(width, height) {
  return width * height;
}

const area1 = calculateArea(5, 10);  // 50
const area2 = calculateArea(3, 7);   // 21
const area3 = calculateArea(8, 4);   // 32
\`\`\`

## Function Declaration

The classic way to define a function:

\`\`\`js
function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("Amara")); // "Hello, Amara!"
console.log(greet("David")); // "Hello, David!"
\`\`\`

**Key features of function declarations:**
- The function name is required
- They are **hoisted** — you can call them before they appear in code
- They have their own \`this\` binding

\`\`\`js
// This works! Declaration is hoisted to the top
sayHello();

function sayHello() {
  console.log("Hello!");
}
\`\`\`

## Function Expression

Assigning a function to a variable:

\`\`\`js
const add = function(a, b) {
  return a + b;
};

console.log(add(3, 4)); // 7
\`\`\`

Function expressions are **not hoisted** — you cannot call them before they are defined.

\`\`\`js
// ❌ This will throw a ReferenceError
greet("Amara");

const greet = function(name) {
  return "Hello, " + name;
};
\`\`\`

## Arrow Functions (ES6+)

The most common modern syntax — shorter and cleaner:

\`\`\`js
// Full arrow function
const multiply = (a, b) => {
  return a * b;
};

// Implicit return — when body is a single expression, skip braces and return
const multiply = (a, b) => a * b;

// Single parameter — parentheses are optional
const square = n => n * n;

// No parameters — empty parentheses required
const getRandom = () => Math.random();

// Returning an object literal — wrap in parentheses!
const createUser = (name) => ({ name, id: Date.now() });
\`\`\`

**Arrow functions are different in one important way:** they do NOT have their own \`this\`. They inherit \`this\` from the surrounding scope. This makes them perfect for callbacks inside classes.

## Parameters and Arguments

\`\`\`js
// Parameters are the names in the function definition
function greet(name, greeting) {  // name and greeting are parameters
  return \`\${greeting}, \${name}!\`;
}

// Arguments are the values you pass when calling
greet("Amara", "Hello");  // "Amara" and "Hello" are arguments

// Default parameters — used when argument is undefined
function greet(name, greeting = "Hello") {
  return \`\${greeting}, \${name}!\`;
}
greet("Amara");          // "Hello, Amara!"
greet("David", "Hi");    // "Hi, David!"

// Rest parameters — collect remaining arguments into an array
function sum(first, ...rest) {
  return rest.reduce((total, n) => total + n, first);
}
sum(1, 2, 3, 4, 5); // 15

// Destructuring parameters
function displayUser({ name, age, role = "learner" }) {
  console.log(\`\${name} (\${age}) — \${role}\`);
}
displayUser({ name: "Amara", age: 27, role: "tutor" });
\`\`\`

## Return Values

Every function returns something. If you don't use \`return\`, it returns \`undefined\`:

\`\`\`js
function add(a, b) {
  return a + b; // returns the sum
}

function logMessage(msg) {
  console.log(msg);
  // no return statement — implicitly returns undefined
}

// Functions can return early
function divide(a, b) {
  if (b === 0) {
    return null; // early return to prevent division by zero
  }
  return a / b;
}

// Functions can return functions (higher-order functions)
function makeMultiplier(factor) {
  return (number) => number * factor;
}

const double  = makeMultiplier(2);
const triple  = makeMultiplier(3);
console.log(double(5));  // 10
console.log(triple(5));  // 15
\`\`\`

## Scope — Where Variables Live

Scope determines where a variable is accessible. JavaScript has three types:

**Global Scope** — accessible everywhere:
\`\`\`js
const globalVar = "I'm everywhere";

function test() {
  console.log(globalVar); // ✅ accessible
}
test();
console.log(globalVar); // ✅ accessible
\`\`\`

**Function Scope** — accessible only inside the function:
\`\`\`js
function myFunc() {
  const localVar = "I'm only inside myFunc";
  console.log(localVar); // ✅
}
myFunc();
console.log(localVar); // ❌ ReferenceError
\`\`\`

**Block Scope** — accessible only inside \`{}\` blocks (with \`let\` and \`const\`):
\`\`\`js
if (true) {
  let blockVar   = "I'm block-scoped";
  const alsoBlock = "Me too";
  var notBlock    = "I escape the block!"; // var ignores block scope
}

console.log(blockVar);   // ❌ ReferenceError
console.log(notBlock);   // ✅ "I escape the block!" — var is function-scoped
\`\`\`

## Closures — Functions That Remember

A closure is when an inner function remembers the variables from its outer function, even after the outer function has finished running.

\`\`\`js
function makeCounter(start = 0) {
  let count = start; // this variable is "closed over"

  return {
    increment: () => ++count,
    decrement: () => --count,
    reset:     () => { count = start; },
    value:     () => count,
  };
}

const counter1 = makeCounter(0);
const counter2 = makeCounter(100); // independent counter

counter1.increment(); // 1
counter1.increment(); // 2
counter1.increment(); // 3
counter2.increment(); // 101

console.log(counter1.value()); // 3
console.log(counter2.value()); // 101

counter1.reset();
console.log(counter1.value()); // 0
\`\`\`

Each call to \`makeCounter\` creates a new, independent \`count\` variable. The returned object's methods form a closure over that specific \`count\`.

## Practical Closure Patterns

\`\`\`js
// 1. Data privacy — hide internal state
function createBankAccount(initialBalance) {
  let balance = initialBalance; // private — not directly accessible

  return {
    deposit(amount) {
      if (amount <= 0) throw new Error("Amount must be positive");
      balance += amount;
      return balance;
    },
    withdraw(amount) {
      if (amount > balance) throw new Error("Insufficient funds");
      balance -= amount;
      return balance;
    },
    getBalance() {
      return balance;
    }
  };
}

const account = createBankAccount(1000);
account.deposit(500);   // 1500
account.withdraw(200);  // 1300
console.log(account.getBalance()); // 1300
// console.log(account.balance); // undefined — private!

// 2. Memoization — cache expensive results
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log("Cache hit!");
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const expensiveAdd = memoize((a, b) => {
  console.log("Computing...");
  return a + b;
});

expensiveAdd(2, 3); // Computing... → 5
expensiveAdd(2, 3); // Cache hit! → 5 (no recomputation)
\`\`\`

## Higher-Order Functions

Functions that take other functions as arguments or return functions:

\`\`\`js
// Taking a function as an argument
function applyTwice(fn, value) {
  return fn(fn(value));
}

const double = x => x * 2;
console.log(applyTwice(double, 3)); // 12 (double(double(3)) = double(6) = 12)

// The built-in array methods are higher-order functions
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);      // [2, 4, 6, 8, 10]
const evens   = numbers.filter(n => n % 2 === 0); // [2, 4]
const sum     = numbers.reduce((acc, n) => acc + n, 0); // 15
\`\`\``,

'Working with Arrays': `# Working with Arrays

Arrays are ordered lists that can hold any type of value. They are one of the most important data structures in JavaScript — almost every real program uses them constantly. Mastering arrays means mastering the tools to transform, filter, search, and combine data.

## Creating Arrays

\`\`\`js
// Array literal — the most common way
const fruits  = ["apple", "banana", "mango"];
const numbers = [1, 2, 3, 4, 5];
const mixed   = [1, "two", true, null, { x: 3 }, [4, 5]];
const empty   = [];

// Array constructor — rarely used
const zeros = new Array(5).fill(0); // [0, 0, 0, 0, 0]
const range = Array.from({ length: 5 }, (_, i) => i + 1); // [1, 2, 3, 4, 5]

// Array.from converts iterables to arrays
Array.from("hello");         // ["h", "e", "l", "l", "o"]
Array.from(new Set([1,2,1])); // [1, 2] (Set → Array)
\`\`\`

## Reading Elements

Arrays are zero-indexed — the first element is at index 0:

\`\`\`js
const fruits = ["apple", "banana", "mango", "grape"];

console.log(fruits[0]);      // "apple"
console.log(fruits[2]);      // "mango"
console.log(fruits[fruits.length - 1]); // "grape" (last element)
console.log(fruits.at(-1));  // "grape" (modern way to get last)
console.log(fruits.at(-2));  // "mango"
console.log(fruits.length);  // 4

// Accessing out of bounds returns undefined (no error)
console.log(fruits[10]); // undefined
\`\`\`

## Modifying Arrays

\`\`\`js
const fruits = ["apple", "banana", "mango"];

// Add elements
fruits.push("grape");           // add to end → ["apple", "banana", "mango", "grape"]
fruits.unshift("kiwi");         // add to start → ["kiwi", "apple", "banana", "mango", "grape"]

// Remove elements
const last  = fruits.pop();     // remove from end → returns "grape"
const first = fruits.shift();   // remove from start → returns "kiwi"

// Replace elements
fruits[1] = "orange";           // replace by index

// splice — add, remove, or replace at any position
fruits.splice(1, 0, "pear");    // insert "pear" at index 1, remove 0
fruits.splice(1, 1);            // remove 1 element at index 1
fruits.splice(1, 1, "cherry");  // replace 1 element at index 1 with "cherry"

// Sort
fruits.sort();                              // alphabetically in place
numbers.sort((a, b) => a - b);             // ascending
numbers.sort((a, b) => b - a);             // descending
[...fruits].sort((a, b) => a.localeCompare(b)); // locale-aware sort

// Reverse
fruits.reverse(); // reverses in place
\`\`\`

## Iterating Over Arrays

\`\`\`js
const fruits = ["apple", "banana", "mango"];

// for...of — cleanest, use this most often
for (const fruit of fruits) {
  console.log(fruit);
}

// forEach — when you need the index
fruits.forEach((fruit, index, array) => {
  console.log(\`\${index}: \${fruit}\`);
});

// Classic for loop — when you need full control
for (let i = 0; i < fruits.length; i++) {
  if (fruits[i] === "banana") break;
  console.log(fruits[i]);
}

// for...in — DO NOT use for arrays (iterates over keys as strings)
\`\`\`

## Transforming Arrays — The Big 5

These five methods are the most important array methods you'll use:

\`\`\`js
const students = [
  { name: "Amara",  score: 92, grade: "A" },
  { name: "David",  score: 78, grade: "C" },
  { name: "Leah",   score: 85, grade: "B" },
  { name: "Victor", score: 61, grade: "F" },
  { name: "Zara",   score: 95, grade: "A" },
];

// 1. map — transform every element, same length array
const names   = students.map(s => s.name);
// ["Amara", "David", "Leah", "Victor", "Zara"]

const summary = students.map(s => ({
  name: s.name,
  passed: s.score >= 70,
  label: \`\${s.name}: \${s.score}%\`
}));

// 2. filter — keep elements that pass the test
const passed  = students.filter(s => s.score >= 70);
// Amara, David, Leah, Zara

const aGrades = students.filter(s => s.grade === "A");
// Amara, Zara

// 3. reduce — collapse to a single value
const total   = students.reduce((sum, s) => sum + s.score, 0); // 411
const average = total / students.length; // 82.2

// Group by grade using reduce
const byGrade = students.reduce((groups, s) => {
  const grade = s.grade;
  if (!groups[grade]) groups[grade] = [];
  groups[grade].push(s);
  return groups;
}, {});
// { A: [Amara, Zara], C: [David], B: [Leah], F: [Victor] }

// 4. find — first match (returns the element, not an array)
const topStudent = students.find(s => s.score >= 90);
// { name: "Amara", score: 92, grade: "A" }

const notFound = students.find(s => s.score > 100);
// undefined

// 5. findIndex — index of first match
const idx = students.findIndex(s => s.name === "Leah"); // 2

// Bonus methods
students.some(s => s.score > 90);   // true (at least one passes)
students.every(s => s.score > 50);  // true (all pass)
students.includes({ name: "Amara" }); // false (object comparison)

const topScores = students
  .filter(s => s.score >= 70)
  .sort((a, b) => b.score - a.score)
  .map(s => \`\${s.name}: \${s.score}\`);
// ["Zara: 95", "Amara: 92", "Leah: 85", "David: 78"]
\`\`\`

## Spread Operator and Destructuring

\`\`\`js
// Spread — expand array elements
const a = [1, 2, 3];
const b = [4, 5, 6];

const combined  = [...a, ...b];         // [1, 2, 3, 4, 5, 6]
const withExtra = [0, ...a, 3.5, ...b]; // [0, 1, 2, 3, 3.5, 4, 5, 6]

// Copy an array (shallow)
const copy = [...a]; // independent copy
copy.push(99);
console.log(a);    // [1, 2, 3] — unchanged
console.log(copy); // [1, 2, 3, 99]

// Destructuring — extract values into variables
const [first, second, third] = [10, 20, 30];
console.log(first);  // 10
console.log(second); // 20

// Skip elements with commas
const [,, third] = [10, 20, 30]; // third = 30

// Rest in destructuring
const [head, ...tail] = [1, 2, 3, 4, 5];
console.log(head); // 1
console.log(tail); // [2, 3, 4, 5]

// Swap variables (no temp variable needed!)
let x = 1, y = 2;
[x, y] = [y, x];
console.log(x, y); // 2, 1

// Default values in destructuring
const [p = 10, q = 20] = [5];
console.log(p); // 5 (provided)
console.log(q); // 20 (default)
\`\`\`

## Flattening and Combining

\`\`\`js
// flat — flatten nested arrays
const nested = [1, [2, 3], [4, [5, 6]]];
nested.flat();    // [1, 2, 3, 4, [5, 6]] — one level
nested.flat(2);   // [1, 2, 3, 4, 5, 6]  — two levels
nested.flat(Infinity); // fully flatten

// flatMap — map then flatten one level
const sentences = ["Hello World", "Foo Bar"];
const words = sentences.flatMap(s => s.split(" "));
// ["Hello", "World", "Foo", "Bar"]

// Removing duplicates
const withDups = [1, 2, 2, 3, 3, 3, 4];
const unique   = [...new Set(withDups)]; // [1, 2, 3, 4]

// Checking if something is an array
Array.isArray([]);    // true
Array.isArray("abc"); // false
\`\`\``,

'Objects and Destructuring': `# Objects and Destructuring

Objects are the foundation of JavaScript. Everything in JavaScript — arrays, functions, dates, even errors — is an object at its core. Understanding objects deeply means understanding how JavaScript itself works.

## What is an Object?

An object is an unordered collection of key-value pairs. Keys are strings (or Symbols), and values can be anything — numbers, strings, arrays, functions, or other objects.

\`\`\`js
const course = {
  title:       "JavaScript Fundamentals",
  instructor:  "Team PUGI",
  rating:      4.8,
  isPublished: true,
  students:    ["Amara", "David", "Leah"],
  details: {
    duration: "10 hours",
    level:    "beginner",
  },
  // Method — a function stored as a property
  describe() {
    return \`\${this.title} by \${this.instructor}\`;
  }
};
\`\`\`

## Reading Properties

\`\`\`js
// Dot notation — use when you know the property name
console.log(course.title);     // "JavaScript Fundamentals"
console.log(course.rating);    // 4.8
console.log(course.details.level); // "beginner" (nested)

// Bracket notation — use for dynamic keys or keys with spaces
console.log(course["title"]);   // "JavaScript Fundamentals"

const key = "rating";
console.log(course[key]);       // 4.8 (dynamic key)

// Calling a method
console.log(course.describe()); // "JavaScript Fundamentals by Team PUGI"

// Accessing non-existent property — returns undefined (no error)
console.log(course.price);      // undefined

// Optional chaining for deeply nested objects
console.log(course?.details?.duration); // "10 hours"
console.log(course?.pricing?.monthly);  // undefined (no error)
\`\`\`

## Writing Properties

\`\`\`js
const user = { name: "Amara", age: 27 };

// Update existing
user.age = 28;
user["name"] = "Amara O.";

// Add new
user.email   = "amara@pugi.com";
user.role    = "tutor";

// Delete
delete user.role;

// Check if property exists
console.log("name" in user);         // true
console.log("role" in user);         // false
console.log(user.hasOwnProperty("name")); // true
\`\`\`

## Object Methods

\`\`\`js
const config = {
  host:  "localhost",
  port:  3001,
  debug: true,
  db:    "mongodb://localhost:27017/pugi",
};

// Get all keys
Object.keys(config);
// ["host", "port", "debug", "db"]

// Get all values
Object.values(config);
// ["localhost", 3001, true, "mongodb://localhost:27017/pugi"]

// Get all key-value pairs as arrays
Object.entries(config);
// [["host", "localhost"], ["port", 3001], ["debug", true], ...]

// Iterate over entries
for (const [key, value] of Object.entries(config)) {
  console.log(\`\${key}: \${value}\`);
}

// Build object from entries
const doubled = Object.fromEntries(
  Object.entries({ a: 1, b: 2, c: 3 }).map(([k, v]) => [k, v * 2])
);
// { a: 2, b: 4, c: 6 }

// Merge objects
const defaults = { theme: "light", lang: "en", fontSize: 14 };
const userPrefs = { theme: "dark", fontSize: 16 };
const merged = Object.assign({}, defaults, userPrefs);
// { theme: "dark", lang: "en", fontSize: 16 }

// Freeze — prevent modifications
const CONSTANTS = Object.freeze({ PI: 3.14159, E: 2.71828 });
// CONSTANTS.PI = 3; // silently fails (or throws in strict mode)
\`\`\`

## Destructuring

Destructuring lets you extract values from objects into variables:

\`\`\`js
const user = {
  name:    "Amara",
  age:     27,
  email:   "amara@pugi.com",
  role:    "tutor",
  address: {
    city:    "Lagos",
    country: "Nigeria",
  }
};

// Basic destructuring
const { name, age, email } = user;
console.log(name);  // "Amara"
console.log(age);   // 27

// Rename while destructuring
const { name: userName, role: userRole } = user;
console.log(userName); // "Amara"
console.log(userRole); // "tutor"

// Default values — used when property is undefined
const { name: n, salary = 0, country = "Unknown" } = user;
console.log(salary);  // 0 (default)
console.log(country); // "Unknown" (default)

// Nested destructuring
const { address: { city, country: userCountry } } = user;
console.log(city);        // "Lagos"
console.log(userCountry); // "Nigeria"

// Rest in destructuring
const { name: nm, age: ag, ...rest } = user;
console.log(nm);   // "Amara"
console.log(rest); // { email: "amara@pugi.com", role: "tutor", address: {...} }
\`\`\`

## Destructuring in Function Parameters

\`\`\`js
// Without destructuring — verbose
function displayUser(user) {
  console.log(user.name + " — " + user.role);
}

// With destructuring — clean
function displayUser({ name, role, age = "unknown" }) {
  console.log(\`\${name} (\${age}) — \${role}\`);
}

displayUser({ name: "Amara", role: "tutor", age: 27 });
displayUser({ name: "David", role: "learner" }); // age uses default

// Works great with API responses
async function fetchUser(id) {
  const { data: { user, token }, status } = await api.get(\`/users/\${id}\`);
  return { user, token, status };
}
\`\`\`

## Spread Operator with Objects

\`\`\`js
const base = { theme: "dark", lang: "en" };
const extended = { ...base, fontSize: 16, lang: "fr" }; // lang overrides
// { theme: "dark", lang: "fr", fontSize: 16 }

// Non-destructive update pattern (very common in React)
const user = { name: "Amara", age: 27, role: "learner" };

const updatedUser = { ...user, age: 28 };
// { name: "Amara", age: 28, role: "learner" }
// Original user is untouched

const promoted = { ...user, role: "tutor" };
// { name: "Amara", age: 27, role: "tutor" }

// Merging two objects
const obj1 = { a: 1, b: 2 };
const obj2 = { b: 3, c: 4 };
const merged = { ...obj1, ...obj2 }; // { a: 1, b: 3, c: 4 }
// obj2.b overrides obj1.b
\`\`\`

## Computed Property Names

\`\`\`js
// Dynamic keys using bracket syntax
const field = "name";
const obj = {
  [field]: "Amara",           // "name": "Amara"
  [\`\${field}Length\`]: 5,     // "nameLength": 5
};

// Very useful for building objects dynamically
function createUpdate(field, value) {
  return { [field]: value };
}

createUpdate("email", "new@email.com"); // { email: "new@email.com" }
createUpdate("role",  "admin");         // { role: "admin" }
\`\`\`

## Shorthand Properties and Methods

\`\`\`js
const name  = "Amara";
const email = "amara@pugi.com";
const role  = "tutor";

// Old way
const user1 = { name: name, email: email, role: role };

// Shorthand — when key and variable name match
const user2 = { name, email, role }; // same result, much cleaner

// Method shorthand
const calculator = {
  // Old way
  add: function(a, b) { return a + b; },

  // Shorthand
  subtract(a, b) { return a - b; },
  multiply(a, b) { return a * b; },
};
\`\`\``,

'Promises and Async/Await': `# Promises and Async/Await

JavaScript is single-threaded — it can only do one thing at a time. But web applications constantly need to do things that take time: fetching data from a server, reading a file, waiting for a user. Promises and async/await are the tools JavaScript uses to handle this without freezing up the entire program.

## The Problem: JavaScript is Single-Threaded

Imagine you're at a restaurant. There's one waiter (the JavaScript thread). If the waiter had to stand at your table and wait for the kitchen to cook your food before serving anyone else, every other table would be ignored for 20 minutes. That would be terrible.

Instead, the waiter takes your order, gives it to the kitchen, and immediately goes to serve other tables. When the kitchen is done, the waiter comes back with your food. This is how JavaScript handles async work.

## Synchronous vs Asynchronous

\`\`\`js
// SYNCHRONOUS — blocks everything until done
console.log("1. Order placed");
const food = cookFood(); // pretend this takes 30 seconds
console.log("2. Food ready:", food);
console.log("3. Eating");
// Lines 2 and 3 are stuck waiting — nothing else can run

// ASYNCHRONOUS — doesn't block
console.log("1. Order placed");
cookFood().then(food => {
  console.log("3. Food ready:", food); // runs when food is ready
});
console.log("2. Doing other things while food cooks");
// Output order: 1, 2, 3
\`\`\`

## Callbacks — The Old Way

Before Promises, async work was handled with callbacks — functions passed as arguments to be called when the work is done:

\`\`\`js
// Simple callback
setTimeout(() => {
  console.log("This runs after 1 second");
}, 1000);

// Fetching data with callbacks (old XMLHttpRequest style)
function getUser(id, callback) {
  // simulate network request
  setTimeout(() => {
    callback(null, { id, name: "Amara" }); // null = no error
  }, 500);
}

getUser(1, (error, user) => {
  if (error) {
    console.error("Failed:", error);
    return;
  }
  console.log("Got user:", user);
});
\`\`\`

**The problem — "Callback Hell":**

\`\`\`js
// Hard to read, hard to handle errors
getUser(1, (err, user) => {
  if (err) return handleError(err);
  getCourses(user.id, (err, courses) => {
    if (err) return handleError(err);
    getProgress(courses[0].id, (err, progress) => {
      if (err) return handleError(err);
      getCertificate(progress.id, (err, cert) => {
        if (err) return handleError(err);
        // Finally doing something useful — buried 4 levels deep!
        console.log(cert);
      });
    });
  });
});
\`\`\`

## Promises — The Modern Way

A Promise is an object that represents a value that will be available in the future. It has three states:
- **Pending** — the async work is still in progress
- **Fulfilled** — the work completed successfully (resolved with a value)
- **Rejected** — the work failed (rejected with an error)

\`\`\`js
// Creating a Promise
const myPromise = new Promise((resolve, reject) => {
  // Do some async work...
  const success = Math.random() > 0.5;

  setTimeout(() => {
    if (success) {
      resolve("Data loaded successfully!"); // fulfilled
    } else {
      reject(new Error("Something went wrong")); // rejected
    }
  }, 1000);
});

// Consuming a Promise
myPromise
  .then(data => {
    console.log("Success:", data);
    return data.toUpperCase(); // can chain
  })
  .then(upper => {
    console.log("Uppercase:", upper);
  })
  .catch(error => {
    console.error("Error:", error.message);
  })
  .finally(() => {
    console.log("Always runs — success or failure");
  });
\`\`\`

## Promise Chaining

\`\`\`js
// Each .then() returns a new Promise
fetch("/api/users/1")
  .then(response => {
    if (!response.ok) throw new Error("User not found");
    return response.json(); // returns a Promise
  })
  .then(user => {
    console.log("User:", user.name);
    return fetch(\`/api/courses?instructorId=\${user.id}\`);
  })
  .then(response => response.json())
  .then(courses => {
    console.log("Courses:", courses.length);
  })
  .catch(error => {
    // Catches ANY error from ANY step above
    console.error("Pipeline failed:", error.message);
  });
\`\`\`

## Async/Await — Syntactic Sugar

Async/await makes Promise-based code look synchronous. It's the same thing under the hood — just much easier to read.

\`\`\`js
// The same Promise chain from above, with async/await
async function loadUserCourses(userId) {
  try {
    const userResponse = await fetch(\`/api/users/\${userId}\`);
    if (!userResponse.ok) throw new Error("User not found");
    const user = await userResponse.json();
    console.log("User:", user.name);

    const coursesResponse = await fetch(\`/api/courses?instructorId=\${user.id}\`);
    const courses = await coursesResponse.json();
    console.log("Courses:", courses.length);

    return { user, courses };
  } catch (error) {
    console.error("Failed to load:", error.message);
    throw error; // re-throw so the caller knows it failed
  }
}

// Calling an async function
loadUserCourses(1)
  .then(data => console.log("Done:", data))
  .catch(err => console.error("Error:", err));

// Or with await (inside another async function)
async function main() {
  const data = await loadUserCourses(1);
  console.log("Done:", data);
}
\`\`\`

## Running Promises in Parallel

\`\`\`js
// Sequential — slow (waits for each one)
const user    = await fetchUser(1);    // wait 500ms
const courses = await fetchCourses();  // then wait 300ms
const profile = await fetchProfile(1); // then wait 400ms
// Total: 1200ms

// Parallel — fast (all run at the same time)
const [user, courses, profile] = await Promise.all([
  fetchUser(1),     // 500ms
  fetchCourses(),   // 300ms
  fetchProfile(1),  // 400ms
]);
// Total: ~500ms (longest one)

// Promise.all rejects if ANY promise rejects
try {
  const results = await Promise.all([
    fetchUser(1),
    fetchCourses(),
    fetchSomethingThatFails(), // if this rejects...
  ]);
} catch (err) {
  // ...we end up here, even if the others succeeded
  console.error("One failed:", err);
}

// Promise.allSettled — wait for all, get all results (success or failure)
const results = await Promise.allSettled([
  fetchUser(1),
  fetchSomethingThatFails(),
  fetchCourses(),
]);

results.forEach(result => {
  if (result.status === "fulfilled") {
    console.log("Success:", result.value);
  } else {
    console.log("Failed:", result.reason);
  }
});

// Promise.race — resolve/reject with the FIRST one that finishes
const fastestResult = await Promise.race([
  fetchFromServer1(),
  fetchFromServer2(),
  fetchFromServer3(),
]); // whichever responds first wins

// Promise.any — resolve with FIRST success (ignores rejections)
const firstSuccess = await Promise.any([
  fetchFromServer1(), // might fail
  fetchFromServer2(), // might fail
  fetchFromServer3(), // might succeed
]); // only rejects if ALL fail
\`\`\`

## Real-World Pattern: API Service

\`\`\`js
class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = \`\${this.baseUrl}\${endpoint}\`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: \`Bearer \${localStorage.getItem("token")}\`,
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || \`HTTP \${response.status}\`);
    }

    return data;
  }

  get(endpoint)         { return this.request(endpoint); }
  post(endpoint, body)  { return this.request(endpoint, { method: "POST",   body: JSON.stringify(body) }); }
  patch(endpoint, body) { return this.request(endpoint, { method: "PATCH",  body: JSON.stringify(body) }); }
  delete(endpoint)      { return this.request(endpoint, { method: "DELETE" }); }
}

const api = new ApiService("https://api.pugi.com");

// Usage
const courses = await api.get("/courses");
const newCourse = await api.post("/courses", { title: "React Advanced" });
\`\`\``,

'Thinking in Components': `# Thinking in Components

React is a JavaScript library for building user interfaces. The core idea is simple but powerful: break your UI into small, reusable pieces called components. Each component is responsible for one thing and one thing only. When you master thinking in components, building complex UIs becomes manageable.

## What is a Component?

A component is a JavaScript function that returns JSX — a syntax that looks like HTML but is actually JavaScript. React takes that JSX and renders it into real DOM elements in the browser.

\`\`\`jsx
// The simplest possible component
function HelloWorld() {
  return <h1>Hello, World!</h1>;
}

// A slightly more useful one
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}

// Use it like an HTML tag
<Greeting name="Amara" />
<Greeting name="David" />
<Greeting name="Leah" />
\`\`\`

Each call to \`<Greeting />\` creates an independent instance of that component. Change \`Greeting\` once and all three update.

## JSX — JavaScript XML

JSX looks like HTML but has important differences:

\`\`\`jsx
// 1. Must return ONE root element — use a Fragment <> if needed
function Card() {
  return (
    <>
      <h2>Title</h2>
      <p>Body</p>
    </>
  );
}

// 2. Use className instead of class (class is a reserved JS keyword)
<div className="card active">

// 3. htmlFor instead of for (for is reserved too)
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// 4. Every tag must be closed — even self-closing ones
<img src="/logo.png" alt="Logo" />
<input type="text" />
<br />

// 5. JavaScript expressions go in curly braces {}
const name  = "Amara";
const score = 95;
const isAdmin = true;

<p>Hello, {name}!</p>
<p>Your score: {score * 1.1}</p>
<p>{isAdmin ? "Admin Panel" : "User Dashboard"}</p>
<p>{score > 90 && "Excellent!"}</p>

// 6. Styles are objects with camelCase properties
<div style={{ backgroundColor: "blue", fontSize: 16, marginTop: "8px" }}>

// 7. Event handlers use camelCase
<button onClick={handleClick}>Click me</button>
<input onChange={handleChange} />
<form onSubmit={handleSubmit}>
\`\`\`

## Props — Passing Data to Components

Props (properties) are how you pass data from a parent component to a child. They flow one way — from parent to child.

\`\`\`jsx
// Define the component with props
function CourseCard({ title, instructor, rating, level, thumbnail, enrolled = false }) {
  return (
    <div className="course-card">
      <img src={thumbnail} alt={title} className="thumbnail" />
      <div className="content">
        <span className="badge">{level}</span>
        <h3>{title}</h3>
        <p className="instructor">by {instructor}</p>
        <div className="footer">
          <span className="rating">⭐ {rating}</span>
          {enrolled && <span className="enrolled-badge">Enrolled</span>}
        </div>
      </div>
    </div>
  );
}

// Use it — each instance gets its own props
<CourseCard
  title="JavaScript Fundamentals"
  instructor="Team PUGI"
  rating={4.8}
  level="Beginner"
  thumbnail="/thumbnails/js.jpg"
  enrolled={true}
/>

<CourseCard
  title="React Foundations"
  instructor="Team PUGI"
  rating={4.9}
  level="Beginner"
  thumbnail="/thumbnails/react.jpg"
/>
\`\`\`

## Rendering Lists

\`\`\`jsx
const courses = [
  { id: "1", title: "JavaScript", level: "beginner", rating: 4.8 },
  { id: "2", title: "React",      level: "beginner", rating: 4.9 },
  { id: "3", title: "Node.js",    level: "intermediate", rating: 4.7 },
];

function CourseList() {
  return (
    <div className="course-list">
      {courses.map(course => (
        // key is REQUIRED when rendering lists — must be unique and stable
        <CourseCard
          key={course.id}
          title={course.title}
          level={course.level}
          rating={course.rating}
        />
      ))}
    </div>
  );
}
\`\`\`

The \`key\` prop helps React efficiently update the list when items are added, removed, or reordered. Always use a stable ID — never use the array index as a key if the list can change.

## Conditional Rendering

\`\`\`jsx
function UserProfile({ user, isLoading, error }) {
  // Guard clauses — handle edge cases first
  if (isLoading) return <Spinner />;
  if (error)     return <ErrorMessage message={error} />;
  if (!user)     return <p>No user found.</p>;

  return (
    <div className="profile">
      <img src={user.avatar} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>

      {/* Conditional rendering with && */}
      {user.isPremium && <PremiumBadge />}

      {/* Conditional rendering with ternary */}
      {user.isOnline
        ? <span className="online">● Online</span>
        : <span className="offline">● Offline</span>
      }

      {/* Rendering different components based on role */}
      {user.role === "admin"   && <AdminPanel />}
      {user.role === "tutor"   && <TutorDashboard />}
      {user.role === "learner" && <LearnerDashboard />}
    </div>
  );
}
\`\`\`

## Component Composition

The real power of React comes from composing small components into bigger ones:

\`\`\`jsx
// Small, focused components
function Avatar({ src, name, size = 40 }) {
  return (
    <img
      src={src || \`https://api.dicebear.com/7.x/initials/svg?seed=\${name}\`}
      alt={name}
      style={{ width: size, height: size, borderRadius: "50%" }}
    />
  );
}

function Badge({ text, color = "blue" }) {
  const colors = {
    blue:   "bg-blue-100 text-blue-800",
    green:  "bg-green-100 text-green-800",
    red:    "bg-red-100 text-red-800",
    yellow: "bg-yellow-100 text-yellow-800",
  };
  return (
    <span className={\`inline-block px-2 py-1 rounded-full text-xs font-medium \${colors[color]}\`}>
      {text}
    </span>
  );
}

function ProgressBar({ value, max = 100, color = "blue" }) {
  const percentage = Math.round((value / max) * 100);
  return (
    <div className="progress-container">
      <div className="progress-bar-bg">
        <div
          className="progress-bar-fill"
          style={{ width: \`\${percentage}%\`, backgroundColor: color }}
        />
      </div>
      <span className="progress-label">{percentage}%</span>
    </div>
  );
}

// Compose them into a bigger component
function LearnerCard({ learner }) {
  return (
    <div className="learner-card">
      <div className="header">
        <Avatar src={learner.avatar} name={learner.name} size={56} />
        <div>
          <h3>{learner.name}</h3>
          <Badge text={learner.role} color="blue" />
        </div>
      </div>
      <div className="stats">
        <p>XP: {learner.xp}</p>
        <p>Streak: {learner.streak} days 🔥</p>
      </div>
      <div className="courses">
        {learner.enrollments.map(e => (
          <div key={e.courseId} className="enrollment">
            <span>{e.courseTitle}</span>
            <ProgressBar value={e.progress} />
          </div>
        ))}
      </div>
    </div>
  );
}

// And compose THAT into an even bigger one
function LeaderBoard({ learners }) {
  return (
    <section>
      <h2>Top Learners This Week</h2>
      <div className="grid">
        {learners
          .sort((a, b) => b.xp - a.xp)
          .slice(0, 10)
          .map(learner => (
            <LearnerCard key={learner.id} learner={learner} />
          ))
        }
      </div>
    </section>
  );
}
\`\`\`

## The children Prop

\`\`\`jsx
// components can receive JSX as children
function Card({ children, className = "" }) {
  return (
    <div className={\`rounded-xl bg-white shadow-sm p-6 \${className}\`}>
      {children}
    </div>
  );
}

// Use it like HTML tags with content inside
<Card>
  <h2>Course Stats</h2>
  <p>13 courses · 2,847 learners</p>
</Card>

<Card className="border border-blue-200">
  <CourseList />
</Card>
\`\`\``,

'State with useState': `# State with useState

State is what makes React components dynamic. Without state, every component would render the same output every time — a static page. State is data that can change over time, and when it changes, React automatically re-renders the component to reflect the new data.

## What is State?

Think of state as a component's memory. A counter component needs to remember the current count. A form component needs to remember what the user has typed. A dropdown needs to remember whether it's open or closed.

\`\`\`jsx
import { useState } from "react";

// Without state — static, does nothing
function Counter() {
  let count = 0;
  return (
    <button onClick={() => count++}>
      Count: {count} {/* Never updates! */}
    </button>
  );
}

// With state — dynamic, updates correctly
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
\`\`\`

## How useState Works

\`\`\`jsx
const [state, setState] = useState(initialValue);
//     ^^^^^  ^^^^^^^^^
//     current value   function to update it
\`\`\`

- \`useState(initialValue)\` sets up the state with an initial value
- Returns an array with two items: the current value, and a setter function
- When you call the setter function, React re-renders the component with the new value

\`\`\`jsx
import { useState } from "react";

function LightSwitch() {
  const [isOn, setIsOn] = useState(false); // starts off

  return (
    <div>
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: "50%",
          backgroundColor: isOn ? "#fbbf24" : "#374151",
          transition: "background-color 0.3s",
        }}
      />
      <button onClick={() => setIsOn(!isOn)}>
        {isOn ? "Turn Off" : "Turn On"}
      </button>
    </div>
  );
}
\`\`\`

## The Golden Rule: Never Mutate State Directly

React only knows to re-render when you call the setter function. If you mutate state directly, React has no idea anything changed.

\`\`\`jsx
const [user, setUser] = useState({ name: "Amara", age: 27, role: "learner" });
const [scores, setScores] = useState([85, 92, 78]);

// ❌ WRONG — mutating state directly
user.age = 28;           // React doesn't know about this change
scores.push(95);         // React doesn't know about this change

// ✅ CORRECT — create new values with the changes
setUser({ ...user, age: 28 });           // spread + override
setUser(prev => ({ ...prev, age: 28 })); // functional update (safer)

setScores([...scores, 95]);                         // add to array
setScores(scores.filter(s => s !== 85));            // remove from array
setScores(scores.map(s => s === 85 ? 90 : s));     // update in array
\`\`\`

## Functional Updates — The Safe Way

When new state depends on old state, use the function form of the setter:

\`\`\`jsx
// ❌ Can cause bugs in rapid updates
setCount(count + 1);
setCount(count + 1); // both see the same "count" — only increments once!

// ✅ Always gets the latest value
setCount(prev => prev + 1);
setCount(prev => prev + 1); // correctly increments twice

// Real example — toggling
setIsOpen(prev => !prev);

// With objects
setUser(prev => ({ ...prev, xp: prev.xp + 50 }));

// With arrays — add item
setItems(prev => [...prev, newItem]);

// With arrays — remove item
setItems(prev => prev.filter(item => item.id !== targetId));

// With arrays — update item
setItems(prev =>
  prev.map(item =>
    item.id === targetId ? { ...item, completed: true } : item
  )
);
\`\`\`

## Multiple State Variables

\`\`\`jsx
function RegistrationForm() {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [success,  setSuccess]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await registerUser({ name, email, password });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) return <p>Registration successful! Check your email.</p>;

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}

      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Full name"
        disabled={loading}
      />
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email address"
        disabled={loading}
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        disabled={loading}
      />
      <button type="submit" disabled={loading || !name || !email || !password}>
        {loading ? "Creating account..." : "Create Account"}
      </button>
    </form>
  );
}
\`\`\`

## State with Objects and Arrays

\`\`\`jsx
// Managing a list
function TodoApp() {
  const [todos, setTodos] = useState([
    { id: 1, text: "Learn React", done: false, priority: "high" },
    { id: 2, text: "Build a project", done: false, priority: "medium" },
    { id: 3, text: "Deploy to production", done: false, priority: "low" },
  ]);
  const [input,  setInput]  = useState("");
  const [filter, setFilter] = useState("all"); // "all" | "active" | "done"

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos(prev => [
      ...prev,
      { id: Date.now(), text: input.trim(), done: false, priority: "medium" }
    ]);
    setInput("");
  };

  const toggleTodo = (id) => {
    setTodos(prev =>
      prev.map(t => t.id === id ? { ...t, done: !t.done } : t)
    );
  };

  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const clearCompleted = () => {
    setTodos(prev => prev.filter(t => !t.done));
  };

  const filtered = todos.filter(t => {
    if (filter === "active") return !t.done;
    if (filter === "done")   return t.done;
    return true;
  });

  return (
    <div className="todo-app">
      <div className="add-row">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addTodo()}
          placeholder="What needs to be done?"
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <div className="filters">
        {["all", "active", "done"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={filter === f ? "active" : ""}
          >
            {f}
          </button>
        ))}
      </div>

      <ul>
        {filtered.map(todo => (
          <li key={todo.id} className={todo.done ? "completed" : ""}>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggleTodo(todo.id)}
            />
            <span>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)}>✕</button>
          </li>
        ))}
      </ul>

      <div className="footer">
        <span>{todos.filter(t => !t.done).length} items left</span>
        {todos.some(t => t.done) && (
          <button onClick={clearCompleted}>Clear completed</button>
        )}
      </div>
    </div>
  );
}
\`\`\``,

'useEffect and Data Fetching': `# useEffect and Data Fetching

\`useEffect\` is React's escape hatch — it lets your component interact with things outside of React: APIs, the DOM, timers, event listeners, browser storage. Mastering \`useEffect\` is essential for building real applications that fetch data and respond to the environment.

## What is a Side Effect?

A side effect is anything your component does that reaches outside of itself:
- Fetching data from an API
- Setting the document title
- Adding/removing event listeners
- Setting a timer
- Writing to localStorage
- Logging to analytics

React's rendering should be pure — given the same props and state, it should always produce the same output. Side effects don't belong in the render function. That's why \`useEffect\` exists.

## Basic useEffect Syntax

\`\`\`jsx
import { useEffect } from "react";

useEffect(() => {
  // Your side effect goes here
  console.log("This runs after every render");
});

useEffect(() => {
  console.log("This runs ONCE after the first render");
}, []); // empty dependency array

useEffect(() => {
  console.log("This runs when userId changes");
}, [userId]); // runs when userId changes

useEffect(() => {
  console.log("This runs when either userId OR courseId changes");
}, [userId, courseId]);
\`\`\`

## The Cleanup Function

Most effects need cleanup — to undo what they did when the component unmounts or before the effect runs again:

\`\`\`jsx
useEffect(() => {
  // Setup
  const subscription = someExternalStore.subscribe(handler);
  const timerId      = setInterval(tick, 1000);
  window.addEventListener("resize", handleResize);

  // Cleanup — returned function runs:
  // 1. Before the next time this effect runs
  // 2. When the component unmounts
  return () => {
    someExternalStore.unsubscribe(subscription);
    clearInterval(timerId);
    window.removeEventListener("resize", handleResize);
  };
}, []);
\`\`\`

Without cleanup, you get memory leaks, stale callbacks, and bugs.

## Data Fetching Pattern

\`\`\`jsx
import { useState, useEffect } from "react";

function CourseList() {
  const [courses,  setCourses]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    let cancelled = false; // prevent state updates on unmounted component

    async function fetchCourses() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/courses");
        if (!response.ok) throw new Error(\`HTTP \${response.status}\`);

        const data = await response.json();
        if (!cancelled) setCourses(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCourses();

    return () => { cancelled = true; };
  }, []);

  if (loading) return <Spinner />;
  if (error)   return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="course-grid">
      {courses.map(course => (
        <CourseCard key={course._id} course={course} />
      ))}
    </div>
  );
}
\`\`\`

## Fetching with Dependencies

\`\`\`jsx
function CourseDetail({ courseId }) {
  const [course,  setCourse]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;

    let cancelled = false;
    setLoading(true);

    fetch(\`/api/courses/\${courseId}\`)
      .then(r => r.json())
      .then(data => { if (!cancelled) { setCourse(data); setLoading(false); } })
      .catch(err => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [courseId]); // re-fetch whenever courseId changes

  if (loading) return <Spinner />;
  if (!course) return null;

  return <div>{course.title}</div>;
}
\`\`\`

## Building Custom Hooks

Custom hooks let you extract and reuse effect logic:

\`\`\`jsx
// Custom hook — reusable data fetching
function useFetch(url) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!url) return;

    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(url);
        if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
        const json = await response.json();
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [url]);

  return { data, loading, error };
}

// Use it anywhere
function Courses() {
  const { data: courses, loading, error } = useFetch("/api/courses");
  if (loading) return <Spinner />;
  if (error)   return <p>Error: {error}</p>;
  return courses.map(c => <CourseCard key={c._id} course={c} />);
}

// Custom hook — debounce search
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// Custom hook — window size
function useWindowSize() {
  const [size, setSize] = useState({
    width:  window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handle = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  return size;
}

// Custom hook — local storage
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = (newValue) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [value, setStoredValue];
}

// Usage
function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage("theme", "light");
  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      Current: {theme}
    </button>
  );
}
\`\`\``,

'Setting Up an Express Server': `# Setting Up an Express Server

Express is a minimal and flexible Node.js web framework. It provides a thin layer of fundamental web application features without obscuring Node.js features. Express is the most popular choice for building REST APIs with Node.js — used by companies like IBM, Accenture, and Uber.

## Why Express?

Node.js has a built-in \`http\` module for creating servers, but it's very low-level:

\`\`\`js
// Raw Node.js — verbose and painful
const http = require("http");

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/api/courses") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ courses: [] }));
  } else if (req.method === "POST" && req.url === "/api/courses") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      const data = JSON.parse(body);
      // handle the data...
    });
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});
\`\`\`

With Express:

\`\`\`js
// Express — clean and readable
const express = require("express");
const app = express();
app.use(express.json());

app.get("/api/courses",  (req, res) => res.json({ courses: [] }));
app.post("/api/courses", (req, res) => res.json(req.body));
\`\`\`

## Project Setup from Scratch

\`\`\`bash
# Create project
mkdir pugi-api && cd pugi-api
npm init -y

# Install runtime dependencies
npm install express cors dotenv mongoose bcryptjs jsonwebtoken

# Install development dependencies
npm install -D typescript ts-node-dev @types/express @types/cors @types/node @types/bcryptjs @types/jsonwebtoken

# Initialize TypeScript
npx tsc --init
\`\`\`

Configure \`tsconfig.json\`:
\`\`\`json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
\`\`\`

Add scripts to \`package.json\`:
\`\`\`json
{
  "scripts": {
    "dev":   "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
\`\`\`

## Basic Server Structure

\`\`\`ts
// src/index.ts
import express from "express";
import cors   from "cors";
import dotenv from "dotenv";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5174",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger (development)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(\`\${new Date().toISOString()} \${req.method} \${req.path}\`);
    next();
  });
}

// ── Routes ──────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "PUGI API is running", version: "1.0.0" });
});

app.get("/api/health", (req, res) => {
  res.json({
    status:  "ok",
    uptime:  process.uptime(),
    memory:  process.memoryUsage(),
    time:    new Date().toISOString(),
  });
});

// Import and mount routers
import courseRoutes from "./routes/courses";
import authRoutes   from "./routes/auth";
import userRoutes   from "./routes/users";

app.use("/api/courses", courseRoutes);
app.use("/api/auth",    authRoutes);
app.use("/api/users",   userRoutes);

// ── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    message: \`Cannot \${req.method} \${req.path}\`,
    availableRoutes: ["/api/courses", "/api/auth", "/api/users"],
  });
});

// ── Error Handler ────────────────────────────────────────────
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(\`🚀 Server running on http://localhost:\${PORT}\`);
});
\`\`\`

## Router Pattern — Organizing Routes

\`\`\`ts
// src/routes/courses.ts
import { Router, Request, Response, NextFunction } from "express";
import { Course } from "../models/Course";

const router = Router();

// Async wrapper to avoid try/catch everywhere
const asyncHandler = (fn: Function) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// GET /api/courses
router.get("/", asyncHandler(async (req: Request, res: Response) => {
  const { search, category, level, page = 1, limit = 12 } = req.query;

  const query: any = { status: "published" };
  if (search)   query.title    = { $regex: search,   $options: "i" };
  if (category) query.category = { $regex: category, $options: "i" };
  if (level)    query.level    = level;

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Course.countDocuments(query);
  const courses = await Course.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .select("-modules"); // exclude heavy modules data from list view

  res.json({
    courses,
    pagination: {
      page:  Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    }
  });
}));

// GET /api/courses/:id
router.get("/:id", asyncHandler(async (req: Request, res: Response) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });
  res.json(course);
}));

// POST /api/courses
router.post("/", asyncHandler(async (req: Request, res: Response) => {
  const { title, description, category, level } = req.body;
  if (!title) return res.status(400).json({ message: "Title is required" });

  const course = await Course.create({
    title, description, category, level,
    instructor: "Team PUGI",
    status: "published",
  });

  res.status(201).json(course);
}));

export default router;
\`\`\`

## Request and Response Objects

\`\`\`ts
app.get("/api/example/:id", (req, res) => {
  // URL parameters — from the path
  const { id } = req.params;          // /api/example/123 → id = "123"

  // Query string — from the URL
  const { page, limit, sort } = req.query; // ?page=2&limit=10&sort=rating

  // Request body — from POST/PATCH
  const { title, description } = req.body;

  // Headers
  const token     = req.headers.authorization;   // "Bearer eyJ..."
  const userAgent = req.headers["user-agent"];

  // IP address
  const ip = req.ip;

  // Send responses
  res.json({ message: "OK" });                   // JSON response
  res.status(201).json({ id: "new-id" });        // with status code
  res.status(204).send();                         // no content
  res.status(400).json({ message: "Bad input" }); // error
  res.redirect("/api/courses");                   // redirect
  res.sendFile("/path/to/file.pdf");              // send file
});
\`\`\``,

'Variables, Types, and Input': `# Variables, Types, and Input

Python is one of the world's most popular programming languages for a reason: its syntax is clean and readable, almost like writing English. This lesson covers the absolute foundations — storing information, understanding types, and getting input from users.

## Your First Python Program

Before we start, make sure Python is installed. Open your terminal and type:

\`\`\`bash
python3 --version  # Should show Python 3.x.x
\`\`\`

Create a file called \`hello.py\` and write:

\`\`\`python
print("Hello, World!")
print("Welcome to PUGI!")
\`\`\`

Run it with \`python3 hello.py\`. The \`print()\` function outputs text to the screen — you'll use it constantly.

## Variables — Naming Your Data

A variable is a named container for storing a value. Python does not require you to declare the type — it figures it out automatically:

\`\`\`python
# Strings — text surrounded by quotes
name        = "Amara Okafor"
course      = 'JavaScript Fundamentals'
multiline   = """This is a
multi-line string"""

# Numbers
age         = 27          # int (integer — whole number)
height      = 1.75        # float (floating-point — decimal)
temperature = -10         # negative int
big_number  = 1_000_000   # underscores for readability

# Boolean
is_enrolled = True        # must be capitalized!
is_premium  = False

# None — the absence of a value (like null in other languages)
selected_course = None
last_login      = None
\`\`\`

**Naming rules:**
- Use \`snake_case\` for variables (lowercase with underscores)
- Names must start with a letter or underscore
- No spaces, no special characters except underscore
- Case-sensitive: \`name\` and \`Name\` are different variables

\`\`\`python
# Good names
user_name = "Amara"
total_score = 95
is_admin = False
course_count = 13

# Bad names (will cause errors or confusion)
# 2name = "Amara"    # cannot start with number
# user-name = "..."  # hyphens not allowed
# class = "intro"    # 'class' is a Python keyword
\`\`\`

## String Operations

Strings are incredibly versatile in Python:

\`\`\`python
name   = "Amara Okafor"
course = "JavaScript Fundamentals"

# f-strings — the modern way to format strings (Python 3.6+)
message = f"Hello, {name}! You are enrolled in {course}."
print(message)
# Hello, Amara Okafor! You are enrolled in JavaScript Fundamentals.

# Expressions inside f-strings
score = 92
print(f"Your grade: {score}%")
print(f"Pass/Fail: {'Pass' if score >= 70 else 'Fail'}")
print(f"In 5 years you will be {27 + 5}")

# String methods
print(name.upper())          # AMARA OKAFOR
print(name.lower())          # amara okafor
print(name.title())          # Amara Okafor (each word capitalized)
print("  spaces  ".strip())  # "spaces" (remove leading/trailing whitespace)
print("  spaces  ".lstrip()) # "spaces  " (left only)
print("  spaces  ".rstrip()) # "  spaces" (right only)

print(name.replace("Amara", "David"))   # "David Okafor"
print("a,b,c,d".split(","))             # ['a', 'b', 'c', 'd']
print(",".join(["a", "b", "c"]))        # "a,b,c"

print(name.startswith("Amara"))  # True
print(name.endswith("Okafor"))   # True
print("Java" in course)          # True (substring check)
print("Python" in course)        # False

print(len(name))         # 12 (number of characters)
print(name[0])           # 'A' (first character)
print(name[-1])          # 'r' (last character)
print(name[0:5])         # 'Amara' (slicing)
print(name[6:])          # 'Okafor'
print(name[::-1])        # 'rafoK arAmA' (reversed)

print(name.count("a"))   # 3 (count occurrences)
print(name.find("Okafor")) # 6 (index of substring, -1 if not found)
print(course.index("Script")) # 4 (like find but raises error if not found)
\`\`\`

## Numbers and Math

\`\`\`python
# Basic arithmetic
print(10 + 3)   # 13 (addition)
print(10 - 3)   # 7  (subtraction)
print(10 * 3)   # 30 (multiplication)
print(10 / 3)   # 3.3333... (true division — always returns float)
print(10 // 3)  # 3  (floor division — rounds down)
print(10 % 3)   # 1  (modulo — remainder)
print(10 ** 3)  # 1000 (exponentiation)
print(-10 // 3) # -4 (floor division always rounds DOWN)

# Built-in math functions
print(abs(-42))        # 42 (absolute value)
print(round(3.7))      # 4 (round to nearest int)
print(round(3.14159, 2)) # 3.14 (round to 2 decimal places)
print(max(3, 1, 4, 1, 5, 9)) # 9
print(min(3, 1, 4, 1, 5, 9)) # 1
print(sum([1, 2, 3, 4, 5]))  # 15
print(pow(2, 10))     # 1024 (same as 2**10)

# The math module
import math

print(math.pi)          # 3.141592653589793
print(math.e)           # 2.718281828459045
print(math.sqrt(16))    # 4.0
print(math.ceil(3.2))   # 4 (round up)
print(math.floor(3.9))  # 3 (round down)
print(math.log(100, 10)) # 2.0 (log base 10 of 100)
print(math.sin(math.pi / 2)) # 1.0

# Augmented assignment operators
score = 85
score += 10  # score = score + 10 → 95
score -= 5   # score = score - 5  → 90
score *= 2   # score = score * 2  → 180
score //= 3  # score = score // 3 → 60
score **= 2  # score = score ** 2 → 3600
\`\`\`

## Getting User Input

The \`input()\` function pauses your program and waits for the user to type something. It ALWAYS returns a string:

\`\`\`python
# Basic input
name = input("What is your name? ")
print(f"Hello, {name}!")

# Converting input to numbers
age_str = input("How old are you? ")
age     = int(age_str)   # convert string to integer
print(f"In 10 years you'll be {age + 10}")

# One line
score = float(input("Enter your score: "))
print(f"Your score is {score:.1f}")

# Safe input with error handling
try:
    age = int(input("Enter your age: "))
    print(f"You are {age} years old")
except ValueError:
    print("Please enter a valid number!")
\`\`\`

## Type Conversion

\`\`\`python
# To int
int("42")          # 42
int("42.9")        # ValueError! use int(float("42.9")) instead
int(3.9)           # 3 (truncates, doesn't round)
int(True)          # 1
int(False)         # 0

# To float
float("3.14")      # 3.14
float("42")        # 42.0
float(True)        # 1.0

# To string
str(42)            # "42"
str(3.14)          # "3.14"
str(True)          # "True"
str(None)          # "None"

# To bool
bool(0)            # False
bool("")           # False
bool(None)         # False
bool([])           # False (empty list)
bool({})           # False (empty dict)
bool(42)           # True (any non-zero number)
bool("hello")      # True (any non-empty string)
bool([1, 2])       # True (any non-empty list)

# Checking types
type(42)           # <class 'int'>
type("hello")      # <class 'str'>
type(3.14)         # <class 'float'>
type(True)         # <class 'bool'>
type(None)         # <class 'NoneType'>
isinstance(42, int)    # True
isinstance("hi", str)  # True
isinstance(42, (int, float)) # True (check multiple types)
\`\`\`

## Comparison and Logic

\`\`\`python
# Comparison operators
print(5 == 5)   # True
print(5 != 3)   # True
print(5 > 3)    # True
print(5 < 3)    # False
print(5 >= 5)   # True
print(5 <= 4)   # False

# Logical operators
print(True and False)  # False (both must be True)
print(True or False)   # True  (at least one must be True)
print(not True)        # False (negation)

# Chained comparison (unique to Python!)
age = 25
print(18 <= age <= 65)  # True — much cleaner than age >= 18 and age <= 65

score = 85
grade = "A" if score >= 90 else "B" if score >= 80 else "C" if score >= 70 else "F"
print(grade)  # "B"
\`\`\``,

'SELECT, WHERE, and ORDER BY': `# SELECT, WHERE, and ORDER BY

SQL (Structured Query Language) is the universal language for working with relational databases. Whether you use PostgreSQL, MySQL, SQLite, or Microsoft SQL Server, the same core SQL works across all of them. This lesson covers the foundation of every SQL query: selecting, filtering, and sorting data.

## What is a Relational Database?

A relational database stores data in tables — like spreadsheets. Each table has:
- **Columns** (fields) — define what kind of data is stored
- **Rows** (records) — the actual data

Tables relate to each other through keys. For example:
- A \`users\` table with a primary key \`id\`
- An \`enrollments\` table with a \`user_id\` foreign key that references \`users.id\`

\`\`\`
users table:
| id | name   | email           | role    | xp   |
|----|--------|-----------------|---------|------|
| 1  | Amara  | amara@pugi.com  | learner | 1250 |
| 2  | David  | david@pugi.com  | tutor   | 0    |
| 3  | Leah   | leah@pugi.com   | learner | 800  |

courses table:
| id | title                 | category | level       | rating |
|----|-----------------------|----------|-------------|--------|
| 1  | JavaScript Basics     | Frontend | beginner    | 4.8    |
| 2  | React Foundations     | Frontend | beginner    | 4.9    |
| 3  | Node.js & Express     | Backend  | intermediate| 4.7    |
\`\`\`

## The SELECT Statement

SELECT is the most fundamental SQL statement — it retrieves data from one or more tables:

\`\`\`sql
-- Get everything from a table (rarely used in production — too broad)
SELECT * FROM users;

-- Get specific columns only (preferred — more efficient)
SELECT name, email, role FROM users;

-- Rename columns with aliases
SELECT
  name          AS student_name,
  email         AS contact_email,
  xp            AS total_xp,
  role          AS user_role
FROM users;

-- Calculated columns
SELECT
  name,
  xp,
  xp / 500 + 1         AS level,
  ROUND(xp * 0.1, 2)   AS bonus_points
FROM users;

-- String concatenation
SELECT
  name || ' <' || email || '>'  AS display_name  -- PostgreSQL/SQLite
FROM users;

-- DISTINCT — remove duplicate values
SELECT DISTINCT category FROM courses;
-- Frontend, Backend, Programming, Data Science, Design...

SELECT DISTINCT role FROM users;
-- learner, tutor, admin
\`\`\`

## WHERE — Filtering Rows

WHERE narrows down which rows to return:

\`\`\`sql
-- Equality
SELECT * FROM users WHERE role = 'learner';
SELECT * FROM courses WHERE level = 'beginner';

-- Inequality
SELECT * FROM courses WHERE level != 'beginner';
SELECT * FROM courses WHERE level <> 'beginner';  -- same as !=

-- Comparison operators
SELECT * FROM courses  WHERE rating > 4.5;
SELECT * FROM users    WHERE xp >= 1000;
SELECT * FROM courses  WHERE rating < 3.0;
SELECT * FROM users    WHERE xp <= 500;

-- AND — all conditions must be true
SELECT * FROM courses
WHERE category = 'Frontend'
  AND level = 'beginner'
  AND rating >= 4.5;

-- OR — at least one condition must be true
SELECT * FROM courses
WHERE category = 'Frontend'
   OR category = 'Backend';

-- NOT — negate a condition
SELECT * FROM users WHERE NOT role = 'admin';

-- Combining AND and OR — use parentheses to control precedence
SELECT * FROM courses
WHERE (category = 'Frontend' OR category = 'Backend')
  AND level = 'beginner'
  AND rating >= 4.0;

-- IN — match against a list (cleaner than multiple OR)
SELECT * FROM courses
WHERE category IN ('Frontend', 'Backend', 'DevOps');

-- NOT IN
SELECT * FROM courses
WHERE level NOT IN ('advanced');

-- BETWEEN — inclusive range
SELECT * FROM courses WHERE rating BETWEEN 4.0 AND 4.9;
SELECT * FROM users  WHERE xp     BETWEEN 500 AND 2000;
-- Same as: rating >= 4.0 AND rating <= 4.9

-- LIKE — pattern matching with wildcards
-- % matches any sequence of characters (including empty)
-- _ matches exactly one character
SELECT * FROM courses WHERE title LIKE '%React%';   -- contains "React" anywhere
SELECT * FROM courses WHERE title LIKE 'Python%';   -- starts with "Python"
SELECT * FROM users  WHERE email LIKE '%@gmail.com'; -- ends with @gmail.com
SELECT * FROM users  WHERE name  LIKE '_eah%';       -- second char is 'e', starts with any char

-- ILIKE — case-insensitive LIKE (PostgreSQL)
SELECT * FROM courses WHERE title ILIKE '%javascript%';

-- IS NULL / IS NOT NULL
SELECT * FROM users WHERE avatar IS NULL;
SELECT * FROM users WHERE last_login IS NOT NULL;

-- Note: You CANNOT use = NULL — must use IS NULL
SELECT * FROM users WHERE avatar = NULL;  -- WRONG, always returns 0 rows
\`\`\`

## ORDER BY — Sorting Results

\`\`\`sql
-- Sort by one column (ascending is default)
SELECT * FROM courses ORDER BY rating;         -- lowest to highest
SELECT * FROM courses ORDER BY rating ASC;     -- same thing, explicit
SELECT * FROM courses ORDER BY rating DESC;    -- highest to lowest

-- Sort by multiple columns
SELECT * FROM courses
ORDER BY category ASC, rating DESC;
-- First sorts by category A-Z, then within each category by rating highest first

-- Sort with NULLs
SELECT * FROM users ORDER BY last_login DESC NULLS LAST;  -- NULLs at end
SELECT * FROM users ORDER BY last_login ASC  NULLS FIRST; -- NULLs at start

-- Sort by calculated expression
SELECT name, xp, xp / 500 + 1 AS level
FROM users
ORDER BY level DESC, xp DESC;

-- Sort by column alias
SELECT name, xp * 2 AS double_xp FROM users ORDER BY double_xp DESC;
\`\`\`

## LIMIT and OFFSET — Pagination

\`\`\`sql
-- Get only the first N rows
SELECT * FROM courses ORDER BY rating DESC LIMIT 10;

-- Pagination: page 1 (first 12 courses)
SELECT * FROM courses ORDER BY created_at DESC LIMIT 12 OFFSET 0;

-- Page 2 (next 12 courses)
SELECT * FROM courses ORDER BY created_at DESC LIMIT 12 OFFSET 12;

-- Page 3
SELECT * FROM courses ORDER BY created_at DESC LIMIT 12 OFFSET 24;

-- Formula: OFFSET = (page_number - 1) * page_size
\`\`\`

## Practical Query Examples

\`\`\`sql
-- Top 5 highest-rated beginner courses in Frontend or Backend
SELECT
  title,
  category,
  level,
  rating,
  enrolled_count,
  instructor
FROM courses
WHERE
  status = 'published'
  AND level = 'beginner'
  AND category IN ('Frontend', 'Backend')
  AND rating >= 4.0
ORDER BY rating DESC, enrolled_count DESC
LIMIT 5;

-- Find all learners with more than 1000 XP who have a bio
SELECT
  name,
  email,
  xp,
  ROUND(xp / 500.0) + 1 AS level
FROM users
WHERE
  role = 'learner'
  AND xp > 1000
  AND bio IS NOT NULL
  AND bio != ''
ORDER BY xp DESC;

-- Search courses by keyword (case-insensitive)
SELECT title, category, level, rating
FROM courses
WHERE
  status = 'published'
  AND (
    title       ILIKE '%javascript%'
    OR description ILIKE '%javascript%'
    OR category    ILIKE '%javascript%'
  )
ORDER BY rating DESC
LIMIT 20;

-- Find courses created this month
SELECT title, instructor, created_at
FROM courses
WHERE
  created_at >= DATE_TRUNC('month', NOW())
  AND created_at <  DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
ORDER BY created_at DESC;
\`\`\``,

'How Git Works': `# How Git Works

Git is the most widely used version control system in the world. It tracks changes to files over time so you can go back to any previous version, collaborate with others without overwriting each other's work, and understand the complete history of a project. Every professional developer uses Git daily.

## Why Version Control?

Imagine you're building PUGI. You make 50 changes to a file, and suddenly everything breaks. Without Git, you'd have to manually remember what you changed and undo it. With Git, you can instantly go back to any previous working state.

Or imagine two developers working on the same file simultaneously. Without Git, one person's work overwrites the other's. With Git, their changes are tracked separately and merged intelligently.

## Core Concepts

**Repository (repo)** — a directory that Git is tracking. It contains all your files plus a hidden \`.git\` folder that stores the entire history.

**Commit** — a snapshot of your files at a specific point in time. Each commit has:
- A unique hash (e.g., \`a3f8c91\`)
- A message describing what changed
- The author and timestamp
- A pointer to the previous commit

**Branch** — a parallel line of development. The default branch is usually called \`main\`. You can create branches to work on features without affecting \`main\`.

**Remote** — a copy of the repository hosted on a server (GitHub, GitLab, Bitbucket). Your local copy and the remote stay synchronized with push and pull.

**Working tree** — your current files as they appear on disk.

**Staging area (index)** — a holding area for changes you're about to commit. You explicitly choose which changes to include in the next commit.

## Initial Setup

Do this once when you first install Git:

\`\`\`bash
# Set your identity (appears in every commit you make)
git config --global user.name  "Amara Okafor"
git config --global user.email "amara@pugi.com"

# Set default branch name to main
git config --global init.defaultBranch main

# Set VS Code as your default editor
git config --global core.editor "code --wait"

# Enable colorful output
git config --global color.ui auto

# View your configuration
git config --list
\`\`\`

## Starting a Repository

\`\`\`bash
# Option 1: Initialize a new repo in the current directory
mkdir my-project
cd my-project
git init
# Creates a .git folder — this IS your repository

# Option 2: Clone an existing repo from GitHub
git clone https://github.com/user/repo.git
git clone https://github.com/user/repo.git my-folder-name  # custom name

# Check the status of your repo
git status
\`\`\`

## The Three Areas of Git

Understanding these three areas is key to understanding Git:

\`\`\`
Working Tree          Staging Area           Repository
(your files)          (what's queued)        (committed history)

[modified files]  →   [staged changes]   →   [commits]
                  git add              git commit
\`\`\`

## The Daily Workflow

\`\`\`bash
# 1. Check what has changed
git status            # overview of changes
git diff              # show unstaged changes in detail
git diff --staged     # show staged changes in detail
git diff HEAD         # show all changes since last commit

# 2. Stage changes
git add filename.ts         # stage one specific file
git add src/                # stage all files in a directory
git add *.ts                # stage all TypeScript files
git add .                   # stage ALL changes in current directory
git add -p                  # interactive staging — choose hunks to stage

# Unstage a file (keep the changes, just remove from staging)
git restore --staged filename.ts

# 3. Commit
git commit -m "feat: add course search with category filter"
git commit              # opens editor for a longer message
git commit --amend      # modify the LAST commit (before pushing!)

# 4. View history
git log                              # full history
git log --oneline                    # compact: one line per commit
git log --oneline --graph --all      # visual branch graph
git log --oneline -10                # last 10 commits
git log --author="Amara"             # commits by author
git log --since="2024-01-01"         # commits since date
git log --grep="feat:"               # commits matching message pattern

# 5. Push to remote
git push origin main                 # push main to origin
git push                             # shorthand if tracking is set up
git push -u origin main              # set upstream and push

# 6. Pull from remote
git pull origin main                 # fetch + merge
git pull --rebase origin main        # fetch + rebase (cleaner history)
git fetch origin                     # fetch but don't merge yet
\`\`\`

## Writing Good Commit Messages

A commit message is a permanent record of what you did and why. Future you (and your teammates) will be grateful for clear messages.

**Format:**
\`\`\`
<type>: <short description in present tense>

[optional body — why this change was needed]

[optional footer — references to issues, breaking changes]
\`\`\`

**Types:**
\`\`\`
feat:     new feature
fix:      bug fix
docs:     documentation changes
style:    formatting, missing semicolons (no logic changes)
refactor: code restructuring without feature/fix
test:     adding or fixing tests
chore:    build process, dependency updates
perf:     performance improvements
\`\`\`

**Examples:**
\`\`\`
feat: add course category filter on CoursesPage

fix: prevent duplicate enrollment when clicking enroll twice

docs: add API authentication guide to README

refactor: extract auth middleware to separate module

feat: implement quiz modal after completing last lesson in module

Closes #42

fix: correct XP calculation for streak bonus

Previously streak bonus was not applied when completing the first
lesson of the day. Now checks lastStreakDate before awarding XP.
\`\`\`

## Ignoring Files

Create a \`.gitignore\` file in your repo root to tell Git what to ignore:

\`\`\`gitignore
# Dependencies — never commit these
node_modules/
.pnp
.pnp.js

# Build output — generated, not source
dist/
build/
.next/
out/

# Environment variables — CRITICAL: never commit secrets
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# OS files
.DS_Store
.DS_Store?
._*
Thumbs.db
ehthumbs.db

# Editor files
.vscode/settings.json
.idea/
*.swp
*.swo

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# TypeScript
*.tsbuildinfo

# Test coverage
coverage/
.nyc_output/

# Temporary files
*.tmp
*.temp
\`\`\`

If you accidentally committed something you should have ignored:

\`\`\`bash
# Remove from Git tracking but keep on disk
git rm --cached .env
git rm --cached -r node_modules/

# Then commit the removal
git commit -m "chore: remove accidentally committed .env file"

# Add to .gitignore so it doesn't happen again
echo ".env" >> .gitignore
\`\`\``,

};

const updateContent = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const courses = await Course.find({});
  let updatedCount = 0;

  for (const course of courses) {
    let courseModified = false;

    for (const mod of course.modules as any[]) {
      for (const lesson of mod.lessons as any[]) {
        const newContent = richContent[lesson.title];
        if (newContent && lesson.content.length < 5000) {
          lesson.content = newContent;
          courseModified = true;
          updatedCount++;
          console.log(`  ✅ Updated: ${lesson.title} (${newContent.length} chars)`);
        }
      }
    }

    if (courseModified) {
      course.markModified('modules');
      await course.save();
    }
  }

  console.log(`\nDone! Updated ${updatedCount} lessons.`);
  await mongoose.disconnect();
};

updateContent()
  .then(() => process.exit(0))
  .catch(err => { console.error(err); process.exit(1); });
