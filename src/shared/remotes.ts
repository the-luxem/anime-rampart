import { ReplicatedStorage } from "@rbxts/services";

let remotesFolder = ReplicatedStorage.FindFirstChild("Remotes") as Folder;
if (!remotesFolder) {
	remotesFolder = new Instance("Folder");
	remotesFolder.Name = "Remotes";
	remotesFolder.Parent = ReplicatedStorage;
}

// Evento Cliente -> Servidor (Solicitar colocación)
let spawnRequestEvent = remotesFolder.FindFirstChild("RequestUnitSpawn") as RemoteEvent;
if (!spawnRequestEvent) {
	spawnRequestEvent = new Instance("RemoteEvent");
	spawnRequestEvent.Name = "RequestUnitSpawn";
	spawnRequestEvent.Parent = remotesFolder;
}

// Evento Servidor -> Cliente (Confirmación de despliegue exitoso)
let confirmDeployedEvent = remotesFolder.FindFirstChild("ConfirmUnitDeployed") as RemoteEvent;
if (!confirmDeployedEvent) {
	confirmDeployedEvent = new Instance("RemoteEvent");
	confirmDeployedEvent.Name = "ConfirmUnitDeployed";
	confirmDeployedEvent.Parent = remotesFolder;
}

export const RequestUnitSpawnEvent = spawnRequestEvent;
export const ConfirmUnitDeployedEvent = confirmDeployedEvent;