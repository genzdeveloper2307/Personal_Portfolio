/**
 * Seeds the Projects collection with Akash's current portfolio projects.
 *
 * Usage:
 *   npm run seed:projects
 *   (or) node scripts/seedProjects.js
 *
 * This script connects to the database defined by MONGO_URI in .env,
 * removes any existing projects, and inserts the list below. Run it
 * again any time you want to reset the projects back to this list.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const Project = require("../src/models/Project");

const GITHUB_URL = "https://github.com/fullstackdeveloper2307";

const projects = [
  {
    title: "Personal Portfolio",
    description:
      "My personal developer portfolio website showcasing my projects, skills, and experience, built with React and Vite.",
    category: "Portfolio",
    technologies: ["HTML", "CSS", "JavaScript", "React"],
    github: GITHUB_URL,
    liveDemo: "",
    image: "",
    featured: true,
    active: true,
    order: 1,
  },
  {
    title: "Menskart E-commerce",
    description:
      "An e-commerce web application concept for a men's fashion store, built with core web technologies.",
    category: "E-commerce",
    technologies: ["HTML", "CSS", "JavaScript"],
    github: GITHUB_URL,
    liveDemo: "",
    image: "",
    featured: false,
    active: true,
    order: 2,
  },
  {
    title: "AI WeatherWise",
    description:
      "A full-stack weather application that provides real-time weather information, built with the MERN-style stack.",
    category: "Full Stack",
    technologies: ["React", "Node.js", "Express.js", "MongoDB"],
    github: GITHUB_URL,
    liveDemo: "",
    image: "",
    featured: true,
    active: true,
    order: 3,
  },
];

const seedProjects = async () => {
  try {
    await connectDB();

    console.log("🗑️  Removing existing projects...");
    await Project.deleteMany({});

    console.log("🌱 Inserting seed projects...");
    const created = await Project.insertMany(projects);

    console.log(`✅ Successfully seeded ${created.length} projects:`);
    created.forEach((p) => console.log(`   - ${p.title}`));

    process.exit(0);
  } catch (err) {
    console.error(`❌ Seeding failed: ${err.message}`);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

seedProjects();
