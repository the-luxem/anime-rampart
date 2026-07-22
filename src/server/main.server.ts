import { Players, Workspace } from "@rbxts/services";
import { PlayerDataService } from "./services/PlayerDataService";
import { CHARACTERS_REGISTRY } from "shared/configs/Characters";
import AbsoluteSwordmaster from "./classes/AbsoluteSwordMaster";
import { InventoryUnit } from "shared/types/PlayerData";

Players.PlayerAdded.Connect((player) => {
	PlayerDataService.onPlayerAdded(player);

	task.delay(3, () => {
		// 1. Crear la carpeta Enemies y un Dummy si no existen
		let enemiesFolder = Workspace.FindFirstChild("Enemies") as Folder;
		if (!enemiesFolder) {
			enemiesFolder = new Instance("Folder");
			enemiesFolder.Name = "Enemies";
			enemiesFolder.Parent = Workspace;
		}

		// Crear enemigo de prueba a 5 studs de distancia (rango de la tropa es 8)
		const dummy = new Instance("Model");
		dummy.Name = "Goblin_Prueba";
		
		const part = new Instance("Part");
		part.Size = new Vector3(2, 4, 2);
		part.Position = new Vector3(0, 5, 5); // x=0, y=5, z=5
		part.Anchored = true;
		part.Parent = dummy;
		dummy.PrimaryPart = part;
		dummy.Parent = enemiesFolder;

		// 2. Spawnear la tropa física en (0, 5, 0)
		const unitModel = new Instance("Model");
		unitModel.Name = "AbsoluteSwordmaster_Unit";
		const unitPart = new Instance("Part");
		unitPart.Size = new Vector3(2, 4, 2);
		unitPart.Position = new Vector3(0, 5, 0);
		unitPart.BrickColor = new BrickColor("Bright red");
		unitPart.Anchored = true;
		unitPart.Parent = unitModel;
		unitModel.PrimaryPart = unitPart;
		unitModel.Parent = Workspace;

		// 3. Instanciar la clase de la tropa y arrancar su Combat Loop
		const testUnitData: InventoryUnit = {
			uuid: "test-swordmaster-combat",
			characterId: "absolute-swordmaster",
			level: 1,
			stats: { HP: "C", ATK: "S", DEF: "C", CD: "B", SPD: "C", RNG: "C", CRIT: "C" },
		};

		const swordmaster = new AbsoluteSwordmaster(
			testUnitData,
			CHARACTERS_REGISTRY["absolute-swordmaster"],
			unitModel
		);

		print(`[Combat Test] Tropa instanciada. Iniciando loop de combate...`);
		swordmaster.startCombatLoop();
	});
});

Players.PlayerRemoving.Connect((player) => PlayerDataService.onPlayerRemoving(player));

for (const player of Players.GetPlayers()) {
	PlayerDataService.onPlayerAdded(player);
}

print("[Anime Rampart Server] Servidor iniciado correctamente.");
