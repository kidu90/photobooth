import Photobooth from "@/components/Photobooth";

export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 text-center sm:mb-10">
        <h1 className="font-serif text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
          Photo<span className="text-rose-500">booth</span>
        </h1>
        <p className="mt-2 text-neutral-500">Strike a pose. Get a strip. Download it.</p>
      </header>
      <Photobooth />
      <footer className="mt-12 text-center text-xs text-neutral-400">
        Photos are processed in your browser and never uploaded.
      </footer>
    </main>
  );
}
