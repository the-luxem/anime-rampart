import { UserInputService } from "@rbxts/services";
import { PlacementController } from "./controllers/PlacementController";

PlacementController.init();

// 🧪 Prueba rápida: Presiona 'E' para empezar a colocar la tropa asignada al Slot 0
UserInputService.InputBegan.Connect((input, gameProcessed) => {
	if (gameProcessed) return;

	if (input.KeyCode === Enum.KeyCode.E) {
		print("[Cliente] Modo colocación activado para Slot 0. Haz Clic para colocar.");
		PlacementController.selectSlotForPlacement(0);
	}
});