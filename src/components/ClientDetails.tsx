import { useEffect, useState } from 'react';
import { supabase, Client, Project, Payment, Note, FileRecord } from '../lib/supabase';
import { X, Mail, Phone, MapPin, MessageSquare, Calendar, DollarSign, FileText, Upload, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ClientDetailsProps {
  client: Client;
  onClose: () => void;
  onEdit: () => void;
}

interface ProjectWithPayments extends Project {
  payments?: Payment[];
}

export const ClientDetails = ({ client, onClose, onEdit }: ClientDetailsProps) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectWithPayments[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClientData();
  }, [client.id]);

  const loadClientData = async () => {
    try {
      const [projectsRes, notesRes, filesRes] = await Promise.all([
        supabase
          .from('projects')
          .select(`
            *,
            payments (*)
          `)
          .eq('client_id', client.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('notes')
          .select('*')
          .eq('client_id', client.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('files')
          .select('*')
          .eq('client_id', client.id)
          .order('uploaded_at', { ascending: false }),
      ]);

      setProjects(projectsRes.data || []);
      setNotes(notesRes.data || []);
      setFiles(filesRes.data || []);
    } catch (error) {
      console.error('Error loading client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const { error } = await supabase
        .from('notes')
        .insert([{
          client_id: client.id,
          note: newNote,
          created_by: user?.id,
        }]);

      if (error) throw error;
      setNewNote('');
      await loadClientData();
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      await loadClientData();
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note');
    }
  };

  const totalRevenue = projects.reduce((sum, project) => {
    const paid = project.payments?.reduce((pSum, p) => pSum + Number(p.amount), 0) || 0;
    return sum + paid;
  }, 0);

  const totalPending = projects.reduce((sum, project) => {
    const paid = project.payments?.reduce((pSum, p) => pSum + Number(p.amount), 0) || 0;
    return sum + (Number(project.total_cost) - paid);
  }, 0);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
            {client.contact_person && (
              <p className="text-gray-600 mt-1">{client.contact_person}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {client.email && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-600">Email</p>
                  <p className="text-sm font-medium text-gray-900">{client.email}</p>
                </div>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-600">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{client.phone}</p>
                </div>
              </div>
            )}
            {client.whatsapp && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-600">WhatsApp</p>
                  <p className="text-sm font-medium text-gray-900">{client.whatsapp}</p>
                </div>
              </div>
            )}
          </div>

          {client.address && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600">Address</p>
                <p className="text-sm font-medium text-gray-900">{client.address}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <p className="text-sm font-medium text-green-900">Total Revenue</p>
              </div>
              <p className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-amber-600" />
                <p className="text-sm font-medium text-amber-900">Pending Payments</p>
              </div>
              <p className="text-2xl font-bold text-amber-600">${totalPending.toLocaleString()}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Projects</h3>
            {projects.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No projects yet</p>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => {
                  const paid = project.payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
                  const remaining = Number(project.total_cost) - paid;

                  return (
                    <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{project.project_name}</h4>
                          {project.description && (
                            <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          project.status === 'Ongoing' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Start Date</p>
                          <p className="font-medium">{project.start_date || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Deadline</p>
                          <p className="font-medium">{project.deadline || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Cost</p>
                          <p className="font-medium">${Number(project.total_cost).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Remaining</p>
                          <p className="font-medium text-amber-600">${remaining.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Communication History</h3>
            <div className="space-y-3 mb-4">
              {notes.map((note) => (
                <div key={note.id} className="bg-gray-50 rounded-lg p-4 flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-gray-900">{note.note}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(note.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
              />
              <button
                onClick={handleAddNote}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
