import { useEffect, useState } from 'react';
import { supabase, Reminder, Client, Project } from '../lib/supabase';
import { Bell, Calendar, Plus, Trash2, AlertCircle } from 'lucide-react';

export const Reminders = () => {
  const [reminders, setReminders] = useState<(Reminder & { clients?: Client; projects?: Project })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('reminders')
        .select(`
          *,
          clients (*),
          projects (*)
        `)
        .gte('reminder_date', today)
        .eq('is_sent', false)
        .order('reminder_date', { ascending: true });

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsDone = async (reminderId: string) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ is_sent: true })
        .eq('id', reminderId);

      if (error) throw error;
      await loadReminders();
    } catch (error) {
      console.error('Error marking reminder as done:', error);
      alert('Failed to update reminder');
    }
  };

  const handleDelete = async (reminderId: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderId);

      if (error) throw error;
      await loadReminders();
    } catch (error) {
      console.error('Error deleting reminder:', error);
      alert('Failed to delete reminder');
    }
  };

  const isOverdue = (date: string) => {
    return new Date(date) < new Date();
  };

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
        <h2 className="text-2xl font-bold text-gray-900">Reminders</h2>
      </div>

      {reminders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming reminders</h3>
          <p className="text-gray-600">All caught up! No pending reminders at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reminders.map((reminder) => {
            const overdue = isOverdue(reminder.reminder_date);

            return (
              <div
                key={reminder.id}
                className={`bg-white rounded-xl shadow-sm border p-6 ${
                  overdue ? 'border-red-300 bg-red-50' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {overdue ? (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <Bell className="w-5 h-5 text-blue-600" />
                      )}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          reminder.reminder_type === 'payment'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {reminder.reminder_type}
                      </span>
                      {overdue && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          Overdue
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {reminder.clients?.name}
                      {reminder.projects && ` - ${reminder.projects.project_name}`}
                    </h3>

                    <p className="text-gray-700 mb-3">{reminder.message}</p>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(reminder.reminder_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => markAsDone(reminder.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Mark Done
                    </button>
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
