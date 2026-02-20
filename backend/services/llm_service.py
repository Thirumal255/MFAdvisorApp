"""
LLM Service - Universal AI Provider Interface
==============================================
FILE: backend/services/llm_service.py

Supports: Claude (Anthropic), GPT (OpenAI), Gemini (Google)
Switch providers by changing LLM_PROVIDER in .env file.

USAGE:
    from services.llm_service import get_llm_provider
    
    llm = get_llm_provider()  # Uses LLM_PROVIDER from .env
    response = llm.generate("What is a mutual fund?")
"""

import os
from typing import Optional, List, Dict
from abc import ABC, abstractmethod
from dotenv import load_dotenv

load_dotenv()


# =============================================================================
# SYSTEM PROMPT - MF Bestie Personality
# =============================================================================

MFBESTIE_SYSTEM_PROMPT = """
You are MF Bestie 🎯, a friendly Gen-Z style mutual fund advisor for Indian investors.

PERSONALITY:
- Casual, friendly, uses emojis (but not excessive)
- Explains complex finance in simple terms
- Uses relatable analogies ("SIP is like a gym membership for your money 💪")
- Supportive and non-judgmental about financial mistakes

CAPABILITIES:
1. Risk Profiling: Assess user's risk appetite (using SEBI Risk-O-Meter levels)
2. Asset Allocation: Recommend portfolio mix based on goals and risk
3. Fund Information: Answer questions about specific mutual funds
4. Comparisons: Compare funds and explain differences clearly
5. Recommendations: Suggest funds matching user's risk profile

SEBI RISK-O-METER LEVELS (use these for recommendations):
- Low: Overnight, Liquid funds
- Low to Moderate: Ultra Short, Money Market
- Moderate: Short Duration, Corporate Bond
- Moderately High: Large Cap, Balanced Advantage
- High: Mid Cap, Flexi Cap, ELSS
- Very High: Small Cap, Sectoral, Thematic

RULES:
- Always be accurate with numbers - never make up data
- If you don't know something, say "I don't have that info" honestly
- Never recommend specific stocks (only mutual funds)
- Always mention past performance doesn't guarantee future returns
- For tax advice, suggest consulting a CA
- Use Indian Rupee (₹) for all amounts
- Reference Indian market context (NSE, BSE, SEBI, AMFI)

RESPONSE FORMAT:
- Keep responses concise (under 200 words unless explaining something complex)
- Use bullet points for lists
- Include fund names with actual metrics when data is available
- End with a follow-up question or helpful suggestion when appropriate
- Format numbers nicely: ₹1,00,000 not ₹100000

When given CONTEXT about funds, use that data - don't invent numbers!
"""


# =============================================================================
# BASE CLASS
# =============================================================================

class BaseLLMProvider(ABC):
    """Abstract base class for LLM providers."""
    
    @abstractmethod
    def generate(
        self, 
        prompt: str, 
        system_prompt: Optional[str] = None,
        max_tokens: int = 2048
    ) -> str:
        """Generate a simple response."""
        pass
    
    @abstractmethod
    def generate_with_context(
        self, 
        prompt: str, 
        context: List[Dict],
        chat_history: List[Dict],
        system_prompt: Optional[str] = None
    ) -> str:
        """Generate response using RAG context."""
        pass
    
    def _format_context(self, context: List[Dict]) -> str:
        """Format context documents for prompt."""
        if not context:
            return "No specific fund information available."
        
        parts = []
        for i, doc in enumerate(context, 1):
            source = doc.get('source', doc.get('fund_name', f'Document {i}'))
            content = doc.get('content', '')
            parts.append(f"[{source}]\n{content}")
        
        return "\n\n---\n\n".join(parts)


# =============================================================================
# CLAUDE PROVIDER
# =============================================================================

class ClaudeProvider(BaseLLMProvider):
    """Anthropic Claude API integration."""
    
    def __init__(self, model: str = "claude-sonnet-4-20250514"):
        try:
            from anthropic import Anthropic
            
            api_key = os.getenv("ANTHROPIC_API_KEY")
            if not api_key:
                raise ValueError("ANTHROPIC_API_KEY not found in environment")
            
            self.client = Anthropic(api_key=api_key)
            self.model = model
            print(f"✅ Claude initialized: {model}")
            
        except ImportError:
            raise ImportError("Install anthropic: pip install anthropic")
    
    def generate(
        self, 
        prompt: str, 
        system_prompt: Optional[str] = None,
        max_tokens: int = 2048
    ) -> str:
        response = self.client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            system=system_prompt or "You are a helpful assistant.",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text
    
    def generate_with_context(
        self,
        prompt: str,
        context: List[Dict],
        chat_history: List[Dict],
        system_prompt: Optional[str] = None
    ) -> str:
        context_text = self._format_context(context)
        
        full_prompt = f"""
Based on the following mutual fund information:

{context_text}

---

User Question: {prompt}

Provide a helpful, accurate response based on the information above.
If the information doesn't contain the answer, say so honestly.
"""
        
        messages = [{"role": m["role"], "content": m["content"]} for m in chat_history[-10:]]
        messages.append({"role": "user", "content": full_prompt})
        
        response = self.client.messages.create(
            model=self.model,
            max_tokens=2048,
            system=system_prompt or MFBESTIE_SYSTEM_PROMPT,
            messages=messages
        )
        
        return response.content[0].text


# =============================================================================
# OPENAI PROVIDER
# =============================================================================

class OpenAIProvider(BaseLLMProvider):
    """OpenAI GPT API integration."""
    
    def __init__(self, model: str = "gpt-4o"):
        try:
            from openai import OpenAI
            
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise ValueError("OPENAI_API_KEY not found in environment")
            
            self.client = OpenAI(api_key=api_key)
            self.model = model
            print(f"✅ OpenAI initialized: {model}")
            
        except ImportError:
            raise ImportError("Install openai: pip install openai")
    
    def generate(
        self, 
        prompt: str, 
        system_prompt: Optional[str] = None,
        max_tokens: int = 2048
    ) -> str:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt or "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=max_tokens
        )
        return response.choices[0].message.content
    
    def generate_with_context(
        self,
        prompt: str,
        context: List[Dict],
        chat_history: List[Dict],
        system_prompt: Optional[str] = None
    ) -> str:
        context_text = self._format_context(context)
        
        full_prompt = f"""
Based on the following mutual fund information:

{context_text}

---

User Question: {prompt}
"""
        
        messages = [{"role": "system", "content": system_prompt or MFBESTIE_SYSTEM_PROMPT}]
        messages.extend([{"role": m["role"], "content": m["content"]} for m in chat_history[-10:]])
        messages.append({"role": "user", "content": full_prompt})
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=2048
        )
        
        return response.choices[0].message.content


# =============================================================================
# GEMINI PROVIDER
# =============================================================================

class GeminiProvider(BaseLLMProvider):
    """Google Gemini API integration."""
    
    def __init__(self, model: str = "gemini-1.5-flash"):
        try:
            import google.generativeai as genai
            
            api_key = os.getenv("GOOGLE_API_KEY")
            if not api_key:
                raise ValueError("GOOGLE_API_KEY not found in environment")
            
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel(model)
            self.model_name = model
            print(f"✅ Gemini initialized: {model}")
            
        except ImportError:
            raise ImportError("Install google-generativeai: pip install google-generativeai")
    
    def generate(
        self, 
        prompt: str, 
        system_prompt: Optional[str] = None,
        max_tokens: int = 2048
    ) -> str:
        full_prompt = f"{system_prompt}\n\nUser: {prompt}" if system_prompt else prompt
        response = self.model.generate_content(
            full_prompt,
            generation_config={"max_output_tokens": max_tokens}
        )
        return response.text
    
    def generate_with_context(
        self,
        prompt: str,
        context: List[Dict],
        chat_history: List[Dict],
        system_prompt: Optional[str] = None
    ) -> str:
        context_text = self._format_context(context)
        
        history_text = "\n".join([
            f"{'User' if m['role'] == 'user' else 'Assistant'}: {m['content']}"
            for m in chat_history[-10:]
        ])
        
        full_prompt = f"""
{system_prompt or MFBESTIE_SYSTEM_PROMPT}

Previous conversation:
{history_text}

Mutual Fund Information:
{context_text}

---

User: {prompt}
"""
        
        response = self.model.generate_content(
            full_prompt,
            generation_config={"max_output_tokens": 2048}
        )
        return response.text


# =============================================================================
# FACTORY FUNCTION
# =============================================================================

def get_llm_provider(provider: Optional[str] = None) -> BaseLLMProvider:
    """
    Get an LLM provider instance.
    
    Args:
        provider: "claude", "openai", or "gemini"
                 If None, reads LLM_PROVIDER from .env
    
    Returns:
        LLM provider ready to use
    """
    provider = provider or os.getenv("LLM_PROVIDER", "claude")
    provider = provider.lower().strip()
    
    print(f"🤖 Initializing LLM: {provider}")
    
    if provider in ("claude", "anthropic"):
        return ClaudeProvider()
    elif provider in ("openai", "gpt"):
        return OpenAIProvider()
    elif provider in ("gemini", "google"):
        return GeminiProvider()
    else:
        raise ValueError(f"Unknown provider: {provider}. Use 'claude', 'openai', or 'gemini'")


# =============================================================================
# TESTING
# =============================================================================

if __name__ == "__main__":
    print("Testing LLM Service...")
    
    try:
        llm = get_llm_provider()
        response = llm.generate(
            "What is a mutual fund? Answer in 2 sentences.",
            system_prompt="You are a helpful financial advisor."
        )
        print(f"\nResponse: {response}")
        print("\n✅ Test passed!")
    except Exception as e:
        print(f"\n❌ Error: {e}")
