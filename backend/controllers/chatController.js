const aiService = require("../services/aiService");
const dbService = require("../services/dbService");
const schemaMetadata = require("../data/schemaMetadata.json");
const fs = require("fs");
const path = require("path");

const SCHEMA_PATH = path.join(__dirname, "../data/schemaMetadata.json");

exports.handleQuery = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    // Reload schema from file in case it was updated
    const currentSchema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8"));

    // 1. Generate SQL from natural language
    const sql = await aiService.generateSQL(question, currentSchema);

    // 2. Validate SQL for safety
    const isSafe = await aiService.validateSQL(sql);
    if (!isSafe.safe) {
      return res
        .status(403)
        .json({ error: "Unsafe query detected", reason: isSafe.reason });
    }

    // 3. Execute SQL query
    const result = await dbService.executeQuery(sql);

    // 4. Generate AI Insights from data
    const insights = await aiService.generateInsights(question, result);

    // 5. Select appropriate chart type
    const chartConfig = await aiService.selectChartType(result, question);

    // 6. Suggest follow-up questions
    const followUps = await aiService.suggestFollowUps(question, result);

    res.json({
      sql,
      data: result,
      insights,
      chartConfig,
      followUps,
    });
  } catch (error) {
    console.error("Error handling query:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

exports.getSchema = (req, res) => {
  try {
    const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
    res.json(schema);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read schema' });
  }
};

exports.getDbStatus = async (req, res) => {
  try {
    const result = await dbService.executeQuery('SELECT current_database() as db_name');
    res.json({ connected: true, db: result[0].db_name });
  } catch (error) {
    res.json({ connected: false, error: error.message });
  }
};

exports.updateSchema = (req, res) => {
  try {
    const newSchema = req.body;
    fs.writeFileSync(SCHEMA_PATH, JSON.stringify(newSchema, null, 2));
    res.json({ message: "Schema updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update schema" });
  }
};
