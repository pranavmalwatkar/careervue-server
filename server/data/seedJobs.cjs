const mongoose = require('mongoose');

// Import dotenv for environment variables
require('dotenv').config();

// We'll use dynamic imports for ES modules
let Job;
let User;

// Function to initialize models
async function initModels() {
  const JobModule = await import('../models/Job.js');
  const UserModule = await import('../models/User.js');
  Job = JobModule.default;
  User = UserModule.default;
}

const indianJobs = [
  {
    title: 'Software Engineer - Full Stack',
    company: 'Tata Consultancy Services',
    type: 'private',
    location: {
      city: 'Bangalore',
      state: 'Karnataka'
    },
    salary: {
      min: 400000,
      max: 800000
    },
    experience: {
      min: 1,
      max: 3
    },
    description: 'Join TCS as a Full Stack Developer working on cutting-edge projects for global clients. Currently hiring for immediate joining. You will be responsible for developing scalable web applications using modern technologies.',
    requirements: [
      'Bachelor\'s degree in Computer Science or related field',
      '1-3 years of experience in web development',
      'Proficiency in JavaScript, React, Node.js',
      'Experience with databases (MySQL, MongoDB)',
      'Strong problem-solving skills'
    ],
    benefits: [
      'Health insurance for employee and family',
      'Provident fund and gratuity',
      'Flexible working hours',
      'Professional development opportunities',
      'Annual performance bonus'
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'MySQL'],
    deadline: new Date('2024-06-15'),
    category: 'Technology',
    employmentType: 'full-time',
    isPremium: false
  },
  {
    title: 'Civil Services Officer - IAS',
    company: 'Government of India',
    type: 'government',
    location: {
      city: 'New Delhi',
      state: 'Delhi'
    },
    salary: {
      min: 560000,
      max: 1800000
    },
    experience: {
      min: 0,
      max: 0
    },
    description: 'Join the Indian Administrative Service and serve the nation. This prestigious position offers opportunities to work in various government departments and make a significant impact on public policy.',
    requirements: [
      'Bachelor\'s degree from recognized university',
      'Age between 21-32 years (relaxation for reserved categories)',
      'Indian citizenship',
      'Clear UPSC Civil Services Examination',
      'Strong leadership and communication skills'
    ],
    benefits: [
      'Government accommodation',
      'Medical facilities',
      'Pension scheme',
      'Leave travel concession',
      'Job security and prestige'
    ],
    skills: ['Leadership', 'Public Administration', 'Policy Making', 'Communication'],
    deadline: new Date('2024-04-30'),
    category: 'Government',
    employmentType: 'full-time',
    isPremium: true,
    applicationFee: 100
  },
  {
    title: 'Data Analyst Intern',
    company: 'Flipkart',
    type: 'private',
    location: {
      city: 'Bangalore',
      state: 'Karnataka'
    },
    salary: {
      min: 25000,
      max: 40000
    },
    experience: {
      min: 0,
      max: 0
    },
    description: 'Exciting internship opportunity at Flipkart to work with big data and analytics. You will be part of the data science team analyzing customer behavior and market trends.',
    requirements: [
      'Currently pursuing or recently completed degree in Statistics, Mathematics, or Computer Science',
      'Knowledge of Python, R, or SQL',
      'Understanding of statistical concepts',
      'Experience with data visualization tools',
      'Strong analytical thinking'
    ],
    benefits: [
      'Stipend and performance bonus',
      'Mentorship from senior data scientists',
      'Flexible working hours',
      'Learning and development opportunities',
      'Potential for full-time conversion'
    ],
    skills: ['Python', 'R', 'SQL', 'Data Visualization', 'Statistics'],
    deadline: new Date('2024-02-28'),
    category: 'Technology',
    employmentType: 'internship',
    isPremium: false
  },
  {
    title: 'Marketing Manager',
    company: 'Creative Agency Inc.',
    type: 'private',
    location: {
      city: 'Mumbai',
      state: 'Maharashtra'
    },
    salary: {
      min: 700000,
      max: 1200000
    },
    experience: {
      min: 3,
      max: 5
    },
    description: 'Lead marketing campaigns for high-profile clients in the creative industry. Develop and execute marketing strategies to increase brand awareness and drive sales.',
    requirements: [
      'Bachelor\'s degree in Marketing, Business, or related field',
      '3-5 years of experience in marketing',
      'Experience with digital marketing tools',
      'Strong analytical and creative skills',
      'Excellent communication abilities'
    ],
    benefits: [
      'Competitive salary package',
      'Health and dental insurance',
      'Performance-based bonuses',
      'Professional development budget',
      'Flexible work arrangements'
    ],
    skills: ['Digital Marketing', 'Brand Management', 'Campaign Planning', 'Analytics'],
    deadline: new Date('2024-03-15'),
    category: 'Marketing',
    employmentType: 'full-time',
    isPremium: true
  },
  {
    title: 'Bank Probationary Officer',
    company: 'State Bank of India',
    type: 'private',
    location: {
      city: 'Mumbai',
      state: 'Maharashtra'
    },
    salary: {
      min: 300000,
      max: 500000
    },
    experience: {
      min: 0,
      max: 2
    },
    description: 'Join SBI as a Probationary Officer and start your career in banking. This role offers excellent growth opportunities and job security in the banking sector.',
    requirements: [
      'Graduate degree from recognized university',
      'Age between 20-30 years',
      'Strong numerical and analytical skills',
      'Good communication skills',
      'Willingness to work in any location'
    ],
    benefits: [
      'Competitive salary with allowances',
      'Medical insurance',
      'Pension scheme',
      'Leave travel concession',
      'Career advancement opportunities'
    ],
    skills: ['Banking', 'Customer Service', 'Financial Analysis', 'Risk Management'],
    deadline: new Date('2024-05-30'),
    category: 'Banking',
    employmentType: 'full-time',
    isPremium: false
  },
  {
    title: 'Software Development Intern - Summer 2024',
    company: 'Microsoft India',
    type: 'private',
    location: {
      city: 'Hyderabad',
      state: 'Telangana'
    },
    salary: {
      min: 35000,
      max: 50000
    },
    experience: {
      min: 0,
      max: 0
    },
    description: 'Join Microsoft India for an exciting summer internship. Work on real projects, learn from industry experts, and contribute to cutting-edge technology solutions.',
    requirements: [
      'Currently pursuing Computer Science or related degree',
      'Strong programming fundamentals',
      'Knowledge of at least one programming language',
      'Good problem-solving skills',
      'Team player with good communication'
    ],
    benefits: [
      'Competitive stipend',
      'Mentorship from senior developers',
      'Real project experience',
      'Networking opportunities',
      'Potential for full-time offer'
    ],
    skills: ['Programming', 'Problem Solving', 'Teamwork', 'Communication'],
    deadline: new Date('2024-03-01'),
    category: 'Technology',
    employmentType: 'internship',
    isPremium: true
  },
  {
    title: 'Financial Analyst',
    company: 'HDFC Bank',
    type: 'private',
    location: {
      city: 'Mumbai',
      state: 'Maharashtra'
    },
    salary: {
      min: 500000,
      max: 800000
    },
    experience: {
      min: 2,
      max: 4
    },
    description: 'Join HDFC Bank as a Financial Analyst and work on financial modeling, risk assessment, and investment analysis for the bank\'s portfolio.',
    requirements: [
      'CA/CFA/MBA Finance or related qualification',
      '2-4 years of experience in financial analysis',
      'Strong analytical and modeling skills',
      'Knowledge of financial markets',
      'Excellent Excel and presentation skills'
    ],
    benefits: [
      'Competitive salary package',
      'Health and life insurance',
      'Performance bonuses',
      'Learning and development',
      'Career growth opportunities'
    ],
    skills: ['Financial Modeling', 'Risk Analysis', 'Excel', 'Financial Markets'],
    deadline: new Date('2024-04-15'),
    category: 'Finance',
    employmentType: 'full-time',
    isPremium: false
  },
  {
    title: 'Teaching Assistant',
    company: 'Delhi University',
    type: 'private',
    location: {
      city: 'New Delhi',
      state: 'Delhi'
    },
    salary: {
      min: 200000,
      max: 350000
    },
    experience: {
      min: 0,
      max: 2
    },
    description: 'Join Delhi University as a Teaching Assistant and contribute to academic excellence. Support faculty members in teaching and research activities.',
    requirements: [
      'Master\'s degree in relevant subject',
      'Strong academic background',
      'Good communication skills',
      'Passion for teaching',
      'Research aptitude'
    ],
    benefits: [
      'Academic environment',
      'Research opportunities',
      'Professional development',
      'Flexible schedule',
      'Academic growth'
    ],
    skills: ['Teaching', 'Research', 'Communication', 'Subject Expertise'],
    deadline: new Date('2024-03-30'),
    category: 'Education',
    employmentType: 'part-time',
    isPremium: false
  },
  {
    title: 'Graduate Trainee Program',
    company: 'Larsen & Toubro',
    type: 'private',
    location: {
      city: 'Mumbai',
      state: 'Maharashtra'
    },
    salary: {
      min: 300000,
      max: 450000
    },
    experience: {
      min: 0,
      max: 0
    },
    description: 'Join L&T\'s prestigious Graduate Trainee Program and kickstart your career in engineering. Get exposure to various engineering domains and projects.',
    requirements: [
      'B.Tech/B.E. in Mechanical, Civil, Electrical, or related field',
      'Strong academic record',
      'Good communication skills',
      'Team player attitude',
      'Willingness to learn and adapt'
    ],
    benefits: [
      'Comprehensive training program',
      'Mentorship from experts',
      'Project exposure',
      'Competitive salary',
      'Career growth path'
    ],
    skills: ['Engineering', 'Problem Solving', 'Teamwork', 'Learning'],
    deadline: new Date('2024-05-15'),
    category: 'Engineering',
    employmentType: 'full-time',
    isPremium: false
  },
  {
    title: 'Software Development Intern - Summer 2024',
    company: 'Google India',
    type: 'private',
    location: {
      city: 'Bangalore',
      state: 'Karnataka'
    },
    salary: {
      min: 40000,
      max: 60000
    },
    experience: {
      min: 0,
      max: 0
    },
    description: 'Join Google India for an exciting summer internship. Work on innovative projects, learn from world-class engineers, and contribute to products used by billions.',
    requirements: [
      'Currently pursuing Computer Science or related degree',
      'Strong programming fundamentals',
      'Knowledge of algorithms and data structures',
      'Good problem-solving skills',
      'Passion for technology'
    ],
    benefits: [
      'Competitive stipend',
      'World-class mentorship',
      'Real project experience',
      'Networking opportunities',
      'Potential for full-time offer'
    ],
    skills: ['Programming', 'Algorithms', 'Problem Solving', 'Innovation'],
    deadline: new Date('2024-02-15'),
    category: 'Technology',
    employmentType: 'internship',
    isPremium: true
  }
];

// Generate additional jobs to reach 600+ total
const generateAdditionalJobs = () => {
  const additionalJobs = [];
  const companies = [
    'Infosys', 'Wipro', 'HCL Technologies', 'Tech Mahindra', 'Cognizant',
    'Accenture', 'IBM India', 'Oracle India', 'SAP India', 'Salesforce India',
    'Amazon India', 'Netflix India', 'Uber India', 'Ola', 'Zomato',
    'Swiggy', 'Paytm', 'PhonePe', 'Razorpay', 'CRED',
    'BYJU\'s', 'Unacademy', 'Vedantu', 'WhiteHat Jr', 'Coding Ninjas',
    'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Yes Bank',
    'Reliance Industries', 'Tata Group', 'Mahindra Group', 'Godrej Group', 'Adani Group'
  ];
  
  const cities = [
    'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai',
    'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow',
    'Chandigarh', 'Indore', 'Bhopal', 'Nagpur', 'Vadodara'
  ];
  
  const states = [
    'Karnataka', 'Maharashtra', 'Delhi', 'Telangana', 'Tamil Nadu',
    'Uttar Pradesh', 'Gujarat', 'Rajasthan', 'Madhya Pradesh', 'West Bengal'
  ];
  
  const categories = [
    'Technology', 'Finance', 'Healthcare', 'Education', 'Marketing',
    'Sales', 'Engineering', 'Design', 'Operations', 'HR',
    'Legal', 'Consulting', 'Banking', 'Government', 'Other'
  ];
  
  const employmentTypes = ['full-time', 'part-time', 'contract', 'internship'];
  
  for (let i = 0; i < 600; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const state = states[Math.floor(Math.random() * states.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const employmentType = employmentTypes[Math.floor(Math.random() * employmentTypes.length)];
    
    const minSalary = Math.floor(Math.random() * 500000) + 200000;
    const maxSalary = minSalary + Math.floor(Math.random() * 800000);
    
    const minExp = Math.floor(Math.random() * 5);
    const maxExp = minExp + Math.floor(Math.random() * 5);
    
    const job = {
      title: `${category} ${employmentType === 'internship' ? 'Intern' : 'Professional'} - ${Math.floor(Math.random() * 1000) + 1}`,
      company: company,
      type: 'private',
      location: {
        city: city,
        state: state
      },
      salary: {
        min: minSalary,
        max: maxSalary
      },
      experience: {
        min: minExp,
        max: maxExp
      },
      description: `Join ${company} as a ${category} professional. This is an exciting opportunity to work on innovative projects and grow your career.`,
      requirements: [
        'Relevant degree or certification',
        'Good communication skills',
        'Team player attitude',
        'Willingness to learn',
        'Problem-solving abilities'
      ],
      benefits: [
        'Competitive salary',
        'Health insurance',
        'Professional development',
        'Work-life balance',
        'Career growth opportunities'
      ],
      skills: [category, 'Communication', 'Teamwork', 'Problem Solving'],
      deadline: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000),
      category: category,
      employmentType: employmentType,
      isPremium: Math.random() > 0.7
    };
    
    additionalJobs.push(job);
  }
  
  return additionalJobs;
};

// Combine original jobs with generated jobs
const allJobs = [...indianJobs, ...generateAdditionalJobs()];

const seedJobs = async () => {
  try {
    // Initialize models
    await initModels();
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careervue');
    
    // Create a default user for posting jobs
    let defaultUser = await User.findOne({ email: 'admin@careervue.com' });
    if (!defaultUser) {
      defaultUser = new User({
        name: 'Careervue Admin',
        email: 'admin@careervue.com',
        password: 'admin123',
        role: 'admin'
      });
      await defaultUser.save();
    }

    // Clear existing jobs
    await Job.deleteMany({});

    // Add postedBy field to all jobs and update deadlines to be in the future
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3); // Set deadline 3 months in the future
    
    const jobsWithUser = allJobs.map(job => ({
      ...job,
      postedBy: defaultUser._id,
      deadline: futureDate
    }));

    // Insert jobs
    await Job.insertMany(jobsWithUser);
    
    console.log('Jobs seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding jobs:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedJobs()
    .then(() => console.log('Seeding completed successfully'))
    .catch(err => {
      console.error('Error seeding jobs:', err);
      process.exit(1);
    });
}

module.exports = { seedJobs, indianJobs };