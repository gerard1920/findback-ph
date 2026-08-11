"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: number | string; name: string };

export function ReportForm({ type, categories }: { type: "LOST" | "FOUND"; categories: Category[] }) {
  const router = useRouter();
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [pending, setPending] = useState(false);

  function handleImages(files: FileList | null) {
    setPreviews(Array.from(files ?? []).slice(0, 5).map((file) => URL.createObjectURL(file)));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined); setSuccess(undefined); setPending(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const files = formData.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
    if (files.length > 5 || files.some((file) => file.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type))) {
      setError("Upload up to 5 JPG, PNG, or WebP images, maximum 5 MB each."); setPending(false); return;
    }
    try {
      const images: Array<{ url: string; alt: string }> = [];
      for (const file of files) {
        const imageForm = new FormData(); imageForm.append("image", file);
        const response = await fetch("/api/upload.php", { method: "POST", body: imageForm, credentials: "same-origin" });
        const result = await response.json();
        if (!response.ok || !result?.data?.url) throw new Error(result?.error || "Image upload failed.");
        images.push({ url: result.data.url, alt: String(formData.get("title") || "Item photo") });
      }
      const payload = Object.fromEntries(formData.entries()) as Record<string, string>;
      delete payload.images; payload.type = type; payload.images = images as unknown as string;
      const response = await fetch("/api/items.php", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ ...payload, images }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Unable to publish this item.");
      setSuccess("Item posted successfully. Redirecting…");
      router.push(`/items/${result.data.id}`); router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to publish this item. Please try again.");
      setPending(false);
    }
  }

  return <form onSubmit={submit} className="card mt-7 grid gap-5 p-5 sm:grid-cols-2">
    <h2 className="col-span-full text-lg font-bold">Basic information</h2>
    <label><span className="label">Item name *</span><input name="title" required maxLength={120} placeholder="e.g. Black iPhone 15" /></label>
    <label><span className="label">Category *</span><select name="categoryId" required defaultValue=""><option disabled value="">Choose a category</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
    <label><span className="label">Brand</span><input name="brand" maxLength={60} placeholder="e.g. Apple" /></label>
    <label><span className="label">Color</span><input name="color" maxLength={40} placeholder="e.g. Black" /></label>
    <label className="col-span-full"><span className="label">Description *</span><textarea name="description" required minLength={10} maxLength={5000} rows={4} placeholder="Describe the item without publishing private verification details." /></label>
    <h2 className="col-span-full text-lg font-bold">Insert images</h2>
    <label className="col-span-full"><span className="label">Item photos (optional)</span><input name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => handleImages(event.target.files)} /><span className="mt-2 block text-xs text-slate-500">Up to 5 JPG, PNG, or WebP images; 5 MB each.</span></label>
    {previews.length > 0 && <div className="col-span-full grid grid-cols-2 gap-3 sm:grid-cols-5">{previews.map((src, index) => <img key={src} src={src} alt={`Selected image ${index + 1}`} className="aspect-square w-full rounded-lg border border-slate-200 object-cover" />)}</div>}
    <h2 className="col-span-full text-lg font-bold">Approximate location & date</h2>
    <label><span className="label">Province *</span><input name="province" required maxLength={80} placeholder="Metro Manila" /></label>
    <label><span className="label">City *</span><input name="city" required maxLength={80} placeholder="Quezon City" /></label>
    <label><span className="label">Barangay</span><input name="barangay" maxLength={80} placeholder="Optional" /></label>
    <label><span className="label">Approximate location *</span><input name="approximateLocation" required maxLength={160} placeholder="Near a mall or transit station" /></label>
    <label><span className="label">Date {type === "LOST" ? "lost" : "found"} *</span><input name="dateOccurred" type="date" required /></label>
    <label><span className="label">Reward (optional)</span><input name="reward" maxLength={100} /></label>
    <h2 className="col-span-full text-lg font-bold">Private verification</h2>
    <label className="col-span-full"><span className="label">Distinguishing features</span><textarea name="distinguishingFeatures" maxLength={2000} rows={3} placeholder="For found items, keep key ownership details private." /></label>
    <label><span className="label">Serial number (private)</span><input name="privateSerial" maxLength={200} /></label>
    <label><span className="label">Private proof (optional)</span><input name="privateProof" maxLength={2000} /></label>
    <p className="self-end text-sm text-slate-500">Exact addresses and private details are never shown publicly.</p>
    {error && <p role="alert" className="col-span-full rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {success && <p role="status" className="col-span-full rounded-lg bg-green-50 p-3 text-sm text-green-700">{success}</p>}
    <button className="btn-primary col-span-full sm:justify-self-end" disabled={pending}>{pending ? "Publishing…" : `Publish ${type.toLowerCase()} item`}</button>
  </form>;
}
