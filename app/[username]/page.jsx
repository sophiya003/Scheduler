// app/[username]/page.jsx
import { getUserByUsername } from "@/actions/users";
import EventCard from "@/components/event-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  try {
    // Await params before using its properties
    const resolvedParams = await params;
    const { username } = resolvedParams;
    
    if (!username) {
      return {
        title: "User Not Found",
      };
    }
    
    const user = await getUserByUsername(username);

    if (!user) {
      return {
        title: "User Not Found",
      };
    }

    return {
      title: `${user.name}'s Profile | Your App Name`,
      description: `Book an event with ${user.name}. View available public events and schedules.`,
    };
  } catch (error) {
    console.error("Error in generateMetadata:", error);
    return {
      title: "User Not Found",
    };
  }
}

export default async function UserProfilePage({ params }) {
  try {
    // Await params before using its properties
    const resolvedParams = await params;
    const { username } = resolvedParams;

    if (!username) {
      notFound();
    }

    const user = await getUserByUsername(username);

    if (!user) {
      notFound();
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center mb-8">
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage src={user.imageUrl} alt={user.name} />
            <AvatarFallback>
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
          <p className="text-gray-600 text-center">
            Welcome to my scheduling page. Please select an event below to book a
            call with me.
          </p>
        </div>

        {!user.events || user.events.length === 0 ? (
          <p className="text-center text-gray-600">No public events available.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {user.events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                username={username}
                isPublic={true}
              />
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error in UserProfilePage:", error);
    notFound();
  }
}