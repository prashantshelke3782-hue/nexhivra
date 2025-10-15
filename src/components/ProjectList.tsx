import { useEffect, useState } from 'react';
import { supabase, Project, Client, Payment } from '../lib/supabase';
import { Plus, Calendar, DollarSign, TrendingUp } from 'lucide-react';

interface ProjectListProps {
  onAddProject: () => void;
  statusFilter: string;
}

interface ProjectWithClient extends Project {
  clients?: Client;
  payments?: Payment[];
}

export const ProjectList = ({ onAddProject, statusFilter }: ProjectListProps) => {
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          clients (*),
          payments (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = (() => {
    if (statusFilter === 'All') return projects;
    if (statusFilter === 'Upcoming') {
      const today = new Date().toISOString().slice(0, 10);
      return projects.filter(p => (p.start_date ?? '') > today);
    }
    return projects.filter(p => p.status === statusFilter);
  })();

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
        <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
        <button
          onClick={onAddProject}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Project
        </button>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-6">
            {statusFilter !== 'All' ? `No ${statusFilter.toLowerCase()} projects` : 'Get started by adding your first project'}
          </p>
          {statusFilter === 'All' && (
            <button
              onClick={onAddProject}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add First Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredProjects.map((project) => {
            const paid = project.payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
            const remaining = Number(project.total_cost) - paid;
            const progress = project.total_cost > 0 ? (paid / Number(project.total_cost)) * 100 : 0;

            return (
              <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.project_name}</h3>
                    <p className="text-sm text-gray-600">{project.clients?.name}</p>
                    {project.description && (
                      <p className="text-sm text-gray-600 mt-2">{project.description}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-4 ${
                    project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    project.status === 'Ongoing' ? 'bg-blue-100 text-blue-700' :
                    project.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {project.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600">Start</p>
                      <p className="text-sm font-medium">{project.start_date || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600">Deadline</p>
                      <p className="text-sm font-medium">{project.deadline || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600">Total Cost</p>
                      <p className="text-sm font-medium">${Number(project.total_cost).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600">Remaining</p>
                      <p className="text-sm font-medium text-amber-600">${remaining.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Payment Progress</span>
                    <span className="font-medium text-gray-900">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
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
