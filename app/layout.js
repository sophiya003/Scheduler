import CreateEventDrawer from "@/components/create-event";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { Suspense } from "react"; // Add this import
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Schedulrr",
  description: " ",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Header />
          <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            {children}
          </main>
          <footer className="bg-blue-100 py-12">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>💗💗💗Made By Sophiya 💗💗💗</p>
            </div>
          </footer>
          <Suspense fallback={null}>
            <CreateEventDrawer />
          </Suspense>
        </body>
      </html>
    </ClerkProvider>
  );
}