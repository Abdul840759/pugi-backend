import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Course } from './models/Course';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pugi';

const richContent: Record<string, string> = {

'Middleware and Error Handling': `# Middleware and Error Handling

Middleware is the backbone of Express applications. Every request that comes into your server passes through a chain of middleware functions before getting a response. Understanding middleware is what separates a basic Express app from a professional, production-ready API.

## What is Middleware?

A middleware function is any function with access to the request object (\`req\`), the response object (\`res\`), and the \`next\` function. It can:
- Execute any code
- Modify \`req\` and \`res\`
- End the request-response cycle
- Call the next middleware in the stack

\`\`\`js
// The anatomy of middleware
function myMiddleware(req, res, next) {
  // 1. Do something with the request
  console.log(\`Incoming: \${req.method} \${req.path}\`);

  // 2. Optionally modify req or res
  req.timestamp = new Date().toISOString();

  // 3. Either end the cycle or pass to next middleware
  next(); // MUST call next() or the request hangs forever
}

app.use(myMiddleware); // apply to ALL routes
\`\`\`

## Types of Middleware

### Application-level middleware — applies to all routes

\`\`\`ts
import express from "express";
import cors    from "cors";

const app = express();

// Built-in middleware
app.use(express.json());                         // parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // parse form data

// Third-party middleware
app.use(cors({ origin: "http://localhost:5174", credentials: true }));

// Custom middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(\`→ \${req.method} \${req.path}\`);

  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(\`← \${res.statusCode} \${req.path} (\${ms}ms)\`);
  });

  next();
});
\`\`\`

### Route-level middleware — applies to specific routes

\`\`\`ts
// Only applies to this one route
app.get("/api/admin", authenticate, authorizeAdmin, (req, res) => {
  res.json({ adminData: "..." });
});

// Applies to all routes under /api/courses
router.use(authenticate);
router.get("/", getAllCourses);    // protected
router.post("/", createCourse);   // protected
\`\`\`

### Error-handling middleware — must have 4 parameters

\`\`\`ts
// MUST have exactly 4 parameters — this is how Express identifies error middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e: any) => e.message);
    return res.status(400).json({ message: "Validation failed", errors });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({ message: \`\${field} already exists\` });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError")  return res.status(401).json({ message: "Invalid token" });
  if (err.name === "TokenExpiredError")  return res.status(401).json({ message: "Token expired" });

  // Cast error (invalid MongoDB ID)
  if (err.name === "CastError") return res.status(400).json({ message: "Invalid ID format" });

  // Default
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});
\`\`\`

## Authentication Middleware

\`\`\`ts
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Extend Request to include user
export interface AuthRequest extends Request {
  user?: { id: string; role: string; name: string };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const token = header.slice(7); // remove "Bearer "

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = { id: payload.id, role: payload.role, name: payload.name };
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please login again" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: \`Access denied. Required role: \${roles.join(" or ")}\`
      });
    }
    next();
  };
}

// Usage
router.get("/admin/stats",    authenticate, authorize("admin"),         getAdminStats);
router.post("/courses",       authenticate, authorize("tutor", "admin"), createCourse);
router.get("/courses/:id",    authenticate,                              getCourse); // any authenticated user
\`\`\`

## The Async Handler Pattern

Without this, any async error will crash your server:

\`\`\`ts
// The problem — uncaught async errors crash the process
router.get("/courses", async (req, res) => {
  const courses = await Course.find(); // if this throws, Express won't catch it
  res.json(courses);
});

// Solution 1 — try/catch everywhere (verbose)
router.get("/courses", async (req, res, next) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    next(err); // pass to error middleware
  }
});

// Solution 2 — wrapper function (clean)
const asyncHandler = (fn: Function) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Now you can write clean async routes
router.get("/courses",    asyncHandler(async (req, res) => {
  const courses = await Course.find({ status: "published" });
  res.json(courses);
}));

router.get("/courses/:id", asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Not found" });
  res.json(course);
}));
\`\`\`

## Request Validation Middleware

\`\`\`ts
import { z, ZodSchema } from "zod";

function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data; // replace with parsed, safe data
    next();
  };
}

const createCourseSchema = z.object({
  title:       z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  category:    z.enum(["Frontend", "Backend", "DevOps", "Design", "AI/ML"]),
  level:       z.enum(["beginner", "intermediate", "advanced"]),
  duration:    z.string().optional(),
});

router.post("/courses", authenticate, authorize("tutor"), validate(createCourseSchema), createCourse);
\`\`\`

## Rate Limiting

\`\`\`ts
import rateLimit from "express-rate-limit";

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  message: { message: "Too many requests, please try again in 15 minutes" },
});

// Strict limit for auth routes (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Too many login attempts, try again in 15 minutes" },
  skipSuccessfulRequests: true, // don't count successful logins
});

app.use("/api",            apiLimiter);
app.use("/api/auth/login", authLimiter);
\`\`\``,

'JWT Auth from Scratch': `# JWT Authentication from Scratch

Authentication is the process of verifying who a user is. Authorization is verifying what they're allowed to do. JWT (JSON Web Token) is the most popular mechanism for both in modern REST APIs. Understanding how to implement JWT auth properly — including refresh tokens, token rotation, and security best practices — is an essential backend skill.

## How JWT Works

\`\`\`
1. User submits email + password to POST /api/auth/login
2. Server verifies the password against the hashed version in the database
3. If valid, server creates a signed JWT containing the user's ID and role
4. Server sends the JWT back to the client
5. Client stores the JWT (localStorage or httpOnly cookie)
6. For every subsequent request, client sends JWT in Authorization header
7. Server verifies the JWT signature on every protected route
8. If valid, request proceeds; if invalid or expired, server returns 401
\`\`\`

## JWT Structure

A JWT has three parts separated by dots, each base64-encoded:

\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsInJvbGUiOiJsZWFybmVyIiwiaWF0IjoxNjk5MDAwMDAwLCJleHAiOjE2OTkwMDA5MDB9.abc123signature
|___________ Header ______________|.___________________ Payload ___________________________|.___ Signature ___|

Header:  { "alg": "HS256", "typ": "JWT" }
Payload: { "id": "123", "role": "learner", "iat": 1699000000, "exp": 1699000900 }
Signature: HMACSHA256(base64(header) + "." + base64(payload), secret)
\`\`\`

The signature is what makes JWT secure — it's created using a secret key only the server knows. If anyone tampers with the payload, the signature won't match and verification fails.

**Important:** JWT payloads are base64-encoded, NOT encrypted. Anyone can decode them. Never put sensitive data (passwords, credit cards) in a JWT payload.

## Access Tokens vs Refresh Tokens

\`\`\`
Access Token:
  - Short-lived: 15 minutes
  - Sent with every API request
  - If stolen, expires quickly
  - Stored in memory (or localStorage)

Refresh Token:
  - Long-lived: 7-30 days
  - Used ONLY to get new access tokens
  - Stored in httpOnly cookie or database
  - Rotated on every use
  - Can be revoked (stored in DB)
\`\`\`

## Complete Auth Implementation

\`\`\`ts
// src/routes/auth.ts
import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt    from "jsonwebtoken";
import User   from "../models/User";

const router = Router();

// Helper — create both tokens
function createTokens(userId: string, role: string) {
  const accessToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
}

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password, role = "learner" } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Check if email already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name:     name.trim(),
      email:    email.toLowerCase().trim(),
      password: hashedPassword,
      role:     ["learner", "tutor"].includes(role) ? role : "learner",
    });

    // Create tokens
    const { accessToken, refreshToken } = createTokens(user.id, user.role);

    // Store refresh token hash in database
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      accessToken,
      refreshToken,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user (include password which is normally excluded)
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    // Always run bcrypt.compare even if user not found — prevents timing attacks
    // that reveal whether an email is registered
    const dummyHash = "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpRBnY5z4lLUGa";
    const isValid   = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, dummyHash);

    if (!user || !isValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in" });
    }

    const { accessToken, refreshToken } = createTokens(user.id, user.role);

    // Rotate refresh token
    user.refreshToken = refreshToken;
    user.lastActiveDate = new Date();
    await user.save();

    res.json({
      accessToken,
      refreshToken,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
        xp:    user.xp,
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

// POST /api/auth/refresh
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: "Refresh token required" });

    // Verify the refresh token
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;

    // Check it matches what's stored (token rotation)
    const user = await User.findById(payload.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid or revoked refresh token" });
    }

    // Issue new tokens
    const tokens = createTokens(user.id, user.role);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json(tokens);
  } catch {
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
});

// POST /api/auth/logout
router.post("/logout", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      // Invalidate the refresh token in the database
      await User.findOneAndUpdate(
        { refreshToken },
        { $unset: { refreshToken: 1 } }
      );
    }
    res.json({ message: "Logged out successfully" });
  } catch {
    res.json({ message: "Logged out" });
  }
});

export default router;
\`\`\`

## OTP Email Verification

\`\`\`ts
import nodemailer from "nodemailer";
import crypto     from "crypto";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate 6-digit OTP
function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// POST /api/auth/send-otp
router.post("/send-otp", async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const otp    = generateOTP();
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.otp       = otp;
  user.otpExpiry = expiry;
  await user.save();

  await transporter.sendMail({
    from:    \`"PUGI LMS" <\${process.env.EMAIL_USER}>\`,
    to:      email,
    subject: "Your PUGI verification code",
    html: \`
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
        <h2>Verify your email</h2>
        <p>Your one-time verification code is:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #3b82f6;">
          \${otp}
        </div>
        <p>This code expires in 10 minutes.</p>
        <p>If you didn't request this, ignore this email.</p>
      </div>
    \`,
  });

  res.json({ message: "OTP sent to your email" });
});

// POST /api/auth/verify-otp
router.post("/verify-otp", async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }
  if (!user.otpExpiry || user.otpExpiry < new Date()) {
    return res.status(400).json({ message: "OTP has expired" });
  }

  user.emailVerified = true;
  user.otp           = undefined;
  user.otpExpiry     = undefined;
  await user.save();

  res.json({ message: "Email verified successfully" });
});
\`\`\``,

'Lists, Loops, and Functions': `# Lists, Loops, and Functions

Lists and functions are two of the most important building blocks in Python. Lists let you store collections of data, and functions let you organize and reuse your logic. Together with loops, they allow you to build programs that process real data at scale.

## Lists — Ordered Collections

A list is an ordered, mutable sequence. It can hold any type of data, and you can change it after creation:

\`\`\`python
# Creating lists
fruits   = ["apple", "banana", "mango", "grape"]
numbers  = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
mixed    = [1, "two", 3.0, True, None, [4, 5]]  # any types
empty    = []
repeated = [0] * 5  # [0, 0, 0, 0, 0]

# Reading elements (zero-indexed)
print(fruits[0])   # "apple"
print(fruits[-1])  # "grape" (last element)
print(fruits[-2])  # "mango" (second to last)

# Slicing — fruits[start:stop:step]
print(fruits[1:3])    # ["banana", "mango"] (index 1 and 2, NOT 3)
print(fruits[:2])     # ["apple", "banana"] (from beginning)
print(fruits[2:])     # ["mango", "grape"]  (to end)
print(fruits[::2])    # ["apple", "mango"]  (every other)
print(fruits[::-1])   # ["grape", "mango", "banana", "apple"] (reversed)

# Length
print(len(fruits))  # 4
\`\`\`

## Modifying Lists

\`\`\`python
fruits = ["apple", "banana", "mango"]

# Add elements
fruits.append("grape")          # add to end
fruits.insert(1, "kiwi")        # insert at specific index
fruits.extend(["pear", "plum"]) # add multiple elements

# Remove elements
fruits.remove("banana")   # remove by value (first occurrence)
last   = fruits.pop()     # remove and return last element
second = fruits.pop(1)    # remove and return element at index 1
del fruits[0]             # delete by index (no return)
fruits.clear()            # remove all elements

# Modify in place
fruits.sort()                    # alphabetical
fruits.sort(reverse=True)        # reverse alphabetical
fruits.sort(key=lambda x: len(x)) # sort by length
fruits.reverse()                 # reverse order
\`\`\`

## List Comprehensions — Python's Secret Weapon

List comprehensions create new lists in a single, readable line:

\`\`\`python
# Basic syntax: [expression for item in iterable]
squares = [x**2 for x in range(1, 11)]
# [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]

# With condition: [expression for item in iterable if condition]
evens   = [x for x in range(20) if x % 2 == 0]
# [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]

odds_squared = [x**2 for x in range(10) if x % 2 != 0]
# [1, 9, 25, 49, 81]

# Transforming strings
words     = ["hello", "world", "python"]
uppercase = [w.upper() for w in words]
# ["HELLO", "WORLD", "PYTHON"]

lengths = [len(w) for w in words]
# [5, 5, 6]

# Nested comprehension
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat   = [num for row in matrix for num in row]
# [1, 2, 3, 4, 5, 6, 7, 8, 9]

# Practical example
students = [
  {"name": "Amara",  "score": 92},
  {"name": "David",  "score": 58},
  {"name": "Leah",   "score": 85},
  {"name": "Victor", "score": 61},
]

passed_names = [s["name"] for s in students if s["score"] >= 70]
# ["Amara", "Leah"]

scores_out_of_10 = [round(s["score"] / 10, 1) for s in students]
# [9.2, 5.8, 8.5, 6.1]
\`\`\`

## Loops — Repeating Actions

\`\`\`python
fruits = ["apple", "banana", "mango", "grape"]

# for loop — iterate over any sequence
for fruit in fruits:
    print(fruit)

# enumerate — get both index and value
for index, fruit in enumerate(fruits):
    print(f"{index}: {fruit}")

for index, fruit in enumerate(fruits, start=1):  # start counting from 1
    print(f"{index}. {fruit}")

# range — generate sequences of numbers
for i in range(5):          # 0, 1, 2, 3, 4
    print(i)

for i in range(1, 11):      # 1 to 10
    print(i)

for i in range(0, 20, 2):   # 0, 2, 4, ..., 18 (step 2)
    print(i)

for i in range(10, 0, -1):  # 10, 9, 8, ..., 1 (countdown)
    print(i)

# while loop — repeat while condition is true
count = 0
while count < 5:
    print(f"Count: {count}")
    count += 1

# while with user input
while True:
    answer = input("Type 'quit' to exit: ")
    if answer.lower() == "quit":
        break
    print(f"You typed: {answer}")

# Loop control
for i in range(10):
    if i == 3:
        continue   # skip 3, continue to 4
    if i == 7:
        break      # stop at 7
    print(i)
# Output: 0, 1, 2, 4, 5, 6

# for...else — else runs if loop completed without break
for fruit in fruits:
    if fruit == "dragonfruit":
        print("Found it!")
        break
else:
    print("Dragonfruit not in list")  # this runs
\`\`\`

## Functions — Reusable Code Blocks

\`\`\`python
# Basic function
def greet(name):
    """Return a greeting. (This is a docstring)"""
    return f"Hello, {name}!"

print(greet("Amara"))  # "Hello, Amara!"

# Multiple parameters
def calculate_grade(score, max_score=100, passing_score=70):
    """Calculate grade with letter and pass/fail."""
    percentage = (score / max_score) * 100

    if percentage >= 90:   letter = "A"
    elif percentage >= 80: letter = "B"
    elif percentage >= 70: letter = "C"
    elif percentage >= 60: letter = "D"
    else:                  letter = "F"

    return {
        "score":      score,
        "percentage": round(percentage, 1),
        "letter":     letter,
        "passed":     percentage >= passing_score,
    }

result = calculate_grade(85)
print(result)  # {"score": 85, "percentage": 85.0, "letter": "B", "passed": True}

result2 = calculate_grade(45, max_score=50, passing_score=60)
print(result2["passed"])  # False (45/50 = 90% but... wait, 90 >= 60, True actually)

# *args — variable positional arguments
def add(*numbers):
    """Add any number of values."""
    return sum(numbers)

print(add(1, 2))           # 3
print(add(1, 2, 3, 4, 5)) # 15

# **kwargs — variable keyword arguments
def create_profile(**fields):
    """Create a user profile from keyword arguments."""
    required = ["name", "email"]
    for field in required:
        if field not in fields:
            raise ValueError(f"Missing required field: {field}")
    return fields

profile = create_profile(name="Amara", email="amara@pugi.com", role="tutor", xp=1250)
print(profile)

# Lambda functions — anonymous one-line functions
square  = lambda x: x ** 2
add     = lambda x, y: x + y
is_even = lambda x: x % 2 == 0

print(square(5))   # 25
print(add(3, 4))   # 7

# Lambdas are often used with built-in functions
numbers = [5, 2, 8, 1, 9, 3]
print(sorted(numbers))                        # [1, 2, 3, 5, 8, 9]
print(sorted(numbers, reverse=True))          # [9, 8, 5, 3, 2, 1]
print(sorted(students, key=lambda s: s["score"]))  # sort by score
print(sorted(students, key=lambda s: s["score"], reverse=True)) # highest first

# filter and map (less common than comprehensions)
evens    = list(filter(lambda x: x % 2 == 0, numbers))   # [2, 8]
doubled  = list(map(lambda x: x * 2, numbers))            # [10, 4, 16, 2, 18, 6]
\`\`\`

## Practical Example — Student Analytics

\`\`\`python
def analyze_class(students):
    """
    Analyze a class of students.

    Args:
        students: list of dicts with 'name' and 'scores' keys

    Returns:
        dict with class statistics and ranked results
    """
    if not students:
        return {"error": "No students provided"}

    # Calculate stats for each student
    results = []
    for student in students:
        scores  = student["scores"]
        average = sum(scores) / len(scores)
        results.append({
            "name":     student["name"],
            "scores":   scores,
            "average":  round(average, 1),
            "highest":  max(scores),
            "lowest":   min(scores),
            "grade":    "A" if average >= 90 else "B" if average >= 80 else "C" if average >= 70 else "F",
            "passed":   average >= 70,
        })

    # Sort by average descending
    results.sort(key=lambda r: r["average"], reverse=True)

    # Class statistics
    all_averages = [r["average"] for r in results]
    passed       = [r for r in results if r["passed"]]
    failed       = [r for r in results if not r["passed"]]

    return {
        "students":        results,
        "class_average":   round(sum(all_averages) / len(all_averages), 1),
        "highest_average": max(all_averages),
        "lowest_average":  min(all_averages),
        "pass_count":      len(passed),
        "fail_count":      len(failed),
        "pass_rate":       f"{len(passed) / len(results) * 100:.0f}%",
        "top_student":     results[0]["name"],
    }
\`\`\``,

'JOINs and Aggregations': `# JOINs and Aggregations

JOINs and aggregations are what make SQL truly powerful. With them, you can combine data from multiple tables and compute statistics across thousands of rows in a single query. These are the techniques used to build dashboards, leaderboards, reports, and analytics.

## Understanding Relationships Between Tables

Real databases have multiple related tables. Let's use the PUGI database structure:

\`\`\`
users          enrollments        courses
------         -----------        -------
id             id                 id
name           user_id ──────→    title
email          course_id ──→ id   category
role           progress           level
xp             completed_lessons  instructor
               last_accessed      rating
               enrolled_at        status
\`\`\`

Without JOINs, you'd have to make multiple queries and combine the results in your application code. JOINs let the database do this work — much more efficiently.

## INNER JOIN — Only Matching Rows

An INNER JOIN returns rows that have matching values in BOTH tables:

\`\`\`sql
-- Which courses is each user enrolled in?
SELECT
  u.name         AS student_name,
  u.email,
  c.title        AS course_title,
  c.category,
  e.progress,
  e.enrolled_at
FROM enrollments e
INNER JOIN users   u ON e.user_id   = u.id
INNER JOIN courses c ON e.course_id = c.id
ORDER BY u.name, e.enrolled_at DESC;

-- Only learners enrolled in Frontend courses
SELECT
  u.name,
  c.title,
  c.level,
  e.progress
FROM enrollments e
INNER JOIN users   u ON e.user_id   = u.id
INNER JOIN courses c ON e.course_id = c.id
WHERE u.role = 'learner'
  AND c.category = 'Frontend'
ORDER BY e.progress DESC;
\`\`\`

## LEFT JOIN — All Rows from Left Table

A LEFT JOIN returns ALL rows from the left (first) table, with NULL values for columns from the right table where there's no match:

\`\`\`sql
-- All learners and how many courses they're enrolled in (including those with 0)
SELECT
  u.name,
  u.email,
  u.xp,
  COUNT(e.id) AS courses_enrolled
FROM users u
LEFT JOIN enrollments e ON u.id = e.user_id
WHERE u.role = 'learner'
GROUP BY u.id, u.name, u.email, u.xp
ORDER BY courses_enrolled DESC, u.xp DESC;

-- Find learners who have NEVER enrolled in anything
SELECT u.name, u.email, u.created_at
FROM users u
LEFT JOIN enrollments e ON u.id = e.user_id
WHERE u.role = 'learner'
  AND e.id IS NULL  -- no matching enrollment = never enrolled
ORDER BY u.created_at DESC;

-- All courses with enrollment count (including courses with 0 enrollments)
SELECT
  c.title,
  c.category,
  c.level,
  c.rating,
  COUNT(e.id) AS total_enrollments,
  COALESCE(AVG(e.progress), 0) AS avg_progress
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
WHERE c.status = 'published'
GROUP BY c.id, c.title, c.category, c.level, c.rating
ORDER BY total_enrollments DESC;
\`\`\`

## Aggregate Functions

\`\`\`sql
-- COUNT
SELECT COUNT(*)            FROM users;              -- total rows
SELECT COUNT(id)           FROM users;              -- rows where id is not null
SELECT COUNT(DISTINCT role) FROM users;             -- unique roles

-- SUM, AVG, MIN, MAX
SELECT
  SUM(xp)                   AS total_xp_in_system,
  AVG(xp)                   AS average_xp,
  MIN(xp)                   AS lowest_xp,
  MAX(xp)                   AS highest_xp,
  ROUND(AVG(xp), 1)         AS avg_xp_rounded
FROM users
WHERE role = 'learner';

-- ROUND, CEIL, FLOOR
SELECT ROUND(AVG(rating), 2) FROM courses;   -- 4.73
SELECT CEIL(AVG(rating))     FROM courses;   -- 5
SELECT FLOOR(AVG(rating))    FROM courses;   -- 4

-- String aggregation — combine values into one string
SELECT STRING_AGG(name, ', ' ORDER BY name) AS learner_names
FROM users WHERE role = 'learner';
-- "Amara, David, Leah, Victor"
\`\`\`

## GROUP BY — Aggregating by Category

\`\`\`sql
-- Count users by role
SELECT role, COUNT(*) AS total
FROM users
GROUP BY role
ORDER BY total DESC;
-- admin   1
-- tutor   5
-- learner 10

-- Average rating per category
SELECT
  category,
  COUNT(*)              AS course_count,
  ROUND(AVG(rating), 2) AS avg_rating,
  MIN(rating)           AS lowest_rating,
  MAX(rating)           AS highest_rating
FROM courses
WHERE status = 'published'
GROUP BY category
ORDER BY avg_rating DESC;

-- Enrollment statistics per course
SELECT
  c.title,
  c.category,
  COUNT(e.id)                        AS total_students,
  ROUND(AVG(e.progress), 1)          AS avg_progress,
  COUNT(CASE WHEN e.progress = 100 THEN 1 END) AS completions,
  COUNT(CASE WHEN e.progress > 0 AND e.progress < 100 THEN 1 END) AS in_progress
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
GROUP BY c.id, c.title, c.category
ORDER BY total_students DESC;
\`\`\`

## HAVING — Filtering Groups

WHERE filters individual rows BEFORE grouping. HAVING filters groups AFTER aggregation:

\`\`\`sql
-- Categories with more than 2 published courses
SELECT category, COUNT(*) AS course_count
FROM courses
WHERE status = 'published'    -- filter rows first
GROUP BY category
HAVING COUNT(*) >= 2          -- then filter groups
ORDER BY course_count DESC;

-- Courses with more than 10 enrolled students AND avg progress above 50%
SELECT
  c.title,
  COUNT(e.id)           AS students,
  AVG(e.progress)       AS avg_progress
FROM courses c
JOIN enrollments e ON c.id = e.course_id
GROUP BY c.id, c.title
HAVING COUNT(e.id) > 10
   AND AVG(e.progress) > 50
ORDER BY avg_progress DESC;

-- Learners who have completed more than 3 courses
SELECT
  u.name,
  u.xp,
  COUNT(*) AS completed_courses
FROM users u
JOIN enrollments e ON u.id = e.user_id
WHERE u.role = 'learner'
  AND e.progress = 100
GROUP BY u.id, u.name, u.xp
HAVING COUNT(*) > 3
ORDER BY completed_courses DESC;
\`\`\`

## Subqueries

\`\`\`sql
-- Courses with above-average rating
SELECT title, rating, category
FROM courses
WHERE rating > (SELECT AVG(rating) FROM courses WHERE status = 'published')
ORDER BY rating DESC;

-- Learners who are enrolled in the highest-rated course
SELECT u.name, u.email
FROM users u
WHERE u.id IN (
  SELECT e.user_id
  FROM enrollments e
  WHERE e.course_id = (
    SELECT id FROM courses ORDER BY rating DESC LIMIT 1
  )
);

-- Each learner's most recently accessed course
SELECT DISTINCT ON (e.user_id)
  u.name,
  c.title AS last_course,
  e.progress,
  e.last_accessed
FROM enrollments e
JOIN users   u ON e.user_id   = u.id
JOIN courses c ON e.course_id = c.id
WHERE u.role = 'learner'
ORDER BY e.user_id, e.last_accessed DESC;
\`\`\`

## Practical Report Queries

\`\`\`sql
-- Complete learner leaderboard
SELECT
  u.name,
  u.email,
  u.xp,
  FLOOR(u.xp / 500) + 1                              AS level,
  COUNT(e.id)                                         AS courses_enrolled,
  ROUND(AVG(e.progress), 1)                           AS avg_progress,
  SUM(CASE WHEN e.progress = 100 THEN 1 ELSE 0 END)  AS completed,
  MAX(e.last_accessed)                                AS last_active
FROM users u
LEFT JOIN enrollments e ON u.id = e.user_id
WHERE u.role = 'learner'
GROUP BY u.id, u.name, u.email, u.xp
ORDER BY u.xp DESC
LIMIT 20;

-- Tutor performance dashboard
SELECT
  u.name         AS tutor,
  u.email,
  COUNT(DISTINCT c.id)  AS courses_created,
  SUM(e.user_id IS NOT NULL) AS total_students,
  ROUND(AVG(c.rating), 2)    AS avg_course_rating,
  ROUND(AVG(e.progress), 1)  AS avg_student_progress
FROM users u
LEFT JOIN courses     c ON c.instructor_id = u.id AND c.status = 'published'
LEFT JOIN enrollments e ON e.course_id     = c.id
WHERE u.role = 'tutor'
GROUP BY u.id, u.name, u.email
ORDER BY total_students DESC;
\`\`\``,

'Branching and Merging': `# Branching and Merging

Branching is one of Git's most powerful features. It lets multiple people work on different features simultaneously without interfering with each other. Merging brings that work back together. Understanding branches is what allows teams of hundreds of developers to collaborate on the same codebase.

## Why Branches?

Without branches, everyone would work on the same code. Developer A is adding a feature, Developer B is fixing a bug — they'd constantly overwrite each other's work. With branches:

\`\`\`
main ──────●──────────────────────●──── (stable, always deployable)
            \\                    /
feat/search  ●──●──●──●──●──●──● (feature branch — isolated work)
\`\`\`

## Creating and Switching Branches

\`\`\`bash
# List all branches
git branch            # local branches
git branch -a         # all branches (including remote)
git branch -v         # with last commit info

# Create a branch
git branch feat/course-search    # create (stay on current branch)
git checkout -b feat/course-search  # create AND switch
git switch -c feat/course-search    # modern syntax (same result)

# Switch branches
git checkout main           # switch to main
git switch main             # modern syntax

# Switch to previous branch
git switch -                # go back to where you were

# Create branch from specific commit or tag
git checkout -b hotfix/login-bug main  # branch off main specifically
git checkout -b v1.1 v1.0-tag          # branch off a tag
\`\`\`

## The Feature Branch Workflow

This is how professional teams work:

\`\`\`bash
# 1. Always start from an up-to-date main
git checkout main
git pull origin main

# 2. Create a feature branch
git checkout -b feat/live-classes

# 3. Work on your feature
# ... make changes to files ...
git add .
git commit -m "feat: add LiveClass model with tutorId and meetLink"

# ... more changes ...
git add src/routes/liveClasses.ts
git commit -m "feat: add POST /api/live-classes route for tutors"

git add src/routes/liveClasses.ts
git commit -m "feat: add GET /api/live-classes/search for learners"

# 4. Push branch to GitHub
git push origin feat/live-classes

# 5. Open a Pull Request on GitHub for code review

# 6. After approval, merge into main
git checkout main
git merge feat/live-classes

# 7. Push the updated main
git push origin main

# 8. Delete the feature branch (done!)
git branch -d feat/live-classes       # local
git push origin --delete feat/live-classes  # remote
\`\`\`

## Types of Merges

**Fast-forward merge** — happens when main hasn't moved since branching:

\`\`\`bash
# Before:
main:         A──B
feat/login:       ──C──D──E

# After fast-forward merge:
main:         A──B──C──D──E
# No merge commit — history is linear
\`\`\`

**Three-way merge** — happens when both branches have new commits:

\`\`\`bash
# Before:
main:         A──B──F──G
feat/login:       ──C──D──E

# After merge:
main:         A──B──F──G──M  (M is the merge commit)
                    \\    /
feat/login:       ──C──D──E

git merge --no-ff feat/login  # force a merge commit even if fast-forward is possible
\`\`\`

## Resolving Merge Conflicts

Conflicts happen when the same part of a file was changed on both branches:

\`\`\`bash
git checkout main
git merge feat/new-auth
# Auto-merging src/routes/auth.ts
# CONFLICT (content): Merge conflict in src/routes/auth.ts
# Automatic merge failed; fix conflicts and then commit the result.
\`\`\`

Open the conflicted file — Git marks the conflicts:

\`\`\`
<<<<<<< HEAD (your current branch — main)
const JWT_EXPIRY = "15m";
const REFRESH_EXPIRY = "7d";
=======
const JWT_EXPIRY = "30m";
const REFRESH_EXPIRY = "14d";
>>>>>>> feat/new-auth (incoming branch)
\`\`\`

Edit to resolve — keep what you want:

\`\`\`ts
// Resolved — using values from feat/new-auth after team discussion
const JWT_EXPIRY = "30m";
const REFRESH_EXPIRY = "14d";
\`\`\`

\`\`\`bash
# Mark as resolved
git add src/routes/auth.ts

# Complete the merge
git commit -m "merge: feat/new-auth with updated token expiry times"
\`\`\`

## Rebasing — Linear History

Rebase replays your commits on top of another branch, creating a cleaner linear history:

\`\`\`bash
# Before rebase:
main:         A──B──C──D
feat/quiz:        ──E──F──G

# Rebase feat/quiz onto main
git checkout feat/quiz
git rebase main

# After rebase:
main:         A──B──C──D
feat/quiz:                ──E'──F'──G'
# Commits E, F, G are replayed as new commits E', F', G' on top of D
\`\`\`

\`\`\`bash
# Golden rule: NEVER rebase commits that have been pushed to a shared branch
# Only rebase local commits that others haven't seen yet

# Interactive rebase — edit, squash, reorder commits
git rebase -i HEAD~3  # interactively rebase last 3 commits

# In the editor:
# pick a1b2c3 feat: add quiz model
# squash d4e5f6 fix: typo in quiz model  ← squash into previous
# pick g7h8i9 feat: add quiz routes
\`\`\`

## Undoing Changes

\`\`\`bash
# Undo changes in working tree (before staging)
git restore filename.ts          # restore one file
git restore .                    # restore all files

# Unstage files (keep changes in working tree)
git restore --staged filename.ts
git reset HEAD filename.ts       # older syntax

# Undo commits (keep changes)
git reset --soft HEAD~1   # undo 1 commit, keep changes staged
git reset --mixed HEAD~1  # undo 1 commit, keep changes unstaged (default)
git reset --soft HEAD~3   # undo last 3 commits, keep all changes staged

# Undo commits and DISCARD changes (DESTRUCTIVE)
git reset --hard HEAD~1   # PERMANENTLY delete last commit and its changes
git reset --hard origin/main  # reset to match remote (discard all local commits)

# Safe undo — create a new commit that reverses a previous one
git revert abc1234       # revert a specific commit
git revert HEAD          # revert the last commit
git revert HEAD~2..HEAD  # revert last 2 commits
# This is safe for shared branches — doesn't rewrite history

# Temporarily save work without committing
git stash                    # stash current changes
git stash push -m "WIP: quiz feature half done"  # with a message
git stash list               # see all stashes
git stash pop                # apply most recent stash and delete it
git stash apply stash@{1}   # apply specific stash (keep it)
git stash drop stash@{0}    # delete a stash
git stash clear              # delete all stashes
\`\`\`

## Git Tags — Marking Releases

\`\`\`bash
# Annotated tag — for releases (recommended)
git tag -a v1.0.0 -m "Initial release — PUGI LMS v1.0"
git tag -a v1.1.0 -m "Add live classes and quiz features"

# Lightweight tag — just a bookmark
git tag v1.0.0-beta

# List tags
git tag
git tag -l "v1.*"    # filter by pattern

# Push tags to remote
git push origin v1.0.0       # specific tag
git push origin --tags        # all tags

# Create branch from tag
git checkout -b hotfix/v1.0.1 v1.0.0
\`\`\``,

'Containers and Docker': `# Containers and Docker

Docker has revolutionized how software is built, shipped, and run. Before Docker, deploying an application meant hours of environment setup, and "it works on my machine" was a constant frustration. Docker packages everything an application needs into a single portable unit called a container.

## The Problem Docker Solves

\`\`\`
Without Docker — the deployment nightmare:
Developer builds app on Node.js 18, macOS, MongoDB 6
Staging server runs Node.js 16, Ubuntu, MongoDB 5
Production runs Node.js 20, CentOS, MongoDB 7
Result: Different behaviour everywhere. Debugging hell.

With Docker — consistency everywhere:
Build once → run anywhere
Same container on developer laptop = same container in production
New developer joins: docker compose up — running in 2 minutes
\`\`\`

## Containers vs Virtual Machines

\`\`\`
Virtual Machine:              Container:
┌─────────────────┐           ┌─────────────────┐
│   Application   │           │   Application   │
├─────────────────┤           ├─────────────────┤
│   Dependencies  │           │   Dependencies  │
├─────────────────┤           ├─────────────────┤
│   Full OS (GB)  │           │   (shared host) │
├─────────────────┤           ├─────────────────┤
│   Hypervisor    │           │  Container Engine│
├─────────────────┤           ├─────────────────┤
│   Host OS       │           │   Host OS       │
└─────────────────┘           └─────────────────┘
Starts in minutes, ~GB        Starts in seconds, ~MB
\`\`\`

Containers share the host OS kernel — they're much lighter than VMs.

## Core Docker Concepts

**Image** — a read-only template (blueprint) for creating containers. Like a class in OOP.

**Container** — a running instance of an image. Like an object (instance) in OOP.

**Dockerfile** — a text file with instructions for building an image.

**Registry** — a place to store and share images. Docker Hub is the default public registry.

**Volume** — persistent storage that survives container restarts.

**Network** — how containers communicate with each other.

## Writing a Dockerfile

\`\`\`dockerfile
# The FROM instruction sets the base image
# Always use specific versions — not "latest"
FROM node:20-alpine

# Set the working directory inside the container
# All subsequent commands run from here
WORKDIR /app

# Copy package files BEFORE source code
# This is important for Docker layer caching:
# If package.json hasn't changed, npm install won't re-run
COPY package*.json ./

# Install dependencies
# npm ci is faster and more reliable than npm install for CI/CD
RUN npm ci --only=production

# Copy the rest of the source code
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

# Tell Docker which port the app listens on (documentation only)
EXPOSE 3001

# The command that runs when the container starts
# Use array form — not string form — to avoid shell interpretation issues
CMD ["node", "dist/index.js"]
\`\`\`

## Essential Docker Commands

\`\`\`bash
# Building images
docker build -t pugi-backend:1.0 .             # build from Dockerfile in current dir
docker build -t pugi-backend:1.0 ./backend     # build from a subdirectory
docker build --no-cache -t pugi-backend:1.0 .  # rebuild without cache

# Running containers
docker run pugi-backend:1.0                              # basic run
docker run -p 3001:3001 pugi-backend:1.0                 # map port host:container
docker run -d pugi-backend:1.0                           # detached (background)
docker run -d --name pugi-api pugi-backend:1.0           # give it a name
docker run -d -p 3001:3001 --env-file .env pugi-backend  # pass environment file

# Managing containers
docker ps                    # list running containers
docker ps -a                 # list all containers (including stopped)
docker stop pugi-api         # graceful stop
docker kill pugi-api         # force stop
docker start pugi-api        # start a stopped container
docker restart pugi-api      # restart
docker rm pugi-api           # delete stopped container
docker rm -f pugi-api        # force delete (even if running)

# Logs and debugging
docker logs pugi-api          # view logs
docker logs pugi-api -f       # follow logs in real time
docker logs pugi-api --tail 100  # last 100 lines

# Execute commands inside a running container
docker exec -it pugi-api sh          # open a shell
docker exec -it pugi-api node -e "console.log('hello')"

# Images
docker images                # list images
docker rmi pugi-backend:1.0  # remove image
docker image prune           # remove unused images

# System cleanup
docker system prune          # remove stopped containers, unused images, networks
docker system prune -a       # aggressive cleanup (all unused images too)
\`\`\`

## Docker Compose — Multi-Container Apps

Real applications need multiple services working together: the API, the database, maybe a cache. Docker Compose orchestrates them all:

\`\`\`yaml
# docker-compose.yml
version: '3.8'

services:
  # ── Backend API ─────────────────────────────────────
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: pugi-backend
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: production
      PORT: 3001
      MONGODB_URI: mongodb://mongo:27017/pugi
      JWT_SECRET: \${JWT_SECRET}
      JWT_REFRESH_SECRET: \${JWT_REFRESH_SECRET}
    depends_on:
      mongo:
        condition: service_healthy  # wait for MongoDB to be ready
    restart: unless-stopped
    volumes:
      - ./backend/logs:/app/logs  # persist logs

  # ── Frontend ─────────────────────────────────────────
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: pugi-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  # ── MongoDB ──────────────────────────────────────────
  mongo:
    image: mongo:7.0
    container_name: pugi-mongo
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: \${MONGO_PASSWORD}
      MONGO_INITDB_DATABASE: pugi
    volumes:
      - mongo_data:/data/db         # persist database across restarts
      - ./mongo-init.js:/docker-entrypoint-initdb.d/init.js
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

# Named volumes — managed by Docker, persist across container restarts
volumes:
  mongo_data:
    driver: local
\`\`\`

\`\`\`bash
# Docker Compose commands
docker compose up              # start all services (foreground)
docker compose up -d           # start in background
docker compose up --build      # rebuild images before starting
docker compose down            # stop and remove containers
docker compose down -v         # also remove volumes (deletes data!)
docker compose logs -f         # follow all service logs
docker compose logs -f backend # follow specific service logs
docker compose ps              # list container status
docker compose exec backend sh # shell into running container
docker compose restart backend # restart one service
\`\`\``,

'GitHub Actions CI/CD': `# GitHub Actions CI/CD

CI/CD (Continuous Integration / Continuous Delivery) is the practice of automatically testing, building, and deploying your code every time you push a change. GitHub Actions makes this easy — your workflows live right in your repository and run on GitHub's servers for free.

## Why CI/CD?

\`\`\`
Without CI/CD:
  Developer pushes code
  → Another developer manually pulls it
  → Runs tests manually
  → If tests pass, manually builds
  → Manually copies files to server
  → Hopes nothing breaks
  Time: Hours. Error-prone.

With CI/CD:
  Developer pushes code
  → GitHub Actions automatically:
      1. Installs dependencies
      2. Runs all tests
      3. Checks TypeScript types
      4. Builds the app
      5. Deploys to production (if on main branch)
  Time: Minutes. Consistent. Automatic.
\`\`\`

## GitHub Actions Core Concepts

**Workflow** — an automated process defined in a YAML file in \`.github/workflows/\`

**Event** — what triggers the workflow (push, pull_request, schedule, manual)

**Job** — a set of steps that run on the same machine (runner)

**Step** — a single task (run a command, use an action)

**Action** — a reusable piece of automation (like \`actions/checkout\`)

**Runner** — the machine that executes your jobs (GitHub provides Ubuntu, Windows, macOS)

## Your First Workflow

\`\`\`yaml
# .github/workflows/ci.yml
name: CI Pipeline

# When does this workflow run?
on:
  push:
    branches: [main, develop]   # on push to main or develop
  pull_request:
    branches: [main]             # on PRs targeting main

# What jobs does it run?
jobs:
  test:
    runs-on: ubuntu-latest  # GitHub-hosted Ubuntu runner

    steps:
      # 1. Check out the repository code
      - name: Checkout code
        uses: actions/checkout@v4

      # 2. Set up Node.js
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'  # cache node_modules between runs

      # 3. Install dependencies
      - name: Install dependencies
        run: npm ci

      # 4. Check TypeScript types
      - name: TypeScript check
        run: npx tsc --noEmit

      # 5. Run tests
      - name: Run tests
        run: npm test

      # 6. Build the project
      - name: Build
        run: npm run build
\`\`\`

## Matrix Strategy — Test Multiple Versions

\`\`\`yaml
jobs:
  test:
    runs-on: \${{ matrix.os }}

    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: [18, 20, 22]
      fail-fast: false  # don't cancel other jobs if one fails

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node }}
      - run: npm ci
      - run: npm test

# This runs 9 jobs: 3 OS × 3 Node versions = full compatibility matrix
\`\`\`

## Complete Backend CI/CD Pipeline

\`\`\`yaml
# .github/workflows/backend.yml
name: Backend CI/CD

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'          # only trigger when backend files change
      - '.github/workflows/**'
  pull_request:
    branches: [main]
    paths:
      - 'backend/**'

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}/pugi-backend

jobs:
  # ── Job 1: Test and Build ─────────────────────────────
  test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend

    services:
      mongo:
        image: mongo:7.0
        ports:
          - 27017:27017
        options: >-
          --health-cmd "mongosh --eval 'db.adminCommand(\"ping\")'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

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

      - name: Run tests
        run: npm test
        env:
          MONGODB_URI: mongodb://localhost:27017/pugi-test
          JWT_SECRET: test-secret-key
          JWT_REFRESH_SECRET: test-refresh-secret

      - name: Build
        run: npm run build

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: backend-dist
          path: backend/dist/
          retention-days: 1

  # ── Job 2: Docker Build and Push (only on main) ───────
  docker:
    needs: test  # only run if tests pass
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: \${{ env.REGISTRY }}
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Extract Docker metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}
          tags: |
            type=sha,prefix=sha-
            type=raw,value=latest

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: \${{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # ── Job 3: Deploy (only on main, after Docker push) ───
  deploy:
    needs: docker
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - name: Deploy to production server
        uses: appleboy/ssh-action@v1
        with:
          host:     \${{ secrets.PROD_SERVER_HOST }}
          username: \${{ secrets.PROD_SERVER_USER }}
          key:      \${{ secrets.PROD_SSH_KEY }}
          script: |
            # Pull the latest image
            docker pull \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:latest

            # Update the running container (zero-downtime with compose)
            cd /opt/pugi
            docker compose pull backend
            docker compose up -d --no-deps backend

            # Wait for health check
            sleep 10
            curl -f http://localhost:3001/api/health || exit 1
            echo "Deployment successful!"

      - name: Notify on success
        uses: 8398a7/action-slack@v3
        with:
          status: \${{ job.status }}
          text: "Backend deployed to production ✅"
        env:
          SLACK_WEBHOOK_URL: \${{ secrets.SLACK_WEBHOOK }}
        if: always()
\`\`\`

## Secrets and Environment Variables

\`\`\`yaml
# In your workflow, access secrets with \${{ secrets.NAME }}
- name: Deploy
  env:
    DB_PASSWORD: \${{ secrets.DB_PASSWORD }}
    JWT_SECRET: \${{ secrets.JWT_SECRET }}
  run: ./deploy.sh

# GitHub provides automatic secrets too:
# \${{ secrets.GITHUB_TOKEN }} — auth token for the repo
# \${{ github.sha }}          — the commit SHA
# \${{ github.actor }}        — the person who triggered the workflow
# \${{ github.ref }}          — the branch or tag ref
\`\`\`

**To add secrets:** GitHub repo → Settings → Secrets and variables → Actions → New repository secret`,

'How Machine Learning Works': `# How Machine Learning Works

Machine learning is transforming every industry — from the recommendations on Netflix to the spam filter in your email, to the voice assistants on your phone. Understanding how it works demystifies AI and opens the door to building intelligent applications.

## Traditional Programming vs Machine Learning

This distinction is fundamental:

\`\`\`
Traditional Programming:
  Input: Rules (written by programmer) + Data
  Output: Answers

  Example:
  IF score >= 90 THEN grade = "A"
  IF score >= 80 THEN grade = "B"
  ... (programmer writes every rule)

Machine Learning:
  Input: Data + Expected Answers (labels)
  Output: Rules (learned by the model)

  Example:
  Model sees: [92 → A], [85 → B], [71 → C], [58 → F]
  Model learns: What patterns in the input predict the output?
  Model can then: Grade new scores it has never seen
\`\`\`

This is revolutionary because many problems are too complex to write explicit rules for — face recognition, language translation, protein folding.

## Types of Machine Learning

### Supervised Learning

The model learns from labeled training data — examples where you know the correct answer:

\`\`\`
Classification — predict a category
  Input:  [email text, sender, links]
  Output: spam | not spam

  Input:  [tumor size, age, texture]
  Output: malignant | benign

  Input:  [image pixels]
  Output: cat | dog | bird

Regression — predict a number
  Input:  [bedrooms, location, age, size]
  Output: house price (e.g., $450,000)

  Input:  [hours studied, sleep, past grades]
  Output: expected score (e.g., 82.5)
\`\`\`

### Unsupervised Learning

No labels — the model finds hidden patterns on its own:

\`\`\`
Clustering — group similar things
  Input:  customer purchase histories (no labels)
  Output: 3 groups: budget shoppers, brand loyalists, impulse buyers

Dimensionality Reduction — compress data while preserving structure
  Input:  1000-dimensional data
  Output: 2-dimensional data (easier to visualize and process)

Anomaly Detection — find unusual patterns
  Input:  credit card transactions
  Output: this transaction looks unusual (possible fraud)
\`\`\`

### Reinforcement Learning

An agent learns by interacting with an environment and receiving rewards or penalties:

\`\`\`
Environment: Chess board
Agent: AI player
Actions: Move pieces
Reward: +1 for winning, -1 for losing, 0 for draws

The agent plays millions of games, gradually learning which moves
lead to wins and which lead to losses.

Real examples:
- AlphaGo (beat world chess and Go champions)
- OpenAI Five (beat professional Dota 2 teams)
- Robot locomotion (learned to walk without being programmed how)
- Trading algorithms
- Game playing (Atari games from pixels alone)
\`\`\`

## The Machine Learning Workflow

\`\`\`
1. Define the problem
   What are you predicting?
   What data do you have?
   What does "success" look like?
   → "Predict whether a learner will complete a course"

2. Collect and explore data
   Gather historical data
   Explore distributions, correlations, outliers
   → "We have 50,000 enrollment records with outcomes"

3. Prepare and clean data
   Handle missing values
   Remove duplicates
   Fix errors
   → "200 records have null completion dates — fill with False"

4. Feature engineering
   Select relevant input variables
   Create new features from existing ones
   Encode categorical variables
   Scale numerical values
   → "Create features: lessons_completed_first_week, logged_in_mobile"

5. Split the data
   Training set: 80% (model learns from this)
   Test set:     20% (evaluate on data model hasn't seen)
   → Never train and evaluate on the same data — that's cheating!

6. Choose and train a model
   Try different algorithms
   Tune hyperparameters
   → Start simple: logistic regression, then try random forest

7. Evaluate the model
   Accuracy: What % of predictions are correct?
   Precision: When it predicts positive, how often is it right?
   Recall: What % of actual positives did it catch?
   F1 Score: Balance between precision and recall
   Confusion matrix: Break down of predictions vs actual

8. Improve
   Add more data
   Engineer better features
   Try different algorithms
   Tune hyperparameters (grid search, random search)

9. Deploy
   Wrap model in an API
   Monitor predictions in production
   Retrain periodically as new data arrives
\`\`\`

## Key Algorithms Explained

\`\`\`python
# 1. Linear Regression — predict a continuous value
# Finds the line (or plane) that best fits the data
# y = mx + b (simple) or y = m1x1 + m2x2 + ... + b (multiple)

# 2. Logistic Regression — classify into categories
# Despite the name, it's a classification algorithm
# Outputs probability between 0 and 1
# Uses sigmoid function: 1 / (1 + e^(-x))

# 3. Decision Tree — make decisions with rules
# Splits data into branches based on features
# Easy to understand and visualize
# Prone to overfitting on its own

# 4. Random Forest — ensemble of decision trees
# Trains many trees on random subsets of data
# Takes majority vote (classification) or average (regression)
# Much more robust than a single tree

# 5. Support Vector Machine (SVM)
# Finds the hyperplane that maximally separates classes
# Excellent for high-dimensional data
# Can use "kernel trick" for non-linear problems

# 6. K-Nearest Neighbors (KNN)
# Classifies based on the K most similar training examples
# Simple but slow for large datasets

# 7. Neural Networks — inspired by the brain
# Multiple layers of interconnected nodes
# Can learn extremely complex patterns
# Needs lots of data and computation
\`\`\`

## Overfitting and Underfitting

\`\`\`
Underfitting:
  Model is too simple — misses patterns in data
  High training error + High test error
  Fix: Use more complex model, add features, reduce regularization

Good fit:
  Model captures real patterns
  Low training error + Low test error (similar to training)
  This is what you want!

Overfitting:
  Model memorizes training data including noise
  Low training error + High test error
  Fix: More data, simpler model, regularization, dropout

Example:
  Training data: 80 students
  Perfect model: 75% accuracy on new students
  Overfit model: 100% on training, 55% on new students (memorized, not learned)
\`\`\`

## Bias-Variance Tradeoff

\`\`\`
Bias = how wrong your model's assumptions are
Variance = how much the model changes with different training data

High Bias → Underfitting (too simple)
High Variance → Overfitting (too complex)

Goal: Find the sweet spot with low bias AND low variance
Technique: Cross-validation (test on multiple held-out sets)
\`\`\``,

'Neural Networks and Deep Learning': `# Neural Networks and Deep Learning

Neural networks are the engine behind modern AI — from ChatGPT to image recognition to self-driving cars. They're inspired by how the human brain works, using layers of connected nodes to learn patterns from data. Deep learning refers to neural networks with many layers.

## The Biological Inspiration

\`\`\`
Biological Neuron:                Artificial Neuron:
                                  
  Dendrites (inputs)               Inputs (x1, x2, x3)
       ↓                                ↓
  Cell body (processes)            Weights (w1, w2, w3)
       ↓                           Sum + Bias
  Axon (output)                    Activation Function
       ↓                                ↓
  Synapse (connection)             Output
  
The neuron fires (outputs) if its inputs are strong enough.
The artificial neuron activates if the weighted sum exceeds a threshold.
\`\`\`

## How a Single Neuron Works

\`\`\`python
import numpy as np

# A single artificial neuron
def neuron(inputs, weights, bias):
    # 1. Weighted sum
    weighted_sum = sum(x * w for x, w in zip(inputs, weights)) + bias
    # same as: np.dot(inputs, weights) + bias

    # 2. Activation function (ReLU here)
    output = max(0, weighted_sum)  # ReLU: output 0 if negative, else the value

    return output

# Example: Predicting if a student will pass
# Inputs: [hours_studied, sleep_hours, prior_gpa]
inputs  = [6, 7, 3.5]
weights = [0.4, 0.2, 0.8]  # learned during training
bias    = -2.5

result = neuron(inputs, weights, bias)
print(f"Pass probability: {result:.2f}")
\`\`\`

## Activation Functions

Activation functions introduce non-linearity — without them, a neural network is just a linear model no matter how many layers it has:

\`\`\`python
import numpy as np

# Sigmoid — output between 0 and 1 (good for binary classification output)
def sigmoid(x):
    return 1 / (1 + np.exp(-x))
# Problem: "Vanishing gradient" — gradients become tiny in deep networks

# ReLU — Rectified Linear Unit (most common hidden layer activation)
def relu(x):
    return np.maximum(0, x)
# Fast, simple, works well in practice
# Problem: "Dying ReLU" — neurons can get stuck at 0

# Leaky ReLU — fixes dying ReLU
def leaky_relu(x, alpha=0.01):
    return np.where(x > 0, x, alpha * x)

# Tanh — output between -1 and 1
def tanh(x):
    return np.tanh(x)
# Zero-centered (better than sigmoid) but still has vanishing gradient

# Softmax — output probabilities that sum to 1 (multiclass classification)
def softmax(x):
    exp_x = np.exp(x - np.max(x))  # subtract max for numerical stability
    return exp_x / exp_x.sum()

# Example
scores = np.array([2.0, 1.0, 0.1])
probs  = softmax(scores)
print(probs)  # [0.659, 0.242, 0.099] — probabilities for 3 classes
\`\`\`

## Network Architecture

\`\`\`
Input Layer → Hidden Layers → Output Layer

For predicting course completion:
Input (5 neurons):   [hours_this_week, lessons_done, quiz_score, streak, enrolled_days]
Hidden (16 neurons): Learn abstract patterns — "engaged learner" "struggling learner"
Hidden (8 neurons):  Combine patterns into higher-level representations
Output (1 neuron):   Probability of completing the course (0 to 1)

More layers = deeper network = can learn more complex patterns
BUT also = harder to train, needs more data, more compute
\`\`\`

## Forward Pass — Making Predictions

\`\`\`python
import numpy as np

class NeuralNetwork:
    def __init__(self, layer_sizes):
        """
        layer_sizes: [input_size, hidden1_size, ..., output_size]
        Example: [5, 16, 8, 1]
        """
        self.weights = []
        self.biases  = []

        for i in range(len(layer_sizes) - 1):
            # Xavier initialization — helps training converge
            w = np.random.randn(layer_sizes[i], layer_sizes[i+1]) * np.sqrt(2 / layer_sizes[i])
            b = np.zeros((1, layer_sizes[i+1]))
            self.weights.append(w)
            self.biases.append(b)

    def relu(self, x):
        return np.maximum(0, x)

    def sigmoid(self, x):
        return 1 / (1 + np.exp(-x))

    def forward(self, X):
        """Forward pass — compute predictions."""
        self.activations = [X]

        for i, (W, b) in enumerate(zip(self.weights, self.biases)):
            z = self.activations[-1] @ W + b  # matrix multiplication

            # Use ReLU for hidden layers, sigmoid for output
            if i < len(self.weights) - 1:
                a = self.relu(z)
            else:
                a = self.sigmoid(z)

            self.activations.append(a)

        return self.activations[-1]

# Create a network
net = NeuralNetwork([5, 16, 8, 1])

# Make a prediction
student_data = np.array([[6, 12, 85, 7, 30]])  # one student's features
prediction   = net.forward(student_data)
print(f"Completion probability: {prediction[0][0]:.2%}")
\`\`\`

## Training — Backpropagation

\`\`\`python
# The training loop
def train(network, X_train, y_train, epochs=100, learning_rate=0.01):
    losses = []

    for epoch in range(epochs):
        # 1. Forward pass
        predictions = network.forward(X_train)

        # 2. Compute loss (how wrong are we?)
        # Binary cross-entropy for classification
        loss = -np.mean(
            y_train * np.log(predictions + 1e-8) +
            (1 - y_train) * np.log(1 - predictions + 1e-8)
        )
        losses.append(loss)

        # 3. Backward pass (backpropagation)
        # Compute gradient of loss with respect to each weight
        # Update weights to reduce loss

        # This is the complex part that PyTorch/TensorFlow handles automatically
        # gradient = dloss/dweight (chain rule applied layer by layer)

        # 4. Update weights (gradient descent)
        # weight = weight - learning_rate * gradient

        if epoch % 10 == 0:
            print(f"Epoch {epoch:4d} | Loss: {loss:.4f}")

    return losses
\`\`\`

## Deep Learning with PyTorch

\`\`\`python
import torch
import torch.nn as nn
import torch.optim as optim

# Define the model
class CourseCompletionModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(5, 64),          # 5 inputs → 64 neurons
            nn.ReLU(),
            nn.Dropout(0.3),           # randomly zero out 30% during training
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(32, 1),
            nn.Sigmoid(),              # output probability
        )

    def forward(self, x):
        return self.network(x)

# Create model, loss function, optimizer
model     = CourseCompletionModel()
criterion = nn.BCELoss()                        # Binary Cross Entropy
optimizer = optim.Adam(model.parameters(), lr=0.001)  # Adam optimizer

# Training loop
for epoch in range(100):
    model.train()

    # Forward pass
    outputs = model(X_train_tensor)
    loss    = criterion(outputs, y_train_tensor)

    # Backward pass
    optimizer.zero_grad()  # clear previous gradients
    loss.backward()        # compute gradients
    optimizer.step()       # update weights

    if epoch % 10 == 0:
        print(f"Epoch {epoch:3d} | Loss: {loss.item():.4f}")

# Evaluate
model.eval()
with torch.no_grad():  # don't compute gradients during evaluation
    test_predictions = model(X_test_tensor)
    test_loss = criterion(test_predictions, y_test_tensor)
    accuracy  = ((test_predictions > 0.5) == y_test_tensor).float().mean()
    print(f"Test Accuracy: {accuracy:.2%}")
\`\`\`

## Common Architectures

\`\`\`
Feedforward Network (MLP):
  Input → Hidden layers → Output
  Use for: Tabular data, simple classification

Convolutional Neural Network (CNN):
  Input → Conv layers → Pooling → Dense → Output
  Use for: Images, video, spatial data
  Key: Detects local patterns (edges, shapes, objects)

Recurrent Neural Network (RNN/LSTM/GRU):
  Input sequences → Hidden state → Output
  Use for: Text, time series, audio, sequences
  Key: Has "memory" of previous inputs

Transformer:
  Input → Attention layers → Output
  Use for: Text (GPT, BERT), code, long sequences
  Key: Self-attention — every token relates to every other token
  Powers: ChatGPT, GitHub Copilot, Google Translate

Generative Adversarial Network (GAN):
  Generator vs Discriminator playing a game
  Use for: Generating realistic images, audio, video
  Powers: Deepfakes, DALL-E (early version)
\`\`\``,

'OWASP Top 10 Vulnerabilities': `# OWASP Top 10 Vulnerabilities

The Open Web Application Security Project (OWASP) publishes the Top 10 — a consensus list of the most critical security risks to web applications. Every web developer needs to know these vulnerabilities and how to prevent them. Security breaches cost companies millions and destroy user trust.

## Why Security Matters for Developers

\`\`\`
Real costs of security breaches:
- Equifax (2017): 147 million records exposed, $700M settlement
- Yahoo (2016): 3 billion accounts, sold company for $350M less
- Target (2013): 110 million customers, $162M in costs

Common causes: Poor input validation, weak auth, unpatched dependencies

As a developer, you are the last line of defense.
\`\`\`

## 1. Broken Access Control

Users accessing data or performing actions they shouldn't be allowed to:

\`\`\`js
// VULNERABLE — anyone can see any user's data
app.get("/api/users/:id/profile", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user); // ❌ Learner can view admin's profile!
});

// VULNERABLE — IDOR (Insecure Direct Object Reference)
app.get("/api/orders/:id", authenticate, async (req, res) => {
  const order = await Order.findById(req.params.id);
  res.json(order); // ❌ User 1 can view User 2's orders!
});

// SECURE — enforce ownership
app.get("/api/orders/:id", authenticate, async (req: AuthRequest, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    userId: req.user!.id, // ✅ must belong to this user
  });
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
});

// SECURE — role-based access control
app.delete("/api/users/:id", authenticate, authorize("admin"), async (req, res) => {
  // ✅ Only admins can delete users
});
\`\`\`

## 2. Cryptographic Failures

Exposing sensitive data because of weak or missing encryption:

\`\`\`js
// NEVER — plain text passwords
user.password = req.body.password; // ❌ catastrophic

// NEVER — weak hashing (MD5, SHA1 are not for passwords)
user.password = md5(req.body.password); // ❌ crackable in seconds

// CORRECT — bcrypt with high cost factor
const SALT_ROUNDS = 12; // adjust: higher = slower but safer
user.password = await bcrypt.hash(req.body.password, SALT_ROUNDS);

// Verify
const isValid = await bcrypt.compare(inputPassword, user.password);

// Sensitive data in transit — always use HTTPS in production
// Never log passwords, tokens, or PII
console.log("User logged in:", user.email); // ✅ email is okay
console.log("Password:", password);          // ❌ NEVER log passwords

// Encrypt sensitive database fields
const mongoose_encrypt = require("mongoose-field-encryption");
UserSchema.plugin(mongoose_encrypt, {
  fields: ["ssn", "creditCard"],
  secret: process.env.ENCRYPTION_KEY,
});
\`\`\`

## 3. Injection Attacks

Attacker injects malicious code into queries or commands:

\`\`\`js
// SQL Injection
// VULNERABLE:
const query = \`SELECT * FROM users WHERE email = '\${req.body.email}'\`;
// Attacker sends: ' OR '1'='1' --
// Result: SELECT * FROM users WHERE email = '' OR '1'='1' --'
// Returns ALL users!

// SECURE — parameterized queries (never concatenate user input)
const user = await db.query("SELECT * FROM users WHERE email = $1", [req.body.email]);

// NoSQL Injection (MongoDB)
// VULNERABLE:
const user = await User.findOne({ email: req.body.email });
// Attacker sends: { "$gt": "" } as email
// Result: finds users where email > "" (all users!)

// SECURE — use express-mongo-sanitize
import mongoSanitize from "express-mongo-sanitize";
app.use(mongoSanitize()); // strips $ and . from request data

// Also validate types
const { email } = req.body;
if (typeof email !== "string") return res.status(400).json({ message: "Invalid email" });

// Command Injection
// VULNERABLE:
const { filename } = req.body;
exec(\`cat \${filename}\`); // attacker sends: "file.txt; rm -rf /"

// SECURE — use arrays (no shell interpretation)
execFile("cat", [filename]);
// Or better — validate filename
if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
  return res.status(400).json({ message: "Invalid filename" });
}
\`\`\`

## 4. Cross-Site Scripting (XSS)

Injecting malicious scripts into web pages viewed by other users:

\`\`\`js
// Stored XSS — attacker saves malicious script in database
// Vulnerable comment storage:
await Comment.create({ text: req.body.text }); // stores "<script>stealCookies()</script>"
// When another user views comments, script executes in THEIR browser

// DOM-based XSS
// VULNERABLE HTML:
// document.getElementById("output").innerHTML = userInput; // ❌

// SECURE:
// document.getElementById("output").textContent = userInput; // ✅ (escapes HTML)

// React is SAFE by default — it escapes JSX expressions
// <div>{userInput}</div> ✅ — React escapes this
// <div dangerouslySetInnerHTML={{ __html: userInput }} /> ❌ — explicitly unsafe

// Backend defense — Content Security Policy header
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; object-src 'none';"
  );
  next();
});

// Or use helmet which sets security headers automatically
import helmet from "helmet";
app.use(helmet()); // includes CSP, X-XSS-Protection, and more
\`\`\`

## 5. Security Misconfiguration

Insecure default configurations, unnecessary features, unpatched systems:

\`\`\`js
// SECURE Express configuration
const app = express();

// Remove header that reveals you're using Express
app.disable("x-powered-by");

// Use helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'"],
      styleSrc:    ["'self'", "'unsafe-inline'"], // may need for CSS-in-JS
      imgSrc:      ["'self'", "data:", "https:"],
      connectSrc:  ["'self'"],
      fontSrc:     ["'self'"],
      objectSrc:   ["'none'"],
      frameSrc:    ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // if using iframes
}));

// CORS — only allow known origins
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      "http://localhost:5174",
      "https://pugi.com",
      "https://www.pugi.com",
    ];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// Never expose stack traces in production
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const isProd = process.env.NODE_ENV === "production";
  res.status(err.status || 500).json({
    message: isProd ? "Something went wrong" : err.message,
    ...(isProd ? {} : { stack: err.stack }),
  });
});
\`\`\`

## 6. Vulnerable and Outdated Components

Using packages with known vulnerabilities:

\`\`\`bash
# Check for vulnerabilities in your dependencies
npm audit

# Fix automatically (minor updates)
npm audit fix

# Fix with major updates (review breaking changes!)
npm audit fix --force

# Check for outdated packages
npm outdated

# Use Snyk for continuous monitoring
npx snyk test
npx snyk monitor

# Set up Dependabot in GitHub — auto-PRs for vulnerable dependencies
# .github/dependabot.yml
# version: 2
# updates:
#   - package-ecosystem: "npm"
#     directory: "/"
#     schedule:
#       interval: "weekly"
\`\`\`

## 7. Identification and Authentication Failures

\`\`\`js
// Brute force protection
import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 attempts per window
  message: { message: "Too many login attempts. Try again in 15 minutes." },
  skipSuccessfulRequests: true,
  handler: async (req, res) => {
    // Log the failed attempts for security monitoring
    console.warn(\`Brute force attempt: \${req.ip} trying \${req.body.email}\`);
    res.status(429).json({ message: "Account temporarily locked" });
  },
});

app.use("/api/auth/login", loginLimiter);

// Password requirements
function isStrongPassword(password: string): string | null {
  if (password.length < 8)       return "At least 8 characters required";
  if (!/[A-Z]/.test(password))   return "At least one uppercase letter required";
  if (!/[a-z]/.test(password))   return "At least one lowercase letter required";
  if (!/[0-9]/.test(password))   return "At least one number required";
  if (!/[^A-Za-z0-9]/.test(password)) return "At least one special character required";
  return null; // null = password is strong
}
\`\`\``,

'Secure Authentication Patterns': `# Secure Authentication Patterns

Authentication is one of the most critical and commonly misimplemented parts of any web application. A weak auth system can expose every user's account, data, and privacy. This lesson covers the patterns used by security-conscious production applications.

## Password Security Deep Dive

\`\`\`js
import bcrypt from "bcryptjs";
import crypto  from "crypto";

// COST FACTOR — the key decision in bcrypt
// bcrypt deliberately slows down hashing to frustrate brute force attacks
// Cost 10: ~100ms per hash (too fast for production)
// Cost 12: ~300ms per hash (good balance)
// Cost 14: ~1200ms per hash (consider for high-security apps)

const COST_FACTOR = 12;

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST_FACTOR);
}

async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

// Password strength checker
function checkPasswordStrength(password: string) {
  const checks = {
    length:      password.length >= 12,
    uppercase:   /[A-Z]/.test(password),
    lowercase:   /[a-z]/.test(password),
    numbers:     /[0-9]/.test(password),
    special:     /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    noCommon:    !["password", "123456", "qwerty", "abc123"].includes(password.toLowerCase()),
  };

  const score   = Object.values(checks).filter(Boolean).length;
  const strength = score <= 2 ? "weak" : score <= 4 ? "fair" : score <= 5 ? "strong" : "very strong";

  return { checks, score, strength };
}

// Check for compromised passwords using Have I Been Pwned
async function isPasswordCompromised(password: string): Promise<boolean> {
  const hash    = crypto.createHash("sha1").update(password).digest("hex").toUpperCase();
  const prefix  = hash.slice(0, 5);
  const suffix  = hash.slice(5);

  const response = await fetch(\`https://api.pwnedpasswords.com/range/\${prefix}\`);
  const text     = await response.text();

  return text.split("\\n").some(line => line.startsWith(suffix));
}
\`\`\`

## Secure Session Management

\`\`\`js
import jwt  from "jsonwebtoken";
import crypto from "crypto";

// Generate cryptographically secure secrets
// Run this ONCE to generate your secrets:
// node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

const ACCESS_SECRET  = process.env.JWT_SECRET!;         // 64+ random bytes
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!; // different secret

// Access token — short lived, stateless
function createAccessToken(userId: string, role: string) {
  return jwt.sign(
    {
      id:   userId,
      role,
      type: "access",           // prevent refresh tokens being used as access tokens
    },
    ACCESS_SECRET,
    {
      expiresIn: "15m",
      issuer:    "pugi-api",
      audience:  "pugi-client",
    }
  );
}

// Refresh token — longer lived, stored in DB
function createRefreshToken(userId: string) {
  return jwt.sign(
    {
      id:   userId,
      type: "refresh",
      jti:  crypto.randomUUID(), // unique token ID — allows individual token revocation
    },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  );
}

// Verify with full validation
function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_SECRET, {
    issuer:   "pugi-api",
    audience: "pugi-client",
  }) as { id: string; role: string; type: string };
}

// Token refresh with rotation
async function refreshAccessToken(refreshToken: string) {
  // 1. Verify the refresh token
  const payload = jwt.verify(refreshToken, REFRESH_SECRET) as any;

  if (payload.type !== "refresh") {
    throw new Error("Invalid token type");
  }

  // 2. Check it's in the database (not revoked)
  const user = await User.findById(payload.id);
  if (!user || user.refreshToken !== refreshToken) {
    throw new Error("Token has been revoked");
  }

  // 3. Issue NEW tokens (rotation)
  const newAccessToken  = createAccessToken(user.id, user.role);
  const newRefreshToken = createRefreshToken(user.id);

  // 4. Save new refresh token (invalidate old one)
  user.refreshToken = newRefreshToken;
  await user.save();

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}
\`\`\`

## Multi-Factor Authentication (MFA)

\`\`\`js
import speakeasy from "speakeasy";
import qrcode    from "qrcode";

// Generate MFA secret for a user
async function setupMFA(userId: string, email: string) {
  const secret = speakeasy.generateSecret({
    name:   \`PUGI (\${email})\`,
    length: 20,
  });

  // Save secret to user (encrypted in production)
  await User.findByIdAndUpdate(userId, {
    mfaSecret:  secret.base32,
    mfaEnabled: false, // not enabled until verified
  });

  // Generate QR code for authenticator apps (Google Authenticator, Authy)
  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);

  return { secret: secret.base32, qrCode: qrCodeUrl };
}

// Verify MFA token
async function verifyMFA(userId: string, token: string): Promise<boolean> {
  const user = await User.findById(userId).select("+mfaSecret");
  if (!user?.mfaSecret) return false;

  return speakeasy.totp.verify({
    secret:   user.mfaSecret,
    encoding: "base32",
    token,
    window:   1, // allow 30 second clock drift
  });
}

// Login with MFA
router.post("/login", async (req: Request, res: Response) => {
  const { email, password, mfaToken } = req.body;

  const user = await User.findOne({ email }).select("+password +mfaSecret");
  const valid = user ? await bcrypt.compare(password, user.password) : false;

  if (!user || !valid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // If MFA is enabled, require the token
  if (user.mfaEnabled) {
    if (!mfaToken) {
      return res.status(200).json({ mfaRequired: true }); // signal frontend to show MFA input
    }
    const mfaValid = await verifyMFA(user.id, mfaToken);
    if (!mfaValid) {
      return res.status(401).json({ message: "Invalid MFA code" });
    }
  }

  // Issue tokens
  const tokens = createTokenPair(user.id, user.role);
  res.json({ ...tokens, user: { id: user.id, name: user.name, role: user.role } });
});
\`\`\`

## Input Validation with Zod

\`\`\`ts
import { z } from "zod";

// Define schemas that validate AND type your data
const registerSchema = z.object({
  name: z.string()
    .min(2,   "Name must be at least 2 characters")
    .max(50,  "Name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters"),

  email: z.string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .max(255),

  password: z.string()
    .min(8,  "Password must be at least 8 characters")
    .max(128, "Password is too long")
    .regex(/[A-Z]/,       "Password must contain at least one uppercase letter")
    .regex(/[a-z]/,       "Password must contain at least one lowercase letter")
    .regex(/[0-9]/,       "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),

  role: z.enum(["learner", "tutor"]).default("learner"),
});

const loginSchema = z.object({
  email:    z.string().email().toLowerCase(),
  password: z.string().min(1),
});

// Middleware factory
function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.reduce((acc, err) => {
        const field = err.path.join(".");
        acc[field]  = err.message;
        return acc;
      }, {} as Record<string, string>);

      return res.status(400).json({ message: "Validation failed", errors });
    }

    req.body = result.data; // sanitized and typed data
    next();
  };
}

router.post("/register", validate(registerSchema), async (req, res) => {
  const { name, email, password, role } = req.body; // fully typed and validated
  // ...
});
\`\`\``,

'Cloud Fundamentals and AWS Overview': `# Cloud Fundamentals and AWS Overview

Cloud computing has fundamentally changed how software is built and deployed. Instead of buying and managing physical servers, you rent computing resources on demand. AWS (Amazon Web Services) is the world's largest cloud provider, used by millions of companies from startups to Fortune 500 enterprises.

## What is Cloud Computing?

\`\`\`
Traditional (On-Premise) Infrastructure:
  1. Plan capacity: "We'll need 20 servers for peak traffic in 6 months"
  2. Order servers: Purchase, wait 4-8 weeks for delivery
  3. Install in data center: Rack, cable, configure
  4. Maintain hardware: Replace failed disks, RAM, cooling
  5. Scale: Need more capacity? Repeat steps 1-3
  6. Pay: Whether you use the servers or not, cost is fixed

Result: Overprovisioned 90% of the time (wasted money)
         Underprovisioned 10% of the time (outages)
         Slow to adapt to changing needs

Cloud Infrastructure (AWS, GCP, Azure):
  1. Create a server in 30 seconds via console or API
  2. Run for exactly as long as you need it
  3. Scale up in minutes when traffic spikes
  4. Scale down immediately when traffic drops
  5. Pay only for what you use, by the hour or second

Result: Always right-sized
         Infinitely scalable
         No upfront hardware costs
         Someone else handles the physical maintenance
\`\`\`

## Cloud Service Models

\`\`\`
IaaS — Infrastructure as a Service
  You manage: OS, middleware, runtime, applications, data
  AWS manages: Virtualisation, servers, storage, networking
  Examples: EC2 (virtual machines), S3 (storage), VPC (networking)
  Best for: Full control, custom configurations, lift-and-shift migrations

PaaS — Platform as a Service
  You manage: Applications and data only
  AWS manages: OS, runtime, scaling, patching, infrastructure
  Examples: Elastic Beanstalk, AWS Lambda, RDS
  Best for: Developers who want to focus on code, not infrastructure

SaaS — Software as a Service
  You manage: Nothing (just configure and use)
  AWS manages: Everything
  Examples: Gmail, Salesforce, Slack (not AWS products but same concept)
  Best for: End users who need software without IT overhead

FaaS — Functions as a Service (Serverless)
  You write individual functions
  AWS manages: Scaling, availability, runtime
  Pay per invocation (often free at low scale)
  Examples: AWS Lambda, Google Cloud Functions
  Best for: Event-driven workloads, APIs with variable traffic
\`\`\`

## AWS Core Services In Depth

### Compute

\`\`\`
EC2 (Elastic Compute Cloud)
  Virtual servers you can fully control
  Instance types: t2.micro (free tier), t3.medium, c5.large, etc.
  Use for: Web servers, APIs, batch processing

Lambda
  Run code without servers
  Pay per 100ms of execution time
  Scales from 0 to thousands of concurrent executions automatically
  Use for: APIs, file processing, scheduled tasks, event handlers

ECS/EKS
  Run Docker containers at scale
  ECS: AWS-native container orchestration
  EKS: Kubernetes on AWS
  Use for: Microservices, containerized applications
\`\`\`

### Storage

\`\`\`
S3 (Simple Storage Service)
  Object storage — store any file, any size
  Virtually unlimited storage
  99.999999999% (11 nines) durability
  Pricing: ~$0.023 per GB/month
  Use for: Static files, images, backups, frontend hosting, data lakes

EBS (Elastic Block Store)
  Block storage — like a hard drive for EC2
  Must be attached to an EC2 instance
  Use for: Databases, OS volumes

EFS (Elastic File System)
  Network file system shared by multiple EC2 instances
  Use for: Shared storage across many servers
\`\`\`

### Databases

\`\`\`
RDS (Relational Database Service)
  Managed SQL databases: PostgreSQL, MySQL, MariaDB, Oracle, SQL Server
  Automated backups, patching, failover
  Multi-AZ deployment for high availability
  Use for: Traditional relational data, transactions

DynamoDB
  Managed NoSQL database (like MongoDB but AWS-native)
  Single-digit millisecond performance at any scale
  Serverless — pay per request
  Use for: High-scale, low-latency data, game sessions, shopping carts

ElastiCache
  Managed Redis or Memcached
  Use for: Caching, session storage, leaderboards, pub/sub
\`\`\`

### Networking

\`\`\`
VPC (Virtual Private Cloud)
  Your own private network in AWS
  Control IP ranges, subnets, routing, firewalls
  Public subnets: accessible from internet
  Private subnets: internal only (databases live here)

Route 53
  DNS service — translates pugi.com → IP address
  Health checks, traffic routing, failover
  Register domains

CloudFront
  CDN (Content Delivery Network)
  300+ edge locations worldwide
  Serves content from the nearest location to the user
  Use for: Static sites, media, API acceleration, DDoS protection

ALB (Application Load Balancer)
  Distribute traffic across multiple EC2 instances
  Health checks — route away from failed instances
  SSL/TLS termination
\`\`\`

## AWS Regions and Availability Zones

\`\`\`
Region: A geographic location with multiple data centers
  Examples: us-east-1 (N. Virginia), eu-west-1 (Ireland), ap-southeast-1 (Singapore)
  Choose based on: Where your users are, compliance requirements, cost

Availability Zone (AZ): An isolated data center within a region
  Each region has 3-6 AZs
  AZs are physically separated (different buildings, power, cooling)
  Connected by low-latency private fiber

Best practice: Deploy across multiple AZs
  If one data center fails (fire, flood, power), others keep running
  This is how AWS achieves high availability
  Example: Run web servers in us-east-1a AND us-east-1b and 1c

Edge Locations: 300+ global caching points for CloudFront
  Not full data centers, just caching servers
  Much closer to end users than regions
\`\`\`

## AWS Free Tier

\`\`\`
Always Free (no expiry):
  Lambda:    1 million requests/month
  DynamoDB:  25 GB storage
  S3:        No free tier in always-free (12-month only)
  CloudFront: 1 TB data transfer/month

12-Month Free (after account creation):
  EC2:   750 hours/month of t2.micro or t3.micro
  RDS:   750 hours/month of db.t2.micro
  S3:    5 GB storage, 20,000 GET requests, 2,000 PUT requests
  SES:   62,000 outbound emails/month when sending from EC2

Tips to stay within free tier:
  - Set up billing alerts at $1 and $5
  - Stop EC2 instances when not using them
  - Use t2.micro — not larger instances
  - Delete resources you're not using
\`\`\``,

'Deploying a Node.js App to AWS': `# Deploying a Node.js App to AWS

Deploying to production is one of the most important skills a backend developer needs. A great API that nobody can access is worthless. This lesson walks through multiple deployment strategies for Node.js applications on AWS, from simple to sophisticated.

## Prerequisites Checklist

\`\`\`bash
# 1. Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip && sudo ./aws/install

# 2. Configure credentials
aws configure
# AWS Access Key ID: (from IAM → Users → Your user → Security credentials)
# AWS Secret Access Key: (shown only once — save it!)
# Default region name: us-east-1
# Default output format: json

# 3. Verify
aws sts get-caller-identity
# Should show your account ID and user ARN
\`\`\`

## Option 1: EC2 — Full Server Control

Best for: Applications that need persistent connections, WebSockets, or full OS control.

\`\`\`bash
# ── Step 1: Launch EC2 Instance ─────────────────────────
# AWS Console → EC2 → Launch Instance
# AMI: Ubuntu Server 22.04 LTS
# Instance type: t2.micro (free tier)
# Key pair: Create new → download the .pem file
# Security group: Allow SSH (22), HTTP (80), HTTPS (443), Custom TCP (3001)

# ── Step 2: Connect to Your Instance ────────────────────
chmod 400 pugi-key.pem  # protect the key file
ssh -i pugi-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# ── Step 3: Set Up the Server ───────────────────────────
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version  # v20.x.x
npm --version   # 10.x.x

# Install PM2 — process manager that keeps your app running
sudo npm install -g pm2

# Install Git
sudo apt install git -y

# ── Step 4: Deploy Your Application ─────────────────────
# Clone your repository
cd /home/ubuntu
git clone https://github.com/yourusername/pugi-backend.git
cd pugi-backend

# Install dependencies (production only)
npm ci --only=production

# Create .env file
nano .env
# Add all your environment variables here:
# PORT=3001
# MONGODB_URI=mongodb+srv://...
# JWT_SECRET=...
# etc.

# Build TypeScript
npm run build

# ── Step 5: Start with PM2 ──────────────────────────────
pm2 start dist/index.js --name pugi-backend

# Configure PM2 to start automatically on server reboot
pm2 startup systemd  # follow the instruction it outputs
pm2 save            # save current process list

# Useful PM2 commands:
pm2 status          # show all processes
pm2 logs pugi-backend # view logs
pm2 restart pugi-backend
pm2 reload pugi-backend  # zero-downtime reload
pm2 stop pugi-backend
pm2 monit          # real-time dashboard
\`\`\`

## Setting Up Nginx as Reverse Proxy

\`\`\`bash
# Install Nginx
sudo apt install nginx -y

# Create configuration
sudo nano /etc/nginx/sites-available/pugi

# Add this configuration:
server {
    listen 80;
    server_name api.pugi.com YOUR_EC2_IP;

    # Security headers
    add_header X-Frame-Options        "SAMEORIGIN"    always;
    add_header X-XSS-Protection       "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff"       always;

    # Main proxy
    location / {
        proxy_pass         http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade          $http_upgrade;
        proxy_set_header   Connection       "upgrade";
        proxy_set_header   Host             $host;
        proxy_set_header   X-Real-IP        $remote_addr;
        proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout    60s;
        proxy_read_timeout    60s;
    }

    # WebSocket support
    location /socket.io {
        proxy_pass         http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade    $http_upgrade;
        proxy_set_header   Connection "upgrade";
    }
}
\`\`\`

\`\`\`bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/pugi /etc/nginx/sites-enabled/
sudo nginx -t         # test configuration
sudo systemctl reload nginx

# Add HTTPS with Let's Encrypt (free SSL certificate)
sudo snap install core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx -d api.pugi.com  # follow prompts
# Certbot automatically renews certificates!
\`\`\`

## Option 2: AWS Lambda (Serverless)

Best for: APIs with variable traffic, cost-sensitive projects, low-maintenance deployments.

\`\`\`bash
# Install Serverless Framework
npm install -g serverless

# Install serverless-http to wrap Express for Lambda
npm install serverless-http
\`\`\`

\`\`\`ts
// src/lambda.ts — Lambda entry point
import serverless from "serverless-http";
import { app } from "./app"; // your Express app (without app.listen())

export const handler = serverless(app);
\`\`\`

\`\`\`yaml
# serverless.yml
service: pugi-backend

provider:
  name: aws
  runtime: nodejs20.x
  region: us-east-1
  memorySize: 512  # MB
  timeout: 29      # seconds (API Gateway max is 29)

  environment:
    NODE_ENV:             production
    MONGODB_URI:          \${ssm:/pugi/MONGODB_URI}
    JWT_SECRET:           \${ssm:/pugi/JWT_SECRET}
    JWT_REFRESH_SECRET:   \${ssm:/pugi/JWT_REFRESH_SECRET}

functions:
  api:
    handler: dist/lambda.handler
    events:
      - httpApi:
          path: /api/{proxy+}
          method: ANY
      - httpApi:
          path: /api
          method: ANY

plugins:
  - serverless-offline  # for local testing

custom:
  serverless-offline:
    httpPort: 3001
\`\`\`

\`\`\`bash
# Deploy
npm run build
serverless deploy

# Test locally
serverless offline

# View logs
serverless logs -f api --tail

# Remove deployment
serverless remove
\`\`\`

## Option 3: Deploy Frontend to S3 + CloudFront

\`\`\`bash
# ── Step 1: Build the frontend ───────────────────────────
cd frontend
npm run build
# Creates dist/ directory

# ── Step 2: Create S3 Bucket ────────────────────────────
aws s3 mb s3://pugi-frontend-prod

# Disable block public access (needed for static website hosting)
aws s3api put-public-access-block \
  --bucket pugi-frontend-prod \
  --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Enable static website hosting
aws s3 website s3://pugi-frontend-prod \
  --index-document index.html \
  --error-document index.html  # important for SPA routing!

# ── Step 3: Upload Build Files ───────────────────────────
aws s3 sync dist/ s3://pugi-frontend-prod --delete
# --delete removes files in S3 that no longer exist in dist/

# Set cache headers
aws s3 cp dist/index.html s3://pugi-frontend-prod/ \
  --cache-control "no-cache, no-store, must-revalidate"

aws s3 sync dist/assets/ s3://pugi-frontend-prod/assets/ \
  --cache-control "public, max-age=31536000, immutable"  # 1 year cache for hashed assets

# ── Step 4: Create CloudFront Distribution ───────────────
# AWS Console → CloudFront → Create Distribution
# Origin: your S3 bucket website endpoint
# Viewer Protocol: Redirect HTTP to HTTPS
# Cache Policy: CachingOptimized
# Error pages: 403 → /index.html, 404 → /index.html (for SPA routing)

# ── Step 5: Deploy Script (put this in package.json) ─────
# "deploy": "npm run build && aws s3 sync dist/ s3://pugi-frontend-prod --delete && aws cloudfront create-invalidation --distribution-id XXXXX --paths '/*'"
\`\`\`

## Automated Deployment Script

\`\`\`bash
#!/bin/bash
# deploy.sh — run this on your EC2 instance or in GitHub Actions

set -e  # exit on any error

APP_DIR="/home/ubuntu/pugi-backend"
BRANCH="main"

echo "🚀 Starting deployment at $(date)"

# Pull latest code
cd $APP_DIR
git fetch origin
git reset --hard origin/$BRANCH

# Install dependencies
npm ci --only=production

# Build
npm run build

# Reload (zero-downtime — PM2 starts new process before stopping old)
pm2 reload pugi-backend

# Health check
sleep 3
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health)
if [ "$HEALTH" != "200" ]; then
  echo "❌ Health check failed! HTTP status: $HEALTH"
  exit 1
fi

echo "✅ Deployment successful!"
echo "Version: $(git rev-parse --short HEAD)"
\`\`\``,

'How Blockchain Works': `# How Blockchain Works

Blockchain is one of the most misunderstood technologies of the past decade. Strip away the hype about cryptocurrency and NFTs, and blockchain is actually a brilliant solution to a fundamental computer science problem: how do you get a group of strangers who don't trust each other to agree on a shared history of events?

## The Double-Spend Problem

Before blockchain, digital money had a critical flaw called the double-spend problem:

\`\`\`
Physical cash: If Alice gives Bob a $20 bill, she no longer has it. The transfer is physical.

Digital money (pre-blockchain):
  Alice has $20 in a file: balance = 20
  Alice copies the file
  Alice pays Bob $20 → both Bob's copy and Alice's copy show the transaction
  But Alice still has $20 and paid Bob $20 — she spent it twice!

Traditional solution: A central bank keeps THE authoritative ledger
  Alice's bank account: -$20
  Bob's bank account: +$20
  Everyone trusts the bank because it's the single source of truth

Blockchain solution: EVERYONE keeps a copy of the ledger
  No single point of failure or control
  Changing your copy doesn't matter — the network will reject it
\`\`\`

## The Distributed Ledger

\`\`\`
Traditional Ledger (Centralized):
  [Bank Server] ← only copy, single point of failure

Blockchain (Distributed):
  [Node 1] [Node 2] [Node 3] [Node 4] ... [Node 10,000]
  Each holds an identical copy of the entire history
  Change one → others reject it
  Must convince 51%+ of the network to change history (practically impossible)
\`\`\`

## Structure of a Block

\`\`\`
Block #4821
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Header:
  Previous Block Hash: 0x00000a3f8b...
  Timestamp:          2024-01-15 14:23:11 UTC
  Nonce:              2847392
  Merkle Root:        0xf4e3d2c1b0...
  Difficulty Target:  0x00000fffff...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Transactions:
  [0] Alice  → Bob:   1.5 BTC
  [1] Carol  → Dave:  0.3 BTC
  [2] Eve    → Frank: 2.1 BTC
  [3] Grace  → Heidi: 0.05 BTC
  ... (up to ~2000 transactions in Bitcoin)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Block Hash: 0x000009c4d7...
(must start with N zeros — proof of work!)
\`\`\`

## Cryptographic Hashing — The Foundation

A hash function takes any input and produces a fixed-length fingerprint:

\`\`\`
SHA-256 examples:
"Hello"          → a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e
"Hello!"         → 334d016f755cd6dc58c53a86e183882f8ec14f52fb05345887c8a5edd42c87b7
"Hello World"    → a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e

Properties:
1. Deterministic: same input ALWAYS produces same output
2. Fast to compute
3. One-way: cannot reverse (can't get "Hello" from the hash)
4. Avalanche effect: tiny change → completely different hash
5. Collision resistant: practically impossible to find two inputs with same hash
\`\`\`

## Why the Chain is Tamper-Proof

\`\`\`
Block 1          Block 2          Block 3
┌──────────┐    ┌──────────┐    ┌──────────┐
│ Prev: 0  │    │ Prev: H1 │    │ Prev: H2 │
│ Data: A  │    │ Data: B  │    │ Data: C  │
│ Hash: H1 │←── │ Hash: H2 │←── │ Hash: H3 │
└──────────┘    └──────────┘    └──────────┘

Attacker changes Data in Block 1 (e.g., Alice's payment to herself):
  New Block 1 Hash: H1' (completely different)
  Block 2's "Prev Hash" field no longer matches H1'
  Block 2's hash changes: H2'
  Block 3's "Prev Hash" no longer matches H2'
  Block 3's hash changes: H3'
  
All blocks after the tampered one are now INVALID.
The network's 10,000 nodes reject the tampered chain.
To succeed, attacker must re-mine ALL subsequent blocks
faster than the entire honest network — practically impossible.
\`\`\`

## Proof of Work — Mining

How does a block get added? One computer must solve a computational puzzle:

\`\`\`
The puzzle:
  Find a nonce (number) such that:
  SHA256(block_data + nonce) starts with N zeros

Example (simplified):
  Block data: "Alice→Bob: 1.5 BTC"
  Target: hash must start with "0000"
  
  Try nonce = 0: SHA256("Alice→Bob: 1.5 BTC0") = a3f8c9... ❌ (no leading zeros)
  Try nonce = 1: SHA256("Alice→Bob: 1.5 BTC1") = 7b2d41... ❌
  Try nonce = 2: SHA256("Alice→Bob: 1.5 BTC2") = f9e3b7... ❌
  ... try millions of times ...
  Try nonce = 2847392: SHA256("...2847392") = 000093... ✅

The only way to find this nonce is trial and error — pure brute force.
Bitcoin adjusts difficulty so a new block is found every ~10 minutes on average.
\`\`\`

## Proof of Stake — The Green Alternative

Ethereum switched from Proof of Work to Proof of Stake in September 2022 ("The Merge"), reducing energy consumption by 99.95%:

\`\`\`
Proof of Work:
  Compete to solve puzzle → Winner adds block → Gets reward
  Energy cost: ~100 TWh/year (comparable to Argentina)
  Security: Cost to attack = cost of electricity for 51% hash power

Proof of Stake:
  Lock up (stake) ETH as collateral
  Algorithm randomly selects validator (weighted by stake)
  Selected validator proposes block → Others vote to confirm
  Energy cost: ~0.01 TWh/year (99.95% reduction!)
  Security: Attack = need 51% of all staked ETH (worth billions)
  If you cheat → your staked ETH is "slashed" (destroyed)
\`\`\`

## Smart Contracts

Smart contracts are programs stored on the blockchain that execute automatically:

\`\`\`
Traditional contract (legal):
  Alice and Bob sign a paper contract
  If Bob delivers goods, Alice pays
  But: What if Alice refuses to pay?
  Then: Lawyers, courts, enforcement — slow and expensive

Smart contract:
  Code is deployed to the blockchain
  If Bob delivers goods (verified by oracle) → Alice's ETH automatically transfers
  No lawyers needed — code enforces the agreement
  Immutable: Once deployed, nobody can change the rules
  Transparent: Anyone can read the contract code

Real examples:
  - Uniswap: Swap tokens automatically (no exchange needed)
  - Aave: Borrow/lend crypto automatically
  - OpenSea: Buy/sell NFTs without trusting OpenSea
  - Insurance: Automatic payouts when conditions are met
\`\`\``,

'Smart Contracts with Solidity': `# Smart Contracts with Solidity

Solidity is the primary language for writing smart contracts on Ethereum and EVM-compatible blockchains (Polygon, BSC, Avalanche). Smart contracts are the foundation of DeFi, NFTs, DAOs, and the entire Web3 ecosystem.

## Development Environment

\`\`\`bash
# Install Hardhat — the most popular Ethereum development framework
mkdir pugi-contracts && cd pugi-contracts
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Initialize Hardhat project
npx hardhat init
# Select: Create a TypeScript project

# Project structure:
# contracts/       — your Solidity files
# test/            — test files
# scripts/         — deployment scripts
# hardhat.config.ts
\`\`\`

## Solidity Fundamentals

\`\`\`solidity
// SPDX-License-Identifier: MIT  ← required license identifier
pragma solidity ^0.8.19;          ← compiler version requirement

contract MyFirstContract {
    // ── State Variables ─────────────────────────────────
    // Stored permanently on the blockchain (costs gas to write)
    
    address public owner;           // Ethereum address
    string  public name;            // text
    uint256 public count;           // unsigned integer (0 to 2^256-1)
    int256  public temperature;     // signed integer
    bool    public isActive;        // true/false
    bytes32 public dataHash;        // 32-byte value
    
    // Mappings — like a hash map / dictionary
    mapping(address => uint256) public balances;
    mapping(address => bool)    public isVerified;
    mapping(uint256 => address) public tokenOwner;
    
    // Arrays
    address[] public participants;
    uint256[] public scores;
    
    // Structs — custom data types
    struct Course {
        uint256 id;
        string  title;
        address instructor;
        uint256 price;
        bool    isActive;
    }
    
    mapping(uint256 => Course) public courses;
    uint256 public courseCount;
    
    // ── Events ──────────────────────────────────────────
    // Emitted logs — cheap way to store data, readable off-chain
    event CourseCreated(uint256 indexed id, string title, address instructor);
    event Enrolled(address indexed student, uint256 indexed courseId);
    event PaymentReceived(address indexed from, uint256 amount);
    
    // ── Constructor ─────────────────────────────────────
    // Runs once when contract is deployed
    constructor(string memory _name) {
        owner  = msg.sender;  // deployer's address
        name   = _name;
        isActive = true;
    }
    
    // ── Modifiers ────────────────────────────────────────
    // Reusable conditions
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;  // ← rest of function executes here
    }
    
    modifier courseExists(uint256 courseId) {
        require(courses[courseId].id != 0, "Course does not exist");
        _;
    }
    
    modifier isEnrolled(uint256 courseId) {
        require(enrollments[msg.sender][courseId], "Not enrolled in this course");
        _;
    }
    
    // ── Functions ────────────────────────────────────────
    
    // pure: doesn't read or write state
    function add(uint256 a, uint256 b) public pure returns (uint256) {
        return a + b;
    }
    
    // view: reads state but doesn't write (free — no gas)
    function getBalance(address user) public view returns (uint256) {
        return balances[user];
    }
    
    // payable: can receive ETH
    function deposit() public payable {
        require(msg.value > 0, "Must send some ETH");
        balances[msg.sender] += msg.value;
        emit PaymentReceived(msg.sender, msg.value);
    }
    
    // Creates a course
    function createCourse(string memory title, uint256 price) public {
        courseCount++;
        courses[courseCount] = Course({
            id:         courseCount,
            title:      title,
            instructor: msg.sender,
            price:      price,
            isActive:   true,
        });
        
        emit CourseCreated(courseCount, title, msg.sender);
    }
}
\`\`\`

## ERC-20 Token — The Standard for Fungible Tokens

\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Import from OpenZeppelin — battle-tested contracts
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PUGIToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18; // 100M tokens

    constructor() ERC20("PUGI Token", "PUGI") Ownable(msg.sender) {
        // Mint initial supply to deployer
        _mint(msg.sender, 10_000_000 * 10**18); // 10M tokens
    }

    // Only owner can mint new tokens (up to max supply)
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    // Anyone can burn their own tokens
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
\`\`\`

## Complete NFT Contract (ERC-721)

\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PUGICertificate is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    // Track which courses each learner has completed
    mapping(address => mapping(string => bool)) public hasCompleted;
    mapping(uint256 => CertificateData) public certificates;

    struct CertificateData {
        address  learner;
        string   courseName;
        uint256  completedAt;
        uint256  score;
    }

    event CertificateIssued(
        uint256 indexed tokenId,
        address indexed learner,
        string  courseName,
        uint256 score
    );

    constructor() ERC721("PUGI Certificate", "PUGICERT") Ownable(msg.sender) {}

    // Issue a completion certificate as an NFT
    function issueCertificate(
        address learner,
        string memory courseName,
        uint256 score,
        string memory metadataURI
    ) public onlyOwner returns (uint256) {
        require(!hasCompleted[learner][courseName], "Certificate already issued");
        require(score >= 70, "Minimum score of 70 required");

        uint256 tokenId = ++_tokenIdCounter;

        _safeMint(learner, tokenId);
        _setTokenURI(tokenId, metadataURI);

        certificates[tokenId] = CertificateData({
            learner:     learner,
            courseName:  courseName,
            completedAt: block.timestamp,
            score:       score,
        });

        hasCompleted[learner][courseName] = true;

        emit CertificateIssued(tokenId, learner, courseName, score);

        return tokenId;
    }

    // Certificates are non-transferable (soulbound)
    function _update(address to, uint256 tokenId, address auth)
        internal override returns (address) {
        address from = _ownerOf(tokenId);
        require(from == address(0), "Certificates are non-transferable");
        return super._update(to, tokenId, auth);
    }
}
\`\`\`

## Deploying and Interacting with Contracts

\`\`\`ts
// scripts/deploy.ts
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // Deploy the contract
  const PUGIToken = await ethers.getContractFactory("PUGIToken");
  const token     = await PUGIToken.deploy();
  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log("PUGIToken deployed to:", address);

  // Verify on Etherscan (after deployment to public network)
  // npx hardhat verify --network sepolia CONTRACT_ADDRESS
}

main().catch(console.error);
\`\`\`

\`\`\`ts
// scripts/interact.ts — calling contract functions
import { ethers } from "hardhat";

async function main() {
  const TOKEN_ADDRESS = "0x..."; // deployed contract address
  const PUGIToken = await ethers.getContractFactory("PUGIToken");
  const token     = PUGIToken.attach(TOKEN_ADDRESS);

  const [owner, alice, bob] = await ethers.getSigners();

  // Read (free)
  const name   = await token.name();
  const supply = await token.totalSupply();
  console.log(\`\${name}: \${ethers.formatEther(supply)} tokens\`);

  // Write (costs gas)
  const tx = await token.transfer(alice.address, ethers.parseEther("1000"));
  await tx.wait(); // wait for transaction to be mined
  console.log("Transferred 1000 PUGI to Alice");

  // Check balance
  const balance = await token.balanceOf(alice.address);
  console.log("Alice balance:", ethers.formatEther(balance));
}
\`\`\``,

'HTML5 Canvas Fundamentals': `# HTML5 Canvas Fundamentals

The HTML5 Canvas API is your gateway to creating interactive graphics, animations, and games directly in the browser without any external libraries. Every pixel on the canvas is yours to control through JavaScript. Understanding canvas is the foundation for game development, data visualization, image editing tools, and creative coding.

## Setting Up Canvas

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>PUGI Canvas Demo</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #111; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    canvas { border: 1px solid #333; display: block; }
  </style>
</head>
<body>
  <canvas id="gameCanvas"></canvas>
  <script src="game.js"></script>
</body>
</html>
\`\`\`

\`\`\`js
// game.js — setting up the canvas
const canvas = document.getElementById("gameCanvas");
const ctx    = canvas.getContext("2d");

// Fixed size
canvas.width  = 800;
canvas.height = 600;

// Responsive — fill the window
function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

// Responsive with aspect ratio (best for games)
const GAME_WIDTH  = 800;
const GAME_HEIGHT = 600;

function resize() {
  const scale = Math.min(
    window.innerWidth  / GAME_WIDTH,
    window.innerHeight / GAME_HEIGHT
  );
  canvas.width  = GAME_WIDTH  * scale;
  canvas.height = GAME_HEIGHT * scale;
  ctx.scale(scale, scale);
}
\`\`\`

## Drawing Shapes

\`\`\`js
// ── Rectangles ────────────────────────────────────────────
ctx.fillStyle = "#3b82f6";        // fill color
ctx.fillRect(50, 50, 200, 100);   // x, y, width, height

ctx.strokeStyle = "#1d4ed8";      // border color
ctx.lineWidth   = 4;              // border thickness
ctx.strokeRect(50, 50, 200, 100); // outline only

ctx.clearRect(60, 60, 50, 50);    // erase a rectangle (make transparent)

// ── Circles and Arcs ─────────────────────────────────────
ctx.beginPath();
ctx.arc(
  300, 200,        // center x, y
  60,              // radius
  0,               // start angle (radians)
  Math.PI * 2     // end angle (full circle)
);
ctx.fillStyle = "#ef4444";
ctx.fill();
ctx.strokeStyle = "#b91c1c";
ctx.lineWidth = 3;
ctx.stroke();

// Semi-circle
ctx.beginPath();
ctx.arc(400, 300, 80, 0, Math.PI); // 0 to PI = bottom half
ctx.fill();

// Pac-Man mouth
ctx.beginPath();
ctx.moveTo(200, 200);
ctx.arc(200, 200, 60, 0.3, Math.PI * 2 - 0.3);
ctx.closePath();
ctx.fillStyle = "yellow";
ctx.fill();

// ── Lines and Paths ──────────────────────────────────────
ctx.beginPath();
ctx.moveTo(100, 100);              // starting point (pick up pen)
ctx.lineTo(300, 100);              // draw line to this point
ctx.lineTo(200, 250);              // draw line to this point
ctx.closePath();                   // close back to start
ctx.fillStyle = "#10b981";
ctx.fill();
ctx.strokeStyle = "#059669";
ctx.lineWidth = 2;
ctx.stroke();

// Curved lines
ctx.beginPath();
ctx.moveTo(50, 300);
ctx.quadraticCurveTo(200, 100, 350, 300); // control point, end point
ctx.strokeStyle = "#8b5cf6";
ctx.lineWidth = 3;
ctx.stroke();

ctx.beginPath();
ctx.moveTo(50, 400);
ctx.bezierCurveTo(150, 200, 300, 600, 400, 400); // cp1x, cp1y, cp2x, cp2y, ex, ey
ctx.stroke();

// ── Text ─────────────────────────────────────────────────
ctx.font         = "bold 32px Arial, sans-serif";
ctx.fillStyle    = "white";
ctx.textAlign    = "center";      // "left", "center", "right"
ctx.textBaseline = "middle";      // "top", "middle", "bottom", "alphabetic"
ctx.fillText("Score: 1,250", canvas.width / 2, 40);

// Outlined text
ctx.strokeStyle = "black";
ctx.lineWidth   = 2;
ctx.strokeText("GAME OVER", canvas.width / 2, canvas.height / 2);
ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

// Measure text width (useful for centering manually)
const metrics = ctx.measureText("Hello");
console.log(metrics.width); // width in pixels
\`\`\`

## Transformations

\`\`\`js
// Always save/restore when transforming — don't pollute the global state
ctx.save();           // save current transformation matrix

ctx.translate(400, 300); // move origin to center of canvas
ctx.rotate(Math.PI / 4); // rotate 45 degrees clockwise
ctx.scale(2, 2);         // double the size

ctx.fillStyle = "blue";
ctx.fillRect(-25, -25, 50, 50); // draws at the transformed origin

ctx.restore();        // restore saved transformation

// Rotating a sprite around its center point
function drawRotatedRect(x, y, width, height, angle) {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2); // move to center
  ctx.rotate(angle);                               // rotate around center
  ctx.fillRect(-width / 2, -height / 2, width, height); // draw from center
  ctx.restore();
}

drawRotatedRect(100, 100, 80, 40, Math.PI / 6); // 30 degrees
\`\`\`

## Images and Sprites

\`\`\`js
// Load an image
const playerImg = new Image();
playerImg.src   = "sprites/player.png";

// Draw image (wait for load!)
playerImg.onload = () => {
  // Draw the whole image
  ctx.drawImage(playerImg, 100, 100);

  // Draw scaled
  ctx.drawImage(playerImg, 100, 100, 64, 64); // width, height

  // Draw a sprite from a spritesheet (clip a region)
  ctx.drawImage(
    playerImg,
    frameX * 64, frameY * 64,  // source x, y (which frame)
    64, 64,                     // source width, height
    player.x, player.y,         // destination x, y
    64, 64                      // destination width, height
  );
};

// Sprite animation
class AnimatedSprite {
  constructor(src, frameWidth, frameHeight, totalFrames, fps = 12) {
    this.image       = new Image();
    this.image.src   = src;
    this.frameWidth  = frameWidth;
    this.frameHeight = frameHeight;
    this.totalFrames = totalFrames;
    this.fps         = fps;
    this.currentFrame = 0;
    this.timer        = 0;
  }

  update(deltaTime) {
    this.timer += deltaTime;
    if (this.timer >= 1 / this.fps) {
      this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
      this.timer = 0;
    }
  }

  draw(ctx, x, y) {
    ctx.drawImage(
      this.image,
      this.currentFrame * this.frameWidth, 0,
      this.frameWidth, this.frameHeight,
      x, y,
      this.frameWidth, this.frameHeight
    );
  }
}
\`\`\`

## The Game Loop

\`\`\`js
// The game loop — runs as fast as the screen refreshes (60fps on most screens)
let lastTime = 0;
let fps = 0;
let frameCount = 0;
let fpsTimer = 0;

function gameLoop(timestamp) {
  // Calculate delta time — time since last frame in seconds
  const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;

  // Track FPS
  frameCount++;
  fpsTimer += deltaTime;
  if (fpsTimer >= 1) {
    fps       = frameCount;
    frameCount = 0;
    fpsTimer   = 0;
  }

  // 1. UPDATE — move everything
  update(deltaTime);

  // 2. DRAW — render everything
  draw();

  // 3. LOOP — schedule next frame
  requestAnimationFrame(gameLoop);
}

function update(dt) {
  // Update game state based on delta time
  player.x += player.vx * dt;
  player.y += player.vy * dt;

  // Update all enemies
  enemies.forEach(e => {
    e.x += e.vx * dt;
    e.y += e.vy * dt;
  });

  // Update particles
  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => {
    p.x    += p.vx * dt;
    p.y    += p.vy * dt;
    p.vy   += 500 * dt; // gravity on particles
    p.life -= dt;
    p.alpha = p.life / p.maxLife;
  });
}

function draw() {
  // 1. Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Or fill with background
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Draw background layers (furthest first)
  drawBackground();

  // 3. Draw game objects
  enemies.forEach(e => e.draw(ctx));
  player.draw(ctx);
  particles.forEach(p => p.draw(ctx));

  // 4. Draw UI last (always on top)
  drawHUD();
  ctx.fillStyle = "white";
  ctx.font = "14px monospace";
  ctx.fillText(\`FPS: \${fps}\`, 10, 20);
}

// Start the loop
requestAnimationFrame(gameLoop);
\`\`\``,

'Collision Detection and Physics': `# Collision Detection and Physics

Collision detection is what makes game objects interact with each other. Without it, players would fall through floors, bullets would pass through enemies, and games would be unplayable. Physics adds realistic forces like gravity, friction, and momentum to make games feel alive.

## Why Collision Detection is Hard

\`\`\`
Naive approach: Check every object against every other object
  100 objects: 100 × 100 = 10,000 checks per frame
  1000 objects: 1,000,000 checks per frame (too slow!)

Smart approach: Only check nearby objects
  Spatial partitioning: Divide space into grid cells
  Broadphase: Quickly eliminate far-apart objects
  Narrowphase: Precise check only for nearby objects
\`\`\`

## Axis-Aligned Bounding Box (AABB)

The fastest rectangle collision check — works when rectangles are not rotated:

\`\`\`js
// Core AABB test — are two rectangles overlapping?
function aabbCollide(a, b) {
  return (
    a.x              < b.x + b.width  &&   // a's left   < b's right
    a.x + a.width    > b.x            &&   // a's right  > b's left
    a.y              < b.y + b.height &&   // a's top    < b's bottom
    a.y + a.height   > b.y                 // a's bottom > b's top
  );
}

// Extended version that also returns overlap amount (useful for resolution)
function aabbCollideDetailed(a, b) {
  const overlapX = Math.min(a.x + a.width,  b.x + b.width)  - Math.max(a.x, b.x);
  const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);

  if (overlapX <= 0 || overlapY <= 0) return null; // no collision

  return {
    colliding: true,
    overlapX,  // how much they overlap horizontally
    overlapY,  // how much they overlap vertically
    // Collision direction: push out in the axis with smallest overlap
    normal: overlapX < overlapY ? { x: a.x < b.x ? -1 : 1, y: 0 }
                                 : { x: 0, y: a.y < b.y ? -1 : 1 },
  };
}
\`\`\`

## Circle Collision

\`\`\`js
function circleCollide(a, b) {
  // Distance between centers
  const dx   = a.x - b.x;
  const dy   = a.y - b.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Colliding if distance < sum of radii
  return dist < a.radius + b.radius;
}

// Without sqrt (faster — compare squared distances)
function circleCollideFast(a, b) {
  const dx   = a.x - b.x;
  const dy   = a.y - b.y;
  const dist2 = dx * dx + dy * dy;
  const radii = a.radius + b.radius;
  return dist2 < radii * radii; // no sqrt needed!
}

// With collision response data
function circleCollideDetailed(a, b) {
  const dx   = b.x - a.x;
  const dy   = b.y - a.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const minDist = a.radius + b.radius;

  if (dist >= minDist) return null; // no collision

  const overlap = minDist - dist;
  const nx = dx / dist; // normalized direction (unit vector)
  const ny = dy / dist;

  return {
    colliding: true,
    overlap,
    normal: { x: nx, y: ny }, // direction to push objects apart
  };
}
\`\`\`

## Gravity and Jumping

\`\`\`js
const GRAVITY     = 800;  // pixels per second squared (like 9.8 m/s²)
const JUMP_POWER  = -550; // negative = upward in canvas coordinates
const MOVE_SPEED  = 250;
const FRICTION    = 0.85; // velocity multiplier per frame (0-1, lower = more friction)
const AIR_RESISTANCE = 0.98;

class Player {
  constructor(x, y) {
    this.x        = x;
    this.y        = y;
    this.vx       = 0;
    this.vy       = 0;
    this.width    = 32;
    this.height   = 48;
    this.onGround = false;
    this.jumpsLeft = 2; // double jump!
    this.color    = "#3b82f6";
  }

  update(dt, platforms, keys) {
    // ── Horizontal movement ─────────────────────────────
    if (keys["ArrowLeft"] || keys["KeyA"]) {
      this.vx = -MOVE_SPEED;
    } else if (keys["ArrowRight"] || keys["KeyD"]) {
      this.vx = MOVE_SPEED;
    } else {
      // Apply friction to slow down when no key pressed
      this.vx *= this.onGround ? FRICTION : AIR_RESISTANCE;
      if (Math.abs(this.vx) < 0.1) this.vx = 0;
    }

    // ── Vertical physics ────────────────────────────────
    if (!this.onGround) {
      this.vy += GRAVITY * dt;
    }

    // Terminal velocity (cap fall speed)
    this.vy = Math.min(this.vy, 1200);

    // ── Move ─────────────────────────────────────────────
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // ── Platform collision ───────────────────────────────
    this.onGround = false;

    for (const plat of platforms) {
      const col = aabbCollideDetailed(this, plat);
      if (!col) continue;

      if (col.normal.y === -1 && this.vy > 0) {
        // Landing on top of platform
        this.y        = plat.y - this.height;
        this.vy       = 0;
        this.onGround = true;
        this.jumpsLeft = 2;
      } else if (col.normal.y === 1 && this.vy < 0) {
        // Hitting underside of platform
        this.y  = plat.y + plat.height;
        this.vy = 0;
      } else if (col.normal.x !== 0) {
        // Hitting side of platform
        this.x -= col.normal.x * col.overlapX;
        this.vx = 0;
      }
    }

    // ── Screen bounds ────────────────────────────────────
    if (this.x < 0) {
      this.x  = 0;
      this.vx = Math.abs(this.vx) * 0.5; // bounce
    }
    if (this.x + this.width > canvas.width) {
      this.x  = canvas.width - this.width;
      this.vx = -Math.abs(this.vx) * 0.5;
    }

    // Fell off screen
    if (this.y > canvas.height + 100) {
      this.respawn();
    }
  }

  jump() {
    if (this.jumpsLeft > 0) {
      this.vy        = JUMP_POWER;
      this.onGround  = false;
      this.jumpsLeft--;

      // Second jump is weaker
      if (this.jumpsLeft === 0) {
        this.vy *= 0.8;
      }
    }
  }

  respawn() {
    this.x         = 100;
    this.y         = 100;
    this.vx        = 0;
    this.vy        = 0;
    this.jumpsLeft = 2;
  }

  draw(ctx) {
    // Body
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Eyes
    ctx.fillStyle = "white";
    ctx.fillRect(this.x + 6,  this.y + 8,  8, 8);
    ctx.fillRect(this.x + 18, this.y + 8,  8, 8);
    ctx.fillStyle = "black";
    ctx.fillRect(this.x + 8,  this.y + 10, 4, 4);
    ctx.fillRect(this.x + 20, this.y + 10, 4, 4);

    // Jump indicator
    if (this.jumpsLeft === 2) {
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillRect(this.x, this.y - 6, this.width, 4);
    } else if (this.jumpsLeft === 1) {
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillRect(this.x, this.y - 6, this.width / 2, 4);
    }
  }
}
\`\`\`

## Particle Systems

\`\`\`js
class Particle {
  constructor(x, y, color = "#fbbf24") {
    this.x      = x;
    this.y      = y;
    this.vx     = (Math.random() - 0.5) * 300;
    this.vy     = Math.random() * -400 - 100;
    this.radius = Math.random() * 6 + 2;
    this.maxLife = Math.random() * 0.8 + 0.4;
    this.life   = this.maxLife;
    this.color  = color;
  }

  update(dt) {
    this.x    += this.vx * dt;
    this.y    += this.vy * dt;
    this.vy   += 400 * dt; // gravity
    this.vx   *= 0.98;     // air resistance
    this.life -= dt;
  }

  draw(ctx) {
    const alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle   = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * alpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  get isDead() { return this.life <= 0; }
}

// Usage — burst of particles on collision
function createExplosion(x, y, count = 20, color = "#fbbf24") {
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y, color));
  }
}

// In game loop:
particles = particles.filter(p => !p.isDead);
particles.forEach(p => { p.update(dt); p.draw(ctx); });
\`\`\`

## Spatial Hashing — Efficient Collision for Many Objects

\`\`\`js
class SpatialHash {
  constructor(cellSize = 100) {
    this.cellSize = cellSize;
    this.cells    = new Map();
  }

  hash(x, y) {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    return \`\${cx},\${cy}\`;
  }

  insert(obj) {
    const keys = this.getKeys(obj);
    for (const key of keys) {
      if (!this.cells.has(key)) this.cells.set(key, []);
      this.cells.get(key).push(obj);
    }
  }

  getKeys(obj) {
    const keys = new Set();
    const x1 = Math.floor(obj.x / this.cellSize);
    const y1 = Math.floor(obj.y / this.cellSize);
    const x2 = Math.floor((obj.x + (obj.width  || obj.radius * 2)) / this.cellSize);
    const y2 = Math.floor((obj.y + (obj.height || obj.radius * 2)) / this.cellSize);
    for (let x = x1; x <= x2; x++)
      for (let y = y1; y <= y2; y++)
        keys.add(\`\${x},\${y}\`);
    return keys;
  }

  getNearby(obj) {
    const nearby = new Set();
    for (const key of this.getKeys(obj)) {
      const cell = this.cells.get(key);
      if (cell) cell.forEach(o => { if (o !== obj) nearby.add(o); });
    }
    return nearby;
  }

  clear() { this.cells.clear(); }
}

// Usage in game loop
const grid = new SpatialHash(100);

function checkCollisions() {
  grid.clear();
  bullets.forEach(b => grid.insert(b));

  enemies.forEach(enemy => {
    const nearby = grid.getNearby(enemy); // only check nearby bullets!
    for (const bullet of nearby) {
      if (circleCollide(enemy, bullet)) {
        enemy.takeDamage(bullet.damage);
        bullet.destroy();
        createExplosion(bullet.x, bullet.y);
      }
    }
  });
}
\`\`\``,

};

const updateContent = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const courses = await Course.find({});
  let updatedCount = 0;

  for (const course of courses) {
    let modified = false;

    for (const mod of course.modules as any[]) {
      for (const lesson of mod.lessons as any[]) {
        const newContent = richContent[lesson.title];
        if (newContent && (lesson.content || '').length < 5000) {
          lesson.content = newContent;
          modified = true;
          updatedCount++;
          console.log(`  ✅ ${lesson.title} (${newContent.length} chars)`);
        }
      }
    }

    if (modified) {
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
