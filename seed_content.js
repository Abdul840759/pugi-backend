const { MongoClient } = require('mongodb');
const client = new MongoClient('mongodb://localhost:27017');

const content = {
  "JavaScript Fundamentals": {
    "What is JavaScript?": `# What is JavaScript?

JavaScript is the programming language of the web. It is the only language that runs natively in every web browser, making it the most widely used programming language in the world.

## Why Learn JavaScript?

Before JavaScript, web pages were static — just text and images with no interactivity. JavaScript changed everything by allowing:
- Buttons that respond to clicks
- Forms that validate input before submitting
- Content that updates without refreshing the page
- Games, animations, and rich user interfaces

Today JavaScript runs everywhere:
- **In the browser** — making websites interactive
- **On the server** — Node.js lets you build backends with JS
- **On mobile** — React Native builds iOS and Android apps
- **On desktop** — Electron powers apps like VS Code and Slack

## How JavaScript Works

When you visit a website, your browser downloads HTML, CSS, and JavaScript files. The browser's JavaScript engine reads and executes your JS code line by line.

Chrome uses the **V8 engine**, Firefox uses **SpiderMonkey**. These engines are extremely fast — modern JS runs at near-native speed.

## Your First JavaScript Program

Open your browser, press **F12** to open DevTools, click the **Console** tab, and type:

\`\`\`js
console.log("Hello, world!");
\`\`\`

You should see \`Hello, world!\` printed immediately. \`console.log()\` is your best friend — use it to print values and debug your code.

\`\`\`js
console.log("My name is Abdulazeez");
console.log(2 + 2);          // prints 4
console.log(typeof "hello"); // prints "string"
\`\`\`

## Variables — Storing Data

Variables are containers that hold values. JavaScript has three ways to declare them:

\`\`\`js
// var — old way, avoid it
var oldSchool = "don't use this";

// let — use when the value will change
let score = 0;
score = 10;   // ✅ allowed
score = 25;   // ✅ allowed

// const — use when the value never changes
const PI = 3.14159;
const APP_NAME = "PUGI";
PI = 3;       // ❌ TypeError: Assignment to constant variable
\`\`\`

**Rule of thumb:** Always use \`const\` by default. Only switch to \`let\` when you know the value needs to change. Never use \`var\`.

## Data Types

JavaScript has 8 data types. The most important ones are:

\`\`\`js
// String — text, wrapped in quotes
const name = "Abdulazeez";
const city = 'Kano';
const greeting = \`Hello, \${name}!\`;  // template literal — very useful!

// Number — integers and decimals (no separate float type)
const age = 25;
const price = 9.99;
const negative = -42;

// Boolean — true or false only
const isLoggedIn = true;
const hasPermission = false;

// null — intentionally empty
const selectedUser = null;

// undefined — declared but not assigned yet
let futureValue;
console.log(futureValue); // undefined

// Object — collection of key-value pairs
const user = {
  name: "Abdulazeez",
  age: 25,
  city: "Kano",
  isActive: true
};

// Array — ordered list of values
const colors = ["red", "green", "blue"];
const numbers = [1, 2, 3, 4, 5];
const mixed = ["hello", 42, true, null];
\`\`\`

## Checking Types with typeof

\`\`\`js
console.log(typeof "hello");     // "string"
console.log(typeof 42);          // "number"
console.log(typeof true);        // "boolean"
console.log(typeof undefined);   // "undefined"
console.log(typeof null);        // "object" ← famous JS bug, null is not really an object
console.log(typeof {});          // "object"
console.log(typeof []);          // "object" ← arrays are objects too
console.log(typeof function(){}); // "function"
\`\`\`

## String Operations

Strings are one of the most used types. Here are the most important operations:

\`\`\`js
const firstName = "Abdulazeez";
const lastName = "Yunusa";

// Concatenation (joining strings)
const fullName = firstName + " " + lastName;
console.log(fullName); // "Abdulazeez Yunusa"

// Template literals (modern, preferred way)
const message = \`Welcome back, \${firstName}!\`;
console.log(message); // "Welcome back, Abdulazeez!"

// String length
console.log(firstName.length); // 10

// Uppercase and lowercase
console.log(firstName.toUpperCase()); // "ABDULAZEEZ"
console.log(firstName.toLowerCase()); // "abdulazeez"

// Check if string contains something
console.log(firstName.includes("azee")); // true

// Get part of a string
console.log(firstName.slice(0, 5)); // "Abdul"

// Remove whitespace
const messy = "  hello  ";
console.log(messy.trim()); // "hello"
\`\`\`

## Arithmetic Operators

\`\`\`js
console.log(10 + 3);  // 13 — addition
console.log(10 - 3);  // 7  — subtraction
console.log(10 * 3);  // 30 — multiplication
console.log(10 / 3);  // 3.333... — division
console.log(10 % 3);  // 1  — modulus (remainder)
console.log(10 ** 3); // 1000 — exponentiation (10 to the power of 3)

// Increment and decrement
let count = 0;
count++;        // count is now 1
count++;        // count is now 2
count--;        // count is now 1
console.log(count); // 1

// Shorthand assignment
let x = 10;
x += 5;   // same as x = x + 5  → x is 15
x -= 3;   // same as x = x - 3  → x is 12
x *= 2;   // same as x = x * 2  → x is 24
x /= 4;   // same as x = x / 4  → x is 6
\`\`\`

## Common Mistakes Beginners Make

\`\`\`js
// ❌ Mistake 1: Using = instead of == or ===
let age = 18;
if (age = 21) {  // This ASSIGNS 21 to age, doesn't compare!
  console.log("adult");
}
// ✅ Fix: use === for comparison
if (age === 21) {
  console.log("adult");
}

// ❌ Mistake 2: Confusing == and ===
console.log(1 == "1");   // true  — loose equality, converts types
console.log(1 === "1");  // false — strict equality, no conversion
// ✅ Always use === unless you have a specific reason not to

// ❌ Mistake 3: Trying to reassign a const
const MAX = 100;
MAX = 200; // TypeError!
// ✅ Use let if you need to reassign

// ❌ Mistake 4: Forgetting that arrays and objects are reference types
const arr1 = [1, 2, 3];
const arr2 = arr1;       // arr2 points to the SAME array
arr2.push(4);
console.log(arr1);       // [1, 2, 3, 4] — arr1 was also changed!
\`\`\`

## Real World Example

Here is how JavaScript variables are used in a real login form:

\`\`\`js
// Values from a login form
const enteredEmail = "user@example.com";
const enteredPassword = "mypassword123";

// Stored user data
const registeredEmail = "user@example.com";
const minPasswordLength = 8;

// Validation
const emailMatches = enteredEmail === registeredEmail;
const passwordLongEnough = enteredPassword.length >= minPasswordLength;
const canLogin = emailMatches && passwordLongEnough;

if (canLogin) {
  console.log("Login successful! Welcome back.");
} else {
  console.log("Invalid email or password too short.");
}
\`\`\`

## Pro Tips

1. **Name variables clearly** — \`userAge\` is better than \`a\` or \`x\`
2. **Use camelCase** for variable names — \`firstName\`, \`totalPrice\`, \`isLoggedIn\`
3. **Use UPPER_SNAKE_CASE** for constants that never change — \`MAX_RETRIES\`, \`API_URL\`
4. **Console.log everything** when debugging — don't guess, verify

## Quick Summary

- JavaScript makes web pages interactive and runs everywhere
- Use \`const\` by default, \`let\` when you need to reassign, never \`var\`
- Main types: string, number, boolean, null, undefined, object, array
- Use \`===\` for comparison, never \`==\`
- Template literals (\`\${variable}\`) are the modern way to build strings
- \`typeof\` tells you what type a value is`,

    "Functions and Scope": `# Functions and Scope

Functions are the building blocks of JavaScript. They let you write a piece of code once and reuse it many times. Understanding scope tells you where variables can be accessed from.

## What is a Function?

A function is a reusable block of code that performs a specific task. Think of it like a recipe — you write the recipe once and can use it any time you want to cook that dish.

Without functions, you'd have to repeat the same code over and over:

\`\`\`js
// Without functions — repetitive and hard to maintain
console.log("Hello, Abdulazeez! Welcome to PUGI.");
console.log("Hello, Fatima! Welcome to PUGI.");
console.log("Hello, Ibrahim! Welcome to PUGI.");

// With functions — write once, use many times
function greet(name) {
  console.log(\`Hello, \${name}! Welcome to PUGI.\`);
}

greet("Abdulazeez"); // Hello, Abdulazeez! Welcome to PUGI.
greet("Fatima");     // Hello, Fatima! Welcome to PUGI.
greet("Ibrahim");    // Hello, Ibrahim! Welcome to PUGI.
\`\`\`

## Declaring Functions

There are three main ways to create functions in JavaScript:

\`\`\`js
// 1. Function Declaration — hoisted, can be called before it's defined
function add(a, b) {
  return a + b;
}
console.log(add(3, 5)); // 8

// 2. Function Expression — stored in a variable
const multiply = function(a, b) {
  return a * b;
};
console.log(multiply(3, 5)); // 15

// 3. Arrow Function — modern, concise syntax (most common today)
const divide = (a, b) => {
  return a / b;
};
console.log(divide(10, 2)); // 5

// Arrow function shorthand — when body is a single expression
const square = (n) => n * n;
const double = n => n * 2;  // parentheses optional for single parameter
console.log(square(4)); // 16
console.log(double(7)); // 14
\`\`\`

## Parameters and Arguments

Parameters are the variable names listed in the function definition. Arguments are the actual values passed when calling the function.

\`\`\`js
// 'name' and 'age' are parameters
function introduce(name, age) {
  return \`My name is \${name} and I am \${age} years old.\`;
}

// "Abdulazeez" and 25 are arguments
console.log(introduce("Abdulazeez", 25));
// My name is Abdulazeez and I am 25 years old.

// Default parameters — used when argument is not provided
function greet(name = "Guest") {
  return \`Hello, \${name}!\`;
}
console.log(greet("Fatima")); // Hello, Fatima!
console.log(greet());         // Hello, Guest!

// Rest parameters — collect unlimited arguments into an array
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}
console.log(sum(1, 2, 3));       // 6
console.log(sum(1, 2, 3, 4, 5)); // 15
\`\`\`

## Return Values

Functions can give back a value using the \`return\` keyword. Once \`return\` is hit, the function stops executing.

\`\`\`js
function calculateBMI(weight, height) {
  if (height <= 0) {
    return null; // early return for invalid input
  }
  const bmi = weight / (height * height);
  return bmi.toFixed(2); // returns the result
}

const result = calculateBMI(70, 1.75);
console.log(result); // "22.86"

// Functions without return give back undefined
function logMessage(msg) {
  console.log(msg);
  // no return statement
}
const val = logMessage("hello"); // prints "hello"
console.log(val);                // undefined
\`\`\`

## Understanding Scope

Scope determines where variables can be accessed in your code. JavaScript has three types of scope:

\`\`\`js
// 1. Global Scope — accessible everywhere
const appName = "PUGI";

function showApp() {
  console.log(appName); // ✅ accessible here
}
console.log(appName);   // ✅ accessible here

// 2. Function Scope — only accessible inside the function
function calculateTotal() {
  const tax = 0.075; // only exists inside this function
  const price = 100;
  return price + (price * tax);
}
console.log(tax); // ❌ ReferenceError: tax is not defined

// 3. Block Scope — only accessible inside the block {}
if (true) {
  let blockVar = "I'm in a block";
  const alsoBlock = "me too";
  var notBlock = "I leak out!"; // var ignores block scope!
}
console.log(notBlock);  // ✅ "I leak out!" — var is function scoped
console.log(blockVar);  // ❌ ReferenceError
console.log(alsoBlock); // ❌ ReferenceError
\`\`\`

## Closures — Functions Remembering Their Scope

A closure is when a function remembers variables from its outer scope even after the outer function has finished executing. This is one of JavaScript's most powerful features.

\`\`\`js
function makeCounter() {
  let count = 0; // this variable is "closed over"

  return function() {
    count++;
    return count;
  };
}

const counter = makeCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3

// Each call to makeCounter creates a separate counter
const counter2 = makeCounter();
console.log(counter2()); // 1 — starts fresh!
console.log(counter());  // 4 — continues from before
\`\`\`

## Higher Order Functions

Functions that take other functions as arguments or return functions are called higher order functions. They are extremely common in modern JavaScript.

\`\`\`js
// Function that takes a function as argument
function applyTwice(fn, value) {
  return fn(fn(value));
}

const double = n => n * 2;
console.log(applyTwice(double, 3)); // 12 (3 → 6 → 12)

// The most useful built-in higher order functions
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// map — transform each element
const doubled = numbers.map(n => n * 2);
console.log(doubled); // [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]

// filter — keep elements that pass a test
const evens = numbers.filter(n => n % 2 === 0);
console.log(evens); // [2, 4, 6, 8, 10]

// reduce — combine all elements into one value
const total = numbers.reduce((sum, n) => sum + n, 0);
console.log(total); // 55

// Chaining them together
const sumOfDoubledEvens = numbers
  .filter(n => n % 2 === 0)   // [2, 4, 6, 8, 10]
  .map(n => n * 2)             // [4, 8, 12, 16, 20]
  .reduce((sum, n) => sum + n, 0); // 60
console.log(sumOfDoubledEvens); // 60
\`\`\`

## Common Mistakes

\`\`\`js
// ❌ Mistake 1: Forgetting to return
function addNumbers(a, b) {
  a + b; // calculated but not returned!
}
console.log(addNumbers(2, 3)); // undefined

// ✅ Fix:
function addNumbers(a, b) {
  return a + b;
}

// ❌ Mistake 2: this inside arrow functions
const obj = {
  name: "PUGI",
  greet: () => {
    console.log(\`Hello from \${this.name}\`); // this is undefined!
  }
};
// ✅ Fix: use regular function for methods
const obj2 = {
  name: "PUGI",
  greet: function() {
    console.log(\`Hello from \${this.name}\`); // "Hello from PUGI"
  }
};

// ❌ Mistake 3: Calling a function before declaring it (with function expressions)
console.log(myFunc()); // ❌ TypeError: myFunc is not a function
const myFunc = () => "hello";

// ✅ Function declarations ARE hoisted
console.log(myFunc2()); // ✅ works fine
function myFunc2() { return "hello"; }
\`\`\`

## Real World Example — Form Validation

\`\`\`js
// Reusable validation functions
const isValidEmail = (email) => {
  return email.includes("@") && email.includes(".");
};

const isStrongPassword = (password) => {
  return password.length >= 8 &&
    /[A-Z]/.test(password) &&  // has uppercase
    /[0-9]/.test(password);    // has number
};

const isValidName = (name) => {
  return name.trim().length >= 2;
};

// Combine them in a main validation function
function validateRegistration(name, email, password) {
  const errors = [];

  if (!isValidName(name)) {
    errors.push("Name must be at least 2 characters");
  }
  if (!isValidEmail(email)) {
    errors.push("Please enter a valid email address");
  }
  if (!isStrongPassword(password)) {
    errors.push("Password must be 8+ chars with uppercase and number");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

const result = validateRegistration("Ab", "notanemail", "weak");
console.log(result);
// { isValid: false, errors: ["Name must be...", "Please enter...", "Password must be..."] }
\`\`\`

## Pro Tips

1. **Keep functions small** — each function should do ONE thing
2. **Name functions with verbs** — \`getUserData()\`, \`calculateTotal()\`, \`validateEmail()\`
3. **Pure functions are best** — same input always gives same output, no side effects
4. **Arrow functions for callbacks**, regular functions for methods

## Quick Summary

- Functions let you write code once and reuse it many times
- Three ways to declare: function declaration, function expression, arrow function
- Parameters are placeholders, arguments are the actual values passed
- Scope determines where variables can be accessed
- Closures let functions remember variables from their outer scope
- Higher order functions (map, filter, reduce) are essential in modern JS`,
  }
};

async function seedContent() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('pugi');

  for (const [courseTitle, lessons] of Object.entries(content)) {
    const course = await db.collection('courses').findOne({ title: courseTitle });
    if (!course) { console.log(`Course not found: ${courseTitle}`); continue; }

    const updatedModules = course.modules.map((mod) => ({
      ...mod,
      lessons: mod.lessons.map((lesson) => {
        const newContent = lessons[lesson.title];
        if (newContent) {
          console.log(`✅ Updated: ${lesson.title}`);
          return { ...lesson, content: newContent };
        }
        return lesson;
      })
    }));

    await db.collection('courses').updateOne(
      { title: courseTitle },
      { $set: { modules: updatedModules } }
    );
  }

  await client.close();
  console.log('\n🎉 Done!');
}

seedContent().catch(console.error);
