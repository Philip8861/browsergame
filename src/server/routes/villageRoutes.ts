import { Router } from 'express';
import {
  getVillages,
  getVillageDetails,
  getResources,
  updateResources,
  upgradeBuilding,
  updateVillageName,
  updatePopulation,
  conquerIsland,
  createNewVillage,
} from '../controllers/villageController';
import {
  startUpgrade,
  completeUpgrade,
  cancelUpgrade,
} from '../controllers/upgradeController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Alle Routes benötigen Authentifizierung
router.use(authenticateToken);

/**
 * @route   GET /api/villages
 * @desc    Hole alle Dörfer des aktuellen Benutzers
 * @access  Private
 */
router.get('/', getVillages);

/**
 * @route   POST /api/villages/create
 * @desc    Erstelle ein neues Dorf für den aktuellen Benutzer
 * @access  Private
 */
router.post('/create', createNewVillage);


/**
 * @route   GET /api/villages/:id
 * @desc    Hole Details eines spezifischen Dorfes
 * @access  Private
 */
router.get('/:id', getVillageDetails);

/**
 * @route   GET /api/villages/:id/resources
 * @desc    Hole Ressourcen eines Dorfes
 * @access  Private
 */
router.get('/:id/resources', getResources);

/**
 * @route   PUT /api/villages/:id/resources
 * @desc    Aktualisiere Ressourcen eines Dorfes
 * @access  Private
 */
router.put('/:id/resources', updateResources);

/**
 * @route   POST /api/villages/:id/buildings/upgrade
 * @desc    Upgrade ein Gebäude
 * @access  Private
 */
router.post('/:id/buildings/upgrade', upgradeBuilding);

/**
 * @route   PATCH /api/villages/:id/name
 * @desc    Aktualisiere Inselname
 * @access  Private
 */
router.patch('/:id/name', updateVillageName);

/**
 * @route   PATCH /api/villages/:id/population
 * @desc    Aktualisiere Bevölkerung
 * @access  Private
 */
router.patch('/:id/population', updatePopulation);

/**
 * @route   POST /api/villages/:id/conquer
 * @desc    Erobere eine Insel
 * @access  Private
 */
router.post('/:id/conquer', conquerIsland);

/**
 * @route   POST /api/villages/:id/upgrades/start
 * @desc    Starte einen Ausbau
 * @access  Private
 */
router.post('/:id/upgrades/start', startUpgrade);

/**
 * @route   POST /api/villages/:id/upgrades/complete
 * @desc    Schließe einen Ausbau ab
 * @access  Private
 */
router.post('/:id/upgrades/complete', completeUpgrade);

/**
 * @route   POST /api/villages/:id/upgrades/cancel
 * @desc    Breche einen Ausbau ab
 * @access  Private
 */
router.post('/:id/upgrades/cancel', cancelUpgrade);

export default router;




