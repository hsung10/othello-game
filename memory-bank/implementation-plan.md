# 오델로 게임 구현 계획

## 1. 목적

`game-design-document.md`에 정의된 로컬 인간 대 인간 오델로 게임을 웹 브라우저에서 실행할 수 있도록 구현한다.
개발은 `AGENTS.md`의 기술 스택과 구조 규칙을 따른다.

핵심 목표는 다음과 같다.

- 표준 오델로 규칙을 정확하게 처리한다.
- 게임 규칙과 React UI를 분리한다.
- 마우스와 키보드로 사용할 수 있는 반응형 UI를 제공한다.
- 핵심 규칙과 사용자 흐름을 자동화 테스트로 검증한다.
- 향후 AI 플레이어를 추가할 수 있는 구조를 유지한다.

## 2. 구현 범위

### 2.1 포함

- Vite 기반 React 프로젝트
- 8x8 오델로 보드
- 흑돌 선공 및 표준 초기 배치
- 유효한 착수 판정
- 가로, 세로, 대각선 8방향 돌 뒤집기
- 유효한 착수 위치 표시
- 현재 차례와 흑돌·백돌 개수 표시
- 자동 패스 및 패스 안내
- 게임 종료와 승자·무승부 표시
- 새 게임 시작
- 반응형 화면과 키보드 접근성
- 게임 규칙 단위 테스트와 React 컴포넌트 테스트

### 2.2 제외

- AI 플레이어
- 온라인 멀티플레이
- 사용자 계정, 전적 및 랭킹
- 제한 시간
- 게임 저장 및 불러오기
- 실행 취소와 다시 실행

## 3. 기술 구성

- Vite
- React
- JavaScript ES Modules
- HTML5
- CSS3
- Vitest
- React Testing Library
- ESLint
- Prettier

외부 상태 관리, CSS 프레임워크 및 게임 엔진 라이브러리는 사용하지 않는다.

## 4. 목표 디렉터리 구조

```text
/
├── index.html
├── package.json
├── vite.config.js
├── eslint.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── components/
│   │   ├── GameBoard/
│   │   │   ├── GameBoard.jsx
│   │   │   └── GameBoard.css
│   │   ├── BoardCell/
│   │   │   ├── BoardCell.jsx
│   │   │   └── BoardCell.css
│   │   ├── ScoreBoard/
│   │   │   ├── ScoreBoard.jsx
│   │   │   └── ScoreBoard.css
│   │   ├── GameStatus/
│   │   │   ├── GameStatus.jsx
│   │   │   └── GameStatus.css
│   │   └── NewGameButton/
│   │       ├── NewGameButton.jsx
│   │       └── NewGameButton.css
│   ├── game/
│   │   ├── constants.js
│   │   ├── board.js
│   │   ├── rules.js
│   │   ├── selectors.js
│   │   └── gameReducer.js
│   ├── hooks/
│   │   └── useOthelloGame.js
│   ├── styles/
│   │   ├── reset.css
│   │   ├── tokens.css
│   │   └── global.css
│   └── test/
│       └── setup.js
└── tests/
    ├── game/
    │   ├── board.test.js
    │   ├── rules.test.js
    │   ├── selectors.test.js
    │   └── gameReducer.test.js
    └── components/
        └── App.test.jsx
```

의존성은 다음 방향으로만 흐르게 한다.

```text
React components -> useOthelloGame -> gameReducer -> game rules
game rules -X-> React 또는 DOM
```

## 5. 데이터 및 상태 설계

### 5.1 기본 도메인 값

```js
BOARD_SIZE = 8
EMPTY = null
BLACK = "black"
WHITE = "white"
```

- 좌표는 0부터 시작하는 `{ row, col }` 객체를 사용한다.
- 보드는 8x8 2차원 배열을 사용한다.
- 보드의 각 칸은 `null`, `"black"`, `"white"` 중 하나이다.

### 5.2 게임 상태

reducer가 관리할 최소 상태는 다음과 같다.

```js
{
  board,
  currentPlayer,
  status,
  passMessage
}
```

- `status`: `"playing"` 또는 `"finished"`
- `passMessage`: 패스가 발생하지 않았으면 `null`, 발생했다면 안내 문자열
- 점수, 유효한 수 및 승자는 보드에서 계산하는 파생 값으로 관리한다.
- 파생 값을 reducer 상태에 중복 저장하지 않는다.

### 5.3 액션

```js
{ type: "PLACE_DISC", payload: { row, col } }
{ type: "START_NEW_GAME" }
```

`PLACE_DISC`는 다음 작업을 하나의 상태 전이로 처리한다.

1. 게임 진행 상태인지 확인한다.
2. 요청한 위치가 유효한지 확인한다.
3. 돌을 놓고 포획된 돌을 모두 뒤집는다.
4. 상대 플레이어의 유효한 수를 확인한다.
5. 상대가 둘 수 있으면 상대 턴으로 변경한다.
6. 상대가 둘 수 없고 현재 플레이어는 둘 수 있으면 자동 패스 처리한다.
7. 양쪽 모두 둘 수 없으면 게임을 종료한다.

## 6. 단계별 구현 계획

## 단계 1. 프로젝트 기반 구성

### 작업

- Vite React 프로젝트를 생성한다.
- React, React DOM과 개발 의존성을 설치한다.
- `npm run dev`, `npm run build`, `npm run test`, `npm run lint` 스크립트를 정의한다.
- Vitest의 `jsdom` 환경과 React Testing Library setup을 구성한다.
- ESLint와 Prettier를 구성한다.
- 기본 Vite 예제 코드와 사용하지 않는 에셋을 제거한다.
- 목표 디렉터리와 빈 진입 컴포넌트를 생성한다.

### 대상 파일

- `package.json`
- `vite.config.js`
- `eslint.config.js`
- `index.html`
- `src/main.jsx`
- `src/App.jsx`
- `src/test/setup.js`

### 완료 조건

- 개발 서버가 오류 없이 실행된다.
- 빈 React 애플리케이션이 브라우저에 렌더링된다.
- lint, test, build 명령이 모두 실행된다.

## 단계 2. 게임 상수와 초기 보드 구현

### 작업

- 보드 크기, 돌 색상, 게임 상태 및 8방향 벡터를 상수로 정의한다.
- 빈 8x8 보드를 생성하는 함수를 구현한다.
- 중앙 네 칸에 표준 초기 돌을 배치하는 `createInitialBoard()`를 구현한다.
- 호출할 때마다 독립적인 새 배열을 반환하도록 한다.
- 보드 경계 검사 유틸리티를 구현한다.

### 대상 파일

- `src/game/constants.js`
- `src/game/board.js`
- `tests/game/board.test.js`

### 테스트

- 8개의 행과 각 행의 8개 칸이 생성된다.
- 초기 흑돌과 백돌은 각각 2개이다.
- 중앙 네 칸의 색상과 위치가 정확하다.
- 여러 초기 보드 인스턴스가 같은 배열을 공유하지 않는다.
- 보드 안과 밖의 좌표가 정확히 판정된다.

### 완료 조건

- 초기 보드 관련 단위 테스트가 모두 통과한다.
- 게임 모듈이 React와 DOM을 import하지 않는다.

## 단계 3. 착수 및 돌 뒤집기 규칙 구현

### 작업

- 상대 플레이어를 반환하는 `getOpponent()`를 구현한다.
- 한 방향에서 뒤집을 수 있는 돌을 찾는 내부 로직을 구현한다.
- 8방향의 결과를 합치는 `getFlippableDiscs()`를 구현한다.
- `isValidMove()`와 `getValidMoves()`를 구현한다.
- 불변성을 유지하는 `applyMove()`를 구현한다.
- 유효하지 않은 착수는 명시적으로 거부하고 기존 보드를 변경하지 않도록 한다.

### 대상 파일

- `src/game/rules.js`
- `tests/game/rules.test.js`

### 테스트

- 초기 상태에서 흑돌의 유효한 착수 위치가 정확하다.
- 가로, 세로 및 두 대각선 방향의 돌을 뒤집는다.
- 보드 가장자리에서 범위를 벗어나지 않는다.
- 한 번의 착수로 여러 방향의 돌을 동시에 뒤집는다.
- 상대 돌 뒤에 자기 돌이 없으면 뒤집지 않는다.
- 빈칸이 아닌 위치를 거부한다.
- 뒤집을 돌이 없는 빈칸을 거부한다.
- `applyMove()`가 입력 보드를 변경하지 않는다.

### 완료 조건

- 8방향 규칙 테스트가 모두 통과한다.
- 착수 판정과 적용 함수가 순수 함수로 동작한다.

## 단계 4. 점수, 종료 및 결과 selector 구현

### 작업

- 흑돌, 백돌 및 빈칸 개수를 계산하는 `countDiscs()`를 구현한다.
- 양쪽 플레이어의 유효한 수를 검사하는 `isGameOver()`를 구현한다.
- 돌 개수를 비교하는 `getWinner()`를 구현한다.
- 현재 플레이어의 유효한 수를 UI용 자료로 반환하는 selector를 구현한다.
- 좌표를 빠르게 비교할 수 있도록 UI 경계에서 안정적인 좌표 key를 생성한다.

### 대상 파일

- `src/game/selectors.js`
- `tests/game/selectors.test.js`

### 테스트

- 초기 점수가 흑 2, 백 2로 계산된다.
- 보드가 가득 차면 종료된다.
- 빈칸이 있어도 양쪽 모두 둘 수 없으면 종료된다.
- 한쪽만 둘 수 없으면 종료되지 않는다.
- 흑 승리, 백 승리 및 무승부를 정확히 반환한다.

### 완료 조건

- 점수와 종료 판정이 reducer 또는 UI 코드와 독립적으로 검증된다.

## 단계 5. reducer와 자동 패스 구현

### 작업

- 초기 상태 생성 함수와 `gameReducer()`를 구현한다.
- `PLACE_DISC` 액션에서 착수, 뒤집기 및 다음 턴을 처리한다.
- 상대에게 유효한 수가 없으면 자동 패스하고 원래 플레이어의 턴을 유지한다.
- 양쪽 모두 유효한 수가 없으면 상태를 `finished`로 변경한다.
- 게임 종료 후 추가 착수를 무시한다.
- 유효하지 않은 착수는 기존 상태를 그대로 반환한다.
- `START_NEW_GAME`으로 모든 상태를 초기화한다.

### 대상 파일

- `src/game/gameReducer.js`
- `tests/game/gameReducer.test.js`

### 테스트

- 초기 플레이어는 흑돌이다.
- 유효한 착수 후 보드와 현재 플레이어가 변경된다.
- 유효하지 않은 착수 후 상태가 변경되지 않는다.
- 상대만 둘 수 없을 때 자동 패스와 안내가 설정된다.
- 양쪽 모두 둘 수 없을 때 게임이 종료된다.
- 게임 종료 후 착수가 무시된다.
- 새 게임 액션이 보드, 차례, 상태 및 안내를 초기화한다.

### 완료 조건

- 한 액션 안에서 모든 게임 전이가 일관되게 끝난다.
- UI에서 패스 또는 종료 규칙을 별도로 계산할 필요가 없다.

## 단계 6. React 게임 Hook 구현

### 작업

- `useReducer`를 감싼 `useOthelloGame()`을 구현한다.
- 컴포넌트에 필요한 상태와 파생 값을 반환한다.
- 착수와 새 게임을 위한 명확한 callback API를 제공한다.
- Hook 외부에 reducer 내부 구현을 노출하지 않는다.

### 반환 인터페이스

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

### 대상 파일

- `src/hooks/useOthelloGame.js`

### 완료 조건

- `App`과 하위 컴포넌트가 게임 규칙 함수를 직접 조합하지 않아도 된다.
- 향후 인간 입력 대신 AI가 `placeDisc()`를 호출할 수 있다.

## 단계 7. 보드와 칸 컴포넌트 구현

### 작업

- `GameBoard`에서 64개의 칸을 CSS Grid로 렌더링한다.
- `BoardCell`을 `button` 요소로 구현한다.
- 흑돌, 백돌, 빈칸 및 유효한 착수 상태를 시각적으로 구분한다.
- 유효한 위치만 실행 가능하게 한다.
- 게임 종료 시 모든 보드 입력을 비활성화한다.
- 각 칸에 행, 열, 돌 색상 및 착수 가능 여부를 포함한 접근 가능한 이름을 제공한다.
- 좌표 기반의 안정적인 React key를 사용한다.

### 대상 파일

- `src/components/GameBoard/GameBoard.jsx`
- `src/components/GameBoard/GameBoard.css`
- `src/components/BoardCell/BoardCell.jsx`
- `src/components/BoardCell/BoardCell.css`

### 테스트

- 64개의 버튼이 렌더링된다.
- 초기 돌 4개가 올바른 위치에 표시된다.
- 유효한 착수 위치가 식별 가능하게 표시된다.
- 유효한 칸을 클릭하거나 키보드로 실행하면 착수가 발생한다.
- 유효하지 않은 칸과 게임 종료 후 칸은 실행할 수 없다.

### 완료 조건

- 보드를 마우스와 키보드로 조작할 수 있다.
- 게임 규칙이 컴포넌트 안에 중복 구현되지 않는다.

## 단계 8. 점수, 상태 및 새 게임 UI 구현

### 작업

- 흑돌과 백돌의 점수를 표시하는 `ScoreBoard`를 구현한다.
- 현재 차례, 패스 안내, 승자 및 무승부를 표시하는 `GameStatus`를 구현한다.
- `aria-live` 영역을 사용해 차례 변경, 패스 및 결과를 보조 기술에 전달한다.
- `NewGameButton`을 구현하고 확인 절차 없이 즉시 초기화한다.
- `App`에서 Hook과 프레젠테이션 컴포넌트를 연결한다.

### 대상 파일

- `src/App.jsx`
- `src/components/ScoreBoard/ScoreBoard.jsx`
- `src/components/ScoreBoard/ScoreBoard.css`
- `src/components/GameStatus/GameStatus.jsx`
- `src/components/GameStatus/GameStatus.css`
- `src/components/NewGameButton/NewGameButton.jsx`
- `src/components/NewGameButton/NewGameButton.css`

### 테스트

- 시작 시 흑돌 차례와 2 대 2 점수가 표시된다.
- 착수 후 점수와 차례가 갱신된다.
- 자동 패스 메시지가 표시된다.
- 게임 종료 시 승자 또는 무승부가 표시된다.
- 새 게임 버튼이 모든 표시와 보드를 초기화한다.

### 완료 조건

- 기획서에 명시된 모든 정보가 한 화면에서 확인된다.
- UI는 Hook이 제공한 값만 표시하고 규칙을 다시 계산하지 않는다.

## 단계 9. 전역 스타일과 반응형 화면 구현

### 작업

- 브라우저 기본 스타일을 정리하는 reset을 작성한다.
- 색상, 간격, 글자 크기, 보드 크기 및 그림자를 CSS 변수로 정의한다.
- 모바일 우선 반응형 레이아웃을 작성한다.
- 보드가 화면 너비를 넘지 않도록 `min()` 또는 `clamp()`를 사용한다.
- 보드 칸의 정사각형 비율을 유지한다.
- 키보드 포커스 스타일과 충분한 색상 대비를 제공한다.
- 유효한 수를 색상 이외의 점 또는 테두리로도 표시한다.
- `prefers-reduced-motion`에서 돌 애니메이션을 줄이거나 제거한다.

### 대상 파일

- `src/styles/reset.css`
- `src/styles/tokens.css`
- `src/styles/global.css`
- 각 컴포넌트 CSS

### 확인 환경

- 약 320px 너비의 모바일 화면
- 일반 태블릿 화면
- 1280px 이상의 데스크톱 화면
- 키보드 전용 조작
- 동작 감소 환경 설정

### 완료 조건

- 가로 스크롤 없이 게임 전체를 사용할 수 있다.
- 포커스, 유효한 착수 위치, 현재 상태가 명확히 구분된다.

## 단계 10. 통합 테스트와 수용 기준 검증

### 작업

- `App` 기준의 주요 사용자 흐름 테스트를 작성한다.
- 게임 기획서의 수용 기준을 테스트 항목과 일대일로 대조한다.
- 잘못된 입력, 패스, 종료 및 재시작 회귀 테스트를 추가한다.
- lint, test, production build를 실행한다.
- 브라우저에서 실제 게임 흐름을 수동 검증한다.

### 통합 시나리오

1. 새 게임에서 중앙 돌 4개, 흑 차례, 2 대 2 점수를 확인한다.
2. 표시된 유효한 위치를 선택한다.
3. 돌 배치, 뒤집기, 점수 및 턴 변경을 확인한다.
4. 유효하지 않은 칸에서 상태가 바뀌지 않는지 확인한다.
5. 패스 상황에서 턴 유지와 안내를 확인한다.
6. 종료 상황에서 결과와 보드 비활성화를 확인한다.
7. 새 게임으로 모든 상태가 초기화되는지 확인한다.

### 필수 검증 명령

```bash
npm run lint
npm run test
npm run build
```

### 완료 조건

- 모든 자동화 검사가 통과한다.
- 기획서의 수용 기준이 모두 구현되고 검증된다.
- 새 lint 경고와 build 경고가 없다.

## 7. 수용 기준 추적표

| 기획서 수용 기준 | 구현 위치 | 검증 위치 |
| --- | --- | --- |
| 표준 초기 배치와 흑 선공 | `board.js`, `gameReducer.js` | `board.test.js`, `gameReducer.test.js` |
| 초기 점수 2 대 2 | `selectors.js` | `selectors.test.js`, `App.test.jsx` |
| 유효한 착수 위치 표시 | `rules.js`, `GameBoard.jsx` | `rules.test.js`, `App.test.jsx` |
| 유효하지 않은 착수 거부 | `rules.js`, `gameReducer.js` | `rules.test.js`, `gameReducer.test.js` |
| 8방향의 모든 포획 돌 뒤집기 | `rules.js` | `rules.test.js` |
| 착수 후 점수와 차례 갱신 | `gameReducer.js`, `selectors.js` | `gameReducer.test.js`, `App.test.jsx` |
| 자동 패스와 안내 | `gameReducer.js`, `GameStatus.jsx` | `gameReducer.test.js`, `App.test.jsx` |
| 연속 패스 또는 보드가 가득 차면 종료 | `selectors.js`, `gameReducer.js` | `selectors.test.js`, `gameReducer.test.js` |
| 승자 또는 무승부 표시 | `selectors.js`, `GameStatus.jsx` | `selectors.test.js`, `App.test.jsx` |
| 종료 후 착수 차단 | `gameReducer.js`, `BoardCell.jsx` | `gameReducer.test.js`, `App.test.jsx` |
| 새 게임 상태 초기화 | `gameReducer.js`, `NewGameButton.jsx` | `gameReducer.test.js`, `App.test.jsx` |

## 8. 구현 순서와 의존성

```text
프로젝트 설정
  -> 초기 보드
  -> 착수 및 뒤집기 규칙
  -> selector
  -> reducer와 패스
  -> React Hook
  -> 보드 UI
  -> 상태 및 점수 UI
  -> 반응형 스타일
  -> 통합 검증
```

- 게임 규칙 단위 테스트가 통과하기 전에 UI 규칙 구현을 시작하지 않는다.
- reducer 동작이 안정되기 전에 컴포넌트에서 임시 상태 전이를 만들지 않는다.
- 스타일 작업은 DOM 구조가 안정된 뒤 진행하되 접근성 속성은 컴포넌트 구현 단계에서 함께 작성한다.

## 9. 예상 위험과 대응

### 돌 뒤집기 방향 누락

- 8개 방향 벡터를 한 상수에서 순회한다.
- 방향별 테스트와 여러 방향 동시 뒤집기 테스트를 작성한다.

### 자동 패스와 종료 판정 혼동

- 착수 후 상대와 현재 플레이어의 유효한 수를 순서대로 검사한다.
- 한쪽만 패스하는 경우와 양쪽 모두 패스하는 경우를 별도 테스트한다.

### 파생 상태 불일치

- 점수, 유효한 수 및 승자를 보드에서 계산한다.
- reducer 상태에 같은 값을 중복 저장하지 않는다.

### React UI와 게임 규칙 결합

- `src/game/`에서 React import를 금지한다.
- UI는 Hook에서 제공한 데이터와 callback만 사용한다.

### 접근성 저하

- 보드 칸을 실제 `button`으로 구현한다.
- 접근 가능한 이름, 포커스 표시 및 `aria-live`를 컴포넌트 테스트로 확인한다.

### 불필요한 최적화와 구조 복잡화

- 성능 문제가 측정되기 전에는 memoization을 추가하지 않는다.
- AI, 온라인 플레이 및 저장 기능을 위한 미사용 코드를 미리 만들지 않는다.

## 10. 최종 완료 정의

다음 조건을 모두 충족하면 첫 번째 버전 구현을 완료한 것으로 본다.

- `game-design-document.md`의 포함 범위와 수용 기준을 모두 구현했다.
- 게임 규칙이 React와 분리된 순수 JavaScript 모듈에 있다.
- 마우스와 키보드로 전체 게임을 진행할 수 있다.
- 모바일과 데스크톱에서 보드가 정상적으로 표시된다.
- 핵심 규칙, reducer 및 주요 사용자 흐름 테스트가 통과한다.
- `npm run lint`, `npm run test`, `npm run build`가 모두 성공한다.
- 제외 범위의 기능이나 불필요한 의존성이 추가되지 않았다.
