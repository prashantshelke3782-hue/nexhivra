import { useEffect, useState } from 'react';
import { supabase, Client, Project } from '../lib/supabase';
import { Plus, Search, Edit2, Trash2, Eye, Building2, Phone, Mail } from 'lucide-react';

interface ClientListProps {
  onEdit: (client: Client) => void;
  onView: (client: Client) => void;
  onAdd: () => void;
  searchQuery: string;
}

interface ClientWithProjects extends Client {
  projects?: Project[];
}

export const ClientList = ({ onEdit, onView, onAdd, searchQuery }: ClientListProps) => {
  const [clients, setClients] = useState<ClientWithProjects[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const { data: clientsData, error } = await supabase
        .from('clients')
        .select(`
          *,
          projects (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(clientsData || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client? This will also delete all associated projects, payments, and files.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Failed to delete client');
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Clients</h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Client
        </button>
      </div>

      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No clients found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery ? 'Try adjusting your search query' : 'Get started by adding your first client'}
          </p>
          {!searchQuery && (
            <button
              onClick={onAdd}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add First Client
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClients.map((client) => {
            const activeProjects = client.projects?.filter(p => p.status === 'Ongoing').length || 0;
            const completedProjects = client.projects?.filter(p => p.status === 'Completed').length || 0;

            return (
              <div key={client.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{client.name}</h3>
                      {client.contact_person && (
                        <p className="text-sm text-gray-600">{client.contact_person}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onView(client)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(client)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {client.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Projects:</span>
                      <div className="flex gap-3">
                        <span className="text-blue-600 font-medium">{activeProjects} Active</span>
                        <span className="text-green-600 font-medium">{completedProjects} Completed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
