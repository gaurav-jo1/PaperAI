import inspect

def extract_tool_info(func) -> dict:

    return {
        "name": func.__name__,
        "description": inspect.getdoc(func),
    }


def extract_subagent_capabilities(subagent: dict) -> dict:
    return {
        "name": subagent["name"],
        "description": subagent["description"],
        "system_prompt": subagent["system_prompt"],
        "tools": [extract_tool_info(t) for t in subagent["tools"]],
    }
