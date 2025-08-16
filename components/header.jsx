import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import { PenBox } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "./ui/button"

const Header
 = () => {
  return (
  <nav className="mx-auto py-2 px-4 flex justify-between">
    <Link href={"/"} className="flex items-center">
    <Image src="/sche.png" width="180" height="80" alt="scheduler-logo" className="h-16 w-auto"/>
    </Link>

    <div className="flex items-center gap-4">
      <Link href="/events?create=true">
      <Button className="flex items-center gap-2">
        <PenBox size={18}/>
        Create Event
      </Button>
      </Link>
      <SignedOut>
        <SignInButton forceRedirectUrl="/dashboard">
      <Button variant={"outline"}>
        Login
      </Button>
      </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton/>
      </SignedIn>

    </div>

  </nav>
  )
}

export default Header

