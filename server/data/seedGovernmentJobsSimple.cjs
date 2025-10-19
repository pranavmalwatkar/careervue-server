const mongoose = require('mongoose');

// Import dotenv for environment variables
require('dotenv').config();

// We'll use dynamic imports for ES modules
let GovernmentJob;
let Admin;

// Function to initialize models
async function initModels() {
  const GovernmentJobModule = await import('../models/GovernmentJob.js');
  const AdminModule = await import('../models/Admin.js');
  GovernmentJob = GovernmentJobModule.default;
  Admin = AdminModule.default;
}

// Sample government jobs data
const sampleGovernmentJobs = [
  {
    id: '1',
    title: 'Civil Services Examination (IAS/IPS/IFS) - 2024',
    department: 'Union Public Service Commission',
    ministry: 'Ministry of Personnel, Public Grievances and Pensions',
    location: 'All India',
    qualification: 'Bachelor\'s Degree from recognized university',
    ageLimit: '21-32 years (relaxation for reserved categories)',
    applicationFee: 100,
    examDate: '2024-06-15',
    lastDate: '2024-03-15',
    officialWebsite: 'https://www.upsc.gov.in',
    notificationLink: 'https://www.upsc.gov.in/sites/default/files/Notification_CSE_2024.pdf',
    applyLink: 'https://upsconline.nic.in/',
    category: 'Central Government',
    posts: 1000,
    salary: { min: 56100, max: 250000 }
  },
  {
    id: '2',
    title: 'Combined Graduate Level Examination - 2024',
    department: 'Staff Selection Commission',
    ministry: 'Ministry of Personnel, Public Grievances and Pensions',
    location: 'All India',
    qualification: 'Bachelor\'s Degree in any discipline',
    ageLimit: '18-30 years',
    applicationFee: 100,
    examDate: '2024-07-20',
    lastDate: '2024-04-30',
    officialWebsite: 'https://ssc.nic.in',
    notificationLink: 'https://ssc.nic.in/SSCFileServer/PortalManagement/UploadedFiles/notice_cgl_2024.pdf',
    applyLink: 'https://ssc.nic.in/Portal/Apply',
    category: 'Central Government',
    posts: 5000,
    salary: { min: 25000, max: 150000 }
  },
  {
    id: '3',
    title: 'State Civil Services Examination - 2024',
    department: 'State Public Service Commission',
    ministry: 'State Government',
    location: 'Maharashtra',
    qualification: 'Bachelor\'s Degree from recognized university',
    ageLimit: '21-35 years',
    applicationFee: 500,
    examDate: '2024-08-10',
    lastDate: '2024-05-20',
    officialWebsite: 'https://mpsc.gov.in',
    notificationLink: 'https://mpsc.gov.in/sites/default/files/MPSC_Notification_2024.pdf',
    applyLink: 'https://mpsc.gov.in/apply',
    category: 'State Government',
    posts: 200,
    salary: { min: 40000, max: 120000 }
  },
  {
    id: '4',
    title: 'Bank Probationary Officer - 2024',
    department: 'State Bank of India',
    ministry: 'Ministry of Finance',
    location: 'All India',
    qualification: 'Graduate degree from recognized university',
    ageLimit: '21-30 years',
    applicationFee: 750,
    examDate: '2024-05-25',
    lastDate: '2024-03-30',
    officialWebsite: 'https://sbi.co.in',
    notificationLink: 'https://sbi.co.in/documents/17529/0/PO_Notification_2024.pdf',
    applyLink: 'https://ibpsonline.ibps.in/sbijan24/',
    category: 'Banking',
    posts: 2000,
    salary: { min: 36000, max: 63840 }
  },
  {
    id: '5',
    title: 'Railway Assistant Loco Pilot - 2024',
    department: 'Railway Recruitment Board',
    ministry: 'Ministry of Railways',
    location: 'All India',
    qualification: '10th Pass + ITI/Diploma in relevant trade',
    ageLimit: '18-28 years',
    applicationFee: 500,
    examDate: '2024-09-15',
    lastDate: '2024-06-30',
    officialWebsite: 'https://indianrailways.gov.in',
    notificationLink: 'https://rrb.gov.in/ALP_Notification_2024.pdf',
    applyLink: 'https://rrb.apply.gov.in',
    category: 'Railways',
    posts: 10000,
    salary: { min: 19900, max: 63200 }
  }
];

const seedGovernmentJobs = async () => {
  try {
    // Initialize models
    await initModels();

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://pranavmalwatkar:Pranav@55@cluster0.lh0dbyk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

    // Get admin user
    let admin = await Admin.findOne({ email: 'malwatkarpranav@gmail.com' });
    if (!admin) {
      console.log('Admin not found, creating default admin...');
      admin = new Admin({
        name: 'Pranav Malwatkar',
        email: 'malwatkarpranav@gmail.com',
        password: 'Admin@1234',
        role: 'super_admin'
      });
      await admin.save();
    }

    // Clear existing government jobs
    await GovernmentJob.deleteMany({});
    console.log('Cleared existing government jobs');

    // Transform and insert jobs
    const jobsToInsert = sampleGovernmentJobs.map(job => ({
      id: job.id,
      title: job.title,
      department: job.department,
      ministry: job.ministry,
      location: job.location,
      qualification: job.qualification,
      ageLimit: job.ageLimit,
      applicationFee: job.applicationFee,
      examDate: job.examDate,
      lastDate: job.lastDate,
      officialWebsite: job.officialWebsite,
      notificationLink: job.notificationLink,
      applyLink: job.applyLink,
      category: job.category,
      posts: job.posts,
      salary: job.salary,
      isActive: true,
      featured: false,
      createdBy: admin._id
    }));

    // Insert jobs
    await GovernmentJob.insertMany(jobsToInsert);
    console.log(`Government jobs seeded successfully! Total: ${jobsToInsert.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding government jobs:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedGovernmentJobs()
    .then(() => console.log('Government jobs seeding completed successfully'))
    .catch(err => {
      console.error('Error seeding government jobs:', err);
      process.exit(1);
    });
}

module.exports = { seedGovernmentJobs };