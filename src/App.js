/* eslint-disable */
import React, { Component, Fragment } from 'react'
import logo from './logo.svg'
import './App.css'

import Generator from './terrain.js'

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

const gen = new Generator(10, 10, SYMBOLS)

const elevation = gen.generate()
console.log(elevation)

class Terrain extends React.Component {
  shouldComponentUpdate(prevProps) {
    if (
      this.props.height !== prevProps.height ||
      this.props.width !== prevProps.width ||
      prevProps.emoji !== this.props.emoji
    ) {
      return true
    }
    return false
  }
  render() {
    const { height, width, emoji, children } = this.props

    const gen = new Generator(10, 10, SYMBOLS)
    const elevation = gen.generate()
    return children(elevation)
  }
}

const APP = {
  init: () => ({
    players: 0,
    round: 0,
    stage: 1,
    grid: elevation,
    moves: [],
    player: 1,
  }),
}

const EmojiGrid = ({ children }) => (
  <Fragment>
    <style>{`.EmojiGrid {
      display: grid;
      grid-template-rows: repeat(10, 1fr);
      grid-template-columns: repeat(10, 1fr);
      max-width: 960px;
      margin: 0 auto;
    }`}</style>
    <section className="EmojiGrid">{children}</section>
  </Fragment>
)

const EmojiCell = ({ children, onClick }) => (
  <Fragment>
    <style>{`.EmojiCell {
      background: none;
      border: none;
      padding: 0;
      font-size: 3rem;
      text-align: center;
    }`}</style>
    <button className="EmojiCell" onClick={onClick}>
      {children}
    </button>
  </Fragment>
)

const SelectionBar = ({
  onAccept,
  onDecline,
  children,
}) => (
  <Fragment>
    <style>{`.SelectionBar {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      min-height: 5rem;
      background-color: mediumspringgreen;
    }`}</style>
    <div className="SelectionBar">
      {children}
      <button onClick={onAccept}>Accept</button>
      <button onClick={onDecline}>Decline</button>
    </div>
  </Fragment>
)

const EMOJICLICK = 'EMOJI-CLICK'
const CLEAREMOJI = 'CLEAREMOJI'
const SELECTEMOJI = 'SELECTEMOJI'

class App extends React.Component {
  state = {
    ...APP.init(),
  }

  updateState = (update, t = null) => {
    let action
    let type
    if (t === null) {
      type = update.type
      const { type: ty, ...stuff } = update
      action = stuff
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
    console.log('here')
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

  render() {
    console.log(this.state.moves)
    return (
      <div>
        {this.state.showSelection && (
          <SelectionBar
            onAccept={this.handleEmojiSelection}
            onDecline={this.handleEmojiClear}
          >
            Emoji pre-selected, accept selection?
          </SelectionBar>
        )}
        <Terrain height={10} width={10} emoji={SYMBOLS}>
          {elevation => (
            <EmojiGrid>
              {elevation.map((row, x) =>
                row.map((cell, y) => (
                  <EmojiCell
                    key={cell.id}
                    onClick={() =>
                      this.handleEmojiClick(
                        cell.biome.symbol,
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
          )}
        </Terrain>
        {this.state.stage === 1 ? (
          <div>
            <label>
              Choose the number of players:
              <input
                min="1"
                type="number"
                value={this.state.players}
                onChange={this.handlePlayersSelection}
              />
            </label>
            <button onClick={this.nextState}>
              Start Game
            </button>
          </div>
        ) : (
          <main>
            <aside>
              <h2> Stats</h2>
              <p>Number of Players: {this.state.players}</p>
              <p>Emoji Legend:</p>
              <ul>
                <li>Fertalizer: 💩</li>
                <li>Grass: 🌱</li>
                <li>Sapling: 🌿</li>
                <li>Tree: 🌲</li>
                <li>Mountains: ⛰</li>
                <li>Ocean: 🌊</li>
              </ul>
            </aside>
          </main>
        )}
        {this.state.moves &&
          this.state.moves.map(move => (
            <pre key={move.key}>{JSON.stringify(move)}</pre>
          ))}
      </div>
    )
  }
}

const View = () => (
  <div>
    <App />
  </div>
)

export default View
