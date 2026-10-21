export type RiasecKey = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export interface RiasecInfo {
  code: RiasecKey;
  nameEn: string;
  nameVi: string;
  color: string;
  bgColor: string;
  descriptionVi: string;
  traits: string[];
}

export const RIASEC_MAP: Record<RiasecKey, RiasecInfo> = {
  R: {
    code: 'R',
    nameEn: 'Realistic',
    nameVi: 'Realistic / Technical',
    color: '#E05345',
    bgColor: '#FFEBEE',
    descriptionVi: 'Prefers working with machines, tools, practical materials, and outdoor physical activities.',
    traits: ['Practical', 'Resourceful', 'Skilled', 'Mechanical', 'Persistent']
  },
  I: {
    code: 'I',
    nameEn: 'Investigative',
    nameVi: 'Investigative / Research',
    color: '#2563EB',
    bgColor: '#EFF6FF',
    descriptionVi: 'Enjoys scientific research, discovering principles, and solving problems using logical and abstract thinking.',
    traits: ['Analytical', 'Logical', 'Intellectual', 'Curious', 'Independent']
  },
  A: {
    code: 'A',
    nameEn: 'Artistic',
    nameVi: 'Artistic / Creative',
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    descriptionVi: 'Loves creative expressions, imaginative concepts, aesthetics, and expressing individuality freely.',
    traits: ['Creative', 'Intuitive', 'Expressive', 'Original', 'Free-spirited']
  },
  S: {
    code: 'S',
    nameEn: 'Social',
    nameVi: 'Social / Helping',
    color: '#059669',
    bgColor: '#ECFDF5',
    descriptionVi: 'Enjoys communicating, helping, teaching, mentoring, healing, and serving the community.',
    traits: ['Sociable', 'Empathetic', 'Cooperative', 'Supportive', 'Passionate']
  },
  E: {
    code: 'E',
    nameEn: 'Enterprising',
    nameVi: 'Enterprising / Leadership',
    color: '#D97706',
    bgColor: '#FFFBEB',
    descriptionVi: 'Enjoys leadership, entrepreneurship, negotiating, and persuading others to achieve organizational goals.',
    traits: ['Decisive', 'Confident', 'Persuasive', 'Leadership', 'Goal-oriented']
  },
  C: {
    code: 'C',
    nameEn: 'Conventional',
    nameVi: 'Conventional / Structured',
    color: '#475569',
    bgColor: '#F1F5F9',
    descriptionVi: 'Prefers working with data, numbers, detailed procedures, records, and structured workflows.',
    traits: ['Organized', 'Detail-oriented', 'Accurate', 'Disciplined', 'Reliable']
  },
};

export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: 'STUDENT' | 'ADMIN';
  dreamWork?: string | null;
  avatarUrl?: string | null;
  status?: string;
  createdAt?: string;
}

export interface Occupation {
  id: number;
  jobName: string;
  description?: string | null;
  riasecCode: string; // e.g. "RIA"
  mainCode: string;   // e.g. "R"
  interestId?: number | null;
  education?: string | null;
  taskRaw?: string | null;
  skillsRaw?: string | null;
  imageName?: string | null;
  viewCount: number;
  isSaved?: boolean;
}

export interface Question {
  id: string;
  content: string;
  type: RiasecKey;
}

export interface TestResult {
  id?: string;
  resultCode: string;
  scores: Record<RiasecKey, number>;
  primaryType?: string;
  recommendedJobs?: Occupation[];
  testedAt?: string;
  user?: User;
}

export interface TestHistoryItem {
  id: string;
  userId: string;
  resultCode: string;
  scores: Record<RiasecKey, number>;
  testedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isTyping?: boolean;
}

export interface FeedbackItem {
  id?: string;
  content: string;
  rating: number;
  createdAt?: string;
}
