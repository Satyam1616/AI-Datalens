import React from 'react';

interface InsightProps {
  insights: string;
}

const InsightPanel: React.FC<InsightProps> = ({ insights }) => {
  return (
    <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
      <div className="whitespace-pre-wrap">
        {insights.split('\n').map((line, i) => {
          if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.')) {
            return (
              <p key={i} className="font-semibold mb-2 text-gray-900 dark:text-white border-b dark:border-gray-700 pb-1">
                {line}
              </p>
            );
          }
          return <p key={i} className="mb-2">{line}</p>;
        })}
      </div>
    </div>
  );
};

export default InsightPanel;
