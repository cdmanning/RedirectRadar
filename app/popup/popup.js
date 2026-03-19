document.addEventListener('DOMContentLoaded', () => {
    const logoIcon = document.querySelector('.logo');
    const toggleSwitch = document.getElementById('toggleSwitch');
    const logList = document.getElementById('logList');
    const clearBtn = document.getElementById('clearLogs');
    const exportBtn = document.getElementById('exportLogs');

    function sanitizeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function renderLogs() {
        chrome.storage.local.get({ logs: [] }, (data) => {
            if (data.logs.length === 0) {
                logList.style.display = 'flex';
                logList.style.flexDirection = 'column';
                logList.innerHTML = '<div style="margin: auto; padding:40px 20px; text-align:center; font-size:12px; color:var(--text-secondary);">Radar clear. No redirects found.</div>';
                return;
            }
            logList.innerHTML = data.logs.slice().reverse().map(log => `
                <div class="log-entry">
                    <span class="log-url">${sanitizeHTML(log.url)}</span>
                    <span class="log-time">${log.timestamp}</span>
                </div>
            `).join('');
        });
    }

    toggleSwitch.addEventListener('change', () => {
        const active = toggleSwitch.checked;
        const logoIcon = document.querySelector('.logo');


        const iconPath = active ? "../icons/icon_active_48.png" : "../icons/icon_inactive_48.png";

        chrome.action.setIcon({ path: iconPath });
        if (active) {
            logoIcon.classList.add('active');
        } else {
            logoIcon.classList.remove('active');
        }

        chrome.storage.local.set({ isOn: active });
    });

    exportBtn.addEventListener('click', () => {
        chrome.storage.local.get({ logs: [], subFolder: 'Redirect Radar' }, (data) => {
            if (data.logs.length === 0) return;
            const content = data.logs.map(l => `[${l.timestamp}] ${l.url}`).join('\n');
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const folder = data.subFolder.trim();
            const fileName = `radar_export_${Date.now()}.txt`;
            const finalPath = folder !== "" ? `${folder}/${fileName}` : fileName;
            chrome.downloads.download({
                url: url,
                filename: finalPath,
                conflictAction: 'uniquify',
                saveAs: false
            }, () => {
                URL.revokeObjectURL(url);
            });
        });
    });

    clearBtn.addEventListener('click', () => {
        chrome.storage.local.set({ logs: [] }, renderLogs);
    });

    chrome.storage.local.get({ isOn: true }, (data) => {
        toggleSwitch.checked = data.isOn;
        if (data.isOn) {
            logoIcon.classList.add('active');
        }
    });

    renderLogs();
    setTimeout(() => document.body.classList.remove('preload'), 100);
});