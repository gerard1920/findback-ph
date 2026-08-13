"use client";
import { useState, useEffect } from "react";
import { useActionState } from "react";
import Image from "next/image";
import { updateProfile, type FormState } from "@/app/actions";
import { User, Phone, MapPin, GraduationCap, Mail } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";

type Props = {
  initial: {
    email: string;
    displayName: string;
    phone: string;
    city: string;
    province: string;
    campus: string;
    avatarUrl?: string | null;
  };
};

const PHONE_RE = /^(\+?63|0)9\d{9}$/;

export function ProfileForm({ initial }: Props) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(updateProfile, {});
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Partial<Record<"displayName" | "phone" | "city" | "province", string>>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (state?.success) {
      toast({
        variant: "success",
        title: "Profile saved",
        description: state.success,
        durationMs: 3000,
      });
    } else if (state?.error) {
      toast({
        variant: "error",
        title: "Couldn't save profile",
        description: state.error,
      });
    }
  }, [state, toast]);

  type ValKey = "displayName" | "phone" | "city" | "province";

  function validate(key: ValKey, value: string): string | undefined {
    if (key === "displayName") {
      const trimmed = value.trim();
      if (trimmed.length < 2) return "Please enter at least 2 characters.";
      if (trimmed.length > 60) return "Please keep it under 60 characters.";
    }
    if (key === "phone" && value.length > 0) {
      const digits = value.replace(/[^+0-9]/g, "");
      if (!PHONE_RE.test(digits)) return "Enter a valid PH number (e.g. 09171234567).";
    }
    if (key === "city" && value.length > 0) {
      if (value.trim().length < 2) return "City name is too short.";
    }
    if (key === "province" && value.length > 0) {
      if (value.trim().length < 2) return "Province name is too short.";
    }
    return undefined;
  }

  function onBlur(key: ValKey, value: string) {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors((e) => ({ ...e, [key]: validate(key, value) }));
  }

  function onChange(key: ValKey, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    if (touched[key]) {
      setErrors((e) => ({ ...e, [key]: validate(key, value) }));
    }
  }

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        const dn = validate("displayName", values.displayName);
        const ph = values.phone ? validate("phone", values.phone) : undefined;
        const ci = values.city ? validate("city", values.city) : undefined;
        const pr = values.province ? validate("province", values.province) : undefined;
        setTouched({ displayName: true, phone: true, city: true, province: true });
        setErrors({ displayName: dn, phone: ph, city: ci, province: pr });
        if (dn || ph || ci || pr) {
          e.preventDefault();
          toast({
            variant: "error",
            title: "Please fix the highlighted fields",
            description: "Display name is required. Other fields are optional but must be valid.",
          });
        }
      }}
      noValidate
      className="max-w-3xl grid gap-5 sm:grid-cols-2"
    >
      <input type="hidden" name="displayName" value={values.displayName} />
      <input type="hidden" name="phoneNumber" value={values.phone} />
      <input type="hidden" name="preferredCity" value={values.city} />
      <input type="hidden" name="preferredProvince" value={values.province} />
      <input type="hidden" name="campus" value={values.campus} />
      <input type="hidden" name="avatarUrl" value={values.avatarUrl ?? ""} />

      <div className="sm:col-span-2 flex flex-col items-start gap-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 sm:flex-row sm:items-center">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 ring-2 ring-white shadow-md">
          {values.avatarUrl ? (
            <Image src={values.avatarUrl} alt={values.displayName} width={80} height={80} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-2xl font-black text-white">
              {(values.displayName || "U").trim().charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-indigo-900">👋 Personalize your profile</p>
          <p className="mt-1 text-xs leading-relaxed text-indigo-800/90">
            Fill in a display name so finders know who they&apos;re talking to. City and campus help narrow
            down nearby matches.
          </p>
        </div>
      </div>

      <label className="block sm:col-span-2">
        <span className="label">
          <span className="inline-flex items-center gap-1.5">
            <Mail size={14} /> Email
          </span>
        </span>
        <input
          name="email"
          disabled
          value={values.email}
          className="cursor-not-allowed bg-slate-50 text-slate-600"
        />
        <p className="mt-1.5 text-xs text-slate-500">Email cannot be changed.</p>
      </label>

      <label className="block sm:col-span-2">
        <span className="label">
          <span className="inline-flex items-center gap-1.5">
            <User size={14} /> Display name <span className="text-rose-600">*</span>
          </span>
        </span>
        <input
          name="displayNameDisplay"
          disabled={pending}
          value={values.displayName}
          onChange={(e) => onChange("displayName", e.target.value)}
          onBlur={(e) => onBlur("displayName", e.target.value)}
          required
          minLength={2}
          maxLength={60}
          placeholder="e.g. Juan Dela Cruz"
          className={errors.displayName && touched.displayName ? "border-rose-300 ring-2 ring-rose-100 focus:ring-rose-200" : ""}
        />
        {touched.displayName && errors.displayName ? (
          <p className="mt-1.5 text-xs font-medium text-rose-700">{errors.displayName}</p>
        ) : (
          <p className="mt-1.5 text-xs text-slate-500">Shown publicly on your posts and comments.</p>
        )}
      </label>

      <label className="block">
        <span className="label">
          <span className="inline-flex items-center gap-1.5">
            <Phone size={14} /> Mobile number
          </span>
        </span>
        <input
          name="phoneDisplay"
          disabled={pending}
          inputMode="tel"
          value={values.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          onBlur={(e) => onBlur("phone", e.target.value)}
          maxLength={15}
          placeholder="09171234567"
          className={errors.phone && touched.phone ? "border-rose-300 ring-2 ring-rose-100 focus:ring-rose-200" : ""}
        />
        {touched.phone && errors.phone ? (
          <p className="mt-1.5 text-xs font-medium text-rose-700">{errors.phone}</p>
        ) : (
          <p className="mt-1.5 text-xs text-slate-500">Optional — used for verified handovers only.</p>
        )}
      </label>

      <label className="block">
        <span className="label">
          <span className="inline-flex items-center gap-1.5">
            <GraduationCap size={14} /> Campus / Company
          </span>
        </span>
        <input
          name="campusDisplay"
          disabled={pending}
          value={values.campus}
          onChange={(e) => setValues((v) => ({ ...v, campus: e.target.value }))}
          maxLength={100}
          placeholder="e.g. UP Diliman, BGC, Ateneo…"
        />
        <p className="mt-1.5 text-xs text-slate-500">Optional — shown next to your display name.</p>
      </label>

      <label className="block">
        <span className="label">
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={14} /> City
          </span>
        </span>
        <input
          name="cityDisplay"
          disabled={pending}
          value={values.city}
          onChange={(e) => onChange("city", e.target.value)}
          onBlur={(e) => onBlur("city", e.target.value)}
          maxLength={60}
          placeholder="Quezon City"
          className={errors.city && touched.city ? "border-rose-300 ring-2 ring-rose-100 focus:ring-rose-200" : ""}
        />
        {touched.city && errors.city ? (
          <p className="mt-1.5 text-xs font-medium text-rose-700">{errors.city}</p>
        ) : null}
      </label>

      <label className="block">
        <span className="label">
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={14} /> Province
          </span>
        </span>
        <input
          name="provinceDisplay"
          disabled={pending}
          value={values.province}
          onChange={(e) => onChange("province", e.target.value)}
          onBlur={(e) => onBlur("province", e.target.value)}
          maxLength={60}
          placeholder="Metro Manila, Cebu, Davao del Sur…"
          className={errors.province && touched.province ? "border-rose-300 ring-2 ring-rose-100 focus:ring-rose-200" : ""}
        />
        {touched.province && errors.province ? (
          <p className="mt-1.5 text-xs font-medium text-rose-700">{errors.province}</p>
        ) : null}
      </label>

      <div className="sm:col-span-2">
        {state?.error && (
          <p role="alert" className="mb-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">
            {state.error}
          </p>
        )}
        {state?.success && (
          <p role="status" className="mb-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
            {state.success}
          </p>
        )}
        <div className="flex justify-end border-t border-slate-100 pt-4">
          <button type="submit" disabled={pending} className="btn-primary min-w-[220px] items-center justify-center">
            {pending ? (
              <>
                <Spinner size="xs" className="text-white" />
                Saving changes…
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
