# 오델로 게임 아키텍처

## 1. 아키텍처 목표

게임 규칙, 상태 전이 및 React UI를 분리해 각 계층을 독립적으로 테스트하고 변경할 수 있게 한다.
React는 렌더링과 사용자 입력을 담당하며, 오델로 규칙은 브라우저나 React에 의존하지 않는 순수 JavaScript로 구현한다.

현재 의존성 방향은 다음과 같다.

```text
index.html
  -> src/main.jsx
    -> src/App.jsx
      -> components
      -> hooks/useOthelloGame.js
        -> game/gameReducer.js
        -> game/selectors.js
          -> game/rules.js
            -> game/board.js
            -> game/constants.js
```

`src/game/`은 React, Hook, 브라우저 DOM 및 CSS를 import하지 않는다.

## 2. 실행 및 도구 계층

### `index.html`

한국어 HTML 문서와 React 마운트 지점인 `#root`를 제공한다.
게임 화면 구조는 React 컴포넌트에서 관리한다.

### `src/main.jsx`

전역 reset, 디자인 토큰과 공통 스타일을 불러오고 `React.StrictMode`에서 `App`을 마운트한다.
게임 규칙이나 상태 전이를 포함하지 않는다.

### 프로젝트 설정

- `package.json`: npm 명령, Node.js 조건과 의존성 버전
- `vite.config.js`: React 플러그인과 Vitest `jsdom` 환경
- `eslint.config.js`: React, Hooks 및 Fast Refresh 정적 분석 규칙
- `.prettierrc.json`: 코드 표현 형식
- `src/test/setup.js`: Testing Library DOM matcher 등록

Node.js 16.20.2 환경을 지원하기 위해 Vite 4, React 18, Vitest 0.34 계열을 사용한다.

## 3. 게임 도메인 계층

### `src/game/constants.js`

다음 공유 도메인 값을 정의한다.

- `BOARD_SIZE`, `EMPTY`, `BLACK`, `WHITE`
- 무승부 값 `DRAW`
- 게임 상태 `GAME_STATUS`
- reducer 액션 `PLACE_DISC`, `START_NEW_GAME`
- 가로, 세로와 대각선을 포함하는 8개 `DIRECTIONS`

### `src/game/board.js`

보드 생성과 좌표 경계를 담당한다.

- `createEmptyBoard()`: 독립된 행을 가진 빈 8x8 보드 생성
- `createInitialBoard()`: 표준 중앙 배치 생성
- `isWithinBoard()`: 정수 좌표의 보드 범위 검사

### `src/game/rules.js`

착수와 돌 뒤집기 규칙을 담당하는 순수 함수 모듈이다.

- `getOpponent()`
- `getFlippableDiscs()`
- `isValidMove()`
- `getValidMoves()`
- `applyMove()`

방향별 내부 탐색은 상대 돌을 수집한 뒤 같은 색 돌로 닫혀 있을 때만 포획으로 인정한다.
`applyMove()`는 유효한 착수에서 모든 행을 복사한 새 보드를 반환하며 입력 보드를 변경하지 않는다.
유효하지 않은 착수는 기존 보드를 그대로 반환한다.

### `src/game/selectors.js`

보드에서 계산 가능한 파생 값을 제공한다.

- `countDiscs()`: 흑돌, 백돌과 빈칸 수
- `isGameOver()`: 가득 찬 보드 또는 양쪽 모두 유효 수가 없는 상태
- `getWinner()`: 흑, 백 또는 무승부
- `selectValidMoves()`: 현재 플레이어의 유효 수
- `getCoordinateKey()`, `createValidMoveKeySet()`: UI 좌표 비교

점수, 유효한 수와 승자는 reducer 상태에 중복 저장하지 않는다.

### `src/game/gameReducer.js`

게임 상태의 단일 전이 지점이다.

```js
{
  board,
  currentPlayer,
  status,
  passMessage
}
```

`PLACE_DISC`는 다음 순서로 처리한다.

1. 진행 상태와 착수 유효성을 검사한다.
2. 돌을 배치하고 포획 돌을 뒤집는다.
3. 상대 플레이어에게 유효한 수가 있으면 차례를 넘긴다.
4. 상대만 둘 수 없으면 원래 플레이어의 차례를 유지하고 패스 메시지를 설정한다.
5. 양쪽 모두 둘 수 없으면 게임을 종료한다.

`START_NEW_GAME`은 독립적인 새 초기 상태를 반환한다.

## 4. React 상태 어댑터

### `src/hooks/useOthelloGame.js`

`useReducer`로 `gameReducer`를 실행하고 selector 결과를 UI 인터페이스로 조합한다.

```js
{
  board,
  currentPlayer,
  status,
  scores,
  validMoves,
  winner,
  passMessage,
  placeDisc,
  startNewGame
}
```

컴포넌트는 reducer 액션이나 게임 함수 조합을 알 필요 없이 Hook의 값과 명령만 사용한다.

## 5. UI 계층

### `src/App.jsx`

Hook과 프레젠테이션 컴포넌트를 연결하는 조합 계층이다.
게임 규칙을 계산하지 않는다.

### 보드

- `GameBoard`: 8x8 CSS Grid 렌더링과 좌표 기반 React key 관리
- `BoardCell`: 개별 `button`, 돌 표시, 유효 수 표시와 입력 전달

유효한 빈칸만 활성화되며 게임 종료 후 모든 칸이 비활성화된다.
각 칸의 접근 가능한 이름에는 1부터 시작하는 화면 좌표, 돌 색상과 착수 가능 여부가 포함된다.

### 정보와 명령

- `ScoreBoard`: 흑돌과 백돌 점수
- `GameStatus`: 현재 차례, 자동 패스와 최종 결과
- `NewGameButton`: 확인 절차 없는 즉시 초기화

`GameStatus`는 `aria-live`를 사용해 차례, 패스와 결과 변화를 보조 기술에 전달한다.

## 6. 스타일 계층

- `src/styles/reset.css`: 브라우저 기본 여백과 box model 정리
- `src/styles/tokens.css`: 색상, 간격, 글자 크기, 보드 크기와 그림자 변수
- `src/styles/global.css`: 모바일 우선 페이지 및 게임 레이아웃
- 각 컴포넌트 CSS: 컴포넌트 전용 표현

보드는 `min()` 기반 최대 너비와 `aspect-ratio`를 사용한다.
넓은 화면에서는 보드와 정보 패널을 나란히 배치하고 좁은 화면에서는 세로로 배치한다.
유효한 수는 점과 테두리로 표시하고, 키보드 포커스와 동작 감소 설정을 지원한다.

## 7. 테스트 구조

### `tests/game/`

React 없이 순수 게임 계약을 검증한다.

- `board.test.js`: 초기 보드, 독립성 및 경계
- `rules.test.js`: 8방향 포획, 다방향 뒤집기, 착수 거부 및 불변성
- `selectors.test.js`: 점수, 종료, 승자와 좌표 key
- `gameReducer.test.js`: 착수 전이, 자동 패스, 종료와 새 게임

### `tests/components/`

React Testing Library로 사용자 관점의 동작을 검증한다.

- `App.test.jsx`: 64칸, 초기 상태, 마우스와 키보드 입력, 점수와 차례, 전체 게임 종료 및 초기화
- `GameStatus.test.jsx`: 현재 차례, 패스, 흑 승리, 백 승리 및 무승부 안내

DOM 선택은 역할, 접근 가능한 이름과 표시 텍스트를 우선 사용한다.

## 8. 변경 시 유지할 경계

- `src/game/`에서 React 또는 DOM API를 사용하지 않는다.
- React 컴포넌트에서 오델로 규칙을 다시 구현하지 않는다.
- `src/main.jsx`에는 부트스트랩 외 책임을 추가하지 않는다.
- 점수, 유효한 수와 승자를 상태로 중복 보관하지 않는다.
- reducer 밖에서 다음 차례, 패스 또는 종료를 결정하지 않는다.
- 외부 상태 관리, TypeScript 및 CSS 프레임워크는 현재 범위에 추가하지 않는다.
- 공개 게임 함수의 동작을 변경하면 관련 호출부와 테스트를 함께 수정한다.
- 주요 기능이나 마일스톤 변경 후 `memory-bank/progress.md`와 이 문서를 실제 상태에 맞게 갱신한다.
