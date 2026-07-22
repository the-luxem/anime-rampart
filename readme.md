# Anime Rampant ⚔️

An action-focused Roblox game built with **TypeScript**, **roblox-ts**, and **Rojo**.

---

## 📋 Prerequisites

Ensure you have the following installed on your machine before getting started:
* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (LTS Version recommended)
* [Visual Studio Code](https://code.visualstudio.com/)
* [Rokit](https://github.com/rojo-rbx/rokit) (Toolchain manager)

---

## 🚀 Getting Started

Follow these steps to set up your local development environment:

1. **Clone the repository:**
   git clone <YOUR_REPOSITORY_URL>
   cd anime-rampant

2. **Install project tools (Rojo, Wally, etc.):**
rokit install

3. **Install TypeScript & Node dependencies:**
npm install

---

## 🛠️ Running the Project

To compile your code and sync it with Roblox Studio in real-time, execute these commands in **two separate terminal tabs**:

* **Terminal 1 (TypeScript Compiler Watcher):**
npm run watch

* **Terminal 2 (Rojo Sync Server):**
rojo serve

Once both processes are running:

1. Open your place file in **Roblox Studio**.
2. Open the **Rojo Plugin** and click **Connect**.

---

## 🌿 Git Flow Guidelines

To keep the codebase clean and stable, adhere to the following branching strategy:

* **`master`**: Production-ready code only. **Never commit directly to this branch.**
* **`develop`**: Integration branch for upcoming updates. **Never commit directly to this branch.**
* **`feature/<feature-name>`**: Branch out from `develop` for all new tasks, mechanics, or bug fixes.
* *Example:* `feature/combat-system`, `feature/player-data`

---

## ❓ Troubleshooting

* **TypeScript / Intellisense Errors in VS Code:**
* Open the Command Palette (`Ctrl + Shift + P`).
* Run **`TypeScript: Restart TS Server`**.
* Ensure VS Code is set to **Use Workspace Version** for TypeScript.


* **Terminal Busy / Cannot Type Commands:**
* `npm run watch` runs continuously in the background. Open a new terminal instance in VS Code by clicking the `+` button in the terminal panel.
