const { MongoClient } = require('mongodb');

async function main() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('pugi');

  const mermaidContent = `# What is JavaScript?

JavaScript is the programming language of the web.

## How JavaScript Fits in the Web

\`\`\`mermaid
flowchart TD
    A[User visits website] --> B[Browser downloads HTML]
    B --> C[Browser downloads CSS]
    B --> D[Browser downloads JavaScript]
    C --> E[Page looks styled]
    D --> F[Page becomes interactive]
    E --> G[Final rendered page]
    F --> G
\`\`\`

## Where JavaScript Runs

\`\`\`mermaid
flowchart LR
    JS[JavaScript Code] --> Browser
    JS --> Node[Node.js Server]
    JS --> Mobile[React Native Mobile]
    JS --> Desktop[Electron Desktop]
    Browser --> Chrome
    Browser --> Firefox
    Browser --> Safari
\`\`\`

## Your First Program

Open your browser console (F12) and type:

\`\`\`js
console.log("Hello, world!");
console.log(2 + 2);
console.log(typeof "hello");
\`\`\`

## Variables

\`\`\`js
let score = 0;
score = 10;

const PI = 3.14159;
const APP_NAME = "PUGI";
\`\`\`

## Variable Types Decision

\`\`\`mermaid
flowchart TD
    Q{Will the value change?} -->|Yes| L[Use let]
    Q -->|No| C[Use const]
    L --> Ex1[let count = 0]
    C --> Ex2[const PI = 3.14]
\`\`\`
`;

  const course = await db.collection('courses').findOne({ title: 'JavaScript Fundamentals' });
  if (!course) { console.log('Course not found'); process.exit(1); }

  const updatedModules = course.modules.map((mod) => ({
    ...mod,
    lessons: mod.lessons.map((lesson) => {
      if (lesson.title === 'What is JavaScript?') {
        console.log('Updated lesson with mermaid diagrams!');
        return { ...lesson, content: mermaidContent };
      }
      return lesson;
    })
  }));

  await db.collection('courses').updateOne(
    { title: 'JavaScript Fundamentals' },
    { $set: { modules: updatedModules } }
  );

  await client.close();
  console.log('Done!');
}

main().catch(console.error);
