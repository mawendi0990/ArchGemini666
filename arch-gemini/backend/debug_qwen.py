
import asyncio
import os
from dotenv import load_dotenv
import uvicorn

# Manually load env since we are running a script, not the full app
load_dotenv()

# Mock settings just in case core.config relies on env vars being present
# Implementation notes: We need to import the service. 
# We need to make sure python path is correct. 
# This script should be run from backend directory.

try:
    from services.qwen_service import optimize_prompt
except ImportError:
    import sys
    sys.path.append(os.getcwd())
    from services.qwen_service import optimize_prompt

async def main():
    print("----- Qwen Prompt Optimization Debugger -----")
    print("Testing prompt optimization...")
    
    test_inputs = [
        "湖边的现代别墅，黄昏，极简主义",
        "一个像飞船一样的博物馆，停在沙漠里",
        "old brick factory converted into office, sunny day"
    ]
    
    for user_input in test_inputs:
        print(f"\n[Input]: {user_input}")
        try:
            result = await optimize_prompt(user_input)
            print(f"[Output]:\n{result}")
        except Exception as e:
            print(f"[Error]: {e}")
            print("Make sure your .env file has QWEN_API_KEY and correct QWEN_API_BASE_URL")

if __name__ == "__main__":
    asyncio.run(main())
