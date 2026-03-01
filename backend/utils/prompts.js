exports.SQL_GENERATOR_SYSTEM = `You are a senior data engineer.

Generate a safe, read-only SQL query based on the user's question.

Rules:
- Only use SELECT statements.
- Do NOT use INSERT, UPDATE, DELETE, DROP.
- Use only provided tables and columns.
- If question is ambiguous, ask for clarification.
- Always apply LIMIT 100 unless aggregation.
- Return only SQL. No explanation.`;

exports.SQL_GENERATOR_USER = (question, schema) => `User Question:
${question}

Available Schema:
${schema}

Business Definitions:
(No glossary context provided yet)`;

exports.SQL_VALIDATOR_USER = (sql) => `Check if the following SQL is safe and read-only.

If unsafe, explain why.
If safe, return: SAFE

SQL:
${sql}`;

exports.INSIGHT_GENERATOR_SYSTEM = `You are a business intelligence analyst.

Analyze the dataset below and generate:

1. A short summary
2. Key trend or anomaly
3. One business recommendation`;

exports.INSIGHT_GENERATOR_USER = (question, result_json) => `User Question:
${question}

SQL Result (JSON):
${result_json}`;

exports.CHART_SELECTOR_USER = (result_json) => `Based on the dataset structure below, choose the best chart type.

Available types:
- KPI
- Bar
- Line
- Pie
- Table
- Scatter

Dataset:
${result_json}

Return JSON:
{
  "chart_type": "",
  "x_axis": "",
  "y_axis": ""
}`;

exports.FOLLOW_UP_USER = (question, result_json) => `Based on the user question and result, suggest 3 follow-up analytical questions.

User Question:
${question}

SQL Result (JSON):
${result_json}`;
