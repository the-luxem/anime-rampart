import { ReplicatedStorage } from "@rbxts/services";

let remotesFolder = ReplicatedStorage.FindFirstChild("Remotes") as Folder;
if (!remotesFolder) {
	remotesFolder = new Instance("Folder");
	remotesFolder.Name = "Remotes";
	remotesFolder.Parent = ReplicatedStorage;
}

// 1. Petición Cliente -> Servidor
let spawnRequestEvent = remotesFolder.FindFirstChild("RequestUnitSpawn") as RemoteEvent;
if (!spawnRequestEvent) {
	spawnRequestEvent = new Instance("RemoteEvent");
	spawnRequestEvent.Name = "RequestUnitSpawn";
	spawnRequestEvent.Parent = remotesFolder;
}

// 2. Confirmación Servidor -> Cliente
let confirmDeployedEvent = remotesFolder.FindFirstChild("ConfirmUnitDeployed") as RemoteEvent;
if (!confirmDeployedEvent) {
	confirmDeployedEvent = new Instance("RemoteEvent");
	confirmDeployedEvent.Name = "ConfirmUnitDeployed";
	confirmDeployedEvent.Parent = remotesFolder;
}

// 3. Sincronización de Oro Servidor -> Cliente 👈 (NUEVO)
let goldUpdateEvent = remotesFolder.FindFirstChild("GoldUpdate") as RemoteEvent;
if (!goldUpdateEvent) {
	goldUpdateEvent = new Instance("RemoteEvent");
	goldUpdateEvent.Name = "GoldUpdate";
	goldUpdateEvent.Parent = remotesFolder;
}

export const RequestUnitSpawnEvent = spawnRequestEvent;
export const ConfirmUnitDeployedEvent = confirmDeployedEvent;
export const GoldUpdateEvent = goldUpdateEvent;