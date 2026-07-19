import React from 'react';
import { X } from 'lucide-react';
import detailedContent from '../../data/detailedContent_room2';

// Panel thuyết minh hiện vật bên phải màn hình - Phòng 2
function SidePanel({ selectedObjectId, showUI, isEditMode, roomData, onClose }) {
  if (!selectedObjectId || !showUI || isEditMode) return null;

  return (
    <div className={`museum-side-panel ui-interactive ${selectedObjectId === 'obj_radio' ? 'left-aligned' : ''}`}>
      <button className="side-panel-close-btn" onClick={onClose}>
        <X size={18} />
      </button>

      <div className="side-panel-content">
        <span className="panel-badge">Hiện Vật Trưng Bày</span>
        <h2 className="panel-title">
          {detailedContent[selectedObjectId]?.title ||
            roomData.interactive_objects.find(o => o.id === selectedObjectId)?.content.title}
        </h2>
        <h4 className="panel-subtitle">
          {detailedContent[selectedObjectId]?.subtitle || ""}
        </h4>

        <div className="panel-divider"></div>

        <div className="panel-body">
          {detailedContent[selectedObjectId]?.paragraphs.map((p, idx) => (
            <p key={idx} className="panel-paragraph">{p}</p>
          ))}
        </div>

        <button className="panel-action-btn" onClick={onClose}>
          Hoàn tất khám phá
        </button>
      </div>
    </div>
  );
}

export default SidePanel;
