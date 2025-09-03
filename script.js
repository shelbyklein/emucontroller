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
        
        // Store uploaded image data for export
        this.uploadedImages = new Map(); // filename -> imageData
        
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
        
        // Background image events
        const uploadBackgroundBtn = document.getElementById('uploadBackgroundBtn');
        const removeBackgroundBtn = document.getElementById('removeBackgroundBtn');
        const backgroundImageInput = document.getElementById('backgroundImageInput');
        
        uploadBackgroundBtn.addEventListener('click', () => this.triggerBackgroundUpload());
        removeBackgroundBtn.addEventListener('click', () => this.removeBackgroundImage());
        backgroundImageInput.addEventListener('change', (e) => this.handleBackgroundImageUpload(e));
        
        // Background opacity slider
        const backgroundOpacitySlider = document.getElementById('backgroundOpacity');
        backgroundOpacitySlider.addEventListener('input', (e) => this.onBackgroundOpacityChange(e));
        
        // Orientation controls
        const enablePortrait = document.getElementById('enablePortrait');
        const enableLandscape = document.getElementById('enableLandscape');
        
        enablePortrait.addEventListener('change', (e) => this.onOrientationToggle('portrait', e.target.checked));
        enableLandscape.addEventListener('change', (e) => this.onOrientationToggle('landscape', e.target.checked));
        
        // Custom button creator
        const addCustomButtonBtn = document.getElementById('addCustomButtonBtn');
        const customButtonInput = document.getElementById('customButtonInput');
        
        addCustomButtonBtn.addEventListener('click', () => this.addCustomButton());
        customButtonInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addCustomButton();
            }
        });
        
        // Button edit modal events
        const closeButtonEditModal = document.getElementById('closeButtonEditModal');
        const cancelButtonEdit = document.getElementById('cancelButtonEdit');
        const saveButtonEdit = document.getElementById('saveButtonEdit');
        
        closeButtonEditModal.addEventListener('click', () => this.hideButtonEditModal());
        cancelButtonEdit.addEventListener('click', () => this.hideButtonEditModal());
        saveButtonEdit.addEventListener('click', () => this.saveButtonEdits());
        
        // Add screen button event
        const addScreenBtn = document.getElementById('addScreenBtn');
        addScreenBtn.addEventListener('click', () => this.addScreen());
        
        // Screen edit modal events
        const closeScreenEditModal = document.getElementById('closeScreenEditModal');
        const cancelScreenEdit = document.getElementById('cancelScreenEdit');
        const saveScreenEdit = document.getElementById('saveScreenEdit');
        
        closeScreenEditModal.addEventListener('click', () => this.hideScreenEditModal());
        cancelScreenEdit.addEventListener('click', () => this.hideScreenEditModal());
        saveScreenEdit.addEventListener('click', () => this.saveScreenEdits());
        
        // Aspect ratio calculation events
        const inputWidthField = document.getElementById('editInputWidth');
        const inputHeightField = document.getElementById('editInputHeight');
        const outputWidthField = document.getElementById('editOutputWidth');
        const outputHeightField = document.getElementById('editOutputHeight');
        
        inputWidthField.addEventListener('input', () => this.updateInputFrameAspectRatio());
        inputHeightField.addEventListener('input', () => this.updateInputFrameAspectRatio());
        outputWidthField.addEventListener('input', () => this.updateOutputFrameAspectRatio());
        outputHeightField.addEventListener('input', () => this.updateOutputFrameAspectRatio());

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

    async handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const fileName = file.name.toLowerCase();
        const supportedExtensions = ['.json', '.deltaskin', '.gammaskin', '.manicskin', '.zip'];
        
        if (!supportedExtensions.some(ext => fileName.endsWith(ext))) {
            alert('Please select a valid skin file (.json, .deltaskin, .gammaskin, .manicskin, or .zip).');
            return;
        }

        try {
            let skinData;
            let skinName;

            if (fileName.endsWith('.json')) {
                // Handle JSON files directly
                skinData = await this.readJsonFile(file);
                skinName = skinData.name || file.name.replace('.json', '');
            } else {
                // Handle ZIP-based skin formats (.deltaskin, .gammaskin, .manicskin, .zip)
                const result = await this.readSkinArchive(file);
                skinData = result.skinData;
                skinName = result.skinName;
            }

            // Basic validation - check if it has the expected structure
            if (!this.validateSkinData(skinData)) {
                alert('Invalid skin file format. Please select a valid emulator skin file.');
                return;
            }

            this.currentSkin = skinData;
            
            // If we extracted images, automatically set the first one as background
            if (this.uploadedImages.size > 0) {
                this.autoSetBackgroundImage();
            }
            
            this.showEditorScreen(skinName);
            
        } catch (error) {
            console.error('Error importing skin file:', error);
            alert(`Error importing skin file: ${error.message}`);
        }

        // Reset file input
        event.target.value = '';
    }

    readJsonFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const skinData = JSON.parse(e.target.result);
                    resolve(skinData);
                } catch (error) {
                    reject(new Error('Invalid JSON format'));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    async readSkinArchive(file) {
        try {
            // Load JSZip library (already included in HTML)
            const zip = new JSZip();
            const zipContents = await zip.loadAsync(file);
            
            // Look for JSON files in the archive
            let skinJsonFile = null;
            const possibleJsonNames = ['info.json', 'skin.json', 'config.json'];
            
            // First check for common skin JSON filenames
            for (const jsonName of possibleJsonNames) {
                if (zipContents.files[jsonName]) {
                    skinJsonFile = zipContents.files[jsonName];
                    break;
                }
            }
            
            // If not found, look for any .json file
            if (!skinJsonFile) {
                for (const fileName in zipContents.files) {
                    if (fileName.toLowerCase().endsWith('.json') && !zipContents.files[fileName].dir) {
                        skinJsonFile = zipContents.files[fileName];
                        break;
                    }
                }
            }
            
            if (!skinJsonFile) {
                throw new Error('No JSON configuration file found in the skin archive');
            }
            
            // Read the JSON content
            const jsonContent = await skinJsonFile.async('text');
            const skinData = JSON.parse(jsonContent);
            
            // Extract images and store them for later use
            await this.extractSkinImages(zipContents);
            
            // Generate skin name from file or JSON
            const skinName = skinData.name || file.name.replace(/\.(deltaskin|gammaskin|manicskin|zip)$/i, '');
            
            return { skinData, skinName };
            
        } catch (error) {
            throw new Error(`Failed to read skin archive: ${error.message}`);
        }
    }

    async extractSkinImages(zipContents) {
        // Extract and store images for use in the editor
        const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
        
        for (const fileName in zipContents.files) {
            const file = zipContents.files[fileName];
            if (file.dir) continue;
            
            const lowerFileName = fileName.toLowerCase();
            if (imageExtensions.some(ext => lowerFileName.endsWith(ext))) {
                try {
                    const imageData = await file.async('base64');
                    const mimeType = this.getMimeTypeFromExtension(lowerFileName);
                    const dataUrl = `data:${mimeType};base64,${imageData}`;
                    
                    // Store the image data for potential use
                    this.uploadedImages.set(fileName, dataUrl);
                } catch (error) {
                    console.warn(`Failed to extract image ${fileName}:`, error);
                }
            }
        }
    }

    getMimeTypeFromExtension(fileName) {
        if (fileName.endsWith('.png')) return 'image/png';
        if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) return 'image/jpeg';
        if (fileName.endsWith('.gif')) return 'image/gif';
        return 'image/png'; // default
    }

    autoSetBackgroundImage() {
        if (this.uploadedImages.size === 0) return;
        
        // Look for common background image names first
        const commonBackgroundNames = [
            'background.png',
            'bg.png', 
            'skin.png',
            'portrait.png',
            'landscape.png'
        ];
        
        let selectedImage = null;
        let selectedFileName = null;
        
        // First, try to find a common background image name
        for (const [fileName, imageData] of this.uploadedImages) {
            const lowerFileName = fileName.toLowerCase();
            if (commonBackgroundNames.some(name => lowerFileName.includes(name))) {
                selectedImage = imageData;
                selectedFileName = fileName;
                break;
            }
        }
        
        // If no common name found, use the first image
        if (!selectedImage) {
            const firstEntry = this.uploadedImages.entries().next().value;
            selectedImage = firstEntry[1];
            selectedFileName = firstEntry[0];
        }
        
        // Load image to get dimensions, then set as background
        const img = new Image();
        img.onload = () => {
            this.setBackgroundImage(selectedFileName, selectedImage, img.width, img.height);
            console.log(`Automatically set background image: ${selectedFileName} (${img.width}×${img.height})`);
        };
        img.onerror = () => {
            console.warn(`Failed to load background image: ${selectedFileName}`);
        };
        img.src = selectedImage;
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
            this.initializeBackgroundImage();
            this.initializeOrientationControls();
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

    async exportSkin() {
        if (!this.currentSkin) {
            alert('No skin to export');
            return;
        }
        
        try {
            const zip = new JSZip();
            
            // Add info.json (the main skin configuration)
            const jsonStr = JSON.stringify(this.currentSkin, null, 2);
            zip.file('info.json', jsonStr);
            
            // Check for background images and add them to zip
            await this.addBackgroundImagesToZip(zip);
            
            // Generate and download zip file with selected format
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);
            
            // Get selected export format
            const formatSelect = document.getElementById('exportFormatSelect');
            const selectedFormat = formatSelect.value;
            const fileName = `${this.currentSkin.name || 'skin'}.${selectedFormat}`;
            
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export skin. Please try again.');
        }
    }

    async addBackgroundImagesToZip(zip) {
        const representations = this.currentSkin.representations;
        if (!representations?.iphone?.edgeToEdge) return;
        
        const orientations = representations.iphone.edgeToEdge;
        const imageFiles = new Set(); // Use Set to avoid duplicates
        
        // Collect all background image references
        for (const [, orientationData] of Object.entries(orientations)) {
            if (orientationData.assets?.large) {
                imageFiles.add(orientationData.assets.large);
            }
        }
        
        // Add each unique image file to the zip
        for (const imageFileName of imageFiles) {
            try {
                // Check if it's an uploaded image that we have stored data for
                if (this.uploadedImages.has(imageFileName)) {
                    // It's a user-uploaded image
                    const imageData = this.uploadedImages.get(imageFileName);
                    const base64Data = imageData.split(',')[1];
                    const mimeType = imageData.split(';')[0].split(':')[1];
                    const extension = mimeType.split('/')[1];
                    
                    // Use the original filename or create a clean filename
                    const cleanFileName = imageFileName.includes('.') ? imageFileName : `${imageFileName}.${extension}`;
                    
                    // Convert base64 to binary and add to zip
                    zip.file(cleanFileName, base64Data, { base64: true });
                } else {
                    // It's a template image, try to fetch it
                    const imagePath = imageFileName.startsWith('./') ? imageFileName : `./${imageFileName}`;
                    
                    // Try to fetch the template image
                    try {
                        const response = await fetch(imagePath);
                        if (response.ok) {
                            const imageBlob = await response.blob();
                            zip.file(imageFileName, imageBlob);
                        }
                    } catch (fetchError) {
                        console.warn(`Could not fetch template image: ${imagePath}`, fetchError);
                        // Continue without this image - user may need to add it manually
                    }
                }
            } catch (error) {
                console.warn(`Failed to process image ${imageFileName}:`, error);
            }
        }
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
            
            // Extract template name from path (e.g., "./assets/templates/gba/default.json" -> "gba")
            const templatePathParts = template.path.split('/');
            this.currentTemplateName = templatePathParts[templatePathParts.length - 2]; // Get the folder name
            
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
        this.populateCurrentScreens();
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
            // Use our own getButtonIcon method
            const iconMap = {
                'dpad': './assets/icons/dpad.svg',
                'menu': './assets/icons/menu.svg',
                'toggleFastForward': './assets/icons/fast-forward.svg',
                'fastForward': './assets/icons/fast-forward.svg'
            };
            
            const iconPath = iconMap[buttonType];
            if (iconPath) {
                buttonEl.innerHTML = `<img src="${iconPath}" alt="${buttonType}" class="button-icon">`;
            } else {
                buttonEl.textContent = buttonType.toUpperCase();
            }
            buttonEl.dataset.buttonType = buttonType;
            buttonEl.title = buttonType; // Add tooltip for accessibility
            
            // Always allow adding buttons (multiple instances allowed)
            buttonEl.addEventListener('click', () => this.addButton(buttonType));
            
            grid.appendChild(buttonEl);
        });
    }
    
    populateCurrentButtons() {
        const list = document.getElementById('currentButtonsList');
        if (!list) return;
        
        // Clear any existing highlights before repopulating
        if (this.visualRenderer) {
            this.visualRenderer.unhighlightAllButtons();
        }
        
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
        const displayName = this.getButtonDisplayName(item.inputs);
        if (displayName.includes('<img')) {
            nameEl.innerHTML = displayName;
        } else {
            nameEl.textContent = displayName;
        }
        
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
        removeBtn.className = 'btn-small btn-icon';
        removeBtn.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"/>
                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,2h4a2,2 0 0,1 2,2v2"/>
            </svg>
        `;
        removeBtn.title = 'Remove button';
        removeBtn.addEventListener('click', () => this.removeButton(index));
        
        actionsEl.appendChild(removeBtn);
        
        itemEl.appendChild(infoEl);
        itemEl.appendChild(actionsEl);
        
        // Add hover event listeners to highlight corresponding button in visual UI
        itemEl.addEventListener('mouseenter', () => {
            if (this.visualRenderer) {
                this.visualRenderer.highlightButton(index);
            }
        });
        
        itemEl.addEventListener('mouseleave', () => {
            if (this.visualRenderer) {
                this.visualRenderer.unhighlightButton(index);
            }
        });
        
        // Add click event listener to open edit modal
        itemEl.addEventListener('click', (e) => {
            // Don't open modal if click was on remove button
            if (e.target.closest('.btn-small')) {
                return;
            }
            this.showButtonEditModal(item, index);
        });
        
        // Add visual feedback for clickable item
        itemEl.style.cursor = 'pointer';
        
        return itemEl;
    }
    
    getButtonIcon(buttonType) {
        const iconMap = {
            'dpad': './assets/icons/dpad.svg',
            'menu': './assets/icons/menu.svg',
            'toggleFastForward': './assets/icons/fast-forward.svg',
            'fastForward': './assets/icons/fast-forward.svg'
        };
        
        const iconPath = iconMap[buttonType];
        if (iconPath) {
            return `<img src="${iconPath}" alt="${buttonType}" class="button-icon">`;
        }
        
        // Fallback to text for buttons without specific icons
        return buttonType.toUpperCase();
    }
    
    getButtonDisplayName(inputs) {
        if (!inputs) return 'Unknown';
        
        if (typeof inputs === 'object' && !Array.isArray(inputs)) {
            // D-pad style input - use icon only
            if (inputs.up && inputs.down && inputs.left && inputs.right) {
                return '<img src="./assets/icons/dpad.svg" alt="D-PAD" class="button-icon" title="D-PAD">';
            }
            return Object.keys(inputs)[0].toUpperCase();
        }
        
        if (Array.isArray(inputs)) {
            const buttonType = inputs[0];
            // Check if we have an icon for this button type
            const iconMap = {
                'dpad': './assets/icons/dpad.svg',
                'menu': './assets/icons/menu.svg',
                'toggleFastForward': './assets/icons/fast-forward.svg',
                'fastForward': './assets/icons/fast-forward.svg'
            };
            
            const iconPath = iconMap[buttonType];
            if (iconPath) {
                // Better alt text for icon-only display
                const altText = buttonType === 'toggleFastForward' ? 'TOGGLE FAST FORWARD' : 
                               buttonType === 'fastForward' ? 'FAST FORWARD' : 
                               buttonType.toUpperCase();
                return `<img src="${iconPath}" alt="${altText}" class="button-icon" title="${altText}">`;
            }
            return buttonType.toUpperCase();
        }
        
        return 'Button';
    }
    
    addButton(buttonType) {
        // Calculate position to avoid stacking (add some offset for each new button)
        const currentOrientationData = this.currentSkin.representations?.iphone?.edgeToEdge?.[this.visualRenderer.currentOrientation];
        const existingButtons = currentOrientationData?.items?.length || 0;
        const offset = existingButtons * 20; // 20px offset for each existing button
        
        // Create new button item with default position and size
        const newButton = {
            inputs: [buttonType],
            frame: {
                x: 50 + offset,
                y: 50 + offset,
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
    
    addCustomButton() {
        const customButtonInput = document.getElementById('customButtonInput');
        const inputValue = customButtonInput.value.trim();
        
        // Validate input
        if (!inputValue) {
            alert('Please enter an input name for the custom button.');
            return;
        }
        
        // Check for valid input name (alphanumeric, underscore, hyphen)
        if (!/^[a-zA-Z0-9_-]+$/.test(inputValue)) {
            alert('Input name can only contain letters, numbers, underscores, and hyphens.');
            return;
        }
        
        // Calculate position to avoid stacking
        const currentOrientationData = this.currentSkin.representations?.iphone?.edgeToEdge?.[this.visualRenderer.currentOrientation];
        const existingButtons = currentOrientationData?.items?.length || 0;
        const offset = existingButtons * 20;
        
        // Create custom button
        const customButton = {
            inputs: [inputValue],
            frame: {
                x: 50 + offset,
                y: 50 + offset,
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
        
        // Add to current skin data
        const orientationData = this.currentSkin.representations?.iphone?.edgeToEdge?.[this.visualRenderer.currentOrientation];
        if (orientationData && orientationData.items) {
            orientationData.items.push(customButton);
            
            // Clear input field
            customButtonInput.value = '';
            
            // Refresh visual and panels
            this.visualRenderer.render();
            this.updateJsonViewer();
            this.updateButtonPanel();
        }
    }
    
    showButtonEditModal(item, index) {
        this.editingButtonIndex = index;
        this.editingButtonItem = { ...item };
        
        // Populate form fields
        this.populateEditForm(item);
        
        // Show modal
        const modal = document.getElementById('buttonEditModal');
        modal.style.display = 'flex';
    }
    
    hideButtonEditModal() {
        const modal = document.getElementById('buttonEditModal');
        modal.style.display = 'none';
        this.editingButtonIndex = null;
        this.editingButtonItem = null;
    }
    
    populateEditForm(item) {
        // Handle inputs (can be array or object)
        const inputsField = document.getElementById('editButtonInputs');
        if (Array.isArray(item.inputs)) {
            inputsField.value = item.inputs.join(', ');
        } else if (typeof item.inputs === 'object') {
            // For d-pad style inputs, show as comma-separated values
            inputsField.value = Object.values(item.inputs).join(', ');
        } else {
            inputsField.value = item.inputs || '';
        }
        
        // Frame properties
        document.getElementById('editButtonX').value = item.frame?.x || 0;
        document.getElementById('editButtonY').value = item.frame?.y || 0;
        document.getElementById('editButtonWidth').value = item.frame?.width || 60;
        document.getElementById('editButtonHeight').value = item.frame?.height || 60;
        
        // Extended edges
        document.getElementById('editExtendedTop').value = item.extendedEdges?.top || 0;
        document.getElementById('editExtendedRight').value = item.extendedEdges?.right || 0;
        document.getElementById('editExtendedBottom').value = item.extendedEdges?.bottom || 0;
        document.getElementById('editExtendedLeft').value = item.extendedEdges?.left || 0;
    }
    
    saveButtonEdits() {
        if (this.editingButtonIndex === null) return;
        
        // Get values from form
        const inputsValue = document.getElementById('editButtonInputs').value.trim();
        const x = parseInt(document.getElementById('editButtonX').value);
        const y = parseInt(document.getElementById('editButtonY').value);
        const width = parseInt(document.getElementById('editButtonWidth').value);
        const height = parseInt(document.getElementById('editButtonHeight').value);
        const extendedTop = parseInt(document.getElementById('editExtendedTop').value);
        const extendedRight = parseInt(document.getElementById('editExtendedRight').value);
        const extendedBottom = parseInt(document.getElementById('editExtendedBottom').value);
        const extendedLeft = parseInt(document.getElementById('editExtendedLeft').value);
        
        // Validate inputs
        if (!inputsValue) {
            alert('Please enter input value(s)');
            return;
        }
        
        if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) {
            alert('Please enter valid numeric values for position and size');
            return;
        }
        
        // Process inputs
        let processedInputs;
        const inputParts = inputsValue.split(',').map(s => s.trim()).filter(s => s);
        
        if (inputParts.length === 1) {
            processedInputs = inputParts;
        } else if (inputParts.length === 4 && 
                   inputParts.includes('up') && inputParts.includes('down') && 
                   inputParts.includes('left') && inputParts.includes('right')) {
            // D-pad style
            processedInputs = {
                up: 'up',
                down: 'down',
                left: 'left',
                right: 'right'
            };
        } else {
            processedInputs = inputParts;
        }
        
        // Update the button item
        const orientationData = this.currentSkin.representations?.iphone?.edgeToEdge?.[this.visualRenderer.currentOrientation];
        if (orientationData && orientationData.items && orientationData.items[this.editingButtonIndex]) {
            const buttonItem = orientationData.items[this.editingButtonIndex];
            
            buttonItem.inputs = processedInputs;
            buttonItem.frame = {
                x: x,
                y: y,
                width: width,
                height: height
            };
            buttonItem.extendedEdges = {
                top: extendedTop,
                right: extendedRight,
                bottom: extendedBottom,
                left: extendedLeft
            };
            
            // Refresh visual and panels
            this.visualRenderer.render();
            this.updateJsonViewer();
            this.updateButtonPanel();
            
            // Hide modal
            this.hideButtonEditModal();
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
    
    // Screen Management Methods
    populateCurrentScreens() {
        const list = document.getElementById('currentScreensList');
        if (!list) return;
        
        // Clear any existing highlights before repopulating
        if (this.visualRenderer) {
            this.visualRenderer.unhighlightAllButtons();
        }
        
        list.innerHTML = '';
        
        const screens = this.visualRenderer?.getScreensForOrientation() || [];
        screens.forEach((screen, index) => {
            const itemEl = this.createCurrentScreenItem(screen, index);
            list.appendChild(itemEl);
        });
    }
    
    createCurrentScreenItem(screen, index) {
        const itemEl = document.createElement('div');
        itemEl.className = 'current-screen-item';
        itemEl.dataset.screenIndex = index;
        
        const infoEl = document.createElement('div');
        infoEl.className = 'current-screen-info';
        
        const nameEl = document.createElement('div');
        nameEl.className = 'current-screen-name';
        nameEl.textContent = `Screen ${index + 1}`;
        
        const coordsEl = document.createElement('div');
        coordsEl.className = 'current-screen-coords';
        if (screen.outputFrame) {
            coordsEl.textContent = `(${screen.outputFrame.x}, ${screen.outputFrame.y}) ${screen.outputFrame.width}×${screen.outputFrame.height}`;
        }
        
        infoEl.appendChild(nameEl);
        infoEl.appendChild(coordsEl);
        
        const actionsEl = document.createElement('div');
        actionsEl.className = 'current-button-actions';
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn-small btn-icon';
        removeBtn.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"/>
                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,2h4a2,2 0 0,1 2,2v2"/>
            </svg>
        `;
        removeBtn.title = 'Remove screen';
        removeBtn.addEventListener('click', () => this.removeScreen(index));
        
        actionsEl.appendChild(removeBtn);
        
        itemEl.appendChild(infoEl);
        itemEl.appendChild(actionsEl);
        
        // Add click event listener to open edit modal
        itemEl.addEventListener('click', (e) => {
            // Don't open modal if click was on remove button
            if (e.target.closest('.btn-small')) {
                return;
            }
            this.showScreenEditModal(screen, index);
        });
        
        // Add visual feedback for clickable item
        itemEl.style.cursor = 'pointer';
        
        return itemEl;
    }
    
    addScreen() {
        const orientationData = this.currentSkin.representations?.iphone?.edgeToEdge?.[this.visualRenderer.currentOrientation];
        if (!orientationData) return;
        
        if (!orientationData.screens) {
            orientationData.screens = [];
        }
        
        // Calculate position to avoid overlap
        const existingScreens = orientationData.screens.length;
        const offset = existingScreens * 20;
        
        // Create new screen with default properties
        const newScreen = {
            inputFrame: {
                x: 0,
                y: 0,
                width: 256,
                height: 192
            },
            outputFrame: {
                x: 50 + offset,
                y: 100 + offset,
                width: 200,
                height: 150
            }
        };
        
        orientationData.screens.push(newScreen);
        
        // Refresh visual and panels
        this.visualRenderer.render();
        this.updateJsonViewer();
        this.updateButtonPanel();
    }
    
    removeScreen(index) {
        const orientationData = this.currentSkin.representations?.iphone?.edgeToEdge?.[this.visualRenderer.currentOrientation];
        if (orientationData && orientationData.screens) {
            orientationData.screens.splice(index, 1);
            
            // Refresh visual and panels
            this.visualRenderer.render();
            this.updateJsonViewer();
            this.updateButtonPanel();
        }
    }
    
    // Screen Edit Modal Methods
    showScreenEditModal(screen, index) {
        this.editingScreenIndex = index;
        this.editingScreenItem = { ...screen };
        
        // Populate form fields
        this.populateScreenEditForm(screen);
        
        // Show modal
        const modal = document.getElementById('screenEditModal');
        modal.style.display = 'flex';
    }
    
    hideScreenEditModal() {
        const modal = document.getElementById('screenEditModal');
        modal.style.display = 'none';
        this.editingScreenIndex = null;
        this.editingScreenItem = null;
    }
    
    populateScreenEditForm(screen) {
        // Input frame properties
        document.getElementById('editInputX').value = screen.inputFrame?.x || 0;
        document.getElementById('editInputY').value = screen.inputFrame?.y || 0;
        document.getElementById('editInputWidth').value = screen.inputFrame?.width || 256;
        document.getElementById('editInputHeight').value = screen.inputFrame?.height || 192;
        
        // Output frame properties
        document.getElementById('editOutputX').value = screen.outputFrame?.x || 0;
        document.getElementById('editOutputY').value = screen.outputFrame?.y || 0;
        document.getElementById('editOutputWidth').value = screen.outputFrame?.width || 200;
        document.getElementById('editOutputHeight').value = screen.outputFrame?.height || 150;
        
        // Update aspect ratios
        this.updateInputFrameAspectRatio();
        this.updateOutputFrameAspectRatio();
    }
    
    saveScreenEdits() {
        if (this.editingScreenIndex === null) return;
        
        // Get values from form
        const inputX = parseInt(document.getElementById('editInputX').value);
        const inputY = parseInt(document.getElementById('editInputY').value);
        const inputWidth = parseInt(document.getElementById('editInputWidth').value);
        const inputHeight = parseInt(document.getElementById('editInputHeight').value);
        const outputX = parseInt(document.getElementById('editOutputX').value);
        const outputY = parseInt(document.getElementById('editOutputY').value);
        const outputWidth = parseInt(document.getElementById('editOutputWidth').value);
        const outputHeight = parseInt(document.getElementById('editOutputHeight').value);
        
        // Validate inputs
        if (isNaN(inputX) || isNaN(inputY) || isNaN(inputWidth) || isNaN(inputHeight) ||
            isNaN(outputX) || isNaN(outputY) || isNaN(outputWidth) || isNaN(outputHeight)) {
            alert('Please enter valid numeric values for all fields');
            return;
        }
        
        if (inputWidth <= 0 || inputHeight <= 0 || outputWidth <= 0 || outputHeight <= 0) {
            alert('Width and height values must be greater than 0');
            return;
        }
        
        // Update the screen item
        const orientationData = this.currentSkin.representations?.iphone?.edgeToEdge?.[this.visualRenderer.currentOrientation];
        if (orientationData && orientationData.screens && orientationData.screens[this.editingScreenIndex]) {
            const screenItem = orientationData.screens[this.editingScreenIndex];
            
            screenItem.inputFrame = {
                x: inputX,
                y: inputY,
                width: inputWidth,
                height: inputHeight
            };
            
            screenItem.outputFrame = {
                x: outputX,
                y: outputY,
                width: outputWidth,
                height: outputHeight
            };
            
            // Refresh visual and panels
            this.visualRenderer.render();
            this.updateJsonViewer();
            this.updateButtonPanel();
            
            // Hide modal
            this.hideScreenEditModal();
        }
    }
    
    // Aspect ratio calculation methods
    calculateAspectRatio(width, height) {
        if (!width || !height || width <= 0 || height <= 0) {
            return '-';
        }
        
        // Find the greatest common divisor
        const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
        const divisor = gcd(width, height);
        
        const simplifiedWidth = width / divisor;
        const simplifiedHeight = height / divisor;
        
        // Common aspect ratio names
        const commonRatios = {
            '4:3': [4, 3],
            '3:2': [3, 2],
            '16:9': [16, 9],
            '16:10': [16, 10],
            '5:4': [5, 4],
            '1:1': [1, 1],
            '3:4': [3, 4],
            '2:3': [2, 3],
            '9:16': [9, 16],
            '10:16': [10, 16],
            '4:5': [4, 5]
        };
        
        // Check if it matches a common ratio
        for (const [name, ratio] of Object.entries(commonRatios)) {
            if (simplifiedWidth === ratio[0] && simplifiedHeight === ratio[1]) {
                return name;
            }
        }
        
        // Return simplified ratio
        return `${simplifiedWidth}:${simplifiedHeight}`;
    }
    
    updateInputFrameAspectRatio() {
        const width = parseInt(document.getElementById('editInputWidth').value) || 0;
        const height = parseInt(document.getElementById('editInputHeight').value) || 0;
        const aspectRatio = this.calculateAspectRatio(width, height);
        document.getElementById('inputFrameAspectRatio').textContent = aspectRatio;
    }
    
    updateOutputFrameAspectRatio() {
        const width = parseInt(document.getElementById('editOutputWidth').value) || 0;
        const height = parseInt(document.getElementById('editOutputHeight').value) || 0;
        const aspectRatio = this.calculateAspectRatio(width, height);
        document.getElementById('outputFrameAspectRatio').textContent = aspectRatio;
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
    
    // Background Image Methods
    triggerBackgroundUpload() {
        const fileInput = document.getElementById('backgroundImageInput');
        fileInput.click();
    }
    
    handleBackgroundImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validate file type
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            alert('Please upload a PNG or JPG image file.');
            return;
        }
        
        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('File size too large. Please upload an image smaller than 10MB.');
            return;
        }
        
        // Read file as data URL for preview and background
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            const filename = file.name;
            
            // Create an image to get dimensions
            const img = new Image();
            img.onload = () => {
                this.setBackgroundImage(filename, imageData, img.width, img.height);
            };
            img.src = imageData;
        };
        reader.readAsDataURL(file);
        
        // Reset file input
        event.target.value = '';
    }
    
    setBackgroundImage(filename, imageData, width, height) {
        if (!this.currentSkin) return;
        
        // Store the image data for export
        this.uploadedImages.set(filename, imageData);
        
        // Update assets.large in current orientation
        const currentOrientationData = this.getCurrentOrientationData();
        if (currentOrientationData) {
            if (!currentOrientationData.assets) {
                currentOrientationData.assets = {};
            }
            currentOrientationData.assets.large = filename;
        }
        
        // Update UI elements
        this.updateBackgroundUI(filename, width, height);
        
        // Apply background to screen area
        this.applyBackgroundToScreen(imageData);
        
        // Update JSON viewer
        this.updateJsonViewer();
    }
    
    updateBackgroundUI(filename, width, height) {
        const backgroundInfo = document.getElementById('backgroundInfo');
        const backgroundFilename = document.getElementById('backgroundFilename');
        const backgroundSize = document.getElementById('backgroundSize');
        const removeBtn = document.getElementById('removeBackgroundBtn');
        const opacitySlider = document.getElementById('backgroundOpacity');
        const opacityValue = document.getElementById('backgroundOpacityValue');
        
        // Show background info
        backgroundInfo.style.display = 'block';
        removeBtn.style.display = 'inline-flex';
        
        // Update details
        backgroundFilename.textContent = filename;
        backgroundSize.textContent = `${width} × ${height} pixels`;
        
        // Reset opacity slider to 50%
        opacitySlider.value = 50;
        opacityValue.textContent = '50%';
    }
    
    applyBackgroundToScreen(imageData) {
        const screenArea = document.getElementById('screenArea');
        const gameScreen = document.getElementById('gameScreen');
        
        if (screenArea) {
            screenArea.style.backgroundImage = `url(${imageData})`;
            screenArea.style.backgroundSize = 'cover';
            screenArea.style.backgroundPosition = 'center';
            screenArea.style.backgroundRepeat = 'no-repeat';
        }
        
        if (gameScreen) {
            // Set game screen to have a semi-transparent background color overlay
            gameScreen.style.backgroundColor = 'rgba(10, 10, 10, 0.5)'; // Start at 50% opacity
        }
    }
    
    onBackgroundOpacityChange(event) {
        const percentage = parseInt(event.target.value);
        const opacity = percentage / 100;
        
        // Update display value
        const valueDisplay = document.getElementById('backgroundOpacityValue');
        if (valueDisplay) {
            valueDisplay.textContent = `${percentage}%`;
        }
        
        // Apply opacity to game screen background color overlay
        const gameScreen = document.getElementById('gameScreen');
        if (gameScreen) {
            gameScreen.style.backgroundColor = `rgba(10, 10, 10, ${opacity})`;
        }
    }
    
    onOrientationToggle(orientation, isEnabled) {
        if (!this.currentSkin) return;
        
        const representations = this.currentSkin.representations;
        if (!representations.iphone?.edgeToEdge) return;
        
        // Prevent disabling both orientations
        if (!isEnabled) {
            const otherOrientation = orientation === 'portrait' ? 'landscape' : 'portrait';
            const hasOtherOrientation = !!representations.iphone.edgeToEdge[otherOrientation];
            
            if (!hasOtherOrientation) {
                // Re-check the checkbox since we're preventing this action
                const checkbox = document.getElementById(orientation === 'portrait' ? 'enablePortrait' : 'enableLandscape');
                if (checkbox) checkbox.checked = true;
                
                alert('At least one orientation must be enabled.');
                return;
            }
        }
        
        const orientationData = representations.iphone.edgeToEdge[orientation];
        
        if (isEnabled) {
            // Enable orientation - ensure it exists (create minimal structure if needed)
            if (!orientationData) {
                representations.iphone.edgeToEdge[orientation] = {
                    assets: {},
                    items: [],
                    mappingSize: { width: 430, height: 932 },
                    screens: [{
                        inputFrame: { x: 0, y: 0, width: 256, height: 192 },
                        outputFrame: { x: 0, y: 192, width: 430, height: 289 }
                    }],
                    extendedEdges: { top: 7, bottom: 7, left: 7, right: 7 }
                };
            }
        } else {
            // Disable orientation - remove it from JSON
            if (orientationData) {
                delete representations.iphone.edgeToEdge[orientation];
            }
        }
        
        // Update orientation button states
        this.updateOrientationButtonStates();
        
        // Update visual renderer if we're currently viewing the disabled orientation
        if (this.currentOrientation === orientation && !isEnabled) {
            // Switch to the other orientation
            const otherOrientation = orientation === 'portrait' ? 'landscape' : 'portrait';
            if (representations.iphone.edgeToEdge[otherOrientation]) {
                this.switchOrientation(otherOrientation);
            }
        }
        
        // Update JSON viewer
        this.updateJsonViewer();
    }
    
    updateOrientationButtonStates() {
        if (!this.currentSkin) return;
        
        const representations = this.currentSkin.representations;
        const orientationData = representations?.iphone?.edgeToEdge;
        
        if (!orientationData) return;
        
        const portraitBtn = document.getElementById('portraitBtn');
        const landscapeBtn = document.getElementById('landscapeBtn');
        
        // Disable/enable orientation buttons based on availability
        if (portraitBtn) {
            const hasPortrait = !!orientationData.portrait;
            portraitBtn.disabled = !hasPortrait;
            portraitBtn.style.opacity = hasPortrait ? '1' : '0.5';
        }
        
        if (landscapeBtn) {
            const hasLandscape = !!orientationData.landscape;
            landscapeBtn.disabled = !hasLandscape;
            landscapeBtn.style.opacity = hasLandscape ? '1' : '0.5';
        }
    }
    
    removeBackgroundImage() {
        if (!this.currentSkin) return;
        
        // Remove from assets
        const currentOrientationData = this.getCurrentOrientationData();
        if (currentOrientationData?.assets?.large) {
            const filename = currentOrientationData.assets.large;
            
            // Remove from uploaded images map if it exists
            if (this.uploadedImages.has(filename)) {
                this.uploadedImages.delete(filename);
            }
            
            delete currentOrientationData.assets.large;
            
            // Remove empty assets object
            if (Object.keys(currentOrientationData.assets).length === 0) {
                delete currentOrientationData.assets;
            }
        }
        
        // Update UI
        const backgroundInfo = document.getElementById('backgroundInfo');
        const removeBtn = document.getElementById('removeBackgroundBtn');
        const screenArea = document.getElementById('screenArea');
        const gameScreen = document.getElementById('gameScreen');
        
        backgroundInfo.style.display = 'none';
        removeBtn.style.display = 'none';
        
        // Remove background from screen area
        if (screenArea) {
            screenArea.style.backgroundImage = '';
            screenArea.style.backgroundSize = '';
            screenArea.style.backgroundPosition = '';
            screenArea.style.backgroundRepeat = '';
        }
        
        // Reset game screen background color
        if (gameScreen) {
            gameScreen.style.backgroundColor = '';
        }
        
        // Update JSON viewer
        this.updateJsonViewer();
    }
    
    async loadTemplateBackgroundImage(backgroundAsset) {
        if (!backgroundAsset || !this.currentTemplateName) return;
        
        // Construct path to template asset
        const templatePath = `./assets/templates/${this.currentTemplateName}/${backgroundAsset}`;
        
        try {
            // Check if image exists by trying to load it
            const img = new Image();
            
            return new Promise((resolve) => {
                img.onload = () => {
                    // Apply the image to screen area
                    this.applyBackgroundToScreen(templatePath);
                    resolve();
                };
                
                img.onerror = () => {
                    console.warn(`Template background image not found: ${templatePath}`);
                    resolve(); // Don't reject, just continue without the image
                };
                
                img.src = templatePath;
            });
        } catch (error) {
            console.warn('Failed to load template background image:', error);
        }
    }
    
    clearBackgroundFromScreen() {
        const screenArea = document.getElementById('screenArea');
        const gameScreen = document.getElementById('gameScreen');
        
        if (screenArea) {
            screenArea.style.backgroundImage = '';
            screenArea.style.backgroundSize = '';
            screenArea.style.backgroundPosition = '';
            screenArea.style.backgroundRepeat = '';
        }
        
        if (gameScreen) {
            gameScreen.style.backgroundColor = '';
        }
    }
    
    async initializeBackgroundImage() {
        if (!this.currentSkin) return;
        
        const currentOrientationData = this.getCurrentOrientationData();
        const backgroundAsset = currentOrientationData?.assets?.large;
        
        if (backgroundAsset) {
            // Try to load the external template image
            await this.loadTemplateBackgroundImage(backgroundAsset);
            
            // Show remove button and info
            const removeBtn = document.getElementById('removeBackgroundBtn');
            const backgroundInfo = document.getElementById('backgroundInfo');
            const backgroundFilename = document.getElementById('backgroundFilename');
            const backgroundSize = document.getElementById('backgroundSize');
            
            removeBtn.style.display = 'inline-flex';
            backgroundInfo.style.display = 'block';
            backgroundFilename.textContent = backgroundAsset;
            backgroundSize.textContent = 'Template image';
        } else {
            // Clear any existing background and hide background info
            this.clearBackgroundFromScreen();
            const backgroundInfo = document.getElementById('backgroundInfo');
            const removeBtn = document.getElementById('removeBackgroundBtn');
            
            backgroundInfo.style.display = 'none';
            removeBtn.style.display = 'none';
        }
    }
    
    initializeOrientationControls() {
        if (!this.currentSkin) return;
        
        const representations = this.currentSkin.representations;
        const orientationData = representations?.iphone?.edgeToEdge;
        
        if (!orientationData) return;
        
        // Update checkboxes based on current orientations in JSON
        const enablePortrait = document.getElementById('enablePortrait');
        const enableLandscape = document.getElementById('enableLandscape');
        
        if (enablePortrait) {
            enablePortrait.checked = !!orientationData.portrait;
        }
        
        if (enableLandscape) {
            enableLandscape.checked = !!orientationData.landscape;
        }
        
        // Update orientation button states
        this.updateOrientationButtonStates();
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
        this.initializeBackgroundImage();
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
        screenElement.style.backgroundColor = '#f0f0f0';
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
        screenElement.dataset.type = 'screen';
        
        // Add resize handles
        this.addResizeHandles(screenElement);
        
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
        button.style.position = 'absolute';
        button.style.left = `${item.frame.x}px`;
        button.style.top = `${item.frame.y}px`;
        button.style.width = `${item.frame.width}px`;
        button.style.height = `${item.frame.height}px`;
        const buttonLabel = this.getButtonLabel(item.inputs);
        if (buttonLabel.includes('<img')) {
            button.innerHTML = buttonLabel;
        } else {
            button.textContent = buttonLabel;
        }
        button.dataset.index = index;
        button.dataset.type = 'button';
        
        // Make button draggable with mouse events (no ghost image)
        button.draggable = false;
        button.style.cursor = 'move';
        
        // Add resize handles
        this.addResizeHandles(button);
        
        // Add mouse-based drag event handlers
        button.addEventListener('mousedown', (e) => this.onMouseDown(e, index));
        
        // Add click handler for future interactions
        button.addEventListener('click', (e) => this.onButtonClick(e, index));
        
        return button;
    }
    
    addResizeHandles(element) {
        const handlesContainer = document.createElement('div');
        handlesContainer.className = 'resize-handles';
        
        // Create 8 resize handles (4 corners + 4 edges)
        const handlePositions = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
        
        handlePositions.forEach(position => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${position}`;
            handle.dataset.direction = position;
            
            // Add mouse event handlers for resizing
            handle.addEventListener('mousedown', (e) => this.onResizeHandleMouseDown(e, element, position));
            
            handlesContainer.appendChild(handle);
        });
        
        element.appendChild(handlesContainer);
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
                return this.getButtonIcon('dpad');
            }
            return Object.keys(inputs)[0].toUpperCase();
        }
        
        // Handle array-style inputs
        if (Array.isArray(inputs)) {
            const buttonType = inputs[0];
            // Return icon if available, otherwise return text
            const iconHtml = this.getButtonIcon(buttonType);
            // If iconHtml contains an img tag, return it; otherwise it's just text
            if (iconHtml.includes('<img')) {
                return iconHtml;
            }
            return buttonType.toUpperCase();
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
    
    // Resize handle event handlers
    onResizeHandleMouseDown(e, element, direction) {
        e.preventDefault();
        e.stopPropagation(); // Prevent triggering element drag
        
        const elementType = element.dataset.type;
        const elementIndex = elementType === 'button' ? parseInt(element.dataset.index) : 
                           parseInt(element.dataset.screenIndex);
        
        // Get current element bounds
        const rect = element.getBoundingClientRect();
        const containerRect = element.offsetParent.getBoundingClientRect();
        
        // Store resize data
        this.resizeData = {
            element: element,
            elementType: elementType,
            index: elementIndex,
            direction: direction,
            startMouseX: e.clientX,
            startMouseY: e.clientY,
            startX: rect.left - containerRect.left,
            startY: rect.top - containerRect.top,
            startWidth: rect.width,
            startHeight: rect.height
        };
        
        // Visual feedback
        element.classList.add('resizing');
        
        // Add document event listeners
        document.addEventListener('mousemove', this.onResizeMouseMove);
        document.addEventListener('mouseup', this.onResizeMouseUp);
        
        // Prevent text selection
        document.body.style.userSelect = 'none';
    }
    
    onResizeMouseMove = (e) => {
        if (!this.resizeData) return;
        
        e.preventDefault();
        
        // Account for zoom level
        const scale = this.zoomLevel || 1;
        const deltaX = (e.clientX - this.resizeData.startMouseX) / scale;
        const deltaY = (e.clientY - this.resizeData.startMouseY) / scale;
        
        let newX = this.resizeData.startX;
        let newY = this.resizeData.startY;
        let newWidth = this.resizeData.startWidth;
        let newHeight = this.resizeData.startHeight;
        
        // Calculate new dimensions based on resize direction
        switch (this.resizeData.direction) {
            case 'se': // Southeast - resize width and height
                newWidth = Math.max(20, this.resizeData.startWidth + deltaX);
                newHeight = Math.max(20, this.resizeData.startHeight + deltaY);
                break;
                
            case 'sw': // Southwest - resize width (left) and height
                newWidth = Math.max(20, this.resizeData.startWidth - deltaX);
                newHeight = Math.max(20, this.resizeData.startHeight + deltaY);
                newX = this.resizeData.startX + deltaX;
                break;
                
            case 'ne': // Northeast - resize width and height (top)
                newWidth = Math.max(20, this.resizeData.startWidth + deltaX);
                newHeight = Math.max(20, this.resizeData.startHeight - deltaY);
                newY = this.resizeData.startY + deltaY;
                break;
                
            case 'nw': // Northwest - resize width (left) and height (top)
                newWidth = Math.max(20, this.resizeData.startWidth - deltaX);
                newHeight = Math.max(20, this.resizeData.startHeight - deltaY);
                newX = this.resizeData.startX + deltaX;
                newY = this.resizeData.startY + deltaY;
                break;
                
            case 'n': // North - resize height (top)
                newHeight = Math.max(20, this.resizeData.startHeight - deltaY);
                newY = this.resizeData.startY + deltaY;
                break;
                
            case 's': // South - resize height
                newHeight = Math.max(20, this.resizeData.startHeight + deltaY);
                break;
                
            case 'e': // East - resize width
                newWidth = Math.max(20, this.resizeData.startWidth + deltaX);
                break;
                
            case 'w': // West - resize width (left)
                newWidth = Math.max(20, this.resizeData.startWidth - deltaX);
                newX = this.resizeData.startX + deltaX;
                break;
        }
        
        // Round values and clamp to reasonable bounds
        newX = Math.max(0, Math.round(newX));
        newY = Math.max(0, Math.round(newY));
        newWidth = Math.max(20, Math.round(newWidth));
        newHeight = Math.max(20, Math.round(newHeight));
        
        // Apply new dimensions to element
        this.resizeData.element.style.left = `${newX}px`;
        this.resizeData.element.style.top = `${newY}px`;
        this.resizeData.element.style.width = `${newWidth}px`;
        this.resizeData.element.style.height = `${newHeight}px`;
    }
    
    onResizeMouseUp = (e) => {
        if (!this.resizeData) return;
        
        const element = this.resizeData.element;
        
        // Remove document event listeners
        document.removeEventListener('mousemove', this.onResizeMouseMove);
        document.removeEventListener('mouseup', this.onResizeMouseUp);
        
        // Reset visual feedback
        element.classList.remove('resizing');
        document.body.style.userSelect = '';
        
        // Update the underlying data model
        const newX = Math.round(parseFloat(element.style.left));
        const newY = Math.round(parseFloat(element.style.top));
        const newWidth = Math.round(parseFloat(element.style.width));
        const newHeight = Math.round(parseFloat(element.style.height));
        
        if (this.resizeData.elementType === 'button') {
            this.updateButtonSize(this.resizeData.index, newX, newY, newWidth, newHeight);
        } else if (this.resizeData.elementType === 'screen') {
            this.updateScreenSize(this.resizeData.index, newX, newY, newWidth, newHeight);
        }
        
        // Reset resize state
        this.resizeData = null;
    }
    
    updateButtonSize(index, newX, newY, newWidth, newHeight) {
        const items = this.getItemsForOrientation();
        if (items[index] && items[index].frame) {
            // Update the frame dimensions
            items[index].frame.x = newX;
            items[index].frame.y = newY;
            items[index].frame.width = newWidth;
            items[index].frame.height = newHeight;
            
            // Update the skin data
            const orientationData = this.skinData.representations?.iphone?.edgeToEdge?.[this.currentOrientation];
            if (orientationData && orientationData.items) {
                orientationData.items[index] = items[index];
            }
            
            // Refresh the JSON viewer
            if (this.controller && this.controller.updateJsonViewer) {
                this.controller.updateJsonViewer();
            }
            
            // Show feedback
            this.showResizeFeedback('Button', index, newWidth, newHeight);
        }
    }
    
    updateScreenSize(index, newX, newY, newWidth, newHeight) {
        const screens = this.getScreensForOrientation();
        if (screens[index] && screens[index].outputFrame) {
            // Update the output frame dimensions
            screens[index].outputFrame.x = newX;
            screens[index].outputFrame.y = newY;
            screens[index].outputFrame.width = newWidth;
            screens[index].outputFrame.height = newHeight;
            
            // Update the skin data
            const orientationData = this.skinData.representations?.iphone?.edgeToEdge?.[this.currentOrientation];
            if (orientationData && orientationData.screens) {
                orientationData.screens[index] = screens[index];
            }
            
            // Refresh the JSON viewer
            if (this.controller && this.controller.updateJsonViewer) {
                this.controller.updateJsonViewer();
            }
            
            // Show feedback
            this.showResizeFeedback('Screen', index, newWidth, newHeight);
        }
    }
    
    showResizeFeedback(elementType, index, width, height) {
        // Create temporary feedback element
        const feedback = document.createElement('div');
        feedback.className = 'resize-feedback';
        feedback.textContent = `${elementType} ${index + 1} resized to ${width}×${height}`;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent-primary);
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
    
    highlightButton(index) {
        const buttonLayer = this.container.querySelector('#buttonLayer');
        if (!buttonLayer) return;
        
        const button = buttonLayer.querySelector(`[data-index="${index}"]`);
        if (button) {
            button.classList.add('list-hovered');
        }
    }
    
    unhighlightButton(index) {
        const buttonLayer = this.container.querySelector('#buttonLayer');
        if (!buttonLayer) return;
        
        const button = buttonLayer.querySelector(`[data-index="${index}"]`);
        if (button) {
            button.classList.remove('list-hovered');
        }
    }
    
    unhighlightAllButtons() {
        const buttonLayer = this.container.querySelector('#buttonLayer');
        if (!buttonLayer) return;
        
        const buttons = buttonLayer.querySelectorAll('.skin-button.list-hovered');
        buttons.forEach(button => {
            button.classList.remove('list-hovered');
        });
    }
    
    getButtonIcon(buttonType) {
        const iconMap = {
            'dpad': './assets/icons/dpad.svg',
            'menu': './assets/icons/menu.svg',
            'toggleFastForward': './assets/icons/fast-forward.svg',
            'fastForward': './assets/icons/fast-forward.svg'
        };
        
        const iconPath = iconMap[buttonType];
        if (iconPath) {
            return `<img src="${iconPath}" alt="${buttonType}" class="button-icon">`;
        }
        
        // Fallback to text for buttons without specific icons
        return buttonType.toUpperCase();
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EmuController();
});