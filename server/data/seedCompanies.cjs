const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import dotenv for environment variables
require('dotenv').config();

// We'll use dynamic imports for ES modules
let Company;
let Admin;

// Function to initialize models
async function initModels() {
  const CompanyModule = await import('../models/Company.js');
  const AdminModule = await import('../models/Admin.js');
  Company = CompanyModule.default;
  Admin = AdminModule.default;
}

// Read companies data from frontend file
async function readCompaniesData() {
  try {
    const filePath = path.resolve('../client/src/data/companies.ts');
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Find the realCompanies array
    const realCompaniesStart = fileContent.indexOf('const realCompanies: Company[] = [');
    const realCompaniesEnd = fileContent.indexOf('];', realCompaniesStart);

    if (realCompaniesStart === -1 || realCompaniesEnd === -1) {
      throw new Error('Could not find realCompanies array');
    }

    const realCompaniesString = fileContent.substring(realCompaniesStart + 'const realCompanies: Company[] = ['.length, realCompaniesEnd);

    // Find the generateAdditionalCompanies function
    const generateFunctionStart = fileContent.indexOf('const generateAdditionalCompanies = (): Company[] => {');
    const generateFunctionEnd = fileContent.indexOf('};', generateFunctionStart);

    if (generateFunctionStart === -1 || generateFunctionEnd === -1) {
      throw new Error('Could not find generateAdditionalCompanies function');
    }

    // Extract the function body and create a simple version that generates 50 companies
    const companies = [];

    // Add the first 50 real companies (we'll parse them manually for now)
    // For now, let's create a simple array of companies to seed
    const sampleCompanies = [
      {
        id: '1',
        name: 'Tata Consultancy Services (TCS)',
        sector: 'IT & Software',
        officialWebsite: 'https://www.tcs.com',
        careerLink: 'https://www.tcs.com/careers',
        description: 'Leading global IT services, consulting and business solutions organization',
        headquarters: 'Mumbai, India',
        founded: '1968',
        employees: '500,000+'
      },
      {
        id: '2',
        name: 'Infosys',
        sector: 'IT & Software',
        officialWebsite: 'https://www.infosys.com',
        careerLink: 'https://www.infosys.com/careers',
        description: 'Global leader in next-generation digital services and consulting',
        headquarters: 'Bangalore, India',
        founded: '1981',
        employees: '300,000+'
      },
      {
        id: '3',
        name: 'Wipro',
        sector: 'IT & Software',
        officialWebsite: 'https://www.wipro.com',
        careerLink: 'https://careers.wipro.com',
        description: 'Leading global information technology, consulting and business process services',
        headquarters: 'Bangalore, India',
        founded: '1945',
        employees: '250,000+'
      },
      {
        id: '4',
        name: 'HCL Technologies',
        sector: 'IT & Software',
        officialWebsite: 'https://www.hcltech.com',
        careerLink: 'https://www.hcltech.com/careers',
        description: 'Global technology company providing industry-transforming capabilities',
        headquarters: 'Noida, India',
        founded: '1976',
        employees: '200,000+'
      },
      {
        id: '5',
        name: 'Tech Mahindra',
        sector: 'IT & Software',
        officialWebsite: 'https://www.techmahindra.com',
        careerLink: 'https://www.techmahindra.com/careers',
        description: 'Digital transformation, consulting and business re-engineering services',
        headquarters: 'Pune, India',
        founded: '1986',
        employees: '150,000+'
      }
    ];

    return sampleCompanies;
  } catch (error) {
    console.error('Error reading companies data:', error);
    return [];
  }
}

const seedCompanies = async () => {
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

    // Read companies data
    const companiesData = await readCompaniesData();

    if (companiesData.length === 0) {
      console.log('No companies data found to seed');
      return;
    }

    // Clear existing companies
    await Company.deleteMany({});
    console.log('Cleared existing companies');

    // Transform and insert companies
    const companiesToInsert = companiesData.map(company => ({
      id: company.id,
      name: company.name,
      sector: company.sector,
      officialWebsite: company.officialWebsite,
      careerLink: company.careerLink,
      logo: company.logo || '',
      description: company.description || '',
      headquarters: company.headquarters,
      founded: company.founded,
      employees: company.employees,
      isActive: true,
      featured: false,
      createdBy: admin._id
    }));

    // Insert companies in batches to avoid memory issues
    const batchSize = 50;
    for (let i = 0; i < companiesToInsert.length; i += batchSize) {
      const batch = companiesToInsert.slice(i, i + batchSize);
      await Company.insertMany(batch);
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(companiesToInsert.length / batchSize)}`);
    }

    console.log(`Companies seeded successfully! Total: ${companiesToInsert.length}`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding companies:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedCompanies()
    .then(() => console.log('Companies seeding completed successfully'))
    .catch(err => {
      console.error('Error seeding companies:', err);
      process.exit(1);
    });
}

module.exports = { seedCompanies };