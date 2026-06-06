export const BOARD_SIZE = 8;

export const EMPTY = null;
export const BLACK = 'black';
export const WHITE = 'white';
export const DRAW = 'draw';

export const PLACE_DISC = 'PLACE_DISC';
export const START_NEW_GAME = 'START_NEW_GAME';

export const GAME_STATUS = Object.freeze({
  PLAYING: 'playing',
  FINISHED: 'finished',
});

export const DIRECTIONS = Object.freeze([
  Object.freeze({ row: -1, col: -1 }),
  Object.freeze({ row: -1, col: 0 }),
  Object.freeze({ row: -1, col: 1 }),
  Object.freeze({ row: 0, col: -1 }),
  Object.freeze({ row: 0, col: 1 }),
  Object.freeze({ row: 1, col: -1 }),
  Object.freeze({ row: 1, col: 0 }),
  Object.freeze({ row: 1, col: 1 }),
]);
