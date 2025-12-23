// Array para almacenar los fondos
let funds = [];
let editingFundId = null; // Para rastrear el fondo en edición
let versions = []; // Array para almacenar versiones
let currentVersionId = 'current'; // ID de la versión activa
let privacyMode = false; // Modo privacidad para ocultar valores monetarios

// Array para almacenar assets
let assets = [];
let editingAssetId = null;

// Timeline Configuration
let timelineConfig = {
    startDate: null,
    analysisDate: null,
    phases: []
};

// Elementos del DOM
const addFundBtn = document.getElementById('addFundBtn');
const fundModal = document.getElementById('fundModal');
const closeModal = document.querySelector('.close');
const cancelBtn = document.getElementById('cancelBtn');
const fundForm = document.getElementById('fundForm');
const tanksContainer = document.getElementById('tanksContainer');
const fundIsDebtCheckbox = document.getElementById('fundIsDebt');
const versionSelector = document.getElementById('versionSelector');
const createVersionBtn = document.getElementById('createVersionBtn');
const manageVersionsBtn = document.getElementById('manageVersionsBtn');
const versionsModal = document.getElementById('versionsModal');
const closeVersionsModal = document.getElementById('closeVersionsModal');
const timelineBtn = document.getElementById('timelineBtn');
const timelineModal = document.getElementById('timelineModal');
const closeTimelineModal = document.getElementById('closeTimelineModal');
const timelineForm = document.getElementById('timelineForm');
const addPhaseBtn = document.getElementById('addPhaseBtn');
const cancelTimelineBtn = document.getElementById('cancelTimelineBtn');
const generateDefaultsBtn = document.getElementById('generateDefaultsBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const importCsvBtn = document.getElementById('importCsvBtn');
const csvFileInput = document.getElementById('csvFileInput');
const togglePrivacyBtn = document.getElementById('togglePrivacyBtn');
const exportReportBtn = document.getElementById('exportReportBtn');

// Assets DOM elements
const addAssetBtn = document.getElementById('addAssetBtn');
const assetModal = document.getElementById('assetModal');
const closeAssetModal = document.getElementById('closeAssetModal');
const cancelAssetBtn = document.getElementById('cancelAssetBtn');
const assetForm = document.getElementById('assetForm');
const assetsContainer = document.getElementById('assetsContainer');

// Event Listeners
addFundBtn.addEventListener('click', () => openModal(null));
fundIsDebtCheckbox.addEventListener('change', toggleDebtFields);
versionSelector.addEventListener('change', switchVersion);
createVersionBtn.addEventListener('click', createNewVersion);
generateDefaultsBtn.addEventListener('click', generateDefaultData);
exportCsvBtn.addEventListener('click', exportToCSV);
importCsvBtn.addEventListener('click', () => csvFileInput.click());
csvFileInput.addEventListener('change', importFromCSV);
togglePrivacyBtn.addEventListener('click', togglePrivacyMode);
exportReportBtn.addEventListener('click', exportExecutiveReport);
manageVersionsBtn.addEventListener('click', openVersionsModal);
closeVersionsModal.addEventListener('click', closeVersionsModalHandler);
timelineBtn.addEventListener('click', openTimelineModal);
closeTimelineModal.addEventListener('click', closeTimelineModalHandler);
addPhaseBtn.addEventListener('click', addPhase);
cancelTimelineBtn.addEventListener('click', closeTimelineModalHandler);
closeModal.addEventListener('click', closeModalHandler);
cancelBtn.addEventListener('click', closeModalHandler);
fundForm.addEventListener('submit', handleFormSubmit);
timelineForm.addEventListener('submit', handleTimelineSubmit);

// Assets Event Listeners
addAssetBtn.addEventListener('click', () => openAssetModal(null));
closeAssetModal.addEventListener('click', closeAssetModalHandler);
cancelAssetBtn.addEventListener('click', closeAssetModalHandler);
assetForm.addEventListener('submit', handleAssetFormSubmit);

// Cerrar modal al hacer click fuera
window.addEventListener('click', (e) => {
    if (e.target === fundModal && !editingFundId) {
        closeModalHandler();
    }
});

// Alternar campos según sea Debt o no
function toggleDebtFields() {
    const isDebt = fundIsDebtCheckbox.checked;
    const minThresholdGroup = document.getElementById('minThresholdGroup');
    const maxThresholdGroup = document.getElementById('maxThresholdGroup');
    const goalGroup = document.getElementById('goalGroup');
    const minThresholdInput = document.getElementById('fundMinThreshold');
    const maxThresholdInput = document.getElementById('fundMaxThreshold');
    const goalInput = document.getElementById('fundGoal');
    
    if (isDebt) {
        // Para Debt: Maximum Threshold y Desirable (sin Goal ni Minimum)
        minThresholdGroup.style.display = 'none';
        maxThresholdGroup.style.display = 'block';
        goalGroup.style.display = 'none';
        minThresholdInput.removeAttribute('required');
        maxThresholdInput.setAttribute('required', 'required');
        goalInput.removeAttribute('required');
    } else {
        // Para fondos normales: Minimum, Desirable y Goal
        minThresholdGroup.style.display = 'block';
        maxThresholdGroup.style.display = 'none';
        goalGroup.style.display = 'block';
        minThresholdInput.setAttribute('required', 'required');
        maxThresholdInput.removeAttribute('required');
        goalInput.setAttribute('required', 'required');
    }
}

// Abrir modal
function openModal(fundId = null) {
    fundModal.style.display = 'block';
    
    if (fundId) {
        // Modo edición
        editingFundId = fundId;
        const fund = funds.find(f => f.id === fundId);
        
        if (fund) {
            document.getElementById('modalTitle').textContent = 'Editar Fondo';
            document.getElementById('fundName').value = fund.name;
            document.getElementById('fundDescription').value = fund.description || '';
            document.getElementById('fundValue').value = fund.currentValue;
            document.getElementById('fundIsDebt').checked = fund.isDebt || false;
            
            if (fund.isDebt) {
                document.getElementById('fundMaxThreshold').value = fund.maxThreshold;
                document.getElementById('fundDesirableThreshold').value = fund.desirableThreshold;
            } else {
                document.getElementById('fundMinThreshold').value = fund.minThreshold;
                document.getElementById('fundDesirableThreshold').value = fund.desirableThreshold;
                document.getElementById('fundGoal').value = fund.goal;
            }
            
            document.getElementById('fundColor').value = fund.color;
            toggleDebtFields();
        }
    } else {
        // Modo agregar
        editingFundId = null;
        document.getElementById('modalTitle').textContent = 'Agregar Nuevo Fondo';
        fundForm.reset();
        toggleDebtFields();
    }
}

// Cerrar modal
function closeModalHandler() {
    fundModal.style.display = 'none';
    editingFundId = null;
}

// Manejar envío del formulario
function handleFormSubmit(e) {
    e.preventDefault();
    
    const isDebt = document.getElementById('fundIsDebt').checked;
    
    const fundData = {
        name: document.getElementById('fundName').value,
        description: document.getElementById('fundDescription').value || '',
        currentValue: parseFloat(document.getElementById('fundValue').value),
        desirableThreshold: parseFloat(document.getElementById('fundDesirableThreshold').value),
        color: document.getElementById('fundColor').value,
        isDebt: isDebt
    };
    
    if (isDebt) {
        // Para Debt: Maximum y Desirable (Goal es siempre 0)
        fundData.maxThreshold = parseFloat(document.getElementById('fundMaxThreshold').value);
        fundData.goal = 0;
        fundData.minThreshold = 0;
        
        // Validar: Desirable < Maximum
        if (fundData.desirableThreshold > fundData.maxThreshold) {
            alert('Para fondos de deuda: Desirable debe ser menor que Maximum Threshold');
            return;
        }
    } else {
        // Para fondos normales
        fundData.minThreshold = parseFloat(document.getElementById('fundMinThreshold').value);
        fundData.goal = parseFloat(document.getElementById('fundGoal').value);
        fundData.maxThreshold = 0;
        
        // Validar: Minimum < Desirable < Goal
        if (fundData.goal < fundData.desirableThreshold || fundData.desirableThreshold < fundData.minThreshold) {
            alert('Los valores deben seguir el orden: Minimum < Desirable < Goal');
            return;
        }
    }
    
    if (editingFundId) {
        // Modo edición: actualizar fondo existente
        const fundIndex = funds.findIndex(f => f.id === editingFundId);
        if (fundIndex !== -1) {
            funds[fundIndex] = {
                id: editingFundId,
                ...fundData
            };
        }
    } else {
        // Modo agregar: crear nuevo fondo
        const fund = {
            id: Date.now(),
            ...fundData
        };
        funds.push(fund);
    }
    
    closeModalHandler();
    renderTanks();
    updateMetrics();
    saveFunds();
    renderTimeline();
}

// Renderizar todos los tanques
function renderTanks() {
    if (funds.length === 0) {
        tanksContainer.innerHTML = `
            <div class="empty-state">
                <h2>No hay fondos agregados</h2>
                <p>Haz clic en "Agregar Nuevo Fondo" para comenzar</p>
            </div>
        `;
        return;
    }
    
    tanksContainer.innerHTML = '';
    
    funds.forEach(fund => {
        const tankElement = createTankElement(fund);
        tanksContainer.appendChild(tankElement);
    });
}

// Crear elemento de tanque
function createTankElement(fund) {
    const tank = document.createElement('div');
    tank.className = 'tank';
    tank.draggable = true;
    tank.dataset.fundId = fund.id;
    
    // Event listeners para drag and drop
    tank.addEventListener('dragstart', handleDragStart);
    tank.addEventListener('dragover', handleDragOver);
    tank.addEventListener('drop', handleDrop);
    tank.addEventListener('dragend', handleDragEnd);
    
    // Calcular porcentajes para la visualización
    let maxValue, liquidHeight, minThresholdPos, desirableThresholdPos, goalPos, maxThresholdPos;
    
    if (fund.isDebt) {
        // Para Debt: máximo es el Maximum Threshold * 1.2
        maxValue = fund.maxThreshold * 1.2;
        liquidHeight = (fund.currentValue / maxValue) * 100;
        desirableThresholdPos = (fund.desirableThreshold / maxValue) * 100;
        maxThresholdPos = (fund.maxThreshold / maxValue) * 100;
    } else {
        // Para fondos normales
        maxValue = fund.goal * 1.2;
        liquidHeight = (fund.currentValue / maxValue) * 100;
        minThresholdPos = (fund.minThreshold / maxValue) * 100;
        desirableThresholdPos = (fund.desirableThreshold / maxValue) * 100;
        goalPos = (fund.goal / maxValue) * 100;
    }
    
    // Usar siempre el color personalizado del fondo
    let liquidColor = fund.color;
    let liquidOpacity = '0.7';
    
    let thresholdsHTML = '';
    
    if (fund.isDebt) {
        thresholdsHTML = `
            <div class="threshold-line desirable" style="bottom: ${desirableThresholdPos}%;">
                <span class="threshold-label">Des: $${fund.desirableThreshold.toFixed(2)}</span>
            </div>
            <div class="threshold-line maximum" style="bottom: ${maxThresholdPos}%;">
                <span class="threshold-label">Max: $${fund.maxThreshold.toFixed(2)}</span>
            </div>
        `;
    } else {
        thresholdsHTML = `
            <div class="threshold-line minimum" style="bottom: ${minThresholdPos}%;">
                <span class="threshold-label">Min: $${fund.minThreshold.toFixed(2)}</span>
            </div>
            <div class="threshold-line desirable" style="bottom: ${desirableThresholdPos}%;">
                <span class="threshold-label">Des: $${fund.desirableThreshold.toFixed(2)}</span>
            </div>
            <div class="threshold-line goal" style="bottom: ${goalPos}%;">
                <span class="threshold-label">Goal: $${fund.goal.toFixed(2)}</span>
            </div>
        `;
    }
    
    tank.innerHTML = `
        <div class="tank-header">
            <div class="tank-name">${fund.name}${fund.isDebt ? ' 💳' : ''}</div>
            <div class="tank-current-value">$${fund.currentValue.toFixed(2)}</div>
        </div>
        
        <div class="tank-visual">
            <div class="tank-liquid" style="height: ${liquidHeight}%; background-color: ${liquidColor}; opacity: ${liquidOpacity};"></div>
            ${thresholdsHTML}
        </div>
        
        ${fund.description ? `<div class="tank-description">${fund.description}</div>` : ''}
        
        <div class="tank-actions">
            <button class="btn-edit" onclick="editFund(${fund.id})">✏️ Editar</button>
            <button class="btn-delete" onclick="deleteFund(${fund.id})">🗑️ Eliminar</button>
        </div>
    `;
    
    return tank;
}

// Editar fondo
function editFund(id) {
    openModal(id);
}

// Eliminar fondo
function deleteFund(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este fondo?')) {
        funds = funds.filter(fund => fund.id !== id);
        renderTanks();
        updateMetrics();
        saveFunds();
        renderTimeline();
    }
}

// Actualizar métricas
function updateMetrics() {
    // Valor Combinado Total (restar deudas)
    const totalValue = funds.reduce((sum, fund) => {
        if (fund.isDebt) {
            return sum - fund.currentValue;
        }
        return sum + fund.currentValue;
    }, 0);
    document.getElementById('totalValue').textContent = `$${totalValue.toLocaleString()}`;
    
    // Valor de Assets (suma de valores actuales de todos los assets)
    const assetsValue = assets.reduce((sum, asset) => {
        return sum + asset.currentValue;
    }, 0);
    document.getElementById('assetsValue').textContent = `$${assetsValue.toLocaleString()}`;
    
    // Patrimonio Neto (Valor Combinado Total + Valor de Assets)
    const netWorth = totalValue + assetsValue;
    document.getElementById('netWorth').textContent = `$${netWorth.toLocaleString()}`;
    
    // Goals Reached (contar fondos normales que alcanzaron goal, y deudas en 0)
    const goalsReached = funds.filter(fund => {
        if (fund.isDebt) {
            return fund.currentValue === 0;
        }
        return fund.currentValue >= fund.goal;
    }).length;
    document.getElementById('goalsReached').textContent = `${goalsReached}/${funds.length}`;
    
    // Funds at Risk (fondos normales < minimum, deudas > maximum)
    const fundsAtRisk = funds.filter(fund => {
        if (fund.isDebt) {
            return fund.currentValue > fund.maxThreshold;
        }
        return fund.currentValue < fund.minThreshold;
    }).length;
    document.getElementById('fundsAtRisk').textContent = fundsAtRisk;
    
    // Thresholds Acumulados
    // Minimum: solo fondos normales
    const totalMinimum = funds.reduce((sum, fund) => {
        if (!fund.isDebt) {
            return sum + fund.minThreshold;
        }
        return sum;
    }, 0);
    
    // Desirable: todos los fondos
    const totalDesirable = funds.reduce((sum, fund) => {
        return sum + fund.desirableThreshold;
    }, 0);
    
    // Goals: solo fondos normales
    const totalGoals = funds.reduce((sum, fund) => {
        if (!fund.isDebt) {
            return sum + fund.goal;
        }
        return sum;
    }, 0);
    
    // Calcular distancias (cuánto falta para alcanzar cada threshold)
    // Solo sumamos lo que falta en cada fondo, no compensamos excesos
    let distanceToMinimum = 0;
    let distanceToDesirable = 0;
    let distanceToGoals = 0;
    
    funds.forEach(fund => {
        if (fund.isDebt) {
            // Para deudas: si currentValue > desirable, falta reducir
            if (fund.currentValue > fund.desirableThreshold) {
                distanceToDesirable += (fund.currentValue - fund.desirableThreshold);
            }
            // Para deudas el "goal" es llegar a 0
            if (fund.currentValue > 0) {
                distanceToGoals += fund.currentValue;
            }
        } else {
            // Para fondos normales: si currentValue < threshold, falta acumular
            if (fund.currentValue < fund.minThreshold) {
                distanceToMinimum += (fund.minThreshold - fund.currentValue);
            }
            if (fund.currentValue < fund.desirableThreshold) {
                distanceToDesirable += (fund.desirableThreshold - fund.currentValue);
            }
            if (fund.currentValue < fund.goal) {
                distanceToGoals += (fund.goal - fund.currentValue);
            }
        }
    });
    
    // Calcular porcentajes actuales (cuánto tenemos del total)
    const minimumCurrentPercentage = totalMinimum > 0 ? (((totalMinimum - distanceToMinimum) / totalMinimum) * 100).toFixed(0) : 100;
    const desirableCurrentPercentage = totalDesirable > 0 ? (((totalDesirable - distanceToDesirable) / totalDesirable) * 100).toFixed(0) : 100;
    const goalsCurrentPercentage = totalGoals > 0 ? (((totalGoals - distanceToGoals) / totalGoals) * 100).toFixed(0) : 100;
    
    // Actualizar UI de distancias
    document.getElementById('distanceToMinimumPercentage').textContent = `${minimumCurrentPercentage}%`;
    document.getElementById('distanceToMinimum').textContent = `Falta: $${distanceToMinimum.toFixed(2)}`;
    document.getElementById('totalMinimum').textContent = `Total: $${totalMinimum.toLocaleString()}`;
    
    document.getElementById('distanceToDesirablePercentage').textContent = `${desirableCurrentPercentage}%`;
    document.getElementById('distanceToDesirable').textContent = `Falta: $${distanceToDesirable.toFixed(2)}`;
    document.getElementById('totalDesirable').textContent = `Total: $${totalDesirable.toLocaleString()}`;
    
    document.getElementById('distanceToGoalsPercentage').textContent = `${goalsCurrentPercentage}%`;
    document.getElementById('distanceToGoals').textContent = `Falta: $${distanceToGoals.toFixed(2)}`;
    document.getElementById('totalGoals').textContent = `Total: $${totalGoals.toLocaleString()}`;
    
    // Actualizar progreso por fase
    updatePhaseProgress();
}

function updatePhaseProgress() {
    const phaseProgressDiv = document.getElementById('phaseProgress');
    
    if (!timelineConfig.phases || timelineConfig.phases.length === 0) {
        phaseProgressDiv.innerHTML = '<p style="color: rgba(255,255,255,0.7); font-size: 0.9em;">Configura la línea de tiempo</p>';
        return;
    }
    
    // Calcular patrimonio neto actual
    const fundsValue = funds.reduce((sum, fund) => {
        return fund.isDebt ? sum - fund.currentValue : sum + fund.currentValue;
    }, 0);
    const assetsValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
    const netWorthValue = fundsValue + assetsValue;
    
    // Calcular progreso para cada fase
    let phaseProgressHTML = '';
    timelineConfig.phases.forEach((phase, index) => {
        const goalTotal = phase.goalTotal || 0;
        const progressPercentage = goalTotal > 0 ? Math.min(100, (netWorthValue / goalTotal) * 100).toFixed(1) : 0;
        
        phaseProgressHTML += `
            <div class="phase-item-progress">
                <span class="phase-progress-name">${phase.name}</span>
                <span class="phase-progress-percentage">${progressPercentage}%</span>
            </div>
        `;
    });
    
    phaseProgressDiv.innerHTML = phaseProgressHTML;
}

// Guardar fondos en localStorage
function saveFunds() {
    if (currentVersionId === 'current') {
        localStorage.setItem('moneyFlowFunds', JSON.stringify(funds));
    } else {
        // Si estamos en una versión guardada, actualizar esa versión
        const versionIndex = versions.findIndex(v => v.id === currentVersionId);
        if (versionIndex !== -1) {
            versions[versionIndex].funds = JSON.parse(JSON.stringify(funds));
            versions[versionIndex].timeline = JSON.parse(JSON.stringify(timelineConfig));
            versions[versionIndex].date = new Date().toLocaleDateString('es-ES') + ' (Modificado)';
            saveVersions();
            updateVersionSelector();
        }
    }
}

// Cargar fondos desde localStorage
function loadFunds() {
    loadVersions();
    const savedFunds = localStorage.getItem('moneyFlowFunds');
    if (savedFunds) {
        funds = JSON.parse(savedFunds);
        renderTanks();
        updateMetrics();
    } else {
        renderTanks(); // Mostrar empty state
    }
}

// Guardar versiones
function saveVersions() {
    localStorage.setItem('moneyFlowVersions', JSON.stringify(versions));
}

// Cargar versiones
function loadVersions() {
    const savedVersions = localStorage.getItem('moneyFlowVersions');
    if (savedVersions) {
        versions = JSON.parse(savedVersions);
        updateVersionSelector();
    }
}

// Actualizar selector de versiones
function updateVersionSelector() {
    versionSelector.innerHTML = '<option value="current">Versión Actual</option>';
    versions.forEach(version => {
        const option = document.createElement('option');
        option.value = version.id;
        option.textContent = `${version.name} - ${version.date}`;
        versionSelector.appendChild(option);
    });
    versionSelector.value = currentVersionId;
}

// Cambiar de versión
function switchVersion() {
    currentVersionId = versionSelector.value;
    
    if (currentVersionId === 'current') {
        // Cargar versión actual
        const savedFunds = localStorage.getItem('moneyFlowFunds');
        funds = savedFunds ? JSON.parse(savedFunds) : [];
        const savedAssets = localStorage.getItem('moneyFlowAssets');
        assets = savedAssets ? JSON.parse(savedAssets) : [];
        loadTimelineConfig();
    } else {
        // Cargar versión guardada
        const version = versions.find(v => v.id === currentVersionId);
        if (version) {
            funds = JSON.parse(JSON.stringify(version.funds));
            assets = version.assets ? JSON.parse(JSON.stringify(version.assets)) : [];
            // Load timeline config from version, or use current if not available
            if (version.timeline) {
                timelineConfig = JSON.parse(JSON.stringify(version.timeline));
            } else {
                loadTimelineConfig();
            }
        }
    }
    
    renderTanks();
    renderAssets();
    updateMetrics();
    renderTimeline();
    updateEditability();
}

// Actualizar si se puede editar o no
function updateEditability() {
    // Always allow editing - changes will be saved to the active version
    const isEditable = true;
    addFundBtn.disabled = false;
    addFundBtn.style.opacity = '1';
    addFundBtn.style.cursor = 'pointer';
    addFundBtn.title = '';
    
    // Update header to show if editing a saved version
    const header = document.querySelector('header h1');
    if (currentVersionId !== 'current') {
        const version = versions.find(v => v.id === currentVersionId);
        if (version) {
            header.innerHTML = `💰 Money Flow Dashboard <span style="font-size: 0.6em; color: #f39c12;">(Editando: ${version.name})</span>`;
        }
    } else {
        header.innerHTML = '💰 Money Flow Dashboard';
    }
}

// Crear nueva versión
function createNewVersion() {
    const versionName = prompt('Nombre de la nueva versión:', `Versión ${versions.length + 1}`);
    
    if (versionName) {
        const newVersion = {
            id: Date.now().toString(),
            name: versionName,
            date: new Date().toLocaleDateString('es-ES'),
            funds: JSON.parse(JSON.stringify(funds)),
            assets: JSON.parse(JSON.stringify(assets)),
            timeline: JSON.parse(JSON.stringify(timelineConfig))
        };
        
        versions.push(newVersion);
        saveVersions();
        updateVersionSelector();
        alert(`Versión "${versionName}" creada exitosamente!`);
    }
}

// Abrir modal de versiones
function openVersionsModal() {
    versionsModal.style.display = 'block';
    renderVersionsList();
}

// Cerrar modal de versiones
function closeVersionsModalHandler() {
    versionsModal.style.display = 'none';
}

// Renderizar lista de versiones
function renderVersionsList() {
    const versionsList = document.getElementById('versionsList');
    
    if (versions.length === 0) {
        versionsList.innerHTML = '<p style="text-align: center; color: #888;">No hay versiones guardadas</p>';
        return;
    }
    
    versionsList.innerHTML = '';
    
    versions.forEach(version => {
        const versionItem = document.createElement('div');
        versionItem.className = 'version-item';
        versionItem.innerHTML = `
            <div class="version-info">
                <div class="version-name">${version.name}</div>
                <div class="version-date">${version.date} - ${version.funds.length} fondos</div>
            </div>
            <div class="version-actions">
                <button class="btn-small btn-rename" onclick="renameVersion('${version.id}')">Renombrar</button>
                <button class="btn-small btn-delete-version" onclick="deleteVersion('${version.id}')">Eliminar</button>
            </div>
        `;
        versionsList.appendChild(versionItem);
    });
}

// Renombrar versión
function renameVersion(versionId) {
    const version = versions.find(v => v.id === versionId);
    if (version) {
        const newName = prompt('Nuevo nombre:', version.name);
        if (newName) {
            version.name = newName;
            saveVersions();
            updateVersionSelector();
            renderVersionsList();
        }
    }
}

// Eliminar versión
function deleteVersion(versionId) {
    const version = versions.find(v => v.id === versionId);
    if (version && confirm(`¿Estas seguro de eliminar la versión "${version.name}"?`)) {
        versions = versions.filter(v => v.id !== versionId);
        saveVersions();
        
        // Si estamos viendo la versión eliminada, volver a la actual
        if (currentVersionId === versionId) {
            currentVersionId = 'current';
            switchVersion();
        }
        
        updateVersionSelector();
        renderVersionsList();
    }
}

// Cerrar modal de versiones al hacer clic fuera
window.addEventListener('click', (e) => {
    if (e.target === versionsModal) {
        closeVersionsModalHandler();
    }
});

// Drag and Drop functionality
let draggedElement = null;

function handleDragStart(e) {
    draggedElement = this;
    this.style.opacity = '0.4';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    if (draggedElement !== this) {
        // Obtener los IDs de los fondos
        const draggedId = parseInt(draggedElement.dataset.fundId);
        const targetId = parseInt(this.dataset.fundId);
        
        // Encontrar los índices
        const draggedIndex = funds.findIndex(f => f.id === draggedId);
        const targetIndex = funds.findIndex(f => f.id === targetId);
        
        // Reordenar el array
        const [draggedFund] = funds.splice(draggedIndex, 1);
        funds.splice(targetIndex, 0, draggedFund);
        
        // Re-renderizar
        renderTanks();
        saveFunds();
        renderTimeline();
    }
    
    return false;
}

function handleDragEnd(e) {
    this.style.opacity = '1';
}

// Timeline Functions
function saveTimelineConfig() {
    if (currentVersionId === 'current') {
        localStorage.setItem('moneyFlowTimeline', JSON.stringify(timelineConfig));
    } else {
        // Save to the selected version and update its timestamp
        const version = versions.find(v => v.id === currentVersionId);
        if (version) {
            version.timeline = JSON.parse(JSON.stringify(timelineConfig));
            version.date = new Date().toLocaleDateString('es-ES') + ' (Modificado)';
            saveVersions();
            updateVersionSelector();
        }
    }
}

function loadTimelineConfig() {
    const saved = localStorage.getItem('moneyFlowTimeline');
    if (saved) {
        timelineConfig = JSON.parse(saved);
    }
}

function openTimelineModal() {
    document.getElementById('startDate').value = timelineConfig.startDate || '';
    document.getElementById('analysisDate').value = timelineConfig.analysisDate || new Date().toISOString().split('T')[0];
    renderPhasesList();
    timelineModal.style.display = 'flex';
}

function closeTimelineModalHandler() {
    timelineModal.style.display = 'none';
}

function addPhase() {
    timelineConfig.phases.push({
        name: '',
        goalTotal: 0,
        goalAssets: 0,
        goalFunds: 0,
        date: ''
    });
    renderPhasesList();
}

function removePhase(index) {
    timelineConfig.phases.splice(index, 1);
    renderPhasesList();
}

function renderPhasesList() {
    const phasesList = document.getElementById('phasesList');
    
    if (timelineConfig.phases.length === 0) {
        phasesList.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 20px;">No hay fases configuradas</p>';
        return;
    }
    
    phasesList.innerHTML = timelineConfig.phases.map((phase, index) => `
        <div class="phase-item">
            <div class="phase-item-header">
                <span class="phase-number">Fase ${index + 1}</span>
                <button type="button" onclick="removePhase(${index})" class="btn-remove-phase">✕ Eliminar</button>
            </div>
            <div class="phase-fields">
                <div class="form-group">
                    <label>Nombre:</label>
                    <input type="text" value="${phase.name}" onchange="updatePhase(${index}, 'name', this.value)" required>
                </div>
                <div class="form-group">
                    <label>Goal Total:</label>
                    <input type="number" value="${phase.goalTotal || 0}" onchange="updatePhase(${index}, 'goalTotal', parseFloat(this.value))" required>
                </div>
                <div class="form-group">
                    <label>Goal Assets:</label>
                    <input type="number" value="${phase.goalAssets || 0}" onchange="updatePhase(${index}, 'goalAssets', parseFloat(this.value))" required>
                </div>
                <div class="form-group">
                    <label>Goal Funds:</label>
                    <input type="number" value="${phase.goalFunds || 0}" onchange="updatePhase(${index}, 'goalFunds', parseFloat(this.value))" required>
                </div>
                <div class="form-group">
                    <label>Fecha:</label>
                    <input type="date" value="${phase.date}" onchange="updatePhase(${index}, 'date', this.value)" required>
                </div>
            </div>
        </div>
    `).join('');
}

function updatePhase(index, field, value) {
    timelineConfig.phases[index][field] = value;
}

function handleTimelineSubmit(e) {
    e.preventDefault();
    
    timelineConfig.startDate = document.getElementById('startDate').value;
    timelineConfig.analysisDate = document.getElementById('analysisDate').value;
    
    // Validate that all phases have data
    const allValid = timelineConfig.phases.every(phase => 
        phase.name && phase.goalTotal > 0 && phase.goalAssets >= 0 && phase.goalFunds >= 0 && phase.date
    );
    
    if (!allValid) {
        alert('Por favor completa todos los campos de las fases');
        return;
    }
    
    // Sort phases by date
    timelineConfig.phases.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    saveTimelineConfig();
    renderTimeline();
    closeTimelineModalHandler();
}

function renderTimeline() {
    const container = document.getElementById('timelineContainer');
    
    if (!timelineConfig.startDate || timelineConfig.phases.length === 0) {
        container.innerHTML = '<p class="timeline-placeholder">Haz clic en 📅 para configurar la línea de tiempo</p>';
        return;
    }
    
    // Parse dates as local to avoid timezone offset issues
    const [startYear, startMonth, startDay] = timelineConfig.startDate.split('-');
    const startDate = new Date(startYear, startMonth - 1, startDay);
    
    const lastPhase = timelineConfig.phases[timelineConfig.phases.length - 1];
    const [endYear, endMonth, endDay] = lastPhase.date.split('-');
    const endDate = new Date(endYear, endMonth - 1, endDay);
    
    // Use analysisDate if configured, otherwise use today
    let analysisDate;
    if (timelineConfig.analysisDate) {
        const [aYear, aMonth, aDay] = timelineConfig.analysisDate.split('-');
        analysisDate = new Date(aYear, aMonth - 1, aDay);
    } else {
        analysisDate = new Date();
        analysisDate.setHours(0, 0, 0, 0);
    }
    
    // Calculate current values
    const fundsValue = funds.reduce((sum, fund) => {
        return fund.isDebt ? sum - fund.currentValue : sum + fund.currentValue;
    }, 0);
    
    const assetsValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
    
    const netWorthValue = fundsValue + assetsValue;
    
    // Calculate percentage positions
    const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
    const currentDatePercent = Math.min(100, Math.max(0, ((analysisDate - startDate) / (1000 * 60 * 60 * 24) / totalDays) * 100));
    
    // Generate 3 timelines
    const fundsTimeline = generateSingleTimeline('Funds', fundsValue, 'goalFunds', 'funds', startDate, endDate, totalDays, currentDatePercent, analysisDate);
    const assetsTimeline = generateSingleTimeline('Assets', assetsValue, 'goalAssets', 'assets', startDate, endDate, totalDays, currentDatePercent, analysisDate);
    const netWorthTimeline = generateSingleTimeline('Patrimonio Neto', netWorthValue, 'goalTotal', 'networth', startDate, endDate, totalDays, currentDatePercent, analysisDate);
    
    container.innerHTML = `
        <div class="timeline-start-marker">
            <div style="font-weight: 600; font-size: 0.75em;">INICIO</div>
            <div style="font-size: 0.65em; margin-top: 3px;">${formatDate(timelineConfig.startDate)}</div>
        </div>
        
        ${fundsTimeline}
        ${assetsTimeline}
        ${netWorthTimeline}
    `;
}

function generateSingleTimeline(label, currentValue, goalField, colorClass, startDate, endDate, totalDays, currentDatePercent, analysisDate) {
    // Find current value position (interpolate between phases)
    let currentValuePercent = 0;
    if (currentValue <= 0) {
        currentValuePercent = 0;
    } else if (currentValue >= timelineConfig.phases[timelineConfig.phases.length - 1][goalField]) {
        currentValuePercent = 100;
    } else {
        // Find which phase range we're in
        for (let i = 0; i < timelineConfig.phases.length; i++) {
            const phase = timelineConfig.phases[i];
            if (currentValue <= phase[goalField]) {
                const prevGoal = i > 0 ? timelineConfig.phases[i - 1][goalField] : 0;
                let prevDate;
                if (i > 0) {
                    const [pYear, pMonth, pDay] = timelineConfig.phases[i - 1].date.split('-');
                    prevDate = new Date(pYear, pMonth - 1, pDay);
                } else {
                    prevDate = startDate;
                }
                const [phYear, phMonth, phDay] = phase.date.split('-');
                const phaseDate = new Date(phYear, phMonth - 1, phDay);
                
                const goalRange = phase[goalField] - prevGoal;
                const valueProgress = goalRange > 0 ? (currentValue - prevGoal) / goalRange : 0;
                
                const prevPercent = i > 0 ? ((prevDate - startDate) / (1000 * 60 * 60 * 24) / totalDays) * 100 : 0;
                const currentPhasePercent = ((phaseDate - startDate) / (1000 * 60 * 60 * 24) / totalDays) * 100;
                
                currentValuePercent = prevPercent + (currentPhasePercent - prevPercent) * valueProgress;
                break;
            }
        }
    }
    
    // Build phases HTML
    let phasesHTML = '';
    timelineConfig.phases.forEach((phase, index) => {
        const [phYear, phMonth, phDay] = phase.date.split('-');
        const phaseDate = new Date(phYear, phMonth - 1, phDay);
        const phasePercent = ((phaseDate - startDate) / (1000 * 60 * 60 * 24) / totalDays) * 100;
        
        phasesHTML += `
            <div class="timeline-phase" style="left: ${phasePercent}%;">
                <div class="phase-info">
                    <div class="phase-name">${phase.name}</div>
                    <div class="phase-goal">$${phase[goalField].toLocaleString()}</div>
                    <div class="phase-date">${formatDate(phase.date)}</div>
                </div>
                <div class="phase-marker"></div>
            </div>
        `;
    });
    
    return `
        <div class="timeline-track timeline-track-${colorClass}">
            <div class="timeline-track-label">${label}</div>
            <div class="timeline-bar">
                <div class="timeline-progress timeline-progress-${colorClass}" style="width: ${currentValuePercent}%;"></div>
                
                ${phasesHTML}
                
                <div class="timeline-current-date" style="left: ${currentDatePercent}%;">
                    <div class="current-date-label">ANÁLISIS: ${formatDate(timelineConfig.analysisDate)}</div>
                    <div class="current-date-line"></div>
                </div>
                
                <div class="timeline-current-value" style="left: ${currentValuePercent}%;">
                    <div class="current-value-marker"></div>
                    <div class="current-value-label">$${currentValue.toLocaleString()}</div>
                </div>
            </div>
        </div>
    `;
}

function formatDate(dateString) {
    // Parse date as local date to avoid timezone issues
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ==================== ASSETS FUNCTIONS ====================

// Abrir modal de asset
function openAssetModal(id) {
    if (id) {
        editingAssetId = id;
        const asset = assets.find(a => a.id === id);
        if (asset) {
            document.getElementById('assetModalTitle').textContent = 'Editar Asset';
            document.getElementById('assetTitle').value = asset.title;
            document.getElementById('assetDescription').value = asset.description || '';
            document.getElementById('assetCurrentValue').value = asset.currentValue;
            document.getElementById('assetInvested').value = asset.invested;
            document.getElementById('assetMissingInvestment').value = asset.missingInvestment;
            document.getElementById('assetSaleValue').value = asset.saleValue;
            document.getElementById('assetColor').value = asset.color;
        }
    } else {
        editingAssetId = null;
        document.getElementById('assetModalTitle').textContent = 'Agregar Nuevo Asset';
        assetForm.reset();
    }
    assetModal.style.display = 'flex';
}

// Cerrar modal de asset
function closeAssetModalHandler() {
    assetModal.style.display = 'none';
    editingAssetId = null;
    assetForm.reset();
}

// Manejar submit del formulario de asset
function handleAssetFormSubmit(e) {
    e.preventDefault();
    
    const assetData = {
        title: document.getElementById('assetTitle').value,
        description: document.getElementById('assetDescription').value,
        currentValue: parseFloat(document.getElementById('assetCurrentValue').value),
        invested: parseFloat(document.getElementById('assetInvested').value),
        missingInvestment: parseFloat(document.getElementById('assetMissingInvestment').value),
        saleValue: parseFloat(document.getElementById('assetSaleValue').value),
        color: document.getElementById('assetColor').value
    };
    
    if (editingAssetId) {
        // Modo editar
        const asset = assets.find(a => a.id === editingAssetId);
        if (asset) {
            Object.assign(asset, assetData);
        }
    } else {
        // Modo agregar
        const asset = {
            id: Date.now(),
            ...assetData
        };
        assets.push(asset);
    }
    
    closeAssetModalHandler();
    renderAssets();
    updateMetrics();
    saveAssets();
}

// Crear elemento de asset
function createAssetElement(asset) {
    const assetDiv = document.createElement('div');
    assetDiv.className = 'asset';
    assetDiv.dataset.assetId = asset.id;
    
    // Calcular el desirable threshold: invested + missingInvestment
    const desiredValue = asset.invested + asset.missingInvestment;
    
    // Calcular maxValue como el máximo de todos los valores + 20% de margen
    const allValues = [asset.currentValue, asset.invested, desiredValue, asset.saleValue];
    const maxOfValues = Math.max(...allValues);
    const maxValue = maxOfValues * 1.2;
    
    // Calcular porcentajes para la visualización
    const liquidHeight = (asset.currentValue / maxValue) * 100;
    const investedPos = (asset.invested / maxValue) * 100;
    const desiredPos = (desiredValue / maxValue) * 100;
    const salePos = (asset.saleValue / maxValue) * 100;
    
    const thresholdsHTML = `
        <div class="asset-threshold-line invested" style="bottom: ${investedPos}%;">
            <span class="asset-threshold-label">Invertido: $${asset.invested.toLocaleString()}</span>
        </div>
        <div class="asset-threshold-line desired" style="bottom: ${desiredPos}%;">
            <span class="asset-threshold-label">Inversión Deseada: $${desiredValue.toLocaleString()}</span>
        </div>
        <div class="asset-threshold-line sale" style="bottom: ${salePos}%;">
            <span class="asset-threshold-label">Venta: $${asset.saleValue.toLocaleString()}</span>
        </div>
    `;
    
    assetDiv.innerHTML = `
        <div class="asset-header">
            <div class="asset-title">${asset.title}</div>
            <div class="asset-value">$${asset.currentValue.toLocaleString()}</div>
        </div>
        <div class="asset-tank">
            <div class="asset-liquid" style="height: ${liquidHeight}%; --liquid-color: ${asset.color};"></div>
            ${thresholdsHTML}
        </div>
        ${asset.description ? `<div class="asset-description">${asset.description}</div>` : ''}
        <div class="asset-actions">
            <button class="btn-edit" onclick="editAsset(${asset.id})">✏️ Editar</button>
            <button class="btn-delete" onclick="deleteAsset(${asset.id})">🗑️ Eliminar</button>
        </div>
    `;
    
    return assetDiv;
}

// Renderizar assets
function renderAssets() {
    if (assets.length === 0) {
        assetsContainer.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 40px;">No hay assets agregados</p>';
        return;
    }
    
    assetsContainer.innerHTML = '';
    assets.forEach(asset => {
        const assetElement = createAssetElement(asset);
        assetsContainer.appendChild(assetElement);
    });
}

// Editar asset
function editAsset(id) {
    openAssetModal(id);
}

// Eliminar asset
function deleteAsset(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este asset?')) {
        assets = assets.filter(asset => asset.id !== id);
        renderAssets();
        updateMetrics();
        saveAssets();
    }
}

// Guardar assets
function saveAssets() {
    if (currentVersionId === 'current') {
        localStorage.setItem('moneyFlowAssets', JSON.stringify(assets));
    } else {
        // Save to the selected version
        const versionIndex = versions.findIndex(v => v.id === currentVersionId);
        if (versionIndex !== -1) {
            versions[versionIndex].assets = JSON.parse(JSON.stringify(assets));
            versions[versionIndex].date = new Date().toLocaleDateString('es-ES') + ' (Modificado)';
            saveVersions();
            updateVersionSelector();
        }
    }
}

// Cargar assets
function loadAssets() {
    const savedAssets = localStorage.getItem('moneyFlowAssets');
    if (savedAssets) {
        assets = JSON.parse(savedAssets);
    }
}

// ==================== DEFAULT DATA GENERATION ====================

function generateDefaultData() {
    if (confirm('¿Deseas generar datos de demostración? Esto creará fondos, assets y fases de ejemplo.')) {
        createDefaultStructure();
        saveFunds();
        saveAssets();
        saveTimelineConfig();
        renderTanks();
        renderAssets();
        updateMetrics();
        renderTimeline();
        alert('✅ Datos de demostración generados exitosamente!');
    }
}

function createDefaultStructure() {
    // Generar fecha de inicio hace 2 años
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 2);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    // Fecha de análisis hoy
    const analysisDate = new Date().toISOString().split('T')[0];
    
    // Crear 3 fases (2, 12, 23 años desde hoy)
    const today = new Date();
    const phases = [
        {
            name: 'Corto Plazo',
            goalTotal: 250000,
            goalAssets: 125000,
            goalFunds: 125000,
            date: new Date(today.getFullYear() + 2, today.getMonth(), today.getDate()).toISOString().split('T')[0]
        },
        {
            name: 'Mediano Plazo',
            goalTotal: 500000,
            goalAssets: 250000,
            goalFunds: 250000,
            date: new Date(today.getFullYear() + 12, today.getMonth(), today.getDate()).toISOString().split('T')[0]
        },
        {
            name: 'Largo Plazo',
            goalTotal: 1000000,
            goalAssets: 500000,
            goalFunds: 500000,
            date: new Date(today.getFullYear() + 23, today.getMonth(), today.getDate()).toISOString().split('T')[0]
        }
    ];
    
    timelineConfig = {
        startDate: startDateStr,
        analysisDate: analysisDate,
        phases: phases
    };
    
    // Crear 4 fondos por defecto
    funds = [
        {
            id: Date.now() + 1,
            name: 'Retirement Fund',
            description: 'Fondo de jubilación a largo plazo',
            currentValue: randomBetween(15000, 25000), // Por debajo del mínimo
            minThreshold: 30000,
            desirableThreshold: 60000,
            goal: 100000,
            maxThreshold: 150000,
            color: '#3498db',
            isDebt: false
        },
        {
            id: Date.now() + 2,
            name: 'Emergency Fund',
            description: 'Fondo de emergencias',
            currentValue: randomBetween(25000, 30000), // Goal alcanzado
            minThreshold: 10000,
            desirableThreshold: 20000,
            goal: 25000,
            maxThreshold: 40000,
            color: '#2ecc71',
            isDebt: false
        },
        {
            id: Date.now() + 3,
            name: 'CurrentFlow Fund',
            description: 'Fondo de flujo corriente',
            currentValue: randomBetween(35000, 45000), // Por llegar al desirable
            minThreshold: 20000,
            desirableThreshold: 50000,
            goal: 80000,
            maxThreshold: 100000,
            color: '#9b59b6',
            isDebt: false
        },
        {
            id: Date.now() + 4,
            name: 'DebtFund',
            description: 'Deuda acumulada',
            currentValue: 7500,
            minThreshold: 50000,
            desirableThreshold: 5000,
            goal: 0,
            maxThreshold: 10000,
            color: '#e74c3c',
            isDebt: true
        }
    ];
    
    // Crear algunos assets por defecto
    assets = [
        {
            id: Date.now() + 100,
            title: 'Propiedad Inmobiliaria',
            description: 'Casa principal',
            currentValue: randomBetween(150000, 200000),
            invested: 100000,
            missingInvestment: 0,
            saleValue: randomBetween(180000, 220000),
            color: '#e67e22'
        },
        {
            id: Date.now() + 101,
            title: 'Vehículo',
            description: 'Auto personal',
            currentValue: randomBetween(15000, 25000),
            invested: 20000,
            missingInvestment: 0,
            saleValue: randomBetween(14000, 24000),
            color: '#34495e'
        }
    ];
}

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ==================== CSV EXPORT/IMPORT ====================

function exportToCSV() {
    try {
        const data = {
            exportDate: new Date().toISOString(),
            timelineConfig: timelineConfig,
            funds: funds,
            assets: assets
        };
        
        // Convertir a JSON y luego a CSV-like format
        const jsonString = JSON.stringify(data, null, 2);
        
        // Crear archivo CSV con formato especial
        let csvContent = "MoneyFlow Dashboard Export\n";
        csvContent += "Export Date," + new Date().toLocaleString() + "\n\n";
        
        // Timeline Config
        csvContent += "TIMELINE CONFIGURATION\n";
        csvContent += "Start Date," + (timelineConfig.startDate || "") + "\n";
        csvContent += "Analysis Date," + (timelineConfig.analysisDate || "") + "\n\n";
        
        // Phases
        csvContent += "PHASES\n";
        csvContent += "Name,Goal Total,Goal Assets,Goal Funds,Date\n";
        timelineConfig.phases.forEach(phase => {
            csvContent += `"${phase.name}",${phase.goalTotal},${phase.goalAssets},${phase.goalFunds},${phase.date}\n`;
        });
        csvContent += "\n";
        
        // Funds
        csvContent += "FUNDS\n";
        csvContent += "ID,Name,Description,Current Value,Min Threshold,Desirable Threshold,Goal,Max Threshold,Color,Is Debt\n";
        funds.forEach(fund => {
            csvContent += `${fund.id},"${fund.name}","${fund.description}",${fund.currentValue},${fund.minThreshold},${fund.desirableThreshold},${fund.goal},${fund.maxThreshold},${fund.color},${fund.isDebt}\n`;
        });
        csvContent += "\n";
        
        // Assets
        csvContent += "ASSETS\n";
        csvContent += "ID,Title,Description,Current Value,Invested,Missing Investment,Sale Value,Color\n";
        assets.forEach(asset => {
            csvContent += `${asset.id},"${asset.title}","${asset.description}",${asset.currentValue},${asset.invested},${asset.missingInvestment},${asset.saleValue},${asset.color}\n`;
        });
        
        // Crear blob y descargar
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `moneyflow_export_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert('✅ Escenario exportado exitosamente!');
    } catch (error) {
        console.error('Error al exportar:', error);
        alert('❌ Error al exportar el escenario. Por favor intenta nuevamente.');
    }
}

function importFromCSV(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            const lines = content.split('\n');
            
            let section = '';
            let newTimelineConfig = { startDate: null, analysisDate: null, phases: [] };
            let newFunds = [];
            let newAssets = [];
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                if (line === 'TIMELINE CONFIGURATION') {
                    section = 'timeline';
                    continue;
                } else if (line === 'PHASES') {
                    section = 'phases';
                    i++; // Skip header line
                    continue;
                } else if (line === 'FUNDS') {
                    section = 'funds';
                    i++; // Skip header line
                    continue;
                } else if (line === 'ASSETS') {
                    section = 'assets';
                    i++; // Skip header line
                    continue;
                } else if (line === '' || line.startsWith('MoneyFlow') || line.startsWith('Export Date')) {
                    continue;
                }
                
                if (section === 'timeline') {
                    if (line.startsWith('Start Date,')) {
                        newTimelineConfig.startDate = line.split(',')[1];
                    } else if (line.startsWith('Analysis Date,')) {
                        newTimelineConfig.analysisDate = line.split(',')[1];
                    }
                } else if (section === 'phases' && line) {
                    const values = parseCSVLine(line);
                    if (values.length >= 5) {
                        newTimelineConfig.phases.push({
                            name: values[0],
                            goalTotal: parseFloat(values[1]),
                            goalAssets: parseFloat(values[2]),
                            goalFunds: parseFloat(values[3]),
                            date: values[4]
                        });
                    }
                } else if (section === 'funds' && line) {
                    const values = parseCSVLine(line);
                    if (values.length >= 10) {
                        newFunds.push({
                            id: parseInt(values[0]),
                            name: values[1],
                            description: values[2],
                            currentValue: parseFloat(values[3]),
                            minThreshold: parseFloat(values[4]),
                            desirableThreshold: parseFloat(values[5]),
                            goal: parseFloat(values[6]),
                            maxThreshold: parseFloat(values[7]),
                            color: values[8],
                            isDebt: values[9] === 'true'
                        });
                    }
                } else if (section === 'assets' && line) {
                    const values = parseCSVLine(line);
                    if (values.length >= 8) {
                        newAssets.push({
                            id: parseInt(values[0]),
                            title: values[1],
                            description: values[2],
                            currentValue: parseFloat(values[3]),
                            invested: parseFloat(values[4]),
                            missingInvestment: parseFloat(values[5]),
                            saleValue: parseFloat(values[6]),
                            color: values[7]
                        });
                    }
                }
            }
            
            // Aplicar los datos importados
            if (confirm('¿Deseas importar este escenario? Esto reemplazará tus datos actuales.')) {
                timelineConfig = newTimelineConfig;
                funds = newFunds;
                assets = newAssets;
                
                saveFunds();
                saveAssets();
                saveTimelineConfig();
                
                renderTanks();
                renderAssets();
                updateMetrics();
                renderTimeline();
                
                alert('✅ Escenario importado exitosamente!');
            }
        } catch (error) {
            console.error('Error al importar:', error);
            alert('❌ Error al importar el archivo. Verifica que el formato sea correcto.');
        }
        
        // Reset file input
        csvFileInput.value = '';
    };
    
    reader.readAsText(file);
}

function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    values.push(current.trim());
    return values;
}

// ==================== PRIVACY MODE ====================

function togglePrivacyMode() {
    privacyMode = !privacyMode;
    
    const body = document.body;
    if (privacyMode) {
        body.classList.add('privacy-mode');
        togglePrivacyBtn.textContent = '👁️‍🗨️';
        togglePrivacyBtn.title = 'Mostrar valores monetarios';
    } else {
        body.classList.remove('privacy-mode');
        togglePrivacyBtn.textContent = '👁️';
        togglePrivacyBtn.title = 'Ocultar valores monetarios';
    }
}

// ==================== EXECUTIVE REPORT ====================

function exportExecutiveReport() {
    try {
        // Calcular todas las métricas
        const fundsValue = funds.reduce((sum, fund) => {
            return fund.isDebt ? sum - fund.currentValue : sum + fund.currentValue;
        }, 0);
        
        const assetsValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
        const netWorthValue = fundsValue + assetsValue;
        
        let goalsReached = 0;
        let totalGoalsCount = 0;
        let fundsAtRisk = 0;
        
        funds.forEach(fund => {
            if (!fund.isDebt) {
                totalGoalsCount++;
                if (fund.currentValue >= fund.goal) goalsReached++;
                if (fund.currentValue < fund.minThreshold) fundsAtRisk++;
            }
        });
        
        // Calcular distancias
        let totalMinimum = 0, distanceToMinimum = 0;
        let totalDesirable = 0, distanceToDesirable = 0;
        let totalGoals = 0, distanceToGoals = 0;
        
        funds.forEach(fund => {
            if (!fund.isDebt) {
                totalMinimum += fund.minThreshold;
                totalDesirable += fund.desirableThreshold;
                totalGoals += fund.goal;
                
                if (fund.currentValue < fund.minThreshold) {
                    distanceToMinimum += (fund.minThreshold - fund.currentValue);
                }
                if (fund.currentValue < fund.desirableThreshold) {
                    distanceToDesirable += (fund.desirableThreshold - fund.currentValue);
                }
                if (fund.currentValue < fund.goal) {
                    distanceToGoals += (fund.goal - fund.currentValue);
                }
            }
        });
        
        const minimumPercentage = totalMinimum > 0 ? (((totalMinimum - distanceToMinimum) / totalMinimum) * 100).toFixed(0) : 100;
        const desirablePercentage = totalDesirable > 0 ? (((totalDesirable - distanceToDesirable) / totalDesirable) * 100).toFixed(0) : 100;
        const goalsPercentage = totalGoals > 0 ? (((totalGoals - distanceToGoals) / totalGoals) * 100).toFixed(0) : 100;
        
        // Generar HTML del informe
        const reportDate = new Date().toLocaleString('es-ES', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        let html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Informe Ejecutivo - Money Flow Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
        }
        .report-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #667eea;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #667eea;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .report-date {
            color: #666;
            font-size: 0.9em;
        }
        .section {
            margin-bottom: 40px;
        }
        .section-title {
            color: #667eea;
            font-size: 1.8em;
            margin-bottom: 20px;
            border-left: 5px solid #667eea;
            padding-left: 15px;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }
        .metric-label {
            font-size: 0.9em;
            opacity: 0.9;
            margin-bottom: 10px;
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
        }
        .progress-bar {
            background: #e0e0e0;
            border-radius: 10px;
            height: 30px;
            margin: 10px 0;
            overflow: hidden;
            position: relative;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            transition: width 1s ease;
        }
        .funds-list, .assets-list {
            display: grid;
            gap: 15px;
        }
        .fund-item, .asset-item {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            border-left: 5px solid #667eea;
        }
        .fund-item.debt {
            border-left-color: #e74c3c;
        }
        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .item-title {
            font-size: 1.3em;
            font-weight: 600;
            color: #333;
        }
        .item-value {
            font-size: 1.4em;
            font-weight: bold;
            color: #667eea;
        }
        .item-description {
            color: #666;
            margin-bottom: 10px;
            font-size: 0.9em;
        }
        .thresholds {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
            margin-top: 15px;
        }
        .threshold {
            padding: 8px 12px;
            background: white;
            border-radius: 8px;
            font-size: 0.85em;
        }
        .threshold-label {
            color: #666;
            display: block;
            margin-bottom: 3px;
        }
        .threshold-value {
            font-weight: 600;
            color: #333;
        }
        .phases-list {
            display: grid;
            gap: 20px;
        }
        .phase-item {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            border-left: 5px solid #667eea;
        }
        .phase-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .phase-name {
            font-size: 1.4em;
            font-weight: 600;
            color: #333;
        }
        .phase-date {
            color: #666;
            font-size: 0.9em;
        }
        .phase-goals {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-top: 15px;
        }
        .phase-goal-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        .phase-goal-label {
            color: #666;
            font-size: 0.85em;
            margin-bottom: 5px;
        }
        .phase-goal-value {
            font-size: 1.2em;
            font-weight: bold;
            color: #667eea;
        }
        @media print {
            body { background: white; padding: 0; }
            .report-container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <h1>💰 Informe Ejecutivo</h1>
            <div class="report-date">Generado el ${reportDate}</div>
        </div>
        
        <div class="section">
            <h2 class="section-title">📊 Métricas Principales</h2>
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-label">Patrimonio Neto</div>
                    <div class="metric-value">$${netWorthValue.toLocaleString()}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Valor Combinado Total</div>
                    <div class="metric-value">$${fundsValue.toLocaleString()}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Valor de Assets</div>
                    <div class="metric-value">$${assetsValue.toLocaleString()}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Goals Reached</div>
                    <div class="metric-value">${goalsReached}/${totalGoalsCount}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Funds at Risk</div>
                    <div class="metric-value">${fundsAtRisk}</div>
                </div>
            </div>
            
            <h3 style="color: #667eea; margin-bottom: 15px;">Progreso hacia Objetivos</h3>
            <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>Minimum (${minimumPercentage}%)</span>
                    <span>Falta: $${distanceToMinimum.toLocaleString()} de $${totalMinimum.toLocaleString()}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${minimumPercentage}%;">${minimumPercentage}%</div>
                </div>
            </div>
            <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>Desirable (${desirablePercentage}%)</span>
                    <span>Falta: $${distanceToDesirable.toLocaleString()} de $${totalDesirable.toLocaleString()}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${desirablePercentage}%;">${desirablePercentage}%</div>
                </div>
            </div>
            <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>Goals (${goalsPercentage}%)</span>
                    <span>Falta: $${distanceToGoals.toLocaleString()} de $${totalGoals.toLocaleString()}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${goalsPercentage}%;">${goalsPercentage}%</div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">💼 Fondos</h2>
            <div class="funds-list">`;
        
        funds.forEach(fund => {
            const percentage = fund.goal > 0 ? ((fund.currentValue / fund.goal) * 100).toFixed(1) : 0;
            html += `
                <div class="fund-item ${fund.isDebt ? 'debt' : ''}">
                    <div class="item-header">
                        <div class="item-title">${fund.name}</div>
                        <div class="item-value">$${fund.currentValue.toLocaleString()}</div>
                    </div>
                    ${fund.description ? `<div class="item-description">${fund.description}</div>` : ''}
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(100, percentage)}%;">${percentage}%</div>
                    </div>
                    <div class="thresholds">
                        <div class="threshold">
                            <span class="threshold-label">Mínimo</span>
                            <div class="threshold-value">$${fund.minThreshold.toLocaleString()}</div>
                        </div>
                        <div class="threshold">
                            <span class="threshold-label">Deseable</span>
                            <div class="threshold-value">$${fund.desirableThreshold.toLocaleString()}</div>
                        </div>
                        <div class="threshold">
                            <span class="threshold-label">Goal</span>
                            <div class="threshold-value">$${fund.goal.toLocaleString()}</div>
                        </div>
                        <div class="threshold">
                            <span class="threshold-label">Máximo</span>
                            <div class="threshold-value">$${fund.maxThreshold.toLocaleString()}</div>
                        </div>
                    </div>
                </div>`;
        });
        
        html += `
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">🏛️ Assets</h2>
            <div class="assets-list">`;
        
        assets.forEach(asset => {
            html += `
                <div class="asset-item">
                    <div class="item-header">
                        <div class="item-title">${asset.title}</div>
                        <div class="item-value">$${asset.currentValue.toLocaleString()}</div>
                    </div>
                    ${asset.description ? `<div class="item-description">${asset.description}</div>` : ''}
                    <div class="thresholds">
                        <div class="threshold">
                            <span class="threshold-label">Invertido</span>
                            <div class="threshold-value">$${asset.invested.toLocaleString()}</div>
                        </div>
                        <div class="threshold">
                            <span class="threshold-label">Inversión Faltante</span>
                            <div class="threshold-value">$${asset.missingInvestment.toLocaleString()}</div>
                        </div>
                        <div class="threshold">
                            <span class="threshold-label">Valor de Venta</span>
                            <div class="threshold-value">$${asset.saleValue.toLocaleString()}</div>
                        </div>
                    </div>
                </div>`;
        });
        
        html += `
            </div>
        </div>`;
        
        // Agregar fases si existen
        if (timelineConfig.phases && timelineConfig.phases.length > 0) {
            html += `
        <div class="section">
            <h2 class="section-title">📅 Progreso por Fases</h2>
            <div class="phases-list">`;
            
            timelineConfig.phases.forEach(phase => {
                const phaseProgress = phase.goalTotal > 0 ? Math.min(100, (netWorthValue / phase.goalTotal) * 100).toFixed(1) : 0;
                html += `
                <div class="phase-item">
                    <div class="phase-header">
                        <div class="phase-name">${phase.name}</div>
                        <div class="phase-date">${formatDate(phase.date)}</div>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span>Progreso: ${phaseProgress}%</span>
                            <span>$${netWorthValue.toLocaleString()} / $${phase.goalTotal.toLocaleString()}</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${phaseProgress}%;">${phaseProgress}%</div>
                        </div>
                    </div>
                    <div class="phase-goals">
                        <div class="phase-goal-item">
                            <div class="phase-goal-label">Goal Total</div>
                            <div class="phase-goal-value">$${phase.goalTotal.toLocaleString()}</div>
                        </div>
                        <div class="phase-goal-item">
                            <div class="phase-goal-label">Goal Assets</div>
                            <div class="phase-goal-value">$${phase.goalAssets.toLocaleString()}</div>
                        </div>
                        <div class="phase-goal-item">
                            <div class="phase-goal-label">Goal Funds</div>
                            <div class="phase-goal-value">$${phase.goalFunds.toLocaleString()}</div>
                        </div>
                    </div>
                </div>`;
            });
            
            html += `
            </div>
        </div>`;
        }
        
        html += `
    </div>
</body>
</html>`;
        
        // Crear blob y descargar
        const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `informe_ejecutivo_${new Date().getTime()}.html`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert('✅ Informe ejecutivo generado exitosamente! Puedes abrirlo en tu navegador e imprimirlo si deseas.');
    } catch (error) {
        console.error('Error al generar informe:', error);
        alert('❌ Error al generar el informe. Por favor intenta nuevamente.');
    }
}

// Inicializar la aplicación
loadTimelineConfig();
loadFunds();
loadAssets();

// Si no hay datos, generar estructura por defecto
if (funds.length === 0 && assets.length === 0 && timelineConfig.phases.length === 0) {
    createDefaultStructure();
    saveFunds();
    saveAssets();
    saveTimelineConfig();
}

renderTanks();
renderAssets();
updateMetrics();
renderTimeline();
