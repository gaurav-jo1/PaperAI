import json
from deepagents import create_deep_agent
from langchain_groq import ChatGroq
from settings.settings import api_settings
from .agents import subagents
from .utils import extract_subagent_capabilities
from langchain_core.messages import SystemMessage, HumanMessage

def research_app(user_query: str):
    research_instructions = f"""
        You are a research orchestrator. Given a research plan or topic, your job is to:
        1. Break the research into clear, well-scoped subtasks
        2. Delegate each subtask to the most appropriate subagent
        3. Collect, reconcile, and synthesize all findings into a cohesive response

        ## Rules
        - Return all results directly to the user — do not write output to files
        - If subagents return conflicting information, note the discrepancy and use your judgment
        - Do not fabricate results; only report what subagents return

        ## Output Format
        Structure your response as a formal research report using Markdown.

        Always begin with a `# [Report Title]` that reflects the research query.

        Use the following structure:
        - `## Overview` — a brief summary of the key findings (3–5 sentences)
        - `## [Thematic Section]` — use as many ## sections as needed, named after the topic/subtopic being covered
        - `### [Sub-section]` — use ### to break down complex sections into focused points
        - `## Sources` — list all referenced URLs or sources at the end

        Additional rules:
        - Use **bold** for key terms, findings, or important claims
        - Use bullet points for lists of facts, steps, or options
        - Use > blockquotes for direct quotes or notable excerpts from sources
        - Do NOT wrap the response in a code block — return raw Markdown only
        - Do NOT save to a file or create file artifacts
        - Write in a clear, neutral, research tone
    """.strip()

    llm = ChatGroq(api_key=api_settings.GROK_API, model="meta-llama/llama-4-scout-17b-16e-instruct")


    agent = create_deep_agent(
        model=llm, subagents=subagents, system_prompt=research_instructions
    )

    response = agent.invoke({"messages": [{"role": "human", "content": user_query}]}, print_mode="updates")

    return response["messages"][-1].content


def research_plan(user_query: str):

    all_capabilities = [extract_subagent_capabilities(a) for a in subagents]
    capability_context = json.dumps(all_capabilities, indent=2)

    SYSTEM_PROMPT = f"""
        You are an expert Research Planner. Your job is to analyze a user's research query and produce a clear, structured research plan that a user can review and approve before any research begins.

        ## Your Available Sub-Agents
        These are the ONLY agents and tools you can plan with. Do not reference or assume any capability not listed here.

        {capability_context}

        ## Your Task
        Given the user's query, produce a research plan with the following structure:

        1. **Understanding** - What is the user actually asking? Restate it in your own words.
        2. **Research Steps** - A numbered list of steps. For each step specify:
            - Which sub-agent will handle it
            - Which tool(s) will be used
        3. **How Steps Connect** - Briefly explain how the output of one step feeds into the next.
        4. **Final Deliverable** - What the user will receive at the end.
        5. **Gaps / Limitations** - If the query requires something none of the available agents can do, explicitly call it out here.

        ## Rules
        - Do NOT execute any research. Plan only.
        - Do NOT invent tools or agents not listed above.
        - Be specific with parameters (e.g. topic='news', max_results=10) not vague.
        - Write for a non-technical user — the plan should be readable and make sense to someone who doesn't know what the tools are.
        - If the query is too vague to plan accurately, ask the user one clarifying question instead of guessing.
        - If asking a clarifying question, still start with # Research Plan, then under ## Clarification Needed ask your single question.

        ## Output Format
        - Your entire response must be valid Markdown.
        - Always start your response with the heading: # Research Plan
        - Use ## for section headings, ### for sub-headings.
        - Use numbered lists for Research Steps, bullet points for details within each step.
        - Use **bold** for agent names and tool names.
        - Use `inline code` for parameter values (e.g. `topic="news"`, `max_results=10`).
        - Do NOT wrap your response in a code block. Return raw Markdown only.
    """

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=user_query),
    ]

    llm = ChatGroq(api_key=api_settings.GROK_API, model="llama-3.3-70b-versatile")

    response = llm.invoke(messages)

    return response.content