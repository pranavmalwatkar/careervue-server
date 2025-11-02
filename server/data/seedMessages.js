import mongoose from 'mongoose';
import Message from '../models/Message.js';
import dotenv from 'dotenv';

dotenv.config();

// Positive feedback messages (90%)
const positiveMessages = [
  {
    subject: "Excellent Job Portal!",
    message: "This is an amazing platform! I found my dream job within a week. The interface is user-friendly and the job recommendations are spot on. Thank you so much!",
    priority: "low"
  },
  {
    subject: "Great Experience",
    message: "I'm very impressed with the quality of job listings. The CV builder tool is fantastic and helped me create a professional resume. Highly recommend!",
    priority: "medium"
  },
  {
    subject: "Outstanding Service",
    message: "Your platform is outstanding! The application process is smooth and I appreciate the quick responses from employers. Keep up the excellent work!",
    priority: "low"
  },
  {
    subject: "Perfect Platform",
    message: "Perfect job search experience! The filters work great and I love the government job section. This site is a game-changer for job seekers.",
    priority: "low"
  },
  {
    subject: "Wonderful Features",
    message: "Wonderful features and great user experience! The email notifications keep me updated on new opportunities. Very satisfied with the service.",
    priority: "medium"
  },
  {
    subject: "Highly Satisfied",
    message: "I'm highly satisfied with CareerVue! Found multiple interview opportunities and the company profiles are very detailed. Excellent platform!",
    priority: "low"
  },
  {
    subject: "Best Job Portal",
    message: "This is the best job portal I've used! The search functionality is superb and the mobile experience is seamless. Thank you for this amazing service!",
    priority: "medium"
  },
  {
    subject: "Impressive Platform",
    message: "Very impressive platform with quality job listings. The application tracking feature is brilliant. I got hired through your site!",
    priority: "low"
  },
  {
    subject: "Love This Site",
    message: "I love this site! It's so easy to navigate and the job matches are relevant. The CV creation tool saved me hours of work. Fantastic!",
    priority: "low"
  },
  {
    subject: "Excellent Support",
    message: "Excellent customer support and great job opportunities! The team is responsive and helpful. This platform exceeded my expectations!",
    priority: "medium"
  },
  {
    subject: "Amazing Results",
    message: "Amazing results! I received 5 interview calls in just 2 weeks. The platform is professional and reliable. Highly recommended!",
    priority: "low"
  },
  {
    subject: "Superb Experience",
    message: "Superb experience from start to finish! The job alerts are timely and relevant. I'm grateful for this wonderful platform!",
    priority: "low"
  },
  {
    subject: "Great Success",
    message: "Great success using CareerVue! The quality of employers on this platform is top-notch. I landed my ideal position thanks to you!",
    priority: "medium"
  },
  {
    subject: "Fantastic Service",
    message: "Fantastic service and excellent job matches! The interface is clean and modern. This is exactly what job seekers need!",
    priority: "low"
  },
  {
    subject: "Very Happy",
    message: "Very happy with the platform! The government job section is comprehensive and up-to-date. Keep up the great work!",
    priority: "low"
  },
  {
    subject: "Brilliant Platform",
    message: "Brilliant platform for job hunting! The application process is straightforward and I appreciate the professional environment. Excellent!",
    priority: "medium"
  },
  {
    subject: "Top Quality",
    message: "Top quality job portal! The CV builder is intuitive and the job recommendations are accurate. I'm very impressed!",
    priority: "low"
  },
  {
    subject: "Awesome Features",
    message: "Awesome features and great functionality! The search filters help me find exactly what I'm looking for. Love it!",
    priority: "low"
  },
  {
    subject: "Highly Recommend",
    message: "I highly recommend CareerVue to all job seekers! The platform is reliable, fast, and has quality opportunities. Thank you!",
    priority: "medium"
  },
  {
    subject: "Perfect Match",
    message: "Found the perfect job match through your platform! The whole experience was smooth and professional. Grateful for this service!",
    priority: "low"
  },
  {
    subject: "Excellent Platform",
    message: "Excellent platform with amazing opportunities! The user interface is beautiful and easy to use. Best job site ever!",
    priority: "low"
  },
  {
    subject: "Great Job Listings",
    message: "Great job listings and wonderful user experience! I appreciate the variety of positions available. Very satisfied!",
    priority: "medium"
  },
  {
    subject: "Outstanding Results",
    message: "Outstanding results in my job search! The platform is efficient and the job quality is high. Thank you so much!",
    priority: "low"
  },
  {
    subject: "Wonderful Platform",
    message: "Wonderful platform that actually works! I got multiple offers and the process was seamless. Highly impressed!",
    priority: "low"
  },
  {
    subject: "Amazing Experience",
    message: "Amazing experience using CareerVue! The features are helpful and the job matches are relevant. Keep it up!",
    priority: "medium"
  },
  {
    subject: "Very Pleased",
    message: "Very pleased with the service! The platform is professional and the job opportunities are genuine. Excellent work!",
    priority: "low"
  },
  {
    subject: "Superb Quality",
    message: "Superb quality of jobs and employers! The application tracking is very useful. I'm extremely happy with the results!",
    priority: "low"
  },
  {
    subject: "Love the Features",
    message: "Love all the features! The CV builder, job alerts, and company profiles are all excellent. Best platform for job seekers!",
    priority: "medium"
  },
  {
    subject: "Impressive Service",
    message: "Impressive service and great opportunities! I found my dream company through CareerVue. Thank you for this amazing platform!",
    priority: "low"
  },
  {
    subject: "Fantastic Results",
    message: "Fantastic results! Got hired within a month of using the platform. The job matches were perfect for my skills. Grateful!",
    priority: "low"
  },
  {
    subject: "Excellent Experience",
    message: "Excellent experience overall! The platform is modern, fast, and has quality job listings. Highly satisfied customer!",
    priority: "medium"
  },
  {
    subject: "Great Platform",
    message: "Great platform with wonderful features! The government job section helped me find opportunities I wouldn't have found elsewhere!",
    priority: "low"
  },
  {
    subject: "Very Satisfied",
    message: "Very satisfied with CareerVue! The job search is efficient and the results are relevant. This platform is a blessing!",
    priority: "low"
  },
  {
    subject: "Outstanding Platform",
    message: "Outstanding platform for career growth! The quality of jobs and the user experience are both top-notch. Excellent!",
    priority: "medium"
  },
  {
    subject: "Perfect Service",
    message: "Perfect service from start to finish! I appreciate the professional approach and quality opportunities. Thank you!",
    priority: "low"
  },
  {
    subject: "Amazing Platform",
    message: "Amazing platform that delivers results! The interface is intuitive and the job matches are accurate. Love it!",
    priority: "low"
  },
  {
    subject: "Brilliant Service",
    message: "Brilliant service and excellent job opportunities! The CV builder is a lifesaver. Highly recommend to everyone!",
    priority: "medium"
  },
  {
    subject: "Great Success Story",
    message: "My success story started with CareerVue! Found an amazing job with great benefits. Thank you for this wonderful platform!",
    priority: "low"
  },
  {
    subject: "Wonderful Experience",
    message: "Wonderful experience using this platform! The job alerts are timely and the application process is smooth. Very happy!",
    priority: "low"
  },
  {
    subject: "Top-notch Service",
    message: "Top-notch service and quality! The platform exceeded my expectations. I'm grateful for finding my career path here!",
    priority: "medium"
  },
  {
    subject: "Excellent Job Portal",
    message: "Excellent job portal with genuine opportunities! The features are user-friendly and helpful. Best decision to use CareerVue!",
    priority: "low"
  },
  {
    subject: "Very Impressed",
    message: "Very impressed with the platform! The job quality is high and the user experience is smooth. Keep up the amazing work!",
    priority: "low"
  },
  {
    subject: "Fantastic Platform",
    message: "Fantastic platform for job seekers! The search functionality is powerful and the results are relevant. Love this site!",
    priority: "medium"
  },
  {
    subject: "Great Tool",
    message: "Great tool for finding quality jobs! The CV builder and job alerts make the process so much easier. Highly satisfied!",
    priority: "low"
  },
  {
    subject: "Amazing Service",
    message: "Amazing service and wonderful support! I found multiple opportunities and the platform is very reliable. Thank you!",
    priority: "low"
  }
];

// Neutral/Negative messages (10%)
const neutralMessages = [
  {
    subject: "Suggestion for Improvement",
    message: "The platform is good but could use more filter options for job search. Overall decent experience.",
    priority: "medium"
  },
  {
    subject: "Minor Issue",
    message: "I noticed the mobile app could be faster. Otherwise, the platform works fine.",
    priority: "low"
  },
  {
    subject: "Feature Request",
    message: "Would be great to have salary range filters. The platform is okay but needs some improvements.",
    priority: "medium"
  },
  {
    subject: "Average Experience",
    message: "Average experience. Some job listings are outdated. Could be better with regular updates.",
    priority: "medium"
  },
  {
    subject: "Needs Improvement",
    message: "The search results could be more accurate. Need better job matching algorithm.",
    priority: "high"
  }
];

// Sample user data
const sampleUsers = [
  { name: "Rahul Sharma", email: "rahul.sharma@example.com", phone: "9876543210" },
  { name: "Priya Patel", email: "priya.patel@example.com", phone: "9876543211" },
  { name: "Amit Kumar", email: "amit.kumar@example.com", phone: "9876543212" },
  { name: "Sneha Reddy", email: "sneha.reddy@example.com", phone: "9876543213" },
  { name: "Vikram Singh", email: "vikram.singh@example.com", phone: "9876543214" },
  { name: "Anjali Gupta", email: "anjali.gupta@example.com", phone: "9876543215" },
  { name: "Rajesh Verma", email: "rajesh.verma@example.com", phone: "9876543216" },
  { name: "Pooja Joshi", email: "pooja.joshi@example.com", phone: "9876543217" },
  { name: "Karan Mehta", email: "karan.mehta@example.com", phone: "9876543218" },
  { name: "Neha Agarwal", email: "neha.agarwal@example.com", phone: "9876543219" },
];

// Function to get random date within last 30 days
const getRandomDate = () => {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date;
};

// Function to get random status
const getRandomStatus = () => {
  const statuses = ['unread', 'read', 'replied', 'archived'];
  const weights = [0.3, 0.3, 0.3, 0.1]; // 30% unread, 30% read, 30% replied, 10% archived
  const random = Math.random();
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (random <= sum) return statuses[i];
  }
  return 'unread';
};

// Seed function
const seedMessages = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careervue');
    console.log('Connected to MongoDB');

    // Clear existing messages (optional - comment out if you want to keep existing messages)
    // await Message.deleteMany({});
    // console.log('Cleared existing messages');

    const messagesToInsert = [];

    // Create 45 positive messages (90% of 50)
    for (let i = 0; i < 45; i++) {
      const messageTemplate = positiveMessages[i % positiveMessages.length];
      const user = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
      
      messagesToInsert.push({
        name: user.name,
        email: user.email,
        phone: user.phone,
        subject: messageTemplate.subject,
        message: messageTemplate.message,
        priority: messageTemplate.priority,
        status: getRandomStatus(),
        createdAt: getRandomDate(),
        isActive: true
      });
    }

    // Create 5 neutral/negative messages (10% of 50)
    for (let i = 0; i < 5; i++) {
      const messageTemplate = neutralMessages[i % neutralMessages.length];
      const user = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
      
      messagesToInsert.push({
        name: user.name,
        email: user.email,
        phone: user.phone,
        subject: messageTemplate.subject,
        message: messageTemplate.message,
        priority: messageTemplate.priority,
        status: getRandomStatus(),
        createdAt: getRandomDate(),
        isActive: true
      });
    }

    // Insert all messages
    await Message.insertMany(messagesToInsert);
    console.log(`✅ Successfully inserted ${messagesToInsert.length} messages!`);
    console.log(`   - ${45} positive messages (90%)`);
    console.log(`   - ${5} neutral/negative messages (10%)`);
    console.log('\nMessage distribution:');
    console.log(`   - Low priority: ~${messagesToInsert.filter(m => m.priority === 'low').length}`);
    console.log(`   - Medium priority: ~${messagesToInsert.filter(m => m.priority === 'medium').length}`);
    console.log(`   - High priority: ~${messagesToInsert.filter(m => m.priority === 'high').length}`);

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedMessages();
