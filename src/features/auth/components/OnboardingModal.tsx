"use client";

import { useState } from "react";
import { Building2, DollarSign, Check, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ONBOARDING_LABELS, SALARY_OPTIONS } from "./onboarding-constants";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (data: { company_name?: string; salary?: number }) => void;
  onSkip: () => void;
}

export function OnboardingModal({ isOpen, onComplete, onSkip }: OnboardingModalProps) {
  const [companyName, setCompanyName] = useState("");
  const [salary, setSalary] = useState<number>(0);

  if (!isOpen) return null;

  const handleSave = () => {
    const data: { company_name?: string; salary?: number } = {};
    
    if (companyName.trim()) {
      data.company_name = companyName.trim();
    }
    
    if (salary > 0) {
      data.salary = salary;
    }
    
    onComplete(data);
  };

  const handleSkip = () => {
    onSkip();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="relative w-full max-w-lg p-8 animate-in fade-in zoom-in duration-300">
        {/* アイコンヘッダー */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* タイトル */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {ONBOARDING_LABELS.TITLE}
          </h2>
          <p className="text-sm text-gray-600">
            {ONBOARDING_LABELS.SUBTITLE}
          </p>
        </div>

        {/* 説明（オプション強調） */}
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">
            {ONBOARDING_LABELS.OPTIONAL_NOTICE}
          </p>
        </div>

        {/* フォーム */}
        <div className="space-y-5 mb-6">
          {/* 会社名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {ONBOARDING_LABELS.COMPANY_LABEL}
              <span className="ml-2 text-xs text-gray-500">(任意)</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={ONBOARDING_LABELS.COMPANY_PLACEHOLDER}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 年収 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {ONBOARDING_LABELS.SALARY_LABEL}
              <span className="ml-2 text-xs text-gray-500">(任意)</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={salary}
                onChange={(e) => setSalary(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer bg-white"
              >
                {SALARY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 追加説明 */}
        <div className="space-y-3 mb-8">
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" />
            <p>{ONBOARDING_LABELS.DEFAULT_COMPANY_NOTICE}</p>
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" />
            <p>{ONBOARDING_LABELS.PRIVACY_NOTICE}</p>
          </div>
        </div>

        {/* ボタン */}
        <div className="space-y-3">
          {/* 保存ボタン */}
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {ONBOARDING_LABELS.SAVE_AND_START}
          </button>

          {/* スキップボタン（強調） */}
          <button
            onClick={handleSkip}
            className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            {ONBOARDING_LABELS.SKIP}
          </button>
        </div>
      </Card>
    </div>
  );
}
