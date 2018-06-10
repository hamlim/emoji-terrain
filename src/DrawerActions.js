/* eslint-disable */
import React, { Fragment } from 'react'

import { Button } from 'rebass'

const DrawerActions = ({
  state,
  fertalize,
  chop,
  buildHouse,
  harvest,
  clearFlowers,
}) => {
  if (state.selectedEmoji.progress) {
    return (
      <p>
        This cell is in progress, it is at stage{' '}
        {state.selectedEmoji.progress} of{' '}
        {state.selectedEmoji.progressMax}.
      </p>
    )
  }

  const { activePlayer, playerStats } = state
  let canMakeHouse =
    Object.keys(playerStats).length > 0 &&
    playerStats[activePlayer.id].stock.lumber > 50 &&
    playerStats[activePlayer.id].currency > 100

  switch (state.selectedEmoji.biome.name) {
    case 'Grass': {
      return (
        <Fragment>
          <p>Fertalize to grow a crop?</p>
          <Button onClick={fertalize}>Fertalize</Button>
          {canMakeHouse && (
            <Fragment>
              <p>
                Build house here for 50 lumber and 100
                money?
              </p>
              <Button onClick={buildHouse}>
                Build House
              </Button>
            </Fragment>
          )}
        </Fragment>
      )
    }
    case 'Sapling': {
      return (
        <Fragment>
          <p>Fertalize to grow Trees?</p>
          <Button onClick={fertalize}>Fertalize</Button>
          {canMakeHouse && (
            <Fragment>
              <p>
                Build house here for 50 lumber and 100
                money?
              </p>
              <Button onClick={buildHouse}>
                Build House
              </Button>
            </Fragment>
          )}
        </Fragment>
      )
    }
    case 'Corn': {
      return (
        <Fragment>
          <p>Harvest corn?</p>
          <Button onClick={harvest}>Harvest</Button>
        </Fragment>
      )
    }
    case 'Trees': {
      return (
        <Fragment>
          <p>Chop down trees?</p>
          <Button onClick={chop}>Chop</Button>
          {canMakeHouse && (
            <Fragment>
              <p>
                Build house here for 50 lumber and 100
                money?
              </p>
              <Button onClick={buildHouse}>
                Build House
              </Button>
            </Fragment>
          )}
        </Fragment>
      )
    }
    case 'Flower': {
      return (
        <Fragment>
          <p>Clear Flowers for harvesting?</p>
          <Button onClick={clearFlowers}>
            Clear Flowers
          </Button>
        </Fragment>
      )
    }
  }
  return null
}

export default DrawerActions
