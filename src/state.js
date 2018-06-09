/* eslint-disable */
import React, { Fragment } from 'react'
import TerrainGenerator from './terrain.js'
import LinkedList from './LinkedList.js'

export const SYMBOLS = {
  Fertalizer: {
    symbol: <Fragment>💩</Fragment>,
    name: 'Fertalizer',
  },
  Grass: {
    symbol: <Fragment>🌱</Fragment>,
    name: 'Grass',
  },
  Flower: {
    symbol: <Fragment>🌻</Fragment>,
    name: 'Flower',
  },
  Sapling: {
    symbol: <Fragment>🌿</Fragment>,
    name: 'Sapling',
  },
  Trees: {
    symbol: <Fragment>🌲</Fragment>,
    name: 'Trees',
  },
  Mountain: {
    symbol: <Fragment>⛰</Fragment>,
    Name: 'Mountain',
  },
  'Bare Mountain': {
    symbol: <Fragment>🗻</Fragment>,
    name: 'Bare Mountain',
  },
  Ocean: {
    symbol: <Fragment>🌊</Fragment>,
    name: 'Ocean',
  },
  Desert: {
    symbol: <Fragment>🏜️</Fragment>,
    name: 'Desert',
  },
  'Snowy Mountains': {
    symbol: <Fragment>🏔️</Fragment>,
    name: 'Snowy Mountains',
  },
  Beach: {
    symbol: <Fragment>🏖</Fragment>,
    name: 'Beach',
  },
  Corn: {
    symbol: <Fragment>🌽</Fragment>,
    name: 'Corn',
  },
  'Rain Forest': {
    symbol: <Fragment>🏝</Fragment>,
    name: 'Rain Forest',
  },
}

const WORK_TYPES = {
  FERTALIZE: 'grass-to-corn',
  GROW: 'sapling-to-tree',
  HARVEST: 'corn-to-grass',
  CHOP: 'tree-to-sapling',
}

export default {
  init: () => ({
    numberOfPlayers: 0,
    round: 0,
    stage: 1,
    grid: new TerrainGenerator(20, 20, SYMBOLS)
      .generate()
      .map(row =>
        row.map(cell => ({
          ...cell,
          progress: undefined,
        })),
      ),
    moves: [],
    players: [],
    player: 1,
    pendingWork: [],
    promptForEndOfTurn: false,
    playerStats: {},
  }),
  startGame: previousState => {
    if (previousState.numberOfPlayers === 0) {
      return {
        playerSelectError:
          'You must select more than 0 players!',
      }
    }
    const players = new LinkedList(
      previousState.numberOfPlayers,
    )
    return {
      activePlayer: players.current(),
      stage: previousState.stage + 1,
      players,
    }
  },
  selectEmoji: previousState => ({
    moves: [
      ...previousState.moves,
      {
        key: previousState.moves.length,
        player: previousState.player,
        emoji: previousState.selectedEmoji,
        coordinates: previousState.selectedCoordinates,
      },
    ],
    selectedEmoji: null,
    selectedCoordinates: null,
    showSelection: false,
  }),
  clearEmoji: {
    selectedEmoji: null,
    selectedCoordinates: null,
    showSelection: false,
  },
  handleEmojiClick: (emoji, x, y) => ({
    selectedEmoji: emoji,
    selectedCoordinates: [x, y],
    showActionDrawer: true,
  }),
  handlePlayerSelection: e => ({
    numberOfPlayers: Number(e.target.value),
  }),
  toNextTurn: previousState => {
    const currentPlayer = previousState.activePlayer
    const numberOfPlayers = previousState.numberOfPlayers

    let newState = {
      promptForEndOfTurn: false,
      showActionDrawer: false,
      selectedEmoji: null,
      selectedCoordinates: null,
    }

    const { pendingWork } = previousState
    let newWork = []
    let updateCells = []
    let progressCells = []
    if (pendingWork.length) {
      newWork = pendingWork
        .map(work => {
          switch (work.type) {
            case WORK_TYPES.FERTALIZE:
            case WORK_TYPES.HARVEST:
            case WORK_TYPES.CHOP: {
              if (work.turns < work.numberOfTurns) {
                progressCells.push({
                  ...work.cell,
                  progress: work.turns + 1,
                  progressMax: work.numberOfTurns,
                })
                return {
                  ...work,
                  turns: work.turns + 1,
                }
              } else {
                updateCells.push(work.cell)
                return null
              }
            }
          }
        })
        .filter(Boolean)
    }
    if (updateCells.length || progressCells.length) {
      /**
       * updateCells = [
       *   {
       *     cell: { biome: { symbol, name} },
       *     coords: [x, y],
       *     type: string
       *   },
       *   ...
       * ]
       */
      let currency = previousState.playerStats[
        currentPlayer.id
      ]
        ? previousState.playerStats[currentPlayer.id]
            .currency
        : 0
      let stock = previousState.playerStats[
        currentPlayer.id
      ]
        ? previousState.playerStats[currentPlayer.id].stock
        : {
            lumber: 0,
            corn: 0,
          }
      let newGrid = previousState.grid.map((row, x) =>
        row.map((cell, y) => {
          const foundUpdate = updateCells.find(
            cell =>
              cell.coords[0] === x && cell.coords[1] === y,
          )
          const foundProgress = progressCells.find(
            cell =>
              cell.coords[0] === x && cell.coords[1] === y,
          )
          if (foundUpdate) {
            let newCell
            if (foundUpdate.type === WORK_TYPES.FERTALIZE) {
              newCell = SYMBOLS.Corn
            } else if (
              foundUpdate.type === WORK_TYPES.HARVEST
            ) {
              newCell = SYMBOLS.Grass
              currency += 10
              stock = {
                ...stock,
                corn: stock.corn + 1,
              }
            } else if (
              foundUpdate.type === WORK_TYPES.GROW
            ) {
              newCell = SYMBOLS.Trees
            } else if (
              foundUpdate.type === WORK_TYPES.CHOP
            ) {
              newCell = SYMBOLS.Sapling
              currency += 50
              stock = {
                ...stock,
                lumber: stock.lumber + 10,
              }
            }
            return {
              ...cell,
              progress: undefined,
              progressMax: undefined,
              biome: {
                ...newCell,
              },
            }
          } else if (foundProgress) {
            return {
              ...cell,
              progress: foundProgress.progress,
              progressMax: foundProgress.progressMax,
            }
          } else {
            return cell
          }
        }),
      )
      newState = {
        ...newState,
        grid: newGrid,
        playerStats: {
          ...previousState.playerStats,
          [previousState.activePlayer.id]: {
            currency,
            stock,
          },
        },
      }
    }
    if (numberOfPlayers === 1) {
      return {
        ...newState,
        pendingWork: newWork,
      }
    } else {
      return {
        ...newState,
        pendingWork: newWork,
        activePlayer: previousState.activePlayer.next(),
      }
    }
  },
  fertalize: previousState => {
    const currentCell = {
      cell: previousState.selectedEmoji,
      coords: previousState.selectedCoordinates,
      type:
        previousState.selectedEmoji.biome.name === 'Grass'
          ? WORK_TYPES.FERTALIZE
          : WORK_TYPES.GROW,
    }
    return {
      pendingWork: [
        {
          type: WORK_TYPES.FERTALIZE,
          turns: 0,
          cell: currentCell,
          numberOfTurns: 5,
        },
        ...previousState.pendingWork,
      ],
      promptForEndOfTurn: true,
    }
  },
  harvest: previousState => {
    const {
      selectedEmoji,
      selectedCoordinates,
    } = previousState
    const currentCell = {
      cell: selectedEmoji,
      coords: selectedCoordinates,
      type: WORK_TYPES.HARVEST,
    }
    return {
      pendingWork: [
        {
          type: WORK_TYPES.HARVEST,
          turns: 0,
          numberOfTurns: 1,
          cell: currentCell,
        },
        ...previousState.pendingWork,
      ],
      promptForEndOfTurn: true,
    }
  },
  chop: previousState => {
    const {
      selectedCoordinates,
      selectedEmoji,
    } = previousState
    const currentCell = {
      cell: selectedEmoji,
      coords: selectedCoordinates,
      type: WORK_TYPES.CHOP,
    }
    return {
      pendingWork: [
        {
          type: WORK_TYPES.CHOP,
          turns: 0,
          numberOfTurns: 3,
          cell: currentCell,
        },
        ...previousState.pendingWork,
      ],
      promptForEndOfTurn: true,
    }
  },
}
