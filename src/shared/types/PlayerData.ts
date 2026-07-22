export type StatLetter = 
    | "-F" | "F" | "F+" 
    | "-E" | "E" | "E+" 
    | "-D" | "D" | "D+" 
    | "-C" | "C" | "C+" 
    | "-B" | "B" | "B+" 
    | "-A" | "A" | "A+" 
    | "-S" | "S" | "S+" 
    | "-SS" | "SS" | "SS+" 
    | "-SSS" | "SSS" | "SSS+" 
    | "EX";

export interface UnitStatSheet {
    HP: StatLetter;
    ATK: StatLetter;
    DEF: StatLetter;
    CD: StatLetter;
    SPD: StatLetter;
    RNG: StatLetter;
    CRIT: StatLetter;
}

export interface InventoryUnit {
    uuid: string; // Identificador único de la tropa
    characterId: string; // ej: "absolute-swordmaster"
    level: number;
    stats: UnitStatSheet;

    // TODO (Fase Avanzada): Descomentar para sistemas de Gacha/Traits
    // stars: number;
    // traitId?: string;
    // isShiny: boolean;
    // isRadiant: boolean;
}

export interface PlayerDataSchema {
    gold: number;
    gems: number;
    accountXp: number;
    militaryRank: number;
    inventory: InventoryUnit[];
    equippedDeck: string[]; // Mazo de 12 espacios (strings de UUIDs o "" para vacíos)
}