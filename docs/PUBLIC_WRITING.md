# 실험실과 글 삭제

탭 순서: 홈 → 게시판 → 실험실 → 방명록 → 사진첩.

- 실험실은 작은 그림, 제목, 설명, 선택 HTTPS 연결 주소를 등록합니다. 그림은 JPG/PNG/WEBP를 선택하면 JPEG로 축소됩니다.
- 게시판의 기본 성모찹과 사진첩의 기본 사진 5장은 목록에서 제거했습니다. 원본 파일과 Git 기록은 보존합니다.
- 게시판·실험실·방명록·사진첩 모두 별도 로그인 화면 없이 작성할 수 있습니다. 작성 시 Firebase 익명 인증으로 브라우저별 UID를 저장합니다.
- 각 글의 작성자만 삭제 버튼을 볼 수 있습니다. 삭제 확인 후 실제 DB에서 삭제되며 다른 방문자의 화면에도 반영됩니다.
- 같은 브라우저의 일반 모드에서 다시 방문하면 삭제 권한을 유지합니다. 브라우저 데이터 삭제, 시크릿 모드 종료, 기기 변경 후에는 권한을 복구할 수 없습니다. 기존 작성자 정보 없는 방명록은 보존하며 방문자가 임의로 소유권을 가져갈 수 없습니다.
- Firestore: boardEntries / labEntries / guestbook / photoEntries. 공개 읽기, 본인 UID를 포함한 생성, 본인 삭제만 허용합니다. 수정은 차단합니다.
- 공개 작성은 표시 이름의 진위를 보증하거나 도배를 완전히 막는 기능이 아닙니다.

## 복원

변경 전 데이터와 실제 배포 규칙은 Git에서 제외된 .cache/backups에 보관했습니다. 위치는 .cache/latest-lab-backup.txt에 기록했습니다. release.json의 rulesetName으로 기존 규칙 릴리스를 복원하거나 백업한 firestore.rules를 배포할 수 있습니다. 신규 데이터는 복원 과정에서 삭제하지 않습니다. 익명 인증을 끄면 새 글을 쓸 수 없으므로 앱 코드와 함께 복원해야 합니다.

## 대상

GitHub: https://github.com/seominho2026-tech/mini-homepage
Firebase: minho-school-lab-20260930, (default) Standard, asia-northeast3.
공개 주소: https://seominho2026-tech.github.io/mini-homepage/

## 검사 방법

운영 DB에 검사 전용 임시 문서를 만들고 본인·다른 익명 사용자·비로그인 읽기/쓰기/삭제를 각각 검사한 뒤 임시 문서만 지웁니다. 남의 글 삭제, 소유권 위조, 수정, 잘못된 링크/그림/초과 크기/필드/시간을 차단하는지 검사합니다. 브라우저에서 네 공간의 등록·새로고침·삭제와 모바일 화면을 확인합니다.

인증 구현은 Firebase 공식 익명 인증 안내를 따릅니다: https://firebase.google.com/docs/auth/web/anonymous-auth
