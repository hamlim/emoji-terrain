/* eslint-disable */
import React, { Component, Fragment } from 'react'
import logo from './logo.svg'
import './App.css'

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

const SYMBOLS = {
  Fertalizer: {
    symbol: <Fragment>💩</Fragment>,
  },
  Grass: {
    symbol: <Fragment>🌱</Fragment>,
  },
  Sapling: {
    symbol: <Fragment>🌿</Fragment>,
  },
  Trees: {
    symbol: <Fragment>🌲</Fragment>,
  },
  Mountain: {
    symbol: <Fragment>⛰</Fragment>,
  },
  Ocean: {
    symbol: <Fragment>🌊</Fragment>,
  },
  Desert: {
    symbol: <Fragment>🏜️</Fragment>,
  },
  'Snowy Mountains': {
    symbol: <Fragment>🏔️</Fragment>,
  },
  Beach: {
    symbol: <Fragment>🏖</Fragment>,
  },
  Corn: {
    symbol: <Fragment>🌽</Fragment>,
  },
}

const APP = {
  init: () => ({
    players: 0,
    round: 0,
    stage: 1,
    grid: new TerrainGenerator(10, 10, SYMBOLS).generate(),
    moves: [],
    player: 1,
  }),
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
    <button
      onClick={onAccept}
      className="SelectionBar-accept"
    >
      Accept
    </button>
    <button
      onClick={onDecline}
      className="SelectionBar-decline"
    >
      Decline
    </button>
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

  updateState = (update, secondArg = null) => {
    const updateType = typeof update

    let type, action

    if (updateType === 'function') {
      type = secondArg
      action = update
    } else {
      ;({ type, ...action } = update)
    }

    // @TODO

    switch (type) {
      case EMOJICLICK: {
        this.setState({
          ...action,
          showSelection: true,
        })
        break
      }
      case CLEAREMOJI: {
        this.setState({
          ...action,
          showSelection: false,
        })
        break
      }
      case SELECTEMOJI: {
        this.setState(action)
        break
      }
      case STARTGAME: {
        this.setState(action)
        break
      }
      default: {
        this.setState(action)
      }
    }
  }

  handlePlayersSelection = e => {
    this.updateState({ players: e.target.value })
  }

  nextState = () =>
    this.updateState(s => ({
      stage: s.stage + 1,
    }))

  handleEmojiClick = (emoji, x, y) => {
    this.updateState({
      selectedEmoji: emoji,
      selectedCoordinates: [x, y],
      type: EMOJICLICK,
    })
  }

  handleEmojiSelection = () => {
    this.updateState(
      previousState => ({
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
      SELECTEMOJI,
    )
  }

  handleEmojiClear = () => {
    this.updateState({
      selectedEmoji: null,
      selectedCoordinates: null,
      type: CLEAREMOJI,
    })
  }

  startGame = () => {
    this.updateState(previousState => {
      if (previousState.players === 0) {
        return {
          playerSelectError:
            'You must select more than 0 players!',
        }
      }
      return {
        activePlayer: 'one',
        stage: previousState.stage + 1,
      }
    }, STARTGAME)
  }

  render() {
    return (
      <React.Fragment>
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
            <label>
              Choose the number of players:
              <input
                type="number"
                value={this.state.players}
                onChange={this.handlePlayersSelection}
              />
            </label>
            <br />
            {this.state.playerSelectError ? (
              <p className="Error">
                {this.state.playerSelectError}
              </p>
            ) : null}
            <br />
            <button onClick={this.startGame}>
              Start Game
            </button>
          </main>
        ) : (
          <main className="Game">
            <EmojiGrid>
              {this.state.grid.map((row, x) =>
                row.map((cell, y) => (
                  <EmojiCell
                    key={cell.id}
                    onClick={() =>
                      this.handleEmojiClick(
                        cell.biome,
                        x,
                        y,
                      )
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
                  Player {this.state.activePlayer}'s turn
                </p>
                <p>Select a cell to take an action</p>
              </div>
              <div>
                <h2>Stats</h2>
                <p>
                  Number of Players: {this.state.players}
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
          </main>
        )}
      </React.Fragment>
    )
  }
}

const View = () => <App />

export default View
