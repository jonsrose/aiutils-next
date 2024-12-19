'use client';
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface SideNavClientProps {
  isOpen: boolean;
  children: React.ReactNode;
}

const SIDENAV_STATE_KEY = 'sidenav-state';

export function SideNavClient({ isOpen: initialIsOpen, children }: SideNavClientProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const isTablet = useMediaQuery("(max-width: 768px)");

  // Set initial margin without animation
  useEffect(() => {
    const pageContent = document.getElementById("page-content");
    if (pageContent && !isTablet && initialIsOpen) {
      pageContent.style.marginLeft = "256px";
    }
    setMounted(true);
  }, [initialIsOpen, isTablet]);

  // Handle subsequent margin changes with animation
  useEffect(() => {
    if (!mounted) return;
    const pageContent = document.getElementById("page-content");
    if (pageContent) {
      pageContent.style.marginLeft = (!isTablet && isOpen) ? "256px" : "0";
    }
  }, [isOpen, isTablet, mounted]);

  useEffect(() => {
    if (!isTablet) {
      document.cookie = `${SIDENAV_STATE_KEY}=${isOpen}; path=/`;
    }
  }, [isOpen, isTablet]);

  const handleOpenChange = (open: boolean) => {
    if (!isTablet) return; // Prevent close on desktop
    setIsOpen(open);
  };

  return (
    <>
      {isTablet && isOpen && (
        <div 
          className="fixed inset-0 z-50 backdrop-blur-sm transition-all duration-100"
          onClick={() => setIsOpen(false)}
        />
      )}
      <Sheet open={isOpen} onOpenChange={handleOpenChange} modal={false}>
        <SheetContent
          side="left"
          className={cn(
            "w-64 p-0 border-r backdrop-blur-md bg-white/70 dark:bg-slate-900/70",
            isTablet ? "pointer-events-auto" : "pointer-events-auto fixed",
            !mounted && initialIsOpen ? "!transform-none" : ""
          )}
          style={
            !isTablet
              ? { 
                  position: "fixed", 
                  left: 0, 
                  transform: initialIsOpen ? "translateX(0)" : undefined,
                  transition: !mounted ? "none" : undefined
                }
              : undefined
          }
        >
          <nav className="flex flex-col h-full p-4">
            {children}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}