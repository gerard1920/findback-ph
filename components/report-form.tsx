"use client";

import { useActionState, useState } from "react";
import { createItem, FormState } from "@/app/actions";

const initialState: FormState = {};

export function ReportForm({ type, categories }: { type: "LOST" | "FOUND"; categories: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(createItem.bind(null, type), initialState);
  const [previews, setPreviews] = useState<string[]>([]);

  function handleImages(files: FileList | null) {
    const selected = Array.from(files ?? []).slice(0, 5);
    setPreviews(selected.map((file) => URL.createObjectURL(file)));
  }

  return <form action={action} className="card mt-7 grid gap-5 p-5 sm:grid-cols-2">
    <h2 className="col-span-full text-lg font-bold">Basic information</h2>
    <label><span className="label">Item name *</span><input name="title" required placeholder="e.g. Black iPhone 15" /></label>
    <label><span className="label">Category *</span><select name="categoryId" required defaultValue=""><option disabled value="">Choose a category</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
    <label><span className="label">Brand</span><input name="brand" placeholder="e.g. Apple" /></label>
    <label><span className="label">Color</span><input name="color" placeholder="e.g. Black" /></label>
    <label className="col-span-full"><span className="label">Description *</span><textarea name="description" required minLength={10} rows={4} placeholder="Describe the item without publishing private verification details." /></label>

    <h2 className="col-span-full text-lg font-bold">Insert images</h2>
    <label className="col-span-full"><span className="label">Item photos (optional)</span><input name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => handleImages(event.target.files)} /><span className="mt-2 block text-xs text-slate-500">Upload up to 5 JPG, PNG, or WebP images. Maximum 5 MB per image.</span></label>
    {previews.length > 0 && <div className="col-span-full grid grid-cols-2 gap-3 sm:grid-cols-5">{previews.map((src, index) => <img key={src} src={src} alt={`Selected image ${index + 1}`} className="aspect-square w-full rounded-lg border border-slate-200 object-cover" />)}</div>}

    <h2 className="col-span-full text-lg font-bold">Approximate location & date</h2>
    <label><span className="label">Province *</span><input name="province" required placeholder="Metro Manila" /></label>
    <label><span className="label">City *</span><input name="city" required placeholder="Quezon City" /></label>
    <label><span className="label">Barangay</span><input name="barangay" placeholder="Optional" /></label>
    <label><span className="label">Approximate location *</span><input name="approximateLocation" required placeholder="Near a mall or transit station" /></label>
    <label><span className="label">Date {type === "LOST" ? "lost" : "found"} *</span><input name="dateOccurred" type="date" required /></label>
    <label><span className="label">Reward (optional)</span><input name="reward" maxLength={100} /></label>

    <h2 className="col-span-full text-lg font-bold">Private verification</h2>
    <label className="col-span-full"><span className="label">Distinguishing features</span><textarea name="distinguishingFeatures" rows={3} placeholder="For found items, keep key ownership details private." /></label>
    <label><span className="label">Serial number (private)</span><input name="privateSerial" /></label><label><span className="label">Private proof (optional)</span><input name="privateProof" placeholder="Written proof only the rightful owner would have" /></label>
    <p className="self-end text-sm text-slate-500">Exact addresses and private details are never shown publicly.</p>
    {state.error && <p role="alert" className="col-span-full rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
    <button className="btn-primary col-span-full sm:justify-self-end" disabled={pending}>{pending ? "Publishing…" : `Publish ${type.toLowerCase()} item`}</button>
  </form>;
}
