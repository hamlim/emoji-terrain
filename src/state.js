/* eslint-disable */
import React, { Fragment } from 'react'
import TerrainGenerator from './terrain.js'
import LinkedList from './linked-list.js'
import { EMOJI_TYPES } from './env.js'

export const SYMBOLS = {
  [EMOJI_TYPES.Fertalizer]: {
    symbol: '💩',
    name: EMOJI_TYPES.Fertalizer,
  },
  [EMOJI_TYPES.Grass]: {
    symbol: '🌱',
    name: EMOJI_TYPES.Grass,
  },
  [EMOJI_TYPES.Flower]: {
    symbol: '🌻',
    name: EMOJI_TYPES.Flower,
  },
  [EMOJI_TYPES.Sapling]: {
    symbol: '🌿',
    name: EMOJI_TYPES.Sapling,
  },
  [EMOJI_TYPES.Trees]: {
    symbol: '🌲',
    name: EMOJI_TYPES.Trees,
  },
  [EMOJI_TYPES.Mountain]: {
    symbol: '⛰',
    Name: EMOJI_TYPES.Mountain,
  },
  [EMOJI_TYPES['Bare Mountain']]: {
    symbol: '🗻',
    name: EMOJI_TYPES['Bare Mountain'],
  },
  [EMOJI_TYPES.Ocean]: {
    symbol: '🌊',
    name: EMOJI_TYPES.Ocean,
  },
  [EMOJI_TYPES.Desert]: {
    symbol: '🏜️',
    name: EMOJI_TYPES.Desert,
  },
  [EMOJI_TYPES['Snowy Mountains']]: {
    symbol: '🏔️',
    name: EMOJI_TYPES['Snowy Mountains'],
  },
  [EMOJI_TYPES.Beach]: {
    symbol: '🏖',
    name: EMOJI_TYPES.Beach,
  },
  [EMOJI_TYPES.Corn]: {
    symbol: '🌽',
    name: EMOJI_TYPES.Corn,
  },
  [EMOJI_TYPES['Rain Forest']]: {
    symbol: '🏝',
    name: EMOJI_TYPES['Rain Forest'],
  },
  [EMOJI_TYPES.House]: {
    symbol: '🏠',
    name: EMOJI_TYPES.House,
  },
}

const WORK_TYPES = {
  FERTALIZE: 'grass-to-corn',
  GROW: 'sapling-to-tree',
  HARVEST: 'corn-to-grass',
  CHOP: 'tree-to-sapling',
  BUILD_HOUSE: 'build-house',
}

export default {
  init: (s = null) => () => {
    if (s === null) {
      return {
        numberOfPlayers: 0,
        round: 0,
        stage: 1,
        grid: new TerrainGenerator(100, 100, SYMBOLS).generate().map(row =>
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
        activePlayer: {},
      }
    } else {
      const players = new LinkedList(s.numberOfPlayers)
      const activePlayer = players.current()
      return {
        numberOfPlayers: s.numberOfPlayers || 0,
        round: s.round || 0,
        stage: s.stage || 0,
        grid:
          s.grid ||
          new TerrainGenerator(100, 100, SYMBOLS).generate().map(row =>
            row.map(cell => ({
              ...cell,
              progress: undefined,
            })),
          ),
        moves: s.moves || [],
        players: players,
        player: s.player || 1,
        pendingWork: s.pendingWork || [],
        promptForEndOfTurn: s.promptForEndOfTurn || false,
        playerStats: s.playerStats || {},
        activePlayer: activePlayer,
      }
    }
  },
  startGame: previousState => {
    if (previousState.numberOfPlayers === 0) {
      return {
        playerSelectError: 'You must select more than 0 players!',
      }
    }
    const players = new LinkedList(previousState.numberOfPlayers)
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
          let random = Math.random()
          let isUnlucky = random < 0.001
          switch (work.type) {
            case WORK_TYPES.FERTALIZE:
            case WORK_TYPES.HARVEST:
            case WORK_TYPES.CHOP:
            case WORK_TYPES.BUILD_HOUSE: {
              if (isUnlucky) {
                updateCells.push({
                  ...work.cell,
                  isUnlucky: true,
                })
                return null
              }
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
      let currency = previousState.playerStats[currentPlayer.id]
        ? previousState.playerStats[currentPlayer.id].currency
        : 0
      let stock = previousState.playerStats[currentPlayer.id]
        ? previousState.playerStats[currentPlayer.id].stock
        : {
            lumber: 0,
            corn: 0,
          }
      let newGrid = previousState.grid.map((row, x) =>
        row.map((cell, y) => {
          const foundUpdate = updateCells.find(
            cell => cell.coords[0] === x && cell.coords[1] === y,
          )
          const foundProgress = progressCells.find(
            cell => cell.coords[0] === x && cell.coords[1] === y,
          )
          if (foundUpdate) {
            let newCell
            if (foundUpdate.isUnlucky) {
              newCell = SYMBOLS.Flower
            } else if (foundUpdate.type === WORK_TYPES.FERTALIZE) {
              newCell = SYMBOLS.Corn
            } else if (foundUpdate.type === WORK_TYPES.HARVEST) {
              newCell = SYMBOLS.Grass
              currency += 10
              stock = {
                ...stock,
                corn: stock.corn + 1,
              }
            } else if (foundUpdate.type === WORK_TYPES.GROW) {
              newCell = SYMBOLS.Trees
            } else if (foundUpdate.type === WORK_TYPES.CHOP) {
              newCell = SYMBOLS.Sapling
              currency += 50
              stock = {
                ...stock,
                lumber: stock.lumber + 10,
              }
            } else if (foundUpdate.type === WORK_TYPES.BUILD_HOUSE) {
              newCell = SYMBOLS.House
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
        previousState.selectedEmoji.biome.name === EMOJI_TYPES.Grass
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
    const { selectedEmoji, selectedCoordinates } = previousState
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
    const { selectedCoordinates, selectedEmoji } = previousState
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
  buildHouse: previousState => {
    const { selectedCoordinates, selectedEmoji } = previousState

    const currentCell = {
      cell: selectedEmoji,
      coords: selectedCoordinates,
      type: WORK_TYPES.BUILD_HOUSE,
    }

    return {
      playerStats: {
        ...previousState.playerStats,
        [previousState.activePlayer.id]: {
          ...previousState.playerStats[previousState.activePlayer.id],
          currency:
            previousState.playerStats[previousState.activePlayer.id].currency -
            100,
          stock: {
            ...previousState.playerStats[previousState.activePlayer.id].stock,
            lumber:
              previousState.playerStats[previousState.activePlayer.id].stock
                .lumber - 50,
          },
        },
      },
      pendingWork: [
        {
          type: WORK_TYPES.BUILD_HOUSE,
          turns: 0,
          numberOfTurns: 8,
          cell: currentCell,
        },
        ...previousState.pendingWork,
      ],
      promptForEndOfTurn: true,
    }
  },
  clearFlowers: previousState => {
    const { selectedCoordinates, selectedEmoji } = previousState

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
          numberOfTurns: 5,
          cell: currentCell,
        },
        ...previousState.pendingWork,
      ],
      promptForEndOfTurn: true,
    }
  },
}
