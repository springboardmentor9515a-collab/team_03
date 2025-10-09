const mongoose = require('mongoose');
const User = require('./SchemaModels/user'); 

const MONGO_URI = 'mongodb+srv://kumarchauhanarpit_db_user:aMCoq1BgUfVtEq91@cluster1.sonyz2i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1';

const volunteerData = [
  {
    name: "Priya Mehra",
    email: "priyame11@gmail.com",
    password: "42dfgir@90", 
    role: "volunteer",
    location: "Chennai"
  },
  {
    name: "Rahul Singh",
    email: "rahulsingh@gmail.com",
    password: "Test@1234",
    role: "volunteer",
    location: "Mumbai"
  },
  {
    name: "Aarav Gupta",
    email: "aaravgupta@gmail.com",
    password: "Secure@2025",
    role: "volunteer",
    location: "Delhi"
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    await User.deleteMany({ role: "volunteer" });

    for (const v of volunteerData) {
      await User.create(v);
    }

    console.log("Volunteers seeded!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
