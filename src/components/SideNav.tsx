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
import { Settings } from "lucide-react";

const routes = [
  {
    href: "/recipe-helper",
    name: "Recipe Helper",
    icon: FaUtensils,
    protected: true,
  },
  {
    href: "/settings",
    name: "Settings",
    icon: Settings,
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
    if (pageContent) {
      pageContent.style.marginLeft = (!isTablet && isOpen) ? "256px" : "0";
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
    <>
      {isTablet && isOpen && (
        <div 
          className="fixed inset-0 z-50 backdrop-blur-sm transition-all duration-100"
          onClick={() => onOpenChange(false)}
        />
      )}
      <Sheet open={isOpen} onOpenChange={handleOpenChange} modal={false}>
        <SheetContent
          side="left"
          className={cn(
            "w-64 p-0 border-r backdrop-blur-md bg-white/70 dark:bg-slate-900/70",
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
                  "px-2 py-1 mb-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center gap-2",
                  pathname === route.href
                    ? "bg-black/10 dark:bg-white/10"
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
    </>
  );
}
