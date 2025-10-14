import { useEffect, useState } from 'react';
import { supabase, Client, Project, Payment } from '../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Users, TrendingUp, Clock, AlertCircle } from 'lucide-react';

interface DashboardStats {
  totalClients: number;
  totalEarnings: number;
  pendingPayments: number;
  activeProjects: number;
}

interface ProjectStatusData {
  name: string;
  value: number;
}

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalEarnings: 0,
    pendingPayments: 0,
    activeProjects: 0,
  });
  const [projectStatusData, setProjectStatusData] = useState<ProjectStatusData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: clients } = await supabase
        .from('clients')
        .select('id');

      const { data: projects } = await supabase
        .from('projects')
        .select('id, status, total_cost');

      const { data: payments } = await supabase
        .from('payments')
        .select('amount');

      const totalClients = clients?.length || 0;
      const totalEarnings = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      const projectsWithCosts = projects || [];
      const totalProjectCosts = projectsWithCosts.reduce((sum, p) => sum + Number(p.total_cost), 0);
      const pendingPayments = totalProjectCosts - totalEarnings;

      const activeProjects = projects?.filter(p => p.status === 'Ongoing').length || 0;

      setStats({
        totalClients,
        totalEarnings,
        pendingPayments,
        activeProjects,
      });

      const statusCounts = {
        Pending: projects?.filter(p => p.status === 'Pending').length || 0,
        Ongoing: projects?.filter(p => p.status === 'Ongoing').length || 0,
        Completed: projects?.filter(p => p.status === 'Completed').length || 0,
      };

      setProjectStatusData([
        { name: 'Pending', value: statusCounts.Pending },
        { name: 'Ongoing', value: statusCounts.Ongoing },
        { name: 'Completed', value: statusCounts.Completed },
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalClients}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ${stats.totalEarnings.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">
                ${stats.pendingPayments.toLocaleString()}
              </p>
            </div>
            <div className="bg-amber-100 rounded-full p-3">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeProjects}</p>
            </div>
            <div className="bg-slate-100 rounded-full p-3">
              <Clock className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Projects by Status</h2>
          {projectStatusData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No projects yet</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: 'Total Earnings', amount: stats.totalEarnings },
                { name: 'Pending', amount: stats.pendingPayments },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              <Legend />
              <Bar dataKey="amount" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
