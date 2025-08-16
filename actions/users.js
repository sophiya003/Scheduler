"use server";

import { checkUser } from "@/lib/checkUser"; // Use checkUser instead of auth
import { db } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

export async function updateUsername(username) {
  const user = await checkUser(); // Simplified - handles auth + user lookup
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Check if username is already taken
  const existingUser = await db.user.findUnique({
    where: { username },
  });

  if (existingUser && existingUser.id !== user.id) { // Use user.id instead of userId
    throw new Error("Username is already taken");
  }

  // Update username in database
  await db.user.update({
    where: { id: user.id }, // Use user.id instead of clerkUserId
    data: { username },
  });

  // Update username in Clerk
  try {
    const client = await clerkClient(); // Fixed clerkClient syntax for v6
    await client.users.updateUser(user.clerkUserId, { // Use user.clerkUserId
      username,
    });
  } catch (error) {
    console.error("Failed to update username in Clerk:", error);
    // Don't throw error here - database update succeeded
  }

  return { success: true };
}

export async function getUserByUsername(username) {
  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      email: true,
      username: true, // Added this - was missing!
      imageUrl: true,
      events: {
        where: {
          isPrivate: false,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          title: true,
          description: true,
          duration: true,
          isPrivate: true,
          _count: {
            select: { bookings: true },
          },
        },
      },
    },
  });

  return user;
}