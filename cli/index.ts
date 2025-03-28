import fs from "fs-extra";
import path from "path";
import axios from "axios";
import prompts from "prompts";
import chalk from "chalk";
import { execSync } from "child_process";

// Define component file structure
interface ComponentFile {
  filename: string;
  url: string;
}

// Define component dependencies
interface ComponentConfig {
  files: ComponentFile[];
  dependencies: string[];
  devDependencies: string[];
}

// Define available components with their files and dependencies
const components: Record<string, ComponentConfig> = {
  button: {
    files: [
      {
        filename: "Button.tsx",
        url: "https://raw.githubusercontent.com/arkia1/ARC-UI-LIB/main/components/button/Button.tsx",
      },
      {
        filename: "button-animations.css",
        url: "https://raw.githubusercontent.com/arkia1/ARC-UI-LIB/main/components/button/button-animations.css",
      },
    ],
    dependencies: ["clsx"],
    devDependencies: [],
  },
};

// Validate if the user is in a valid project directory
function validateProjectDirectory() {
  const packageJsonPath = path.join(process.cwd(), "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    console.log(
      chalk.red(
        "❌ Could not find package.json. Please run this command in the root of a valid project directory."
      )
    );
    process.exit(1);
  }
}

// Install dependencies
async function installDependencies(deps: string[], dev: boolean = false) {
  if (deps.length === 0) return;

  const pm = fs.existsSync(path.join(process.cwd(), "yarn.lock"))
    ? "yarn"
    : fs.existsSync(path.join(process.cwd(), "pnpm-lock.yaml"))
    ? "pnpm"
    : "npm";

  const command =
    pm === "npm"
      ? `npm install ${dev ? "--save-dev" : ""} ${deps.join(" ")}`
      : pm === "yarn"
      ? `yarn add ${dev ? "--dev" : ""} ${deps.join(" ")}`
      : `pnpm add ${dev ? "--save-dev" : ""} ${deps.join(" ")}`;

  console.log(chalk.blue(`Installing dependencies...`));
  try {
    execSync(command, { stdio: "inherit" });
    console.log(chalk.green(`Dependencies installed successfully.`));
  } catch (error) {
    console.log(
      chalk.red(`Failed to install dependencies. Please install them manually:`)
    );
    console.log(chalk.yellow(`  ${command}`));
  }
}

// Fetch and save component files
async function fetchComponent(componentName: string, targetDir: string) {
  const component = components[componentName];

  if (!component) {
    console.log(chalk.red(`Component \"${componentName}\" not found.`));
    return;
  }

  // Create the target directory if it doesn't exist
  const componentDir = path.join(targetDir, componentName);
  await fs.ensureDir(componentDir);

  console.log(chalk.blue(`Adding ${componentName} component...`));

  // Process each file in the component
  for (const file of component.files) {
    const destPath = path.join(componentDir, file.filename);

    try {
      const response = await axios.get(file.url);
      await fs.writeFile(destPath, response.data);
      console.log(chalk.green(`  ✓ Added ${file.filename}`));
    } catch (error) {
      console.log(
        chalk.red(
          `  ✗ Failed to add ${file.filename}: ${(error as Error).message}`
        )
      );
    }
  }

  // Install dependencies
  await installDependencies(component.dependencies);
  await installDependencies(component.devDependencies, true);

  console.log(
    chalk.green(`\n✅ ${componentName} component has been added successfully!`)
  );

  // Update the general index.ts file in the target directory
  const generalIndexPath = path.join(targetDir, "index.ts");
  const exportStatement = `export { default as ${componentName.charAt(0).toUpperCase() + componentName.slice(1)} } from './${componentName}/${componentName.charAt(0).toUpperCase() + componentName.slice(1)}';\n`;

  try {
    await fs.appendFile(generalIndexPath, exportStatement);
    console.log(chalk.green(`  ✓ Updated general index.ts with ${componentName}`));
  } catch (error) {
    console.log(
      chalk.red(
        `  ✗ Failed to update general index.ts: ${(error as Error).message}`
      )
    );
  }
}

// CLI prompt
(async () => {
  // Validate the project directory
  validateProjectDirectory();

  // Prompt the user for the target directory
  const { targetDir } = await prompts({
    type: "text",
    name: "targetDir",
    message:
      "Enter the directory where you want to add the components (e.g., src/components):",
    initial: "src/components",
  });

  // Ensure the target directory exists
  await fs.ensureDir(targetDir);

  // Prompt the user to select a component
  const response = await prompts({
    type: "select",
    name: "component",
    message: "Which component do you want to add?",
    choices: Object.keys(components).map((comp) => ({
      title: comp,
      value: comp,
    })),
  });

  if (response.component) {
    await fetchComponent(response.component, targetDir);
  }
})();
