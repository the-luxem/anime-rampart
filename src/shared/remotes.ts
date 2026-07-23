import { ReplicatedStorage } from "@rbxts/services";

let remotesFolder = ReplicatedStorage.FindFirstChild("Remotes") as Folder;
if (!remotesFolder) {
	remotesFolder = new Instance("Folder");
	remotesFolder.Name = "Remotes";
	remotesFolder.Parent = ReplicatedStorage;
}

let spawnRequestEvent = remotesFolder.FindFirstChild("RequestUnitSpawn") as RemoteEvent;
if (!spawnRequestEvent) {
	spawnRequestEvent = new Instance("RemoteEvent");
	spawnRequestEvent.Name = "RequestUnitSpawn";
	spawnRequestEvent.Parent = remotesFolder;
}

export const RequestUnitSpawnEvent = spawnRequestEvent;