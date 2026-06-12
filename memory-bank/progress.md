# 오델로 게임 개발 진행 상황

최종 갱신일: 2026-06-12

## 현재 상태

- 현재 마일스톤: 구현 계획 1~10단계 및 AI 대전 확장 완료
- 구현 상태: 흑돌 AI 대 백돌 사용자와 3단계 난이도 구현 완료
- 검증 상태: 자동화 검사 완료, 이번 AI 변경의 브라우저 수동 검증은 미실시
- 다음 작업: 현재 범위 내 필수 작업 없음

## 완료된 작업

### 단계 1~2. 프로젝트 기반과 초기 보드

- Vite 4, React 18, JavaScript ES Modules 기반 프로젝트를 구성했다.
- Vitest, React Testing Library, ESLint 및 Prettier를 설정했다.
- Node.js 16.20.2 환경과 호환되는 도구 버전을 사용한다.
- 8x8 빈 보드, 표준 중앙 배치, 좌표 경계 검사와 도메인 상수를 구현했다.

### 단계 3. 착수 및 돌 뒤집기 규칙

- 상대 플레이어 반환, 8방향 포획 탐색, 유효한 착수 판정과 전체 유효 수 계산을 구현했다.
- 한 번의 착수에서 여러 방향의 돌을 동시에 뒤집도록 구현했다.
- 유효하지 않은 착수는 기존 보드를 반환하고, 유효한 착수는 입력 보드를 변경하지 않는 새 보드를 반환한다.
- 가로, 세로, 대각선, 경계, 다방향 포획 및 불변성 테스트를 작성했다.

### 단계 4. selector

- 흑돌, 백돌 및 빈칸 점수를 계산하는 `countDiscs()`를 구현했다.
- 보드가 가득 찬 경우와 양쪽 모두 둘 수 없는 경우를 판정하는 `isGameOver()`를 구현했다.
- 흑 승리, 백 승리 및 무승부를 반환하는 `getWinner()`를 구현했다.
- 현재 플레이어의 유효 수와 UI 좌표 key 생성 기능을 구현했다.

### 단계 5. reducer와 자동 패스

- `createInitialGameState()`와 `gameReducer()`를 구현했다.
- `PLACE_DISC` 한 액션에서 착수, 뒤집기, 다음 차례, 자동 패스 및 게임 종료를 처리한다.
- 유효하지 않은 착수와 게임 종료 후 착수는 상태를 변경하지 않는다.
- `START_NEW_GAME`은 보드, 차례, 상태 및 패스 안내를 초기화한다.

### 단계 6~8. React Hook과 게임 UI

- `useOthelloGame()`이 reducer와 selector를 조합해 UI에 상태와 명령을 제공한다.
- `GameBoard`와 `BoardCell`로 64개 칸을 렌더링한다.
- 보드 칸은 실제 `button`이며 유효한 위치만 활성화된다.
- `ScoreBoard`, `GameStatus`, `NewGameButton`을 구현했다.
- 현재 차례, 점수, 자동 패스, 승자 또는 무승부와 새 게임 기능을 한 화면에 제공한다.
- 좌표, 돌 색상 및 착수 가능 여부를 접근 가능한 이름으로 제공하고 상태 메시지에 `aria-live`를 적용했다.

### 단계 9. 반응형 스타일

- reset, 전역 디자인 토큰 및 공통 레이아웃 스타일을 구현했다.
- 보드는 CSS Grid와 `aspect-ratio`를 사용하며 좁은 화면에서 가로 스크롤 없이 축소된다.
- 유효한 수는 색상뿐 아니라 점과 테두리로 구분된다.
- 키보드 포커스 표시와 `prefers-reduced-motion` 대응을 구현했다.
- 존재하지 않던 `/vite.svg` 파비콘 참조를 제거하고 문서 언어를 한국어로 설정했다.

### 단계 10. 통합 검증

- 초기 배치, 점수, 유효한 수, 마우스와 키보드 착수 및 차례 변경을 통합 테스트로 검증했다.
- 실제 유효 수를 연속 선택해 게임 종료까지 진행하고 종료 후 입력 차단을 검증했다.
- 새 게임 실행 후 초기 상태 복원을 검증했다.
- 패스 안내, 흑 승리, 백 승리 및 무승부 표시를 컴포넌트 테스트로 검증했다.

### AI 대전 확장

- 흑돌은 브라우저 내 AI가 자동으로 플레이하고 사용자는 백돌만 플레이하도록 변경했다.
- 초급은 무작위 유효 수, 중급은 위치·포획·상대 기동성 평가, 고급은 깊이 4 알파-베타 탐색을 사용한다.
- AI 전략은 React와 DOM에 의존하지 않는 `src/game/ai.js` 순수 함수로 구현했다.
- AI 차례에는 보드 입력을 잠그고 상태 영역에 생각 중 안내를 표시한다.
- 난이도 선택 UI를 추가했으며 난이도 변경 시 새 게임을 시작하고 새 게임 버튼 사용 시 현재 난이도를 유지한다.
- Vitest가 작업공간의 `.codex` 도구 테스트를 수집하지 않도록 프로젝트 테스트 범위를 `tests/`로 제한했다.

## 주요 생성 및 변경 파일

- `src/game/constants.js`
- `src/game/ai.js`
- `src/game/board.js`
- `src/game/rules.js`
- `src/game/selectors.js`
- `src/game/gameReducer.js`
- `src/hooks/useOthelloGame.js`
- `src/App.jsx`
- `src/components/BoardCell/`
- `src/components/GameBoard/`
- `src/components/ScoreBoard/`
- `src/components/GameStatus/`
- `src/components/NewGameButton/`
- `src/components/DifficultySelector/`
- `src/styles/reset.css`
- `src/styles/tokens.css`
- `src/styles/global.css`
- `tests/game/board.test.js`
- `tests/game/rules.test.js`
- `tests/game/selectors.test.js`
- `tests/game/gameReducer.test.js`
- `tests/game/ai.test.js`
- `tests/components/App.test.jsx`
- `tests/components/BoardCell.test.jsx`
- `tests/components/GameStatus.test.jsx`

## 검증 결과

- `npm run lint`: 통과, 오류 및 경고 없음
- `npm run test`: 테스트 파일 8개, 테스트 64개 모두 통과
- `npm run build`: Vite 프로덕션 빌드 성공, 새 경고 없음
- 이번 AI 구현 파일 대상 Prettier 적용 완료
- 고급 AI 대 고정 유효 수 전략의 전체 게임 시뮬레이션: 60수에서 정상 종료, 약 0.95초
- 개발 서버 `http://127.0.0.1:5173`의 `200 OK` 응답을 확인했다.
- 브라우저 화면에서의 수동 조작과 좁은 화면·넓은 화면 시각 검증은 이번 변경에서 별도로 수행하지 않았다.

## 알려진 문제 및 정리 항목

- 현재 Node.js 16 호환 도구 버전의 의존성 검사에서 기존 npm 취약점 3건이 보고됐다. 강제 업그레이드는 런타임 호환성을 깨뜨릴 수 있으므로 별도 작업으로 검토해야 한다.
- 전체 `npm run format:check`는 기존 `AGENTS.md`, `implementation-plan.md`, `eslint.config.js` 및 일부 기존 파일의 형식 차이 때문에 통과하지 않는다. 이번 구현에서 추가하거나 수정한 대상 파일은 Prettier 검사를 통과했다.

## 남은 작업

현재 `game-design-document.md`와 `implementation-plan.md`에 정의된 AI 대전 범위에는 남은 필수 구현이 없다.
외부 ChatGPT/Codex API 연동, 온라인 멀티플레이, 저장과 불러오기 등 제외 범위 기능은 추가 요구사항이 생길 때 별도 계획으로 진행한다.
