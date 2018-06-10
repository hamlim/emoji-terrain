/* eslint-disable */
import React, { Fragment } from 'react'
import './App.css'

import {
  Button,
  Input,
  Label,
  Box,
  ButtonCircle,
  Heading,
  Drawer,
  Fixed,
} from 'rebass'

import APP, { SYMBOLS } from './state.js'

import DrawerActions from './DrawerActions.js'

const EmojiGrid = ({ children, ...rest }) => (
  <section className="EmojiGrid" {...rest}>
    {children}
  </section>
)

let updateCounter = 0

class SyncState extends React.Component {
  componentDidMount() {
    try {
      let s = window.localStorage.getItem('EMOJI_WORLD')
      if (!s) {
        return
      }
      s = JSON.parse(s)
      this.props.onInit(s)
    } catch (e) {
      return
    }
  }
  componentDidUpdate() {
    updateCounter++
    if (updateCounter > 10) {
      updateCounter = 0
      const { players, activePlayer, ...state } = this.props.state
      window.localStorage.setItem('EMOJI_WORLD', JSON.stringify(state))
    }
  }
  render() {
    return null
  }
}

const cx = arr => arr.filter(Boolean).join(' ')

const EmojiCell = ({ children, onClick, progress, progressMax }) => (
  <button
    className={cx([
      'EmojiCell',
      progress && `progress-${progress}-of-${progressMax || 5}`,
    ])}
    onClick={onClick}
  >
    {children}
  </button>
)

const SelectionBar = ({ onAccept, onDecline, children }) => (
  <aside className="SelectionBar">
    {children}
    <Button onClick={onAccept} className="SelectionBar-accept">
      Accept
    </Button>
    <Button onClick={onDecline} className="SelectionBar-decline">
      Decline
    </Button>
  </aside>
)

class App extends React.Component {
  state = {
    ...APP.init()(),
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

  harvest = () => this.setState(APP.harvest)

  chop = () => this.setState(APP.chop)

  buildHouse = () => this.setState(APP.buildHouse)

  clearFlowers = () => this.setState(APP.clearFlowers)

  handleStateInit = s => {
    this.setState(APP.init(s))
  }

  render() {
    return (
      <Fragment>
        <SyncState state={this.state} onInit={this.handleStateInit} />
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
              <p className="Error">{this.state.playerSelectError}</p>
            ) : null}
            <ButtonCircle onClick={this.startGame}>Start Game</ButtonCircle>
          </main>
        ) : (
          <main className="Game">
            <div className="GridContainer">
              <EmojiGrid>
                {this.state.grid.map((row, x) =>
                  row.map((cell, y) => (
                    <EmojiCell
                      key={cell.id}
                      progress={
                        typeof cell.progress !== 'undefined'
                          ? cell.progress
                          : null
                      }
                      progressMax={
                        typeof cell.progressMax !== 'undefined'
                          ? cell.progressMax
                          : null
                      }
                      onClick={() => this.handleEmojiClick(cell, x, y)}
                    >
                      {cell.biome.symbol}
                    </EmojiCell>
                  )),
                )}
              </EmojiGrid>
            </div>
            <aside>
              <div>
                <h2>Actions</h2>
                <p>Player {this.state.activePlayer.name()}&apos;s turn</p>
                <p>Select a cell to take an action</p>
              </div>
              <div>
                <h2>Stats</h2>
                <p>Number of Players: {this.state.numberOfPlayers}</p>
                <p>Emoji Legend:</p>
                <ul>
                  {Object.entries(SYMBOLS).map(([key, { symbol }]) => (
                    <li key={key}>
                      {key}: {symbol}
                    </li>
                  ))}
                  {(() => {
                    const { activePlayer, playerStats } = this.state
                    if (Object.keys(playerStats).length > 0) {
                      return (
                        <Fragment>
                          <p>Money: {playerStats[activePlayer.id].currency}</p>
                          <p>
                            Lumber: {playerStats[activePlayer.id].stock.lumber}
                          </p>
                          <p>Corn: {playerStats[activePlayer.id].stock.corn}</p>
                        </Fragment>
                      )
                    }
                  })()}
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
                <Drawer open position="right" p={3} color="black" bg="#e8fdf5">
                  <Heading>Action:</Heading>
                  {this.state.promptForEndOfTurn ? (
                    <Button onClick={this.toNextTurn}>End Turn</Button>
                  ) : (
                    <DrawerActions
                      state={this.state}
                      fertalize={this.fertalize}
                      harvest={this.harvest}
                      chop={this.chop}
                      buildHouse={this.buildHouse}
                      clearFlowers={this.clearFlowers}
                    />
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
