import { CHARACTERS_REGISTRY } from "shared/configs/Characters";
import { PlayerDataService } from "./PlayerDataService";

export namespace DeckService {
	/**
	 * Equipa una tropa del inventario en un slot específico del mazo
	 */
	export function equipUnit(player: Player, unitUuid: string, targetSlot: number): boolean {
		const profile = PlayerDataService.getProfile(player);
		if (!profile) {
			warn(`[DeckService] No se encontró perfil para ${player.Name}`);
			return false;
		}

		// Validar que el slot esté dentro del rango (0 a 11)
		if (targetSlot < 0 || targetSlot >= 12) {
			warn(`[DeckService] Slot inválido: ${targetSlot}`);
			return false;
		}

		// Buscar la tropa en el inventario del jugador
		const inventoryUnit = profile.Data.inventory.find((u) => u.uuid === unitUuid);
		if (!inventoryUnit) {
			warn(`[DeckService] El jugador no posee la tropa con UUID: ${unitUuid}`);
			return false;
		}

		// Validar que la tropa exista en el registro
		const config = CHARACTERS_REGISTRY[inventoryUnit.characterId];
		if (!config) {
			warn(`[DeckService] Configuración no encontrada para: ${inventoryUnit.characterId}`);
			return false;
		}

		// Validar línea/posición (Slots 0-5 = Vanguardia, Slots 6-11 = Muralla)
		const isVanguardSlot = targetSlot < 6;
		if (isVanguardSlot && config.placement !== "Vanguard") {
			warn(`[DeckService] No se puede equipar una tropa de Muralla en slot de Vanguardia.`);
			return false;
		}
		if (!isVanguardSlot && config.placement !== "Rampart") {
			warn(`[DeckService] No se puede equipar una tropa de Vanguardia en slot de Muralla.`);
			return false;
		}

		// Verificar si la tropa ya está equipada en otro slot del mazo y removerla de allí
		const existingSlotIndex = profile.Data.equippedDeck.indexOf(unitUuid);
		if (existingSlotIndex !== -1) {
			profile.Data.equippedDeck[existingSlotIndex] = "";
		}

		// Colocar la tropa en el nuevo slot objetivo
		profile.Data.equippedDeck[targetSlot] = unitUuid;
		print(`[DeckService] Tropa ${config.name} equipada exitosamente en el slot ${targetSlot} para ${player.Name}`);

		return true;
	}

	/**
	 * Desequipa la tropa que esté en un slot específico
	 */
	export function unequipSlot(player: Player, slotIndex: number): boolean {
		const profile = PlayerDataService.getProfile(player);
		if (!profile) return false;

		if (slotIndex < 0 || slotIndex >= 12) return false;

		profile.Data.equippedDeck[slotIndex] = "";
		print(`[DeckService] Slot ${slotIndex} desequipado para ${player.Name}`);
		return true;
	}
}