"use server";

import { checkUser } from "@/lib/checkUser"; // Use checkUser instead
import { db } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { google } from "googleapis";

export async function getUserMeetings(type = "upcoming") {
  const user = await checkUser(); // Simplified - handles auth + user lookup
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  const now = new Date();

  const meetings = await db.booking.findMany({
    where: {
      userId: user.id,
      startTime: type === "upcoming" ? { gte: now } : { lt: now },
    },
    include: {
      event: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      startTime: type === "upcoming" ? "asc" : "desc",
    },
  });

  return meetings;
}

export async function cancelMeeting(meetingId) {
  const user = await checkUser(); // Simplified - handles auth + user lookup
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  const meeting = await db.booking.findUnique({
    where: { id: meetingId },
    include: { event: true, user: true },
  });

  if (!meeting || meeting.userId !== user.id) {
    throw new Error("Meeting not found or unauthorized");
  }

  // Cancel the meeting in Google Calendar
  try {
    const client = await clerkClient(); // Fixed clerkClient syntax for v6
    const { data } = await client.users.getUserOauthAccessToken(
      meeting.user.clerkUserId,
      "oauth_google"
    );

    const token = data[0]?.token;

    if (token) {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: token });

      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      await calendar.events.delete({
        calendarId: "primary",
        eventId: meeting.googleEventId,
      });
    }
  } catch (error) {
    console.error("Failed to delete event from Google Calendar:", error);
  }

  // Delete the meeting from the database
  await db.booking.delete({
    where: { id: meetingId },
  });

  return { success: true };
}