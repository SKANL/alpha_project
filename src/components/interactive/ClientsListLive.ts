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
            // New client created - append to table dynamically
            const client = payload.new;
            this.appendClientRow(client);
            this.showToast("Nuevo cliente agregado", "success");

            // Remove "No clients" message if it exists
            const noClientsMsg = document.querySelector('.py-24.text-center');
            if (noClientsMsg) {
                noClientsMsg.remove();
                // If table doesn't exist, we might need to reload or handle it, 
                // but for now let's assume the table structure exists or we reload if it's the FIRST client
                if (!document.querySelector('table')) {
                    window.location.reload();
                    return;
                }
            }
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

    private appendClientRow(client: any) {
        const tbody = document.querySelector('tbody');
        if (!tbody) return;

        const tr = document.createElement('tr');
        tr.setAttribute('data-client-id', client.id);
        tr.className = 'animate-slide-in-bottom'; // Add animation class if available

        const createdDate = new Date(client.created_at).toLocaleDateString("es-ES");

        tr.innerHTML = `
            <td class="font-medium text-content-primary">
                ${client.client_name}
            </td>
            <td>${client.case_name}</td>
            <td>
                <span class="status-badge inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider border bg-status-warning/10 text-status-warning border-status-warning/20">
                    PENDIENTE
                </span>
            </td>
            <td>
                ${createdDate}
            </td>
            <td>
                <div class="flex items-center justify-end gap-4">
                    <copy-link
                        class="text-xs font-light text-brand hover:text-brand-hover transition-colors cursor-pointer"
                        data-token="${client.magic_link_token}"
                    >
                        COPIAR LINK
                    </copy-link>
                    <delete-trigger
                        class="text-xs font-light text-content-muted hover:text-status-error transition-colors cursor-pointer"
                        data-id="${client.id}"
                        data-action="/api/clients/delete"
                        data-confirm="¿Estás seguro de eliminar el expediente de ${client.client_name}? Esta acción no se puede deshacer."
                    >
                        ELIMINAR
                    </delete-trigger>
                </div>
            </td>
        `;

        tbody.insertBefore(tr, tbody.firstChild);
    }

    disconnectedCallback() {
        // Clean up subscription when component is removed
        if (this.channel) {
            this.channel.unsubscribe();
        }
    }
}

customElements.define("clients-list-live", ClientsListLive);
