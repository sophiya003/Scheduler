import { db } from "@/lib/prisma";
import { clerkClient, currentUser } from "@clerk/nextjs/server";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    const loggedInUser = await db?.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    const name = `${user.firstName} ${user.lastName}`;
    const username = name.split(" ").join("-") + user.id.slice(-4);

    // Fixed clerkClient syntax for v6
    const client = await clerkClient();
    await client.users.updateUser(user.id, {
      username: username,
    });

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
        username: username,
      },
    });

    return newUser;
  } catch (error) {
    console.error("Error in checkUser:", error);
    throw new Error("Failed to create or fetch user");
  }
};