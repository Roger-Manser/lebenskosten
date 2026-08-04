/**
 * APP-SPEZIFISCHE SETTINGS – ALLE 4 APPS
 * Version: 1.2 (App v3.3) – MIT DATEI-DIALOG
 */

const APP_SETTINGS = {
  'Rezeptbuch': {
    version: '3.4',
    fields: [
      { id: 'github_token', label: 'GitHub Token', type: 'password' },
      { id: 'github_owner', label: 'GitHub Owner', type: 'text', placeholder: 'roger-manser' },
      { id: 'github_repo', label: 'GitHub Repo', type: 'text', placeholder: 'rezeptbuch' },
      { id: 'anthropic_api_key', label: 'Anthropic API Key', type: 'password' }
    ]
  },
  'Haushaltbuch': {
    version: '17.3',
    fields: [
      { id: 'github_token', label: 'GitHub Token', type: 'password' },
      { id: 'github_owner', label: 'GitHub Owner', type: 'text', placeholder: 'roger-manser' },
      { id: 'github_repo', label: 'GitHub Repo', type: 'text', placeholder: 'haushaltbuch' },
      { id: 'anthropic_api_key', label: 'Anthropic API Key', type: 'password' }
    ]
  },
  'Fahrtenbuch': {
    version: '3.4',
    fields: [
      { id: 'github_token', label: 'GitHub Token', type: 'password' },
      { id: 'github_owner', label: 'GitHub Owner', type: 'text', placeholder: 'roger-manser' },
      { id: 'github_repo', label: 'GitHub Repo', type: 'text', placeholder: 'fahrtenbuch' }
    ]
  },
  'Lebenskosten': {
    version: '2.9',
    fields: [
      { id: 'github_owner', label: 'GitHub Owner', type: 'text', placeholder: 'roger-manser', order: 1 },
      { id: 'github_repo', label: 'GitHub Repo', type: 'text', placeholder: 'lebenskosten-daten', order: 2 },
      { id: 'sync_filename', label: 'Dateiname (optional)', type: 'text', placeholder: 'lebenskosten-daten', order: 2.5 },
      { id: 'github_token', label: 'GitHub Token', type: 'password', order: 3 },
      { id: 'anthropic_api_key', label: 'Anthropic API Key', type: 'password', order: 4 }
    ]
  }
};

class AppSettings {
  constructor(appName) {
    this.appName = appName;
    this.config = APP_SETTINGS[appName] || {};
    this.storageKey = appName + '_settings';
    console.log('✅ AppSettings v1.2 (App v3.3) initialized for: ' + appName);
    this.setupFileHandler();
  }

  setupFileHandler() {
    const fileInput = document.getElementById('app_settings_file_input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
      console.log('✅ File input handler attached');
    }
  }

  getSetting(key) {
    try {
      const all = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
      return all[key] || '';
    } catch (e) {
      return '';
    }
  }

  setSetting(key, value) {
    try {
      const all = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
      all[key] = value;
      localStorage.setItem(this.storageKey, JSON.stringify(all));
    } catch (e) {
      console.error('Error setting:', e);
    }
  }

  getAllSettings() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
    } catch (e) {
      return {};
    }
  }

  loadAllIntoUI() {
    try {
      if (!this.config.fields) return;
      this.config.fields.forEach(field => {
        const input = document.getElementById('setting_' + field.id);
        if (input) {
          input.value = this.getSetting(field.id);
        }
      });
    } catch (e) {
      console.error('Error loading UI:', e);
    }
  }

  saveAll() {
    try {
      if (!this.config.fields) return;
      this.config.fields.forEach(field => {
        const input = document.getElementById('setting_' + field.id);
        if (input) {
          this.setSetting(field.id, input.value);
        }
      });
      alert('✅ Settings gespeichert!');
    } catch (e) {
      alert('❌ Fehler beim Speichern');
    }
  }

  async testGitHub() {
    const token = this.getSetting('github_token');
    const owner = this.getSetting('github_owner');
    const repo = this.getSetting('github_repo');
    const resultDiv = document.getElementById('test_github_token');

    if (!resultDiv) return;

    if (!owner || !repo) {
      resultDiv.innerHTML = '❌ GitHub Owner oder Repo fehlt';
      return;
    }

    if (!token) {
      resultDiv.innerHTML = '❌ GitHub Token fehlt';
      return;
    }

    try {
      resultDiv.innerHTML = '🔄 Teste...';
      const response = await fetch(
        'https://api.github.com/repos/' + owner + '/' + repo,
        { headers: { 'Authorization': 'token ' + token } }
      );

      if (response.ok) {
        resultDiv.innerHTML = '✅ GitHub Token valid!';
      } else if (response.status === 401) {
        resultDiv.innerHTML = '❌ Token ungültig (401)';
      } else if (response.status === 404) {
        resultDiv.innerHTML = '❌ Repo nicht gefunden (404)';
      } else {
        resultDiv.innerHTML = '❌ Fehler: ' + response.status;
      }
    } catch (err) {
      resultDiv.innerHTML = '❌ ' + err.message;
    }
  }

  async testAnthropicKey() {
    const apiKey = this.getSetting('anthropic_api_key');
    const resultDiv = document.getElementById('test_anthropic_api_key');

    if (!resultDiv) return;

    if (!apiKey) {
      resultDiv.innerHTML = '❌ API Key fehlt';
      return;
    }

    try {
      resultDiv.innerHTML = '🔄 Teste...';
      const response = await fetch('https://api.anthropic.com/v1/models', {
        headers: { 'x-api-key': apiKey }
      });

      if (response.ok) {
        resultDiv.innerHTML = '✅ Anthropic API Key valid!';
      } else if (response.status === 401) {
        resultDiv.innerHTML = '❌ API Key ungültig (401)';
      } else {
        resultDiv.innerHTML = '❌ Fehler: ' + response.status;
      }
    } catch (err) {
      resultDiv.innerHTML = '❌ ' + err.message;
    }
  }

  exportSettings() {
    try {
      const settings = this.getAllSettings();
      const data = {
        app: this.appName,
        version: this.config.version || '1.0',
        exported: new Date().toISOString(),
        settings: settings
      };

      const json = JSON.stringify(data, null, 2);
      const filename = this.appName.toLowerCase() + '_settings_' + new Date().toISOString().split('T')[0] + '.json';
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      alert('✅ Settings exportiert:\n' + filename);
    } catch (e) {
      alert('❌ Export fehlgeschlagen');
    }
  }

  handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    console.log('📁 Datei ausgewählt: ' + file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target.result;
        const data = JSON.parse(json);

        if (data.app !== this.appName) {
          alert('❌ Falsche App!\nErwartet: ' + this.appName + '\nErhalten: ' + data.app);
          return;
        }

        const settings = data.settings || {};
        Object.keys(settings).forEach(key => {
          this.setSetting(key, settings[key]);
        });

        alert('✅ Settings importiert!\n' + file.name);
        this.loadAllIntoUI();
        console.log('✅ Import erfolgreich');
      } catch (err) {
        alert('❌ Fehler beim Lesen:\n' + err.message);
        console.error('Import error:', err);
      }
    };
    reader.readAsText(file);

    // Reset für nächsten Import
    event.target.value = '';
  }

  clearAll() {
    if (confirm('🗑️ Wirklich alle Settings löschen?')) {
      try {
        localStorage.removeItem(this.storageKey);
        alert('✅ Gelöscht!');
        this.loadAllIntoUI();
      } catch (e) {
        console.error('Error clearing:', e);
      }
    }
  }
}

console.log('✅ AppSettings v1.2 (App v3.3) (2026-08-04) loaded');
