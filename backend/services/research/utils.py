import inspect
from typing import get_type_hints


def clean_type(t) -> str:
    if t is inspect.Parameter.empty:
        return "any"
    if hasattr(t, "__origin__"):
        return str(t)
    if hasattr(t, "__name__"):
        return t.__name__
    return str(t)


def extract_tool_info(func) -> dict:
    sig = inspect.signature(func)
    hints = get_type_hints(func)

    return {
        "name": func.__name__,
        "description": inspect.getdoc(func),
        "parameters": {
            name: {
                "type": clean_type(hints.get(name, inspect.Parameter.empty)),
                "default": (
                    None if param.default is inspect.Parameter.empty else param.default
                ),
            }
            for name, param in sig.parameters.items()
        },
    }


def extract_subagent_capabilities(subagent: dict) -> dict:
    return {
        "name": subagent["name"],
        "description": subagent["description"],
        "system_prompt": subagent["system_prompt"],
        "tools": [extract_tool_info(t) for t in subagent["tools"]],
    }
