// EmuController JavaScript

class EmuController {
    constructor() {
        this.currentSkin = null;
        this.gameTypeIdentifiers = [];
        this.iPhoneSizes = [];
        this.selectedConsole = null;
        this.isEditMode = false;
        this.originalJsonContent = '';
        
        // Visual representation properties
        this.visualRenderer = null;
        this.currentOrientation = 'portrait';
        this.zoomLevel = 1;
        
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
        
        // Visual controls
        const visualPortraitBtn = document.getElementById('portraitBtn');
        const visualLandscapeBtn = document.getElementById('landscapeBtn');
        const visualZoomInBtn = document.getElementById('zoomInBtn');
        const visualZoomOutBtn = document.getElementById('zoomOutBtn');
        const resetZoomBtn = document.getElementById('resetZoomBtn');


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
        
        // Button management events
        const addButtonBtn = document.getElementById('addButtonBtn');
        const toggleButtonPanel = document.getElementById('toggleButtonPanel');
        
        addButtonBtn.addEventListener('click', () => this.showAddButtonDialog());
        toggleButtonPanel.addEventListener('click', () => this.toggleButtonPanel());
        
        // Device size selector events
        const deviceSizeSelect = document.getElementById('deviceSizeSelect');
        deviceSizeSelect.addEventListener('change', (e) => this.onDeviceSizeChange(e));
        
        // Visual control events
        visualPortraitBtn.addEventListener('click', () => this.setOrientation('portrait'));
        visualLandscapeBtn.addEventListener('click', () => this.setOrientation('landscape'));
        visualZoomInBtn.addEventListener('click', () => this.zoomIn());
        visualZoomOutBtn.addEventListener('click', () => this.zoomOut());
        resetZoomBtn.addEventListener('click', () => this.resetZoom());
        
        // Menu insets slider events
        const insetSliders = document.querySelectorAll('.inset-slider');
        insetSliders.forEach(slider => {
            slider.addEventListener('input', (e) => this.onInsetSliderChange(e));
        });

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
        
        // Initialize visual renderer
        this.initializeVisualRenderer();
        
        // Initialize button panel
        this.initializeButtonPanel();
        
        // Initialize device size selector
        this.initializeDeviceSelector();
        
        // Initialize menu insets sliders (after DOM update)
        requestAnimationFrame(() => {
            this.initializeMenuInsetsSliders();
        });
        
        console.log('Current skin data:', this.currentSkin);
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
        
        // Add live preview with debouncing
        this.setupLivePreview(jsonEditor);
        
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
        
        // Clean up live preview
        this.cleanupLivePreview();
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
            
            // Exit edit mode
            this.cancelJsonEdit();
            
            // Update viewer with new data
            this.updateJsonViewer();
            
            // Refresh visual representation
            this.refreshVisualRepresentation();
            
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
    
    // Visual Renderer Methods
    initializeVisualRenderer() {
        const container = document.getElementById('deviceFrame');
        if (!container) {
            console.error('Device frame container not found!');
            return;
        }
        
        this.visualRenderer = new VisualRenderer(container, this.currentSkin, this);
        this.visualRenderer.render();
        this.updateDeviceInfo();
        this.setupVisualControls();
    }
    
    setupVisualControls() {
        // Orientation controls
        const portraitBtn = document.getElementById('portraitBtn');
        const landscapeBtn = document.getElementById('landscapeBtn');
        
        portraitBtn.addEventListener('click', () => {
            this.switchOrientation('portrait');
        });
        
        landscapeBtn.addEventListener('click', () => {
            this.switchOrientation('landscape');
        });
        
        // Zoom controls
        const zoomInBtn = document.getElementById('zoomInBtn');
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        const resetZoomBtn = document.getElementById('resetZoomBtn');
        
        zoomInBtn.addEventListener('click', () => {
            this.adjustZoom(0.1);
        });
        
        zoomOutBtn.addEventListener('click', () => {
            this.adjustZoom(-0.1);
        });
        
        resetZoomBtn.addEventListener('click', () => {
            this.resetZoom();
        });
        
        // Add keyboard shortcuts for zoom
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === '=' || e.key === '+') {
                    e.preventDefault();
                    this.adjustZoom(0.1);
                } else if (e.key === '-') {
                    e.preventDefault();
                    this.adjustZoom(-0.1);
                } else if (e.key === '0') {
                    e.preventDefault();
                    this.resetZoom();
                }
            }
        });
        
        // Add resize handler for responsiveness
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }
    
    switchOrientation(orientation) {
        // Update button states
        document.querySelectorAll('.orientation-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-orientation="${orientation}"]`).classList.add('active');
        
        // Update renderer
        if (this.visualRenderer) {
            this.visualRenderer.setOrientation(orientation);
            this.visualRenderer.render();
            this.updateDeviceInfo();
        }
    }
    
    adjustZoom(delta) {
        if (this.visualRenderer) {
            const newZoom = this.visualRenderer.zoomLevel + delta;
            this.visualRenderer.setZoomLevel(newZoom);
            this.visualRenderer.applyScaling();
            this.updateZoomDisplay();
        }
    }
    
    resetZoom() {
        if (this.visualRenderer) {
            this.visualRenderer.setZoomLevel(1.0);
            this.visualRenderer.applyScaling();
            this.updateZoomDisplay();
        }
    }
    
    updateZoomDisplay() {
        const zoomLevel = document.getElementById('zoomLevel');
        if (zoomLevel && this.visualRenderer) {
            zoomLevel.textContent = `${Math.round(this.visualRenderer.zoomLevel * 100)}%`;
        }
    }
    
    refreshVisualRepresentation() {
        if (this.visualRenderer) {
            // Update the renderer's skin data
            this.visualRenderer.skinData = this.currentSkin;
            
            // Re-render everything
            this.visualRenderer.render();
            
            // Update device info
            this.updateDeviceInfo();
            
            // Update button panel
            this.updateButtonPanel();
            
            // Update device selector
            this.updateDeviceSelectorFromSkin();
        }
    }
    
    setupLivePreview(jsonEditor) {
        let debounceTimer;
        
        this.livePreviewHandler = (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.tryLivePreview(e.target.value);
            }, 500); // 500ms debounce
        };
        
        jsonEditor.addEventListener('input', this.livePreviewHandler);
    }
    
    cleanupLivePreview() {
        if (this.livePreviewHandler) {
            const jsonEditor = document.getElementById('jsonEditor');
            if (jsonEditor) {
                jsonEditor.removeEventListener('input', this.livePreviewHandler);
            }
            this.livePreviewHandler = null;
        }
    }
    
    tryLivePreview(jsonContent) {
        if (!jsonContent.trim()) return;
        
        try {
            const parsedJson = JSON.parse(jsonContent);
            
            // Basic validation
            if (this.validateSkinData(parsedJson)) {
                // Create temporary backup
                const originalSkin = this.currentSkin;
                
                // Update for preview
                this.currentSkin = parsedJson;
                this.refreshVisualRepresentation();
                
                // Clear any previous error styling
                this.clearJsonErrors();
            }
        } catch (error) {
            // Show error highlighting but don't update visual
            this.highlightJsonError(error.message);
        }
    }
    
    clearJsonErrors() {
        const jsonEditor = document.getElementById('jsonEditor');
        if (jsonEditor) {
            jsonEditor.classList.remove('json-error');
        }
    }
    
    highlightJsonError(errorMessage) {
        const jsonEditor = document.getElementById('jsonEditor');
        if (jsonEditor) {
            jsonEditor.classList.add('json-error');
            jsonEditor.title = `JSON Error: ${errorMessage}`;
        }
    }
    
    handleResize() {
        // Debounce resize events
        if (this.resizeTimer) clearTimeout(this.resizeTimer);
        
        this.resizeTimer = setTimeout(() => {
            if (this.visualRenderer) {
                // Re-apply scaling to adjust to new container size
                this.visualRenderer.applyScaling();
                
                // Update device info if needed
                this.updateDeviceInfo();
            }
        }, 250);
    }
    
    // Button Panel Management
    async initializeButtonPanel() {
        await this.loadAvailableButtons();
        this.updateButtonPanel();
    }
    
    async loadAvailableButtons() {
        try {
            const response = await fetch('./assets/available_buttons.json');
            this.availableButtonsData = await response.json();
        } catch (error) {
            console.error('Failed to load available buttons:', error);
            this.availableButtonsData = {};
        }
    }
    
    updateButtonPanel() {
        if (!this.currentSkin) return;
        
        // Get console type from gameTypeIdentifier
        const consoleType = this.getConsoleTypeFromIdentifier();
        const availableButtons = this.availableButtonsData[consoleType] || [];
        
        this.populateAvailableButtons(availableButtons);
        this.populateCurrentButtons();
    }
    
    getConsoleTypeFromIdentifier() {
        if (!this.currentSkin?.gameTypeIdentifier) return 'gba';
        
        const identifier = this.currentSkin.gameTypeIdentifier;
        
        // Extract console type from identifier (e.g., "com.rileytestut.delta.game.gba" -> "gba")
        const parts = identifier.split('.');
        return parts[parts.length - 1] || 'gba';
    }
    
    populateAvailableButtons(availableButtons) {
        const grid = document.getElementById('availableButtonsGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        availableButtons.forEach(buttonType => {
            const buttonEl = document.createElement('div');
            buttonEl.className = 'available-button';
            buttonEl.textContent = buttonType;
            buttonEl.dataset.buttonType = buttonType;
            
            // Check if button already exists
            if (this.isButtonInUse(buttonType)) {
                buttonEl.classList.add('disabled');
            } else {
                buttonEl.addEventListener('click', () => this.addButton(buttonType));
            }
            
            grid.appendChild(buttonEl);
        });
    }
    
    populateCurrentButtons() {
        const list = document.getElementById('currentButtonsList');
        if (!list) return;
        
        list.innerHTML = '';
        
        const items = this.visualRenderer?.getItemsForOrientation() || [];
        items.forEach((item, index) => {
            const itemEl = this.createCurrentButtonItem(item, index);
            list.appendChild(itemEl);
        });
    }
    
    createCurrentButtonItem(item, index) {
        const itemEl = document.createElement('div');
        itemEl.className = 'current-button-item';
        itemEl.dataset.buttonIndex = index;
        
        const infoEl = document.createElement('div');
        infoEl.className = 'current-button-info';
        
        const nameEl = document.createElement('div');
        nameEl.className = 'current-button-name';
        nameEl.textContent = this.getButtonDisplayName(item.inputs);
        
        const coordsEl = document.createElement('div');
        coordsEl.className = 'current-button-coords';
        if (item.frame) {
            coordsEl.textContent = `(${item.frame.x}, ${item.frame.y}) ${item.frame.width}×${item.frame.height}`;
        }
        
        infoEl.appendChild(nameEl);
        infoEl.appendChild(coordsEl);
        
        const actionsEl = document.createElement('div');
        actionsEl.className = 'current-button-actions';
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn-small';
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => this.removeButton(index));
        
        actionsEl.appendChild(removeBtn);
        
        itemEl.appendChild(infoEl);
        itemEl.appendChild(actionsEl);
        
        return itemEl;
    }
    
    getButtonDisplayName(inputs) {
        if (!inputs) return 'Unknown';
        
        if (typeof inputs === 'object' && !Array.isArray(inputs)) {
            // D-pad style input
            return 'D-PAD';
        }
        
        if (Array.isArray(inputs)) {
            return inputs[0].toUpperCase();
        }
        
        return 'Button';
    }
    
    isButtonInUse(buttonType) {
        if (!this.visualRenderer) return false;
        
        const items = this.visualRenderer.getItemsForOrientation() || [];
        return items.some(item => {
            if (!item.inputs) return false;
            
            if (Array.isArray(item.inputs)) {
                return item.inputs.includes(buttonType);
            }
            
            if (typeof item.inputs === 'object') {
                return Object.values(item.inputs).includes(buttonType);
            }
            
            return false;
        });
    }
    
    addButton(buttonType) {
        // Create new button item with default position and size
        const newButton = {
            inputs: [buttonType],
            frame: {
                x: 50,
                y: 50,
                width: 60,
                height: 60
            },
            extendedEdges: {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0
            }
        };
        
        // Special handling for d-pad
        if (buttonType === 'dpad') {
            newButton.inputs = {
                up: 'up',
                down: 'down',
                left: 'left',
                right: 'right'
            };
            newButton.frame.width = 120;
            newButton.frame.height = 120;
        }
        
        // Add to current skin data
        const orientationData = this.currentSkin.representations?.iphone?.edgeToEdge?.[this.visualRenderer.currentOrientation];
        if (orientationData && orientationData.items) {
            orientationData.items.push(newButton);
            
            // Refresh visual and panels
            this.visualRenderer.render();
            this.updateJsonViewer();
            this.updateButtonPanel();
        }
    }
    
    removeButton(index) {
        const orientationData = this.currentSkin.representations?.iphone?.edgeToEdge?.[this.visualRenderer.currentOrientation];
        if (orientationData && orientationData.items) {
            orientationData.items.splice(index, 1);
            
            // Refresh visual and panels
            this.visualRenderer.render();
            this.updateJsonViewer();
            this.updateButtonPanel();
        }
    }
    
    toggleButtonPanel() {
        const buttonPanel = document.querySelector('.button-panel');
        const toggleBtn = document.getElementById('toggleButtonPanel');
        
        buttonPanel.classList.toggle('collapsed');
        
        // Rotate toggle icon (left-pointing arrow when collapsed)
        if (buttonPanel.classList.contains('collapsed')) {
            toggleBtn.style.transform = 'rotate(180deg)';
        } else {
            toggleBtn.style.transform = '';
        }
    }
    
    showAddButtonDialog() {
        // For now, just show available buttons - could be expanded to a modal
        const buttonPanel = document.querySelector('.button-panel');
        if (buttonPanel.classList.contains('collapsed')) {
            this.toggleButtonPanel();
        }
    }
    
    // Device Size Management
    async initializeDeviceSelector() {
        await this.loadiPhoneSizes();
        this.populateDeviceSelector();
        this.updateDeviceSelectorFromSkin();
    }
    
    async loadiPhoneSizes() {
        try {
            const response = await fetch('./assets/iphone-sizes.json');
            this.iPhoneSizes = await response.json();
        } catch (error) {
            console.error('Failed to load iPhone sizes:', error);
            this.iPhoneSizes = [];
        }
    }
    
    populateDeviceSelector() {
        const select = document.getElementById('deviceSizeSelect');
        if (!select || !this.iPhoneSizes) return;
        
        // Clear existing options except the first one
        const firstOption = select.querySelector('option[value=""]');
        select.innerHTML = '';
        if (firstOption) select.appendChild(firstOption);
        
        // Add iPhone size options
        this.iPhoneSizes.forEach((iphone, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${iphone.model} (${iphone.logicalWidth}×${iphone.logicalHeight})`;
            option.dataset.width = iphone.logicalWidth;
            option.dataset.height = iphone.logicalHeight;
            option.dataset.model = iphone.model;
            select.appendChild(option);
        });
    }
    
    updateDeviceSelectorFromSkin() {
        if (!this.currentSkin || !this.visualRenderer) return;
        
        const mappingSize = this.visualRenderer.getMappingSize();
        const select = document.getElementById('deviceSizeSelect');
        
        // Try to find matching iPhone size
        const matchingIndex = this.iPhoneSizes.findIndex(iphone => 
            iphone.logicalWidth === mappingSize.width && 
            iphone.logicalHeight === mappingSize.height
        );
        
        if (matchingIndex !== -1) {
            select.value = matchingIndex;
        } else {
            select.value = '';
        }
    }
    
    onDeviceSizeChange(event) {
        const select = event.target;
        const selectedIndex = parseInt(select.value);
        
        if (isNaN(selectedIndex) || !this.iPhoneSizes[selectedIndex]) return;
        
        const selectedDevice = this.iPhoneSizes[selectedIndex];
        this.updateMappingSize(selectedDevice.logicalWidth, selectedDevice.logicalHeight, selectedDevice.model);
    }
    
    updateMappingSize(width, height, model) {
        if (!this.currentSkin || !this.visualRenderer) return;
        
        // Update mapping size for both orientations
        const portraitData = this.currentSkin.representations?.iphone?.edgeToEdge?.portrait;
        const landscapeData = this.currentSkin.representations?.iphone?.edgeToEdge?.landscape;
        
        if (portraitData) {
            portraitData.mappingSize = {
                width: width,
                height: height
            };
        }
        
        if (landscapeData) {
            landscapeData.mappingSize = {
                width: height, // Swapped for landscape
                height: width
            };
        }
        
        // Refresh visual representation
        this.visualRenderer.render();
        this.updateDeviceInfo();
        this.updateJsonViewer();
        
        // Show feedback
        this.showMappingSizeFeedback(width, height, model);
    }
    
    showMappingSizeFeedback(width, height, model) {
        // Create temporary feedback element
        const feedback = document.createElement('div');
        feedback.className = 'drag-feedback';
        feedback.textContent = `Mapping size updated to ${model} (${width}×${height})`;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent);
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 10000;
            animation: fadeInOut 3s ease-in-out forwards;
        `;
        
        document.body.appendChild(feedback);
        
        // Remove after animation
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 3000);
    }
    
    onInsetSliderChange(event) {
        const slider = event.target;
        const insetType = slider.id.replace('inset', '').toLowerCase();
        const percentage = parseInt(slider.value);
        const decimalValue = percentage / 100;
        
        // Update the display value
        const valueDisplay = document.getElementById(`${slider.id}Value`);
        if (valueDisplay) {
            valueDisplay.textContent = `${percentage}%`;
        }
        
        // Update the JSON configuration
        this.updateMenuInset(insetType, decimalValue);
        
        // Update visual line
        this.updateInsetLine(insetType, percentage);
    }
    
    updateMenuInset(insetType, value) {
        if (!this.currentSkin) return;
        
        const currentOrientationData = this.getCurrentOrientationData();
        if (!currentOrientationData) return;
        
        // Initialize menuInsets if it doesn't exist
        if (!currentOrientationData.menuInsets) {
            currentOrientationData.menuInsets = {};
        }
        
        // Update the specific inset value (keep even if 0)
        currentOrientationData.menuInsets[insetType] = value;
        
        // Update the JSON viewer
        this.updateJsonViewer();
    }
    
    initializeMenuInsetsSliders() {
        if (!this.currentSkin) return;
        
        // Ensure menuInsets exist in both orientations
        const portraitData = this.currentSkin.representations?.iphone?.edgeToEdge?.portrait;
        const landscapeData = this.currentSkin.representations?.iphone?.edgeToEdge?.landscape;
        
        if (portraitData && !portraitData.menuInsets) {
            portraitData.menuInsets = { bottom: 0 };
        }
        
        if (landscapeData && !landscapeData.menuInsets) {
            landscapeData.menuInsets = { left: 0, right: 0 };
        }
        
        // Always show the appropriate sliders
        this.updateMenuInsetsDisplay();
        
    }
    
    getCurrentOrientationData() {
        if (!this.currentSkin) return null;
        
        return this.currentSkin.representations?.iphone?.edgeToEdge?.[this.currentOrientation] || null;
    }
    
    
    updateMenuInsetsDisplay() {
        if (!this.currentSkin) return;
        
        // Get data from both orientations
        const portraitData = this.currentSkin.representations?.iphone?.edgeToEdge?.portrait;
        const landscapeData = this.currentSkin.representations?.iphone?.edgeToEdge?.landscape;
        
        const portraitInsets = portraitData?.menuInsets || {};
        const landscapeInsets = landscapeData?.menuInsets || {};
        
        // Define which insets are available for current orientation
        const availableInsets = this.currentOrientation === 'portrait' 
            ? ['bottom'] 
            : ['left', 'right'];
        
        // Update controls and lines - always show available ones
        ['bottom', 'left', 'right'].forEach(insetType => {
            const control = document.getElementById(`inset${insetType.charAt(0).toUpperCase()}${insetType.slice(1)}Control`);
            const slider = document.getElementById(`inset${insetType.charAt(0).toUpperCase()}${insetType.slice(1)}`);
            const valueDisplay = document.getElementById(`inset${insetType.charAt(0).toUpperCase()}${insetType.slice(1)}Value`);
            const line = document.getElementById(`${insetType}InsetLine`);
            
            if (control && line) {
                if (availableInsets.includes(insetType)) {
                    control.classList.remove('hidden');
                    line.style.display = 'block';
                    
                    if (slider && valueDisplay) {
                        // Get value from appropriate orientation
                        let decimalValue = 0;
                        if (insetType === 'bottom') {
                            decimalValue = portraitInsets[insetType] || 0;
                        } else {
                            decimalValue = landscapeInsets[insetType] || 0;
                        }
                        
                        const percentageValue = Math.round(decimalValue * 100);
                        
                        slider.value = percentageValue;
                        valueDisplay.textContent = `${percentageValue}%`;
                        
                        // Update visual line position
                        this.updateInsetLine(insetType, percentageValue);
                    }
                } else {
                    control.classList.add('hidden');
                    line.style.display = 'none';
                }
            }
        });
    }
    
    updateInsetLine(insetType, percentage) {
        const lineId = `${insetType}InsetLine`;
        const line = document.getElementById(lineId);
        if (!line) return;
        
        // Move the line to the correct position based on percentage
        if (insetType === 'bottom') {
            line.style.bottom = `${percentage}%`;
        } else if (insetType === 'left') {
            line.style.left = `${percentage}%`;
        } else if (insetType === 'right') {
            line.style.right = `${percentage}%`;
        }
        
        // Always make lines visible (more prominent when there's a value)
        line.style.opacity = percentage > 0 ? '0.8' : '0.3';
        line.style.display = 'block';
    }
    
    updateDeviceInfo() {
        const deviceModel = document.getElementById('deviceModel');
        const screenSize = document.getElementById('screenSize');
        
        if (this.currentSkin) {
            const mappingSize = this.getMappingSize();
            deviceModel.textContent = 'iPhone';
            screenSize.textContent = `${mappingSize.width} × ${mappingSize.height}`;
        }
    }
    
    getMappingSize() {
        if (!this.currentSkin) return { width: 0, height: 0 };
        
        const orientationData = this.currentSkin.representations?.iphone?.edgeToEdge?.[this.currentOrientation];
        
        if (!orientationData || !orientationData.mappingSize) {
            // Fallback to portrait
            const portrait = this.currentSkin.representations?.iphone?.edgeToEdge?.portrait;
            if (!portrait || !portrait.mappingSize) return { width: 0, height: 0 };
            
            const { width, height } = portrait.mappingSize;
            return this.currentOrientation === 'landscape' ? { width: height, height: width } : { width, height };
        }
        
        return orientationData.mappingSize;
    }
    
    setOrientation(orientation) {
        if (this.currentOrientation === orientation) return;
        
        this.currentOrientation = orientation;
        
        // Update button states
        document.getElementById('portraitBtn').classList.toggle('active', orientation === 'portrait');
        document.getElementById('landscapeBtn').classList.toggle('active', orientation === 'landscape');
        
        // Update device frame
        const deviceFrame = document.getElementById('deviceFrame');
        deviceFrame.className = orientation === 'landscape' ? 'device-frame landscape' : 'device-frame';
        
        // Re-render visual
        if (this.visualRenderer) {
            this.visualRenderer.setOrientation(orientation);
            this.visualRenderer.render();
        }
        
        this.updateDeviceInfo();
        this.updateMenuInsetsDisplay();
    }
    
    zoomIn() {
        if (this.zoomLevel < 2) {
            this.zoomLevel = Math.min(2, this.zoomLevel * 1.2);
            this.applyZoom();
        }
    }
    
    zoomOut() {
        if (this.zoomLevel > 0.3) {
            this.zoomLevel = Math.max(0.3, this.zoomLevel / 1.2);
            this.applyZoom();
        }
    }
    
    resetZoom() {
        this.zoomLevel = 1;
        this.applyZoom();
    }
    
    applyZoom() {
        const deviceFrame = document.getElementById('deviceFrame');
        const zoomLevel = document.getElementById('zoomLevel');
        
        if (deviceFrame) {
            deviceFrame.style.transform = `scale(${this.zoomLevel})`;
        }
        
        if (zoomLevel) {
            zoomLevel.textContent = `${Math.round(this.zoomLevel * 100)}%`;
        }
    }
}

// Visual Renderer Class
class VisualRenderer {
    constructor(container, skinData, controller) {
        this.container = container;
        this.skinData = skinData;
        this.controller = controller;
        this.currentOrientation = 'portrait';
        this.zoomLevel = 1.0;
        this.buttons = [];
    }
    
    setOrientation(orientation) {
        this.currentOrientation = orientation;
    }
    
    setZoomLevel(level) {
        this.zoomLevel = Math.max(0.5, Math.min(2.0, level));
    }
    
    applyScaling() {
        const visualContainer = this.container.closest('.visual-container');
        if (visualContainer) {
            visualContainer.style.transform = `scale(${this.zoomLevel})`;
        }
    }
    
    render() {
        this.setupContainer();
        this.renderScreens();
        this.renderButtons();
        this.applyScaling();
    }
    
    setupContainer() {
        const mappingSize = this.getMappingSize();
        const screenArea = this.container.querySelector('#screenArea');
        
        if (screenArea) {
            screenArea.style.width = `${mappingSize.width}px`;
            screenArea.style.height = `${mappingSize.height}px`;
        }
    }
    
    getMappingSize() {
        if (!this.skinData) return { width: 430, height: 932 };
        
        const orientationData = this.skinData.representations?.iphone?.edgeToEdge?.[this.currentOrientation];
        
        if (!orientationData || !orientationData.mappingSize) {
            // Fallback to portrait
            const portrait = this.skinData.representations?.iphone?.edgeToEdge?.portrait;
            if (!portrait || !portrait.mappingSize) return { width: 430, height: 932 };
            
            const { width, height } = portrait.mappingSize;
            return this.currentOrientation === 'landscape' ? { width: height, height: width } : { width, height };
        }
        
        return orientationData.mappingSize;
    }
    
    getItemsForOrientation() {
        if (!this.skinData) return [];
        
        const orientationData = this.skinData.representations?.iphone?.edgeToEdge?.[this.currentOrientation];
        return orientationData?.items || [];
    }
    
    getScreensForOrientation() {
        if (!this.skinData) return [];
        
        const orientationData = this.skinData.representations?.iphone?.edgeToEdge?.[this.currentOrientation];
        return orientationData?.screens || [];
    }
    
    renderScreens() {
        const gameScreen = this.container.querySelector('#gameScreen');
        if (!gameScreen) return;
        
        // Clear existing screen content (except label)
        const label = gameScreen.querySelector('.game-screen-label');
        gameScreen.innerHTML = '';
        if (label) gameScreen.appendChild(label);
        
        const screens = this.getScreensForOrientation();
        
        screens.forEach((screen, index) => {
            if (screen.outputFrame) {
                this.createGameScreen(screen.outputFrame, index);
            }
        });
    }
    
    createGameScreen(outputFrame, index) {
        const gameScreen = this.container.querySelector('#gameScreen');
        if (!gameScreen) return;
        
        const screenElement = document.createElement('div');
        screenElement.className = `game-screen-area game-screen-${index}`;
        screenElement.dataset.screenIndex = index;
        
        // Position and size the screen based on outputFrame
        screenElement.style.position = 'absolute';
        screenElement.style.left = `${outputFrame.x}px`;
        screenElement.style.top = `${outputFrame.y}px`;
        screenElement.style.width = `${outputFrame.width}px`;
        screenElement.style.height = `${outputFrame.height}px`;
        
        // Style the game screen area
        screenElement.style.backgroundColor = '#000';
        screenElement.style.border = '1px solid #333';
        screenElement.style.borderRadius = '4px';
        screenElement.style.display = 'flex';
        screenElement.style.alignItems = 'center';
        screenElement.style.justifyContent = 'center';
        screenElement.style.color = '#666';
        screenElement.style.fontSize = '12px';
        screenElement.style.fontFamily = 'monospace';
        screenElement.style.cursor = 'move';
        screenElement.style.userSelect = 'none';
        
        // Add screen identifier
        screenElement.textContent = `Screen ${index + 1}`;
        screenElement.title = `Game Screen ${index + 1} (${outputFrame.width}×${outputFrame.height}) - Drag to reposition`;
        
        // Make screen draggable with mouse events
        screenElement.addEventListener('mousedown', (e) => this.onScreenMouseDown(e, index));
        screenElement.addEventListener('click', (e) => this.onScreenClick(e, index));
        
        gameScreen.appendChild(screenElement);
    }
    
    renderButtons() {
        const buttonLayer = this.container.querySelector('#buttonLayer');
        if (!buttonLayer) return;
        
        // Clear existing buttons
        buttonLayer.innerHTML = '';
        
        // Note: Using mouse-based dragging, no HTML5 drop zone needed
        
        const items = this.getItemsForOrientation();
        items.forEach((item, index) => {
            const buttonEl = this.createButton(item, index);
            buttonLayer.appendChild(buttonEl);
        });
    }
    
    
    createButton(item, index) {
        if (!item.frame) return document.createElement('div');
        
        const button = document.createElement('div');
        button.className = `skin-button button-${this.getButtonType(item.inputs)}`;
        button.style.left = `${item.frame.x}px`;
        button.style.top = `${item.frame.y}px`;
        button.style.width = `${item.frame.width}px`;
        button.style.height = `${item.frame.height}px`;
        button.textContent = this.getButtonLabel(item.inputs);
        button.dataset.index = index;
        
        // Make button draggable with mouse events (no ghost image)
        button.draggable = false;
        button.style.cursor = 'move';
        
        // Add mouse-based drag event handlers
        button.addEventListener('mousedown', (e) => this.onMouseDown(e, index));
        
        // Add click handler for future interactions
        button.addEventListener('click', (e) => this.onButtonClick(e, index));
        
        return button;
    }
    
    getButtonType(inputs) {
        if (!inputs) return 'unknown';
        
        // Handle object-style inputs (like d-pad)
        if (typeof inputs === 'object' && !Array.isArray(inputs)) {
            if (inputs.up && inputs.down && inputs.left && inputs.right) {
                return 'dpad';
            }
            return 'directional';
        }
        
        // Handle array-style inputs (single buttons)
        if (Array.isArray(inputs)) {
            const input = inputs[0];
            if (['a', 'b', 'x', 'y'].includes(input)) return 'action';
            if (['l', 'r', 'l2', 'r2'].includes(input)) return 'shoulder';
            if (['start', 'select'].includes(input)) return 'system';
            if (['menu', 'quickSave', 'quickLoad', 'toggleFastForward'].includes(input)) return 'utility';
            return 'action';
        }
        
        return 'unknown';
    }
    
    getButtonLabel(inputs) {
        if (!inputs) return 'BTN';
        
        // Handle object-style inputs (like d-pad)
        if (typeof inputs === 'object' && !Array.isArray(inputs)) {
            if (inputs.up && inputs.down && inputs.left && inputs.right) {
                return 'D-PAD';
            }
            return Object.keys(inputs)[0].toUpperCase();
        }
        
        // Handle array-style inputs
        if (Array.isArray(inputs)) {
            return inputs[0].toUpperCase();
        }
        
        return 'BTN';
    }
    
    onButtonClick(e, index) {
        // Only handle click if it wasn't a drag operation
        if (!this.isDragging) {
            console.log(`Button ${index} clicked`);
            // Future: Handle button interactions
        }
    }
    
    onMouseDown(e, index) {
        e.preventDefault();
        
        this.isDragging = false;
        this.dragStartTime = Date.now();
        
        // Get button element and its current position
        const button = e.target;
        const rect = button.getBoundingClientRect();
        const containerRect = this.container.querySelector('#buttonLayer').getBoundingClientRect();
        
        // Store drag data
        this.dragData = {
            index: index,
            button: button,
            startX: rect.left - containerRect.left,
            startY: rect.top - containerRect.top,
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top,
            startMouseX: e.clientX,
            startMouseY: e.clientY
        };
        
        // Visual feedback
        button.classList.add('dragging');
        
        // Add document event listeners for drag
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
        
        // Prevent text selection
        document.body.style.userSelect = 'none';
    }
    
    onMouseMove = (e) => {
        if (!this.dragData) return;
        
        e.preventDefault();
        
        // Check if we've moved enough to consider this a drag
        const deltaX = Math.abs(e.clientX - this.dragData.startMouseX);
        const deltaY = Math.abs(e.clientY - this.dragData.startMouseY);
        
        if (deltaX > 3 || deltaY > 3) {
            this.isDragging = true;
        }
        
        if (!this.isDragging) return;
        
        // Calculate new position relative to container
        const containerRect = this.container.querySelector('#buttonLayer').getBoundingClientRect();
        const scale = this.zoomLevel || 1;
        
        let newX = (e.clientX - containerRect.left - this.dragData.offsetX) / scale;
        let newY = (e.clientY - containerRect.top - this.dragData.offsetY) / scale;
        
        // Constrain to container bounds
        const mappingSize = this.getMappingSize();
        const buttonWidth = parseInt(this.dragData.button.style.width);
        const buttonHeight = parseInt(this.dragData.button.style.height);
        
        newX = Math.max(0, Math.min(newX, mappingSize.width - buttonWidth));
        newY = Math.max(0, Math.min(newY, mappingSize.height - buttonHeight));
        
        // Update button position instantly
        this.dragData.button.style.left = `${newX}px`;
        this.dragData.button.style.top = `${newY}px`;
    }
    
    onMouseUp = (e) => {
        if (!this.dragData) return;
        
        const button = this.dragData.button;
        
        // Remove document event listeners
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
        
        // Reset visual feedback
        button.classList.remove('dragging');
        document.body.style.userSelect = '';
        
        // Check if this was actually a drag
        const dragDuration = Date.now() - this.dragStartTime;
        const wasDragged = this.isDragging && dragDuration > 100;
        
        if (wasDragged) {
            // Update the JSON data with new position
            const newX = parseInt(button.style.left);
            const newY = parseInt(button.style.top);
            
            this.updateButtonPosition(this.dragData.index, newX, newY);
        }
        
        // Reset drag state
        setTimeout(() => {
            this.isDragging = false;
        }, 50);
        
        this.dragData = null;
    }
    
    updateButtonPosition(index, newX, newY) {
        const items = this.getItemsForOrientation();
        if (items[index] && items[index].frame) {
            // Update the frame position
            items[index].frame.x = Math.round(newX);
            items[index].frame.y = Math.round(newY);
            
            // Update the skin data
            const orientationData = this.skinData.representations?.iphone?.edgeToEdge?.[this.currentOrientation];
            if (orientationData && orientationData.items) {
                orientationData.items[index] = items[index];
            }
            
            // Refresh the JSON viewer to show updated data (via controller)
            if (this.controller && this.controller.updateJsonViewer) {
                this.controller.updateJsonViewer();
            }
            
            // Show feedback
            this.showDragFeedback(index, newX, newY);
        }
    }
    
    showDragFeedback(index, x, y) {
        // Create temporary feedback element
        const feedback = document.createElement('div');
        feedback.className = 'drag-feedback';
        feedback.textContent = `Button ${index + 1} moved to (${x}, ${y})`;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success);
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 10000;
            animation: fadeInOut 2s ease-in-out forwards;
        `;
        
        document.body.appendChild(feedback);
        
        // Remove after animation
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 2000);
    }
    
    onScreenClick(e, index) {
        // Only handle click if it wasn't a drag operation
        if (!this.isScreenDragging) {
            console.log(`Screen ${index + 1} clicked`);
            // Future: Handle screen interactions
        }
    }
    
    onScreenMouseDown(e, index) {
        e.preventDefault();
        
        this.isScreenDragging = false;
        this.screenDragStartTime = Date.now();
        
        // Get screen element and its current position
        const screen = e.target;
        const rect = screen.getBoundingClientRect();
        const containerRect = this.container.querySelector('#gameScreen').getBoundingClientRect();
        
        // Store screen drag data
        this.screenDragData = {
            index: index,
            screen: screen,
            startX: rect.left - containerRect.left,
            startY: rect.top - containerRect.top,
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top,
            startMouseX: e.clientX,
            startMouseY: e.clientY
        };
        
        // Visual feedback
        screen.classList.add('dragging');
        
        // Add document event listeners for drag
        document.addEventListener('mousemove', this.onScreenMouseMove);
        document.addEventListener('mouseup', this.onScreenMouseUp);
        
        // Prevent text selection
        document.body.style.userSelect = 'none';
    }
    
    onScreenMouseMove = (e) => {
        if (!this.screenDragData) return;
        
        e.preventDefault();
        
        // Check if we've moved enough to consider this a drag
        const deltaX = Math.abs(e.clientX - this.screenDragData.startMouseX);
        const deltaY = Math.abs(e.clientY - this.screenDragData.startMouseY);
        
        if (deltaX > 3 || deltaY > 3) {
            this.isScreenDragging = true;
        }
        
        if (!this.isScreenDragging) return;
        
        // Calculate new position relative to container
        const containerRect = this.container.querySelector('#gameScreen').getBoundingClientRect();
        const scale = this.zoomLevel || 1;
        
        let newX = (e.clientX - containerRect.left - this.screenDragData.offsetX) / scale;
        let newY = (e.clientY - containerRect.top - this.screenDragData.offsetY) / scale;
        
        // Constrain to container bounds
        const mappingSize = this.getMappingSize();
        const screenWidth = parseInt(this.screenDragData.screen.style.width);
        const screenHeight = parseInt(this.screenDragData.screen.style.height);
        
        newX = Math.max(0, Math.min(newX, mappingSize.width - screenWidth));
        newY = Math.max(0, Math.min(newY, mappingSize.height - screenHeight));
        
        // Update screen position instantly
        this.screenDragData.screen.style.left = `${newX}px`;
        this.screenDragData.screen.style.top = `${newY}px`;
    }
    
    onScreenMouseUp = (e) => {
        if (!this.screenDragData) return;
        
        const screen = this.screenDragData.screen;
        
        // Remove document event listeners
        document.removeEventListener('mousemove', this.onScreenMouseMove);
        document.removeEventListener('mouseup', this.onScreenMouseUp);
        
        // Reset visual feedback
        screen.classList.remove('dragging');
        document.body.style.userSelect = '';
        
        // Check if this was actually a drag
        const dragDuration = Date.now() - this.screenDragStartTime;
        const wasDragged = this.isScreenDragging && dragDuration > 100;
        
        if (wasDragged) {
            // Update the JSON data with new position
            const newX = parseInt(screen.style.left);
            const newY = parseInt(screen.style.top);
            
            this.updateScreenPosition(this.screenDragData.index, newX, newY);
        }
        
        // Reset drag state
        setTimeout(() => {
            this.isScreenDragging = false;
        }, 50);
        
        this.screenDragData = null;
    }
    
    updateScreenPosition(index, newX, newY) {
        const screens = this.getScreensForOrientation();
        if (screens[index] && screens[index].outputFrame) {
            // Update the outputFrame position
            screens[index].outputFrame.x = Math.round(newX);
            screens[index].outputFrame.y = Math.round(newY);
            
            // Update the skin data
            const orientationData = this.skinData.representations?.iphone?.edgeToEdge?.[this.currentOrientation];
            if (orientationData && orientationData.screens) {
                orientationData.screens[index] = screens[index];
            }
            
            // Refresh the JSON viewer to show updated data (via controller)
            if (this.controller && this.controller.updateJsonViewer) {
                this.controller.updateJsonViewer();
            }
            
            // Show feedback
            this.showScreenDragFeedback(index, newX, newY);
        }
    }
    
    showScreenDragFeedback(index, x, y) {
        // Create temporary feedback element
        const feedback = document.createElement('div');
        feedback.className = 'drag-feedback';
        feedback.textContent = `Screen ${index + 1} moved to (${x}, ${y})`;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success);
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 10000;
            animation: fadeInOut 2s ease-in-out forwards;
        `;
        
        document.body.appendChild(feedback);
        
        // Remove after animation
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 2000);
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EmuController();
});