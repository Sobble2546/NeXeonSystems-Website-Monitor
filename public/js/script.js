class NeXeonStatusChecker {
    constructor() {
        this.socket = io();
        this.container = document.getElementById('status-container');
        this.lastUpdate = document.getElementById('last-update');
        this.initializeSocket();
        this.initializeTimeago();
    }

    initializeSocket() {
        this.socket.on('connect', () => this.handleConnect());
        this.socket.on('disconnect', () => this.handleDisconnect());
        this.socket.on('statusUpdate', (statuses) => this.updateNodes(statuses));
    }

    initializeTimeago() {
        this.updateTimestamp();
        setInterval(() => this.updateTimestamp(), 60000);
    }

    handleConnect() {
        this.updateConnectionStatus(true);
        this.addSystemStatus('System connection established');
    }

    handleDisconnect() {
        this.updateConnectionStatus(false);
        this.addSystemStatus('Connection lost - attempting to reconnect...');
    }

    updateConnectionStatus(isConnected) {
        const subtitle = document.querySelector('.subtitle');
        if (subtitle) {
            subtitle.textContent = isConnected ? 'Real-Time Status Checker' : 'RECONNECTING...';
            subtitle.style.color = isConnected ? '#64748b' : '#ff0033';
        }
    }

    createNodeElement(node) {
        return `
            <div class="node ${node.status}" data-node="${this.escapeHtml(node.name)}">
                <div class="node-header">
                    <span class="status-indicator"></span>
                    <span class="node-name">${this.escapeHtml(node.name)}</span>
                </div>
                <div class="node-details">
                    <div class="detail-label">Status</div>
                    <div class="node-status">${node.status.toUpperCase()}</div>
                </div>
            </div>
        `;
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    updateNodes(statuses) {
        if (!Array.isArray(statuses)) {
            console.error('Invalid status update received');
            return;
        }
        
        const nodesHtml = statuses.map(node => this.createNodeElement(node)).join('');
        this.container.innerHTML = nodesHtml;
        
        this.updateTimestamp();
        this.addNodeAnimations();
    }

    updateTimestamp() {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        const dateString = now.toLocaleDateString();
        if (this.lastUpdate) {
            this.lastUpdate.textContent = `Last Updated: ${timeString} - ${dateString}`;
        }
    }

    addNodeAnimations() {
        const nodes = document.querySelectorAll('.node');
        nodes.forEach(node => {
            node.style.opacity = '0';
            node.style.transform = 'translateY(20px)';
            requestAnimationFrame(() => {
                node.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                node.style.opacity = '1';
                node.style.transform = 'translateY(0)';
            });
        });
    }

    addSystemStatus(message) {
        console.log(`System Status: ${message}`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.statusChecker = new NeXeonStatusChecker();
});
