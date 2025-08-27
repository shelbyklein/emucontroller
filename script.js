// EmuController JavaScript

class EmuController {
    constructor() {
        this.currentSkin = null;
        this.gameTypeIdentifiers = [];
        this.iPhoneSizes = [];
        this.selectedConsole = null;
        this.isEditMode = false;
        this.originalJsonContent = '';
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