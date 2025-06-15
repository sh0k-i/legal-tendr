// Type definitions for the application
export interface Specialty {
  specialty_id: string;
  name: string;
  description?: string;
}

export interface Message {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  timestamp: string;
  is_read: boolean;
}

export interface LawyerProfile {
  lawyer_id: string;
  user_id?: string;
  email?: string;
  first_name: string;
  last_name: string;
  profile_picture_url?: string;
  city: string;
  province: string;
  bio?: string;
  matches_count: number;
  rating: number;
  reviews: number;
  hourly_rate: number;
  years_of_experience: number;
  specialties?: Specialty[];
}

export interface Case {
  case_id: string;
  client_id: string;
  title: string;
  description: string;
  hired_lawyer_id?: string;
  status: 'open' | 'in_progress' | 'closed';
  created_at: string;
  updated_at?: string;
  specialties?: Specialty[];
}

export interface Match {
  match_id: string;
  client_id: string;
  lawyer_id: string;
  created_at: string;
}

export interface Conversation {
  conversation_id: string;
  client_id: string;
  lawyer_id: string;
  created_at: string;
  updated_at: string;
  lawyer?: LawyerProfile;
  latest_message?: {
    content: string;
    timestamp: string;
    is_read: boolean;
  };
  messages?: Message[];
}

export interface FilterOptions {
  specialties: string[];
  location?: string;
  priceRange: [number, number];
}
