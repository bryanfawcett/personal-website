export interface Role {
  readonly title: string;
  readonly company: string;
  readonly location: string;
  readonly period: string;
  readonly duration?: string;
  readonly description: readonly string[];
  readonly skills?: readonly string[];
}

export const ROLES: readonly Role[] = [
  {
    title: 'Associate Technology & Innovation Coordinator',
    company: 'Singapore American School',
    location: 'Singapore',
    period: '2023 – Present',
    duration: 'Current',
    description: [
      'Leading technology integration within educational practices and operational efficiencies',
      'Previously served as Privacy & Governance Manager and IT Infrastructure Manager',
      'Driving digital transformation initiatives across the school',
    ],
    skills: ['EdTech', 'IT Governance', 'Privacy', 'Infrastructure'],
  },
  {
    title: 'Founder & CEO',
    company: 'Nyuchi Africa',
    location: 'Remote / Africa',
    period: 'Oct 2016 – Present',
    duration: '8+ years',
    description: [
      'Building digital solutions for African communities under the Ubuntu philosophy',
      'Web development company specialising in web design, hosting, and digital integration',
      'Growing ecosystem of brands including Nyuchi Learning, Mukoko, and travel platforms',
      'Helping companies digitalise workplaces to become eco-friendly and reduce carbon footprint',
    ],
    skills: ['Web Development', 'Digital Strategy', 'Entrepreneurship', 'Community Building'],
  },
  {
    title: 'Safari Specialist',
    company: 'Iconic Expeditions',
    location: 'Southern & Eastern Africa',
    period: 'Mar 2022 – Present',
    duration: '3+ years',
    description: [
      'System administrator and web developer for luxury safari company',
      'Safari specialist focusing on Asian and American markets',
      'Web development, user administration, and handling client requests',
      'Finding and booking lodging and experiences throughout southern and eastern Africa',
    ],
    skills: ['Web Development', 'System Administration', 'Tourism', 'Client Relations'],
  },
  {
    title: 'IT Specialist & Activities Coordinator',
    company: 'Osaka YMCA International School',
    location: 'Osaka, Japan',
    period: 'Nov 2019 – 2023',
    duration: '4 years',
    description: [
      'ICT Coordinator and Network Manager for Secondary School',
      'Implemented and maintained LMS and student service systems (Google Workspace, OpenApply, Managebac)',
      'Set up and managed all technology at a new high school campus including network, CCTV, and classroom tech',
      'Built visualisations and reports using Looker Studio for behaviour and medical data',
      'Hardware management across Linux, Windows, MacOS, iOS, tvOS, ChromeOS using Mosyle',
      'Outdoors Education and PHE Educator — planned excursions and coached sports',
    ],
    skills: ['Network Management', 'Google Workspace', 'MDM', 'Data Visualisation', 'Education'],
  },
  {
    title: 'Zimbabwe Director',
    company: 'Shadows of Africa Ltd',
    location: 'Zimbabwe',
    period: 'Apr 2017 – Apr 2018',
    duration: '1 year',
    description: [
      "Built custom itineraries for guests' preferences",
      'Destination Management Company operations',
      'Provided 24/7 service coordination with private vehicles, guides, and hosts',
      'Vehicle handling for partner companies',
    ],
    skills: ['Tourism', 'Destination Management', 'Client Relations'],
  },
  {
    title: 'School Administrator & Assistant Principal',
    company: 'St. John the Baptist Catholic School',
    location: 'Johannesburg, South Africa',
    period: 'Jan 2016 – Jul 2016',
    duration: '7 months',
    description: [
      'Directed primary student accounts and communicated with parents on school events',
      'Led instructional technology and curriculum development for all staff',
      'Developed online presence with website and social media',
      'Infrastructure Manager — managed projects for campus expansion',
    ],
    skills: ['School Administration', 'Curriculum Development', 'Infrastructure'],
  },
  {
    title: 'High School Teacher',
    company: 'St. John the Baptist Catholic School',
    location: 'Johannesburg, South Africa',
    period: 'Jan 2014 – Dec 2015',
    duration: '2 years',
    description: [
      'History, Geography, Biology teacher for Grades 6–10',
      'Developed hands-on curriculum for students from underserved communities in Roodepoort',
      'Cambridge Checkpoint and IGCSE curriculum design and management',
      'Coached swimming and taught after-school physical health',
    ],
    skills: ['Teaching', 'Curriculum Design', 'Cambridge IGCSE', 'Coaching'],
  },
  {
    title: 'Teacher',
    company: "St. John's College",
    location: 'Harare, Zimbabwe',
    period: 'Oct 2012 – Aug 2013',
    duration: '11 months',
    description: [
      'Form 1, 2, and 3 Teacher — Geography, IT, and History',
      'Coached junior high school cricket and field hockey',
      'Technical support for students, teachers, and extracurricular activities',
      'Camp director for Grade 8 outdoor education during Introductions',
    ],
    skills: ['Teaching', 'IT Support', 'Coaching', 'Outdoor Education'],
  },
  {
    title: 'Head of Products',
    company: 'eLearning Solutions',
    location: 'Zimbabwe',
    period: 'Mar 2012 – Dec 2012',
    duration: '10 months',
    description: [
      'Worked with schools to implement Learnthings Digital Content',
      'Intel Teach and Learnthings Digital Content training course facilitation',
      'Sales presentations to companies and schools',
      'Software troubleshooting and installations in computer labs',
      '21st Century Learning workshops and professional development training',
    ],
    skills: ['EdTech Sales', 'Training', 'Software Installation', 'Professional Development'],
  },
];

export interface Credential {
  readonly title: string;
  readonly issuer: string;
  readonly period: string;
}

export const CREDENTIALS: readonly Credential[] = [
  {
    title: 'Secondary Education Diploma of Teaching',
    issuer: 'Midlands Christian Training Centre',
    period: 'Graduated Dec 2012',
  },
  { title: 'Google IT Support Certificate', issuer: 'Google', period: 'Sept 2022' },
  { title: 'CompTIA A+', issuer: 'CompTIA', period: 'Nov 2022' },
  { title: 'Google Project Management Certificate', issuer: 'Google', period: '2023' },
];

export const CORE_SKILLS: readonly string[] = [
  'Windows Server',
  'Linux',
  'MacOS',
  'iOS',
  'ChromeOS',
  'Web Development',
  'UI/UX Design',
  'React',
  'Node.js',
  'Google Workspace',
  'Project Management',
  'Network Security',
  'Systems Administration',
  'MDM Management',
  'Cloud Services (AWS, Azure)',
  'Database Design',
  'API Architecture',
  'Digital Payment Systems',
];
