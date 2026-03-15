figma.showUI(__html__, { width: 680, height: 600, themeColors: true });

// ── Types ──────────────────────────────────────────────

interface TokenEntry {
  name: string;
  type: "COLOR" | "FLOAT" | "STRING" | "BOOLEAN";
}

interface TokenGroup {
  id: string;
  tokens: TokenEntry[];
}

interface SyncPayload {
  groups: TokenGroup[];
  modes: string[];
}

interface SyncMsg {
  type: "sync-tokens";
  payload: SyncPayload;
  collectionName: string;
  config: unknown;
}

interface LoadConfigMsg {
  type: "load-config";
}

interface SaveConfigMsg {
  type: "save-config";
  config: unknown;
}

type PluginMsg = SyncMsg | LoadConfigMsg | SaveConfigMsg;

const STORAGE_KEY = "tokenSetupConfig";
const DEFAULT_COLLECTION_NAME = "color usage";

// ── Default color placeholder ──────────────────────────

const DEFAULT_COLOR: RGBA = { r: 1, g: 1, b: 1, a: 1 };

// ── Main handler ───────────────────────────────────────

figma.ui.onmessage = async (msg: PluginMsg) => {
  // ── Load saved config ────────────────────────────────
  if (msg.type === "load-config") {
    try {
      const raw = await figma.clientStorage.getAsync(STORAGE_KEY);
      const config = raw ? JSON.parse(raw) : null;
      figma.ui.postMessage({ type: "config-loaded", config });
    } catch (e) {
      figma.ui.postMessage({ type: "config-loaded", config: null });
    }
    return;
  }

  // ── Save config on every change ──────────────────────
  if (msg.type === "save-config") {
    try {
      await figma.clientStorage.setAsync(STORAGE_KEY, JSON.stringify(msg.config));
    } catch (e) {
      // silent fail
    }
    return;
  }

  // ── Sync tokens to Figma Variables ───────────────────
  if (msg.type === "sync-tokens") {
    const { payload, collectionName, config } = msg;
    const name = (collectionName && collectionName.trim()) || DEFAULT_COLLECTION_NAME;

    try {
      // Save config for next session
      await figma.clientStorage.setAsync(STORAGE_KEY, JSON.stringify(config));

      // Collect all token entries
      const allTokens: TokenEntry[] = [];
      for (const group of payload.groups) {
        allTokens.push(...group.tokens);
      }

      if (allTokens.length === 0) {
        figma.ui.postMessage({
          type: "sync-error",
          message: "No tokens to create.",
        });
        return;
      }

      // Create collection
      const collection =
        figma.variables.createVariableCollection(name);

      // Set up modes
      const defaultModeId = collection.modes[0].modeId;
      if (payload.modes.length > 0) {
        collection.renameMode(defaultModeId, payload.modes[0]);
        for (let i = 1; i < payload.modes.length; i++) {
          collection.addMode(payload.modes[i]);
        }
      }

      // Create variables
      let created = 0;
      for (const token of allTokens) {
        const resolvedType = token.type as VariableResolvedDataType;
        const variable = figma.variables.createVariable(
          token.name,
          collection,
          resolvedType
        );

        // Set default value for each mode
        for (const mode of collection.modes) {
          const value = getDefaultValue(resolvedType);
          variable.setValueForMode(mode.modeId, value);
        }
        created++;
      }

      figma.notify(
        `\u2713 "${name}" created \u2014 ${created} variables, ${payload.modes.length} mode${payload.modes.length !== 1 ? "s" : ""}`
      );

      figma.ui.postMessage({
        type: "sync-complete",
        collectionName: name,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      figma.notify("Error: " + message, { error: true });
      figma.ui.postMessage({ type: "sync-error", message });
    }
  }
};

// ── Helpers ────────────────────────────────────────────

function getDefaultValue(type: VariableResolvedDataType): VariableValue {
  switch (type) {
    case "COLOR":
      return DEFAULT_COLOR;
    case "FLOAT":
      return 0;
    case "STRING":
      return "";
    case "BOOLEAN":
      return false;
  }
}
