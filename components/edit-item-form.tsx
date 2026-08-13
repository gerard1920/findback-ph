"use client";

import Image from "next/image";
import { useActionState, useRef, useState, useTransition } from "react";
import { updateItem, FormState } from "@/app/actions";

const initialState: FormState = {};

type EditImage = { id: string; url: string; alt: string | null };
type EditItem = {
  id: string;
  type: "LOST" | "FOUND";
  title: string;
  categoryId: string;
  brand: string | null;
  color: string | null;
  description: string;
  distinguishingFeatures: string | null;
  privateSerial: string | null;
  privateProof: string | null;
  reward: string | null;
  province: string;
  city: string;
  barangay: string | null;
  approximateLocation: string;
  images: EditImage[];
};

export function EditItemForm({
  item,
  categories,
  dateValue,
}: {
  item: EditItem;
  categories: { id: string; name: string }[];
  dateValue: string;
}) {
  const [state, action, pending] = useActionState(updateItem.bind(null, item.id), initialState);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, startUploading] = useTransition();

  const fileRef = useRef<HTMLInputElement>(null);

  async function handleImages(files: FileList | null) {
    if (!files?.length) return;
    const selected = Array.from(files).slice(0, 5 - uploadedUrls.length);
    if (!selected.length) return;

    startUploading(async () => {
      const form = new FormData();
      selected.forEach((file) => form.append("files", file));
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Upload failed.");
        return;
      }
      const data = (await res.json()) as { urls: string[] };
      setUploadedUrls((prev) => [...prev, ...data.urls]);
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  function removeUploadedUrl(url: string) {
    setUploadedUrls((prev) => prev.filter((u) => u !== url));
  }

  return (
    <form action={action} className="card mt-7 grid gap-5 p-5 sm:grid-cols-2">
      <h2 className="col-span-full text-lg font-bold">Edit your report</h2>

      <label><span className="label">Item name *</span><input name="title" required defaultValue={item.title} /></label>
      <label><span className="label">Category *</span><select name="categoryId" required defaultValue={item.categoryId}><option disabled value="">Choose a category</option>{categories.map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
      <label><span className="label">Brand</span><input name="brand" defaultValue={item.brand ?? ""} /></label>
      <label><span className="label">Color</span><input name="color" defaultValue={item.color ?? ""} /></label>
      <label className="col-span-full"><span className="label">Description *</span><textarea name="description" required minLength={10} maxLength={2000} rows={4} defaultValue={item.description} /></label>

      <h2 className="col-span-full text-lg font-bold">Images</h2>
      {item.images.length > 0 && (
        <div className="col-span-full">
          <span className="label">Current photos (check any to remove)</span>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {item.images.map((img) => (
              <label className="relative block" key={img.id}>
                <Image src={img.url} alt={img.alt ?? "Item photo"} width={400} height={400} className="aspect-square w-full rounded-lg border border-slate-200 object-cover" />
                <input type="checkbox" name="removeImage" value={img.id} className="absolute right-1 top-1 h-5 w-5 rounded border-slate-300" />
              </label>
            ))}
          </div>
        </div>
      )}

      <label className="col-span-full">
        <span className="label">Add more photos (optional)</span>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(event) => handleImages(event.target.files)}
        />
        <span className="mt-2 block text-xs text-slate-500">Up to 5 JPG, PNG, or WebP images, 5 MB each.</span>
      </label>

      {uploadedUrls.map((url) => (
        <div key={url} className="relative">
          <Image src={url} alt="New upload" width={400} height={400} className="aspect-square w-full rounded-lg border border-slate-200 object-cover" />
          <button
            type="button"
            onClick={() => removeUploadedUrl(url)}
            className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-rose-600 shadow-sm"
            aria-label="Remove image"
          >
            ✕
          </button>
        </div>
      ))}

      {uploadedUrls.map((url) => (
        <input key={url} type="hidden" name="newImageUrls" value={url} />
      ))}

      <h2 className="col-span-full text-lg font-bold">Location & date</h2>
      <label><span className="label">Province *</span><input name="province" required defaultValue={item.province} /></label>
      <label><span className="label">City *</span><input name="city" required defaultValue={item.city} /></label>
      <label><span className="label">Barangay</span><input name="barangay" defaultValue={item.barangay ?? ""} /></label>
      <label><span className="label">Approximate location *</span><input name="approximateLocation" required defaultValue={item.approximateLocation} /></label>
      <label><span className="label">Date {item.type === "LOST" ? "lost" : "found"} *</span><input name="dateOccurred" type="date" required defaultValue={dateValue} /></label>
      <label><span className="label">Reward (optional)</span><input name="reward" maxLength={100} defaultValue={item.reward ?? ""} /></label>

      <h2 className="col-span-full text-lg font-bold">Private verification (only you can see)</h2>
      <label className="col-span-full"><span className="label">Distinguishing features</span><textarea name="distinguishingFeatures" maxLength={1000} rows={3} defaultValue={item.distinguishingFeatures ?? ""} /></label>
      <label><span className="label">Serial number (private)</span><input name="privateSerial" maxLength={200} defaultValue={item.privateSerial ?? ""} /></label>
      <label><span className="label">Private proof (optional)</span><input name="privateProof" maxLength={2000} defaultValue={item.privateProof ?? ""} /></label>
      <p className="self-end text-sm text-slate-500">Private details never appear on the public listing.</p>

      {state.error && <p role="alert" className="col-span-full rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      {state.success && <p role="alert" className="col-span-full rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{state.success}</p>}
      <div className="col-span-full flex flex-wrap gap-3">
        <button className="btn-primary" disabled={pending || uploading}>{pending || uploading ? "Saving…" : "Save changes"}</button>
        <a className="btn-secondary" href={`/items/${item.id}`}>Cancel</a>
      </div>
    </form>
  );
}
