import { ReplicatedStorage } from "@rbxts/services";

let remotesFolder = ReplicatedStorage.FindFirstChild("Remotes") as Folder;
if (!remotesFolder) {
	remotesFolder = new Instance("Folder");
	remotesFolder.Name = "Remotes";
	remotesFolder.Parent = ReplicatedStorage;
}

// 1. Petición Spawn Cliente -> Servidor
let spawnRequestEvent = remotesFolder.FindFirstChild("RequestUnitSpawn") as RemoteEvent;
if (!spawnRequestEvent) {
	spawnRequestEvent = new Instance("RemoteEvent");
	spawnRequestEvent.Name = "RequestUnitSpawn";
	spawnRequestEvent.Parent = remotesFolder;
}

// 2. Confirmación Spawn Servidor -> Cliente
let confirmDeployedEvent = remotesFolder.FindFirstChild("ConfirmUnitDeployed") as RemoteEvent;
if (!confirmDeployedEvent) {
	confirmDeployedEvent = new Instance("RemoteEvent");
	confirmDeployedEvent.Name = "ConfirmUnitDeployed";
	confirmDeployedEvent.Parent = remotesFolder;
}

// 3. Sincronización de Oro Servidor -> Cliente
let goldUpdateEvent = remotesFolder.FindFirstChild("GoldUpdate") as RemoteEvent;
if (!goldUpdateEvent) {
	goldUpdateEvent = new Instance("RemoteEvent");
	goldUpdateEvent.Name = "GoldUpdate";
	goldUpdateEvent.Parent = remotesFolder;
}

// 4. Petición Vender Unidad Cliente -> Servidor
let sellUnitRequestEvent = remotesFolder.FindFirstChild("SellUnitRequest") as RemoteEvent;
if (!sellUnitRequestEvent) {
	sellUnitRequestEvent = new Instance("RemoteEvent");
	sellUnitRequestEvent.Name = "SellUnitRequest";
	sellUnitRequestEvent.Parent = remotesFolder;
}

// 5. Confirmación Unidad Liberada Servidor -> Cliente
let unitFreedEvent = remotesFolder.FindFirstChild("ConfirmUnitFreed") as RemoteEvent;
if (!unitFreedEvent) {
	unitFreedEvent = new Instance("RemoteEvent");
	unitFreedEvent.Name = "ConfirmUnitFreed";
	unitFreedEvent.Parent = remotesFolder;
}

export const RequestUnitSpawnEvent = spawnRequestEvent;
export const ConfirmUnitDeployedEvent = confirmDeployedEvent;
export const GoldUpdateEvent = goldUpdateEvent;
export const SellUnitRequestEvent = sellUnitRequestEvent;
export const ConfirmUnitFreedEvent = unitFreedEvent;