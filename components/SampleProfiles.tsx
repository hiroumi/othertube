"use client";

import { Cpu, Palette, Leaf } from "lucide-react";
import type { SampleProfile } from "@/lib/types";

const ICONS = [Cpu, Palette, Leaf];
const COLORS = [
  "from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-400",
  "from-purple-50 to-pink-50 border-purple-200 hover:border-purple-400",
  "from-green-50 to-emerald-50 border-green-200 hover:border-emerald-400",
];
const ICON_COLORS = ["text-blue-600", "text-purple-600", "text-emerald-600"];

interface SampleProfilesProps {
  profiles: SampleProfile[];
  onSelect: (profile: SampleProfile) => void;
}

export default function SampleProfiles({ profiles, onSelect }: SampleProfilesProps) {
  return (
    <div className="space-y-3">
      <p className="text-center text-sm font-medium text-gray-500">サンプルで試す</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {profiles.map((profile, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <button
              key={profile.id}
              onClick={() => onSelect(profile)}
              className={`group rounded-xl border bg-gradient-to-br p-4 text-left transition-all duration-200 hover:shadow-md ${COLORS[i % COLORS.length]}`}
            >
              <div className="mb-2 flex items-center gap-2">
                <Icon className={`h-4 w-4 ${ICON_COLORS[i % ICON_COLORS.length]}`} />
                <span className="text-xs font-semibold text-gray-500">{profile.label}</span>
              </div>
              <p className="text-sm font-medium text-gray-800">{profile.displayName}</p>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">{profile.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
