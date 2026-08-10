import Link from "next/link";

export default function About() {
  return (
    <main className="container-page max-w-3xl py-12">
      <h1 className="text-3xl font-bold">About FindBack PH</h1>
      <div className="mt-6 space-y-4 text-slate-700">
        <p>FindBack PH is a community lost-and-found platform for the Philippines. We help connect people who lost belongings with the people who found them.</p>
        <p>Every lost item tells a story. By reporting what you found or lost, you become part of a community that helps belongings find their way home.</p>
        <p>Safety comes first: we keep private verification details out of public listings, encourage safe meetups, and never host payments between users. Verify ownership carefully before handing anything over.</p>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[["Community-driven", "Anyone can report or respond to a lost or found item."], ["Privacy first", "Serial numbers and private proof stay hidden from public listings."], ["Safety focused", "Safe-meeting guidance is built into the whole platform."]].map(([t, b]) => (
          <div className="card p-5" key={String(t)}>
            <h2 className="font-semibold">{t}</h2>
            <p className="mt-1 text-sm text-slate-600">{b}</p>
          </div>
        ))}
      </div>
      <Link href="/how-it-works" className="btn-primary mt-8">See how it works</Link>
    </main>
  );
}