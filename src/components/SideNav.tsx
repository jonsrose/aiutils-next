"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useMediaQuery } from "@/hooks/use-media-query";
import { LockClosedIcon, SpeakerLoudIcon } from "@radix-ui/react-icons";
import { FaUtensils } from "react-icons/fa";

const routes = [
  {
    href: "/recipe-helper",
    name: "Recipe Helper",
    icon: FaUtensils,
    protected: true,
  },
  {
    href: "/store-api-key",
    name: "Store API Key",
    icon: LockClosedIcon,
    label: "Store API Key",
  },
  {
    href: "/speech-to-text",
    name: "Speech to Text",
    icon: SpeakerLoudIcon,
    protected: true,
  },
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
                "px-2 py-1 mb-1 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2",
                pathname === route.href
                  ? "bg-accent text-accent-foreground"
                  : ""
              )}
            >
              {route.icon && <route.icon className="h-4 w-4" />}
              {route.name}
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
