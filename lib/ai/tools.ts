// RevRa AI Agent — Tool Definitions
// These map to the LLM function-calling schema

export const aiTools = [
  {
    name: "get_lead",
    description: "Get full lead profile with contact history, call history, and messages. Use this when you need to know anything about a specific lead.",
    parameters: {
      type: "object",
      properties: {
        lead_id: {
          type: "string",
          description: "UUID of the lead"
        }
      },
      required: ["lead_id"]
    }
  },
  {
    name: "get_leads_by_stage",
    description: "Get all leads in a specific pipeline stage. Use this to review leads by where they are in the sales process.",
    parameters: {
      type: "object",
      properties: {
        workspace_id: { type: "string", description: "UUID of the workspace" },
        stage: { type: "string", description: "Pipeline stage slug (e.g., 'new_lead', 'contacted')" }
      },
      required: ["workspace_id", "stage"]
    }
  },
  {
    name: "update_lead_score",
    description: "Update a lead's score (0-100) with your reasoning. A score of 85+ is a hot lead. Use this after calls or conversations.",
    parameters: {
      type: "object",
      properties: {
        lead_id: { type: "string" },
        score: { type: "number", minimum: 0, maximum: 100 },
        reason: { type: "string", description: "Why the score changed — be specific and cite evidence" }
      },
      required: ["lead_id", "score", "reason"]
    }
  },
  {
    name: "send_message",
    description: "Send an outbound message to a lead. Choose the right channel — SMS is most reliable, iMessage if available, WhatsApp if opted in.",
    parameters: {
      type: "object",
      properties: {
        lead_id: { type: "string" },
        message: { type: "string", description: "Message content to send" },
        channel: { type: "string", enum: ["sms", "imessage", "whatsapp"] }
      },
      required: ["lead_id", "message", "channel"]
    }
  },
  {
    name: "place_call",
    description: "Initiate an outbound call to a lead. The agent will receive the call and be connected to the lead.",
    parameters: {
      type: "object",
      properties: {
        lead_id: { type: "string", description: "UUID of the lead to call" }
      },
      required: ["lead_id"]
    }
  },
  {
    name: "create_task",
    description: "Create a follow-up task for the agent. Use this when a lead needs a specific action — call back, send info, schedule meeting.",
    parameters: {
      type: "object",
      properties: {
        lead_id: { type: "string" },
        title: { type: "string" },
        type: { type: "string", enum: ["call", "email", "sms", "follow_up", "schedule"] },
        due_date: { type: "string", description: "ISO 8601 datetime" },
        priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
        description: { type: "string" }
      },
      required: ["lead_id", "title", "type"]
    }
  },
  {
    name: "get_tasks",
    description: "Get the agent's task queue — pending follow-ups, scheduled calls, SLA items.",
    parameters: {
      type: "object",
      properties: {
        agent_id: { type: "string" },
        status: { type: "string", enum: ["pending", "completed", "all"], default: "pending" },
        limit: { type: "number", default: 20 }
      },
      required: ["agent_id"]
    }
  },
  {
    name: "complete_task",
    description: "Mark a task as completed. Use after an action is taken.",
    parameters: {
      type: "object",
      properties: {
        task_id: { type: "string" }
      },
      required: ["task_id"]
    }
  },
  {
    name: "update_pipeline_stage",
    description: "Move a lead to a new pipeline stage. Use this after qualifying or closing a deal.",
    parameters: {
      type: "object",
      properties: {
        lead_id: { type: "string" },
        stage: { type: "string", description: "Stage slug: new_lead, contacted, qualified, quote_sent, won, lost" }
      },
      required: ["lead_id", "stage"]
    }
  },
  {
    name: "schedule_event",
    description: "Schedule a calendar event with a lead — call, meeting, demo.",
    parameters: {
      type: "object",
      properties: {
        lead_id: { type: "string" },
        title: { type: "string" },
        start_time: { type: "string", description: "ISO 8601 datetime" },
        end_time: { type: "string", description: "ISO 8601 datetime" },
        description: { type: "string" }
      },
      required: ["lead_id", "title", "start_time", "end_time"]
    }
  },
  {
    name: "summarize_call",
    description: "Get the AI-generated summary and next steps from a past call.",
    parameters: {
      type: "object",
      properties: {
        call_id: { type: "string" }
      },
      required: ["call_id"]
    }
  },
  {
    name: "get_performance_report",
    description: "Get the agent's performance KPIs — calls made, conversion rate, lead response time, weekly goal progress.",
    parameters: {
      type: "object",
      properties: {
        agent_id: { type: "string" },
        period: { type: "string", enum: ["today", "week", "month"], default: "week" }
      },
      required: ["agent_id"]
    }
  }
] as const;

export type AIToolName = typeof aiTools[number]["name"];