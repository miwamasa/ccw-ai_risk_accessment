"""LLM client implementations."""

from typing import Optional
from abc import ABC, abstractmethod
import os


class LLMClient(ABC):
    """LLMクライアントの抽象基底クラス"""

    @abstractmethod
    async def call(
        self,
        prompt: str,
        system_prompt: Optional[str] = None
    ) -> str:
        """LLM APIを呼び出す"""
        pass


class OpenAIClient(LLMClient):
    """OpenAI APIクライアント"""

    def __init__(self, api_key: str, model: str = "gpt-4"):
        try:
            from openai import AsyncOpenAI
        except ImportError:
            raise ImportError("openai package is required. Install with: pip install openai")

        self.client = AsyncOpenAI(api_key=api_key)
        self.model = model

    async def call(
        self,
        prompt: str,
        system_prompt: Optional[str] = None
    ) -> str:
        messages = []

        if system_prompt:
            messages.append({
                "role": "system",
                "content": system_prompt
            })

        messages.append({
            "role": "user",
            "content": prompt
        })

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.7,
            max_tokens=2000
        )

        return response.choices[0].message.content


class ClaudeClient(LLMClient):
    """Anthropic Claude APIクライアント"""

    def __init__(self, api_key: str, model: str = "claude-3-opus-20240229"):
        try:
            from anthropic import AsyncAnthropic
        except ImportError:
            raise ImportError("anthropic package is required. Install with: pip install anthropic")

        self.client = AsyncAnthropic(api_key=api_key)
        self.model = model

    async def call(
        self,
        prompt: str,
        system_prompt: Optional[str] = None
    ) -> str:
        message = await self.client.messages.create(
            model=self.model,
            max_tokens=2000,
            system=system_prompt or "",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return message.content[0].text


class LLMClientFactory:
    """LLMクライアントのファクトリー"""

    @staticmethod
    def create(
        provider: Optional[str] = None,
        api_key: Optional[str] = None,
        model: Optional[str] = None
    ) -> LLMClient:
        """プロバイダーに応じたクライアントを生成"""
        # 環境変数から取得
        provider = provider or os.getenv("LLM_PROVIDER", "openai")

        if provider == "openai":
            api_key = api_key or os.getenv("OPENAI_API_KEY")
            model = model or os.getenv("LLM_MODEL", "gpt-4")
            if not api_key:
                raise ValueError("OPENAI_API_KEY is required")
            return OpenAIClient(api_key, model)
        elif provider == "claude":
            api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
            model = model or os.getenv("LLM_MODEL", "claude-3-opus-20240229")
            if not api_key:
                raise ValueError("ANTHROPIC_API_KEY is required")
            return ClaudeClient(api_key, model)
        else:
            raise ValueError(f"Unknown provider: {provider}")
