// backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data (optional - be careful in production!)
  // await prisma.lessonProgress.deleteMany();
  // await prisma.quizAttempt.deleteMany();
  // await prisma.quizResponse.deleteMany();
  // await prisma.question.deleteMany();
  // await prisma.quiz.deleteMany();
  // await prisma.enrollment.deleteMany();
  // await prisma.lesson.deleteMany();
  // await prisma.module.deleteMany();
  // await prisma.course.deleteMany();

  // Create Course 1: React for Career Switchers (Free)
  const reactCourse = await prisma.course.create({
    data: {
      title: 'React for Career Switchers',
      description:
        'Master React fundamentals and build modern web applications. Perfect for career changers who want to break into frontend development.',
      shortDescription: 'Master React basics for career transition',
      category: 'FRONTEND_DEVELOPMENT',
      level: 'BEGINNER',
      estimatedHours: 20,
      isPremium: false,
      isPublished: true,
      thumbnailUrl: '/course-thumbnails/frontend-development.jpg',
      tags: ['React', 'JavaScript', 'Frontend', 'Career Change'],
      modules: {
        create: [
          {
            title: 'React Fundamentals',
            description:
              'Learn the core concepts of React including components, props, and state',
            orderIndex: 0,
            isRequired: true,
            lessons: {
              create: [
                {
                  title: 'What is React?',
                  content: `<h1>Introduction to React</h1>
                    <p>React is a JavaScript library for building user interfaces. It was created by Facebook and is now maintained by Meta and the open-source community.</p>
                    <h2>Key Concepts</h2>
                    <ul>
                      <li>Component-based architecture</li>
                      <li>Virtual DOM</li>
                      <li>Declarative programming</li>
                      <li>Unidirectional data flow</li>
                    </ul>
                    <h2>Why Choose React?</h2>
                    <p>React is popular because it makes building interactive UIs easy and efficient. Companies like Netflix, Airbnb, and Instagram use React in production.</p>`,
                  contentType: 'TEXT',
                  duration: 15,
                  orderIndex: 0,
                  isRequired: true,
                },
                {
                  title: 'JSX and Components',
                  content: `<h1>JSX and Components</h1>
                    <p>JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files.</p>
                    <h2>Creating Your First Component</h2>
                    <pre><code>function Welcome(props) {
  return &lt;h1&gt;Hello, {props.name}!&lt;/h1&gt;;
}</code></pre>
                    <p>Components are the building blocks of React applications. They let you split the UI into independent, reusable pieces.</p>`,
                  contentType: 'TEXT',
                  duration: 18,
                  orderIndex: 1,
                  isRequired: true,
                },
                {
                  title: 'Props and State',
                  content: `<h1>Props and State</h1>
                    <p>Props are how components talk to each other. State is how components remember things.</p>
                    <h2>Using Props</h2>
                    <pre><code>function Greeting({ name, age }) {
  return &lt;p&gt;Hello {name}, you are {age} years old!&lt;/p&gt;;
}</code></pre>
                    <p>State allows components to change their output over time in response to user actions, network responses, and anything else.</p>`,
                  contentType: 'TEXT',
                  duration: 22,
                  orderIndex: 2,
                  isRequired: true,
                },
              ],
            },
            quizzes: {
              create: [
                {
                  title: 'React Fundamentals Quiz',
                  description:
                    'Test your understanding of React basics, components, and JSX',
                  type: 'MODULE_ASSESSMENT',
                  difficulty: 'BEGINNER',
                  status: 'PUBLISHED',
                  duration: 15,
                  passingScore: 70,
                  maxAttempts: 3,
                  isRandomized: true,
                  showResults: true,
                  allowReview: true,
                  timeLimit: true,
                  questions: {
                    create: [
                      {
                        text: 'What is React?',
                        type: 'MULTIPLE_CHOICE',
                        options: [
                          'A JavaScript framework for building user interfaces',
                          'A JavaScript library for building user interfaces',
                          'A CSS framework for styling web applications',
                          'A database management system',
                        ],
                        correctAnswer:
                          'A JavaScript library for building user interfaces',
                        explanation:
                          'React is specifically a JavaScript library, not a framework. It focuses on building user interfaces through a component-based architecture.',
                        points: 5,
                        orderIndex: 0,
                        difficulty: 'BEGINNER',
                        tags: ['react-basics', 'definitions'],
                      },
                      {
                        text: 'What does JSX stand for?',
                        type: 'MULTIPLE_CHOICE',
                        options: [
                          'JavaScript XML',
                          'Java Syntax Extension',
                          'JavaScript eXtension',
                          'jQuery XML',
                        ],
                        correctAnswer: 'JavaScript XML',
                        explanation:
                          'JSX stands for JavaScript XML. It allows you to write HTML-like syntax in your JavaScript code.',
                        points: 5,
                        orderIndex: 1,
                        difficulty: 'BEGINNER',
                        tags: ['jsx', 'syntax'],
                      },
                      {
                        text: 'Which of the following are key benefits of React? (Select all that apply)',
                        type: 'MULTIPLE_SELECT',
                        options: [
                          'Component-based architecture',
                          'Virtual DOM for better performance',
                          'Automatic database management',
                          'Reusable components',
                          'Built-in CSS styling',
                        ],
                        correctAnswer: [
                          'Component-based architecture',
                          'Virtual DOM for better performance',
                          'Reusable components',
                        ],
                        explanation:
                          'React provides component-based architecture, Virtual DOM for performance optimization, and reusable components. It does not handle databases or provide built-in CSS styling.',
                        points: 10,
                        orderIndex: 2,
                        difficulty: 'BEGINNER',
                        tags: ['react-benefits', 'architecture'],
                      },
                      {
                        text: 'True or False: Props in React are mutable (can be changed)',
                        type: 'TRUE_FALSE',
                        options: ['True', 'False'],
                        correctAnswer: 'False',
                        explanation:
                          'Props are immutable in React. They are read-only and cannot be modified by the component that receives them.',
                        points: 5,
                        orderIndex: 3,
                        difficulty: 'BEGINNER',
                        tags: ['props', 'immutability'],
                      },
                      {
                        text: 'Complete the following React component: function Welcome(____) { return <h1>Hello, {______.name}!</h1>; }',
                        type: 'FILL_IN_BLANK',
                        options: null,
                        correctAnswer: 'props',
                        explanation:
                          'The parameter should be "props" and you access the name property with "props.name".',
                        points: 10,
                        orderIndex: 4,
                        difficulty: 'BEGINNER',
                        tags: ['components', 'props', 'syntax'],
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            title: 'React Hooks',
            description:
              'Learn modern React with hooks like useState and useEffect',
            orderIndex: 1,
            isRequired: true,
            lessons: {
              create: [
                {
                  title: 'useState Hook',
                  content: `<h1>useState Hook</h1>
                    <p>useState is a Hook that lets you add React state to function components.</p>
                    <h2>Example</h2>
                    <pre><code>import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    &lt;div&gt;
      &lt;p&gt;You clicked {count} times&lt;/p&gt;
      &lt;button onClick={() =&gt; setCount(count + 1)}&gt;
        Click me
      &lt;/button&gt;
    &lt;/div&gt;
  );
}</code></pre>`,
                  contentType: 'TEXT',
                  duration: 20,
                  orderIndex: 0,
                  isRequired: true,
                },
                {
                  title: 'useEffect Hook',
                  content: `<h1>useEffect Hook</h1>
                    <p>useEffect lets you perform side effects in function components. It serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount combined.</p>
                    <h2>Example</h2>
                    <pre><code>import { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() =&gt; {
    document.title = \`You clicked \${count} times\`;
  });

  return (
    &lt;div&gt;
      &lt;p&gt;You clicked {count} times&lt;/p&gt;
      &lt;button onClick={() =&gt; setCount(count + 1)}&gt;
        Click me
      &lt;/button&gt;
    &lt;/div&gt;
  );
}</code></pre>`,
                  contentType: 'TEXT',
                  duration: 25,
                  orderIndex: 1,
                  isRequired: true,
                },
              ],
            },
            quizzes: {
              create: [
                {
                  title: 'React Hooks Mastery Quiz',
                  description:
                    'Test your knowledge of useState, useEffect, and other React hooks',
                  type: 'MODULE_ASSESSMENT',
                  difficulty: 'INTERMEDIATE',
                  status: 'PUBLISHED',
                  duration: 20,
                  passingScore: 75,
                  maxAttempts: 3,
                  isRandomized: false,
                  showResults: true,
                  allowReview: true,
                  timeLimit: true,
                  questions: {
                    create: [
                      {
                        text: 'What does the useState hook return?',
                        type: 'MULTIPLE_CHOICE',
                        options: [
                          'An array with the current state value and a function to update it',
                          'An object with state and setState properties',
                          'Just the current state value',
                          'A function to update the state',
                        ],
                        correctAnswer:
                          'An array with the current state value and a function to update it',
                        explanation:
                          'useState returns an array where the first element is the current state value and the second element is the function to update it.',
                        points: 10,
                        orderIndex: 0,
                        difficulty: 'INTERMEDIATE',
                        tags: ['useState', 'hooks', 'state-management'],
                      },
                      {
                        text: 'When does useEffect run by default?',
                        type: 'MULTIPLE_CHOICE',
                        options: [
                          'Only on component mount',
                          'Only on component unmount',
                          'After every render (mount and update)',
                          'Only when state changes',
                        ],
                        correctAnswer: 'After every render (mount and update)',
                        explanation:
                          'By default, useEffect runs after every completed render, both on mount and after updates.',
                        points: 10,
                        orderIndex: 1,
                        difficulty: 'INTERMEDIATE',
                        tags: ['useEffect', 'lifecycle', 'rendering'],
                      },
                      {
                        text: 'How do you prevent useEffect from running on every render?',
                        type: 'MULTIPLE_SELECT',
                        options: [
                          'Pass an empty dependency array []',
                          'Pass specific dependencies in the array',
                          'Use useCallback instead',
                          'Return a cleanup function',
                          'Use useMemo hook',
                        ],
                        correctAnswer: [
                          'Pass an empty dependency array []',
                          'Pass specific dependencies in the array',
                        ],
                        explanation:
                          'You can control when useEffect runs by providing a dependency array. An empty array means it runs only once, and specific dependencies mean it runs only when those values change.',
                        points: 15,
                        orderIndex: 2,
                        difficulty: 'INTERMEDIATE',
                        tags: ['useEffect', 'dependencies', 'optimization'],
                      },
                      {
                        text: 'Write the correct syntax to create a state variable called "name" with initial value "John" using useState:',
                        type: 'SHORT_ANSWER',
                        options: null,
                        correctAnswer:
                          'const [name, setName] = useState("John");',
                        explanation:
                          'The correct destructuring syntax for useState is: const [stateVariable, setterFunction] = useState(initialValue);',
                        points: 15,
                        orderIndex: 3,
                        difficulty: 'INTERMEDIATE',
                        tags: ['useState', 'syntax', 'destructuring'],
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    include: { modules: true },
  });

  // Create Course 2: Node.js Backend Development (Premium)
  const nodeCourse = await prisma.course.create({
    data: {
      title: 'Node.js Backend Development',
      description:
        'Build scalable backend services with Node.js, Express, and databases. Learn industry best practices for API development.',
      shortDescription: 'Master backend development with Node.js',
      category: 'BACKEND_DEVELOPMENT',
      level: 'INTERMEDIATE',
      estimatedHours: 30,
      isPremium: true,
      isPublished: true,
      price: 49,
      thumbnailUrl: '/course-thumbnails/backend-development.jpg',
      tags: ['Node.js', 'Express', 'API', 'Backend'],
      modules: {
        create: [
          {
            title: 'Node.js Fundamentals',
            description: 'Understanding Node.js runtime and core concepts',
            orderIndex: 0,
            isRequired: true,
            lessons: {
              create: [
                {
                  title: 'Node.js Event Loop',
                  content: `<h1>Understanding the Node.js Event Loop</h1>
                    <p>The event loop is what allows Node.js to perform non-blocking I/O operations despite the fact that JavaScript is single-threaded.</p>
                    <h2>How it Works</h2>
                    <p>When Node.js starts, it initializes the event loop, processes the provided input script, and then begins processing the event loop.</p>
                    <h2>Phases of the Event Loop</h2>
                    <ul>
                      <li>Timer phase</li>
                      <li>Pending callbacks phase</li>
                      <li>Idle, prepare phase</li>
                      <li>Poll phase</li>
                      <li>Check phase</li>
                      <li>Close callbacks phase</li>
                    </ul>`,
                  contentType: 'TEXT',
                  duration: 20,
                  orderIndex: 0,
                  isRequired: true,
                },
              ],
            },
            quizzes: {
              create: [
                {
                  title: 'Node.js Fundamentals Assessment',
                  description:
                    'Test your understanding of Node.js core concepts and event loop',
                  type: 'MODULE_ASSESSMENT',
                  difficulty: 'INTERMEDIATE',
                  status: 'PUBLISHED',
                  duration: 25,
                  passingScore: 70,
                  maxAttempts: 3,
                  isRandomized: true,
                  showResults: true,
                  allowReview: true,
                  timeLimit: true,
                  questions: {
                    create: [
                      {
                        text: 'What makes Node.js suitable for I/O-intensive applications?',
                        type: 'MULTIPLE_CHOICE',
                        options: [
                          'It uses multiple threads for each request',
                          'It has a non-blocking, event-driven architecture',
                          'It compiles JavaScript to machine code',
                          'It has built-in caching mechanisms',
                        ],
                        correctAnswer:
                          'It has a non-blocking, event-driven architecture',
                        explanation:
                          'Node.js uses a single-threaded event loop with non-blocking I/O operations, making it highly efficient for I/O-intensive applications.',
                        points: 10,
                        orderIndex: 0,
                        difficulty: 'INTERMEDIATE',
                        tags: ['nodejs', 'architecture', 'event-loop'],
                      },
                      {
                        text: 'Which phase of the event loop handles setTimeout and setInterval callbacks?',
                        type: 'MULTIPLE_CHOICE',
                        options: [
                          'Poll phase',
                          'Check phase',
                          'Timer phase',
                          'Pending callbacks phase',
                        ],
                        correctAnswer: 'Timer phase',
                        explanation:
                          'The Timer phase executes callbacks scheduled by setTimeout() and setInterval().',
                        points: 10,
                        orderIndex: 1,
                        difficulty: 'INTERMEDIATE',
                        tags: ['event-loop', 'timers', 'phases'],
                      },
                      {
                        text: 'True or False: Node.js is single-threaded for everything',
                        type: 'TRUE_FALSE',
                        options: ['True', 'False'],
                        correctAnswer: 'False',
                        explanation:
                          'While the main event loop is single-threaded, Node.js uses a thread pool (libuv) for file system operations, DNS lookups, and some crypto operations.',
                        points: 10,
                        orderIndex: 2,
                        difficulty: 'INTERMEDIATE',
                        tags: ['threading', 'libuv', 'architecture'],
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            title: 'Express.js Framework',
            description: 'Building REST APIs with Express.js',
            orderIndex: 1,
            isRequired: true,
            lessons: {
              create: [
                {
                  title: 'Express Basics',
                  content: `<h1>Getting Started with Express.js</h1>
                    <p>Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.</p>
                    <h2>Creating Your First Express App</h2>
                    <pre><code>const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(\`App listening at http://localhost:\${port}\`);
});</code></pre>`,
                  contentType: 'TEXT',
                  duration: 25,
                  orderIndex: 0,
                  isRequired: true,
                },
              ],
            },
            quizzes: {
              create: [
                {
                  title: 'Express.js Fundamentals Quiz',
                  description:
                    'Test your knowledge of Express.js framework and API development',
                  type: 'MODULE_ASSESSMENT',
                  difficulty: 'INTERMEDIATE',
                  status: 'PUBLISHED',
                  duration: 20,
                  passingScore: 75,
                  maxAttempts: 3,
                  isRandomized: false,
                  showResults: true,
                  allowReview: true,
                  timeLimit: true,
                  questions: {
                    create: [
                      {
                        text: 'What is Express.js?',
                        type: 'MULTIPLE_CHOICE',
                        options: [
                          'A database management system',
                          'A minimal and flexible Node.js web framework',
                          'A frontend JavaScript library',
                          'A testing framework for Node.js',
                        ],
                        correctAnswer:
                          'A minimal and flexible Node.js web framework',
                        explanation:
                          'Express.js is a web application framework for Node.js that provides a robust set of features for web and mobile applications.',
                        points: 10,
                        orderIndex: 0,
                        difficulty: 'INTERMEDIATE',
                        tags: ['express', 'framework', 'nodejs'],
                      },
                      {
                        text: 'Which HTTP methods are commonly used in RESTful APIs? (Select all that apply)',
                        type: 'MULTIPLE_SELECT',
                        options: [
                          'GET',
                          'POST',
                          'PUT',
                          'DELETE',
                          'CONNECT',
                          'PATCH',
                        ],
                        correctAnswer: [
                          'GET',
                          'POST',
                          'PUT',
                          'DELETE',
                          'PATCH',
                        ],
                        explanation:
                          'GET, POST, PUT, DELETE, and PATCH are the most commonly used HTTP methods in RESTful APIs. CONNECT is rarely used in REST APIs.',
                        points: 15,
                        orderIndex: 1,
                        difficulty: 'INTERMEDIATE',
                        tags: ['rest', 'http-methods', 'api'],
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    include: { modules: true },
  });

  // Create Course 3: Data Science with Python (Premium)
  const dataScienceCourse = await prisma.course.create({
    data: {
      title: 'Data Science with Python',
      description:
        'Learn data analysis, machine learning, and visualization with Python. From pandas to scikit-learn.',
      shortDescription: 'Complete data science bootcamp',
      category: 'DATA_SCIENCE',
      level: 'INTERMEDIATE',
      estimatedHours: 40,
      isPremium: true,
      isPublished: true,
      price: 79,
      thumbnailUrl: '/course-thumbnails/data-science.jpg',
      tags: ['Python', 'Data Science', 'Machine Learning', 'Pandas'],
      modules: {
        create: [
          {
            title: 'Python for Data Science',
            description: 'Python fundamentals for data analysis',
            orderIndex: 0,
            isRequired: true,
            lessons: {
              create: [
                {
                  title: 'NumPy Basics',
                  content: `<h1>Introduction to NumPy</h1>
                    <p>NumPy is the fundamental package for scientific computing with Python. It provides support for arrays, along with a large collection of high-level mathematical functions.</p>
                    <h2>Creating Arrays</h2>
                    <pre><code>import numpy as np

# Create a 1D array
arr1d = np.array([1, 2, 3, 4, 5])

# Create a 2D array
arr2d = np.array([[1, 2, 3], [4, 5, 6]])

# Array operations
result = arr1d * 2  # Multiply all elements by 2</code></pre>`,
                  contentType: 'TEXT',
                  duration: 30,
                  orderIndex: 0,
                  isRequired: true,
                },
              ],
            },
            quizzes: {
              create: [
                {
                  title: 'Python Data Science Fundamentals',
                  description:
                    'Test your knowledge of NumPy, Pandas, and Python for data science',
                  type: 'MODULE_ASSESSMENT',
                  difficulty: 'INTERMEDIATE',
                  status: 'PUBLISHED',
                  duration: 30,
                  passingScore: 70,
                  maxAttempts: 3,
                  isRandomized: true,
                  showResults: true,
                  allowReview: true,
                  timeLimit: true,
                  questions: {
                    create: [
                      {
                        text: 'What is NumPy primarily used for?',
                        type: 'MULTIPLE_CHOICE',
                        options: [
                          'Web development',
                          'Scientific computing and array operations',
                          'Database management',
                          'GUI development',
                        ],
                        correctAnswer:
                          'Scientific computing and array operations',
                        explanation:
                          'NumPy is the fundamental package for scientific computing with Python, providing support for large, multi-dimensional arrays and mathematical functions.',
                        points: 10,
                        orderIndex: 0,
                        difficulty: 'INTERMEDIATE',
                        tags: ['numpy', 'data-science', 'arrays'],
                      },
                      {
                        text: 'Which of the following are advantages of NumPy arrays over Python lists? (Select all that apply)',
                        type: 'MULTIPLE_SELECT',
                        options: [
                          'Faster computation',
                          'Less memory usage',
                          'Broadcasting capabilities',
                          'Built-in statistical functions',
                          'Dynamic typing support',
                        ],
                        correctAnswer: [
                          'Faster computation',
                          'Less memory usage',
                          'Broadcasting capabilities',
                          'Built-in statistical functions',
                        ],
                        explanation:
                          'NumPy arrays offer faster computation, use less memory, support broadcasting, and have built-in statistical functions. They use fixed types, not dynamic typing.',
                        points: 15,
                        orderIndex: 1,
                        difficulty: 'INTERMEDIATE',
                        tags: ['numpy', 'performance', 'arrays'],
                      },
                      {
                        text: 'Complete the code to create a 2D NumPy array: import numpy as np; arr = np.______([[1, 2], [3, 4]])',
                        type: 'FILL_IN_BLANK',
                        options: null,
                        correctAnswer: 'array',
                        explanation:
                          'The np.array() function is used to create NumPy arrays from Python lists or other array-like objects.',
                        points: 10,
                        orderIndex: 2,
                        difficulty: 'BEGINNER',
                        tags: ['numpy', 'syntax', 'array-creation'],
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    include: { modules: true },
  });

  console.log('✅ Created courses with quizzes:');
  console.log(`- ${reactCourse.title} (${reactCourse.modules.length} modules)`);
  console.log(`- ${nodeCourse.title} (${nodeCourse.modules.length} modules)`);
  console.log(
    `- ${dataScienceCourse.title} (${dataScienceCourse.modules.length} modules)`,
  );

  // Create a test user and enroll them in the free course
  const testUser = await prisma.user.upsert({
    where: { email: 'test@mockitt.com' },
    update: {},
    create: {
      email: 'test@mockitt.com',
      password: '$2b$10$rCkJBfz5aIJX5RQKqP5Kt.Wd5OhCKXXHPQnJ6Vz9Kw4QJ5qX9L6QW', // hashed 'password123'
      firstName: 'Test',
      lastName: 'User',
      isPremium: false,
    },
  });

  // Enroll test user in the free React course
  await prisma.enrollment.create({
    data: {
      userId: testUser.id,
      courseId: reactCourse.id,
      progressPercent: 0,
      enrolledAt: new Date(),
    },
  });

  // Create some quiz attempts for demonstration
  const quizzes = await prisma.quiz.findMany({
    where: {
      module: {
        course: {
          id: reactCourse.id,
        },
      },
    },
    include: {
      questions: true,
    },
  });

  if (quizzes.length > 0) {
    const firstQuiz = quizzes[0];
    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        userId: testUser.id,
        quizId: firstQuiz.id,
        score: 35,
        maxScore: 50,
        passed: false,
        attemptNumber: 1,
        startedAt: new Date(Date.now() - 1800000), // 30 minutes ago
        completedAt: new Date(Date.now() - 1500000), // 25 minutes ago
        timeSpent: 300, // 5 minutes
      },
    });

    // Create some sample quiz responses
    if (firstQuiz.questions.length > 0) {
      await prisma.quizResponse.createMany({
        data: firstQuiz.questions.slice(0, 3).map((question, index) => ({
          attemptId: quizAttempt.id,
          questionId: question.id,
          answer:
            question.type === 'MULTIPLE_CHOICE'
              ? (question.options as string[])[
                  index % (question.options as string[]).length
                ]
              : 'Sample answer',
          isCorrect: index === 0, // First answer correct, others incorrect
          pointsEarned: index === 0 ? question.points : 0,
          timeSpent: 60 + index * 30, // Varying time spent
        })),
      });
    }
  }

  console.log('✅ Created test user, enrollment, and sample quiz attempt');
  console.log('🌱 Database seeding completed with quizzes!');
  console.log(`📊 Total quizzes created: ${await prisma.quiz.count()}`);
  console.log(`❓ Total questions created: ${await prisma.question.count()}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
