/**
 * seedJavascriptCourse.js
 *
 * Creates a complete "JavaScript Programming Fundamentals" micro-course:
 *   - 1 Course (published)
 *   - 6 Lessons (each with 5 slides)
 *   - 6 Quizzes (one per lesson, passPercent = 70)
 *   - 30 Questions (5 per quiz, full MCQ with topicTag, subtopic, difficulty, etc.)
 *
 * Safety guarantees:
 *   - Never deletes existing courses, lessons, quizzes, questions, users, or progress.
 *   - Checks for an existing course by exact title before inserting.
 *   - If the course already exists the script exits with a clear message.
 *   - Requires a first admin user to set as createdBy.
 *
 * Usage:
 *   cd backend
 *   node scripts/seedJavascriptCourse.js
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");

const Course   = require("../models/Course");
const Lesson   = require("../models/Lesson");
const Quiz     = require("../models/Quiz");
const Question = require("../models/Question");
const User     = require("../models/User");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slide(label, elements) {
  return { label, elements };
}

function heading(text)    { return { type: "heading",    data: { text } }; }
function subheading(text) { return { type: "subheading", data: { text } }; }
function txt(text)        { return { type: "text",       data: { text } }; }
function bullets(items)   { return { type: "bullets",    data: { items } }; }

function q(order, prompt, A, B, C, D, correctAnswer, explanation, topicTag, subtopic, difficulty, difficultyLevel) {
  return {
    type: "mcq",
    order,
    prompt,
    options: [
      { key: "A", text: A },
      { key: "B", text: B },
      { key: "C", text: C },
      { key: "D", text: D },
    ],
    correctAnswer,
    explanation,
    topicTag,
    subtopic,
    difficulty,
    difficultyLevel,
    published: true,
  };
}

// ─── Course Data ──────────────────────────────────────────────────────────────

const COURSE_TITLE = "JavaScript Programming Fundamentals";

const LESSONS_DATA = [
  // ─── Lesson 1 ───────────────────────────────────────────────────────────────
  {
    title: "Introduction to JavaScript",
    order: 1,
    estimatedTime: 10,
    slides: [
      slide("What is JavaScript?", [
        heading("What is JavaScript?"),
        txt(
          "JavaScript is a lightweight, interpreted programming language that is one of the three core technologies of the World Wide Web. It makes web pages interactive and dynamic."
        ),
        bullets([
          "Created in 1995 by Brendan Eich at Netscape",
          "Originally called Mocha, then LiveScript, then JavaScript",
          "Today it is standardised as ECMAScript (ES)",
          "One of the most widely-used programming languages in the world",
        ]),
      ]),
      slide("Where JavaScript Runs", [
        heading("Where Does JavaScript Run?"),
        subheading("Browser (Client-Side)"),
        txt(
          "Every modern browser – Chrome, Firefox, Safari, Edge – has a built-in JavaScript engine. Chrome uses V8, Firefox uses SpiderMonkey."
        ),
        subheading("Server (Node.js)"),
        txt(
          "Node.js allows JavaScript to run outside the browser on a server, enabling full-stack development with a single language."
        ),
        bullets([
          "Browser: handles UI interactions, animations, form validation",
          "Server: handles APIs, databases, file systems",
        ]),
      ]),
      slide("JavaScript's Role in Web Development", [
        heading("JavaScript's Role in Web Development"),
        txt(
          "The web is built on three core technologies that work together to deliver rich user experiences."
        ),
        bullets([
          "HTML – provides the structure and content of a page",
          "CSS  – controls the visual presentation and layout",
          "JavaScript – adds behaviour, interactivity, and logic",
        ]),
        txt(
          "Without JavaScript, websites would be static documents. With it, they become full applications."
        ),
      ]),
      slide("How JavaScript Connects with HTML and CSS", [
        heading("Connecting JavaScript with HTML & CSS"),
        subheading("Inline Script"),
        txt("You can place JavaScript directly inside a <script> tag in your HTML file."),
        subheading("External File"),
        txt(
          "Best practice is to keep JavaScript in a separate .js file and link it: <script src='app.js'></script>"
        ),
        bullets([
          "Place <script> tags before </body> so the HTML loads first",
          "JavaScript can read and modify HTML elements via the DOM",
          "JavaScript can add or remove CSS classes dynamically",
        ]),
      ]),
      slide("Your First JavaScript Statement", [
        heading("Your First JavaScript Statement"),
        subheading("console.log()"),
        txt(
          "console.log() is the simplest way to output information. It prints a message to the browser's developer console – perfect for learning and debugging."
        ),
        bullets([
          'console.log("Hello JavaScript"); // prints: Hello JavaScript',
          "Open DevTools in your browser → Console tab to see output",
          "You can log strings, numbers, objects, or variables",
          "It does not affect the visible web page",
        ]),
        txt(
          "Try it now: open your browser console (F12) and type console.log('Hello World');"
        ),
      ]),
    ],
    questions: [
      q(1,
        "Which of the following best describes JavaScript?",
        "A compiled systems programming language",
        "An interpreted, lightweight scripting language for the web",
        "A markup language used to structure web content",
        "A stylesheet language used to style HTML",
        "B",
        "JavaScript is an interpreted, lightweight scripting language primarily used to add interactivity and logic to web pages.",
        "JavaScript Basics", "definition", 1, "easy"
      ),
      q(2,
        "Which JavaScript engine is used by the Google Chrome browser?",
        "SpiderMonkey", "Chakra", "V8", "Nitro",
        "C",
        "Google Chrome uses the V8 JavaScript engine, which is also the engine behind Node.js.",
        "Browser Execution", "JS engine", 2, "easy"
      ),
      q(3,
        "What does console.log() do in JavaScript?",
        "Displays an alert box on the web page",
        "Writes directly into the HTML document",
        "Prints output to the browser's developer console",
        "Sends a message to the server",
        "C",
        "console.log() outputs a message to the browser's developer console. It is widely used for debugging and learning.",
        "console.log", "output method", 1, "easy"
      ),
      q(4,
        "Which THREE technologies form the core of web development?",
        "HTML, CSS, and Python",
        "HTML, CSS, and JavaScript",
        "JavaScript, PHP, and SQL",
        "CSS, React, and Node.js",
        "B",
        "HTML provides structure, CSS handles presentation, and JavaScript adds behaviour. Together they form the foundation of the web.",
        "HTML/CSS/JS Relationship", "web trio", 2, "easy"
      ),
      q(5,
        "What is Node.js primarily used for?",
        "Running JavaScript inside a web browser",
        "Styling HTML elements",
        "Running JavaScript on the server side",
        "Compiling JavaScript to machine code",
        "C",
        "Node.js is a runtime environment that allows JavaScript to run on the server, outside of any browser.",
        "Frontend Role", "Node.js", 2, "medium"
      ),
    ],
  },

  // ─── Lesson 2 ───────────────────────────────────────────────────────────────
  {
    title: "Variables, Data Types and Operators",
    order: 2,
    estimatedTime: 12,
    slides: [
      slide("Variables – What and Why", [
        heading("Variables – What Are They and Why Use Them?"),
        txt(
          "A variable is a named storage location in memory that holds a value. Variables let you store, retrieve, and change data throughout your program."
        ),
        bullets([
          "Think of a variable as a labelled box that holds information",
          "The label is the variable name; the content is the value",
          "Variables make code reusable and readable",
          'Example: let userName = "Alice";',
        ]),
      ]),
      slide("let, const and var", [
        heading("Declaring Variables: let, const, and var"),
        subheading("var (legacy)"),
        txt("var is function-scoped and can be re-declared. Avoid it in modern code."),
        subheading("let"),
        txt("let is block-scoped and can be reassigned. Use it when the value will change."),
        subheading("const"),
        txt(
          "const is block-scoped and cannot be reassigned. Use it for values that should remain fixed."
        ),
        bullets([
          "Prefer const by default",
          "Use let only when you need to reassign",
          "Avoid var in modern JavaScript",
        ]),
      ]),
      slide("Common Data Types", [
        heading("Common JavaScript Data Types"),
        bullets([
          'String  – text enclosed in quotes: "Hello" or \'World\'',
          "Number  – integers and decimals: 42, 3.14",
          "Boolean – true or false",
          "null    – intentional absence of a value",
          "undefined – a variable declared but not yet assigned",
          "Object  – a collection of key–value pairs",
          "Array   – an ordered list of values",
        ]),
        txt(
          "Use typeof to check a value's type: typeof 42 returns 'number'."
        ),
      ]),
      slide("Arithmetic and Comparison Operators", [
        heading("Arithmetic and Comparison Operators"),
        subheading("Arithmetic"),
        bullets([
          "+ addition,  - subtraction",
          "* multiplication,  / division",
          "% modulus (remainder),  ** exponentiation",
        ]),
        subheading("Comparison"),
        bullets([
          "== loose equality (avoids type check)",
          "=== strict equality (checks type and value) – prefer this",
          "!== strict inequality",
          "> greater than,  < less than,  >=  <=",
        ]),
      ]),
      slide("Simple Examples", [
        heading("Variables and Operators in Action"),
        bullets([
          'const name = "Alice";   // string',
          "let age = 25;           // number",
          "const isLoggedIn = true; // boolean",
          'let score = null;       // null – reset score',
          "let total = age + 5;    // arithmetic: 30",
          "let isAdult = age >= 18; // comparison: true",
          'console.log(name, isAdult); // "Alice" true',
        ]),
        txt(
          "Practise in your browser console – experiment by changing values and re-running expressions."
        ),
      ]),
    ],
    questions: [
      q(1,
        "Which keyword is recommended for declaring a variable that should NOT be reassigned?",
        "var", "const", "switch", "return",
        "B",
        "const is used when a variable should not be reassigned after its initial value is set. It creates a read-only reference.",
        "Variables", "const keyword", 2, "easy"
      ),
      q(2,
        "What data type does JavaScript assign to the value true?",
        "String", "Number", "Boolean", "Null",
        "C",
        "true and false are Boolean values in JavaScript. They represent logical on/off states.",
        "Data Types", "boolean", 1, "easy"
      ),
      q(3,
        "What is the key difference between == and === in JavaScript?",
        "There is no difference; both check value and type",
        "== checks both value and type; === checks only value",
        "=== checks both value and type; == checks only value",
        "=== is used for strings only",
        "C",
        "=== is strict equality and checks both value and type. == performs type coercion before comparing, which can lead to unexpected results.",
        "Operators", "strict equality", 3, "medium"
      ),
      q(4,
        "What will typeof undefined return?",
        '"null"', '"object"', '"undefined"', '"string"',
        "C",
        "typeof undefined returns the string 'undefined'. A variable that has been declared but not assigned a value has the value undefined.",
        "Data Types", "undefined type", 2, "easy"
      ),
      q(5,
        "Which of the following is a correct way to use let?",
        "let 1count = 10;",
        "let const = 5;",
        "let score = 100;",
        "let return = true;",
        "C",
        "Variable names must start with a letter, underscore, or dollar sign. Reserved keywords like const and return cannot be used as variable names.",
        "Variables", "let declaration", 2, "easy"
      ),
    ],
  },

  // ─── Lesson 3 ───────────────────────────────────────────────────────────────
  {
    title: "Conditional Statements",
    order: 3,
    estimatedTime: 11,
    slides: [
      slide("Why Programs Need Decisions", [
        heading("Why Programs Need Decisions"),
        txt(
          "Real-world programs cannot follow one fixed path. They must react differently depending on the situation – checking a password, validating an age, or personalising a greeting."
        ),
        bullets([
          "Decisions allow programs to branch based on conditions",
          "A condition is an expression that evaluates to true or false",
          "JavaScript uses if, else if, and else to handle decisions",
          'Example condition: age >= 18 → evaluates to true or false',
        ]),
      ]),
      slide("if, else if, else", [
        heading("if, else if, and else"),
        txt(
          "The if statement runs a block of code only when its condition is true. else if adds alternative conditions. else handles everything that did not match."
        ),
        bullets([
          "if (condition) { // runs when condition is true }",
          "else if (condition2) { // runs when first fails but this is true }",
          "else { // runs when no conditions matched }",
          "Only ONE branch runs per if/else if/else chain",
        ]),
      ]),
      slide("Comparison Operators in Conditions", [
        heading("Comparison Operators in Conditions"),
        subheading("Operators used inside conditions"),
        bullets([
          "=== strict equality: is the value exactly this?",
          "!== strict inequality: is it different?",
          "> greater than,  < less than",
          ">= greater than or equal,  <= less than or equal",
        ]),
        subheading("Example"),
        bullets([
          "let score = 85;",
          'if (score >= 90) { grade = "A"; }',
          'else if (score >= 70) { grade = "B"; }',
          'else { grade = "C"; }',
        ]),
      ]),
      slide("Logical Operators", [
        heading("Logical Operators: &&, ||, !"),
        subheading("&& (AND)"),
        txt("Both conditions must be true for the overall expression to be true."),
        subheading("|| (OR)"),
        txt("At least one condition must be true."),
        subheading("! (NOT)"),
        txt("Reverses a boolean value – true becomes false and vice versa."),
        bullets([
          "age >= 18 && hasID  → must be adult AND have ID",
          "isAdmin || isModerator → either role is acceptable",
          "!isLoggedIn → true when the user is NOT logged in",
        ]),
      ]),
      slide("Real-World Conditional Example", [
        heading("Real-World Example: Checking User Role"),
        bullets([
          'const role = "admin";',
          'const isLoggedIn = true;',
          "",
          "if (!isLoggedIn) {",
          '  console.log("Please log in first.");',
          '} else if (role === "admin") {',
          '  console.log("Welcome, Admin. You have full access.");',
          '} else if (role === "student") {',
          '  console.log("Welcome, Student. You can view lessons.");',
          "} else {",
          '  console.log("Unknown role.");',
          "}",
        ]),
        txt("Each else if adds another decision layer without nesting deeply."),
      ]),
    ],
    questions: [
      q(1,
        "What does an if statement do in JavaScript?",
        "Repeats a block of code multiple times",
        "Defines a reusable block of code",
        "Executes a block of code only when a condition is true",
        "Declares a variable",
        "C",
        "An if statement evaluates a condition and executes its code block only if that condition is truthy.",
        "Conditional Logic", "if statement", 1, "easy"
      ),
      q(2,
        "What is the purpose of else in a conditional statement?",
        "To declare a variable",
        "To run code when all previous conditions were false",
        "To repeat a block of code",
        "To end a loop",
        "B",
        "The else block executes when none of the preceding if or else if conditions evaluated to true.",
        "Conditional Logic", "else clause", 1, "easy"
      ),
      q(3,
        "Which logical operator requires BOTH conditions to be true?",
        "||", "!", "&&", "??",
        "C",
        "&& (AND) returns true only when both the left and right operands are truthy.",
        "Logical Operators", "AND operator", 2, "easy"
      ),
      q(4,
        "What will be logged? let x = 10; if (x > 5) { console.log('big'); } else { console.log('small'); }",
        "small", "big", "10", "undefined",
        "B",
        "Since 10 > 5 is true, the if block runs and 'big' is printed. The else block is skipped.",
        "If Statements", "condition evaluation", 2, "easy"
      ),
      q(5,
        "Which operator reverses a boolean value?",
        "&&", "||", "??", "!",
        "D",
        "The ! (NOT) operator inverts a boolean: !true becomes false, and !false becomes true.",
        "Logical Operators", "NOT operator", 2, "easy"
      ),
    ],
  },

  // ─── Lesson 4 ───────────────────────────────────────────────────────────────
  {
    title: "Loops and Iteration",
    order: 4,
    estimatedTime: 12,
    slides: [
      slide("Why Loops Are Useful", [
        heading("Why Loops Are Useful"),
        txt(
          "Imagine printing the numbers 1 to 100. Writing 100 console.log statements is tedious and unmaintainable. Loops solve this by repeating a block of code automatically."
        ),
        bullets([
          "Loops execute a block of code multiple times",
          "They work until a stopping condition is met",
          "They save code repetition and make programs scalable",
          "Common use cases: iterating arrays, counting, retrying operations",
        ]),
      ]),
      slide("The for Loop", [
        heading("The for Loop"),
        txt("A for loop is best when you know in advance how many times to repeat."),
        bullets([
          "Syntax: for (initialiser; condition; update) { }",
          "Initialiser – runs once at the start: let i = 0",
          "Condition   – checked before each iteration: i < 5",
          "Update      – runs after each iteration: i++",
          "Example: for (let i = 1; i <= 5; i++) { console.log(i); }",
          "Prints: 1, 2, 3, 4, 5",
        ]),
      ]),
      slide("The while Loop", [
        heading("The while Loop"),
        txt(
          "A while loop repeats as long as its condition remains true. It is useful when you do not know the exact number of iterations upfront."
        ),
        bullets([
          "Syntax: while (condition) { // code }",
          "The condition is checked before every iteration",
          "If the condition is false from the start, the loop never runs",
          "Example:",
          "  let count = 0;",
          "  while (count < 3) { console.log(count); count++; }",
          "Prints: 0, 1, 2",
        ]),
      ]),
      slide("Loop Counters and Stopping Conditions", [
        heading("Loop Counters and Stopping Conditions"),
        subheading("Counter Variable"),
        txt("A counter (often named i, j, or count) tracks how many times the loop has run."),
        subheading("Stopping Condition"),
        txt(
          "The condition determines when to stop. Without a stopping condition the loop becomes infinite."
        ),
        bullets([
          "Always initialise the counter before the loop",
          "Always update the counter inside the loop",
          "for loops: counter in the loop header keeps it organised",
          "while loops: remember to update the counter in the body",
        ]),
      ]),
      slide("Common Loop Mistakes", [
        heading("Common Loop Mistakes – The Infinite Loop"),
        txt(
          "An infinite loop runs forever because its stopping condition never becomes false. This can crash a browser tab or a Node.js process."
        ),
        bullets([
          "❌ while (true) { console.log('forever'); } – never stops",
          "❌ for (let i = 0; i >= 0; i++) { } – i keeps growing",
          "✅ Always ensure the counter moves toward the stopping condition",
          "✅ Use break to exit a loop early if needed",
          "✅ Use continue to skip the current iteration",
        ]),
        txt("If your page freezes, check for an accidental infinite loop first."),
      ]),
    ],
    questions: [
      q(1,
        "Which loop type is best when you know exactly how many times to repeat?",
        "while loop", "do...while loop", "for loop", "foreach loop",
        "C",
        "The for loop is ideal when the number of iterations is known in advance. Its header combines initialisation, condition, and update in one place.",
        "Loops", "for loop", 1, "easy"
      ),
      q(2,
        "What happens if a while loop's condition never becomes false?",
        "The loop runs exactly once",
        "The loop is skipped entirely",
        "An infinite loop occurs",
        "JavaScript throws a SyntaxError",
        "C",
        "If the condition of a while loop never evaluates to false, the loop continues indefinitely – creating an infinite loop that can crash the program.",
        "While Loop", "infinite loop", 2, "medium"
      ),
      q(3,
        "What will this code print? for (let i = 0; i < 3; i++) { console.log(i); }",
        "1, 2, 3", "0, 1, 2", "0, 1, 2, 3", "1, 2",
        "B",
        "The loop starts at i = 0 and runs while i < 3. It prints 0, then 1, then 2, then i becomes 3 which fails the condition so the loop stops.",
        "For Loop", "loop output", 2, "easy"
      ),
      q(4,
        "What does the break statement do inside a loop?",
        "Skips to the next iteration",
        "Restarts the loop from the beginning",
        "Exits the loop immediately",
        "Throws an error",
        "C",
        "break exits the enclosing loop immediately. Execution continues with the first statement after the loop.",
        "Iteration", "break keyword", 2, "medium"
      ),
      q(5,
        "In a for loop, what is the purpose of the update expression (e.g. i++)?",
        "To set the loop condition",
        "To initialise the counter variable",
        "To run code inside the loop body",
        "To move the counter toward the stopping condition",
        "D",
        "The update expression (third part of the for header) runs after every iteration to advance the counter so the stopping condition is eventually reached.",
        "For Loop", "loop update", 2, "easy"
      ),
    ],
  },

  // ─── Lesson 5 ───────────────────────────────────────────────────────────────
  {
    title: "Functions and Scope",
    order: 5,
    estimatedTime: 13,
    slides: [
      slide("What Are Functions?", [
        heading("What Are Functions?"),
        txt(
          "A function is a reusable named block of code that performs a specific task. Instead of copying the same code in many places, you define it once and call it whenever you need it."
        ),
        bullets([
          "Functions promote the DRY principle – Don't Repeat Yourself",
          "They break complex programs into small, manageable pieces",
          "A function runs only when it is called (invoked)",
          "Functions can accept input (parameters) and return output",
        ]),
      ]),
      slide("Function Declarations", [
        heading("Function Declarations"),
        txt("The most common way to define a function in JavaScript:"),
        bullets([
          "function greet() { console.log('Hello!'); }",
          "Call it with: greet();",
          "Function declarations are hoisted – you can call them before they appear in code",
          "Arrow functions (modern): const greet = () => console.log('Hello!');",
          "Function expressions: const greet = function() { console.log('Hello!'); };",
        ]),
        txt("All three produce a callable function, but hoisting behaviour differs."),
      ]),
      slide("Parameters and Return Values", [
        heading("Parameters and Return Values"),
        subheading("Parameters"),
        txt(
          "Parameters are placeholders declared in the function header. Arguments are the actual values you pass when calling the function."
        ),
        subheading("Return Values"),
        txt(
          "The return statement sends a value back to the caller. Without return, a function returns undefined."
        ),
        bullets([
          "function add(a, b) { return a + b; }",
          "const result = add(3, 4); // result is 7",
          "function sayHi(name) { console.log('Hi ' + name); }",
          "sayHi('Alice'); // prints: Hi Alice",
        ]),
      ]),
      slide("Local and Global Scope", [
        heading("Local and Global Scope"),
        subheading("Global Scope"),
        txt(
          "A variable declared outside any function is global and accessible everywhere in the script."
        ),
        subheading("Local (Function) Scope"),
        txt(
          "A variable declared inside a function exists only within that function. It is destroyed when the function returns."
        ),
        bullets([
          "const globalVar = 'I am global';",
          "function test() { const localVar = 'I am local'; }",
          "console.log(globalVar); // works",
          "console.log(localVar);  // ReferenceError – not accessible here",
          "Block scope: let/const inside {} are scoped to that block",
        ]),
      ]),
      slide("Why Functions Improve Code Reuse", [
        heading("Why Functions Improve Code Reuse"),
        txt(
          "Functions are the primary mechanism for code reuse in JavaScript. They let you write logic once and apply it in many contexts."
        ),
        bullets([
          "Define calculateTax(price) once; call it for any item",
          "Easy to test: test the function in isolation",
          "Easy to maintain: fix a bug in one place, not many",
          "Enables modularity: split code across multiple files",
          "Functions can call other functions to build complex behaviour",
        ]),
        txt("Aim for small, focused functions that do one thing well."),
      ]),
    ],
    questions: [
      q(1,
        "What is the correct syntax to declare a function named 'greet' in JavaScript?",
        "function: greet() {}",
        "function greet() {}",
        "def greet():",
        "greet = function(): {}",
        "B",
        "In JavaScript, functions are declared with the function keyword followed by the name, parentheses, and a code block in curly braces.",
        "Functions", "function declaration", 1, "easy"
      ),
      q(2,
        "What does the return statement do?",
        "Ends the script entirely",
        "Prints a value to the console",
        "Sends a value back from the function to the caller",
        "Declares a new variable",
        "C",
        "return exits the function and optionally sends a value back to wherever the function was called from.",
        "Return Values", "return statement", 2, "easy"
      ),
      q(3,
        "A variable declared inside a function can be accessed outside it.",
        "True – JavaScript variables are always global",
        "True – only if declared with var",
        "False – it has local scope and is not accessible outside the function",
        "False – functions cannot contain variables",
        "C",
        "Variables declared with let or const inside a function have local (function) scope. They are not accessible outside the function, which helps prevent naming conflicts.",
        "Scope", "local scope", 3, "medium"
      ),
      q(4,
        "What value does a function return if it has no return statement?",
        "0", "null", "false", "undefined",
        "D",
        "A JavaScript function without an explicit return statement returns undefined by default.",
        "Return Values", "default return", 2, "medium"
      ),
      q(5,
        "What are parameters in a function?",
        "Variables that store the function's result",
        "Named placeholders for values the function receives when called",
        "Built-in JavaScript keywords",
        "Loops inside a function",
        "B",
        "Parameters are the named placeholders listed in the function's definition. The actual values passed during a call are called arguments.",
        "Functions", "parameters", 2, "easy"
      ),
    ],
  },

  // ─── Lesson 6 ───────────────────────────────────────────────────────────────
  {
    title: "Arrays, Objects and DOM Basics",
    order: 6,
    estimatedTime: 14,
    slides: [
      slide("What Are Arrays?", [
        heading("What Are Arrays?"),
        txt(
          "An array is an ordered, zero-indexed collection of values. It can hold any mix of data types and grows or shrinks dynamically."
        ),
        bullets([
          'const fruits = ["apple", "banana", "cherry"];',
          "fruits[0] returns 'apple' (index starts at 0)",
          "fruits.length returns 3",
          "fruits.push('date') adds 'date' to the end",
          "fruits.pop() removes and returns the last item",
          "Use a for loop or forEach to iterate all items",
        ]),
      ]),
      slide("What Are Objects?", [
        heading("What Are Objects?"),
        txt(
          "An object is an unordered collection of key–value pairs called properties. Keys are strings (or Symbols); values can be any type, including functions."
        ),
        bullets([
          'const student = { name: "Alice", age: 21, isEnrolled: true };',
          "student.name returns 'Alice' (dot notation)",
          'student["age"] returns 21 (bracket notation)',
          "student.grade = 'A'; adds a new property",
          "Object.keys(student) returns ['name', 'age', 'isEnrolled']",
        ]),
      ]),
      slide("Accessing Arrays and Objects", [
        heading("Accessing Array Items and Object Properties"),
        subheading("Arrays – index-based access"),
        bullets([
          'const colors = ["red", "green", "blue"];',
          "colors[1] → 'green'",
          "colors[colors.length - 1] → 'blue' (last item)",
          "for (let i = 0; i < colors.length; i++) { console.log(colors[i]); }",
        ]),
        subheading("Objects – key-based access"),
        bullets([
          'const car = { make: "Toyota", year: 2023 };',
          "car.make → 'Toyota'",
          'car["year"] → 2023',
          "for...in loop iterates object keys",
        ]),
      ]),
      slide("What is the DOM?", [
        heading("What is the DOM?"),
        txt(
          "The Document Object Model (DOM) is a tree-like representation of an HTML page that JavaScript can read and modify. Every HTML element becomes a node in this tree."
        ),
        bullets([
          "The browser builds the DOM from your HTML automatically",
          "JavaScript uses the document object to access the DOM",
          "document.getElementById('id') selects an element by its ID",
          "document.querySelector('.class') selects by CSS selector",
          "Changes to the DOM immediately update what the user sees",
        ]),
      ]),
      slide("Simple DOM Interaction", [
        heading("Simple DOM Interaction – Changing Page Text"),
        txt(
          "One of the most common DOM operations is changing the text content of an HTML element."
        ),
        bullets([
          "HTML: <p id='message'>Hello</p>",
          "JS: const el = document.getElementById('message');",
          "JS: el.textContent = 'Hello, JavaScript!';",
          "The paragraph now shows 'Hello, JavaScript!' instantly",
          "el.style.color = 'blue'; changes the text colour",
          "el.classList.add('highlight'); adds a CSS class",
        ]),
        txt(
          "The DOM bridge between JavaScript and HTML is what makes modern web pages interactive."
        ),
      ]),
    ],
    questions: [
      q(1,
        "What index does the FIRST item in a JavaScript array have?",
        "1", "-1", "0", "It depends on the array size",
        "C",
        "JavaScript arrays are zero-indexed, meaning the first element is always at index 0.",
        "Arrays", "array indexing", 1, "easy"
      ),
      q(2,
        'What does const person = { name: "Bob", age: 30 }; represent?',
        "An array with two elements",
        "A function with two parameters",
        "An object with two properties",
        "A class definition",
        "C",
        "Curly braces with key–value pairs define a JavaScript object. Here, name and age are properties of the person object.",
        "Objects", "object literal", 1, "easy"
      ),
      q(3,
        "Which method adds a new item to the END of an array?",
        "unshift()", "push()", "shift()", "pop()",
        "B",
        "push() appends one or more elements to the end of an array and returns the new length.",
        "Arrays", "push method", 2, "easy"
      ),
      q(4,
        "What does the DOM stand for?",
        "Data Object Manager",
        "Document Object Model",
        "Dynamic Output Module",
        "Design Object Method",
        "B",
        "DOM stands for Document Object Model. It is a programming interface that represents an HTML document as a tree of objects that JavaScript can manipulate.",
        "DOM", "DOM definition", 1, "easy"
      ),
      q(5,
        "Which JavaScript method selects an HTML element by its id attribute?",
        "document.getElement('id')",
        "document.selectById('id')",
        "document.getElementById('id')",
        "document.query('id')",
        "C",
        "document.getElementById() is the standard method to retrieve a DOM element by its unique id attribute value.",
        "Frontend Interaction", "getElementById", 2, "easy"
      ),
    ],
  },
];

// ─── Main Seed Function ───────────────────────────────────────────────────────

async function seed() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error("❌  MONGO_URI is not set. Check your backend/.env file.");
    process.exit(1);
  }

  console.log("🔌  Connecting to MongoDB…");
  await mongoose.connect(MONGO_URI);
  console.log("✅  Connected to MongoDB\n");

  // ── Guard: skip if course already exists ──────────────────────────────────
  const existing = await Course.findOne({ title: COURSE_TITLE });
  if (existing) {
    console.log(`ℹ️   Course already exists (id: ${existing._id}). Skipping – no data changed.`);
    console.log("    To re-seed, rename or remove the existing course first.");
    await mongoose.disconnect();
    return;
  }

  // ── Find admin user to use as createdBy ───────────────────────────────────
  const admin = await User.findOne({ role: "admin" });
  if (!admin) {
    console.error("❌  No admin user found. Please create an admin account first.");
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`👤  Using admin: ${admin.email} (${admin._id})\n`);

  // ── 1. Create Course ───────────────────────────────────────────────────────
  const course = await Course.create({
    title: COURSE_TITLE,
    description:
      "A beginner-friendly micro-course designed to help learners understand the foundations of JavaScript programming, including variables, data types, operators, conditional logic, loops, functions, arrays, objects, and basic DOM concepts.",
    tags: ["JavaScript", "Programming", "Web Development", "Beginners", "Frontend"],
    level: "beginner",
    published: true,
    createdBy: admin._id,
  });
  console.log(`📚  Course created: "${course.title}" (${course._id})`);

  let totalLessons   = 0;
  let totalQuizzes   = 0;
  let totalQuestions = 0;

  // ── 2. Create Lessons, Quizzes, Questions ──────────────────────────────────
  for (const lessonData of LESSONS_DATA) {
    const lesson = await Lesson.create({
      courseId:      course._id,
      title:         lessonData.title,
      order:         lessonData.order,
      estimatedTime: lessonData.estimatedTime,
      slides:        lessonData.slides,
    });
    totalLessons++;
    console.log(`  📖  Lesson ${lesson.order}: "${lesson.title}" (${lesson._id})`);

    const quiz = await Quiz.create({
      lessonId:    lesson._id,
      title:       `${lesson.title} – Quiz`,
      passPercent: 70,
      timeLimitSec: 0,
    });
    totalQuizzes++;
    console.log(`       📝  Quiz created (${quiz._id})`);

    for (const qData of lessonData.questions) {
      await Question.create({ ...qData, quizId: quiz._id });
      totalQuestions++;
    }
    console.log(`       ❓  ${lessonData.questions.length} questions created`);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n════════════════════════════════════════════");
  console.log("✅  Seed completed successfully!");
  console.log("════════════════════════════════════════════");
  console.log(`  Course ID  : ${course._id}`);
  console.log(`  Lessons    : ${totalLessons}`);
  console.log(`  Quizzes    : ${totalQuizzes}`);
  console.log(`  Questions  : ${totalQuestions}`);
  console.log("════════════════════════════════════════════\n");

  await mongoose.disconnect();
  console.log("🔌  Disconnected from MongoDB.");
}

seed().catch((err) => {
  console.error("❌  Seed script failed:", err);
  mongoose.disconnect().finally(() => process.exit(1));
});
