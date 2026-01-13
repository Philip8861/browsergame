/**
 * Debug-Tool zum Hinzufügen von Ressourcen
 */

async function getCurrentIslandId() {
  try {
    const { api } = await import('./api.js');
    const islands = await api.getVillages();
    if (islands && Array.isArray(islands) && islands.length > 0) {
      // Prüfe localStorage für aktuelle Insel
      const storedId = localStorage.getItem('currentIslandId');
      if (storedId) {
        const islandId = parseInt(storedId, 10);
        const island = islands.find(i => i.id === islandId);
        if (island) {
          return islandId;
        }
      }
      // Fallback: erste Insel
      return islands[0].id;
    }
    return null;
  } catch (error) {
    console.error('Fehler beim Abrufen der aktuellen Insel-ID:', error);
    return null;
  }
}

function showAddResourcesModal() {
  const modal = document.getElementById('add-resources-modal');
  if (!modal) {
    createAddResourcesModal();
  }
  
  const modalElement = document.getElementById('add-resources-modal');
  if (modalElement) {
    modalElement.classList.remove('hidden');
    // Setze Standardwerte auf 0
    const woodInput = document.getElementById('wood-amount-input');
    const stoneInput = document.getElementById('stone-amount-input');
    const waterInput = document.getElementById('water-amount-input');
    const foodInput = document.getElementById('food-amount-input');
    const luxuryInput = document.getElementById('luxury-amount-input');
    
    if (woodInput) woodInput.value = '0';
    if (stoneInput) stoneInput.value = '0';
    if (waterInput) waterInput.value = '0';
    if (foodInput) foodInput.value = '0';
    if (luxuryInput) luxuryInput.value = '0';
    
    // Fokussiere erstes Eingabefeld
    if (woodInput) woodInput.focus();
  }
}

function createAddResourcesModal() {
  const modal = document.createElement('div');
  modal.id = 'add-resources-modal';
  modal.className = 'resource-modal hidden';
  modal.innerHTML = `
    <div class="resource-modal-content">
      <div class="resource-modal-header">
        <h3>Rohstoffe hinzufügen</h3>
        <button class="resource-modal-close" id="close-resources-modal">×</button>
      </div>
      <div class="resource-modal-body">
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <label for="wood-amount-input" class="resource-modal-label">🪵 Holz:</label>
            <input 
              type="number" 
              id="wood-amount-input" 
              class="resource-modal-input" 
              min="0" 
              value="0" 
              placeholder="0"
            >
          </div>
          <div>
            <label for="stone-amount-input" class="resource-modal-label">🪨 Stein:</label>
            <input 
              type="number" 
              id="stone-amount-input" 
              class="resource-modal-input" 
              min="0" 
              value="0" 
              placeholder="0"
            >
          </div>
          <div>
            <label for="water-amount-input" class="resource-modal-label">💧 Wasser:</label>
            <input 
              type="number" 
              id="water-amount-input" 
              class="resource-modal-input" 
              min="0" 
              value="0" 
              placeholder="0"
            >
          </div>
          <div>
            <label for="food-amount-input" class="resource-modal-label">🍖 Nahrung:</label>
            <input 
              type="number" 
              id="food-amount-input" 
              class="resource-modal-input" 
              min="0" 
              value="0" 
              placeholder="0"
            >
          </div>
          <div>
            <label for="luxury-amount-input" class="resource-modal-label">💎 Luxus:</label>
            <input 
              type="number" 
              id="luxury-amount-input" 
              class="resource-modal-input" 
              min="0" 
              value="0" 
              placeholder="0"
            >
          </div>
          <div>
            <label for="population-amount-input" class="resource-modal-label">👥 Bevölkerung:</label>
            <input 
              type="number" 
              id="population-amount-input" 
              class="resource-modal-input" 
              min="0" 
              value="0" 
              placeholder="0"
            >
          </div>
        </div>
        <div class="resource-modal-buttons">
          <button class="resource-modal-btn resource-modal-btn-primary" id="confirm-add-resources">
            Hinzufügen
          </button>
          <button class="resource-modal-btn resource-modal-btn-secondary" id="cancel-add-resources">
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Event Listeners
  document.getElementById('close-resources-modal')?.addEventListener('click', hideAddResourcesModal);
  document.getElementById('cancel-add-resources')?.addEventListener('click', hideAddResourcesModal);
  document.getElementById('confirm-add-resources')?.addEventListener('click', handleAddResources);
  
  // Schließen bei Klick außerhalb
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      hideAddResourcesModal();
    }
  });
  
  // Enter-Taste zum Bestätigen
  const inputs = modal.querySelectorAll('input[type="number"]');
  inputs.forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleAddResources();
      }
      if (e.key === 'Escape') {
        hideAddResourcesModal();
      }
    });
  });
}

function hideAddResourcesModal() {
  const modal = document.getElementById('add-resources-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

async function handleAddResources() {
  try {
    // Hole Eingabewerte
    const woodInput = document.getElementById('wood-amount-input');
    const stoneInput = document.getElementById('stone-amount-input');
    const waterInput = document.getElementById('water-amount-input');
    const foodInput = document.getElementById('food-amount-input');
    const luxuryInput = document.getElementById('luxury-amount-input');
    const populationInput = document.getElementById('population-amount-input');
    
    if (!woodInput || !stoneInput || !waterInput || !foodInput || !luxuryInput || !populationInput) {
      console.error('Eingabefelder nicht gefunden');
      return;
    }
    
    const amounts = {
      wood: parseInt(woodInput.value, 10) || 0,
      stone: parseInt(stoneInput.value, 10) || 0,
      water: parseInt(waterInput.value, 10) || 0,
      food: parseInt(foodInput.value, 10) || 0,
      luxury: parseInt(luxuryInput.value, 10) || 0,
      population: parseInt(populationInput.value, 10) || 0
    };
    
    // Prüfe ob mindestens ein Wert größer als 0 ist
    const totalAmount = amounts.wood + amounts.stone + amounts.water + amounts.food + amounts.luxury + amounts.population;
    if (totalAmount === 0) {
      alert('Bitte gib mindestens einen Wert größer als 0 ein!');
      return;
    }
    
    const { api } = await import('./api.js');
    
    // Hole aktuelle Insel-ID
    const villageId = await getCurrentIslandId();
    if (!villageId) {
      alert('Keine Insel ausgewählt!');
      return;
    }
    
    console.log(`[DEBUG] Versuche Rohstoffe für Insel ${villageId} hinzuzufügen...`, amounts);
    
    // Hole aktuelle Ressourcen
    const resources = await api.getResources(villageId);
    console.log('[DEBUG] Aktuelle Ressourcen:', resources);
    
    if (!resources) {
      alert('Ressourcen konnten nicht geladen werden!');
      return;
    }
    
    // Berechne neue Werte
    const newResources = {
      wood: (parseFloat(resources.wood) || 0) + amounts.wood,
      stone: (parseFloat(resources.stone) || 0) + amounts.stone,
      water: (parseFloat(resources.water) || 0) + amounts.water,
      food: (parseFloat(resources.food) || 0) + amounts.food,
      luxury: (parseFloat(resources.luxury) || 0) + amounts.luxury
    };
    
    console.log(`[DEBUG] Neue Ressourcen:`, newResources);
    
    // Update Ressourcen
    console.log(`[DEBUG] Sende Update-Request für Insel ${villageId}`);
    const result = await api.updateResources(villageId, newResources);
    console.log('[DEBUG] Update-Ergebnis:', result);
    
    // Update Bevölkerung falls vorhanden
    if (amounts.population > 0) {
      try {
        // Hole aktuelle Village-Details
        const villageDetails = await api.getVillageDetails(villageId);
        const currentPopulation = villageDetails.village?.population || 0;
        const newPopulation = currentPopulation + amounts.population;
        
        console.log(`[DEBUG] Aktualisiere Bevölkerung: ${currentPopulation} + ${amounts.population} = ${newPopulation}`);
        await api.updatePopulation(villageId, newPopulation);
      } catch (error) {
        console.error('[ERROR] Fehler beim Aktualisieren der Bevölkerung:', error);
        // Fehler nicht blockieren, Ressourcen wurden bereits aktualisiert
      }
    }
    
    // Warte kurz, dann aktualisiere Anzeige
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Aktualisiere Anzeige
    await updateResourcesDisplay();
    
    console.log(`[DEBUG] Rohstoffe erfolgreich hinzugefügt!`);
    
    // Schließe Modal
    hideAddResourcesModal();
    
    // Erstelle Erfolgsmeldung
    const addedResources = [];
    if (amounts.wood > 0) addedResources.push(`${amounts.wood} Holz`);
    if (amounts.stone > 0) addedResources.push(`${amounts.stone} Stein`);
    if (amounts.water > 0) addedResources.push(`${amounts.water} Wasser`);
    if (amounts.food > 0) addedResources.push(`${amounts.food} Nahrung`);
    if (amounts.luxury > 0) addedResources.push(`${amounts.luxury} Luxus`);
    if (amounts.population > 0) addedResources.push(`${amounts.population} Bevölkerung`);
    
    showSuccessMessage(`✅ ${addedResources.join(', ')} hinzugefügt!`);
    
  } catch (error) {
    console.error('[ERROR] Fehler beim Hinzufügen der Rohstoffe:', error);
    console.error('[ERROR] Fehler-Details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    alert('Fehler beim Hinzufügen der Rohstoffe: ' + (error.message || 'Unbekannter Fehler'));
  }
}

async function updateResourcesDisplay() {
  try {
    const { api } = await import('./api.js');
    const villageId = await getCurrentIslandId();
    if (villageId) {
      const resources = await api.getResources(villageId);
      if (resources) {
        // Versuche MenuManager zu verwenden, falls verfügbar
        const menuManager = window.menuManagerInstance || window.menuManager;
        if (menuManager && typeof menuManager.updateResourcesDisplay === 'function') {
          // Hole auch Village-Details für MenuManager
          try {
            const details = await api.getVillageDetails(villageId);
            await menuManager.updateResourcesDisplay(resources, details?.village);
            return;
          } catch (error) {
            console.warn('Konnte Village-Details nicht laden, verwende Fallback:', error);
          }
        }
        
        // Fallback: Update neue Dashboard-Anzeige direkt
        const woodEl = document.getElementById('resource-wood');
        const stoneEl = document.getElementById('resource-stone');
        const waterEl = document.getElementById('resource-water');
        const foodEl = document.getElementById('resource-food');
        const luxuryEl = document.getElementById('resource-luxury');
        
        if (woodEl) woodEl.textContent = Math.floor(resources.wood || 0);
        if (stoneEl) stoneEl.textContent = Math.floor(resources.stone || 0);
        if (waterEl) waterEl.textContent = Math.floor(resources.water || 0);
        if (foodEl) foodEl.textContent = Math.floor(resources.food || 0);
        if (luxuryEl) luxuryEl.textContent = Math.floor(resources.luxury || 0);
        
        // Produktionsrate anzeigen (vorerst immer 0)
        const productionRate = 0; // TODO: Später aus resources.productionRate oder ähnlich holen
        const woodRateEl = document.getElementById('resource-wood-rate');
        const stoneRateEl = document.getElementById('resource-stone-rate');
        const waterRateEl = document.getElementById('resource-water-rate');
        const foodRateEl = document.getElementById('resource-food-rate');
        const luxuryRateEl = document.getElementById('resource-luxury-rate');
        
        if (woodRateEl) woodRateEl.textContent = `+${productionRate}`;
        if (stoneRateEl) stoneRateEl.textContent = `+${productionRate}`;
        if (waterRateEl) waterRateEl.textContent = `+${productionRate}`;
        if (foodRateEl) foodRateEl.textContent = `+${productionRate}`;
        if (luxuryRateEl) luxuryRateEl.textContent = `+${productionRate}`;
        
        // Update alte Anzeige falls vorhanden
        const woodOldEl = document.getElementById('resource-wood-old');
        const clayOldEl = document.getElementById('resource-clay-old');
        const ironOldEl = document.getElementById('resource-iron-old');
        const wheatOldEl = document.getElementById('resource-wheat-old');
        
        if (woodOldEl) woodOldEl.textContent = Math.floor(resources.wood || 0);
        if (clayOldEl) clayOldEl.textContent = Math.floor(resources.stone || 0);
        if (ironOldEl) ironOldEl.textContent = Math.floor(resources.water || 0);
        if (wheatOldEl) wheatOldEl.textContent = Math.floor(resources.food || 0);
        
        // Aktualisiere Bevölkerung falls vorhanden
        const populationEl = document.getElementById('resource-population');
        if (populationEl && menuManager) {
          try {
            const details = await api.getVillageDetails(villageId);
            if (details && details.village) {
              populationEl.textContent = details.village.population || 0;
              // Aktualisiere auch die animierten Figuren
              if (typeof menuManager.updateIslandPeople === 'function') {
                await menuManager.updateIslandPeople(details.village.population || 0);
              }
            }
          } catch (error) {
            console.warn('Konnte Bevölkerung nicht aktualisieren:', error);
          }
        }
        
        console.log('Ressourcen-Anzeige aktualisiert:', resources);
      }
    }
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Ressourcen-Anzeige:', error);
  }
}

function showSuccessMessage(message) {
  const toast = document.createElement('div');
  toast.className = 'resource-toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Event Listener für Button
document.addEventListener('DOMContentLoaded', () => {
  const addWoodBtn = document.getElementById('add-wood-btn');
  if (addWoodBtn) {
    addWoodBtn.addEventListener('click', showAddResourcesModal);
  }
});

export { showAddResourcesModal as addResources };

