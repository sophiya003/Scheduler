"use server";

import { eventSchema } from "@/app/lib/validators";
import { checkUser } from "@/lib/checkUser"; // Use checkUser instead of auth
import { db } from "@/lib/prisma";

export async function createEvent(data) {
  const user = await checkUser(); // Simplified - handles auth + user lookup

  if (!user) {
    throw new Error("Unauthorized");
  }

  const validatedData = eventSchema.parse(data);

  const event = await db.event.create({
    data: {
      ...validatedData,
      userId: user.id, // user is already from database
    },
  });

  return event;
}

export async function getUserEvents() {
  const user = await checkUser(); // Simplified - handles auth + user lookup
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  const events = await db.event.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { bookings: true },
      },
    },
  });

  return { events, username: user.username };
}

export async function deleteEvent(eventId) {
  const user = await checkUser(); // Simplified - handles auth + user lookup
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  const event = await db.event.findUnique({
    where: { id: eventId },
  });

  if (!event || event.userId !== user.id) {
    throw new Error("Event not found or unauthorized");
  }

  await db.event.delete({
    where: { id: eventId },
  });

  return { success: true };
}

export async function getEventDetails(username, eventId) {
  const event = await db.event.findFirst({
    where: {
      id: eventId,
      user: {
        username: username,
      },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          imageUrl: true,
        },
      },
    },
  });

  return event;
}