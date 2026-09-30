# 민호 선생님 학교 생활 Lab

- GitHub: https://github.com/seominho2026-tech/mini-homepage
- 사이트: https://seominho2026-tech.github.io/mini-homepage/
- Firebase: minho-school-lab-20260930
- DB: Firestore Standard, (default), 서울 asia-northeast3
- 유료 결제는 연결하지 않음

## 수정과 배포

프로필과 링크는 src/config/linktree.ts, 색감은 src/config/theme.ts와 src/app/globals.css에서 수정합니다. 이미지는 public/assets/minho에 있습니다. npm ci 다음 npm run build로 검사합니다. main에 push하면 GitHub Actions가 GitHub Pages로 배포합니다.

Firebase 웹 설정은 로컬 .env.local 및 GitHub Actions Secrets의 NEXT_PUBLIC_FIREBASE_*에 보관합니다. 웹 설정은 브라우저에 전달되는 공개 설정이며 관리자 인증키와 다릅니다. 인증 토큰과 .env.local은 Git에 올리지 않습니다.

## 방명록과 방문 수

방명록은 로그인 없이 이름 20자, 내용 100자까지 작성하며 공개됩니다. 방문자는 본인이나 다른 사람의 글을 수정하거나 삭제할 수 없습니다. 삭제 등 관리는 Firebase 콘솔에서 합니다. 방문 수는 한국 날짜 기준으로 집계하며 새로고침도 방문에 포함됩니다. 자동 도배나 반복 방문을 완전히 막는 기능은 아닙니다.

실제 DB 검사에서 작성, 다른 방문자의 읽기, 수정/삭제 차단, 잘못된 필드/긴 이름 차단, 방문 수 증가를 확인했습니다. 초기 글 2개는 DB에 저장했습니다. 유튜브 재생은 브라우저 및 영상 제공자의 재생 정책에 따릅니다.
