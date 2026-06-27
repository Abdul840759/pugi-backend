const { MongoClient } = require('mongodb');

// Update this if your local script needs to point at Atlas instead of localhost
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const client = new MongoClient(MONGO_URI);

// ---------- small helpers to keep module/lesson definitions readable ----------
const lesson = (title, content, opts = {}) => ({
  title,
  type: opts.type || 'content',
  content,
  duration: opts.duration || '30 min',
  order: opts.order || 0,
});

const assignmentLesson = (title, instructions, opts = {}) => ({
  title,
  type: 'assignment',
  content: instructions,
  duration: opts.duration || '60 min',
  assignment: {
    title,
    instructions,
    dueDays: opts.dueDays || 7,
    maxScore: opts.maxScore || 100,
  },
  order: opts.order || 0,
});

const quiz = (title, questions, passingScore = 70) => ({
  title,
  questions,
  passingScore,
});

const mod = (title, description, lessons, quizObj) => {
  const m = { title, description, lessons };
  if (quizObj) m.quiz = quizObj;
  return m;
};

// =========================================================================
// MOBILE DEVELOPMENT MASTERY
// =========================================================================

const mobileBeginnerModules = [
  mod(
    'Module 1: Mobile Development Foundations',
    'Understand how mobile operating systems work and what makes a great mobile UI.',
    [
      lesson('Understanding the Mobile Ecosystem',
        '# The Mobile Ecosystem\n\nAndroid and iOS both run apps inside a managed lifecycle: created → started → resumed → paused → stopped → destroyed. Understanding this lifecycle matters because mobile apps are frequently interrupted by calls, notifications, and app switching — your app has to save state gracefully at any point.\n\nKey expectations users have for mobile apps:\n- Fast cold start (under 2-3 seconds)\n- Works offline or degrades gracefully\n- Respects battery and data usage\n- Feels native to the platform (back gesture, navigation patterns)\n\nFlutter abstracts a lot of this, but the underlying lifecycle still drives how you structure state.'),
      lesson('Native vs Hybrid Apps',
        '# Native vs Hybrid Apps\n\n**Native apps** (Swift/Kotlin) are built directly for one platform using its own SDK. They get the best performance and full access to platform APIs, but you write the app twice.\n\n**Hybrid/cross-platform apps** (Flutter, React Native) share one codebase across platforms.\n\n- Flutter compiles to native ARM code and draws its own UI with the Skia/Impeller engine — this gives it near-native performance with one codebase.\n- React Native bridges to native UI components instead of drawing its own.\n\nFor this course we use Flutter because it gives the best balance of single-codebase development and native-feeling performance.'),
      lesson('Mobile UI Principles',
        '# Mobile UI Principles\n\nThree principles guide every screen you build:\n\n1. **Usability** — Tap targets should be at least 48x48dp, important actions go within thumb reach.\n2. **Responsiveness** — Layouts must adapt to phones, tablets, and foldables. Avoid fixed pixel sizing.\n3. **Accessibility** — Support screen readers (TalkBack/VoiceOver), sufficient color contrast, and scalable text.\n\nFlutter\'s widget tree makes responsive design straightforward with widgets like `LayoutBuilder` and `MediaQuery`, which you\'ll use starting in Module 3.'),
    ],
    quiz('Module 1 Quiz', [
      { prompt: 'What is the main difference between native and hybrid apps?', options: ['Native apps are always slower', 'Native apps are built per-platform with the platform SDK; hybrid apps share one codebase', 'Hybrid apps cannot access the camera', 'There is no real difference'], correctOptionIndex: 1, points: 1 },
      { prompt: 'Why is UI important in mobile apps?', options: ['It only affects appearance', 'It directly affects usability, accessibility, and user retention', 'It has no effect on performance', 'It is optional for MVPs'], correctOptionIndex: 1, points: 1 },
    ])
  ),
  mod(
    'Module 2: Programming Basics',
    'Refresh the core programming concepts you will use constantly in Dart and Flutter.',
    [
      lesson('Variables and Data Types',
        '# Variables and Data Types\n\nDart is statically typed but supports type inference with `var`.\n\n```dart\nString name = "Abdul";\nint age = 25;\ndouble rating = 4.8;\nbool isEnrolled = true;\nvar inferred = "Dart figures out the type"; // String\n```\n\nDart also has `final` (set once, decided at runtime) and `const` (compile-time constant) — prefer these over `var` when a value won\'t change, since the compiler can optimize and you avoid accidental reassignment bugs.'),
      lesson('Functions and Loops',
        '# Functions and Loops\n\n```dart\nint add(int a, int b) {\n  return a + b;\n}\n\n// Arrow syntax for one-line functions\nint square(int x) => x * x;\n\nfor (int i = 0; i < 5; i++) {\n  print("Lesson $i");\n}\n\nList<String> courses = ["Mobile Dev", "ML", "Web Dev"];\nfor (var course in courses) {\n  print(course);\n}\n```\n\nFunctions in Dart are first-class — you can pass them as arguments, which is exactly how Flutter widgets handle callbacks like `onPressed`.'),
      lesson('Object-Oriented Programming',
        '# Object-Oriented Programming in Dart\n\n```dart\nclass Course {\n  final String title;\n  final int durationWeeks;\n\n  Course(this.title, this.durationWeeks);\n\n  String describe() => "$title runs for $durationWeeks weeks";\n}\n\nclass PremiumCourse extends Course {\n  final double price;\n  PremiumCourse(String title, int duration, this.price) : super(title, duration);\n\n  @override\n  String describe() => "${super.describe()} — \\$$price";\n}\n```\n\nEvery Flutter widget you\'ll build in Module 3 is a Dart class — understanding constructors, inheritance, and `@override` here makes Flutter widgets feel familiar instead of magical.'),
    ],
  ),
  mod(
    'Module 3: Flutter Fundamentals',
    'Build your first real Flutter UI using widgets, layouts, and navigation.',
    [
      lesson('Widgets',
        '# Widgets\n\nEverything in Flutter is a widget. Widgets are either:\n- **StatelessWidget** — UI that never changes after being built\n- **StatefulWidget** — UI that can rebuild itself when internal data changes\n\n```dart\nclass HelloCard extends StatelessWidget {\n  const HelloCard({super.key});\n\n  @override\n  Widget build(BuildContext context) {\n    return Card(\n      child: Padding(\n        padding: const EdgeInsets.all(16),\n        child: Text("Hello, PUGI learner!"),\n      ),\n    );\n  }\n}\n```\n\nEvery widget has a `build()` method that returns the widget tree below it — Flutter calls this every time the widget needs to redraw.'),
      lesson('Layouts',
        '# Layouts\n\n```dart\nColumn(\n  crossAxisAlignment: CrossAxisAlignment.start,\n  children: [\n    Text("Mobile Development Mastery", style: TextStyle(fontSize: 22)),\n    Row(\n      children: [\n        Icon(Icons.timer),\n        SizedBox(width: 8),\n        Text("14 weeks"),\n      ],\n    ),\n    Expanded(\n      child: GridView.count(\n        crossAxisCount: 2,\n        children: List.generate(4, (i) => Card(child: Center(child: Text("Module $i")))),\n      ),\n    ),\n  ],\n)\n```\n\n`Column` and `Row` are your main axis-based layouts; `Expanded` and `Flexible` control how children share remaining space.'),
      lesson('Navigation',
        '# Navigation\n\n```dart\n// Push a new screen\nNavigator.push(\n  context,\n  MaterialPageRoute(builder: (context) => CourseDetailScreen(id: courseId)),\n);\n\n// Go back\nNavigator.pop(context);\n\n// Named routes (better for larger apps)\nMaterialApp(\n  routes: {\n    \'/\': (context) => HomeScreen(),\n    \'/course\': (context) => CourseDetailScreen(),\n  },\n);\nNavigator.pushNamed(context, \'/course\');\n```\n\nFor apps with deep linking or many screens, packages like `go_router` give you URL-based navigation similar to web routing.'),
    ],
    [],
  ),
  mod(
    'Module 4: UI Design',
    'Make screens that look and feel professional with forms, actions, and theming.',
    [
      lesson('Forms and Inputs',
        '# Forms and Inputs\n\n```dart\nfinal _formKey = GlobalKey<FormState>();\nfinal emailController = TextEditingController();\n\nForm(\n  key: _formKey,\n  child: TextFormField(\n    controller: emailController,\n    decoration: InputDecoration(labelText: "Email"),\n    validator: (value) {\n      if (value == null || !value.contains("@")) {\n        return "Enter a valid email";\n      }\n      return null;\n    },\n  ),\n)\n\n// On submit\nif (_formKey.currentState!.validate()) {\n  // proceed\n}\n```\n\nAlways validate on the client for instant feedback, but never trust client-side validation alone — your backend must validate too.'),
      lesson('Buttons and Actions',
        '# Buttons and Actions\n\n```dart\nElevatedButton(\n  onPressed: () {\n    setState(() => isLoading = true);\n  },\n  child: isLoading ? CircularProgressIndicator() : Text("Enroll Now"),\n)\n\nTextButton(onPressed: () {}, child: Text("Skip"))\nOutlinedButton(onPressed: () {}, child: Text("Learn More"))\n```\n\nAlways give the user feedback on tap — a loading spinner, a disabled state, or a toast — since mobile networks are unreliable and silent taps feel broken.'),
      lesson('Themes and Styling',
        '# Themes and Styling\n\n```dart\nMaterialApp(\n  theme: ThemeData(\n    colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),\n    textTheme: TextTheme(\n      headlineMedium: TextStyle(fontWeight: FontWeight.bold, fontSize: 24),\n    ),\n    useMaterial3: true,\n  ),\n  darkTheme: ThemeData.dark(),\n  themeMode: ThemeMode.system,\n)\n```\n\nDefine your theme once at the `MaterialApp` level so every widget below inherits consistent colors and typography instead of hardcoding styles per screen.'),
    ],
  ),
  mod(
    'Module 5: State Management',
    'Learn how Flutter widgets react to changing data.',
    [
      lesson('State Basics',
        '# State Basics\n\n```dart\nclass Counter extends StatefulWidget {\n  @override\n  State<Counter> createState() => _CounterState();\n}\n\nclass _CounterState extends State<Counter> {\n  int count = 0;\n\n  @override\n  Widget build(BuildContext context) {\n    return Column(\n      children: [\n        Text("$count"),\n        ElevatedButton(\n          onPressed: () => setState(() => count++),\n          child: Text("Increment"),\n        ),\n      ],\n    );\n  }\n}\n```\n\nCalling `setState()` tells Flutter "this widget\'s data changed, rebuild it." Without it, changing a variable does nothing visible on screen.'),
      lesson('Updating UI Dynamically',
        '# Updating UI Dynamically\n\nLists and async data need to update the UI as they change:\n\n```dart\nList<String> enrolledCourses = [];\n\nvoid enroll(String course) {\n  setState(() {\n    enrolledCourses.add(course);\n  });\n}\n\nListView.builder(\n  itemCount: enrolledCourses.length,\n  itemBuilder: (context, index) => ListTile(title: Text(enrolledCourses[index])),\n)\n```\n\n`ListView.builder` only renders visible items, which keeps long lists smooth even with thousands of entries.'),
      lesson('Managing User Input',
        '# Managing User Input\n\nFor apps beyond a single screen, lifting state up or using a state management package (Provider, Riverpod, Bloc) avoids "prop drilling" callbacks through many widgets.\n\n```dart\n// Simple Provider example\nclass CartProvider extends ChangeNotifier {\n  final List<String> items = [];\n  void add(String item) {\n    items.add(item);\n    notifyListeners();\n  }\n}\n\n// Anywhere in the widget tree\nfinal cart = context.watch<CartProvider>();\n```\n\nWe\'ll use simple `setState` through Module 6, then introduce Provider-style patterns once apps get more complex in the intermediate level.'),
    ],
  ),
  mod(
    'Module 6: Local Storage',
    'Persist data on-device so your app works offline.',
    [
      lesson('Shared Preferences',
        '# Shared Preferences\n\nFor small key-value data (settings, flags, tokens):\n\n```dart\nfinal prefs = await SharedPreferences.getInstance();\nawait prefs.setBool(\'onboarded\', true);\nawait prefs.setString(\'theme\', \'dark\');\n\nbool onboarded = prefs.getBool(\'onboarded\') ?? false;\n```\n\nSharedPreferences is not encrypted by default — never store passwords or tokens in plain SharedPreferences; use `flutter_secure_storage` for sensitive values instead.'),
      lesson('SQLite',
        '# SQLite with sqflite\n\nFor structured, queryable local data:\n\n```dart\nfinal db = await openDatabase(\n  \'todos.db\',\n  version: 1,\n  onCreate: (db, version) {\n    return db.execute(\n      \'CREATE TABLE todos(id INTEGER PRIMARY KEY, title TEXT, done INTEGER)\',\n    );\n  },\n);\n\nawait db.insert(\'todos\', {\'title\': \'Build Module 6\', \'done\': 0});\nfinal todos = await db.query(\'todos\');\n```\n\nSQLite is ideal once you need filtering, sorting, or relationships between local records — beyond what flat key-value storage can do well.'),
      lesson('Offline Storage Strategy',
        '# Offline Storage Strategy\n\nA solid offline-first app typically:\n1. Reads from local storage first (instant UI)\n2. Syncs with the server in the background\n3. Queues writes made while offline and replays them on reconnect\n\n```dart\nif (await Connectivity().checkConnectivity() == ConnectivityResult.none) {\n  // save to local queue table instead of calling API directly\n}\n```\n\nThis pattern is exactly what you\'ll use in the To-do mini project below.'),
      assignmentLesson('Mini Project: Build a To-do Application',
        'Build a fully offline-capable to-do app using sqflite for storage. Requirements:\n\n1. Add, edit, delete, and mark tasks complete\n2. Persist tasks locally using SQLite\n3. App must retain all data after a full app restart\n4. Include a simple "completed" filter view\n\nSubmit your project as a zipped Flutter project or GitHub link.', { dueDays: 10, maxScore: 100 }),
    ],
    quiz('Module 6 Assessment', [
      { prompt: 'Why should you avoid storing tokens in plain SharedPreferences?', options: ['It is too slow', 'It is not encrypted by default', 'It cannot store strings', 'It requires internet access'], correctOptionIndex: 1, points: 1 },
      { prompt: 'When should you reach for SQLite instead of SharedPreferences?', options: ['Never, SharedPreferences is always enough', 'When you need structured, queryable data', 'Only for images', 'Only when offline'], correctOptionIndex: 1, points: 1 },
    ])
  ),
];

const mobileIntermediateModules = [
  mod('Module 7: APIs and JSON', 'Connect your Flutter app to real backend data.',
    [
      lesson('REST APIs',
        '# REST APIs\n\nREST APIs expose resources over HTTP using standard verbs:\n\n- `GET /courses` — list courses\n- `POST /courses` — create a course\n- `PUT /courses/:id` — update a course\n- `DELETE /courses/:id` — remove a course\n\n```dart\nfinal response = await http.get(Uri.parse(\'https://api.pugi.com/courses\'));\nif (response.statusCode == 200) {\n  // success\n}\n```\n\nAlways check `statusCode` before assuming the body is valid — a 200 means success, 4xx means client error, 5xx means server error.'),
      lesson('Fetching Data',
        '# Fetching Data\n\n```dart\nFuture<List<Course>> fetchCourses() async {\n  final response = await http.get(Uri.parse(\'https://api.pugi.com/courses\'));\n  if (response.statusCode != 200) {\n    throw Exception(\'Failed to load courses\');\n  }\n  final List data = jsonDecode(response.body);\n  return data.map((json) => Course.fromJson(json)).toList();\n}\n\n// In the widget\nFutureBuilder<List<Course>>(\n  future: fetchCourses(),\n  builder: (context, snapshot) {\n    if (snapshot.connectionState == ConnectionState.waiting) return CircularProgressIndicator();\n    if (snapshot.hasError) return Text(\'Error: ${snapshot.error}\');\n    return ListView(children: snapshot.data!.map((c) => Text(c.title)).toList());\n  },\n)\n```'),
      lesson('JSON Parsing',
        '# JSON Parsing\n\n```dart\nclass Course {\n  final String id;\n  final String title;\n  final String level;\n\n  Course({required this.id, required this.title, required this.level});\n\n  factory Course.fromJson(Map<String, dynamic> json) {\n    return Course(\n      id: json[\'_id\'],\n      title: json[\'title\'],\n      level: json[\'level\'] ?? \'beginner\',\n    );\n  }\n}\n```\n\nFor larger apps, code generation packages like `json_serializable` remove the need to hand-write `fromJson`/`toJson` for every model.'),
    ],
  ),
  mod('Module 8: Authentication Systems', 'Implement secure login and session handling.',
    [
      lesson('Login Systems',
        '# Login Systems\n\n```dart\nFuture<String> login(String email, String password) async {\n  final response = await http.post(\n    Uri.parse(\'https://api.pugi.com/auth/login\'),\n    headers: {\'Content-Type\': \'application/json\'},\n    body: jsonEncode({\'email\': email, \'password\': password}),\n  );\n  final data = jsonDecode(response.body);\n  if (response.statusCode == 200) return data[\'token\'];\n  throw Exception(data[\'message\'] ?? \'Login failed\');\n}\n```\n\nNever log raw passwords, even in debug builds — strip sensitive fields from any logging interceptor before shipping.'),
      lesson('User Sessions',
        '# User Sessions\n\nAfter login, store the JWT securely and attach it to future requests:\n\n```dart\nfinal storage = FlutterSecureStorage();\nawait storage.write(key: \'token\', value: token);\n\nfinal token = await storage.read(key: \'token\');\nfinal response = await http.get(\n  Uri.parse(\'https://api.pugi.com/me\'),\n  headers: {\'Authorization\': \'Bearer $token\'},\n);\n```\n\nWhen a request returns 401, clear the stored token and route the user back to login — don\'t silently retry forever.'),
      lesson('Secure Authentication',
        '# Secure Authentication Practices\n\n- Always use HTTPS, never HTTP, for auth endpoints\n- Store tokens in `flutter_secure_storage`, not SharedPreferences\n- Implement refresh tokens so users aren\'t logged out every hour\n- Add biometric login (fingerprint/Face ID) as an optional convenience layer on top of, not instead of, password/OAuth auth\n\n```dart\nfinal LocalAuthentication auth = LocalAuthentication();\nbool canCheck = await auth.canCheckBiometrics;\n```'),
    ],
  ),
  mod('Module 9: Databases', 'Connect to cloud databases for real-time, multi-device data.',
    [
      lesson('Firebase Setup',
        '# Firebase Setup\n\n```dart\nawait Firebase.initializeApp(\n  options: DefaultFirebaseOptions.currentPlatform,\n);\n\nfinal firestore = FirebaseFirestore.instance;\n```\n\nFirebase gives you a real-time NoSQL database, authentication, and cloud storage without managing your own backend server — useful for rapid prototyping or apps that need real-time sync.'),
      lesson('CRUD Operations',
        '# CRUD Operations with Firestore\n\n```dart\n// Create\nawait firestore.collection(\'tasks\').add({\'title\': \'Learn Firestore\', \'done\': false});\n\n// Read (real-time stream)\nfirestore.collection(\'tasks\').snapshots().listen((snapshot) {\n  for (var doc in snapshot.docs) {\n    print(doc.data());\n  }\n});\n\n// Update\nawait firestore.collection(\'tasks\').doc(taskId).update({\'done\': true});\n\n// Delete\nawait firestore.collection(\'tasks\').doc(taskId).delete();\n```'),
      lesson('Cloud Storage',
        '# Cloud Storage\n\n```dart\nfinal ref = FirebaseStorage.instance.ref().child(\'avatars/$userId.jpg\');\nawait ref.putFile(File(imagePath));\nfinal url = await ref.getDownloadURL();\n```\n\nAlways compress images client-side before upload — uploading raw camera photos (often 5-10MB) wastes user data and slows uploads significantly.'),
    ],
  ),
  mod('Module 10: Advanced UI', 'Polish your app with motion and custom components.',
    [
      lesson('Animations',
        '# Animations\n\n```dart\nAnimatedContainer(\n  duration: Duration(milliseconds: 300),\n  width: isExpanded ? 200 : 100,\n  color: isExpanded ? Colors.indigo : Colors.grey,\n  child: Text(\'Tap me\'),\n)\n```\n\nFor anything beyond simple property changes, `AnimationController` with a `Tween` gives full control over curves, timing, and chaining multiple animations together.'),
      lesson('Custom Components',
        '# Custom Components\n\n```dart\nclass CourseCard extends StatelessWidget {\n  final String title;\n  final String level;\n  const CourseCard({required this.title, required this.level, super.key});\n\n  @override\n  Widget build(BuildContext context) {\n    return Card(\n      child: ListTile(\n        title: Text(title),\n        subtitle: Text(level.toUpperCase()),\n        trailing: Icon(Icons.arrow_forward_ios),\n      ),\n    );\n  }\n}\n```\n\nExtracting repeated UI into components like this keeps screens short and makes your design consistent across the app.'),
      lesson('Responsive Scaling',
        '# Responsive Scaling\n\n```dart\nLayoutBuilder(\n  builder: (context, constraints) {\n    if (constraints.maxWidth > 600) {\n      return GridView.count(crossAxisCount: 3, children: cards);\n    }\n    return ListView(children: cards);\n  },\n)\n```\n\nDesign for the smallest supported phone first, then progressively enhance the layout as screen width grows, rather than designing for tablet and shrinking down.'),
    ],
  ),
  mod('Module 11: Notifications', 'Keep users engaged outside the app.',
    [
      lesson('Push Notifications',
        '# Push Notifications\n\n```dart\nFirebaseMessaging messaging = FirebaseMessaging.instance;\nNotificationSettings settings = await messaging.requestPermission();\n\nFirebaseMessaging.onMessage.listen((RemoteMessage message) {\n  print(\'Notification: ${message.notification?.title}\');\n});\n```\n\nAlways ask for notification permission with context — explain why (e.g. "get notified when your course progress streak is at risk") rather than prompting blindly on first launch.'),
      lesson('Scheduling Alerts',
        '# Scheduling Local Alerts\n\n```dart\nawait flutterLocalNotificationsPlugin.zonedSchedule(\n  0,\n  \'Keep your streak!\',\n  \'You haven\\\'t studied today\',\n  tz.TZDateTime.now(tz.local).add(Duration(hours: 8)),\n  notificationDetails,\n  androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,\n);\n```\n\nUse local notifications for time-based reminders (like a study streak), and push notifications for server-driven events (like a tutor replying to a question).'),
      lesson('Background Services',
        '# Background Services\n\nMobile OSes aggressively limit background work to save battery. For periodic sync tasks, use:\n- `workmanager` on Android/iOS for deferred background tasks\n- iOS Background App Refresh APIs for short bursts of work\n\nNever assume background code will run reliably or on a strict schedule — both platforms can delay or skip background tasks under battery-saving conditions.'),
    ],
  ),
  mod('Module 12: Testing', 'Catch bugs before your users do.',
    [
      lesson('Unit Testing',
        '# Unit Testing\n\n```dart\ntest(\'add returns correct sum\', () {\n  expect(add(2, 3), equals(5));\n});\n\ngroup(\'Course model\', () {\n  test(\'fromJson parses title correctly\', () {\n    final course = Course.fromJson({\'_id\': \'1\', \'title\': \'Flutter\', \'level\': \'beginner\'});\n    expect(course.title, \'Flutter\');\n  });\n});\n```\n\nUnit tests should run in milliseconds with no real network or database calls — mock those dependencies instead.'),
      lesson('UI Testing',
        '# UI (Widget) Testing\n\n```dart\ntestWidgets(\'Login button shows loading spinner on tap\', (tester) async {\n  await tester.pumpWidget(MyApp());\n  await tester.tap(find.byType(ElevatedButton));\n  await tester.pump();\n  expect(find.byType(CircularProgressIndicator), findsOneWidget);\n});\n```\n\nWidget tests run faster than full integration tests since they don\'t need a real device or emulator, while still exercising the real widget tree.'),
      lesson('Debugging Techniques',
        '# Debugging Techniques\n\n- `flutter run` with hot reload for instant UI feedback\n- Flutter DevTools for inspecting the widget tree and performance timeline\n- `debugPrint()` instead of `print()` to avoid log truncation on Android\n- `flutter analyze` to catch type and lint issues before runtime\n\nWhen state seems "stuck," the most common cause is forgetting to call `setState()` or mutating a list/map in place without notifying the framework.'),
      assignmentLesson('Mini Project: Build a Chat Application',
        'Build a real-time chat app using Firebase Firestore. Requirements:\n\n1. Users can send and receive messages in real time\n2. Messages persist and load on app restart\n3. Include basic authentication (can reuse Module 8 patterns)\n4. Include at least 2 widget tests and 2 unit tests', { dueDays: 10 }),
    ],
    quiz('Practical App Review', [
      { prompt: 'What is the main purpose of widget testing?', options: ['Testing server code', 'Verifying UI behavior without a full device', 'Replacing unit tests entirely', 'Only testing animations'], correctOptionIndex: 1, points: 1 },
      { prompt: 'Why should background sync logic never assume strict timing?', options: ['Background tasks always run on time', 'Mobile OSes can delay or skip background work to save battery', 'It is not allowed on Android', 'Timing does not matter for sync'], correctOptionIndex: 1, points: 1 },
    ])
  ),
];

const mobileAdvancedModules = [
  mod('Module 13: Performance Optimization', 'Make your app fast and lightweight.',
    [
      lesson('Memory Management',
        '# Memory Management\n\nDart uses automatic garbage collection, but you can still leak memory by holding references too long:\n\n```dart\n@override\nvoid dispose() {\n  _controller.dispose(); // always dispose controllers, streams, listeners\n  super.dispose();\n}\n```\n\nUndisposed `AnimationController`s, `StreamSubscription`s, and `TextEditingController`s are the most common source of memory leaks in Flutter apps.'),
      lesson('Reducing Lag',
        '# Reducing Lag\n\n- Avoid rebuilding large widget trees unnecessarily — use `const` constructors wherever possible\n- Use `ListView.builder` instead of `ListView(children: ...)` for long lists\n- Move heavy computation off the main thread with `compute()`\n\n```dart\nfinal result = await compute(parseLargeJson, jsonString);\n```'),
      lesson('App Speed Optimization',
        '# App Speed Optimization\n\n- Lazy-load images with caching (`cached_network_image`)\n- Defer non-critical initialization until after first frame\n- Profile with Flutter DevTools\' performance timeline to find actual bottlenecks rather than guessing\n\nMeasure before optimizing — most perceived "lag" comes from a small number of specific widgets rebuilding too often, not from Dart itself being slow.'),
    ],
  ),
  mod('Module 14: App Security', 'Protect user data and your backend.',
    [
      lesson('Secure Storage',
        '# Secure Storage\n\n```dart\nfinal storage = FlutterSecureStorage();\nawait storage.write(key: \'jwt\', value: token); // Keychain on iOS, Keystore on Android\n```\n\nNever hardcode API keys directly in Dart source for production apps — they can be extracted from the compiled binary. Use environment-specific build configs or a backend proxy for highly sensitive keys.'),
      lesson('API Protection',
        '# API Protection\n\n- Always validate and sanitize input server-side, even if the client already validated\n- Use HTTPS everywhere, including in development against staging servers\n- Rate-limit sensitive endpoints (login, OTP) to prevent brute-force attacks\n\nClient-side checks improve UX; server-side checks are what actually keep your data safe.'),
      lesson('Data Encryption',
        '# Data Encryption\n\n```dart\nfinal key = encrypt.Key.fromUtf8(\'my32lengthsupersecretnooneknows1\');\nfinal encrypter = encrypt.Encrypter(encrypt.AES(key));\nfinal encrypted = encrypter.encrypt(\'sensitive data\', iv: iv);\n```\n\nEncrypt sensitive local data at rest (drafts, cached personal info) in addition to relying on HTTPS in transit — the two protect against different threats.'),
    ],
  ),
  mod('Module 15: App Architecture', 'Structure code that scales beyond a single developer.',
    [
      lesson('MVC',
        '# MVC (Model-View-Controller)\n\n- **Model** — data and business rules (e.g. `Course`, `User`)\n- **View** — what the user sees (Flutter widgets)\n- **Controller** — mediates between Model and View, handling user input\n\nMVC is simple but in Flutter the "Controller" role often blurs into the widget itself, which is part of why MVVM became more popular for Flutter apps.'),
      lesson('MVVM',
        '# MVVM (Model-View-ViewModel)\n\n```dart\nclass CourseViewModel extends ChangeNotifier {\n  List<Course> courses = [];\n  bool isLoading = false;\n\n  Future<void> load() async {\n    isLoading = true;\n    notifyListeners();\n    courses = await fetchCourses();\n    isLoading = false;\n    notifyListeners();\n  }\n}\n```\n\nThe View (widget) only reads from and calls methods on the ViewModel — it never contains business logic itself, which makes the ViewModel independently testable.'),
      lesson('Clean Architecture',
        '# Clean Architecture\n\nSeparates code into layers with strict dependency direction:\n\n```\nPresentation (widgets, ViewModels)\n   ↓ depends on\nDomain (use cases, entities — pure Dart, no Flutter imports)\n   ↓ depends on\nData (API clients, local DB, repositories)\n```\n\nThe Domain layer should never import Flutter — this means your core business logic can be unit-tested instantly without spinning up any widgets.'),
    ],
  ),
  mod('Module 16: Payment Integration', 'Monetize your app safely.',
    [
      lesson('Payment Gateways',
        '# Payment Gateways\n\nFor Nigerian and African markets, **Paystack** and **Flutterwave** are practical choices alongside Stripe for global reach.\n\n```dart\nfinal response = await PaystackPlugin().checkout(\n  context,\n  charge: Charge()..amount = 500000..reference = generateRef(),\n);\n```\n\nNever process raw card numbers yourself — always use the SDK\'s secure checkout flow so card data never touches your own server.'),
      lesson('Subscription Systems',
        '# Subscription Systems\n\nKey backend pieces for subscriptions:\n- A `subscription` model tracking plan, status, and renewal date\n- A webhook endpoint that listens for payment provider events (renewed, failed, canceled)\n- Grace periods before fully revoking access on a failed renewal\n\nAlways treat the payment provider\'s webhook as the source of truth for subscription status, not just the client-side success callback.'),
      lesson('Transaction Security',
        '# Transaction Security\n\n- Verify every transaction server-side by calling the provider\'s verify endpoint with the reference — never trust a client-reported "success"\n- Log transaction references and amounts for reconciliation\n- Use idempotency keys to avoid double-charging on retried requests'),
    ],
  ),
  mod('Module 17: Deployment', 'Ship your app to real users.',
    [
      lesson('Android Deployment',
        '# Android Deployment\n\n```bash\nflutter build appbundle --release\n```\n\nUpload the resulting `.aab` file to the Google Play Console. Make sure to:\n- Sign your app with a release keystore (never lose this file — Google requires the same key for updates)\n- Fill out the Play Console\'s Data Safety form accurately'),
      lesson('iOS Deployment',
        '# iOS Deployment\n\n```bash\nflutter build ipa --release\n```\n\nYou\'ll need an active Apple Developer Program membership, provisioning profiles set up in Xcode, and to submit via Xcode or Transporter to App Store Connect. Apple\'s review process typically takes 24-48 hours and checks for both functionality and policy compliance.'),
      lesson('App Store Optimization',
        '# App Store Optimization (ASO)\n\n- Clear, keyword-rich title and description\n- Screenshots that show real app value within the first 2-3 images\n- Respond to reviews — both stores factor engagement into ranking\n\nASO is the mobile equivalent of SEO — most installs come from search within the store itself, not external marketing.'),
    ],
  ),
  mod('Module 18: Product Launch', 'Turn your finished app into a real product.',
    [
      lesson('Monetization',
        '# Monetization Models\n\n- One-time purchase\n- Freemium with in-app purchases\n- Subscription (most predictable revenue for ongoing-value apps)\n- Ads (lowest effort, lowest revenue per user, can hurt UX if overused)\n\nChoose based on how often your app delivers value — apps used daily suit subscriptions; apps used once suit one-time purchases.'),
      lesson('Marketing Apps',
        '# Marketing Mobile Apps\n\n- A landing page with clear screenshots and a single call-to-action (download link)\n- Short demo videos perform better than long ones on social platforms\n- Early reviews matter disproportionately — consider a small beta group before public launch'),
      lesson('Freelancing with Mobile Apps',
        '# Freelancing with Mobile Apps\n\nFlutter\'s single-codebase advantage makes mobile freelancing efficient — you can quote one build for both Android and iOS. Build a portfolio of 2-3 polished apps (even personal projects like the To-do and Chat apps from this course) before pricing client work.'),
      assignmentLesson('Capstone Project: Build and Deploy a Complete Production App',
        'Design, build, and deploy a complete mobile app to either the Play Store (internal testing track is acceptable) or as a signed release build. Requirements:\n\n1. At least 4 distinct screens with navigation\n2. Backend API integration with authentication\n3. Local offline storage for at least one feature\n4. Push or local notifications\n5. A short write-up of your architecture choice (MVC/MVVM/Clean) and why', { dueDays: 14, maxScore: 100 }),
    ],
  ),
];

// =========================================================================
// MACHINE LEARNING ENGINEERING
// =========================================================================

const mlBeginnerModules = [
  mod('Module 1: Introduction to Machine Learning', 'Understand what ML is and where it is actually used.',
    [
      lesson('What is Machine Learning?',
        '# What is Machine Learning?\n\nMachine learning is the practice of building systems that improve at a task by learning patterns from data, rather than following hand-written rules.\n\nClassic example: instead of writing rules to detect spam email, you show the system thousands of labeled spam/not-spam examples, and it learns the patterns itself.\n\nML sits inside the broader field of AI, and deep learning (Module 13) is a subfield of ML using neural networks specifically.'),
      lesson('Types of Machine Learning',
        '# Types of Machine Learning\n\n- **Supervised learning** — learns from labeled data (input → known correct output). E.g. predicting house prices from features.\n- **Unsupervised learning** — finds patterns in unlabeled data. E.g. grouping customers into segments.\n- **Reinforcement learning** — learns by trial and error with rewards/penalties. E.g. game-playing agents.\n\nMost real-world business applications (this course\'s focus) are supervised or unsupervised learning.'),
      lesson('Real-world Applications',
        '# Real-world Applications\n\n- Recommendation systems (what to watch/buy next)\n- Fraud detection in financial transactions\n- Medical image diagnosis support\n- Predictive maintenance in manufacturing\n- Chatbots and customer support automation\n\nEach of these maps to a learning type: recommendations and fraud detection are usually supervised classification, while customer segmentation is unsupervised clustering.'),
    ],
    quiz('Module 1 Quiz', [
      { prompt: 'What distinguishes supervised learning from unsupervised learning?', options: ['Supervised learning uses labeled data, unsupervised does not', 'They are identical', 'Unsupervised learning requires more compute', 'Supervised learning never uses neural networks'], correctOptionIndex: 0, points: 1 },
      { prompt: 'Which of these is a real-world ML application?', options: ['Static HTML pages', 'Fraud detection in transactions', 'CSS styling', 'Manual data entry'], correctOptionIndex: 1, points: 1 },
    ])
  ),
  mod('Module 2: Python Foundations', 'Build the Python fluency every ML library assumes you already have.',
    [
      lesson('Variables',
        '# Variables in Python\n\n```python\nname = "Abdulazeez"\nage = 25\nrating = 4.8\nis_enrolled = True\n\n# f-strings for clean formatting\nprint(f"{name} is {age} years old")\n```\n\nPython is dynamically typed — a variable can be reassigned to a different type, which is convenient but means typos in variable names fail silently as new variables rather than errors (a common beginner bug).'),
      lesson('Functions',
        '# Functions\n\n```python\ndef add(a, b):\n    return a + b\n\ndef predict_pass(score, threshold=70):\n    return score >= threshold\n\n# Lambda for short, throwaway functions\nsquare = lambda x: x ** 2\n```\n\nMost ML code passes functions around heavily (e.g. as the loss function or activation function argument), so being comfortable with functions as values matters.'),
      lesson('Data Structures',
        '# Data Structures\n\n```python\nscores = [85, 90, 78, 92]          # list\nstudent = {"name": "Fatima", "score": 91}  # dict\nunique_grades = {"A", "B", "C"}     # set\ncoordinates = (4, 7)                 # tuple (immutable)\n\n# List comprehension — used everywhere in data prep\npassed = [s for s in scores if s >= 80]\n```\n\nNumPy arrays and Pandas DataFrames (Module 11) extend these basic structures with vectorized math operations.'),
    ],
  ),
  mod('Module 3: Math for ML', 'The minimum math you actually need to understand models, not just call library functions.',
    [
      lesson('Statistics',
        '# Statistics for ML\n\n- **Mean** — average value\n- **Median** — middle value, robust to outliers\n- **Standard deviation** — how spread out values are\n\n```python\nimport statistics\nscores = [85, 90, 78, 92, 60]\nprint(statistics.mean(scores))    # 81.0\nprint(statistics.median(scores))  # 85\nprint(statistics.stdev(scores))   # spread\n```\n\nA model trained on data with extreme outliers will often perform poorly until those outliers are identified and handled (Module 4).'),
      lesson('Probability',
        '# Probability Basics\n\nProbability quantifies uncertainty, which is exactly what ML predictions express — a model rarely says "this is definitely spam," it says "this is 92% likely spam."\n\n```python\n# Simple probability example\ntotal_emails = 1000\nspam_emails = 120\np_spam = spam_emails / total_emails  # 0.12\n```\n\nClassification models output probabilities; you then choose a threshold (often 0.5) to convert that probability into a final decision.'),
      lesson('Linear Algebra',
        '# Linear Algebra\n\nML data is represented as vectors and matrices.\n\n```python\nimport numpy as np\nvector = np.array([1, 2, 3])\nmatrix = np.array([[1, 2], [3, 4]])\n\ndot_product = np.dot(vector, vector)  # 1+4+9 = 14\n```\n\nEvery neural network layer (Module 13) is fundamentally a matrix multiplication followed by a non-linear function — this is why GPUs, which excel at matrix math, accelerate deep learning so dramatically.'),
    ],
  ),
  mod('Module 4: Data Handling', 'Real data is messy — learn to clean it before modeling.',
    [
      lesson('Cleaning Data',
        '# Cleaning Data\n\n```python\nimport pandas as pd\ndf = pd.read_csv(\'students.csv\')\n\n# Remove duplicate rows\ndf = df.drop_duplicates()\n\n# Strip whitespace from string columns\ndf[\'name\'] = df[\'name\'].str.strip()\n\n# Fix inconsistent casing\ndf[\'grade\'] = df[\'grade\'].str.upper()\n```\n\nMost real ML projects spend more time on data cleaning than on modeling itself — a clean dataset with a simple model often beats a messy dataset with a complex one.'),
      lesson('Missing Values',
        '# Handling Missing Values\n\n```python\n# See how much is missing\nprint(df.isnull().sum())\n\n# Drop rows with missing target values\ndf = df.dropna(subset=[\'score\'])\n\n# Fill missing numeric values with median\ndf[\'age\'] = df[\'age\'].fillna(df[\'age\'].median())\n```\n\nDropping rows loses data; filling values introduces assumptions — the right choice depends on how much is missing and whether it\'s missing randomly or systematically.'),
      lesson('Formatting Data',
        '# Formatting Data\n\n```python\n# Convert types\ndf[\'date\'] = pd.to_datetime(df[\'date\'])\ndf[\'score\'] = df[\'score\'].astype(float)\n\n# Encode categorical text as numbers for ML models\ndf[\'grade_encoded\'] = df[\'grade\'].map({\'A\': 4, \'B\': 3, \'C\': 2, \'D\': 1, \'F\': 0})\n```\n\nMost ML algorithms only accept numeric input, so any text/categorical column must be encoded before training (more on this in Module 9 — Feature Engineering).'),
    ],
  ),
  mod('Module 5: Data Visualization', 'See your data before you model it.',
    [
      lesson('Charts',
        '# Charts with Matplotlib\n\n```python\nimport matplotlib.pyplot as plt\n\nplt.hist(df[\'score\'], bins=10)\nplt.xlabel(\'Score\')\nplt.ylabel(\'Number of Students\')\nplt.title(\'Score Distribution\')\nplt.show()\n```\n\nA histogram is usually the first chart to make for any numeric column — it immediately reveals skew, outliers, and whether the data looks roughly normal.'),
      lesson('Correlation',
        '# Correlation\n\n```python\nimport seaborn as sns\n\ncorrelation_matrix = df.corr(numeric_only=True)\nsns.heatmap(correlation_matrix, annot=True, cmap=\'coolwarm\')\nplt.show()\n```\n\nHigh correlation between two input features (multicollinearity) can confuse some models about which feature actually matters — worth checking before training a linear model.'),
      lesson('Pattern Discovery',
        '# Pattern Discovery\n\n```python\nsns.scatterplot(data=df, x=\'study_hours\', y=\'score\', hue=\'passed\')\nplt.show()\n```\n\nScatter plots colored by the outcome you\'re trying to predict often reveal whether a simple linear boundary could separate the classes, or whether you\'ll need a more complex model.'),
    ],
  ),
  mod('Module 6: ML Workflow', 'Frame, train, and test your first model end-to-end.',
    [
      lesson('Problem Framing',
        '# Problem Framing\n\nBefore writing any code, define:\n1. What exactly are you predicting? (the target variable)\n2. Is it classification (categories) or regression (a number)?\n3. What data do you actually have access to at prediction time? (avoid "leakage" — using info you won\'t have in production)\n\nA poorly framed problem produces a model that looks great in testing but fails in the real world.'),
      lesson('Model Training',
        '# Model Training\n\n```python\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import train_test_split\n\nX = df[[\'study_hours\', \'prev_score\']]\ny = df[\'passed\']\n\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\n\nmodel = LogisticRegression()\nmodel.fit(X_train, y_train)\n```\n\nAlways split data before training, and never let the model see test data during fitting — that\'s the only way to get an honest read on real-world performance.'),
      lesson('Testing Models',
        '# Testing Models\n\n```python\nfrom sklearn.metrics import accuracy_score\n\npredictions = model.predict(X_test)\nprint(f"Accuracy: {accuracy_score(y_test, predictions):.2%}")\n```\n\nAccuracy alone can be misleading on imbalanced data (e.g. 95% accuracy sounds great, but is meaningless if 95% of cases are the same class) — Module 10 covers better metrics.'),
      assignmentLesson('Mini Project: Predict Student Performance',
        'Using a provided or self-sourced dataset of student study habits and scores, build a model predicting pass/fail. Requirements:\n\n1. Clean the dataset (handle missing values)\n2. Visualize at least 2 relationships in the data\n3. Train a classification model\n4. Report accuracy on a held-out test set', { dueDays: 7 }),
    ],
    quiz('Quiz + Dataset Analysis', [
      { prompt: 'Why should test data never be seen during training?', options: ['It slows down training', 'It would give a falsely optimistic measure of real-world performance', 'It is not allowed by scikit-learn', 'There is no real reason'], correctOptionIndex: 1, points: 1 },
      { prompt: 'Why can accuracy alone be misleading?', options: ['It is always wrong', 'On imbalanced datasets, a model can score high accuracy while ignoring the minority class', 'Accuracy cannot be calculated in Python', 'It only works for regression'], correctOptionIndex: 1, points: 1 },
    ])
  ),
];

const mlIntermediateModules = [
  mod('Module 7: Supervised Learning', 'Go deeper on the two core supervised learning tasks.',
    [
      lesson('Regression',
        '# Regression\n\nRegression predicts a continuous number, like price or score.\n\n```python\nfrom sklearn.linear_model import LinearRegression\n\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)\nprint(model.coef_, model.intercept_)\n```\n\nLinear regression assumes a roughly linear relationship between inputs and the target — when relationships are non-linear, tree-based models (Random Forest, Gradient Boosting) often perform better.'),
      lesson('Classification',
        '# Classification\n\nClassification predicts a category (pass/fail, spam/not-spam, churn/retain).\n\n```python\nfrom sklearn.ensemble import RandomForestClassifier\n\nmodel = RandomForestClassifier(n_estimators=100, random_state=42)\nmodel.fit(X_train, y_train)\n```\n\nRandom Forest trains many decision trees on random subsets of data and features, then averages their votes — this reduces overfitting compared to a single decision tree.'),
      lesson('Evaluation',
        '# Evaluation\n\n```python\nfrom sklearn.metrics import confusion_matrix, classification_report\n\npredictions = model.predict(X_test)\nprint(confusion_matrix(y_test, predictions))\nprint(classification_report(y_test, predictions))\n```\n\nA confusion matrix shows exactly which classes get confused with which — far more diagnostic than a single accuracy number.'),
    ],
  ),
  mod('Module 8: Unsupervised Learning', 'Find structure in data without labels.',
    [
      lesson('Clustering',
        '# Clustering\n\n```python\nfrom sklearn.cluster import KMeans\n\nkmeans = KMeans(n_clusters=3, random_state=42)\nclusters = kmeans.fit_predict(X)\ndf[\'cluster\'] = clusters\n```\n\nK-Means requires you to choose the number of clusters in advance — the "elbow method" (plotting inertia against cluster count) helps pick a reasonable value.'),
      lesson('Pattern Discovery',
        '# Pattern Discovery\n\nUnsupervised techniques surface patterns humans wouldn\'t spot by eye in high-dimensional data — for example, discovering that customers naturally fall into "price-sensitive," "loyal," and "occasional" groups based on purchase behavior, without anyone labeling them that way in advance.'),
      lesson('Segmentation',
        '# Segmentation\n\n```python\n# Inspect cluster characteristics\nprint(df.groupby(\'cluster\')[[\'spend\', \'frequency\']].mean())\n```\n\nOnce clusters are formed, the real value comes from interpreting them — giving each cluster a meaningful business label (e.g. "high-value frequent buyers") so the result is actionable.'),
    ],
  ),
  mod('Module 9: Feature Engineering', 'The inputs you choose matter more than the algorithm you pick.',
    [
      lesson('Selection',
        '# Feature Selection\n\n```python\nfrom sklearn.feature_selection import SelectKBest, f_classif\n\nselector = SelectKBest(score_func=f_classif, k=5)\nX_selected = selector.fit_transform(X, y)\n```\n\nRemoving irrelevant or redundant features often improves model performance and always improves training speed and interpretability.'),
      lesson('Transformation',
        '# Feature Transformation\n\n```python\n# Log transform to reduce skew\ndf[\'log_income\'] = np.log1p(df[\'income\'])\n\n# One-hot encode categorical variables\ndf = pd.get_dummies(df, columns=[\'category\'])\n```\n\nOne-hot encoding avoids implying false ordering (e.g. encoding "red/green/blue" as 0/1/2 would wrongly suggest blue > green > red).'),
      lesson('Scaling',
        '# Feature Scaling\n\n```python\nfrom sklearn.preprocessing import StandardScaler\n\nscaler = StandardScaler()\nX_scaled = scaler.fit_transform(X)\n```\n\nAlgorithms that rely on distance (KNN, K-Means, SVM) or gradient descent (logistic regression, neural networks) need scaled features — tree-based models generally don\'t.'),
    ],
  ),
  mod('Module 10: Model Evaluation', 'Pick the right metric for the right problem.',
    [
      lesson('Accuracy',
        '# Accuracy\n\nAccuracy = correct predictions / total predictions. Simple, but only meaningful when classes are roughly balanced.\n\n```python\nfrom sklearn.metrics import accuracy_score\naccuracy_score(y_test, predictions)\n```'),
      lesson('Precision',
        '# Precision\n\nPrecision = of everything the model flagged as positive, how many actually were? Important when false positives are costly (e.g. flagging a legitimate transaction as fraud).\n\n```python\nfrom sklearn.metrics import precision_score\nprecision_score(y_test, predictions)\n```'),
      lesson('Recall',
        '# Recall\n\nRecall = of everything that actually was positive, how many did the model catch? Important when false negatives are costly (e.g. missing an actual fraudulent transaction).\n\n```python\nfrom sklearn.metrics import recall_score\nrecall_score(y_test, predictions)\n```\n\nPrecision and recall usually trade off against each other — the F1 score balances both into a single number when you need one metric to optimize.'),
    ],
  ),
  mod('Module 11: ML Libraries', 'Get fluent with the core data science toolkit.',
    [
      lesson('NumPy',
        '# NumPy\n\n```python\nimport numpy as np\narr = np.array([1, 2, 3, 4, 5])\nprint(arr.mean(), arr.std())\nmatrix = np.array([[1, 2], [3, 4]])\nprint(matrix.T)  # transpose\n```\n\nNumPy operations are vectorized (run in compiled C under the hood), making them dramatically faster than equivalent Python loops over large arrays.'),
      lesson('Pandas',
        '# Pandas\n\n```python\nimport pandas as pd\ndf = pd.read_csv(\'data.csv\')\nprint(df.describe())\nprint(df.groupby(\'category\')[\'score\'].mean())\n```\n\nPandas is built on top of NumPy and is the standard tool for loading, cleaning, and exploring tabular data before it ever reaches a model.'),
      lesson('Scikit-learn',
        '# Scikit-learn\n\n```python\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\n\npipeline = Pipeline([\n    (\'scaler\', StandardScaler()),\n    (\'model\', LogisticRegression())\n])\npipeline.fit(X_train, y_train)\n```\n\nA `Pipeline` bundles preprocessing and modeling into one object, which prevents a common bug: forgetting to apply the same scaling to new data at prediction time.'),
    ],
  ),
  mod('Module 12: Real-world Datasets', 'Apply your skills to messy, realistic data domains.',
    [
      lesson('Business Datasets',
        '# Business Datasets\n\nSales, marketing, and operations data tend to have seasonality, promotions, and external events that confuse naive models — always plot the time dimension before modeling business data.'),
      lesson('Health Datasets',
        '# Health Datasets\n\nHealth data carries strict privacy obligations and often has significant missingness and measurement noise. Models in this domain should be evaluated especially carefully for bias across demographic groups before any real-world use (more in Module 17 — AI Ethics).'),
      lesson('Financial Datasets',
        '# Financial Datasets\n\nFinancial data is often highly imbalanced (e.g. fraud is rare) and time-dependent — using future information to predict the past (data leakage) is an especially easy mistake to make with financial time series.'),
      assignmentLesson('Mini Project: Customer Churn Prediction',
        'Using a customer dataset (subscription usage, support tickets, tenure), predict which customers are likely to churn. Requirements:\n\n1. Engineer at least 3 features beyond the raw columns\n2. Train and compare at least 2 different models\n3. Report precision, recall, and F1 — not just accuracy\n4. Write a short summary of which features mattered most', { dueDays: 10 }),
    ],
  ),
];

const mlAdvancedModules = [
  mod('Module 13: Deep Learning', 'Move from classic ML to neural networks.',
    [
      lesson('Neural Networks',
        '# Neural Networks\n\n```python\nimport tensorflow as tf\nfrom tensorflow import keras\n\nmodel = keras.Sequential([\n    keras.layers.Dense(64, activation=\'relu\', input_shape=(10,)),\n    keras.layers.Dense(32, activation=\'relu\'),\n    keras.layers.Dense(1, activation=\'sigmoid\')\n])\nmodel.compile(optimizer=\'adam\', loss=\'binary_crossentropy\', metrics=[\'accuracy\'])\n```\n\nA neural network is essentially many small linear models stacked with non-linear activations between them — this stacking is what lets it learn complex, non-linear relationships that plain logistic regression can\'t.'),
      lesson('Hidden Layers',
        '# Hidden Layers\n\nMore hidden layers (depth) let a network learn more abstract features, but also make it more prone to overfitting and harder to train. Start shallow, and only add depth if a shallower network demonstrably underfits your data.'),
      lesson('Activation Functions',
        '# Activation Functions\n\n- **ReLU** — fast, default choice for hidden layers\n- **Sigmoid** — squashes output to 0-1, used for binary classification output\n- **Softmax** — used for multi-class output, outputs sum to 1\n\nWithout non-linear activations, stacking layers would collapse mathematically into a single linear function, defeating the purpose of "deep" learning entirely.'),
    ],
  ),
  mod('Module 14: Computer Vision', 'Teach models to understand images.',
    [
      lesson('Image Processing',
        '# Image Processing\n\n```python\nimport cv2\nimage = cv2.imread(\'photo.jpg\')\nresized = cv2.resize(image, (224, 224))\ngray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)\n```\n\nMost vision models expect a fixed input size and normalized pixel values — preprocessing consistency between training and inference is one of the most common sources of silent bugs in deployed vision models.'),
      lesson('Image Classification',
        '# Image Classification\n\n```python\nmodel = keras.Sequential([\n    keras.layers.Conv2D(32, (3,3), activation=\'relu\', input_shape=(224,224,3)),\n    keras.layers.MaxPooling2D(2,2),\n    keras.layers.Flatten(),\n    keras.layers.Dense(10, activation=\'softmax\')\n])\n```\n\nConvolutional layers scan small patches of the image looking for local patterns (edges, textures) — this is what makes CNNs far more efficient than plain dense networks for image data.'),
      lesson('Object Detection',
        '# Object Detection\n\nUnlike classification (what is in this image?), object detection answers what is where (bounding boxes + labels). Models like YOLO and Faster R-CNN are the standard architectures — training one from scratch is rarely worth it compared to fine-tuning a pretrained model on your specific objects.'),
    ],
  ),
  mod('Module 15: Natural Language Processing', 'Teach models to understand and generate text.',
    [
      lesson('Text Cleaning',
        '# Text Cleaning\n\n```python\nimport re\ntext = "Check out THIS amazing course!!! 😀"\ntext = text.lower()\ntext = re.sub(r\'[^a-z\\s]\', \'\', text)\n# "check out this amazing course"\n```\n\nHow aggressively you clean text depends on the task — removing emojis might hurt sentiment analysis but help a strict keyword search system.'),
      lesson('Sentiment Analysis',
        '# Sentiment Analysis\n\n```python\nfrom transformers import pipeline\nclassifier = pipeline(\'sentiment-analysis\')\nresult = classifier("This course is incredibly useful!")\n# [{\'label\': \'POSITIVE\', \'score\': 0.99}]\n```\n\nPretrained transformer models like this give strong sentiment results out of the box, and are usually a better starting point than training a sentiment classifier from scratch on a small dataset.'),
      lesson('Chatbot Systems',
        '# Chatbot Systems\n\nModern chatbots are typically built on top of large language models, with the engineering work focused on: retrieving relevant context (RAG), managing conversation state, and constraining outputs to safe, on-topic responses — rather than training the underlying language model yourself.'),
    ],
  ),
  mod('Module 16: Model Deployment', 'Get your trained model into production.',
    [
      lesson('APIs',
        '# Serving Models via APIs\n\n```python\nfrom fastapi import FastAPI\nimport joblib\n\napp = FastAPI()\nmodel = joblib.load(\'model.pkl\')\n\n@app.post(\'/predict\')\ndef predict(data: dict):\n    prediction = model.predict([list(data.values())])\n    return {\'prediction\': prediction.tolist()}\n```\n\nWrapping a model in a small API like this lets any frontend (including your PUGI app) call it over HTTP without needing Python installed client-side.'),
      lesson('Deployment Pipelines',
        '# Deployment Pipelines\n\nA solid ML deployment pipeline automatically: retrains on a schedule or trigger, validates the new model against a held-out test set, and only promotes it to production if it beats the current model — preventing silent quality regressions.'),
      lesson('Monitoring Models',
        '# Monitoring Models in Production\n\nModels degrade over time as real-world data drifts from training data ("model drift"). Track prediction distributions and key metrics in production, and set alerts for when they shift significantly from training-time baselines.'),
    ],
  ),
  mod('Module 17: AI Ethics', 'Build systems that are fair and accountable.',
    [
      lesson('Bias in AI',
        '# Bias in AI\n\nModels trained on historically biased data (e.g. biased hiring decisions) will learn and often amplify that bias unless explicitly checked. Bias can enter at any stage — data collection, labeling, feature selection, or even which metric you optimize for.'),
      lesson('Fairness',
        '# Fairness\n\nThere is no single universal definition of "fair" — different fairness metrics (equal accuracy across groups vs. equal false-positive rates) can conflict with each other. Choosing which fairness definition matters for your use case is a product and ethics decision, not just a technical one.'),
      lesson('Responsible AI',
        '# Responsible AI\n\nPractical steps: document model limitations clearly, test on diverse data before launch, provide a way for affected users to appeal automated decisions, and keep a human in the loop for high-stakes predictions (medical, legal, financial).'),
    ],
  ),
  mod('Module 18: Career Building', 'Turn your ML skills into real opportunities.',
    [
      lesson('Portfolio Development',
        '# Portfolio Development\n\nA strong ML portfolio shows the full pipeline, not just a notebook: problem framing, data cleaning, model comparison, evaluation with proper metrics, and (ideally) a deployed demo — exactly what Modules 6, 12, and 16 of this course covered.'),
      lesson('Competitions',
        '# ML Competitions\n\nPlatforms like Kaggle let you practice on real datasets with a public leaderboard. Competitions are excellent for skill-building, though production ML work in industry weighs data quality and deployment far more heavily than competition leaderboard tricks.'),
      lesson('Freelancing in AI',
        '# Freelancing in AI\n\nMany freelance AI projects are smaller in scope than they sound — a "build me an AI chatbot" client often needs a well-engineered RAG system over their own documents, not a custom-trained model from scratch. Scope projects accordingly when quoting.'),
      assignmentLesson('Capstone Project: Build and Deploy a Smart Predictive AI System',
        'Design, train, evaluate, and deploy a complete ML system end-to-end. Requirements:\n\n1. Choose a real or realistic dataset and clearly frame the problem\n2. Clean data and engineer at least 3 features\n3. Train and compare at least 2 models, selecting the best with proper metrics (not just accuracy)\n4. Deploy the final model behind a simple API\n5. Write a short model card covering limitations and potential bias', { dueDays: 14, maxScore: 100 }),
    ],
  ),
];

// =========================================================================
// COURSE DOCUMENT BUILDERS
// =========================================================================

function buildCourseSet({ title, category, instructor, levels }) {
  return [
    {
      title: `${title} — Beginner`,
      category,
      level: 'beginner',
      description: levels.beginner.description,
      instructor,
      duration: levels.beginner.duration,
      status: 'published',
      rating: 0,
      enrolledCount: 0,
      modules: levels.beginner.modules,
    },
    {
      title: `${title} — Intermediate`,
      category,
      level: 'intermediate',
      description: levels.intermediate.description,
      instructor,
      duration: levels.intermediate.duration,
      status: 'published',
      rating: 0,
      enrolledCount: 0,
      modules: levels.intermediate.modules,
    },
    {
      title: `${title} — Advanced`,
      category,
      level: 'advanced',
      description: levels.advanced.description,
      instructor,
      duration: levels.advanced.duration,
      status: 'published',
      rating: 0,
      enrolledCount: 0,
      modules: levels.advanced.modules,
    },
  ];
}

const mobileCourseSet = buildCourseSet({
  title: 'Mobile Development Mastery',
  category: 'Mobile Engineering',
  instructor: 'Platform Instructor',
  levels: {
    beginner: {
      description: 'Start from zero and learn mobile fundamentals, Dart, and core Flutter UI building blocks, finishing with a fully offline To-do app.',
      duration: '5 weeks',
      modules: mobileBeginnerModules,
    },
    intermediate: {
      description: 'Connect your apps to real APIs, databases, and authentication systems, then build a real-time chat application.',
      duration: '5 weeks',
      modules: mobileIntermediateModules,
    },
    advanced: {
      description: 'Optimize, secure, architect, monetize, and deploy a production-grade mobile app to real app stores.',
      duration: '4 weeks',
      modules: mobileAdvancedModules,
    },
  },
});

const mlCourseSet = buildCourseSet({
  title: 'Machine Learning Engineering',
  category: 'Artificial Intelligence',
  instructor: 'Platform Instructor',
  levels: {
    beginner: {
      description: 'Build the Python, math, and data-handling foundation every ML engineer needs, finishing with a student performance prediction project.',
      duration: '6 weeks',
      modules: mlBeginnerModules,
    },
    intermediate: {
      description: 'Go deeper into supervised and unsupervised learning, feature engineering, and proper model evaluation with a customer churn project.',
      duration: '6 weeks',
      modules: mlIntermediateModules,
    },
    advanced: {
      description: 'Move into deep learning, computer vision, NLP, deployment, and AI ethics, finishing with a deployed capstone AI system.',
      duration: '4 weeks',
      modules: mlAdvancedModules,
    },
  },
});

// =========================================================================
// MAIN
// =========================================================================

async function main() {
  await client.connect();
  const db = client.db('pugi');

  const tutor = await db.collection('users').findOne({ role: 'tutor' });
  const instructorId = tutor?._id || null;

  async function insertChain(courses) {
    const ids = [];
    for (const course of courses) {
      const exists = await db.collection('courses').findOne({ title: course.title });
      if (exists) {
        console.log(`⏭ Skipping (already exists): ${course.title}`);
        ids.push(exists._id);
        continue;
      }
      const result = await db.collection('courses').insertOne({
        ...course,
        instructorId,
        enrolledStudents: [],
        nextCourseId: null,
        isPremium: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`✅ Added: ${course.title} (${course.level})`);
      ids.push(result.insertedId);
    }
    // Chain beginner -> intermediate -> advanced
    if (ids[0]) await db.collection('courses').updateOne({ _id: ids[0] }, { $set: { nextCourseId: ids[1] } });
    if (ids[1]) await db.collection('courses').updateOne({ _id: ids[1] }, { $set: { nextCourseId: ids[2] } });
    return ids;
  }

  console.log('\n--- Mobile Development Mastery ---');
  await insertChain(mobileCourseSet);

  console.log('\n--- Machine Learning Engineering ---');
  await insertChain(mlCourseSet);

  await client.close();
  console.log('\n🎉 Done! Both courses seeded (3 level-documents each, chained via nextCourseId).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
