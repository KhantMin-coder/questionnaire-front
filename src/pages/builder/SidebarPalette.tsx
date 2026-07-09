import React from 'react';
import { HelpCircle as QuestionIcon, Clock } from 'lucide-react';

export const SidebarPalette: React.FC = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    console.log('Drag Start:', nodeType);
    event.dataTransfer.setData('text/plain', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="glass-panel node-palette">
      <h3 className="node-palette-title">Node Palette</h3>
      <p className="node-palette-sub">Drag and drop nodes onto the canvas.</p>

      <div className="node-palette-list">
        <div
          onDragStart={(event) => onDragStart(event, 'question')}
          draggable
          className="palette-item"
        >
          <div className="palette-item-icon palette-item-icon--primary">
            <QuestionIcon size={16} />
          </div>
          <span className="palette-item-label">Question Node</span>
        </div>

        <div
          onDragStart={(event) => onDragStart(event, 'delay')}
          draggable
          className="palette-item"
        >
          <div className="palette-item-icon palette-item-icon--warning">
            <Clock size={16} />
          </div>
          <span className="palette-item-label">Delay / Follow-up</span>
        </div>

        <div
          onDragStart={(event) => onDragStart(event, 'terminal')}
          draggable
          className="palette-item"
        >
          <div className="palette-item-icon palette-item-icon--success">
            <span className="palette-terminal-dot" />
          </div>
          <span className="palette-item-label">Terminal Node</span>
        </div>
      </div>
    </div>
  );
};
