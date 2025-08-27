// EmuController JavaScript

class EmuController {
    constructor() {
        this.currentSkin = null;
        this.gameTypeIdentifiers = [];
        this.iPhoneSizes = [];
        this.selectedConsole = null;
        this.isEditMode = false;
        this.originalJsonContent = '';
        this.canvas = null;
        this.ctx = null;
        this.zoomLevel = 1;
        this.currentOrientation = 'portrait';
        this.buttons = []; // Store parsed button data
        this.init();
    }

    async init() {
        await this.loadAssetData();
        this.bindEvents();
        this.populateModal();
    }

    async loadAssetData() {
        try {
            // Load game type identifiers
            const gameTypesResponse = await fetch('./assets/gameTypeIdentifiers.json');
            this.gameTypeIdentifiers = await gameTypesResponse.json();

            // Load iPhone sizes
            const iPhoneSizesResponse = await fetch('./assets/iphone-sizes.json');
            this.iPhoneSizes = await iPhoneSizesResponse.json();
        } catch (error) {
            console.error('Error loading asset data:', error);
        }
    }

    bindEvents() {
        // Welcome screen buttons
        const newSkinBtn = document.getElementById('newSkinBtn');
        const templateBtn = document.getElementById('templateBtn');
        const importBtn = document.getElementById('importBtn');
        const fileInput = document.getElementById('fileInput');
        const backBtn = document.getElementById('backBtn');

        // Modal buttons
        const closeModal = document.getElementById('closeModal');
        const cancelModal = document.getElementById('cancelModal');
        const createSkinBtn = document.getElementById('createSkinBtn');

        // Template modal buttons
        const closeTemplateModal = document.getElementById('closeTemplateModal');
        const cancelTemplateModal = document.getElementById('cancelTemplateModal');

        // Editor buttons
        const exportBtn = document.getElementById('exportBtn');
        const copyJsonBtn = document.getElementById('copyJsonBtn');
        const editJsonBtn = document.getElementById('editJsonBtn');
        const saveJsonBtn = document.getElementById('saveJsonBtn');
        const cancelEditBtn = document.getElementById('cancelEditBtn');

        // Canvas controls
        const zoomInBtn = document.getElementById('zoomInBtn');
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        const fitCanvasBtn = document.getElementById('fitCanvasBtn');
        const portraitBtn = document.getElementById('portraitBtn');
        const landscapeBtn = document.getElementById('landscapeBtn');

        newSkinBtn.addEventListener('click', () => this.showNewSkinModal());
        templateBtn.addEventListener('click', () => this.showTemplateModal());
        importBtn.addEventListener('click', () => this.importSkin());
        fileInput.addEventListener('change', (e) => this.handleFileImport(e));
        backBtn.addEventListener('click', () => this.showWelcomeScreen());

        // Modal events
        closeModal.addEventListener('click', () => this.hideNewSkinModal());
        cancelModal.addEventListener('click', () => this.hideNewSkinModal());
        createSkinBtn.addEventListener('click', () => this.handleCreateSkin());

        // Template modal events
        closeTemplateModal.addEventListener('click', () => this.hideTemplateModal());
        cancelTemplateModal.addEventListener('click', () => this.hideTemplateModal());

        // Close modal on overlay click
        document.getElementById('newSkinModal').addEventListener('click', (e) => {
            if (e.target.id === 'newSkinModal') {
                this.hideNewSkinModal();
            }
        });

        document.getElementById('templateModal').addEventListener('click', (e) => {
            if (e.target.id === 'templateModal') {
                this.hideTemplateModal();
            }
        });

        // Editor button events
        exportBtn.addEventListener('click', () => this.exportSkin());
        copyJsonBtn.addEventListener('click', () => this.copyJsonToClipboard());
        editJsonBtn.addEventListener('click', () => this.enableJsonEditMode());
        saveJsonBtn.addEventListener('click', () => this.saveJsonChanges());
        cancelEditBtn.addEventListener('click', () => this.cancelJsonEdit());

        // Canvas control events
        zoomInBtn.addEventListener('click', () => this.zoomIn());
        zoomOutBtn.addEventListener('click', () => this.zoomOut());
        fitCanvasBtn.addEventListener('click', () => this.fitCanvas());
        portraitBtn.addEventListener('click', () => this.setOrientation('portrait'));
        landscapeBtn.addEventListener('click', () => this.setOrientation('landscape'));
    }

    populateModal() {
        this.populateConsoleGrid();
        this.populateIPhoneDropdown();
    }

    populateConsoleGrid() {
        const consoleGrid = document.getElementById('consoleGrid');
        consoleGrid.innerHTML = '';

        this.gameTypeIdentifiers.forEach(console => {
            const consoleOption = document.createElement('div');
            consoleOption.className = 'console-option';
            consoleOption.dataset.consoleId = console.shortName;
            
            consoleOption.innerHTML = `
                <img src="./assets/consoles/${console.shortName}.png" alt="${console.console}" loading="lazy">
                <div class="console-name">${console.console}</div>
            `;

            consoleOption.addEventListener('click', () => this.selectConsole(console.shortName));
            consoleGrid.appendChild(consoleOption);
        });
    }

    populateIPhoneDropdown() {
        const iphoneSelect = document.getElementById('iphoneModel');
        iphoneSelect.innerHTML = '<option value="">Select iPhone Model</option>';

        this.iPhoneSizes.forEach(phone => {
            const option = document.createElement('option');
            option.value = JSON.stringify({
                model: phone.model,
                logicalWidth: phone.logicalWidth,
                logicalHeight: phone.logicalHeight
            });
            option.textContent = `${phone.model} (${phone.logicalWidth}×${phone.logicalHeight})`;
            iphoneSelect.appendChild(option);
        });
    }

    selectConsole(consoleId) {
        // Remove previous selection
        document.querySelectorAll('.console-option').forEach(option => {
            option.classList.remove('selected');
        });

        // Add selection to clicked option
        const selectedOption = document.querySelector(`[data-console-id="${consoleId}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
            this.selectedConsole = consoleId;
        }
    }

    showNewSkinModal() {
        document.getElementById('newSkinModal').style.display = 'flex';
        // Reset form
        this.resetModalForm();
    }

    hideNewSkinModal() {
        document.getElementById('newSkinModal').style.display = 'none';
    }

    resetModalForm() {
        document.getElementById('skinName').value = '';
        document.getElementById('skinIdentifier').value = '';
        document.getElementById('iphoneModel').value = '';
        document.querySelectorAll('.console-option').forEach(option => {
            option.classList.remove('selected');
        });
        this.selectedConsole = null;
    }

    async handleCreateSkin() {
        // Validate form
        const skinName = document.getElementById('skinName').value.trim();
        const skinIdentifier = document.getElementById('skinIdentifier').value.trim();
        const iphoneModelData = document.getElementById('iphoneModel').value;

        if (!skinName) {
            alert('Please enter a skin name');
            return;
        }

        if (!skinIdentifier) {
            alert('Please enter a skin identifier');
            return;
        }

        if (!this.selectedConsole) {
            alert('Please select a console type');
            return;
        }

        if (!iphoneModelData) {
            alert('Please select an iPhone model');
            return;
        }

        try {
            // Load default configuration
            const response = await fetch('./assets/default_config.json');
            const defaultConfig = await response.json();
            
            // Parse iPhone model data
            const iphoneData = JSON.parse(iphoneModelData);
            
            // Find the selected console data
            const consoleData = this.gameTypeIdentifiers.find(c => c.shortName === this.selectedConsole);
            
            // Create new skin configuration
            this.currentSkin = {
                ...defaultConfig,
                name: skinName,
                identifier: skinIdentifier,
                gameTypeIdentifier: consoleData.gameTypeIdentifier,
                representations: {
                    iphone: {
                        edgeToEdge: {
                            portrait: {
                                ...defaultConfig.representations.iphone.edgeToEdge.portrait,
                                mappingSize: {
                                    width: iphoneData.logicalWidth,
                                    height: iphoneData.logicalHeight
                                }
                            }
                        }
                    }
                }
            };
            
            this.hideNewSkinModal();
            this.showEditorScreen(skinName);
        } catch (error) {
            console.error('Error creating new skin:', error);
            alert('Error creating new skin. Please try again.');
        }
    }

    importSkin() {
        const fileInput = document.getElementById('fileInput');
        fileInput.click();
    }

    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.json')) {
            alert('Please select a valid JSON file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const skinData = JSON.parse(e.target.result);
                
                // Basic validation - check if it has the expected structure
                if (!this.validateSkinData(skinData)) {
                    alert('Invalid skin file format. Please select a valid emulator skin JSON file.');
                    return;
                }

                this.currentSkin = skinData;
                
                
                const skinName = skinData.name || file.name.replace('.json', '');
                this.showEditorScreen(skinName);
            } catch (error) {
                console.error('Error parsing JSON file:', error);
                alert('Error parsing JSON file. Please ensure the file is valid JSON.');
            }
        };

        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    }

    validateSkinData(data) {
        // Check for required top-level properties
        const requiredProps = ['identifier', 'representations'];
        return requiredProps.every(prop => data.hasOwnProperty(prop));
    }

    showWelcomeScreen() {
        document.getElementById('welcomeScreen').style.display = 'block';
        document.getElementById('editorScreen').style.display = 'none';
        this.currentSkin = null;
        
        // Update page title
        document.title = 'EmuController - Emulator Skin Editor';
    }

    showEditorScreen(skinName) {
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('editorScreen').style.display = 'flex';
        
        // Update skin title
        const skinTitle = document.getElementById('skinTitle');
        skinTitle.textContent = skinName;
        
        // Update page title
        document.title = `EmuController - ${skinName}`;
        
        // Update JSON viewer
        this.updateJsonViewer();
        
        // Parse button data from skin
        this.parseButtons();
        
        // Initialize canvas
        this.initializeCanvas();
        
        console.log('Current skin data:', this.currentSkin);
        console.log('Parsed buttons:', this.buttons);
    }

    initializeCanvas() {
        this.canvas = document.getElementById('skinCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Could not get 2D context!');
            return;
        }
        
        console.log('Canvas initialized:', this.canvas);
        
        // Set canvas dimensions based on mappingSize
        this.updateCanvasSize();
        
        // Initial canvas setup
        this.setupCanvas();
        
        // Update canvas display info
        this.updateCanvasInfo();
    }

    updateCanvasSize() {
        if (!this.currentSkin || !this.canvas) return;
        
        const orientation = this.currentOrientation;
        const orientationData = this.currentSkin.representations?.iphone?.edgeToEdge?.[orientation];
        
        if (!orientationData || !orientationData.mappingSize) {
            // Fallback to portrait if orientation not available
            const portrait = this.currentSkin.representations?.iphone?.edgeToEdge?.portrait;
            if (!portrait || !portrait.mappingSize) return;
            
            const { width, height } = portrait.mappingSize;
            this.canvas.width = orientation === 'landscape' ? height : width;
            this.canvas.height = orientation === 'landscape' ? width : height;
        } else {
            const { width, height } = orientationData.mappingSize;
            this.canvas.width = width;
            this.canvas.height = height;
        }
        
        // Update canvas class for styling
        this.canvas.className = `skin-canvas ${orientation}`;
        
        // Apply current zoom
        this.applyZoom();
    }

    setupCanvas() {
        if (!this.ctx) return;
        
        console.log('Setting up canvas:', this.canvas.width, 'x', this.canvas.height);
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Set a clean black background
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw screen content area if defined
        this.drawScreenAreas();
        
        // Draw buttons
        this.drawButtons();
        
        console.log('Canvas setup complete');
    }

    drawGrid() {
        if (!this.ctx) return;
        
        const gridSize = 20;
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 0.5;
        
        console.log('Drawing grid on canvas:', this.canvas.width, 'x', this.canvas.height);
        
        // Vertical lines
        for (let x = 0; x <= this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawScreenAreas() {
        if (!this.ctx || !this.currentSkin) return;
        
        const orientation = this.currentOrientation;
        const orientationData = this.currentSkin.representations?.iphone?.edgeToEdge?.[orientation];
        
        if (!orientationData || !orientationData.screens) return;
        
        // Draw game screen areas
        orientationData.screens.forEach(screen => {
            if (screen.outputFrame) {
                const { x, y, width, height } = screen.outputFrame;
                
                // Draw screen background (where game content would appear)
                this.ctx.fillStyle = '#0a0a0a';
                this.ctx.fillRect(x, y, width, height);
                
                // Draw screen border
                this.ctx.strokeStyle = '#333333';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x, y, width, height);
                
                // Add subtle indication this is the game screen
                this.ctx.fillStyle = '#333333';
                this.ctx.font = '12px system-ui';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('Game Screen', x + width/2, y + height/2);
            }
        });
    }

    drawMappingSizeBox() {
        if (!this.ctx || !this.currentSkin) {
            console.log('Cannot draw mapping size box - missing ctx or currentSkin');
            return;
        }
        
        const orientation = this.currentOrientation;
        const orientationData = this.currentSkin.representations?.iphone?.edgeToEdge?.[orientation];
        
        let mappingSize;
        if (!orientationData || !orientationData.mappingSize) {
            // Fallback to portrait if orientation not available
            const portrait = this.currentSkin.representations?.iphone?.edgeToEdge?.portrait;
            if (!portrait || !portrait.mappingSize) {
                console.log('No mapping size found');
                return;
            }
            mappingSize = portrait.mappingSize;
        } else {
            mappingSize = orientationData.mappingSize;
        }
        
        const { width, height } = mappingSize;
        console.log('Drawing mapping size box:', width, 'x', height);
        
        // Draw the mapping size boundary box
        this.ctx.strokeStyle = '#4a9eff';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([8, 4]);
        this.ctx.strokeRect(2, 2, width - 4, height - 4);
        this.ctx.setLineDash([]); // Reset line dash
        
        // Add label with background
        this.ctx.fillStyle = 'rgba(74, 158, 255, 0.8)';
        this.ctx.fillRect(8, 8, 180, 25);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 12px system-ui';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Mapping Size: ${width} × ${height}`, 12, 25);
    }

    parseButtons() {
        this.buttons = [];
        
        if (!this.currentSkin) return;
        
        const orientation = this.currentOrientation;
        const orientationData = this.currentSkin.representations?.iphone?.edgeToEdge?.[orientation];
        
        if (!orientationData || !orientationData.items) return;
        
        // Parse items into button objects
        orientationData.items.forEach((item, index) => {
            const button = {
                id: `button_${index}`,
                frame: item.frame,
                inputs: item.inputs,
                extendedEdges: item.extendedEdges || { top: 0, bottom: 0, left: 0, right: 0 },
                type: 'button'
            };
            
            this.buttons.push(button);
        });
        
        console.log(`Parsed ${this.buttons.length} buttons for ${orientation} orientation`);
    }


    drawButtons() {
        if (!this.ctx || !this.buttons) return;
        
        console.log('Drawing', this.buttons.length, 'buttons');
        
        this.buttons.forEach((button) => {
            if (!button.frame) return;
            
            const { x, y, width, height } = button.frame;
            const { type } = button;
            
            // Set button styling based on type
            this.setButtonStyle(type);
            
            // Draw button background
            this.ctx.fillRect(x, y, width, height);
            
            // Draw button border
            this.ctx.strokeRect(x, y, width, height);
            
            // Draw button label
            this.drawButtonLabel(button, x, y, width, height);
        });
    }

    setButtonStyle(type) {
        switch (type) {
            case 'dpad':
                this.ctx.fillStyle = 'rgba(100, 100, 100, 0.7)';
                this.ctx.strokeStyle = '#666666';
                break;
            case 'action':
                this.ctx.fillStyle = 'rgba(74, 158, 255, 0.7)';
                this.ctx.strokeStyle = '#4a9eff';
                break;
            case 'shoulder':
                this.ctx.fillStyle = 'rgba(139, 92, 246, 0.7)';
                this.ctx.strokeStyle = '#8b5cf6';
                break;
            case 'system':
                this.ctx.fillStyle = 'rgba(34, 197, 94, 0.7)';
                this.ctx.strokeStyle = '#22c55e';
                break;
            case 'utility':
                this.ctx.fillStyle = 'rgba(251, 191, 36, 0.7)';
                this.ctx.strokeStyle = '#fbbf24';
                break;
            default:
                this.ctx.fillStyle = 'rgba(156, 163, 175, 0.7)';
                this.ctx.strokeStyle = '#9ca3af';
                break;
        }
        
        this.ctx.lineWidth = 2;
    }

    drawButtonLabel(button, x, y, width, height) {
        const { inputs, type } = button;
        let label = '';
        
        // Determine label text
        if (type === 'dpad') {
            label = 'D-PAD';
        } else if (Array.isArray(inputs)) {
            label = inputs[0].toUpperCase();
        } else if (typeof inputs === 'object') {
            label = Object.keys(inputs).join('/').toUpperCase();
        }
        
        if (!label) return;
        
        // Set text styling
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 12px system-ui';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Draw text
        this.ctx.fillText(label, x + width/2, y + height/2);
    }

    updateCanvasInfo() {
        const dimensionsEl = document.getElementById('canvasDimensions');
        const zoomEl = document.getElementById('zoomLevel');
        
        if (this.canvas) {
            dimensionsEl.textContent = `${this.canvas.width} × ${this.canvas.height}`;
        }
        
        zoomEl.textContent = `${Math.round(this.zoomLevel * 100)}%`;
    }

    applyZoom() {
        if (!this.canvas) return;
        
        const scaledWidth = this.canvas.width * this.zoomLevel;
        const scaledHeight = this.canvas.height * this.zoomLevel;
        
        this.canvas.style.width = `${scaledWidth}px`;
        this.canvas.style.height = `${scaledHeight}px`;
        
        this.updateCanvasInfo();
    }

    zoomIn() {
        if (this.zoomLevel < 4) {
            this.zoomLevel = Math.min(4, this.zoomLevel * 1.2);
            this.applyZoom();
        }
    }

    zoomOut() {
        if (this.zoomLevel > 0.1) {
            this.zoomLevel = Math.max(0.1, this.zoomLevel / 1.2);
            this.applyZoom();
        }
    }

    fitCanvas() {
        // Reset zoom to 100%
        this.zoomLevel = 1;
        this.applyZoom();
    }

    setOrientation(orientation) {
        if (this.currentOrientation === orientation) return;
        
        this.currentOrientation = orientation;
        
        // Update toggle button states
        document.getElementById('portraitBtn').classList.toggle('active', orientation === 'portrait');
        document.getElementById('landscapeBtn').classList.toggle('active', orientation === 'landscape');
        
        // Parse buttons for new orientation
        this.parseButtons();
        
        // Update canvas size and redraw
        this.updateCanvasSize();
        this.setupCanvas();
        this.updateCanvasInfo();
        
        // Keep the same zoom level when switching orientation
        this.applyZoom();
    }

    updateJsonViewer() {
        const jsonViewer = document.getElementById('jsonViewer');
        const formattedJson = JSON.stringify(this.currentSkin, null, 2);
        
        // Apply syntax highlighting
        const highlightedJson = this.highlightJson(formattedJson);
        jsonViewer.innerHTML = `<code>${highlightedJson}</code>`;
    }

    highlightJson(jsonStr) {
        // Basic JSON syntax highlighting
        return jsonStr
            .replace(/(".*?")\s*:/g, '<span class="json-key">$1</span>:')
            .replace(/:\s*(".*?")/g, ': <span class="json-string">$1</span>')
            .replace(/:\s*(\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
            .replace(/:\s*(true|false)/g, ': <span class="json-boolean">$1</span>')
            .replace(/:\s*(null)/g, ': <span class="json-null">$1</span>')
            .replace(/([{}[\],])/g, '<span class="json-punctuation">$1</span>');
    }

    async copyJsonToClipboard() {
        try {
            const jsonStr = JSON.stringify(this.currentSkin, null, 2);
            await navigator.clipboard.writeText(jsonStr);
            
            // Visual feedback
            const copyBtn = document.getElementById('copyJsonBtn');
            const originalTitle = copyBtn.title;
            copyBtn.title = 'Copied!';
            copyBtn.style.color = 'var(--success)';
            
            setTimeout(() => {
                copyBtn.title = originalTitle;
                copyBtn.style.color = '';
            }, 2000);
        } catch (error) {
            console.error('Failed to copy JSON:', error);
            alert('Failed to copy JSON to clipboard');
        }
    }

    exportSkin() {
        const jsonStr = JSON.stringify(this.currentSkin, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentSkin.name || 'skin'}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    enableJsonEditMode() {
        this.isEditMode = true;
        this.originalJsonContent = JSON.stringify(this.currentSkin, null, 2);
        
        const jsonViewer = document.getElementById('jsonViewer');
        const jsonEditor = document.getElementById('jsonEditor');
        const editActions = document.getElementById('jsonEditActions');
        
        // Hide viewer, show editor and actions
        jsonViewer.style.display = 'none';
        jsonEditor.style.display = 'block';
        editActions.style.display = 'flex';
        
        // Populate editor with current JSON
        jsonEditor.value = this.originalJsonContent;
        jsonEditor.focus();
        
        // Update button states
        document.getElementById('editJsonBtn').disabled = true;
        document.getElementById('copyJsonBtn').disabled = true;
    }

    cancelJsonEdit() {
        this.isEditMode = false;
        
        const jsonViewer = document.getElementById('jsonViewer');
        const jsonEditor = document.getElementById('jsonEditor');
        const editActions = document.getElementById('jsonEditActions');
        
        // Show viewer, hide editor and actions
        jsonViewer.style.display = 'block';
        jsonEditor.style.display = 'none';
        editActions.style.display = 'none';
        
        // Reset button states
        document.getElementById('editJsonBtn').disabled = false;
        document.getElementById('copyJsonBtn').disabled = false;
        
        // Clear editor
        jsonEditor.value = '';
    }

    saveJsonChanges() {
        const jsonEditor = document.getElementById('jsonEditor');
        const jsonContent = jsonEditor.value.trim();
        
        if (!jsonContent) {
            alert('JSON content cannot be empty');
            return;
        }
        
        try {
            // Validate JSON
            const parsedJson = JSON.parse(jsonContent);
            
            // Basic validation - check if it has required structure
            if (!this.validateSkinData(parsedJson)) {
                alert('Invalid skin configuration structure. Please ensure the JSON contains required fields.');
                return;
            }
            
            // Update current skin
            this.currentSkin = parsedJson;
            
            
            // Re-parse buttons from updated JSON
            this.parseButtons();
            
            // Update canvas with new data
            this.setupCanvas();
            
            // Exit edit mode
            this.cancelJsonEdit();
            
            // Update viewer with new data
            this.updateJsonViewer();
            
            // Visual feedback
            this.showSaveConfirmation();
            
        } catch (error) {
            alert(`Invalid JSON syntax: ${error.message}`);
        }
    }


    showSaveConfirmation() {
        const saveBtn = document.getElementById('saveJsonBtn');
        const originalText = saveBtn.textContent;
        
        saveBtn.textContent = 'Saved!';
        saveBtn.style.background = 'var(--success)';
        
        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.style.background = '';
        }, 2000);
    }

    showTemplateModal() {
        document.getElementById('templateModal').style.display = 'flex';
        this.loadTemplates();
    }

    hideTemplateModal() {
        document.getElementById('templateModal').style.display = 'none';
    }

    async loadTemplates() {
        const templateGrid = document.getElementById('templateGrid');
        templateGrid.innerHTML = '<div class="loading-message">Loading templates...</div>';

        try {
            // For now, we only have GBA template - in the future this could be dynamic
            const templates = [
                {
                    id: 'gba-default',
                    name: 'PlayCase GBA',
                    console: 'GameBoy Advance',
                    description: 'Complete GBA controller layout with all buttons and controls',
                    path: './assets/templates/gba/default.json',
                    icon: 'GBA'
                }
            ];

            templateGrid.innerHTML = '';

            templates.forEach(template => {
                const templateEl = document.createElement('div');
                templateEl.className = 'template-option';
                templateEl.innerHTML = `
                    <div class="template-header">
                        <div class="template-icon">${template.icon}</div>
                        <div class="template-info">
                            <h4 class="template-name">${template.name}</h4>
                            <div class="template-console">${template.console}</div>
                        </div>
                    </div>
                    <div class="template-description">${template.description}</div>
                    <div class="template-meta">
                        <span>Pre-configured layout</span>
                        <span class="template-dimensions">Ready to use</span>
                    </div>
                `;

                templateEl.addEventListener('click', (e) => {
                    e.currentTarget.classList.add('loading');
                    this.loadTemplate(template);
                });
                templateGrid.appendChild(templateEl);
            });

        } catch (error) {
            console.error('Error loading templates:', error);
            templateGrid.innerHTML = '<div class="error-message">Failed to load templates</div>';
        }
    }

    async loadTemplate(template) {
        // Find the template element that was clicked
        const templateEl = document.querySelector('.template-option.loading') || 
                          Array.from(document.querySelectorAll('.template-option'))
                          .find(el => el.querySelector('.template-name').textContent === template.name);
        templateEl.classList.add('loading');

        try {
            const response = await fetch(template.path);
            const templateData = await response.json();

            // Validate template data
            if (!this.validateSkinData(templateData)) {
                alert('Invalid template data structure');
                return;
            }

            this.currentSkin = templateData;
            
            
            this.hideTemplateModal();
            this.showEditorScreen(templateData.name);

        } catch (error) {
            console.error('Error loading template:', error);
            alert('Failed to load template. Please try again.');
        } finally {
            templateEl.classList.remove('loading');
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EmuController();
});