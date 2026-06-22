const { MongoClient } = require('mongodb');

const lessons = {
  "The 4 Core Design Principles": `# The 4 Core Design Principles

Every great UI is built on 4 fundamental principles. Master these and you can design anything.

## Why Design Principles Matter

Without principles, design is just guessing. These 4 rules explain why some interfaces feel effortless and others feel confusing. Every app you love — Instagram, WhatsApp, Google — follows these principles religiously.

\`\`\`mermaid
flowchart TD
    Design[Great UI Design] --> C[Contrast]
    Design --> R[Repetition]
    Design --> A[Alignment]
    Design --> P[Proximity]
    C --> C1[Makes important things stand out]
    R --> R1[Creates visual consistency]
    A --> A1[Creates order and structure]
    P --> P1[Groups related items together]
\`\`\`

## 1. Contrast

Contrast means making elements look **different** from each other so the user knows what is important. Without contrast, everything looks the same and nothing stands out.

Contrast can be achieved through:
- **Color** — dark text on light background
- **Size** — big heading vs small body text
- **Weight** — bold vs regular font
- **Shape** — round button vs flat card

\`\`\`html
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: system-ui; padding: 20px; background: #f8fafc; }
  .bad { background: #ddd; color: #aaa; padding: 16px; border-radius: 8px; margin-bottom: 16px; }
  .good { background: #1e293b; color: white; padding: 16px; border-radius: 8px; }
  .good h2 { color: #60a5fa; font-size: 24px; margin: 0 0 8px; }
  .good p { color: #94a3b8; margin: 0 0 12px; font-size: 14px; }
  .good button { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; }
  .label { font-size: 12px; font-weight: bold; margin-bottom: 8px; color: #64748b; }
</style>
</head>
<body>
  <div class="label">❌ BAD — No Contrast</div>
  <div class="bad">Welcome to our platform. Sign up today to get started with our amazing features.</div>

  <br>

  <div class="label">✅ GOOD — Strong Contrast</div>
  <div class="good">
    <h2>Welcome to PUGI</h2>
    <p>Master programming with hands-on courses taught by experts.</p>
    <button>Start Learning Free</button>
  </div>
</body>
</html>
\`\`\`

## 2. Repetition

Repetition means using the same visual elements consistently throughout your design. Same font, same colors, same button style, same spacing. This creates **brand recognition** and **visual harmony**.

\`\`\`mermaid
flowchart LR
    Brand[Brand Style] --> Colors[Color Palette\n#3b82f6 blue\n#1e293b dark\n#f8fafc light]
    Brand --> Fonts[Typography\nHeading: 24px bold\nBody: 16px regular\nSmall: 12px muted]
    Brand --> Spacing[Spacing System\n4px base unit\n8, 16, 24, 32px]
    Brand --> Radius[Border Radius\nCards: 12px\nButtons: 8px\nBadges: 999px]
\`\`\`

\`\`\`html
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: system-ui; padding: 20px; background: #f1f5f9; }
  .card { background: white; border-radius: 12px; padding: 20px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .card h3 { color: #1e293b; font-size: 16px; margin: 0 0 8px; }
  .card p { color: #64748b; font-size: 14px; margin: 0 0 12px; }
  .badge { background: #eff6ff; color: #3b82f6; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 999px; display: inline-block; }
  .btn { background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-size: 13px; cursor: pointer; }
</style>
</head>
<body>
  <div class="card">
    <h3>JavaScript Fundamentals</h3>
    <p>Learn the basics of JS from scratch</p>
    <span class="badge">Beginner</span>
    <button class="btn" style="float:right">Enroll</button>
  </div>
  <div class="card">
    <h3>React Foundations</h3>
    <p>Build modern UIs with React</p>
    <span class="badge">Intermediate</span>
    <button class="btn" style="float:right">Enroll</button>
  </div>
  <div class="card">
    <h3>Node.js & Express</h3>
    <p>Create powerful backend APIs</p>
    <span class="badge">Intermediate</span>
    <button class="btn" style="float:right">Enroll</button>
  </div>
</body>
</html>
\`\`\`

## 3. Alignment

Nothing should be placed randomly. Every element should be aligned to something — a grid, a margin, or another element. Alignment creates **order** and makes layouts feel professional.

\`\`\`mermaid
flowchart TD
    Align[Alignment Types] --> Left[Left Align\nMost readable for text]
    Align --> Center[Center Align\nGood for headings\nand hero sections]
    Align --> Right[Right Align\nGood for numbers\nand actions]
    Align --> Grid[Grid Align\nEverything snaps\nto a column grid]
\`\`\`

\`\`\`html
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: system-ui; padding: 20px; background: #f8fafc; }
  .bad { background: white; padding: 20px; border-radius: 12px; margin-bottom: 16px; border: 2px solid #fca5a5; }
  .bad h3 { margin-left: 30px; }
  .bad p { margin-left: 10px; }
  .bad button { margin-left: 50px; }
  .good { background: white; padding: 24px; border-radius: 12px; border: 2px solid #86efac; }
  .good h3 { margin: 0 0 8px; color: #1e293b; }
  .good p { margin: 0 0 16px; color: #64748b; font-size: 14px; }
  .good button { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
  label { font-size: 11px; font-weight: bold; color: #94a3b8; display: block; margin-bottom: 6px; }
</style>
</head>
<body>
  <label>❌ BAD — Random Alignment</label>
  <div class="bad">
    <h3>Create Account</h3>
    <p>Join thousands of learners today</p>
    <button>Sign Up</button>
  </div>
  <label>✅ GOOD — Consistent Left Alignment</label>
  <div class="good">
    <h3>Create Account</h3>
    <p>Join thousands of learners today</p>
    <button>Sign Up</button>
  </div>
</body>
</html>
\`\`\`

## 4. Proximity

Elements that are related should be **close together**. Elements that are unrelated should have more space between them. Proximity creates natural groupings that guide the user's eye.

\`\`\`html
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: system-ui; padding: 20px; background: #f8fafc; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .card { background: white; border-radius: 12px; padding: 20px; }
  label { font-size: 11px; font-weight: bold; color: #94a3b8; display: block; margin-bottom: 12px; }
  .profile-bad img { width: 48px; height: 48px; border-radius: 50%; background: #cbd5e1; display: block; }
  .profile-bad h4 { margin-top: 30px; }
  .profile-bad p { margin-top: 20px; }
  .profile-good { display: flex; align-items: center; gap: 12px; }
  .avatar { width: 48px; height: 48px; border-radius: 50%; background: #3b82f6; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; flex-shrink: 0; }
  .profile-good h4 { margin: 0 0 4px; color: #1e293b; font-size: 15px; }
  .profile-good p { margin: 0; color: #64748b; font-size: 13px; }
</style>
</head>
<body>
  <div class="card">
    <label>❌ BAD Proximity</label>
    <div class="profile-bad">
      <div class="avatar">A</div>
      <h4>Abdulazeez</h4>
      <p>Frontend Developer</p>
    </div>
  </div>
  <div class="card">
    <label>✅ GOOD Proximity</label>
    <div class="profile-good">
      <div class="avatar">A</div>
      <div>
        <h4>Abdulazeez</h4>
        <p>Frontend Developer</p>
      </div>
    </div>
  </div>
</body>
</html>
\`\`\`

## How the 4 Principles Work Together

\`\`\`mermaid
flowchart TD
    User[User opens your app] --> Eye[Eye scans the page]
    Eye --> Contrast[CONTRAST pulls eye\nto important elements]
    Contrast --> Proximity[PROXIMITY shows\nwhat belongs together]
    Proximity --> Alignment[ALIGNMENT creates\na path to follow]
    Alignment --> Repetition[REPETITION makes\nit feel familiar]
    Repetition --> Trust[User feels confident\nand keeps using the app]
\`\`\`

## Common Mistakes

1. **Too many fonts** — stick to 2 maximum (one for headings, one for body)
2. **Too many colors** — use a palette of 3-4 colors consistently
3. **Random spacing** — use a spacing system (4, 8, 16, 24, 32px)
4. **Centering everything** — center only short text like headings, not paragraphs

## Pro Tips

- **Use a grid** — 12-column grids keep everything aligned automatically
- **White space is not wasted space** — breathing room makes designs feel premium
- **Steal like an artist** — analyze apps you love and identify which principles they use
- **Design mobile first** — if it works on mobile, it works everywhere

## Quick Summary

- **Contrast** — make important things stand out
- **Repetition** — use consistent styles throughout
- **Alignment** — align everything to a grid or edge
- **Proximity** — group related things close together`,

  "Color Theory for UI": `# Color Theory for UI

Color is the most powerful tool in a designer's toolkit. The right colors build trust, guide attention, and create emotion. The wrong colors lose users instantly.

## How the Brain Processes Color

Colors trigger emotional and psychological responses before the user even reads a word. This is why banks use blue (trust), fast food uses red/yellow (urgency, appetite), and healthcare uses green/white (cleanliness, safety).

\`\`\`mermaid
flowchart LR
    Color --> Red[🔴 Red\nUrgency, Error\nDanger, Passion]
    Color --> Blue[🔵 Blue\nTrust, Calm\nProfessional]
    Color --> Green[🟢 Green\nSuccess, Nature\nHealth, Money]
    Color --> Yellow[🟡 Yellow\nWarning, Energy\nOptimism]
    Color --> Purple[🟣 Purple\nLuxury, Creative\nWisdom]
    Color --> Orange[🟠 Orange\nFriendly, Warm\nCall to Action]
\`\`\`

## The Color Wheel

\`\`\`mermaid
flowchart TD
    Wheel[Color Relationships] --> Primary[Primary Colors\nRed, Blue, Yellow\nCannot be mixed]
    Wheel --> Secondary[Secondary Colors\nGreen, Orange, Purple\nMixed from primary]
    Wheel --> Complementary[Complementary\nOpposite on wheel\nHigh contrast]
    Wheel --> Analogous[Analogous\nNext to each other\nHarmonious]
    Wheel --> Triadic[Triadic\n3 evenly spaced\nVibrant but balanced]
\`\`\`

## Building a Color Palette

Every good UI uses a structured palette with specific roles for each color:

\`\`\`html
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: system-ui; padding: 24px; background: #f8fafc; }
  h2 { color: #1e293b; margin-bottom: 16px; }
  .palette { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 24px; }
  .swatch { border-radius: 8px; padding: 12px 8px; text-align: center; }
  .swatch span { font-size: 11px; font-weight: bold; display: block; margin-top: 6px; }
  .demo { background: white; border-radius: 12px; padding: 24px; }
  .demo-header { background: #1e40af; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0; margin: -24px -24px 24px; display: flex; justify-content: space-between; align-items: center; }
  .btn-primary { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; }
  .btn-success { background: #22c55e; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; }
  .btn-danger { background: #ef4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; }
  .alert { background: #fef9c3; border: 1px solid #fde047; padding: 12px 16px; border-radius: 8px; color: #854d0e; margin-top: 16px; }
  .success-msg { background: #dcfce7; border: 1px solid #86efac; padding: 12px 16px; border-radius: 8px; color: #166534; margin-top: 8px; }
  .error-msg { background: #fee2e2; border: 1px solid #fca5a5; padding: 12px 16px; border-radius: 8px; color: #991b1b; margin-top: 8px; }
  .btn-row { display: flex; gap: 8px; margin-top: 16px; }
</style>
</head>
<body>
  <h2>PUGI Color System</h2>
  <div class="palette">
    <div class="swatch" style="background:#1e40af; color:white">Primary Dark<span>#1e40af</span></div>
    <div class="swatch" style="background:#3b82f6; color:white">Primary<span>#3b82f6</span></div>
    <div class="swatch" style="background:#93c5fd; color:#1e3a8a">Primary Light<span>#93c5fd</span></div>
    <div class="swatch" style="background:#22c55e; color:white">Success<span>#22c55e</span></div>
    <div class="swatch" style="background:#ef4444; color:white">Danger<span>#ef4444</span></div>
  </div>
  <div class="demo">
    <div class="demo-header">
      <strong>PUGI Dashboard</strong>
      <button class="btn-primary">+ New Course</button>
    </div>
    <p style="color:#64748b; margin:0 0 16px">Semantic colors tell users what each action means</p>
    <div class="btn-row">
      <button class="btn-primary">Save Changes</button>
      <button class="btn-success">Publish Course</button>
      <button class="btn-danger">Delete</button>
    </div>
    <div class="alert">⚠️ You have unsaved changes</div>
    <div class="success-msg">✅ Course published successfully!</div>
    <div class="error-msg">❌ Failed to save. Please try again.</div>
  </div>
</body>
</html>
\`\`\`

## Dark Mode Color System

\`\`\`html
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: system-ui; padding: 0; margin: 0; display: grid; grid-template-columns: 1fr 1fr; min-height: 200px; }
  .light { background: #f8fafc; padding: 24px; }
  .dark { background: #0f172a; padding: 24px; }
  .card-light { background: white; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .card-dark { background: #1e293b; border-radius: 12px; padding: 16px; }
  h3 { margin: 0 0 8px; font-size: 15px; }
  p { margin: 0 0 12px; font-size: 13px; }
  .light h3 { color: #1e293b; }
  .light p { color: #64748b; }
  .dark h3 { color: #f1f5f9; }
  .dark p { color: #94a3b8; }
  .btn { border: none; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: bold; cursor: pointer; }
  .btn-l { background: #3b82f6; color: white; }
  .btn-d { background: #60a5fa; color: #0f172a; }
  .mode-label { font-size: 11px; font-weight: bold; margin-bottom: 12px; }
  .light .mode-label { color: #94a3b8; }
  .dark .mode-label { color: #475569; }
</style>
</head>
<body>
  <div class="light">
    <div class="mode-label">☀️ LIGHT MODE</div>
    <div class="card-light">
      <h3>JavaScript Fundamentals</h3>
      <p>Learn JS from scratch with hands-on examples</p>
      <button class="btn btn-l">Enroll Now</button>
    </div>
  </div>
  <div class="dark">
    <div class="mode-label">🌙 DARK MODE</div>
    <div class="card-dark">
      <h3>JavaScript Fundamentals</h3>
      <p>Learn JS from scratch with hands-on examples</p>
      <button class="btn btn-d">Enroll Now</button>
    </div>
  </div>
</body>
</html>
\`\`\`

## Contrast Ratios — Accessibility

WCAG accessibility standards require minimum contrast ratios between text and background. This is not optional — it is the law in many countries and affects millions of users with visual impairments.

\`\`\`mermaid
flowchart TD
    WCAG[WCAG Contrast Standards] --> AA[AA Standard\nMinimum\nNormal text: 4.5:1\nLarge text: 3:1]
    WCAG --> AAA[AAA Standard\nEnhanced\nNormal text: 7:1\nLarge text: 4.5:1]
    AA --> Pass[✅ Most websites\nshould reach AA]
    AAA --> Best[✅ Government and\nmedical sites need AAA]
\`\`\`

\`\`\`html
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: system-ui; padding: 20px; }
  .row { display: flex; gap: 12px; margin-bottom: 12px; }
  .box { padding: 16px; border-radius: 8px; flex: 1; font-size: 14px; font-weight: 500; }
  label { font-size: 11px; font-weight: bold; color: #64748b; display: block; margin-bottom: 6px; }
</style>
</head>
<body>
  <label>Contrast Comparison</label>
  <div class="row">
    <div class="box" style="background:#fff; color:#aaa">❌ FAIL — White bg, gray text (1.6:1)</div>
    <div class="box" style="background:#fff; color:#767676">⚠️ PASS AA — White bg, mid gray (4.5:1)</div>
    <div class="box" style="background:#fff; color:#000">✅ PASS AAA — White bg, black text (21:1)</div>
  </div>
  <div class="row">
    <div class="box" style="background:#3b82f6; color:#93c5fd">❌ FAIL — Blue bg, light blue text</div>
    <div class="box" style="background:#3b82f6; color:#fff">✅ PASS — Blue bg, white text (4.6:1)</div>
    <div class="box" style="background:#1e40af; color:#fff">✅ PASS — Dark blue bg, white (8.6:1)</div>
  </div>
</body>
</html>
\`\`\`

## Common Color Mistakes

1. **Using too many colors** — stick to 3 main colors max
2. **Relying only on color** — color blind users exist, always use icons/text too
3. **Low contrast text** — always check your contrast ratio
4. **Ignoring dark mode** — many users prefer dark mode, design for both

## Pro Tips

- **60-30-10 rule** — 60% neutral (background), 30% primary, 10% accent
- **Use HSL not HEX** when coding — easier to adjust lightness/saturation
- **Test in grayscale** — if your design works in black and white, it works everywhere
- **Tool: coolors.co** — free palette generator
- **Tool: webaim.org/resources/contrastchecker** — free contrast checker

## Quick Summary

- Colors trigger emotion before users read anything
- Build a structured palette: primary, secondary, success, warning, danger, neutral
- Always meet WCAG AA contrast requirements (4.5:1 for normal text)
- The 60-30-10 rule keeps color balanced
- Never rely on color alone to convey information`
};

async function main() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('pugi');

  const course = await db.collection('courses').findOne({ title: 'UI/UX Design Fundamentals' });
  if (!course) { console.log('Course not found'); process.exit(1); }

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
    { title: 'UI/UX Design Fundamentals' },
    { $set: { modules: updatedModules } }
  );

  await client.close();
  console.log('\n🎉 UI/UX course updated with diagrams + browser previews!');
}

main().catch(console.error);
