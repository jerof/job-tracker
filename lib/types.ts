export type ApplicationStatus = 'saved' | 'applied' | 'interviewing' | 'offer' | 'closed';

export type CloseReason = 'rejected' | 'withdrawn' | 'ghosted' | 'accepted';

export interface Application {
  id: string;
  company: string;
  role: string | null;
  location: string | null;
  status: ApplicationStatus;
  closeReason: CloseReason | null;
  appliedDate: string | null;
  sourceEmailId: string | null;
  jobUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: ApplicationStatus;
  title: string;
  applications: Application[];
}

export interface Stats {
  total: number;
  responseRate: number;
  byStatus: Record<ApplicationStatus, number>;
}

// Mock data for development
export const MOCK_APPLICATIONS: Application[] = [
  {
    id: '0',
    company: 'OpenAI',
    role: 'Research Engineer',
    location: 'San Francisco, CA',
    status: 'saved',
    closeReason: null,
    appliedDate: null,
    sourceEmailId: null,
    jobUrl: 'https://openai.com/careers/research-engineer',
    notes: 'Found on Twitter, looks interesting',
    createdAt: '2025-12-28T10:00:00Z',
    updatedAt: '2025-12-28T10:00:00Z',
  },
  {
    id: '1',
    company: 'Stripe',
    role: 'Senior Software Engineer',
    location: 'San Francisco, CA',
    status: 'applied',
    closeReason: null,
    appliedDate: '2025-12-20',
    sourceEmailId: null,
    jobUrl: null,
    notes: null,
    createdAt: '2025-12-20T10:00:00Z',
    updatedAt: '2025-12-20T10:00:00Z',
  },
  {
    id: '2',
    company: 'Notion',
    role: 'Frontend Engineer',
    location: 'New York, NY',
    status: 'applied',
    closeReason: null,
    appliedDate: '2025-12-22',
    sourceEmailId: null,
    jobUrl: null,
    notes: null,
    createdAt: '2025-12-22T10:00:00Z',
    updatedAt: '2025-12-22T10:00:00Z',
  },
  {
    id: '3',
    company: 'Vercel',
    role: 'Full Stack Developer',
    location: 'Remote',
    status: 'applied',
    closeReason: null,
    appliedDate: '2025-12-23',
    sourceEmailId: null,
    jobUrl: null,
    notes: null,
    createdAt: '2025-12-23T10:00:00Z',
    updatedAt: '2025-12-23T10:00:00Z',
  },
  {
    id: '4',
    company: 'Google',
    role: 'Product Manager',
    location: 'Mountain View, CA',
    status: 'interviewing',
    closeReason: null,
    appliedDate: '2025-12-15',
    sourceEmailId: null,
    jobUrl: null,
    notes: 'Phone screen scheduled for Dec 30',
    createdAt: '2025-12-15T10:00:00Z',
    updatedAt: '2025-12-25T10:00:00Z',
  },
  {
    id: '5',
    company: 'Linear',
    role: 'Design Engineer',
    location: 'Remote',
    status: 'interviewing',
    closeReason: null,
    appliedDate: '2025-12-18',
    sourceEmailId: null,
    jobUrl: null,
    notes: null,
    createdAt: '2025-12-18T10:00:00Z',
    updatedAt: '2025-12-24T10:00:00Z',
  },
  {
    id: '6',
    company: 'Anthropic',
    role: 'ML Engineer',
    location: 'San Francisco, CA',
    status: 'offer',
    closeReason: null,
    appliedDate: '2025-12-10',
    sourceEmailId: null,
    jobUrl: null,
    notes: 'Offer received! Reviewing terms',
    createdAt: '2025-12-10T10:00:00Z',
    updatedAt: '2025-12-27T10:00:00Z',
  },
  {
    id: '7',
    company: 'Meta',
    role: 'Software Engineer',
    location: 'Menlo Park, CA',
    status: 'closed',
    closeReason: 'rejected',
    appliedDate: '2025-12-05',
    sourceEmailId: null,
    jobUrl: null,
    notes: null,
    createdAt: '2025-12-05T10:00:00Z',
    updatedAt: '2025-12-20T10:00:00Z',
  },
  {
    id: '8',
    company: 'Amazon',
    role: 'SDE II',
    location: 'Seattle, WA',
    status: 'closed',
    closeReason: 'withdrawn',
    appliedDate: '2025-12-01',
    sourceEmailId: null,
    jobUrl: null,
    notes: 'Withdrew after Anthropic offer',
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2025-12-27T10:00:00Z',
  },
];
