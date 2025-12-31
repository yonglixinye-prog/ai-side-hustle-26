
export interface SideHustleArea {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  marketDemand: number; // 1-100
  keySkills: string[];
  icon: string;
}

export interface EditorNote {
  section: string;
  comment: string;
  originalText?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
