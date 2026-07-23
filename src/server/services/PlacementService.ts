import { Workspace } from "@rbxts/services";
import { RequestUnitSpawnEvent, ConfirmUnitDeployedEvent } from "shared/remotes";
import { DeckService } from "./DeckService";
import { UnitSpawnerService } from "./UnitSpawnerService";
import { GoldService } from "./GoldService";

export class PlacementService {
	private static occupiedNodes = new Set<Instance>();
	private static deployedSlots = new Set<string>();

	public static init(): void {
		RequestUnitSpawnEvent.OnServerEvent.Connect((player, slotIndex, position) => {
			if (typeIs(slotIndex, "number") && typeIs(position, "Vector3")) {
				PlacementService.handleSpawnRequest(player, slotIndex, position);
			}
		});

		print("[PlacementService] Servicio de colocación inicializado.");
	}

	private static handleSpawnRequest(player: Player, slotIndex: number, position: Vector3): void {
		const slotKey = `${player.UserId}_${slotIndex}`;

		if (PlacementService.deployedSlots.has(slotKey)) {
			warn(`[PlacementService] ${player.Name} ya desplegó la tropa del Slot ${slotIndex + 1}.`);
			return;
		}

		let deck = DeckService.getEquippedDeck(player);

		if (deck.size() === 0) {
			task.wait(0.3);
			deck = DeckService.getEquippedDeck(player);
		}

		const slot = deck[slotIndex];

		if (!slot || !slot.inventoryUnit || !slot.config) {
			warn(`[PlacementService] ${player.Name} intentó spawnear un slot vacío o inválido (${slotIndex}).`);
			return;
		}

		// Validación de Oro
		const cost = slot.config.deployCost ?? 100;
		if (GoldService.getGold(player) < cost) {
			warn(`[PlacementService] ❌ ${player.Name} no tiene suficiente oro para invocar (requiere ${cost}).`);
			return;
		}

		// Validar nodo
		const mapSlotsFolder = Workspace.FindFirstChild("MapSlots") as Folder | undefined;
		let targetNode: Part | undefined = undefined;

		if (mapSlotsFolder) {
			for (const child of mapSlotsFolder.GetChildren()) {
				if (child.IsA("BasePart")) {
					if (child.Position.sub(position).Magnitude < 3) {
						targetNode = child as Part;
						break;
					}
				}
			}
		}

		if (!targetNode) {
			warn(`[PlacementService] ${player.Name} intentó spawnear en una posición inválida.`);
			return;
		}

		if (PlacementService.occupiedNodes.has(targetNode)) {
			warn(`[PlacementService] El nodo ${targetNode.Name} ya está ocupado.`);
			return;
		}

		// Restar Oro
		GoldService.removeGold(player, cost);

		// Marcar ocupados
		PlacementService.occupiedNodes.add(targetNode);
		PlacementService.deployedSlots.add(slotKey);

		const finalSpawnPosition = new Vector3(targetNode.Position.X, targetNode.Position.Y + 2, targetNode.Position.Z);

		// 🟢 Enviamos slotIndex como 4to argumento a UnitSpawnerService
		UnitSpawnerService.spawnUnit(player, slot.inventoryUnit, finalSpawnPosition, slotIndex);
		print(`[PlacementService] 🟢 ${player.Name} gastó ${cost} de oro y desplegó a ${slot.config.name} (Slot ${slotIndex + 1}) en el nodo ${targetNode.Name}`);

		ConfirmUnitDeployedEvent.FireClient(player, slotIndex);
	}

	public static freeSlotAndNode(player: Player, slotIndex: number, node: Instance): void {
		const slotKey = `${player.UserId}_${slotIndex}`;
		PlacementService.deployedSlots.delete(slotKey);
		PlacementService.occupiedNodes.delete(node);
	}
}