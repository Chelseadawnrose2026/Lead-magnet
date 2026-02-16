import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, BarChart3, Mail, CheckSquare, FileText, 
  Plus, Search, Filter, MoreVertical, Phone, MapPin,
  Calendar, Clock, ChevronRight, LogOut, Settings,
  Edit, Trash2, Send, Paperclip, X, Check, AlertCircle,
  Upload, LayoutGrid, MessageSquare, History, ChevronLeft,
  TrendingUp, Target, UserPlus, Building2, Link, ExternalLink
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Pipeline stages with colors
const STAGE_COLORS = {
  'New Lead': '#3B82F6',
  'Contacted': '#8B5CF6',
  'Responded': '#F59E0B',
  'Meeting Scheduled': '#10B981',
  'Proposal Sent': '#6366F1',
  'Booked': '#059669',
  'Completed': '#22C55E',
  'Declined': '#EF4444'
};

// Main CRM Dashboard
const CRMDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);
  const [loading, setLoading] = useState(!location.state?.user);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [todos, setTodos] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showForwardEmailModal, setShowForwardEmailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const loadDashboard = async () => {
    try {
      const [dashRes, contactsRes, companiesRes, todosRes] = await Promise.all([
        axios.get(`${API_URL}/api/crm/dashboard`, { withCredentials: true }),
        axios.get(`${API_URL}/api/crm/contacts`, { withCredentials: true }),
        axios.get(`${API_URL}/api/crm/companies`, { withCredentials: true }),
        axios.get(`${API_URL}/api/crm/todos`, { withCredentials: true })
      ]);
      setDashboard(dashRes.data);
      setContacts(contactsRes.data);
      setCompanies(companiesRes.data);
      setTodos(todosRes.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const processAuthCallback = async (sessionId) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/crm/auth/session`,
        { session_id: sessionId },
        { withCredentials: true }
      );
      setUser(response.data.user);
      setLoading(false);
      // Clear the hash from URL
      window.history.replaceState(null, '', '/crm');
      loadDashboard();
    } catch (error) {
      console.error('Auth callback error:', error);
      setLoading(false);
      navigate('/crm/login');
    }
  };

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/crm/auth/me`, {
        withCredentials: true
      });
      setUser(response.data);
      setLoading(false);
      loadDashboard();
    } catch (error) {
      setLoading(false);
      navigate('/crm/login');
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/api/crm/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
    navigate('/crm/login');
  };

  // Check auth on mount
  useEffect(() => {
    // Check if this is an OAuth callback with session_id
    const hash = location.hash;
    const sessionIdMatch = hash.match(/session_id=([^&]+)/);
    
    if (sessionIdMatch) {
      const sessionId = sessionIdMatch[1];
      processAuthCallback(sessionId);
      return;
    }
    
    if (!user) {
      checkAuth();
    } else {
      loadDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = 
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.organization_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = !stageFilter || c.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F9F5F4' }}>
        <div className="text-xl" style={{ color: '#7B3B3B' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#F9F5F4' }}>
      {/* Sidebar */}
      <div 
        className={`${sidebarCollapsed ? 'w-16' : 'w-64'} text-white p-4 flex flex-col transition-all duration-300 relative`} 
        style={{ background: 'linear-gradient(180deg, #7B3B3B 0%, #5a2a2a 100%)' }}
      >
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-8 bg-white text-gray-700 rounded-full p-1 shadow-lg hover:bg-gray-100 z-10"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className={`mb-8 ${sidebarCollapsed ? 'text-center' : ''}`}>
          {sidebarCollapsed ? (
            <h1 className="text-lg font-bold">CF</h1>
          ) : (
            <>
              <h1 className="text-xl font-bold">Chelsea Flynn</h1>
              <p className="text-sm opacity-80">CRM Dashboard</p>
            </>
          )}
        </div>
        
        <nav className="flex-1 space-y-2">
          {[
            { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
            { id: 'kpis', icon: TrendingUp, label: 'KPIs' },
            { id: 'pipeline', icon: LayoutGrid, label: 'Pipeline' },
            { id: 'contacts', icon: Users, label: 'Contacts' },
            { id: 'companies', icon: Building2, label: 'Companies' },
            { id: 'emails', icon: Mail, label: 'Emails' },
            { id: 'todos', icon: CheckSquare, label: 'To-Do List' },
            { id: 'documents', icon: FileText, label: 'Documents' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : ''} gap-3 px-4 py-3 rounded-lg transition ${
                activeTab === item.id ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
              data-testid={`nav-${item.id}`}
              title={sidebarCollapsed ? item.label : ''}
            >
              <item.icon className="w-5 h-5" />
              {!sidebarCollapsed && item.label}
            </button>
          ))}
        </nav>
        
        <div className="pt-4 border-t border-white/20">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 px-4 py-2 mb-2">
              {user?.picture && (
                <img src={user.picture} alt="" className="w-8 h-8 rounded-full" />
              )}
              <div className="flex-1 truncate">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs opacity-70 truncate">{user?.email}</p>
              </div>
            </div>
          )}
          {sidebarCollapsed && user?.picture && (
            <div className="flex justify-center mb-2">
              <img src={user.picture} alt="" className="w-8 h-8 rounded-full" />
            </div>
          )}
          <button
            onClick={logout}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : ''} gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition text-sm`}
            data-testid="logout-btn"
            title={sidebarCollapsed ? 'Logout' : ''}
          >
            <LogOut className="w-4 h-4" />
            {!sidebarCollapsed && 'Logout'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        {activeTab === 'dashboard' && (
          <DashboardView 
            dashboard={dashboard} 
            contacts={contacts}
            todos={todos}
            onContactClick={(c) => { setSelectedContact(c); setShowContactModal(true); }}
            onTodoToggle={async (todo) => {
              await axios.put(`${API_URL}/api/crm/todos/${todo.id}`, 
                { completed: !todo.completed }, 
                { withCredentials: true }
              );
              loadDashboard();
            }}
          />
        )}
        
        {activeTab === 'kpis' && (
          <KPIsView contacts={contacts} />
        )}
        
        {activeTab === 'pipeline' && (
          <KanbanView 
            contacts={contacts}
            onEditContact={(c) => { setSelectedContact(c); setShowContactModal(true); }}
            onStageChange={async (contact, newStage) => {
              await axios.put(`${API_URL}/api/crm/contacts/${contact.id}`, 
                { stage: newStage }, 
                { withCredentials: true }
              );
              loadDashboard();
              toast.success('Stage updated');
            }}
          />
        )}
        
        {activeTab === 'contacts' && (
          <ContactsView 
            contacts={filteredContacts}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            stageFilter={stageFilter}
            setStageFilter={setStageFilter}
            onAddContact={() => { setSelectedContact(null); setShowContactModal(true); }}
            onEditContact={(c) => { setSelectedContact(c); setShowContactModal(true); }}
            onEmailContact={(c) => { setSelectedContact(c); setShowEmailModal(true); }}
            onDeleteContact={async (c) => {
              if (window.confirm(`Delete ${c.first_name} ${c.last_name}?`)) {
                await axios.delete(`${API_URL}/api/crm/contacts/${c.id}`, { withCredentials: true });
                loadDashboard();
                toast.success('Contact deleted');
              }
            }}
            onStageChange={async (contact, newStage) => {
              await axios.put(`${API_URL}/api/crm/contacts/${contact.id}`, 
                { stage: newStage }, 
                { withCredentials: true }
              );
              loadDashboard();
              toast.success('Stage updated');
            }}
            onImportCSV={async (file) => {
              const formData = new FormData();
              formData.append('file', file);
              try {
                const response = await axios.post(`${API_URL}/api/crm/contacts/import`, formData, {
                  withCredentials: true,
                  headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success(`Imported ${response.data.imported} contacts`);
                if (response.data.errors?.length > 0) {
                  toast.warning(`${response.data.errors.length} rows had errors`);
                }
                loadDashboard();
              } catch (error) {
                toast.error('Error importing contacts');
              }
            }}
            onMassEmail={(selectedContacts) => {
              setSelectedContact(selectedContacts);
              setShowEmailModal(true);
            }}
            onAddActivity={(contact) => {
              setSelectedContact(contact);
              setShowActivityModal(true);
            }}
            onBulkAssignOrg={async (contactIds, orgName, orgType) => {
              try {
                await Promise.all(contactIds.map(id => 
                  axios.put(`${API_URL}/api/crm/contacts/${id}`, {
                    organization_name: orgName,
                    ...(orgType && { organization_type: orgType })
                  }, { withCredentials: true })
                ));
                toast.success(`Assigned ${contactIds.length} contacts to ${orgName}`);
                loadDashboard();
              } catch (error) {
                toast.error('Error assigning contacts');
              }
            }}
          />
        )}
        
        {activeTab === 'emails' && (
          <EmailsView 
            contacts={contacts}
            onSendEmail={(contacts) => { 
              setSelectedContact(contacts);
              setShowEmailModal(true); 
            }}
            onForwardEmail={() => setShowForwardEmailModal(true)}
          />
        )}
        
        {activeTab === 'companies' && (
          <CompaniesView 
            companies={companies}
            contacts={contacts}
            onAddCompany={() => { setSelectedCompany(null); setShowCompanyModal(true); }}
            onEditCompany={(c) => { setSelectedCompany(c); setShowCompanyModal(true); }}
            onDeleteCompany={async (c) => {
              if (window.confirm(`Delete ${c.name}? Contacts will be unlinked.`)) {
                await axios.delete(`${API_URL}/api/crm/companies/${c.id}`, { withCredentials: true });
                loadDashboard();
                toast.success('Company deleted');
              }
            }}
            onViewContact={(contact) => { 
              setSelectedContact(contact); 
              setShowContactModal(true); 
            }}
            setActiveTab={setActiveTab}
          />
        )}
        
        {activeTab === 'todos' && (
          <TodosView 
            todos={todos}
            contacts={contacts}
            onAddTodo={() => setShowTodoModal(true)}
            onToggleTodo={async (todo) => {
              await axios.put(`${API_URL}/api/crm/todos/${todo.id}`, 
                { completed: !todo.completed }, 
                { withCredentials: true }
              );
              loadDashboard();
            }}
            onDeleteTodo={async (todo) => {
              await axios.delete(`${API_URL}/api/crm/todos/${todo.id}`, { withCredentials: true });
              loadDashboard();
              toast.success('Todo deleted');
            }}
          />
        )}
        
        {activeTab === 'documents' && (
          <DocumentsView contacts={contacts} />
        )}
      </div>

      {/* Modals */}
      {showContactModal && (
        <ContactModal 
          contact={selectedContact}
          onClose={() => { setShowContactModal(false); setSelectedContact(null); }}
          companies={companies}
          onViewCompany={(company) => {
            setShowContactModal(false);
            setSelectedContact(null);
            setActiveTab('companies');
          }}
          onSave={async (data) => {
            try {
              if (selectedContact) {
                await axios.put(`${API_URL}/api/crm/contacts/${selectedContact.id}`, data, { withCredentials: true });
                toast.success('Contact updated');
              } else {
                await axios.post(`${API_URL}/api/crm/contacts`, data, { withCredentials: true });
                toast.success('Contact created');
              }
              loadDashboard();
              setShowContactModal(false);
              setSelectedContact(null);
            } catch (error) {
              toast.error('Error saving contact');
            }
          }}
        />
      )}
      
      {showEmailModal && (
        <EmailModal 
          contacts={Array.isArray(selectedContact) ? selectedContact : [selectedContact]}
          onClose={() => { setShowEmailModal(false); setSelectedContact(null); }}
          onSend={async (data) => {
            try {
              const contactIds = Array.isArray(selectedContact) 
                ? selectedContact.map(c => c.id) 
                : [selectedContact.id];
              
              if (contactIds.length === 1) {
                await axios.post(`${API_URL}/api/crm/send-email`, {
                  to_email: Array.isArray(selectedContact) ? selectedContact[0].email : selectedContact.email,
                  contact_id: contactIds[0],
                  ...data
                }, { withCredentials: true });
              } else {
                await axios.post(`${API_URL}/api/crm/send-mass-email`, {
                  contact_ids: contactIds,
                  ...data
                }, { withCredentials: true });
              }
              toast.success('Email sent!');
              setShowEmailModal(false);
              setSelectedContact(null);
            } catch (error) {
              toast.error('Error sending email');
            }
          }}
        />
      )}
      
      {showTodoModal && (
        <TodoModal 
          contacts={contacts}
          onClose={() => setShowTodoModal(false)}
          onSave={async (data) => {
            try {
              await axios.post(`${API_URL}/api/crm/todos`, data, { withCredentials: true });
              toast.success('Todo created');
              loadDashboard();
              setShowTodoModal(false);
            } catch (error) {
              toast.error('Error creating todo');
            }
          }}
        />
      )}

      {showActivityModal && selectedContact && (
        <ActivityModal 
          contact={selectedContact}
          onClose={() => { setShowActivityModal(false); setSelectedContact(null); }}
          onSave={async (data) => {
            try {
              // Create timestamped note entry
              const timestamp = new Date().toLocaleString();
              const activityLabel = {
                'email_received': '📧 Email Received',
                'email_sent': '📤 Email Sent',
                'call': '📞 Phone Call',
                'meeting': '🤝 Meeting',
                'note': '📝 Note',
                'follow_up': '✅ Follow-up',
                'other': '📌 Other'
              }[data.activity_type] || '📌 Activity';
              
              const newNote = `[${timestamp}] ${activityLabel}:\n${data.description}\n\n`;
              const existingNotes = selectedContact.notes || '';
              const updatedNotes = newNote + existingNotes;
              
              // Update contact with appended notes
              await axios.put(`${API_URL}/api/crm/contacts/${selectedContact.id}`, {
                notes: updatedNotes,
                last_contacted: data.activity_type === 'email_received' || data.activity_type === 'call' || data.activity_type === 'meeting'
                  ? new Date().toISOString().split('T')[0] 
                  : selectedContact.last_contacted
              }, { withCredentials: true });
              
              // Also log to activities collection for history
              await axios.post(`${API_URL}/api/crm/activities`, {
                contact_id: selectedContact.id,
                ...data
              }, { withCredentials: true });
              
              toast.success('Activity logged');
              loadDashboard();
              setShowActivityModal(false);
              setSelectedContact(null);
            } catch (error) {
              toast.error('Error logging activity');
            }
          }}
        />
      )}

      {showCompanyModal && (
        <CompanyModal 
          company={selectedCompany}
          onClose={() => { setShowCompanyModal(false); setSelectedCompany(null); }}
          onSave={async (data) => {
            try {
              if (selectedCompany) {
                await axios.put(`${API_URL}/api/crm/companies/${selectedCompany.id}`, data, { withCredentials: true });
                toast.success('Company updated');
              } else {
                await axios.post(`${API_URL}/api/crm/companies`, data, { withCredentials: true });
                toast.success('Company created');
              }
              loadDashboard();
              setShowCompanyModal(false);
              setSelectedCompany(null);
            } catch (error) {
              toast.error('Error saving company');
            }
          }}
        />
      )}

      {showForwardEmailModal && (
        <ForwardEmailModal 
          onClose={() => setShowForwardEmailModal(false)}
          onSave={async (data) => {
            try {
              const response = await axios.post(`${API_URL}/api/crm/forward-email`, data, { withCredentials: true });
              toast.success(response.data.message);
              loadDashboard();
              setShowForwardEmailModal(false);
            } catch (error) {
              toast.error('Error processing email');
            }
          }}
        />
      )}
    </div>
  );
};

// Dashboard View Component
const DashboardView = ({ dashboard, contacts, todos, onContactClick, onTodoToggle }) => {
  if (!dashboard) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: '#7B3B3B' }}>Dashboard</h2>
      
      {/* Pipeline Summary */}
      <div className="grid grid-cols-4 gap-4">
        {dashboard.pipeline.map(item => (
          <Card key={item.stage} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{item.stage}</p>
                <p className="text-2xl font-bold" style={{ color: STAGE_COLORS[item.stage] }}>
                  {item.count}
                </p>
              </div>
              <div 
                className="w-3 h-12 rounded-full"
                style={{ backgroundColor: STAGE_COLORS[item.stage] }}
              />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Upcoming Follow-ups */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#7B3B3B' }}>
            <Calendar className="w-5 h-5" />
            Upcoming Follow-ups
          </h3>
          <div className="space-y-3">
            {dashboard.upcoming_followups.length === 0 ? (
              <p className="text-gray-500 text-sm">No upcoming follow-ups</p>
            ) : (
              dashboard.upcoming_followups.slice(0, 5).map(contact => (
                <div 
                  key={contact.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => onContactClick(contact)}
                >
                  <div>
                    <p className="font-medium">{contact.first_name} {contact.last_name}</p>
                    <p className="text-sm text-gray-500">{contact.organization_name}</p>
                  </div>
                  <span className="text-sm" style={{ color: '#7B3B3B' }}>
                    {contact.follow_up_date}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Pending Todos */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#7B3B3B' }}>
            <CheckSquare className="w-5 h-5" />
            Pending Tasks
          </h3>
          <div className="space-y-3">
            {dashboard.pending_todos.length === 0 ? (
              <p className="text-gray-500 text-sm">No pending tasks</p>
            ) : (
              dashboard.pending_todos.slice(0, 5).map(todo => (
                <div 
                  key={todo.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <button
                    onClick={() => onTodoToggle(todo)}
                    className="w-5 h-5 border-2 rounded flex items-center justify-center hover:bg-gray-200"
                    style={{ borderColor: '#7B3B3B' }}
                  >
                    {todo.completed && <Check className="w-3 h-3" style={{ color: '#7B3B3B' }} />}
                  </button>
                  <div className="flex-1">
                    <p className="font-medium">{todo.title}</p>
                    {todo.due_date && (
                      <p className="text-sm text-gray-500">Due: {todo.due_date}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#7B3B3B' }}>
          <Clock className="w-5 h-5" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {dashboard.recent_activities.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent activity</p>
          ) : (
            dashboard.recent_activities.map(activity => (
              <div key={activity.id} className="flex items-start gap-3 p-3 border-b last:border-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E0C4C0' }}>
                  {activity.activity_type === 'email_sent' && <Mail className="w-4 h-4" style={{ color: '#7B3B3B' }} />}
                  {activity.activity_type === 'stage_change' && <ChevronRight className="w-4 h-4" style={{ color: '#7B3B3B' }} />}
                  {activity.activity_type === 'created' && <Plus className="w-4 h-4" style={{ color: '#7B3B3B' }} />}
                  {activity.activity_type === 'note' && <FileText className="w-4 h-4" style={{ color: '#7B3B3B' }} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-gray-400">{new Date(activity.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

// KPIs View Component
const KPIsView = ({ contacts }) => {
  const [timeRange, setTimeRange] = useState('month'); // week, month, quarter, year
  
  // Calculate date ranges
  const now = new Date();
  const getDateRange = () => {
    const end = now;
    let start;
    switch(timeRange) {
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    return { start, end };
  };
  
  const { start } = getDateRange();
  
  // Calculate KPIs
  const newContacts = contacts.filter(c => {
    const created = new Date(c.created_at);
    return created >= start;
  }).length;
  
  const proposalsSent = contacts.filter(c => c.stage === 'Proposal Sent').length;
  const bookings = contacts.filter(c => c.stage === 'Booked' || c.stage === 'Completed').length;
  const newBookingsThisPeriod = contacts.filter(c => {
    const created = new Date(c.created_at);
    return created >= start && (c.stage === 'Booked' || c.stage === 'Completed');
  }).length;
  
  const conversionRate = contacts.length > 0 
    ? ((bookings / contacts.length) * 100).toFixed(1) 
    : 0;
  
  // Group contacts by organization
  const orgGroups = contacts.reduce((acc, c) => {
    const org = c.organization_name || 'No Organization';
    if (!acc[org]) acc[org] = [];
    acc[org].push(c);
    return acc;
  }, {});
  
  // Stage breakdown
  const stageBreakdown = Object.keys(STAGE_COLORS).map(stage => ({
    stage,
    count: contacts.filter(c => c.stage === stage).length,
    color: STAGE_COLORS[stage]
  }));
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: '#7B3B3B' }}>KPI Dashboard</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>
      
      {/* Main KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#E0C4C0' }}>
              <UserPlus className="w-6 h-6" style={{ color: '#7B3B3B' }} />
            </div>
            <div>
              <p className="text-sm text-gray-500">New Contacts</p>
              <p className="text-3xl font-bold" style={{ color: '#7B3B3B' }}>{newContacts}</p>
              <p className="text-xs text-gray-400">this {timeRange}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#E0C4C0' }}>
              <Send className="w-6 h-6" style={{ color: '#7B3B3B' }} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Proposals Sent</p>
              <p className="text-3xl font-bold" style={{ color: '#6366F1' }}>{proposalsSent}</p>
              <p className="text-xs text-gray-400">pending response</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#E0C4C0' }}>
              <Target className="w-6 h-6" style={{ color: '#7B3B3B' }} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Bookings</p>
              <p className="text-3xl font-bold" style={{ color: '#059669' }}>{bookings}</p>
              <p className="text-xs text-gray-400">{newBookingsThisPeriod} this {timeRange}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#E0C4C0' }}>
              <TrendingUp className="w-6 h-6" style={{ color: '#7B3B3B' }} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Conversion Rate</p>
              <p className="text-3xl font-bold" style={{ color: '#7B3B3B' }}>{conversionRate}%</p>
              <p className="text-xs text-gray-400">leads to bookings</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Pipeline Breakdown */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#7B3B3B' }}>Pipeline Breakdown</h3>
          <div className="space-y-3">
            {stageBreakdown.map(item => (
              <div key={item.stage} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="flex-1 text-sm">{item.stage}</span>
                <span className="font-semibold">{item.count}</span>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{ 
                      backgroundColor: item.color,
                      width: `${contacts.length > 0 ? (item.count / contacts.length) * 100 : 0}%`
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#7B3B3B' }}>Contacts by Organization</h3>
          <div className="space-y-2 max-h-64 overflow-auto">
            {Object.entries(orgGroups)
              .sort((a, b) => b[1].length - a[1].length)
              .slice(0, 10)
              .map(([org, orgContacts]) => (
                <div key={org} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm truncate flex-1">{org}</span>
                  <span className="text-sm font-semibold ml-2" style={{ color: '#7B3B3B' }}>
                    {orgContacts.length} contact{orgContacts.length > 1 ? 's' : ''}
                  </span>
                </div>
              ))
            }
          </div>
        </Card>
      </div>
      
      {/* Quick Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#7B3B3B' }}>Quick Stats</h3>
        <div className="grid grid-cols-5 gap-4 text-center">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold" style={{ color: '#7B3B3B' }}>{contacts.length}</p>
            <p className="text-xs text-gray-500">Total Contacts</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold" style={{ color: '#3B82F6' }}>
              {contacts.filter(c => c.stage === 'New Lead').length}
            </p>
            <p className="text-xs text-gray-500">New Leads</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold" style={{ color: '#10B981' }}>
              {contacts.filter(c => c.stage === 'Meeting Scheduled').length}
            </p>
            <p className="text-xs text-gray-500">Meetings Scheduled</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold" style={{ color: '#EF4444' }}>
              {contacts.filter(c => c.stage === 'Declined').length}
            </p>
            <p className="text-xs text-gray-500">Declined</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold" style={{ color: '#22C55E' }}>
              {contacts.filter(c => c.stage === 'Completed').length}
            </p>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Kanban Pipeline View Component
const KanbanView = ({ contacts, onEditContact, onStageChange }) => {
  const stages = Object.keys(STAGE_COLORS);
  
  const handleDragStart = (e, contact) => {
    e.dataTransfer.setData('contactId', contact.id);
    e.dataTransfer.setData('currentStage', contact.stage);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleDrop = (e, newStage) => {
    e.preventDefault();
    const contactId = e.dataTransfer.getData('contactId');
    const currentStage = e.dataTransfer.getData('currentStage');
    
    if (currentStage !== newStage) {
      const contact = contacts.find(c => c.id === contactId);
      if (contact) {
        onStageChange(contact, newStage);
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: '#7B3B3B' }}>Sales Pipeline</h2>
      <p className="text-gray-500 text-sm">Drag contacts between stages to update their status</p>
      
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map(stage => {
          const stageContacts = contacts.filter(c => c.stage === stage);
          return (
            <div
              key={stage}
              className="flex-shrink-0 w-72 bg-gray-50 rounded-xl p-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: STAGE_COLORS[stage] }}
                  />
                  <h3 className="font-semibold text-sm">{stage}</h3>
                </div>
                <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                  {stageContacts.length}
                </span>
              </div>
              
              <div className="space-y-3 min-h-[200px]">
                {stageContacts.map(contact => (
                  <div
                    key={contact.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, contact)}
                    onClick={() => onEditContact(contact)}
                    className="bg-white p-3 rounded-lg shadow-sm cursor-move hover:shadow-md transition border-l-4"
                    style={{ borderLeftColor: STAGE_COLORS[stage] }}
                  >
                    <p className="font-medium text-sm">
                      {contact.first_name} {contact.last_name}
                    </p>
                    {contact.organization_name && (
                      <p className="text-xs text-gray-500 mt-1">{contact.organization_name}</p>
                    )}
                    {contact.follow_up_date && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {contact.follow_up_date}
                      </div>
                    )}
                  </div>
                ))}
                {stageContacts.length === 0 && (
                  <div className="text-center text-gray-400 text-sm py-8">
                    Drop contacts here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Expandable Notes Cell Component
const NotesCell = ({ notes }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!notes) {
    return <td className="px-3 py-2 text-gray-400">-</td>;
  }
  
  const isLong = notes.length > 50;
  
  return (
    <td className="px-3 py-2 max-w-[200px] relative">
      {expanded ? (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4" onClick={() => setExpanded(false)}>
          <div 
            className="bg-white rounded-lg shadow-xl p-4 max-w-lg max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-gray-700">Notes</h4>
              <button 
                onClick={() => setExpanded(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{notes}</p>
          </div>
        </div>
      ) : null}
      <div 
        className={`text-sm ${isLong ? 'cursor-pointer hover:bg-gray-50 rounded p-1 -m-1' : ''}`}
        onClick={() => isLong && setExpanded(true)}
      >
        <span className="block truncate">
          {notes.substring(0, 50)}
          {isLong && '...'}
        </span>
        {isLong && (
          <span className="text-xs text-blue-500 hover:underline">Click to expand</span>
        )}
      </div>
    </td>
  );
};

// All available columns for contacts table
const ALL_COLUMNS = [
  { id: 'select', label: '', alwaysVisible: true },
  { id: 'number', label: '#', alwaysVisible: true },
  { id: 'name', label: 'Name', default: true },
  { id: 'email', label: 'Email', default: true },
  { id: 'phone', label: 'Phone', default: true },
  { id: 'organization', label: 'Organization', default: true },
  { id: 'organization_type', label: 'Org Type', default: false },
  { id: 'role', label: 'Role', default: true },
  { id: 'stage', label: 'Stage', default: true },
  { id: 'address', label: 'Address', default: false },
  { id: 'city', label: 'City', default: false },
  { id: 'state', label: 'State', default: false },
  { id: 'country', label: 'Country', default: false },
  { id: 'follow_up', label: 'Follow-up', default: true },
  { id: 'last_contacted', label: 'Last Contacted', default: true },
  { id: 'notes', label: 'Notes', default: true },
  { id: 'documents', label: 'Documents', default: false },
  { id: 'actions', label: 'Actions', alwaysVisible: true },
];

// Bulk Organization Assign Component
const BulkOrganizationAssign = ({ selectedContacts, allContacts, onAssign }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [newOrg, setNewOrg] = useState('');
  const [newOrgType, setNewOrgType] = useState('');
  
  // Get unique organizations from existing contacts
  const existingOrgs = [...new Set(allContacts.map(c => c.organization_name).filter(Boolean))];
  
  return (
    <div className="relative">
      <Button 
        size="sm"
        variant="outline"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Users className="w-4 h-4 mr-2" />
        Assign to Org
      </Button>
      
      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute left-0 top-full mt-2 bg-white border rounded-lg shadow-lg p-3 z-50 w-72">
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold text-sm text-gray-600">Assign to Organization</p>
              <button onClick={() => setShowDropdown(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {existingOrgs.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Existing Organizations:</p>
                <div className="max-h-32 overflow-auto space-y-1">
                  {existingOrgs.map(org => (
                    <button
                      key={org}
                      onClick={() => {
                        onAssign(selectedContacts.map(c => c.id), org, null);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded truncate"
                    >
                      {org}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="border-t pt-2">
              <p className="text-xs text-gray-500 mb-1">Or create new:</p>
              <input
                type="text"
                value={newOrg}
                onChange={(e) => setNewOrg(e.target.value)}
                placeholder="Organization name"
                className="w-full px-2 py-1 border rounded text-sm mb-2"
              />
              <select
                value={newOrgType}
                onChange={(e) => setNewOrgType(e.target.value)}
                className="w-full px-2 py-1 border rounded text-sm mb-2"
              >
                <option value="">Select type...</option>
                <option value="Parish">Parish</option>
                <option value="Conference">Conference</option>
                <option value="Diocese">Diocese</option>
                <option value="Retreat Center">Retreat Center</option>
                <option value="School">School</option>
                <option value="Other">Other</option>
              </select>
              <Button 
                size="sm"
                onClick={() => {
                  if (newOrg) {
                    onAssign(selectedContacts.map(c => c.id), newOrg, newOrgType);
                    setShowDropdown(false);
                    setNewOrg('');
                    setNewOrgType('');
                  }
                }}
                disabled={!newOrg}
                className="w-full"
                style={{ backgroundColor: '#7B3B3B' }}
              >
                Assign to New Org
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Contacts View Component
const ContactsView = ({ 
  contacts, searchTerm, setSearchTerm, stageFilter, setStageFilter,
  onAddContact, onEditContact, onEmailContact, onDeleteContact, onStageChange,
  onImportCSV, onMassEmail, onAddActivity, onBulkAssignOrg
}) => {
  const fileInputRef = React.useRef(null);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState(
    ALL_COLUMNS.filter(c => c.default || c.alwaysVisible).map(c => c.id)
  );
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [columnFilters, setColumnFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await onImportCSV(file);
      e.target.value = '';
    }
  };

  const toggleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id));
    }
  };

  const toggleSelectContact = (contactId) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const toggleColumn = (columnId) => {
    setVisibleColumns(prev => 
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  // Apply column filters
  const filteredContacts = contacts.filter(contact => {
    // Check column-specific filters
    for (const [key, value] of Object.entries(columnFilters)) {
      if (!value) continue;
      const filterValue = value.toLowerCase();
      
      switch(key) {
        case 'city':
          if (!contact.city?.toLowerCase().includes(filterValue)) return false;
          break;
        case 'state':
          if (!contact.state?.toLowerCase().includes(filterValue)) return false;
          break;
        case 'country':
          if (!contact.country?.toLowerCase().includes(filterValue)) return false;
          break;
        case 'organization_type':
          if (!contact.organization_type?.toLowerCase().includes(filterValue)) return false;
          break;
        case 'role':
          if (!contact.role?.toLowerCase().includes(filterValue)) return false;
          break;
        default:
          break;
      }
    }
    return true;
  });

  const selectedContactObjects = contacts.filter(c => selectedContacts.includes(c.id));

  const isColumnVisible = (colId) => visibleColumns.includes(colId);
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: '#7B3B3B' }}>Contacts</h2>
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />
          <Button 
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            data-testid="import-csv-btn"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button 
            onClick={onAddContact}
            style={{ backgroundColor: '#7B3B3B' }}
            data-testid="add-contact-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Search, Filters, and Column Settings Row */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
            data-testid="search-contacts"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none"
          data-testid="stage-filter"
        >
          <option value="">All Stages</option>
          {Object.keys(STAGE_COLORS).map(stage => (
            <option key={stage} value={stage}>{stage}</option>
          ))}
        </select>
        
        {/* Column Settings Button */}
        <div className="relative">
          <Button 
            variant="outline" 
            onClick={() => setShowColumnSettings(!showColumnSettings)}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Columns
          </Button>
          {showColumnSettings && (
            <>
              {/* Invisible overlay to catch clicks outside */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowColumnSettings(false)}
              />
              <div className="absolute right-0 top-full mt-2 bg-white border rounded-lg shadow-lg p-3 z-50 w-56 max-h-80 overflow-auto">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-sm text-gray-600">Show/Hide Columns</p>
                  <button 
                    onClick={() => setShowColumnSettings(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {/* Show All / Hide All buttons */}
                <div className="flex gap-2 mb-2 pb-2 border-b">
                  <button
                    onClick={() => setVisibleColumns(ALL_COLUMNS.map(c => c.id))}
                    className="flex-1 text-xs py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    Show All
                  </button>
                  <button
                    onClick={() => setVisibleColumns(ALL_COLUMNS.filter(c => c.alwaysVisible).map(c => c.id))}
                    className="flex-1 text-xs py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    Hide All
                  </button>
                </div>
                {ALL_COLUMNS.filter(c => !c.alwaysVisible).map(col => (
                  <label key={col.id} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 px-2 rounded">
                    <input
                      type="checkbox"
                      checked={visibleColumns.includes(col.id)}
                      onChange={() => toggleColumn(col.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{col.label}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Filters Toggle */}
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Column Filters */}
      {showFilters && (
        <Card className="p-4">
          <p className="font-semibold text-sm mb-3 text-gray-600">Filter by Column</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <div>
              <label className="text-xs text-gray-500">City</label>
              <input
                type="text"
                value={columnFilters.city || ''}
                onChange={(e) => setColumnFilters({...columnFilters, city: e.target.value})}
                className="w-full px-2 py-1 border rounded text-sm"
                placeholder="Filter city..."
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">State</label>
              <input
                type="text"
                value={columnFilters.state || ''}
                onChange={(e) => setColumnFilters({...columnFilters, state: e.target.value})}
                className="w-full px-2 py-1 border rounded text-sm"
                placeholder="Filter state..."
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Country</label>
              <input
                type="text"
                value={columnFilters.country || ''}
                onChange={(e) => setColumnFilters({...columnFilters, country: e.target.value})}
                className="w-full px-2 py-1 border rounded text-sm"
                placeholder="Filter country..."
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Org Type</label>
              <input
                type="text"
                value={columnFilters.organization_type || ''}
                onChange={(e) => setColumnFilters({...columnFilters, organization_type: e.target.value})}
                className="w-full px-2 py-1 border rounded text-sm"
                placeholder="Filter org type..."
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Role</label>
              <input
                type="text"
                value={columnFilters.role || ''}
                onChange={(e) => setColumnFilters({...columnFilters, role: e.target.value})}
                className="w-full px-2 py-1 border rounded text-sm"
                placeholder="Filter role..."
              />
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setColumnFilters({})}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Selected Actions Bar */}
      {selectedContacts.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: '#E0C4C0' }}>
          <span className="font-medium" style={{ color: '#7B3B3B' }}>
            {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''} selected
          </span>
          <Button 
            size="sm"
            onClick={() => onMassEmail(selectedContactObjects)}
            style={{ backgroundColor: '#7B3B3B' }}
          >
            <Mail className="w-4 h-4 mr-2" />
            Email Selected
          </Button>
          <BulkOrganizationAssign 
            selectedContacts={selectedContactObjects}
            allContacts={contacts}
            onAssign={onBulkAssignOrg}
          />
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setSelectedContacts([])}
          >
            Clear Selection
          </Button>
        </div>
      )}

      {/* Contacts Table */}
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: '#7B3B3B' }}>
            <tr className="text-white text-left">
              {isColumnVisible('select') && (
                <th className="px-3 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 cursor-pointer"
                    title="Select All"
                  />
                </th>
              )}
              {isColumnVisible('number') && <th className="px-2 py-3 w-10">#</th>}
              {isColumnVisible('name') && <th className="px-3 py-3">Name</th>}
              {isColumnVisible('email') && <th className="px-3 py-3">Email</th>}
              {isColumnVisible('phone') && <th className="px-3 py-3">Phone</th>}
              {isColumnVisible('organization') && <th className="px-3 py-3">Organization</th>}
              {isColumnVisible('organization_type') && <th className="px-3 py-3">Org Type</th>}
              {isColumnVisible('role') && <th className="px-3 py-3">Role</th>}
              {isColumnVisible('stage') && <th className="px-3 py-3">Stage</th>}
              {isColumnVisible('address') && <th className="px-3 py-3">Address</th>}
              {isColumnVisible('city') && <th className="px-3 py-3">City</th>}
              {isColumnVisible('state') && <th className="px-3 py-3">State</th>}
              {isColumnVisible('country') && <th className="px-3 py-3">Country</th>}
              {isColumnVisible('follow_up') && <th className="px-3 py-3">Follow-up</th>}
              {isColumnVisible('last_contacted') && <th className="px-3 py-3">Last Contacted</th>}
              {isColumnVisible('notes') && <th className="px-3 py-3">Notes</th>}
              {isColumnVisible('documents') && <th className="px-3 py-3">Documents</th>}
              {isColumnVisible('actions') && <th className="px-3 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length} className="px-4 py-8 text-center text-gray-500">
                  No contacts found
                </td>
              </tr>
            ) : (
              filteredContacts.map((contact, index) => (
                <tr 
                  key={contact.id} 
                  className={`border-b hover:bg-gray-50 ${selectedContacts.includes(contact.id) ? 'bg-rose-50' : ''}`}
                >
                  {isColumnVisible('select') && (
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => toggleSelectContact(contact.id)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                  )}
                  {isColumnVisible('number') && (
                    <td className="px-2 py-2 text-gray-500">{index + 1}</td>
                  )}
                  {isColumnVisible('name') && (
                    <td className="px-3 py-2">
                      <p className="font-medium">{contact.first_name} {contact.last_name}</p>
                    </td>
                  )}
                  {isColumnVisible('email') && (
                    <td className="px-3 py-2">{contact.email}</td>
                  )}
                  {isColumnVisible('phone') && (
                    <td className="px-3 py-2">{contact.phone || '-'}</td>
                  )}
                  {isColumnVisible('organization') && (
                    <td className="px-3 py-2">{contact.organization_name || '-'}</td>
                  )}
                  {isColumnVisible('organization_type') && (
                    <td className="px-3 py-2">{contact.organization_type || '-'}</td>
                  )}
                  {isColumnVisible('role') && (
                    <td className="px-3 py-2">{contact.role || '-'}</td>
                  )}
                  {isColumnVisible('stage') && (
                    <td className="px-3 py-2">
                      <select
                        value={contact.stage}
                        onChange={(e) => onStageChange(contact, e.target.value)}
                        className="px-2 py-1 rounded text-xs text-white cursor-pointer"
                        style={{ backgroundColor: STAGE_COLORS[contact.stage] }}
                      >
                        {Object.keys(STAGE_COLORS).map(stage => (
                          <option key={stage} value={stage}>{stage}</option>
                        ))}
                      </select>
                    </td>
                  )}
                  {isColumnVisible('address') && (
                    <td className="px-3 py-2 max-w-[150px] truncate" title={contact.address}>
                      {contact.address || '-'}
                    </td>
                  )}
                  {isColumnVisible('city') && (
                    <td className="px-3 py-2">{contact.city || '-'}</td>
                  )}
                  {isColumnVisible('state') && (
                    <td className="px-3 py-2">{contact.state || '-'}</td>
                  )}
                  {isColumnVisible('country') && (
                    <td className="px-3 py-2">{contact.country || '-'}</td>
                  )}
                  {isColumnVisible('follow_up') && (
                    <td className="px-3 py-2">{contact.follow_up_date || '-'}</td>
                  )}
                  {isColumnVisible('last_contacted') && (
                    <td className="px-3 py-2">{contact.last_contacted || '-'}</td>
                  )}
                  {isColumnVisible('notes') && (
                    <NotesCell notes={contact.notes} />
                  )}
                  {isColumnVisible('documents') && (
                    <td className="px-3 py-2">
                      {contact.documents?.length > 0 ? (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {contact.documents.length} file{contact.documents.length > 1 ? 's' : ''}
                        </span>
                      ) : '-'}
                    </td>
                  )}
                  {isColumnVisible('actions') && (
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button
                          onClick={() => onEditContact(contact)}
                          className="p-1.5 hover:bg-gray-100 rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => onAddActivity(contact)}
                          className="p-1.5 hover:bg-gray-100 rounded"
                          title="Add Activity"
                        >
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => onEmailContact(contact)}
                          className="p-1.5 hover:bg-gray-100 rounded"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => onDeleteContact(contact)}
                          className="p-1.5 hover:bg-gray-100 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
      
      {/* Footer Summary */}
      <div className="text-sm text-gray-500">
        Showing {filteredContacts.length} of {contacts.length} contacts
      </div>
    </div>
  );
};

// Companies View Component
const CompaniesView = ({ companies, contacts, onAddCompany, onEditCompany, onDeleteCompany, onViewContact, setActiveTab }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);

  const filteredCompanies = companies.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get contacts for selected company
  const companyContacts = selectedCompany 
    ? contacts.filter(c => c.company_id === selectedCompany.id)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: '#7B3B3B' }}>Companies</h2>
        <Button 
          onClick={onAddCompany}
          style={{ backgroundColor: '#7B3B3B' }}
          data-testid="add-company-btn"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Company
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Companies List */}
        <div className="col-span-1 space-y-3 max-h-[600px] overflow-auto">
          {filteredCompanies.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No companies found</p>
          ) : (
            filteredCompanies.map(company => (
              <Card 
                key={company.id} 
                className={`p-4 cursor-pointer transition hover:shadow-md ${selectedCompany?.id === company.id ? 'ring-2' : ''}`}
                style={{ borderLeftColor: '#7B3B3B', borderLeftWidth: selectedCompany?.id === company.id ? '4px' : '0' }}
                onClick={() => setSelectedCompany(company)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{company.name}</p>
                    {company.company_type && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded mt-1 inline-block">
                        {company.company_type}
                      </span>
                    )}
                    {company.city && (
                      <p className="text-sm text-gray-500 mt-1">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {company.city}{company.state ? `, ${company.state}` : ''}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#7B3B3B' }}>
                    {contacts.filter(c => c.company_id === company.id).length} contacts
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Company Details */}
        <div className="col-span-2">
          {selectedCompany ? (
            <Card className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold" style={{ color: '#7B3B3B' }}>{selectedCompany.name}</h3>
                  {selectedCompany.company_type && (
                    <span className="text-sm px-2 py-1 bg-gray-100 rounded mt-1 inline-block">
                      {selectedCompany.company_type}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEditCompany(selectedCompany)}>
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onDeleteCompany(selectedCompany)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {selectedCompany.email && (
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm">{selectedCompany.email}</p>
                  </div>
                )}
                {selectedCompany.phone && (
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm">{selectedCompany.phone}</p>
                  </div>
                )}
                {selectedCompany.website && (
                  <div>
                    <p className="text-xs text-gray-500">Website</p>
                    <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      {selectedCompany.website}
                    </a>
                  </div>
                )}
                {(selectedCompany.address || selectedCompany.city) && (
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm">
                      {selectedCompany.address && <>{selectedCompany.address}<br /></>}
                      {selectedCompany.city}{selectedCompany.state ? `, ${selectedCompany.state}` : ''} {selectedCompany.country}
                    </p>
                  </div>
                )}
              </div>

              {selectedCompany.notes && (
                <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedCompany.notes}</p>
                </div>
              )}

              {/* Linked Contacts */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Linked Contacts ({companyContacts.length})
                </h4>
                {companyContacts.length === 0 ? (
                  <p className="text-gray-500 text-sm">No contacts linked to this company yet.</p>
                ) : (
                  <div className="space-y-2">
                    {companyContacts.map(contact => (
                      <div 
                        key={contact.id} 
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                        onClick={() => onViewContact(contact)}
                      >
                        <div>
                          <p className="font-medium text-sm">{contact.first_name} {contact.last_name}</p>
                          <p className="text-xs text-gray-500">{contact.role || contact.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span 
                            className="text-xs px-2 py-1 rounded text-white"
                            style={{ backgroundColor: STAGE_COLORS[contact.stage] }}
                          >
                            {contact.stage}
                          </span>
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Select a company to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Emails View Component
const EmailsView = ({ contacts, onSendEmail, onForwardEmail }) => {
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [templates, setTemplates] = useState([]);

  const loadTemplates = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/crm/email-templates`, { withCredentials: true });
      setTemplates(res.data);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  useEffect(() => {
    loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleContact = (contact) => {
    setSelectedContacts(prev => 
      prev.find(c => c.id === contact.id)
        ? prev.filter(c => c.id !== contact.id)
        : [...prev, contact]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: '#7B3B3B' }}>Emails</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={onForwardEmail}
          >
            <Mail className="w-4 h-4 mr-2" />
            Add Email to CRM
          </Button>
          <Button 
            onClick={() => onSendEmail(selectedContacts)}
            disabled={selectedContacts.length === 0}
            style={{ backgroundColor: selectedContacts.length > 0 ? '#7B3B3B' : '#ccc' }}
          >
            <Send className="w-4 h-4 mr-2" />
            Email Selected ({selectedContacts.length})
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Select Recipients for Mass Email</h3>
        <div className="grid grid-cols-3 gap-3 max-h-96 overflow-auto">
          {contacts.map(contact => (
            <div
              key={contact.id}
              onClick={() => toggleContact(contact)}
              className={`p-3 border rounded-lg cursor-pointer transition ${
                selectedContacts.find(c => c.id === contact.id)
                  ? 'border-2'
                  : 'hover:bg-gray-50'
              }`}
              style={{ 
                borderColor: selectedContacts.find(c => c.id === contact.id) ? '#7B3B3B' : '#e5e7eb'
              }}
            >
              <p className="font-medium">{contact.first_name} {contact.last_name}</p>
              <p className="text-sm text-gray-500">{contact.email}</p>
              <p className="text-xs text-gray-400">{contact.organization_name}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Email Templates</h3>
        <div className="space-y-3">
          {templates.length === 0 ? (
            <p className="text-gray-500">No templates yet. Templates will be saved after you send emails.</p>
          ) : (
            templates.map(template => (
              <div key={template.id} className="p-3 border rounded-lg">
                <p className="font-medium">{template.name}</p>
                <p className="text-sm text-gray-500">Subject: {template.subject}</p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

// Todos View Component
const TodosView = ({ todos, contacts, onAddTodo, onToggleTodo, onDeleteTodo }) => {
  const pendingTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: '#7B3B3B' }}>To-Do List</h2>
        <Button onClick={onAddTodo} style={{ backgroundColor: '#7B3B3B' }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Pending ({pendingTodos.length})</h3>
          <div className="space-y-3">
            {pendingTodos.map(todo => (
              <div key={todo.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <button
                  onClick={() => onToggleTodo(todo)}
                  className="mt-1 w-5 h-5 border-2 rounded flex items-center justify-center hover:bg-gray-200"
                  style={{ borderColor: '#7B3B3B' }}
                >
                  {todo.completed && <Check className="w-3 h-3" style={{ color: '#7B3B3B' }} />}
                </button>
                <div className="flex-1">
                  <p className="font-medium">{todo.title}</p>
                  {todo.description && <p className="text-sm text-gray-500">{todo.description}</p>}
                  {todo.due_date && (
                    <p className="text-xs text-gray-400 mt-1">Due: {todo.due_date}</p>
                  )}
                </div>
                <button
                  onClick={() => onDeleteTodo(todo)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Completed ({completedTodos.length})</h3>
          <div className="space-y-3">
            {completedTodos.map(todo => (
              <div key={todo.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg opacity-60">
                <button
                  onClick={() => onToggleTodo(todo)}
                  className="mt-1 w-5 h-5 border-2 rounded flex items-center justify-center"
                  style={{ borderColor: '#7B3B3B', backgroundColor: '#7B3B3B' }}
                >
                  <Check className="w-3 h-3 text-white" />
                </button>
                <div className="flex-1">
                  <p className="font-medium line-through">{todo.title}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// Documents View Component  
const DocumentsView = ({ contacts }) => {
  const [invoices, setInvoices] = useState([]);
  const [agreements, setAgreements] = useState([]);

  const loadDocuments = async () => {
    try {
      const [invRes, agrRes] = await Promise.all([
        axios.get(`${API_URL}/api/crm/invoices`, { withCredentials: true }),
        axios.get(`${API_URL}/api/crm/agreements`, { withCredentials: true })
      ]);
      setInvoices(invRes.data);
      setAgreements(agrRes.data);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  useEffect(() => {
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: '#7B3B3B' }}>Documents</h2>
      
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Invoices</h3>
          <div className="space-y-3">
            {invoices.length === 0 ? (
              <p className="text-gray-500 text-sm">No invoices yet</p>
            ) : (
              invoices.map(inv => (
                <div key={inv.id} className="p-3 border rounded-lg">
                  <p className="font-medium">{inv.invoice_number}</p>
                  <p className="text-sm text-gray-500">{inv.contact_name}</p>
                  <p className="text-sm font-semibold">${inv.total}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Agreements</h3>
          <div className="space-y-3">
            {agreements.length === 0 ? (
              <p className="text-gray-500 text-sm">No agreements yet</p>
            ) : (
              agreements.map(agr => (
                <div key={agr.id} className="p-3 border rounded-lg">
                  <p className="font-medium">{agr.event_type}</p>
                  <p className="text-sm text-gray-500">{agr.contact_name}</p>
                  <p className="text-sm">{agr.event_date}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

// Contact Modal Component
const ContactModal = ({ contact, companies, onClose, onSave, onViewCompany }) => {
  const [formData, setFormData] = useState(contact || {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_id: '',
    organization_name: '',
    organization_type: '',
    role: '',
    address: '',
    city: '',
    state: '',
    country: '',
    stage: 'New Lead',
    notes: '',
    follow_up_date: '',
    last_contacted: '',
    tags: [],
    documents: []
  });

  // Get linked company info
  const linkedCompany = companies?.find(c => c.id === formData.company_id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold" style={{ color: '#7B3B3B' }}>
            {contact ? 'Edit Contact' : 'Add Contact'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name *</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name *</label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Organization</label>
            <input
              type="text"
              value={formData.organization_name}
              onChange={(e) => setFormData({...formData, organization_name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Parish, Conference, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Link to Company</label>
            <div className="flex gap-2">
              <select
                value={formData.company_id || ''}
                onChange={(e) => {
                  const companyId = e.target.value;
                  const company = companies?.find(c => c.id === companyId);
                  setFormData({
                    ...formData, 
                    company_id: companyId,
                    organization_name: company?.name || formData.organization_name,
                    organization_type: company?.company_type || formData.organization_type
                  });
                }}
                className="flex-1 px-3 py-2 border rounded-lg"
              >
                <option value="">No company linked</option>
                {companies?.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {linkedCompany && onViewCompany && (
                <button
                  type="button"
                  onClick={() => onViewCompany(linkedCompany)}
                  className="px-3 py-2 border rounded-lg hover:bg-gray-50"
                  title="View Company"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Organization Type</label>
            <select
              value={formData.organization_type}
              onChange={(e) => setFormData({...formData, organization_type: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Select type</option>
              <option value="Parish">Parish</option>
              <option value="Diocese">Diocese</option>
              <option value="Conference">Conference</option>
              <option value="Retreat Center">Retreat Center</option>
              <option value="School">School</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="DRE, Pastor, Event Planner, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stage</label>
            <select
              value={formData.stage}
              onChange={(e) => setFormData({...formData, stage: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {Object.keys(STAGE_COLORS).map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({...formData, state: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Follow-up Date</label>
            <input
              type="date"
              value={formData.follow_up_date}
              onChange={(e) => setFormData({...formData, follow_up_date: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Contacted</label>
            <input
              type="date"
              value={formData.last_contacted || ''}
              onChange={(e) => setFormData({...formData, last_contacted: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Notes / Activity Log</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              rows={5}
              placeholder="Add notes, paste email replies, call summaries, meeting notes..."
            />
            <p className="text-xs text-gray-400 mt-1">
              Tip: Copy & paste email conversations or add timestamps for each interaction
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={() => onSave(formData)}
            style={{ backgroundColor: '#7B3B3B' }}
          >
            {contact ? 'Save Changes' : 'Add Contact'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Email Modal Component
const EmailModal = ({ contacts, onClose, onSend }) => {
  const [formData, setFormData] = useState({
    subject: '',
    body: '',
    attach_onesheet: false
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 className="text-xl font-bold" style={{ color: '#7B3B3B' }}>
            Send Email ({contacts.length} recipient{contacts.length > 1 ? 's' : ''})
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
          <div>
            <label className="block text-sm font-medium mb-1">To:</label>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-gray-50 rounded-lg">
              {contacts.map(c => (
                <span key={c.id} className="px-2 py-1 bg-white border rounded text-sm">
                  {c.first_name} {c.last_name} ({c.email})
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Subject *</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Email subject"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Message *</label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({...formData, body: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              rows={6}
              placeholder="Type your message here..."
              required
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.attach_onesheet}
              onChange={(e) => setFormData({...formData, attach_onesheet: e.target.checked})}
              className="w-4 h-4"
            />
            <span className="text-sm">Attach Speaker One-Sheet PDF</span>
          </label>

          <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p className="font-medium mb-2">Email Signature Preview:</p>
            <div className="flex gap-3">
              <img 
                src="https://customer-assets.emergentagent.com/job_faith-speaker/artifacts/betujzmz_CL-23.jpg" 
                alt="Chelsea"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-bold text-sm" style={{ color: '#7B3B3B' }}>Chelsea Flynn</p>
                <p className="text-gray-500 text-xs">Catholic Speaker & Coach</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={() => onSend(formData)}
            style={{ backgroundColor: '#7B3B3B' }}
            disabled={!formData.subject || !formData.body}
          >
            <Send className="w-4 h-4 mr-2" />
            Send Email
          </Button>
        </div>
      </div>
    </div>
  );
};

// Todo Modal Component
const TodoModal = ({ contacts, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contact_id: '',
    due_date: '',
    priority: 'medium'
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold" style={{ color: '#7B3B3B' }}>Add Task</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Related Contact</label>
            <select
              value={formData.contact_id}
              onChange={(e) => setFormData({...formData, contact_id: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">None</option>
              {contacts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.first_name} {c.last_name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({...formData, due_date: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={() => onSave(formData)}
            style={{ backgroundColor: '#7B3B3B' }}
            disabled={!formData.title}
          >
            Add Task
          </Button>
        </div>
      </div>
    </div>
  );
};

// Activity Modal Component
const ActivityModal = ({ contact, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    activity_type: 'email_received',
    description: '',
    activity_date: new Date().toISOString().split('T')[0]
  });

  const activityTypes = [
    { value: 'email_received', label: 'Email Received (Reply from contact)' },
    { value: 'email_sent', label: 'Email Sent (Via Gmail/other)' },
    { value: 'call', label: 'Phone Call' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'note', label: 'General Note' },
    { value: 'follow_up', label: 'Follow-up Completed' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold" style={{ color: '#7B3B3B' }}>Log Activity</h3>
            <p className="text-sm text-gray-500">
              {contact.first_name} {contact.last_name}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Activity Type *</label>
            <select
              value={formData.activity_type}
              onChange={(e) => setFormData({...formData, activity_type: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {activityTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={formData.activity_date}
              onChange={(e) => setFormData({...formData, activity_date: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Details / Notes *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              rows={6}
              placeholder="Paste email content, call notes, or any relevant details here..."
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Tip: Copy & paste email replies from Gmail here for record keeping
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={() => onSave(formData)}
            style={{ backgroundColor: '#7B3B3B' }}
            disabled={!formData.description}
          >
            <History className="w-4 h-4 mr-2" />
            Log Activity
          </Button>
        </div>
      </div>
    </div>
  );
};

// Company Modal Component
const CompanyModal = ({ company, onClose, onSave }) => {
  const [formData, setFormData] = useState(company || {
    name: '',
    company_type: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: '',
    notes: ''
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold" style={{ color: '#7B3B3B' }}>
            {company ? 'Edit Company' : 'Add Company'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Company Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Company Type</label>
            <select
              value={formData.company_type}
              onChange={(e) => setFormData({...formData, company_type: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Select type...</option>
              <option value="Parish">Parish</option>
              <option value="Conference">Conference</option>
              <option value="Diocese">Diocese</option>
              <option value="Retreat Center">Retreat Center</option>
              <option value="School">School</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="https://"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">State/Province</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({...formData, state: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={() => onSave(formData)}
            style={{ backgroundColor: '#7B3B3B' }}
            disabled={!formData.name}
          >
            {company ? 'Save Changes' : 'Add Company'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Forward Email Modal Component
const ForwardEmailModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    from_email: '',
    from_name: '',
    subject: '',
    body: ''
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold" style={{ color: '#7B3B3B' }}>
            Add Email to CRM
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Paste email details below. If the sender exists in your CRM, the email will be added to their notes. 
          Otherwise, a new contact will be created.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Sender Email *</label>
              <input
                type="email"
                value={formData.from_email}
                onChange={(e) => setFormData({...formData, from_email: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="sender@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sender Name</label>
              <input
                type="text"
                value={formData.from_name}
                onChange={(e) => setFormData({...formData, from_name: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="John Smith"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Subject *</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Email subject line"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email Body *</label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({...formData, body: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              rows={10}
              placeholder="Paste the email content here..."
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={() => onSave(formData)}
            style={{ backgroundColor: '#7B3B3B' }}
            disabled={!formData.from_email || !formData.subject || !formData.body}
          >
            <Mail className="w-4 h-4 mr-2" />
            Add to CRM
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CRMDashboard;
