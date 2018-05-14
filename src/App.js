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

const APP = {
  init: () => ({
    players: 0,
    round: 0,
    stage: 1,
    grid: elevation,
  }),
}

class App extends React.Component {
  state = {
    ...APP.init(),
  }

  handlePlayersSelection = e => {
    this.setState({ players: e.target.value })
  }

  nextState = () =>
    this.setState(s => ({
      stage: s.stage + 1,
    }))
  render() {
    return (
      <div>
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
            <style>{`
            section {
              display: grid;
              grid-template-rows: repeat(10, 1fr);
              grid-template-columns: repeat(10, 1fr);
              max-width: 960px;
              margin: 0 auto;
            }

            section div {
              font-size: 3rem;
              text-align: center;
            }
            `}</style>
            <section>
              {this.state.grid.map(row =>
                row.map(cell => (
                  <div key={cell.id}>
                    {cell.biome.symbol}
                  </div>
                )),
              )}
            </section>

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
