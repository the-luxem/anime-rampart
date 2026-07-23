import { Players, UserInputService, Workspace } from "@rbxts/services";
import { RequestUnitSpawnEvent } from "shared/remotes";

const localPlayer = Players.LocalPlayer;
const mouse = localPlayer.GetMouse();

export class PlacementController {
	private static selectedSlot: number | undefined = undefined;
	private static previewPart: Part | undefined = undefined;
	private static isActive: boolean = false;
	private static currentHoveredNode: Part | undefined = undefined;

	public static init(): void {
		// Detección de clic izquierdo para confirmar colocación
		UserInputService.InputBegan.Connect((input, gameProcessed) => {
			if (gameProcessed) return;

			if (input.UserInputType === Enum.UserInputType.MouseButton1) {
				PlacementController.confirmPlacement();
			}
		});

		// Monitorear sobre qué objeto del Workspace está el mouse
		mouse.Move.Connect(() => {
			PlacementController.updatePlacementNode();
		});

		print("[PlacementController] Controlador de cliente por Nodos listo.");
	}

	/**
	 * Activa el modo de colocación para un slot del mazo (0 a 11)
	 */
    public static selectSlotForPlacement(slotIndex: number): void {
        PlacementController.selectedSlot = slotIndex;
        PlacementController.isActive = true;

        // Creamos el indicador visual
        if (!PlacementController.previewPart) {
            const part = new Instance("Part");
            part.Size = new Vector3(3, 0.5, 3);
            part.Transparency = 1;
            part.Color = new Color3(0, 1, 0); // Verde brillante
            part.Material = Enum.Material.Neon;
            part.CanCollide = false;
            part.CanTouch = false;
            part.CanQuery = false; // 👈 ¡ESTA LÍNEA ES LA CLAVE! El Raycast lo ignorará totalmente
            part.Anchored = true;
            part.Parent = Workspace;
            PlacementController.previewPart = part;
        }
    }

	/**
	 * Detecta si el ratón está exactamente encima de un nodo de la carpeta MapSlots
	 */
    private static updatePlacementNode(): void {
        if (!PlacementController.isActive || !PlacementController.previewPart) return;

        const target = mouse.Target;
        const mapSlotsFolder = Workspace.FindFirstChild("MapSlots") as Folder | undefined;

        // Verificamos si el objeto apuntado está dentro de MapSlots
        if (target && mapSlotsFolder && target.IsDescendantOf(mapSlotsFolder)) {
            PlacementController.currentHoveredNode = target as Part;
            
            // Ajustamos el tamaño y posición del resaltado
            const nodePos = PlacementController.currentHoveredNode.Position;
            PlacementController.previewPart.Size = PlacementController.currentHoveredNode.Size.add(new Vector3(0.1, 0.1, 0.1));
            PlacementController.previewPart.Position = nodePos; // Misma posición exacta
            PlacementController.previewPart.Transparency = 0.4; // Ilumina el nodo
        } else {
            // El ratón no está sobre un nodo válido
            PlacementController.currentHoveredNode = undefined;
            PlacementController.previewPart.Transparency = 1; // Oculta el brillo
        }
    }

	private static confirmPlacement(): void {
		if (!PlacementController.isActive || PlacementController.selectedSlot === undefined) return;

		// Solo se puede colocar SI el mouse está apuntando a un nodo compatible
		if (PlacementController.currentHoveredNode) {
			const nodePosition = PlacementController.currentHoveredNode.Position;

			// Enviar petición al servidor con la posición exacta del nodo
			RequestUnitSpawnEvent.FireServer(PlacementController.selectedSlot, nodePosition);

			// Desactivar el modo de colocación
			PlacementController.cancelPlacement();
		} else {
			print("[PlacementController] ❌ Debes apuntar a un nodo de formación válido.");
		}
	}

	public static cancelPlacement(): void {
		PlacementController.isActive = false;
		PlacementController.selectedSlot = undefined;
		PlacementController.currentHoveredNode = undefined;

		if (PlacementController.previewPart) {
			PlacementController.previewPart.Transparency = 1;
		}
	}
}