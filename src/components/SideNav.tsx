"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useMediaQuery } from "@/hooks/use-media-query";

const routes = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/store-api-key",
    label: "Store API Key",
  },
  {
    href: "/recipe-helper",
    label: "Recipe Helper",
  },
  {
    href: "/speech-to-text",
    label: "Speech to Text",
  },

  // Add more routes as needed
];

interface SideNavProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SideNav({ isOpen, onOpenChange }: SideNavProps) {
  const pathname = usePathname();
  const isTablet = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const pageContent = document.getElementById("page-content");
    if (pageContent && !isTablet) {
      pageContent.style.marginLeft = isOpen ? "256px" : "0";
    }
  }, [isOpen, isTablet]);

  const handleOpenChange = (open: boolean) => {
    if (!isTablet) return; // Prevent close on desktop
    onOpenChange(open);
  };

  const handleLinkClick = () => {
    if (isTablet) {
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange} modal={isTablet}>
      <SheetContent
        side="left"
        className={cn(
          "w-64 p-0 block border-0",
          isTablet ? "pointer-events-auto" : "pointer-events-auto fixed"
        )}
        style={
          !isTablet
            ? { position: "fixed", left: 0, transform: "none" }
            : undefined
        }
      >
        <nav className="flex flex-col h-full p-4">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={handleLinkClick}
              className={cn(
                "px-2 py-1 mb-1 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors",
                pathname === route.href
                  ? "bg-accent text-accent-foreground"
                  : ""
              )}
            >
              {route.label}
            </Link>
          ))}
          <div className="mt-auto pt-4">
            <ThemeToggle />
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
