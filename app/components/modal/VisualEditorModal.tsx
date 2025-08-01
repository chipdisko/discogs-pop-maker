'use client';

import React from 'react';
import type { PopResponse } from '@/src/application';
import VisualEditor from '../visual-editor/VisualEditor';

interface VisualEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  pop: PopResponse;
}

export default function VisualEditorModal({
  isOpen,
  onClose,
  pop,
}: VisualEditorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
      <div className="fixed inset-4 bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden">
        <div className="h-full flex flex-col">
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">POPテンプレート ビジュアルエディタ</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* エディタ本体 */}
          <div className="flex-1 overflow-hidden">
            <VisualEditor
              pop={pop}
              onTemplateChange={(template) => {
                console.log('Template changed:', template);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}