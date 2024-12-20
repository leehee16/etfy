# ETF 투자 도우미 AI 챗봇
![logo](https://private-user-images.githubusercontent.com/176349951/397570471-036bd860-6257-42ae-bc74-b6a25923cacd.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MzQ2NTQ4MjYsIm5iZiI6MTczNDY1NDUyNiwicGF0aCI6Ii8xNzYzNDk5NTEvMzk3NTcwNDcxLTAzNmJkODYwLTYyNTctNDJhZS1iYzc0LWI2YTI1OTIzY2FjZC5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjQxMjIwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI0MTIyMFQwMDI4NDZaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT05ZTVjYmZhODM3N2Y3NjJhMTBhNzNkYWY0MzdmMTI1ZTU5ODhhMjhiNTcyMzUxMTM2YmYwNzI5ZTRkOWRmY2ExJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.ctve-B6c9e4ayaoPxrors2Lq0zsZ6AlbKJFqqRGXcEU)
## 프로젝트 소개
ETF 투자 도우미 AI 플랫폼은 초보 투자자부터 전문 투자자까지 ETF 투자에 필요한 모든 정보와 가이드를 제공해요. ETF 상품에 대한 학습과 투자여정까지 함께 하고자 기획하게 되었어요.

preview
![login](https://private-user-images.githubusercontent.com/176349951/397568651-6843a594-0afe-4704-abac-276f36cb97b7.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MzQ2NTU0NzksIm5iZiI6MTczNDY1NTE3OSwicGF0aCI6Ii8xNzYzNDk5NTEvMzk3NTY4NjUxLTY4NDNhNTk0LTBhZmUtNDcwNC1hYmFjLTI3NmYzNmNiOTdiNy5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjQxMjIwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI0MTIyMFQwMDM5MzlaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT04ZThiNmMyMGVhOTA1MGVhNGNjMDE3Njg1ODE2OWRmYzEwYWVhYzA0ZWM5MzhiYTA4NDRiNTNiYjFjY2FjNTI1JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.T14lw6NtUXKSLgGgMJu3QIZpWbDQkQSi4FicTW69dmg)

![main](https://private-user-images.githubusercontent.com/176349951/397569138-dcbcba63-b855-4b55-a0a3-dd9d2d397926.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MzQ2NTU0NzksIm5iZiI6MTczNDY1NTE3OSwicGF0aCI6Ii8xNzYzNDk5NTEvMzk3NTY5MTM4LWRjYmNiYTYzLWI4NTUtNGI1NS1hMGEzLWRkOWQyZDM5NzkyNi5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjQxMjIwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI0MTIyMFQwMDM5MzlaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1kMDk5MjMwZTQ3NmU3ZjY0ZTMwMjNiMGUxZWE3NWM3OWU3N2Q5YTc0NmNiZjFlN2Q4N2Q5ZDBkZDI2YmVlN2QzJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.TvG3F00cK8UaazL0dnwpJerCXopXhe1TP5Eu7yWuQbs)

![chat](https://private-user-images.githubusercontent.com/176349951/397577390-1db3b3f3-a0a2-4d27-ade3-3a9e9f277c50.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MzQ2NTY3NTMsIm5iZiI6MTczNDY1NjQ1MywicGF0aCI6Ii8xNzYzNDk5NTEvMzk3NTc3MzkwLTFkYjNiM2YzLWEwYTItNGQyNy1hZGUzLTNhOWU5ZjI3N2M1MC5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjQxMjIwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI0MTIyMFQwMTAwNTNaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT01MzgyNmFhZmRkOGMwMTFiNjdmOTZhOWNjNjFlYTRmOTVmZjhkODgyYzJhYmIwZDU4ZWI3MmE3NDUxZmMzNjFiJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.G897xPkfXj21vX4Xn6RihMTxq4_E1zPOJPZHfDFOutQ)

1. 맥락 파악 : 질문의도를 파악하는 방식에 초점을 맞췄어요. 4개의 카드, 체크박스 등등
2. 

## 주요 기능
### 1. ETF 기초 학습 (기초공부하기)
- ETF의 기본 개념과 투자 원리 학습
- 대화형 AI 튜터를 통한 맞춤형 학습

### 2. 투자 시작 가이드 (투자시작하기)
- 증권계좌 개설부터 첫 투자까지 단계별 가이드
- 진행 상황 추적 및 체크리스트

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

