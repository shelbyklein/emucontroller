// EmuController JavaScript

class EmuController {
    constructor() {
        this.currentSkin = null;
        this.gameTypeIdentifiers = [];
        this.iPhoneSizes = [];
        this.selectedConsole = null;
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
        const importBtn = document.getElementById('importBtn');
        const fileInput = document.getElementById('fileInput');
        const backBtn = document.getElementById('backBtn');

        // Modal buttons
        const closeModal = document.getElementById('closeModal');
        const cancelModal = document.getElementById('cancelModal');
        const createSkinBtn = document.getElementById('createSkinBtn');

        newSkinBtn.addEventListener('click', () => this.showNewSkinModal());
        importBtn.addEventListener('click', () => this.importSkin());
        fileInput.addEventListener('change', (e) => this.handleFileImport(e));
        backBtn.addEventListener('click', () => this.showWelcomeScreen());

        // Modal events
        closeModal.addEventListener('click', () => this.hideNewSkinModal());
        cancelModal.addEventListener('click', () => this.hideNewSkinModal());
        createSkinBtn.addEventListener('click', () => this.handleCreateSkin());

        // Close modal on overlay click
        document.getElementById('newSkinModal').addEventListener('click', (e) => {
            if (e.target.id === 'newSkinModal') {
                this.hideNewSkinModal();
            }
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
        document.getElementById('editorScreen').style.display = 'block';
        
        // Update skin title
        const skinTitle = document.getElementById('skinTitle');
        skinTitle.textContent = skinName;
        
        // Update page title
        document.title = `EmuController - ${skinName}`;
        
        console.log('Current skin data:', this.currentSkin);
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EmuController();
});