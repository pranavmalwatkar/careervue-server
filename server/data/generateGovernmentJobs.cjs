const fs = require('fs');
const path = require('path');

// Define arrays of possible values for each field
const departments = [
  'Union Public Service Commission',
  'Staff Selection Commission',
  'Railway Recruitment Board',
  'Institute of Banking Personnel Selection',
  'National Testing Agency',
  'Defence Research and Development Organisation',
  'Indian Space Research Organisation',
  'Central Board of Secondary Education',
  'State Public Service Commission',
  'Police Recruitment Board',
  'Municipal Corporation',
  'Postal Department',
  'Income Tax Department',
  'Central Industrial Security Force',
  'Border Security Force',
  'Indian Army',
  'Indian Navy',
  'Indian Air Force',
  'Food Corporation of India',
  'Oil and Natural Gas Corporation',
  'National Health Mission',
  'Public Works Department',
  'Electricity Board',
  'Water Resources Department',
  'Forest Department',
  'Agriculture Department',
  'Rural Development Department',
  'Urban Development Department',
  'Social Welfare Department',
  'Tourism Department'
];

const ministries = [
  'Ministry of Personnel, Public Grievances and Pensions',
  'Ministry of Finance',
  'Ministry of Railways',
  'Ministry of Education',
  'Ministry of Defence',
  'Ministry of Home Affairs',
  'Ministry of Health and Family Welfare',
  'Ministry of Agriculture and Farmers Welfare',
  'Ministry of Rural Development',
  'Ministry of Urban Development',
  'Ministry of Communications',
  'Ministry of Power',
  'Ministry of Water Resources',
  'Ministry of Environment, Forest and Climate Change',
  'Ministry of Tourism',
  'Ministry of Tribal Affairs',
  'Ministry of Social Justice and Empowerment',
  'Ministry of Women and Child Development',
  'Ministry of Labour and Employment',
  'Ministry of Petroleum and Natural Gas'
];

const locations = [
  'All India',
  'Delhi',
  'Mumbai, Maharashtra',
  'Kolkata, West Bengal',
  'Chennai, Tamil Nadu',
  'Bangalore, Karnataka',
  'Hyderabad, Telangana',
  'Ahmedabad, Gujarat',
  'Lucknow, Uttar Pradesh',
  'Jaipur, Rajasthan',
  'Bhopal, Madhya Pradesh',
  'Patna, Bihar',
  'Chandigarh',
  'Guwahati, Assam',
  'Bhubaneswar, Odisha',
  'Thiruvananthapuram, Kerala',
  'Raipur, Chhattisgarh',
  'Ranchi, Jharkhand',
  'Dehradun, Uttarakhand',
  'Shimla, Himachal Pradesh',
  'Gandhinagar, Gujarat',
  'Panaji, Goa',
  'Srinagar, Jammu & Kashmir',
  'Itanagar, Arunachal Pradesh',
  'Kohima, Nagaland',
  'Shillong, Meghalaya',
  'Aizawl, Mizoram',
  'Imphal, Manipur',
  'Agartala, Tripura',
  'Gangtok, Sikkim'
];

const qualifications = [
  'Bachelor\'s Degree from recognized university',
  'Bachelor\'s Degree in any discipline',
  'Bachelor\'s Degree with minimum 60% marks',
  'Graduate/Diploma/ITI as per post requirement',
  'Master\'s Degree in relevant discipline',
  'Bachelor\'s Degree in Engineering/Technology',
  '10+2 with Science stream',
  '10th Pass from recognized board',
  '12th Pass from recognized board',
  'MBBS from recognized university',
  'B.Ed from recognized university',
  'Diploma in Engineering',
  'ITI Certificate in relevant trade',
  'CA/ICWA/MBA Finance',
  'LLB from recognized university',
  'B.Sc in Agriculture',
  'B.Sc in Nursing',
  'B.Pharm from recognized university',
  'BCA/MCA from recognized university',
  'B.Tech/M.Tech in Computer Science'
];

const ageLimits = [
  '18-30 years',
  '21-32 years (relaxation for reserved categories)',
  '18-32 years (relaxation for reserved categories)',
  '20-30 years',
  '21-35 years',
  '18-27 years',
  '21-30 years',
  '18-25 years',
  '21-27 years',
  '18-35 years (relaxation as per rules)',
  '21-40 years (relaxation as per rules)',
  '18-33 years',
  '21-28 years',
  '18-28 years',
  '21-37 years',
  '18-40 years',
  '21-45 years',
  '18-42 years',
  '21-50 years',
  '18-45 years'
];

const categories = [
  'Central Government',
  'State Government',
  'Banking',
  'Defence',
  'Education',
  'Railways',
  'Police',
  'Healthcare',
  'Engineering'
];

const jobTitles = {
  'Central Government': [
    'Civil Services Examination (IAS/IPS/IFS)',
    'Combined Graduate Level Examination',
    'Combined Higher Secondary Level Examination',
    'Multi Tasking Staff Examination',
    'Junior Engineer Examination',
    'Stenographer Grade C & D Examination',
    'Combined Defence Services Examination',
    'National Defence Academy Examination',
    'Central Armed Police Forces Examination',
    'Intelligence Bureau ACIO Examination',
    'Tax Assistant Examination',
    'Junior Statistical Officer Examination',
    'Combined Medical Services Examination',
    'Engineering Services Examination',
    'Geologist Examination'
  ],
  'State Government': [
    'State Civil Services Examination',
    'State Police Sub-Inspector Recruitment',
    'Revenue Officer Recruitment',
    'Block Development Officer Recruitment',
    'Commercial Tax Officer Recruitment',
    'Assistant Engineer Recruitment',
    'Junior Engineer Recruitment',
    'Gram Panchayat Secretary Recruitment',
    'Village Revenue Officer Recruitment',
    'Forest Range Officer Recruitment',
    'Assistant Statistical Officer Recruitment',
    'Junior Accountant Recruitment',
    'State Secretariat Assistant Recruitment',
    'Cooperative Inspector Recruitment',
    'Excise Inspector Recruitment'
  ],
  'Banking': [
    'Probationary Officer',
    'Specialist Officer',
    'Clerk',
    'Credit Officer',
    'Risk Manager',
    'IT Officer',
    'Law Officer',
    'Rajbhasha Adhikari',
    'Security Officer',
    'Agricultural Field Officer',
    'Marketing Officer',
    'HR Officer',
    'Digital Banking Officer',
    'Wealth Management Officer',
    'Financial Analyst'
  ],
  'Defence': [
    'Commissioned Officer',
    'Technical Entry Scheme',
    'Short Service Commission',
    'Permanent Commission',
    'Junior Commissioned Officer',
    'Airmen Selection',
    'Sailors Entry',
    'Military Nursing Service',
    'Military Engineer Services',
    'Defence Civilian Posts',
    'Defence Research Scientist',
    'Technical Assistant',
    'Store Keeper',
    'Security Assistant',
    'Multi Tasking Staff'
  ],
  'Education': [
    'Primary Teacher',
    'Trained Graduate Teacher',
    'Post Graduate Teacher',
    'Principal',
    'Assistant Professor',
    'Associate Professor',
    'Professor',
    'Librarian',
    'Lab Assistant',
    'Physical Education Teacher',
    'Special Educator',
    'Vocational Trainer',
    'Research Associate',
    'Education Officer',
    'Academic Coordinator'
  ],
  'Railways': [
    'Assistant Loco Pilot',
    'Station Master',
    'Train Ticket Examiner',
    'Commercial Apprentice',
    'Traffic Apprentice',
    'Junior Engineer',
    'Senior Section Engineer',
    'Goods Guard',
    'Track Maintainer',
    'Signal Maintainer',
    'Railway Protection Force',
    'Clerk-cum-Typist',
    'Accounts Assistant',
    'Medical Staff',
    'Technician'
  ],
  'Police': [
    'Sub-Inspector',
    'Constable',
    'Head Constable',
    'Assistant Sub-Inspector',
    'Inspector',
    'Deputy Superintendent of Police',
    'Superintendent of Police',
    'Intelligence Officer',
    'Cyber Crime Investigator',
    'Forensic Expert',
    'Traffic Police',
    'Women Police',
    'Armed Police',
    'Special Branch',
    'Crime Branch'
  ],
  'Healthcare': [
    'Medical Officer',
    'Staff Nurse',
    'ANM (Auxiliary Nurse Midwife)',
    'Lab Technician',
    'Radiographer',
    'Pharmacist',
    'Physiotherapist',
    'Dental Surgeon',
    'AYUSH Doctor',
    'Hospital Administrator',
    'Community Health Officer',
    'Health Inspector',
    'Dietician',
    'Ophthalmic Assistant',
    'Mental Health Counselor'
  ],
  'Engineering': [
    'Junior Engineer (Civil)',
    'Junior Engineer (Electrical)',
    'Junior Engineer (Mechanical)',
    'Assistant Engineer',
    'Executive Engineer',
    'Superintending Engineer',
    'Technical Assistant',
    'Draftsman',
    'Surveyor',
    'Estimator',
    'Quality Control Inspector',
    'Project Engineer',
    'Maintenance Engineer',
    'Design Engineer',
    'Environmental Engineer'
  ]
};

// Function to generate a random date within a range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Function to format date to YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Function to get a random item from an array
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Function to generate a random number within a range
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to generate a government job
function generateGovernmentJob(id) {
  const category = getRandomItem(categories);
  const title = `${getRandomItem(jobTitles[category])} - ${new Date().getFullYear() + 1}`;
  const department = getRandomItem(departments);
  const ministry = getRandomItem(ministries);
  const location = getRandomItem(locations);
  const qualification = getRandomItem(qualifications);
  const ageLimit = getRandomItem(ageLimits);
  const applicationFee = getRandomNumber(0, 1000);
  
  // Generate dates
  const currentDate = new Date();
  const futureDate1 = new Date();
  futureDate1.setMonth(currentDate.getMonth() + 6);
  const futureDate2 = new Date();
  futureDate2.setMonth(currentDate.getMonth() + 9);
  
  const lastDate = formatDate(randomDate(currentDate, futureDate1));
  const examDate = formatDate(randomDate(futureDate1, futureDate2));
  
  // Generate salary range based on category
  let salaryMin, salaryMax;
  switch (category) {
    case 'Central Government':
      salaryMin = getRandomNumber(25000, 60000) * 12;
      salaryMax = getRandomNumber(salaryMin / 12 + 20000, 150000) * 12;
      break;
    case 'State Government':
      salaryMin = getRandomNumber(20000, 50000) * 12;
      salaryMax = getRandomNumber(salaryMin / 12 + 15000, 100000) * 12;
      break;
    case 'Banking':
      salaryMin = getRandomNumber(30000, 70000) * 12;
      salaryMax = getRandomNumber(salaryMin / 12 + 25000, 120000) * 12;
      break;
    case 'Defence':
      salaryMin = getRandomNumber(35000, 80000) * 12;
      salaryMax = getRandomNumber(salaryMin / 12 + 30000, 150000) * 12;
      break;
    default:
      salaryMin = getRandomNumber(20000, 50000) * 12;
      salaryMax = getRandomNumber(salaryMin / 12 + 15000, 100000) * 12;
  }
  
  // Generate random number of posts
  const posts = getRandomNumber(10, 5000);
  
  // Generate website and links
  const websiteDomain = department.toLowerCase().replace(/\s+/g, '').substring(0, 10) + '.gov.in';
  const officialWebsite = `https://www.${websiteDomain}`;
  const notificationLink = `${officialWebsite}/notifications/${id}`;
  const applyLink = `${officialWebsite}/apply/${id}`;
  
  return {
    id: id.toString(),
    title,
    department,
    ministry,
    location,
    qualification,
    ageLimit,
    applicationFee,
    examDate,
    lastDate,
    officialWebsite,
    notificationLink,
    applyLink,
    category,
    posts,
    salary: { min: salaryMin, max: salaryMax }
  };
}

// Generate 900+ government jobs
function generateGovernmentJobs(count = 900) {
  const jobs = [];
  for (let i = 1; i <= count; i++) {
    jobs.push(generateGovernmentJob(i + 10)); // Starting from id 11 to avoid conflicts with existing jobs
  }
  return jobs;
}

// Generate the jobs
const newJobs = generateGovernmentJobs(900);

// Read the existing file
const filePath = path.resolve('../../src/data/governmentJobs.ts');
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }
  
  // Find the position where the governmentJobs array ends
  const endOfArrayIndex = data.indexOf('export const governmentCategories');
  if (endOfArrayIndex === -1) {
    console.error('Could not find the end of the governmentJobs array');
    return;
  }
  
  // Extract the existing jobs array
  const startMarker = 'export const governmentJobs: GovernmentJob[] = [';
  const endMarker = '];\n\nexport const governmentCategories';
  
  const startIndex = data.indexOf(startMarker) + startMarker.length;
  const endIndex = data.indexOf(endMarker);
  
  if (startIndex === -1 || endIndex === -1) {
    console.error('Could not extract existing jobs array');
    return;
  }
  
  const existingJobsString = data.substring(startIndex, endIndex);
  
  // Convert new jobs to string format
  const newJobsString = newJobs.map(job => {
    return `  {
    id: '${job.id}',
    title: '${job.title}',
    department: '${job.department}',
    ministry: '${job.ministry}',
    location: '${job.location}',
    qualification: '${job.qualification.replace(/'/g, "\\'") }',
    ageLimit: '${job.ageLimit}',
    applicationFee: ${job.applicationFee},
    examDate: '${job.examDate}',
    lastDate: '${job.lastDate}',
    officialWebsite: '${job.officialWebsite}',
    notificationLink: '${job.notificationLink}',
    applyLink: '${job.applyLink}',
    category: '${job.category}',
    posts: ${job.posts},
    salary: { min: ${job.salary.min}, max: ${job.salary.max} }
  }`;
  }).join(',\n');
  
  // Combine existing and new jobs
  const combinedJobsString = existingJobsString + ',\n' + newJobsString;
  
  // Create the updated file content
  const updatedContent = data.replace(
    data.substring(startIndex - startMarker.length, endIndex + endMarker.length - 1),
    startMarker + combinedJobsString + ']'
  );
  
  // Write the updated content back to the file
  fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log(`Successfully added ${newJobs.length} new government jobs to the file!`);
  });
});

console.log('Generating government jobs...');