# 빌드 스테이지
FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci

# 소스 코드 복사 (eslintrc 포함)
COPY . .

# 빌드 실행
RUN npm run build

# 실행 스테이지
FROM node:18-alpine AS runner

# 작업 디렉토리 설정
WORKDIR /app

# 프로덕션 환경 설정
ENV NODE_ENV=production

# 시스템 의존성 설치
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 빌드된 파일과 필요한 파일들만 복사
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 적절한 권한 설정
RUN chown -R nextjs:nodejs /app

# 비특권 사용자로 전환
USER nextjs

# 포트 설정
EXPOSE 3000

# 환경변수 설정
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 서버 실행
CMD ["node", "server.js"]
