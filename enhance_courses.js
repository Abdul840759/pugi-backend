const https = require('https');
const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'pugi';

function callClaude(lessonTitle, existingContent) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `You are an expert programming instructor. Expand and enrich this lesson with much more detail.

Lesson Title: "${lessonTitle}"

Existing Content:
${existingContent}

Keep everything that exists but ADD:
1. Deeper explanation of every concept with real-world analogies
2. More code examples with detailed line-by-line comments
3. A "Common Mistakes" section
4. A "Real World Use Case" section
5. A "Pro Tips" section
6. More practice exercises in the Try It Yourself section

Keep the same markdown format with \`\`\`js code blocks. Make it at least 3x longer and more educational.`
      }]
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': process.env.ANTHROPIC_API_KEY || ''
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message));
          resolve(parsed.content[0].text);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function enhance() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const courses = await db.collection('courses').find({ status: 'published' }).toArray();

  console.log(`Found ${courses.length} published courses\n`);

  for (const course of courses) {
    console.log(`\n📚 Course: ${course.title}`);
    const updatedModules = [];

    for (const mod of course.modules || []) {
      const updatedLessons = [];
      for (const lesson of mod.lessons || []) {
        if (!lesson.content || lesson.content.length > 3000) {
          console.log(`  ⏭  Skipping "${lesson.title}" (already long or empty)`);
          updatedLessons.push(lesson);
          continue;
        }
        console.log(`  ✨ Enhancing: "${lesson.title}"...`);
        try {
          const enhanced = await callClaude(lesson.title, lesson.content);
          updatedLessons.push({ ...lesson, content: enhanced });
          console.log(`  ✅ Done (${enhanced.length} chars)`);
          await new Promise(r => setTimeout(r, 1000));
        } catch (err) {
          console.error(`  ❌ Failed: ${err.message}`);
          updatedLessons.push(lesson);
        }
      }
      updatedModules.push({ ...mod, lessons: updatedLessons });
    }

    await db.collection('courses').updateOne(
      { _id: course._id },
      { $set: { modules: updatedModules } }
    );
    console.log(`✅ Course "${course.title}" updated!`);
  }

  await client.close();
  console.log('\n🎉 All courses enhanced!');
}

enhance().catch(console.error);
