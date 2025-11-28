"""
Directory Submission Agent using Browser-Use
This agent can use your existing Chrome/Safari sessions with saved logins
"""

import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(Path(__file__).parent / ".env")

from browser_use import Agent, Controller, Browser, BrowserConfig
from langchain_anthropic import ChatAnthropic

# Business information
BUSINESS_INFO = """
Business Name: Chris David Salon
Address: 1878C Dr Andres Way, Delray Beach, FL 33445
Phone: (561) 299-0950
Website: https://www.chrisdavidsalon.com
Email: chrisdavidhair@gmail.com (primary) or chrisdavidsalon@gmail.com

Hours:
- Sunday: Closed
- Monday: Closed
- Tuesday-Saturday: 11:00 AM - 6:00 PM

Categories: Hair Salon, Beauty Salon, Stylist, Hairdresser

Description: Chris David Salon is a premier hair color studio in Delray Beach's Andre Design District. Specializing in balayage, color correction, and hair extensions with 20+ years expertise. Certified Davines salon. Rated 4.9 stars with 140+ reviews. Veteran-owned. "Hair is the art you wear."

Social Media:
- Instagram: @chrisdavidsalon
- Facebook: facebook.com/ChrisDavidSalon
"""

# Directory submission tasks
TASKS = {
    "bing": f"""
    Go to https://www.bingplaces.com and:
    1. Click "Get Started" or "Sign in"
    2. Look for "Continue with Google" option and click it (this connects to chrisdavidhair@gmail.com Google account)
    3. After Google sign-in, look for "Import from Google" option - this imports Google Business Profile data
    4. If Import from Google is available, click it and import the Google Business Profile for Chris David Salon
    5. Verify the imported information matches: {BUSINESS_INFO}
    6. Complete the setup and confirm the listing

    IMPORTANT: Use "Continue with Google" NOT "Microsoft account" for authentication.
    """,

    "apple": f"""
    Go to https://businessconnect.apple.com and:
    1. Sign in with Apple ID (or use existing session)
    2. Search for "Chris David Salon" in Delray Beach, FL
    3. If the business is found, click to claim it
    4. If not found, add a new business with this info: {BUSINESS_INFO}
    5. Complete verification (may require phone call to (561) 299-0950)
    """,

    "foursquare": f"""
    Go to https://foursquare.com and:
    1. Search for "Chris David Salon Delray Beach FL"
    2. If found, click on the listing and look for "Claim this business" or "Manage"
    3. If not found, go to https://foursquare.com/venue/add
    4. Add the business with this info: {BUSINESS_INFO}
    5. Complete any verification steps
    """,

    "yellowpages": f"""
    Go to https://www.yp.com and:
    1. Look for "Add a Business" or "List Your Business" link
    2. Fill out the business listing form with: {BUSINESS_INFO}
    3. Complete the free listing (don't pay for premium)
    4. Verify via email to chrisdavidhair@gmail.com
    """,

    "manta": f"""
    Go to https://www.manta.com/claim and:
    1. Search for "Chris David Salon" in Delray Beach, FL
    2. If found, claim the existing listing
    3. If not found, add new business with: {BUSINESS_INFO}
    4. Complete profile with all available information
    """,

    "check_all": f"""
    Check the following directories to see if Chris David Salon is listed:
    1. https://www.bingplaces.com - search for Chris David Salon
    2. https://maps.apple.com - search for Chris David Salon Delray Beach
    3. https://foursquare.com - search for Chris David Salon Delray Beach
    4. https://www.yp.com - search for Chris David Salon Delray Beach FL
    5. https://www.manta.com - search for Chris David Salon Delray Beach

    For each one, report:
    - Whether the business is listed
    - If listed, whether the NAP matches: {BUSINESS_INFO}
    - If not listed, note that it needs to be added
    """
}


async def run_submission(task_name: str):
    """Run a directory submission task"""

    if task_name not in TASKS:
        print(f"Unknown task: {task_name}")
        print(f"Available tasks: {', '.join(TASKS.keys())}")
        return

    # Configure browser - use a fresh Playwright browser instance
    browser_config = BrowserConfig(
        headless=False,  # Show browser so you can see what's happening
        disable_security=True,  # Allow cross-origin requests
    )

    # Initialize the LLM
    llm = ChatAnthropic(
        model="claude-sonnet-4-20250514",
        api_key=os.environ.get("ANTHROPIC_API_KEY")
    )

    # Create the agent
    agent = Agent(
        task=TASKS[task_name],
        llm=llm,
        browser=Browser(config=browser_config),
    )

    print(f"\n🚀 Starting {task_name} submission...")
    print("=" * 50)

    try:
        result = await agent.run()
        print(f"\n✅ Completed: {task_name}")
        print(f"Result: {result}")
        return result
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return None


async def main():
    import sys

    if len(sys.argv) < 2:
        print("Usage: python browser-agent.py <task>")
        print(f"Available tasks: {', '.join(TASKS.keys())}")
        return

    task = sys.argv[1].lower()
    await run_submission(task)


if __name__ == "__main__":
    asyncio.run(main())
