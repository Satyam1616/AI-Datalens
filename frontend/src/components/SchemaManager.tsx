import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Trash2, 
  Save, 
  Database, 
  Info, 
  Search,
  Check,
  AlertCircle,
  Table as TableIcon
} from 'lucide-react';

interface TableMetadata {
  table: string;
  description: string;
  columns: Record<string, string>;
}

interface Schema {
  tables: TableMetadata[];
}

const SchemaManager: React.FC = () => {
  const [schema, setSchema] = useState<Schema>({ tables: [] });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSchema();
  }, []);

  const fetchSchema = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/chat/schema');
      setSchema(data);
    } catch (error) {
      console.error('Error fetching schema:', error);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/chat/schema', schema);
      setMessage({ type: 'success', text: 'Semantic layer updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save changes.' });
    } finally {
      setLoading(false);
    }
  };

  const addTable = () => {
    setSchema({
      ...schema,
      tables: [{ table: 'new_table', description: '', columns: {} }, ...schema.tables]
    });
  };

  const removeTable = (index: number) => {
    const newTables = [...schema.tables];
    newTables.splice(index, 1);
    setSchema({ ...schema, tables: newTables });
  };

  const filteredTables = schema.tables.filter(t => 
    t.table.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight dark:text-white">Metadata Agent</h1>
          <p className="text-gray-500 dark:text-gray-400">Map your database schema to natural language concepts for smarter AI queries.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={addTable} 
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
          >
            <Plus size={18} />
            Add Table
          </button>
          <button 
            onClick={handleUpdate} 
            disabled={loading} 
            className="flex items-center gap-2 px-6 py-2 bg-brand-600 text-white rounded-xl font-semibold text-sm hover:bg-brand-700 disabled:bg-brand-400 transition-all shadow-lg shadow-brand-500/20"
          >
            {loading ? <Save className="animate-pulse" size={18} /> : <Check size={18} />}
            Save Changes
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/20' 
            : 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/20'
        }`}>
          {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Search & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search tables or descriptions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
          />
        </div>
        <div className="bg-brand-50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-900/20 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center text-brand-600 dark:text-brand-400">
              <Database size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">Active Schema</div>
              <div className="text-lg font-bold dark:text-white">{schema.tables.length} Tables</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tables List */}
      <div className="space-y-6">
        {filteredTables.map((table, tIndex) => (
          <div key={tIndex} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center gap-4">
              <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-300">
                <TableIcon size={24} />
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Table Name</label>
                  <input
                    type="text"
                    value={table.table}
                    onChange={(e) => {
                      const newTables = [...schema.tables];
                      newTables[tIndex].table = e.target.value;
                      setSchema({ ...schema, tables: newTables });
                    }}
                    className="w-full bg-transparent font-bold text-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 rounded px-1 -ml-1 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Business Context</label>
                  <input
                    type="text"
                    value={table.description}
                    onChange={(e) => {
                      const newTables = [...schema.tables];
                      newTables[tIndex].description = e.target.value;
                      setSchema({ ...schema, tables: newTables });
                    }}
                    placeholder="Describe what this table represents..."
                    className="w-full bg-transparent text-sm text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 rounded px-1 -ml-1 transition-all"
                  />
                </div>
              </div>
              <button 
                onClick={() => removeTable(tIndex)} 
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all self-start md:self-center"
                title="Remove table"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <Info size={14} />
                Column Definitions
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(table.columns).map(([col, desc]) => (
                  <div key={col} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 group/col">
                    <div className="font-mono text-sm font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-2 py-1 rounded">
                      {col}
                    </div>
                    <input
                      type="text"
                      value={desc}
                      onChange={(e) => {
                        const newTables = [...schema.tables];
                        newTables[tIndex].columns[col] = e.target.value;
                        setSchema({ ...schema, tables: newTables });
                      }}
                      className="flex-1 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-brand-500/50 rounded px-1 transition-all"
                      placeholder="Column description..."
                    />
                    <button 
                      onClick={() => {
                        const newTables = [...schema.tables];
                        delete newTables[tIndex].columns[col];
                        setSchema({ ...schema, tables: newTables });
                      }}
                      className="opacity-0 group-hover/col:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                
                <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                  <input 
                    id={`new-col-${tIndex}`} 
                    type="text" 
                    placeholder="New column..." 
                    className="flex-1 bg-transparent border-none text-sm px-3 focus:ring-0 placeholder:text-gray-400" 
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById(`new-col-${tIndex}`) as HTMLInputElement;
                      if (input.value) {
                        const newTables = [...schema.tables];
                        newTables[tIndex].columns[input.value] = '';
                        setSchema({ ...schema, tables: newTables });
                        input.value = '';
                      }
                    }}
                    className="p-2 bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredTables.length === 0 && (
          <div className="py-20 text-center space-y-4 opacity-50">
            <div className="text-4xl">🔍</div>
            <div className="max-w-xs mx-auto">
              <h3 className="font-bold">No tables found</h3>
              <p className="text-sm">Try searching for a different name or add a new table to your semantic layer.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchemaManager;
