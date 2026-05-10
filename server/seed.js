import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "./database/db.js";
import User from "./models/User.js";
import Course from "./models/Course.js";
import Chapter from "./models/Chapter.js";
import Enrollment from "./models/Enrollment.js";
import LessonProgress from "./models/LessonProgress.js";

const seed = async () => {
  try {
    await connectDB();
    console.log("📦 Connected to MongoDB");

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Chapter.deleteMany({}),
      Enrollment.deleteMany({}),
      LessonProgress.deleteMany({}),
    ]);
    console.log("🗑️ Cleared existing data");

    // ── SEED USERS ──
    const password = await bcrypt.hash("password123", 10);

    const admin = await User.create({
      userName: "admin",
      userEmail: "admin@example.com",
      password,
      role: "admin",
    });

    console.log("👑 Created admin user");

    const instructor1 = await User.create({
      userName: "john_instructor",
      userEmail: "instructor@example.com",
      password,
      role: "instructor",
    });

    const instructor2 = await User.create({
      userName: "sarah_teacher",
      userEmail: "sarah@example.com",
      password,
      role: "instructor",
    });

    const student1 = await User.create({
      userName: "alice_student",
      userEmail: "student@example.com",
      password,
      role: "student",
    });

    const student2 = await User.create({
      userName: "bob_learner",
      userEmail: "bob@example.com",
      password,
      role: "student",
    });

    console.log("👤 Created 5 users (1 admin, 2 instructors, 2 students)");
    console.log("   Login: instructor@example.com / password123");
    console.log("   Login: student@example.com / password123");

    // ── SEED COURSES ──

    // Course 1: Full Stack Web Development
    const course1 = await Course.create({
      instructorId: instructor1._id,
      instructorName: "john_instructor",
      title: "Complete Full Stack Web Development",
      slug: "complete-full-stack-web-development",
      category: "Web Development",
      level: "Beginner",
      primaryLanguage: "English",
      subtitle: "Learn React, Node.js, MongoDB and more from scratch",
      smallDescription:
        "Master full stack web development with this comprehensive course covering frontend and backend technologies.",
      description:
        "This comprehensive course will take you from complete beginner to a confident full stack web developer. You'll learn React for the frontend, Node.js and Express for the backend, MongoDB for the database, and much more. Each section includes hands-on projects to reinforce your learning.\n\nBy the end of this course, you'll be able to build complete web applications from scratch and deploy them to production.",
      image:
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop",
      pricing: 49.99,
      duration: 40,
      objectives:
        "Build full-stack web applications from scratch\nMaster React, Node.js, Express, and MongoDB\nCreate RESTful APIs and connect them to frontends\nImplement authentication and authorization\nDeploy applications to production",
      welcomeMessage:
        "Welcome to the Complete Full Stack Web Development course! I'm excited to guide you through this journey. Let's build something amazing together!",
      status: "Published",
    });

    // Course 2: Python for Data Science
    const course2 = await Course.create({
      instructorId: instructor1._id,
      instructorName: "john_instructor",
      title: "Python for Data Science & Machine Learning",
      slug: "python-for-data-science-machine-learning",
      category: "Data Science",
      level: "Intermediate",
      primaryLanguage: "English",
      subtitle: "Harness the power of Python for data analysis and ML",
      smallDescription:
        "Learn Python programming for data analysis, visualization, and machine learning with real-world projects.",
      description:
        "Dive into the world of data science with Python! This course covers everything from basic Python programming to advanced machine learning algorithms. You'll work with pandas, numpy, matplotlib, scikit-learn, and more.\n\nPerfect for aspiring data scientists and analysts who want to build practical skills.",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
      pricing: 59.99,
      duration: 35,
      objectives:
        "Master Python for data analysis and visualization\nWork with pandas, numpy, and matplotlib\nBuild and train machine learning models\nUnderstand data cleaning and preprocessing\nComplete real-world data science projects",
      welcomeMessage:
        "Welcome! Get ready to unlock the power of data science with Python. Let's explore data together!",
      status: "Published",
    });

    // Course 3: UI/UX Design Fundamentals
    const course3 = await Course.create({
      instructorId: instructor2._id,
      instructorName: "sarah_teacher",
      title: "UI/UX Design Fundamentals",
      slug: "ui-ux-design-fundamentals",
      category: "Design",
      level: "Beginner",
      primaryLanguage: "English",
      subtitle: "Create beautiful and intuitive user experiences",
      smallDescription:
        "Learn the principles of UI/UX design, from wireframing to prototyping, using industry-standard tools.",
      description:
        "This course covers the complete UI/UX design process. You'll learn design thinking, user research, wireframing, prototyping, and visual design principles. Using tools like Figma, you'll create portfolio-worthy projects.\n\nNo prior design experience needed - we'll start from the fundamentals and build up.",
      image:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop",
      pricing: 39.99,
      duration: 25,
      objectives:
        "Understand UX research and user-centered design\nCreate wireframes and interactive prototypes\nApply visual design principles effectively\nMaster Figma for UI design\nBuild a professional design portfolio",
      welcomeMessage:
        "Welcome to UI/UX Design! I'm thrilled to help you start your design journey. Let's create something beautiful!",
      status: "Published",
    });

    // Course 4: Mobile App Development with React Native
    const course4 = await Course.create({
      instructorId: instructor1._id,
      instructorName: "john_instructor",
      title: "React Native Mobile App Development",
      slug: "react-native-mobile-app-development",
      category: "Mobile Development",
      level: "Intermediate",
      primaryLanguage: "English",
      subtitle: "Build cross-platform mobile apps with React Native",
      smallDescription:
        "Create stunning iOS and Android apps using React Native. Learn navigation, state management, and API integration.",
      description:
        "React Native allows you to build native mobile apps using JavaScript and React. This course covers everything from setup to deployment. You'll learn navigation, state management with Redux, API integration, push notifications, and app store deployment.\n\nBuild real-world apps that work on both iOS and Android.",
      image:
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop",
      pricing: 54.99,
      duration: 30,
      objectives:
        "Build cross-platform mobile apps with React Native\nImplement navigation and state management\nIntegrate with REST APIs and Firebase\nDeploy apps to iOS App Store and Google Play\nAdd push notifications and advanced features",
      welcomeMessage:
        "Welcome! Let's build amazing mobile apps together. React Native opens up a world of possibilities!",
      status: "Published",
    });

    // Course 5: Digital Marketing Mastery (Draft)
    const course5 = await Course.create({
      instructorId: instructor2._id,
      instructorName: "sarah_teacher",
      title: "Digital Marketing Mastery",
      slug: "digital-marketing-mastery",
      category: "Marketing",
      level: "Beginner",
      primaryLanguage: "English",
      subtitle: "Master SEO, social media, and content marketing",
      smallDescription:
        "Learn modern digital marketing strategies including SEO, social media marketing, email marketing, and analytics.",
      description:
        "This draft course will cover all aspects of digital marketing...",
      pricing: 44.99,
      duration: 20,
      objectives:
        "Master SEO and content marketing strategies\nCreate effective social media campaigns\nUnderstand email marketing and automation\nAnalyze marketing data and optimize campaigns",
      welcomeMessage: "Coming soon!",
      status: "Draft",
    });

    // Course 6: Business Strategy & Management (Draft)
    const course6 = await Course.create({
      instructorId: instructor1._id,
      instructorName: "john_instructor",
      title: "Business Strategy & Management",
      slug: "business-strategy-management",
      category: "Business",
      level: "Advanced",
      primaryLanguage: "English",
      subtitle: "Strategic thinking for business leaders",
      smallDescription:
        "Develop strategic thinking skills and learn modern management techniques for business growth.",
      description: "This draft course covers business strategy...",
      pricing: 69.99,
      duration: 15,
      objectives:
        "Develop strategic thinking capabilities\nMaster financial analysis and planning\nLead teams effectively\nDrive business growth and innovation",
      welcomeMessage: "Coming soon!",
      status: "Draft",
    });

    console.log("📚 Created 6 courses (4 published, 2 drafts)");

    // ── SEED CHAPTERS & LESSONS ──

    // Chapters for Course 1: Full Stack Web Development
    const ch1_1 = await Chapter.create({
      title: "Getting Started with Web Development",
      position: 0,
      courseId: course1._id,
      lessons: [
        {
          title: "Introduction to the Course",
          description:
            "Overview of what you'll learn and how to make the most of this course.",
          position: 0,
          duration: 10,
          freePreview: true,
        },
        {
          title: "Setting Up Your Development Environment",
          description:
            "Install VS Code, Node.js, Git, and all necessary tools.",
          position: 1,
          duration: 15,
          freePreview: true,
        },
        {
          title: "How the Internet Works",
          description:
            "Understanding HTTP, DNS, servers, and how web applications communicate.",
          position: 2,
          duration: 12,
          freePreview: false,
        },
      ],
    });

    const ch1_2 = await Chapter.create({
      title: "HTML & CSS Foundations",
      position: 1,
      courseId: course1._id,
      lessons: [
        {
          title: "HTML5 Semantic Elements",
          description:
            "Learn about semantic HTML tags and proper document structure.",
          position: 0,
          duration: 20,
          freePreview: true,
        },
        {
          title: "CSS Flexbox & Grid Layouts",
          description:
            "Master modern CSS layout techniques with Flexbox and Grid.",
          position: 1,
          duration: 25,
          freePreview: false,
        },
        {
          title: "Responsive Design Principles",
          description:
            "Make your websites look great on all devices using media queries.",
          position: 2,
          duration: 18,
          freePreview: false,
        },
      ],
    });

    const ch1_3 = await Chapter.create({
      title: "JavaScript Fundamentals",
      position: 2,
      courseId: course1._id,
      lessons: [
        {
          title: "Variables, Data Types & Functions",
          description: "Core JavaScript concepts every developer must know.",
          position: 0,
          duration: 22,
          freePreview: false,
        },
        {
          title: "DOM Manipulation & Events",
          description:
            "Learn how to interact with the Document Object Model.",
          position: 1,
          duration: 20,
          freePreview: false,
        },
        {
          title: "Async JavaScript: Promises & Async/Await",
          description:
            "Handle asynchronous operations like API calls effectively.",
          position: 2,
          duration: 25,
          freePreview: false,
        },
      ],
    });

    const ch1_4 = await Chapter.create({
      title: "React Frontend Framework",
      position: 3,
      courseId: course1._id,
      lessons: [
        {
          title: "React Components & JSX",
          description:
            "Build reusable UI components with React and JSX syntax.",
          position: 0,
          duration: 20,
          freePreview: false,
        },
        {
          title: "State Management with Hooks",
          description:
            "Manage component state using useState, useEffect, and custom hooks.",
          position: 1,
          duration: 25,
          freePreview: false,
        },
        {
          title: "React Router & Navigation",
          description: "Implement client-side routing in your React apps.",
          position: 2,
          duration: 15,
          freePreview: false,
        },
      ],
    });

    // Chapters for Course 2: Python for Data Science
    const ch2_1 = await Chapter.create({
      title: "Python Essentials",
      position: 0,
      courseId: course2._id,
      lessons: [
        {
          title: "Why Python for Data Science?",
          description:
            "Understand why Python is the language of choice for data scientists.",
          position: 0,
          duration: 8,
          freePreview: true,
        },
        {
          title: "Python Basics: Variables & Data Structures",
          description:
            "Learn lists, dictionaries, tuples, and sets in Python.",
          position: 1,
          duration: 20,
          freePreview: true,
        },
        {
          title: "Control Flow & Functions",
          description: "Master loops, conditionals, and function definitions.",
          position: 2,
          duration: 18,
          freePreview: false,
        },
      ],
    });

    const ch2_2 = await Chapter.create({
      title: "Data Analysis with Pandas",
      position: 1,
      courseId: course2._id,
      lessons: [
        {
          title: "Introduction to Pandas DataFrames",
          description: "Load, inspect, and manipulate tabular data with Pandas.",
          position: 0,
          duration: 22,
          freePreview: false,
        },
        {
          title: "Data Cleaning Techniques",
          description: "Handle missing values, duplicates, and data transformations.",
          position: 1,
          duration: 20,
          freePreview: false,
        },
      ],
    });

    // Chapters for Course 3: UI/UX Design
    const ch3_1 = await Chapter.create({
      title: "Design Thinking & Research",
      position: 0,
      courseId: course3._id,
      lessons: [
        {
          title: "What is UX Design?",
          description: "Understanding user experience and its importance.",
          position: 0,
          duration: 10,
          freePreview: true,
        },
        {
          title: "User Research Methods",
          description:
            "Learn interviews, surveys, and usability testing techniques.",
          position: 1,
          duration: 15,
          freePreview: true,
        },
      ],
    });

    const ch3_2 = await Chapter.create({
      title: "Wireframing & Prototyping",
      position: 1,
      courseId: course3._id,
      lessons: [
        {
          title: "Introduction to Figma",
          description: "Get started with the industry-standard design tool.",
          position: 0,
          duration: 20,
          freePreview: false,
        },
        {
          title: "Creating Interactive Prototypes",
          description: "Turn your wireframes into clickable prototypes.",
          position: 1,
          duration: 25,
          freePreview: false,
        },
      ],
    });

    // Chapters for Course 4: React Native
    const ch4_1 = await Chapter.create({
      title: "React Native Fundamentals",
      position: 0,
      courseId: course4._id,
      lessons: [
        {
          title: "What is React Native?",
          description: "Understanding cross-platform mobile development.",
          position: 0,
          duration: 10,
          freePreview: true,
        },
        {
          title: "Setting Up Your Environment",
          description: "Install Expo, Xcode, and Android Studio.",
          position: 1,
          duration: 20,
          freePreview: true,
        },
        {
          title: "Core Components & Styling",
          description: "Learn View, Text, Image, and StyleSheet.",
          position: 2,
          duration: 18,
          freePreview: false,
        },
      ],
    });

    const ch4_2 = await Chapter.create({
      title: "Navigation & State",
      position: 1,
      courseId: course4._id,
      lessons: [
        {
          title: "React Navigation Setup",
          description: "Implement stack, tab, and drawer navigation.",
          position: 0,
          duration: 22,
          freePreview: false,
        },
        {
          title: "State Management with Context",
          description: "Manage global state across your mobile app.",
          position: 1,
          duration: 20,
          freePreview: false,
        },
      ],
    });

    // Chapters for Course 5 (Draft)
    const ch5_1 = await Chapter.create({
      title: "Introduction to Digital Marketing",
      position: 0,
      courseId: course5._id,
      lessons: [
        {
          title: "Course Overview",
          position: 0,
          duration: 5,
          freePreview: true,
        },
      ],
    });

    // Chapters for Course 6 (Draft)
    const ch6_1 = await Chapter.create({
      title: "Strategic Thinking",
      position: 0,
      courseId: course6._id,
      lessons: [
        {
          title: "Introduction to Strategy",
          position: 0,
          duration: 5,
          freePreview: true,
        },
      ],
    });

    console.log("📖 Created 14 chapters with lessons");

    // ── SEED ENROLLMENTS ──
    await Enrollment.create({
      userId: student1._id,
      courseId: course1._id,
      amount: course1.pricing,
      status: "Active",
    });

    await Enrollment.create({
      userId: student1._id,
      courseId: course3._id,
      amount: course3.pricing,
      status: "Active",
    });

    await Enrollment.create({
      userId: student2._id,
      courseId: course1._id,
      amount: course1.pricing,
      status: "Active",
    });

    await Enrollment.create({
      userId: student2._id,
      courseId: course2._id,
      amount: course2.pricing,
      status: "Active",
    });

    await Enrollment.create({
      userId: student2._id,
      courseId: course4._id,
      amount: course4.pricing,
      status: "Active",
    });

    console.log("📝 Created 5 enrollments");

    // ── SEED LESSON PROGRESS (student1 has progress in course1) ──
    const course1Chapters = await Chapter.find({ courseId: course1._id }).sort({
      position: 1,
    });

    // Mark first 3 lessons as complete for student1 in course1
    const lessonIds = course1Chapters
      .slice(0, 2)
      .flatMap((ch) => ch.lessons.slice(0, 2))
      .map((l) => l._id.toString());

    for (const lessonId of lessonIds) {
      await LessonProgress.create({
        userId: student1._id,
        lessonId,
        courseId: course1._id,
        completed: true,
      });
    }

    // Mark first lesson as complete for student2 in course1
    const firstLessonId = course1Chapters[0]?.lessons[0]?._id?.toString();
    if (firstLessonId) {
      await LessonProgress.create({
        userId: student2._id,
        lessonId: firstLessonId,
        courseId: course1._id,
        completed: true,
      });
    }

    console.log("✅ Created lesson progress entries");

    // ── SUMMARY ──
    console.log("\n═══════════════════════════════════════");
    console.log("  🌱 SEED COMPLETE!");
    console.log("═══════════════════════════════════════");
    console.log(`  Users:        5 (1 admin, 2 instructors, 2 students)`);
    console.log(`  Courses:      6 (4 published, 2 drafts)`);
    console.log(`  Chapters:     14`);
    console.log(`  Lessons:      28`);
    console.log(`  Enrollments:  5`);
    console.log(`  Progress:     5 completed lessons`);
    console.log("═══════════════════════════════════════");
  console.log("\n📧 Test Accounts:");
  console.log("   Admin:      admin@example.com / password123");
  console.log("   Instructor: instructor@example.com / password123");
  console.log("   Student:    student@example.com / password123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
};

seed();