"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { SideNav } from "@/components/SideNav";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  const isSignInPage = pathname === '/signin';

  return (
    <div className="h-screen flex flex-col">
      {!isSignInPage && <SideNav isOpen={isOpen} onOpenChange={setIsOpen} />}
      <div
        id="page-content"
        className="flex-1 h-full flex flex-col transition-[margin] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        <header className="h-16 border-b bg-background sticky top-0 z-50">
          <div className="flex items-center justify-between h-full px-4">
            <div className="flex items-center">
              {!isSignInPage && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsOpen(!isOpen)}
                  className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    transform: isOpen ? "rotate(-90deg)" : "rotate(0deg)",
                  }}
                >
                  <Menu className="h-4 w-4" />
                </Button>
              )}
              <Link href="/" className="ml-4 font-semibold hover:opacity-80">
                AI Utils
              </Link>
            </div>
            {session?.user?.name && (
              <DropdownMenu>
                <DropdownMenuTrigger className="text-sm font-medium hover:opacity-80">
                  {session.user.name}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setShowSignOutModal(true)}
                    className="cursor-pointer"
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>
        <main className="flex-1 flex flex-col h-[calc(100vh-4rem)]">{children}</main>
      </div>

      <Dialog open={showSignOutModal} onOpenChange={setShowSignOutModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sign Out</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <p>Are you sure you want to sign out?</p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSignOutModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => signOut({ callbackUrl: '/signin' })}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
