"use client";

import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { PopResponse } from "@/src/application";
import { VisualTemplate as Template } from "./types";
import { getAutoSavedTemplate, getSavedTemplates } from "./utils/storageUtils";
import ElementRenderer from "./ElementRenderer";
import BackgroundFrameRenderer from "./BackgroundFrameRenderer";

interface TemplateRendererProps {
  pop: PopResponse | null;
  template?: Template | null;
  width?: number; // px
  height?: number; // px
  className?: string;
  forPrint?: boolean; // 印刷用かどうか
}

// デフォルトのテンプレート
const getDefaultTemplate = (): Template => ({
  id: "default",
  name: "デフォルトテンプレート",
  elements: [],
  backgroundFrames: [],
  settings: {
    snapToGrid: true,
    gridSize: 5,
    showGuides: true,
    showFoldLine: true,
    unifiedColors: {
      dataLabelColor: '#666666',
      contentColor: '#1e293b',
      backgroundColor: '#ffffff',
    },
    unifiedFonts: {
      dataLabel: {
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'normal',
        fontStyle: 'normal',
      },
      content: {
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'normal',
        fontStyle: 'normal',
      },
    },
  },
});

const TemplateRenderer: React.FC<TemplateRendererProps> = ({
  pop,
  template,
  width = 397, // 105mm
  height = 280, // 74mm
  className = "",
  forPrint = false,
}) => {
  // テンプレートの取得優先順位:
  // 1. propsで渡されたテンプレート
  // 2. 自動保存されたテンプレート
  // 3. 保存済みテンプレートの最初のもの
  // 4. デフォルトテンプレート
  const getActiveTemplate = (): Template => {
    if (template) return template;
    
    const autoSaved = getAutoSavedTemplate();
    if (autoSaved) return autoSaved;
    
    const savedTemplates = getSavedTemplates();
    if (savedTemplates.length > 0) return savedTemplates[0];
    
    return getDefaultTemplate();
  };
  
  const activeTemplate = getActiveTemplate();
  
  // デバッグログ
  console.log("TemplateRenderer - pop:", pop?.release?.title, pop?.release?.artistName);
  console.log("TemplateRenderer - template elements:", activeTemplate.elements.map(e => ({ id: e.id, dataBinding: e.dataBinding })));
  
  // mm to px conversion (assuming 96dpi)
  const mmToPx = (mm: number) => (mm * 96) / 25.4;

  const content = (
    <div 
      className={`template-renderer ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: "relative",
        backgroundColor: activeTemplate.settings.unifiedColors?.backgroundColor || "white",
        overflow: "hidden",
      }}
    >
        {/* 背景フレーム */}
        {activeTemplate.backgroundFrames?.map((frame) => (
          <BackgroundFrameRenderer
            key={frame.id}
            frame={frame}
            isSelected={false}
            isBackSide={frame.isBackSide || false}
            showBackSidePreview={true}
            zoom={1}
          />
        ))}

        {/* 折り線 */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${mmToPx(15)}px`, // FOLD_LINE_Y = 15mm
            borderTop: "1px dashed #ccc",
            height: 0,
            zIndex: 10,
          }}
        />

        {/* 要素 */}
        {activeTemplate.elements.map((element) => (
          <div
            key={element.id}
            style={{
              position: "absolute",
              left: `${mmToPx(element.position.x)}px`,
              top: `${mmToPx(element.position.y)}px`,
              width: `${mmToPx(element.size.width)}px`,
              height: `${mmToPx(element.size.height)}px`,
            }}
          >
            <ElementRenderer
              element={element}
              pop={pop}
              isBackSide={element.isBackSide || false}
              useSampleData={false}
              showBackSidePreview={true}
              zoom={1}
              template={activeTemplate}
            />
          </div>
        ))}
    </div>
  );

  // 印刷用の場合はDndProviderなしで返す
  if (forPrint) {
    return content;
  }

  // 通常表示の場合はDndProviderでラップ
  return (
    <DndProvider backend={HTML5Backend}>
      {content}
    </DndProvider>
  );
};

export default TemplateRenderer;