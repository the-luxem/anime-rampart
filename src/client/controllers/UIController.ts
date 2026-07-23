import { DeploymentHotbar } from "../ui/DeploymentHotbar";
import { GoldDisplay } from "../ui/GoldDisplay";
import { PlacementController } from "./PlacementController";

export class UIController {
	private static hotbar: DeploymentHotbar | undefined;
	private static goldDisplay: GoldDisplay | undefined;

	public static init(): void {
		UIController.hotbar = new DeploymentHotbar();
		UIController.goldDisplay = new GoldDisplay();

		// 1. Cuando el jugador pulsa un botón en la Hotbar -> Avisamos a PlacementController
		UIController.hotbar.onUnitSelected = (index: number) => {
			PlacementController.selectUnitIndexForPlacement(index);
		};

		// 2. Cuando la unidad se despliega con éxito -> Marcamos en la Hotbar
		PlacementController.onUnitDeployed = (index: number) => {
			UIController.hotbar?.markUnitAsDeployed(index);
		};

		// 3. Cuando se cancela la colocación -> Limpiamos selección en Hotbar
		PlacementController.onPlacementCancelled = () => {
			UIController.hotbar?.clearSelection();
		};

		// 4. Cuando el oro cambia -> Actualizamos el badge en pantalla
		PlacementController.onGoldUpdated = (amount: number) => {
			UIController.goldDisplay?.updateGold(amount);
		};

		print("[UIController] UI nativa de Hotbar y Contador de Oro cargados exitosamente.");
	}

	public static getHotbar(): DeploymentHotbar | undefined {
		return UIController.hotbar;
	}

	public static getGoldDisplay(): GoldDisplay | undefined {
		return UIController.goldDisplay;
	}
}