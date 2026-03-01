import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Line, PieChart, Pie, Cell, AreaChart, Area, LabelList
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Table as TableIcon, 
  ArrowUpDown,
  Layers,
  Activity,
  Settings2
} from 'lucide-react';

interface ChartStyle {
  orientation?: 'vertical' | 'horizontal';
  color_scheme?: 'blues' | 'emerald' | 'sunset' | 'cool';
  show_grid?: boolean;
  show_labels?: boolean;
  curve_type?: 'monotone' | 'step' | 'linear';
}

interface ChartConfig {
  chart_type: string;
  x_axis: string;
  y_axis: string;
  group_by?: string;
  style?: ChartStyle;
}

interface ChartProps {
  data: any[];
  config: {
    primary: ChartConfig;
    suggestions: ChartConfig[];
  };
}

const SCHEMES = {
  blues: ['#3b82f6', '#60a5fa', '#93c5fd', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'],
  emerald: ['#10b981', '#34d399', '#6ee7b7', '#059669', '#047857', '#065f46', '#064e3b'],
  sunset: ['#f59e0b', '#fbbf24', '#fcd34d', '#d97706', '#b45309', '#92400e', '#78350f'],
  cool: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95']
};

const ChartRenderer: React.FC<ChartProps> = ({ data, config }) => {
  // Support both old and new config formats for resilience
  const primaryConfig = config.primary || (config as any as ChartConfig);
  const suggestions = config.suggestions || [];

  const [activeConfig, setActiveConfig] = React.useState<ChartConfig>(primaryConfig);
  const [viewMode, setViewMode] = React.useState<'CHART' | 'TABLE'>('CHART');
  const [isStacked, setIsStacked] = React.useState(true);
  const [sortOrder, setSortOrder] = React.useState<'none' | 'asc' | 'desc'>('none');
  const [showTrend, setShowTrend] = React.useState(false);
  const [showFieldsPane, setShowFieldsPane] = React.useState(false);

  // Manual axis overrides
  const [manualX, setManualX] = React.useState<string | null>(null);
  const [manualY, setManualY] = React.useState<string | null>(null);
  const [manualGroup, setManualGroup] = React.useState<string | null>(null);

  React.useEffect(() => {
    setActiveConfig(primaryConfig);
    setManualX(null);
    setManualY(null);
    setManualGroup(null);
  }, [config]);

  if (!data || data.length === 0 || !activeConfig) return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
      <div className="text-4xl">📊</div>
      <p className="italic text-sm">No data available to visualize.</p>
    </div>
  );

  const { x_axis: configX, y_axis: configY, group_by: configGroup, style: configStyle = {} } = activeConfig;
  const colors = SCHEMES[configStyle.color_scheme || 'blues'];

  // Available dimensions and measures for manual control and auto-discovery
  const keys = Object.keys(data[0]);
  const numericKeys = keys.filter(k => {
    const val = data[0][k];
    return typeof val === 'number' && k !== 'id';
  });
  const stringKeys = keys.filter(k => {
    const val = data[0][k];
    return (typeof val === 'string' || k.includes('date')) && k !== 'id';
  });

  // Final axes after overrides
  const x_axis = manualX || (data[0][configX] !== undefined ? configX : (stringKeys[0] || keys[0]));
  const y_axis = manualY || (data[0][configY] !== undefined ? configY : (numericKeys[0] || keys[0]));
  const group_by = manualGroup !== null ? (manualGroup === 'none' ? undefined : manualGroup) : configGroup;

  // Data processing with sorting and grouping
  const getProcessedData = () => {
    let workingData = [...data];

    // Sorting
    if (sortOrder !== 'none') {
      workingData.sort((a, b) => {
        const valA = a[y_axis];
        const valB = b[y_axis];
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
    }

    if (!group_by) return { chartData: workingData, series: [y_axis] };
    
    // Multi-dimensional grouping
    const grouped: Record<string, any> = {};
    const groupValues = new Set<string>();
    
    workingData.forEach(item => {
      const xVal = item[x_axis];
      const gVal = item[group_by];
      groupValues.add(gVal);
      
      if (!grouped[xVal]) {
        grouped[xVal] = { [x_axis]: xVal };
      }
      grouped[xVal][gVal] = (grouped[xVal][gVal] || 0) + (item[y_axis] || 0);
    });
    
    return {
      chartData: Object.values(grouped),
      series: Array.from(groupValues)
    };
  };

  const processed = getProcessedData();

  const ChartToolbar = () => (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div className="flex flex-wrap items-center gap-3">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setViewMode('CHART')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'CHART' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' : 'text-gray-500'}`}
            title="Chart View"
          >
            <BarChart3 size={18} />
          </button>
          <button
            onClick={() => setViewMode('TABLE')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'TABLE' ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' : 'text-gray-500'}`}
            title="Table View"
          >
            <TableIcon size={18} />
          </button>
        </div>

        {/* AI Suggestions */}
        <div className="flex flex-wrap items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-4 ml-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-1">AI Picks:</span>
          {[primaryConfig, ...suggestions].map((cfg, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveConfig(cfg);
                setViewMode('CHART');
                setManualX(null);
                setManualY(null);
                setManualGroup(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                activeConfig === cfg && viewMode === 'CHART'
                  ? 'bg-primary-600 text-white border-primary-600 shadow-sm shadow-primary-500/20'
                  : 'bg-white dark:bg-gray-900 text-gray-500 border-gray-200 dark:border-gray-800 hover:border-primary-500'
              }`}
            >
              {cfg.chart_type} {cfg.group_by ? `by ${cfg.group_by}` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Analysis Controls */}
      {viewMode === 'CHART' && (
        <div className="flex items-center gap-2">
          {/* Fields Pane Toggle */}
          <button
            onClick={() => setShowFieldsPane(!showFieldsPane)}
            className={`p-2 rounded-lg border transition-all flex items-center gap-2 text-xs font-bold ${showFieldsPane ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 text-primary-600' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500'}`}
            title="Customize Chart"
          >
            <Settings2 size={14} />
            <span className="hidden lg:inline">Customize</span>
          </button>

          <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1 hidden md:block" />
          
          {/* Sorting */}
          <button
            onClick={() => setSortOrder(prev => prev === 'none' ? 'desc' : prev === 'desc' ? 'asc' : 'none')}
            className={`p-2 rounded-lg border transition-all flex items-center gap-2 text-xs font-bold ${sortOrder !== 'none' ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 text-primary-600' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500'}`}
            title="Sort Data"
          >
            <ArrowUpDown size={14} />
            <span className="hidden lg:inline">{sortOrder === 'none' ? 'Sort' : sortOrder.toUpperCase()}</span>
          </button>

          {/* Stacking */}
          {group_by && (activeConfig.chart_type === 'BAR' || activeConfig.chart_type === 'AREA') && (
            <button
              onClick={() => setIsStacked(!isStacked)}
              className={`p-2 rounded-lg border transition-all flex items-center gap-2 text-xs font-bold ${isStacked ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 text-primary-600' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500'}`}
              title="Toggle Stacked View"
            >
              <Layers size={14} />
              <span className="hidden lg:inline">{isStacked ? 'Stacked' : 'Grouped'}</span>
            </button>
          )}

          {/* Trend Line */}
          {(activeConfig.chart_type === 'LINE' || activeConfig.chart_type === 'AREA') && (
            <button
              onClick={() => setShowTrend(!showTrend)}
              className={`p-2 rounded-lg border transition-all flex items-center gap-2 text-xs font-bold ${showTrend ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 text-primary-600' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500'}`}
              title="Toggle Trend Line"
            >
              <Activity size={14} />
              <span className="hidden lg:inline">Trend</span>
            </button>
          )}
        </div>
      )}
    </div>
  );

  const FieldsPane = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8 animate-in slide-in-from-top duration-300">
      <div className="space-y-3">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dimension (X-Axis)</label>
        <select 
          value={x_axis} 
          onChange={(e) => setManualX(e.target.value)}
          className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs font-bold dark:text-white focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
        >
          {stringKeys.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
      <div className="space-y-3">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Measure (Y-Axis)</label>
        <select 
          value={y_axis} 
          onChange={(e) => setManualY(e.target.value)}
          className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs font-bold dark:text-white focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
        >
          {numericKeys.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
      <div className="space-y-3">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Legend (Group By)</label>
        <select 
          value={group_by || 'none'} 
          onChange={(e) => setManualGroup(e.target.value)}
          className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs font-bold dark:text-white focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
        >
          <option value="none">No Grouping</option>
          {stringKeys.filter(k => k !== x_axis).map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-xl shadow-2xl backdrop-blur-md bg-opacity-90 dark:bg-opacity-90 min-w-[200px]">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">{label}</p>
          <div className="space-y-3">
            {payload.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-8">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color || item.fill }} />
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{item.name}:</span>
                </div>
                <span className="text-sm font-black dark:text-white tabular-nums">
                  {new Intl.NumberFormat().format(item.value)}
                </span>
              </div>
            ))}
          </div>
          {payload.length > 1 && (
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Grand Total:</span>
              <span className="text-sm font-black text-primary-600 dark:text-primary-400 tabular-nums">
                {new Intl.NumberFormat().format(payload.reduce((sum: number, i: any) => sum + i.value, 0))}
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (viewMode === 'TABLE') {
      return (
        <div className="h-full flex flex-col p-2">
          <div className="overflow-hidden border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm bg-white dark:bg-gray-950">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10">
                <tr>
                  {Object.keys(data[0]).map((key) => (
                    <th key={key} className="px-6 py-5 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-900">
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors group">
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} className="px-6 py-5 whitespace-nowrap text-sm font-bold text-gray-600 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors tabular-nums">
                        {typeof val === 'number' ? new Intl.NumberFormat().format(val) : val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    const commonChartProps = {
      data: processed.chartData,
      margin: { top: 30, right: 30, left: 20, bottom: 20 },
      animationDuration: 1500,
      layout: configStyle.orientation === 'horizontal' ? 'vertical' as const : 'horizontal' as const
    };

    const isHorizontal = configStyle.orientation === 'horizontal';

    switch (activeConfig.chart_type) {
      case 'BAR':
        return (
          <BarChart {...commonChartProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={isHorizontal} horizontal={!isHorizontal} stroke="#e5e7eb" opacity={configStyle.show_grid === false ? 0 : 0.5} />
            <XAxis 
              type={isHorizontal ? 'number' : 'category'}
              dataKey={isHorizontal ? undefined : x_axis} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 700 }} 
              dy={isHorizontal ? 0 : 15}
              tickFormatter={isHorizontal ? (v) => new Intl.NumberFormat('en', { notation: 'compact' }).format(v) : undefined}
            />
            <YAxis 
              type={isHorizontal ? 'category' : 'number'}
              dataKey={isHorizontal ? x_axis : undefined}
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 700 }} 
              dx={isHorizontal ? -10 : 0}
              tickFormatter={!isHorizontal ? (v) => new Intl.NumberFormat('en', { notation: 'compact' }).format(v) : undefined}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6', opacity: 0.4 }} />
            <Legend verticalAlign="top" align="right" height={40} iconType="circle" wrapperStyle={{ paddingTop: '0px', paddingRight: '10px' }} />
            {processed.series.map((s: string, i: number) => (
              <Bar 
                key={s} 
                dataKey={s} 
                stackId={isStacked ? 'a' : undefined}
                fill={colors[i % colors.length]} 
                radius={isStacked ? [0, 0, 0, 0] : isHorizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]} 
                barSize={isStacked ? 36 : 24}
              >
                {configStyle.show_labels && <LabelList dataKey={s} position={isHorizontal ? "right" : "top"} style={{ fontSize: '10px', fontWeight: 'bold', fill: '#9ca3af' }} formatter={(v: any) => new Intl.NumberFormat('en', { notation: 'compact' }).format(Number(v))} />}
              </Bar>
            ))}
          </BarChart>
        );
      case 'LINE':
      case 'AREA':
        return (
          <AreaChart {...commonChartProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={configStyle.show_grid === false ? 0 : 0.5} />
            <XAxis dataKey={x_axis} axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 700 }} dy={15} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 700 }} tickFormatter={(v) => new Intl.NumberFormat('en', { notation: 'compact' }).format(v)} />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" align="right" height={40} iconType="circle" />
            {processed.series.map((s: string, i: number) => (
              <Area 
                key={s} 
                type={configStyle.curve_type || 'monotone'} 
                dataKey={s} 
                stackId={isStacked ? 'a' : undefined}
                stroke={colors[i % colors.length]} 
                fill={colors[i % colors.length]} 
                fillOpacity={group_by ? 0.2 : 0.4} 
                strokeWidth={4} 
              >
                {configStyle.show_labels && <LabelList dataKey={s} position="top" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#9ca3af' }} formatter={(v: any) => new Intl.NumberFormat('en', { notation: 'compact' }).format(Number(v))} />}
              </Area>
            ))}
            {showTrend && (
              <Line type="monotone" dataKey={y_axis} stroke="#10b981" strokeDasharray="8 8" dot={false} strokeWidth={3} />
            )}
          </AreaChart>
        );
      case 'PIE':
        return (
          <PieChart>
            <Pie 
              data={data} 
              cx="50%" 
              cy="50%" 
              innerRadius={80} 
              outerRadius={120} 
              paddingAngle={10} 
              dataKey={y_axis} 
              nameKey={x_axis} 
              animationDuration={1500}
            >
              {data.map((_, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="transparent" />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={40} iconType="circle" />
          </PieChart>
        );
      case 'KPI':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center group">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-primary-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 rounded-full" />
              <div className="relative p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl shadow-2xl">
                <TrendingUp className="text-primary-600 dark:text-primary-400" size={42} />
              </div>
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-3">{y_axis}</p>
            <p className="text-7xl md:text-8xl font-black text-gray-900 dark:text-white tabular-nums tracking-tighter">
              {typeof data[0][y_axis] === 'number' ? new Intl.NumberFormat().format(data[0][y_axis]) : data[0][y_axis]}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[600px] animate-in fade-in duration-500">
      <ChartToolbar />
      {showFieldsPane && <FieldsPane />}
      
      <div className="flex-1 w-full min-w-0 flex items-center justify-center overflow-hidden bg-white dark:bg-gray-950/40 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 shadow-inner">
        {activeConfig.chart_type === 'KPI' || viewMode === 'TABLE' ? (
          <div className="w-full h-full overflow-auto scrollbar-hide">
            {renderChart()}
          </div>
        ) : (
          <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart() as any}
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartRenderer;
