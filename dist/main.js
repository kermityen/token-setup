"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // src/main.ts
  var require_main = __commonJS({
    "src/main.ts"(exports) {
      figma.showUI(__html__, { width: 680, height: 600, themeColors: true });
      var STORAGE_KEY = "tokenSetupConfig";
      var DEFAULT_COLLECTION_NAME = "color usage";
      var DEFAULT_COLOR = { r: 1, g: 1, b: 1, a: 1 };
      figma.ui.onmessage = (msg) => __async(null, null, function* () {
        if (msg.type === "load-config") {
          try {
            const raw = yield figma.clientStorage.getAsync(STORAGE_KEY);
            const config = raw ? JSON.parse(raw) : null;
            figma.ui.postMessage({ type: "config-loaded", config });
          } catch (e) {
            figma.ui.postMessage({ type: "config-loaded", config: null });
          }
          return;
        }
        if (msg.type === "save-config") {
          try {
            yield figma.clientStorage.setAsync(STORAGE_KEY, JSON.stringify(msg.config));
          } catch (e) {
          }
          return;
        }
        if (msg.type === "sync-tokens") {
          const { payload, collectionName, config } = msg;
          const name = collectionName && collectionName.trim() || DEFAULT_COLLECTION_NAME;
          try {
            yield figma.clientStorage.setAsync(STORAGE_KEY, JSON.stringify(config));
            const allTokens = [];
            for (const group of payload.groups) {
              allTokens.push(...group.tokens);
            }
            if (allTokens.length === 0) {
              figma.ui.postMessage({
                type: "sync-error",
                message: "No tokens to create."
              });
              return;
            }
            const collection = figma.variables.createVariableCollection(name);
            const defaultModeId = collection.modes[0].modeId;
            if (payload.modes.length > 0) {
              collection.renameMode(defaultModeId, payload.modes[0]);
              for (let i = 1; i < payload.modes.length; i++) {
                collection.addMode(payload.modes[i]);
              }
            }
            let created = 0;
            for (const token of allTokens) {
              const resolvedType = token.type;
              const variable = figma.variables.createVariable(
                token.name,
                collection,
                resolvedType
              );
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
              collectionName: name
            });
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            figma.notify("Error: " + message, { error: true });
            figma.ui.postMessage({ type: "sync-error", message });
          }
        }
      });
      function getDefaultValue(type) {
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
    }
  });
  require_main();
})();
