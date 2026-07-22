import { CHARACTERS_REGISTRY } from "shared/configs/Characters";
import { CharacterConfig } from "shared/types/CharacterConfig";
import { InventoryUnit } from "shared/types/PlayerData";
import { PlayerDataService } from "./PlayerDataService";

export interface ResolvedDeckSlot {
	slotIndex: number;
	inventoryUnit?: InventoryUnit;
	config?: CharacterConfig;
}

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

		// Validar rango del slot (0 a 11)
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

		// Validar que la tropa exista en el registro de personajes
		const config = CHARACTERS_REGISTRY[inventoryUnit.characterId];
		if (!config) {
			warn(`[DeckService] Configuración no encontrada para: ${inventoryUnit.characterId}`);
			return false;
		}

		// Validar posición según el slot (0-5 Vanguardia, 6-11 Muralla/Rampart)
		const isVanguardSlot = targetSlot < 6;
		if (isVanguardSlot && config.placement !== "Vanguard") {
			warn(`[DeckService] No se puede equipar una tropa de Muralla en slot de Vanguardia.`);
			return false;
		}
		if (!isVanguardSlot && config.placement !== "Rampart") {
			warn(`[DeckService] No se puede equipar una tropa de Vanguardia en slot de Muralla.`);
			return false;
		}

		// Evitar duplicados del mismo personaje en el mazo
		const isDuplicate = profile.Data.equippedDeck.some((equippedUuid, index) => {
			if (!equippedUuid || index === targetSlot) return false;
			const unit = profile.Data.inventory.find((u) => u.uuid === equippedUuid);
			return unit?.characterId === inventoryUnit.characterId;
		});

		if (isDuplicate) {
			warn(`[DeckService] Ya tienes a ${config.name} equipado en tu mazo.`);
			return false;
		}

		// Si ya estaba en otro slot, lo liberamos
		const existingSlotIndex = profile.Data.equippedDeck.indexOf(unitUuid);
		if (existingSlotIndex !== -1) {
			profile.Data.equippedDeck[existingSlotIndex] = "";
		}

		// Asignar al nuevo slot
		profile.Data.equippedDeck[targetSlot] = unitUuid;
		print(`[DeckService] Tropa ${config.name} equipada en el slot ${targetSlot} para ${player.Name}`);

		return true;
	}

	/**
	 * Desequipa la tropa de un slot específico
	 */
	export function unequipSlot(player: Player, slotIndex: number): boolean {
		const profile = PlayerDataService.getProfile(player);
		if (!profile) return false;

		if (slotIndex < 0 || slotIndex >= 12) return false;

		profile.Data.equippedDeck[slotIndex] = "";
		print(`[DeckService] Slot ${slotIndex} desequipado para ${player.Name}`);
		return true;
	}

	/**
	 * Retorna la información completa de todo el mazo equipado (útil para la UI y el Spawner)
	 */
	export function getEquippedDeck(player: Player): ResolvedDeckSlot[] {
		const profile = PlayerDataService.getProfile(player);
		if (!profile) return [];

		return profile.Data.equippedDeck.map((uuid, index) => {
			if (!uuid) return { slotIndex: index };

			const inventoryUnit = profile.Data.inventory.find((u) => u.uuid === uuid);
			if (!inventoryUnit) return { slotIndex: index };

			const config = CHARACTERS_REGISTRY[inventoryUnit.characterId];
			return {
				slotIndex: index,
				inventoryUnit,
				config,
			};
		});
	}

	/**
	 * Valida si el mazo tiene al menos una cantidad mínima de tropas para iniciar partida
	 */
/**
 * Valida si el mazo tiene al menos una cantidad mínima de tropas para iniciar partida
 */
    export function isDeckValid(player: Player, minRequired = 1): boolean {
        const profile = PlayerDataService.getProfile(player);
        if (!profile) return false;

        let equippedCount = 0;
        for (const uuid of profile.Data.equippedDeck) {
            if (uuid !== "") {
                equippedCount++;
            }
        }

        return equippedCount >= minRequired;
    }
}