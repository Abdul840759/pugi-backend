import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User';
import { Course } from './models/Course';
import { Enrollment, UserProgress } from './models/Enrollment';
import { Certificate } from './models/Certificate';
import { QuizAttempt } from './models/QuizAttempt';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pugi';
const PASSWORD = 'password123';

// ─── REAL COURSE DATA ────────────────────────────────────────────────────────

const courses = [
  // ── 1. JavaScript Fundamentals ───────────────────────────────────────────
  {
    title: 'JavaScript Fundamentals',
    description: 'Master the core building blocks of JavaScript — variables, functions, arrays, objects, and the event loop — through real code you can run immediately.',
    thumbnail: 'https://placehold.co/600x340/f7df1e/222?text=JavaScript',
    category: 'Frontend',
    level: 'beginner',
    duration: '10 hours',
    rating: 4.8,
    status: 'published',
    modules: [
      {
        title: 'Getting Started with JavaScript',
        order: 0,
        lessons: [
          {
            title: 'What is JavaScript?',
            duration: '10 min',
            type: 'content',
            order: 0,
            content: `# What is JavaScript?

JavaScript is the programming language of the web. It runs directly in your browser and lets you make web pages interactive — responding to clicks, fetching data, updating the UI without reloading.

## Where JavaScript runs

- **Browser** — every modern browser has a JS engine (Chrome uses V8, Firefox uses SpiderMonkey)
- **Server** — Node.js lets you run JS on a server
- **Mobile** — React Native uses JS to build iOS and Android apps

## Your first program

Open your browser console (F12 → Console tab) and type:

\`\`\`js
console.log("Hello, world!");
\`\`\`

You should see \`Hello, world!\` printed immediately.

## Variables

JavaScript has three ways to declare variables:

\`\`\`js
var oldWay = "avoid this";   // function-scoped, hoisted — legacy
let name = "Amara";          // block-scoped, can be reassigned
const PI = 3.14159;          // block-scoped, cannot be reassigned

name = "David";   // ✅ fine
PI = 3;           // ❌ TypeError
\`\`\`

Always prefer \`const\` by default. Use \`let\` only when you know the value will change.

## Data types

\`\`\`js
const text    = "Hello";          // string
const count   = 42;               // number
const price   = 9.99;             // number (no separate float type)
const active  = true;             // boolean
const nothing = null;             // intentional empty value
let   future;                     // undefined — not yet assigned
const user    = { name: "Leah" }; // object
const scores  = [95, 87, 100];    // array (also an object)
\`\`\`

Use \`typeof\` to inspect a value's type:

\`\`\`js
console.log(typeof "hello"); // "string"
console.log(typeof 42);      // "number"
console.log(typeof true);    // "boolean"
console.log(typeof null);    // "object"  ← famous JS quirk
\`\`\``,
            codeExample: `// Try these in your browser console
const name = "PUGI";
const year = 2024;
const isAwesome = true;

console.log(\`\${name} launched in \${year}. Awesome: \${isAwesome}\`);
// Output: PUGI launched in 2024. Awesome: true

// Check types
console.log(typeof name);        // string
console.log(typeof year);        // number
console.log(typeof isAwesome);   // boolean`,
          },
          {
            title: 'Functions and Scope',
            duration: '18 min',
            type: 'content',
            order: 1,
            content: `# Functions and Scope

Functions let you package reusable logic. JavaScript has several ways to write them.

## Function declaration

\`\`\`js
function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("Amara")); // Hello, Amara!
\`\`\`

Function declarations are **hoisted** — you can call them before they appear in your file.

## Function expression

\`\`\`js
const add = function(a, b) {
  return a + b;
};

console.log(add(3, 4)); // 7
\`\`\`

## Arrow functions (ES6+)

The most common modern syntax:

\`\`\`js
const multiply = (a, b) => a * b;

const square = n => n * n;   // parentheses optional for single param

const greet = (name) => {
  const msg = "Hi, " + name;
  return msg;
};
\`\`\`

## Default parameters

\`\`\`js
function greet(name = "friend") {
  return \`Hello, \${name}!\`;
}

greet();        // Hello, friend!
greet("Leah"); // Hello, Leah!
\`\`\`

## Scope

\`\`\`js
const global = "I'm everywhere";

function outer() {
  const outerVar = "I'm in outer";

  function inner() {
    const innerVar = "I'm only in inner";
    console.log(global);   // ✅
    console.log(outerVar); // ✅ — closure
    console.log(innerVar); // ✅
  }

  inner();
  console.log(innerVar); // ❌ ReferenceError
}
\`\`\`

Inner functions can access variables from outer functions. This is called a **closure**.`,
            codeExample: `// Function that returns a counter (closure example)
function makeCounter(start = 0) {
  let count = start;

  return {
    increment: () => ++count,
    decrement: () => --count,
    value: () => count,
  };
}

const counter = makeCounter(10);
console.log(counter.increment()); // 11
console.log(counter.increment()); // 12
console.log(counter.decrement()); // 11
console.log(counter.value());     // 11`,
          },
        ],
        quiz: {
          title: 'JavaScript Basics Quiz',
          passingScore: 70,
          maxAttempts: 3,
          questions: [
            {
              prompt: 'Which keyword declares a variable that CANNOT be reassigned?',
              options: ['var', 'let', 'const', 'static'],
              correctOptionIndex: 2,
              explanation: '`const` prevents reassignment. `let` and `var` allow it.',
              points: 1,
            },
            {
              prompt: 'What does `typeof null` return in JavaScript?',
              options: ['"null"', '"undefined"', '"object"', '"boolean"'],
              correctOptionIndex: 2,
              explanation: 'This is a well-known JavaScript quirk — `typeof null` returns "object".',
              points: 1,
            },
            {
              prompt: 'Which is the correct arrow function syntax?',
              options: [
                'const f = (x) => { x * 2 }',
                'const f = (x) => x * 2',
                'const f => (x) => x * 2',
                'function f = (x) => x * 2',
              ],
              correctOptionIndex: 1,
              explanation: 'Arrow functions with a single expression can omit braces and the return keyword.',
              points: 1,
            },
          ],
        },
      },
      {
        title: 'Arrays and Objects',
        order: 1,
        lessons: [
          {
            title: 'Working with Arrays',
            duration: '20 min',
            type: 'content',
            order: 0,
            content: `# Working with Arrays

Arrays store ordered lists of values. JavaScript arrays are zero-indexed and can hold any mix of types.

## Creating arrays

\`\`\`js
const fruits = ["apple", "banana", "mango"];
const mixed  = [1, "two", true, null, { x: 3 }];
const empty  = [];
\`\`\`

## Reading and modifying

\`\`\`js
console.log(fruits[0]);   // "apple"
console.log(fruits[2]);   // "mango"
console.log(fruits.length); // 3

fruits[1] = "orange";     // replace banana
fruits.push("grape");     // add to end
fruits.pop();             // remove from end → returns "grape"
fruits.unshift("kiwi");   // add to start
fruits.shift();           // remove from start → returns "kiwi"
\`\`\`

## Iterating

\`\`\`js
// for...of — cleanest for simple iteration
for (const fruit of fruits) {
  console.log(fruit);
}

// forEach — when you need the index
fruits.forEach((fruit, index) => {
  console.log(index, fruit);
});
\`\`\`

## Transforming arrays

\`\`\`js
const numbers = [1, 2, 3, 4, 5];

// map — transform every element
const doubled = numbers.map(n => n * 2);
// [2, 4, 6, 8, 10]

// filter — keep elements that pass a test
const evens = numbers.filter(n => n % 2 === 0);
// [2, 4]

// reduce — collapse to a single value
const sum = numbers.reduce((total, n) => total + n, 0);
// 15

// find — first match
const firstBig = numbers.find(n => n > 3);
// 4

// some / every
numbers.some(n => n > 4);  // true
numbers.every(n => n > 0); // true
\`\`\`

## Spread and destructuring

\`\`\`js
const a = [1, 2, 3];
const b = [4, 5, 6];
const combined = [...a, ...b]; // [1,2,3,4,5,6]

const [first, second, ...rest] = combined;
console.log(first);  // 1
console.log(second); // 2
console.log(rest);   // [3,4,5,6]
\`\`\``,
            codeExample: `const students = [
  { name: "Amara", score: 92 },
  { name: "David", score: 78 },
  { name: "Leah",  score: 85 },
  { name: "Victor", score: 61 },
];

// Who passed? (score >= 70)
const passed = students.filter(s => s.score >= 70);
console.log(passed.map(s => s.name));
// ["Amara", "David", "Leah"]

// Average score
const avg = students.reduce((sum, s) => sum + s.score, 0) / students.length;
console.log(\`Average: \${avg.toFixed(1)}\`);
// Average: 79.0

// Sort by score descending
const ranked = [...students].sort((a, b) => b.score - a.score);
ranked.forEach((s, i) => console.log(\`\${i + 1}. \${s.name} — \${s.score}\`));`,
          },
          {
            title: 'Objects and Destructuring',
            duration: '18 min',
            type: 'content',
            order: 1,
            content: `# Objects and Destructuring

Objects store key-value pairs and are the foundation of almost everything in JavaScript.

## Creating objects

\`\`\`js
const user = {
  name: "Amara",
  age: 27,
  email: "amara@example.com",
  isActive: true,
};
\`\`\`

## Reading and writing

\`\`\`js
console.log(user.name);       // dot notation
console.log(user["email"]);   // bracket notation (useful for dynamic keys)

user.age = 28;                // update
user.country = "Nigeria";     // add new property
delete user.isActive;         // remove
\`\`\`

## Methods

\`\`\`js
const counter = {
  value: 0,
  increment() { this.value++; },
  reset()     { this.value = 0; },
};

counter.increment();
counter.increment();
console.log(counter.value); // 2
\`\`\`

## Destructuring

\`\`\`js
const { name, age, country = "Unknown" } = user;
console.log(name);    // "Amara"
console.log(country); // "Nigeria" (or "Unknown" if missing)

// Rename while destructuring
const { name: userName } = user;
console.log(userName); // "Amara"
\`\`\`

## Spread operator

\`\`\`js
const base = { theme: "dark", lang: "en" };
const extended = { ...base, fontSize: 16 };
// { theme: "dark", lang: "en", fontSize: 16 }

// Update without mutation
const updated = { ...user, age: 29 };
\`\`\`

## Object methods

\`\`\`js
const config = { host: "localhost", port: 3000, debug: true };

Object.keys(config);    // ["host", "port", "debug"]
Object.values(config);  // ["localhost", 3000, true]
Object.entries(config); // [["host","localhost"], ["port",3000], ...]

// Build object from entries
const doubled = Object.fromEntries(
  Object.entries({ a: 1, b: 2 }).map(([k, v]) => [k, v * 2])
);
// { a: 2, b: 4 }
\`\`\``,
            codeExample: `function createUser({ name, email, role = "learner" } = {}) {
  return {
    id: Math.random().toString(36).slice(2),
    name,
    email,
    role,
    createdAt: new Date().toISOString(),
    toString() {
      return \`[\${this.role}] \${this.name} <\${this.email}>\`;
    },
  };
}

const user = createUser({ name: "Leah", email: "leah@pugi.com", role: "tutor" });
console.log(user.toString());
// [tutor] Leah <leah@pugi.com>

// Non-destructive update
const promoted = { ...user, role: "admin" };
console.log(promoted.role); // admin
console.log(user.role);     // tutor — unchanged`,
          },
        ],
        quiz: {
          title: 'Arrays & Objects Quiz',
          passingScore: 70,
          maxAttempts: 3,
          questions: [
            {
              prompt: 'Which array method returns a NEW array with transformed elements?',
              options: ['forEach', 'filter', 'map', 'reduce'],
              correctOptionIndex: 2,
              explanation: '`map` returns a new array of the same length with each element transformed.',
              points: 1,
            },
            {
              prompt: 'What does `const { x = 5 } = {}` do?',
              options: [
                'Throws an error because x is missing',
                'Sets x to undefined',
                'Sets x to 5 using the default value',
                'Sets x to null',
              ],
              correctOptionIndex: 2,
              explanation: 'Destructuring supports default values with `=` when the property is undefined.',
              points: 1,
            },
          ],
        },
      },
      {
        title: 'Async JavaScript',
        order: 2,
        lessons: [
          {
            title: 'Promises and Async/Await',
            duration: '25 min',
            type: 'content',
            order: 0,
            content: `# Promises and Async/Await

JavaScript is single-threaded but handles async work — like network requests — without blocking.

## The problem with synchronous blocking

\`\`\`js
// Imagine this takes 3 seconds:
const data = fetchFromServer(); // would FREEZE the browser
console.log(data);
\`\`\`

## Callbacks (the old way)

\`\`\`js
setTimeout(() => {
  console.log("Done after 1 second");
}, 1000);

// Callback hell:
getUser(id, (user) => {
  getPosts(user.id, (posts) => {
    getComments(posts[0].id, (comments) => {
      // deeply nested nightmare...
    });
  });
});
\`\`\`

## Promises

A Promise represents a value that will be available in the future.

\`\`\`js
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    const success = true;
    if (success) resolve("Data loaded!");
    else reject(new Error("Something went wrong"));
  }, 1000);
});

promise
  .then(data => console.log(data))     // "Data loaded!"
  .catch(err => console.error(err));
\`\`\`

## Promise chaining

\`\`\`js
fetch("/api/user/1")
  .then(res => res.json())
  .then(user => fetch(\`/api/posts?userId=\${user.id}\`))
  .then(res => res.json())
  .then(posts => console.log(posts))
  .catch(err => console.error(err));
\`\`\`

## Async/Await (ES2017+)

Async/await is syntactic sugar over promises — same thing, cleaner syntax:

\`\`\`js
async function loadUserPosts(userId) {
  try {
    const userRes = await fetch(\`/api/user/\${userId}\`);
    const user    = await userRes.json();

    const postsRes = await fetch(\`/api/posts?userId=\${user.id}\`);
    const posts    = await postsRes.json();

    return posts;
  } catch (err) {
    console.error("Failed:", err);
    throw err;
  }
}
\`\`\`

## Promise.all — parallel requests

\`\`\`js
async function loadDashboard(userId) {
  const [user, posts, notifications] = await Promise.all([
    fetch(\`/api/users/\${userId}\`).then(r => r.json()),
    fetch(\`/api/posts?user=\${userId}\`).then(r => r.json()),
    fetch(\`/api/notifications\`).then(r => r.json()),
  ]);

  return { user, posts, notifications };
}
\`\`\`

\`Promise.all\` runs all three requests **at the same time** instead of one after another.`,
            codeExample: `// Simulate an API call with a Promise
function fakeApi(endpoint, delayMs = 500) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (endpoint.includes("error")) {
        reject(new Error(\`404: \${endpoint} not found\`));
      } else {
        resolve({ endpoint, data: \`response from \${endpoint}\`, ts: Date.now() });
      }
    }, delayMs);
  });
}

async function main() {
  console.log("Fetching...");

  try {
    // Sequential
    const user  = await fakeApi("/api/user/1");
    const posts = await fakeApi("/api/posts");
    console.log("Sequential:", user.data, posts.data);

    // Parallel (faster!)
    const [a, b] = await Promise.all([
      fakeApi("/api/courses"),
      fakeApi("/api/progress"),
    ]);
    console.log("Parallel:", a.data, b.data);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();`,
          },
        ],
        quiz: {
          title: 'Async JavaScript Quiz',
          passingScore: 70,
          maxAttempts: 3,
          questions: [
            {
              prompt: 'What does `await` do inside an async function?',
              options: [
                'Blocks the entire JavaScript engine',
                'Pauses the function until the Promise resolves, without blocking other code',
                'Creates a new thread',
                'Converts a callback to a Promise',
              ],
              correctOptionIndex: 1,
              explanation: '`await` pauses only the current async function, not the whole runtime.',
              points: 1,
            },
            {
              prompt: 'Which method runs multiple Promises at the same time and waits for ALL of them?',
              options: ['Promise.race', 'Promise.any', 'Promise.all', 'Promise.resolve'],
              correctOptionIndex: 2,
              explanation: '`Promise.all` resolves when every promise resolves, or rejects if any one fails.',
              points: 1,
            },
          ],
        },
      },
    ],
  },

  // ── 2. React Foundations ─────────────────────────────────────────────────
  {
    title: 'React Foundations',
    description: 'Build your first React apps using components, props, state, and hooks. Learn how to think in React and ship real UIs.',
    thumbnail: 'https://placehold.co/600x340/61dafb/222?text=React',
    category: 'Frontend',
    level: 'beginner',
    duration: '12 hours',
    rating: 4.9,
    status: 'published',
    modules: [
      {
        title: 'Components and JSX',
        order: 0,
        lessons: [
          {
            title: 'Thinking in Components',
            duration: '15 min',
            type: 'content',
            order: 0,
            content: `# Thinking in Components

React builds UIs from **components** — self-contained pieces of UI that can be reused anywhere.

## What is a component?

A component is a JavaScript function that returns JSX (HTML-like syntax that React converts to real DOM nodes).

\`\`\`jsx
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}

// Use it like an HTML tag
<Greeting name="Amara" />
\`\`\`

## JSX rules

\`\`\`jsx
// 1. Return one root element (or use a Fragment)
function Card() {
  return (
    <>
      <h2>Title</h2>
      <p>Body text</p>
    </>
  );
}

// 2. Use className instead of class
<div className="card">...</div>

// 3. Close every tag
<img src="/logo.png" alt="Logo" />
<input type="text" />

// 4. Expressions go in curly braces
const price = 29.99;
<p>Price: \${price.toFixed(2)}</p>

// 5. Styles use camelCase
<div style={{ backgroundColor: "blue", fontSize: 16 }}>...</div>
\`\`\`

## Props

Props are inputs to a component — like function parameters:

\`\`\`jsx
function Badge({ text, color = "blue" }) {
  return (
    <span style={{ background: color, color: "white", padding: "4px 8px", borderRadius: 4 }}>
      {text}
    </span>
  );
}

<Badge text="Admin" color="red" />
<Badge text="Learner" />  // uses default color
\`\`\`

## Component composition

Build complex UIs from simple pieces:

\`\`\`jsx
function Avatar({ src, name }) {
  return <img src={src} alt={name} className="avatar" />;
}

function UserCard({ user }) {
  return (
    <div className="card">
      <Avatar src={user.avatar} name={user.name} />
      <h3>{user.name}</h3>
      <p>{user.role}</p>
    </div>
  );
}

function UserList({ users }) {
  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
\`\`\``,
            codeExample: `// A complete mini profile card
function ProfileCard({ name, role, xp, avatar }) {
  const level = Math.floor(xp / 500) + 1;

  return (
    <div style={{
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: 20,
      maxWidth: 280,
      fontFamily: "sans-serif"
    }}>
      <img
        src={avatar || \`https://api.dicebear.com/7.x/initials/svg?seed=\${name}\`}
        alt={name}
        style={{ width: 64, height: 64, borderRadius: "50%" }}
      />
      <h2 style={{ margin: "8px 0 4px" }}>{name}</h2>
      <p style={{ color: "#6b7280", margin: 0 }}>{role}</p>
      <p style={{ color: "#3b82f6", fontWeight: 600 }}>
        Level {level} · {xp} XP
      </p>
    </div>
  );
}`,
          },
          {
            title: 'State with useState',
            duration: '22 min',
            type: 'content',
            order: 1,
            content: `# State with useState

State is data that changes over time and causes the component to re-render when it does.

## Basic state

\`\`\`jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
\`\`\`

## State is immutable — never mutate directly

\`\`\`jsx
// ❌ WRONG — React won't re-render
const [user, setUser] = useState({ name: "Amara", age: 27 });
user.age = 28; // direct mutation — invisible to React

// ✅ CORRECT — create a new object
setUser({ ...user, age: 28 });
\`\`\`

## Array state

\`\`\`jsx
const [items, setItems] = useState(["React", "TypeScript"]);

// Add
setItems([...items, "Tailwind"]);

// Remove
setItems(items.filter(item => item !== "TypeScript"));

// Update
setItems(items.map(item => item === "React" ? "React 19" : item));
\`\`\`

## Functional updates

When new state depends on old state, use the function form:

\`\`\`jsx
// ❌ Can cause stale state bugs:
setCount(count + 1);

// ✅ Always safe:
setCount(prev => prev + 1);
\`\`\`

## Controlled inputs

\`\`\`jsx
function SearchBox() {
  const [query, setQuery] = useState("");

  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search courses..."
      />
      <p>Searching for: {query}</p>
    </div>
  );
}
\`\`\``,
            codeExample: `import { useState } from "react";

function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: "Learn React", done: false },
    { id: 2, text: "Build a project", done: false },
  ]);
  const [input, setInput] = useState("");

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos(prev => [...prev, { id: Date.now(), text: input.trim(), done: false }]);
    setInput("");
  };

  const toggle = (id) =>
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const remove = (id) =>
    setTodos(prev => prev.filter(t => t.id !== id));

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
               onKeyDown={e => e.key === "Enter" && addTodo()} />
        <button onClick={addTodo}>Add</button>
      </div>
      {todos.map(todo => (
        <div key={todo.id} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
          <input type="checkbox" checked={todo.done} onChange={() => toggle(todo.id)} />
          <span style={{ textDecoration: todo.done ? "line-through" : "none" }}>
            {todo.text}
          </span>
          <button onClick={() => remove(todo.id)}>✕</button>
        </div>
      ))}
      <p>{todos.filter(t => t.done).length}/{todos.length} done</p>
    </div>
  );
}`,
          },
        ],
        quiz: {
          title: 'React Basics Quiz',
          passingScore: 70,
          maxAttempts: 3,
          questions: [
            {
              prompt: 'What hook do you use to add state to a functional component?',
              options: ['useEffect', 'useContext', 'useState', 'useRef'],
              correctOptionIndex: 2,
              explanation: '`useState` returns a state value and a setter function.',
              points: 1,
            },
            {
              prompt: 'How should you update an array stored in state?',
              options: [
                'Push directly: state.push(item)',
                'Create a new array: setItems([...items, item])',
                'Use state.concat and reassign',
                'Mutate and call forceUpdate()',
              ],
              correctOptionIndex: 1,
              explanation: 'React state must be treated as immutable. Always create a new array.',
              points: 1,
            },
            {
              prompt: 'What attribute replaces `class` in JSX?',
              options: ['class', 'className', 'classList', 'htmlClass'],
              correctOptionIndex: 1,
              explanation: 'JSX uses `className` because `class` is a reserved word in JavaScript.',
              points: 1,
            },
          ],
        },
      },
      {
        title: 'Hooks Deep Dive',
        order: 1,
        lessons: [
          {
            title: 'useEffect and Data Fetching',
            duration: '25 min',
            type: 'content',
            order: 0,
            content: `# useEffect and Data Fetching

\`useEffect\` lets you synchronize a component with an external system — like an API, a timer, or the browser DOM.

## Basic syntax

\`\`\`jsx
import { useEffect } from "react";

useEffect(() => {
  // side effect runs here
  return () => {
    // cleanup (optional) — runs before next effect or on unmount
  };
}, [dependencies]);
\`\`\`

## The dependency array

\`\`\`jsx
useEffect(() => { /* runs on every render */ });
useEffect(() => { /* runs once on mount */ }, []);
useEffect(() => { /* runs when userId changes */ }, [userId]);
\`\`\`

## Fetching data

\`\`\`jsx
import { useState, useEffect } from "react";

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res  = await fetch("/api/courses");
        const data = await res.json();
        if (!cancelled) setCourses(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; }; // prevent stale updates
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error)   return <p>Error: {error}</p>;

  return (
    <ul>
      {courses.map(c => <li key={c._id}>{c.title}</li>)}
    </ul>
  );
}
\`\`\`

## Other common useEffect patterns

\`\`\`jsx
// Document title
useEffect(() => {
  document.title = \`\${course.title} — PUGI\`;
}, [course.title]);

// Event listener
useEffect(() => {
  const handler = (e) => console.log(e.key);
  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, []);

// Interval
useEffect(() => {
  const id = setInterval(() => setTick(t => t + 1), 1000);
  return () => clearInterval(id);
}, []);
\`\`\``,
            codeExample: `import { useState, useEffect } from "react";

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function SearchCourses() {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery        = useDebounce(query, 400);

  useEffect(() => {
    if (!debouncedQuery) { setResults([]); return; }
    setLoading(true);
    fetch(\`/api/courses?search=\${debouncedQuery}\`)
      .then(r => r.json())
      .then(data => { setResults(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [debouncedQuery]);

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)}
             placeholder="Search courses..." />
      {loading && <p>Searching...</p>}
      {results.map(c => <p key={c._id}>{c.title}</p>)}
    </div>
  );
}`,
          },
        ],
        quiz: {
          title: 'Hooks Quiz',
          passingScore: 70,
          maxAttempts: 3,
          questions: [
            {
              prompt: 'When does `useEffect(() => { ... }, [])` run?',
              options: [
                'On every render',
                'Only when state changes',
                'Once after the first render (mount)',
                'Before the component renders',
              ],
              correctOptionIndex: 2,
              explanation: 'An empty dependency array means the effect runs once after mount.',
              points: 1,
            },
            {
              prompt: 'Why do we return a cleanup function from useEffect?',
              options: [
                'To update state after the effect',
                'To cancel subscriptions, timers, or listeners before the next effect or unmount',
                'To fetch data',
                'It is required by React — every effect must return one',
              ],
              correctOptionIndex: 1,
              explanation: 'Cleanup prevents memory leaks and stale updates from effects that are no longer relevant.',
              points: 1,
            },
          ],
        },
      },
    ],
  },

  // ── 3. Node.js & Express API ─────────────────────────────────────────────
  {
    title: 'Node.js & Express API Development',
    description: 'Build production-grade REST APIs with Node.js, Express, and TypeScript. Cover routing, middleware, auth, validation, and MongoDB.',
    thumbnail: 'https://placehold.co/600x340/339933/fff?text=Node.js',
    category: 'Backend',
    level: 'intermediate',
    duration: '14 hours',
    rating: 4.7,
    status: 'published',
    modules: [
      {
        title: 'Express Fundamentals',
        order: 0,
        lessons: [
          {
            title: 'Setting Up an Express Server',
            duration: '20 min',
            type: 'content',
            order: 0,
            content: `# Setting Up an Express Server

Express is a minimal, fast web framework for Node.js. It handles routing, middleware, and request/response management.

## Project setup

\`\`\`bash
mkdir my-api && cd my-api
npm init -y
npm install express cors dotenv
npm install -D typescript ts-node-dev @types/express @types/cors @types/node
npx tsc --init
\`\`\`

## Your first server

\`\`\`ts
// src/index.ts
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());       // parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "API is running", timestamp: new Date() });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: \`Route \${req.path} not found\` });
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});
\`\`\`

## Routing

\`\`\`ts
// src/routes/users.ts
import { Router } from "express";

const router = Router();

router.get("/",      getAllUsers);
router.get("/:id",   getUserById);
router.post("/",     createUser);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;

// In index.ts:
import userRoutes from "./routes/users";
app.use("/api/users", userRoutes);
\`\`\`

## Request object

\`\`\`ts
app.get("/api/courses", (req, res) => {
  // Query params: /api/courses?category=Frontend&level=beginner
  const { category, level } = req.query;

  // URL params: /api/courses/:id
  const { id } = req.params;

  // Body (POST/PATCH): { title, description }
  const { title } = req.body;

  // Headers
  const token = req.headers.authorization;
});
\`\`\``,
            codeExample: `import express, { Request, Response, NextFunction } from "express";

const app = express();
app.use(express.json());

// In-memory store (replace with DB in production)
let courses: any[] = [
  { id: "1", title: "React Foundations", category: "Frontend" },
  { id: "2", title: "Node.js API",       category: "Backend"  },
];

// GET all with optional filter
app.get("/api/courses", (req: Request, res: Response) => {
  const { category } = req.query;
  const result = category
    ? courses.filter(c => c.category === category)
    : courses;
  res.json(result);
});

// GET one
app.get("/api/courses/:id", (req: Request, res: Response) => {
  const course = courses.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ message: "Not found" });
  res.json(course);
});

// POST create
app.post("/api/courses", (req: Request, res: Response) => {
  const { title, category } = req.body;
  if (!title) return res.status(400).json({ message: "Title required" });
  const course = { id: String(Date.now()), title, category };
  courses.push(course);
  res.status(201).json(course);
});

app.listen(3001, () => console.log("Running on :3001"));`,
          },
          {
            title: 'Middleware and Error Handling',
            duration: '22 min',
            type: 'content',
            order: 1,
            content: `# Middleware and Error Handling

Middleware functions run between the request arriving and the response being sent. They are the backbone of Express.

## What middleware does

\`\`\`ts
// A middleware has access to req, res, and next
function logger(req, res, next) {
  console.log(\`\${req.method} \${req.path} — \${new Date().toISOString()}\`);
  next(); // MUST call next() or the request hangs
}

app.use(logger); // applies to all routes
\`\`\`

## Auth middleware

\`\`\`ts
import jwt from "jsonwebtoken";

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = payload as any;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Use on protected routes:
app.get("/api/me", authenticate, (req: AuthRequest, res) => {
  res.json(req.user);
});
\`\`\`

## Error handling middleware

\`\`\`ts
// Must have 4 parameters — Express identifies it as error middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);

  const status  = err.status  || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({ message, ...(process.env.NODE_ENV === "development" && { stack: err.stack }) });
});

// Trigger it with next(err):
app.get("/risky", (req, res, next) => {
  try {
    throw new Error("Something broke");
  } catch (err) {
    next(err);
  }
});
\`\`\`

## Async error wrapper

\`\`\`ts
// Without this, async errors crash your server silently
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

app.get("/api/courses", asyncHandler(async (req, res) => {
  const courses = await Course.find(); // if this throws, next(err) is called
  res.json(courses);
}));
\`\`\``,
            codeExample: `import { Request, Response, NextFunction } from "express";

// Rate limiter middleware (simple in-memory version)
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(maxRequests = 100, windowMs = 60_000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip  = req.ip || "unknown";
    const now = Date.now();
    const entry = requestCounts.get(ip);

    if (!entry || now > entry.resetAt) {
      requestCounts.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= maxRequests) {
      return res.status(429).json({
        message: "Too many requests",
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      });
    }

    entry.count++;
    next();
  };
}

// Use it:
// app.use("/api", rateLimit(100, 60_000));`,
          },
        ],
        quiz: {
          title: 'Express Fundamentals Quiz',
          passingScore: 70,
          maxAttempts: 3,
          questions: [
            {
              prompt: 'What must every middleware function do to pass control to the next handler?',
              options: ['Return true', 'Call res.send()', 'Call next()', 'Throw an error'],
              correctOptionIndex: 2,
              explanation: 'Without calling `next()`, the request hangs indefinitely.',
              points: 1,
            },
            {
              prompt: 'How many parameters does Express error-handling middleware take?',
              options: ['2 (err, res)', '3 (err, req, res)', '4 (err, req, res, next)', '1 (err)'],
              correctOptionIndex: 2,
              explanation: 'Error middleware must have exactly 4 parameters so Express recognises it as an error handler.',
              points: 1,
            },
            {
              prompt: 'Which HTTP status code means "resource not found"?',
              options: ['400', '401', '403', '404'],
              correctOptionIndex: 3,
              explanation: '404 Not Found is returned when the requested resource does not exist.',
              points: 1,
            },
          ],
        },
      },
      {
        title: 'Authentication with JWT',
        order: 1,
        lessons: [
          {
            title: 'JWT Auth from Scratch',
            duration: '30 min',
            type: 'content',
            order: 0,
            content: `# JWT Auth from Scratch

JSON Web Tokens (JWT) are a compact, self-contained way to transmit identity information between a client and server.

## How JWT auth works

\`\`\`
1. User POSTs /api/auth/login with email + password
2. Server verifies credentials
3. Server signs a JWT and sends it back
4. Client stores the token and sends it in every future request
5. Server verifies the token on protected routes
\`\`\`

## JWT structure

A JWT has three base64-encoded parts separated by dots:

\`\`\`
header.payload.signature

eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEyMyIsInJvbGUiOiJsZWFybmVyIn0.abc123
\`\`\`

## Creating tokens

\`\`\`ts
import jwt from "jsonwebtoken";

function signTokens(userId: string, role: string) {
  const access = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" }
  );

  const refresh = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" }
  );

  return { access, refresh };
}
\`\`\`

## Login route

\`\`\`ts
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });

  const { access, refresh } = signTokens(user.id, user.role);

  // Store refresh token hash in DB for rotation
  user.refreshToken = refresh;
  await user.save();

  res.json({ accessToken: access, refreshToken: refresh, user: { id: user.id, name: user.name, role: user.role } });
});
\`\`\`

## Register route

\`\`\`ts
router.post("/register", async (req, res) => {
  const { name, email, password, role = "learner" } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email already registered" });

  const hashed = await bcrypt.hash(password, 12);
  const user   = await User.create({ name, email, password: hashed, role });

  const { access, refresh } = signTokens(user.id, user.role);
  res.status(201).json({ accessToken: access, refreshToken: refresh });
});
\`\`\``,
            codeExample: `import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const SECRET = "dev_secret_change_in_production";

// Hash a password
async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12);
}

// Verify a password
async function checkPassword(plain: string, hashed: string) {
  return bcrypt.compare(plain, hashed);
}

// Sign a JWT
function signToken(payload: object, expiresIn = "15m") {
  return jwt.sign(payload, SECRET, { expiresIn } as any);
}

// Verify a JWT
function verifyToken(token: string) {
  try {
    return { valid: true, payload: jwt.verify(token, SECRET) };
  } catch (err: any) {
    return { valid: false, error: err.message };
  }
}

// Demo
const token = signToken({ id: "user_123", role: "learner" });
console.log("Token:", token);

const result = verifyToken(token);
console.log("Valid:", result.valid);
console.log("Payload:", result.payload);

const expired = verifyToken("bad.token.here");
console.log("Bad token:", expired.error);`,
          },
        ],
        quiz: {
          title: 'JWT Authentication Quiz',
          passingScore: 70,
          maxAttempts: 3,
          questions: [
            {
              prompt: 'What are the three parts of a JWT?',
              options: [
                'Username, password, signature',
                'Header, payload, signature',
                'Access token, refresh token, secret',
                'ID, role, expiry',
              ],
              correctOptionIndex: 1,
              explanation: 'JWTs consist of a header (algorithm), payload (claims), and signature.',
              points: 1,
            },
            {
              prompt: 'Why use a short expiry (15 min) for access tokens?',
              options: [
                'To force users to log in more often',
                'To limit the damage if a token is stolen',
                'Because JWTs cannot store data long-term',
                'For better performance',
              ],
              correctOptionIndex: 1,
              explanation: 'Short-lived tokens reduce the window of exposure if they are compromised.',
              points: 1,
            },
          ],
        },
      },
    ],
  },

  // ── 4. Python for Beginners ───────────────────────────────────────────────
  {
    title: 'Python for Beginners',
    description: 'Start programming with Python — a clean, readable language used in web development, data science, automation, and AI.',
    thumbnail: 'https://placehold.co/600x340/3776ab/fff?text=Python',
    category: 'Programming',
    level: 'beginner',
    duration: '11 hours',
    rating: 4.8,
    status: 'published',
    modules: [
      {
        title: 'Python Basics',
        order: 0,
        lessons: [
          {
            title: 'Variables, Types, and Input',
            duration: '18 min',
            type: 'content',
            order: 0,
            content: `# Variables, Types, and Input

Python is one of the most beginner-friendly languages because its syntax reads almost like plain English.

## Your first Python program

\`\`\`python
print("Hello, world!")
\`\`\`

## Variables

Python infers the type automatically — no need to declare it:

\`\`\`python
name    = "Amara"       # str
age     = 27            # int
height  = 1.75          # float
active  = True          # bool (capital T/F)
nothing = None          # equivalent of null
\`\`\`

## String operations

\`\`\`python
first = "PUGI"
last  = "LMS"

# Concatenation
print(first + " " + last)    # PUGI LMS

# f-strings (preferred)
print(f"{first} is the best {last}")

# Methods
print("hello".upper())        # HELLO
print("  spaces  ".strip())   # spaces
print("a,b,c".split(","))     # ['a', 'b', 'c']
print("Python".replace("P","J")) # Jython
print(len("Python"))          # 6

# Slicing
word = "Python"
print(word[0])    # P
print(word[-1])   # n
print(word[0:3])  # Pyt
print(word[::-1]) # nohtyP  (reversed!)
\`\`\`

## Getting user input

\`\`\`python
name = input("What is your name? ")
age  = int(input("How old are you? "))  # input() returns a string

print(f"Hello {name}, you are {age} years old!")
print(f"In 10 years you will be {age + 10}")
\`\`\`

## Type conversion

\`\`\`python
int("42")        # 42
float("3.14")    # 3.14
str(100)         # "100"
bool(0)          # False
bool("hello")    # True
list("abc")      # ['a', 'b', 'c']
\`\`\``,
            codeExample: `# Simple grade calculator
name  = "Amara"
scores = [92, 78, 85, 90, 88]

total   = sum(scores)
average = total / len(scores)
highest = max(scores)
lowest  = min(scores)

if average >= 90:
    grade = "A"
elif average >= 80:
    grade = "B"
elif average >= 70:
    grade = "C"
else:
    grade = "F"

print(f"Student: {name}")
print(f"Scores:  {scores}")
print(f"Average: {average:.1f}")
print(f"Grade:   {grade}")
print(f"Best:    {highest}  |  Worst: {lowest}")`,
          },
          {
            title: 'Lists, Loops, and Functions',
            duration: '24 min',
            type: 'content',
            order: 1,
            content: `# Lists, Loops, and Functions

## Lists

Python lists are ordered, mutable, and can hold any type:

\`\`\`python
fruits = ["apple", "banana", "mango"]
mixed  = [1, "two", 3.0, True, None]

# Access
print(fruits[0])   # apple
print(fruits[-1])  # mango

# Modify
fruits.append("grape")         # add to end
fruits.insert(1, "orange")     # insert at index
fruits.remove("banana")        # remove by value
popped = fruits.pop()          # remove and return last item
fruits.sort()                  # sort in place
sorted_copy = sorted(fruits)   # new sorted list

# Slicing
numbers = [0, 1, 2, 3, 4, 5]
print(numbers[1:4])   # [1, 2, 3]
print(numbers[::2])   # [0, 2, 4]  every other
\`\`\`

## Loops

\`\`\`python
# for loop — iterate over any iterable
for fruit in fruits:
    print(fruit)

# with index
for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")

# range
for i in range(5):       # 0 1 2 3 4
    print(i)

for i in range(1, 11, 2):  # 1 3 5 7 9
    print(i)

# while loop
count = 0
while count < 5:
    print(count)
    count += 1

# List comprehensions — powerful one-liners
squares   = [x**2 for x in range(10)]
evens     = [x for x in range(20) if x % 2 == 0]
uppercase = [word.upper() for word in ["hello", "world"]]
\`\`\`

## Functions

\`\`\`python
def greet(name, greeting="Hello"):
    """Return a greeting string."""
    return f"{greeting}, {name}!"

print(greet("Amara"))           # Hello, Amara!
print(greet("David", "Hi"))     # Hi, David!

# *args — variable positional arguments
def add(*numbers):
    return sum(numbers)

print(add(1, 2, 3, 4))  # 10

# **kwargs — variable keyword arguments
def create_user(**fields):
    return fields

user = create_user(name="Leah", role="tutor", xp=500)
print(user)  # {'name': 'Leah', 'role': 'tutor', 'xp': 500}

# Lambda (anonymous function)
double = lambda x: x * 2
print(double(7))  # 14
\`\`\``,
            codeExample: `def analyze_scores(students):
    """
    students: list of dicts with 'name' and 'scores'
    Returns a summary report.
    """
    report = []
    for student in students:
        scores  = student["scores"]
        average = sum(scores) / len(scores)
        grade   = "A" if average >= 90 else "B" if average >= 80 else "C" if average >= 70 else "F"
        report.append({
            "name":    student["name"],
            "average": round(average, 1),
            "grade":   grade,
            "highest": max(scores),
            "passed":  average >= 70,
        })

    # Sort by average descending
    report.sort(key=lambda r: r["average"], reverse=True)
    return report

students = [
    {"name": "Amara",  "scores": [92, 88, 95, 90]},
    {"name": "David",  "scores": [72, 68, 75, 70]},
    {"name": "Leah",   "scores": [85, 90, 88, 92]},
    {"name": "Victor", "scores": [60, 55, 58, 62]},
]

results = analyze_scores(students)
for r in results:
    status = "✅ Pass" if r["passed"] else "❌ Fail"
    print(f"{r['name']:10} | Avg: {r['average']:5.1f} | Grade: {r['grade']} | {status}")`,
          },
        ],
        quiz: {
          title: 'Python Basics Quiz',
          passingScore: 70,
          maxAttempts: 3,
          questions: [
            {
              prompt: 'How do you get the length of a list `items` in Python?',
              options: ['items.length', 'items.size()', 'len(items)', 'count(items)'],
              correctOptionIndex: 2,
              explanation: '`len()` is a built-in function that returns the length of any sequence.',
              points: 1,
            },
            {
              prompt: 'What does `[x**2 for x in range(4)]` produce?',
              options: ['[1, 4, 9, 16]', '[0, 1, 4, 9]', '[0, 2, 4, 6]', '[1, 2, 3, 4]'],
              correctOptionIndex: 1,
              explanation: 'range(4) gives 0,1,2,3 — squared gives 0,1,4,9.',
              points: 1,
            },
            {
              prompt: 'What keyword starts a function definition in Python?',
              options: ['func', 'function', 'def', 'fn'],
              correctOptionIndex: 2,
              explanation: 'Python uses `def` to define functions.',
              points: 1,
            },
          ],
        },
      },
    ],
  },

  // ── 5. SQL & Databases ────────────────────────────────────────────────────
  {
    title: 'SQL & Databases Fundamentals',
    description: 'Learn how to store, query, and manage data with SQL. Covers SELECT, JOIN, aggregations, indexes, and real-world database design.',
    thumbnail: 'https://placehold.co/600x340/336791/fff?text=SQL',
    category: 'Data Science',
    level: 'beginner',
    duration: '9 hours',
    rating: 4.6,
    status: 'published',
    modules: [
      {
        title: 'SQL Queries',
        order: 0,
        lessons: [
          {
            title: 'SELECT, WHERE, and ORDER BY',
            duration: '22 min',
            type: 'content',
            order: 0,
            content: `# SELECT, WHERE, and ORDER BY

SQL (Structured Query Language) is the standard language for working with relational databases.

## Basic SELECT

\`\`\`sql
-- Get all columns from a table
SELECT * FROM users;

-- Get specific columns
SELECT name, email, role FROM users;

-- Rename columns with aliases
SELECT name AS student_name, email AS contact FROM users;
\`\`\`

## WHERE — filtering rows

\`\`\`sql
-- Equality
SELECT * FROM users WHERE role = 'learner';

-- Comparison operators
SELECT * FROM courses WHERE rating > 4.5;
SELECT * FROM users WHERE xp >= 1000;
SELECT * FROM courses WHERE level != 'advanced';

-- AND / OR / NOT
SELECT * FROM users WHERE role = 'learner' AND xp > 500;
SELECT * FROM courses WHERE category = 'Frontend' OR category = 'Backend';

-- IN — match a list
SELECT * FROM courses WHERE category IN ('Frontend', 'Backend', 'Mobile');

-- BETWEEN
SELECT * FROM users WHERE xp BETWEEN 100 AND 1000;

-- LIKE — pattern matching
SELECT * FROM courses WHERE title LIKE '%React%';   -- contains "React"
SELECT * FROM users WHERE email LIKE '%@gmail.com'; -- ends with @gmail.com

-- NULL
SELECT * FROM users WHERE avatar IS NULL;
SELECT * FROM users WHERE avatar IS NOT NULL;
\`\`\`

## ORDER BY and LIMIT

\`\`\`sql
-- Sort ascending (default)
SELECT * FROM courses ORDER BY rating;

-- Sort descending
SELECT * FROM courses ORDER BY rating DESC;

-- Multiple sorts
SELECT * FROM courses ORDER BY category ASC, rating DESC;

-- Limit results
SELECT * FROM courses ORDER BY rating DESC LIMIT 10;

-- Pagination (skip 20 rows, get next 10)
SELECT * FROM courses ORDER BY created_at DESC LIMIT 10 OFFSET 20;
\`\`\``,
            codeExample: `-- Find top 5 highest-rated published courses in Frontend or Backend
SELECT
    title,
    category,
    level,
    rating,
    enrolled_count
FROM courses
WHERE
    status = 'published'
    AND category IN ('Frontend', 'Backend')
    AND rating >= 4.0
ORDER BY rating DESC, enrolled_count DESC
LIMIT 5;

-- Find users who registered in the last 30 days and have earned XP
SELECT
    name,
    email,
    xp,
    created_at
FROM users
WHERE
    role = 'learner'
    AND created_at >= NOW() - INTERVAL '30 days'
    AND xp > 0
ORDER BY xp DESC;`,
          },
          {
            title: 'JOINs and Aggregations',
            duration: '28 min',
            type: 'content',
            order: 1,
            content: `# JOINs and Aggregations

## JOINs — combining tables

\`\`\`sql
-- INNER JOIN — only rows that match in both tables
SELECT
    u.name AS student,
    c.title AS course,
    e.progress,
    e.enrolled_at
FROM enrollments e
INNER JOIN users   u ON e.user_id   = u.id
INNER JOIN courses c ON e.course_id = c.id;

-- LEFT JOIN — all rows from left table, nulls for non-matching right rows
SELECT
    u.name,
    COUNT(e.id) AS courses_enrolled
FROM users u
LEFT JOIN enrollments e ON u.id = e.user_id
WHERE u.role = 'learner'
GROUP BY u.id, u.name;
\`\`\`

## Aggregate functions

\`\`\`sql
SELECT COUNT(*)          FROM users;              -- total users
SELECT COUNT(DISTINCT role) FROM users;           -- unique roles
SELECT AVG(rating)       FROM courses;            -- average rating
SELECT MAX(xp)           FROM users;              -- highest XP
SELECT MIN(xp)           FROM users WHERE xp > 0;
SELECT SUM(enrolled_count) FROM courses;          -- total enrollments
\`\`\`

## GROUP BY and HAVING

\`\`\`sql
-- Count users per role
SELECT role, COUNT(*) AS total
FROM users
GROUP BY role;

-- Average rating per category
SELECT category, ROUND(AVG(rating), 2) AS avg_rating, COUNT(*) AS course_count
FROM courses
WHERE status = 'published'
GROUP BY category
ORDER BY avg_rating DESC;

-- HAVING — filter on aggregated values (like WHERE but for groups)
SELECT category, COUNT(*) AS total
FROM courses
GROUP BY category
HAVING COUNT(*) >= 3;  -- only categories with 3+ courses
\`\`\``,
            codeExample: `-- Leaderboard: top 10 learners by XP with their enrollment count
SELECT
    u.name,
    u.xp,
    u.level,
    COUNT(e.id)                            AS courses_enrolled,
    ROUND(AVG(e.progress), 1)              AS avg_progress,
    SUM(CASE WHEN e.progress = 100 THEN 1 ELSE 0 END) AS completed
FROM users u
LEFT JOIN enrollments e ON u.id = e.user_id
WHERE u.role = 'learner'
GROUP BY u.id, u.name, u.xp, u.level
ORDER BY u.xp DESC
LIMIT 10;`,
          },
        ],
        quiz: {
          title: 'SQL Fundamentals Quiz',
          passingScore: 70,
          maxAttempts: 3,
          questions: [
            {
              prompt: 'Which SQL clause filters rows AFTER aggregation?',
              options: ['WHERE', 'FILTER', 'HAVING', 'LIMIT'],
              correctOptionIndex: 2,
              explanation: '`HAVING` filters groups produced by `GROUP BY`, while `WHERE` filters individual rows before grouping.',
              points: 1,
            },
            {
              prompt: 'What does a LEFT JOIN return?',
              options: [
                'Only rows that match in both tables',
                'All rows from the right table plus matches from the left',
                'All rows from the left table, with NULLs for unmatched right rows',
                'All rows from both tables',
              ],
              correctOptionIndex: 2,
              explanation: 'LEFT JOIN keeps every row from the left table and fills unmatched right columns with NULL.',
              points: 1,
            },
            {
              prompt: 'Which wildcard character is used with LIKE to match any sequence of characters?',
              options: ['*', '_', '%', '?'],
              correctOptionIndex: 2,
              explanation: '`%` matches any sequence of characters in SQL LIKE patterns.',
              points: 1,
            },
          ],
        },
      },
    ],
  },

  // ── 6. Git & Version Control ─────────────────────────────────────────────
  {
    title: 'Git & Version Control',
    description: 'Master Git — the industry-standard version control system. Learn commits, branches, merging, rebasing, and team collaboration workflows.',
    thumbnail: 'https://placehold.co/600x340/f05032/fff?text=Git',
    category: 'Programming',
    level: 'beginner',
    duration: '7 hours',
    rating: 4.7,
    status: 'published',
    modules: [
      {
        title: 'Git Fundamentals',
        order: 0,
        lessons: [
          {
            title: 'How Git Works',
            duration: '20 min',
            type: 'content',
            order: 0,
            content: `# How Git Works

Git is a distributed version control system. Every developer has a full copy of the project history.

## Core concepts

- **Repository (repo)** — the project folder Git is tracking
- **Commit** — a saved snapshot of your changes
- **Branch** — a parallel line of development
- **Remote** — a copy of the repo hosted elsewhere (GitHub, GitLab)
- **Working tree** — your current files
- **Staging area (index)** — changes queued up for the next commit

## Initial setup

\`\`\`bash
git config --global user.name  "Your Name"
git config --global user.email "you@example.com"
git config --global core.editor "code --wait"  # VS Code as editor
\`\`\`

## Starting a repo

\`\`\`bash
# New project
mkdir my-project && cd my-project
git init

# Clone existing
git clone https://github.com/user/repo.git
\`\`\`

## The daily workflow

\`\`\`bash
# 1. Check what changed
git status
git diff           # unstaged changes
git diff --staged  # staged changes

# 2. Stage changes
git add file.txt         # stage one file
git add src/             # stage a folder
git add .                # stage everything

# 3. Commit
git commit -m "feat: add user authentication"

# 4. Push to remote
git push origin main
\`\`\`

## Writing good commit messages

\`\`\`
feat: add course search with category filter
fix: prevent duplicate enrollment for same course
docs: update API README with auth examples
refactor: extract auth middleware to separate file
test: add unit tests for progress service
chore: bump dependencies to latest
\`\`\`

Use the format: \`type: short description in present tense\`

## Viewing history

\`\`\`bash
git log                  # full log
git log --oneline        # compact one-line per commit
git log --oneline --graph --all  # visual branch graph
git show abc1234         # show a specific commit
git blame file.ts        # who changed each line?
\`\`\``,
            codeExample: `# A complete feature development workflow
# (Run these in your terminal)

# 1. Start on main, make sure it's up to date
git checkout main
git pull origin main

# 2. Create a feature branch
git checkout -b feat/course-categories

# 3. Make changes, then stage and commit
git add src/components/CategoryFilter.tsx
git commit -m "feat: add category filter component"

git add src/pages/CoursesPage.tsx
git commit -m "feat: integrate category filter into courses page"

# 4. Push branch to remote
git push origin feat/course-categories

# 5. On GitHub: open a Pull Request
# After code review and approval:

# 6. Merge into main
git checkout main
git merge feat/course-categories

# 7. Delete the branch (clean up)
git branch -d feat/course-categories
git push origin --delete feat/course-categories`,
          },
          {
            title: 'Branching and Merging',
            duration: '22 min',
            type: 'content',
            order: 1,
            content: `# Branching and Merging

## Branches

A branch is just a pointer to a commit. Creating one is instant and free.

\`\`\`bash
git branch                     # list local branches
git branch -a                  # list all (including remote)
git checkout -b feature/login  # create + switch
git switch -c feature/login    # modern syntax (same thing)
git switch main                # switch to existing branch
git branch -d feature/login    # delete (safe — won't delete unmerged)
git branch -D feature/login    # force delete
\`\`\`

## Merging

\`\`\`bash
# Merge feature into main
git checkout main
git merge feature/login

# If there are no conflicts: creates a merge commit
# If there are conflicts: Git marks the files for you to resolve
\`\`\`

## Resolving conflicts

\`\`\`
<<<<<<< HEAD (your current branch)
const url = "/api/login";
=======
const url = "/api/auth/login";
>>>>>>> feature/login
\`\`\`

Edit the file to keep what you want, then:

\`\`\`bash
git add src/services/authService.ts
git commit -m "merge: resolve conflict in auth service URL"
\`\`\`

## Rebasing (linear history)

\`\`\`bash
# Instead of merge, replay your commits on top of main
git checkout feature/login
git rebase main

# Then fast-forward merge (no merge commit)
git checkout main
git merge feature/login  # fast-forward because it's linear
\`\`\`

## Undoing things

\`\`\`bash
# Undo unstaged changes
git restore file.ts

# Unstage (but keep changes)
git restore --staged file.ts

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes) — DESTRUCTIVE
git reset --hard HEAD~1

# Revert a commit (safe — creates new commit)
git revert abc1234
\`\`\``,
            codeExample: `# .gitignore — tell Git what to ignore
# Place this file in your project root

# Dependencies
node_modules/
.pnp
.pnp.js

# Build output
dist/
build/
.next/
out/

# Environment variables (NEVER commit these)
.env
.env.local
.env.production

# OS files
.DS_Store
Thumbs.db

# IDE files
.vscode/settings.json
.idea/

# Logs
*.log
npm-debug.log*

# TypeScript cache
*.tsbuildinfo

# Test coverage
coverage/`,
          },
        ],
        quiz: {
          title: 'Git Fundamentals Quiz',
          passingScore: 70,
          maxAttempts: 3,
          questions: [
            {
              prompt: 'What does `git add .` do?',
              options: [
                'Commits all changes',
                'Stages all changed files in the current directory',
                'Pushes changes to remote',
                'Creates a new branch',
              ],
              correctOptionIndex: 1,
              explanation: '`git add .` stages all changes in the current directory for the next commit.',
              points: 1,
            },
            {
              prompt: 'Which command safely undoes a commit by creating a NEW commit?',
              options: ['git reset --hard', 'git checkout', 'git revert', 'git clean'],
              correctOptionIndex: 2,
              explanation: '`git revert` creates a new commit that undoes the specified commit — safe for shared history.',
              points: 1,
            },
            {
              prompt: 'What should you NEVER commit to a repository?',
              options: [
                'README files',
                'Source code',
                '.env files containing secrets and API keys',
                'package.json',
              ],
              correctOptionIndex: 2,
              explanation: '.env files contain secrets. Always add them to .gitignore.',
              points: 1,
            },
          ],
        },
      },
    ],
  },
];

// ─── TUTORS ───────────────────────────────────────────────────────────────────

const tutorProfiles = [
  { name: 'Amara Okafor',  email: 'amara@pugi.com'  },
  { name: 'David Mensah',  email: 'david@pugi.com'  },
  { name: 'Leah Johnson',  email: 'leah@pugi.com'   },
  { name: 'Victor Chen',   email: 'victor@pugi.com' },
  { name: 'Demo Tutor',    email: 'tutor@pugi.com'  },
];

// ─── SEED ────────────────────────────────────────────────────────────────────

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Enrollment.deleteMany({}),
    UserProgress.deleteMany({}),
    Certificate.deleteMany({}),
    QuizAttempt.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  const hashed = await bcrypt.hash(PASSWORD, 10);

  const learner = await User.create({
    name: 'Demo Learner',
    email: 'learner@pugi.com',
    password: hashed,
    role: 'learner',
    emailVerified: true,
  });

  await User.create({
    name: 'Demo Admin',
    email: 'admin@pugi.com',
    password: hashed,
    role: 'admin',
    emailVerified: true,
  });

  const tutors = await User.insertMany(
    tutorProfiles.map(p => ({
      ...p,
      password: hashed,
      role: 'tutor',
      emailVerified: true,
    }))
  );

  const courseDocuments = courses.map((course, i) => ({
    ...course,
    instructor: tutors[i % tutors.length].name,
    instructorId: tutors[i % tutors.length]._id,
    enrolledStudents: [learner._id],
    enrolledCount: 1,
  }));

  const inserted = await Course.insertMany(courseDocuments);
  console.log(`Created ${inserted.length} courses`);

  // Enroll demo learner in all courses
  const enrollments = inserted.map(c => ({
    userId: learner._id,
    courseId: c._id,
    completedLessons: [],
    progress: 0,
    lastAccessed: new Date(),
  }));
  await Enrollment.insertMany(enrollments);

  console.log('\nDemo accounts (password: password123)');
  console.log('  learner@pugi.com');
  console.log('  tutor@pugi.com');
  console.log('  admin@pugi.com');

  await mongoose.disconnect();
};

seed()
  .then(() => { console.log('\nSeed complete ✅'); process.exit(0); })
  .catch(err => { console.error('Seed failed:', err); process.exit(1); });
