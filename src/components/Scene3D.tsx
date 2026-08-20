import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

type Variant = "hero" | "showcase";

export function Scene3D({ variant = "hero", className, active = true }: { variant?: Variant; className?: string; active?: boolean }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  useEffect(() => { activeRef.current = active; }, [active]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    // ── Renderer ──────────────────────────────────────────────────────
    // Mobile: drop DPR to 1, disable antialias, powerPreference stays high-performance
    const dpr = isMobile ? Math.min(window.devicePixelRatio, 1) : Math.min(window.devicePixelRatio, 2);
    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,   // AA is expensive on mobile GPUs
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(dpr);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "width:100%;height:100%;display:block;";

    // ── Scene ─────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, variant === "hero" ? 6 : 4.5);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    // ── Material ──────────────────────────────────────────────────────
    // Mobile: use MeshStandardMaterial (no clearcoat) — ~40% cheaper on GPU
    const goldColor = new THREE.Color("#C9A96E");
    const goldMaterial = isMobile
      ? new THREE.MeshStandardMaterial({
          color: goldColor,
          metalness: 1,
          roughness: 0.22,
          envMapIntensity: 1.2,
        })
      : new THREE.MeshPhysicalMaterial({
          color: goldColor,
          metalness: 1,
          roughness: 0.18,
          clearcoat: 1,
          clearcoatRoughness: 0.15,
          envMapIntensity: 1.4,
        });

    // ── Geometry ──────────────────────────────────────────────────────
    // Mobile: halve segment counts — imperceptible difference, big GPU win
    const meshes: THREE.Mesh[] = [];

    if (variant === "hero") {
      const segments = isMobile ? 120 : 260;
      const knot = new THREE.Mesh(
        new THREE.TorusKnotGeometry(1.4, 0.18, segments, 16, 2, 3),
        goldMaterial
      );
      scene.add(knot);
      meshes.push(knot);
    } else {
      const ringGroup = new THREE.Group();
      scene.add(ringGroup);

      const band = new THREE.Mesh(
        new THREE.TorusGeometry(1.15, 0.085, isMobile ? 32 : 48, isMobile ? 160 : 280),
        goldMaterial
      );
      band.rotation.x = Math.PI / 2.4;
      ringGroup.add(band);
      meshes.push(band);

      const innerBand = new THREE.Mesh(
        new THREE.TorusGeometry(1.05, 0.025, isMobile ? 24 : 32, isMobile ? 120 : 220),
        new THREE.MeshStandardMaterial({ color: new THREE.Color("#8a6f3d"), metalness: 1, roughness: 0.35 })
      );
      innerBand.rotation.x = Math.PI / 2.4;
      ringGroup.add(innerBand);
      meshes.push(innerBand);

      (meshes as any).__ringGroup = ringGroup;
    }

    // ── Lights ────────────────────────────────────────────────────────
    const key = new THREE.PointLight(0xfff1d0, 30, 20, 2);
    key.position.set(4, 3, 5);
    scene.add(key);
    const fill = new THREE.PointLight(0xc9a96e, 20, 20, 2);
    fill.position.set(-5, -2, 3);
    scene.add(fill);
    const rim = new THREE.PointLight(0xffffff, 15, 18, 2);
    rim.position.set(0, 4, -4);
    scene.add(rim);
    scene.add(new THREE.AmbientLight(0x1a1a1a, 1));

    // ── Resize ────────────────────────────────────────────────────────
    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // ── Mouse parallax (desktop only) ─────────────────────────────────
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let onMove: ((e: MouseEvent) => void) | null = null;
    if (!isMobile) {
      onMove = (e: MouseEvent) => {
        const r = mount.getBoundingClientRect();
        target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
        target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      };
      window.addEventListener("mousemove", onMove);
    }

    // ── Animation loop ────────────────────────────────────────────────
    // Key fix: only call requestAnimationFrame again when rendering,
    // and STOP the loop entirely (cancelAnimationFrame) when off-screen.
    let raf = 0;
    let isVisible = false;

    const io = new IntersectionObserver(([e]) => { isVisible = e.isIntersecting; }, { threshold: 0 });
    io.observe(mount);

    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);

      // Skip render work entirely if not visible or not active
      if (!isVisible || !activeRef.current || document.hidden) return;

      const t = clock.getElapsedTime();
      current.x += (target.x - current.x) * 0.05;
      current.y += (target.y - current.y) * 0.05;

      if (variant === "hero") {
        const k = meshes[0];
        k.rotation.x = t * 0.25 + current.y * 0.3;
        k.rotation.y = t * 0.35 + current.x * 0.4;
      } else {
        const p = (window as any).__lattevShowcaseScroll ?? 0;
        const group: THREE.Group = (meshes as any).__ringGroup;
        if (group) {
          const phase = p;
          group.rotation.y = t * 0.35 + phase * Math.PI * 1.6;
          group.rotation.x = Math.sin(t * 0.4) * 0.05 - phase * 0.5 + 0.15;
          group.rotation.z = current.x * 0.15;
          group.position.y = -0.1 + Math.sin(t * 0.5) * 0.05 + phase * 0.3;
          const s = 1 + phase * 0.45;
          group.scale.setScalar(s);
        }
        camera.position.z = 4.5 - p * 1.2;
      }

      camera.position.x = current.x * 0.4;
      camera.position.y = -current.y * 0.3;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      if (onMove) window.removeEventListener("mousemove", onMove);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = (m as any).material;
        if (mat) Array.isArray(mat) ? mat.forEach((x) => x.dispose()) : mat.dispose();
      });
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [variant]);

  return <div ref={mountRef} className={className} style={{ position: "absolute", inset: 0 }} />;
}
