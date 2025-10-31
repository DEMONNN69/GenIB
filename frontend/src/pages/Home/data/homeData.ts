import { 
  Book, 
  MessageQuestion, 
  DocumentText, 
  Chart 
} from 'iconsax-react';
import { ComponentType } from 'react';

export interface Stat {
  label: string;
  value: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: ComponentType<any>;
  link: string;
  color: string;
}

export const homeStats: Stat[] = [
  { label: 'Past Papers', value: '2,500+' },
  { label: 'Questions', value: '50,000+' },
  { label: 'Active Users', value: '10,000+' },
  { label: 'Success Rate', value: '94%' }
];

export const homeFeatures: Feature[] = [
  {
    title: 'Past Papers Library',
    description: 'Access thousands of IB past papers with detailed mark schemes and examiner reports',
    icon: Book,
    link: '/papers',
    color: 'from-blue-500 to-blue-600'
  },
  {
    title: 'Question Bank',
    description: 'Practice with curated question collections organized by topic and difficulty',
    icon: MessageQuestion,
    link: '/questions',
    color: 'from-green-500 to-green-600'
  },
  {
    title: 'Exam Builder',
    description: 'Create custom practice exams tailored to your study needs',
    icon: DocumentText,
    link: '/exam-builder',
    color: 'from-purple-500 to-purple-600'
  },
  {
    title: 'Performance Analytics',
    description: 'Track your progress with detailed analytics and personalized insights',
    icon: Chart,
    link: '/analytics',
    color: 'from-orange-500 to-orange-600'
  }
];