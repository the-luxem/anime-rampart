import { PlacementController } from "./controllers/PlacementController";
import { UIController } from "./controllers/UIController";

// 1. Inicializar colocación
PlacementController.init();

// 2. Inicializar la UI de Roact
UIController.init();

print("🚀 [Cliente] Controladores del cliente iniciados.");