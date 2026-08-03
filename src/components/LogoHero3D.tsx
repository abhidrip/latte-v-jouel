import type { CSSProperties } from "react";

export function LogoHero3D({ className }: { className?: string }) {
  const style: CSSProperties = {
    position: "absolute",
    top: "60%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "200%",
    height: "200%",
    border: "none",
    background: "transparent",
  };

  return (
    <iframe
      src="/lattev-hero.html"
      className={className}
      style={style}
      title="Lattév Jouel 3D Logo"
      scrolling="no"
    />
  );
}
