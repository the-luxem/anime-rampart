import { Players } from "@rbxts/services";

export class UnitInspectorUI {
	private screenGui: ScreenGui;
	private mainFrame: Frame;
	private nameLabel: TextLabel;
	private infoBadgeLabel: TextLabel;
	private statsLabels = new Map<string, TextLabel>();
	private sellButton: TextButton;
	private upgradeButton: TextButton;

	public onCloseRequested?: () => void;
	public onSellRequested?: () => void;

	constructor() {
		const player = Players.LocalPlayer;
		const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;

		this.screenGui = new Instance("ScreenGui");
		this.screenGui.Name = "UnitInspectorGui";
		this.screenGui.ResetOnSpawn = false;
		this.screenGui.Parent = playerGui;

		// Panel Principal Lateral Izquierdo
		this.mainFrame = new Instance("Frame");
		this.mainFrame.Name = "InspectorFrame";
		this.mainFrame.Size = new UDim2(0, 240, 0, 360);
		this.mainFrame.Position = new UDim2(0, 20, 0.5, -180); // Centrado vertical a la izquierda
		this.mainFrame.BackgroundColor3 = Color3.fromRGB(20, 22, 28);
		this.mainFrame.BorderSizePixel = 0;
		this.mainFrame.Visible = false;
		this.mainFrame.Parent = this.screenGui;

		const corner = new Instance("UICorner");
		corner.CornerRadius = new UDim(0, 12);
		corner.Parent = this.mainFrame;

		const stroke = new Instance("UIStroke");
		stroke.Color = Color3.fromRGB(50, 55, 70);
		stroke.Thickness = 2;
		stroke.Parent = this.mainFrame;

		// Botón Cerrar (X)
		const closeBtn = new Instance("TextButton");
		closeBtn.Size = new UDim2(0, 28, 0, 28);
		closeBtn.Position = new UDim2(1, -34, 0, 8);
		closeBtn.BackgroundColor3 = Color3.fromRGB(180, 50, 50);
		closeBtn.Text = "✕";
		closeBtn.TextColor3 = Color3.fromRGB(255, 255, 255);
		closeBtn.TextSize = 14;
		closeBtn.Font = Enum.Font.GothamBold;
		closeBtn.BorderSizePixel = 0;
		closeBtn.Parent = this.mainFrame;

		const closeCorner = new Instance("UICorner");
		closeCorner.CornerRadius = new UDim(0, 6);
		closeCorner.Parent = closeBtn;

		closeBtn.Activated.Connect(() => {
			if (this.onCloseRequested) this.onCloseRequested();
		});

		// Nombre de la Tropa
		this.nameLabel = new Instance("TextLabel");
		this.nameLabel.Size = new UDim2(1, -50, 0, 30);
		this.nameLabel.Position = new UDim2(0, 12, 0, 8);
		this.nameLabel.BackgroundTransparency = 1;
		this.nameLabel.Font = Enum.Font.GothamBold;
		this.nameLabel.Text = "Unit Name";
		this.nameLabel.TextColor3 = Color3.fromRGB(255, 255, 255);
		this.nameLabel.TextSize = 15;
		this.nameLabel.TextXAlignment = Enum.TextXAlignment.Left;
		this.nameLabel.Parent = this.mainFrame;

		// Subtítulo (Rol + Elemento + Nivel)
		this.infoBadgeLabel = new Instance("TextLabel");
		this.infoBadgeLabel.Size = new UDim2(1, -24, 0, 20);
		this.infoBadgeLabel.Position = new UDim2(0, 12, 0, 38);
		this.infoBadgeLabel.BackgroundTransparency = 1;
		this.infoBadgeLabel.Font = Enum.Font.GothamMedium;
		this.infoBadgeLabel.Text = "Vanguard | Fire | Lv. 1";
		this.infoBadgeLabel.TextColor3 = Color3.fromRGB(160, 170, 190);
		this.infoBadgeLabel.TextSize = 11;
		this.infoBadgeLabel.TextXAlignment = Enum.TextXAlignment.Left;
		this.infoBadgeLabel.Parent = this.mainFrame;

		// Contenedor de las 6 Stats
		const statsContainer = new Instance("Frame");
		statsContainer.Size = new UDim2(1, -24, 0, 180);
		statsContainer.Position = new UDim2(0, 12, 0, 65);
		statsContainer.BackgroundColor3 = Color3.fromRGB(14, 15, 20);
		statsContainer.BorderSizePixel = 0;
		statsContainer.Parent = this.mainFrame;

		const statsCorner = new Instance("UICorner");
		statsCorner.CornerRadius = new UDim(0, 8);
		statsCorner.Parent = statsContainer;

		const statsList = ["HP", "ATK", "DEF", "CD", "RNG", "SPD"];
		for (let i = 0; i < statsList.size(); i++) {
			const statName = statsList[i];
			const statLabel = new Instance("TextLabel");
			statLabel.Size = new UDim2(1, -16, 0, 26);
			statLabel.Position = new UDim2(0, 8, 0, 5 + i * 28);
			statLabel.BackgroundTransparency = 1;
			statLabel.Font = Enum.Font.GothamBold;
			statLabel.Text = `${statName}: --`;
			statLabel.TextColor3 = Color3.fromRGB(220, 225, 235);
			statLabel.TextSize = 12;
			statLabel.TextXAlignment = Enum.TextXAlignment.Left;
			statLabel.Parent = statsContainer;

			this.statsLabels.set(statName, statLabel);
		}

		// Botón de Upgrade (Dummy)
		this.upgradeButton = new Instance("TextButton");
		this.upgradeButton.Size = new UDim2(1, -24, 0, 32);
		this.upgradeButton.Position = new UDim2(0, 12, 0, 255);
		this.upgradeButton.BackgroundColor3 = Color3.fromRGB(45, 50, 65);
		this.upgradeButton.Text = "MEJORAR (Lv. 2)";
		this.upgradeButton.TextColor3 = Color3.fromRGB(140, 150, 170);
		this.upgradeButton.TextSize = 12;
		this.upgradeButton.Font = Enum.Font.GothamBold;
		this.upgradeButton.BorderSizePixel = 0;
		this.upgradeButton.Parent = this.mainFrame;

		const upgCorner = new Instance("UICorner");
		upgCorner.CornerRadius = new UDim(0, 8);
		upgCorner.Parent = this.upgradeButton;

		// Botón de Desechar / Vender
		this.sellButton = new Instance("TextButton");
		this.sellButton.Size = new UDim2(1, -24, 0, 34);
		this.sellButton.Position = new UDim2(0, 12, 0, 295);
		this.sellButton.BackgroundColor3 = Color3.fromRGB(200, 60, 60);
		this.sellButton.Text = "DESECHAR (+75g)";
		this.sellButton.TextColor3 = Color3.fromRGB(255, 255, 255);
		this.sellButton.TextSize = 12;
		this.sellButton.Font = Enum.Font.GothamBold;
		this.sellButton.BorderSizePixel = 0;
		this.sellButton.Parent = this.mainFrame;

		const sellCorner = new Instance("UICorner");
		sellCorner.CornerRadius = new UDim(0, 8);
		sellCorner.Parent = this.sellButton;

		this.sellButton.Activated.Connect(() => {
			if (this.onSellRequested) this.onSellRequested();
		});
	}

	public show(data: {
		name: string;
		category: string;
		element: string;
		level: number;
		refundGold: number;
		stats: { name: string; val: string }[];
	}): void {
		this.nameLabel.Text = data.name;
		this.infoBadgeLabel.Text = `${data.category} | ${data.element} | Lv. ${data.level}`;
		this.sellButton.Text = `DESECHAR (+${data.refundGold}g)`;

		for (const stat of data.stats) {
			const label = this.statsLabels.get(stat.name);
			if (label) {
				label.Text = `${stat.name}:  ${stat.val}`;
			}
		}

		this.mainFrame.Visible = true;
	}

	public hide(): void {
		this.mainFrame.Visible = false;
	}
}