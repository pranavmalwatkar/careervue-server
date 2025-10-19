import mongoose from 'mongoose';
import Message from '../models/Message.js';
import dotenv from 'dotenv';

dotenv.config();

// Enhanced positive messages with better content
const enhancedMessages = [
  {
    subject: "Excellent Job Portal!",
    message: "This is an amazing platform! I found my dream job within a week. The interface is user-friendly and the job recommendations are spot on. The website looks very professional and modern. Thank you so much!"
  },
  {
    subject: "Great Experience",
    message: "I'm very impressed with the quality of job listings. The CV builder tool is fantastic and helped me create a professional resume. The website design is clean and easy to navigate. Highly recommend!"
  },
  {
    subject: "Outstanding Service",
    message: "Your platform is outstanding! The application process is smooth and I appreciate the quick responses from employers. The website is beautiful and very responsive. Keep up the excellent work!"
  },
  {
    subject: "Perfect Platform",
    message: "Perfect job search experience! The filters work great and I love the government job section. The website is well-designed and loads fast. This site is a game-changer for job seekers."
  },
  {
    subject: "Wonderful Features",
    message: "Wonderful features and great user experience! The email notifications keep me updated on new opportunities. The website looks professional and is very intuitive. Very satisfied with the service."
  },
  {
    subject: "Highly Satisfied",
    message: "I'm highly satisfied with CareerVue! Found multiple interview opportunities and the company profiles are very detailed. The website design is modern and attractive. Excellent platform!"
  },
  {
    subject: "Best Job Portal",
    message: "This is the best job portal I've used! The search functionality is superb and the mobile experience is seamless. The website is beautifully designed and easy to use. Thank you for this amazing service!"
  },
  {
    subject: "Impressive Platform",
    message: "Very impressive platform with quality job listings. The application tracking feature is brilliant and the website looks very professional. I got hired through your site!"
  },
  {
    subject: "Love This Site",
    message: "I love this site! It's so easy to navigate and the job matches are relevant. The CV creation tool saved me hours of work and the website design is fantastic. Absolutely wonderful!"
  },
  {
    subject: "Excellent Support",
    message: "Excellent customer support and great job opportunities! The team is responsive and helpful. The website is well-organized and looks great. This platform exceeded my expectations!"
  },
  {
    subject: "Amazing Results",
    message: "Amazing results! I received 5 interview calls in just 2 weeks. The platform is professional and reliable. The website has a clean, modern look that makes job searching enjoyable. Highly recommended!"
  },
  {
    subject: "Superb Experience",
    message: "Superb experience from start to finish! The job alerts are timely and relevant. The website design is beautiful and user-friendly. I'm grateful for this wonderful platform!"
  },
  {
    subject: "Great Success",
    message: "Great success using CareerVue! The quality of employers on this platform is top-notch. The website looks professional and is very easy to use. I landed my ideal position thanks to you!"
  },
  {
    subject: "Fantastic Service",
    message: "Fantastic service and excellent job matches! The interface is clean and modern. The website is well-designed and responsive. This is exactly what job seekers need!"
  },
  {
    subject: "Very Happy",
    message: "Very happy with the platform! The government job section is comprehensive and up-to-date. The website looks great and works smoothly. Keep up the great work!"
  },
  {
    subject: "Brilliant Platform",
    message: "Brilliant platform for job hunting! The application process is straightforward and the website design is professional and attractive. I appreciate the excellent user experience!"
  },
  {
    subject: "Top Quality",
    message: "Top quality job portal! The CV builder is intuitive and the job recommendations are accurate. The website is beautifully designed and very functional. I'm very impressed!"
  },
  {
    subject: "Awesome Features",
    message: "Awesome features and great functionality! The search filters help me find exactly what I'm looking for. The website looks modern and professional. Love it!"
  },
  {
    subject: "Highly Recommend",
    message: "I highly recommend CareerVue to all job seekers! The platform is reliable, fast, and has quality opportunities. The website design is clean and attractive. Thank you!"
  },
  {
    subject: "Perfect Match",
    message: "Found the perfect job match through your platform! The whole experience was smooth and professional. The website is well-designed and easy to navigate. Grateful for this service!"
  }
];

// Neutral/Suggestion messages
const neutralMessages = [
  {
    subject: "Suggestion for Improvement",
    message: "The platform is good but could use more filter options for job search. The website looks nice but some features could be improved. Overall decent experience."
  },
  {
    subject: "Minor Issue",
    message: "I noticed the mobile app could be faster. Otherwise, the platform works fine and the website looks professional."
  },
  {
    subject: "Feature Request",
    message: "Would be great to have salary range filters. The platform is okay but needs some improvements. The website design is good though."
  },
  {
    subject: "Average Experience",
    message: "Average experience. Some job listings are outdated. Could be better with regular updates. The website looks decent."
  },
  {
    subject: "Feedback",
    message: "The website looks good but the search results could be more accurate. Need better job matching algorithm. Some improvements needed."
  }
];

// Update existing messages
const updateMessages = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://pranavmalwatkar:Pranav@55@cluster0.lh0dbyk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB');

    // Get all existing messages
    const existingMessages = await Message.find().sort({ createdAt: 1 });
    console.log(`Found ${existingMessages.length} existing messages`);

    if (existingMessages.length === 0) {
      console.log('No messages found. Please run seed:messages first.');
      process.exit(0);
    }

    let updatedCount = 0;
    let positiveCount = 0;
    let neutralCount = 0;

    // Update each message - ALL POSITIVE
    for (let i = 0; i < existingMessages.length; i++) {
      const msg = existingMessages[i];
      
      // Use positive message template
      const template = enhancedMessages[i % enhancedMessages.length];
      
      // Update the message
      msg.subject = template.subject;
      msg.message = template.message;
      
      await msg.save();
      updatedCount++;
      positiveCount++;
      
      if (updatedCount % 5 === 0) {
        console.log(`Updated ${updatedCount} messages...`);
      }
    }

    console.log('\n✅ Update completed successfully!');
    console.log(`   - Total messages updated: ${updatedCount}`);
    console.log(`   - Positive messages: ${positiveCount}`);
    console.log(`   - Neutral messages: ${neutralCount}`);
    console.log(`   - Positive percentage: ${((positiveCount / updatedCount) * 100).toFixed(1)}%`);

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating messages:', error);
    process.exit(1);
  }
};

// Run the update function
updateMessages();
