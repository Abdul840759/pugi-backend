const { MongoClient } = require('mongodb');

const client = new MongoClient('mongodb://localhost:27017');

const newCourses = [
  // INTERMEDIATE upgrades (add missing ones)
  {
    title: 'Advanced JavaScript — Patterns & Performance',
    category: 'Frontend',
    level: 'advanced',
    description: 'Deep dive into closures, prototypes, async patterns, memory management, and high-performance JS.',
    instructor: 'PUGI Instructor',
    duration: '12 hours',
    status: 'published',
    rating: 4.8,
    enrolledCount: 0,
    modules: [{
      title: 'Advanced JS Concepts',
      lessons: [
        { title: 'Closures & the Module Pattern', content: '# Closures & the Module Pattern\n\nA closure is a function that remembers its outer scope even after the outer function has returned.\n\n```js\nfunction makeCounter(start = 0) {\n  let count = start;\n  return {\n    increment: () => ++count,\n    decrement: () => --count,\n    value: () => count,\n    reset: () => { count = start; }\n  };\n}\n\nconst counter = makeCounter(10);\nconsole.log(counter.increment()); // 11\nconsole.log(counter.increment()); // 12\nconsole.log(counter.value());     // 12\nconsole.log(counter.reset());     // undefined\nconsole.log(counter.value());     // 10\n```\n\n## The Module Pattern\n\nClosures enable the module pattern — keeping private state:\n\n```js\nconst ShoppingCart = (() => {\n  // private\n  let items = [];\n  let discount = 0;\n\n  // public API\n  return {\n    addItem(item) { items.push(item); },\n    removeItem(id) { items = items.filter(i => i.id !== id); },\n    setDiscount(d) { discount = d; },\n    getTotal() {\n      const subtotal = items.reduce((sum, i) => sum + i.price, 0);\n      return subtotal * (1 - discount);\n    },\n    getItems() { return [...items]; } // return copy, not reference\n  };\n})();\n\nShoppingCart.addItem({ id: 1, name: "Course", price: 29.99 });\nShoppingCart.setDiscount(0.1);\nconsole.log(ShoppingCart.getTotal()); // 26.991\n```', duration: '45 min' },
        { title: 'Prototypes & Inheritance', content: '# Prototypes & Inheritance\n\nEvery JavaScript object has a prototype chain.\n\n```js\nfunction Animal(name, sound) {\n  this.name = name;\n  this.sound = sound;\n}\n\nAnimal.prototype.speak = function() {\n  return `${this.name} says ${this.sound}`;\n};\n\nfunction Dog(name) {\n  Animal.call(this, name, "Woof");\n  this.tricks = [];\n}\n\nDog.prototype = Object.create(Animal.prototype);\nDog.prototype.constructor = Dog;\n\nDog.prototype.learn = function(trick) {\n  this.tricks.push(trick);\n};\n\nconst rex = new Dog("Rex");\nconsole.log(rex.speak());   // Rex says Woof\nrex.learn("sit");\nrex.learn("shake");\nconsole.log(rex.tricks);    // ["sit", "shake"]\nconsole.log(rex instanceof Dog);    // true\nconsole.log(rex instanceof Animal); // true\n```\n\n## ES6 Classes (syntactic sugar)\n\n```js\nclass Animal {\n  constructor(name, sound) {\n    this.name = name;\n    this.sound = sound;\n  }\n  speak() { return `${this.name} says ${this.sound}`; }\n  static create(name, sound) { return new Animal(name, sound); }\n}\n\nclass Dog extends Animal {\n  constructor(name) {\n    super(name, "Woof");\n    this.tricks = [];\n  }\n  learn(trick) { this.tricks.push(trick); return this; }\n  showTricks() { return `${this.name} knows: ${this.tricks.join(", ")}`; }\n}\n\nconst buddy = new Dog("Buddy");\nbuddy.learn("sit").learn("roll over");\nconsole.log(buddy.showTricks());\n```', duration: '50 min' },
      ],
      quiz: {
        title: 'Advanced JS Quiz',
        questions: [
          { prompt: 'What is a closure?', options: ['A function with no parameters', 'A function that remembers its outer scope', 'A class method', 'An arrow function'], correctOptionIndex: 1, points: 1 },
          { prompt: 'What does Object.create() do?', options: ['Creates a new array', 'Creates an object with a specified prototype', 'Copies an object', 'Freezes an object'], correctOptionIndex: 1, points: 1 }
        ],
        passingScore: 70
      }
    }]
  },
  {
    title: 'React — Advanced Patterns & State Management',
    category: 'Frontend',
    level: 'advanced',
    description: 'Master React Context, Redux Toolkit, custom hooks, performance optimization, and advanced patterns.',
    instructor: 'PUGI Instructor',
    duration: '14 hours',
    status: 'published',
    rating: 4.9,
    enrolledCount: 0,
    modules: [{
      title: 'Advanced React',
      lessons: [
        { title: 'Custom Hooks — Build Your Own', content: '# Custom Hooks\n\nCustom hooks let you extract and reuse stateful logic across components.\n\n```js\n// useFetch — reusable data fetching hook\nfunction useFetch(url) {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n\n  useEffect(() => {\n    let cancelled = false;\n    setLoading(true);\n    fetch(url)\n      .then(res => {\n        if (!res.ok) throw new Error(`HTTP ${res.status}`);\n        return res.json();\n      })\n      .then(data => { if (!cancelled) { setData(data); setLoading(false); } })\n      .catch(err => { if (!cancelled) { setError(err.message); setLoading(false); } });\n    return () => { cancelled = true; };\n  }, [url]);\n\n  return { data, loading, error };\n}\n\n// Usage\nfunction CourseList() {\n  const { data, loading, error } = useFetch("/api/courses");\n  if (loading) return <Spinner />;\n  if (error) return <Error message={error} />;\n  return <ul>{data.map(c => <li key={c.id}>{c.title}</li>)}</ul>;\n}\n```\n\n## useLocalStorage Hook\n\n```js\nfunction useLocalStorage(key, initialValue) {\n  const [value, setValue] = useState(() => {\n    try {\n      const stored = localStorage.getItem(key);\n      return stored ? JSON.parse(stored) : initialValue;\n    } catch { return initialValue; }\n  });\n\n  const setStoredValue = (newValue) => {\n    const valueToStore = newValue instanceof Function ? newValue(value) : newValue;\n    setValue(valueToStore);\n    localStorage.setItem(key, JSON.stringify(valueToStore));\n  };\n\n  return [value, setStoredValue];\n}\n\n// Usage\nconst [theme, setTheme] = useLocalStorage("theme", "light");\n```', duration: '60 min' },
        { title: 'Performance Optimization', content: '# React Performance Optimization\n\n## useMemo — Cache expensive calculations\n\n```js\nfunction CourseStats({ courses }) {\n  // Recalculates only when courses changes\n  const stats = useMemo(() => ({\n    total: courses.length,\n    avgRating: courses.reduce((s, c) => s + c.rating, 0) / courses.length,\n    byLevel: courses.reduce((acc, c) => {\n      acc[c.level] = (acc[c.level] || 0) + 1;\n      return acc;\n    }, {})\n  }), [courses]);\n\n  return <StatsDisplay stats={stats} />;\n}\n```\n\n## useCallback — Stable function references\n\n```js\nfunction Parent() {\n  const [count, setCount] = useState(0);\n\n  // Without useCallback: new function on every render\n  // Child re-renders every time even if unrelated state changes\n  const handleClick = useCallback(() => {\n    console.log("clicked");\n  }, []); // empty deps = stable reference\n\n  return (\n    <div>\n      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>\n      <MemoizedChild onClick={handleClick} />\n    </div>\n  );\n}\n\nconst MemoizedChild = React.memo(({ onClick }) => {\n  console.log("Child rendered"); // only when onClick changes\n  return <button onClick={onClick}>Click me</button>;\n});\n```', duration: '55 min' },
      ],
      quiz: {
        title: 'Advanced React Quiz',
        questions: [
          { prompt: 'When should you use useMemo?', options: ['Always', 'For expensive calculations that depend on specific values', 'For all state updates', 'Never'], correctOptionIndex: 1, points: 1 },
          { prompt: 'What is the purpose of React.memo?', options: ['To memoize a value', 'To prevent unnecessary re-renders of a component', 'To cache API calls', 'To manage state'], correctOptionIndex: 1, points: 1 }
        ],
        passingScore: 70
      }
    }]
  },
  {
    title: 'Node.js — Microservices & Advanced Architecture',
    category: 'Backend',
    level: 'advanced',
    description: 'Build scalable microservices with Node.js, message queues, caching, and advanced API design.',
    instructor: 'PUGI Instructor',
    duration: '16 hours',
    status: 'published',
    rating: 4.7,
    enrolledCount: 0,
    modules: [{
      title: 'Advanced Backend Architecture',
      lessons: [
        { title: 'Microservices Architecture', content: '# Microservices Architecture\n\nMicroservices split a large app into small independent services that communicate over a network.\n\n```mermaid\nflowchart TD\n    Client[Client App] --> Gateway[API Gateway :3000]\n    Gateway --> Auth[Auth Service :3001]\n    Gateway --> Courses[Course Service :3002]\n    Gateway --> Users[User Service :3003]\n    Gateway --> Notify[Notification Service :3004]\n    Auth --> AuthDB[(Auth DB)]\n    Courses --> CourseDB[(Course DB)]\n    Users --> UserDB[(User DB)]\n    Notify --> Queue[Message Queue]\n```\n\n## Building a Simple Microservice\n\n```js\n// course-service/index.js\nconst express = require("express");\nconst app = express();\n\n// Each service owns its own data\nconst courses = [\n  { id: 1, title: "JavaScript Fundamentals", level: "beginner" },\n  { id: 2, title: "React Advanced", level: "advanced" },\n];\n\napp.get("/courses", (req, res) => res.json(courses));\napp.get("/courses/:id", (req, res) => {\n  const course = courses.find(c => c.id === Number(req.params.id));\n  if (!course) return res.status(404).json({ error: "Not found" });\n  res.json(course);\n});\n\napp.listen(3002, () => console.log("Course service on :3002"));\n```\n\n## API Gateway Pattern\n\n```js\n// gateway/index.js\nconst express = require("express");\nconst { createProxyMiddleware } = require("http-proxy-middleware");\nconst app = express();\n\n// Route to correct service\napp.use("/api/auth",    createProxyMiddleware({ target: "http://localhost:3001" }));\napp.use("/api/courses", createProxyMiddleware({ target: "http://localhost:3002" }));\napp.use("/api/users",   createProxyMiddleware({ target: "http://localhost:3003" }));\n\napp.listen(3000, () => console.log("Gateway on :3000"));\n```', duration: '70 min' },
        { title: 'Redis Caching', content: '# Redis Caching\n\nRedis is an in-memory data store used for caching, sessions, and pub/sub.\n\n```js\nconst redis = require("redis");\nconst client = redis.createClient();\n\n// Cache middleware\nconst cache = (ttl = 60) => async (req, res, next) => {\n  const key = `cache:${req.originalUrl}`;\n  try {\n    const cached = await client.get(key);\n    if (cached) {\n      console.log("Cache HIT:", key);\n      return res.json(JSON.parse(cached));\n    }\n    console.log("Cache MISS:", key);\n    // Override res.json to cache the response\n    const originalJson = res.json.bind(res);\n    res.json = (data) => {\n      client.setEx(key, ttl, JSON.stringify(data));\n      return originalJson(data);\n    };\n    next();\n  } catch (err) {\n    next(); // if redis fails, just skip cache\n  }\n};\n\n// Usage\napp.get("/api/courses", cache(300), async (req, res) => {\n  // This only runs on cache MISS\n  const courses = await Course.find({ status: "published" });\n  res.json(courses);\n});\n```', duration: '60 min' },
      ],
      quiz: {
        title: 'Advanced Backend Quiz',
        questions: [
          { prompt: 'What is the main benefit of microservices?', options: ['Faster development', 'Independent scaling and deployment', 'Less code', 'Simpler debugging'], correctOptionIndex: 1, points: 1 },
          { prompt: 'What is Redis primarily used for?', options: ['File storage', 'In-memory caching and data structures', 'SQL queries', 'Authentication'], correctOptionIndex: 1, points: 1 }
        ],
        passingScore: 70
      }
    }]
  },
  {
    title: 'Python — Data Science & Machine Learning',
    category: 'Programming',
    level: 'intermediate',
    description: 'Learn NumPy, Pandas, Matplotlib and build real ML models with scikit-learn.',
    instructor: 'PUGI Instructor',
    duration: '15 hours',
    status: 'published',
    rating: 4.8,
    enrolledCount: 0,
    modules: [{
      title: 'Data Science with Python',
      lessons: [
        { title: 'NumPy & Pandas Fundamentals', content: '# NumPy & Pandas\n\nNumPy and Pandas are the foundation of data science in Python.\n\n```python\nimport numpy as np\nimport pandas as pd\n\n# NumPy arrays are much faster than Python lists\narr = np.array([1, 2, 3, 4, 5])\nprint(arr * 2)        # [2 4 6 8 10] — vectorized\nprint(arr.mean())     # 3.0\nprint(arr.std())      # 1.41\n\n# 2D arrays (matrices)\nmatrix = np.array([[1,2,3],[4,5,6],[7,8,9]])\nprint(matrix.shape)   # (3, 3)\nprint(matrix.T)       # transpose\n\n# Pandas DataFrame\nstudents = pd.DataFrame({\n  "name": ["Abdulazeez", "Fatima", "Ibrahim"],\n  "score": [92, 87, 95],\n  "grade": ["A", "B", "A"]\n})\n\nprint(students.describe())  # statistics\nprint(students[students["score"] > 90])  # filter\nprint(students.groupby("grade")["score"].mean())  # group by\n```', duration: '65 min' },
        { title: 'Building ML Models', content: '# Building ML Models with scikit-learn\n\n```python\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import accuracy_score, classification_report\nimport pandas as pd\nimport numpy as np\n\n# Sample dataset\ndata = pd.DataFrame({\n  "study_hours": [2,3,4,5,6,7,8,9,10,1],\n  "prev_score":  [60,65,70,75,80,85,90,92,95,50],\n  "passed":      [0,0,0,1,1,1,1,1,1,0]\n})\n\nX = data[["study_hours", "prev_score"]]\ny = data["passed"]\n\n# Split into train/test\nX_train, X_test, y_train, y_test = train_test_split(\n  X, y, test_size=0.2, random_state=42\n)\n\n# Scale features\nscaler = StandardScaler()\nX_train = scaler.fit_transform(X_train)\nX_test = scaler.transform(X_test)\n\n# Train model\nmodel = LogisticRegression()\nmodel.fit(X_train, y_train)\n\n# Evaluate\ny_pred = model.predict(X_test)\nprint(f"Accuracy: {accuracy_score(y_test, y_pred):.2%}")\nprint(classification_report(y_test, y_pred))\n\n# Predict new student\nnew_student = scaler.transform([[7, 82]])\nprint("Will pass:", model.predict(new_student)[0] == 1)\n```', duration: '70 min' },
      ],
      quiz: {
        title: 'Data Science Quiz',
        questions: [
          { prompt: 'What is NumPy primarily used for?', options: ['Web development', 'Numerical computing with arrays', 'Database queries', 'UI design'], correctOptionIndex: 1, points: 1 },
          { prompt: 'What does train_test_split do?', options: ['Trains the model', 'Splits data into training and testing sets', 'Tests the model', 'Splits the dataset into features'], correctOptionIndex: 1, points: 1 }
        ],
        passingScore: 70
      }
    }]
  },
  {
    title: 'Advanced SQL & Database Design',
    category: 'Data Science',
    level: 'advanced',
    description: 'Master complex queries, indexing, query optimization, stored procedures, and database design patterns.',
    instructor: 'PUGI Instructor',
    duration: '10 hours',
    status: 'published',
    rating: 4.7,
    enrolledCount: 0,
    modules: [{
      title: 'Advanced SQL',
      lessons: [
        { title: 'Window Functions', content: '# Window Functions\n\nWindow functions perform calculations across rows related to the current row.\n\n```sql\n-- ROW_NUMBER — assign sequential numbers\nSELECT \n  student_name,\n  score,\n  ROW_NUMBER() OVER (ORDER BY score DESC) as rank\nFROM exam_results;\n\n-- RANK — same score gets same rank\nSELECT\n  student_name,\n  score,\n  RANK() OVER (ORDER BY score DESC) as rank,\n  DENSE_RANK() OVER (ORDER BY score DESC) as dense_rank\nFROM exam_results;\n\n-- Partition by — rank within groups\nSELECT\n  student_name,\n  course,\n  score,\n  RANK() OVER (PARTITION BY course ORDER BY score DESC) as course_rank\nFROM exam_results;\n\n-- Running total\nSELECT\n  date,\n  amount,\n  SUM(amount) OVER (ORDER BY date) as running_total,\n  AVG(amount) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as week_avg\nFROM sales;\n```', duration: '60 min' },
        { title: 'Query Optimization & Indexing', content: '# Query Optimization\n\n```sql\n-- EXPLAIN shows query execution plan\nEXPLAIN SELECT * FROM users WHERE email = "test@test.com";\n\n-- Without index: Full Table Scan (slow)\n-- With index: Index Seek (fast)\n\n-- Create indexes on frequently queried columns\nCREATE INDEX idx_users_email ON users(email);\nCREATE INDEX idx_courses_category_level ON courses(category, level);\n\n-- Composite index — order matters!\n-- This index helps: WHERE category = X AND level = Y\n-- This index helps: WHERE category = X\n-- This index does NOT help: WHERE level = Y alone\n\n-- Covering index — includes all needed columns\nCREATE INDEX idx_courses_cover \nON courses(category, level)\nINCLUDE (title, rating, enrolledCount);\n\n-- Avoid these (prevent index use)\n-- ❌ Functions on indexed columns\nSELECT * FROM users WHERE LOWER(email) = "test@test.com";\n-- ✅ Fix: store email in lowercase\nSELECT * FROM users WHERE email = "test@test.com";\n\n-- ❌ Leading wildcard\nSELECT * FROM courses WHERE title LIKE "%react%";\n-- ✅ Use full-text search instead\nSELECT * FROM courses WHERE MATCH(title) AGAINST("react");\n```', duration: '65 min' },
      ],
      quiz: {
        title: 'Advanced SQL Quiz',
        questions: [
          { prompt: 'What do window functions operate on?', options: ['A single row', 'All rows in the table', 'A set of rows related to the current row', 'Only grouped rows'], correctOptionIndex: 2, points: 1 },
          { prompt: 'What does EXPLAIN do in SQL?', options: ['Explains the table structure', 'Shows the query execution plan', 'Documents the database', 'Creates an index'], correctOptionIndex: 1, points: 1 }
        ],
        passingScore: 70
      }
    }]
  },
  {
    title: 'Git — Advanced Workflows & DevOps',
    category: 'Programming',
    level: 'intermediate',
    description: 'Master Git workflows, rebasing, cherry-picking, hooks, and team collaboration strategies.',
    instructor: 'PUGI Instructor',
    duration: '8 hours',
    status: 'published',
    rating: 4.6,
    enrolledCount: 0,
    modules: [{
      title: 'Advanced Git',
      lessons: [
        { title: 'Rebasing & Cherry-picking', content: '# Rebasing & Cherry-picking\n\n## Git Rebase — Cleaner History\n\n```bash\n# Instead of merge (creates merge commit)\ngit checkout feature\ngit merge main\n\n# Rebase (replays your commits on top of main)\ngit checkout feature\ngit rebase main\n\n# Interactive rebase — rewrite history\ngit rebase -i HEAD~3  # edit last 3 commits\n\n# In the editor:\n# pick abc123 Add login page\n# squash def456 Fix typo  <- combine with previous\n# reword ghi789 Add signup  <- change commit message\n```\n\n## Cherry-pick — Apply specific commits\n\n```bash\n# Apply a specific commit from another branch\ngit cherry-pick abc123\n\n# Apply multiple commits\ngit cherry-pick abc123 def456\n\n# Apply a range\ngit cherry-pick abc123^..def456\n\n# Real scenario: hotfix on main, apply to develop\ngit checkout main\ngit cherry-pick hotfix-commit-hash\n```', duration: '55 min' },
        { title: 'Git Hooks & Automation', content: '# Git Hooks\n\nGit hooks run scripts automatically at key points in your workflow.\n\n```bash\n# Hooks live in .git/hooks/\nls .git/hooks/\n# pre-commit, commit-msg, pre-push, post-merge...\n\n# pre-commit hook — run tests before every commit\ncat > .git/hooks/pre-commit << "EOF"\n#!/bin/sh\nnpm test\nif [ $? -ne 0 ]; then\n  echo "Tests failed! Commit aborted."\n  exit 1\nfi\nEOF\nchmod +x .git/hooks/pre-commit\n\n# commit-msg hook — enforce commit message format\ncat > .git/hooks/commit-msg << "EOF"\n#!/bin/sh\nMSG=$(cat $1)\nPATTERN="^(feat|fix|docs|style|refactor|test|chore): .+"\nif ! echo "$MSG" | grep -qE "$PATTERN"; then\n  echo "Bad commit message! Use: feat|fix|docs: description"\n  exit 1\nfi\nEOF\nchmod +x .git/hooks/commit-msg\n```', duration: '50 min' },
      ],
      quiz: {
        title: 'Advanced Git Quiz',
        questions: [
          { prompt: 'What is the main difference between merge and rebase?', options: ['They are the same', 'Rebase creates a linear history, merge creates a merge commit', 'Merge is faster', 'Rebase deletes commits'], correctOptionIndex: 1, points: 1 },
          { prompt: 'What does git cherry-pick do?', options: ['Deletes a commit', 'Applies a specific commit to the current branch', 'Creates a new branch', 'Merges branches'], correctOptionIndex: 1, points: 1 }
        ],
        passingScore: 70
      }
    }]
  },
  {
    title: 'Advanced UI/UX — Design Systems & Prototyping',
    category: 'Design',
    level: 'intermediate',
    description: 'Build complete design systems, create interactive prototypes, and master user research.',
    instructor: 'PUGI Instructor',
    duration: '12 hours',
    status: 'published',
    rating: 4.8,
    enrolledCount: 0,
    modules: [{
      title: 'Design Systems',
      lessons: [
        { title: 'Building a Design System', content: '# Building a Design System\n\nA design system is a collection of reusable components, guided by clear standards.\n\n```mermaid\nflowchart TD\n    DS[Design System] --> Tokens[Design Tokens\nColors, Typography\nSpacing, Shadows]\n    DS --> Components[Components\nButtons, Inputs\nCards, Modals]\n    DS --> Patterns[Patterns\nForms, Navigation\nData Display]\n    DS --> Docs[Documentation\nUsage Guidelines\nDo and Don\'t]\n    Tokens --> Components\n    Components --> Patterns\n```\n\n## Design Tokens in CSS\n\n```css\n:root {\n  /* Colors */\n  --color-primary-500: #3b82f6;\n  --color-primary-600: #2563eb;\n  --color-success: #22c55e;\n  --color-danger: #ef4444;\n  --color-warning: #f59e0b;\n\n  /* Typography */\n  --font-size-xs: 0.75rem;\n  --font-size-sm: 0.875rem;\n  --font-size-base: 1rem;\n  --font-size-lg: 1.125rem;\n  --font-size-xl: 1.25rem;\n\n  /* Spacing */\n  --space-1: 0.25rem;\n  --space-2: 0.5rem;\n  --space-4: 1rem;\n  --space-8: 2rem;\n\n  /* Border radius */\n  --radius-sm: 0.25rem;\n  --radius-md: 0.5rem;\n  --radius-lg: 0.75rem;\n  --radius-full: 9999px;\n}\n\n/* Component using tokens */\n.btn-primary {\n  background: var(--color-primary-500);\n  padding: var(--space-2) var(--space-4);\n  border-radius: var(--radius-md);\n  font-size: var(--font-size-sm);\n}\n```', duration: '70 min' },
      ],
      quiz: {
        title: 'Design Systems Quiz',
        questions: [
          { prompt: 'What are design tokens?', options: ['Login credentials', 'Named values for design decisions like colors and spacing', 'CSS animations', 'Font files'], correctOptionIndex: 1, points: 1 }
        ],
        passingScore: 70
      }
    }]
  },
  {
    title: 'Kubernetes & Advanced DevOps',
    category: 'DevOps',
    level: 'advanced',
    description: 'Master Kubernetes, Helm, service meshes, and advanced CI/CD pipelines for production.',
    instructor: 'PUGI Instructor',
    duration: '18 hours',
    status: 'published',
    rating: 4.7,
    enrolledCount: 0,
    modules: [{
      title: 'Kubernetes',
      lessons: [
        { title: 'Kubernetes Core Concepts', content: '# Kubernetes\n\nKubernetes (K8s) is a container orchestration platform that automates deployment, scaling, and management.\n\n```mermaid\nflowchart TD\n    Cluster[K8s Cluster] --> Master[Control Plane]\n    Cluster --> Nodes[Worker Nodes]\n    Master --> API[API Server]\n    Master --> Scheduler\n    Master --> ETCD[(etcd)]\n    Nodes --> Pod1[Pod: App x3]\n    Nodes --> Pod2[Pod: DB x1]\n    Nodes --> Pod3[Pod: Cache x2]\n```\n\n## Basic Kubernetes Manifest\n\n```yaml\n# deployment.yaml\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: pugi-backend\nspec:\n  replicas: 3  # run 3 instances\n  selector:\n    matchLabels:\n      app: pugi-backend\n  template:\n    metadata:\n      labels:\n        app: pugi-backend\n    spec:\n      containers:\n      - name: pugi-backend\n        image: pugi/backend:latest\n        ports:\n        - containerPort: 3001\n        env:\n        - name: MONGODB_URI\n          valueFrom:\n            secretKeyRef:\n              name: pugi-secrets\n              key: mongodb-uri\n        resources:\n          requests:\n            memory: "128Mi"\n            cpu: "250m"\n          limits:\n            memory: "256Mi"\n            cpu: "500m"\n```\n\n```bash\n# Deploy\nkubectl apply -f deployment.yaml\n\n# Check status\nkubectl get pods\nkubectl get deployments\n\n# Scale up\nkubectl scale deployment pugi-backend --replicas=5\n\n# View logs\nkubectl logs -f deployment/pugi-backend\n```', duration: '80 min' },
      ],
      quiz: {
        title: 'Kubernetes Quiz',
        questions: [
          { prompt: 'What is a Pod in Kubernetes?', options: ['A cluster', 'The smallest deployable unit containing one or more containers', 'A service', 'A node'], correctOptionIndex: 1, points: 1 }
        ],
        passingScore: 70
      }
    }]
  },
  {
    title: 'Deep Learning & Neural Networks',
    category: 'AI/ML',
    level: 'advanced',
    description: 'Build deep neural networks with TensorFlow and PyTorch, CNNs, RNNs, and transformers.',
    instructor: 'PUGI Instructor',
    duration: '20 hours',
    status: 'published',
    rating: 4.9,
    enrolledCount: 0,
    modules: [{
      title: 'Deep Learning',
      lessons: [
        { title: 'Building Neural Networks with TensorFlow', content: '# Neural Networks with TensorFlow\n\n```python\nimport tensorflow as tf\nfrom tensorflow import keras\nimport numpy as np\n\n# Build a neural network for image classification\nmodel = keras.Sequential([\n  keras.layers.Flatten(input_shape=(28, 28)),  # input layer\n  keras.layers.Dense(128, activation="relu"),   # hidden layer 1\n  keras.layers.Dropout(0.2),                   # prevent overfitting\n  keras.layers.Dense(64, activation="relu"),    # hidden layer 2\n  keras.layers.Dense(10, activation="softmax") # output: 10 classes\n])\n\nmodel.compile(\n  optimizer="adam",\n  loss="sparse_categorical_crossentropy",\n  metrics=["accuracy"]\n)\n\nmodel.summary()\n\n# Load MNIST dataset\n(X_train, y_train), (X_test, y_test) = keras.datasets.mnist.load_data()\nX_train, X_test = X_train / 255.0, X_test / 255.0  # normalize\n\n# Train\nhistory = model.fit(\n  X_train, y_train,\n  epochs=10,\n  validation_split=0.2,\n  batch_size=32\n)\n\n# Evaluate\ntest_loss, test_acc = model.evaluate(X_test, y_test)\nprint(f"Test accuracy: {test_acc:.2%}")\n```', duration: '90 min' },
      ],
      quiz: {
        title: 'Deep Learning Quiz',
        questions: [
          { prompt: 'What is Dropout used for?', options: ['Speed up training', 'Prevent overfitting', 'Add more layers', 'Normalize data'], correctOptionIndex: 1, points: 1 }
        ],
        passingScore: 70
      }
    }]
  },
  {
    title: 'Advanced Cybersecurity & Ethical Hacking',
    category: 'Cybersecurity',
    level: 'advanced',
    description: 'Master penetration testing, exploit development, forensics, and advanced security architecture.',
    instructor: 'PUGI Instructor',
    duration: '16 hours',
    status: 'published',
    rating: 4.8,
    enrolledCount: 0,
    modules: [{
      title: 'Ethical Hacking',
      lessons: [
        { title: 'Penetration Testing Methodology', content: '# Penetration Testing\n\nPenetration testing is authorized simulated attacks on systems to find vulnerabilities.\n\n```mermaid\nflowchart LR\n    Plan[1. Planning\nScope & Rules] --> Recon[2. Reconnaissance\nGather Info]\n    Recon --> Scan[3. Scanning\nFind Vulnerabilities]\n    Scan --> Exploit[4. Exploitation\nGain Access]\n    Exploit --> Post[5. Post-Exploitation\nMaintain Access]\n    Post --> Report[6. Reporting\nDocument Findings]\n```\n\n## Common Tools\n\n```bash\n# Nmap — Network scanning\nnmap -sV -sC -p- target.com\n# -sV: detect service versions\n# -sC: run default scripts\n# -p-: scan all 65535 ports\n\n# Nikto — Web server scanning\nnikto -h http://target.com\n\n# SQLMap — SQL injection testing\nsqlmap -u "http://target.com/api?id=1" --dbs\n\n# ALWAYS get written permission before testing!\n# Unauthorized access is illegal.\n```\n\n## SQL Injection Example (for learning)\n\n```sql\n-- Vulnerable query\nSELECT * FROM users WHERE username = \'$input\'\n\n-- Attacker input: \' OR 1=1 --\n-- Resulting query:\nSELECT * FROM users WHERE username = \'\' OR 1=1 --\'\n-- This returns ALL users!\n\n-- Fix: Use parameterized queries\nSELECT * FROM users WHERE username = ?\n-- Parameter: "actualusername"\n```', duration: '75 min' },
      ],
      quiz: {
        title: 'Ethical Hacking Quiz',
        questions: [
          { prompt: 'What is the first phase of penetration testing?', options: ['Exploitation', 'Scanning', 'Planning', 'Reporting'], correctOptionIndex: 2, points: 1 }
        ],
        passingScore: 70
      }
    }]
  },
  {
    title: 'AWS Solutions Architect',
    category: 'Cloud',
    level: 'advanced',
    description: 'Design and deploy scalable, highly available cloud architectures on AWS.',
    instructor: 'PUGI Instructor',
    duration: '18 hours',
    status: 'published',
    rating: 4.9,
    enrolledCount: 0,
    modules: [{
      title: 'AWS Architecture',
      lessons: [
        { title: 'Designing Scalable AWS Architecture', content: '# Scalable AWS Architecture\n\n```mermaid\nflowchart TD\n    Users[Users] --> CF[CloudFront CDN]\n    CF --> ALB[Application Load Balancer]\n    ALB --> EC2a[EC2 Instance AZ-1]\n    ALB --> EC2b[EC2 Instance AZ-2]\n    EC2a --> RDS[(RDS Multi-AZ)]\n    EC2b --> RDS\n    EC2a --> Cache[ElastiCache Redis]\n    EC2b --> Cache\n    EC2a --> S3[(S3 Storage)]\n    RDS --> Replica[(Read Replica)]\n```\n\n## Auto Scaling Configuration\n\n```json\n{\n  "AutoScalingGroupName": "pugi-backend-asg",\n  "MinSize": 2,\n  "MaxSize": 10,\n  "DesiredCapacity": 2,\n  "HealthCheckType": "ELB",\n  "ScalingPolicies": [\n    {\n      "PolicyType": "TargetTrackingScaling",\n      "TargetTrackingConfiguration": {\n        "PredefinedMetricSpecification": {\n          "PredefinedMetricType": "ASGAverageCPUUtilization"\n        },\n        "TargetValue": 70.0\n      }\n    }\n  ]\n}\n```\n\n## Cost Optimization\n\n```bash\n# Use Spot Instances for non-critical workloads (up to 90% cheaper)\naws ec2 request-spot-instances \\\n  --instance-count 2 \\\n  --type "one-time" \\\n  --launch-specification file://spec.json\n\n# Reserved Instances for predictable workloads (up to 72% cheaper)\n# Savings Plans for flexible compute usage\n\n# S3 lifecycle rules — auto-move old data to cheaper storage\naws s3api put-bucket-lifecycle-configuration \\\n  --bucket pugi-uploads \\\n  --lifecycle-configuration file://lifecycle.json\n```', duration: '85 min' },
      ],
      quiz: {
        title: 'AWS Architecture Quiz',
        questions: [
          { prompt: 'What does Auto Scaling do?', options: ['Reduces costs always', 'Automatically adjusts capacity based on demand', 'Backs up data', 'Monitors logs'], correctOptionIndex: 1, points: 1 }
        ],
        passingScore: 70
      }
    }]
  },
  {
    title: 'Solidity & DeFi Development',
    category: 'Blockchain',
    level: 'advanced',
    description: 'Build DeFi protocols, NFT marketplaces, and advanced smart contracts on Ethereum.',
    instructor: 'PUGI Instructor',
    duration: '16 hours',
    status: 'published',
    rating: 4.7,
    enrolledCount: 0,
    modules: [{
      title: 'Advanced Blockchain',
      lessons: [
        { title: 'Building a DeFi Protocol', content: '# DeFi Protocol Development\n\n```solidity\n// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\nimport "@openzeppelin/contracts/token/ERC20/IERC20.sol";\nimport "@openzeppelin/contracts/security/ReentrancyGuard.sol";\n\ncontract LendingProtocol is ReentrancyGuard {\n  IERC20 public token;\n  mapping(address => uint256) public deposits;\n  mapping(address => uint256) public borrows;\n  uint256 public totalDeposits;\n  uint256 public constant INTEREST_RATE = 5; // 5% APY\n\n  event Deposit(address indexed user, uint256 amount);\n  event Withdraw(address indexed user, uint256 amount);\n  event Borrow(address indexed user, uint256 amount);\n\n  constructor(address _token) {\n    token = IERC20(_token);\n  }\n\n  function deposit(uint256 amount) external nonReentrant {\n    require(amount > 0, "Amount must be > 0");\n    token.transferFrom(msg.sender, address(this), amount);\n    deposits[msg.sender] += amount;\n    totalDeposits += amount;\n    emit Deposit(msg.sender, amount);\n  }\n\n  function withdraw(uint256 amount) external nonReentrant {\n    require(deposits[msg.sender] >= amount, "Insufficient balance");\n    deposits[msg.sender] -= amount;\n    totalDeposits -= amount;\n    token.transfer(msg.sender, amount);\n    emit Withdraw(msg.sender, amount);\n  }\n\n  function getInterest(address user) public view returns (uint256) {\n    return deposits[user] * INTEREST_RATE / 100;\n  }\n}\n```', duration: '80 min' },
      ],
      quiz: {
        title: 'DeFi Quiz',
        questions: [
          { prompt: 'What does ReentrancyGuard protect against?', options: ['Integer overflow', 'Reentrancy attacks where a contract calls back into itself', 'Gas limit issues', 'Token transfers'], correctOptionIndex: 1, points: 1 }
        ],
        passingScore: 70
      }
    }]
  },
  {
    title: 'Advanced Game Development — 3D & Physics',
    category: 'Game Dev',
    level: 'advanced',
    description: 'Build 3D games with Three.js, advanced physics engines, multiplayer networking, and game AI.',
    instructor: 'PUGI Instructor',
    duration: '18 hours',
    status: 'published',
    rating: 4.8,
    enrolledCount: 0,
    modules: [{
      title: 'Advanced Game Dev',
      lessons: [
        { title: '3D Games with Three.js', content: '# 3D Game Development with Three.js\n\n```js\nimport * as THREE from "three";\n\n// Setup\nconst scene = new THREE.Scene();\nconst camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);\nconst renderer = new THREE.WebGLRenderer({ antialias: true });\nrenderer.setSize(window.innerWidth, window.innerHeight);\nrenderer.shadowMap.enabled = true;\ndocument.body.appendChild(renderer.domElement);\n\n// Lighting\nconst ambientLight = new THREE.AmbientLight(0xffffff, 0.4);\nscene.add(ambientLight);\nconst dirLight = new THREE.DirectionalLight(0xffffff, 0.8);\ndirLight.position.set(5, 10, 5);\ndirLight.castShadow = true;\nscene.add(dirLight);\n\n// Player (sphere)\nconst playerGeo = new THREE.SphereGeometry(0.5, 32, 32);\nconst playerMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });\nconst player = new THREE.Mesh(playerGeo, playerMat);\nplayer.castShadow = true;\nscene.add(player);\n\n// Ground\nconst groundGeo = new THREE.PlaneGeometry(20, 20);\nconst groundMat = new THREE.MeshStandardMaterial({ color: 0x22c55e });\nconst ground = new THREE.Mesh(groundGeo, groundMat);\nground.rotation.x = -Math.PI / 2;\nground.receiveShadow = true;\nscene.add(ground);\n\ncamera.position.set(0, 5, 10);\ncamera.lookAt(0, 0, 0);\n\n// Input handling\nconst keys = {};\nwindow.addEventListener("keydown", e => keys[e.code] = true);\nwindow.addEventListener("keyup", e => keys[e.code] = false);\n\n// Game loop\nconst velocity = new THREE.Vector3();\nfunction animate() {\n  requestAnimationFrame(animate);\n\n  // Movement\n  if (keys["ArrowLeft"])  velocity.x -= 0.01;\n  if (keys["ArrowRight"]) velocity.x += 0.01;\n  if (keys["ArrowUp"])    velocity.z -= 0.01;\n  if (keys["ArrowDown"])  velocity.z += 0.01;\n\n  velocity.multiplyScalar(0.9); // friction\n  player.position.add(velocity);\n\n  renderer.render(scene, camera);\n}\nanimate();\n```', duration: '90 min' },
      ],
      quiz: {
        title: '3D Game Dev Quiz',
        questions: [
          { prompt: 'What is a Scene in Three.js?', options: ['A camera', 'A container that holds all 3D objects, lights and cameras', 'A renderer', 'A geometry'], correctOptionIndex: 1, points: 1 }
        ],
        passingScore: 70
      }
    }]
  },
];

async function main() {
  await client.connect();
  const db = client.db('pugi');

  // Add instructorId from a tutor user
  const tutor = await db.collection('users').findOne({ role: 'tutor' });
  const instructorId = tutor?._id || null;

  let added = 0;
  for (const course of newCourses) {
    const exists = await db.collection('courses').findOne({ title: course.title });
    if (exists) {
      console.log(`⏭ Skipping: ${course.title}`);
      continue;
    }
    await db.collection('courses').insertOne({
      ...course,
      instructorId,
      enrolledStudents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`✅ Added: ${course.title} (${course.level})`);
    added++;
  }

  await client.close();
  console.log(`\n🎉 Done! Added ${added} new courses.`);
}

main().catch(console.error);
