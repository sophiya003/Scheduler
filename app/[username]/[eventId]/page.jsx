// app/[username]/[eventId]/page.jsx
import { getEventAvailability } from "@/actions/availability";
import { getEventDetails } from "@/actions/events";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import BookingForm from "./_components/booking-form";
import EventDetails from "./_components/event-details";

export async function generateMetadata({ params }) {
  // Await params before using its properties
  const { username, eventId } = await params;
  const event = await getEventDetails(username, eventId);

  if (!event) {
    return {
      title: "Event Not Found",
    };
  }

  return {
    title: `Book ${event.title} with ${event.user.name} | Your App Name`,
    description: `Schedule a ${event.duration}-minute ${event.title} event with ${event.user.name}.`,
  };
}

export default async function EventBookingPage({ params }) {
  // Await params before using its properties
  const { username, eventId } = await params;
  
  const event = await getEventDetails(username, eventId);
  const availability = await getEventAvailability(eventId);

  if (!event) {
    notFound();
  }

  return (
    <div className="flex flex-col justify-center lg:flex-row px-4 py-8">
      <EventDetails event={event} />
      <Suspense fallback={<div>Loading booking form...</div>}>
        <BookingForm event={event} availability={availability} />
      </Suspense>
    </div>
  );
}