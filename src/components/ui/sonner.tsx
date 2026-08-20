import React from "react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  // Mobile browsers clip bottom-right toasts behind the address bar / home
  // indicator. Use top-center on small screens for reliable visibility.
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <Sonner
      position={isMobile ? "top-center" : "bottom-right"}
      className="toaster group"
      style={{ zIndex: 9998 }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-semibold",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

