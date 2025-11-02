import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careervue', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'malwatkarpranav@gmail.com' });

    if (existingAdmin) {
      console.log('Admin account already exists with email: malwatkarpranav@gmail.com');
      console.log('Updating password...');

      // Update the password
      existingAdmin.password = 'Admin@1234';
      await existingAdmin.save();

      console.log('Admin password updated successfully');
    } else {
      // Create new admin
      const admin = new Admin({
        name: 'Pranav Malwatkar',
        email: 'malwatkarpranav@gmail.com',
        password: 'Admin@1234',
        role: 'super_admin',
        department: 'IT',
        permissions: {
          users: {
            view: true,
            create: true,
            edit: true,
            delete: true
          },
          jobs: {
            view: true,
            create: true,
            edit: true,
            delete: true
          },
          applications: {
            view: true,
            create: true,
            edit: true,
            delete: true
          },
          analytics: {
            view: true
          },
          settings: {
            view: true,
            edit: true
          }
        },
        isActive: true
      });

      await admin.save();
      console.log('Admin account created successfully');
      console.log('Email: malwatkarpranav@gmail.com');
      console.log('Password: Admin@1234');
    }

    console.log('Admin setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

// Run the seed function
seedAdmin();