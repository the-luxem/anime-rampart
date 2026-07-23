import { DeploymentHotbar } from "../ui/DeploymentHotbar";
import { PlacementController } from "./PlacementController";

export class UIController {
	private static hotbar: DeploymentHotbar | undefined;

	public static init(): void {
		UIController.hotbar = new DeploymentHotbar();

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

		print("[UIController] UI nativa de Hotbar cargada exitosamente.");
	}

	public static getHotbar(): DeploymentHotbar | undefined {
		return UIController.hotbar;
	}
}