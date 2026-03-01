const OpenAI = require("openai");
const prompts = require("../utils/prompts");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.generateSQL = async (question, schema) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: prompts.SQL_GENERATOR_SYSTEM },
        {
          role: "user",
          content: prompts.SQL_GENERATOR_USER(question, JSON.stringify(schema)),
        },
      ],
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.warn(
      "AI Service Error (generateSQL), using fallback:",
      error.message,
    );
    // Simple fallback for demonstration
    if (question.toLowerCase().includes("revenue")) {
      return "SELECT SUM(revenue) FROM sales;";
    }
    return "SELECT * FROM sales LIMIT 10;";
  }
};

exports.validateSQL = async (sql) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a SQL security expert." },
        { role: "user", content: prompts.SQL_VALIDATOR_USER(sql) },
      ],
    });
    const content = response.choices[0].message.content.trim();
    if (content.toUpperCase() === "SAFE") {
      return { safe: true };
    } else {
      return { safe: false, reason: content };
    }
  } catch (error) {
    console.warn(
      "AI Service Error (validateSQL), using fallback:",
      error.message,
    );
    // Safety check fallback: Only allow SELECT
    const isOnlySelect = sql.trim().toUpperCase().startsWith("SELECT");
    return {
      safe: isOnlySelect,
      reason: isOnlySelect
        ? null
        : "Fallback: Only SELECT queries are allowed when AI service is unavailable.",
    };
  }
};

exports.generateInsights = async (question, result) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: prompts.INSIGHT_GENERATOR_SYSTEM },
        {
          role: "user",
          content: prompts.INSIGHT_GENERATOR_USER(
            question,
            JSON.stringify(result),
          ),
        },
      ],
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.warn(
      "AI Service Error (generateInsights), using fallback:",
      error.message,
    );
    return `Analysis Summary: The dataset contains ${result.length} records.
Key Trend: Total value across entries is significant.
Recommendation: Continue monitoring performance metrics to identify growth opportunities. (AI Fallback Mode)`;
  }
};

exports.selectChartType = async (result, question = "") => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a data visualization expert using Recharts. Analyze the dataset and user question to suggest the top 3 relevant chart configurations.
          Each config MUST be a JSON object with:
          - "chart_type": (BAR, LINE, PIE, AREA, KPI, or TABLE)
          - "x_axis": column name for X
          - "y_axis": column name for Y
          - "group_by": optional category column
          - "style": An object containing:
              - "orientation": "vertical" or "horizontal" (for BAR)
              - "color_scheme": "blues", "emerald", "sunset", or "cool"
              - "show_grid": boolean
              - "show_labels": boolean
              - "curve_type": "monotone", "step", or "linear" (for LINE/AREA)
          
          Rules:
          1. Return { "primary": config, "suggestions": [config, config] }
          2. Listen to user style requests in the question (e.g., "make it green" -> "emerald", "horizontal" -> "horizontal").
          3. Prefer AREA with "monotone" curve for time series.`,
        },
        {
          role: "user",
          content: `Question: ${question}\nData Sample: ${JSON.stringify(result.slice(0, 5))}`,
        },
      ],
      response_format: { type: "json_object" },
    });
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.warn(
      "AI Service Error (selectChartType), using fallback:",
      error.message,
    );

    if (!result || result.length === 0) {
      return {
        primary: { chart_type: "TABLE", x_axis: "", y_axis: "", style: {} },
        suggestions: [],
      };
    }

    const keys = Object.keys(result[0]);
    const numericKeys = keys
      .filter((k) => {
        const val = result[0][k];
        return (
          typeof val === "number" || (!isNaN(parseFloat(val)) && isFinite(val))
        );
      })
      .filter((k) => k.toLowerCase() !== "id");

    const labelKeys = keys.filter((k) => !numericKeys.includes(k));
    const bestX =
      labelKeys.find(
        (k) =>
          k.toLowerCase().includes("date") || k.toLowerCase().includes("name"),
      ) ||
      labelKeys[0] ||
      keys[0];
    const bestY = numericKeys[0];

    const defaultStyle = {
      orientation: "vertical",
      color_scheme: "blues",
      show_grid: true,
      show_labels: false,
    };

    return {
      primary: {
        chart_type: bestX.toLowerCase().includes("date") ? "AREA" : "BAR",
        x_axis: bestX,
        y_axis: bestY,
        style: {
          ...defaultStyle,
          orientation: result.length > 8 ? "horizontal" : "vertical",
        },
      },
      suggestions: [
        {
          chart_type: "PIE",
          x_axis: bestX,
          y_axis: bestY,
          style: defaultStyle,
        },
        {
          chart_type: "LINE",
          x_axis: bestX,
          y_axis: bestY,
          style: { ...defaultStyle, curve_type: "monotone" },
        },
      ],
    };
  }
};

exports.suggestFollowUps = async (question, result) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a business intelligence assistant.",
        },
        {
          role: "user",
          content: prompts.FOLLOW_UP_USER(question, JSON.stringify(result)),
        },
      ],
    });
    return response.choices[0].message.content
      .split("\n")
      .filter((q) => q.trim() !== "");
  } catch (error) {
    console.warn(
      "AI Service Error (suggestFollowUps), using fallback:",
      error.message,
    );
    return [
      "Show sales by region",
      "What is the average revenue per product?",
      "Show me the latest transactions",
    ];
  }
};
