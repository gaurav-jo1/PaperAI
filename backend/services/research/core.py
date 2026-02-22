import json
from langchain_google_genai import ChatGoogleGenerativeAI
from deepagents import create_deep_agent

from settings.settings import api_settings
from .agents import subagents
from .utils import extract_subagent_capabilities


def research_app(user_query: str):

    research_instructions = """
        You are an expert researcher. Your job is to conduct thorough research and then write a polished report.

        You have access to an internet search tool as your primary means of gathering information.

        ## `internet_search`

        Use this to run an internet search for a given query. You can specify the max number of results to return, the topic, and whether raw content should be included.
    """

    llm = ChatGoogleGenerativeAI(
        model="gemini-3-flash-preview",
        api_key=api_settings.GEMINI_API_KEY,
        temperature=0.7,
    )

    agent = create_deep_agent(
        model=llm, subagents=subagents, system_prompt=research_instructions
    )

    response = agent.invoke({"messages": [{"role": "user", "content": user_query}]})

    return response["messages"][-1].content


def research_plan(user_query: str):

    all_capabilities = [extract_subagent_capabilities(a) for a in subagents]
    capability_context = json.dumps(all_capabilities, indent=2)

    SYSTEM_PROMPT = f"""You are an expert Research Planner. Your job is to analyze a user's research query and produce a clear, structured research plan that a user can review and approve before any research begins.

        ## Your Available Sub-Agents
        These are the ONLY agents and tools you can plan with. Do not reference or assume any capability not listed here.

        {capability_context}

        ## Your Task
        Given the user's query, produce a research plan with the following structure:

        1. **Understanding** - What is the user actually asking? Restate it in your own words.
        2. **Research Steps** - A numbered list of steps. For each step specify:
        - Which sub-agent will handle it
        - Which tool(s) will be used
        - What exact input/parameters will be passed
        - What output is expected from this step
        3. **How Steps Connect** - Briefly explain how the output of one step feeds into the next.
        4. **Final Deliverable** - What the user will receive at the end.
        5. **Gaps / Limitations** - If the query requires something none of the available agents can do, explicitly call it out here.

        ## Rules
        - Do NOT execute any research. Plan only.
        - Do NOT invent tools or agents not listed above.
        - Be specific with parameters (e.g. topic='news', max_results=10) not vague.
        - Write for a non-technical user — the plan should be readable and make sense to someone who doesn't know what the tools are.
        - If the query is too vague to plan accurately, ask the user one clarifying question instead of guessing.

    """

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_query},
    ]

    llm = ChatGoogleGenerativeAI(
        model="gemini-3-flash-preview",
        api_key=api_settings.GEMINI_API_KEY,
        temperature=0.7,
    )

    response = llm.invoke(messages)

    return response.content[0]["text"]
