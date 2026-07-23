import { Players, UserInputService } from "@rbxts/services";

export type UnitCategory = "Vanguard" | "Rampart";

export interface EquippedUnit {
	id: string;
	name: string;
	category: UnitCategory;
	cost?: number; // Costo dinámico por tropa (opcional)
}

export class DeploymentHotbar {
	private screenGui: ScreenGui;
	private mainFrame: Frame;

	private vanguardFrame: Frame;
	private rampartFrame: Frame;
	private switchButton: TextButton;

	private vanguardButtons: TextButton[] = [];
	private rampartButtons: TextButton[] = [];

	private activeDeck: UnitCategory = "Vanguard";
	private deployedIndexes = new Set<number>();
	private selectedIndex: number | undefined = undefined;

	private equippedUnits: Map<number, EquippedUnit> = new Map();

	// Callback para avisar al controlador
	public onUnitSelected?: (index: number) => void;

	private keyBinds: Enum.KeyCode[] = [
		Enum.KeyCode.One,
		Enum.KeyCode.Two,
		Enum.KeyCode.Three,
		Enum.KeyCode.Four,
		Enum.KeyCode.Five,
		Enum.KeyCode.Six,
	];

	constructor() {
		const player = Players.LocalPlayer;
		const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;

		this.screenGui = new Instance("ScreenGui");
		this.screenGui.Name = "DeploymentGui";
		this.screenGui.ResetOnSpawn = false;

		this.mainFrame = new Instance("Frame");
		this.mainFrame.Name = "HotbarFrame";
		this.mainFrame.Size = new UDim2(0, 540, 0, 102); // 🟢 102px para dar colchón inferior simétrico
		this.mainFrame.Position = new UDim2(0.5, -270, 1, -120);
		this.mainFrame.BackgroundColor3 = new Color3(0.1, 0.1, 0.12);
		this.mainFrame.BackgroundTransparency = 0.2;
		this.mainFrame.BorderSizePixel = 0;
		this.mainFrame.Parent = this.screenGui;

		const frameCorner = new Instance("UICorner");
		frameCorner.CornerRadius = new UDim(0, 12);
		frameCorner.Parent = this.mainFrame;

		this.vanguardFrame = this.createDeckContainer("VanguardFrame");
		this.rampartFrame = this.createDeckContainer("RampartFrame");

		this.vanguardButtons = this.generateDeckButtons(this.vanguardFrame, 0, "Vanguard");
		this.rampartButtons = this.generateDeckButtons(this.rampartFrame, 6, "Rampart");

		this.switchButton = new Instance("TextButton");
		this.switchButton.Name = "SwitchDeckBtn";
		this.switchButton.Size = new UDim2(0, 58, 0, 68);
		this.switchButton.Position = new UDim2(1, -68, 0.5, -34); // Centrado vertical
		this.switchButton.BackgroundColor3 = new Color3(0.25, 0.45, 0.85);
		this.switchButton.Text = "SWAP\nQ";
		this.switchButton.TextColor3 = new Color3(1, 1, 1);
		this.switchButton.TextSize = 13;
		this.switchButton.Font = Enum.Font.GothamBold;
		this.switchButton.BorderSizePixel = 0;
		this.switchButton.ZIndex = 10;
		this.switchButton.Parent = this.mainFrame;

		const switchCorner = new Instance("UICorner");
		switchCorner.CornerRadius = new UDim(0, 8);
		switchCorner.Parent = this.switchButton;

		this.switchButton.Activated.Connect(() => this.toggleDeck());

		UserInputService.InputBegan.Connect((input, gameProcessed) => {
			if (gameProcessed) return;

			if (input.KeyCode === Enum.KeyCode.Q) {
				this.toggleDeck();
				return;
			}

			for (let i = 0; i < this.keyBinds.size(); i++) {
				if (input.KeyCode === this.keyBinds[i]) {
					const actualIndex = this.activeDeck === "Vanguard" ? i : i + 6;
					this.triggerUnitSelection(actualIndex);
					break;
				}
			}
		});

		this.screenGui.Parent = playerGui;
		this.updateDeckStacking();
	}

	private createDeckContainer(name: string): Frame {
		const container = new Instance("Frame");
		container.Name = name;
		container.Size = new UDim2(0, 450, 0, 70);
		container.BackgroundTransparency = 1;
		container.Parent = this.mainFrame;

		const layout = new Instance("UIListLayout");
		layout.FillDirection = Enum.FillDirection.Horizontal;
		layout.HorizontalAlignment = Enum.HorizontalAlignment.Left;
		layout.VerticalAlignment = Enum.VerticalAlignment.Center;
		layout.SortOrder = Enum.SortOrder.LayoutOrder;
		layout.Padding = new UDim(0, 8);
		layout.Parent = container;

		return container;
	}

	private generateDeckButtons(
		parentContainer: Frame,
		startIndex: number,
		category: UnitCategory,
	): TextButton[] {
		const buttonList: TextButton[] = [];

		for (let offset = 0; offset < 6; offset++) {
			const index = startIndex + offset;

			const btn = new Instance("TextButton");
			btn.Name = `UnitButton_${index}`;
			btn.LayoutOrder = offset;
			btn.Size = new UDim2(0, 66, 0, 66);
			btn.BackgroundColor3 =
				category === "Vanguard"
					? new Color3(0.18, 0.2, 0.25)
					: new Color3(0.25, 0.18, 0.22);
			btn.Text = `Unit ${offset + 1}`;
			btn.TextColor3 = new Color3(1, 1, 1);
			btn.TextSize = 10;
			btn.Font = Enum.Font.GothamBold;
			btn.BorderSizePixel = 0;
			btn.TextYAlignment = Enum.TextYAlignment.Top;
			btn.Parent = parentContainer;

			const padding = new Instance("UIPadding");
			padding.PaddingTop = new UDim(0, 8);
			padding.Parent = btn;

			const btnCorner = new Instance("UICorner");
			btnCorner.CornerRadius = new UDim(0, 8);
			btnCorner.Parent = btn;

			const stroke = new Instance("UIStroke");
			stroke.Name = "SelectionStroke";
			stroke.Color = new Color3(0.4, 1, 0.5);
			stroke.Thickness = 2;
			stroke.Enabled = false;
			stroke.Parent = btn;

			const costLabel = new Instance("TextLabel");
			costLabel.Name = "CostLabel";
			costLabel.Size = new UDim2(1, 0, 0.4, 0);
			costLabel.Position = new UDim2(0, 0, 0.6, -4);
			costLabel.BackgroundTransparency = 1;
			costLabel.Text = "150g";
			costLabel.TextColor3 = new Color3(0.2, 0.9, 0.3);
			costLabel.TextSize = 12;
			costLabel.Font = Enum.Font.GothamBold;
			costLabel.TextXAlignment = Enum.TextXAlignment.Center;
			costLabel.TextYAlignment = Enum.TextYAlignment.Center;
			costLabel.ZIndex = btn.ZIndex + 1;
			costLabel.Parent = btn;

			btn.Activated.Connect(() => {
				this.triggerUnitSelection(index);
			});

			buttonList.push(btn);
		}

		return buttonList;
	}

	public toggleDeck(): void {
		this.activeDeck = this.activeDeck === "Vanguard" ? "Rampart" : "Vanguard";
		this.updateDeckStacking();
	}

	private updateDeckStacking(): void {
		if (this.activeDeck === "Vanguard") {
			this.vanguardFrame.Position = new UDim2(0, 12, 0, 22);
			this.vanguardFrame.ZIndex = 5;

			this.rampartFrame.Position = new UDim2(0, 20, 0, 8);
			this.rampartFrame.ZIndex = 2;

			this.switchButton.BackgroundColor3 = new Color3(0.2, 0.6, 0.3);
		} else {
			this.rampartFrame.Position = new UDim2(0, 12, 0, 22);
			this.rampartFrame.ZIndex = 5;

			this.vanguardFrame.Position = new UDim2(0, 20, 0, 8);
			this.vanguardFrame.ZIndex = 2;

			this.switchButton.BackgroundColor3 = new Color3(0.7, 0.3, 0.3);
		}

		this.updateVisuals();
	}

	public setEquippedUnits(unitsMap: Map<number, EquippedUnit>): void {
		this.equippedUnits = unitsMap;
		this.updateVisuals();
	}

	private triggerUnitSelection(index: number): void {
		if (this.deployedIndexes.has(index)) return;

		this.selectedIndex = index;
		this.updateVisuals();

		if (this.onUnitSelected) {
			this.onUnitSelected(index);
		}
	}

	public markUnitAsDeployed(index: number): void {
		this.deployedIndexes.add(index);
		if (this.selectedIndex === index) {
			this.selectedIndex = undefined;
		}
		this.updateVisuals();
	}

	public clearSelection(): void {
		this.selectedIndex = undefined;
		this.updateVisuals();
	}

	private updateVisuals(): void {
		const allButtons = [...this.vanguardButtons, ...this.rampartButtons];

		for (let index = 0; index < allButtons.size(); index++) {
			const btn = allButtons[index];
			const stroke = btn.FindFirstChild("SelectionStroke") as UIStroke | undefined;
			const costLabel = btn.FindFirstChild("CostLabel") as TextLabel | undefined;
			const isDeployed = this.deployedIndexes.has(index);
			const isSelected = this.selectedIndex === index;
			const unit = this.equippedUnits.get(index);

			const isVanguard = index <= 5;
			const isCurrentDeckBtn =
				(this.activeDeck === "Vanguard" && isVanguard) ||
				(this.activeDeck === "Rampart" && !isVanguard);

			const baseZIndex = isCurrentDeckBtn ? 6 : 3;
			btn.ZIndex = baseZIndex;

			if (costLabel) {
				costLabel.ZIndex = baseZIndex + 1;
				const costValue = unit?.cost ?? 150;
				costLabel.Text = `${costValue}g`;
			}

			const slotNumber = (index % 6) + 1;
			const labelText = unit ? unit.name : `Unit ${slotNumber}`;

			if (isDeployed) {
				btn.BackgroundColor3 = new Color3(0.08, 0.08, 0.1);
				btn.TextColor3 = new Color3(0.4, 0.4, 0.4);
				btn.Text = "DESPLEGADO";
				btn.TextYAlignment = Enum.TextYAlignment.Center;
				btn.AutoButtonColor = false;
				if (stroke) stroke.Enabled = false;
				if (costLabel) costLabel.Visible = false;
			} else if (isSelected) {
				btn.BackgroundColor3 = new Color3(0.2, 0.6, 0.3);
				btn.TextColor3 = new Color3(1, 1, 1);
				btn.Text = labelText;
				btn.TextYAlignment = Enum.TextYAlignment.Top;
				btn.AutoButtonColor = true;
				if (stroke) stroke.Enabled = true;
				if (costLabel) {
					costLabel.Visible = true;
					costLabel.TextColor3 = new Color3(1, 1, 1);
				}
			} else {
				btn.BackgroundColor3 = isVanguard
					? new Color3(0.18, 0.2, 0.25)
					: new Color3(0.25, 0.18, 0.22);

				btn.BackgroundTransparency = isCurrentDeckBtn ? 0 : 0.4;
				btn.TextColor3 = isCurrentDeckBtn ? new Color3(1, 1, 1) : new Color3(0.6, 0.6, 0.6);
				btn.Text = labelText;
				btn.TextYAlignment = Enum.TextYAlignment.Top;
				btn.AutoButtonColor = isCurrentDeckBtn;
				if (stroke) stroke.Enabled = false;
				if (costLabel) {
					costLabel.Visible = true;
					costLabel.TextColor3 = isCurrentDeckBtn
						? new Color3(0.2, 0.9, 0.3)
						: new Color3(0.15, 0.6, 0.25);
				}
			}
		}
	}

	public destroy(): void {
		this.screenGui.Destroy();
	}
}