const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

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

// Read government jobs data from frontend file
async function readGovernmentJobsData() {
  try {
    const filePath = path.resolve('../client/src/data/governmentJobs.ts');
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Extract the governmentJobs array from the TypeScript file
    const startMarker = 'export const governmentJobs: GovernmentJob[] = [';
    const endMarker = '];\n\nexport const governmentCategories';

    const startIndex = fileContent.indexOf(startMarker);
    const endIndex = fileContent.indexOf(endMarker, startIndex);

    if (startIndex === -1 || endIndex === -1) {
      throw new Error('Could not extract government jobs array from file');
    }

    const jobsArrayString = fileContent.substring(startIndex + startMarker.length, endIndex);

    // Convert the TypeScript array to JavaScript objects
    // This is a simplified conversion - in a real scenario, you might want to use a proper parser
    const jobsString = jobsArrayString.replace(/(\w+):\s*([^,\n}]+)/g, '"$1": $2');
    jobsString = jobsString.replace(/'([^']+)'/g, '"$1"');
    jobsString = jobsString.replace(/([{,]\s*)(\w+):/g, '$1"$2":');

    // Clean up the string
    let cleanJobsString = jobsString.replace(/,\s*,/g, ',');
    cleanJobsString = cleanJobsString.replace(/,\s*}/g, '}');
    cleanJobsString = cleanJobsString.replace(/}\s*,/g, '},');

    // Parse the JSON
    const jobs = JSON.parse('[' + cleanJobsString + ']');

    return jobs;
  } catch (error) {
    console.error('Error reading government jobs data:', error);
    return [];
  }
}

const seedGovernmentJobs = async () => {
  try {
    // Initialize models
    await initModels();

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careervue');

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

    // Read government jobs data
    const jobsData = await readGovernmentJobsData();

    if (jobsData.length === 0) {
      console.log('No government jobs data found to seed');
      return;
    }

    // Clear existing government jobs
    await GovernmentJob.deleteMany({});
    console.log('Cleared existing government jobs');

    // Transform and insert jobs
    const jobsToInsert = jobsData.map(job => ({
      id: job.id,
      title: job.title,
      department: job.department,
      ministry: job.ministry,
      location: job.location,
      qualification: job.qualification,
      ageLimit: job.ageLimit,
      applicationFee: job.applicationFee || 0,
      examDate: job.examDate,
      lastDate: job.lastDate,
      officialWebsite: job.officialWebsite,
      notificationLink: job.notificationLink,
      applyLink: job.applyLink,
      category: job.category,
      posts: job.posts || 1,
      salary: job.salary,
      isActive: true,
      featured: false,
      createdBy: admin._id
    }));

    // Insert jobs in batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < jobsToInsert.length; i += batchSize) {
      const batch = jobsToInsert.slice(i, i + batchSize);
      await GovernmentJob.insertMany(batch);
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(jobsToInsert.length / batchSize)}`);
    }

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