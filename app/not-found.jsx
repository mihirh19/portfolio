import Link from "next/link";
import SceneOverride from "@/components/scene/SceneOverride";

export default function NotFound() {
  return (
    <section className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <SceneOverride shape="scatter" dimmed />
      <p className="font-mono text-sm text-muted">404</p>
      <h1 className="mt-4 font-display text-6xl font-semibold md:text-8xl">Lost in the cosmos</h1>
      <p className="mt-4 text-muted">This page drifted out of orbit.</p>
      <Link href="/" className="btn-primary mt-10">Back home</Link>
    </section>
  );
}
