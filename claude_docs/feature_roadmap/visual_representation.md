# Visual Representation Feature Roadmap

## Overview
Create a visual representation system for emulator skin JSON configurations that allows users to see and interact with their skin layouts in real-time.

## Current State
- Pure JSON editor with syntax highlighting
- Template system for quick starts
- Import/export functionality
- Single-session operation

## Proposed Solution: HTML/CSS Based Visual Layout

### Core Concept
Replace canvas rendering with a flexible HTML/CSS based system that creates positioned elements representing the emulator skin layout.

## Implementation Plan

### Phase 1: Basic Visual Container

#### 1.1 Screen Representation Container
```html
<div class="skin-preview">
  <div class="device-screen" id="deviceScreen">
    <div class="screen-area"></div>
     <!-- Screens rendered here -->
      <div class="gameScreen" id="screen-[#]">
      </div>
      <!-- Buttons rendered here -->
      <div class="button" id="[name]">
      </div>
  </div>
</div>
```

#### 1.2 Core Features
- **Aspect ratio preservation** based on mappingSize
- **Device frame styling** to simulate phone appearance
- **Orientation switching** (portrait/landscape)

### Phase 2: Button Rendering System

#### 2.1 Dynamic Button Generation
```javascript
// Parse JSON items and create HTML elements
items.forEach((item, index) => {
  const buttonEl = createButtonElement(item, index);
  screenArea.appendChild(buttonEl);
});
```

#### 2.2 Button Types & Styling

#### 2.3 Visual Features
- **Labels** showing input names
- **Hover effects** for interactivity
- **Size indicators** (dimensions overlay)

### Phase 3: Interactive Features

#### 3.1 Real-time JSON Sync
- **Live updates**: Changes in JSON immediately reflect in visual
- **Bidirectional sync**: Visual changes update JSON (future phase)
- **Validation feedback**: Highlight invalid configurations

#### 3.2 View Controls
- **Orientation toggle**: Portrait/Landscape switching
- **Overlay modes**: Show/hide dimensions, labels, extended edges

### Phase 4: Advanced Visualization

#### 4.1 Screen Areas
- **Game screen representation** with placeholder content
- **Safe area indicators** for different iPhone models

#### 4.2 Extended Edges Visualization
- **Touch area overlays** showing extended tap regions
- **Visual debugging** for button placement conflicts
- **Accessibility indicators** for minimum touch targets

## Technical Implementation

### HTML Structure
```html
<div class="visual-panel">
  <div class="visual-header">
    <div class="device-info">
      <span class="device-model">iPhone 15 Pro</span>
      <span class="screen-size">430 × 932</span>
    </div>
    <div class="visual-controls">
      <div class="orientation-toggle">
        <button class="orientation-btn active" data-orientation="portrait">📱</button>
        <button class="orientation-btn" data-orientation="landscape">📱</button>
      </div>
      <div class="zoom-controls">
        <button class="zoom-btn" data-action="zoom-out">−</button>
        <span class="zoom-level">100%</span>
        <button class="zoom-btn" data-action="zoom-in">+</button>
      </div>
    </div>
  </div>
  
  <div class="visual-container">
    <div class="device-frame">
      <div class="screen-area">
        <div class="game-screen"></div>
        <div class="button-layer" id="buttonLayer"></div>
      </div>
    </div>
  </div>
</div>
```

### CSS Architecture
```css
.visual-container {
  /* Responsive scaling container */
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: var(--bg-primary);
}

.device-frame {
  /* Device appearance with scaling */
  position: relative;
  border-radius: 25px;
  background: #000;
  box-shadow: 0 0 0 4px #333, 0 0 0 6px #555;
  transform-origin: center;
  transition: transform 0.3s ease;
}

.button-layer {
  /* Absolute positioning for buttons */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.skin-button {
  /* Individual button styling */
  position: absolute;
  border-radius: 8px;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
  color: white;
  transition: all 0.2s ease;
  pointer-events: all;
}

.skin-button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(74, 158, 255, 0.5);
}

/* Button type specific styles */
.button-dpad { background: rgba(100, 100, 100, 0.8); border-color: #666; }
.button-action { background: rgba(74, 158, 255, 0.8); border-color: #4a9eff; }
.button-shoulder { background: rgba(139, 92, 246, 0.8); border-color: #8b5cf6; }
.button-system { background: rgba(34, 197, 94, 0.8); border-color: #22c55e; }
.button-utility { background: rgba(251, 191, 36, 0.8); border-color: #fbbf24; }
```

### JavaScript Implementation
```javascript
class VisualRenderer {
  constructor(container, skinData) {
    this.container = container;
    this.skinData = skinData;
    this.currentOrientation = 'portrait';
    this.zoomLevel = 1;
    this.buttons = [];
  }
  
  render() {
    this.setupContainer();
    this.renderButtons();
    this.applyScaling();
  }
  
  setupContainer() {
    const mappingSize = this.getMappingSize();
    this.container.style.width = `${mappingSize.width}px`;
    this.container.style.height = `${mappingSize.height}px`;
  }
  
  renderButtons() {
    const buttonLayer = this.container.querySelector('.button-layer');
    buttonLayer.innerHTML = '';
    
    const items = this.getItemsForOrientation();
    items.forEach((item, index) => {
      const buttonEl = this.createButton(item, index);
      buttonLayer.appendChild(buttonEl);
    });
  }
  
  createButton(item, index) {
    const button = document.createElement('div');
    button.className = `skin-button button-${this.getButtonType(item.inputs)}`;
    button.style.left = `${item.frame.x}px`;
    button.style.top = `${item.frame.y}px`;
    button.style.width = `${item.frame.width}px`;
    button.style.height = `${item.frame.height}px`;
    button.textContent = this.getButtonLabel(item.inputs);
    button.dataset.index = index;
    
    // Add click handler for future interaction
    button.addEventListener('click', () => this.onButtonClick(index));
    
    return button;
  }
}
```

## Benefits of This Approach

### 1. Performance
- **No canvas rendering overhead**
- **Browser-optimized DOM rendering**
- **CSS transitions and animations**
- **Hardware acceleration support**

### 2. Maintainability
- **Standard HTML/CSS/JS**
- **Easy to debug and modify**
- **Responsive design patterns**
- **Accessible by default**

### 3. Flexibility
- **Easy styling and theming**
- **Extensible for new features**
- **Mobile-friendly touch interactions**
- **Screen reader compatible**

### 4. User Experience
- **Smooth interactions**
- **Real-time feedback**
- **Intuitive visual representation**
- **Professional appearance**

## Integration with Current System

### Layout Update
```html
<div class="editor-layout">
  <div class="visual-panel">
    <!-- New visual representation -->
  </div>
  <div class="json-panel">
    <!-- Existing JSON editor -->
  </div>
</div>
```

### Data Flow
1. **JSON → Visual**: Parse JSON and render buttons
2. **Visual → JSON**: Future bidirectional editing
3. **Template → Visual**: Load templates with preview
4. **Import → Visual**: Show imported skins immediately

## Future Enhancements

### Phase 5: Advanced Interactions
- **Drag & drop button positioning**
- **Resize handles for button dimensions**
- **Right-click context menus**
- **Keyboard shortcuts**

### Phase 6: Validation & Testing
- **Collision detection**
- **Accessibility compliance**
- **Touch target size validation**
- **Cross-device preview**

### Phase 7: Export Features
- **Screenshot generation**
- **PDF export with layouts**
- **Sharing functionality**
- **Version comparison**

## Implementation Priority

1. **High Priority**: Basic visual container and button rendering
2. **Medium Priority**: Orientation switching and zoom controls  
3. **Low Priority**: Advanced interactions and validation

This approach provides a solid foundation for visual representation while maintaining simplicity and performance.