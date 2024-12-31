# ETF 투자 도우미 AI 챗봇

## 프로젝트 소개
ETF 투자 도우미 AI 플랫폼은 초보 투자자부터 전문 투자자까지 ETF 투자에 필요한 모든 정보와 가이드를 제공하는 종합 플랫폼입니다. ETF 상품에 대한 학습과 투자여정까지 함께 하고자 기획하게 되었습니다.

## 프리뷰
![메인 화면](https://velog.velcdn.com/images/lheehee/post/a30d8b5c-d807-4fbe-9494-b4af3393451f/image.png)

![대화형 인터페이스](https://velog.velcdn.com/images/lheehee/post/2a3a4fb6-1209-43cb-8ac7-0a2a6ae23626/image.png)

![투자 가이드](https://velog.velcdn.com/images/lheehee/post/0422c572-5ca0-472e-978d-dbc50d0b3be3/image.png)

![포트폴리오 분석](https://velog.velcdn.com/images/lheehee/post/de02c4d2-b3c0-4c8a-9e70-a2ecae8764bf/image.png)

## 주요 특징
1. 맥락 파악: 사용자 질문의도를 정확히 파악하는 방식에 초점
   - 4가지 컨텍스트 카드 제공
   - 진행 상황 체크박스
   - 맞춤형 응답 시스템

## 주요 기능

### 1. ETF 기초 학습 (기초공부하기)
- ETF의 기본 개념과 투자 원리 학습
- 대화형 AI 튜터를 통한 맞춤형 학습
- 단계별 학습 진행 및 진도 관리

### 2. 투자 시작 가이드 (투자시작하기)
- 증권계좌 개설부터 첫 투자까지 단계별 가이드
- 진행 상황 추적 및 체크리스트 관리
- 맞춤형 ETF 추천 및 포트폴리오 구성 조언

### 3. 시장 동향 분석 (살펴보기)
- 실시간 시장 동향 및 ETF 트렌드 분석
- AI 기반 시장 인사이트 제공
- 관심 ETF 모니터링

### 4. 포트폴리오 분석 (분석하기)
- 보유 ETF 포트폴리오 분석
- 위험도 및 수익률 평가
- 포트폴리오 리밸런싱 추천

issue
- 단계별 학습 진행 및 진도 관리
- admin page : DB관리
- 

## 기술 스택

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS

### AI/ML
- LangChain
- OpenAI
- Pinecone (벡터 데이터베이스)

### 주요 라이브러리
- Lucide React (아이콘)
- React Markdown
- PDF Parse (문서 처리)

## 아키텍처

### 컴포넌트 구조
- Layout: 전체 레이아웃 관리
- MainContent: 메인 대시보드 및 컨텐츠 표시
- Sidebar: 네비게이션 및 세션 관리
- RightPanel: 컨텍스트 기반 부가 정보 표시
- ChatMessages: AI 대화 인터페이스
- InvestmentProgress: 투자 진행 상황 추적

### 상태 관리
- 세션별 메시지 관리
- 투자 진행 상황 추적
- 사용자 컨텍스트 관리

## 주요 특징

### 1. 컨텍스트 기반 UI
- 사용자의 현재 컨텍스트에 따라 동적으로 변화하는 UI
- 각 섹션별 특화된 시각적 피드백
- 직관적인 네비게이션 시스템

### 2. AI 기반 개인화
- 사용자의 지식 수준과 관심사에 맞춘 컨텐츠 제공
- 실시간 대화형 학습 지원
- 맞춤형 투자 조언 및 가이드

### 3. 진행 상황 추적
- 단계별 학습 및 투자 진행 상황 시각화
- 체크리스트 기반 진도 관리
- 목표 달성 현황 모니터링

## 보안 및 데이터 관리
- 사용자 데이터 암호화
- API 키 보안 관리
- 환경 변수를 통한 설정 관리

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start
```

## 환경 설정
프로젝트 실행을 위해 다음 환경 변수가 필요합니다:
- OPENAI_API_KEY
- PINECONE_API_KEY
- PINECONE_ENVIRONMENT
- PINECONE_INDEX

## 라이선스
이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 개발 현황

### 진행중인 작업
- 단계별 학습 진행 및 진도 관리 시스템 구현
- 관리자 페이지: DB 관리 기능
- 멀티모달 기능 추가: 이미지 분석 및 처리
