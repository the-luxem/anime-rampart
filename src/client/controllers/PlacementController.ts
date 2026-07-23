import { Players, UserInputService, Workspace } from "@rbxts/services";
import { RequestUnitSpawnEvent, ConfirmUnitDeployedEvent, GoldUpdateEvent } from "shared/remotes";

const localPlayer = Players.LocalPlayer;
const mouse = localPlayer.GetMouse();

export type UnitCategory = "Vanguard" | "Rampart";

export class PlacementController {
	private static selectedIndex: number | undefined = undefined;
	private static previewPart: Part | undefined = undefined;
	private static isActive: boolean = false;
	private static currentHoveredNode: Part | undefined = undefined;

	// Callbacks para notificar cambios de estado a la UI sin depender de ella
	public static onUnitDeployed?: (index: number) => void;
	public static onPlacementCancelled?: () => void;
	public static onGoldUpdated?: (amount: number) => void;

	public static init(): void {
		// 1. Escuchar confirmación de despliegue exitoso desde el servidor
		ConfirmUnitDeployedEvent.OnClientEvent.Connect((unitIndex: unknown) => {
			if (typeIs(unitIndex, "number")) {
				PlacementController.markUnitIndexAsDeployed(unitIndex);
			}
		});

		// 2. Escuchar actualización de economía / oro
		GoldUpdateEvent.OnClientEvent.Connect((goldAmount: unknown) => {
			if (typeIs(goldAmount, "number")) {
				if (PlacementController.onGoldUpdated) {
					PlacementController.onGoldUpdated(goldAmount);
				}
			}
		});

		// 3. Registrar inputs de mouse y teclado
		UserInputService.InputBegan.Connect((input, gameProcessed) => {
			if (gameProcessed) return;

			if (input.UserInputType === Enum.UserInputType.MouseButton1) {
				PlacementController.confirmPlacement();
			}

			if (
				input.UserInputType === Enum.UserInputType.MouseButton2 ||
				input.KeyCode === Enum.KeyCode.Escape
			) {
				PlacementController.cancelPlacement();
			}
		});

		mouse.Move.Connect(() => {
			PlacementController.updatePlacementNode();
		});

		print("[PlacementController] Controlador de cliente por Nodos e Index listo.");
	}

	public static selectUnitIndexForPlacement(unitIndex: number): void {
		PlacementController.selectedIndex = unitIndex;
		PlacementController.isActive = true;

		if (!PlacementController.previewPart) {
			const part = new Instance("Part");
			part.Size = new Vector3(3, 0.5, 3);
			part.Transparency = 1;
			part.Color = new Color3(0, 1, 0);
			part.Material = Enum.Material.Neon;
			part.CanCollide = false;
			part.CanTouch = false;
			part.CanQuery = false;
			part.Anchored = true;
			part.Parent = Workspace;
			PlacementController.previewPart = part;
		}

		PlacementController.updatePlacementNode();
	}

	private static getNodeIndexFromName(nodeName: string): number | undefined {
		const matches = nodeName.match("%d+");
		if (matches.size() === 0) return undefined;

		return tonumber(matches[0]);
	}

	private static isValidNodeForSelection(unitIndex: number, targetNodeName: string): boolean {
		const nodeIndex = PlacementController.getNodeIndexFromName(targetNodeName);
		if (nodeIndex === undefined) return false;

		const isVanguardUnit = unitIndex >= 0 && unitIndex <= 5;
		const isRampartUnit = unitIndex >= 6 && unitIndex <= 11;

		if (isVanguardUnit) {
			return nodeIndex >= 0 && nodeIndex <= 5;
		} else if (isRampartUnit) {
			return nodeIndex >= 6 && nodeIndex <= 11;
		}

		return false;
	}

	private static updatePlacementNode(): void {
		if (
			!PlacementController.isActive ||
			!PlacementController.previewPart ||
			PlacementController.selectedIndex === undefined
		) {
			return;
		}

		const target = mouse.Target;
		const mapNodesFolder = (Workspace.FindFirstChild("MapNodes") ??
			Workspace.FindFirstChild("MapSlots")) as Folder | undefined;

		if (target && mapNodesFolder && target.IsDescendantOf(mapNodesFolder)) {
			const hoveredNode = target as Part;
			const isValid = PlacementController.isValidNodeForSelection(
				PlacementController.selectedIndex,
				hoveredNode.Name,
			);

			if (isValid) {
				PlacementController.currentHoveredNode = hoveredNode;

				PlacementController.previewPart.Size = hoveredNode.Size.add(new Vector3(0.1, 0.1, 0.1));
				PlacementController.previewPart.Position = hoveredNode.Position;
				PlacementController.previewPart.Color = new Color3(0, 1, 0);
				PlacementController.previewPart.Transparency = 0.4;
			} else {
				PlacementController.currentHoveredNode = undefined;
				PlacementController.previewPart.Size = hoveredNode.Size.add(new Vector3(0.1, 0.1, 0.1));
				PlacementController.previewPart.Position = hoveredNode.Position;
				PlacementController.previewPart.Color = new Color3(1, 0, 0);
				PlacementController.previewPart.Transparency = 0.5;
			}
		} else {
			PlacementController.currentHoveredNode = undefined;
			PlacementController.previewPart.Transparency = 1;
		}
	}

	private static confirmPlacement(): void {
		if (!PlacementController.isActive || PlacementController.selectedIndex === undefined) return;

		if (PlacementController.currentHoveredNode) {
			const nodePosition = PlacementController.currentHoveredNode.Position;
			const targetNodeName = PlacementController.currentHoveredNode.Name;

			RequestUnitSpawnEvent.FireServer(PlacementController.selectedIndex, nodePosition);

			print(
				`[PlacementController] 🟢 Petición enviada: Unit Index ${PlacementController.selectedIndex} en ${targetNodeName}`,
			);

			PlacementController.cancelPlacement();
		} else {
			warn(
				"[PlacementController] ❌ Debes apuntar a un Node de formación válido para esta categoría de unidad.",
			);
			PlacementController.cancelPlacement();
		}
	}

	public static markUnitIndexAsDeployed(unitIndex: number): void {
		if (PlacementController.onUnitDeployed) {
			PlacementController.onUnitDeployed(unitIndex);
		}
	}

	public static cancelPlacement(): void {
		PlacementController.isActive = false;
		PlacementController.selectedIndex = undefined;
		PlacementController.currentHoveredNode = undefined;

		if (PlacementController.previewPart) {
			PlacementController.previewPart.Transparency = 1;
		}

		if (PlacementController.onPlacementCancelled) {
			PlacementController.onPlacementCancelled();
		}
	}
}