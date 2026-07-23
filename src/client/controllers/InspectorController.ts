import { Players, UserInputService, Workspace } from "@rbxts/services";
import { UnitInspectorUI } from "../ui/UnitInspectorUI";
import { SellUnitRequestEvent } from "shared/remotes";

const localPlayer = Players.LocalPlayer;
const camera = Workspace.CurrentCamera;

export class InspectorController {
	private static ui: UnitInspectorUI;
	private static selectedUnitModel: Model | undefined = undefined;
	private static rangeCirclePart: Part | undefined = undefined;

	public static init(): void {
		InspectorController.ui = new UnitInspectorUI();

		InspectorController.ui.onCloseRequested = () => {
			InspectorController.deselect();
		};

		// 🟢 Guardamos la referencia directa de la unidad a vender
		InspectorController.ui.onSellRequested = () => {
			const unitToSell = InspectorController.selectedUnitModel;
			if (unitToSell) {
				print("[InspectorController] 🚀 Enviando petición de venta para:", unitToSell.Name);
				SellUnitRequestEvent.FireServer(unitToSell);
				InspectorController.deselect();
			} else {
				warn("[InspectorController] ❌ Intento de venta fallido: selectedUnitModel es undefined.");
			}
		};

		UserInputService.InputBegan.Connect((input, gameProcessed) => {
			// Si el clic fue procesado por elementos de la UI, ignoramos el raycast 3D
			if (gameProcessed) return;

			if (input.UserInputType === Enum.UserInputType.MouseButton1) {
				task.defer(() => {
					InspectorController.checkSelection();
				});
			}
		});

		print("[InspectorController] Controlador de inspección listo.");
	}

	private static checkSelection(): void {
		if (!camera) return;

		const mousePos = UserInputService.GetMouseLocation();
		const unitRay = camera.ViewportPointToRay(mousePos.X, mousePos.Y);

		const raycastParams = new RaycastParams();
		raycastParams.FilterType = Enum.RaycastFilterType.Exclude;

		const ignoreList: Instance[] = [];
		if (localPlayer.Character) ignoreList.push(localPlayer.Character);
		if (InspectorController.rangeCirclePart) ignoreList.push(InspectorController.rangeCirclePart);
		raycastParams.FilterDescendantsInstances = ignoreList;

		const result = Workspace.Raycast(unitRay.Origin, unitRay.Direction.mul(500), raycastParams);

		if (result && result.Instance) {
			const hitInstance = result.Instance;
			const unitModel = hitInstance.FindFirstAncestorOfClass("Model");

			if (unitModel && (unitModel.FindFirstChildOfClass("Humanoid") || unitModel.PrimaryPart)) {
				const ownerId = unitModel.GetAttribute("OwnerUserId");

				if (ownerId === undefined || ownerId === localPlayer.UserId) {
					InspectorController.selectUnit(unitModel);
					return;
				}
			}
		}

		// Si hizo clic en terreno neutro fuera de UI y tropas
		InspectorController.deselect();
	}

	private static selectUnit(unitModel: Model): void {
		InspectorController.selectedUnitModel = unitModel;

		const name = (unitModel.GetAttribute("UnitName") as string) ?? unitModel.Name;
		const category = (unitModel.GetAttribute("Category") as string) ?? "Vanguard";
		const element = (unitModel.GetAttribute("Element") as string) ?? "Fire";
		const level = (unitModel.GetAttribute("Level") as number) ?? 1;
		const range = (unitModel.GetAttribute("FinalRange") as number) ?? 12;
		const cost = (unitModel.GetAttribute("DeployCost") as number) ?? 150;
		const refund = math.floor(cost * 0.5);

		const statsData = [
			{ name: "HP", val: `${unitModel.GetAttribute("FinalHP") ?? 150} (A)` },
			{ name: "ATK", val: `${unitModel.GetAttribute("FinalATK") ?? 45} (S)` },
			{ name: "DEF", val: `${unitModel.GetAttribute("FinalDEF") ?? 10} (B)` },
			{ name: "CD", val: `${unitModel.GetAttribute("FinalCD") ?? 1.5}s (A)` },
			{ name: "RNG", val: `${range} (S)` },
			{ name: "SPD", val: `${unitModel.GetAttribute("FinalSPD") ?? 16} (C)` },
		];

		InspectorController.ui.show({
			name: name,
			category: category,
			element: element,
			level: level,
			refundGold: refund,
			stats: statsData,
		});

		InspectorController.drawRangeCircle(unitModel, range);
	}

	private static drawRangeCircle(unitModel: Model, rangeRadius: number): void {
		if (!InspectorController.rangeCirclePart) {
			const circle = new Instance("Part");
			circle.Name = "RangeCirclePreview";
			circle.Shape = Enum.PartType.Cylinder;
			circle.Material = Enum.Material.Neon;
			circle.Color = Color3.fromRGB(80, 200, 255);
			circle.Transparency = 0.7;
			circle.CanCollide = false;
			circle.CanTouch = false;
			circle.CanQuery = false;
			circle.Anchored = true;
			circle.Parent = Workspace;
			InspectorController.rangeCirclePart = circle;
		}

		const primary = unitModel.PrimaryPart ?? (unitModel.FindFirstChild("HumanoidRootPart") as BasePart | undefined);
		if (primary) {
			const diameter = rangeRadius * 2;
			InspectorController.rangeCirclePart.Size = new Vector3(0.1, diameter, diameter);
			InspectorController.rangeCirclePart.CFrame = new CFrame(
				primary.Position.X,
				primary.Position.Y - 1.8,
				primary.Position.Z,
			).mul(CFrame.Angles(0, 0, math.rad(90)));
			InspectorController.rangeCirclePart.Transparency = 0.7;
		}
	}

	public static deselect(): void {
		InspectorController.selectedUnitModel = undefined;
		InspectorController.ui.hide();

		if (InspectorController.rangeCirclePart) {
			InspectorController.rangeCirclePart.Transparency = 1;
		}
	}
}