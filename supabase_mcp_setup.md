# Setting up Supabase/PostgreSql MCP Server

To allow Antigravity (or any other MCP-enabled AI client) to connect to, inspect, and run SQL queries against your Supabase database directly, you can configure the official PostgreSQL MCP server.

## 1. Configure the MCP Server

Add the following configuration to your IDE's MCP settings file (typically located in your user settings or IDE config folder e.g., `mcp_config.json` or your developer settings):

```json
{
  "mcpServers": {
    "supabase-postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:6543/postgres"
      ]
    }
  }
}
```

### Finding your Connection String in Supabase:
1. Go to your **Supabase Dashboard**.
2. Navigate to **Project Settings** > **Database**.
3. Under **Connection string**, select **URI**.
4. Copy the URI and replace `[YOUR-PASSWORD]` with your actual Supabase database password.
5. Use port `6543` (connection pooling) or port `5432` (direct connection).

---

## 2. Capabilities Enabled

Once configured, the MCP server will expose the following tools to the agent:
- `query`: Run read-only or transactional SQL queries.
- `describe-table`: Fetch columns, data types, and constraint definitions.
- `list-tables`: Show all available tables in the schemas.

This allows the assistant to execute database migrations, verify rows, and inspect your schemas automatically!
