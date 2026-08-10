import Link from "next/link";

const steps = [
  ["Report the item", "Submit a lost or found report with a description, approximate location, and optional photos. Private details like serial numbers are stored securely and never shown publicly."],
  ["Get matched", "When a lost and a found report look similar, you get a match score and a notification, so the right people can find each other faster."],
  ["Chat privately", "Message the other reporter inside FindBack PH. Keep the conversation here so there is a record, and agree on a safe meeting place."],
  ["Verify ownership", "Confirm details only the true owner would know — brand, markings, serial numbers, or photos they kept. Never rely on a match score on its own."],
  ["Return or recover", "Meet in a safe public place, bring someone along, and never accept payments or OTPs. Then mark the report as recovered so everyone knows it's closed."],
];

export default function HowItWorks() {
  return (
    <main className="container-page max-w-3xl py-12">
      <h1 className="text-3xl font-bold">How FindBack PH works</h1>
      <p className="mt-3 text-slate-600">Lost-and-found helped by the community, safely.</p>
      <ol className="mt-8 space-y-4">
        {steps.map(([title, body], i) => (
          <li className="card flex gap-4 p-5" key={String(title)}>
            <b className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-700 text-white">{i + 1}</b>
            <div>
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-slate-600">{body}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-8 flex gap-3">
        <Link href="/report/lost" className="btn-primary">Report a lost item</Link>
        <Link href="/report/found" className="btn-secondary">Report a found item</Link>
      </div>
    </main>
  );
}