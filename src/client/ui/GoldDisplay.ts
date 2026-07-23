import { Players } from "@rbxts/services";

export class GoldDisplay {
	private screenGui: ScreenGui;
	private goldLabel: TextLabel;

	constructor() {
		const player = Players.LocalPlayer;
		const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;

		// Contenedor principal UI
		this.screenGui = new Instance("ScreenGui");
		this.screenGui.Name = "GoldDisplayGui";
		this.screenGui.ResetOnSpawn = false;
		this.screenGui.Parent = playerGui;

		// Frame contenedor del Oro
		const frame = new Instance("Frame");
		frame.Size = new UDim2(0, 160, 0, 45);
		frame.Position = new UDim2(0, 20, 0, 20); // Arriba a la izquierda
		frame.BackgroundColor3 = Color3.fromRGB(25, 25, 30);
		frame.BorderSizePixel = 0;
		frame.Parent = this.screenGui;

		const corner = new Instance("UICorner");
		corner.CornerRadius = new UDim(0, 8);
		corner.Parent = frame;

		const stroke = new Instance("UIStroke");
		stroke.Color = Color3.fromRGB(240, 180, 50);
		stroke.Thickness = 2;
		stroke.Parent = frame;

		// Ícono de Moneda / Texto
		const iconLabel = new Instance("TextLabel");
		iconLabel.Size = new UDim2(0, 40, 1, 0);
		iconLabel.BackgroundTransparency = 1;
		iconLabel.Text = "🪙";
		iconLabel.TextSize = 22;
		iconLabel.Parent = frame;

		// Texto con la cantidad de Oro
		this.goldLabel = new Instance("TextLabel");
		this.goldLabel.Size = new UDim2(1, -40, 1, 0);
		this.goldLabel.Position = new UDim2(0, 40, 0, 0);
		this.goldLabel.BackgroundTransparency = 1;
		this.goldLabel.Font = Enum.Font.BuilderSansBold;
		this.goldLabel.Text = "500";
		this.goldLabel.TextColor3 = Color3.fromRGB(255, 220, 100);
		this.goldLabel.TextSize = 20;
		this.goldLabel.TextXAlignment = Enum.TextXAlignment.Left;
		this.goldLabel.Parent = frame;
	}

	public updateGold(amount: number): void {
		this.goldLabel.Text = `${amount}`;
	}
}