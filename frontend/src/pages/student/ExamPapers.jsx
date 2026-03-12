import React, { useState, useEffect } from 'react';
import { 
  FileText, Clock, Calendar, Download, Eye, CheckCircle, 
  AlertCircle, TrendingUp, Award, Target, Search, 
  BookOpen, Briefcase, Send, X, User, Mail, Link as LinkIcon 
} from 'lucide-react';
import { examsAPI } from '../../services/api';
import { jsPDF } from 'jspdf';

const ExamPapers = () => {
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('available');

  // New States for Application Logic
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [applicationData, setApplicationData] = useState({
    fullName: '',
    email: '',
    portfolio: '',
    resumeLink: '',
    coverLetter: ''
  });

  // States for Question Viewing
  const [isViewQuestionsOpen, setIsViewQuestionsOpen] = useState(false);
  const [selectedQuestionExam, setSelectedQuestionExam] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  useEffect(() => {
    fetchExams();
    fetchSubmissions();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await examsAPI.getAll();
      const apiExams = Array.isArray(response.data?.exams) && response.data.exams.length > 0
        ? response.data.exams
        : mockExams;
      setExams(apiExams);
    } catch (error) {
      console.error('Error fetching exams:', error);
      setExams(mockExams);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await examsAPI.getMySubmissions();
      setSubmissions(response.data.submissions || mockSubmissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setSubmissions(mockSubmissions);
    }
  };

  const mockExams = [
    { id: 1, title: 'Google Coding Assessment 2026', company: 'Google', type: 'Coding', category: 'Technical', duration: 90, totalQuestions: 3, difficulty: 'Hard', eligibility: 'CGPA > 7.5', deadline: new Date('2027-02-15'), topics: ['Data Structures', 'Algorithms'], description: 'Advanced coding problems focusing on algorithms and data structures', maxMarks: 100, passingMarks: 60, samplePaper: true, previousYearPaper: true },
    { id: 2, title: 'Microsoft Aptitude Test', company: 'Microsoft', type: 'Aptitude', category: 'Quantitative', duration: 60, totalQuestions: 50, difficulty: 'Medium', eligibility: 'All Final Year', deadline: new Date('2027-02-18'), topics: ['Logical Reasoning', 'Verbal'], description: 'Comprehensive aptitude assessment covering multiple domains', maxMarks: 100, passingMarks: 70, samplePaper: true, previousYearPaper: true },
    { id: 3, title: 'Amazon SDE Online Assessment', company: 'Amazon', type: 'Mixed', category: 'Technical', duration: 120, totalQuestions: 25, difficulty: 'Hard', eligibility: 'CGPA > 7.0', deadline: new Date('2027-02-20'), topics: ['DSA', 'System Design'], description: 'Comprehensive technical assessment for SDE roles', maxMarks: 150, passingMarks: 90, samplePaper: true, previousYearPaper: false },
    { id: 4, title: 'Cognizant Aptitude Challenge', company: 'Cognizant', type: 'Aptitude', category: 'Logical Reasoning', duration: 45, totalQuestions: 30, difficulty: 'Easy', eligibility: 'All Branches', deadline: new Date('2027-02-22'), topics: ['Analytical', 'Puzzles'], description: 'Quick aptitude screening for campus hiring', maxMarks: 60, passingMarks: 36, samplePaper: true, previousYearPaper: true },
    { id: 5, title: 'TCS Coding Round - Java', company: 'TCS', type: 'Coding', category: 'Java', duration: 90, totalQuestions: 2, difficulty: 'Medium', eligibility: 'CGPA > 6.5', deadline: new Date('2027-02-25'), topics: ['Strings', 'Collections'], description: 'Java focused coding round with practical problem solving', maxMarks: 80, passingMarks: 48, samplePaper: true, previousYearPaper: true },
    { id: 6, title: 'Infosys Coding Round - Python/JS', company: 'Infosys', type: 'Coding', category: 'Programming', duration: 90, totalQuestions: 3, difficulty: 'Medium', eligibility: 'CGPA > 6.0', deadline: new Date('2027-02-28'), topics: ['Arrays', 'Greedy'], description: 'Multi-language coding round with Python or JavaScript', maxMarks: 90, passingMarks: 54, samplePaper: true, previousYearPaper: false },
    { id: 7, title: 'Wipro Coding & Aptitude Test', company: 'Wipro', type: 'Coding & Aptitude', category: 'Combined', duration: 75, totalQuestions: 40, difficulty: 'Medium', eligibility: 'CGPA > 6.0', deadline: new Date('2027-03-01'), topics: ['Coding', 'Aptitude', 'Logical Reasoning'], description: 'Combined coding and aptitude test for Wipro campus hiring', maxMarks: 100, passingMarks: 60, samplePaper: true, previousYearPaper: true },
    { id: 8, title: 'Google Listening Skills Test', company: 'Google', type: 'Listening', category: 'Soft Skills', duration: 30, totalQuestions: 10, difficulty: 'Easy', eligibility: 'All Students', deadline: new Date('2027-03-05'), topics: ['Listening', 'Comprehension'], description: 'Test your listening and comprehension skills with Google', maxMarks: 20, passingMarks: 12, samplePaper: true, previousYearPaper: false },
    { id: 9, title: 'TCS Aptitude & Reasoning', company: 'TCS', type: 'Aptitude', category: 'Reasoning', duration: 60, totalQuestions: 40, difficulty: 'Medium', eligibility: 'All Branches', deadline: new Date('2027-03-10'), topics: ['Aptitude', 'Reasoning'], description: 'Aptitude and reasoning test for TCS drive', maxMarks: 80, passingMarks: 48, samplePaper: true, previousYearPaper: true },
    { id: 10, title: 'Wipro English Communication', company: 'Wipro', type: 'English', category: 'Communication', duration: 45, totalQuestions: 20, difficulty: 'Easy', eligibility: 'All Students', deadline: new Date('2027-03-12'), topics: ['English', 'Communication'], description: 'English communication and grammar test for Wipro', maxMarks: 40, passingMarks: 24, samplePaper: true, previousYearPaper: false },
    { id: 11, title: 'Microsoft Coding & Listening', company: 'Microsoft', type: 'Coding & Listening', category: 'Technical & Soft Skills', duration: 75, totalQuestions: 15, difficulty: 'Medium', eligibility: 'All Final Year', deadline: new Date('2027-03-15'), topics: ['Coding', 'Listening'], description: 'Combined coding and listening test for Microsoft campus drive', maxMarks: 60, passingMarks: 36, samplePaper: true, previousYearPaper: true }
  ];

  const mockSubmissions = [
    { id: 1, examId: 1, examTitle: 'Google Coding Assessment 2026', submittedAt: new Date('2026-02-05'), score: 85, maxScore: 100, status: 'Reviewed', timeTaken: 85, rank: 12, percentile: 94, feedback: 'Excellent problem-solving approach' }
  ];

  // Exam Questions Database
  const examQuestions = {
        8: {
          title: 'Google Listening Skills Test',
          company: 'Google',
          type: 'Listening',
          totalQuestions: 2,
          questions: [
            {
              id: 1,
              difficulty: 'Easy',
              title: 'Audio Comprehension',
              description: 'Listen to the short audio and answer: What is the main topic discussed?',
              options: ['Technology trends', 'Travel plans', 'Health tips', 'Cooking recipes'],
              correctAnswer: 0,
              explanation: 'The audio discusses technology trends.',
              marks: 2
            },
            {
              id: 2,
              difficulty: 'Easy',
              title: 'Speaker Intent',
              description: 'After listening, what was the speaker’s main intent?',
              options: ['To inform', 'To entertain', 'To persuade', 'To complain'],
              correctAnswer: 0,
              explanation: 'The speaker aimed to inform the audience.',
              marks: 2
            }
          ]
        },
        9: {
          title: 'TCS Aptitude & Reasoning',
          company: 'TCS',
          type: 'Aptitude',
          totalQuestions: 2,
          questions: [
            {
              id: 1,
              difficulty: 'Medium',
              title: 'Number Series',
              description: 'Find the next number: 3, 6, 12, 24, ?',
              options: ['36', '40', '48', '60'],
              correctAnswer: 2,
              explanation: 'Each number is multiplied by 2. Next is 24*2=48.',
              marks: 2
            },
            {
              id: 2,
              difficulty: 'Medium',
              title: 'Logical Deduction',
              description: 'If all roses are flowers and some flowers fade quickly, can we say some roses fade quickly?',
              options: ['Yes', 'No', 'Cannot say', 'Only if red'],
              correctAnswer: 2,
              explanation: 'We cannot say for sure about roses.',
              marks: 2
            }
          ]
        },
        10: {
          title: 'Wipro English Communication',
          company: 'Wipro',
          type: 'English',
          totalQuestions: 2,
          questions: [
            {
              id: 1,
              difficulty: 'Easy',
              title: 'Grammar Correction',
              description: 'Choose the correct sentence.',
              options: ['He go to school.', 'He goes to school.', 'He going to school.', 'He gone to school.'],
              correctAnswer: 1,
              explanation: 'He goes to school is correct.',
              marks: 1
            },
            {
              id: 2,
              difficulty: 'Easy',
              title: 'Synonym',
              description: 'Select the synonym for "Happy".',
              options: ['Sad', 'Angry', 'Joyful', 'Tired'],
              correctAnswer: 2,
              explanation: 'Joyful is a synonym for Happy.',
              marks: 1
            }
          ]
        },
        11: {
          title: 'Microsoft Coding & Listening',
          company: 'Microsoft',
          type: 'Coding & Listening',
          totalQuestions: 2,
          questions: [
            {
              id: 1,
              difficulty: 'Medium',
              title: 'Array Sum',
              description: 'Write a function to return the sum of all elements in an array.',
              examples: [
                { input: 'arr = [1,2,3,4]', output: '10' },
                { input: 'arr = [5,5,5]', output: '15' }
              ],
              constraints: ['1 <= arr.length <= 1000'],
              topics: ['Array'],
              timeLimit: 20,
              marks: 5
            },
            {
              id: 2,
              difficulty: 'Medium',
              title: 'Audio Intent',
              description: 'Listen to the audio and select the main intent.',
              options: ['To explain a process', 'To narrate a story', 'To ask a question', 'To give instructions'],
              correctAnswer: 3,
              explanation: 'The audio gives instructions.',
              marks: 2
            }
          ]
        },
    1: { // Google Coding Assessment
      title: 'Google Coding Assessment 2026',
      company: 'Google',
      type: 'Coding',
      totalQuestions: 3,
      questions: [
        {
          id: 1,
          difficulty: 'Medium',
          title: 'Two Sum',
          description: 'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. You may assume each input has exactly one solution, and you cannot use the same element twice.',
          examples: [
            { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] == 9, so we return [0, 1]' },
            { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'nums[1] + nums[2] == 6, so we return [1, 2]' }
          ],
          constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9'],
          topics: ['Array', 'Hash Table'],
          timeLimit: 30,
          marks: 30
        },
        {
          id: 2,
          difficulty: 'Hard',
          title: 'Longest Substring Without Repeating Characters',
          description: 'Given a string s, find the length of the longest substring without repeating characters. A substring is a contiguous sequence of characters within a string.',
          examples: [
            { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3' },
            { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with the length of 1' }
          ],
          constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces'],
          topics: ['Hash Table', 'String', 'Sliding Window'],
          timeLimit: 35,
          marks: 35
        },
        {
          id: 3,
          difficulty: 'Hard',
          title: 'Binary Tree Level Order Traversal',
          description: 'Given the root of a binary tree, return the level order traversal of its nodes values. (i.e., from left to right, level by level).',
          examples: [
            { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' },
            { input: 'root = [1]', output: '[[1]]' }
          ],
          constraints: ['The number of nodes in the tree is in the range [0, 2000]'],
          topics: ['Tree', 'Breadth-First Search', 'Queue'],
          timeLimit: 40,
          marks: 35
        }
      ]
    },
    2: { // Microsoft Aptitude Test
      title: 'Microsoft Aptitude Test',
      company: 'Microsoft',
      type: 'Aptitude',
      totalQuestions: 50,
      questions: [
        {
          id: 1,
          difficulty: 'Easy',
          category: 'Quantitative',
          title: 'Simple Percentage',
          description: 'What is 25% of 200?',
          options: ['40', '50', '60', '75'],
          correctAnswer: 0,
          explanation: '25% of 200 = (25/100) × 200 = 50',
          marks: 1
        },
        {
          id: 2,
          difficulty: 'Medium',
          category: 'Logical Reasoning',
          title: 'Series Completion',
          description: 'What is the next number in the series: 2, 6, 12, 20, 30, ?',
          options: ['40', '42', '44', '48'],
          correctAnswer: 1,
          explanation: 'The differences are 4, 6, 8, 10, 12. So next is 30 + 12 = 42',
          marks: 2
        },
        {
          id: 3,
          difficulty: 'Medium',
          category: 'Verbal',
          title: 'Synonym',
          description: 'Select the synonym of "Ephemeral":',
          options: ['Permanent', 'Transient', 'Solid', 'Durable'],
          correctAnswer: 1,
          explanation: 'Ephemeral means lasting for a very short time. Transient has the same meaning.',
          marks: 1
        },
        {
          id: 4,
          difficulty: 'Hard',
          category: 'Quantitative',
          title: 'Probability',
          description: 'A bag contains 5 red balls, 3 blue balls, and 2 green balls. If you draw 2 balls without replacement, what is the probability of getting one red and one blue ball?',
          options: ['15/90', '30/90', '45/90', '60/90'],
          correctAnswer: 2,
          explanation: 'P(RB) = (5/10 × 3/9) + (3/10 × 5/9) = 15/90 + 15/90 = 30/90 = 1/3. But we calculated for ordered selection: 2 × (5/10 × 3/9) = 30/90. Simplified: 1/3',
          marks: 3
        },
        {
          id: 5,
          difficulty: 'Hard',
          category: 'Logical Reasoning',
          title: 'Coding-Decoding',
          description: 'In a certain code, APPLE is written as 1PP13. How is MANGO written?',
          options: ['13114715', '13114716', '13114715', '13114720'],
          correctAnswer: 2,
          explanation: 'A=1, P=16→5 (5th letter position), L=12, E=5→1 (reverse). Similarly, M=13, A=1, N=14, G=7, O=15',
          marks: 3
        }
      ]
    },
    3: { // Amazon SDE Online Assessment
      title: 'Amazon SDE Online Assessment',
      company: 'Amazon',
      type: 'Mixed',
      totalQuestions: 25,
      questions: [
        {
          id: 1,
          difficulty: 'Medium',
          category: 'Coding',
          title: 'Rotate Array',
          description: 'Given an array, rotate the array to the right by k steps, where k is non-negative. Try to come up with as many solutions as you can. There are at least 3 different ways to solve this problem.',
          examples: [
            { input: 'nums = [1,2,3,4,5,6,7], k = 3', output: '[5,6,7,1,2,3,4]' },
            { input: 'nums = [-1,-100,3,99], k = 2', output: '[3,99,-1,-100]' }
          ],
          topics: ['Array', 'Math'],
          marks: 25
        },
        {
          id: 2,
          difficulty: 'Medium',
          category: 'Behavioral',
          title: 'System Design - Scalability',
          description: 'Design a system to handle 1 million concurrent users. What are the key considerations?',
          keyPoints: ['Database sharding', 'Caching strategy', 'Load balancing', 'Microservices architecture'],
          marks: 30
        },
        {
          id: 3,
          difficulty: 'Easy',
          category: 'Coding',
          title: 'Palindrome Check',
          description: 'Given a string s, determine if it is a palindrome, considering only alphanumeric characters and ignoring cases.',
          examples: [
            { input: 's = "A man, a plan, a canal: Panama"', output: 'true' },
            { input: 's = "race a car"', output: 'false' }
          ],
          topics: ['String', 'Two Pointers'],
          marks: 15
        },
        {
          id: 4,
          difficulty: 'Hard',
          category: 'Quantitative',
          title: 'Permutations & Combinations',
          description: 'In how many ways can you arrange the letters of the word "AABBCC"?',
          options: ['90', '120', '180', '360'],
          correctAnswer: 0,
          explanation: 'Total letters = 6, with 2 A\'s, 2 B\'s, 2 C\'s. Arrangements = 6!/(2!×2!×2!) = 720/8 = 90',
          marks: 20
        },
        {
          id: 5,
          difficulty: 'Medium',
          category: 'Coding',
          title: 'Merge Two Sorted Lists',
          description: 'Merge two sorted linked lists and return it as a new list. The new list should be made by splicing together the nodes of the two lists.',
          examples: [
            { input: 'l1 = [1,2,4], l2 = [1,3,4]', output: '[1,1,2,3,4,4]' }
          ],
          topics: ['Linked List', 'Recursion'],
          marks: 20
        }
      ]
    },
    4: { // Cognizant Aptitude Challenge
      title: 'Cognizant Aptitude Challenge',
      company: 'Cognizant',
      type: 'Aptitude',
      totalQuestions: 30,
      questions: [
        {
          id: 1,
          difficulty: 'Easy',
          category: 'Quantitative',
          title: 'Ratio and Proportion',
          description: 'If the ratio of boys to girls in a class is 3:2 and there are 30 boys, how many girls are there?',
          options: ['18', '20', '24', '25'],
          correctAnswer: 1,
          explanation: '3 parts = 30 boys, so 1 part = 10. Girls = 2 parts = 20.',
          marks: 2
        },
        {
          id: 2,
          difficulty: 'Easy',
          category: 'Logical Reasoning',
          title: 'Odd One Out',
          description: 'Find the odd one out: 3, 5, 11, 14, 17',
          options: ['3', '5', '11', '14'],
          correctAnswer: 3,
          explanation: '14 is even, others are prime numbers.',
          marks: 1
        },
        {
          id: 3,
          difficulty: 'Medium',
          category: 'Analytical',
          title: 'Syllogism',
          description: 'Statements: All laptops are machines. Some machines are robots. Conclusions: (1) Some laptops are robots (2) Some robots are laptops. Choose the correct option.',
          options: ['Only (1) follows', 'Only (2) follows', 'Both follow', 'Neither follows'],
          correctAnswer: 3,
          explanation: 'There is no direct relation between laptops and robots from the statements.',
          marks: 3
        }
      ]
    },
    5: { // TCS Coding Round - Java
      title: 'TCS Coding Round - Java',
      company: 'TCS',
      type: 'Coding',
      totalQuestions: 2,
      questions: [
        {
          id: 1,
          difficulty: 'Medium',
          category: 'Coding',
          language: 'Java',
          title: 'Valid Parentheses',
          description: 'Given a string containing only parentheses characters, determine if the input string is valid.',
          examples: [
            { input: 's = "()[]{}"', output: 'true' },
            { input: 's = "(]"', output: 'false' }
          ],
          constraints: ['1 <= s.length <= 10^4'],
          topics: ['Stack', 'String'],
          timeLimit: 30,
          marks: 40
        },
        {
          id: 2,
          difficulty: 'Medium',
          category: 'Coding',
          language: 'Java',
          title: 'Top K Frequent Elements',
          description: 'Given a non-empty array of integers, return the k most frequent elements.',
          examples: [
            { input: 'nums = [1,1,1,2,2,3], k = 2', output: '[1,2]' }
          ],
          constraints: ['1 <= nums.length <= 10^5'],
          topics: ['Hash Map', 'Heap'],
          timeLimit: 35,
          marks: 40
        }
      ]
    },
    6: { // Infosys Coding Round - Python/JS
      title: 'Infosys Coding Round - Python/JS',
      company: 'Infosys',
      type: 'Coding',
      totalQuestions: 3,
      questions: [
        {
          id: 1,
          difficulty: 'Easy',
          category: 'Coding',
          language: 'Python',
          title: 'Best Time to Buy and Sell Stock',
          description: 'You are given an array of prices where prices[i] is the price on the ith day. Find the maximum profit.',
          examples: [
            { input: 'prices = [7,1,5,3,6,4]', output: '5' }
          ],
          topics: ['Array', 'Greedy'],
          timeLimit: 25,
          marks: 30
        },
        {
          id: 2,
          difficulty: 'Medium',
          category: 'Coding',
          language: 'JavaScript',
          title: 'Group Anagrams',
          description: 'Given an array of strings, group the anagrams together.',
          examples: [
            { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["eat","tea","ate"],["tan","nat"],["bat"]]' }
          ],
          topics: ['Hash Map', 'Sorting'],
          timeLimit: 30,
          marks: 30
        },
        {
          id: 3,
          difficulty: 'Medium',
          category: 'Coding',
          language: 'Python',
          title: 'Minimum Window Substring',
          description: 'Given two strings s and t, return the minimum window substring of s such that every character in t is included.',
          examples: [
            { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"' }
          ],
          topics: ['Sliding Window', 'Two Pointers'],
          timeLimit: 35,
          marks: 30
        }
      ]
    }
  };

  // --- APPLICATION LOGIC ---
  const handleOpenApply = (exam) => {
    setSelectedExam(exam);
    setIsApplyModalOpen(true);
  };

  const handleViewQuestions = (exam) => {
    setSelectedQuestionExam(examQuestions[exam.id] || null);
    setIsViewQuestionsOpen(true);
  };

  const handlePostToHR = () => {
    alert(`Application for ${selectedExam.title} at ${selectedExam.company} has been sent to the HR Department!`);
    setIsApplyModalOpen(false);
  };

  const downloadApplicationPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Job Application Form", 20, 20);
    doc.setFontSize(12);
    doc.text(`Company: ${selectedExam.company}`, 20, 40);
    doc.text(`Position: ${selectedExam.title}`, 20, 50);
    doc.text(`Candidate: ${applicationData.fullName}`, 20, 70);
    doc.text(`Email: ${applicationData.email}`, 20, 80);
    doc.text(`Portfolio: ${applicationData.portfolio}`, 20, 90);
    doc.text(`Resume Link: ${applicationData.resumeLink}`, 20, 100);
    doc.text(`Cover Letter:`, 20, 120);
    doc.text(applicationData.coverLetter, 20, 130, { maxWidth: 170 });
    doc.save(`${applicationData.fullName}_${selectedExam.company}_Application.pdf`);
  };

  const getFilteredExams = () => {
    const sourceExams = Array.isArray(exams) && exams.length > 0 ? exams : mockExams;
    let filtered = sourceExams;
    if (selectedCategory !== 'all') filtered = filtered.filter(exam => exam.category === selectedCategory);
    if (searchQuery) {
      filtered = filtered.filter(exam =>
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.company.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDaysRemaining = (deadline) => Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));

  const renderAvailableExams = () => {
    const filteredExams = getFilteredExams();
    const upcomingExams = filteredExams.filter(exam => new Date(exam.deadline) > new Date());

    return (
      <div className="grid grid-cols-1 gap-6">
        {upcomingExams.map(exam => (
          <div key={exam.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(exam.difficulty)}`}>{exam.difficulty}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">{exam.company}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{exam.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{exam.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"><Clock size={16} /><span>{exam.duration} mins</span></div>
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"><Target size={16} /><span>{exam.maxMarks} Marks</span></div>
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"><Calendar size={16} /><span>{getDaysRemaining(new Date(exam.deadline))} days left</span></div>
                </div>
                {/* Placement Rounds Info */}
                <div className="mt-2 mb-2">
                  <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold mr-2">Placement Round</span>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Coding Test Included</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-6">
                <button onClick={() => handleOpenApply(exam)} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold flex items-center gap-2">
                  <Briefcase size={16} /> Apply Job
                </button>
                <button onClick={() => handleViewQuestions(exam)} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-semibold flex items-center gap-2">
                  <BookOpen size={16} /> Solve Coding Test
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold">Start Exam</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAttemptedExams = () => (
    <div className="grid grid-cols-1 gap-6">
      {submissions.map(submission => (
        <div key={submission.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-4">{submission.examTitle}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Score</p>
              <p className="text-xl font-bold text-blue-600">{submission.score}/{submission.maxScore}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Percentile</p>
              <p className="text-xl font-bold text-green-600">{submission.percentile}%</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Career Portal</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-md">
        <button onClick={() => setActiveTab('available')} className={`flex-1 py-3 rounded-lg font-bold ${activeTab === 'available' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Available Exams & Jobs</button>
        <button onClick={() => setActiveTab('attempted')} className={`flex-1 py-3 rounded-lg font-bold ${activeTab === 'attempted' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>My Submissions</button>
      </div>

      {activeTab === 'available' && renderAvailableExams()}
      {activeTab === 'attempted' && renderAttemptedExams()}

      {/* --- QUESTIONS MODAL --- */}
      {isViewQuestionsOpen && selectedQuestionExam && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedQuestionExam.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  {selectedQuestionExam.company} • {selectedQuestionExam.type} • {selectedQuestionExam.totalQuestions} Questions
                </p>
              </div>
              <button onClick={() => setIsViewQuestionsOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {selectedQuestionExam.questions.map((question, idx) => (
                <div 
                  key={question.id} 
                  className="border-l-4 border-blue-500 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-5 cursor-pointer hover:border-blue-700 transition-all"
                  onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
                >
                  {/* Question Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex gap-3 items-center mb-2">
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">Q{idx + 1}.</span>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{question.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          question.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                          question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {question.difficulty}
                        </span>
                      </div>
                      {question.category && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Category: {question.category}</p>
                      )}
                      {question.language && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Language: {question.language}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600 dark:text-blue-400">{question.marks} marks</p>
                      {question.timeLimit && <p className="text-xs text-gray-600">{question.timeLimit} min</p>}
                    </div>
                  </div>

                  {/* Expandable Details */}
                  {expandedQuestion === question.id && (
                    <div className="mt-4 space-y-4 pt-4 border-t border-gray-300 dark:border-gray-700">
                      {/* Description */}
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Description</h4>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{question.description}</p>
                      </div>

                      {/* Examples for Coding Questions */}
                      {question.examples && question.examples.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Examples</h4>
                          <div className="space-y-3 bg-gray-800 dark:bg-gray-950 rounded-lg p-4">
                            {question.examples.map((example, exIdx) => (
                              <div key={exIdx} className="text-gray-100 font-mono text-sm">
                                <p className="text-green-400">Input: {example.input}</p>
                                <p className="text-blue-400">Output: {example.output}</p>
                                {example.explanation && (
                                  <p className="text-yellow-300 text-xs mt-1">Explanation: {example.explanation}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Topics */}
                      {question.topics && (
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Topics</h4>
                          <div className="flex flex-wrap gap-2">
                            {question.topics.map((topic, tIdx) => (
                              <span key={tIdx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Constraints */}
                      {question.constraints && (
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Constraints</h4>
                          <ul className="space-y-1 text-gray-700 dark:text-gray-300 text-sm">
                            {question.constraints.map((constraint, cIdx) => (
                              <li key={cIdx} className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{constraint}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Multiple Choice Options */}
                      {question.options && question.options.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Options</h4>
                          <div className="space-y-2">
                            {question.options.map((option, oIdx) => (
                              <div 
                                key={oIdx} 
                                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                  oIdx === question.correctAnswer 
                                    ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300' 
                                    : 'bg-gray-100 dark:bg-gray-900/50 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                <input type="radio" name={`q${question.id}`} disabled />
                                <label className="ml-2">{option}</label>
                                {oIdx === question.correctAnswer && <span className="ml-2 text-green-600 font-bold">✓ Correct</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Explanation */}
                      {question.explanation && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Explanation</h4>
                          <p className="text-blue-700 dark:text-blue-200 text-sm">{question.explanation}</p>
                        </div>
                      )}

                      {/* Key Points for Behavioral */}
                      {question.keyPoints && (
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Key Points to Consider</h4>
                          <ul className="space-y-2">
                            {question.keyPoints.map((point, pIdx) => (
                              <li key={pIdx} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                                <span className="text-blue-600 font-bold mt-1">→</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Click to expand indicator */}
                  <div className="text-right mt-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {expandedQuestion === question.id ? '▼ Click to collapse' : '▶ Click to expand'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button onClick={() => setIsViewQuestionsOpen(false)} className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600">
                Close
              </button>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2">
                <Download size={18} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- APPLICATION MODAL --- */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Job Application</h2>
                <p className="text-blue-600 font-medium">{selectedExam?.company} • {selectedExam?.title}</p>
              </div>
              <button onClick={() => setIsApplyModalOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold flex items-center gap-2"><User size={14}/> Full Name</label>
                  <input type="text" className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700" value={applicationData.fullName} onChange={(e) => setApplicationData({...applicationData, fullName: e.target.value})} placeholder="John Doe" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold flex items-center gap-2"><Mail size={14}/> Email Address</label>
                  <input type="email" className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700" value={applicationData.email} onChange={(e) => setApplicationData({...applicationData, email: e.target.value})} placeholder="john@example.com" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold flex items-center gap-2"><LinkIcon size={14}/> Resume Link (Google Drive/Dropbox)</label>
                <input type="text" className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700" value={applicationData.resumeLink} onChange={(e) => setApplicationData({...applicationData, resumeLink: e.target.value})} placeholder="https://..." />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold flex items-center gap-2"><LinkIcon size={14}/> Portfolio/GitHub Link</label>
                <input type="text" className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700" value={applicationData.portfolio} onChange={(e) => setApplicationData({...applicationData, portfolio: e.target.value})} placeholder="https://github.com/..." />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold">Cover Letter / Statement of Purpose</label>
                <textarea rows="4" className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700" value={applicationData.coverLetter} onChange={(e) => setApplicationData({...applicationData, coverLetter: e.target.value})} placeholder="Explain why you are a good fit..."></textarea>
              </div>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 justify-end">
              <button onClick={downloadApplicationPDF} className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg font-bold hover:bg-gray-300">
                <Download size={18} /> Download Draft
              </button>
              <button onClick={handlePostToHR} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30">
                <Send size={18} /> Post Application to HR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamPapers;