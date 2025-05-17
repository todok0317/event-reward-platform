# Node.js 18 버전 이미지 사용
FROM node:18

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# package.json 및 package-lock.json 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 소스 코드 복사
COPY . .

# API Gateway 빌드
RUN npm run build api-gateway

# 서버 실행
CMD ["node", "dist/apps/api-gateway/main"]
