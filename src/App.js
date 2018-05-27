/* eslint-disable */
import React, { Component, Fragment } from 'react'
import logo from './logo.svg'
import './App.css'

import {
  Button,
  Input,
  Label,
  Panel,
  Box,
  ButtonCircle,
  Heading,
  Drawer,
  Fixed,
} from 'rebass'

import simplex from 'simplex-noise'

class TerrainGenerator {
  constructor(height, width, emoji) {
    this.height = height
    this.width = width
    this.emoji = emoji
    this.simplex = new simplex(Math.random)
  }

  noise = (x, y) => this.simplex.noise2D(x, y) / 2 + 0.5

  getBiome = ({ elevation: e, moisture: m }) => {
    if (e < 0.1) return this.emoji['Ocean']
    if (e < 0.12) return this.emoji['Beach']

    if (e > 0.8) {
      // if (m < 0.1) return SCORCHED
      // if (m < 0.2) return BARE
      // if (m < 0.5) return TUNDRA
      return this.emoji['Snowy Mountains']
    }

    if (e > 0.6) {
      if (m < 0.33) return this.emoji['Desert']
      // if (m < 0.66) return SHRUBLAND
      // return TAIGA
    }

    if (e > 0.3) {
      if (m < 0.16) return this.emoji['Desert']
      if (m < 0.5) return this.emoji['Grass']
      if (m < 0.83) return this.emoji['Trees']
      // return TEMPERATE_RAIN_FOREST
    }

    // if (m < 0.16) return SUBTROPICAL_DESERT
    if (m < 0.33) return this.emoji['Grass']
    // if (m < 0.66) return TROPICAL_SEASONAL_FOREST
    // return TROPICAL_RAIN_FOREST

    return this.emoji['Corn']
  }

  generate = () => {
    const { height, width } = this

    let elevation = []
    for (let y = 0; y < height; y++) {
      elevation[y] = []
      for (let x = 0; x < width; x++) {
        let nx = x / width - 0.5,
          ny = y / height - 0.5
        let e =
          1 * this.noise(1 * nx, 1 * ny) +
          0.5 * this.noise(2 * nx, 2 * ny) +
          0.25 * this.noise(4 * nx, 4 * ny)

        let m =
          0.9 * this.noise(0.9 * nx, 0.9 * ny) +
          0.4 * this.noise(2.1 * nx, 2.1 * ny) +
          0.15 * this.noise(4.1 * nx, 4.1 * ny)
        // 1 * this.noise(1 * nx, 1 * ny) +
        // 2 * this.noise(0.5 * nx, 0.5 * ny) +
        // 4 * this.noise(0.25 * nx, 0.25 * ny)
        elevation[y][x] = {
          elevation: Math.pow(e, 1.0),
          moisture: Math.pow(m, 1.0),
        }
      }
    }
    return elevation.map((rows, x) =>
      rows.map((cell, y) => ({
        ...cell,
        id: `id-${x}-${y}`,
        biome: this.getBiome(cell),
      })),
    )
  }
}

class Node {
  constructor({ id, next = null, prev = null }) {
    this.id = id
    this.nextNode = next
    this.prevNode = prev
    this.next = this.next.bind(this)
    this.prev = this.prev.bind(this)
  }
  next() {
    return this.nextNode
  }
  prev() {
    return this.prevNode
  }
  setPrev(prev) {
    this.prevNode = prev
  }
  setNext(next) {
    this.nextNode = next
  }

  name() {
    return this.id
  }
}
class LinkedList {
  constructor(nodes) {
    this.count = nodes
    this.makeNodes()

    this.currentNode = this.nodes[0]
  }
  makeNodes() {
    this.nodes = Array.from(
      { length: this.count },
      (_, i) => i + 1,
    ).map(i => new Node({ id: i }))
    this.nodes.forEach((node, index, nodes) => {
      if (index !== 0 && index !== nodes.length - 1) {
        node.setNext(nodes[index + 1])
        node.setPrev(nodes[index - 1])
      } else if (index === 0) {
        node.setNext(nodes[index + 1])
      } else if (index === nodes.length - 1) {
        node.setPrev(nodes[index - 1])
      }
    })
    this.nodes[0].setPrev(this.nodes[this.count - 1])
    this.nodes[this.count - 1].setNext(this.nodes[0])
    this.nodes[0].setPrev(this.nodes[this.count - 1])
    this.nodes[this.count - 1].setNext(this.nodes[0])
  }

  current() {
    return this.currentNode
  }
}

const SYMBOLS = {
  Fertalizer: {
    symbol: <Fragment>💩</Fragment>,
    name: 'Fertalizer',
  },
  Grass: {
    symbol: <Fragment>🌱</Fragment>,
    name: 'Grass',
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
}

const APP = {
  init: () => ({
    numberOfPlayers: 0,
    round: 0,
    stage: 1,
    grid: new TerrainGenerator(10, 10, SYMBOLS).generate(),
    moves: [],
    players: [],
    player: 1,
    pendingWork: [],
    promptForEndOfTurn: false,
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
  fertalize: previousState => {
    const currentCell = {
      cell: previousState.selectedEmoji,
      coords: previousState.selectedCoordinates,
      type:
        previousState.selectedEmoji.biome.name === 'Grass'
          ? 'grass-to-corn'
          : 'sapling-to-trees',
    }
    return {
      pendingWork: [
        {
          type: 'Fertalize',
          turns: 0,
          cell: currentCell,
        },
        ...previousState.pendingWork,
      ],
      promptForEndOfTurn: true,
    }
  },
  toNextTurn: previousState => {
    const currentPlayer = previousState.activePlayer
    const numberOfPlayers = previousState.numberOfPlayers

    let newState = {
      promptForEndOfTurn: false,
    }

    const { pendingWork } = previousState
    let newWork = []
    let updateCells = []
    if (pendingWork.length) {
      newWork = pendingWork
        .map(work => {
          switch (work.type) {
            case 'Fertalize': {
              if (work.turns < 5) {
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
    if (updateCells.length) {
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
      newState = {
        ...newState,
        grid: previousState.grid.map((row, x) =>
          row.map((cell, y) => {
            const foundUpdate = updateCells.find(
              cell =>
                cell.coords[0] === x &&
                cell.coords[1] === y,
            )
            if (foundUpdate) {
              return {
                ...cell,
                biome: {
                  ...(foundUpdate.type === 'grass-to-corn'
                    ? SYMBOLS.Corn
                    : SYMBOLS.Trees),
                },
              }
            } else {
              return cell
            }
          }),
        ),
      }
    }
    if (numberOfPlayers === 1) {
      return {
        ...newState,
        pendingWork: newWork,
        showActionDrawer: false,
        selectedEmoji: null,
        selectedCoordinates: null,
      }
    } else {
      return {
        ...newState,
        pendingWork: newWork,
        showActionDrawer: false,
        selectedEmoji: null,
        selectedCoordinates: null,
        activePlayer: previousState.activePlayer.next(),
      }
    }
  },
}

const EmojiGrid = ({ children }) => (
  <section className="EmojiGrid">{children}</section>
)

const EmojiCell = ({ children, onClick }) => (
  <button className="EmojiCell" onClick={onClick}>
    {children}
  </button>
)

const SelectionBar = ({
  onAccept,
  onDecline,
  children,
}) => (
  <aside className="SelectionBar">
    {children}
    <Button
      onClick={onAccept}
      className="SelectionBar-accept"
    >
      Accept
    </Button>
    <Button
      onClick={onDecline}
      className="SelectionBar-decline"
    >
      Decline
    </Button>
  </aside>
)

const EMOJICLICK = 'EMOJI-CLICK'
const CLEAREMOJI = 'CLEAREMOJI'
const SELECTEMOJI = 'SELECTEMOJI'
const STARTGAME = 'STARTGAME'

class App extends React.Component {
  state = {
    ...APP.init(),
  }

  handlePlayersSelection = e => {
    this.setState(APP.handlePlayerSelection(e))
  }

  handleEmojiClick = (emoji, x, y) => {
    this.setState(APP.handleEmojiClick(emoji, x, y))
  }

  handleEmojiSelection = () => {
    this.setState(APP.selectEmoji)
  }

  handleEmojiClear = () => {
    this.updateState(APP.clearEmoji)
  }

  startGame = () => {
    this.setState(APP.startGame)
  }

  fertalize = () => {
    this.setState(APP.fertalize)
  }

  toNextTurn = () => {
    this.setState(APP.toNextTurn)
  }

  closeDrawer = () => {
    this.setState({ showActionDrawer: false })
  }

  render() {
    return (
      <Fragment>
        <style>
          {`
            :root {
              font-size: 18px;
              font-family: sans-serif;
              box-sizing: border-box;
            }
            *,
            *::before,
            *::after {
              box-sizing: inherit;
            }
            .Container {
              display: flex;
              justify-content: center;
              align-items: center;
              max-width: 968px;
              min-height: 100vh;
              flex-direction: column;
            }
            .Game {
              display: grid;
              grid-template-columns: 1fr 300px;
            }
            .Error {
              color: red;
              text-decoration: underline;
            }

            .EmojiGrid {
              display: grid;
              grid-template-rows: repeat(10, 1fr);
              grid-template-columns: repeat(10, 1fr);
            }
            .EmojiCell {
              background: none;
              border: none;
              padding: 0;
              font-size: 3rem;
              text-align: center;
            }

            .SelectionBar {
              position: fixed;
              bottom: 0;
              left: 0;
              width: 100%;
              min-height: 5rem;
              background-color: mediumspringgreen;
              display: flex;
              justify-content: space-around;
              align-items: center;
            }
        
            .SelectionBar-accept,
            .SelectionBar-decline {
              padding: .5em 2em;
              border: none;
              border-radius: 5px;
              font-size: 18px;
              opacity: .7;
            }
          `}
        </style>
        {this.state.stage === 1 ? (
          <main className="Container">
            <Label>Choose the number of players:</Label>
            <Box p="3">
              <Input
                placeholder="2"
                value={this.state.numberOfPlayers}
                onChange={this.handlePlayersSelection}
              />
            </Box>
            {this.state.playerSelectError ? (
              <p className="Error">
                {this.state.playerSelectError}
              </p>
            ) : null}
            <ButtonCircle onClick={this.startGame}>
              Start Game
            </ButtonCircle>
          </main>
        ) : (
          <main className="Game">
            <EmojiGrid>
              {this.state.grid.map((row, x) =>
                row.map((cell, y) => (
                  <EmojiCell
                    key={cell.id}
                    onClick={() =>
                      this.handleEmojiClick(cell, x, y)
                    }
                  >
                    {cell.biome.symbol}
                  </EmojiCell>
                )),
              )}
            </EmojiGrid>
            <aside>
              <div>
                <h2>Actions</h2>
                <p>
                  Player {this.state.activePlayer.name()}&apos;s
                  turn
                </p>
                <p>Select a cell to take an action</p>
              </div>
              <div>
                <h2>Stats</h2>
                <p>
                  Number of Players:{' '}
                  {this.state.numberOfPlayers}
                </p>
                <p>Emoji Legend:</p>
                <ul>
                  <li>Fertalizer: 💩</li>
                  <li>Grass: 🌱</li>
                  <li>Sapling: 🌿</li>
                  <li>Tree: 🌲</li>
                  <li>Mountains: ⛰</li>
                  <li>Ocean: 🌊</li>
                </ul>
              </div>
            </aside>
            {this.state.showSelection && (
              <SelectionBar
                onAccept={this.handleEmojiSelection}
                onDecline={this.handleEmojiClear}
              >
                Emoji pre-selected, accept selection?
              </SelectionBar>
            )}
            {this.state.showActionDrawer && (
              <Fragment>
                <Fixed
                  top={0}
                  right={0}
                  bottom={0}
                  left={0}
                  onClick={this.closeDrawer}
                />
                <Drawer
                  open
                  position="right"
                  p={3}
                  color="black"
                  bg="#e8fdf5"
                >
                  <Heading>Action:</Heading>
                  {this.state.promptForEndOfTurn ? (
                    <Button onClick={this.toNextTurn}>
                      End Turn
                    </Button>
                  ) : (
                    (() => {
                      switch (
                        this.state.selectedEmoji.biome.name
                      ) {
                        case 'Grass': {
                          return (
                            <Fragment>
                              <p>
                                Fertalize to grow a crop?
                              </p>
                              <Button
                                onClick={this.fertalize}
                              >
                                Fertalize
                              </Button>
                            </Fragment>
                          )
                        }
                        case 'Sapling': {
                          return (
                            <Fragment>
                              <p>
                                Fertalize to grow Trees?
                              </p>
                              <Button
                                onClick={this.fertalize}
                              >
                                Fertalize
                              </Button>
                            </Fragment>
                          )
                        }
                      }
                      return null
                    })()
                  )}
                </Drawer>
              </Fragment>
            )}
          </main>
        )}
      </Fragment>
    )
  }
}

const View = () => <App />

export default View
