import mongoose from 'mongoose';
import dotenv from 'dotenv';
import InterviewExam from './models/InterviewExam.js';
import User from './models/User.js';

dotenv.config();

const seedExams = async () => {
  try {
    const dbURI = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!dbURI) {
      console.error('❌ Database URI not configured');
      process.exit(1);
    }

    await mongoose.connect(dbURI);
    console.log('✅ Connected to MongoDB');

    // Get or create an admin user for createdBy
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin',
        email: 'admin@placement.io',
        password: 'admin123', // In production, this would be hashed
        role: 'admin'
      });
      console.log('✅ Created admin user');
    }

    // Check if Aptitude Test already exists
    const existingExam = await InterviewExam.findOne({ title: 'Aptitude Test 1' });
    if (existingExam) {
      console.log('ℹ️  Aptitude Test 1 already exists, skipping...');
    } else {
      const aptitudeTest = await InterviewExam.create({
        title: 'Aptitude Test 1',
        description: 'Basic aptitude test covering quantitative, reasoning, and verbal skills',
        createdBy: adminUser._id,
        durationMinutes: 60,
        status: 'published',
        questions: [
          {
            question: 'If 5 + 3 × 2 = ? (following order of operations), what is the answer?',
            maxMarks: 10
          },
          {
            question: 'What is the average of 25, 50, and 75?',
            maxMarks: 10
          },
          {
            question: 'If a train travels 120 km in 2 hours, what is its speed?',
            maxMarks: 10
          },
          {
            question: 'Which word is the opposite of "ancient"?',
            maxMarks: 10
          },
          {
            question: 'Complete the sequence: 2, 4, 8, 16, ?',
            maxMarks: 10
          },
          {
            question: 'What is 25% of 200?',
            maxMarks: 10
          },
          {
            question: 'If you have 5 red balls and 3 blue balls, what is the probability of picking a red ball?',
            maxMarks: 10
          },
          {
            question: 'Rearrange the letters to form a word: LISTEN',
            maxMarks: 10
          },
          {
            question: 'What comes next in the pattern: A, C, E, G, ?',
            maxMarks: 10
          },
          {
            question: 'If a book costs $15 and you get 20% discount, what will you pay?',
            maxMarks: 10
          }
        ]
      });

      console.log('✅ Created Aptitude Test 1 with 10 questions');
    }

    // Check if Technical Test exists
    const technicalTest = await InterviewExam.findOne({ title: 'Technical Test 1' });
    if (!technicalTest) {
      const technical = await InterviewExam.create({
        title: 'Technical Test 1',
        description: 'JavaScript and React fundamentals test',
        createdBy: adminUser._id,
        durationMinutes: 90,
        status: 'published',
        questions: [
          {
            question: 'What is the difference between let and const in JavaScript?',
            maxMarks: 10
          },
          {
            question: 'Explain the concept of closures in JavaScript.',
            maxMarks: 10
          },
          {
            question: 'What is the purpose of useEffect hook in React?',
            maxMarks: 10
          },
          {
            question: 'What is the virtual DOM in React and why is it beneficial?',
            maxMarks: 10
          },
          {
            question: 'How would you optimize the performance of a React application?',
            maxMarks: 10
          }
        ]
      });
      console.log('✅ Created Technical Test 1');
    }

    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedExams();
