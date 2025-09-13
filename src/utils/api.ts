// Mock API functions that simulate Django REST Framework endpoints
// Easy to replace with actual fetch calls later

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data
const mockQuestions = [
  {
    id: 1,
    title: "Photosynthesis Process",
    subject: "Biology",
    curriculum: "Cambridge IGCSE",
    year: 2023,
    season: "May/June",
    difficulty: "Medium",
    content: "Explain the process of photosynthesis and its importance in the ecosystem.",
    answer: "Photosynthesis is the process by which green plants convert light energy into chemical energy...",
    isFavorite: false
  },
  {
    id: 2,
    title: "Quadratic Equations",
    subject: "Mathematics",
    curriculum: "Cambridge IGCSE",
    year: 2023,
    season: "Oct/Nov",
    difficulty: "Hard",
    content: "Solve the quadratic equation: 2x² + 5x - 3 = 0",
    answer: "Using the quadratic formula: x = (-5 ± √(25 + 24))/4 = (-5 ± 7)/4...",
    isFavorite: true
  },
  {
    id: 3,
    title: "Shakespeare's Themes",
    subject: "English Literature",
    curriculum: "Cambridge A-Level",
    year: 2022,
    season: "May/June",
    difficulty: "Medium",
    content: "Analyze the theme of appearance vs reality in Hamlet.",
    answer: "Shakespeare explores the theme of appearance versus reality throughout Hamlet...",
    isFavorite: false
  }
];

const mockPapers = [
  {
    id: 1,
    title: "Biology Paper 1",
    subject: "Biology",
    curriculum: "Cambridge IGCSE",
    year: 2023,
    season: "May/June",
    duration: 45,
    questions: [1],
    isFavorite: false
  },
  {
    id: 2,
    title: "Mathematics Paper 2",
    subject: "Mathematics",
    curriculum: "Cambridge IGCSE",
    year: 2023,
    season: "Oct/Nov",
    duration: 90,
    questions: [2],
    isFavorite: true
  }
];

const mockExams = [
  {
    id: 1,
    name: "Biology Practice Test",
    questions: [1],
    createdAt: "2024-01-15",
    status: "draft"
  }
];

const mockProfile = {
  id: 1,
  name: "John Smith",
  email: "john@example.com",
  curriculum: "Cambridge IGCSE",
  subjects: ["Biology", "Mathematics", "English Literature"],
  totalQuestionsSolved: 145,
  favoriteCount: 23,
  createdExams: 5
};

// API functions
export const fetchQuestions = async (filters: any = {}) => {
  await delay(500);
  let filtered = [...mockQuestions];
  
  if (filters.subject) {
    filtered = filtered.filter(q => q.subject === filters.subject);
  }
  if (filters.curriculum) {
    filtered = filtered.filter(q => q.curriculum === filters.curriculum);
  }
  if (filters.year) {
    filtered = filtered.filter(q => q.year === parseInt(filters.year));
  }
  if (filters.season) {
    filtered = filtered.filter(q => q.season === filters.season);
  }
  
  return filtered;
};

export const fetchQuestionById = async (id: string | number) => {
  await delay(300);
  return mockQuestions.find(q => q.id === parseInt(id.toString()));
};

export const fetchPapers = async (filters: any = {}) => {
  await delay(500);
  let filtered = [...mockPapers];
  
  if (filters.subject) {
    filtered = filtered.filter(p => p.subject === filters.subject);
  }
  if (filters.curriculum) {
    filtered = filtered.filter(p => p.curriculum === filters.curriculum);
  }
  if (filters.year) {
    filtered = filtered.filter(p => p.year === parseInt(filters.year));
  }
  
  return filtered;
};

export const fetchPaperById = async (id: string | number) => {
  await delay(300);
  return mockPapers.find(p => p.id === parseInt(id.toString()));
};

export const fetchExams = async () => {
  await delay(400);
  return [...mockExams];
};

export const fetchProfile = async () => {
  await delay(300);
  return { ...mockProfile };
};

export const fetchFavorites = async () => {
  await delay(400);
  const favoriteQuestions = mockQuestions.filter(q => q.isFavorite);
  const favoritePapers = mockPapers.filter(p => p.isFavorite);
  return { questions: favoriteQuestions, papers: favoritePapers };
};

export const toggleFavorite = async (type: string, id: number) => {
  await delay(200);
  if (type === 'question') {
    const question = mockQuestions.find(q => q.id === id);
    if (question) question.isFavorite = !question.isFavorite;
  } else if (type === 'paper') {
    const paper = mockPapers.find(p => p.id === id);
    if (paper) paper.isFavorite = !paper.isFavorite;
  }
  return true;
};

export const createExam = async (examData: any) => {
  await delay(500);
  const newExam = {
    id: mockExams.length + 1,
    ...examData,
    createdAt: new Date().toISOString().split('T')[0],
    status: 'draft'
  };
  mockExams.push(newExam);
  return newExam;
};

export const updateProfile = async (profileData: any) => {
  await delay(400);
  Object.assign(mockProfile, profileData);
  return mockProfile;
};

export const loginUser = async (credentials: any) => {
  await delay(600);
  // Mock authentication
  return {
    user: mockProfile,
    token: 'mock-jwt-token'
  };
};

export const registerUser = async (userData: any) => {
  await delay(700);
  // Mock registration
  return {
    user: { ...mockProfile, ...userData },
    token: 'mock-jwt-token'
  };
};