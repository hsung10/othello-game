# 오델로 프로젝트 개발 규칙

이 문서는 오델로 웹 게임을 구현하거나 수정하는 모든 작업에 적용한다.
기능 요구사항과 게임 규칙은 `memory-bank/game-design-document.md`를 기준으로 한다.

## 1. 작업 시작 및 진행 기록

코드를 작성하거나 수정하기 전에 다음 문서를 반드시 아래 순서대로 읽고 최신 요구사항과 진행 상태를 확인한다.

1. `memory-bank/game-design-document.md`: 게임 규칙, 기능 범위 및 수용 기준
2. `memory-bank/implementation-plan.md`: 구현 순서, 구조 및 완료 조건
3. `memory-bank/progress.md`: 완료된 작업, 현재 작업 및 남은 작업

- 문서 간 내용이 충돌하면 게임 규칙과 기능 범위는 `game-design-document.md`를 우선한다.
- 구현 방식은 `AGENTS.md`와 `implementation-plan.md`를 따르되, 현재 코드와 진행 상태는 `progress.md`를 함께 확인한다.
- 필수 문서가 없거나 현재 작업을 결정하기에 정보가 부족하면 추측으로 구현하지 말고 문서를 먼저 생성하거나 갱신한다.
- 주요 기능 또는 `implementation-plan.md`의 마일스톤을 완료한 뒤에는 같은 작업 안에서 `memory-bank/progress.md`를 갱신한다.
- `progress.md`에는 완료 항목, 검증 결과, 현재 상태, 남은 작업 및 알려진 문제를 사실에 근거해 기록한다.
- 테스트나 빌드를 실행하지 못했거나 실패했다면 이를 완료로 기록하지 않고 원인과 미검증 범위를 남긴다.

## 2. 기술 스택

- 빌드 도구: Vite
- UI 라이브러리: React
- 프로그래밍 언어: JavaScript(ES Modules)
- 마크업: HTML5
- 스타일: CSS3
- 단위 및 컴포넌트 테스트: Vitest, React Testing Library
- 코드 품질: ESLint, Prettier

TypeScript, 상태 관리 라이브러리, CSS 프레임워크는 초기 버전에 도입하지 않는다.
새 라이브러리는 표준 JavaScript와 React만으로 요구사항을 명확하게 해결하기 어려울 때만 추가한다.
라이브러리를 추가할 때는 사용 목적, 번들 크기, 유지보수 상태 및 제거 비용을 검토한다.

## 3. 기본 원칙

- 게임 규칙은 UI와 분리된 순수 JavaScript 함수로 구현한다.
- React 컴포넌트는 화면 렌더링과 사용자 입력 전달에 집중한다.
- 하나의 상태에는 하나의 진실 공급원만 둔다.
- 보드 상태에서 계산 가능한 값은 별도 상태로 중복 저장하지 않는다.
- 함수와 컴포넌트는 한 가지 책임만 갖도록 작게 유지한다.
- 기능보다 추상화를 먼저 만들지 않는다.
- 같은 로직을 두 곳 이상에서 직접 구현하지 않는다.
- 숨겨진 전역 상태와 직접적인 DOM 조작을 사용하지 않는다.
- 모든 변경은 기존 게임 규칙과 수용 기준을 깨뜨리지 않아야 한다.

## 4. 권장 프로젝트 구조

```text
/
├── index.html
├── package.json
├── vite.config.js
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
│   │   ├── GameStatus/
│   │   └── NewGameButton/
│   ├── game/
│   │   ├── constants.js
│   │   ├── board.js
│   │   ├── rules.js
│   │   ├── gameReducer.js
│   │   └── selectors.js
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
    └── components/
```

실제 구조는 기능 규모에 맞게 단순화할 수 있지만 다음 의존성 방향은 유지한다.

```text
React UI -> hooks/reducer -> game logic
game logic -X-> React UI
```

`src/game/`의 코드는 React, 브라우저 DOM 및 CSS에 의존해서는 안 된다.

## 5. 게임 도메인 모델

### 5.1 상수

문자열과 숫자를 코드 곳곳에 직접 작성하지 않고 `constants.js`에서 관리한다.

```js
export const BOARD_SIZE = 8;
export const EMPTY = null;
export const BLACK = "black";
export const WHITE = "white";
```

- 플레이어 값은 `BLACK`, `WHITE`만 사용한다.
- 빈칸은 `null`로 표현한다.
- 좌표는 0부터 시작하는 `{ row, col }` 형식으로 통일한다.
- 보드는 8개의 행과 각 행의 8개 칸으로 구성된 2차원 배열로 표현한다.

### 5.2 불변성

- 보드와 게임 상태를 직접 변경하지 않는다.
- 착수 함수는 기존 상태를 수정하지 않고 새 상태를 반환해야 한다.
- React 상태 밖에서도 배열의 `push`, 직접 인덱스 할당 등으로 입력 데이터를 변경하지 않는다.

### 5.3 순수 게임 함수

게임 로직은 최소한 다음 책임을 분리한다.

- `createInitialBoard()`: 초기 보드 생성
- `getOpponent(player)`: 상대 플레이어 반환
- `getFlippableDiscs(board, row, col, player)`: 착수 시 뒤집을 좌표 계산
- `isValidMove(board, row, col, player)`: 착수 가능 여부 판정
- `getValidMoves(board, player)`: 모든 유효한 착수 위치 계산
- `applyMove(board, row, col, player)`: 새 돌 배치 및 포획 돌 뒤집기
- `countDiscs(board)`: 흑돌과 백돌 개수 계산
- `isGameOver(board)`: 양쪽의 유효한 수와 보드 상태로 종료 여부 판정
- `getWinner(board)`: 승자 또는 무승부 판정

게임 함수는 같은 입력에 항상 같은 결과를 반환해야 한다.
알림 표시, 타이머, DOM 접근 및 React 상태 변경을 게임 함수 안에서 수행하지 않는다.

## 6. 상태 관리

- 게임 전이 규칙은 `useReducer`와 `gameReducer`를 우선 사용한다.
- 초기 버전에서는 Redux, Zustand 등 외부 상태 관리 도구를 사용하지 않는다.
- reducer의 action 이름은 사건을 나타내는 명확한 대문자 상수로 작성한다.
  - `PLACE_DISC`
  - `START_NEW_GAME`
- reducer는 보드 변경, 다음 플레이어 결정, 자동 패스 및 종료 판정을 하나의 일관된 전이로 처리한다.
- UI 컴포넌트가 직접 다음 턴이나 승자를 계산하지 않도록 한다.
- 점수와 유효한 수처럼 보드에서 계산 가능한 값은 selector로 계산한다.
- 성능 문제가 측정되기 전에는 `useMemo`, `useCallback`, `React.memo`를 습관적으로 사용하지 않는다.

## 7. React 컴포넌트 규칙

- 함수형 컴포넌트와 React Hooks만 사용한다.
- 컴포넌트 파일명과 컴포넌트 이름은 PascalCase로 작성한다.
- Hook 이름은 `use`로 시작한다.
- 이벤트 처리 함수는 `handleCellClick`, `handleNewGame`처럼 `handle`로 시작한다.
- boolean props는 `isValid`, `isGameOver`처럼 의미가 드러나게 작성한다.
- props는 필요한 최소 데이터와 콜백만 전달한다.
- 컴포넌트 안에 오델로 규칙을 구현하지 않는다.
- `GameBoard`는 보드 배치, `BoardCell`은 개별 칸 표시와 입력을 담당한다.
- 점수, 현재 차례, 패스 안내, 종료 결과는 역할별 컴포넌트로 분리한다.
- JSX 안의 복잡한 조건식은 selector 또는 이름 있는 변수로 이동한다.
- 배열 렌더링의 key에는 안정적인 좌표 값을 사용하며 배열 인덱스만 단독으로 사용하지 않는다.
- `useEffect`는 외부 시스템과 동기화할 때만 사용한다. 파생 상태 계산에 사용하지 않는다.

## 8. HTML 및 접근성

- 의미에 맞는 HTML 요소를 사용한다.
- 클릭 가능한 보드 칸은 `div` 대신 `button`으로 구현한다.
- 모든 보드 칸은 키보드로 접근하고 실행할 수 있어야 한다.
- 각 칸에 좌표, 돌 색상 및 착수 가능 여부를 알 수 있는 접근 가능한 이름을 제공한다.
- 현재 차례와 게임 결과는 화면뿐 아니라 보조 기술에도 전달되어야 한다.
- 색상만으로 흑돌, 백돌, 유효한 착수 위치를 구분하지 않는다.
- 비활성 칸과 게임 종료 후 입력 불가 상태는 HTML 속성으로도 표현한다.
- 포커스 표시를 제거하지 않으며 배경과 충분한 대비를 유지한다.

## 9. CSS 규칙

- 전역 디자인 값은 `tokens.css`의 CSS 사용자 정의 속성으로 관리한다.
- 컴포넌트 스타일은 해당 컴포넌트 폴더에 둔다.
- 클래스명은 역할을 나타내며 상태는 modifier 형태로 표현한다.
  - `.board-cell`
  - `.board-cell--valid`
  - `.board-cell--black`
- ID 선택자, 과도한 중첩 및 `!important` 사용을 피한다.
- 보드는 CSS Grid로 구성한다.
- 칸은 `aspect-ratio: 1`을 사용해 정사각형을 유지한다.
- 모바일과 데스크톱 모두에서 화면을 벗어나지 않는 반응형 크기를 제공한다.
- 애니메이션은 게임 상태 이해를 돕는 범위에서만 사용한다.
- `prefers-reduced-motion` 사용자를 위한 동작 감소 스타일을 제공한다.
- 장식 목적 이미지는 사용하지 않고 CSS로 표현 가능한 요소는 CSS로 구현한다.

## 10. JavaScript 작성 규칙

- ES Modules의 `import`와 `export`를 사용한다.
- `const`를 기본으로 사용하고 재할당이 필요한 경우에만 `let`을 사용한다.
- `var`는 사용하지 않는다.
- 함수와 변수 이름은 동작과 값을 구체적으로 설명해야 한다.
- 비교에는 `===`와 `!==`를 사용한다.
- 중첩 조건은 early return으로 단순화한다.
- 매직 넘버와 중복 문자열은 상수로 이동한다.
- 공개 함수의 입력, 반환값 또는 자료 구조가 이름만으로 명확하지 않으면 JSDoc을 작성한다.
- 오류를 무시하거나 빈 `catch` 블록을 작성하지 않는다.
- `console.log` 디버깅 코드는 완료된 변경에 남기지 않는다.

## 11. 테스트 규칙

- `src/game/`의 모든 핵심 규칙은 단위 테스트로 검증한다.
- 게임 로직 테스트에서는 React 컴포넌트를 렌더링하지 않는다.
- 컴포넌트 테스트는 구현 세부사항이 아니라 사용자 행동과 표시 결과를 검증한다.
- DOM 선택은 역할, 접근 가능한 이름 및 표시 텍스트를 우선 사용한다.
- private 함수나 CSS 클래스만을 기준으로 테스트하지 않는다.
- 버그를 수정할 때는 재현 테스트를 먼저 추가하거나 같은 변경에 포함한다.
- 테스트 간에 보드나 상태 객체를 공유하거나 변경하지 않는다.
- `game-design-document.md`의 모든 수용 기준을 테스트로 추적할 수 있어야 한다.

필수 테스트 범위는 다음과 같다.

- 초기 보드와 흑 선공
- 8방향 착수 판정 및 돌 뒤집기
- 여러 방향 동시 뒤집기
- 불가능한 착수 거부
- 자동 패스와 연속 패스 종료
- 보드가 가득 찬 경우의 종료
- 흑 승리, 백 승리 및 무승부
- 새 게임 상태 초기화
- 보드의 마우스 및 키보드 조작
- 현재 차례, 점수, 패스 및 결과 표시

## 12. 품질 기준

변경을 완료하기 전에 다음 검사를 모두 통과해야 한다.

```bash
npm run lint
npm run test
npm run build
```

- 린트 오류와 테스트 실패를 남긴 채 완료 처리하지 않는다.
- 빌드 경고가 새로 발생하면 원인을 확인하고 해결한다.
- UI 변경은 좁은 화면과 넓은 화면에서 확인한다.
- 새 기능은 수용 기준과 테스트를 함께 갱신한다.
- 관련 없는 리팩터링과 패키지 업데이트를 기능 변경에 섞지 않는다.

## 13. 변경 관리

- 한 변경은 하나의 목적에 집중한다.
- 파일 이름, 함수 이름 및 커밋 설명에는 변경 의도를 드러낸다.
- 기존 공개 함수의 동작을 변경하면 모든 호출부와 테스트를 함께 수정한다.
- 새로운 추상화는 실제 중복이나 복잡성을 줄이는 경우에만 추가한다.
- 미래 요구사항을 추측해 사용하지 않는 코드나 설정을 미리 만들지 않는다.
- 게임 규칙을 변경해야 한다면 코드보다 먼저 `memory-bank/game-design-document.md`를 갱신한다.
