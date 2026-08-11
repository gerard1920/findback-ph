"use client";
import { useActionState, useMemo, useRef, useState } from "react";
import { createItemReport, type FormState } from "@/app/actions";
import {
  Package,
  Hash,
  CalendarClock,
  MapPin,
  ImagePlus,
  Gift,
  Shield,
  X,
  Plus,
  Map,
  Clock,
} from "lucide-react";

type Category = { id: string; name: string };

const PROVINCES = [
  "Metro Manila",
  "Cebu",
  "Davao del Sur",
  "Pampanga",
  "Bulacan",
  "Cavite",
  "Laguna",
  "Batangas",
  "Rizal",
  "Quezon",
  "Benguet",
  "Iloilo",
  "Negros Oriental",
  "Pangasinan",
  "Other",
];

const CITIES_BY_PROVINCE: Record<string, string[]> = {
  "Metro Manila": ["Quezon City", "Manila", "Makati", "Taguig", "Pasay", "Caloocan", "Parañaque", "Mandaluyong", "San Juan", "Marikina", "Muntinlupa", "Las Piñas", "Valenzuela", "Malabon", "Navotas", "Pateros"],
  "Cebu": ["Cebu City", "Lapu-Lapu", "Mandaue", "Talisay", "Danao", "Toledo", "Carcar", "Naga"],
  "Davao del Sur": ["Davao City", "Digos", "Tagum", "Panabo", "Samal", "Mati"],
  Pampanga: ["San Fernando", "Angeles", "Mabalacat", "Guagua", "Lubao", "Floridablanca", "Porac", "Bacolor"],
  Bulacan: ["Malolos", "San Jose del Monte", "Meycauayan", "Bocaue", "Marilao", "Santa Maria", "Pulilan", "Plaridel"],
  Cavite: ["Imus", "Dasmariñas", "Bacoor", "General Trias", "Cavite City", "Tagaytay", "Trece Martires", "Kawit"],
  Laguna: ["Santa Rosa", "Calamba", "San Pedro", "Biñan", "Cabuyao", "San Pablo", "Santa Cruz", "Calauan"],
  Batangas: ["Batangas City", "Lipa", "Tanauan", "Santo Tomas", "Nasugbu", "Taal", "Balayan", "Calaca"],
  Rizal: ["Antipolo", "Cainta", "Taytay", "Binangonan", "Pasig (Rizal)", "Morong", "Baras", "Rodriguez"],
  Quezon: ["Lucena", "Tayabas", "Sariaya", "Lucban", "Candelaria", "Pagbilao", "Atimonan", "Mauban"],
  Benguet: ["Baguio", "La Trinidad", "Itogon", "Tuba", "Sablan", "Tublay", "Kapangan", "Bokod"],
  Iloilo: ["Iloilo City", "Passi", "Janiuay", "Santa Barbara", "Pavia", "Oton", "Pototan", "Dumangas"],
  "Negros Oriental": ["Dumaguete", "Bais", "Tanjay", "Bayawan", "Valencia", "Guihulngan", "Canlaon", "Ayungon"],
  Pangasinan: ["Dagupan", "San Carlos", "Urdaneta", "Lingayen", "Calasiao", "Mangaldan", "Dagupan", "San Fabian"],
  Other: [],
};

export function EnhancedReportForm({
  type,
  categories,
}: {
  type: "LOST" | "FOUND";
  categories: Category[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(createItemReport, {});
  const [images, setImages] = useState<{ url: string; alt?: string }[]>([]);
  const [province, setProvince] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [dateOccurred, setDateOccurred] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [timeOccurred, setTimeOccurred] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const citiesForProvince = useMemo(() => CITIES_BY_PROVINCE[province] ?? [], [province]);

  function addImageFile(files: FileList | null) {
    if (!files || files.length === 0) return;
    const arr = Array.from(files)
      .filter(
        (f) =>
          ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(f.type) &&
          f.size <= 5 * 1024 * 1024
      )
      .slice(0, 5 - images.length);
    setImages((prev) => [
      ...prev,
      ...arr.map((f) => ({ url: URL.createObjectURL(f), alt: f.name })),
    ]);
  }

  function addImageUrl(url: string) {
    if (!url || images.length >= 5) return;
    if (!/^https?:\/\//i.test(url)) return;
    setImages((prev) => [...prev, { url }]);
  }

  function removeImageAt(i: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  }

  const banner =
    type === "LOST"
      ? {
          icon: "🔴",
          title: "Lost item report",
          subtitle: "Be as specific as possible so finders can recognize your item and verify ownership privately.",
          color: "from-rose-50 to-pink-50 ring-rose-200 text-rose-900",
        }
      : {
          icon: "🔵",
          title: "Found item report",
          subtitle: "Share what you found publicly. Keep sensitive details (serial #, scratches) for owner verification.",
          color: "from-sky-50 to-cyan-50 ring-sky-200 text-sky-900",
        };

  return (
    <form
      action={formAction}
      className="mt-8 space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
    >
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="images" value={JSON.stringify(images.map((i) => i.url))} />
      <input type="hidden" name="timeOccurred" value={timeOccurred} />

      <div className={`rounded-xl bg-gradient-to-br p-4 ring-1 ${banner.color}`}>
        <div className="flex items-start gap-3">
          <div className="text-3xl leading-none">{banner.icon}</div>
          <div>
            <h2 className="text-lg font-bold">{banner.title}</h2>
            <p className="mt-0.5 text-sm opacity-90">{banner.subtitle}</p>
          </div>
        </div>
      </div>

      {/* SECTION 1: Basic info */}
      <Section heading="Basic information" icon={Package} subheading="Title & category">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="label">Item title <span className="text-rose-600">*</span></span>
            <input
              name="title"
              required
              maxLength={120}
              minLength={5}
              placeholder={type === "LOST" ? "e.g. Black iPhone 15 Pro with red case" : "e.g. Brown leather wallet with coins & cards"}
            />
            <p className="mt-1 text-xs text-slate-500">Write a concise, descriptive title — this is how people will find your post.</p>
          </label>
          <label>
            <span className="label">Type <span className="text-rose-600">*</span></span>
            <select name="typeDisplay" disabled defaultValue={type} className="bg-slate-50 text-slate-700">
              <option value="LOST">🔴 Lost</option>
              <option value="FOUND">🔵 Found</option>
            </select>
          </label>
          <label>
            <span className="label">Category <span className="text-rose-600">*</span></span>
            <select name="categoryId" required defaultValue="">
              <option disabled value="">— Select a category —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
        </div>
      </Section>

      {/* SECTION 2: Item details / Description */}
      <Section heading="Item details & description" icon={Hash} subheading="Brand, color, serial #, marks">
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="label">Brand</span>
            <input name="brand" maxLength={60} placeholder="e.g. Apple, Adidas, SM Accessories" />
          </label>
          <label>
            <span className="label">Color</span>
            <input name="color" maxLength={40} placeholder="e.g. Midnight black, navy blue" />
          </label>
          <label>
            <span className="label">Serial number / unique ID</span>
            <input
              name="serialNumber"
              maxLength={120}
              placeholder="IMEI, plate number, card #, license key…"
            />
          </label>
          <label>
            <span className="label">Distinguishing marks / features</span>
            <input
              name="distinguishingFeatures"
              maxLength={250}
              placeholder="Scratches, stickers, engraving, custom case"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="label">Detailed description <span className="text-rose-600">*</span></span>
            <textarea
              name="description"
              required
              minLength={20}
              maxLength={5000}
              rows={4}
              placeholder={
                type === "LOST"
                  ? "Describe what it looks like, where it was lost, what's inside, any accessories, stickers, customizations, contents, and anything else that would help identify it."
                  : "Describe the item (size, model, material), where it was found (e.g. under a bench, in a taxi backseat), and any notable features. Do NOT publish serial numbers publicly if you can keep them for private verification."
              }
            />
            <p className="mt-1 text-xs text-slate-500">Min. 20 characters. Be specific — good descriptions dramatically improve recovery.</p>
          </label>
        </div>
      </Section>

      {/* SECTION 3: Date & Time Occurred */}
      <Section heading="Date &amp; time occurred" icon={CalendarClock} subheading={`When was the item ${type === "LOST" ? "last seen" : "discovered"}?`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="label flex items-center gap-1"><CalendarClock size={14} /> Date <span className="text-rose-600">*</span></span>
            <input
              name="dateOccurred"
              type="date"
              required
              value={dateOccurred}
              onChange={(e) => setDateOccurred(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
            />
          </label>
          <label>
            <span className="label flex items-center gap-1"><Clock size={14} /> Approximate time <span className="text-rose-600">*</span></span>
            <input
              type="time"
              required
              value={timeOccurred}
              onChange={(e) => setTimeOccurred(e.target.value)}
            />
          </label>
        </div>
      </Section>

      {/* SECTION 4: Location */}
      <Section heading="Location" icon={MapPin} subheading="Where did this happen?">
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="label">Province <span className="text-rose-600">*</span></span>
            <select
              name="province"
              required
              value={province}
              onChange={(e) => {
                setProvince(e.target.value);
                setCity("");
              }}
            >
              <option value="">— Select province —</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">City / Municipality <span className="text-rose-600">*</span></span>
            {citiesForProvince.length > 0 ? (
              <select
                name="city"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="">— Select city —</option>
                {citiesForProvince.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            ) : (
              <input
                name="city"
                required
                maxLength={80}
                placeholder="Enter city or municipality"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            )}
          </label>
          <label>
            <span className="label">Barangay (optional)</span>
            <input name="barangay" maxLength={80} placeholder="e.g. Poblacion, San Isidro" />
          </label>
          <label className="sm:col-span-2">
            <span className="label">Approximate location / landmark <span className="text-rose-600">*</span></span>
            <input
              name="approximateLocation"
              required
              minLength={5}
              maxLength={200}
              placeholder="e.g. SM Mall of Asia - North Wing near food court, or inside Jeepney route 10"
            />
          </label>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
            <div className="mb-3 flex items-center gap-2">
              <Map size={16} className="text-slate-600" />
              <p className="text-sm font-semibold text-slate-800">Pin on map (optional)</p>
              <span className="ml-auto rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                ⚡ Auto-suggested
              </span>
            </div>
            <p className="mb-3 text-xs text-slate-500">
              If you have exact coordinates (from Google Maps right-click → What&apos;s here?), paste them below for a precise pin.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="text-xs font-medium text-slate-600">Latitude</span>
                <input
                  name="latitude"
                  type="number"
                  step="0.000001"
                  min="-90"
                  max="90"
                  placeholder="e.g. 14.599512"
                />
              </label>
              <label>
                <span className="text-xs font-medium text-slate-600">Longitude</span>
                <input
                  name="longitude"
                  type="number"
                  step="0.000001"
                  min="-180"
                  max="180"
                  placeholder="e.g. 120.984222"
                />
              </label>
            </div>
          </div>
        </div>
      </Section>

      {/* SECTION 5: Images */}
      <Section heading="Photos of the item" icon={ImagePlus} subheading="Upload up to 5 images (recommended)">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center">
              <ImagePlus size={28} className="mx-auto text-slate-400" />
              <p className="mt-2 text-sm font-medium text-slate-700">Upload photos</p>
              <p className="mt-1 text-xs text-slate-500">JPG, PNG, or WebP. Max 5 MB each.</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={(e) => addImageFile(e.target.files)}
                className="mt-3 block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
              />
            </div>
            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-700">Or paste image URLs</p>
              <p className="mt-1 text-xs text-slate-500">Use Imgur, Cloudinary, or any direct image link.</p>
              <PasteUrlRow onAdd={addImageUrl} disabled={images.length >= 5} />
            </div>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {images.map((img, idx) => (
                <div key={`${img.url}-${idx}`} className="relative group aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                  <img src={img.url} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImageAt(idx)}
                    className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-rose-600 shadow-sm opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                    aria-label="Remove image"
                  >
                    <X size={14} />
                  </button>
                  <div className="absolute bottom-1.5 left-1.5 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {idx + 1} / 5
                  </div>
                </div>
              ))}
              {images.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 bg-white text-slate-500 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
                >
                  <Plus size={20} />
                  <span className="text-xs font-medium">Add</span>
                </button>
              )}
            </div>
          )}
        </div>
      </Section>

      {/* SECTION 6: Reward + Verification */}
      <Section heading="Reward &amp; verification" icon={Gift} subheading="Optional incentives and verification notes">
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="label">Reward / incentive (optional)</span>
            <input
              name="reward"
              maxLength={120}
              placeholder={type === "LOST" ? "e.g. ₱1,000 cash reward + happy meal!" : "e.g. Will ship back at my expense"}
            />
          </label>
          <div className="flex flex-col justify-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">
            <p className="inline-flex items-center gap-1.5 font-semibold">
              <Shield size={14} /> Ownership verification
            </p>
            <p>
              {type === "FOUND"
                ? "We'll only disclose distinguishing features you provided to claimants who can first describe the item. This helps protect real owners."
                : "When someone reaches out, they'll need to describe unique marks or answer verification questions first before you share personal info."}
            </p>
          </div>
        </div>
      </Section>

      {state.error && (
        <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
          {state.success}
        </p>
      )}

      <div className="flex flex-col-reverse items-stretch gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          By submitting, you agree to our community rules. Knowingly filing false reports or scams will get your account banned.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-3 text-base font-semibold"
        >
          {pending
            ? "Publishing your report…"
            : type === "LOST"
              ? "🔴 Publish Lost Report"
              : "🔵 Publish Found Report"}
        </button>
      </div>
    </form>
  );
}

function Section({
  heading,
  subheading,
  icon: Icon,
  children,
}: {
  heading: string;
  subheading?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">
          <Icon size={18} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 sm:text-lg">{heading}</h3>
          {subheading && <p className="text-xs text-slate-500 sm:text-sm">{subheading}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function PasteUrlRow({ onAdd, disabled }: { onAdd: (url: string) => void; disabled: boolean }) {
  const [val, setVal] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onAdd(val.trim());
        setVal("");
      }}
      className="mt-3 flex gap-2"
    >
      <input
        type="url"
        value={val}
        disabled={disabled}
        onChange={(e) => setVal(e.target.value)}
        placeholder="https://i.imgur.com/xyz.jpg"
        className="flex-1 !py-1.5 text-xs"
      />
      <button
        type="submit"
        disabled={disabled || !val}
        className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        <Plus size={14} /> Add
      </button>
    </form>
  );
}
