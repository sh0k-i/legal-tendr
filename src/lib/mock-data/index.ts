// Mock data for LegalTendr application

export interface User {
  user_id: string;
  email: string;
  password_hash: string;
  phone_number?: string;
  user_type: 'client' | 'lawyer' | 'admin';
  first_name: string;
  last_name: string;
  profile_picture_url?: string;
  city: string;
  province: string;
  created_at: string;
  updated_at: string;
}

export interface Lawyer {
  lawyer_id: string;
  bio?: string;
  matches_count: number;
  rating: number;
  reviews: number;
  hourly_rate: number;
  years_of_experience: number;
  created_at: string;
  updated_at: string;
}

export interface Client {
  client_id: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface LawyerServiceArea {
  id: string;
  lawyer_id: string;
  zip_code: string;
}

export interface Zip {
  id: string;
  city: string;
  province: string;
}

export interface Specialty {
  specialty_id: string;
  name: string;
  description?: string;
}

export interface LawyerSpecialty {
  lawyer_id: string;
  specialty_id: string;
}

export interface Case {
  case_id: string;
  client_id: string;
  title: string;
  description: string;
  case_category_ids: string[];
  hired_lawyer_id?: string;
  status: 'open' | 'in_progress' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface Match {
  match_id: string;
  client_id: string;
  lawyer_id: string;
  created_at: string;
  is_mutual: boolean;
}

export interface Conversation {
  conversation_id: string;
  client_id: string;
  lawyer_id: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  timestamp: string;
  is_read: boolean;
}

// Mock users
export const mockUsers: User[] = [
  {
    user_id: "c1",
    email: "johndoe@example.com",
    password_hash: "hashedpassword1",
    phone_number: "555-123-4567",
    user_type: "client",
    first_name: "John",
    last_name: "Doe",
    profile_picture_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces&q=80",
    city: "Toronto",
    province: "Ontario",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    user_id: "l1",
    email: "janesmith@example.com",
    password_hash: "hashedpassword2",
    phone_number: "555-234-5678",
    user_type: "lawyer",
    first_name: "Jane",
    last_name: "Smith",
    profile_picture_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces&q=80",
    city: "Vancouver",
    province: "British Columbia",
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z"
  },
  {
    user_id: "l2",
    email: "michaelbrown@example.com",
    password_hash: "hashedpassword3",
    phone_number: "555-345-6789",
    user_type: "lawyer",
    first_name: "Michael",
    last_name: "Brown",
    profile_picture_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces&q=80",
    city: "Calgary",
    province: "Alberta",
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-03T00:00:00Z"
  },
  {
    user_id: "l3",
    email: "emilywilson@example.com",
    password_hash: "hashedpassword4",
    phone_number: "555-456-7890",
    user_type: "lawyer",
    first_name: "Emily",
    last_name: "Wilson",
    profile_picture_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1a?w=200&h=200&fit=crop&crop=faces&q=80",
    city: "Montreal",
    province: "Quebec",
    created_at: "2024-01-04T00:00:00Z",
    updated_at: "2024-01-04T00:00:00Z"
  },
  {
    user_id: "c2",
    email: "robertjohnson@example.com",
    password_hash: "hashedpassword5",
    phone_number: "555-567-8901",
    user_type: "client",
    first_name: "Robert",
    last_name: "Johnson",
    profile_picture_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1a?w=200&h=200&fit=crop&crop=faces&q=80",
    city: "Ottawa",
    province: "Ontario",
    created_at: "2024-01-05T00:00:00Z",
    updated_at: "2024-01-05T00:00:00Z"
  }
];

// Mock lawyers
export const mockLawyers: Lawyer[] = [
  {
    lawyer_id: "l1",
    bio: "Experienced family law attorney with 10+ years of experience helping families navigate difficult legal situations.",
    matches_count: 15,
    rating: 4.8,
    reviews: 42,
    hourly_rate: 250,
    years_of_experience: 12,
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z"
  },
  {
    lawyer_id: "l2",
    bio: "Corporate lawyer specializing in startup law, venture capital, and mergers & acquisitions.",
    matches_count: 8,
    rating: 4.5,
    reviews: 24,
    hourly_rate: 300,
    years_of_experience: 8,
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-03T00:00:00Z"
  },
  {
    lawyer_id: "l3",
    bio: "Immigration attorney with expertise in work visas, permanent residency applications, and citizenship.",
    matches_count: 12,
    rating: 4.9,
    reviews: 36,
    hourly_rate: 275,
    years_of_experience: 15,
    created_at: "2024-01-04T00:00:00Z",
    updated_at: "2024-01-04T00:00:00Z"
  }
];

// Mock clients
export const mockClients: Client[] = [
  {
    client_id: "c1",
    bio: "Looking for legal assistance with my family matters.",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    client_id: "c2",
    bio: "Entrepreneur seeking legal advice for my new business venture.",
    created_at: "2024-01-05T00:00:00Z",
    updated_at: "2024-01-05T00:00:00Z"
  }
];

// Mock specialties
export const mockSpecialties: Specialty[] = [
  {
    specialty_id: "s1",
    name: "Family Law",
    description: "Legal matters involving family relationships, such as divorce, child custody, and adoption."
  },
  {
    specialty_id: "s2",
    name: "Corporate Law",
    description: "Legal practice area encompassing issues that impact a corporation."
  },
  {
    specialty_id: "s3",
    name: "Immigration Law",
    description: "Legal matters concerning immigration to and naturalization in a country."
  },
  {
    specialty_id: "s4",
    name: "Real Estate Law",
    description: "Legal aspects of property rights, land use, and real estate transactions."
  },
  {
    specialty_id: "s5",
    name: "Criminal Law",
    description: "Laws and punishments established by the state or federal government."
  }
];

// Mock lawyer specialties
export const mockLawyerSpecialties: LawyerSpecialty[] = [
  { lawyer_id: "l1", specialty_id: "s1" },
  { lawyer_id: "l1", specialty_id: "s4" },
  { lawyer_id: "l2", specialty_id: "s2" },
  { lawyer_id: "l2", specialty_id: "s4" },
  { lawyer_id: "l3", specialty_id: "s3" },
  { lawyer_id: "l3", specialty_id: "s1" }
];

// Mock cases
export const mockCases: Case[] = [
  {
    case_id: "case1",
    client_id: "c1",
    title: "Divorce Settlement",
    description: "Need assistance with negotiating a fair divorce settlement and child custody arrangement.",
    case_category_ids: ["s1"],
    status: "open",
    created_at: "2024-02-15T00:00:00Z",
    updated_at: "2024-02-15T00:00:00Z"
  },
  {
    case_id: "case2",
    client_id: "c1",
    title: "Property Purchase",
    description: "Looking for legal review of a residential property purchase agreement.",
    case_category_ids: ["s4"],
    status: "in_progress",
    hired_lawyer_id: "l1",
    created_at: "2024-03-01T00:00:00Z",
    updated_at: "2024-03-05T00:00:00Z"
  },
  {
    case_id: "case3",
    client_id: "c2",
    title: "Startup Incorporation",
    description: "Need help with incorporating my tech startup and drafting founder agreements.",
    case_category_ids: ["s2"],
    status: "open",
    created_at: "2024-03-10T00:00:00Z",
    updated_at: "2024-03-10T00:00:00Z"
  }
];

// Mock matches
export const mockMatches: Match[] = [
  {
    match_id: "m1",
    client_id: "c1",
    lawyer_id: "l1",
    created_at: "2024-02-20T00:00:00Z",
    is_mutual: true
  },
  {
    match_id: "m2",
    client_id: "c1",
    lawyer_id: "l3",
    created_at: "2024-02-25T00:00:00Z",
    is_mutual: false
  },
  {
    match_id: "m3",
    client_id: "c2",
    lawyer_id: "l2",
    created_at: "2024-03-12T00:00:00Z",
    is_mutual: true
  }
];

// Mock conversations
export const mockConversations: Conversation[] = [
  {
    conversation_id: "conv1",
    client_id: "c1",
    lawyer_id: "l1",
    created_at: "2024-02-21T00:00:00Z",
    updated_at: "2024-03-15T00:00:00Z"
  },
  {
    conversation_id: "conv2",
    client_id: "c2",
    lawyer_id: "l2",
    created_at: "2024-03-13T00:00:00Z",
    updated_at: "2024-03-18T00:00:00Z"
  }
];

// Mock messages
export const mockMessages: Message[] = [
  {
    message_id: "msg1",
    conversation_id: "conv1",
    sender_id: "c1",
    content: "Hello, I need help with my divorce case. Are you available for a consultation?",
    timestamp: "2024-02-21T10:00:00Z",
    is_read: true
  },
  {
    message_id: "msg2",
    conversation_id: "conv1",
    sender_id: "l1",
    content: "Hello! Yes, I'd be happy to help with your divorce case. I have availability next week for a consultation.",
    timestamp: "2024-02-21T10:15:00Z",
    is_read: true
  },
  {
    message_id: "msg3",
    conversation_id: "conv1",
    sender_id: "c1",
    content: "That would be great. What documents should I prepare for our consultation?",
    timestamp: "2024-02-21T10:30:00Z",
    is_read: true
  },
  {
    message_id: "msg4",
    conversation_id: "conv1",
    sender_id: "l1",
    content: "Please bring any existing marriage agreements, property documentation, and a list of assets. This will help us get started efficiently.",
    timestamp: "2024-02-21T10:45:00Z",
    is_read: true
  },
  {
    message_id: "msg5",
    conversation_id: "conv1",
    sender_id: "l1",
    content: "Also, if you have any specific concerns or questions, please write them down so we can address them during our meeting.",
    timestamp: "2024-03-15T09:00:00Z",
    is_read: false
  },
  {
    message_id: "msg6",
    conversation_id: "conv2",
    sender_id: "c2",
    content: "Hi, I'm looking to incorporate my startup. Can you help with the legal paperwork?",
    timestamp: "2024-03-13T14:00:00Z",
    is_read: true
  },
  {
    message_id: "msg7",
    conversation_id: "conv2",
    sender_id: "l2",
    content: "Hello! Absolutely, I specialize in startup incorporations. Tell me more about your business.",
    timestamp: "2024-03-13T14:30:00Z",
    is_read: true
  },
  {
    message_id: "msg8",
    conversation_id: "conv2",
    sender_id: "c2",
    content: "It's a SaaS platform for small businesses. We're 3 co-founders and looking to raise funding soon.",
    timestamp: "2024-03-14T09:15:00Z",
    is_read: true
  },
  {
    message_id: "msg9",
    conversation_id: "conv2",
    sender_id: "l2",
    content: "Thanks for the details. I recommend we set up a C-Corp structure given your plans to raise funding. Would you be available for a call tomorrow to discuss details?",
    timestamp: "2024-03-14T10:00:00Z",
    is_read: true
  },
  {
    message_id: "msg10",
    conversation_id: "conv2",
    sender_id: "c2",
    content: "That sounds good. I'm available after 2pm tomorrow.",
    timestamp: "2024-03-14T10:15:00Z",
    is_read: false
  }
];

// Helper functions to work with mock data
export function getCurrentClient() {
  return mockClients[0]; // For demo purposes, always return the first client
}

export function getClientUser(clientId: string) {
  return mockUsers.find(user => user.user_id === clientId);
}

export function getLawyerUser(lawyerId: string) {
  return mockUsers.find(user => user.user_id === lawyerId);
}

export function getLawyerById(lawyerId: string) {
  return mockLawyers.find(lawyer => lawyer.lawyer_id === lawyerId);
}

export function getLawyerSpecialties(lawyerId: string) {
  const specialtyIds = mockLawyerSpecialties
    .filter(ls => ls.lawyer_id === lawyerId)
    .map(ls => ls.specialty_id);
  
  return mockSpecialties.filter(specialty => 
    specialtyIds.includes(specialty.specialty_id)
  );
}

export function getClientCases(clientId: string) {
  return mockCases.filter(c => c.client_id === clientId);
}

export function getCaseById(caseId: string) {
  return mockCases.find(c => c.case_id === caseId);
}

export function getClientConversations(clientId: string) {
  return mockConversations.filter(conv => conv.client_id === clientId);
}

export function getConversationMessages(conversationId: string) {
  return mockMessages.filter(msg => msg.conversation_id === conversationId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function getSpecialtyById(specialtyId: string) {
  return mockSpecialties.find(s => s.specialty_id === specialtyId);
}

export function getCaseSpecialties(caseId: string) {
  const caseData = getCaseById(caseId);
  if (!caseData) return [];
  
  return caseData.case_category_ids.map(id => 
    getSpecialtyById(id)
  ).filter(Boolean) as Specialty[];
}

export function getMatchingLawyers(caseId: string) {
  const caseData = getCaseById(caseId);
  if (!caseData) return [];
  
  const matchingLawyerIds = new Set<string>();
  
  // For each category in the case, find lawyers with that specialty
  caseData.case_category_ids.forEach(categoryId => {
    mockLawyerSpecialties
      .filter(ls => ls.specialty_id === categoryId)
      .forEach(ls => matchingLawyerIds.add(ls.lawyer_id));
  });
  
  // Get the full lawyer objects for the matching IDs
  return Array.from(matchingLawyerIds).map(id => {
    const lawyer = getLawyerById(id);
    const user = getLawyerUser(id);
    const specialties = getLawyerSpecialties(id);
    
    if (lawyer && user) {
      return {
        ...lawyer,
        ...user,
        specialties
      };
    }
    return null;
  }).filter(Boolean);
}
