export type StatLetter = 
    | "-F" | "F" | "F+" 
    | "-E" | "E" | "E+" 
    | "-D" | "D" | "D+" 
    | "-C" | "C" | "C+" 
    | "-B" | "B" | "B+" 
    | "-A" | "A" | "A+" 
    | "-S" | "S" | "S+" 
    | "SS" | "SS+" | "SSS" | "SSS+" | "EX";

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
    characterId: string; // ej: "hell-architect"
    level: number;
    stars: number;
    stats: UnitStatSheet;
    traitId?: string;
    isShiny: boolean;
    isRadiant: boolean;
}

export interface PlayerDataSchema {
    gold: number;
    gems: number;
    accountXp: number;
    militaryRank: number;
    inventory: InventoryUnit[];
    equippedDeck: (string | undefined)[]; // Mazo activo de 12 tropas (6 Piso + 6 Muralla)
}