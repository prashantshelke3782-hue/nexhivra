import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ClientList } from './components/ClientList';
import { ClientForm } from './components/ClientForm';
import { ClientDetails } from './components/ClientDetails';
import { ProjectList } from './components/ProjectList';
import { ProjectForm } from './components/ProjectForm';
import { PaymentTracking } from './components/PaymentTracking';
import { PaymentForm } from './components/PaymentForm';
import { FileManager } from './components/FileManager';
import { Reminders } from './components/Reminders';
import { Client } from './lib/supabase';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showClientForm, setShowClientForm] = useState(false);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [projectStatusFilter, setProjectStatusFilter] = useState('All');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleClientEdit = (client: Client) => {
    setSelectedClient(client);
    setShowClientForm(true);
  };

  const handleClientView = (client: Client) => {
    setSelectedClient(client);
    setShowClientDetails(true);
  };

  const handleClientAdd = () => {
    setSelectedClient(null);
    setShowClientForm(true);
  };

  const handleCloseClientForm = () => {
    setShowClientForm(false);
    setSelectedClient(null);
  };

  const handleCloseClientDetails = () => {
    setShowClientDetails(false);
    setSelectedClient(null);
  };

  const handleClientSave = () => {
    handleRefresh();
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard key={refreshKey} />;
      case 'clients':
        return (
          <>
            <ClientList
              key={refreshKey}
              onEdit={handleClientEdit}
              onView={handleClientView}
              onAdd={handleClientAdd}
              searchQuery={searchQuery}
            />
            {showClientForm && (
              <ClientForm
                client={selectedClient}
                onClose={handleCloseClientForm}
                onSave={handleClientSave}
              />
            )}
            {showClientDetails && selectedClient && (
              <ClientDetails
                client={selectedClient}
                onClose={handleCloseClientDetails}
                onEdit={() => {
                  setShowClientDetails(false);
                  setShowClientForm(true);
                }}
              />
            )}
          </>
        );
      case 'projects':
        return (
          <>
            <div className="mb-4 flex gap-2">
              {['All', 'Pending', 'Ongoing', 'Completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setProjectStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    projectStatusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <ProjectList
              key={refreshKey}
              onAddProject={() => setShowProjectForm(true)}
              statusFilter={projectStatusFilter}
            />
            {showProjectForm && (
              <ProjectForm
                onClose={() => setShowProjectForm(false)}
                onSave={() => {
                  handleRefresh();
                  setShowProjectForm(false);
                }}
              />
            )}
          </>
        );
      case 'payments':
        return (
          <>
            <PaymentTracking
              key={refreshKey}
              onAddPayment={() => setShowPaymentForm(true)}
            />
            {showPaymentForm && (
              <PaymentForm
                onClose={() => setShowPaymentForm(false)}
                onSave={() => {
                  handleRefresh();
                  setShowPaymentForm(false);
                }}
              />
            )}
          </>
        );
      case 'files':
        return <FileManager key={refreshKey} />;
      case 'reminders':
        return <Reminders key={refreshKey} />;
      default:
        return <Dashboard key={refreshKey} />;
    }
  };

  return (
    <AuthProvider>
      <ProtectedRoute>
        <Layout
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        >
          {renderContent()}
        </Layout>
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
