import { Workspace } from "@rbxts/services";
import { SellUnitRequestEvent, ConfirmUnitFreedEvent } from "shared/remotes";
import { GoldService } from "./GoldService";
import { PlacementService } from "./PlacementService";

export class SellUnitService {
	public static init(): void {
		SellUnitRequestEvent.OnServerEvent.Connect((player, unitModel) => {
			print(`[SellUnitService] 📩 Petición de venta recibida de ${player.Name}...`);

			if (typeIs(unitModel, "Instance") && unitModel.IsA("Model")) {
				SellUnitService.handleSellRequest(player, unitModel as Model);
			} else {
				warn("[SellUnitService] ❌ La instancia enviada no es un Modelo válido.");
			}
		});

		print("[SellUnitService] Servicio de venta de tropas inicializado.");
	}

	private static handleSellRequest(player: Player, unitModel: Model): void {
		// Validar dueño
		const ownerId = unitModel.GetAttribute("OwnerUserId");
		if (ownerId !== undefined && ownerId !== player.UserId) {
			warn(`[SellUnitService] ❌ ${player.Name} intentó vender una unidad de otro jugador.`);
			return;
		}

		let slotIndex = unitModel.GetAttribute("SlotIndex") as number | undefined;

		const deployCost = (unitModel.GetAttribute("DeployCost") as number) ?? 150;
		const refundGold = math.floor(deployCost * 0.5); // 💰 50% Reembolso

		// Buscamos MapNodes primero, o MapSlots como fallback
		const mapNodesFolder = (Workspace.FindFirstChild("MapNodes") ?? Workspace.FindFirstChild("MapSlots")) as Folder | undefined;
		let targetNode: Part | undefined = undefined;

		const primaryPart = unitModel.PrimaryPart ?? (unitModel.FindFirstChildOfClass("BasePart") as BasePart | undefined);

		if (mapNodesFolder && primaryPart) {
			let closestDistance = 1.5; // 🎯 Tolerancia estricta de 1.5 studs máximo para no confundir nodos vecinos

			for (const child of mapNodesFolder.GetChildren()) {
				if (child.IsA("BasePart")) {
					// Comparamos distancia en el plano horizontal (XZ) ignorando la altura del spawn (+2Y)
					const nodePos = new Vector3(child.Position.X, 0, child.Position.Z);
					const unitPos = new Vector3(primaryPart.Position.X, 0, primaryPart.Position.Z);
					const dist = nodePos.sub(unitPos).Magnitude;

					if (dist < closestDistance) {
						closestDistance = dist;
						targetNode = child as Part;
					}
				}
			}
		}

		// 1. Reembolsar oro al jugador
		GoldService.addGold(player, refundGold);

		// 2. Liberar slot y nodo en PlacementService
		if (slotIndex !== undefined && targetNode) {
			PlacementService.freeSlotAndNode(player, slotIndex, targetNode);
			print(`[SellUnitService] 🔓 Nodo ${targetNode.Name} y Slot ${slotIndex + 1} liberados.`);
		} else if (slotIndex !== undefined) {
			PlacementService.freeSlotAndNode(player, slotIndex, unitModel);
		}

		// 3. Avisar al Cliente para desmarcar el Slot en la Hotbar
		if (slotIndex !== undefined) {
			ConfirmUnitFreedEvent.FireClient(player, slotIndex);
		}

		// 4. Destruir el modelo 3D
		const unitName = unitModel.GetAttribute("UnitName") ?? unitModel.Name;
		unitModel.Destroy();

		print(`[SellUnitService] 🟢 ${player.Name} vendió exitosamente a ${unitName} por +${refundGold}g.`);
	}
}