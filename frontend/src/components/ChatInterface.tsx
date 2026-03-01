import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChartRenderer from './ChartRenderer';
import InsightPanel from './InsightPanel';
import { 
  Send, 
  History, 
  Download, 
  Terminal, 
  Lightbulb, 
  HelpCircle,
  ArrowRight,
  Loader2,
  AlertCircle,
  Zap,
  ChevronRight,
  Settings as SettingsIcon
} from 'lucide-react';

interface ChartConfig {
  chart_type: string;
  x_axis: string;
  y_axis: string;
  group_by?: string;
}

interface ChatResponse {
  sql: string;
  data: any[];
  insights: string;
  chartConfig: {
    primary: ChartConfig;
    suggestions: ChartConfig[];
  };
  followUps: string[];
}

interface HistoryItem {
  question: string;
  timestamp: string;
}

const ChatInterface: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('chat_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToHistory = (q: string) => {
    const newHistory = [{ question: q, timestamp: new Date().toISOString() }, ...history]
      .filter((v, i, a) => a.findIndex(t => t.question === v.question) === i)
      .slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('chat_history', JSON.stringify(newHistory));
  };

  const handleSubmit = async (e: React.FormEvent, customQuestion?: string) => {
    e.preventDefault();
    const q = customQuestion || question;
    if (!q || loading) return;

    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post('http://localhost:5000/api/chat/query', { question: q });
      setResponse(data);
      if (!customQuestion) {
        saveToHistory(q);
        setQuestion('');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.response?.data?.reason || 'Failed to process query. Please try again.';
      setError(errorMsg);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight dark:text-white">AI-DataLens Workspace</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
          Interact with your data using natural language. Get instant insights, automated visualizations, and intelligent summaries.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., What is the total revenue by region for last month?"
            className="w-full pl-6 pr-16 py-4 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-lg placeholder:text-gray-400 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading || !question}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 dark:disabled:bg-gray-800 text-white rounded-lg transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-400 animate-in fade-in zoom-in duration-200">
            <AlertCircle className="mt-0.5 shrink-0" size={18} />
            <div className="text-sm font-medium">
              <span className="block font-bold mb-1">Query Failed</span>
              {error}
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <History size={14} />
              Recent Queries
            </div>
            <div className="flex flex-wrap gap-2">
              {history.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleSubmit({ preventDefault: () => {} } as any, item.question)}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg text-sm transition-colors text-gray-600 dark:text-gray-300 flex items-center gap-2"
                >
                  {item.question}
                  <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -ml-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {response && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            {/* Visualization Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-500" />
                  <h2 className="font-bold text-gray-700 dark:text-gray-200">Visualization</h2>
                </div>
                <button
                  onClick={() => {
                    const csv = [
                      Object.keys(response.data[0]).join(','),
                      ...response.data.map(row => Object.values(row).join(','))
                    ].join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `data_${new Date().getTime()}.csv`;
                    a.click();
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                >
                  <Download size={14} />
                  Export CSV
                </button>
              </div>
              <div className="p-8 min-h-[400px]">
                <ChartRenderer data={response.data} config={response.chartConfig} />
              </div>
            </div>

            {/* SQL Query Card */}
            <div className="bg-gray-900 rounded-2xl shadow-xl overflow-hidden group">
              <div className="px-6 py-3 bg-gray-800/50 border-b border-gray-800 flex items-center gap-2">
                <Terminal size={14} className="text-brand-400" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Generated SQL</span>
              </div>
              <div className="p-6 overflow-x-auto relative">
                <code className="text-brand-300 font-mono text-sm leading-relaxed block">
                  {response.sql}
                </code>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => navigator.clipboard.writeText(response.sql)}
                    className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg transition-colors"
                    title="Copy to clipboard"
                  >
                    <History size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8">
            {/* Insights Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden h-fit">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 bg-gray-50/50 dark:bg-gray-800/50">
                <Lightbulb size={18} className="text-amber-500" />
                <h2 className="font-bold text-gray-700 dark:text-gray-200">AI Insights</h2>
              </div>
              <div className="p-6">
                <InsightPanel insights={response.insights} />
              </div>
            </div>

            {/* Suggestions Card */}
            {response.followUps.length > 0 && (
              <div className="bg-brand-600 rounded-2xl shadow-lg shadow-brand-500/20 p-6 text-white h-fit relative overflow-hidden group">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4 opacity-90">
                    <HelpCircle size={18} />
                    <h2 className="text-sm font-bold uppercase tracking-wider">Suggested for you</h2>
                  </div>
                  <div className="space-y-3">
                    {response.followUps.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSubmit({ preventDefault: () => {} } as any, q)}
                        className="w-full text-left px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-all border border-white/10 flex items-center justify-between group/btn"
                      >
                        <span className="font-medium line-clamp-2">{q}</span>
                        <ChevronRight size={14} className="shrink-0 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State / Feature Highlights */}
      {!response && !loading && (
        <div className="space-y-12 animate-in fade-in duration-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4">
                <Lightbulb size={20} />
              </div>
              <h3 className="text-lg font-bold mb-2 dark:text-white">Informed Decisions</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Move beyond guesswork — leverage data-backed insights to make informed decisions that reduce risk and accelerate growth.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                <Zap size={20} />
              </div>
              <h3 className="text-lg font-bold mb-2 dark:text-white">Streamlined Operations</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Automate processes and reduce manual effort with insights that keep your operations running smoothly.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
                <SettingsIcon size={20} />
              </div>
              <h3 className="text-lg font-bold mb-2 dark:text-white">Plug-and-Play Extensibility</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Quickly connect to your existing tools and systems, ensuring your data workflows stay seamless and scalable.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center text-center space-y-6 py-12 border-t border-gray-100 dark:border-gray-800">
            <div className="max-w-md">
              <h3 className="text-xl font-bold mb-3 dark:text-white">Start your data journey</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ask a question using natural language — no SQL or DAX needed. AI-DataLens delivers instant answers, intelligent visual generation, and business-ready insights.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "Total revenue by region for last month",
                "Show sales trends by product category",
                "Who are our top 5 customers?",
                "What is the average quantity per order?"
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSubmit({ preventDefault: () => {} } as any, q)}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
