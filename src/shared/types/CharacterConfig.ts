export type CombatRole = "Tank" | "DPS" | "Sub-DPS" | "Support" | "Healer";
export type ElementType = "Water" | "Fire" | "Wind" | "Earth" | "Lightning" | "Holy" | "Dark" | "Normal";
export type UnitPlacement = "Vanguard" | "Rampart" | "Hybrid";

export interface CharacterConfig {
    readonly id: string;
    readonly name: string;
    readonly role: CombatRole;
    readonly element: ElementType;
    readonly placement: UnitPlacement;
    readonly baseHp: number;
    readonly baseAtk: number;
    readonly attackCooldown: number;
    readonly range: number;
    readonly growthPerLevel: number;
}