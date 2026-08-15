import {
  AcodePluginManifest,
  InstalledAcodePlugin,
  AcodeSidebarApp,
  AcodePaletteCommand,
  AcodeDialogState,
  TabItem,
} from '../types';

type EventListener = (...args: any[]) => void;

class AcodeRuntimeService {
  private inits: Map<string, (baseUrl: string, $page: HTMLElement, extra: any) => void | Promise<void>> = new Map();
  private unmounts: Map<string, () => void | Promise<void>> = new Map();
  private icons: Map<string, string> = new Map();
  private formatters: Map<string, { extensions: string[]; callback: (text: string) => string | Promise<string> }> = new Map();
  private sidebarApps: Map<string, AcodeSidebarApp> = new Map();
  private paletteCommands: Map<string, AcodePaletteCommand> = new Map();
  private pluginSettings: Map<string, Record<string, any>> = new Map();
  private editorEvents: Map<string, Set<EventListener>> = new Map();
  private toasts: { id: string; message: string; duration?: number }[] = [];
  private toastListeners: Set<(toasts: any[]) => void> = new Set();
  private sidebarAppListeners: Set<() => void> = new Set();
  private commandListeners: Set<() => void> = new Set();
  private dialogHandler: ((state: AcodeDialogState) => void) | null = null;

  // Editor Reference & Tabs bridge
  private editorInstance: any = null;
  private tabs: TabItem[] = [];
  private activeTabId: string | null = null;
  private onContentChangeCallback: ((content: string) => void) | null = null;
  private onSaveCallback: (() => void) | null = null;
  private onSwitchTabCallback: ((tabId: string) => void) | null = null;

  constructor() {
    this.initGlobals();
  }

  public setEditorBridge(
    editor: any,
    tabs: TabItem[],
    activeTabId: string | null,
    onContentChange: (content: string) => void,
    onSave: () => void,
    onSwitchTab: (tabId: string) => void
  ) {
    this.editorInstance = editor;
    this.tabs = tabs;
    this.activeTabId = activeTabId;
    this.onContentChangeCallback = onContentChange;
    this.onSaveCallback = onSave;
    this.onSwitchTabCallback = onSwitchTab;
  }

  public setDialogHandler(handler: (state: AcodeDialogState) => void) {
    this.dialogHandler = handler;
  }

  public subscribeToasts(cb: (toasts: any[]) => void) {
    this.toastListeners.add(cb);
    return () => this.toastListeners.delete(cb);
  }

  public subscribeSidebarApps(cb: () => void) {
    this.sidebarAppListeners.add(cb);
    return () => this.sidebarAppListeners.delete(cb);
  }

  public subscribeCommands(cb: () => void) {
    this.commandListeners.add(cb);
    return () => this.commandListeners.delete(cb);
  }

  public getSidebarApps(): AcodeSidebarApp[] {
    return Array.from(this.sidebarApps.values());
  }

  public getPaletteCommands(): AcodePaletteCommand[] {
    return Array.from(this.paletteCommands.values());
  }

  public getToasts() {
    return [...this.toasts];
  }

  public showToast(message: string, duration: number = 3000) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const toast = { id, message, duration };
    this.toasts.push(toast);
    this.notifyToasts();

    setTimeout(() => {
      this.toasts = this.toasts.filter((t) => t.id !== id);
      this.notifyToasts();
    }, duration);
  }

  private notifyToasts() {
    this.toastListeners.forEach((cb) => cb([...this.toasts]));
  }

  private notifySidebarApps() {
    this.sidebarAppListeners.forEach((cb) => cb());
  }

  private notifyCommands() {
    this.commandListeners.forEach((cb) => cb());
  }

  // Acode Global Object Initialization
  private initGlobals() {
    if (typeof window === 'undefined') return;

    const runtime = this;

    // 1. Acode Main Object
    const acode = {
      version: '1.9.0 (DexCode Compat)',
      versionCode: 290,

      setPluginInit: (id: string, initFn: (baseUrl: string, $page: HTMLElement, extra: any) => void | Promise<void>) => {
        runtime.inits.set(id, initFn);
      },

      setPluginUnmount: (id: string, unmountFn: () => void | Promise<void>) => {
        runtime.unmounts.set(id, unmountFn);
      },

      addIcon: (iconName: string, iconSrcOrSvg: string) => {
        runtime.icons.set(iconName, iconSrcOrSvg);
      },

      getIcon: (iconName: string): string => {
        return runtime.icons.get(iconName) || '';
      },

      alert: (title: string, message: string, onOk?: () => void) => {
        if (runtime.dialogHandler) {
          runtime.dialogHandler({
            isOpen: true,
            type: 'alert',
            title,
            message,
            onConfirm: () => {
              if (onOk) onOk();
            },
          });
        } else {
          alert(`${title}\n\n${message}`);
          if (onOk) onOk();
        }
      },

      prompt: (title: string, defaultValue: string = '', type: string = 'text', options?: any) => {
        return new Promise<string | null>((resolve) => {
          if (runtime.dialogHandler) {
            runtime.dialogHandler({
              isOpen: true,
              type: 'prompt',
              title,
              defaultValue,
              onConfirm: (val) => resolve(val !== undefined ? val : null),
              onCancel: () => resolve(null),
            });
          } else {
            const val = prompt(title, defaultValue);
            resolve(val);
          }
        });
      },

      confirm: (title: string, message: string, onOk?: () => void, onCancel?: () => void) => {
        return new Promise<boolean>((resolve) => {
          if (runtime.dialogHandler) {
            runtime.dialogHandler({
              isOpen: true,
              type: 'confirm',
              title,
              message,
              onConfirm: () => {
                if (onOk) onOk();
                resolve(true);
              },
              onCancel: () => {
                if (onCancel) onCancel();
                resolve(false);
              },
            });
          } else {
            const res = confirm(`${title}\n\n${message}`);
            if (res && onOk) onOk();
            if (!res && onCancel) onCancel();
            resolve(res);
          }
        });
      },

      select: (title: string, options: Array<[string, string] | { text: string; value: string }>, cb?: (val: string) => void) => {
        const formatted = options.map((opt) => {
          if (Array.isArray(opt)) return { value: opt[0], text: opt[1] };
          return opt;
        });

        if (runtime.dialogHandler) {
          runtime.dialogHandler({
            isOpen: true,
            type: 'select',
            title,
            options: formatted,
            onConfirm: (val) => {
              if (cb && val) cb(val);
            },
          });
        }
      },

      loader: (title: string, message: string) => {
        runtime.showToast(`${title}: ${message}`, 2000);
      },

      format: async (text?: string) => {
        const active = runtime.getActiveFile();
        if (!active) return;
        const code = text !== undefined ? text : active.content;
        const ext = active.name.split('.').pop() || '';

        // Check if custom formatter registered
        for (const [, fmt] of runtime.formatters) {
          if (fmt.extensions.includes(ext) || fmt.extensions.includes('*')) {
            try {
              const formatted = await fmt.callback(code);
              if (formatted && runtime.onContentChangeCallback) {
                runtime.onContentChangeCallback(formatted);
                runtime.showToast(`Formatted with Acode Plugin Formatter`, 1500);
                return;
              }
            } catch (err) {
              console.error('Formatter failed', err);
            }
          }
        }
      },

      registerFormatter: (name: string, extensions: string[], callback: (text: string) => string | Promise<string>) => {
        runtime.formatters.set(name, { extensions, callback });
        runtime.showToast(`Registered Formatter: ${name}`, 2000);
      },

      exec: (command: string, ...args: any[]) => {
        const cmd = runtime.paletteCommands.get(command);
        if (cmd) {
          cmd.action();
          return true;
        }
        if (command === 'save' && runtime.onSaveCallback) {
          runtime.onSaveCallback();
          return true;
        }
        return false;
      },

      defineGlobal: (name: string, value: any) => {
        (window as any)[name] = value;
      },

      addSettings: (pluginId: string, settingsObj: Record<string, any>) => {
        runtime.pluginSettings.set(pluginId, settingsObj);
      },

      getSettings: (pluginId: string) => {
        return runtime.pluginSettings.get(pluginId) || {};
      },

      require: (moduleName: string) => {
        switch (moduleName) {
          case 'editorManager':
            return (window as any).editorManager;
          case 'sidebarApps':
            return (window as any).sidebarApps;
          case 'palette':
            return (window as any).palette;
          case 'toast':
            return (window as any).toast;
          case 'dialogs':
            return (window as any).dialogs;
          case 'actionStack':
            return (window as any).actionStack;
          default:
            return (window as any)[moduleName] || null;
        }
      },
    };

    // 2. Editor Manager Object
    const editorManager = {
      get editor() {
        return {
          getValue: () => {
            const active = runtime.getActiveFile();
            return active ? active.content : '';
          },
          setValue: (val: string) => {
            if (runtime.onContentChangeCallback) {
              runtime.onContentChangeCallback(val);
            }
          },
          insert: (text: string) => {
            const active = runtime.getActiveFile();
            if (active && runtime.onContentChangeCallback) {
              runtime.onContentChangeCallback(active.content + text);
            }
          },
          getSelectedText: () => {
            if (window.getSelection) {
              return window.getSelection()?.toString() || '';
            }
            return '';
          },
          getCursorPosition: () => {
            return { row: 1, column: 1 };
          },
          focus: () => {
            // Focus active editor
          },
          undo: () => {},
          redo: () => {},
          on: (event: string, cb: EventListener) => {
            runtime.onEditorEvent(event, cb);
          },
          off: (event: string, cb: EventListener) => {
            runtime.offEditorEvent(event, cb);
          },
        };
      },

      get activeFile() {
        const active = runtime.getActiveFile();
        if (!active) return null;
        return {
          id: active.id,
          name: active.name,
          filename: active.name,
          uri: active.path,
          path: active.path,
          content: active.content,
          isModified: active.isDirty,
          isUnsaved: active.isDirty,
          markAsSaved: () => {
            if (runtime.onSaveCallback) runtime.onSaveCallback();
          },
        };
      },

      get files() {
        return runtime.tabs.map((t) => ({
          id: t.id,
          name: t.name,
          filename: t.name,
          uri: t.path,
          path: t.path,
          isModified: t.isDirty,
        }));
      },

      switchFile: (idOrPath: string) => {
        if (runtime.onSwitchTabCallback) {
          runtime.onSwitchTabCallback(idOrPath);
        }
      },

      getFile: (idOrPath: string) => {
        const tab = runtime.tabs.find((t) => t.id === idOrPath || t.path === idOrPath);
        if (!tab) return null;
        return {
          id: tab.id,
          name: tab.name,
          filename: tab.name,
          uri: tab.path,
          path: tab.path,
          content: tab.content,
          isModified: tab.isDirty,
        };
      },

      on: (event: string, cb: EventListener) => {
        runtime.onEditorEvent(event, cb);
      },
      off: (event: string, cb: EventListener) => {
        runtime.offEditorEvent(event, cb);
      },
      emit: (event: string, ...args: any[]) => {
        runtime.emitEditorEvent(event, ...args);
      },
    };

    // 3. Sidebar Apps Object
    const sidebarApps = {
      add: (icon: string, id: string, title: string, mount: (container: HTMLElement) => void) => {
        runtime.sidebarApps.set(id, {
          id,
          icon,
          title,
          mount,
        });
        runtime.notifySidebarApps();
        runtime.showToast(`Acode Plugin added Sidebar App: ${title}`, 2000);
      },

      remove: (id: string) => {
        runtime.sidebarApps.delete(id);
        runtime.notifySidebarApps();
      },

      get: (id: string) => {
        return runtime.sidebarApps.get(id);
      },
    };

    // 4. Command Palette Object
    const palette = {
      register: (title: string, action: () => void, pluginId: string = 'acode.plugin') => {
        const id = `acode-cmd-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        runtime.paletteCommands.set(id, {
          id,
          pluginId,
          title,
          action,
        });
        runtime.notifyCommands();
      },
    };

    // 5. Toast Object
    const toast = (msg: string, duration?: number) => {
      runtime.showToast(msg, duration);
    };

    // 6. Dialogs Object
    const dialogs = {
      alert: acode.alert,
      prompt: acode.prompt,
      confirm: acode.confirm,
      select: acode.select,
    };

    // 7. Action Stack
    const actionStack = {
      push: (item: any) => {},
      pop: () => {},
      remove: (id: string) => {},
    };

    // Bind to window
    (window as any).acode = acode;
    (window as any).editorManager = editorManager;
    (window as any).sidebarApps = sidebarApps;
    (window as any).palette = palette;
    (window as any).toast = toast;
    (window as any).dialogs = dialogs;
    (window as any).actionStack = actionStack;
  }

  private getActiveFile(): TabItem | null {
    if (!this.activeTabId) return this.tabs[0] || null;
    return this.tabs.find((t) => t.id === this.activeTabId) || null;
  }

  private onEditorEvent(event: string, cb: EventListener) {
    if (!this.editorEvents.has(event)) {
      this.editorEvents.set(event, new Set());
    }
    this.editorEvents.get(event)!.add(cb);
  }

  private offEditorEvent(event: string, cb: EventListener) {
    if (this.editorEvents.has(event)) {
      this.editorEvents.get(event)!.delete(cb);
    }
  }

  public emitEditorEvent(event: string, ...args: any[]) {
    if (this.editorEvents.has(event)) {
      this.editorEvents.get(event)!.forEach((cb) => {
        try {
          cb(...args);
        } catch (err) {
          console.error(`Error in Acode plugin event listener for ${event}:`, err);
        }
      });
    }
  }

  // Plugin Lifecycle Execution
  public async activatePlugin(plugin: InstalledAcodePlugin): Promise<{ success: boolean; error?: string }> {
    try {
      const { manifest, mainCode, id } = plugin;

      // Create a virtual container page for plugins that ask for $page
      const $page = document.createElement('div');
      $page.setAttribute('id', `acode-plugin-page-${id}`);
      $page.className = 'acode-plugin-container w-full h-full';

      const baseUrl = `virtual://acode-plugins/${id}/`;
      const cacheFile = { path: `virtual://${id}/cache` };
      const cacheFileUrl = `${baseUrl}cache`;

      // Evaluate the mainCode in a scoped function context
      // Provides standard Acode globals
      const runPlugin = new Function(
        'acode',
        'editorManager',
        'sidebarApps',
        'palette',
        'toast',
        'dialogs',
        'actionStack',
        'plugin',
        `
        try {
          ${mainCode}
        } catch (err) {
          console.error('Failed to execute Acode plugin script [${id}]:', err);
          throw err;
        }
        `
      );

      runPlugin(
        (window as any).acode,
        (window as any).editorManager,
        (window as any).sidebarApps,
        (window as any).palette,
        (window as any).toast,
        (window as any).dialogs,
        (window as any).actionStack,
        manifest
      );

      // Check if init was registered
      const initFn = this.inits.get(id);
      if (initFn) {
        await initFn(baseUrl, $page, { cacheFileUrl, cacheFile });
      }

      this.showToast(`⚡ Acode Plugin Activated: ${manifest.name}`, 2500);
      return { success: true };
    } catch (err: any) {
      console.error(`Acode Plugin Activation Error [${plugin.id}]:`, err);
      return { success: false, error: err.message || String(err) };
    }
  }

  public async deactivatePlugin(pluginId: string): Promise<void> {
    try {
      const unmountFn = this.unmounts.get(pluginId);
      if (unmountFn) {
        await unmountFn();
      }

      // Cleanup registered sidebar apps and palette commands for this plugin
      for (const [appId, app] of this.sidebarApps) {
        if (appId.startsWith(pluginId) || appId === pluginId) {
          this.sidebarApps.delete(appId);
        }
      }
      this.notifySidebarApps();

      for (const [cmdId, cmd] of this.paletteCommands) {
        if (cmd.pluginId === pluginId) {
          this.paletteCommands.delete(cmdId);
        }
      }
      this.notifyCommands();

      this.inits.delete(pluginId);
      this.unmounts.delete(pluginId);
      this.showToast(`Disabled Acode Plugin: ${pluginId}`, 1500);
    } catch (err) {
      console.error(`Acode Plugin Deactivation Error [${pluginId}]:`, err);
    }
  }
}

export const acodeRuntime = new AcodeRuntimeService();
