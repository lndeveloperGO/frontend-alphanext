// Users
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  avatar?: string;
  createdAt: string;
}

export const users: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@edulearn.com', role: 'admin', status: 'active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', createdAt: '2024-01-01' },
  { id: '2', name: 'John Student', email: 'john@example.com', role: 'user', status: 'active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john', createdAt: '2024-01-15' },
  { id: '3', name: 'Jane Doe', email: 'jane@example.com', role: 'user', status: 'active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane', createdAt: '2024-02-01' },
  { id: '4', name: 'Mike Wilson', email: 'mike@example.com', role: 'user', status: 'inactive', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', createdAt: '2024-02-15' },
  { id: '5', name: 'Sarah Brown', email: 'sarah@example.com', role: 'user', status: 'active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', createdAt: '2024-03-01' },
];

// Questions
export interface QuestionOption {
  id: string;
  text: string;
  score: number;
}

export interface Question {
  id: string;
  text: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  options: QuestionOption[];
  correctOptionId: string;
  explanation?: string;
  createdAt: string;
}

export const questions: Question[] = [
  {
    id: '1',
    text: 'What is the capital of Indonesia?',
    category: 'Geography',
    difficulty: 'easy',
    options: [
      { id: 'a', text: 'Jakarta', score: 10 },
      { id: 'b', text: 'Surabaya', score: 0 },
      { id: 'c', text: 'Bandung', score: 0 },
      { id: 'd', text: 'Medan', score: 0 },
    ],
    correctOptionId: 'a',
    explanation: 'Jakarta is the capital and largest city of Indonesia.',
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    text: 'What is 15 × 12?',
    category: 'Mathematics',
    difficulty: 'easy',
    options: [
      { id: 'a', text: '160', score: 0 },
      { id: 'b', text: '180', score: 10 },
      { id: 'c', text: '170', score: 0 },
      { id: 'd', text: '190', score: 0 },
    ],
    correctOptionId: 'b',
    explanation: '15 × 12 = 180',
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    text: 'Which planet is known as the Red Planet?',
    category: 'Science',
    difficulty: 'easy',
    options: [
      { id: 'a', text: 'Venus', score: 0 },
      { id: 'b', text: 'Jupiter', score: 0 },
      { id: 'c', text: 'Mars', score: 10 },
      { id: 'd', text: 'Saturn', score: 0 },
    ],
    correctOptionId: 'c',
    explanation: 'Mars is called the Red Planet due to its reddish appearance.',
    createdAt: '2024-01-11',
  },
  {
    id: '4',
    text: 'What is the chemical symbol for Gold?',
    category: 'Science',
    difficulty: 'medium',
    options: [
      { id: 'a', text: 'Go', score: 0 },
      { id: 'b', text: 'Gd', score: 0 },
      { id: 'c', text: 'Au', score: 15 },
      { id: 'd', text: 'Ag', score: 0 },
    ],
    correctOptionId: 'c',
    explanation: 'Au comes from the Latin word "aurum" meaning gold.',
    createdAt: '2024-01-12',
  },
  {
    id: '5',
    text: 'Who wrote "Romeo and Juliet"?',
    category: 'Literature',
    difficulty: 'easy',
    options: [
      { id: 'a', text: 'Charles Dickens', score: 0 },
      { id: 'b', text: 'William Shakespeare', score: 10 },
      { id: 'c', text: 'Jane Austen', score: 0 },
      { id: 'd', text: 'Mark Twain', score: 0 },
    ],
    correctOptionId: 'b',
    explanation: 'William Shakespeare wrote Romeo and Juliet around 1594-1596.',
    createdAt: '2024-01-13',
  },
  {
    id: '6',
    text: 'What is the derivative of x²?',
    category: 'Mathematics',
    difficulty: 'medium',
    options: [
      { id: 'a', text: 'x', score: 0 },
      { id: 'b', text: '2x', score: 15 },
      { id: 'c', text: 'x²', score: 0 },
      { id: 'd', text: '2', score: 0 },
    ],
    correctOptionId: 'b',
    explanation: 'Using the power rule: d/dx(x²) = 2x',
    createdAt: '2024-01-14',
  },
  {
    id: '7',
    text: 'What is the largest ocean on Earth?',
    category: 'Geography',
    difficulty: 'easy',
    options: [
      { id: 'a', text: 'Atlantic Ocean', score: 0 },
      { id: 'b', text: 'Indian Ocean', score: 0 },
      { id: 'c', text: 'Pacific Ocean', score: 10 },
      { id: 'd', text: 'Arctic Ocean', score: 0 },
    ],
    correctOptionId: 'c',
    explanation: 'The Pacific Ocean is the largest and deepest ocean.',
    createdAt: '2024-01-15',
  },
];

// Packages
export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // days
  features: string[];
  type: 'practice' | 'tryout' | 'bundle';
  questionCount: number;
  isActive: boolean;
  createdAt: string;
}

export const packages: Package[] = [
  {
    id: '1',
    name: 'Basic Practice',
    description: 'Access to basic practice questions',
    price: 50000,
    duration: 30,
    features: ['100+ Questions', 'Basic Analytics', 'Email Support'],
    type: 'practice',
    questionCount: 100,
    isActive: true,
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Pro Tryout',
    description: 'Complete tryout package with detailed analysis',
    price: 150000,
    duration: 60,
    features: ['500+ Questions', 'Advanced Analytics', 'Video Explanations', 'Priority Support'],
    type: 'tryout',
    questionCount: 500,
    isActive: true,
    createdAt: '2024-01-05',
  },
  {
    id: '3',
    name: 'Ultimate Bundle',
    description: 'Everything you need to succeed',
    price: 300000,
    duration: 90,
    features: ['1000+ Questions', 'All Materials', 'Personal Mentor', '24/7 Support', 'Certificate'],
    type: 'bundle',
    questionCount: 1000,
    isActive: true,
    createdAt: '2024-01-10',
  },
  {
    id: '4',
    name: 'Math Master',
    description: 'Focused mathematics practice',
    price: 75000,
    duration: 30,
    features: ['200+ Math Questions', 'Step-by-step Solutions', 'Formula Sheets'],
    type: 'practice',
    questionCount: 200,
    isActive: true,
    createdAt: '2024-01-15',
  },
];

// Vouchers
export interface Voucher {
  id: string;
  code: string;
  discount: number; // percentage
  maxUses: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
}

export const vouchers: Voucher[] = [
  { id: '1', code: 'WELCOME20', discount: 20, maxUses: 100, usedCount: 45, validFrom: '2024-01-01', validUntil: '2024-12-31', isActive: true, createdAt: '2024-01-01' },
  { id: '2', code: 'FLASH50', discount: 50, maxUses: 50, usedCount: 50, validFrom: '2024-02-01', validUntil: '2024-02-28', isActive: false, createdAt: '2024-02-01' },
  { id: '3', code: 'STUDENT15', discount: 15, maxUses: 200, usedCount: 78, validFrom: '2024-01-01', validUntil: '2024-12-31', isActive: true, createdAt: '2024-01-01' },
  { id: '4', code: 'NEWYEAR25', discount: 25, maxUses: 150, usedCount: 120, validFrom: '2024-01-01', validUntil: '2024-01-31', isActive: false, createdAt: '2024-01-01' },
];

// Materials
export interface Material {
  id: string;
  title: string;
  description: string;
  type: 'ebook' | 'video';
  category: string;
  url: string;
  thumbnail?: string;
  duration?: number; // minutes for video
  pages?: number; // for ebook
  createdAt: string;
}

export const materials: Material[] = [
  { id: '1', title: 'Mathematics Fundamentals', description: 'Complete guide to basic mathematics', type: 'ebook', category: 'Mathematics', url: '#', pages: 150, createdAt: '2024-01-01' },
  { id: '2', title: 'Physics Made Easy', description: 'Understanding physics concepts', type: 'video', category: 'Science', url: '#', duration: 120, createdAt: '2024-01-05' },
  { id: '3', title: 'English Grammar Guide', description: 'Master English grammar rules', type: 'ebook', category: 'Language', url: '#', pages: 200, createdAt: '2024-01-10' },
  { id: '4', title: 'History of Indonesia', description: 'Learn about Indonesian history', type: 'video', category: 'History', url: '#', duration: 90, createdAt: '2024-01-15' },
  { id: '5', title: 'Chemistry Basics', description: 'Introduction to chemistry', type: 'ebook', category: 'Science', url: '#', pages: 180, createdAt: '2024-01-20' },
  { id: '6', title: 'Geography World Tour', description: 'Explore world geography', type: 'video', category: 'Geography', url: '#', duration: 150, createdAt: '2024-01-25' },
];

// Tryouts
export interface Tryout {
  id: string;
  name: string;
  description: string;
  questionIds: string[];
  duration: number; // minutes
  startTime?: string;
  endTime?: string;
  type: string;
  maxParticipants?: number;
  currentParticipants: number;
  isActive: boolean;
  createdAt: string;
}

export const tryouts: Tryout[] = [
  { id: '1', name: 'Weekly Tryout #1', description: 'General knowledge test', questionIds: ['1', '2', '3', '4', '5'], duration: 60, type: 'regular', currentParticipants: 150, isActive: true, createdAt: '2024-01-01' },
]
// Rankings
export interface Ranking {
  id: string;
  rank: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // seconds
  tryoutId?: string;
  tryoutName?: string;
  createdAt: string;
}

export const rankings: Ranking[] = [
  { id: '1', rank: 1, userId: '2', userName: 'John Student', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john', score: 980, totalQuestions: 100, correctAnswers: 98, timeSpent: 3200, tryoutName: 'Weekly Tryout #1', createdAt: '2024-01-28' },
  { id: '2', rank: 2, userId: '3', userName: 'Jane Doe', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane', score: 950, totalQuestions: 100, correctAnswers: 95, timeSpent: 3400, tryoutName: 'Weekly Tryout #1', createdAt: '2024-01-28' },
  { id: '3', rank: 3, userId: '5', userName: 'Sarah Brown', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', score: 920, totalQuestions: 100, correctAnswers: 92, timeSpent: 3100, tryoutName: 'Weekly Tryout #1', createdAt: '2024-01-28' },
  { id: '4', rank: 4, userId: '4', userName: 'Mike Wilson', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', score: 890, totalQuestions: 100, correctAnswers: 89, timeSpent: 3600, tryoutName: 'Weekly Tryout #1', createdAt: '2024-01-28' },
];

// User Purchases
export interface Purchase {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  purchaseDate: string;
  expiryDate: string;
  status: 'active' | 'expired';
}

export const purchases: Purchase[] = [
  { id: '1', userId: '2', packageId: '1', packageName: 'Basic Practice', purchaseDate: '2024-01-15', expiryDate: '2024-02-15', status: 'active' },
  { id: '2', userId: '2', packageId: '2', packageName: 'Pro Tryout', purchaseDate: '2024-01-20', expiryDate: '2024-03-20', status: 'active' },
  { id: '3', userId: '3', packageId: '3', packageName: 'Ultimate Bundle', purchaseDate: '2024-01-10', expiryDate: '2024-04-10', status: 'active' },
];

// Practice History
export interface PracticeHistory {
  id: string;
  userId: string;
  type: 'practice' | 'tryout';
  name: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: string;
}

export const practiceHistory: PracticeHistory[] = [
  { id: '1', userId: '2', type: 'practice', name: 'Geography Practice', score: 85, totalQuestions: 20, correctAnswers: 17, timeSpent: 900, completedAt: '2024-01-25' },
  { id: '2', userId: '2', type: 'tryout', name: 'Weekly Tryout #1', score: 980, totalQuestions: 100, correctAnswers: 98, timeSpent: 3200, completedAt: '2024-01-28' },
  { id: '3', userId: '2', type: 'practice', name: 'Math Practice', score: 90, totalQuestions: 15, correctAnswers: 14, timeSpent: 720, completedAt: '2024-01-27' },
];

// Dashboard Stats
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalQuestions: number;
  totalPackages: number;
  totalRevenue: number;
  activeTryouts: number;
  totalMaterials: number;
}

export const adminDashboardStats: DashboardStats = {
  totalUsers: 1250,
  activeUsers: 890,
  totalQuestions: 5000,
  totalPackages: 12,
  totalRevenue: 45000000,
  activeTryouts: 5,
  totalMaterials: 50,
};

export interface UserDashboardStats {
  purchasedPackages: number;
  completedPractices: number;
  completedTryouts: number;
  averageScore: number;
  currentRank: number;
  totalStudyTime: number; // minutes
}

export const userDashboardStats: UserDashboardStats = {
  purchasedPackages: 3,
  completedPractices: 25,
  completedTryouts: 8,
  averageScore: 87,
  currentRank: 15,
  totalStudyTime: 1200,
};
