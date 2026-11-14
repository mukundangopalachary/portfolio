export interface ProjectMeta {
  title: string;
  slug: string;
  description: string;
  status: 'complete' | 'active' | 'practice';
  techs: string[];
  github?: string;
  featured: boolean;
  order: number;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  period: string;
  location: string;
  summary: string;
  highlights: string[];
}

export interface SocialLink {
  label: string;
  url: string;
  icon: string;
}
