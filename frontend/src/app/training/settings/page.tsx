"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  DEFAULT_TIERS,
  getFormulaTiers,
  saveFormulaTiers,
  resetFormulaTiers,
  ObligationTier,
  formatCost,
} from "@/app/training/services/obligationCalculator";
import { Settings, RotateCcw, Save, CheckCircle2, AlertTriangle, Infinity as InfinityIcon } from "lucide-react";

function TierRow({
  tier,
  index,
  onChange,
  isLast,
}: {
  tier: ObligationTier;
  index: number;
  onChange: (index: number, field: keyof ObligationTier, value: number) => void;
  isLast: boolean;
}) {
  const inputCls =
    "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-right text-sm font-bold focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all";

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/20 transition-colors">
      <td className="px-4 py-3 text-xs font-bold text-blue-600 text-center">{index + 1}</td>
      <td className="px-4 py-3">
        <input
          type="number"
          min={0}
          className={inputCls}
          value={tier.from}
          onChange={(e) => onChange(index, "from", Number(e.target.value))}
        />
      </td>
      <td className="px-4 py-3">
        {isLast ? (
          <div className="flex items-center justify-end gap-1 text-sm font-bold text-gray-400 pr-2">
            <InfinityIcon className="h-4 w-4" />
            <span>No limit</span>
          </div>
        ) : (
          <input
            type="number"
            min={0}
            className={inputCls}
            value={tier.to}
            onChange={(e) => onChange(index, "to", Number(e.target.value))}
          />
        )}
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          min={1}
          className={inputCls}
          value={tier.baseMonths}
          onChange={(e) => onChange(index, "baseMonths", Number(e.target.value))}
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          min={1}
          className={inputCls}
          value={tier.step}
          onChange={(e) => onChange(index, "step", Number(e.target.value))}
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          min={1}
          className={inputCls}
          value={tier.maxMonths}
          onChange={(e) => onChange(index, "maxMonths", Number(e.target.value))}
        />
      </td>
    </tr>
  );
}

export default function TrainingSettingsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [tiers, setTiers] = useState<ObligationTier[]>([]);
  const [saved, setSaved] = useState(false);
  const [isCustom, setIsCustom] = useState(false);

  const isAllowed =
    user?.role === "ADMIN" || user?.role === "CYBER_DEVELOPMENT_CENTER";

  useEffect(() => {
    const current = getFormulaTiers();
    setTiers(current.map((t) => ({ ...t })));
    // Check if it differs from defaults
    const stored = localStorage.getItem("training_obligation_formula");
    setIsCustom(!!stored);
  }, []);

  const handleChange = (
    index: number,
    field: keyof ObligationTier,
    value: number
  ) => {
    setTiers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSave = () => {
    saveFormulaTiers(tiers);
    setSaved(true);
    setIsCustom(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    if (!confirm("Reset to default formula? This will remove all customisations.")) return;
    resetFormulaTiers();
    setTiers(DEFAULT_TIERS.map((t) => ({ ...t })));
    setIsCustom(false);
  };

  if (!isAllowed) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <AlertTriangle className="h-12 w-12 text-amber-400" />
          <h2 className="text-xl font-bold text-gray-700">Access Restricted</h2>
          <p className="text-sm text-gray-500">Only Admin and CDC roles can access training formula settings.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-md">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Training Obligation Formula</h1>
              <p className="text-sm text-gray-500 font-medium italic">
                Configure the obligation period tiers for training cost calculations.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isCustom && (
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700 border border-violet-200">
                Custom formula active
              </span>
            )}
            {saved && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-3 w-3" /> Saved!
              </span>
            )}
          </div>
        </div>

        {/* Info banner */}
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-800">
          <p className="font-semibold mb-1">How this works</p>
          <p className="text-xs text-blue-700 leading-relaxed">
            Obligation is calculated from the <strong>individual trainee cost</strong> (Total Cost ÷ Number of Trainees).
            The tier that matches that amount determines the base obligation months plus extra months for each step above
            the tier floor. Changes saved here apply immediately across all training pages.
          </p>
        </div>

        {/* Tiers Table */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Obligation Tiers (Individual Cost in ETB)
            </h2>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset to Default
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-4 py-4 text-center w-12">#</th>
                  <th className="px-4 py-4">From (ETB)</th>
                  <th className="px-4 py-4">To (ETB)</th>
                  <th className="px-4 py-4">Base Months</th>
                  <th className="px-4 py-4">Step (ETB / +1 month)</th>
                  <th className="px-4 py-4">Max Months</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((tier, i) => (
                  <TierRow
                    key={i}
                    tier={tier}
                    index={i}
                    onChange={handleChange}
                    isLast={i === tiers.length - 1}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Preview table */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 bg-gray-50/30 px-6 py-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Formula Preview (read-only)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-3">Cost Range</th>
                  <th className="px-6 py-3 text-center">Base Months</th>
                  <th className="px-6 py-3 text-center">Max Months</th>
                  <th className="px-6 py-3 text-center">Extra per Step</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tiers.map((tier, i) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3 font-medium text-gray-700">
                      {formatCost(tier.from)} – {tier.to === Infinity ? "∞" : formatCost(tier.to)}
                    </td>
                    <td className="px-6 py-3 text-center font-black text-violet-700">{tier.baseMonths} mo</td>
                    <td className="px-6 py-3 text-center font-black text-gray-700">{tier.maxMonths} mo</td>
                    <td className="px-6 py-3 text-center text-gray-500">
                      +1 mo per {formatCost(tier.step)} ETB above floor
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 hover:bg-violet-700 transition-all hover:-translate-y-0.5"
          >
            <Save className="h-4 w-4" />
            Save Formula
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
