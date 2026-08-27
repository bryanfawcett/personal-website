import type { Bilingual } from '../i18n/localize.js';
import { listInLang } from '../i18n/localize.js';
import type { Lang } from '../i18n/ui.js';

export interface Role {
  readonly title: string;
  readonly company: string;
  readonly location: string;
  readonly period: string;
  readonly duration?: string;
  readonly description: readonly string[];
  readonly skills?: readonly string[];
}

/**
 * Company names stay in Latin script — they are proper nouns, and a reader
 * searching for them will search for them as written. Everything a reader has
 * to *understand* (title, place, dates, what the job was) is translated.
 */
type TranslatedRole = Bilingual<
  Role,
  'title' | 'company' | 'location' | 'period' | 'duration' | 'description' | 'skills'
>;

const ROLES_SOURCE: readonly TranslatedRole[] = [
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
    zh: {
      title: '技术与创新协调员（副职）',
      company: 'Singapore American School（新加坡美国学校）',
      location: '新加坡',
      period: '2023 年至今',
      duration: '在任',
      description: [
        '主导技术与教学实践的融合，并提升运营效率',
        '此前曾任隐私与治理经理、IT 基础设施经理',
        '在全校范围内推动数字化转型',
      ],
      skills: ['教育科技', 'IT 治理', '隐私合规', '基础设施'],
    },
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
    zh: {
      title: '创始人兼首席执行官',
      company: 'Nyuchi Africa',
      location: '远程 / 非洲',
      period: '2016 年 10 月至今',
      duration: '8 年以上',
      description: [
        '以乌班图（Ubuntu）哲学为本，为非洲社区构建数字解决方案',
        '一家专注于网站设计、托管与数字集成的 Web 开发公司',
        '不断成长的品牌生态，涵盖 Nyuchi Learning、Mukoko 及旅行平台',
        '帮助企业实现办公数字化，以更环保的方式运作并降低碳足迹',
      ],
      skills: ['Web 开发', '数字战略', '创业', '社区营造'],
    },
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
    zh: {
      title: '野生动物之旅顾问',
      company: 'Iconic Expeditions',
      location: '非洲南部与东部',
      period: '2022 年 3 月至今',
      duration: '3 年以上',
      description: [
        '为高端野生动物旅行公司担任系统管理员与 Web 开发',
        '面向亚洲与美洲市场的行程顾问',
        '网站开发、用户管理，以及客户需求处理',
        '在非洲南部与东部各地寻找并预订住宿与体验项目',
      ],
      skills: ['Web 开发', '系统管理', '旅游业', '客户关系'],
    },
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
    zh: {
      title: 'IT 专员兼活动协调员',
      company: 'Osaka YMCA International School（大阪 YMCA 国际学校）',
      location: '日本 大阪',
      period: '2019 年 11 月 – 2023 年',
      duration: '4 年',
      description: [
        '担任中学部 ICT 协调员与网络管理员',
        '部署并维护学习管理系统与学生服务系统（Google Workspace、OpenApply、Managebac）',
        '为一所全新的高中校区搭建并管理全部技术设施，含网络、监控与教室设备',
        '使用 Looker Studio 为行为与医务数据搭建可视化与报表',
        '通过 Mosyle 统一管理 Linux、Windows、MacOS、iOS、tvOS 与 ChromeOS 设备',
        '兼任户外教育与体育健康教师——规划外出活动并带训运动队',
      ],
      skills: ['网络管理', 'Google Workspace', '移动设备管理', '数据可视化', '教育'],
    },
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
    zh: {
      title: '津巴布韦区总监',
      company: 'Shadows of Africa Ltd',
      location: '津巴布韦',
      period: '2017 年 4 月 – 2018 年 4 月',
      duration: '1 年',
      description: [
        '按客人偏好定制行程',
        '负责目的地管理公司（DMC）的日常运营',
        '提供 7×24 小时服务调度，统筹专车、向导与接待方',
        '为合作公司处理车辆调配',
      ],
      skills: ['旅游业', '目的地管理', '客户关系'],
    },
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
    zh: {
      title: '学校行政主管兼副校长',
      company: 'St. John the Baptist Catholic School',
      location: '南非 约翰内斯堡',
      period: '2016 年 1 月 – 2016 年 7 月',
      duration: '7 个月',
      description: [
        '统管小学部学生账户，并就校内活动与家长沟通',
        '主导面向全体教职员的教学技术与课程开发',
        '通过网站与社交媒体建立学校的线上形象',
        '兼任基础设施经理——负责校园扩建项目',
      ],
      skills: ['学校行政', '课程开发', '基础设施'],
    },
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
    zh: {
      title: '中学教师',
      company: 'St. John the Baptist Catholic School',
      location: '南非 约翰内斯堡',
      period: '2014 年 1 月 – 2015 年 12 月',
      duration: '2 年',
      description: [
        '任教 6–10 年级的历史、地理与生物',
        '为 Roodepoort 弱势社区的学生开发以动手实践为主的课程',
        '负责剑桥 Checkpoint 与 IGCSE 课程的设计与管理',
        '带训游泳队，并教授课后体育健康课',
      ],
      skills: ['教学', '课程设计', '剑桥 IGCSE', '运动带训'],
    },
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
    zh: {
      title: '教师',
      company: "St. John's College",
      location: '津巴布韦 哈拉雷',
      period: '2012 年 10 月 – 2013 年 8 月',
      duration: '11 个月',
      description: [
        '任教中学一至三年级的地理、信息技术与历史',
        '带训初中板球队与曲棍球队',
        '为学生、教师及课外活动提供技术支持',
        '在迎新期间担任 8 年级户外教育营的营地主任',
      ],
      skills: ['教学', 'IT 支持', '运动带训', '户外教育'],
    },
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
    zh: {
      title: '产品负责人',
      company: 'eLearning Solutions',
      location: '津巴布韦',
      period: '2012 年 3 月 – 2012 年 12 月',
      duration: '10 个月',
      description: [
        '与学校合作落地 Learnthings 数字内容',
        '主持 Intel Teach 与 Learnthings 数字内容培训课程',
        '面向企业与学校做产品讲解与销售',
        '在计算机教室进行软件安装与故障排查',
        '举办「21 世纪学习」工作坊与教师专业发展培训',
      ],
      skills: ['教育科技销售', '培训', '软件部署', '专业发展'],
    },
  },
];

export function roles(lang: Lang): Role[] {
  return listInLang(ROLES_SOURCE, lang);
}

export interface Credential {
  readonly title: string;
  readonly issuer: string;
  readonly period: string;
}

const CREDENTIALS_SOURCE: readonly Bilingual<Credential, 'title' | 'issuer' | 'period'>[] = [
  {
    title: 'Secondary Education Diploma of Teaching',
    issuer: 'Midlands Christian Training Centre',
    period: 'Graduated Dec 2012',
    zh: {
      title: '中等教育教学文凭',
      issuer: 'Midlands Christian Training Centre',
      period: '2012 年 12 月毕业',
    },
  },
  {
    title: 'Google IT Support Certificate',
    issuer: 'Google',
    period: 'Sept 2022',
    zh: { title: 'Google IT 支持专业证书', issuer: 'Google', period: '2022 年 9 月' },
  },
  {
    title: 'CompTIA A+',
    issuer: 'CompTIA',
    period: 'Nov 2022',
    zh: { title: 'CompTIA A+ 认证', issuer: 'CompTIA', period: '2022 年 11 月' },
  },
  {
    title: 'Google Project Management Certificate',
    issuer: 'Google',
    period: '2023',
    zh: { title: 'Google 项目管理专业证书', issuer: 'Google', period: '2023 年' },
  },
  {
    title: 'BSc Computer Science',
    issuer: 'University of London',
    period: 'In progress',
    zh: { title: '计算机科学学士', issuer: 'University of London（伦敦大学）', period: '在读' },
  },
];

export function credentials(lang: Lang): Credential[] {
  return listInLang(CREDENTIALS_SOURCE, lang);
}

/**
 * The toolkit.
 *
 * Product and platform names are left as they are in both languages — a
 * Chinese-reading systems administrator looks for "ChromeOS", not a
 * translation of it. Only the generic disciplines get Chinese.
 */
const CORE_SKILLS_SOURCE: readonly { readonly en: string; readonly zh: string }[] = [
  { en: 'Windows Server', zh: 'Windows Server' },
  { en: 'Linux', zh: 'Linux' },
  { en: 'MacOS', zh: 'MacOS' },
  { en: 'iOS', zh: 'iOS' },
  { en: 'ChromeOS', zh: 'ChromeOS' },
  { en: 'Web Development', zh: 'Web 开发' },
  { en: 'UI/UX Design', zh: 'UI/UX 设计' },
  { en: 'React', zh: 'React' },
  { en: 'Node.js', zh: 'Node.js' },
  { en: 'Rust', zh: 'Rust' },
  { en: 'Google Workspace', zh: 'Google Workspace' },
  { en: 'Project Management', zh: '项目管理' },
  { en: 'Network Security', zh: '网络安全' },
  { en: 'Systems Administration', zh: '系统管理' },
  { en: 'MDM Management', zh: '移动设备管理（MDM）' },
  { en: 'Cloud Services (AWS, Azure, Cloudflare)', zh: '云服务（AWS、Azure、Cloudflare）' },
  { en: 'Database Design', zh: '数据库设计' },
  { en: 'API Architecture', zh: 'API 架构' },
  { en: 'Digital Payment Systems', zh: '数字支付系统' },
];

export function coreSkills(lang: Lang): string[] {
  return CORE_SKILLS_SOURCE.map((skill) => skill[lang]);
}
