import { useState, useMemo } from 'react';
import { DataTable, Column } from '../../components/ui/DataTable';
import Drawer from '../../components/ui/Drawer';
import Button from '../../components/ui/Button';
import { AuditLog, AuditAction } from '../../types/core';
import { faker } from '@faker-js/faker';
import { Eye, FileJson, ArrowRight, User as UserIcon, Calendar, Tag, Database } from 'lucide-react';
import { cn } from '../../utils/cn';

// --- Mock Generator (Local for now) ---

const generateMockAuditLog = (): AuditLog => {
  const action = faker.helpers.arrayElement(Object.values(AuditAction));
  const entity = faker.helpers.arrayElement(['Product', 'Order', 'User', 'Store', 'Event']);
  
  let changes = { before: {}, after: {} };
  
  if (action === AuditAction.CREATE) {
    changes.after = { 
      id: faker.string.uuid(),
      name: faker.commerce.productName(), 
      status: 'ACTIVE',
      price: faker.commerce.price() 
    };
    changes.before = {}; 
  } else if (action === AuditAction.DELETE) {
    changes.before = { 
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      status: 'ACTIVE'
    };
    changes.after = {};
  } else {
    // UPDATE
    changes.before = { 
      name: faker.commerce.productName(), 
      stock: 10,
      status: 'DRAFT' 
    };
    changes.after = { 
      name: faker.commerce.productName(), 
      stock: 5,
      status: 'PUBLISHED' 
    };
  }

  return {
    id: faker.string.uuid(),
    adminId: faker.string.uuid(), // In real app, would be linked to a User
    action,
    entity,
    entityId: faker.string.uuid(),
    changes,
    timestamp: faker.date.recent({ days: 7 }),
  };
};

const MOCK_AUDIT_LOGS = faker.helpers.multiple(generateMockAuditLog, { count: 100 });

// --- Components ---

const ActionBadge = ({ action }: { action: AuditAction }) => {
  const colors = {
    [AuditAction.CREATE]: 'bg-green-500/20 text-green-400 border-green-500/30',
    [AuditAction.UPDATE]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    [AuditAction.DELETE]: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <span className={cn("px-2 py-0.5 rounded text-xs font-medium border", colors[action])}>
      {action}
    </span>
  );
};

const JsonSyntaxHighlight = ({ json }: { json: any }) => {
  if (!json || Object.keys(json).length === 0) return <span className="text-gray-500 italic">Empty</span>;

  const jsonString = JSON.stringify(json, null, 2);
  
  // Simple syntax highlighting
  const highlighted = jsonString.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = 'text-orange-400'; // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-purple-400'; // key
        } else {
          cls = 'text-green-400'; // string
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-blue-400'; // boolean
      } else if (/null/.test(match)) {
        cls = 'text-gray-400'; // null
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );

  return (
    <pre 
      className="font-mono text-xs bg-[#1a1a1a] p-3 rounded overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
};

const AuditLogViewer = () => {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const columns: Column<AuditLog>[] = [
    {
      header: 'Timestamp',
      accessorKey: 'timestamp',
      render: (log) => (
        <div className="flex flex-col">
          <span className="text-sm text-white">{log.timestamp.toLocaleDateString()}</span>
          <span className="text-xs text-gray-500">{log.timestamp.toLocaleTimeString()}</span>
        </div>
      ),
    },
    {
      header: 'Action',
      accessorKey: 'action',
      render: (log) => <ActionBadge action={log.action} />,
    },
    {
      header: 'Entity',
      accessorKey: 'entity',
      render: (log) => (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{log.entity}</span>
        </div>
      ),
    },
    {
      header: 'Entity ID',
      accessorKey: 'entityId',
      render: (log) => (
        <span className="font-mono text-xs text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">
          {log.entityId.substring(0, 8)}...
        </span>
      ),
    },
    {
      header: 'Admin ID',
      accessorKey: 'adminId',
      render: (log) => (
        <span className="font-mono text-xs text-gray-500">
          {log.adminId.substring(0, 8)}
        </span>
      ),
      className: "hidden md:table-cell" // Hide on mobile for space
    },
    {
      header: 'Details',
      render: (log) => (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setSelectedLog(log)}
          className="h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
      className: "w-[50px]"
    },
  ];

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return MOCK_AUDIT_LOGS.slice(start, start + pageSize);
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Audit Logs</h1>
          <p className="text-text-secondary mt-2">
            System-wide activity tracking and security audit trail.
          </p>
        </div>
        {/* Could add filters here later */}
      </div>

      <div className="bg-[#1E1E1E] rounded-xl border border-white/10 overflow-hidden">
        <DataTable
          data={paginatedData}
          columns={columns}
          pagination={{
            page,
            pageSize,
            total: MOCK_AUDIT_LOGS.length,
            onPageChange: setPage,
          }}
        />
      </div>

      <Drawer
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Audit Log Detail"
        side="right"
      >
        {selectedLog && (
          <div className="space-y-6">
            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-lg">
              <div>
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Timestamp
                </div>
                <div className="text-sm font-mono text-white">
                  {selectedLog.timestamp.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                   <Tag className="w-3 h-3" /> Action
                </div>
                <ActionBadge action={selectedLog.action} />
              </div>
              <div>
                 <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Database className="w-3 h-3" /> Entity
                </div>
                <div className="text-sm text-white">
                  {selectedLog.entity}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <UserIcon className="w-3 h-3" /> Admin ID
                </div>
                 <div className="text-xs font-mono text-gray-400 break-all">
                  {selectedLog.adminId}
                </div>
              </div>
            </div>

            <div className="space-y-4">
               <div className="flex items-center gap-2 text-sm font-semibold text-white border-b border-white/10 pb-2">
                  <FileJson className="w-4 h-4 text-primary-400" />
                  Change Diff
               </div>
               
               <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-red-400 uppercase tracking-wider">Before</h4>
                    <JsonSyntaxHighlight json={selectedLog.changes.before} />
                  </div>
                  
                  <div className="flex justify-center">
                    <ArrowRight className="w-5 h-5 text-gray-600 rotate-90 md:rotate-0" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-green-400 uppercase tracking-wider">After</h4>
                    <JsonSyntaxHighlight json={selectedLog.changes.after} />
                  </div>
               </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default AuditLogViewer;