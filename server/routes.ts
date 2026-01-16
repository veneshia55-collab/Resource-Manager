import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const SYSTEM_PROMPT = `당신은 "리버(LiBu)"라는 이름의 친절한 AI 학습 도우미입니다. 한국 중고등학생들이 미디어 리터러시 역량을 키울 수 있도록 도와줍니다.

특징:
- 항상 한국어로 응답합니다
- 학생 눈높이에 맞춰 쉽게 설명합니다
- 격려와 응원을 아끼지 않습니다
- 정확하고 객관적인 정보를 제공합니다

응답은 반드시 요청된 JSON 형식으로만 제공하세요.`;

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/libu/vocabulary", async (req: Request, res: Response) => {
    try {
      const { words, contentTitle, contentText } = req.body;

      const prompt = `콘텐츠 제목: "${contentTitle}"
콘텐츠 내용 일부: "${contentText?.substring(0, 500)}"

학생이 다음 단어/표현의 뜻을 모르겠다고 합니다: "${words}"

다음 JSON 형식으로 응답하세요:
{
  "word": "메인 단어",
  "synonyms": ["동의어1", "동의어2", "동의어3"],
  "definition": "사전적 정의",
  "easyExplanation": "중학생이 이해할 수 있는 쉬운 설명 (1-2문장)",
  "difficulty": 숫자(0-100, 어려울수록 높음),
  "sources": [
    {"title": "참고 자료 제목", "snippet": "관련 설명", "url": ""}
  ],
  "quiz": {
    "question": "이 단어와 관련된 OX 퀴즈 문제",
    "answer": true 또는 false,
    "explanation": "정답 설명"
  }
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 1000,
      });

      const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
      res.json(result);
    } catch (error) {
      console.error("Vocabulary error:", error);
      res.status(500).json({ error: "어휘 분석 중 오류가 발생했습니다." });
    }
  });

  app.post("/api/libu/summary", async (req: Request, res: Response) => {
    try {
      const { userSummary, contentTitle, contentText } = req.body;

      const prompt = `콘텐츠 제목: "${contentTitle}"
콘텐츠 전문: "${contentText}"

학생이 작성한 요약: "${userSummary}"

1. 먼저 콘텐츠를 AI가 정확하게 요약하세요
2. 학생의 요약과 비교 분석하세요
3. 빠진 내용, 왜곡 가능성을 찾아주세요

다음 JSON 형식으로 응답하세요:
{
  "aiSummary": "AI가 작성한 3-4문장 요약",
  "keyPoints": ["핵심 포인트1", "핵심 포인트2", "핵심 포인트3"],
  "comparison": {
    "common": ["학생과 AI 요약의 공통점1", "공통점2"],
    "missing": ["학생 요약에서 빠진 내용1", "빠진 내용2"],
    "potential_issues": ["왜곡될 수 있는 부분1", "왜곡될 수 있는 부분2"]
  },
  "checkList": ["교정 체크리스트 항목1", "항목2", "항목3"],
  "gapScore": 숫자(0-100, 격차가 클수록 높음),
  "sources": [
    {"title": "참고 자료 제목", "snippet": "관련 설명", "url": ""}
  ]
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 1500,
      });

      const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
      res.json(result);
    } catch (error) {
      console.error("Summary error:", error);
      res.status(500).json({ error: "요약 분석 중 오류가 발생했습니다." });
    }
  });

  app.post("/api/libu/inference", async (req: Request, res: Response) => {
    try {
      const { interpretation, contentTitle, contentText } = req.body;

      const prompt = `콘텐츠 제목: "${contentTitle}"
콘텐츠 내용: "${contentText}"

학생의 해석/추론: "${interpretation}"

학생의 추론을 더 깊이 있게 발전시킬 수 있는 질문과 배경지식을 제공하세요.

다음 JSON 형식으로 응답하세요:
{
  "questions": [
    "생각을 확장하는 질문1",
    "생각을 확장하는 질문2",
    "생각을 확장하는 질문3"
  ],
  "backgroundCards": [
    {"title": "배경지식 제목1", "explanation": "쉬운 설명"},
    {"title": "배경지식 제목2", "explanation": "쉬운 설명"}
  ],
  "additionalLinks": [
    {"title": "더 알아보기 링크 제목", "url": "https://ko.wikipedia.org/..."}
  ],
  "confidenceScore": 숫자(0-100, 추론의 근거가 충실할수록 높음),
  "sources": [
    {"title": "참고 자료 제목", "snippet": "관련 설명", "url": ""}
  ]
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 1500,
      });

      const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
      res.json(result);
    } catch (error) {
      console.error("Inference error:", error);
      res.status(500).json({ error: "추론 분석 중 오류가 발생했습니다." });
    }
  });

  app.post("/api/libu/critical", async (req: Request, res: Response) => {
    try {
      const { claim, contentTitle, contentText } = req.body;

      const prompt = `콘텐츠 제목: "${contentTitle}"
콘텐츠 내용: "${contentText}"

학생의 주장: "${claim}"

1. 찬성과 반대 논거를 각각 제시하세요
2. AI가 반박과 재반박 토론을 시뮬레이션하세요
3. 다양한 관점에서 이 주제를 바라보게 해주세요

다음 JSON 형식으로 응답하세요:
{
  "proArguments": [
    {"point": "찬성 논거1", "source": 1},
    {"point": "찬성 논거2", "source": 2}
  ],
  "conArguments": [
    {"point": "반대 논거1", "source": 1},
    {"point": "반대 논거2", "source": 2}
  ],
  "debate": [
    {"role": "rebuttal", "message": "반박 메시지"},
    {"role": "counter-rebuttal", "message": "재반박 메시지"}
  ],
  "perspectives": {
    "pro": "찬성 입장에서 본 관점 요약",
    "con": "반대 입장에서 본 관점 요약",
    "neutral": "중립적 관점에서 본 요약"
  },
  "ethicsPoints": [
    "정보 윤리 관점에서 고려할 점1",
    "정보 윤리 관점에서 고려할 점2"
  ],
  "diversityScore": 숫자(0-100, 다양한 관점 고려 정도),
  "sources": [
    {"title": "참고 자료 제목", "snippet": "관련 설명", "url": ""}
  ]
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 2000,
      });

      const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
      res.json(result);
    } catch (error) {
      console.error("Critical error:", error);
      res.status(500).json({ error: "비판적 분석 중 오류가 발생했습니다." });
    }
  });

  app.post("/api/libu/integration", async (req: Request, res: Response) => {
    try {
      const { keywords, contentTitle, contentText } = req.body;

      const prompt = `콘텐츠 제목: "${contentTitle}"
콘텐츠 내용: "${contentText}"
${keywords ? `강조 키워드: "${keywords}"` : ""}

이 콘텐츠의 핵심 개념들을 마인드맵 형태로 정리해주세요.

다음 JSON 형식으로 응답하세요:
{
  "nodes": [
    {"id": "1", "label": "중심 주제", "level": 0, "parent": null},
    {"id": "2", "label": "하위 개념1", "level": 1, "parent": "1"},
    {"id": "3", "label": "하위 개념2", "level": 1, "parent": "1"},
    {"id": "4", "label": "세부 개념1-1", "level": 2, "parent": "2"},
    {"id": "5", "label": "세부 개념1-2", "level": 2, "parent": "2"},
    {"id": "6", "label": "세부 개념2-1", "level": 2, "parent": "3"}
  ],
  "summary": [
    "마인드맵 핵심 포인트 해설1",
    "마인드맵 핵심 포인트 해설2",
    "마인드맵 핵심 포인트 해설3"
  ],
  "sources": [
    {"title": "참고 자료 제목", "snippet": "관련 설명", "url": ""}
  ]
}

노드는 최소 6개, 최대 12개로 구성하세요. 레벨은 0(중심), 1(주요 가지), 2(세부 가지)로 나누세요.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 1500,
      });

      const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
      res.json(result);
    } catch (error) {
      console.error("Integration error:", error);
      res.status(500).json({ error: "통합 분석 중 오류가 발생했습니다." });
    }
  });

  app.post("/api/libu/verification", async (req: Request, res: Response) => {
    try {
      const { contentTitle, contentText, contentUrl } = req.body;

      const prompt = `콘텐츠 제목: "${contentTitle}"
콘텐츠 내용: "${contentText}"
${contentUrl ? `URL: "${contentUrl}"` : ""}

이 콘텐츠의 정보 안전성을 4가지 기준으로 평가해주세요:
1. 출처 명확성: 정보의 출처가 명확하게 제시되어 있는가
2. 전문성: 작성자나 매체의 전문성이 있는가
3. 정보 정확성: 사실관계가 정확한가, 검증 가능한가
4. 확장 가능성: 다른 출처에서도 확인할 수 있는가

다음 JSON 형식으로 응답하세요:
{
  "scores": {
    "sourceClarity": 숫자(0-100),
    "expertise": 숫자(0-100),
    "accuracy": 숫자(0-100),
    "expandability": 숫자(0-100)
  },
  "explanations": {
    "sourceClarity": "출처 명확성에 대한 평가 설명",
    "expertise": "전문성에 대한 평가 설명",
    "accuracy": "정보 정확성에 대한 평가 설명",
    "expandability": "확장 가능성에 대한 평가 설명"
  },
  "totalScore": 숫자(0-100, 4개 점수의 평균),
  "improvements": [
    "정보 신뢰도를 높이기 위한 조언1",
    "정보 신뢰도를 높이기 위한 조언2",
    "정보 신뢰도를 높이기 위한 조언3"
  ],
  "sources": [
    {"title": "참고 자료 제목", "snippet": "관련 설명", "url": ""}
  ]
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 1500,
      });

      const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
      res.json(result);
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ error: "정보 검증 중 오류가 발생했습니다." });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
