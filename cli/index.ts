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
  format?: "tsx" | "jsx" 
}

// Define component dependencies
interface ComponentConfig {
  files: ComponentFile[];
  dependencies: string[];
  devDependencies: string[];
  requiresTailwind?: boolean; // Add flag for components that require Tailwind
}

// Define template file structure (same as component structure)
interface TemplateFile {
  filename: string;
  url: string;
  format?: "tsx" | "jsx" 
}

// Define template dependencies
interface TemplateConfig {
  files: TemplateFile[];
  dependencies: string[];
  devDependencies: string[];
  requiresTailwind?: boolean;
  category?: string; // Optional category for organizing templates
}

// Extend components with toaster if needed
const components: Record<string, ComponentConfig> = {
  button: {
    files: [
      {
        filename: "Button.tsx",
        url: "https://raw.githubusercontent.com/arkia1/ARC-UI-LIB/main/components/button/Button.tsx",
        format: "tsx",
      },
      {
        filename: "Button.jsx",
        url: "https://raw.githubusercontent.com/arkia1/ARC-UI-LIB/main/components/button/Button.jsx",
        format: "jsx",
      },
      {
        filename: "button-animations.css",
        url: "https://raw.githubusercontent.com/arkia1/ARC-UI-LIB/main/components/button/button-animations.css",
      },
    ],
    dependencies: ["clsx"],
    devDependencies: [],
    requiresTailwind: true, // Mark that Button requires Tailwind
  },
  toaster: {
    files: [
      {
        filename: "Toaster.jsx",
        url: "https://raw.githubusercontent.com/arkia1/ARC-UI-LIB/main/components/toaster/Toaster.jsx",
        format: "jsx",
      },
    ],
    dependencies: ["react-dom"], // Removed "styled-components"
    devDependencies: [],
    requiresTailwind: true,
  },
};

// Define available templates with their files and dependencies
const templates: Record<string, TemplateConfig> = {
  clientSideErrors: {
    files: [
      {
        filename: "ClientSideErrors.tsx",
        url: "https://raw.githubusercontent.com/arkia1/ARC-UI-LIB/main/templates/errors/ClientSideErrors/ClientSideErrors.tsx",
        format: "tsx",
      },
      {
        filename: "ClientSideErrors.jsx",
        url: "https://raw.githubusercontent.com/arkia1/ARC-UI-LIB/main/templates/errors/ClientSideErrors/ClientSideErrors.jsx",
        format: "jsx",
      },
    ],
    dependencies: [],
    devDependencies: [],
    requiresTailwind: true,
    category: "errors/4xx"
  },
  serverSideErrors: {
    files: [
      {
        filename: "ServerSideErrors.tsx",
        url: "https://raw.githubusercontent.com/arkia1/ARC-UI-LIB/main/templates/errors/ServerSideErrors/ServerSideErrors.tsx",
        format: "tsx",
      },
      {
        filename: "ServerSideErrors.jsx",
        url: "https://raw.githubusercontent.com/arkia1/ARC-UI-LIB/main/templates/errors/ServerSideErrors/ServerSideErrors.jsx",
        format: "jsx",
      },
    ],
    dependencies: [],
    devDependencies: [],
    requiresTailwind: true,
    category: "errors/5xx"
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

// Check if Tailwind CSS is installed and configured
async function checkTailwindSetup() {
  console.log(chalk.blue("Checking Tailwind CSS setup..."));
  
  const packageJsonPath = path.join(process.cwd(), "package.json");
  const tailwindConfigPath = path.join(process.cwd(), "tailwind.config.js");
  const postcssConfigPath = path.join(process.cwd(), "postcss.config.js");
  
  let isTailwindInstalled = false;
  let isTailwindConfigured = false;
  
  // Check if Tailwind is installed
  try {
    const packageJson = await fs.readJson(packageJsonPath);
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    isTailwindInstalled = !!dependencies.tailwindcss;
    
    // Check what version if installed
    if (isTailwindInstalled) {
      const version = dependencies.tailwindcss;
      const isV3 = version.startsWith("^3") || version.startsWith("~3") || version.startsWith("3");
      
      if (!isV3) {
        console.log(chalk.yellow("⚠️ Found Tailwind CSS, but it's not version 3. ARC UI components are designed for Tailwind v3."));
        return false;
      }
    }
  } catch (error) {
    console.log(chalk.red("Error reading package.json:", (error as Error).message));
    return false;
  }
  
  // Check if Tailwind is configured
  isTailwindConfigured = fs.existsSync(tailwindConfigPath) && fs.existsSync(postcssConfigPath);
  
  if (!isTailwindInstalled) {
    console.log(chalk.yellow("⚠️ Tailwind CSS is not installed in this project."));
    return false;
  }
  
  if (!isTailwindConfigured) {
    console.log(chalk.yellow("⚠️ Tailwind CSS configuration files are missing."));
    return false;
  }
  
  console.log(chalk.green("✅ Tailwind CSS is properly installed and configured."));
  return true;
}

// Install and initialize Tailwind CSS according to official v3 docs
async function setupTailwind() {
  const pm = fs.existsSync(path.join(process.cwd(), "yarn.lock"))
    ? "yarn"
    : fs.existsSync(path.join(process.cwd(), "pnpm-lock.yaml"))
    ? "pnpm"
    : "npm";

  console.log(chalk.blue("Installing Tailwind CSS dependencies in your project..."));
  
  // Install Tailwind and related packages
  const installCmd = 
    pm === "npm" 
      ? "npm install -D tailwindcss@3 postcss autoprefixer"
      : pm === "yarn"
      ? "yarn add -D tailwindcss@3 postcss autoprefixer"
      : "pnpm add -D tailwindcss@3 postcss autoprefixer";
  
  try {
    execSync(installCmd, { stdio: "inherit", cwd: process.cwd() });
    console.log(chalk.green("✅ Tailwind CSS dependencies installed in your project."));
    
    // Instead of using npx, create the config files manually
    console.log(chalk.blue("Creating Tailwind CSS configuration files..."));
    
    // Create tailwind.config.js
    const tailwindConfigPath = path.join(process.cwd(), "tailwind.config.js");
    const tailwindConfigContent = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;

    // Create postcss.config.js
    const postcssConfigPath = path.join(process.cwd(), "postcss.config.js");
    const postcssConfigContent = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

    // Write the config files
    await fs.writeFile(tailwindConfigPath, tailwindConfigContent);
    await fs.writeFile(postcssConfigPath, postcssConfigContent);
    
    console.log(chalk.green("✅ Tailwind CSS configuration files created in your project."));
    
    // Create or update CSS file with Tailwind directives
    await createTailwindCSSFile();
    
    return true;
  } catch (error) {
    console.log(chalk.red(`Failed to setup Tailwind CSS: ${(error as Error).message}`));
    console.log(chalk.yellow(`
Please install and configure Tailwind CSS manually by following these steps:
1. Install dependencies: ${installCmd}
2. Create a tailwind.config.js file with the following content:
   /** @type {import('tailwindcss').Config} */
   export default {
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
      ],
      theme: {
      extend: {},
    },
    plugins: [],
  }

3. Create a postcss.config.js file with the following content:
   export default {
     plugins: {
       tailwindcss: {},
       autoprefixer: {},
     },
   }

4. Add Tailwind directives to your CSS file:
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
`));
    return false;
  }
}

// Helper function to create/update the CSS file with Tailwind directives
async function createTailwindCSSFile() {
  // Common paths for CSS files in different frameworks
  const possibleCssPaths = [
    "src/styles/globals.css",
    "src/styles/global.css",
    "src/index.css",
    "src/App.css",
    "styles/globals.css",
    "styles/global.css",
    "css/main.css"
  ];
  
  const tailwindDirectives = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;

  // First, try to find and update an existing CSS file
  for (const cssPath of possibleCssPaths) {
    const fullPath = path.join(process.cwd(), cssPath);
    if (fs.existsSync(fullPath)) {
      try {
        const cssContent = await fs.readFile(fullPath, "utf8");
        if (!cssContent.includes("@tailwind")) {
          // Add Tailwind directives at the beginning of the file
          await fs.writeFile(fullPath, tailwindDirectives + cssContent);
          console.log(chalk.green(`✅ Updated ${cssPath} with Tailwind directives.`));
          return;
        } else {
          console.log(chalk.green(`✅ ${cssPath} already has Tailwind directives.`));
          return;
        }
      } catch (error) {
        console.log(chalk.yellow(`⚠️ Error updating ${cssPath}: ${(error as Error).message}`));
      }
    }
  }
  
  // If no existing CSS file was found, create a new one
  // Ask user where to create the CSS file
  const { cssPath } = await prompts({
    type: "text",
    name: "cssPath",
    message: "Where should we create the CSS file with Tailwind directives in your project?",
    initial: "src/styles/global.css"
  });
  
  const fullPath = path.join(process.cwd(), cssPath);
  
  try {
    // Ensure directory exists
    await fs.ensureDir(path.dirname(fullPath));
    
    // Write Tailwind directives to the file
    await fs.writeFile(fullPath, tailwindDirectives);
    console.log(chalk.green(`✅ Created ${cssPath} with Tailwind directives in your project.`));
    
    // Inform user to import this CSS file
    console.log(chalk.blue(`
Remember to import '${cssPath}' in your main entry file (like index.js, App.js, etc.).
For example: import './${cssPath.replace(/^src\//, '')}'
`));
  } catch (error) {
    console.log(chalk.red(`Failed to create CSS file: ${(error as Error).message}`));
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

  console.log(chalk.blue(`Installing dependencies in your project...`));
  try {
    execSync(command, { stdio: "inherit", cwd: process.cwd() });
    console.log(chalk.green(`Dependencies installed successfully in your project.`));
  } catch (error) {
    console.log(
      chalk.red(`Failed to install dependencies. Please install them manually:`)
    );
    console.log(chalk.yellow(`  ${command}`));
  }
}

// Fetch and save component files
async function fetchComponent(componentName: string, targetDir: string, format: "tsx" | "jsx") {
  const component = components[componentName];

  if (!component) {
    console.log(chalk.red(`Component \"${componentName}\" not found.`));
    return;
  }

  // Check if component requires Tailwind and verify Tailwind setup
  if (component.requiresTailwind) {
    const isTailwindReady = await checkTailwindSetup();
    
    if (!isTailwindReady) {
      const { setupTailwindNow } = await prompts({
        type: "confirm",
        name: "setupTailwindNow",
        message: "This component requires Tailwind CSS v3. Would you like to install and configure it now in your project?",
        initial: true
      });
      
      if (setupTailwindNow) {
        const success = await setupTailwind();
        if (!success) {
          console.log(chalk.yellow("Proceeding with component installation, but it may not display correctly without Tailwind CSS."));
        }
      } else {
        console.log(chalk.yellow("Proceeding without Tailwind setup. Component may not display correctly."));
      }
    }
  }

  // Create the target directory if it doesn't exist
  const fullTargetDir = path.join(process.cwd(), targetDir);
  const componentDir = path.join(fullTargetDir, componentName);
  await fs.ensureDir(componentDir);

  console.log(chalk.blue(`Adding ${componentName} component in ${format.toUpperCase()} format to your project...`));

  // Filter files for the selected format (only apply filtering to tsx/jsx files)
  const filesToDownload = component.files.filter(file => 
    !file.format || file.format === format
  );

  // Process each file in the component
  for (const file of filesToDownload) {
    const destPath = path.join(componentDir, file.filename);

    try {
      const response = await axios.get(file.url);
      await fs.writeFile(destPath, response.data);
      console.log(chalk.green(`  ✓ Added ${file.filename} to your project`));
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
    chalk.green(`\n✅ ${componentName} component has been added successfully to your project!`)
  );

  // Update the general index file in the target directory based on the format selected
  // Use .ts for tsx format and .js for jsx format
  const indexExt = format === "tsx" ? "ts" : "js";
  const generalIndexPath = path.join(fullTargetDir, `index.${indexExt}`);
  const componentName_capitalized = componentName.charAt(0).toUpperCase() + componentName.slice(1);
  
  // Use the correct file extension in the import statement based on format
  const componentExt = format;
  const exportStatement = `export { default as ${componentName_capitalized} } from './${componentName}/${componentName_capitalized}.${componentExt}';\n`;

  try {
    // Create the file if it doesn't exist
    if (!fs.existsSync(generalIndexPath)) {
      await fs.writeFile(generalIndexPath, '');
      console.log(chalk.green(`  ✓ Created new index.${indexExt} file in your project`));
    }
    
    // Check if the export already exists to avoid duplicates
    const currentContent = await fs.readFile(generalIndexPath, 'utf8');
    if (!currentContent.includes(exportStatement)) {
      await fs.appendFile(generalIndexPath, exportStatement);
      console.log(chalk.green(`  ✓ Updated index.${indexExt} with ${componentName} export in your project`));
    } else {
      console.log(chalk.yellow(`  ℹ Export for ${componentName} already exists in index.${indexExt}`));
    }
  } catch (error) {
    console.log(
      chalk.red(
        `  ✗ Failed to update index.${indexExt}: ${(error as Error).message}`
      )
    );
  }
}

// Fetch and save template files
async function fetchTemplate(templateName: string, targetDir: string, format: "tsx" | "jsx") {
  const template = templates[templateName];

  if (!template) {
    console.log(chalk.red(`Template \"${templateName}\" not found.`));
    return;
  }

  // Check if template requires Tailwind and verify Tailwind setup
  if (template.requiresTailwind) {
    const isTailwindReady = await checkTailwindSetup();
    
    if (!isTailwindReady) {
      const { setupTailwindNow } = await prompts({
        type: "confirm",
        name: "setupTailwindNow",
        message: "This template requires Tailwind CSS v3. Would you like to install and configure it now in your project?",
        initial: true
      });
      
      if (setupTailwindNow) {
        const success = await setupTailwind();
        if (!success) {
          console.log(chalk.yellow("Proceeding with template installation, but it may not display correctly without Tailwind CSS."));
        }
      } else {
        console.log(chalk.yellow("Proceeding without Tailwind setup. Template may not display correctly."));
      }
    }
  }

  // Create the target directory if it doesn't exist
  const fullTargetDir = path.join(process.cwd(), targetDir);
  const templateDir = path.join(fullTargetDir, templateName);
  await fs.ensureDir(templateDir);

  console.log(chalk.blue(`Adding ${templateName} template in ${format.toUpperCase()} format to your project...`));

  // Filter files for the selected format (only apply filtering to tsx/jsx files)
  const filesToDownload = template.files.filter(file => 
    !file.format || file.format === format
  );

  // Process each file in the template
  for (const file of filesToDownload) {
    const destPath = path.join(templateDir, file.filename);

    try {
      const response = await axios.get(file.url);
      await fs.writeFile(destPath, response.data);
      console.log(chalk.green(`  ✓ Added ${file.filename} to your project`));
    } catch (error) {
      console.log(
        chalk.red(
          `  ✗ Failed to add ${file.filename}: ${(error as Error).message}`
        )
      );
    }
  }

  // Install dependencies
  await installDependencies(template.dependencies);
  await installDependencies(template.devDependencies, true);

  console.log(
    chalk.green(`\n✅ ${templateName} template has been added successfully to your project!`)
  );

  // Update the general index file in the target directory based on the format selected
  // Use .ts for tsx format and .js for jsx format
  const indexExt = format === "tsx" ? "ts" : "js";
  const generalIndexPath = path.join(fullTargetDir, `index.${indexExt}`);
  
  // Get the class name from the filename (assuming it follows PascalCase)
  // For NotFound.tsx, the class name would be NotFound
  const className = filesToDownload[0].filename.split('.')[0];
  
  // Use the correct file extension in the import statement based on format
  const componentExt = format;
  const exportStatement = `export { default as ${className} } from './${templateName}/${className}.${componentExt}';\n`;

  try {
    // Create the file if it doesn't exist
    if (!fs.existsSync(generalIndexPath)) {
      await fs.writeFile(generalIndexPath, '');
      console.log(chalk.green(`  ✓ Created new index.${indexExt} file in your project`));
    }
    
    // Check if the export already exists to avoid duplicates
    const currentContent = await fs.readFile(generalIndexPath, 'utf8');
    if (!currentContent.includes(exportStatement)) {
      await fs.appendFile(generalIndexPath, exportStatement);
      console.log(chalk.green(`  ✓ Updated index.${indexExt} with ${templateName} export in your project`));
    } else {
      console.log(chalk.yellow(`  ℹ Export for ${templateName} already exists in index.${indexExt}`));
    }
  } catch (error) {
    console.log(
      chalk.red(
        `  ✗ Failed to update index.${indexExt}: ${(error as Error).message}`
      )
    );
  }
}

// CLI prompt
(async () => {
  // Validate the project directory
  validateProjectDirectory();

  // Prompt the user to choose between components and templates
  const { itemType } = await prompts({
    type: "select",
    name: "itemType",
    message: "What would you like to add to your project?",
    choices: [
      { title: "Component", value: "component" },
      { title: "Template", value: "template" }
    ]
  });

  // Prompt the user for the target directory
  const { targetDir } = await prompts({
    type: "text",
    name: "targetDir",
    message:
      `Enter the directory where you want to add the ${itemType} (e.g., src/${itemType}s):`,
    initial: `src/${itemType}s`,
  });

  // Ensure the target directory exists
  await fs.ensureDir(path.join(process.cwd(), targetDir));

  if (itemType === "component") {
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

    // Format selection
    const {format} = await prompts({
      type: "select",
      name: "format",
      message: "Which format do you want to use?",
      choices: [
        { title: "TypeScript (tsx)", value: "tsx" },
        { title: "JavaScript (jsx)", value: "jsx" },
      ],
    });

    if (response.component) {
      await fetchComponent(response.component, targetDir, format);
    }
  } else if (itemType === "template") {
    // Prompt the user to select a template
    const response = await prompts({
      type: "select",
      name: "template",
      message: "Which template do you want to add?",
      choices: Object.keys(templates).map((temp) => ({
        title: temp,
        value: temp,
      })),
    });

    // Format selection
    const {format} = await prompts({
      type: "select",
      name: "format",
      message: "Which format do you want to use?",
      choices: [
        { title: "TypeScript (tsx)", value: "tsx" },
        { title: "JavaScript (jsx)", value: "jsx" },
      ],
    });

    if (response.template) {
      await fetchTemplate(response.template, targetDir, format);
    }
  }
})();
