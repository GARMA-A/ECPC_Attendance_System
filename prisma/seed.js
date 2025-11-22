import { PrismaClient } from "@prisma/client";
import 'dotenv/config';
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.attendance.deleteMany();
  await prisma.qRToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Hash password
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create users
  const instructor1 = await prisma.user.create({
    data: {
      username: "instructor1",
      password: hashedPassword,
      name: "Dr. Ahmed Hassan",
      role: "instructor",
    },
  });

  const student1 = await prisma.user.create({
    data: {
      username: "student1",
      password: hashedPassword,
      name: "Mohammed Ali",
      role: "student",
      groupName: "CS-101",
    },
  });

  const student2 = await prisma.user.create({
    data: {
      username: "student2",
      password: hashedPassword,
      name: "Fatima Noor",
      role: "student",
      groupName: "CS-101",
    },
  });

  const admin1 = await prisma.user.create({
    data: {
      username: "admin1",
      password: hashedPassword,
      name: "Admin User",
      role: "admin",
    },
  });

  // Create a sample session for today
  const today = new Date();
  today.setHours(10, 0, 0, 0); // 10:00 AM

  const session1 = await prisma.session.create({
    data: {
      name: "Lecture 1: Introduction to Programming",
      courseName: "CS 101",
      date: today,
      createdBy: instructor1.id,
    },
  });

  console.log("✅ Seeding completed!");
  console.log("\n📝 Created accounts:");
  console.log("-------------------");
  console.log("Instructor:");
  console.log("  Username: instructor1");
  console.log("  Password: password123");
  console.log("  Name:", instructor1.name);
  console.log("\nStudents:");
  console.log("  Username: student1");
  console.log("  Password: password123");
  console.log("  Name:", student1.name);
  console.log("  Group:", student1.groupName);
  console.log("\n  Username: student2");
  console.log("  Password: password123");
  console.log("  Name:", student2.name);
  console.log("  Group:", student2.groupName);
  console.log("\nAdmin:");
  console.log("  Username: admin1");
  console.log("  Password: password123");
  console.log("  Name:", admin1.name);
  console.log("\n📅 Created session:");
  console.log("  ID:", session1.id);
  console.log("  Name:", session1.name);
  console.log("  Course:", session1.courseName);
  console.log("  Date:", session1.date.toLocaleString());
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
