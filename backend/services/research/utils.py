def extract_subagent_capabilities(subagent: dict) -> dict:
    return {
        "name": subagent["name"],
        "description": subagent["description"],
    }
