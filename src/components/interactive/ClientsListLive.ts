import { supabase } from "@/lib/supabase";

export class ClientsListLive extends HTMLElement {
    private userId: string = "";
    private channel: any = null;

    connectedCallback() {
        this.userId = this.dataset.userId || "";
        if (!this.userId) {
            console.error("ClientsListLive: userId is required");
            return;
        }
        this.subscribeToChanges();
    }

    private subscribeToChanges() {
        // Subscribe to changes in the clients table for this user
        this.channel = supabase
            .channel(`clients-${this.userId}`)
            .on(
                'postgres_changes' as any,
                {
                    event: '*', // INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'clients',
                    filter: `user_id=eq.${this.userId}`
                },
                (payload: any) => {
                    console.log('Client change received:', payload);
                    this.handleClientChange(payload);
                }
            )
            .subscribe();
    }

    private handleClientChange(payload: any) {
        const eventType = payload.eventType;

        if (eventType === 'INSERT') {
            // New client created - reload page to show it
            this.showToast("Nuevo cliente agregado", "success");
            setTimeout(() => window.location.reload(), 2000);
        }
        else if (eventType === 'UPDATE') {
            const client = payload.new;
            this.updateClientRow(client);

            // Show notification if client completed
            if (client.status === 'completed') {
                this.showToast(`${client.client_name} completó el proceso`, "success");
            }
        }
        else if (eventType === 'DELETE') {
            const clientId = payload.old.id;
            this.removeClientRow(clientId);
            this.showToast("Cliente eliminado", "info");
        }
    }

    private updateClientRow(client: any) {
        const row = document.querySelector(`tr[data-client-id="${client.id}"]`);
        if (!row) return;

        // Update status badge
        const badge = row.querySelector('.status-badge');
        if (badge) {
            if (client.status === 'completed') {
                badge.textContent = 'COMPLETADO';
                badge.className = 'status-badge inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider border bg-status-success/10 text-status-success border-status-success/20';
            } else {
                badge.textContent = 'PENDIENTE';
                badge.className = 'status-badge inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider border bg-status-warning/10 text-status-warning border-status-warning/20';
            }
        }

        // Add animation to highlight the change
        row.classList.add('animate-pulse');
        setTimeout(() => row.classList.remove('animate-pulse'), 2000);
    }

    private removeClientRow(clientId: string) {
        const row = document.querySelector(`tr[data-client-id="${clientId}"]`);
        if (row) {
            row.classList.add('opacity-0', 'transition-opacity', 'duration-500');
            setTimeout(() => row.remove(), 500);
        }
    }

    private showToast(message: string, type: 'success' | 'info' | 'error' = 'info') {
        // Check if toast container exists, if not create it
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'fixed top-8 right-8 z-50 flex flex-col gap-2';
            document.body.appendChild(toastContainer);
        }

        // Create toast element
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-status-success' : type === 'error' ? 'bg-status-error' : 'bg-status-info';

        toast.className = `${bgColor} text-white px-6 py-3 rounded shadow-lg animate-slide-in-right flex items-center gap-3`;
        toast.innerHTML = `
            <span>${this.getIcon(type)}</span>
            <span class="font-light text-sm">${message}</span>
        `;

        toastContainer.appendChild(toast);

        // Auto remove after 4 seconds
        setTimeout(() => {
            toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    private getIcon(type: string): string {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'info': return 'ℹ';
            default: return '•';
        }
    }

    disconnectedCallback() {
        // Clean up subscription when component is removed
        if (this.channel) {
            this.channel.unsubscribe();
        }
    }
}

customElements.define("clients-list-live", ClientsListLive);
